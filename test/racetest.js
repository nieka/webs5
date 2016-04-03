/**
 * Created by niek on 29-3-2016.
 */
var app = require('../app')(require("../config/testConfig.js"));
var mongoose = require('mongoose');
var request = require('supertest');
var expect = require('chai').expect;
var async = require('async');
var login = require('./loginHelper');
var loginuser ={
    "password": "test",
    "email": "test@gmail.com",
    "voornaam": "test",
    "achternaam": "test"
};
var testrace ={
    "naam": "test race",
    "plaats": "Zaltbommel",
    "lat": 51.813554,
    "lon": 5.250773,
    "status" : "Niet Gestart"
};
var reqeustFunction;
var wprace;

describe('Race crud', function(){

    var agent;

    before(function(done){
        this.timeout(5000);
        //voeg login gebruiker toe gebruker
        addloginGebruiker(done);
    });

    beforeEach(function(done){
        this.timeout(5000);
        login.login(request,app, function (loginAgent) {
            agent = loginAgent;
            reqeustFunction = require("./testFunction")(request,app, agent);
            done();
        });
    });

    after(function(done){
        this.timeout(5000);
        race = mongoose.model('race');
        race.remove({}, function(err) {
            done();
        });
    });

    it('Add race with race object', function(done){
        reqeustFunction.makePostRequest('/races',testrace, 201, function(err, res){
            if(err){
                return done(err); }
            expect(res.body.naam).to.equal(testrace.naam);
            expect(res.body.plaats).to.equal(testrace.plaats);
            expect(res.body.lat).to.equal(testrace.lat);
            expect(res.body.lon).to.equal(testrace.lon);
            expect(res.body.status).to.equal(testrace.status);

            done();
        });
    });

    it('Get races', function(done){
        //zou de gebruiker die net is toegevoegd ophalen
        reqeustFunction.makeGetRequest('/races', 200, function(err, res){
            if(err){ return done(err); }
            expect(res.body.length).to.equal(1);
            expect(res.body[0].naam).to.equal(testrace.naam);
            testrace = res.body[0];
            done();
        });
    });
    it('Get race with id', function(done){
        //zou de gebruiker die net is toegevoegd ophalen
        reqeustFunction.makeGetRequest('/races/' + testrace._id, 200, function(err, res){
            if(err){ return done(err); }
            expect(res.body._id).to.equal(testrace._id);
            expect(res.body.naam).to.equal(testrace.naam);
            expect(res.body.plaats).to.equal(testrace.plaats);
            expect(res.body.lat).to.equal(testrace.lat);
            expect(res.body.lon).to.equal(testrace.lon);
            expect(res.body.status).to.equal(testrace.status);
            done();
        });
    });
    it('update users', function(done){
        testrace.naam = "kroegen race";
        var race ={
            "naam": testrace.naam,
            "plaats": testrace.plaats,
            "lat": testrace.lat,
            "lon": testrace.lon,
            "status" : testrace.status
        };
        //zou de gebruiker die net is toegevoegd ophalen
        reqeustFunction.makePutReqeust('/races/' + testrace._id,race, 200, function(err, res){
            if(err){ return done(err); }
            expect(res.body.naam).to.equal(testrace.naam);
            expect(res.body.plaats).to.equal(testrace.plaats);
            expect(res.body.lat).to.equal(testrace.lat);
            expect(res.body.lon).to.equal(testrace.lon);
            expect(res.body.status).to.equal(testrace.status);
            done();
        });
    });

    it('delete race with race id', function(done){
        reqeustFunction.makeDelReqeust('/races/' + testrace._id,202, function(err, res){
            if(err){return done(err); }
            expect(res.body.msg).to.equal("Race is verwijdert");
            done();
        });
    });
});
describe('Testing race paging', function(){
    before(function(done){
        this.timeout(5000);
        addloginGebruiker(done);
    });

    beforeEach(function(done){
        this.timeout(5000);
        login.login(request,app, function (loginAgent) {
            agent = loginAgent;
            reqeustFunction = require("./testFunction")(request,app, agent);
            loadRaces(done, agent);
        });
    });

    after(function(done){
        this.timeout(5000);
        race = mongoose.model('race');
        race.remove({}, function(err) {
            done();
        });
    });

    it('get race paging met 4 per page page 0', function(done){
        reqeustFunction.makeGetRequest('/races/?limit=4&offset=0',200, function(err, res){
            if(err){return done(err); }
            expect(res.body.length).to.equal(4);
            done();
        });
    });
    it('get race paging met 4 per page page 1', function(done){
        reqeustFunction.makeGetRequest('/races/?limit=4&offset=4',200, function(err, res){
            if(err){return done(err); }
            expect(res.body.length).to.equal(4);
            done();
        });
    });
});

