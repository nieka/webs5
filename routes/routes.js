/**
 * Created by niek on 21-3-2016.
 * Bevat algemene routes voor front-end pagina's die niet bij ene losse rout horen
 */
var express = require('express');
var passport = require('passport');
var router = express();

router.route('/').get(function(req, res) {
    res.render('../views/index.ejs');
});
router.route('/signup').get(function(req, res) {
    var errorMessage = req.flash('signupMessage');
    res.render('../views/signup.ejs', { message: errorMessage });
});
router.route('/login').get(function(req, res) {
    var errorMessage = req.flash('loginMessage');
    res.render('../views/login.ejs', { message: errorMessage });
});

router.route('/signup').post(passport.authenticate('local-signup', {
    successRedirect : '/login', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

router.route('/profile').get(isLoggedIn, function(req, res) {
    res.render('profile.ejs', {
        user : req.user // get the user out of session and pass to template
    });
});
router.route('/logout').get(function(req, res) {
    req.logout();
    res.redirect('/');
});
router.route('/login').post(passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

// =====================================
// GOOGLE ROUTES =======================
// =====================================
// send to google to do the authentication
// profile gets us their basic information including their name
// email gets their emails
router.route('/auth/google').get(passport.authenticate('google', { scope : ['profile', 'email'] }));

// the callback after google has authenticated the user
router.route('/auth/google/callback').get(
    passport.authenticate('google', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
// Export
module.exports = router;
