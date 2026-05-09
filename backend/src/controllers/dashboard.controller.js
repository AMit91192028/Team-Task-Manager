const Task = require("../models/Task.model");
const Project = require("../models/Project.model");

function sendControllerError(res, error) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Internal Server Error"
  });
}

async function getDashboardSummary(req, res) {
  try {
    let projectFilter;
    let taskFilter;

    if (req.user.role === "admin") {
      const projects = await Project.find({ createdBy: req.user._id }).select("_id");
      const projectIds = projects.map((project) => project._id);
      projectFilter = { createdBy: req.user._id };
      taskFilter = { project: { $in: projectIds } };
    } else {
      const projects = await Project.find({ members: req.user._id }).select("_id");
      const projectIds = projects.map((project) => project._id);
      projectFilter = { members: req.user._id };
      taskFilter = { assignedTo: req.user._id, project: { $in: projectIds } };
    }

    const totalProjects = await Project.countDocuments(projectFilter);
    const totalTasks = await Task.countDocuments(taskFilter);
    const todoTasks = await Task.countDocuments({ ...taskFilter, status: "todo" });
    const inProgressTasks = await Task.countDocuments({
      ...taskFilter,
      status: "in-progress"
    });
    const completedTasks = await Task.countDocuments({
      ...taskFilter,
      status: "completed"
    });
    const overdueTasks = await Task.countDocuments({
      ...taskFilter,
      dueDate: { $lt: new Date() },
      status: { $ne: "completed" }
    });

    return res.status(200).json({
      success: true,
      summary: {
        totalProjects,
        totalTasks,
        todoTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks
      }
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
}

async function getOverdueTasks(req, res) {
  try {
    const taskFilter = {
      dueDate: { $lt: new Date() },
      status: { $ne: "completed" }
    };

    if (req.user.role === "admin") {
      const projects = await Project.find({ createdBy: req.user._id }).select("_id");
      const projectIds = projects.map((project) => project._id);
      taskFilter.project = { $in: projectIds };
    } else {
      const projects = await Project.find({ members: req.user._id }).select("_id");
      const projectIds = projects.map((project) => project._id);
      taskFilter.assignedTo = req.user._id;
      taskFilter.project = { $in: projectIds };
    }

    const tasks = await Task.find(taskFilter)
      .populate("project", "name status")
      .populate("assignedTo", "name email role")
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

async function getTaskStatusCount(req, res) {
  try {
    let taskFilter;

    if (req.user.role === "admin") {
      const projects = await Project.find({ createdBy: req.user._id }).select("_id");
      const projectIds = projects.map((project) => project._id);
      taskFilter = { project: { $in: projectIds } };
    } else {
      const projects = await Project.find({ members: req.user._id }).select("_id");
      const projectIds = projects.map((project) => project._id);
      taskFilter = { assignedTo: req.user._id, project: { $in: projectIds } };
    }

    const statusCount = await Task.aggregate([
      {
        $match: taskFilter
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      todo: 0,
      inProgress: 0,
      completed: 0
    };

    statusCount.forEach((item) => {
      if (item._id === "todo") result.todo = item.count;
      if (item._id === "in-progress") result.inProgress = item.count;
      if (item._id === "completed") result.completed = item.count;
    });

    return res.status(200).json({
      success: true,
      statusCount: result
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
}

module.exports = {
  getDashboardSummary,
  getOverdueTasks,
  getTaskStatusCount
};
