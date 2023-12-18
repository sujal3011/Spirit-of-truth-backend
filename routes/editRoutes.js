const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Profile = require("../models/Profile");
const EditProfile = require("../models/EditProfile");
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

//creating new edit profile request
router.post(
  "/edit-profile/new-request",
  [
    body("firstName", "Enter a valid firstname ").isLength({ min: 1 }),
    body("lastName", "Enter a valid lastname ").isLength({ min: 1 }),
    body("sex", "Enter a valid gender").isLength({ min: 1 }),
    body("addressFirstLine", "Enter a valid address").isLength({ min: 1 }),
    body("date", "Enter a valid birthdate").isLength({ min: 1 }),
    body("state", "Enter a valid state name").isLength({ min: 1 }),
    body("city", "Enter a valid city name").isLength({ min: 1 }),
    body("country", "Enter a valid country name").isLength({ min: 1 }),
    body("phoneNumber", "Enter a valid country name").isLength({ min: 1 }),
    body("zipCode", "Enter a valid zipcode").isLength({ min: 1 }),
    body("email", "Enter a valid email ").isEmail(),
    body("profileImage", "Select a valid image").isLength({ min: 1 }),
  ],
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("something is invalid");
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {

      let profile = await EditProfile.findOne({ email:req.body.email });
      if (profile) {
        return res.status(403).json({ success: false, errorMessage:' An edit profile request for this account is already pending' });
      } 

      profile = await EditProfile.create({
        firstname: req.body.firstName,
        middlename: req.body.middleName,
        lastname: req.body.lastName,
        spiritualname: req.body.spiritualName,
        sex: req.body.sex,
        addressline1: req.body.addressFirstLine,
        addressline2: req.body.addressSecondLine,
        state: req.body.state,
        city: req.body.city,
        zipcode: req.body.zipCode,
        country: req.body.country,
        phone: Number(req.body.phoneNumber),
        birthdate: req.body.date,
        image: req.body.profileImage,
        dralawalletaddress: req.body.dralaWalletAdress,
        email: req.body.email,
        user:req.body.user,
      });
      res.status(201).json({ success: true, newprofile: profile });
    } catch (err) {
      res.status(500).send("Internal server error");
      console.log(err);
    }
  }
);

//fetching all edit user profile requests
router.get('/edit-profile/requests', async (req, res) => {
    try {
        const editProfileRequests = await EditProfile.find();
        return res.json({requests:editProfileRequests,totalEntries:editProfileRequests.length});
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server Error' });
      }
  });

//fetching edited profile of a particular user
router.get('/edit-profile/requests/:userId', async (req, res) => {
  try {
    const newProfile = await EditProfile.findOne({user:req.params.userId});
    if(!newProfile){
      return res.status(404).json({ message: 'No edit profile request exist' });
    }
    return res.json(newProfile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
  
});

//approving edit request of user
router.put('/edit-profile/approve/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if(!user){
      return res.status(404).json({message:'User not found'});
    }
    const profile = await Profile.findOne({user:req.params.userId});
    if(!profile){
      return res.status(404).json({ message: 'Profile do not exist' });
    }
    const newProfile = await EditProfile.findOne({user:req.params.userId});
    if(!newProfile){
      return res.status(404).json({ message: 'No edit profile request exist' });
    }
    //updating the profile

    const updatedProfile = {
      firstname: newProfile.firstname,
      middlename: newProfile.middlename,
      lastname: newProfile.lastname,
      spiritualname: newProfile.spiritualname,
      sex: newProfile.sex,
      addressline1:newProfile.addressline1,
      addressline2: newProfile.addressline2,
      state: newProfile.state,
      city: newProfile.city,
      zipcode: newProfile.zipcode,
      country: newProfile.country,
      phone: Number(newProfile.phone),
      birthdate: newProfile.birthdate,
      image: newProfile.image,
      dralawalletaddress: newProfile.dralawalletaddress,
      email: newProfile.email,
    };

    const changedProfile = await Profile.findOneAndUpdate(
      { user: req.params.userId },
      { $set: updatedProfile },
      { new: true }
    );
    //deleting the edit profile request
    const deletedrequest = await EditProfile.findOneAndDelete({ user: req.params.userId });
    return res.json(changedProfile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
});

//disapproving edit request of user
router.put('/edit-profile/disapprove/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if(!user){
      return res.status(404).json({message:'User not found'});
    }
    const profile = await Profile.findOne({user:req.params.userId});
    if(!profile){
      return res.status(404).json({ message: 'Profile do not exist' });
    }
    const newProfile = await EditProfile.findOne({user:req.params.userId});
    if(!newProfile){
      return res.status(404).json({ message: 'No edit profile request exist' });
    }
    //deleting the edit profile request
    const deletedrequest = await EditProfile.findOneAndDelete({ user: req.params.userId });
    return res.json(deletedrequest);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;