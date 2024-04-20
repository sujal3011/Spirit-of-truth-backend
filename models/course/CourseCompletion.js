const mongoose = require("mongoose");

const CourseCompletionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
    },
    correctAnswers: { type: Number, required: true },
    percentageScored: { type: Number, required: true },
    passingStatus: { type: Boolean, required: true },
    NoOfAttempts: { type: Number, required: false, default: 1 },
    lastTestTaken: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const CourseCompletion = mongoose.model(
  "coursecompletion",
  CourseCompletionSchema
);

module.exports = CourseCompletion;
