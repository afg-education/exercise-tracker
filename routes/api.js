//import project documents
const Users = require("../models/users");
const Exercises = require("../models/exercises");
const router = require("express").Router();

//my routes begin
router.post("/new-user", (req, res, next) => {
  console.log(req.body.username);

  const user = new Users({ username: req.body.username });
  console.log(user);

  Users.create(user, (err, userData) => {
    if (err) {
      if (err.code == 11000) {
        // uniqueness error (no custom message)
        return next({
          status: 400,
          message: "Username already taken"
        });
      } else {
        return next(err);
      }
    }

    console.log(userData);
    res.json(userData);
  });
});

router.post("/add", (req, res, next) => {
  //find if user exist if not "Unknown userId" else proceed
  Users.findById(req.body.userId, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next({
        status: 400,
        message: "no such user"
      });
    }

    const exercise = new Exercises(req.body);
    exercise.username = user.username;

    exercise.save((err, exerciseData) => {
      if (err) {
        return next(err);
      }

      //missing in my solution. learn WHY?
      console.log("carefull");
      console.log(exerciseData);
      exerciseData = exerciseData.toObject();
      console.log(exerciseData);

      const result = {
        _id: user._id,
        username: user.username,
        date: new Date(exerciseData.date).toDateString(),
        duration: exerciseData.duration,
        description: exerciseData.description
      };

      res.json(result);
    });
  });
});

router.get("/users", (req, res, next) => {
  Users.find({}, (err, data) => {
    if (err) next(err);
    return res.json(data);
  });
});

router.get("/log", (req, res, next) => {
  const from = new Date(req.query.from);
  const to = new Date(req.query.to);
  
  const hasFrom = new Date(req.query.from) != "Invalid Date";
  const hasTo = new Date(req.query.to) != "Invalid Date";

  Users.findById(req.query.userId, (err, user) => {
    if (err) return next(err);
    if (!user) {
      return next({ status: 400, message: "Unknown userId" });
    }

    Exercises.find(
      {
        userId: req.query.userId,
        date: {
          $lte: hasTo ? to.toISOString() : Date.now(),
          $gte: hasFrom ? from.toISOString() : 0
        }
      },
      {
        __v: 0,
        _id: 0
      }
    )
      .sort("-date")
      .limit(parseInt(req.query.limit))
      .exec((err, exercises) => {
        if (err) return next(err);
        const out = {
          _id: req.query.userId,
          username: user.username,
          from: hasFrom ? from.toDateString() : undefined,
          to: to != hasTo ? to.toDateString() : undefined,
          count: exercises.length,
          log: exercises.map(e => ({
            description: e.description,
            duration: e.duration,
            date: e.date.toDateString()
          }))
        };
        res.json(out);
      });
  });
});

//exercise.userId, // String is shorthand for {type: String}
//description: exercise.description,
//duration: exercise.duration,
//date: exercise.date

//my routes end
module.exports = router;
