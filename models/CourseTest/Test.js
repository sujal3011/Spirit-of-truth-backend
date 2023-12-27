const mongoose = require('mongoose');


const TestSchema = new mongoose.Schema({
   title: {type: String,required: true},
    creatorId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'user'
    },
    courseId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'course'
    },
    noOfQuestions: {type: Number,dafault:0,required: false},
    passPercentage: {type: Number,dafault:80,required: false},
   
  },{ timestamps: true });
  
  const Test = mongoose.model('test', TestSchema);
  
module.exports = Test;