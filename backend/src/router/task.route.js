const express = require("express");

const {
  createTask,
  getTasks,
  getMyTasks,
  getTasksByProject,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask
} = require("../controllers/task.controller");

const {
  createTaskValidation,
  updateTaskValidation,
  updateTaskStatusValidation,
  taskIdValidation,
  projectTasksValidation
} = require("../validations/taskValidation");

const validate = require("../middlewares/validate.middleware");
const { authMiddleware } = require("../middlewares/auth.Middleware");
const { adminOnly } = require("../middlewares/role.middleware");

const router = express.Router();

router
  .route("/")
  .post(authMiddleware, adminOnly, createTaskValidation, validate, createTask)
  .get(authMiddleware, getTasks);

router.get("/my-tasks", authMiddleware, getMyTasks);

router.get(
  "/project/:projectId",
  authMiddleware,
  projectTasksValidation,
  validate,
  getTasksByProject
);

router
  .route("/:taskId")
  .get(authMiddleware, taskIdValidation, validate, getTaskById)
  .put(authMiddleware, adminOnly, updateTaskValidation, validate, updateTask)
  .delete(authMiddleware, adminOnly, taskIdValidation, validate, deleteTask);

router.patch(
  "/:taskId/status",
  authMiddleware,
  updateTaskStatusValidation,
  validate,
  updateTaskStatus
);

module.exports = router;
