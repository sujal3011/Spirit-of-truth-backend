const mongoose = require('mongoose');
const User = require('./User');


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
    zipcode: {type: Number,required: true},
    country: {type: String,required: true},
    phone: {type: Number,required: true,unique: true},
    birthdate: {type: Date,required: true},
    image: {type: String,required: false},
    dralawalletaddress: {type: String,required: false},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
},{ timestamps: true });
const Profile=mongoose.model('profile', ProfileSchema);
module.exports = Profile