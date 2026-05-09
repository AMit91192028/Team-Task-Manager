const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
      role:{
        type:String,
        enum:['admin','member'],
        default:'member'
    }
  },
  {
    timestamps: true
  }
);

const userModel = mongoose.model("User", userSchema);
module.exports = userModel
