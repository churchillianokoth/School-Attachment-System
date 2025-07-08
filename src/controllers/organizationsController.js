const pool = require("../config/db");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");

// Create new organization
const createOrganization = async (req, res) => {
  try {
    const { name, industry,  location, student_capacity, contact_person, email_address, phone_number, website, physical_address, description, student_requirements, benefits_offered } = req.body;

    // Validate required fields
    if (!name || !industry || !location || !student_capacity || !contact_person || !email_address) {
      return ErrorHandler("Please provide name, industry, location, student_capacity, contact_person, and email_address", 400, res);
    }

    // Check if organization already exists
    const existingOrg = await pool.query(
      "SELECT * FROM organizations WHERE name = $1 OR email_address = $2",
      [name, contact_email]
    );

    if (existingOrg.rows.length > 0) {
      return ErrorHandler("Organization with this name or email already exists", 400, res);
    }

    // Create organization
    const result = await pool.query(
      `INSERT INTO organizations (name, description, location, contact_person, contact_email, contact_phone, capacity) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [name, description, location, contact_person, contact_email, contact_phone || null, capacity || null]
    );

    return SuccessHandler("Organization created successfully", 201, res, result.rows[0]);
  } catch (error) {
    console.error("Error creating organization:", error);
    return ErrorHandler("Error creating organization", 500, res);
  }
};

// Get all organizations
const getAllOrganizations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM organizations o
      LEFT JOIN (SELECT organization_id, COUNT(*) as total_applications,
                        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_applications
                 FROM applications GROUP BY organization_id) a ON o.id = a.organization_id
    `);

    return SuccessHandler("Organizations retrieved successfully", 200, res, result.rows);
  } catch (error) {
    console.error("Error getting organizations:", error);
    return ErrorHandler("Error retrieving organizations", 500, res);
  }
};

// Get organization by ID
const getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT * FROM organizations
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return ErrorHandler("Organization not found", 404, res);
    }

    // Get students currently attached to this organization
    const students = await pool.query(`
      SELECT s.*, a.start_date, a.end_date, a.status as application_status
      FROM students s
      JOIN applications a ON s.id = a.student_id
      WHERE a.organization_id = $1 AND a.status = 'approved'
      ORDER BY s.name
    `, [id]);

    const organization = result.rows[0];
    organization.students = students.rows;

    return SuccessHandler("Organization retrieved successfully", 200, res, organization);
  } catch (error) {
    console.error("Error getting organization:", error);
    return ErrorHandler("Error retrieving organization", 500, res);
  }
};
// Assign student to organization
const assignStudentToOrganization = async (req, res) => {
  try {
    const { student_id, organization_id } = req.body;

    // Validate input
    if (!student_id || !organization_id) {
      return ErrorHandler("Please provide student_id and organization_id", 400, res);
    }

    // Check if student exists
    const student = await pool.query("SELECT * FROM students WHERE id = $1", [student_id]);
    if (student.rows.length === 0) {
      return ErrorHandler("Student not found", 404, res);
    }

    // Check if organization exists
    const organization = await pool.query("SELECT * FROM organizations WHERE id = $1", [organization_id]);
    if (organization.rows.length === 0) {
      return ErrorHandler("Organization not found", 404, res);
    }

    // Check if student is already assigned to this organization
    const existingApplication = await pool.query(
      "SELECT * FROM applications WHERE student_id = $1 AND organization_id = $2",
      [student_id, organization_id]
    );

    if (existingApplication.rows.length > 0) {
      return ErrorHandler("Student is already assigned to this organization", 400, res);
    }

    // Create application to assign student to organization
    const result = await pool.query(
      `INSERT INTO applications (student_id, organization_id, status) 
       VALUES ($1, $2, 'pending') 
       RETURNING *`,
      [student_id, organization_id]
    );

    return SuccessHandler("Student assigned to organization successfully", 201, res, result.rows[0]);
  } catch (error) {
    console.error("Error assigning student to organization:", error);
    return ErrorHandler("Error assigning student to organization", 500, res);
  }
}

