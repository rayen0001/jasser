const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    birthday: {
        type: Date
    },
    phone: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    avatar: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        enum: ['male', 'female']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('User', userSchema);