const mongoose = require('mongoose');
const File = require("./File");


const SectionSchema = new mongoose.Schema({
    moduleId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'module'
    },
    title: {type: String,required: true},
    body: {type: String,required: true},
    videoUrl: {type: String,required: false},
    pdfs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'file'
        }
    ],
    order: {type: Number,required: true},
  },{ timestamps: true });
  
  const Section = mongoose.model('section', SectionSchema);
  
  module.exports = Section;