const express = require('express');
const router = express.Router();
const User = require('../models/User');
const OTP = require('../models/Otp');
const Profile=require('../models/Profile');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpController = require('../controllers/otpController');

const secret_key=process.env.SECRET_KEY

router.post('/send-otp', otpController.sendOTP);


router.post('/signup',[
  body('email', 'Enter a valid email ').isEmail(),
  body('password', 'The password must be of atleast 6 characters').isLength({ min: 6 }),
], async (req, res) => {

    const {email,password,otp } = req.body;
    
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
    // const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    // if (response.length === 0 || otp !== response[0].otp) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'The OTP is not valid',
    //   });
    // }

    const salt=await bcrypt.genSalt(10)
    const secPass=await bcrypt.hash(password,salt)   
    user = await User.create({
      email: email,
      password:secPass,
    })
  
    const data={
      user:{
        id:user.id
      }
    }
  
    const token=jwt.sign(data,secret_key)  
    success=true;
    res.json({success,token,userId:user._id})
    }catch(err){
      res.status(500).send("Internal server error")
      console.log(err)
    }
  })

  router.post('/login', [
    body('email', 'Enter a valid email ').isEmail(),
    body('password', 'The password cannot be blank').isLength({ min: 1 }),
  ], async (req, res) => {
  
    let success=false;
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {email,password,token}=req.body
    try {
      let user=await User.findOne({email})
      if(!user){
        return res.status(400).json({error:"Please enter correct credentials"})
      }
      const comparePass=await bcrypt.compare(password,user.password);
      if(!comparePass){
        return res.status(400).json({success,error:"Please enter correct credentials"});
      }
      //verifying captcha
      const response = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
      );
      if (!response.data.success) {
        return res.status(400).json({success,error:"Not a human"});
      } 
  
      const data={
        user:{
          id:user.id
        }
      }
      const token=jwt.sign(data,secret_key)  
      success=true;
      res.json({success,token})
    
  
    } catch (error) {
      res.status(500).send("Internal server error")
    }
  })

  router.post('/create-profile', async (req, res) => {

    try {

      let profile = await Profile.create({

        firstname: req.body.firstname,
        middlename: req.body.middlename,
        lastname: req.body.lastname,
        spiritualname: req.body.spiritualname,
        sex: req.body.sex,
        addressline1: req.body.addressline1,
        addressline2: req.body.addressline2,
        state: req.body.state,
        city: req.body.city,
        zipcode: req.body.zipcode,
        country: req.body.country,
        phone: req.body.phone,
        birthdate: req.body.birthdate,
        image: req.body.image,
        dralawalletaddress: req.body.dralawalletaddress,
        user: req.body.user,
      })
      res.status(201).json(profile);


      
    } catch (err) {
      res.status(500).send("Internal server error")
      console.log(err)
    }
})


module.exports = router