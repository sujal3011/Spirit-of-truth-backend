const mongoose = require('mongoose');
const Module = require("./Module");


const CourseSchema = new mongoose.Schema({
    creatorId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'user'
    },
    title: {type: String,required: true},
    publishedStatus: {type: Boolean,default: false,required: false},
    modules: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'module'
      }
    ],
    instructors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    prerequisiteCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'course'
  }]
  },{ timestamps: true });
  
  const Course = mongoose.model('course', CourseSchema);
  
  module.exports = Course;