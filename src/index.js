const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const mongoSanitizer = require("express-mongo-sanitize");
const xss = require("xss-clean");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./middleware/globalErrorHandler");
const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./routes/todoRoutes");

const app = express();

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(bodyParser.json());

// Data sanitization against NoSQL query injection
app.use(mongoSanitizer());

app.use(`/api/${process.env.API_VERSION}/auth`, authRoutes);
app.use(`/api/${process.env.API_VERSION}/todos`, todoRoutes);

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
