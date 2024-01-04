const mongoose = require('mongoose');

const CourseBundleSchema = new mongoose.Schema({
   title: {type: String,required: true},
    creatorId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'user'
    },
    courses: [
      {
          courseId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'course'
          },
          courseNo: { type: Number, required: true }
      }
  ],
    publishedStatus: {type: Boolean,default: false,required: false},
   
  },{ timestamps: true });
  
  const CourseBundle = mongoose.model('coursebundle', CourseBundleSchema);
  
module.exports = CourseBundle;