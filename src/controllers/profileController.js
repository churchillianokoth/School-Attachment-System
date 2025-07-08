const pool = require("../config/db");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");
const bcrypt = require("bcryptjs");

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let result;
    
    // Query appropriate table based on role
    if (role === "school_supervisor") {
      result = await pool.query(
        "SELECT id, name, email, department, phone, role, created_at FROM school_supervisor WHERE id = $1",
        [userId]
      );
    } else if (role === "student") {
      result = await pool.query(
        "SELECT id, name, email, course, student_id, phone, role, created_at FROM students WHERE id = $1",
        [userId]
      );
    } else if (role === "host_supervisor") {
      result = await pool.query(
        "SELECT id, name, email, role, created_at FROM host_supervisor WHERE id = $1",
        [userId]
      );
    } else if (role === "admin") {
      result = await pool.query(
        "SELECT id, name, email, role, created_at FROM admin WHERE id = $1",
        [userId]
      );
    } else {
      result = await pool.query(
        "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
        [userId]
      );
    }

    if (result.rows.length === 0) {
      return ErrorHandler("Profile not found", 404, res);
    }

    return SuccessHandler("Profile retrieved successfully", 200, res, result.rows[0]);
  } catch (error) {
    console.error("Error getting profile:", error);
    return ErrorHandler("Error retrieving profile", 500, res);
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const { name, email, phone, department, course, student_id } = req.body;

    let result;

    // Update appropriate table based on role
    if (role === "school_supervisor") {
      result = await pool.query(
        `UPDATE school_supervisor 
         SET name = COALESCE($1, name),
             email = COALESCE($2, email),
             phone = COALESCE($3, phone),
             department = COALESCE($4, department),
             updated_at = NOW()
         WHERE id = $5 
         RETURNING id, name, email, department, phone, role`,
        [name, email, phone, department, userId]
      );
    } else if (role === "student") {
      result = await pool.query(
        `UPDATE students 
         SET name = COALESCE($1, name),
             email = COALESCE($2, email),
             phone = COALESCE($3, phone),
             course = COALESCE($4, course),
             student_id = COALESCE($5, student_id),
             updated_at = NOW()
         WHERE id = $6 
         RETURNING id, name, email, course, student_id, phone, role`,
        [name, email, phone, course, student_id, userId]
      );
    } else if (role === "host_supervisor") {
      result = await pool.query(
        `UPDATE host_supervisor 
         SET name = COALESCE($1, name),
             email = COALESCE($2, email),
             phone = COALESCE($3, phone),
             updated_at = NOW()
         WHERE id = $4 
         RETURNING id, name, email, phone, role`,
        [name, email, phone, userId]
      );
    } else if (role === "admin") {
      result = await pool.query(
        `UPDATE admin 
         SET name = COALESCE($1, name),
             email = COALESCE($2, email),
             updated_at = NOW()
         WHERE id = $3 
         RETURNING id, name, email, role`,
        [name, email, userId]
      );
    } else {
      result = await pool.query(
        `UPDATE users 
         SET name = COALESCE($1, name),
             email = COALESCE($2, email),
             phone = COALESCE($3, phone),
             updated_at = NOW()
         WHERE id = $4 
         RETURNING id, name, email, phone, role`,
        [name, email, phone, userId]
      );
    }

    if (result.rows.length === 0) {
      return ErrorHandler("Profile not found", 404, res);
    }

    return SuccessHandler("Profile updated successfully", 200, res, result.rows[0]);
  } catch (error) {
    console.error("Error updating profile:", error);
    return ErrorHandler("Error updating profile", 500, res);
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return ErrorHandler("Please provide current password and new password", 400, res);
    }

    if (newPassword.length < 6) {
      return ErrorHandler("New password must be at least 6 characters long", 400, res);
    }

    let userResult;
    
    // Get current user with password
    if (role === "school_supervisor") {
      userResult = await pool.query(
        "SELECT * FROM school_supervisor WHERE id = $1",
        [userId]
      );
    } else if (role === "student") {
      userResult = await pool.query(
        "SELECT * FROM students WHERE id = $1",
        [userId]
      );
    } else if (role === "host_supervisor") {
      userResult = await pool.query(
        "SELECT * FROM host_supervisor WHERE id = $1",
        [userId]
      );
    } else if (role === "admin") {
      userResult = await pool.query(
        "SELECT * FROM admin WHERE id = $1",
        [userId]
      );
    } else {
      userResult = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [userId]
      );
    }

    if (userResult.rows.length === 0) {
      return ErrorHandler("User not found", 404, res);
    }

    const user = userResult.rows[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return ErrorHandler("Current password is incorrect", 400, res);
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    let updateResult;
    if (role === "school_supervisor") {
      updateResult = await pool.query(
        "UPDATE school_supervisor SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role",
        [hashedNewPassword, userId]
      );
    } else if (role === "student") {
      updateResult = await pool.query(
        "UPDATE students SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role",
        [hashedNewPassword, userId]
      );
    } else if (role === "host_supervisor") {
      updateResult = await pool.query(
        "UPDATE host_supervisor SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role",
        [hashedNewPassword, userId]
      );
    } else if (role === "admin") {
      updateResult = await pool.query(
        "UPDATE admin SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role",
        [hashedNewPassword, userId]
      );
    } else {
      updateResult = await pool.query(
        "UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role",
        [hashedNewPassword, userId]
      );
    }

    return SuccessHandler("Password changed successfully", 200, res, updateResult.rows[0]);
  } catch (error) {
    console.error("Error changing password:", error);
    return ErrorHandler("Error changing password", 500, res);
  }
};

