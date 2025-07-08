const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
  const { role, name, password, email } = req.body;
  
  try {
    // Input validation
    if (!role || !name || !password || !email) {
      return ErrorHandler("Please provide all required fields", 400, res);
    }

    // Hash password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    let result;
    
    // Insert into appropriate table based on role
    if (role === "host_supervisor") {
      result = await pool.query(
        "INSERT INTO host_supervisor (role, name, password, email) VALUES ($1, $2, $3, $4) RETURNING *",
        [role, name, hashedPassword, email]
      );
    } else if (role === "admin") {
      result = await pool.query(
        "INSERT INTO admin (role, name, password, email) VALUES ($1, $2, $3, $4) RETURNING *",
        [role, name, hashedPassword, email]
      );
    } else if (role === "school_supervisor") {
      result = await pool.query(
        "INSERT INTO school_supervisor (role, name, password, email) VALUES ($1, $2, $3, $4) RETURNING *",
        [role, name, hashedPassword, email]
      );
    } else if (role === "student") {
      result = await pool.query(
        "INSERT INTO students (role, name, password, email) VALUES ($1, $2, $3, $4) RETURNING *",
        [role, name, hashedPassword, email]
      );
    } else {
      result = await pool.query(
        "INSERT INTO users (role, name, password, email) VALUES ($1, $2, $3, $4) RETURNING *",
        [role, name, hashedPassword, email]
      );
    }

    // Remove password from response
    const user = result.rows[0];
    delete user.password;
    
    return SuccessHandler("User created successfully", 200, res, user);
  } catch (error) {
    console.error("Error while creating user", error);
    
    // Handle duplicate email error
    if (error.code === "23505") {
      return ErrorHandler("Email already exists", 400, res);
    }
    return ErrorHandler("Error while creating user", 500, res);
  }
};

const login = async (req, res) => {
  const { role, email, password } = req.body;

  console.log('LOGIN ATTEMPT:', { role, email });

  if (!email || !password || !role) {
    console.log('Missing email, password, or role');
    return ErrorHandler("Please provide email, password, and role", 401, res);
  }

  try {
    let result;
    
    // Query appropriate table based on role
    if (role === "school_supervisor") {
      result = await pool.query(
        "SELECT * FROM school_supervisor WHERE email = $1",
        [email]
      );
    } else if (role === "student") {
      result = await pool.query(
        "SELECT * FROM students WHERE email = $1",
        [email]
      );
    } else if (role === "host_supervisor") {
      result = await pool.query(
        "SELECT * FROM host_supervisor WHERE email = $1",
        [email]
      );
    } else if (role === "administrator") {
      result = await pool.query(
        "SELECT * FROM admin WHERE email = $1",
        [email]
      );
    } else {
      result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
    }

    const user = result.rows[0];
    console.log('User found:', user);

    if (!user) {
      console.log('No such user for email/role:', email, role);
      return ErrorHandler("No such user", 401, res);
    }

    // Compare password using bcrypt
    const isMatch = password === user.password || await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', password, user.password, isMatch);
    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return ErrorHandler("Invalid credentials", 401, res);
    }
    if (user.role !== role) {
      console.log('Role mismatch:', user.role, 'vs', role);
      return ErrorHandler("Invalid credentials", 401, res);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-super-secret-jwt-key",
      { expiresIn: process.env.JWT_EXPIRES_IN || "4h" }
    );

    // Remove password from user object
    const userResponse = { ...user };
    delete userResponse.password;
    
    console.log('Login successful for:', email);
    return SuccessHandler("User logged in successfully", 200, res, {
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Login error", error);
    return ErrorHandler("Error while logging in", 500, res);
  }
};

const getUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    
    let result;
    
    // Query appropriate table based on role
    if (role === "school_supervisor") {
      result = await pool.query(
        "SELECT id, name, email, role FROM school_supervisor WHERE id = $1",
        [userId]
      );
    } else if (role === "student") {
      result = await pool.query(
        "SELECT id, name, email, role FROM students WHERE id = $1",
        [userId]
      );
    } else if (role === "host_supervisor") {
      result = await pool.query(
        "SELECT id, name, email, role FROM host_supervisor WHERE id = $1",
        [userId]
      );
    } else if (role === "admin") {
      result = await pool.query(
        "SELECT id, name, email, role FROM admin WHERE id = $1",
        [userId]
      );
    } else {
      result = await pool.query(
        "SELECT id, name, email, role FROM users WHERE id = $1",
        [userId]
      );
    }

    const user = result.rows[0];
    if (!user) {
      return ErrorHandler("User not found", 404, res);
    }

    return SuccessHandler("User retrieved successfully", 200, res, user);
  } catch (error) {
    console.error("Error getting user", error);
    return ErrorHandler("Error while getting user", 500, res);
  }
};

const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // But we can return a success message
    return SuccessHandler("User logged out successfully", 200, res);
  } catch (error) {
    console.error("Logout error", error);
    return ErrorHandler("Error while logging out", 500, res);
  }
};

module.exports = {
  createUser,
  login,
  getUser,
  logout,
};
  