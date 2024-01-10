const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const axios = require('axios');

const User=require("../../models/User");
const Course = require("../../models/course/Course");
const Test = require("../../models/CourseTest/Test");
const Question = require("../../models/CourseTest/Question");

const authenticateAdmin =  require("../../middleware/authenticateAdmin");
const authenticateAdminInstructor =  require("../../middleware/authenticateAdminInstructor");


// Creating a new Test
router.post(
    "/create",
    async (req, res) => {
      try {
        
        const course = await Course.findById(req.body.courseId);
        if(!course){
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        let test = await Test.create({
            title: req.body.title,
            creatorId: req.body.creatorId,
            courseId: req.body.courseId,
            passPercentage: req.body.passPercentage,
        });
        res.status(201).json({ success: true, test: test });

      } catch (err) {
        res.status(500).send("Internal server error");
        console.log(err);
      }
    }
);

// Getting a test by its id
router.get('/:testId', async (req, res) => {
  const { testId } = req.params;

  try {
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ success: false });
    }
    res.status(200).json({ success:true,test });
  } catch (error) {
    res.status(500).json({ success: false,message:"Internal Server Error" });
  }
});


// Adding a new question to a Test
router.post(
    "/question/add",
    async (req, res) => {

    const test = await Test.findById(req.body.testId);
    if(!test){
        return res.status(404).json({ success: false, message: 'Test not found' });
    }
    try {
        let question = await Question.create({
            statement: req.body.statement,
            testId: req.body.testId,
            options: req.body.options,
            answer: req.body.answer,
            questionNo:req.body.questionNo,
    });
    // test.noOfQuestions += 1;
    // await test.save();
    res.status(201).json({ success: true, question: question });

    } catch (err) {
        res.status(500).send("Internal server error");
        console.log(err);
      }
    }
);

// Getting all questions of a Test
router.get(
  "/question/all/:testId",
  async (req, res) => {

  const test = await Test.findById(req.params.testId);
  if(!test){
    return res.status(404).json({ success: false, message: 'Test not found' });
  }
  try {
  const questions = await Question.find({testId:req.params.testId});
  if(!questions){
    return res.status(404).json({ success: false, message: 'Questions not found' });
  }
  res.status(200).json({ success: true, questions: questions });

  } catch (err) {
      res.status(500).send("Internal server error");
      console.log(err);
    }
  }
);

// Finding test of a Course
router.get(
  "/get-by-course/:courseId",
  async (req, res) => {
  try {

    const course = await Course.findById(req.params.courseId);
    if(!course){
        return res.status(404).json({ success: false, message: 'Course not found' });
    }
    const test = await Test.findOne({courseId:req.params.courseId});
    if(!test){
        return res.status(200).json({ success: false, message: 'Test not found' });
    }  
    res.status(200).json({ success: true, test: test });

  } catch (err) {
      res.status(500).send("Internal server error");
      console.log(err);
    }
  }
);

// Getting a question by its Id
router.get('/question/:questionId', async (req, res) => {
  try {
    const questionId = req.params.questionId;
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    return res.status(200).json({ success: true, question });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Updating a question
router.put('/question/:questionId', async (req, res) => {
  const questionId = req.params.questionId;
  const { statement, options, answer,questionNo } = req.body;
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { statement, options, answer, questionNo },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ success: false });
    }

    res.json({ success:true, question: updatedQuestion });
  } catch (err) {
    res.status(500).json({ success: true, error: err.message });
  }
});

module.exports = router;