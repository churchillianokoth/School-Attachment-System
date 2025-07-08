const router = require("express").Router();
const { 
  createReport, 
  getAllReports, 
  getStudentReports, 
  getSupervisorReports, 
  getReportById, 
  updateReportStatus, 
  updateReport, 
  reviewReports,
  approveReport,
  rejectReport,
  getPendingReports,
  exportReport,
  deleteReport 
} = require("../controllers/reportsController");
const { 
  isAuthenticated, 
  isAdmin, 
  isStudent, 
  isSupervisor 
} = require("../middleware/isAuthenticated");

// Student routes
router.post("/create-report", isAuthenticated, isStudent, createReport);
router.get("/get-student-reports", isAuthenticated, isStudent, getStudentReports);
router.put("/update-report/:id", isAuthenticated, isStudent, updateReport);
router.delete("/delete-report/:id", isAuthenticated, isStudent, deleteReport);
router.post("/export-report", isAuthenticated, isStudent, exportReport);

// Admin/Supervisor routes
router.get("/get-all-reports", isAuthenticated, isAdmin, getAllReports);
router.get("/get-supervisor-reports", isAuthenticated, isSupervisor, getSupervisorReports);
router.get("/get-report/:id", isAuthenticated, isSupervisor, getReportById);
router.put("/update-report-status/:id", isAuthenticated, isSupervisor, updateReportStatus);
router.get("/review-report/:id", isAuthenticated, isSupervisor, reviewReports);
router.put("/approve-report/:id", isAuthenticated, isSupervisor, approveReport);
router.put("/reject-report/:id", isAuthenticated, isSupervisor, rejectReport);
router.get("/get-pending-reports", isAuthenticated, isAdmin, getPendingReports);


module.exports = router;
// This code sets up the routes for handling reports in the application.
// It includes routes for submitting a report, fetching reports by student ID, fetching a specific report