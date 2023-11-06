const mongoose = require('mongoose');


const ProfileSchema = new mongoose.Schema({
    firstname: {type: String,required: true},
    middlename: {type: String,required: false},
    lastname: {type: String,required: true},
    spiritualname: {type: String,required: false},
    sex: {type: String,required: true},
    addressline1: {type: String,required: true},
    addressline2: {type: String,required: false},
    state: {type: String,required: true},
    city: {type: String,required: true},
    zipcode: {type: String,required: true},
    country: {type: String,required: true},
    phone: {type: Number,required: true,unique: true},
    birthdate: {type: Date,required: true},
    image: { type:String,required: true},
    dralawalletaddress: {type: String,required: false},
    email: {type: String,required: true},
    
},{ timestamps: true });
const Profile=mongoose.model('profile', ProfileSchema);
module.exports = Profile