const pool = require("../config/db");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");

// Admin Dashboard
const getAdminDashboard = async (req, res) => {
  try {
    // Get statistics for admin dashboard
    const [
      totalStudents,
      totalOrganizations,
      totalApplications,
      totalReports,
      pendingApplications,
      completedAttachments
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM students"),
      pool.query("SELECT COUNT(*) FROM organizations"),
      pool.query("SELECT COUNT(*) FROM applications"),
      pool.query("SELECT COUNT(*) FROM reports"),
      pool.query("SELECT COUNT(*) FROM applications WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM applications WHERE status = 'completed'")
    ]);

    // Get recent activities
    const recentApplications = await pool.query(`
      SELECT a.*, s.name as student_name, o.name as organization_name 
      FROM applications a 
      JOIN students s ON a.student_id = s.id 
      JOIN organizations o ON a.organization_id = o.id 
      ORDER BY a.created_at DESC 
      LIMIT 5
    `);

    const recentReports = await pool.query(`
      SELECT r.*, s.name as student_name 
      FROM reports r 
      JOIN students s ON r.student_id = s.id 
      ORDER BY r.created_at DESC 
      LIMIT 5
    `);

    const dashboardData = {
      statistics: {
        totalStudents: parseInt(totalStudents.rows[0].count),
        totalOrganizations: parseInt(totalOrganizations.rows[0].count),
        totalApplications: parseInt(totalApplications.rows[0].count),
        totalReports: parseInt(totalReports.rows[0].count),
        pendingApplications: parseInt(pendingApplications.rows[0].count),
        completedAttachments: parseInt(completedAttachments.rows[0].count)
      },
      recentActivities: {
        applications: recentApplications.rows,
        reports: recentReports.rows
      }
    };

    return SuccessHandler("Admin dashboard data retrieved successfully", 200, res, dashboardData);
  } catch (error) {
    console.error("Error getting admin dashboard:", error);
    return ErrorHandler("Error retrieving admin dashboard data", 500, res);
  }
};

// Student Dashboard
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.userId;

    // Get student's applications
    const applications = await pool.query(`
      SELECT a.*, o.name as organization_name, o.location 
      FROM applications a 
      JOIN organizations o ON a.organization_id = o.id 
      WHERE a.student_id = $1 
      ORDER BY a.created_at DESC
    `, [studentId]);

    // Get student's reports
    const reports = await pool.query(`
      SELECT * FROM reports 
      WHERE student_id = $1 
      ORDER BY created_at DESC
    `, [studentId]);

    // Get student's profile
    const studentProfile = await pool.query(`
      SELECT id, name, email, role, course, student_id, phone 
      FROM students 
      WHERE id = $1
    `, [studentId]);

    // Get statistics
    const [
      totalApplications,
      approvedApplications,
      pendingApplications,
      totalReports
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM applications WHERE student_id = $1", [studentId]),
      pool.query("SELECT COUNT(*) FROM applications WHERE student_id = $1 AND status = 'approved'", [studentId]),
      pool.query("SELECT COUNT(*) FROM applications WHERE student_id = $1 AND status = 'pending'", [studentId]),
      pool.query("SELECT COUNT(*) FROM reports WHERE student_id = $1", [studentId])
    ]);

    const dashboardData = {
      profile: studentProfile.rows[0],
      statistics: {
        totalApplications: parseInt(totalApplications.rows[0].count),
        approvedApplications: parseInt(approvedApplications.rows[0].count),
        pendingApplications: parseInt(pendingApplications.rows[0].count),
        totalReports: parseInt(totalReports.rows[0].count)
      },
      applications: applications.rows,
      reports: reports.rows
    };

    return SuccessHandler("Student dashboard data retrieved successfully", 200, res, dashboardData);
  } catch (error) {
    console.error("Error getting student dashboard:", error);
    return ErrorHandler("Error retrieving student dashboard data", 500, res);
  }
};

