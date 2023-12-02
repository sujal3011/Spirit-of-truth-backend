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
      const newFile = new File({
        sectionId: req.params.sectionId, originalname: req.file.originalname, fileId: req.file.id
      })
      const savedFile = await newFile.save();
      res.json(savedFile);

    } catch (error) {
      res.status(500).send(error)
    }
  })


module.exports = router;