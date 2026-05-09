const { body, param } = require("express-validator");

const createProjectValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Project name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Project name must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters")
];

const updateProjectValidation = [
  param("projectId")
    .isMongoId()
    .withMessage("Invalid project id"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Project name must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("status")
    .optional()
    .isIn(["active", "completed", "archived"])
    .withMessage("Invalid project status")
];

const projectIdValidation = [
  param("projectId")
    .isMongoId()
    .withMessage("Invalid project id")
];

const addMemberValidation = [
  param("projectId")
    .isMongoId()
    .withMessage("Invalid project id"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Member email is required")
    .isEmail()
    .withMessage("Invalid email address")
];

const removeMemberValidation = [
  param("projectId")
    .isMongoId()
    .withMessage("Invalid project id"),

  param("userId")
    .isMongoId()
    .withMessage("Invalid user id")
];

module.exports = {
  createProjectValidation,
  updateProjectValidation,
  projectIdValidation,
  addMemberValidation,
  removeMemberValidation
};