// Get user activity
const getUserActivity = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let activity = {};

    if (role === "student") {
      // Get student's applications and reports
      const [applications, reports] = await Promise.all([
        pool.query(`
          SELECT a.*, o.name as organization_name 
          FROM applications a 
          JOIN organizations o ON a.organization_id = o.id 
          WHERE a.student_id = $1 
          ORDER BY a.created_at DESC 
          LIMIT 10
        `, [userId]),
        pool.query(`
          SELECT * FROM reports 
          WHERE student_id = $1 
          ORDER BY created_at DESC 
          LIMIT 10
        `, [userId])
      ]);

      activity = {
        applications: applications.rows,
        reports: reports.rows
      };
    } else if (role === "school_supervisor") {
      // Get supervisor's students and their activities
      const [students, recentReports] = await Promise.all([
        pool.query(`
          SELECT s.*, 
                 COUNT(a.id) as total_applications,
                 COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_applications
          FROM students s 
          LEFT JOIN applications a ON s.id = a.student_id 
          WHERE s.school_supervisor_id = $1 
          GROUP BY s.id 
          ORDER BY s.name
        `, [userId]),
        pool.query(`
          SELECT r.*, s.name as student_name 
          FROM reports r 
          JOIN students s ON r.student_id = s.id 
          WHERE s.school_supervisor_id = $1 
          ORDER BY r.created_at DESC 
          LIMIT 10
        `, [userId])
      ]);

      activity = {
        students: students.rows,
        recentReports: recentReports.rows
      };
    } else if (role === "host_supervisor") {
      // Get host supervisor's organization and students
      const [organization, students] = await Promise.all([
        pool.query(`
          SELECT * FROM organizations 
          WHERE host_supervisor_id = $1
        `, [userId]),
        pool.query(`
          SELECT s.*, a.start_date, a.end_date 
          FROM students s 
          JOIN applications a ON s.id = a.student_id 
          WHERE a.organization_id = (SELECT id FROM organizations WHERE host_supervisor_id = $1) 
          AND a.status = 'approved'
          ORDER BY s.name
        `, [userId])
      ]);

      activity = {
        organization: organization.rows[0],
        students: students.rows
      };
    }

    return SuccessHandler("User activity retrieved successfully", 200, res, activity);
  } catch (error) {
    console.error("Error getting user activity:", error);
    return ErrorHandler("Error retrieving user activity", 500, res);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getUserActivity
}; 