const router = require("express").Router();
const users = require("./users");
const auth = require("./auth");
const reports = require("./reports");
const supervisor = require("./supervisor");
const profile = require("./profile");
const students = require("./students");
const admin = require("./admin");
const dashboard = require("./dashboard");
const applications = require("./applications");
const organizations = require("./organizations");

// API Routes
router.use("/users", users);
router.use("/auth", auth);
router.use("/reports", reports);
router.use("/supervisor", supervisor);
router.use("/profile", profile);
router.use("/students", students);
router.use("/admin", admin);
router.use("/dashboard", dashboard);
router.use("/applications", applications);
router.use("/organizations", organizations);

// 404 handler for API routes
router.use((req, res, next) => {
  res.status(404).json({ message: "API endpoint not found" });
});

module.exports = router;