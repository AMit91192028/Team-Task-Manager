const express = require("express");

const {
  getDashboardSummary,
  getOverdueTasks,
  getTaskStatusCount
} = require("../controllers/dashboard.controller");

const { authMiddleware } = require("../middlewares/auth.Middleware");

const router = express.Router();

router.get("/summary", authMiddleware, getDashboardSummary);
router.get("/overdue", authMiddleware, getOverdueTasks);
router.get("/task-status", authMiddleware, getTaskStatusCount);

module.exports = router;
