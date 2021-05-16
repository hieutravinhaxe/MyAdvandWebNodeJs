const express = require('express');
const router = express.Router();
const Post = require('../models/Post')
const path = require('path')
const fs = require('fs');
const multer = require('multer');


const upload = multer({ dest: 'uploads/' })

router.post('/add', upload.single('file'), (req, res) => {

  const { content, linkYoutube } = req.body
  const file = req.file

  if (linkYoutube && file) {
    res.json({ code: 401, message: 'Chỉ đăng ảnh hoặc link video youtube' })
  }

  let idVideo = linkYoutube.split('v=')[1]

  if (file) {
    let newPath = __dirname.split('\\').slice(0, -1).join('\\') + `/public/uploads/${req.user.email}/${file.filename}`
    const src = `/uploads/${req.user.email}/${file.filename}`

    fs.rename(file.path, newPath, function (err) {
      if (err) throw err
    })

    Post.create({
      user: req.user.id,
      content: content,
      file: src
    })
      .then((p) => {
        let newpost = p.toObject()
        return res.json({ code: 200, message: 'okkk', p: newpost })
      })

  } else if (linkYoutube) {
    let idVideo = linkYoutube.split('v=')[1]
    Post.create({
      user: req.user.id,
      content: content,
      linkYoutube: idVideo
    })
      .then((p) => {
        let newpost = p.toObject()
        return res.json({ code: 200, message: 'okkk', p: newpost })
      })
  } else {
    Post.create({
      user: req.user.id,
      content: content
    })
      .then((p) => {
        let newpost = p.toObject()
        return res.json({ code: 200, message: 'okkk', p: newpost })
      })
  }
})

router.get('/delete', async (req, res) => {
  const { id } = req.query

  if (!id) {
    return res.json({ 'code': 404, 'message': 'Bài viết không hợp lệ' })
  }

  let post = await Post.findOne({ _id: id })

  if (!post) {
    return res.json({ 'code': 404, 'message': 'Bài viết tồn tại' })
  }
  else if (post.user != req.user.id) {
    return res.json({ 'code': 403, 'message': 'Không đủ quyền để thực hiện thao tác' })
  }

  Post.findOneAndDelete({ _id: id })
    .then((p) => {
      if (p.file) {
        let path = __dirname.split('\\').slice(0, -1).join('\\') + `/public${p.file}`
        fs.unlink(path, (err) => {
          if (err) throw err;
        })
      }
      return res.json({ 'code': 200, 'message': 'ok' })
    })
    .catch(e => {
      console.log(e);
      return res.json({ 'code': 500, 'message': 'Đã có lỗi xảy ra' })
    })


})

router.post('/edit', upload.single('file'), (req, res) => {

  const { id, content, linkYoutube } = req.body
  const file = req.file

  if (!id) {
    res.json({ code: 404, message: 'Bài viết không tồn tại' })
  }
  else if (linkYoutube && file) {
    res.json({ code: 401, message: 'Chỉ đăng ảnh hoặc link video youtube' })
  }

  if (file) {
    const src = `/uploads/${req.user.email}/${file.filename}`
    let newPath = __dirname.split('\\').slice(0, -1).join('\\') + `/public/uploads/${req.user.email}/${file.filename}`
    

    Post.findOneAndUpdate({ _id: id }, {
      content: content,
      file: src,
      linkYoutube: null
    }, (err, p) => {
      if (err) throw err
      
      if(p.file) {
        let oldPath = __dirname.split('\\').slice(0, -1).join('\\') + `/public${p.file}`
        fs.unlink(oldPath, (err) => {
          if (err) throw err;
        })
      }
      
      fs.rename(file.path, newPath, (err) => {
        if (err) throw err;
      })
    })
    

  }
  else if(linkYoutube) {
    let idVideo = linkYoutube.split('v=')[1]
    Post.findOneAndUpdate({ _id: id }, {
      content: content,
      file: null,
      linkYoutube: idVideo
    }, (err, p) => {
      if (err) throw err

      if(p.file){
        let oldPath = __dirname.split('\\').slice(0, -1).join('\\') + `/public${p.file}`
        fs.unlink(oldPath, (err) => {
          if (err) throw err;
        })
      }

    })
  } 
  else {
    Post.findOneAndUpdate({ _id: id }, {
      content: content,
      file: null,
      linkYoutube: null
    })
    .then(p => {
      if(p.file){
        let oldPath = __dirname.split('\\').slice(0, -1).join('\\') + `/public${p.file}`
        fs.unlink(oldPath, (err) => {
          if (err) throw err;
        })
      }
      console.log(p);
    })
  }

  Post.findById(id)
  .then( p => {
    res.json({code: 200, p})
  })
})



module.exports = router;