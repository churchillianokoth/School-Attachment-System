const pool = require("../config/db");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");

// Create new application
const createApplication = async (req, res) => {
  try {
    console.log(req.body)
    const { organization_id, position, attachment_type, start_date, end_date, motivation, skills, experience, availability } = req.body;
    const student_id = req.user.userId;

    // Validate required fields
    if (!organization_id || !start_date || !end_date) {
      return ErrorHandler("Please provide organization_id, start_date, and end_date", 400, res);
    }

    // Check if student already has an application for this organization
    const existingApplication = await pool.query(
      "SELECT * FROM applications WHERE student_id = $1 AND organization_id = $2",
      [student_id, organization_id] 
    );

    if (existingApplication.rows.length > 0) {
      return ErrorHandler("You have already applied to this organization", 400, res);
    }

    // Create application
    const result = await pool.query(
      `INSERT INTO applications (student_id, organization_id, position, attachment_type, start_date, end_date, motivation, skills, experience, availability, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
       RETURNING *`,
      [student_id, organization_id, position, attachment_type, start_date, end_date, motivation, skills, experience, availability]
    );

    return SuccessHandler("Application submitted successfully", 201, res, result.rows[0]);
  } catch (error) {
    console.error("Error creating application:", error);
    return ErrorHandler("Error creating application", 500, res);
  }
};

// get student application
const getStudentApplication = async (req, res) => {
  try {
    const student_id = req.user.userId;

    const result = await pool.query(`
      SELECT a.*, o.name as organization_name, o.location, o.description
      FROM applications a
      JOIN organizations o ON a.organization_id = o.id
      WHERE a.student_id = $1
      ORDER BY a.created_at DESC
    `, [student_id]);

    return SuccessHandler("Student applications retrieved successfully", 200, res, result.rows);
  } catch (error) {
    console.error("Error getting student applications:", error);
    return ErrorHandler("Error retrieving student applications", 500, res);
  }
};

// approve application
const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const student_id = req.user.userId;

    // Check if application exists and belongs to student
    const application = await pool.query(
      "SELECT * FROM applications WHERE id = $1 AND student_id = $2",
      [id, student_id]
    );

    if (application.rows.length === 0) {
      return ErrorHandler("Application not found or access denied", 404, res);
    }

    if (application.rows[0].status !== 'pending') {
      return ErrorHandler("Can only approve pending applications", 400, res);
    }
  //   // Check if the application is already approved
  //   if (application.rows[0].status === 'approved') {
  //     return ErrorHandler("Application is already approved", 400, res);
  //   }
  // } catch (error) {
  //   console.error("Error approving application:", error);
  //   return ErrorHandler("Error approving application", 500, res);
  // }

    // Update application status to approved
    const result = await pool.query(
      "UPDATE applications SET status = 'approved', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );

    return SuccessHandler("Application approved successfully", 200, res, result.rows[0]);
  } catch (error) {
    console.error("Error approving application:", error);
    return ErrorHandler("Error approving application", 500, res);
  }
}

// Get all applications (admin only)
const getAllApplications = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, s.name as student_name, s.email as student_email, 
             o.name as organization_name, o.location as organization_location
      FROM applications a
      JOIN students s ON a.student_id = s.id
      JOIN organizations o ON a.organization_id = o.id
      ORDER BY a.created_at DESC
    `);

    return SuccessHandler("Applications retrieved successfully", 200, res, result.rows);
  } catch (error) {
    console.error("Error getting applications:", error);
    return ErrorHandler("Error retrieving applications", 500, res);}
  };
// get pending application
const getPendingApplication = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, s.name as student_name, s.email as student_email, 
             o.name as organization_name, o.location as organization_location
      FROM applications a
      JOIN students s ON a.student_id = s.id
      JOIN organizations o ON a.organization_id = o.id
      WHERE a.status = 'pending'
      ORDER BY a.created_at DESC
    `);

    return SuccessHandler("Pending applications retrieved successfully", 200, res, result.rows);
  } catch (error) {
    console.error("Error getting pending applications:", error);
    return ErrorHandler("Error retrieving pending applications", 500, res);
  }
};  

