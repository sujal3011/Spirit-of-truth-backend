const express = require("express");
const { validationResult, check } = require("express-validator");
const mailSender = require("../utils/mailSender");
const { verifyRecaptcha } = require("./authRoutes");
const router = express.Router();

router.post(
  "/contact",

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const { data, captchaToken } = req.body;
      const isRecaptchaValid = await verifyRecaptcha(captchaToken);
      if (!isRecaptchaValid) {
        return res.status(400).json({ error: "reCAPTCHA verification failed" });
      }
      const { email, name, message, subject, phone } = data;
      const info = await mailSender(email, subject, message);
      console.log("info", info.messageId);
      return res.status(200).json("Email sent successfully");
    } catch (error) {
      console.log("couldnt send email");
    }
  }
);

module.exports = router;
