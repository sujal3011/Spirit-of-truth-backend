const mongoose = require('mongoose');
const Module = require("./Module");


const CourseSchema = new mongoose.Schema({
    creatorId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'user'
    },
    title: {type: String,required: true},
    publishedStatus: {type: Boolean,default: false,required: false},
    courseType: {type:String,default:'individual',required:false},  //individual or bundle
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
    isPaid: {type:Boolean,default:false,required:false},
    coursePrice : {type:Number,default:0,required:false},
  },{ timestamps: true });
  
  const Course = mongoose.model('course', CourseSchema);
  
  module.exports = Course;