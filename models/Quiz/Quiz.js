const mongoose = require('mongoose');


const QuizSchema = new mongoose.Schema({
   title: {type: String,required: true},
    creatorId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'user'
    },
    publishedStatus: {type: Boolean,default: false,required: false},
    noOfQuestions: {type: Number,dafault:0,required: false},
    passPercentage: {type: Number,dafault:80,required: false},
   
  },{ timestamps: true });
  
  const Quiz = mongoose.model('quiz', QuizSchema);
  
module.exports = Quiz;