const express = require('express');
require('dotenv').config();
const db = require('./config/db');
const morgan = require('morgan');
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const path = require('path')
const session = require('express-session')
const passport = require('passport')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
const fs = require('fs')
const moment = require('moment');
const socketio = require('socket.io')
const { ensureAuth } = require('./midlleware/auth');

const app = express();

//MongoDB connect
db.connect();


//Passport config
require('./config/passport')(passport)

//cookie
app.use(cookieParser());
//sesssion
app.use(session({
    secret: 'ct',
    resave: true,
    saveUninitialized: true
}))

//flash
app.use(flash());

// view engine handlbars
app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        formatDate: function(datetime) {

            format = "HH:mm DD.MM.YYYY"
            return moment(datetime).format(format);

        },
        equal: function(v1, v2, options) {

            if (JSON.stringify(v1) == JSON.stringify(v2)) {
                return options.fn(this);
            }
            return options.inverse(this)
        },
        times: function(n, block) {
            let accum = ''
            for (let i = 1; i <= n; ++i) {
                accum += block.fn(i)
            }
            return accum
        },

        backCurrent: function(value) {
            if (value === 1) {
                return ''
            } else {
                return "?page=" + (value - 1).toString();
            }
        }
    }

}));
app.set('view engine', '.hbs');



// passport midleware
app.use(passport.initialize());
app.use(passport.session());


//json
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// morgan
app.use(morgan('combined'));

// set static folder
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', require('./routes'))
app.use('/users', require('./routes/user'))
app.use('/auth', require('./routes/auth'))
app.use('/admin', require('./routes/adminRoute'))
app.use('/post', ensureAuth, require('./routes/post'))
app.use('/comment', ensureAuth, require('./routes/comment'))
app.use('/notification', require('./routes/notification'))


const PORT = process.env.PORT || 3000

const httpServer = app.listen(PORT, () => {
    console.log('http://localhost:' + PORT);
});

const io = socketio(httpServer)

io.on('connection', client => {
    //console.log(`Client ${client.id} connected`)

    //client.on('disconnect', () => console.log(`${client.id} has lelf`))

    client.on('newNotifycation', (noti) => {
        client.broadcast.emit("newNotifycation", noti)
    })
})