const mongoose = require('mongoose');

//Schema for the uploaded pdfs
const FileSchema = new mongoose.Schema({
    sectionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'section'
    },
    originalname: {
        type: String,
        required: true,
    },
    filename: {
        type: String,
        required: true,
    },

}, { timestamps: true });


const File = mongoose.model('file', FileSchema);
module.exports = File