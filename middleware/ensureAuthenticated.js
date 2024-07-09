require("dotenv").config();
const jwt = require("jsonwebtoken");

const ensureAuthenticated = (req, res, next) => {
  try {
    const accessToken = req.headers.authorization;

    if (!accessToken) {
      const err = new Error("Access token not found.");
      err.status = 401;
      return next(err);
    }

    const decodedAccessToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    req.user = { id: decodedAccessToken.userId };
    next();
  } catch (error) {
    const err = new Error("Access token is invalid or has expired.");
    next(err);
  }
};

module.exports = ensureAuthenticated;