// Update organization
const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location, contact_person, contact_email, contact_phone, capacity } = req.body;

    // Check if organization exists
    const existingOrg = await pool.query("SELECT * FROM organizations WHERE id = $1", [id]);
    if (existingOrg.rows.length === 0) {
      return ErrorHandler("Organization not found", 404, res);
    }

    // Update organization
    const result = await pool.query(
      `UPDATE organizations 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           location = COALESCE($3, location),
           contact_person = COALESCE($4, contact_person),
           contact_email = COALESCE($5, contact_email),
           contact_phone = COALESCE($6, contact_phone),
           capacity = COALESCE($7, capacity),
           updated_at = NOW()
       WHERE id = $8 
       RETURNING *`,
      [name, description, location, contact_person, contact_email, contact_phone, capacity, id]
    );

    return SuccessHandler("Organization updated successfully", 200, res, result.rows[0]);
  } catch (error) {
    console.error("Error updating organization:", error);
    return ErrorHandler("Error updating organization", 500, res);
  }
};

// Delete organization
const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if organization has any approved applications
    const applications = await pool.query(
      "SELECT COUNT(*) FROM applications WHERE organization_id = $1 AND status = 'approved'",
      [id]
    );

    if (parseInt(applications.rows[0].count) > 0) {
      return ErrorHandler("Cannot delete organization with active students", 400, res);
    }

    // Delete organization
    const result = await pool.query("DELETE FROM organizations WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return ErrorHandler("Organization not found", 404, res);
    }

    return SuccessHandler("Organization deleted successfully", 200, res);
  } catch (error) {
    console.error("Error deleting organization:", error);
    return ErrorHandler("Error deleting organization", 500, res);
  }
};

// Search organizations
const searchOrganizations = async (req, res) => {
  try {
    const { query, location } = req.query;

    let sql = `
      SELECT o.*, 
             COUNT(a.id) as total_applications,
             COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_applications
      FROM organizations o
      LEFT JOIN applications a ON o.id = a.organization_id
    `;

    const conditions = [];
    const params = [];
    let paramCount = 0;

    if (query) {
      paramCount++;
      conditions.push(`(o.name ILIKE $${paramCount} OR o.description ILIKE $${paramCount})`);
      params.push(`%${query}%`);
    }

    if (location) {
      paramCount++;
      conditions.push(`o.location ILIKE $${paramCount}`);
      params.push(`%${location}%`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` GROUP BY o.id ORDER BY o.name`;

    const result = await pool.query(sql, params);

    return SuccessHandler("Organizations search completed", 200, res, result.rows);
  } catch (error) {
    console.error("Error searching organizations:", error);
    return ErrorHandler("Error searching organizations", 500, res);
  }
};
// Remove student from organization
const removeStudentFromOrganization = async (req, res) => {
  try {
    const { student_id, organization_id } = req.body;

    // Validate input
    if (!student_id || !organization_id) {
      return ErrorHandler("Please provide student_id and organization_id", 400, res);
    }

    // Check if application exists
    const application = await pool.query(
      "SELECT * FROM applications WHERE student_id = $1 AND organization_id = $2",
      [student_id, organization_id]
    );

    if (application.rows.length === 0) {
      return ErrorHandler("Student is not assigned to this organization", 404, res);
    }

    // Delete application
    await pool.query(
      "DELETE FROM applications WHERE student_id = $1 AND organization_id = $2",
      [student_id, organization_id]
    );

    return SuccessHandler("Student removed from organization successfully", 200, res);
  } catch (error) {
    console.error("Error removing student from organization:", error);
    return ErrorHandler("Error removing student from organization", 500, res);
  }
};

module.exports = {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  assignStudentToOrganization,
  removeStudentFromOrganization,
  searchOrganizations
}; 