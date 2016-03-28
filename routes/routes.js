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
    console.log("signup");
    res.render('../views/signup.ejs', { message: req.flash('signupMessage') });
});
router.route('/login').get(function(req, res) {
    res.render('../views/login.ejs', { message: req.flash('signupMessage') });
});

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
