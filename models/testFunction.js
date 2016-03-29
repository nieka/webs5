/**
 * Created by niek on 20-3-2016.
 */
var request;
var application;
var username, password;

function makePostRequest(route, body, statusCode, done){
    request(application)
        .post(route)
        .auth(username, password)
        .set('Accept', 'application/json')
        .type('json')
        .send(body)
        .expect(statusCode)
        .end(function(err, res){
            if(err){ return done(err); }

            done(null, res);
        });
}
function makeGetRequest(route, statusCode, done){
    request(application)
        .get(route)
        .auth(username, password)
        .set('Accept', 'application/json')
        .expect(statusCode)
        .end(function(err, res){
            if(err){ return done(err); }

            done(null, res);
        });
}

function makePutReqeust(route,body, statusCode, done){
    request(application)
        .put(route)
        .auth(username, password)
        .set('Accept', 'application/json')
        .type('json')
        .send(body)
        .expect(statusCode)
        .end(function(err, res){
            if(err){
                return done(err); }

            done(null, res);
        });
}
function makeDelReqeust(route,done){
    request(application)
        .del(route)
        .auth(username, password)
        .end(function(err, res){
            if(err){
                return done(err); }
            done(null, res);
        });
}

module.exports = function(req, app, us, ww){
    request = req;
    application = app;
    username =us;
    password = ww;
    return {
        "makeGetRequest" : makeGetRequest,
        "makePostRequest" : makePostRequest,
        "makePutReqeust" : makePutReqeust,
        "makeDelReqeust" : makeDelReqeust
    }
};