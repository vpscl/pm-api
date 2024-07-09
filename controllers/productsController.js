const { pool } = require("../services/database");

// @desc    Get products
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const { rows: result } = await pool.query(
      `
      SELECT p.id, p.name, p.description, p.price, p.currency, p.quantity, p.active, p.created_date, p.updated_date, (
        SELECT ROW_TO_JSON(category_obj)
        FROM (
          SELECT id, name
          FROM category
          WHERE id = p.category_id
        ) AS category_obj
      ) AS category
      FROM product AS p
      ORDER BY p.id;
      `
    );
    res.status(200).json(result);
  } catch (error) {
    const err = new Error(error);
    next(err);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id) || id < 0) {
      const err = new Error("Invalid ID parameter.");
      err.status = 400;
      return next(err);
    }

    const { rows: result, rowCount } = await pool.query({
      text: `SELECT p.id, p.name, p.description, p.price, p.quantity, p.active, p.created_date, p.updated_date, (
              SELECT ROW_TO_JSON(category_obj)
              FROM (
                SELECT id, name FROM category WHERE id = p.category_id
              ) AS category_obj
            ) AS category
            FROM product AS p
            WHERE p.id = $1`,
      values: [id],
    });

    if (!rowCount) {
      const err = new Error(`Product with an ID of ${id} does not exist.`);
      err.status = 404;
      return next(err);
    }
    res.status(200).json(result[0]);
  } catch (error) {
    const err = new Error(error);
    next(err);
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
exports.getProductByCategory = async (req, res, next) => {
  try {
    const categoryId = Number(req.params.categoryId);

    if (isNaN(categoryId) || categoryId < 0) {
      const err = new Error("Invalid category ID parameter.");
      err.status = 400;
      return next(err);
    }

    const { rowCount: categoryExists } = await pool.query({
      text: `SELECT * FROM category WHERE id = $1`,
      values: [categoryId],
    });

    if (!categoryExists) {
      const err = new Error(
        `Category with an ID of ${categoryId} does not exist.`
      );
      err.status = 404;
      return next(err);
    }

    const { rows: result } = await pool.query({
      text: `SELECT p.id, p.name, p.description, p.price, p.quantity, p.currency, p.active, p.created_date, p.updated_date, (
              SELECT ROW_TO_JSON (category_obj)
              FROM (
                SELECT id, name FROM category WHERE id = p.category_id
              ) AS category_obj
            ) AS category
            FROM product AS p
            WHERE p.category_id = $1`,
      values: [categoryId],
    });

    res.status(200).json(result);
  } catch (error) {
    next(new Error(error));
  }
};

// @desc    Create product
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      currency,
      quantity,
      active,
      category_id,
    } = req.body;

    //required fields
    if (!name || !price || !category_id) {
      let missingFields = [];

      !name && missingFields.push("name");
      !price && missingFields.push("price");
      !category_id && missingFields.push("category ID");

      const err = new Error(
        `Missing ${
          missingFields.length > 1 ? "fields" : "field"
        }: ${missingFields.join(", ")}`
      );
      err.status = 422;
      return next(err);
    }

    const { rowCount: categoryExists } = await pool.query({
      text: `SELECT * FROM category WHERE id = $1`,
      values: [category_id],
    });

    if (!categoryExists) {
      const err = new Error(
        `Category with an ID of ${category_id} does not exist.`
      );
      err.status = 404;
      return next(err);
    }

    const { rows: result } = await pool.query({
      text: `
      INSERT INTO product(name, description, price, currency, quantity, active, category_id)
      VALUES ($1, $2 ,$3, $4, $5, $6, $7) RETURNING *`,
      values: [
        name,
        description,
        price,
        currency || "USD",
        quantity || 0,
        active || true,
        category_id,
      ],
    });
    return res.status(201).json(result[0]);
  } catch (error) {
    const err = new Error(error);
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/product/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id) || id < 0) {
      const err = new Error("Invalid ID parameter.");
      err.status = 400;
      return next(err);
    }

    const {
      name,
      description,
      quantity,
      price,
      currency,
      active,
      category_id,
      updated_date,
    } = req.body;

    if (
      !name ||
      !description ||
      !price ||
      !currency ||
      !quantity ||
      !active ||
      !category_id
    ) {
      const missingFields = [];
      !name && missingFields.push("name");
      !description && missingFields.push("description");
      !price && missingFields.push("price");
      !currency && missingFields.push("currency");
      !quantity && missingFields.push("quantity");
      !active && missingFields.push("active");
      !category_id && missingFields.push("category ID");

      const err = new Error(`Missing fields: ${missingFields.join(", ")}`);
      err.status = 400;
      return next(err);
    }

    const { rowCount: categoryExists } = await pool.query({
      text: `SELECT * FROM category WHERE id = $1`,
      values: [category_id],
    });

    if (!categoryExists) {
      const err = new Error(
        `Category with an ID of ${category_id} does not exist.`
      );
      err.status = 404;
      return next(err);
    }

    const { rows: result, rowCount } = await pool.query({
      text: `
      UPDATE product
      SET name = $1, description = $2, price = $3, currency = $4, quantity = $5,
          active = $6, category_id = $7, updated_date = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
      `,
      values: [
        name,
        description,
        price,
        currency,
        quantity,
        active,
        category_id,
        id,
      ],
    });

    if (!rowCount) {
      const err = new Error(`Product with an ID of ${id} does not exist.`);
      err.status = 404;
      return next(err);
    }

    return res.status(200).json(result[0]);
  } catch (error) {}
};

// @desc    Delete product
// @route   DELETE /api/product/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id) || id < 0) {
      const err = new Error("Invalid ID parameter.");
      err.status = 400;
      return next(err);
    }

    const { rows: result, rowCount } = await pool.query({
      text: `DELETE FROM product WHERE id = $1`,
      values: [id],
    });

    if (!rowCount) {
      const err = new Error(`Product with an ID of ${id} does not exist.`);
      err.status = 404;
      return next(err);
    }

    res.status(204).json(result);
  } catch (error) {
    next(new Error(error));
  }
};
