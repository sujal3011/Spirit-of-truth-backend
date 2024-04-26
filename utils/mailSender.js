const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Outlook SMTP server
  port: 587,
  secure: false, // Use true for port 465, false for others
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function mailSender(email, title, body) {
  try {
    const info = await transporter.sendMail({
      from: email,
      to: process.env.MAIL_USER,
      subject: `${title} from ${email}`,
      sender: email,
      text: title,
      html: `<p>${body}</p>`,
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

async function verifyEmail(email, verificationToken, origin) {
  const url = origin;
  console.log("url", url);
  // env === "Development"
  //   ? process.env.REACT_APP_FRONTEND_URL_DEV
  //   : process.env.REACT_APP_FRONTEND_URL_PROD;

  try {
    const info = await transporter.sendMail({
      from: `<no-reply@gmail.com>`,
      to: email,
      subject: `Confirm Spirit of Truth N.A.C. Login`,

      text: "Verification email",
      html: `<style>
      body {
        font-family: sans-serif;
        margin: 0;
      }
      a {
        color: #333;
        text-decoration: none;
      }
    </style>
    <p>Thank you for joining the Spirit of Truth Native American Church educational portal.</p>
    <p>Before you can log into your portal, you must confirm your email by clicking on the button below.</p>
    <button><a href="${url}/Signin/${verificationToken}">CONFIRM</a></button>
    <p>If you have any issues, please <a href="${url}/ContactUs">Contact Us</a>.</p>
    <p>Sincerely,</p>
    <p>Website Administrator</p>
    <p>Spirit of Truth Native American Church</p>
  `,
      contentType: "text/html",
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
