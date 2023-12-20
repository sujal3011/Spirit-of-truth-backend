const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    testId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'test'
    },
    statement: {type: String,required: true},
    options: {
        type: [String],
        required: true
    },
    answer: {type: String,required: true},
   
},{ timestamps: true });
  
const Question = mongoose.model('question', QuestionSchema);
  
module.exports = Question;