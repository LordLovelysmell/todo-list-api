const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");

module.exports = catchAsync(async (req, res, next) => {
  if (req.method === "OPTIONS") {
    next();
  }

  const authHeader = req.headers.authorization;
  const accessToken =
    authHeader && authHeader.startsWith("Bearer") && authHeader.split(" ")[1];

  if (!accessToken) {
    next(new AppError("Access token was not provided."), 401);
  }

  // Token verification
  const decoded = await promisify(jwt.verify)(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET
  );

  // Check if user still exists (wasn't deleted)
  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(
      new AppError(
        "The user belonging to this access token is no longer exist.",
        401
      )
    );
  }

  req.user = decoded;
  next();
});
