const express = require("express");
const router = express.Router();
const User = require("../models/User");
const OTP = require("../models/Otp");
const Profile = require("../models/Profile");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpController = require("../controllers/otpController");
const axios = require('axios');

const secret_key = process.env.SECRET_KEY;

router.post("/send-otp", otpController.sendOTP);

router.post(
  "/signup",
  [
    body("email", "Enter a valid email ").isEmail(),
    body("password", "The password must be of atleast 6 characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const { email, password, otp } = req.body;

    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: email });
      if (user) {
        return res.status(400).json({
          success,
          error: "A user with this email address already exists",
        });
      }

      // Find the most recent OTP for the email
      // const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
      // if (response.length === 0 || otp !== response[0].otp) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'The OTP is not valid',
      //   });
      // }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);
      user = await User.create({
        email: email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      const token = jwt.sign(data, secret_key);
      success = true;
      res.json({ success, token, userId: user._id });
    } catch (err) {
      res.status(500).send("Internal server error");
      console.log(err);
    }
  }
);

async function verifyRecaptcha(recaptchaResponse) {
  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          // secret: process.env.RECAPTCHA_SECRET_KEY,
          secret: "6LfWreQoAAAAAOOPZERy_flGvmupe8vG-1XdcFfM",
          response: recaptchaResponse,
        },
      }
    );

    return response.data.success;
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return false;
  }
}

router.post(
  "/login",
  [
    body("email", "Enter a valid email ").isEmail(),
    body("password", "The password cannot be blank").isLength({ min: 1 }),
  ],
  async (req, res) => {
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password, captchaToken } = req.body;
    // const {email,password}=req.body
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please enter correct credentials" });
      }
      const comparePass = await bcrypt.compare(password, user.password);
      if (!comparePass) {
        return res
          .status(400)
          .json({ success, error: "Please enter correct credentials" });
      }
      // verifying captcha
      const isRecaptchaValid = await verifyRecaptcha(captchaToken);
      if (!isRecaptchaValid) {
        // console.log("recatcha not verified");
        return res.status(400).json({ error: "reCAPTCHA verification failed" });
      }
      // else{
      //   console.log("recatcha successfully verified");
      // }

      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, secret_key);
      success = true;
      res.json({ success: true, token: token, email: user.email });
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  }
);

router.post(
  "/create-profile",
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
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("something is invalid");
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      console.log(req.body);

      let profile = await Profile.create({
        firstname: req.body.firstName,
        middlename: req.body.middleName,
        lastname: req.body.lastName,
        spiritualname: req.body.spiritualName,
        sex: req.body.sex,
        addressline1: req.body.addressFirstLine,
        addressline2: req.body.addressSecondeLine,
        state: req.body.state,
        city: req.body.city,
        zipcode: req.body.zipCode,
        country: req.body.country,
        phone: Number(req.body.phoneNumber),
        birthdate: req.body.date,
        // image: req.body.image,
        dralawalletaddress: req.body.dralaWalletAdress,
        email: req.body.email,
      });
      res.status(201).json({ success: true, profile: profile });
    } catch (err) {
      res.status(500).send("Internal server error");
      console.log(err);
    }
  }
);

module.exports = router;
