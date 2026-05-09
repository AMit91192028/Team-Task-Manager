const Task = require("../models/Task.model");
const Project = require("../models/Project.model");
const User = require("../models/User.model");

function sendControllerError(res, error) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Internal Server Error"
  });
}

async function resolveAssignedMember({ assignedTo, project }) {
  const normalizedEmail = assignedTo ? assignedTo.toLowerCase().trim() : null;
  const assignedUser = await User.findOne({ email: normalizedEmail });

  if (!assignedUser) {
    return {
      error: {
        status: 404,
        message: "Assigned member not found"
      }
    };
  }

  if (assignedUser.role !== "member") {
    return {
      error: {
        status: 400,
        message: "Tasks can only be assigned to member accounts"
      }
    };
  }

  const isProjectMember = project.members.some(
    (memberId) => memberId.toString() === assignedUser._id.toString()
  );

  if (!isProjectMember) {
    return {
      error: {
        status: 400,
        message: "Assigned member must be part of this project"
      }
    };
  }

  return { assignedUser };
}

async function createTask(req, res) {
  try {
    const { title, description, project, assignedTo, priority, dueDate } = req.body;
    const foundProject = await Project.findById(project);

    if (!foundProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    if (foundProject.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only project creator can create task"
      });
    }

    const { assignedUser, error } = await resolveAssignedMember({
      assignedTo,
      project: foundProject
    });

    if (error) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo: assignedUser._id,
      createdBy: req.user._id,
      priority,
      dueDate
    });

    const populatedTask = await Task.findById(task._id)
      .populate("project", "name status")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role");

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: populatedTask
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
}

async function getTasks(req, res) {
  try {
    let tasks;

    if (req.user.role === "admin") {
      const projects = await Project.find({ createdBy: req.user._id }).select("_id");
      const projectIds = projects.map((project) => project._id);

      tasks = await Task.find({ project: { $in: projectIds } })
        .populate("project", "name status")
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 });
    } else {
      tasks = await Task.find({ assignedTo: req.user._id })
        .populate("project", "name status")
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
}

async function getMyTasks(req, res) {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate("project", "name status")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .sort({ dueDate: 1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
}

async function getTasksByProject(req, res) {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const isOwner = project.createdBy.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view tasks of this project"
      });
    }

    const taskQuery =
      req.user.role === "admin"
        ? { project: req.params.projectId }
        : { project: req.params.projectId, assignedTo: req.user._id };

    const tasks = await Task.find(taskQuery)
      .populate("project", "name status")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
}

async function getTaskById(req, res) {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate("project", "name status createdBy members")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    const isCreator = task.createdBy._id.toString() === req.user._id.toString();
    const isAssignedUser = task.assignedTo._id.toString() === req.user._id.toString();

    if (req.user.role === "member" && !isAssignedUser) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this task"
      });
    }

    if (req.user.role === "admin" && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this task"
      });
    }

    return res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
}

async function updateTask(req, res) {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only project creator can update task"
      });
    }

    if (assignedTo) {
      const { assignedUser, error } = await resolveAssignedMember({
        assignedTo,
        project
      });

      if (error) {
        return res.status(error.status).json({
          success: false,
          message: error.message
        });
      }

      task.assignedTo = assignedUser._id;
    }

    task.title = title || task.title;
    task.description = description ?? task.description;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("project", "name status")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role");

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
}

async function updateTaskStatus(req, res) {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    const isAssignedUser = task.assignedTo.toString() === req.user._id.toString();
    const isCreator = task.createdBy.toString() === req.user._id.toString();

    if (req.user.role === "member" && !isAssignedUser) {
      return res.status(403).json({
        success: false,
        message: "Only assigned member can update task status"
      });
    }

    if (req.user.role === "admin" && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "Only assigned user or creator can update task status"
      });
    }

    task.status = status;
    task.completedAt = status === "completed" ? new Date() : null;

    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      task
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
}

async function deleteTask(req, res) {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only project creator can delete task"
      });
    }

    await task.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully"
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
}

module.exports = {
  createTask,
  getTasks,
  getMyTasks,
  getTasksByProject,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask
};
