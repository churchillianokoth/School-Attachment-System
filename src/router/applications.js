const router = require("express").Router();
const { 
  createApplication, 
  getAllApplications, 
  getStudentApplications, 
  updateApplicationStatus, 
  getApplicationById, 
  deleteApplication,
  approveApplication,
  rejectApplication,
  getStudentApplication,
  getPendingApplication,
  updateApplication
} = require("../controllers/applicationsController");
const { 
  isAuthenticated, 
  isAdmin, 
  isStudent, 
  isSupervisor 
} = require("../middleware/isAuthenticated");

// Student routes
router.post("/create-application", isAuthenticated, isStudent, createApplication);
router.get("/get-applications", isAuthenticated, isStudent, getStudentApplications);
router.delete("/delete-application/:id", isAuthenticated, isStudent, deleteApplication);
router.put("/update-application/:id", isAuthenticated, isStudent, updateApplication);

// Admin/Supervisor routes
router.get("/get-all-applications", isAuthenticated, isAdmin, getAllApplications);
router.get("/get-application/:id", isAuthenticated, isSupervisor, isAdmin, getApplicationById);
router.put("/update-application-status/:id", isAuthenticated, isSupervisor,isAdmin, updateApplicationStatus);
router.put("/approve-application/:id", isAuthenticated, isSupervisor, isAdmin, approveApplication);
router.put("/reject-application/:id", isAuthenticated, isSupervisor, isAdmin, rejectApplication);
router.get("/get-student-application/:studentId", isAuthenticated, isSupervisor, isAdmin, getStudentApplication);
router.get("/get-pending-application/:studentId", isAuthenticated, isSupervisor, isAdmin, getPendingApplication);
module.exports = router;