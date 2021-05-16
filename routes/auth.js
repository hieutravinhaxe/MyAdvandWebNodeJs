const express = require('express');
const router = express.Router();
const passport = require('passport')



//GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

//GET /auth/google/callback
router.get('/google/callback', passport.authenticate('google', { failureFlash: true, failureRedirect: '/users/login' }),
    (req, res) => {
        res.redirect('/')
    })

router.post('/local', passport.authenticate('local', { failureFlash: true, failureRedirect: '/users/login', successRedirect: '/', badRequestMessage: 'Vui lòng nhập đầy đủ thông tin', }))

module.exports = router