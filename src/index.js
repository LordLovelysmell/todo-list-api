const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// For security purposes
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitizer = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./middleware/globalErrorHandler");
const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./routes/todoRoutes");
const commentRoutes = require("./routes/commentRoutes");
const attachmentRoutes = require("./routes/attachmentRoutes");

const app = express();

app.use(express.static(`${__dirname}/../public`));

// GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

app.use(bodyParser.json({ limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitizer());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ["status", "title"],
  })
);

app.use(`/api/${process.env.API_VERSION}/auth`, authRoutes);
app.use(`/api/${process.env.API_VERSION}/todos`, todoRoutes);
app.use(
  `/api/${process.env.API_VERSION}/todos/:todoId/comments`,
  commentRoutes
);
app.use(
  `/api/${process.env.API_VERSION}/todos/:todoId/attachments`,
  attachmentRoutes
);

(async () => {
  try {
    await mongoose.connect(process.env.DATABASE_LOCAL);
    console.log("Successfully connected to database.");
  } catch (error) {
    console.log(error);
  }
})();

app.all("*", (req, res, next) => {
  next(new AppError(`${req.originalUrl} cannot be found.`, 404));
});

app.use(globalErrorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
