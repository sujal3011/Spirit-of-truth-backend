const mongoose = require('mongoose');
const Module = require("./Module");


const CourseSchema = new mongoose.Schema({
    creatorId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'user'
    },
    title: {type: String,required: true},
    modules: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'module'
      }
  ],
  },{ timestamps: true });
  
  const Course = mongoose.model('course', CourseSchema);
  
  module.exports = Course;