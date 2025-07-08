const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
const router = require("./router");
const ApiError = require("./utils/ApiError");
const dotenv = require("dotenv");
const pool = require("./config/db");

dotenv.config({path: "./config/.env"});

const allowOrigins = [
  "http://localhost:3000", // for development
  "http://localhost:5173", // Vite dev server
  "http://localhost:8080",
   "http://localhost:8081",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api", router);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "School Attachment System API is running!" });
});

// Test database connection
// app.get("/api/health", async (req, res) => {
//   try {
//     const result = await pool.query('SELECT NOW()');
//     res.json({ 
//       message: "API is healthy", 
//       database: "connected",
//       timestamp: result.rows[0].now 
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       message: "API is unhealthy", 
//       database: "disconnected",
//       error: error.message 
//     });
//   }
// });

// 404 handler
app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"));
});

// Global error handler
// app.use((error, req, res, next) => {
//   const statusCode = error.statusCode || 500;
//   const message = error.message || "Internal Server Error";
  
//   res.status(statusCode).json({
//     success: false,
//     message,
//     ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
//   });
// });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});