require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const mongoSanitizer = require("express-mongo-sanitize");
const xss = require("xss-clean");

const authRoutes = require("./routes/auth");
const todoRoutes = require("./routes/todo");

const app = express();

app.use(bodyParser.json());

// Data sanitization against NoSQL query injection
app.use(mongoSanitizer());

app.use(`/${process.env.API_VERSION}/auth`, authRoutes);
app.use(`/${process.env.API_VERSION}/todos`, todoRoutes);

(async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/todo");
    console.log("Successefully connected to database.");
  } catch (error) {
    console.log(error);
  }
})();

app.all("*", (req, res, next) => {
  const err = new Error(`${req.originalUrl} cannot be found.`);
  err.status = "fail";
  err.statusCode = 404;

  next(err);
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

app.listen(3000, () => console.log("Listening on port 3000..."));
