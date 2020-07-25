const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Exercises = new Schema({
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: String,
    ref: "Users",
    index: true
  }
});

Exercises.pre("save", function(next) {
  mongoose.model("Users").findById(this.userId, (err, user) => {
    if (err) return next(err);
    if (!user) {
      const err = new Error("unknown userId");
      err.status = 400;
      return next(err);
    }
    if (!this.date) {
      this.date = Date.now();
    }
    next();
  });
});

module.exports = mongoose.model("Exercises", Exercises);
