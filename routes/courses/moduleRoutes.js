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
const CreationRequest = require("../../models/instructors/CreationRequest");

const authenticateAdmin =  require("../../middleware/authenticateAdmin");
const authenticateAdminInstructor =  require("../../middleware/authenticateAdminInstructor");

const mongoose = require('mongoose');
const mongoURL = process.env.MONGODB_URL
const conn = mongoose.createConnection(mongoURL);

let gfs;
conn.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
});



// Creating a new module
router.post(
    "/create/:courseId",authenticateAdminInstructor,
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
        const modules=await Module.find({courseId:req.params.courseId});

        // Determine the order of the new module to be created
        let order = 1;
        if (modules && modules.length > 0) {
          // If modules are present, find the maximum order and increment by 1
          order = Math.max(...modules.map((module) => module.order), 0) + 1;
        }

        let approvalStatus;
        if (req.user.role === 'instructor') {
          approvalStatus = false;
        } else {
          approvalStatus = true;
        }

        let module = await Module.create({
            title: req.body.title,
            courseId: req.params.courseId,
            order: order,
            approvalStatus: approvalStatus
        });
        course.modules.push(module._id);
        await course.save();

        if (req.user.role === 'instructor'){
          if(course.approvalStatus===true){

            //creating create request for this module only if its corresponding course is already approved
            let creationrequest = await CreationRequest.create({entityId:module._id,entityType:'Module',creatorId: req.body.creatorId});
          }

        }
        res.status(201).json({ success: true, module: module,updatedCourse:course});

      } catch (err) {
        res.status(500).send("Internal server error");
        console.log(err);
      }
    }
);

// Getting modules by course id
router.get('/fetch/:courseId', async (req, res) => {
  try {
    const modules = await Module.find({courseId:req.params.courseId});
    if (!modules) {
      res.status(404).json({ error: 'Modules not found' });
    } else {
      res.status(200).json({modules});
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:moduleId', async (req, res) => {
  const moduleId = req.params.moduleId;
  const { title } = req.body;
  try {
    const module = await Module.findByIdAndUpdate(
      moduleId,
      { $set: { title: title } },
      { new: true }
    );
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    res.status(200).json({ message: 'Module title updated successfully', updatedModule: module });
  } catch (error) {
    res.status(500).json({ message: 'Error updating module title', error: error.message });
  }
});

router.delete('/:moduleId', async (req, res) => {
  try {
    const moduleId = req.params.moduleId;

    // Delete the module and its associated sections
    await Module.findByIdAndDelete(moduleId);

    //Deleting the pdfs of all the sections
    const sections = await Section.find({moduleId});
    for(let section of sections){
      for(let pdfId of section.pdfs){
        let file = await File.findByIdAndDelete(pdfId);
        if(file){
          gfs.delete(new mongoose.Types.ObjectId(file.fileId),
            (error, data) => {
              if (error) {
                console.log(error);
                return res.status(404).json(error);
              }
            }
          )
        }
      }
    }
    //Deleting all the sections
    await Section.deleteMany({ moduleId });

    res.status(200).json({ success:true,message: 'Module and associated sections deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success:false,error: 'Internal server error' });
  }
});

// Updating modules Order
router.put('/updateModulesOrder/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { modulesOrder } = req.body;

    // Find the course by courseId
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Update module orders based on the received data
    let updatedModules=[];
    modulesOrder.forEach(async (moduleOrder) => {
      const { moduleId, order } = moduleOrder;

      // Find the module by moduleId and update its order
      const updatedModule = await Module.findByIdAndUpdate(
        moduleId,
        { $set: { order: order } },
        { new: true }
      );
      updatedModules.push(updatedModule);
    });

    res.status(200).json({ success: true, message: 'Module orders updated successfully',modules:updatedModules});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;