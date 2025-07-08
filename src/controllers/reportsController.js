const pool = require('../config/db'); // Adjust path if needed
const ErrorHandler = require('../utils/ErrorHandler');
const SuccessHandler = require('../utils/SuccessHandler');
const jwt = require('jsonwebtoken'); 
const dotenv = require('dotenv'); 
const { get } = require('../router/organizations');
dotenv.config();

// Create new report
const createReport = async (req, res) => {
  try {
    console.log(req.body);
    const { report_title, week_number, activities, achievements, challenges,key_learnings, next_weeks_plans, attachment_url } = req.body;
    const student_id = req.user.userId;
    console.log("Student ID:", student_id);

    // Validate required fields
    if (!report_title || !week_number || !activities || !achievements || !challenges || !key_learnings || !next_weeks_plans) {
      return ErrorHandler("Please provide all details", 400, res);
    }

    // Check if student has an approved application
    const approvedApplication = await pool.query(
      "SELECT * FROM applications WHERE student_id = $1 AND status = 'approved'",
      [student_id]
    );

    if (approvedApplication.rows.length === 0) {
      return ErrorHandler("You must have an approved application to submit reports", 400, res);
    }

    // Check if report for this week already exists
    const existingReport = await pool.query(
      "SELECT * FROM reports WHERE student_id = $1 AND week_number = $2",
      [student_id, week_number]
    );

    if (existingReport.rows.length > 0) {
      return ErrorHandler("Report for this week already exists", 400, res);
    }

    // Create report
    const result = await pool.query(
      `INSERT INTO reports (student_id, report_title, week_number, activities, achievements, challenges, key_learnings, next_weeks_plans, attachment_url, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending') 
       RETURNING *`,
      [student_id, report_title, week_number, activities, achievements, challenges, key_learnings, next_weeks_plans, attachment_url || null]
    );

    return SuccessHandler("Report submitted successfully", 201, res, result.rows[0]);
  } catch (error) {
    console.error("Error creating report:", error);
    return ErrorHandler("Error creating report", 500, res);
  }
};
//rejectReport
const rejectReport = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE reports
      SET status = 'rejected', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return ErrorHandler("Report not found", 404, res);
    }

    return SuccessHandler("Report rejected successfully", 200, res, result.rows[0]);
  } catch (error) {
    console.error("Error rejecting report:", error);
    return ErrorHandler("Error rejecting report", 500, res);
  }
};

