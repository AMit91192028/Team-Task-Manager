const express = require("express");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMemberToProject,
  removeMemberFromProject,
  getProjectMembers
} = require("../controllers/project.controller");

const {
  createProjectValidation,
  updateProjectValidation,
  projectIdValidation,
  addMemberValidation,
  removeMemberValidation
} = require("../validations/projectValidation");

const validate = require("../middlewares/validate.middleware");
const { authMiddleware } = require("../middlewares/auth.Middleware");
const { adminOnly } = require("../middlewares/role.middleware");

const router = express.Router();

router
  .route("/")
  .post(authMiddleware,adminOnly, createProjectValidation, validate, createProject)
  .get(authMiddleware, getProjects);

router
  .route("/:projectId")
  .get(authMiddleware, projectIdValidation, validate, getProjectById)
  .put(authMiddleware, adminOnly, updateProjectValidation, validate, updateProject)
  .delete(authMiddleware, adminOnly, projectIdValidation, validate, deleteProject);

router
  .route("/:projectId/members")
  .get(authMiddleware, projectIdValidation, validate, getProjectMembers)
  .post(authMiddleware, adminOnly, addMemberValidation, validate, addMemberToProject);

router
  .route("/:projectId/members/:userId")
  .delete(authMiddleware, adminOnly, removeMemberValidation, validate, removeMemberFromProject);

module.exports = router;
