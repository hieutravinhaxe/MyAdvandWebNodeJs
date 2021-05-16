$(document).ready(function() {

    let socket = io()
    socket.on('connection', () => console.log('connected'))
    socket.on('disconnet', () => console.log('disconect'))
    socket.on('newNotifycation', function(noti) {
            $.notify.addStyle('foo', {
                html: "<div>" +
                    "<div class='clearfix'>" +
                    "<div class='title' data-notify-html='title'/>" +
                    "<div class='buttons'>" +
                    "<button class='no'>Cancel</button>" +
                    "</div>" +
                    "</div>" +
                    "</div>"
            });

            $.notify({
                title: "<a href=/notification/noti/" + noti.id + ">Phòng " + noti.room + " vừa đăng một thông báo mới</a>"
            }, {
                style: 'foo',
                autoHide: true,
                clickToHide: true
            });
            addNotifyToTop10(noti);
        })
        /*===== SHOW NAVBAR  =====*/
    const showNavbar = (toggleId, navId, bodyId, headerId) => {
        const toggle = document.getElementById(toggleId),
            nav = document.getElementById(navId),
            bodypd = document.getElementById(bodyId),
            headerpd = document.getElementById(headerId)

        // Validate that all variables exist
        if (toggle && nav && bodypd && headerpd) {
            toggle.addEventListener('click', () => {
                // show navbar
                nav.classList.toggle('show')
                    // change icon
                toggle.classList.toggle('bx-x')
                    // add padding to body
                bodypd.classList.toggle('body-pd')
                    // add padding to header
                headerpd.classList.toggle('body-pd')
            })
        }
    }

    showNavbar('header-toggle', 'nav-bar', 'body-pd', 'header')

    /////////////////////////
    /*===== LINK ACTIVE  =====*/
    const linkColor = document.querySelectorAll('.nav__link')

    function colorLink() {
        if (linkColor) {
            linkColor.forEach(l => l.classList.remove('active'))
            this.classList.add('active')
        }
    }
    linkColor.forEach(l => l.addEventListener('click', colorLink))


    ///////////////////////////////


    $('#addUserBtn').click(function() {
        let name = $('#Name').val()
        let email = $('#Email').val()
        let password = $('#Password').val()
        let role = $('#Role')
        const selected = document.querySelectorAll('#Role option:checked');
        const selectedValues = Array.from(selected).map(option => option.value);
        //console.log(selectedValues)

        if (name === '') {
            alert('Chưa nhập tên người dùng')
        } else if (email === '') {
            alert('Chưa nhập email')
        } else if (password.length < 6) {
            alert('Mật khẩu không được nhỏ hơn 6 kí tự')
        } else if (selectedValues.length < 1) {
            alert('Chưa chọn phân quyền')
        } else {
            let data = JSON.stringify({
                Name: name,
                Email: email,
                Password: password,
                Role: selectedValues
            })
            fetch('https://socialstdportal1820.herokuapp.com/admin/add', {
                    method: 'POST',
                    body: data,
                    headers: {
                        'Content-Type': 'application/json'
                            // 'Content-Type': 'application/x-www-form-urlencoded',
                    },

                })
                .then(res => res.json())
                .then(json => {
                    //console.log(json)
                    if (json.code === 202) {
                        alert(json.message)
                    }
                    if (json.code === 200) {
                        //console.log(json)
                        let r = ''
                        json.data.role.forEach(function(item) {
                            r = r + `<li>${item}</li>`
                        })

                        let t = `<tr>
                                    <td>${json.data.name}</td>
                                    <td>${json.data.email}</td>
                                    <td id="${json.data._id}">
                                        <ul>
                                            ${r}
                                        </ul>
                                        
                                    </td>
                                    <td class="text-center"> <button data-toggle="modal" data-target="#editModal" data-id="${json.data._id}"
                                            data-role="${json.data.role}" data-email="${json.data.email}"
                                            data-name="${json.data.name}" type="button"
                                            class="btn btn-outline-primary btnEditUser" id="editBtn"><i
                                                class="fas fa-edit mr-2 btnEditUser"></i>Edit</button> </td>
                                </tr>`

                        $('#listUser').append(t)
                        $('#addModal').modal('hide')
                        $('#addModal #Name').val('')
                        $('#addModal #Email').val('')
                        $('#addModal #Password').val('')
                    }
                })
                .catch(e => {
                    console.log(e)
                })
        }

    })


    $('#editUser').click(function(e) { //nhấn save
        //let role = $('#editRole')
        //let name = $('#editName').val()
        let email = $('#editEmail').val()
        let id = $('#idUser').val()
        let selected = document.querySelectorAll('#editRole option:checked');
        let selectedValues = Array.from(selected).map(option => option.value)
            //console.log(selectedValues)
        if (selectedValues.length < 1) {
            alert('Chưa chọn phân quyền')
        } else {

            let data = JSON.stringify({
                    idUser: id,
                    editRole: selectedValues,
                    editEmail: email
                })
                //console.log(title, content)
            fetch('https://socialstdportal1820.herokuapp.com/admin/edit', {
                    method: 'POST',
                    body: data,
                    headers: {
                        'Content-Type': 'application/json'
                            // 'Content-Type': 'application/x-www-form-urlencoded',
                    },
                })
                .then(res => res.json())
                .then(json => {
                    if (json.code === 200) {
                        let t = '<ul>'
                        $(`#${id} ul`).remove()
                        json.data.forEach(function(item) {
                            t = t + `<li>${item}<li>`
                        })
                        t = t + '</ul>'
                        $(`#${id}`).html(`${t}`)
                    }
                    //console.log(json)
                    $('#editModal').modal('hide')
                })
                .catch(e => {
                    console.log(e)
                })
        }
    })


    //edit granted
    $('.btnEditUser').click(function(e) { //nhấn edit
        let btn = e.target
        let id = btn.dataset.id
        let name = btn.dataset.name
        let email = btn.dataset.email
            //let role = btn.dataset.role
            //console.log(id, name, email)
        $('#editName').val(name)
        $('#editEmail').val(email)
        $('#idUser').val(id)

        //$('#editModal').modal('show')
    })

    $('#btnComment').click(function(e) {
        let idPost = $('#new-post').val()
        let comment = $('#comment').val()

        let data = JSON.stringify({
                id: idPost,
                comment: comment
            })
            //console.log(comment)
        fetch('https://socialstdportal1820.herokuapp.com/post/comment', {
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'application/json'
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            .then(res => res.json())
            .then(json => {
                if (json.code === 200) {
                    let t = '<ul>'
                    $(`#${id} ul`).remove()
                    json.data.forEach(function(item) {
                        t = t + `<li>${item}<li>`
                    })
                    t = t + '</ul>'
                    $(`#${id}`).html(`${t}`)
                }
                //console.log(json)
            })
            .catch(e => {
                console.log(e)
            })
    })

    $('.btnComment').click(function(e) {
        let btn = e.target
        let comment = btn.dataset.comment

        $('#comment').val(comment)
    })

    $('#editBtn').click(function(e) {

        const btn = e.target
        const id = btn.dataset.id
        const name = btn.dataset.name
        const email = btn.dataset.email
        const role = btn.dataset.role

        $('#editModal #editName').attr('value', name)
        $('#editModal #editEmail').attr('value', email)
        $('#editModal #idUser').attr('value', id)
    })


    $('.btnLinkYoutube').click(function(e) {
        $('#linkYoutubeModal').modal('show')
    })


    // profile.hbs
    $('.btnEditProfile').click(function(e) {
        const btn = e.target
            // const id = btn.dataset.id
        const name = btn.dataset.name
        const lop = btn.dataset.class
        const faculty = btn.dataset.faculty

        $('#editProfileModal #inputName').attr('value', name)
            // $('#editProfileModal #idUser').attr('value', id)
        $('#editProfileModal #inputClass').attr('value', lop)
        $('#editProfileModal #inputFaculty').attr('value', faculty)

        $('#editProfileModal').modal('show')
    })

    $('.btnSaveProfile').click(function() {
        let name = $('#inputName').val()
        let lop = $('#inputClass').val()
        let faculty = $('#inputFaculty').val()

        if (name === '' || lop === '' || faculty === '') {
            alert("Vui lòng nhập đầy đủ thông tin")
        }
    })

    $('#btnEditPwd').click(function(e) { // edit pwd
        let btn = e.target
        let id = btn.dataset.id
        $('#idUserChangePwd').val(id)
        $('#changePasswordModal').modal('show')
    })

    $('.btnSavePassword').click(function() {
        let id = $('#idUserChangePwd').val()
        let newPwd = $('#newPwd').val()
        let confirmPwd = $('#confirmNewPwd').val()
            //console.log(id, newPwd, confirmPwd)
        if (newPwd !== confirmPwd) {
            alert('Mật khẩu xác nhận không chính xác')
        } else {
            let data = JSON.stringify({
                id: id,
                newPwd: newPwd
            })
            fetch('https://socialstdportal1820.herokuapp.com/users/changePwd', {
                    method: 'POST',
                    body: data,
                    headers: {
                        'Content-Type': 'application/json'
                            // 'Content-Type': 'application/x-www-form-urlencoded',
                    }
                })
                .then(res => res.json())
                .then(json => {
                    if (json.code === 200) {
                        $('#idUserChangePwd').val('')
                        $('#newPwd').val('')
                        $('#changePasswordModal').modal('hide')
                        $.notify("Bạn vừa đổi password thành công", "success")
                    }
                    //console.log(json)
                })
                .catch(e => {
                    console.log(e)
                })
        }
    })


    $('.saveEditNotify').click(function() { //nhấn save edit notify ở danh sách các thông báo
        let title = $('#editTitle').val()
        let content = $('#editContent').val()
        let id = $('#idNotify').val()
            //console.log(id, content, title)
        let data = JSON.stringify({
                id: id,
                title: title,
                content: content
            })
            //console.log(title, content, id)
        fetch('https://socialstdportal1820.herokuapp.com/notification/noti/edit', {
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'application/json'
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                }
            })
            .then(res => res.json())
            .then(json => {
                if (json.code === 200) {
                    $('#idNotify').val('')
                    $('#editTitle').val('')
                    $('#editContent').val('')
                    $('#editNotiModal').modal('hide')
                        //sửa thông báo lại
                    $(`#${json.data._id} .titleNoty`).html(json.data.title)
                }
                //console.log(json)
            })
            .catch(e => {
                console.log(e)
            })
    })

    $('.saveEditNotify2').click(function() {
        //alert('clcik')
        let id = $('#idNotify2').val()
        let title = $('#editTitle2').val()
        let content = $('#editContent2').val()
            //console.log(id, title, content)
        let data = JSON.stringify({
            id: id,
            title: title,
            content: content
        })
        fetch('https://socialstdportal1820.herokuapp.com/notification/noti/edit', {
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'application/json'
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                }
            })
            .then(res => res.json())
            .then(json => {
                if (json.code === 200) {
                    $('#idNotify2').val('')
                    $('#editTitle2').val('')
                    $('#editContent2').val('')
                    $('#editNotiModal2').modal('hide')
                        //sửa thông báo lại
                        //$(`#${json.data._id} .titleNoty`).html(json.data.title)
                    $('.newsTitle').html(json.data.title)
                    $('.newsContent').html(json.data.content)
                }
                //console.log(json)
            })
            .catch(e => {
                console.log(e)
            })
    })

    //Edit notify
    $('.btnEditNoty').click(function(e) { //nhấn chỉnh sửa
            let btn = e.target
            let id = btn.dataset.id
            console.log(id)
            fetch(`https://socialstdportal1820.herokuapp.com/notification/noty/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                            // 'Content-Type': 'application/x-www-form-urlencoded',
                    },
                })
                .then(res => res.json())
                .then(json => {
                    if (json.code === 200) {
                        //console.log(json.data)
                        let id = json.data._id
                        $('#idNotify').val(id)
                        $('#editTitle').val(json.data.title)
                        $('#editContent').val(json.data.content)
                        $('#editNotiModal').modal('show')
                    }
                    //console.log(json)
                })
                .catch(e => {
                    console.log(e)
                })
        })
        // $('.btnDeleteNoty').click(function(e) { //nhấn xóa thông báo
        //     //alert('clcik')
        //     let btn = e.target
        //     let id = btn.dataset.id
        //     let c = confirm('Bạn có chắc xóa không')
        //     if (c) {
        //         let data = JSON.stringify({
        //                 id: id
        //             })
        //             //console.log(title, content)
        //         fetch('https://socialstdportal1820.herokuapp.com/notification/delete', {
        //                 method: 'POST',
        //                 body: data,
        //                 headers: {
        //                     'Content-Type': 'application/json'
        //                         // 'Content-Type': 'application/x-www-form-urlencoded',
        //                 },
        //             })
        //             .then(res => res.json())
        //             .then(json => {
        //                 //nhan ve json.code 200 la xoa thanh cong
        //                 if (json.code === 200) {
        //                     //console.log(json.data)
        //                     $(`#${json.data._id}`).remove()
        //                 }
        //                 //console.log(json)
        //             })
        //             .catch(e => {
        //                 console.log(e)
        //             })
        //     }

    // })

    $('.btnCreateNotify').click(function(e) { //tạo thông báo trong cái phòng

        //let id = $('#idUser').val()
        let btn = e.target
        let id = btn.dataset.idUser
        let room = $('#room').find(":selected").val()
        let title = $('#inputChuDe').val()
        let content = $('#content').val()
            //console.log(id, room, title, content)
        if (title === "") {
            alert('Chưa nhập chủ đề')
        } else if (content === "") {
            alert('Chưa viết nội dung')
        } else {
            let data = JSON.stringify({
                    id: id,
                    title: title,
                    content: content,
                    room: room,
                })
                //console.log(title, content)
            fetch('https://socialstdportal1820.herokuapp.com/notification', {
                    method: 'POST',
                    body: data,
                    headers: {
                        'Content-Type': 'application/json'
                            // 'Content-Type': 'application/x-www-form-urlencoded',
                    },
                })
                .then(res => res.json())
                .then(json => {
                    if (json.code === 200) {
                        $('#AddNotiModal').modal('hide')
                        $('#AddNotiModal input').val('')
                        $('#AddNotiModal textarea').val('')

                        socket.emit('newNotifycation', {
                            "room": json.data.room,
                            "id": json.data._id,
                            "title": json.data.title
                        })
                    }
                    //nhận đc json.data là cái thông báo vừa thêm
                    //console.log(json)
                })
                .catch(e => {
                    console.log(e)
                })

        }
    })

    $('.btnEditNotify').click(function() { //nhấn save edit notify
        let title = $('#editTitle').val()
        let content = $('#editContent').val()
        let id = $('#idNotify').val()
            //console.log(id, content, title)
        let data = JSON.stringify({
                id: id,
                title: title,
                content: content
            })
            //console.log(title, content, id)
        fetch('https://socialstdportal1820.herokuapp.com/notification/noti/edit', {
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'application/json'
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                }
            })
            .then(res => res.json())
            .then(json => {
                if (json.code === 200) {
                    $('#idNotify').val('')
                    $('#editTitle').val('')
                    $('#editContent').val('')
                    $('#editNotiModal').modal('hide')
                        //sửa thông báo lại
                }
                //console.log(json)
            })
            .catch(e => {
                console.log(e)
            })
    })

    //detail notify
    $('#btnCreateNotify').click(function() { // nhấn tạo thông báo ở trong room
        $('#AddNotiModal2').modal('show')
    })

    $('.btnCreateNotify2').click(function(e) { // nhấn save khi tạo thông báo trong room
        //let id = $('#idUser').val()
        //alert('clc')
        let btn = e.target
        let room1 = btn.dataset.room
        let room = undefined
        if (room1 === 'all') {
            room = $('#room').find(":selected").val()
        } else {
            room = room1
        }

        let title = $('#inputChuDe').val()
        let content = $('#content').val()
            //console.log(id, room, title, content)
        if (title === "") {
            alert('Chưa nhập chủ đề')
        } else if (content === "") {
            alert('Chưa viết nội dung')
        } else {
            let data = JSON.stringify({
                    title: title,
                    content: content,
                    room: room,
                })
                //console.log(title, content)
            fetch('https://socialstdportal1820.herokuapp.com/notification', {
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'application/json'
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                },
            })

            //console.log(title, content)
            .then(res => res.json())
                .then(json => {
                    if (json.code === 200) {
                        if ($('#currentPage').val() === '1') {
                            $('#AddNotiModal2').modal('hide')
                            $('#AddNotiModal2 input').val('')
                            $('#AddNotiModal2 textarea').val('')
                                //console.log(json.data)
                            displayNotification(json.data)
                        } else {
                            $('#AddNotiModal2').modal('hide')
                            $('#AddNotiModal2 input').val('')
                            $('#AddNotiModal2 textarea').val('')
                            $.notify("Bạn vừa thêm thành công một thông báo", "success")
                        }
                        socket.emit('newNotifycation', {
                            "room": json.data.room,
                            "id": json.data._id,
                            "title": json.data.title
                        })
                    }
                })
                .catch(e => {
                    console.log(e)
                })

        }
    })

    //piture review
    document.getElementById('inputFile').addEventListener('change', function() {
        let file = this.files[0];
        if (file) {

            $('.inputYoutube').css('display', 'none')
            $('#linkYoutube').val('')
            $('.picture-review-div').css('display', 'block')

            let fileReader = new FileReader()

            fileReader.addEventListener('load', function() {
                document.getElementById('picture-review').setAttribute('src', this.result)
            })

            fileReader.readAsDataURL(file)
        }

    })

    //btn youtube
    $('.btnYoutube').click(() => {
        $('.inputYoutube').css('display', 'flex')
        $('.picture-review-div').css('display', 'none')
        $('#inputFile').val('')
    })

    //piture review modal
    document.getElementById('inputFileModal').addEventListener('change', function() {
        let file = this.files[0];
        if (file) {

            $('.inputYoutubeModal').css('display', 'none')
            $('#linkYoutubeModal').val('')
            $('.picture-review-div-modal').css('display', 'block')

            let fileReader = new FileReader()

            fileReader.addEventListener('load', function() {
                document.getElementById('picture-review-modal').setAttribute('src', this.result)
            })

            fileReader.readAsDataURL(file)
        }

    })

    //btn youtube modal
    $('.btnYoutubeModal').click(() => {
        $('.inputYoutubeModal').css('display', 'flex')
        $('.picture-review-div-modal').css('display', 'none')
        $('#inputFileModal').val('')
    })

    // Đăng bài viết mới
    $('#btnCreatePost').click(e => {
        e.preventDefault()

        let content = $('#content').val()
        let linkYoutube = $('#linkYoutube').val()
        let file = document.getElementById('inputFile').files[0]

        if (!file && !content && !linkYoutube) {
            alert('Vui lòng nhập nội dung')
        } else if (file && linkYoutube) {
            alert('Chỉ đăng ảnh hoặc link video youtube')
        } else {

            let formData = new FormData()
            formData.set('content', content)
            formData.set('file', file)
            formData.set('linkYoutube', linkYoutube)

            let xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://socialstdportal1820.herokuapp.com/post/add', true)
            xhr.addEventListener('load', e => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    let json = JSON.parse(xhr.responseText)
                    if (json.code === 200) {
                        displayPost(json.p)

                        toastr.success('Đăng bài viết thành công')

                    }
                }
            })

            xhr.send(formData)
        }

    })

    // sửa bài viết
    $('.btnSaveChangePost').click(e => {

        let id = e.target.id
        let content = $('#contentModal').val()
        let linkYoutube = $('#linkYoutubeModal').val()
        let file = document.getElementById('inputFileModal').files[0]

        if (!file && !content && !linkYoutube) {
            alert('Vui lòng nhập nội dung')
        } else if (file && linkYoutube) {
            alert('Chỉ đăng ảnh hoặc link video youtube')
        } else {

            let formData = new FormData()
            formData.set('id', id)
            formData.set('content', content)
            formData.set('file', file)
            formData.set('linkYoutube', linkYoutube)

            let xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://socialstdportal1820.herokuapp.com/post/edit', true)
            xhr.addEventListener('load', () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    let json = JSON.parse(xhr.responseText)
                    if (json.code === 200) {

                        displayPostWhenEdit(json.p)
                        toastr.success('Sửa bài viết thành công')
                    } else {
                        toastr.error('Sửa bài viết thất bại')
                    }


                }
            })

            xhr.send(formData)
        }

    })



    $('.btnSavePassword').click(function(e) {
        let newPwd = $('#newPwd').val()
        let confPwd = $('#confirmNewPwd').val()
            //console.log(newPwd, confPwd)
        if (newPwd !== confPwd) {
            e.preventDefault()
            alert('Mật khẩu xác nhận không trùng khớp')
        } else {
            $('#formChangePwd').submit()
        }
    })

})

