const Project = require("../models/Project.model");
const User = require("../models/User.model");
const Task = require("../models/Task.model");

function sendControllerError(res, error) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Internal Server Error"
  });
}

async function createProject(req, res) {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id]
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
}

async function getProjects(req, res) {
  try {
    const query =
      req.user.role === "admin"
        ? { createdBy: req.user._id }
        : { members: req.user._id };

    const projects = await Project.find(query)
      .populate("createdBy", "name email role")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
}

async function getProjectById(req, res) {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate("createdBy", "name email role")
      .populate("members", "name email role");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const isOwner = project.createdBy._id.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (member) => member._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this project"
      });
    }

    return res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
}

async function updateProject(req, res) {
  try {
    const { name, description, status } = req.body;
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only project creator can update this project"
      });
    }

    project.name = name || project.name;
    project.description = description ?? project.description;
    project.status = status || project.status;

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
}

async function deleteProject(req, res) {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only project creator can delete this project"
      });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Project and related tasks deleted successfully"
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
}

async function addMemberToProject(req, res) {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only project creator can add members"
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || user.role !== "member") {
      return res.status(400).json({
        success: false,
        message: "No member account found with this email"
      });
    }

    const alreadyMember = project.members.some(
      (memberId) => memberId.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a project member"
      });
    }

    project.members.push(user._id);
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate("createdBy", "name email role")
      .populate("members", "name email role");

    return res.status(200).json({
      success: true,
      message: "Member added successfully",
      project: updatedProject
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
}

async function removeMemberFromProject(req, res) {
  try {
    const { projectId, userId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only project creator can remove members"
      });
    }

    project.members = project.members.filter(
      (memberId) => memberId.toString() !== userId
    );

    await project.save();

    await Task.deleteMany({
      project: projectId,
      assignedTo: userId
    });

    return res.status(200).json({
      success: true,
      message: "Member removed and assigned tasks deleted successfully"
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
}

async function getProjectMembers(req, res) {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate("members", "name email role");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const isOwner = project.createdBy.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (member) => member._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view members"
      });
    }

    return res.status(200).json({
      success: true,
      members: project.members
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
}

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMemberToProject,
  removeMemberFromProject,
  getProjectMembers
};
