const express = require('express');
const router = express.Router();
const Notify = require('../models/Notify')
const { ensureAuth, logedIn } = require('../midlleware/auth')

router.get('/', ensureAuth, (req, res) => {
    //duyệt tất cả các phòng để hiện lên 
    let id = req.user.id
    let role = req.user.role
    let isAD = false
    let isSV = false
    role.forEach(function(item) {
        if (item === 'AD') {
            isAD = true
        }
        if (item === 'sv') {
            isSV = true
        }
    })
    return res.render('thongBao', { role, isAD, id, isSV })
})

router.get('/:room', ensureAuth, (req, res) => { // truy cập thông báo của phòng hoặc all
    let page = req.query.page || 1
    if (isNaN(page) || parseInt(page) < 1) {
        let AD = false
        req.user.role.forEach(function(item) {
            if (item === 'AD') {
                AD = true
            }
        })
        return res.render('DetailNotify', { isAD: AD, notFound: true })
    }
    let { room } = req.params
        //duyệt db để đổ dữ liệu
    let ListNoties = new Map()
        // sử dụng simple pagination để phân cấp dữ liệu thành nhiều bộ
    let role = req.user.role
    let t = false //kiểm tra room để đổ toàn bộ thông báo hay thông báo của một phòng
    if (room === 'all') {
        t = true
    }
    let isAD = false //kiểm tra người dùng có phải là ADmin kh để điều chỉnh modal thông báo cho đúng
    let isSV = false //kiểm tra người dùng là sv thì kh hiện phần thêm thông báo
    role.forEach(function(item) {
        if (item === 'AD') {
            isAD = true
        }
        if (item === 'sv') {
            isSV = true
        }
    })
    let count = 0 //Count cho all thông báo
    if (t) { // trường hợp url là notification/all
        Notify.find()
            .then(n => {
                n.forEach(function(item) {
                    count += 1
                })
            })
        Notify.find().sort({ createAt: -1 })
            .skip((page - 1) * 10)
            .limit(10)
            .then(noties => {
                noties.forEach(function(item) {
                    let r = false
                    role.forEach(function(item2) {
                        if (item2 === 'AD') {
                            r = true
                        }
                        if (item2 === item._doc.room) {
                            r = true
                        }
                    })
                    let n = {
                        id: item._doc._id,
                        title: item._doc.title,
                        room: item._doc.room,
                        haveRole: r
                    }
                    ListNoties.set(n.id, n)
                })
                let notFound = false
                if (page > Math.ceil(count / 10)) {
                    notFound = true
                } else if (page < 1) {
                    notFound = true
                }
                let pages = Math.ceil(count / 10) //kiểm tra trường hợp phòng kh có thông báo nào thì chỉ hiện 1
                if (pages == 0) {
                    pages = 1
                    page = 1
                }
                let isRole = true
                if (isSV) {
                    isRole = false
                }
                return res.render('DetailNotify', { notFound, current: page, pages, room, t, role, isAD, ListNoties: Array.from(ListNoties.values()), isSV, roleOfRoom: isRole })
            })
            .catch(error => {
                console.log(error)
            })
    } else { //trường hợp url là notification/:room
        Notify.find({ room: room })
            .then(n => {
                n.forEach(function(item) {
                    count += 1
                })
            })
            //console.log(count)
        Notify.find({ room }).sort({ createAt: -1 })
            .skip((page - 1) * 10)
            .limit(10)
            .then(noties => {
                let roleOfRoom = false
                if (isAD) { roleOfRoom = true }
                role.forEach(function(item) {
                    if (item === room) { roleOfRoom = true }
                })
                noties.forEach(function(item) {
                    let n = {
                        id: item._doc._id,
                        title: item._doc.title,
                        room: item._doc.room,
                        haveRole: roleOfRoom
                    }
                    ListNoties.set(n.id, n)
                })
                let pages = Math.ceil(count / 10) //kiểm tra trường hợp phòng kh có thông báo nào thì chỉ hiện 1
                if (pages == 0) {
                    pages = 1
                    page = 1
                }
                return res.render('DetailNotify', { isAD, current: page, pages, room, t, role, roleOfRoom, ListNoties: Array.from(ListNoties.values()), isSV })

            })
            .catch(error => {
                console.log(error)
            })
    }
    //có hai giá trị đưa vào render là true v false, vì phân biệt để hiện modal thêm thông báo cho cho all hoặc cho phòng
    //return res.render('DetailNotify', { room, t, role, isAD })

})

router.post('/', ensureAuth, (req, res) => {
    let id = req.user.id
        //console.log(req.body.title)
    let { title, content, room } = req.body
        //console.log(title, content, room)
    let noti = new Notify({
        user: id,
        title: title,
        room: room,
        content: content
    })
    noti.save()
        .then(() => {
            return res.json({ code: 200, message: 'Thêm thông báo thành công', data: noti })
                //return res.redirect(`/${room}`)
        })
        .catch(e => {
            console.log(e)
        })
        //return res.json({ code: 200, message: "thêm thành công" })
})

router.get('/noty/:id', ensureAuth, (req, res) => { //đọc một thông báo cụ thể
    let id = req.params.id
    Notify.findOne({ _id: id })
        .then(n => {
            if (n) {
                console.log(n)
                    //return res.json({ code: 200, message: 'Tìm thông báo thành công', data: n })
                return res.json({ code: 200, message: 'success read', data: n })
            } else {
                return res.json({ code: 504, message: "Không tìm thấy thông báo nào" })
            }
        })
})

router.get('/noti/:id', ensureAuth, (req, res) => { //get lấy dữ liệu thông báo
    let id = req.params.id
    let isAD = false //xét hiện admin/add ở layout
    req.user.role.forEach(item => {
        if (item === 'AD') {
            isAD = true
        }
    })
    let role = req.user.role
    let roleOfRoom = false //kiểm tra xem người dùng có quyền chỉnh sửa thông báo này kh
    Notify.findOne({ _id: id })
        .then(n => {
            if (n) {
                //console.log(n)
                //return res.json({ code: 200, message: 'Tìm thông báo thành công', data: n })
                role.forEach(function(item) {
                    if (item === n._doc.room) {
                        roleOfRoom = true
                    }
                    if (item === 'AD') {
                        roleOfRoom = true
                    }
                })
                return res.render('NotifyItem', { isAD, n, roleOfRoom })
            } else {
                return res.json({ code: 504, message: "Không tìm thấy thông báo nào" })
            }
        })
})

router.post('/noti/edit', ensureAuth, (req, res) => {
    let { id, title, content } = req.body
        //console.log(id, title, content)
    Notify.findByIdAndUpdate(id, {
            title: title,
            content: content
        }, {
            new: true
        })
        .then(u => {
            if (u) {
                return res.json({ code: 200, message: 'edit susscess', data: u })
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

router.post('/delete', ensureAuth, (req, res) => {
    let { id } = req.body
    Notify.findByIdAndDelete(id, function(err, docs) {
        if (err) {
            return res.json({ code: 405, message: 'không tìm thấy thông báo nào' })
        } else {
            return res.json({ code: 200, message: 'Xoa thanh cong', data: docs })
        }
    })
})


module.exports = router;