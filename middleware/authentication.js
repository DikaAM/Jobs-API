const User = require("../models/User");
const { UnauthenticatedError } = require("../errors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = async (req, res, next) => {
  //check header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnauthenticatedError("Authentication invalid 1");
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    //check if user exists in the database
    const user = await User.findById(payload.userId).select("-password");
    if (!user) {
      throw new UnauthenticatedError("Authentication invalid 3");
    }
    //attach the user to the job routes
    req.user = { userId: payload.userId, name: payload.name };
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication invalid 2");
  }
};

module.exports = auth;
