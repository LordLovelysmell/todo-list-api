require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const mongoSanitizer = require("express-mongo-sanitize");
const xss = require("xss-clean");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./middleware/globalErrorHandler");
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
  next(new AppError(`${req.originalUrl} cannot be found.`, 404));
});

app.use(globalErrorHandler);

app.listen(3000, () => console.log("Listening on port 3000..."));