// Get all reports (admin/supervisor)
const getAllReports = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, s.name as student_name, s.email as student_email, s.course,
             o.name as organization_name
      FROM reports r
      JOIN students s ON r.student_id = s.id
      LEFT JOIN applications a ON s.id = a.student_id AND a.status = 'approved'
      LEFT JOIN organizations o ON a.organization_id = o.id
      ORDER BY r.created_at DESC
    `);

    return SuccessHandler("Reports retrieved successfully", 200, res, result.rows);
  } catch (error) {
    console.error("Error getting reports:", error);
    return ErrorHandler("Error retrieving reports", 500, res);
  }
};

// Get student's reports
const getStudentReports = async (req, res) => {
  try {
    const student_id = req.user.userId;

    const result = await pool.query(`
      SELECT r.*, o.name as organization_name
      FROM reports r
      LEFT JOIN applications a ON r.student_id = a.student_id AND a.status = 'approved'
      LEFT JOIN organizations o ON a.organization_id = o.id
      WHERE r.student_id = $1
      ORDER BY r.week_number DESC
    `, [student_id]);

    return SuccessHandler("Student reports retrieved successfully", 200, res, result.rows);
  } catch (error) {
    console.error("Error getting student reports:", error);
    return ErrorHandler("Error retrieving student reports", 500, res);
  }
};

// Get reports by supervisor (for students under their supervision)
const getSupervisorReports = async (req, res) => {
  try {
    const supervisor_id = req.user.userId;

    const result = await pool.query(`
      SELECT r.*, s.name as student_name, s.email as student_email, s.course,
             o.name as organization_name
      FROM reports r
      JOIN students s ON r.student_id = s.id
      LEFT JOIN applications a ON s.id = a.student_id AND a.status = 'approved'
      LEFT JOIN organizations o ON a.organization_id = o.id
      WHERE s.school_supervisor_id = $1
      ORDER BY r.created_at DESC
    `, [supervisor_id]);

    return SuccessHandler("Supervisor reports retrieved successfully", 200, res, result.rows);
  } catch (error) {
    console.error("Error getting supervisor reports:", error);
    return ErrorHandler("Error retrieving supervisor reports", 500, res);
  }
};

// Get report by ID
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT r.*, s.name as student_name, s.email as student_email, s.course,
             o.name as organization_name, o.location
      FROM reports r
      JOIN students s ON r.student_id = s.id
      LEFT JOIN applications a ON s.id = a.student_id AND a.status = 'approved'
      LEFT JOIN organizations o ON a.organization_id = o.id
      WHERE r.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return ErrorHandler("Report not found", 404, res);
    }

    return SuccessHandler("Report retrieved successfully", 200, res, result.rows[0]);
  } catch (error) {
    console.error("Error getting report:", error);
    return ErrorHandler("Error retrieving report", 500, res);
  }
};
// Approve report (supervisor/admin)
const approveReport = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE reports
      SET status = 'approved', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return ErrorHandler("Report not found", 404, res);
    }

    return SuccessHandler("Report approved successfully", 200, res, result.rows[0]);
  } catch (error) {
    console.error("Error approving report:", error);
    return ErrorHandler("Error approving report", 500, res);
  }
};

// Update report status (supervisor/admin)
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback, grade } = req.body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return ErrorHandler("Please provide a valid status (pending, approved, rejected)", 400, res);
    }

    const result = await pool.query(
      `UPDATE reports 
       SET status = $1, feedback = $2, grade = $3, updated_at = NOW() 
       WHERE id = $4 
       RETURNING *`,
      [status, feedback || null, grade || null, id]
    );

    if (result.rows.length === 0) {
      return ErrorHandler("Report not found", 404, res);
    }

    return SuccessHandler("Report status updated successfully", 200, res, result.rows[0]);
  } catch (error) {
    console.error("Error updating report status:", error);
    return ErrorHandler("Error updating report status", 500, res);
  }
};

// Update report (student can only update their own pending reports)
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, attachment_url } = req.body;
    const student_id = req.user.userId;

    // Check if report exists and belongs to student
    const report = await pool.query(
      "SELECT * FROM reports WHERE id = $1 AND student_id = $2",
      [id, student_id]
    );

    if (report.rows.length === 0) {
      return ErrorHandler("Report not found or access denied", 404, res);
    }

    if (report.rows[0].status !== 'pending') {
      return ErrorHandler("Can only update pending reports", 400, res);
    }

    const result = await pool.query(
      `UPDATE reports 
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           attachment_url = COALESCE($3, attachment_url),
           updated_at = NOW()
       WHERE id = $4 
       RETURNING *`,
      [title, content, attachment_url, id]
    );

    return SuccessHandler("Report updated successfully", 200, res, result.rows[0]);
  } catch (error) {
    console.error("Error updating report:", error);
    return ErrorHandler("Error updating report", 500, res);
  }
};

const reviewReports = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT r.*, s.name as student_name, s.email as student_email, s.course,
             o.name as organization_name, o.location
      FROM reports r
      JOIN students s ON r.student_id = s.id
      LEFT JOIN applications a ON s.id = a.student_id AND a.status = 'approved'
      LEFT JOIN organizations o ON a.organization_id = o.id
      WHERE r.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return ErrorHandler("Report not found", 404, res);
    }

    return SuccessHandler("Report retrieved successfully", 200, res, result.rows[0]);
  } catch (error) {
    console.error("Error getting report:", error);
    return ErrorHandler("Error retrieving report", 500, res);
  }
};
//getPendingReports
const getPendingReports = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, s.name as student_name, s.email as student_email, s.course,
             o.name as organization_name
      FROM reports r
      JOIN students s ON r.student_id = s.id
      LEFT JOIN applications a ON s.id = a.student_id AND a.status = 'approved'
      LEFT JOIN organizations o ON a.organization_id = o.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
    `);

    return SuccessHandler("Pending reports retrieved successfully", 200, res, result.rows);
  } catch (error) {
    console.error("Error getting pending reports:", error);
    return ErrorHandler("Error retrieving pending reports", 500, res);
  }
};
//exportReport
const exportReport = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT r.*, s.name as student_name, s.email as student_email, s.course,
             o.name as organization_name, o.location
      FROM reports r
      JOIN students s ON r.student_id = s.id
      LEFT JOIN applications a ON s.id = a.student_id AND a.status = 'approved'
      LEFT JOIN organizations o ON a.organization_id = o.id
      WHERE r.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return ErrorHandler("Report not found", 404, res);
    }

    // Here you would implement the logic to export the report data to a file format (e.g., PDF, CSV)
    // For simplicity, we will just return the report data as JSON

    return SuccessHandler("Report exported successfully", 200, res, result.rows[0]);
  } catch (error) {
    console.error("Error exporting report:", error);
    return ErrorHandler("Error exporting report", 500, res);
  }
};
// Delete report (student can only delete their own pending reports)
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const student_id = req.user.userId;

    // Check if report exists and belongs to student
    const report = await pool.query(
      "SELECT * FROM reports WHERE id = $1 AND student_id = $2",
      [id, student_id]
    );

    if (report.rows.length === 0) {
      return ErrorHandler("Report not found or access denied", 404, res);
    }

    if (report.rows[0].status !== 'pending') {
      return ErrorHandler("Can only delete pending reports", 400, res);
    }

    await pool.query("DELETE FROM reports WHERE id = $1", [id]);

    return SuccessHandler("Report deleted successfully", 200, res);
  } catch (error) {
    console.error("Error deleting report:", error);
    return ErrorHandler("Error deleting report", 500, res);
  }
};


module.exports = {
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
};