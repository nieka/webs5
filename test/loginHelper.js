/**
 * Created by niek on 29-3-2016.
 */
var superagent = require('superagent');
var agent = superagent.agent();
var theAccount = {
    "email": "test@gmail.com",
    "password": "test"
};

exports.login = function (request,app, done) {
    request(app)
        .post('/login')
        .send(theAccount)
        .end(function (err, res) {
            if (err) {
                throw err;
            }
            agent.saveCookies(res);
            done(agent);
        });
};