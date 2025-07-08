const pool = require("../config/db");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");

// Get host supervisor's organization
const getOrganization = async (req, res) => {
  try {
    const supervisor_id = req.user.userId;

    const result = await pool.query(`
      SELECT o.*, 
             COUNT(a.id) as total_applications,
             COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_applications
      FROM organizations o
      LEFT JOIN applications a ON o.id = a.organization_id
      WHERE o.host_supervisor_id = $1
      GROUP BY o.id
    `, [supervisor_id]);

    if (result.rows.length === 0) {
      return ErrorHandler("Organization not found", 404, res);
    }

    return SuccessHandler("Organization retrieved successfully", 200, res, result.rows[0]);
  } catch (error) {
    console.error("Error getting organization:", error);
    return ErrorHandler("Error retrieving organization", 500, res);
  }
};

// Get students assigned to host supervisor's organization
const getAssignedStudents = async (req, res) => {
  try {
    const supervisor_id = req.user.userId;

    const result = await pool.query(`
      SELECT s.*, a.start_date, a.end_date, a.status as application_status,
             COUNT(r.id) as total_reports,
             COUNT(CASE WHEN r.status = 'approved' THEN 1 END) as approved_reports
      FROM students s
      JOIN applications a ON s.id = a.student_id
      LEFT JOIN reports r ON s.id = r.student_id
      WHERE a.organization_id = (SELECT id FROM organizations WHERE host_supervisor_id = $1) 
      AND a.status = 'approved'
      GROUP BY s.id, a.start_date, a.end_date, a.status
      ORDER BY s.name
    `, [supervisor_id]);

    return SuccessHandler("Assigned students retrieved successfully", 200, res, result.rows);
  } catch (error) {
    console.error("Error getting assigned students:", error);
    return ErrorHandler("Error retrieving assigned students", 500, res);
  }
};

// Mark student attendance
const markAttendance = async (req, res) => {
  try {
    const { student_id, date, status, notes } = req.body;
    const supervisor_id = req.user.userId;

    // Validate required fields
    if (!student_id || !date || !status) {
      return ErrorHandler("Please provide student_id, date, and status", 400, res);
    }

    if (!['present', 'absent', 'late'].includes(status)) {
      return ErrorHandler("Status must be present, absent, or late", 400, res);
    }

    // Check if student is assigned to this supervisor's organization
    const studentCheck = await pool.query(`
      SELECT s.id FROM students s
      JOIN applications a ON s.id = a.student_id
      WHERE s.id = $1 AND a.organization_id = (SELECT id FROM organizations WHERE host_supervisor_id = $2)
      AND a.status = 'approved'
    `, [student_id, supervisor_id]);

    if (studentCheck.rows.length === 0) {
      return ErrorHandler("Student not found or not assigned to your organization", 404, res);
    }

    // Check if attendance already exists for this date and student
    const existingAttendance = await pool.query(
      "SELECT * FROM attendance WHERE student_id = $1 AND date = $2",
      [student_id, date]
    );

    if (existingAttendance.rows.length > 0) {
      return ErrorHandler("Attendance already marked for this date", 400, res);
    }

    // Get organization ID
    const organization = await pool.query(
      "SELECT id FROM organizations WHERE host_supervisor_id = $1",
      [supervisor_id]
    );

    // Mark attendance
    const result = await pool.query(
      `INSERT INTO attendance (student_id, organization_id, date, status, notes, marked_by) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [student_id, organization.rows[0].id, date, status, notes || null, supervisor_id]
    );

    return SuccessHandler("Attendance marked successfully", 201, res, result.rows[0]);
  } catch (error) {
    console.error("Error marking attendance:", error);
    return ErrorHandler("Error marking attendance", 500, res);
  }
};

// Get attendance records
const getAttendanceRecords = async (req, res) => {
  try {
    const supervisor_id = req.user.userId;
    const { student_id, start_date, end_date } = req.query;

    let sql = `
      SELECT a.*, s.name as student_name, s.email as student_email
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.organization_id = (SELECT id FROM organizations WHERE host_supervisor_id = $1)
    `;

    const params = [supervisor_id];
    let paramCount = 1;

    if (student_id) {
      paramCount++;
      sql += ` AND a.student_id = $${paramCount}`;
      params.push(student_id);
    }

    if (start_date) {
      paramCount++;
      sql += ` AND a.date >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      sql += ` AND a.date <= $${paramCount}`;
      params.push(end_date);
    }

    sql += ` ORDER BY a.date DESC, s.name`;

    const result = await pool.query(sql, params);

    return SuccessHandler("Attendance records retrieved successfully", 200, res, result.rows);
  } catch (error) {
    console.error("Error getting attendance records:", error);
    return ErrorHandler("Error retrieving attendance records", 500, res);
  }
};

