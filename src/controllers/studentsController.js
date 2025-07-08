const pool = require("../config/db");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");

// Get all students (admin/supervisor)
const getAllStudents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, 
             COUNT(a.id) as total_applications,
             COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_applications,
             COUNT(r.id) as total_reports
      FROM students s
      LEFT JOIN applications a ON s.id = a.student_id
      LEFT JOIN reports r ON s.id = r.student_id
      GROUP BY s.id
      ORDER BY s.name
    `);

    return SuccessHandler("Students retrieved successfully", 200, res, result.rows);
  } catch (error) {
    console.error("Error getting students:", error);
    return ErrorHandler("Error retrieving students", 500, res);
  }
};

// Get students by supervisor
const getStudentsBySupervisor = async (req, res) => {
  try {
    const supervisor_id = req.user.userId;

    const result = await pool.query(`
      SELECT s.*, 
             COUNT(a.id) as total_applications,
             COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_applications,
             COUNT(r.id) as total_reports
      FROM students s
      LEFT JOIN applications a ON s.id = a.student_id
      LEFT JOIN reports r ON s.id = r.student_id
      WHERE s.school_supervisor_id = $1
      GROUP BY s.id
      ORDER BY s.name
    `, [supervisor_id]);

    return SuccessHandler("Supervisor students retrieved successfully", 200, res, result.rows);
  } catch (error) {
    console.error("Error getting supervisor students:", error);
    return ErrorHandler("Error retrieving supervisor students", 500, res);
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT s.*, 
             COUNT(a.id) as total_applications,
             COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_applications,
             COUNT(r.id) as total_reports
      FROM students s
      LEFT JOIN applications a ON s.id = a.student_id
      LEFT JOIN reports r ON s.id = r.student_id
      WHERE s.id = $1
      GROUP BY s.id
    `, [id]);

    if (result.rows.length === 0) {
      return ErrorHandler("Student not found", 404, res);
    }

    // Get student's applications
    const applications = await pool.query(`
      SELECT a.*, o.name as organization_name, o.location
      FROM applications a
      JOIN organizations o ON a.organization_id = o.id
      WHERE a.student_id = $1
      ORDER BY a.created_at DESC
    `, [id]);

    // Get student's reports
    const reports = await pool.query(`
      SELECT r.*, o.name as organization_name
      FROM reports r
      LEFT JOIN applications a ON r.student_id = a.student_id AND a.status = 'approved'
      LEFT JOIN organizations o ON a.organization_id = o.id
      WHERE r.student_id = $1
      ORDER BY r.week_number DESC
    `, [id]);

    const student = result.rows[0];
    student.applications = applications.rows;
    student.reports = reports.rows;

    return SuccessHandler("Student retrieved successfully", 200, res, student);
  } catch (error) {
    console.error("Error getting student:", error);
    return ErrorHandler("Error retrieving student", 500, res);
  }
};

// Create new student (admin only)
const createStudent = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      course, 
      student_id, 
      phone, 
      school_supervisor_id 
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !course || !student_id) {
      return ErrorHandler("Please provide name, email, password, course, and student_id", 400, res);
    }

    // Check if student already exists
    const existingStudent = await pool.query(
      "SELECT * FROM students WHERE email = $1 OR student_id = $2",
      [email, student_id]
    );

    if (existingStudent.rows.length > 0) {
      return ErrorHandler("Student with this email or student ID already exists", 400, res);
    }

    // Hash password
    const bcrypt = require("bcryptjs");
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create student
    const result = await pool.query(
      `INSERT INTO students (name, email, password, course, student_id, phone, school_supervisor_id, role) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'student') 
       RETURNING id, name, email, course, student_id, phone, school_supervisor_id, role`,
      [name, email, hashedPassword, course, student_id, phone || null, school_supervisor_id || null]
    );

    return SuccessHandler("Student created successfully", 201, res, result.rows[0]);
  } catch (error) {
    console.error("Error creating student:", error);
    return ErrorHandler("Error creating student", 500, res);
  }
};

// Update student (admin/supervisor)
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      course, 
      student_id, 
      phone, 
      school_supervisor_id 
    } = req.body;

    // Check if student exists
    const existingStudent = await pool.query("SELECT * FROM students WHERE id = $1", [id]);
    if (existingStudent.rows.length === 0) {
      return ErrorHandler("Student not found", 404, res);
    }

    // Update student
    const result = await pool.query(
      `UPDATE students 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           course = COALESCE($3, course),
           student_id = COALESCE($4, student_id),
           phone = COALESCE($5, phone),
           school_supervisor_id = COALESCE($6, school_supervisor_id),
           updated_at = NOW()
       WHERE id = $7 
       RETURNING id, name, email, course, student_id, phone, school_supervisor_id, role`,
      [name, email, course, student_id, phone, school_supervisor_id, id]
    );

    return SuccessHandler("Student updated successfully", 200, res, result.rows[0]);
  } catch (error) {
    console.error("Error updating student:", error);
    return ErrorHandler("Error updating student", 500, res);
  }
};

// Delete student (admin only)
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if student has any applications or reports
    const [applications, reports] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM applications WHERE student_id = $1", [id]),
      pool.query("SELECT COUNT(*) FROM reports WHERE student_id = $1", [id])
    ]);

    if (parseInt(applications.rows[0].count) > 0 || parseInt(reports.rows[0].count) > 0) {
      return ErrorHandler("Cannot delete student with existing applications or reports", 400, res);
    }

    // Delete student
    const result = await pool.query("DELETE FROM students WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return ErrorHandler("Student not found", 404, res);
    }

    return SuccessHandler("Student deleted successfully", 200, res);
  } catch (error) {
    console.error("Error deleting student:", error);
    return ErrorHandler("Error deleting student", 500, res);
  }
};

// Search students
const searchStudents = async (req, res) => {
  try {
    const { query, course, supervisor_id } = req.query;

    let sql = `
      SELECT s.*, 
             COUNT(a.id) as total_applications,
             COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_applications,
             COUNT(r.id) as total_reports
      FROM students s
      LEFT JOIN applications a ON s.id = a.student_id
      LEFT JOIN reports r ON s.id = r.student_id
    `;

    const conditions = [];
    const params = [];
    let paramCount = 0;

    if (query) {
      paramCount++;
      conditions.push(`(s.name ILIKE $${paramCount} OR s.email ILIKE $${paramCount} OR s.student_id ILIKE $${paramCount})`);
      params.push(`%${query}%`);
    }

    if (course) {
      paramCount++;
      conditions.push(`s.course ILIKE $${paramCount}`);
      params.push(`%${course}%`);
    }

    if (supervisor_id) {
      paramCount++;
      conditions.push(`s.school_supervisor_id = $${paramCount}`);
      params.push(supervisor_id);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` GROUP BY s.id ORDER BY s.name`;

    const result = await pool.query(sql, params);

    return SuccessHandler("Students search completed", 200, res, result.rows);
  } catch (error) {
    console.error("Error searching students:", error);
    return ErrorHandler("Error searching students", 500, res);
  }
};

module.exports = {
  getAllStudents,
  getStudentsBySupervisor,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents
}; 