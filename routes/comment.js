const express = require('express');
const router = express.Router();
const Post = require('../models/Post')

router.post('/add', (req, res) => {

    const { body, id } = req.body

    if (!body || !id) {
        return res.json({ code: 404, message: 'noi dung hoac id khong ton tai' })
    }

    let comment = {
        friend: req.user.id,
        body: body,
        createAt: Date.now()
    }

    Post.findOneAndUpdate({ _id: id }, {

        $push: {
            comments: comment
        },

    }, (err) => {
        if (err) throw err

        Post.findOne({_id: id})
        .then(p => {
            
            let comment = p.comments[p.comments.length - 1]
            comment = comment.toObject()
            res.json({code: 200, comment})
        })
        .catch(e => console.log(e))
    })

})


router.get('/delete', async (req, res) => {
    const {idpost, id} = req.query

    console.log(id, idpost);
    if (!id || !idpost) {
        return res.json({code: 404, message: 'id không hợp lệ'})
    }

    const auth = await Post.findOne({
        '_id': idpost,
        'comments._id': id,
        'comments.friend': req.user._id
        
    })

    if(!auth) {
        return res.json({code: 403, message: 'Bạn không đủ quyền thực hiện thao tác'})
    }

    Post.findOneAndUpdate({ _id: idpost }, {

        $pull: {
            comments: {
                _id: id
            }
        }

    }, (err) => {
        if (err) throw err

        return res.json({code: 200, message: 'okkkk'})
    })
    
 })

module.exports = router;