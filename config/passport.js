const GoogleStrategy = require('passport-google-oauth20').Strategy
const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const User = require('../models/User')
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')


module.exports = (passport) => {

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
        passReqToCallback: true
    },
        async (req, acessToken, refreshToken, profile, done) => {

            const newUser = {
                googleID: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                image: profile.photos[0].value,
                role: 'sv'
            }

            let tailEmail = profile._json.hd

            if (tailEmail !== 'student.tdtu.edu.vn') {
                return done(null, false, req.flash('error', 'email không được hổ trợ'));
            }

            try {
                let user = await User.findOne({ googleID: profile.id })

                if (user) {
                    done(null, user)
                } else {
                    // creat user folder by email 
                    let folder = __dirname.split('\\').slice(0, -1).join('\\') + '/public/uploads/' + newUser.email

                    fs.mkdirSync(folder, err => {
                        if (err) {
                            console.error(err);
                        }
                    })
                    user = await User.create(newUser)

                    done(null, user)
                }

            } catch (error) {
                console.log('lỗi: ' + error);
            }
        }))

    passport.use(
        new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, (email, password, done) => {

            if (!email || !password) {
                return done(null, false, { message: 'Vui lòng nhập email và password' })
            } else {
                let acc = undefined
                User.findOne({ email: email })
                    .then(user => {
                        if (!user) {
                            //Email không tồn tại
                            return done(null, false, { message: 'Email hoặc password không đúng' })
                        }

                        acc = user
                        return bcrypt.compare(password, acc.password)
                    })
                    .then(passwordMatch => {
                        if (!passwordMatch) {
                            return done(null, false, { message: 'Email hoặc password không đúng' })
                        }
                        return done(null, acc)
                    })
                    .catch(err => console.log(err))
            }

        })
    )

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
}