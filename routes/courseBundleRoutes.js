const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require('axios');
const crypto = require("crypto");
const multer = require('multer');

//const User=require("../../models/User");
const Course = require("../models/course/Course");
const CourseBundle = require("../models/CourseBundle");
// const File = require("../../models/course/File");
// const Module = require("../../models/course/Module");
// const Section = require("../../models/course/Section");
// const authenticateAdmin =  require("../middleware/authenticateAdmin");
// const authenticateAdminInstructor =  require("../../middleware/authenticateAdminInstructor");


// Creating a new course bundle
router.post('/create', async (req, res) => {
    try {
      const { title, creatorId } = req.body;
      const courseBundle = await CourseBundle.create({
        title,
        creatorId,
      });
  
      res.status(201).json({success:true,courseBundle});
    } catch (error) {
      res.status(500).json({ success:false,error: error.message });
    }
  });
// Getting all Course bundles
router.get(
  "/", async (req, res) => {
    try {
      const { publishedStatus } = req.query;
      let courseBundles;
      if(publishedStatus==="all") courseBundles = await CourseBundle.find();
      else if(publishedStatus==="published") courseBundles = await CourseBundle.find({publishedStatus: true});
      else courseBundles = await CourseBundle.find({publishedStatus: false});
      res.status(201).json({ success: true, courseBundles});

    } catch (err) {
      res.status(500).send("Internal server error");
      console.log(err);
    }
  }
);

// Publishing a bundle
router.put('/publish/:bundleId', async (req, res) => {
  try {
      const bundleId = req.params.bundleId;
      const bundle = await CourseBundle.findByIdAndUpdate(
        bundleId,
          { publishedStatus: true },
          { new: true }
      );
      if (!bundle) {
          return res.status(404).json({ success:false,message: 'Bundle not found' });
      }
      res.json(bundle);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
  }
});
// UnPublishing a bundle
router.put('/unpublish/:bundleId',async (req, res) => {
  try {
      const bundleId = req.params.bundleId;
      const bundle = await CourseBundle.findByIdAndUpdate(
        bundleId,
          { publishedStatus : false },
          { new: true }
      );

      if (!bundle) {
          return res.status(404).json({ success:false,message: 'Bundle not found' });
      }

      res.json(bundle);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
  }
});

//Getting all courses of a Course Bundle
router.get('/courses/:coursebundleID', async (req, res) => {
  try {
    const coursebundleID = req.params.coursebundleID;
    const courseBundle = await CourseBundle.findById(coursebundleID).populate('courses.courseId');

    if (!courseBundle) {
      return res.status(404).json({ success:false,message: 'CourseBundle not found' });
    }
    const courses = courseBundle.courses;
    res.json({ success:true,courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false,message: 'Server Error' });
  }
});

//Creating a new Course in a bundle
router.post('/courses/create/:coursebundleID', async (req, res) => {
  try {
    const coursebundleID = req.params.coursebundleID;
    const { title, creatorId, courseType,orderNo } = req.body;

    const courseBundle = await CourseBundle.findById(coursebundleID);
    if (!courseBundle) {
      return res.status(404).json({ success:false,message: 'CourseBundle not found' });
    }

     // Create a new course
     const course = await Course.create({
      title,
      creatorId,
      courseType
    });

    // Adding the course in the course Bundle
    const newCourse = {
      courseId:course._id,
      courseNo:orderNo
    };
    courseBundle.courses.push(newCourse);
    await courseBundle.save();

    res.json({ success:true,course,courseBundle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false,message: 'Server Error' });
  }
});

// Adding existing course in a bundle
router.put('/courses/add/:coursebundleID/:courseId', async (req, res) => {

  try {
    
      const { coursebundleID,courseId } = req.params;
      // Updating the courseType of the course
        const course = await Course.findById(courseId);
        if (!course) {
          return res.status(404).json({ success: false, message: 'Course not found' });
        }
        course.courseType = 'bundle';
        await course.save();
    
      // Updating the bundle
    
      const courseBundle = await CourseBundle.findById(coursebundleID);
      if (!courseBundle) {
        return res.status(404).json({ success:false,message: 'CourseBundle not found' });
      }
      const newCourse = {
        courseId:courseId,
        courseNo:0
      };
      courseBundle.courses.push(newCourse);
      await courseBundle.save();
    
      res.json({ success:true,course,courseBundle });  
  } catch (err) {
    res.status(500).json({ success:false,message: 'Server Error' });
  }



  
  
});

//Updating order of course in a bundle
router.put('/courses/update/:coursebundleID/:courseId', async (req, res) => {
  try {
    const coursebundleID = req.params.coursebundleID;
    const courseId = req.params.courseId;
    const { courseNo } = req.body;
    const courseBundle = await CourseBundle.findById(coursebundleID);
    if (!courseBundle) {
      return res.status(404).json({ success:false,error: 'CourseBundle not found' });
    }
    const courseIndex = courseBundle.courses.findIndex(course => course.courseId.toString() === courseId);
    if (courseIndex === -1) {
      return res.status(404).json({ success:false,error: 'Course not found in the CourseBundle' });
    }
    // Update the courseNo of the specific course in the CourseBundle
    courseBundle.courses[courseIndex].courseNo = courseNo;
    await courseBundle.save();

    return res.status(200).json({success:true,courseBundle});
  } catch (err) {
    return res.status(500).json({ success:false,error: 'Failed to update the courseNo of the course in CourseBundle' });
  }
});




module.exports = router;