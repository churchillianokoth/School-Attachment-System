const pool = require("../config/db");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");

// Get admin dashboard statistics
const getAdminStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalOrganizations,
      totalApplications,
      totalReports,
      pendingApplications,
      completedAttachments,
      totalSupervisors,
      totalAdmins
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM students"),
      pool.query("SELECT COUNT(*) FROM organizations"),
      pool.query("SELECT COUNT(*) FROM applications"),
      pool.query("SELECT COUNT(*) FROM reports"),
      pool.query("SELECT COUNT(*) FROM applications WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM applications WHERE status = 'completed'"),
      pool.query("SELECT COUNT(*) FROM school_supervisor"),
      pool.query("SELECT COUNT(*) FROM admin")
    ]);

    const stats = {
      totalStudents: parseInt(totalStudents.rows[0].count),
      totalOrganizations: parseInt(totalOrganizations.rows[0].count),
      totalApplications: parseInt(totalApplications.rows[0].count),
      totalReports: parseInt(totalReports.rows[0].count),
      pendingApplications: parseInt(pendingApplications.rows[0].count),
      completedAttachments: parseInt(completedAttachments.rows[0].count),
      totalSupervisors: parseInt(totalSupervisors.rows[0].count),
      totalAdmins: parseInt(totalAdmins.rows[0].count)
    };

    return SuccessHandler("Admin statistics retrieved successfully", 200, res, stats);
  } catch (error) {
    console.error("Error getting admin stats:", error);
    return ErrorHandler("Error retrieving admin statistics", 500, res);
  }
};
// create method alert
const createAlert = (message) => {
  console.log(`ALERT: ${message}`);
  
}

// Get all supervisors
const getAllSupervisors = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, 
             COUNT(st.id) as total_students
      FROM school_supervisor s
      LEFT JOIN students st ON s.id = st.school_supervisor_id
      GROUP BY s.id
      ORDER BY s.name
    `);

    return SuccessHandler("Supervisors retrieved successfully", 200, res, result.rows);
  } catch (error) {
    console.error("Error getting supervisors:", error);
    return ErrorHandler("Error retrieving supervisors", 500, res);
  }
};

// Create supervisor
const createSupervisor = async (req, res) => {
  try {
    const { name, email, password, department, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password || !department) {
      return ErrorHandler("Please provide name, email, password, and department", 400, res);
    }

    // Check if supervisor already exists
    const existingSupervisor = await pool.query(
      "SELECT * FROM school_supervisor WHERE email = $1",
      [email]
    );

    if (existingSupervisor.rows.length > 0) {
      return ErrorHandler("Supervisor with this email already exists", 400, res);
    }

    // Hash password
    const bcrypt = require("bcryptjs");
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create supervisor
    const result = await pool.query(
      `INSERT INTO school_supervisor (name, email, password, department, phone, role) 
       VALUES ($1, $2, $3, $4, $5, 'school_supervisor') 
       RETURNING id, name, email, department, phone, role`,
      [name, email, hashedPassword, department, phone || null]
    );

    return SuccessHandler("Supervisor created successfully", 201, res, result.rows[0]);
  } catch (error) {
    console.error("Error creating supervisor:", error);
    return ErrorHandler("Error creating supervisor", 500, res);
  }
};

// Update supervisor
const updateSupervisor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, phone } = req.body;

    // Check if supervisor exists
    const existingSupervisor = await pool.query("SELECT * FROM school_supervisor WHERE id = $1", [id]);
    if (existingSupervisor.rows.length === 0) {
      return ErrorHandler("Supervisor not found", 404, res);
    }

    // Update supervisor
    const result = await pool.query(
      `UPDATE school_supervisor 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           department = COALESCE($3, department),
           phone = COALESCE($4, phone),
           updated_at = NOW()
       WHERE id = $5 
       RETURNING id, name, email, department, phone, role`,
      [name, email, department, phone, id]
    );

    return SuccessHandler("Supervisor updated successfully", 200, res, result.rows[0]);
  } catch (error) {
    console.error("Error updating supervisor:", error);
    return ErrorHandler("Error updating supervisor", 500, res);
  }
};

// Delete supervisor
const deleteSupervisor = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if supervisor has any students
    const students = await pool.query(
      "SELECT COUNT(*) FROM students WHERE school_supervisor_id = $1",
      [id]
    );

    if (parseInt(students.rows[0].count) > 0) {
      return ErrorHandler("Cannot delete supervisor with assigned students", 400, res);
    }

    // Delete supervisor
    const result = await pool.query("DELETE FROM school_supervisor WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return ErrorHandler("Supervisor not found", 404, res);
    }

    return SuccessHandler("Supervisor deleted successfully", 200, res);
  } catch (error) {
    console.error("Error deleting supervisor:", error);
    return ErrorHandler("Error deleting supervisor", 500, res);
  }
};

// Get system analytics
const getSystemAnalytics = async (req, res) => {
  try {
    // Get monthly application trends
    const monthlyApplications = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
      FROM applications 
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);

    // Get organization popularity
    const organizationStats = await pool.query(`
      SELECT 
        o.name,
        COUNT(a.id) as total_applications,
        COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_applications
      FROM organizations o
      LEFT JOIN applications a ON o.id = a.organization_id
      GROUP BY o.id, o.name
      ORDER BY total_applications DESC
      LIMIT 10
    `);

    // Get course distribution
    const courseDistribution = await pool.query(`
      SELECT 
        course,
        COUNT(*) as student_count
      FROM students
      GROUP BY course
      ORDER BY student_count DESC
    `);

    const analytics = {
      monthlyApplications: monthlyApplications.rows,
      organizationStats: organizationStats.rows,
      courseDistribution: courseDistribution.rows
    };

    return SuccessHandler("System analytics retrieved successfully", 200, res, analytics);
  } catch (error) {
    console.error("Error getting system analytics:", error);
    return ErrorHandler("Error retrieving system analytics", 500, res);
  }
};

// Get recent activities
const getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Get recent applications
    const recentApplications = await pool.query(`
      SELECT a.*, s.name as student_name, o.name as organization_name 
      FROM applications a 
      JOIN students s ON a.student_id = s.id 
      JOIN organizations o ON a.organization_id = o.id 
      ORDER BY a.created_at DESC 
      LIMIT $1
    `, [limit]);

    // Get recent reports
    const recentReports = await pool.query(`
      SELECT r.*, s.name as student_name 
      FROM reports r 
      JOIN students s ON r.student_id = s.id 
      ORDER BY r.created_at DESC 
      LIMIT $1
    `, [limit]);

    const activities = {
      applications: recentApplications.rows,
      reports: recentReports.rows
    };

    return SuccessHandler("Recent activities retrieved successfully", 200, res, activities);
  } catch (error) {
    console.error("Error getting recent activities:", error);
    return ErrorHandler("Error retrieving recent activities", 500, res);
  }
};

module.exports = {
  getAdminStats,
  getAllSupervisors,
  createSupervisor,
  updateSupervisor,
  deleteSupervisor,
  getSystemAnalytics,
  getRecentActivities
}; 