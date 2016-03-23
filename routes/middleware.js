/**
 * Created by niek on 21-3-2016.
 */
/**
 * Created by niek on 16-3-2016.
 */
// app/routes.js
module.exports = function(app, passport) {
console.log("middleare.js");
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/',function (req, res, next) {
        console.log("middleware");
        next();
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}