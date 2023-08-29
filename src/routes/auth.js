const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const saltRounds = 10;

// Create a user
router.post("/sign-up", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: "fail",
        data: {
          message: "Username and password were not provided.",
        },
      });
    }

    if (username.length < 4) {
      return res.status(400).json({
        status: "fail",
        data: {
          username: "Username must have atleast 4 symbols.",
        },
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: "fail",
        data: {
          password: "Password must have atleast 8 symbols.",
        },
      });
    }

    const user = await User.find({ username });

    if (user.length) {
      return res.status(409).json({
        status: "fail",
        data: {
          username: `User with username '${username}' is already exist.`,
        },
      });
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
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

router.post("/sign-in", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      status: "fail",
      data: {
        message: "Username and password were not provided.",
      },
    });
  }

  if (username.length < 4) {
    return res.status(400).json({
      status: "fail",
      data: {
        username: "Username must have atleast 4 symbols.",
      },
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      status: "fail",
      data: {
        password: "Password must have atleast 8 symbols.",
      },
    });
  }

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(400).json({
      status: "fail",
      data: {
        message: "The username or password is incorrect.",
      },
    });
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (!result) {
      return res.status(400).json({
        status: "fail",
        data: {
          message: "The username or password is incorrect.",
        },
      });
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

router.post("/token/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      status: "fail",
      data: {
        refreshToken: "Refresh token was not provided.",
      },
    });
  }

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, { username }) => {
      if (err) {
        return res.status(400).json({
          status: "fail",
          data: {
            message: "Invalid refresh token.",
          },
        });
      }

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

module.exports = router;
