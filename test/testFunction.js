/**
 * Created by niek on 20-3-2016.
 */
var request;
var application;
var agent;

function makePostRequest(route, body, statusCode, done){
    console.log(route);
    var req = request(application)
        .post(route);
    agent.attachCookies(req);
        req.set('Accept', 'application/json')
            .type('json')
            .send(body)
            .expect(statusCode)
            .end(function(err, res){
                if(err){ return done(err); }

                done(null, res);
            });
}
function makeGetRequest(route,statusCode, done){
    var req = request(application)
        .get(route);
    agent.attachCookies(req);
        req.set('Accept', 'application/json');
        req.expect(statusCode)
        .end(function(err, res){
            if(err){ return done(err); }

            done(null, res);
        });
}

function makePutReqeust(route,body, statusCode, done){
    var req = request(application)
        .put(route);
    agent.attachCookies(req);
        req.set('Accept', 'application/json')
        .type('json')
        .send(body)
        .expect(statusCode)
        .end(function(err, res){
            if(err){
                return done(err); }

            done(null, res);
        });
}
function makeDelReqeust(route,statusCode,done){
    var req = request(application)
        .del(route);
    agent.attachCookies(req);
        req.expect(statusCode)
            .end(function(err, res){
            if(err){
                return done(err); }
            done(null, res);
        });
}

module.exports = function(req, app, superagent){
    request = req;
    application = app;
    agent = superagent;
    return {
        "makeGetRequest" : makeGetRequest,
        "makePostRequest" : makePostRequest,
        "makePutReqeust" : makePutReqeust,
        "makeDelReqeust" : makeDelReqeust
    }
};