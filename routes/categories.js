const router = require("express").Router();
const {
  getCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoriesController");

// Get categories
router.get("/", getCategories);

// Get category by id
router.get("/:id", getCategoryById);

// Create category
router.post("/", createCategory);

// Update category
router.put("/:id", updateCategory);

// Delete category
router.delete("/:id", deleteCategory);

module.exports = router;
