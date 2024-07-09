const router = require("express").Router();
const {
  getProducts,
  getProductById,
  getProductByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productsController");

// Get products
router.get("/", getProducts);

// Get single product
router.get("/:id", getProductById);

// Get product by category
router.get("/category/:categoryId", getProductByCategory);

// Create product
router.post("/", createProduct);

// Update product
router.put("/:id", updateProduct);

// Delete product
router.delete("/:id", deleteProduct);

module.exports = router;
