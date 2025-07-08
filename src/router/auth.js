const router = require("express").Router();
const { createUser, login, getUser, logout } = require("../controllers/authController");
const { isAuthenticated } = require("../middleware/isAuthenticated");

// Public routes

router.post("/create-user", createUser);
router.post("/login", login);

// Protected routes
router.get("/user", isAuthenticated, getUser);
router.post("/logout", isAuthenticated, logout);

module.exports = router;