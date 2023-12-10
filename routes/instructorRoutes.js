const express = require("express");
const router = express.Router();
const User = require("../models/User");
const OTP = require("../models/Otp");
const Profile = require("../models/Profile");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpController = require("../controllers/otpController");
const axios = require('axios');
const Token = require("../models/Token");
const crypto = require("crypto");
const mailSender = require("../utils/mailSender");
const multer = require('multer');
const authenticateAdmin = require("../middleware/authenticateAdmin");
const authenticateAdminInstructor = require("../middleware/authenticateAdminInstructor");
const secret_key = process.env.SECRET_KEY;


const Course = require('../models/course/Course');

// Getting instructor profile by user id
router.get('/profiles/:userId', async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const instructor = await User.findById(userId);
      if (!instructor || instructor.role!=='instructor') {
        return res.status(404).json({ success: false, message: 'Instructor not found' });
      }

      const instructorProfile = await Profile.findOne({user:userId});
      if (!instructorProfile) {
        return res.status(404).json({ success: false, message: 'Instructor profile not found' });
      }

      return res.status(200).json({ success: true, instructor:instructorProfile});
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

// Getting all instructor Profiles
router.get('/profiles', async (req, res) => {
    try {
      const instructors = await User.find({ role: 'instructor' });
      if (!instructors) {
        return res.status(404).json({ success: false, message: 'No instructors found' });
      }
      let instructorProfiles=[];
      for (const instructor of instructors) {
        const profile = await Profile.findOne({ user: instructor._id });
        instructorProfiles.push(profile);
      }
  
      return res.status(200).json({ success: true, instructorProfiles });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

// Assigning instructor to course
router.put('/assign/:courseId', async (req, res) => {
    const courseId = req.params.courseId;
    const { instructorId } = req.body; // user Id of the instructor
  
    try {
      const course = await Course.findById(courseId);
  
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      course.instructors.push(instructorId);
      const updatedCourse = await course.save();
  
      return res.status(200).json({ success: true, course: updatedCourse });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// De-assigning instructor from course
router.put('/deassign/:courseId', async (req, res) => {
    const courseId = req.params.courseId;
    const { instructorId } = req.body; // user Id of the instructor
  
    try {
      const course = await Course.findById(courseId);
  
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      course.instructors = course.instructors.filter(id => id.toString() !== instructorId.toString());
      const updatedCourse = await course.save();
  
      return res.status(200).json({ success: true, course: updatedCourse });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
});








module.exports = router;