// School Supervisor Dashboard
const getSchoolSupervisorDashboard = async (req, res) => {
  try {
    const supervisorId = req.user.userId;

    // Get students under this supervisor
    const students = await pool.query(`
      SELECT s.*, 
             COUNT(a.id) as total_applications,
             COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_applications
      FROM students s 
      LEFT JOIN applications a ON s.id = a.student_id 
      WHERE s.school_supervisor_id = $1 
      GROUP BY s.id 
      ORDER BY s.name
    `, [supervisorId]);

    // Get recent reports from supervised students
    const recentReports = await pool.query(`
      SELECT r.*, s.name as student_name 
      FROM reports r 
      JOIN students s ON r.student_id = s.id 
      WHERE s.school_supervisor_id = $1 
      ORDER BY r.created_at DESC 
      LIMIT 10
    `, [supervisorId]);

    // Get pending evaluations
    const pendingEvaluations = await pool.query(`
      SELECT e.*, s.name as student_name, o.name as organization_name 
      FROM evaluations e 
      JOIN students s ON e.student_id = s.id 
      JOIN organizations o ON e.organization_id = o.id 
      WHERE s.school_supervisor_id = $1 AND e.status = 'pending' 
      ORDER BY e.created_at DESC
    `, [supervisorId]);

    // Get statistics
    const [
      totalStudents,
      totalReports,
      pendingEvaluationsCount,
      completedEvaluationsCount
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM students WHERE school_supervisor_id = $1", [supervisorId]),
      pool.query(`
        SELECT COUNT(*) FROM reports r 
        JOIN students s ON r.student_id = s.id 
        WHERE s.school_supervisor_id = $1
      `, [supervisorId]),
      pool.query(`
        SELECT COUNT(*) FROM evaluations e 
        JOIN students s ON e.student_id = s.id 
        WHERE s.school_supervisor_id = $1 AND e.status = 'pending'
      `, [supervisorId]),
      pool.query(`
        SELECT COUNT(*) FROM evaluations e 
        JOIN students s ON e.student_id = s.id 
        WHERE s.school_supervisor_id = $1 AND e.status = 'completed'
      `, [supervisorId])
    ]);

    const dashboardData = {
      statistics: {
        totalStudents: parseInt(totalStudents.rows[0].count),
        totalReports: parseInt(totalReports.rows[0].count),
        pendingEvaluations: parseInt(pendingEvaluationsCount.rows[0].count),
        completedEvaluations: parseInt(completedEvaluationsCount.rows[0].count)
      },
      students: students.rows,
      recentReports: recentReports.rows,
      pendingEvaluations: pendingEvaluations.rows
    };

    return SuccessHandler("School supervisor dashboard data retrieved successfully", 200, res, dashboardData);
  } catch (error) {
    console.error("Error getting school supervisor dashboard:", error);
    return ErrorHandler("Error retrieving school supervisor dashboard data", 500, res);
  }
};

// Host Supervisor Dashboard
const getHostSupervisorDashboard = async (req, res) => {
  try {
    const supervisorId = req.user.userId;

    // Get organization details
    const organization = await pool.query(`
      SELECT * FROM organizations 
      WHERE host_supervisor_id = $1
    `, [supervisorId]);

    // Get students assigned to this organization
    const students = await pool.query(`
      SELECT s.*, a.status as application_status, a.start_date, a.end_date 
      FROM students s 
      JOIN applications a ON s.id = a.student_id 
      WHERE a.organization_id = (SELECT id FROM organizations WHERE host_supervisor_id = $1) 
      AND a.status = 'approved'
      ORDER BY s.name
    `, [supervisorId]);

    // Get attendance records
    const attendanceRecords = await pool.query(`
      SELECT a.*, s.name as student_name 
      FROM attendance a 
      JOIN students s ON a.student_id = s.id 
      WHERE a.organization_id = (SELECT id FROM organizations WHERE host_supervisor_id = $1) 
      ORDER BY a.date DESC 
      LIMIT 20
    `, [supervisorId]);

    // Get evaluations to complete
    const pendingEvaluations = await pool.query(`
      SELECT e.*, s.name as student_name 
      FROM evaluations e 
      JOIN students s ON e.student_id = s.id 
      WHERE e.organization_id = (SELECT id FROM organizations WHERE host_supervisor_id = $1) 
      AND e.status = 'pending' 
      ORDER BY e.created_at DESC
    `, [supervisorId]);

    // Get statistics
    const [
      totalStudents,
      totalAttendanceRecords,
      pendingEvaluationsCount,
      completedEvaluationsCount
    ] = await Promise.all([
      pool.query(`
        SELECT COUNT(*) FROM students s 
        JOIN applications a ON s.id = a.student_id 
        WHERE a.organization_id = (SELECT id FROM organizations WHERE host_supervisor_id = $1) 
        AND a.status = 'approved'
      `, [supervisorId]),
      pool.query(`
        SELECT COUNT(*) FROM attendance 
        WHERE organization_id = (SELECT id FROM organizations WHERE host_supervisor_id = $1)
      `, [supervisorId]),
      pool.query(`
        SELECT COUNT(*) FROM evaluations 
        WHERE organization_id = (SELECT id FROM organizations WHERE host_supervisor_id = $1) 
        AND status = 'pending'
      `, [supervisorId]),
      pool.query(`
        SELECT COUNT(*) FROM evaluations 
        WHERE organization_id = (SELECT id FROM organizations WHERE host_supervisor_id = $1) 
        AND status = 'completed'
      `, [supervisorId])
    ]);

    const dashboardData = {
      organization: organization.rows[0],
      statistics: {
        totalStudents: parseInt(totalStudents.rows[0].count),
        totalAttendanceRecords: parseInt(totalAttendanceRecords.rows[0].count),
        pendingEvaluations: parseInt(pendingEvaluationsCount.rows[0].count),
        completedEvaluations: parseInt(completedEvaluationsCount.rows[0].count)
      },
      students: students.rows,
      attendanceRecords: attendanceRecords.rows,
      pendingEvaluations: pendingEvaluations.rows
    };

    return SuccessHandler("Host supervisor dashboard data retrieved successfully", 200, res, dashboardData);
  } catch (error) {
    console.error("Error getting host supervisor dashboard:", error);
    return ErrorHandler("Error retrieving host supervisor dashboard data", 500, res);
  }
};

module.exports = {
  getAdminDashboard,
  getStudentDashboard,
  getSchoolSupervisorDashboard,
  getHostSupervisorDashboard
}; 