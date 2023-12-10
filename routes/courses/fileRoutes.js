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
const upload = require('../../middleware/upload');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const fs = require('fs');
const readline = require('readline');

const Course = require("../../models/course/Course");
const File = require("../../models/course/File");
const Module = require("../../models/course/Module");
const Section = require("../../models/course/Section");



const mongoURL = process.env.MONGODB_URL

const conn = mongoose.createConnection(mongoURL);

let gfs;
conn.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
});


//uploading a new pdf
router.post('/upload/:sectionId', upload.single('file'), async (req, res) => {

    try {
        const section = await Section.findById(req.params.sectionId);
        if(!section){
            return res.status(404).json({ message: 'Section do not exist' });
        }
    
      const newFile = new File({
        sectionId: req.params.sectionId, originalname: req.file.originalname, fileId: req.file.id
      })
      const savedFile = await newFile.save();
      section.pdfs.push(newFile._id);
      await section.save();
      res.status(201).json({ success: true, savedFile: savedFile,updatedSection:section });

    } catch (error) {
      res.status(500).send(error)
    }
})

// Getting pdfs of a section
router.get('/fetch/:sectionId', async (req, res) => {
  try {
    const pdfs = await File.find({sectionId:req.params.sectionId});
    if (!pdfs) {
      res.status(404).json({ error: 'pdfs not found' });
    } else {
      res.status(200).json({pdfs});
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Downloading pdf
router.get('/downloadpdf/:id', async (req, res) => {

  try {
      console.log("downloading file");
    let referenceFile = await File.findById(req.params.id);
    console.log(referenceFile);
    gfs.find({ _id: new mongoose.Types.ObjectId(referenceFile.fileId) }).toArray((err, files) => {
      if (!files[0] || files.length === 0) {
        console.log("File not found");
        return res.status(404).json({
          err: 'No file exists'
        });
      }
      console.log(files[0]);
      const downloadStream = gfs.openDownloadStream(files[0]._id);  
      console.log(referenceFile.originalname);
      const originalFileName = referenceFile.originalname;
      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${originalFileName}"`,
        'file-Name': `${originalFileName}`,
      });
      res.set('Access-Control-Expose-Headers', 'file-Name');
      downloadStream.pipe(res);
    });

  } catch (error) {
    console.log("Error");
    res.status(500).json(error);
  }
});




module.exports = router;