const { pool } = require("../services/database");

// @desc    Get users
// @route   GET /api/users
exports.getUsers = async (req, res, next) => {
  try {
    const { rows: result } = await pool.query({
      text: `SELECT * FROM "user"`,
    });
    console.log(req.headers.authorization);
    res.status(200).json(result);
  } catch (error) {
    const err = new Error(error);
    next(err);
  }
};

// @desc    Get current user
// @route   GET /api/users/current
exports.getCurrentUser = async (req, res, next) => {
  try {
    const { rows: result } = await pool.query({
      text: `SELECT * FROM "user" WHERE id = $1`,
      values: [req.user.id],
    });

    res.status(200).json({
      id: result[0].id,
      name: result[0].name,
      email: result[0].email,
    });
  } catch (error) {
    const err = new Error(error);
    next(err);
  }
};
