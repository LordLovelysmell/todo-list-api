const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const saltRounds = 10;

exports.signUp = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new AppError("Username and password were not provided.", 400));
  }

  if (username.length < 4) {
    return next(new AppError("Username and password were not provided.", 400));
  }

  if (password.length < 8) {
    return next(new AppError("Password must have atleast 8 symbols.", 400));
  }

  const user = await User.find({ username });

  if (user.length) {
    return next(
      new AppError(`User with username '${username}' is already exist.`, 409)
    );
  }

  const hash = await bcrypt.hash(password, saltRounds);

  const newUser = new User({
    username,
    password: hash,
  });

  await newUser.save();

  res.status(201).json({
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
    return next(new AppError("Username and password were not provided.", 400));
  }

  if (password.length < 8) {
    return next(new AppError("Password must have atleast 8 symbols.", 400));
  }

  const user = await User.findOne({ username });

  if (!user) {
    return next(new AppError("The username or password is incorrect.", 400));
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (!result) {
      return next(new AppError("The username or password is incorrect.", 400));
    }

    const token = generateAccessToken({ username, id: user._id });
    const refreshToken = jwt.sign(
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
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError("Refresh token was not provided.", 400));
  }

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err || !decoded) {
        return next(new AppError("Invalid refresh token.", 400));
      }

      const { username } = decoded;

      const user = await User.findOne({ username });

      const token = generateAccessToken({
        username,
        id: user._id,
      });
      const refreshToken = jwt.sign(
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
    }
  );
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10m" });
}
