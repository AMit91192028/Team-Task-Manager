const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: [3, "Project name must be at least 3 characters"],
      maxlength: [100, "Project name cannot exceed 100 characters"]
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"]
    },

    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

projectSchema.index({ createdBy: 1 });
projectSchema.index({ members: 1 });

const projectModel = mongoose.model("Project", projectSchema);
module.exports =  projectModel;