// Create evaluation for student
const createEvaluation = async (req, res) => {
  try {
    const { student_id, evaluation_period, technical_skills, communication_skills, teamwork, problem_solving, overall_rating, comments } = req.body;
    const supervisor_id = req.user.userId;

    // Validate required fields
    if (!student_id || !evaluation_period || !overall_rating) {
      return ErrorHandler("Please provide student_id, evaluation_period, and overall_rating", 400, res);
    }

    if (overall_rating < 1 || overall_rating > 5) {
      return ErrorHandler("Overall rating must be between 1 and 5", 400, res);
    }

    // Check if student is assigned to this supervisor's organization
    const studentCheck = await pool.query(`
      SELECT s.id FROM students s
      JOIN applications a ON s.id = a.student_id
      WHERE s.id = $1 AND a.organization_id = (SELECT id FROM organizations WHERE host_supervisor_id = $2)
      AND a.status = 'approved'
    `, [student_id, supervisor_id]);

    if (studentCheck.rows.length === 0) {
      return ErrorHandler("Student not found or not assigned to your organization", 404, res);
    }

    // Check if evaluation already exists for this period and student
    const existingEvaluation = await pool.query(
      "SELECT * FROM evaluations WHERE student_id = $1 AND evaluation_period = $2",
      [student_id, evaluation_period]
    );

    if (existingEvaluation.rows.length > 0) {
      return ErrorHandler("Evaluation already exists for this period", 400, res);
    }

    // Get organization ID
    const organization = await pool.query(
      "SELECT id FROM organizations WHERE host_supervisor_id = $1",
      [supervisor_id]
    );

    // Create evaluation
    const result = await pool.query(
      `INSERT INTO evaluations (student_id, organization_id, evaluation_period, technical_skills, communication_skills, teamwork, problem_solving, overall_rating, comments, evaluated_by, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending') 
       RETURNING *`,
      [student_id, organization.rows[0].id, evaluation_period, technical_skills || null, communication_skills || null, teamwork || null, problem_solving || null, overall_rating, comments || null, supervisor_id]
    );

    return SuccessHandler("Evaluation created successfully", 201, res, result.rows[0]);
  } catch (error) {
    console.error("Error creating evaluation:", error);
    return ErrorHandler("Error creating evaluation", 500, res);
  }
};

// Get evaluations
const getEvaluations = async (req, res) => {
  try {
    const supervisor_id = req.user.userId;
    const { student_id, status } = req.query;

    let sql = `
      SELECT e.*, s.name as student_name, s.email as student_email
      FROM evaluations e
      JOIN students s ON e.student_id = s.id
      WHERE e.organization_id = (SELECT id FROM organizations WHERE host_supervisor_id = $1)
    `;

    const params = [supervisor_id];
    let paramCount = 1;

    if (student_id) {
      paramCount++;
      sql += ` AND e.student_id = $${paramCount}`;
      params.push(student_id);
    }

    if (status) {
      paramCount++;
      sql += ` AND e.status = $${paramCount}`;
      params.push(status);
    }

    sql += ` ORDER BY e.created_at DESC`;

    const result = await pool.query(sql, params);

    return SuccessHandler("Evaluations retrieved successfully", 200, res, result.rows);
  } catch (error) {
    console.error("Error getting evaluations:", error);
    return ErrorHandler("Error retrieving evaluations", 500, res);
  }
};

// Update evaluation
const updateEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const { technical_skills, communication_skills, teamwork, problem_solving, overall_rating, comments } = req.body;
    const supervisor_id = req.user.userId;

    // Check if evaluation exists and belongs to this supervisor
    const evaluation = await pool.query(`
      SELECT e.* FROM evaluations e
      WHERE e.id = $1 AND e.organization_id = (SELECT id FROM organizations WHERE host_supervisor_id = $2)
    `, [id, supervisor_id]);

    if (evaluation.rows.length === 0) {
      return ErrorHandler("Evaluation not found or access denied", 404, res);
    }

    if (evaluation.rows[0].status !== 'pending') {
      return ErrorHandler("Can only update pending evaluations", 400, res);
    }

    // Update evaluation
    const result = await pool.query(
      `UPDATE evaluations 
       SET technical_skills = COALESCE($1, technical_skills),
           communication_skills = COALESCE($2, communication_skills),
           teamwork = COALESCE($3, teamwork),
           problem_solving = COALESCE($4, problem_solving),
           overall_rating = COALESCE($5, overall_rating),
           comments = COALESCE($6, comments),
           updated_at = NOW()
       WHERE id = $7 
       RETURNING *`,
      [technical_skills, communication_skills, teamwork, problem_solving, overall_rating, comments, id]
    );

    return SuccessHandler("Evaluation updated successfully", 200, res, result.rows[0]);
  } catch (error) {
    console.error("Error updating evaluation:", error);
    return ErrorHandler("Error updating evaluation", 500, res);
  }
};

module.exports = {
  getOrganization,
  getAssignedStudents,
  markAttendance,
  getAttendanceRecords,
  createEvaluation,
  getEvaluations,
  updateEvaluation
}; 