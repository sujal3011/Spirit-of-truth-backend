const mongoose = require('mongoose');

const QuizCategorySchema = new mongoose.Schema({
    name: {type: String,required: true},
   
},{ timestamps: true });
  
const QuizCategory = mongoose.model('quizquestion', QuizCategorySchema);
  
module.exports = QuizCategory;