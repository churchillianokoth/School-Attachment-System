const router = require("express").Router();
const { 
  getOrganization, 
  getAssignedStudents, 
  markAttendance, 
  getAttendanceRecords, 
  createEvaluation, 
  getEvaluations, 
  updateEvaluation 
} = require("../controllers/supervisorController");
const { 
  isAuthenticated, 
  isHostSupervisor 
} = require("../middleware/isAuthenticated");

// All supervisor routes require authentication and host supervisor role
router.use(isAuthenticated, isHostSupervisor);

// Organization management
router.get("/organization", getOrganization);

// Student management
router.get("/students", getAssignedStudents);

// Attendance management
router.post("/attendance", markAttendance);
router.get("/attendance", getAttendanceRecords);

// Evaluation management
router.post("/evaluations", createEvaluation);
router.get("/evaluations", getEvaluations);
router.put("/evaluations/:id", updateEvaluation);

module.exports = router;