const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn, userExists } = require('../lib/auth');
const { encryptPassword, matchPassword } = require('../lib/helpers')

const pool = require('../database');
express.urlencoded();
// Muestra front
router.get('/signin', isNotLoggedIn, (req, res) => {
    res.render('auth/signin')
})

// Verificación
router.post('/signin', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local.signin', {
        successRedirect: '/profile',
        failureRedirect: '/signin',
        failureFlash: true
    })(req, res, next)
})

// Muestra front
router.get('/signup', isNotLoggedIn, (req, res) => {
    res.render('auth/signup')
})

// Verificación
router.post('/signup', userExists, async (req, res, next) => {
    const password = await encryptPassword(req.body.password)
    pool.query('INSERT INTO user(username, password) VALUES(?,?)', [req.body.username, password], function(error, results, fields) {
        if (error) {
            console.log(error)
        }
        else {
            res.redirect('/signin')
        }
    }) 
})

router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile');
})

router.get('/logout', isLoggedIn, (req, res) => {
    req.logOut();
    res.redirect('/signin');
})

router.post('/change-password', isLoggedIn, async (req, res) => {
    const { newPassword, repeatPassword } = req.body;
    if (newPassword !== repeatPassword) {
        req.flash('message', 'Las contraseñas no coinciden');
        res.redirect('/profile')
    } else {
        const newUser = {
            password: await encryptPassword(newPassword)
        }
        await pool.query('UPDATE User set ? WHERE id = ?', [newUser, req.user.id])
        req.flash('success', 'Contraseña actualizada correctamente');
        res.redirect('/profile')
    }
})

module.exports = router;