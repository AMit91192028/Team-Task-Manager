const { body, param } = require("express-validator");

const createTaskValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required")
    .isLength({ min: 3, max: 120 })
    .withMessage("Task title must be between 3 and 120 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("project")
    .notEmpty()
    .withMessage("Project id is required")
    .isMongoId()
    .withMessage("Invalid project id"),

  body()
    .custom((value, { req }) => {
      if (!req.body.assignedTo) {
        throw new Error("Assigned member email is required");
      }

      return true;
    }),

  body("assignedTo")
    .trim()
    .isEmail()
    .withMessage("Invalid assigned member email"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),

  body("dueDate")
    .notEmpty()
    .withMessage("Due date is required")
    .isISO8601()
    .withMessage("Due date must be a valid date")
];

const updateTaskValidation = [
  param("taskId")
    .isMongoId()
    .withMessage("Invalid task id"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage("Task title must be between 3 and 120 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("assignedTo")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid assigned member email"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date")
];

const updateTaskStatusValidation = [
  param("taskId")
    .isMongoId()
    .withMessage("Invalid task id"),

  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["todo", "in-progress", "completed"])
    .withMessage("Invalid task status")
];

const taskIdValidation = [
  param("taskId")
    .isMongoId()
    .withMessage("Invalid task id")
];

const projectTasksValidation = [
  param("projectId")
    .isMongoId()
    .withMessage("Invalid project id")
];

module.exports = {
  createTaskValidation,
  updateTaskValidation,
  updateTaskStatusValidation,
  taskIdValidation,
  projectTasksValidation
};
