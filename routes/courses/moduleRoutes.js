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


//Creating a new module
router.post(
    "/create/:courseId",
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

        const course = await Course.findById(req.params.courseId);
        if(!course){
            return res.status(404).json({ message: 'Course do not exist' });
        }
        let module = await Module.create({
            title: req.body.title,
            courseId: req.params.courseId
        });
        course.modules.push(module._id);
        await course.save();

        res.status(201).json({ success: true, module: module,updatedCourse:course});

      } catch (err) {
        res.status(500).send("Internal server error");
        console.log(err);
      }
    }
);

module.exports = router;