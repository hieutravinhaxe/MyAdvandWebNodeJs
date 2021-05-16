const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../midlleware/auth')
const Post = require('../models/Post')
const Notify = require('../models/Notify')

router.get('/', ensureAuth, (req, res) => {
    let isAD = false
    req.user.role.forEach(element => {
        if (element === 'AD') {
            isAD = true
        }
    });

    const currentUser = {
        name: req.user.name,
        _id: req.user._id,
        image: req.user.image
    }
    console.log(currentUser);

    let noties = undefined
    Notify.find().sort({ createAt: -1 }).limit(10)
        .then(n => {
            noties = n
        })
        .catch(e => {
            console.log(e);
            return res.send('fail')
        })

    Post.find({}).sort({ createAt: -1 }).limit(10).populate('user', 'name image _id').populate({
            path: 'comments',
            populate: { path: 'friend', select: 'name image _id' }
        }).lean()
        .then(p => {
            return res.render('dashboard', { isAD, posts: p, currentUser, noties })
        })
        .catch(e => {
            console.log(e);
            return res.send('fail')
        })


});

router.get('/loadmore', ensureAuth, (req, res) => {

    const { page } = req.query;

    if (!page) {
        return res.json({ code: 404 })
    }

    const currentUser = {
        name: req.user.name,
        _id: req.user._id,
        image: req.user.image
    }

    skip = parseInt(page) * 10

    Post.find().exec(function(err, results) {
        let count = results.length
        if (count < skip) {
            return res.json({ code: 504, message: 'đã tải hết bài viết' })
        }
    });


    Post.find().sort({ createAt: -1 }).skip(skip).limit(10).populate('user', 'name image _id').populate({
            path: 'comments',
            populate: { path: 'friend', select: 'name image _id' }
        }).lean()
        .then(p => {
            res.json({ code: 200, posts: p, currentUser })
        })
        .catch(e => {
            console.log(e);
            return res.send('fail')
        })
})


router.get('/loadmoreprofile', ensureAuth, (req, res) => {

    const { page, id } = req.query;

    if (!page || !id) {
        return res.json({ code: 404 })
    }

    const currentUser = {
        name: req.user.name,
        _id: req.user._id,
        image: req.user.image
    }

    skip = parseInt(page) * 10

    Post.find({ user: id }).exec(function(err, results) {
        let count = results.length
        if (count < skip) {
            return res.json({ code: 504, message: 'đã tải hết bài viết' })
        }
    });


    Post.find({ user: id }).sort({ createAt: -1 }).skip(skip).limit(10).populate('user', 'name image _id').populate({
            path: 'comments',
            populate: { path: 'friend', select: 'name image _id' }
        }).lean()
        .then(p => {
            res.json({ code: 200, posts: p, currentUser })
        })
        .catch(e => {
            console.log(e);
            return res.send('fail')
        })
})

module.exports = router;