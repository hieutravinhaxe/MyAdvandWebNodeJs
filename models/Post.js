const mongoose = require('mongoose')

const Post = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: String
    },
    comments : [{
        friend: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        body: {
            type: String
        },
        createAt: {
            type: Date
        }
    }],
    file: String,
    linkYoutube: String,
    createAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('Post', Post)