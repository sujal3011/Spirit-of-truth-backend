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


//Creating a new section
router.post(
    "/create/:moduleId",
    [
      body("title", "Enter a valid title ").isLength({ min: 1 }),
      body("body", "Enter a valid body ").isLength({ min: 1 }),
    ],
    async (req, res) => {
  
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("something is invalid");
        return res.status(400).json({ success: false, errors: errors.array() });
      }
      try {

        const module = await Module.findById(req.params.moduleId);
        if(!module){
            return res.status(404).json({ message: 'Module do not exist' });
        }

        let section = await Section.create({
            title: req.body.title,
            body: req.body.body,
            moduleId: req.params.moduleId,
            videoUrl: req.body.videoUrl
        });
        module.sections.push(section._id);
        await module.save();
        res.status(201).json({ success: true, section: section,updatedModule:module });

      } catch (err) {
        res.status(500).send("Internal server error");
        console.log(err);
      }
    }
);

// Getting sections by module id
router.get('/fetch/:moduleId', async (req, res) => {
  try {
    const sections = await Section.find({moduleId:req.params.moduleId});
    if (!sections) {
      res.status(404).json({ error: 'sections not found' });
    } else {
      res.status(200).json({sections});
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Getting section by section id
router.get('/:sectionId', async (req, res) => {
  try {
    const section = await Section.findById(req.params.sectionId);
    if (!section) {
      res.status(404).json({ error: 'Section not found' });
    } else {
      res.status(200).json({section});
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;