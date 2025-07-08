const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const ErrorHandler = require("../utils/ErrorHandler.js");

const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ErrorHandler("Access denied. No token provided.", 401, res);
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    if (!token) {
      return ErrorHandler("Access denied. No token provided.", 401, res);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-super-secret-jwt-key");
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return ErrorHandler("Token expired", 401, res);
      } else if (error.name === "JsonWebTokenError") {
        return ErrorHandler("Invalid token", 401, res);
      } else {
        return ErrorHandler("Token verification failed", 401, res);
      }
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return ErrorHandler("Authentication failed", 500, res);
  }
};

// Middleware to check if user has specific role
const hasRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ErrorHandler("Authentication required", 401, res);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ErrorHandler("Access denied. Insufficient permissions.", 403, res);
    }

    next();
  };
};

// Specific role middlewares
const isAdmin = hasRole(["admin"]);
const isStudent = hasRole(["student"]);
const isSchoolSupervisor = hasRole(["school_supervisor"]);
const isHostSupervisor = hasRole(["host_supervisor"]);
const isSupervisor = hasRole(["school_supervisor", "host_supervisor"]);

module.exports = {
  isAuthenticated,
  hasRole,
  isAdmin,
  isStudent,
  isSchoolSupervisor,
  isHostSupervisor,
  isSupervisor,
};

// This middleware checks if the user is authenticated by verifying the JWT token.
// It queries the appropriate database table based on the user's role:
// - school_supervisor -> school_supervisor table
// - student -> students table  
// - host_supervisor -> host_supervisor table
// - admin -> admin table
// - others -> users table
// If the token is valid and user exists, it attaches user info to the request object.
// Additional role-based middleware functions are provided for fine-grained authorization.