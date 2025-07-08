const pool = require("../config/db");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `);

    return SuccessHandler("Users retrieved successfully", 200, res, result.rows);
  } catch (error) {
    console.error("Error getting users:", error);
    return ErrorHandler("Error retrieving users", 500, res);
  }
};

// Get user by ID (admin only)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return ErrorHandler("User not found", 404, res);
    }

    return SuccessHandler("User retrieved successfully", 200, res, result.rows[0]);
  } catch (error) {
    console.error("Error getting user:", error);
    return ErrorHandler("Error retrieving user", 500, res);
  }
};

// Create user (admin only)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return ErrorHandler("Please provide name, email, password, and role", 400, res);
    }

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return ErrorHandler("User with this email already exists", 400, res);
    }

    // Hash password
    const bcrypt = require("bcryptjs");
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword, role]
    );

    return SuccessHandler("User created successfully", 201, res, result.rows[0]);
  } catch (error) {
    console.error("Error creating user:", error);
    return ErrorHandler("Error creating user", 500, res);
  }
};

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Check if user exists
    const existingUser = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (existingUser.rows.length === 0) {
      return ErrorHandler("User not found", 404, res);
    }

    // Update user
    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           role = COALESCE($3, role),
           updated_at = NOW()
       WHERE id = $4 
       RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, role, id]
    );

    return SuccessHandler("User updated successfully", 200, res, result.rows[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    return ErrorHandler("Error updating user", 500, res);
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (existingUser.rows.length === 0) {
      return ErrorHandler("User not found", 404, res);
    }

    // Delete user
    await pool.query("DELETE FROM users WHERE id = $1", [id]);

    return SuccessHandler("User deleted successfully", 200, res);
  } catch (error) {
    console.error("Error deleting user:", error);
    return ErrorHandler("Error deleting user", 500, res);
  }
};

// Search users (admin only)
const searchUsers = async (req, res) => {
  try {
    const { query, role } = req.query;

    let sql = "SELECT id, name, email, role, created_at, updated_at FROM users";
    const conditions = [];
    const params = [];
    let paramCount = 0;

    if (query) {
      paramCount++;
      conditions.push(`(name ILIKE $${paramCount} OR email ILIKE $${paramCount})`);
      params.push(`%${query}%`);
    }

    if (role) {
      paramCount++;
      conditions.push(`role = $${paramCount}`);
      params.push(role);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await pool.query(sql, params);

    return SuccessHandler("Users search completed", 200, res, result.rows);
  } catch (error) {
    console.error("Error searching users:", error);
    return ErrorHandler("Error searching users", 500, res);
  }
};

// Get user statistics (admin only)
const getUserStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      usersByRole
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COUNT(*) FROM users WHERE updated_at >= NOW() - INTERVAL '30 days'"),
      pool.query("SELECT role, COUNT(*) FROM users GROUP BY role")
    ]);

    const stats = {
      totalUsers: parseInt(totalUsers.rows[0].count),
      activeUsers: parseInt(activeUsers.rows[0].count),
      usersByRole: usersByRole.rows
    };

    return SuccessHandler("User statistics retrieved successfully", 200, res, stats);
  } catch (error) {
    console.error("Error getting user stats:", error);
    return ErrorHandler("Error retrieving user statistics", 500, res);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  getUserStats
};