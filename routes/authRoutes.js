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
const Token = require("../models/Token");
const crypto = require("crypto");
const mailSender = require("../utils/mailSender");
const multer = require('multer');
const authenticateAdmin = require("../middleware/authenticateAdmin");
const authenticateAdminInstructor = require("../middleware/authenticateAdminInstructor");
const secret_key = process.env.SECRET_KEY;

router.post("/send-otp", otpController.sendOTP);

//User SignUp
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
          role:user.role,
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
//User Login
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
        return res.status(400).json({ error: "reCAPTCHA verification failed" });
      }

      const data = {
        user: {
          id: user.id,
          role:user.role,
        },
      };
      const token = jwt.sign(data, secret_key)
      success = true;
      res.json({ success: true, token: token, user: user});
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  }
);

//User logout
router.post(
  "/logout",
);
// Changing role to user
router.put('/role/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const updatedUser = await User.findByIdAndUpdate(userId, { role: 'user' }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Changing role to instructor
router.put('/role/instructor/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const updatedUser = await User.findByIdAndUpdate(userId, { role: 'instructor' }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

//Get Profile
router.post(
  "/get-profile",
  [
    body("email", "Enter a valid email ").isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {email} = req.body;
    try {
      let profile = await Profile.findOne({ email });
      if (!profile) {
        return res.status(400).json({ success:false,error: "Profile do not exist" });
      }
      else{
        res.json({ success: true, profile:profile});
      }
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  }
);

//Get user by Id
router.get(
  "/users/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
      const user = await User.findById(userId);

      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
      }
    }
);


const storage = multer.memoryStorage();
const upload = multer({ storage });
//Create Profile
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
    body("phoneNumber", "Enter a valid Phone number").isLength({ min: 1 }),
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

      let user = await User.findById(req.body.user);
      if (!user) {
        return res.status(400).json({ success:false,message: "User not found" });
      }
      let profile = await Profile.create({
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
        phone: req.body.phoneNumber,
        birthdate: req.body.date,
        image: req.body.profileImage,
        dralawalletaddress: req.body.dralaWalletAdress,
        email: req.body.email,
        user:req.body.user,
      });
      user.accountStatus='profile_created';
      await user.save();
      res.status(201).json({ success: true, profile: profile });
    } catch (err) {
      res.status(500).send("Internal server error");
      console.log(err);
    }
  }
);

// Updating user account status
router.put('/account-status/:userId', async (req, res) => {
  const { userId } = req.params;
  const { newStatus } = req.body;
  try {
    const user = await User.findByIdAndUpdate(userId, { accountStatus: newStatus }, { new: true });
    if (!user) {
      return res.status(404).json({ success:false,message: 'User not found' });
    }
    return res.json({ success:true,user });
  } catch (error) {
    return res.status(500).json({ success:false,error: 'Internal server error' });
  }
});



//Update Profile
router.put(
  "/update-profile/:userId",
  [
    body("firstName", "Enter a valid firstname ").isLength({ min: 1 }),
    body("lastName", "Enter a valid lastname ").isLength({ min: 1 }),
    body("sex", "Enter a valid gender").isLength({ min: 1 }),
    body("addressFirstLine", "Enter a valid address").isLength({ min: 1 }),
    body("date", "Enter a valid birthdate").isLength({ min: 1 }),
    body("state", "Enter a valid state name").isLength({ min: 1 }),
    body("city", "Enter a valid city name").isLength({ min: 1 }),
    body("country", "Enter a valid country name").isLength({ min: 1 }),
    body("phoneNumber", "Enter a valid Phone number").isLength({ min: 1 }),
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
      let user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).send("User not found");
      }
      let profile = await Profile.findOne({ email: user.email });
      if (!profile) {
        return res.status(404).send("Profile not found");
      }
      if(profile.email!==req.body.email){
        return res.status(401).send("Not authorized");
      }
      // console.log(user);
      // console.log(profile);

      const newProfile = {
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
        phone: req.body.phoneNumber,
        birthdate: req.body.date,
        image: req.body.profileImage,
        dralawalletaddress: req.body.dralaWalletAdress,
        email: req.body.email,
        notes: req.body.notes,
      };
      const profileId=profile._id;
      profile = await Profile.findByIdAndUpdate(profileId, { $set: newProfile }, { new: true });
      res.status(200).json({ success: true, profile: profile });
    } catch (err) {
      res.status(500).send("Internal server error");
      console.log(err);
    }
  }
);

//sending the password reset email
router.post("/reset-password", async (req, res) => {
  try {

      const user = await User.findOne({ email: req.body.email });
      if (!user)
          return res.status(400).send("User with given email doesn't exist");

      let token = await Token.findOne({ userId: user._id });
      if (!token) {
          token = await new Token({
              userId: user._id,
              token: crypto.randomBytes(32).toString("hex"),
          }).save();
      }
      // Link needs to be changed
      const link = `${process.env.BASE_URL}/password-reset/${user._id}/${token.token}`;
      await mailSender(user.email, "Password reset", link);

      res.send("password reset link sent to your email account");
  } catch (error) {
      res.send("An error occured");
      console.log(error);
  }
});

//reseting the password
router.post("/reset-password/:userId/:token", async (req, res) => {
  try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(400).send("invalid link or expired");

      const token = await Token.findOne({
          userId: user._id,
          token: req.params.token,
      });
      if (!token) return res.status(400).send("Invalid link or expired");

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      user.password = secPass;
      await user.save();
      await token.delete();

      res.send("password reset sucessfully.");
  } catch (error) {
      res.send("An error occured");
      console.log(error);
  }
});

//getting all profiles
router.get('/get-all-profiles', async (req, res) => {
  try {
    const profiles = await Profile.find();
    const totalProfiles = profiles.length;
    res.status(200).json({ totalProfiles, profiles });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//getting profile of an user from user id
router.get('/get-userprofile/:userId', async (req, res) => {

  const userId = req.params.userId;
  try {
    // console.log(typeof(userId));
    const profile = await Profile.findOne({ user: userId }).populate('user');
    if (!profile) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    return res.json(profile);
  } catch (err) {
    return res.status(500).json({ message: 'Server Error' });
  }
});


//blocking a particular user
router.put('/blockuser/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isUserBlocked = true;
    await user.save();
    return res.status(200).json({ message: 'User blocked successfully', user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

//unblocking a particular user
router.put('/unblockuser/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isUserBlocked = false;
    await user.save();
    return res.status(200).json({ message: 'User unblocked successfully', user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/updateNotes/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { notes } = req.body;

  try {
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ success:false,msg: 'Profile not found for the given user ID' });
    }
    profile.notes = notes;
    await profile.save();

    res.json({ success:true,msg: 'Notes updated successfully', profile });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Server Error' });
  }
});

router.put('/admin-change-password/:userId', async (req, res) => {
 
  try {
    const { newPassword } = req.body;
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ success:true,msg: 'Password changed successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});


router.delete('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    const profile = await Profile.findOne({ user: userId });

    if (!user) {
      return res.status(404).json({ success:false,message: 'User or profile not found' });
    }
    await user.remove();
    await profile.remove();

    res.json({ success:true,message: 'User and profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




module.exports = router;
