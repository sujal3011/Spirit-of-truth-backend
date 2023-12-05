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


//Creating a new course
router.post(
    "/create",
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

//Getting all course of a particular creator
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

module.exports = router;