describe('Testing waypoint function ', function(){
    var wp = {
        place_id : "56f04b89710bbf8c2b479bb4",
        naam : "paultje"
    };
    before(function(done){
        this.timeout(5000);
        login.login(request,app, function (loginAgent) {
            agent = loginAgent;
            reqeustFunction = require("./testFunction")(request,app, agent);
            loadrace(done, agent);
        });
    });

    after(function(done){
        this.timeout(5000);
        async.parallel([
            function(callback){

                wp = mongoose.model('wayPoint');
                wp.remove({}, function(err) {
                    callback(err,null);
                });
            },
            function(callback){
                race = mongoose.model('race');
                race.remove({}, function(err) {
                    callback(err,null);
                });
            }
        ], function(err, data){
            done();
        });
    });

    it('add waypoint', function(done){
        reqeustFunction.makePostRequest('/races/'+ wprace._id + '/waypoint',wp,201, function(err, res){
            if(err){return done(err); }
            expect(res.body.place_id).to.equal(wp.place_id);
            expect(res.body.naam).to.equal(wp.naam);
            wp = res.body;
            done();
        });
    });
    it('get waypoints', function(done){

        reqeustFunction.makeGetRequest('/races/'+ wprace._id + '/waypoint',200, function(err, res){
            if(err){return done(err); }
            expect(res.body.wayPoints.length).to.equal(1);
            expect(res.body.wayPoints[0].naam).to.equal(wp.naam);
            done();
        });
    });
    it('get waypoint', function(done){

        reqeustFunction.makeGetRequest('/waypoints/'+ wp._id + '',200, function(err, res){
            if(err){return done(err); }
            expect(res.body[0].naam).to.equal(wp.naam);
            expect(res.body[0]._id).to.equal(wp._id);
            done();
        });
    });
    it('delete waypoint', function(done){

        reqeustFunction.makeDelReqeust('/races/'+ wprace._id + '/waypoint/' + wp._id,204, function(err, res){
            if(err){return done(err); }
            done();
        });
    });
});
describe('Testing user function ', function(){
    var user;
    before(function(done){
        this.timeout(5000);
        login.login(request,app, function (loginAgent) {
            agent = loginAgent;
            reqeustFunction = require("./testFunction")(request,app, agent);
            loadrace(done, agent);
        });
    });

    beforeEach(function(done){
        this.timeout(5000);
        reqeustFunction.makeGetRequest('/users', 200, function(err, res){
            if(err){ return done(err); }
            loginuser = res.body[0];
            done();
        });
    });


    after(function(done){
        this.timeout(5000);
        async.parallel([
            function(callback){

                wp = mongoose.model('wayPoint');
                wp.remove({}, function(err) {
                    callback(err,null);
                });
            },
            function(callback){
                race = mongoose.model('race');
                race.remove({}, function(err) {
                    callback(err,null);
                });
            }
        ], function(err, data){
            done();
        });
    });

    it('add user aan race', function(done){
        user = {
            _id : loginuser._id
        };
        reqeustFunction.makePostRequest('/races/'+ wprace._id + '/user',user,200, function(err, res){
            if(err){return done(err); }
            expect(res.body.msg).to.equal("User toegevoegd");
            wp = res.body;
            done();
        });
    });
    it('get users van race', function(done){

        reqeustFunction.makeGetRequest('/races/'+ wprace._id + '/user',200, function(err, res){
            if(err){return done(err); }
            expect(res.body.deelnemers.length).to.equal(1);
            expect(res.body.deelnemers[0]._id).to.equal(user._id);
            done();
        });
    });
    it('delete user van race', function(done){

        reqeustFunction.makeDelReqeust('/races/'+ wprace._id + '/user/' + user._id,204, function(err, res){
            if(err){return done(err); }
            done();
        });
    });
});

function addloginGebruiker(done){
    request(app)
        .post('/signup')
        .set('Accept', 'application/json')
        .type('json')
        .send(loginuser)
        .end(function(err, res){
            if(err){ return done(err); }
            loginuser = res.body;
            done();

        });
}

function loadrace (done,agent){
    testrace ={
        "naam": "test race",
        "plaats": "Zaltbommel",
        "lat": 51.813554,
        "lon": 5.250773,
        "status" : "Niet Gestart"
    };
    var req = request(app)
        .post('/races');
    agent.attachCookies(req);
    req.set('Accept', 'application/json')
        .type('json')
        .send(testrace)
        .end(function(err, res){
            wprace = res.body;
            done();
        });
}

function loadRaces(done, agent){
    testrace ={
        "naam": "test race",
        "plaats": "Zaltbommel",
        "lat": 51.813554,
        "lon": 5.250773,
        "status" : "Niet Gestart"
    };
    async.parallel([
        function(callback){
            var req = request(app)
                .post('/races');
            agent.attachCookies(req);
                req.set('Accept', 'application/json')
                .type('json')
                .send(testrace)
                .end(function(err, res){
                    callback(err,res);
                });
        },
        function(callback){
            var req = request(app)
                .post('/races');
            agent.attachCookies(req);
            req.set('Accept', 'application/json')
                .type('json')
                .send(testrace)
                .end(function(err, res){
                    callback(err,res);
                });
        },
        function(callback){
            var req = request(app)
                .post('/races');
            agent.attachCookies(req);
            req.set('Accept', 'application/json')
                .type('json')
                .send(testrace)
                .end(function(err, res){
                    callback(err,res);
                });
        },
        function(callback){
            var req = request(app)
                .post('/races');
            agent.attachCookies(req);
            req.set('Accept', 'application/json')
                .type('json')
                .send(testrace)
                .end(function(err, res){
                    callback(err,res);
                });
        },
        function(callback){
            var req = request(app)
                .post('/races');
            agent.attachCookies(req);
            req.set('Accept', 'application/json')
                .type('json')
                .send(testrace)
                .end(function(err, res){
                    callback(err,res);
                });
        },
        function(callback){
            var req = request(app)
                .post('/races');
            agent.attachCookies(req);
            req.set('Accept', 'application/json')
                .type('json')
                .send(testrace)
                .end(function(err, res){
                    callback(err,res);
                });
        },
        function(callback){
            var req = request(app)
                .post('/races');
            agent.attachCookies(req);
            req.set('Accept', 'application/json')
                .type('json')
                .send(testrace)
                .end(function(err, res){
                    callback(err,res);
                });
        }
    ], function(err, data){
        done();
    });
}
