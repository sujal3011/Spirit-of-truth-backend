const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for others
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Encapsulate logic in an async function
async function mailSender(email, title, body) {
  try {
    const info = await transporter.sendMail({
      from: email, // sender address
      to: process.env.MAIL_USER, // list of receivers
      subject: `${title} from ${email}`, // Subject line
      sender: email,
      text: title, // plain text body
      html: `<p>${body}</p>`, // html body
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

async function verifyEmail(email, verificationToken) {
  const env = process.env.NODE_ENV;

  const url =
    env === "Development"
      ? process.env.REACT_APP_FRONTEND_URL_DEV
      : process.env.REACT_APP_FRONTEND_URL_PROD;

  try {
    const info = await transporter.sendMail({
      from: `<no-reply@gmail.com>`, // sender address
      to: email, // list of receivers
      subject: `Confirm Spirit of Truth N.A.C. Login`, // Subject line

      text: "Verification email", // plain text body
      html: `<p>Thank you for joining the Spirit of Truth Native American Church educational portal.</p>
      <p>Before you can log into your portal, you must confirm your email by clicking on the button below.</p>
      <button><a href="${url}/Signin/${verificationToken}">CONFIRM</a></button>
      <p>If you have any issues, please <a href=${url}/ContactUs>Contact Us</a>.</p>
      <p>Sincerely,</p>
      <p>Website Administrator</p>
      <p>Spirit of Truth Native American Church</p>`, // html body
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = { mailSender, verifyEmail };

// const mailSender = async (email, title, body) => {
//   try {
//     let transporter = nodemailer.createTransport({
//       host: process.env.MAIL_HOST,
//       service: "gmail",
//       port: 465,
//       auth: {
//         user: process.env.MAIL_USER,
//         pass: process.env.MAIL_PASS,
//       },
//     });
//     let info = await transporter.sendMail({
//       to: process.env.MAIL_USER,
//       from: email,
//       subject: title,
//       html: body,
//     });
//     console.log("Email info: ", info);
//     return info;
//   } catch (error) {
//     console.log(error.message);
//   }
// };
// module.exports = mailSender;
