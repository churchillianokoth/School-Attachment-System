const router = require("express").Router();
const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  searchUsers, 
  getUserStats 
} = require("../controllers/usersController");
const { 
  isAuthenticated, 
  isAdmin 
} = require("../middleware/isAuthenticated");

// All user routes require authentication and admin role
router.use(isAuthenticated, isAdmin);

// User management
router.get("/", getAllUsers);
router.post("/", createUser);
router.get("/search", searchUsers);
router.get("/stats", getUserStats);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
