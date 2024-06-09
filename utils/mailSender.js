const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Outlook SMTP server
  // host: "smtp.office365.com", // Outlook SMTP server
  port: 587,
  secure: false, // Use true for port 465, false for others
  // secure: true,
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

  console.log("email", process.env.MAIL_USER);

  try {
    const info = await transporter.sendMail({
      // from: `<no-reply@gmail.com>`,
      from: '"donotreply@spiritoftruthnativeamericanchurch.org" <noreply@spiritoftruthnativeamericanchurch.org>',
      to: email,
      subject: `Confirm Spirit of Truth N.A.C. Login`,

      text: "Verification email",
      html: `<style>
      body {
        font-family: sans-serif;
        margin: 0;
      }
      .confirm-button {
        padding: 1rem; 
        border-radius: 0.7rem;  
        background-color: #303f60; 
        color: white;
        transition: background-color 0.2s ease-in-out;
      }
      .confirm-button:hover {
        background-color: #263b55; 
      }
      .confirm-button:focus {
        outline: none;
      }
    </style>
    <p style="font-family: sans-serif;">Thank you for joining the Spirit of Truth Native American Church educational portal.</p>
    <p style="font-family: sans-serif;">Before you can log into your portal, you must confirm your email by clicking on the button below.</p>
    <button style="padding: 0.7rem; border-radius: 0.3rem; background-color: #0066cc; color: white; transition: background-color 0.2s ease-in-out;">
      <a href="${url}/Signin/${verificationToken}" style="text-decoration: none; color: white;">CONFIRM</a>
    </button>
    <p style="font-family: sans-serif;">If you have any issues, please <a href="${url}/ContactUs" style="text-decoration: none; color: blue;">Contact Us</a>.</p>
    <p style="font-family: sans-serif;">Sincerely,</p>
    <p style="font-family: sans-serif;">Website Administrator</p>
    <p style="font-family: sans-serif;">Spirit of Truth Native American Church</p>
  `,
      contentType: "text/html",
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

async function forgetPasswordEmail(email, resetToken, origin) {
  const url = origin;
  console.log("url", url);

  try {
    const info = await transporter.sendMail({
      from: `donotreply@spiritoftruthnativeamericanchurch.org`,
      to: email,
      subject: `Password Reset Request`,

      text: "Password reset email",
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
      <p style="font-family: sans-serif;">We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
      <p style="font-family: sans-serif;">To reset your password, click the link below:</p>
      <button style="padding: 0.7rem; border-radius: 0.3rem; background-color: #0066cc; color: white; transition: background-color 0.2s ease-in-out;"><a href="${url}/CreateNewPass/${resetToken}" style="text-decoration: none; color: white;">RESET PASSWORD</a></button> <!-- Update URL -->
     <p style="font-family: sans-serif;">If you have any issues, please <a href="${url}/ContactUs" style="text-decoration: none; color: blue;">Contact Us</a>.</p>
      <p>Best regards,</p>
       <p style="font-family: sans-serif;">Website Administrator</p>
      <p style="font-family: sans-serif;">Spirit of Truth Native American Church</p>
    `,
      contentType: "text/html",
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = { mailSender, verifyEmail, forgetPasswordEmail };

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
