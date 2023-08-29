const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  if (req.method === "OPTIONS") {
    next();
  }

  const authHeader = req.headers.authorization;
  const accessToken = authHeader && authHeader.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({
      status: "fail",
      data: { message: "Access token was not provided." },
    });
  }

  try {
    const decodedAccessToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    if (!decodedAccessToken) {
      return res.status(403);
    }

    req.user = decodedAccessToken;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.log("Access token has expired.");
      return res.status(403).json({
        status: "fail",
        data: {
          message: "Access token has expired.",
        },
      });
    }
  }
};
