module.exports = {
    ensureAuth: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        } else {
            return res.redirect('/users/login')
        }
    },

    logedIn: function(req, res, next) {
        if (req.isAuthenticated()) {
            return res.redirect('/')
        } else {
            return next();
        }
    }
}