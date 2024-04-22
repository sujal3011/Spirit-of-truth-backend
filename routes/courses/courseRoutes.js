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
const File = require("../../models/course/File");
const Module = require("../../models/course/Module");
const Section = require("../../models/course/Section");
const CreationRequest = require("../../models/instructors/CreationRequest");
const authenticateAdmin = require("../../middleware/authenticateAdmin");
const authenticateAdminInstructor = require("../../middleware/authenticateAdminInstructor");

const mongoose = require("mongoose");

const mongoURL = process.env.MONGODB_URL;
const conn = mongoose.createConnection(mongoURL);

let gfs;
conn.once("open", () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
});

// Creating a new course
router.post(
  "/create",
  authenticateAdminInstructor,
  [body("title", "Enter a valid title ").isLength({ min: 1 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("something is invalid");
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      let approvalStatus;

      // instructor is trying to create a new course
      if (req.user.role === "instructor") approvalStatus = false;
      // admin is trying to create a new course
      else approvalStatus = true;

      let courseData = {
        title: req.body.title,
        creatorId: req.body.creatorId,
        isPaid: req.body.courseType === "paid" ? true : false,
        coursePrice: Number(req.body.coursePrice),
        approvalStatus: approvalStatus,
      };

      if (req.user.role === "instructor") {
        courseData.instructors = [req.body.creatorId];
      }
      let course = await Course.create(courseData);
      if (req.user.role === "instructor") {
        let creationrequest = await CreationRequest.create({
          entityId: course._id,
          entityType: "Course",
          creatorId: req.body.creatorId,
        });
      }

      res.status(201).json({ success: true, course: course });
    } catch (err) {
      res.status(500).send("Internal server error");
      console.log(err);
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const { publishedStatus } = req.query;

    let courses;
    if (publishedStatus === "all") courses = await Course.find();
    else if (publishedStatus === "published")
      courses = await Course.find({ publishedStatus: true });
    else courses = await Course.find({ publishedStatus: false });

    // Sort courses alphabetically by title
    courses.sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
    );
    res.status(201).json({ success: true, courses: courses });
  } catch (err) {
    res.status(500).send("Internal server error");
    console.log(err);
  }
});

// Get course by id
router.get("/:courseId", async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }
    return res.status(200).json({ success: true, course });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

router.get("/fetch-by-creator/:creatorId", async (req, res) => {
  try {
    let courses = await Course.find({ creatorId: req.params.creatorId });
    res.status(201).json({ success: true, courses: courses });
  } catch (err) {
    res.status(500).send("Internal server error");
    console.log(err);
  }
});
// Publishing a course
router.put("/publish/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findByIdAndUpdate(
      courseId,
      { publishedStatus: true },
      { new: true }
    );
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});
// UnPublishing a course
router.put("/unpublish/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findByIdAndUpdate(
      courseId,
      { publishedStatus: false },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Enrolling user in Course
router.post("/enroll/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const { userId } = req.body;
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.coursesEnrolled.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: "User is already enrolled in this course",
      });
    }

    // if (course.isPaid) {
    //   const userHasPaid = course.purchasedBy.find((id) => id === userId);
    //   if (!userHasPaid) {
    //     return res.status(404).json({
    //       success: false,
    //       message: "User has not paid for the course",
    //     });
    //   }
    // }

    console.log("user enrolled un course");
    user.coursesEnrolled.push(courseId);
    course.purchasedBy.push(userId);
    await course.save();
    await user.save();
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.post("/paidEnroll/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const { userId } = req.body;
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.coursesEnrolled.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: "User is already enrolled in this course",
      });
    }

    if (course.isPaid) {
      console.log("buyers", course.purchasedBy);

      const userHasPaid = course.purchasedBy.find((id) => id === userId);
      console.log("usehas paid", userHasPaid);
      if (!userHasPaid) {
        return res.status(404).json({
          success: false,
          message: "User has not paid for the course",
        });
      }
    }
    user.coursesEnrolled.push(courseId);
    course.purchasedBy.push(userId);
    await course.save();
    await user.save();
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

// De enrolling user from Course
router.post("/unenroll/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const { userId } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the course is in the coursesEnrolled array
    const index = user.coursesEnrolled.indexOf(courseId);
    if (index === -1) {
      return res
        .status(404)
        .json({ message: "Course not found in coursesEnrolled" });
    }

    // Remove the course from the coursesEnrolled array
    user.coursesEnrolled.splice(index, 1);
    if (course) {
      course.dateOfCompletion = new Date();
      await course.save();
    }
    console.log("course", course);
    await user.save();

    res.json({ message: "Course removed successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Fetching enrolled courses of user
router.get("/enrolled/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate({
      path: "coursesEnrolled",
      options: { sort: { title: 1 } }, // Sort courses alphabetically by title
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res
      .status(200)
      .json({ success: true, enrolledCourses: user.coursesEnrolled });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Updating a Course
router.put("/:courseId", async (req, res) => {
  const courseId = req.params.courseId;
  const { title, type, coursePrice } = req.body;
  const isPaid = type === "paid";
  const updatedCoursePrice = type === "paid" ? coursePrice : 0;
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { title, isPaid, coursePrice: updatedCoursePrice },
      { new: true }
    );
    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update course", error });
  }
});

router.get("/check-enrolled/:userId/:courseId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const courseId = req.params.courseId;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the user is enrolled in the specified course
    const isEnrolled = user.coursesEnrolled.includes(courseId);

    return res.status(200).json({ success: true, isEnrolled });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

// deleting a course
router.delete("/:courseId", async (req, res) => {
  const courseId = req.params.courseId;

  try {
    // Deleting Course
    const deletedCourse = await Course.findOneAndDelete({ _id: courseId });

    if (deletedCourse) {
      // Finding modules and deleting sections and pdfs
      const modules = await Module.find({ courseId });
      for (const module of modules) {
        const sections = await Section.find({ moduleId: module._id });
        for (let section of sections) {
          for (let pdfId of section.pdfs) {
            let file = await File.findByIdAndDelete(pdfId);
            if (file) {
              gfs.delete(
                new mongoose.Types.ObjectId(file.fileId),
                (error, data) => {
                  if (error) {
                    console.log(error);
                    return res.status(404).json(error);
                  }
                }
              );
            }
          }
        }

        await Section.deleteMany({ moduleId: module._id });
      }
      // Deleting Module
      await Module.deleteMany({ courseId });
      res
        .status(200)
        .json({ success: true, message: "Course deleted successfully." });
    } else {
      res.status(404).json({ success: false, message: "Course not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// updating prerequisite courses of a course

router.put("/prerequisiteCourses/:courseId", async (req, res) => {
  const courseId = req.params.courseId;
  const { prerequisiteCourses } = req.body;

  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { prerequisiteCourses },
      { new: true }
    );

    res.json({ success: true, course: updatedCourse });
  } catch (error) {
    console.error("Error updating prerequisite courses:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
