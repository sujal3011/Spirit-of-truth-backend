const express = require("express");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Course = require("../models/course/Course");
const router = express.Router();

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
router.post("/donations-admin", async (req, res) => {
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

    const donations = await Transaction.find({})
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

module.exports = router;
