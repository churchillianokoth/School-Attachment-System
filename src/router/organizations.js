const router = require("express").Router();
const { 
  createOrganization, 
  getAllOrganizations, 
  getOrganizationById, 
  updateOrganization, 
  deleteOrganization, 
  assignStudentToOrganization,
  removeStudentFromOrganization,
  searchOrganizations 
} = require("../controllers/organizationsController");
const { 
  isAuthenticated, 
  isAdmin, 
  isStudent,
  isSupervisor
} = require("../middleware/isAuthenticated");

// Public routes (for students to view organizations)
router.get("/get-organizations", isStudent, getAllOrganizations);
// /organizations/get-organisations/getAllOrganizations
router.get("/search-organizations", isStudent, searchOrganizations);
router.get("/get-organization/:id", isStudent, getOrganizationById);


// Admin/Supervisor routes
router.post("/create-organization", isAuthenticated, isAdmin, createOrganization);
router.put("/update-organization/:id", isAuthenticated, isAdmin, updateOrganization);
router.delete("/delete-organization/:id", isAuthenticated, isAdmin, deleteOrganization);
router.get("/get-organizationById/:id", isAuthenticated, isAdmin, getOrganizationById);
router.post("/assign-student-to-organization", isAuthenticated, isAdmin, assignStudentToOrganization);
router.post("/remove-student-from-organization", isAuthenticated, isAdmin, removeStudentFromOrganization);
module.exports = router;