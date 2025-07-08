const router = require("express").Router();
const { 
  getAdminStats, 
  getAllSupervisors, 
  createSupervisor, 
  updateSupervisor, 
  deleteSupervisor, 
  getSystemAnalytics, 
  getRecentActivities 
} = require("../controllers/adminController");
const { 
  isAuthenticated, 
  isAdmin 
} = require("../middleware/isAuthenticated");

// All admin routes require authentication and admin role
router.use(isAuthenticated, isAdmin);

// Dashboard and statistics
router.get("/stats", getAdminStats);
router.get("/analytics", getSystemAnalytics);
router.get("/activities", getRecentActivities);

// Supervisor management
router.get("/supervisors", getAllSupervisors);
router.post("/supervisors", createSupervisor);
router.put("/supervisors/:id", updateSupervisor);
router.delete("/supervisors/:id", deleteSupervisor);

module.exports = router;
