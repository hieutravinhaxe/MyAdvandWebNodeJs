const express = require('express');
const multer = require('multer')
const router = express.Router();
const bcrypt = require('bcrypt');
const { ensureAuth, logedIn } = require('../midlleware/auth')
const passport = require('passport')
const User = require('../models/User')
const fs = require('fs')
const path = require('path');

const upload = multer({ dest: __dirname.split('\\').slice(0, -1).join('\\') + '/uploads/' })
const Notify = require('../models/Notify')
const Post = require('../models/Post')

router.get('/login', logedIn, (req, res) => {
    let error = req.flash('error') || []
    res.render('login', { error, layout: false });
});

router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/users/login');
})

/*
router.post('/login', (req, res, next) => {
    if (req.body.email === '' || req.body.password === '') {
        req.flash('error', 'Vui lòng nhập đầy đủ thông tin')
        return res.redirect('/users/login')
    } else {
        passport.authenticate('local', { failureFlash: true, failureRedirect: '/users/login', successRedirect: '/' })
            (req, res, next)
    }

})
*/

// Change password
router.post('/changePwd', ensureAuth, (req, res) => {

    const { id, newPwd } = req.body
    bcrypt.hash(newPwd, 10).then(hashed => {
        User.findByIdAndUpdate(id, { password: hashed },
            function(err, docs) {
                if (err) {
                    console.log(err)
                } else {
                    return res.json({ code: 200, message: "update thành công" })
                }
            });
    })

    //res.redirect('/users/profile')
})


// [get]
// /users/profile
router.get('/profile', ensureAuth, (req, res) => {

    res.redirect(`/users/profile/${req.user.id}`)

    // let isAD = false //xét hiện admin/add ở layout
    // req.user.role.forEach(item => {
    //     if (item === 'AD') {
    //         isAD = true
    //     }
    // })
    // let success = req.flash('success') || ''
    // const currentUser = {
    //     name: req.user.name,
    //     _id: req.user._id,
    //     image: req.user.image
    // }

    // let t = true;
    // Post.find({ user: req.user.id }).sort({ createAt: -1 }).populate('user', 'name image _id').populate({
    //         path: 'comments',
    //         populate: { path: 'friend', select: 'name image _id' }
    //     }).lean()
    //     .then(p => {
    //         User.findOne({ _id: req.user.id })
    //             .then(u => {
    //                 if (u) {
    //                     //console.log(listPost)
    //                     return res.render('Profile', { isAD, user: u, t, success, posts: p, currentUser })
    //                 } else {
    //                     return res.json({ code: 404, message: 'Không tìm thấy người dùng' })
    //                 }
    //             })
    //             .catch(e => {
    //                 if (e.message.includes('Cast to ObjectId failed')) {
    //                     return res.json({ code: 404, message: "id không hợp lệ" })
    //                 }
    //                 return res.json({ code: 202, messagee: e.message })
    //             })
    //     })
    //     .catch(e => {
    //         console.log(e);
    //         return res.send('fail')
    //     })
})

router.get('/profile/:id', ensureAuth, (req, res) => {
    let isAD = false //xét hiện admin/add ở layout
    let isSV = false //xét là sv để ẩn hiện change Password
    req.user.role.forEach(item => {
        if (item === 'AD') {
            isAD = true
        }
        if (item === 'sv') {
            isSV = true
        }
    })
    let idOwner = req.user.id
    let { id } = req.params
    let t = false
    if (idOwner === id) {
        t = true
    } else {
        t = false
    }
    const currentUser = {
        name: req.user.name,
        _id: req.user._id,
        image: req.user.image
    }

    if (id) {
        Post.find({ user: id }).sort({ createAt: -1 }).limit(10).populate('user', 'name image _id').populate({
                path: 'comments',
                populate: { path: 'friend', select: 'name image _id' }
            }).lean()
            .then(p => {
                User.findById(id)
                    .then(u => {
                        if (u) {
                            //console.log(t)
                            if (t) {
                                return res.render('Profile', { isSV, isAD, user: u, t, id: idOwner, posts: p, currentUser, idClient: id })
                            } else {
                                return res.render('Profile', { isSV, isAD, user: u, id: idOwner, posts: p, currentUser, idClient: id })
                            }
                        } else {
                            return res.json({ code: 505, message: 'Không tìm thấy người dùng' })
                        }
                    })
                    .catch(e => {
                        if (e.message.includes('Cast to ObjectId failed')) {
                            return res.json({ code: 505, message: "id không hợp lệ" })
                        }
                        return res.json({ code: 202, messagee: e.message })
                    })
            })
            .catch(e => {
                console.log(e);
                return res.send('fail')
            })
    }
})



router.post('/profile/:id', (req, res) => {
    const { content, file, link } = req.body
        // console.log(req.body)
    let post = new Post({
        content,
        file,
        link
    })
    post.save()
        .then(() => {
            return res.json({ code: 0, message: 'Thêm thành công', data: post })
        })
        .catch(e => {
            return res.json({ code: 2, message: e.message })
        })
})

// [POST]
// /user/edit
router.post('/edit', ensureAuth, (req, res) => {
    const { name, userClass, faculty } = req.body;

    User.findOneAndUpdate({ _id: req.user.id }, {
        name: name,
        class: userClass,
        faculty: faculty
    }, err => {
        if (err) {
            console.log(err);
        }
    })

    req.flash('success', 'Sửa thông tin thành công')
    res.redirect('/users/profile')

})


/// edit avatara
router.post('/avatar', ensureAuth, upload.single('avatar'), (req, res) => {

    if (!req.file) {
        res.send('fail')
    }
    const avatar = req.file;
    const newPath = __dirname.split('\\').slice(0, -1).join('\\') + `/public/uploads/${req.user.email}/${avatar.filename}`
    const src = `/uploads/${req.user.email}/${avatar.filename}`

    fs.rename(avatar.path, newPath, function(err) {
        if (err) throw err
    })

    User.findById(req.user.id)
        .then(u => {
            if (u.image) {
                let oldImage = __dirname.split('\\').slice(0, -1).join('\\') + `/public/uploads/${req.user.email}/${u.image.split('/').slice(-1)}`
                if (fs.existsSync(oldImage)) {
                    fs.unlink(oldImage, function(err) {
                        if (err) throw err;
                    });
                }

            }

        })
        .catch(e => {
            if (e) throw e
        })

    User.findOneAndUpdate({ _id: req.user.id }, {
        image: src,
    }, err => {
        if (err) throw err
    })

    res.redirect('/users/profile')
})


module.exports = router;