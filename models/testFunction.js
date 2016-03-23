/**
 * Created by niek on 20-3-2016.
 */
var request;
var application;

function makePostRequest(route, body, statusCode, done){
    request(application)
        .post(route)
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
        .expect(statusCode)
        .end(function(err, res){
            if(err){ return done(err); }

            done(null, res);
        });
}

function makePutReqeust(route,body, statusCode, done){
    request(application)
        .put(route)
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
        .end(function(err, res){
            if(err){
                return done(err); }
            done(null, res);
        });
}

module.exports = function(req, app){
    request = req;
    application = app;
    return {
        "makeGetRequest" : makeGetRequest,
        "makePostRequest" : makePostRequest,
        "makePutReqeust" : makePutReqeust,
        "makeDelReqeust" : makeDelReqeust
    }
};