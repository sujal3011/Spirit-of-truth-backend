const express = require("express");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Course = require("../models/course/Course");
const router = express.Router();
const moment = require("moment");
const Profile = require("../models/Profile");
const { default: mongoose } = require("mongoose");

//Create donations
router.post("/make-donation", async (req, res) => {
  try {
    const { userId, orderId, initialAmount } = req.body;
    if (!orderId) {
      return res.status(404).json({ message: "no orderId provided" });
    }
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "no user no transaction" });
    }

    const newTransaction = await Transaction.create({
      userId,
      orderId,
      amount: initialAmount,
      status: "Completed",
    });

    user.donations.push(newTransaction._id);
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "payment made successfully" });
  } catch (error) {
    console.log("cant make transaction", error);
    return res
      .status(400)
      .json({ message: error.message || "Error making donations" });
  }
});

//get  user  donations
router.post("/donations", async (req, res) => {
  const { page = 1, count = 5 } = req.query;
  const { userId } = req.body;
  try {
    const parsedPage = parseInt(page);
    const parsedCount = parseInt(count);
    if (
      isNaN(parsedPage) ||
      isNaN(parsedCount) ||
      parsedPage < 1 ||
      parsedCount < 1
    ) {
      throw new Error("Invalid page or count parameter");
    }

    const donations = await Transaction.find({ userId })
      .skip((parsedPage - 1) * parsedCount)
      .limit(parsedCount);

    const totalDonations = await Transaction.countDocuments();

    res.status(200).json({ donations, total: totalDonations });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ message: error.message || "Error fetching donations" });
  }
});

//get all donations for admin
// router.post("/donations-admin", async (req, res) => {
//   const { page = 1, count = 50 } = req.query;
//   const { userId } = req.body;
//   try {
//     const parsedPage = parseInt(page);
//     const parsedCount = parseInt(count);
//     if (
//       isNaN(parsedPage) ||
//       isNaN(parsedCount) ||
//       parsedPage < 1 ||
//       parsedCount < 1
//     ) {
//       throw new Error("Invalid page or count parameter");
//     }

//     const donations = await Transaction.find({})
//       .sort({ _id: -1 })
//       .skip((parsedPage - 1) * parsedCount)
//       .limit(parsedCount)
//       .exec();

//     const totalDonations = await Transaction.countDocuments();

//     res.status(200).json({ donations, total: totalDonations });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(400)
//       .json({ message: error.message || "Error fetching donations" });
//   }
// });
router.post("/donations-admin", async (req, res) => {
  try {
    const donations = await Transaction.find({}).sort({ _id: -1 });

    const totalDonations = await Transaction.countDocuments();
    console.log("donations for admin", donations);
    res.status(200).json({ donations, total: totalDonations });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ message: error.message || "Error fetching donations" });
  }
});

//Course-payments
router.post("/buy-course", async (req, res) => {
  try {
    const { userId, orderId, initialAmount, courseId } = req.body;
    if (!orderId) {
      console.log("orderid  not found");
      return res.status(404).json({ message: "no orderId provided" });
    }
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "no user no transaction" });
    }
    const course = await Course.findOne({ _id: courseId });

    if (!course) {
      console.log("couse not found");
      return res
        .status(400)
        .json({ message: error.message || "No course found" });
    }

    const newTransaction = await Transaction.create({
      userId: userId,
      orderId,
      courseId,
      purchasedItems: course.title,
      amount: initialAmount,
      status: "Completed",
    });

    user.donations.push(newTransaction._id);
    await user.save();
    console.log("userid", userId);
    course.purchasedBy.push(userId);
    console.log("purchaseed successfully");
    await course.save();
    return res
      .status(200)
      .json({ success: true, message: "payment made successfully" });
  } catch (error) {
    console.log("cant make transaction", error);
    return res
      .status(400)
      .json({ message: error.message || "Cannot buy the course" });
  }
});

async function generateDownloadData(donations) {
  let downloadData = "";

  // Add a header row with column names
  downloadData += `"amount","name","createdAt"\n`;

  for (const donation of donations) {
    try {
      const user = await User.findById(donation.userId);

      if (user === null) {
        console.log("donationid", donations.userId);
      }

      const profile = await Profile.findOne({ email: user?.email });

      if (profile) {
        donation.name = `${profile?.firstname} ${profile?.middlename} ${profile?.lastname}`;
      } else if (!profile || !user) {
        donation.name = `User has been deleted`;
      }
    } catch (error) {
      console.log("errrrrorrr", "errror donations id", donation);
    }
  }

  for (const donation of donations) {
    downloadData += `"${donation.amount}",${donation.name},"${moment(
      donation.createdAt
    ).format("YYYY-MM-DD")}"\n`;
  }

  return downloadData;
}
router.get("/download", async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const donations = await Transaction.find({
      date: { $gte: startDate, $lte: endDate },
    });
    const profiles = [];

    const downloadData = await generateDownloadData(donations);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=donations.csv");
    res.send(downloadData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating download");
  }
});

router.post("/addDonation", async (req, res) => {
  try {
    const {
      amount,
      userId,
      orderId,
      status,
      purchasedItems,
      donationDate,
      description,
    } = req.body;

    // let newdonationDate = donationDate + "T00:00:00.000+00:00";
    const transaction = await Transaction.create({
      amount,
      userId,
      orderId,
      status,
      purchasedItems,
      donationDate,
      description,
    });

    return res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    return res.status(404).json("Couldn't add the transaction");
  }
});

router.put("/updateStatus", async (req, res) => {
  try {
    const { status, transactionId } = req.body;

    const transaction = await Transaction.findById(transactionId);

    transaction.status = status;
    await transaction.save();

    return res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.log("errror", error);
    return res.status(404).json("Couldn't update  the status of transaction");
  }
});
module.exports = router;
