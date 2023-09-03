const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.signUp = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new AppError("Username and password were not provided.", 400));
  }

  if (username.length < 4) {
    return next(new AppError("Username must have atleast 4 symbols.", 400));
  }

  if (password.length < 8) {
    return next(new AppError("Password must have atleast 8 symbols.", 400));
  }

  const user = await User.findOne({ username });

  if (user) {
    return next(
      new AppError(`User with username '${username}' is already exist.`, 409)
    );
  }

  await User.create({
    username,
    password,
  });

  return res.status(201).json({
    status: "success",
    data: {
      message: "User has been successfully created.",
    },
  });
});

exports.signIn = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new AppError("Username and password were not provided.", 400));
  }

  if (username.length < 4) {
    return next(new AppError("Username must have atleast 4 symbols.", 400));
  }

  if (password.length < 8) {
    return next(new AppError("Password must have atleast 8 symbols.", 400));
  }

  const user = await User.findOne({ username }).select("+password");

  if (!user || !(await user.isPasswordCorrect(password, user.password))) {
    return next(new AppError("The username or password is incorrect.", 400));
  }

  const token = await generateAccessToken({ username, id: user._id });
  const refreshToken = await promisify(jwt.sign)(
    { username },
    process.env.REFRESH_TOKEN_SECRET
  );

  return res.status(200).json({
    status: "success",
    data: {
      token,
      refreshToken,
    },
  });
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError("Refresh token was not provided.", 400));
  }

  const decoded = await promisify(jwt.verify)(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  if (!decoded) {
    return next(new AppError("Invalid refresh token.", 400));
  }

  const { username } = decoded;

  const user = await User.findOne({ username });

  const token = await generateAccessToken({
    username,
    id: user._id,
  });
  const newRefreshToken = await promisify(jwt.sign)(
    { username },
    process.env.REFRESH_TOKEN_SECRET
  );

  return res.status(200).json({
    status: "success",
    data: {
      token,
      refreshToken: newRefreshToken,
    },
  });
});

async function generateAccessToken(user) {
  return await promisify(jwt.sign)(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });
}
