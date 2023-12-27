const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const axios = require('axios');

const User=require("../models/User");
const Course = require("../models/course/Course");
const Quiz = require("../models/Quiz/Quiz");
const QuizQuestion = require("../models/Quiz/QuizQuestion");


// const authenticateAdmin =  require("../../middleware/authenticateAdmin");
// const authenticateAdminInstructor =  require("../../middleware/authenticateAdminInstructor");


// Creating a new Quiz
router.post(
    "/create",
    async (req, res) => {
      try {
        
        let quiz = await Quiz.create({
            title: req.body.title,
            creatorId: req.body.creatorId,
            passPercentage: req.body.passPercentage,
            category:req.body.category,
        });
        res.status(201).json({ success: true, quiz: quiz });

      } catch (err) {
        res.status(500).send("Internal server error");
        console.log(err);
      }
    }
);

// Creating a new Quiz Category
router.post('/category/add', async (req, res) => {
  try {
    const { name } = req.body;
    const createdQuizCategory = await QuizCategory.create({ name });

    res.status(201).json({ success: true, category: createdQuizCategory });
  } catch (err) {
    res.status(400).json({ success:false,message: err.message });
  }
});

// Updating a Quiz Category
router.put('/category/update', async (req, res) => {
  const { originalName,newName } = req.body;
  try {
    const updatedQuizCategory = await QuizCategory.findOneAndUpdate(
      { name: originalName },
      { name: newName },
      { new: true }
    );

    if (!updatedQuizCategory) {
      return res.status(404).json({ success:false,message: 'Quiz category not found' });
    }

    return res.status(200).json({ success: true, category:updatedQuizCategory });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Getting all quizzes
router.get('/all', async (req, res) => {
    try {
      const quizzes = await Quiz.find();
      if(!quizzes){
        return res.status(404).json({ success: false, message: 'Quizzes not found' });
      }
      res.status(200).json({ success: true, quizzes: quizzes });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

// Adding a new question to a Quiz
router.post(
    "/question/add",
    async (req, res) => {

    const quiz = await Quiz.findById(req.body.quizId);
    if(!quiz){
        return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    try {
        let question = await QuizQuestion.create({
            statement: req.body.statement,
            quizId: req.body.quizId,
            options: req.body.options,
            answer: req.body.answer,
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

// Getting all questions of a Quiz
router.get(
  "/question/all/:quizId",
  async (req, res) => {

  const quiz = await Quiz.findById(req.params.quizId);
  if(!quiz){
    return res.status(404).json({ success: false, message: 'Quiz not found' });
  }
  try {
  const questions = await QuizQuestion.find({quizId:req.params.quizId});
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

// Getting a quiz question by its Id
router.get('/question/:questionId', async (req, res) => {
  try {
    const questionId = req.params.questionId;
    const question = await QuizQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Qiz Question not found' });
    }
    return res.status(200).json({ success: true, question });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Updating quiz details
router.put('/update/:quizId', async (req, res) => {
  const { quizId } = req.params;
  const { title,passPercentage,category} = req.body;
  try {
      const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, { title,passPercentage,category }, { new: true });

      if (!updatedQuiz) {
          return res.status(404).json({ success: false, message: 'Quiz not found' });
      }

      return res.status(200).json({ success: true, quiz:updatedQuiz });
  } catch (error) {
      console.error('Error updating quiz title:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Updating a question
router.put('/question/:questionId', async (req, res) => {
  const questionId = req.params.questionId;
  const { statement, options, answer } = req.body;
  try {
    const updatedQuestion = await QuizQuestion.findByIdAndUpdate(
      questionId,
      { statement, options, answer },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ success: true });
    }

    res.json({ success: true, question: updatedQuestion });
  } catch (err) {
    res.status(500).json({ success: true, error: err.message });
  }
});

module.exports = router;