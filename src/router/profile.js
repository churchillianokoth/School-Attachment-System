const router = require("express").Router();
const { 
  getProfile, 
  updateProfile, 
  changePassword, 
  getUserActivity 
} = require("../controllers/profileController");
const { isAuthenticated } = require("../middleware/isAuthenticated");

// All profile routes require authentication
router.use(isAuthenticated);

// Profile management
router.get("/get-profile", getProfile);
router.put("/update-profile", updateProfile);
router.put("/change-password", changePassword);
router.get("/get-activity", getUserActivity);

module.exports = router;