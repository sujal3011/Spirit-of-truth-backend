const express = require("express");
const router = express.Router();
const OTP = require("../../models/Otp");
const Profile = require("../../models/Profile");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require('axios');
const crypto = require("crypto");
const mailSender = require("../../utils/mailSender");
const multer = require('multer');

const Course = require("../../models/course/Course");
const File = require("../../models/course/File");
const Module = require("../../models/course/Module");
const Section = require("../../models/course/Section");
const authenticateAdmin =  require("../../middleware/authenticateAdmin");
const authenticateAdminInstructor =  require("../../middleware/authenticateAdminInstructor");


//Creating a new course
router.post(
    "/create",authenticateAdminInstructor,
    [
      body("title", "Enter a valid title ").isLength({ min: 1 }),
    ],
    async (req, res) => {
  
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("something is invalid");
        return res.status(400).json({ success: false, errors: errors.array() });
      }
      try {
        let course = await Course.create({
            title: req.body.title,
            creatorId: req.body.creatorId
        });
        res.status(201).json({ success: true, course: course });

      } catch (err) {
        res.status(500).send("Internal server error");
        console.log(err);
      }
    }
);

//Getting all courses
router.get(
  "/", async (req, res) => {
    try {
      const { publishedStatus } = req.query;
      let courses;
      if(publishedStatus==="all") courses = await Course.find();
      else if(publishedStatus==="published") courses = await Course.find({publishedStatus: true});
      else courses = await Course.find({publishedStatus: false});
      res.status(201).json({ success: true, courses: courses});

    } catch (err) {
      res.status(500).send("Internal server error");
      console.log(err);
    }
  }
);

// Get course by id
router.get(
  "/:courseId", async (req, res) => {
    try {
      const course = await Course.findById(req.params.courseId);
  
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      return res.status(200).json({ success: true, course });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

router.get(
  "/fetch-by-creator/:creatorId", async (req, res) => {
    try {
      let courses = await Course.find({creatorId: req.params.creatorId});
      res.status(201).json({ success: true, courses: courses});

    } catch (err) {
      res.status(500).send("Internal server error");
      console.log(err);
    }
  }
);

router.put('/publish/:courseId', authenticateAdmin , async (req, res) => {
  try {
      const courseId = req.params.courseId;
      const course = await Course.findByIdAndUpdate(
          courseId,
          { publishedStatus: true },
          { new: true }
      );
      if (!course) {
          return res.status(404).json({ message: 'Course not found' });
      }
      res.json(course);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
  }
});

router.put('/unpublish/:courseId', authenticateAdmin ,async (req, res) => {
  try {
      const courseId = req.params.courseId;
      const course = await Course.findByIdAndUpdate(
          courseId,
          { publishedStatus : false },
          { new: true }
      );

      if (!course) {
          return res.status(404).json({ message: 'Course not found' });
      }

      res.json(course);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;