// Get student's applications
const getStudentApplications = async (req, res) => {
  try {
    const student_id = req.user.userId;

    const result = await pool.query(`
      SELECT a.*, o.name as organization_name, o.location, o.description
      FROM applications a
      JOIN organizations o ON a.organization_id = o.id
      WHERE a.student_id = $1
      ORDER BY a.created_at DESC
    `, [student_id]);

    return SuccessHandler("Student applications retrieved successfully", 200, res, result.rows);
  } catch (error) {
    console.error("Error getting student applications:", error);
    return ErrorHandler("Error retrieving student applications", 500, res);
  }
};

// Update application status (admin/supervisor only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return ErrorHandler("Please provide a valid status (pending, approved, rejected)", 400, res);
    }

    const result = await pool.query(
      `UPDATE applications 
       SET status = $1, feedback = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [status, feedback || null, id]
    );

    if (result.rows.length === 0) {
      return ErrorHandler("Application not found", 404, res);
    }

    return SuccessHandler("Application status updated successfully", 200, res, result.rows[0]);
  } catch (error) {
    console.error("Error updating application status:", error);
    return ErrorHandler("Error updating application status", 500, res);
  }
};

const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date, cover_letter } = req.body;

    // Check if application exists
    const existingApplication = await pool.query("SELECT * FROM applications WHERE id = $1", [id]);
    if (existingApplication.rows.length === 0) {
      return ErrorHandler("Application not found", 404, res);
    }

    // Update application
    const result = await pool.query(
      `UPDATE applications 
       SET start_date = COALESCE($1, start_date),
           end_date = COALESCE($2, end_date),
           cover_letter = COALESCE($3, cover_letter),
           updated_at = NOW()
       WHERE id = $4 
       RETURNING *`,
      [start_date, end_date, cover_letter || null, id]
    );

    return SuccessHandler("Application updated successfully", 200, res, result.rows[0]);
  } catch (error) {
    console.error("Error updating application:", error);
    return ErrorHandler("Error updating application", 500, res);  
  }
};

// Get application by ID
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT a.*, s.name as student_name, s.email as student_email, s.course,
             o.name as organization_name, o.location, o.description
      FROM applications a
      JOIN students s ON a.student_id = s.id
      JOIN organizations o ON a.organization_id = o.id
      WHERE a.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return ErrorHandler("Application not found", 404, res);
    }

    return SuccessHandler("Application retrieved successfully", 200, res, result.rows[0]);
  } catch (error) {
    console.error("Error getting application:", error);
    return ErrorHandler("Error retrieving application", 500, res);
  }
};
const rejectApplication = async (req, res) =>{
  try {
    const { id } = req.params;
    const student_id = req.user.userId;

    // Check if application exists and belongs to student
    const application = await pool.query(
      "SELECT * FROM applications WHERE id = $1 AND student_id = $2",
      [id, student_id]
    );

    if (application.rows.length === 0) {
      return ErrorHandler("Application not found or access denied", 404, res);
    }

    if (application.rows[0].status !== 'pending') {
      return ErrorHandler("Can only reject pending applications", 400, res);
    }

    // Update application status to rejected
    const result = await pool.query(
      "UPDATE applications SET status = 'rejected', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );

    return SuccessHandler("Application rejected successfully", 200, res, result.rows[0]);
  } catch (error) {
    console.error("Error rejecting application:", error);
    return ErrorHandler("Error rejecting application", 500, res);
  }
};


// Delete application (student can only delete their own pending applications)
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const student_id = req.user.userId;

    // Check if application exists and belongs to student
    const application = await pool.query(
      "SELECT * FROM applications WHERE id = $1 AND student_id = $2",
      [id, student_id]
    );

    if (application.rows.length === 0) {
      return ErrorHandler("Application not found or access denied", 404, res);
    }

    if (application.rows[0].status !== 'pending') {
      return ErrorHandler("Can only delete pending applications", 400, res);
    }

    await pool.query("DELETE FROM applications WHERE id = $1", [id]);

    return SuccessHandler("Application deleted successfully", 200, res);
  } catch (error) {
    console.error("Error deleting application:", error);
    return ErrorHandler("Error deleting application", 500, res);
  }
};

module.exports = {
  createApplication,
  getAllApplications,
  getStudentApplications,
  updateApplicationStatus,
  updateApplication,
  getApplicationById,
  approveApplication,
  rejectApplication,
  getStudentApplication,
  getPendingApplication,
  deleteApplication
}; 