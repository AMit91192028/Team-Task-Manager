const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [3, "Task title must be at least 3 characters"],
      maxlength: [120, "Task title cannot exceed 120 characters"]
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"]
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["todo", "in-progress", "completed"],
      default: "todo"
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },

    dueDate: {
      type: Date,
      required: true
    },

    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1, dueDate: 1 });

const taskModel = mongoose.model("Task", taskSchema);
module.exports = taskModel