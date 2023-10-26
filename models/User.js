const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true,
    },
    password: String,

    
},{ timestamps: true });
const User=mongoose.model('user', UserSchema);
module.exports = User