var pageNumber = 1;
var load = true;

window.addEventListener('scroll', () => {
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - pageNumber) {
        if (load) {
            load = false
            let id = $('#page').attr('data-id')
            loadMore(id)
        }
    }

})


//lăng nghe sự kiện nhấn nút xóa
document.addEventListener('click', function(e) {
    let classname = e.target.className;
    if (classname.includes('btnDeletePost')) {
        let id = e.target.dataset.id
        delelePost(id)
    } else if (classname.includes('btnEditPost')) {
        displayModalEditPost(e.target)
    } else if (classname.includes('btnAddComment')) {
        let id = e.target.dataset.id
        addComment(id)
    } else if (classname.includes('btnDeleteComment')) {

        let id = e.target.dataset.id
        let idpost = e.target.dataset.idpost
        deleteComment(id, idpost)
    } else if (classname.includes('btnMoreCmt')) {
        let id = e.target.dataset.id
        showComment(id)
    }
})

function formateDate(d) {
    let today = new Date(d)
    let day = today.getDate() + "";
    let month = (today.getMonth() + 1) + "";
    let year = today.getFullYear() + "";
    let hour = today.getHours() + "";
    let minutes = today.getMinutes() + "";

    return hour + ':' + minutes + ' ' + day + '.' + month + '.' + year

}

