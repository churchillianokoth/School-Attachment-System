const router = require("express").Router();

const { 
  getAllStudents, 
  getStudentsBySupervisor, 
  getStudentById, 
  createStudent, 
  updateStudent, 
  deleteStudent, 
  searchStudents 
} = require("../controllers/studentsController");
const { 
  isAuthenticated, 
  isAdmin, 
  isSupervisor 
} = require("../middleware/isAuthenticated");

// Admin routes
router.get("/get-all-students", isAuthenticated, isAdmin, getAllStudents);
router.post("/create-student", isAuthenticated, isAdmin, createStudent);
router.get("/search-student", isAuthenticated, isAdmin, searchStudents);
router.get("/get-student/:id", isAuthenticated, isAdmin, getStudentById);
router.put("/update-student/:id", isAuthenticated, isAdmin, updateStudent);
router.delete("/delete-student/:id", isAuthenticated, isAdmin, deleteStudent);

// Supervisor routes
router.get("/supervisor/students", isAuthenticated, isSupervisor, getStudentsBySupervisor);

module.exports = router;