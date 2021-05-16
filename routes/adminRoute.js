const express = require('express');
const fs = require('fs')
const router = express.Router();
const { logedIn, ensureAuth } = require('../midlleware/auth')

const db = require('../config/db');
const passport = require('passport')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const User = require('../models/User')
const { validationResult } = require('express-validator')
const addUserValidator = require('../validator/checkAddUser')



router.get('/add', ensureAuth, (req, res) => {
    let isAD = false
    let role = req.user.role
    role.forEach(function(item) {
        if (item === 'AD') {
            isAD = true
        }
    })
    if (isAD) {
        User.find({ email: { $not: /@student.tdtu.edu.vn/i } }, 'name email role')
            .then(users => {
                return res.render('PhanQuyen', { isAD, users })
            })
            .catch(error => {
                console.log(error)
            })
    } else {
        return res.render('PhanQuyen', { isAD, users: undefined })
    }

})

router.post('/add', ensureAuth, (req, res) => {
    let { Name, Email, Role, Password } = req.body
        //console.log(Name, Email, Role, Password)
    User.findOne({ email: Email })
        .then(u => {
            if (u) {
                return res.json({ code: 202, message: 'Email đã tồn tại' })
            }
        })
    let t = false //kiểm tra xem phân quyền có bị dư khi vừa admin vừa các phòng ban không
    Role.forEach(function(item) {
        if (item === 'AD') {
            t = true
        }
    })
    if (t) {
        Role = ['AD']
    }
    bcrypt.hash(Password, 10)
        .then(hashed => {
            //console.log(hashed)
            let user = new User({
                name: Name,
                email: Email,
                password: hashed,
                role: Role
            })

            // create user folder by email 
            let folder = __dirname.split('\\').slice(0, -1).join('\\') + '/public/uploads/' + user.email
            console.log(folder);
            fs.mkdir(folder, err => {
                if (err) {
                    console.error(err);
                }
            })
            user.save()
                .then((u) => {
                    return res.json({ code: 200, message: "them thành công", data: u })
                })
                .catch(e => {
                    return res.render('PhanQuyen', { errAdd: 'Email đã tồn tại', users, })
                })



        })

})


router.post('/edit', ensureAuth, (req, res) => {
    let { idUser, editRole, editEmail } = req.body
    let t = false
    editRole.forEach(function(item) {
        if (item === 'AD') {
            t = true
        }
    })
    if (t) {
        editRole = ['AD']
    }
    let user = undefined
    User.find({ email: editEmail })
        .then(u => {
            if (u) {
                user = u
            } else {
                return res.json({ code: 505, message: 'Không tìm thấy người dùng' })
            }
        })
        .catch(e => {
            return res.json({ code: 202, message: e.message })
        })
    User.findByIdAndUpdate(idUser, {
            role: editRole
        }, {
            new: true
        })
        .then(u => {
            if (u) {
                return res.json({ code: 200, message: 'edit susscess', data: editRole })
            } else return res.json({ code: 505, message: 'Không tìm thấy user' })
        })
        .catch(e => {
            if (e.message.includes('Cast to ObjectId failed')) {
                return res.json({ code: 202, message: 'Id không hợp lệ' })
            } else {
                return res.json({ code: 202, message: e.message })
            }
        })
})
module.exports = router