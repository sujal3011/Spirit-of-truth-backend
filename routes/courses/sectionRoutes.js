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

const mongoose = require('mongoose');
const mongoURL = process.env.MONGODB_URL
const conn = mongoose.createConnection(mongoURL);

let gfs;
conn.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
});


//Creating a new section
router.post(
    "/create/:moduleId",authenticateAdminInstructor,
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

        const sections=await Section.find({moduleId:req.params.moduleId});

        // Determine the order of the new module to be created
        let order = 1;
        if (sections && sections.length > 0) {
          // If sections are present, find the maximum order and increment by 1
          order = Math.max(...sections.map((section) => section.order), 0) + 1;
        }

        let approvalStatus;
        if (req.user.role === 'instructor') {
          approvalStatus = false;
        } else {
          approvalStatus = true;
        }

        let section = await Section.create({
            title: req.body.title,
            body: req.body.body,
            moduleId: req.params.moduleId,
            videoUrl: req.body.videoUrl,
            order: order,
            approvalStatus: approvalStatus

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

// PUT route to update a section by ID
router.put('/update/:sectionId',  [
  
  body("title", "Enter a valid title ").isLength({ min: 1 }),
  body("body", "Enter a valid body ").isLength({ min: 1 }),

], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("something is invalid");
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
      const sectionId = req.params.sectionId;
      const { title, body, videoUrl } = req.body;

      const section = await Section.findByIdAndUpdate(
          sectionId,
          { title, body, videoUrl },
          { new: true }
      );

      if (!section) {
          return res.status(404).json({ message: 'Section not found' });
      }

      res.status(200).json({ section });
  } catch (error) {
      res.status(500).json({ message: 'Server Error' });
  }
});

router.delete('/:sectionId', async (req, res) => {
  try {
    const sectionId = req.params.sectionId;
    const deletedSection = await Section.findByIdAndDelete(sectionId); 
    console.log("section is :",deletedSection);   

    if (deletedSection) {
      // Deleting the pdfs of the section
      for(let pdfId of deletedSection.pdfs){
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
      res.status(200).json({ success:true,message: 'Section deleted successfully'});
    } else {
      res.status(404).json({ success:false,error: 'Section not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success:false,error: 'Internal server error' });
  }
});

// Updating sections Order
router.put('/updateSectionsOrder/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { sectionsOrder } = req.body;

    // Find the module by moduleId
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    // Update section orders based on the received data
    sectionsOrder.forEach(async (sectionOrder) => {
      const { sectionId, order } = sectionOrder;

      // Find the section by sectionId and update its order
      const updatedSection = await Section.findByIdAndUpdate(
        sectionId,
        { $set: { order: order } },
        { new: true }
      );
    });

    res.status(200).json({ success: true, message: 'Section orders updated successfully'});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


module.exports = router;