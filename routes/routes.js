/**
 * Created by niek on 21-3-2016.
 */
/**
 * Created by niek on 16-3-2016.
 */
module.exports = function(app) {

    app.get('/', function(req, res) {
        console.log("useroverzicht");
        res.render('../views/users.ejs');
    });

};