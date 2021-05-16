const mongoose = require('mongoose')

const User = new mongoose.Schema({
    googleID: {
        type: String
    },
    name: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    password: String,
    role: [String],
    image: {
        type: String
    },
    class: String,
    faculty: String,
    createAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('User', User)