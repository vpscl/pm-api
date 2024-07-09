const router = require("express").Router();
const { getUsers, getCurrentUser } = require("../controllers/usersController");
const ensureAuthenticated = require("../middleware/ensureAuthenticated");

// Get users
router.get("/", getUsers);

// Get current user
router.get("/current", ensureAuthenticated, getCurrentUser);

module.exports = router;
