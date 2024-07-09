const { pool } = require("../services/database");

// @desc    Get categories
// @route   GET /api/categories
exports.getCategories = async (req, res, next) => {
  try {
    const { rows: result } = await pool.query("SELECT * FROM category;");
    res.status(200).json(result);
  } catch (error) {
    const err = new Error(error);
    next(err);
  }
};

// @desc    Get category by id
// @route   GET /api/categories/:id
exports.getCategoryById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id) || id < 0) {
      const err = new Error("Invalid ID parameter.");
      err.status = 400;
      return next(err);
    }

    const { rows: result } = await pool.query({
      text: `SELECT * FROM category WHERE id = $1;`,
      values: [id],
    });

    if (!result.length) {
      const err = new Error(`Category with an ID of ${id} does not exist.`);
      err.status = 404;
      next(err);
    }
    res.status(200).json(result[0]);
  } catch (error) {
    const err = new Error(error);
    err.status = 422;
    next(err);
  }
};

// @desc    Create category
// @route   POST /api/categories
exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      const err = new Error("Name is required.");
      err.status = 422;
      return next(err);
    }

    const { rowCount: categoryExists } = await pool.query({
      text: `SELECT * FROM category WHERE name = $1`,
      values: [name],
    });

    if (categoryExists) {
      const err = new Error(`Category '${name}' already exists.`);
      err.status = 409;
      return next(err);
    }

    const { rows: result } = await pool.query({
      text: `INSERT INTO category (name) VALUES ($1) RETURNING *`,
      values: [name],
    });
    res.status(201).json(result[0]);
  } catch (error) {
    const err = new Error(error);
    next(err);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;

    if (isNaN(id) || id < 0) {
      const err = new Error("Invalid ID parameter.");
      err.status = 400;
      return next(err);
    }

    if (!name) {
      const err = new Error("Name is required.");
      err.status = 422;
      return next(err);
    }

    const { rowCount: categoryExists } = await pool.query({
      text: `SELECT * FROM category WHERE name = $1`,
      values: [name],
    });

    if (categoryExists) {
      const err = new Error(`Category '${name}' already exists.`);
      err.status = 409;
      return next(err);
    }

    const { rows: result, rowCount } = await pool.query({
      text: `UPDATE category SET name = $1, updated_date = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      values: [name, id],
    });

    if (!rowCount) {
      const err = new Error(`Category with an ID of ${id} does not exist.`);
      err.status = 404;
      return next(err);
    }
    res.status(200).json(result[0]);
  } catch (error) {
    const err = new Error(error);
    next(err);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id) || id < 0) {
      const err = new Error("Invalid ID parameter.");
      err.status = 400;
      return next(err);
    }

    const { rows: count } = await pool.query({
      text: `SELECT COUNT(*) FROM product WHERE category_id = $1`,
      values: [id],
    });

    if (count[0].count > 0) {
      const err = new Error(
        `Category with an ID of ${id} is being used in ${count[0].count} ${
          count[0].count > 1 ? "products" : "product"
        }.`
      );
      err.status = 409;
      return next(err);
    }

    const { rows: result, rowCount } = await pool.query({
      text: `DELETE FROM category WHERE id = $1`,
      values: [id],
    });

    if (!rowCount) {
      const err = new Error(`Category with an ID of ${id} does not exist`);
      err.status = 404;
      return next(err);
    }

    res.status(204).json(result[0]);
  } catch (error) {
    const err = new Error(error);
    next(err);
  }
};
