const mongoose = require('mongoose');
const Module = require("./Module");


const CourseSchema = new mongoose.Schema({
    title: {type: String,required: true},
    modules: [Module],
  },{ timestamps: true });
  
  const Course = mongoose.model('course', CourseSchema);
  
  module.exports = Course;