function addNotifyToTop10(noti) { //khi có phòng khoa đăng thông báo thì add vào list Tb ở dashboard của những người đăng nhập
    let parent = document.getElementsByClassName('activitiez')[0]
    let first = parent.firstElementChild
    let item = document.createElement('li')
    item.innerHTML = `<div class="activity-meta">
                        <span class="acti-room">${noti.room}</span>
                        <br>
                        <span class="acti-room">Vừa xong</span>
                        <a href="/notification/noti/${noti.id}">
                            <h6>${noti.title}</h6>
                        </a>
                        </div>`
    parent.insertBefore(item, first)
    if (parent.children.length > 10) {

        parent.removeChild(parent.children[10])
    }
}


function showComment(id) {
    let queryComment = `#${id} .user-post .coment-area .we-comet .cmtItem`
    let queryBtnMoreCmt = `#${id} .user-post .coment-area .we-comet .btnMoreCmt`
    $(queryBtnMoreCmt).css('display', 'none')
    $(queryComment).css('display', 'block')

}

function loadMore(id) {

    if (!id) {
        fetch(`https://socialstdportal1820.herokuapp.com/loadmore?page=${pageNumber}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                        //'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            .then(res => res.json())
            .then(json => {

                if (json.code === 200) {
                    setTimeout(() => {
                        load = true
                    }, 500);
                    pageNumber++
                    displayMorePosts(json.posts, json.currentUser)
                } else if (json.code === 504) {
                    load = false
                }
            })
            .catch(e => console.log(e))
    } else {
        fetch(`https://socialstdportal1820.herokuapp.com/loadmoreprofile?page=${pageNumber}&id=${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                        //'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            .then(res => res.json())
            .then(json => {

                if (json.code === 200) {
                    setTimeout(() => {
                        load = true
                    }, 500);
                    pageNumber++
                    displayMorePosts(json.posts, json.currentUser)
                } else if (json.code === 504) {
                    load = false
                }
            })
            .catch(e => console.log(e))
    }



}

function displayMorePosts(posts, currentUser) {
    let parent = document.getElementsByClassName('loadMore')[0];

    posts.forEach((post) => {

        let createAt = formateDate(post.createAt)

        let item = document.createElement('div')
        item.classList.add("central-meta");
        item.classList.add("item");
        item.setAttribute('id', post._id)

        html = `<div class="user-post">
                    <div class="friend-info">
                        <figure>
                            <img src="${post.user.image}" alt="">
                        </figure>
                        <div class="friend-name">
                            <div>
                            <a href="/users/profile/${post.user._id}"><ins>${post.user.name}</ins></a>
                                <span>${createAt}</span>
                            </div>`

        if (post.user._id == currentUser._id) {
            html += `<div class="icon-setting">
                        <a class="link"><i data-id="${post._id}" data-content="${post.content}" data-file="${post.file}" data-linkyoutube="${post.linkYoutube}"
                                class="fas fa-wrench btnEditPost"></i></a>
                        <a class="link ml-1"><i class="fas fa-trash-alt btnDeletePost"
                                data-id="${post._id}"></i></a>
                    </div>`
        }

        html += `</div>
                    <div class="post-meta">
                        <div class="description">
                            <p>
                                ${post.content}
                            </p>
                        </div>`

        if (post.file) {
            html += `<img src="${post.file}" alt=""></img>`
        } else if (post.linkYoutube) {
            html += `<iframe width="100%" height="315"
            src="https://www.youtube.com/embed/${post.linkYoutube}"
            title="YouTube video player" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen></iframe>`
        }


        html += `</div>
                    </div>
                    <div class="coment-area">
                        <ul class="we-comet">
                            <li>
                                <a class="btnMoreCmt" data-id="${post._id}" title="" class="showmore underline">more
                                    comments</a>
                            </li>`

        if (post.comments) {

            post.comments.forEach(comment => {
                let createAtCom = formateDate(comment.createAt)
                html += `<li class="cmtItem" style="display: none;" id="${comment._id}">
                        <div class="comet-avatar">
                            <img src="${comment.friend.image}" alt="">
                        </div>
                        <div class="we-comment">
                            <div class="coment-head">
                                <h5><a href="${comment.friend._id}" title="">${comment.friend.name}</a></h5>
                                <span>${createAtCom}</span>`

                if (comment.friend._id == currentUser._id) {
                    html += `<i class="fas fa-trash-alt we-reply btnDeleteComment"
                                   data-id="${comment._id}" data-idpost="${post._id}"></i>`
                }

                html += `</div>
                            <p>${comment.body}</p>
                        </div>
                    </li>`
            })
        }

        html += `<li class="post-comment">
                        <div class="comet-avatar">
                            <img src="${currentUser.image}" alt="">
                        </div>
                        <div class="post-comt-box">
                            <textarea placeholder="Post your comment"></textarea>
                            <i data-id="${post._id}"
                                class="fas fa-paper-plane btn btn-default btnAddComment"></i>
                        </div>
                    </li>
                </ul>
            </div>
        </div>`

        item.innerHTML = html
        parent.append(item)
    })


}

setActiveForPagination();

//lăng nghe sự kiện nhấn nút xóa
document.addEventListener('click', function(e) {
    let classname = e.target.className;
    //console.log(classname);

    if (classname.includes('btnDeletePost')) {
        let id = e.target.dataset.id
        delelePost(id)
    } else if (classname.includes('btnEditPost')) {
        displayModalEditPost(e.target)
    } else if (classname.includes('btnAddComment')) {
        let id = e.target.dataset.id

        addComment(id)
    } else if (classname.includes('btnEditNoty')) {
        addNotify(e)
    } else if (classname.includes('btnDeleteNoty')) {
        deleteNotify(e)
    }
})

function showChangePwdModal(e) {
    alert('dadvakdhqvlhsu')
}

function deleteNotify(e) { //xóa thông báo trong room
    //alert('clcik')
    let btn = e.target
    let id = btn.dataset.id
    let c = confirm('Bạn có chắc xóa không')
    if (c) {
        let data = JSON.stringify({
                id: id
            })
            //console.log(title, content)
        fetch('https://socialstdportal1820.herokuapp.com/notification/delete', {
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'application/json'
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            .then(res => res.json())
            .then(json => {
                //nhan ve json.code 200 la xoa thanh cong
                if (json.code === 200) {
                    //console.log(json.data)
                    $(`#${json.data._id}`).remove()
                    $.notify("Bạn vừa xóa một thông báo", "success")
                }
                //console.log(json)
            })
            .catch(e => {
                console.log(e)
            })
    }

}

function addNotify(e) { //thêm thông báo trong room
    //nhấn chỉnh sửa
    let btn = e.target
    let id = btn.dataset.id
        //console.log(id)
    fetch(`https://socialstdportal1820.herokuapp.com/notification/noty/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        .then(res => res.json())
        .then(json => {
            if (json.code === 200) {
                //console.log(json.data)
                let id = json.data._id
                $('#idNotify').val(id)
                $('#editTitle').val(json.data.title)
                $('#editContent').val(json.data.content)
                $('#editNotiModal').modal('show')
            }
            //console.log(json)
        })
        .catch(e => {
            console.log(e)
        })

}
//thêm bình luận 
function addComment(id) {
    let queryComment = `#${id} .user-post .coment-area .we-comet .post-comment .post-comt-box textarea`
    let body = $(queryComment).val()

    if (body) {
        fetch('https://socialstdportal1820.herokuapp.com/comment/add', {
            method: 'POST',
            body: JSON.stringify({ body, id }),
            headers: {
                'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
            },
        })

        //console.log(title, content)
        .then(res => res.json())
            .then(json => {
                if (json.code === 200) {

                    displayComment(json.comment, id)
                    $(queryComment).val('')
                    toastr.success('thêm bình luận thành công')

                } else {
                    toastr.error('thêm bình luận thất bại')
                }

            })
            .catch(e => {
                console.log(e)
            })
    } else {
        $(queryComment).focus()
        toastr.warning('Vui lòng nhập nội dung')
    }

}


function displayComment(comment, id) {

    let queryPostComment = `#${id} .user-post .coment-area .we-comet .post-comment`
    let queryAvatar = `#${id} .user-post .coment-area .we-comet .post-comment .comet-avatar img`

    let postComment = $(queryPostComment)[0]

    let item = document.createElement('li')
    let name = $('#new-post-name').text()
    let avatar = $(queryAvatar).attr('src')


    item.classList.add('cmtItem')
    item.setAttribute('id', comment._id)

    item.innerHTML = `<div class="comet-avatar">
                        <img src="${avatar}"
                            alt="">
                    </div>
                    <div class="we-comment">
                        <div class="coment-head">
                            <h5><a href="/users/profile/${comment.friend}" title="">${name}</a></h5>
                            <span>Vừa xong</span>
                            <i class="fas fa-trash-alt we-reply btnDeleteComment"
                                            data-idpost="${id}" data-id="${comment._id}"></i>
                        </div>
                        <p>${comment.body}</p>
                    </div>`


    postComment.before(item)


}


function deleteComment(id, idpost) {
    let result = confirm("Bạn có muốn xóa bình luận");
    if (result) {
        fetch(`https://socialstdportal1820.herokuapp.com/comment/delete?idpost=${idpost}&id=${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                        //'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            .then(res => res.json())
            .then(json => {

                if (json.code === 200) {
                    $(`#${id}`).remove()
                    toastr.success('Xóa bình luận thành công')
                } else if (json.code === 404) {
                    toastr.error('bình luận tồn tại')

                } else if (json.code === 403) {
                    toastr.warning('Bạn không đủ quyền thực hiện thao tác')
                }

            })
            .catch(e => console.log(e))
    }
}

// hiển thị bài vừa đăng không cần load lại
function displayPost(p) {
    let file = document.getElementById('inputFile').files[0];
    let content = $('#content').val()
    let linkYoutube = $('#linkYoutube').val()
    let currentUserId = $('#current-user-id').attr('href')

    let name = $('#new-post-name').text()
    let avatar = $('#new-post-avatar').attr('src')
    let parent = document.getElementsByClassName('loadMore')[0];
    let firstItem = parent.firstElementChild
    let item = document.createElement('div')
    item.classList.add("central-meta");
    item.classList.add("item");
    item.setAttribute('id', p._id)

    if (file) {
        let fileReader = new FileReader()
        fileReader.addEventListener('load', function() {

            item.innerHTML = `<div class="user-post">
                                <div class="friend-info">
                                    <figure>
                                        <img src="${avatar}" alt="">
                                    </figure>
                                    <div class="friend-name">
                                        <div>
                                        <a href="${currentUserId}"><ins>${name}</ins></a>
                                            
                                            <span>Vừa xong</span>
                                        </div>
                                        <div class="icon-setting">
                                            <a class="link"><i class="fas fa-wrench btnEditPost"  data-content="${p.content}" data-file="${p.file}" data-id="${p._id}" ></i></a>
                                            <a class="link ml-1"><i class="fas fa-trash-alt btnDeletePost" data-id="${p._id}"></i></a>
                                        </div>
                                    </div>
                                    
                                    <div class="post-meta">
                                        <div class="description">
                                            <p>
                                                ${content}
                                            </p>
                                        </div>
                                        <img src="${this.result}" alt="">
                                    </div>
                                </div>
                                <div class="coment-area">
                                    <ul class="we-comet">
                                        <li class="post-comment">
                                            <div class="comet-avatar">
                                                <img src="${avatar}" alt="">
                                            </div>
                                            <div class="post-comt-box">
                                                <textarea placeholder="Post your comment"></textarea>
                                                <i data-id="${p._id}"  class="fas fa-paper-plane btn btn-default btnAddComment"></i>

                                            </div>
                                        </li>
                                        
                                    </ul>
                                </div>
                            </div>`

            parent.insertBefore(item, firstItem)
        })
        fileReader.readAsDataURL(file)
    } else if (linkYoutube) {
        let idVideo = linkYoutube.split('v=')[1];
        console.log(idVideo);
        item.innerHTML = `<div class="user-post">
                                <div class="friend-info">
                                    <figure>
                                        <img src="${avatar}" alt="">
                                    </figure>
                                    <div class="friend-name">
                                        <div>
                                        <a href="${currentUserId}"><ins>${name}</ins></a>
                                            <span>Vừa xong</span>
                                        </div>
                                        <div class="icon-setting">
                                            <a class="link"><i class="fas fa-wrench btnEditPost" data-content="${p.content}" data-linkyoutube="${p.linkYoutube}" data-id="${p._id}" ></i></a>
                                            <a class="link ml-1"><i class="fas fa-trash-alt btnDeletePost" data-id="${p._id}"></i></a>
                                        </div>
                                    </div>
                                    
                                    <div class="post-meta">
                                        <div class="description">
                                            <p>
                                                ${content}
                                            </p>
                                        </div>
                                        <iframe width="100%" height="300px" src="https://www.youtube.com/embed/${idVideo}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                    </div>
                                </div>
                                <div class="coment-area">
                                    <ul class="we-comet">
                                        <li class="post-comment">
                                            <div class="comet-avatar">
                                                <img src="${avatar}" alt="">
                                            </div>
                                            <div class="post-comt-box">
                                                <textarea placeholder="Post your comment"></textarea>
                                                <i data-id="${p._id}" class="fas fa-paper-plane btn btn-default btnAddComment"></i>

                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>`

        parent.insertBefore(item, firstItem)
    } else {
        item.innerHTML = `<div class="user-post">
                                <div class="friend-info">
                                    <figure>
                                        <img src="${avatar}" alt="">
                                    </figure>
                                    <div class="friend-name">
                                        <div>
                                        <a href="${currentUserId}"><ins>${name}</ins></a>
                                            <span>Vừa xong</span>
                                        </div>
                                        <div class="icon-setting">
                                            <a class="link"><i class="fas fa-wrench btnEditPost" data-content="${p.content}" data-id="${p._id}" ></i></a>
                                            <a class="link ml-1"><i class="fas fa-trash-alt btnDeletePost" data-id="${p._id}"></i></a>
                                        </div>
                                    </div>
                                    
                                    <div class="post-meta">
                                        <div class="description">
                                            <p>
                                                ${content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div class="coment-area">
                                    <ul class="we-comet">
                                        <li class="post-comment">
                                            <div class="comet-avatar">
                                                <img src="${avatar}" alt="">
                                            </div>
                                            <div class="post-comt-box">
                                                <textarea placeholder="Post your comment"></textarea>
                                                <i data-id="${p._id}" class="fas fa-paper-plane btn btn-default btnAddComment"></i>

                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>`

        parent.insertBefore(item, firstItem)
    }


    $('.picture-review-div').css('display', 'none')
    $('#inputFile').val('')
    $('.inputYoutube').css('display', 'none')
    $('#linkYoutube').val('')
    $('#content').val('')

}

function displayModalEditPost(e) {
    console.log(e.dataset.linkyoutube);
    $('#editPostModal').modal('show')
    $('#contentModal').val(e.dataset.content)

    $('.picture-review-div-modal').css('display', 'none')
    $('.inputYoutubeModal').css('display', 'none')

    let id = e.dataset.id;
    $('.btnSaveChangePost').attr('id', id)

    if (e.dataset.file) {
        $('.picture-review-div-modal').css('display', 'block')
        $('#picture-review-modal').attr('src', e.dataset.file)
    }
    if (e.dataset.linkyoutube) {
        let linkyoutube = 'https://www.youtube.com/watch?v=' + e.dataset.linkyoutube
        $('.inputYoutubeModal').css('display', 'flex')
        $('#linkYoutubeModal').val(linkyoutube)
    }
}

// xóa bài viết
function delelePost(id) {

    let result = confirm("Bạn có muốn xóa bài viết");
    if (result) {

        fetch('https://socialstdportal1820.herokuapp.com/post/delete?id=' + id, {
                method: 'GET',
                // body: id,
                headers: {
                    'Content-Type': 'application/json'
                        //'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            .then(res => res.json())
            .then(json => {

                if (json.code === 200) {
                    $(`#${id}`).remove()
                    toastr.success('Xóa bài viết thành công')
                } else if (json.code === 404) {
                    toastr.error('Bài viết không tồn tại')
                } else if (json.code === 403) {
                    toastr.warning('Bạn không đủ quyền thực hiện thao tác')
                }

            })
            .catch(e => {
                console.log(e)
            })
    }
}

function displayPostWhenEdit(p) {

    let queryPost = `#${p._id} .user-post .friend-info .post-meta`
    let queryBtnEdit = `#${p._id} .user-post .friend-info .friend-name .icon-setting .link .btnEditPost`
    let btnEdit = $(queryBtnEdit)


    if (p.file) {
        btnEdit.attr('data-file', p.file)
        btnEdit.attr('data-content', p.content)
        btnEdit.removeAttr('data-linkyoutube')

        $(queryPost).html(`<div class="description">
                            <p>
                                ${p.content}
                            </p>
                        </div>
                        <img src="${p.file}" alt="">`)
    } else if (p.linkYoutube) {

        btnEdit.attr('data-linkyoutube', p.linkYoutube)
        btnEdit.attr('data-content', p.content)
        btnEdit.removeAttr('data-file')

        $(queryPost).html(`<div class="description">
                                <p>
                                    ${p.content}
                                </p>
                            </div>
                            <iframe width="100%" height="315"
                                src="https://www.youtube.com/embed/${p.linkYoutube}"
                                title="YouTube video player" frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen></iframe>`)
    } else {

        btnEdit.removeAttr('data-linkyoutube')
        btnEdit.attr('data-content', p.content)
        btnEdit.removeAttr('data-file')

        $(queryPost).html(`<div class="description">
                                <p>
                                    ${p.content}
                                </p>
                            </div>`)
    }

    $('#editPostModal').modal('hide')


}

//hieeus
function setActiveForPagination() {
    let currentPage = $('#currentPage').val()
        //console.log(currentPage);
    let pages = $('#pages').val()
        //console.log(pages)
        //console.log(currentPage)
    let parent = document.getElementsByClassName('number-page')[0]
        //console.log(parent)
    let currentLi = parent.getElementsByClassName('page-number')[currentPage - 1]
        //console.log(currentLi)
    currentLi.classList.add("active")
        //console.log(typeof pages);

    if (currentPage === '1') {
        if (parseInt(pages) > parseInt(currentPage)) {
            let next = document.getElementById('btn-next')
            next.href = `?page=${parseInt(currentPage) + 1}`
        }
    }
    if (currentPage === pages) {
        if (pages !== '1') {
            let back = document.getElementById('btn-back')
            back.href = `?page=${parseInt(currentPage) - 1}`
        }
    }
    if (parseInt(currentPage) > 1 && parseInt(currentPage) < parseInt(pages)) {
        let next = document.getElementById('btn-next')
        next.href = `?page=${parseInt(currentPage) + 1}`
        let back = document.getElementById('btn-back')
        back.href = `?page=${parseInt(currentPage) - 1}`
    }
}

//hiển thị thông báo vừa đc thêm kh load lại
function displayNotification(value) {
    let parent = document.getElementsByClassName('list-tb')[0];
    let firstItem = parent.firstElementChild
    let item = document.createElement('div')
    item.innerHTML = `<div id="${value._id}" class="card bg-light text-dark mb-3">
    <div class="card-header tv">
        <i class='fas fa-clipboard'></i>
        <a class="titleNoty" href="noti/${value._id}">${value.title}</a>
    </div>
    
    <div class="card-footer d-flex align-items-center justify-content-between"> 
        
        <div>
        <button  data-id="${value._id}" class="btn btn-link order-0 order-lg-0 btnEditNoty"><a href="#"></a>Chỉnh sửa</button>
        <button  data-id="${value._id}" class="btn btn-link order-0 order-lg-0 btnDeleteNoty"><a href="#"></a>Xóa</button>
        </div>
        
    </div>
    
    </div>`

    parent.insertBefore(item, firstItem)
    if (parent.children.length > 10) {

        parent.removeChild(parent.children[10])
    }
}