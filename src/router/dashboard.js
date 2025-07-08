const router = require("express").Router();
const { 
  getAdminDashboard, 
  getStudentDashboard, 
  getSchoolSupervisorDashboard, 
  getHostSupervisorDashboard 
} = require("../controllers/dashboardController");
const { 
  isAuthenticated, 
  isAdmin, 
  isStudent, 
  isSchoolSupervisor, 
  isHostSupervisor 
} = require("../middleware/isAuthenticated");

// Admin dashboard
router.get("/admin", isAuthenticated, isAdmin, getAdminDashboard);

// Student dashboard
router.get("/student", isAuthenticated, isStudent, getStudentDashboard);

// School supervisor dashboard
router.get("/school-supervisor", isAuthenticated, isSchoolSupervisor, getSchoolSupervisorDashboard);

// Host supervisor dashboard
router.get("/host-supervisor", isAuthenticated, isHostSupervisor, getHostSupervisorDashboard);

module.exports = router; 