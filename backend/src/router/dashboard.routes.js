const express = require("express");

const {
  getDashboardSummary,
  getOverdueTasks,
  getTaskStatusCount,
  getMemberProgress
} = require("../controllers/dashboard.controller");

const { authMiddleware } = require("../middlewares/auth.Middleware");
const { adminOnly } = require("../middlewares/role.middleware");

const router = express.Router();

router.get("/summary", authMiddleware, getDashboardSummary);
router.get("/overdue", authMiddleware, getOverdueTasks);
router.get("/task-status", authMiddleware, getTaskStatusCount);
router.get("/member-progress", authMiddleware, adminOnly, getMemberProgress);

module.exports = router;
