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


module.exports = router;