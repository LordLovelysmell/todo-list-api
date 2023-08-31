const AppError = require("../utils/appError");

const handleTokenExpired = () =>
  new AppError(
    `Access token has expired. Please, sign in again or use refresh token on "/${process.env.API_VERSION}/auth/token/refresh" endpoint.`,
    401
  );

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other uknown error: don't leak to the client
    console.error("Error:", err);

    res.status(500).json({
      status: "error",
      message: "Something went wrong.",
    });
  }
};

module.exports = function (err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  const env = (process.env.NODE_ENV || "").trim();

  if (env === "development") {
    sendErrorDev(err, res);
  } else if (env === "production") {
    let error = Object.assign({}, err);

    if (err.name === "CastError") {
      error = handleCastError(error);
    }

    if (err.name === "TokenExpiredError") {
      error = handleTokenExpired(error);
    }

    sendErrorProd(err, res); // TODO: fix bad errors on prod
  }
};
