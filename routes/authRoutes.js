const express = require('express');
const router = express.Router();
const User = require('../models/User');
const OTP = require('../models/Otp');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpController = require('../controllers/otpController');

const secret_key=process.env.SECRET_KEY

router.post('/send-otp', otpController.sendOTP);


router.post('/signup', async (req, res) => {

    const { email,password,otp } = req.body;
    
    let success=false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success,errors: errors.array() });
    }
  
    try{
  
    let user = await User.findOne({ "email": email })
    if (user) {
      return res.status(400).json({ success,"error": "A user with this email address already exists" })
    }

    // Find the most recent OTP for the email
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (response.length === 0 || otp !== response[0].otp) {
      return res.status(400).json({
        success: false,
        message: 'The OTP is not valid',
      });
    }

    const salt=await bcrypt.genSalt(10)
    const secPass=await bcrypt.hash(req.body.password,salt)   
    user = await User.create({     
      email: req.body.email,
      password:secPass,
    })
  
    const data={
      user:{
        id:user.id
      }
    }
  
    const token=jwt.sign(data,secret_key)  
    success=true;
    res.json({success,token})
    }catch(err){
      res.status(500).send("Internal server error")
      console.log(err)
    }
  })
  

module.exports = router