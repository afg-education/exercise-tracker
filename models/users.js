const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Users = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  exercises: [
    {
      description: String,
      duration: Number,
      date: Date
    }
  ]
});

module.exports = mongoose.model("Users", Users);
