const mongoose = require('mongoose')

const Notify = new mongoose.Schema({
    id: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String
    },
    content: {
        type: String
    },
    room: {
        type: String
    },
    createAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Notify', Notify)