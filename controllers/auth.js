const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors");
require("dotenv").config();

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new BadRequestError("Please provide all values");
  }
  const user = await User.create({
    name: name.toLowerCase(),
    email: email.toLowerCase(),
    password,
  });
  const token = user.createJWT();

  res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }
  // Fetch the user from the database based on the provided email
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new NotFoundError("User not found");
  }
  // Compare the password with the hashed password stored in the user object
  const isPasswordCorrect = await user.comparePassword(password);
  // If the password is correct, generate a JWT and send it back to the client
  if (isPasswordCorrect) {
    const token = user.createJWT();
    await res
      .status(StatusCodes.OK)
      .json({ name: user.name, msg: "User logged in", token });
  } else {
    throw new UnauthenticatedError("Invalid credentials");
  }
};

module.exports = {
  register,
  login,
};
