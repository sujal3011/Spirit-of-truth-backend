const express = require("express");
const router = express.Router();
const OTP = require("../../models/Otp");
const Profile = require("../../models/Profile");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");
const mailSender = require("../../utils/mailSender");
const multer = require("multer");

const User = require("../../models/User");
const Course = require("../../models/course/Course");
const CourseCompletion = require("../../models/course/CourseCompletion");
const File = require("../../models/course/File");
const Module = require("../../models/course/Module");
const Section = require("../../models/course/Section");
const authenticateAdmin = require("../../middleware/authenticateAdmin");
const authenticateAdminInstructor = require("../../middleware/authenticateAdminInstructor");

// Creating a new course Completion instance or update existing one
router.post("/create", async (req, res) => {
  try {
    const {
      userId,
      courseId,
      correctAnswers,
      percentageScored,
      passingStatus,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }
    const existingCompletion = await CourseCompletion.findOne({
      userId,
      courseId,
    });
    if (existingCompletion) {
      existingCompletion.correctAnswers = correctAnswers;
      existingCompletion.percentageScored = percentageScored;
      existingCompletion.passingStatus = passingStatus;
      existingCompletion.NoOfAttempts =
        (existingCompletion.NoOfAttempts || 0) + 1;
      existingCompletion.lastTestTaken = Date.now();

      await existingCompletion.save();

      return res.status(200).json({
        success: true,
        message: "Course completion details updated",
        courseCompletion: existingCompletion,
      });
    } else {
      const courseCompletion = await CourseCompletion.create({
        userId,
        courseId,
        correctAnswers,
        percentageScored,
        passingStatus,
      });

      return res.status(201).json({
        success: true,
        message: "Course completion details created",
        courseCompletion,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Fetching an instance with a given userId and courseId
router.get("/fetch/:userId/:courseId", async (req, res) => {
  const { userId, courseId } = req.params;
  console.log("userid", userId, "courseid", courseId);
  try {
    const courseCompletion = await CourseCompletion.findOne({
      userId,
      courseId,
    });
    console.log("course completion", courseCompletion);

    if (!courseCompletion) {
      return res.status(200).json({ success: false, message: "Not found." });
    }

    res.status(200).json({ success: true, courseCompletion });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Fetching all passed courses of a user
router.get("/passedCourses/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const passedCourses = await CourseCompletion.find({
      userId,
      passingStatus: true,
    });
    console.log("passed coursed", passedCourses);

    const courseIds = passedCourses.map((course) => course.courseId);
    console.log("courseids", courseIds);

    const originalCourse = [];

    for (const id of courseIds) {
      const course = await Course.findOne({ _id: id });

      if (course) {
        originalCourse.push(course);
      }
      console.log("orginalcourse", originalCourse);
    }
    res.json({ success: true, courses: originalCourse, passedCourses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
