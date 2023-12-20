const mongoose = require('mongoose');


const QuizSchema = new mongoose.Schema({
   title: {type: String,required: true},
    creatorId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'user'
    },
    noOfQuestions: {type: Number,dafault:0,required: false},
   
  },{ timestamps: true });
  
  const Quiz = mongoose.model('quiz', QuizSchema);
  
module.exports = Quiz;