const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
// const passRegex =
//   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    minlength: [3, "Name must be at least 3 characters long"],
    maxlength: [20, "Name must be at most 20 characters long"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    match: [emailRegex, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [8, "Password must be at least 8 characters long"],
  },
});
UserSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, name: this.name },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
