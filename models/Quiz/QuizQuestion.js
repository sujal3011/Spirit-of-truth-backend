const mongoose = require('mongoose');

const QuizQuestionSchema = new mongoose.Schema({
    quizId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'quiz'
    },
    statement: {type: String,required: true},
    options: {
        type: [String],
        required: true
    },
    answer: {type: String,required: true},
   
},{ timestamps: true });
  
const QuizQuestion = mongoose.model('quizquestion', QuizQuestionSchema);
  
module.exports = QuizQuestion;