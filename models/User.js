const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user", required: false },
    accountStatus: { type: String, default: "active", required: false },

    isUserBlocked: { type: Boolean, default: false, required: false },
    coursesAssigned: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course",
      },
    ],
    coursesEnrolled: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course",
      },
    ],
  },
  { timestamps: true }
);
const User = mongoose.model("user", UserSchema);
module.exports = User;
