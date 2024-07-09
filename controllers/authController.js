require("dotenv").config();
const { pool } = require("../services/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @desc    Register
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      const missingFields = [];
      !name && missingFields.push("name");
      !email && missingFields.push("email");
      !password && missingFields.push("password");

      const err = new Error(
        `Missing field${
          missingFields.length > 1 ? "s" : ""
        }: ${missingFields.join(", ")}`
      );
      err.status = 422;
      return next(err);
    }

    const { rowCount: emailExists } = await pool.query({
      text: `SELECT * FROM "user" WHERE email = $1`,
      values: [email],
    });

    if (emailExists) {
      const err = new Error("Email already exists.");
      err.status = 409;
      return next(err);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query({
      text: `INSERT INTO "user"(name, email, password) VALUES ($1, $2, $3) RETURNING *;`,
      values: [name, email, hashedPassword],
    });

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    const err = new Error(error);
    next(err);
  }
};

// @desc    Login
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error("Email and password are required.");
      err.status = 422;
      return next(err);
    }

    const { rows, rowCount: emailExists } = await pool.query({
      text: `SELECT * FROM "user" WHERE email = $1`,
      values: [email],
    });

    const user = rows[0];

    if (!emailExists) {
      const err = new Error("Email or password is invalid.");
      err.status = 401;
      return next(err);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      const err = new Error("Email or password is invalid.");
      err.status = 401;
      return next(err);
    }

    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      { subject: "accessApi", expiresIn: "1h" }
    );

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      accessToken,
    });
  } catch (error) {
    const err = new Error(error);
    next(err);
  }
};
