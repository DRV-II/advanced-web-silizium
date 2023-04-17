const pool = require('../database')
module.exports = {
    
    isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/signin');
        }
    },

    isNotLoggedIn(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/profile');
        }
    },

    async userExists(req, res, next) {
        pool.query("SELECT * FROM User WHERE BINARY username = ?", [req.body.username], function(error, results, fields) {
            if(error) {
                console.log("ni modo pa")
            }
            else if (results.length>0){
                res.redirect('/signup')
            }
            else {
                next()
            }
        })
    }

}