const mongoose = require('mongoose');
const Section = require("./Section");


const ModuleSchema = new mongoose.Schema({
    courseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'course'
    },
    title: {type: String,required: true},
    sections: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'section'
        }
    ],
  },{ timestamps: true });
  
  const Module = mongoose.model('module', ModuleSchema);
  
  module.exports = Module;