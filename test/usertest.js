var app = require('../app')(require("../config/testConfig.js"));
var mongoose = require('mongoose');
var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();
var async = require('async');
var login = require('./loginHelper');
var loginuser ={
    "password": "test",
    "email": "test@gmail.com",
    "voornaam": "test",
    "achternaam": "test"
};
var testuser ={
    "password": "12345678",
    "email": "annespruit@gmail.com",
    "voornaam": "anne",
    "achternaam": "spruit"
};
var reqeustFunction;

describe('Testing user crud', function(){

    var agent;

    before(function(done){
        this.timeout(5000);
        //voeg login gebruiker toe gebruker
        request(app)
            .post('/signup')
            .set('Accept', 'application/json')
            .type('json')
            .send(loginuser)
            .end(function(err, res){
                if(err){ return done(err); }
                done();
            });
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
        User = mongoose.model('User');
        User.remove({}, function(err) {
            done();
        });
    });

    it('Add user with user object', function(done){
        reqeustFunction.makePostRequest('/signup',testuser, 302, function(err, res){
            if(err){
                return done(err); }
            done();
        });
    });

    it('Get users', function(done){
        //zou de gebruiker die net is toegevoegd ophalen
        reqeustFunction.makeGetRequest('/users', 200, function(err, res){
            if(err){ return done(err); }
            testuser = res.body[0];
            expect(res.body.length).to.equal(2);
            done();
        });
    });
    it('Get users with id', function(done){
        //zou de gebruiker die net is toegevoegd ophalen
        reqeustFunction.makeGetRequest('/users/' + testuser._id, 200, function(err, res){
            if(err){ return done(err); }
            expect(res.body._id).to.equal(testuser._id);
            done();
        });
    });
    it('update users', function(done){
        testuser.local.voornaam = "Niek";
        var user = {
            voornaam : "Niek",
            achternaam : testuser.local.achternaam,
            email: testuser.local.email
        };
        //zou de gebruiker die net is toegevoegd ophalen
        reqeustFunction.makePutReqeust('/users/' + testuser._id,user, 200, function(err, res){
            if(err){ return done(err); }
            expect(res.body.local.voornaam).to.equal(testuser.local.voornaam);
            done();
        });
    });

    it('delete users with user id', function(done){
        reqeustFunction.makeDelReqeust('/users/' + testuser._id,202, function(err, res){
            if(err){return done(err); }
            expect(res.body.msg).to.equal("User is verwijdert");
            done();
        });
    });
});

//6 gebruikers worden voor de paging tests gebruikt
describe('Testing user paging', function(){
    before(function(done){
        this.timeout(5000);
        loadUsers(done);
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
        User = mongoose.model('User');
        User.remove({}, function(err) {
            done();
        });
    });

    it('get user paging met 4 per page page 0', function(done){
        reqeustFunction.makeGetRequest('/users/4/0',200, function(err, res){
            if(err){return done(err); }
            expect(res.body.length).to.equal(4);
            done();
        });
    });
    it('get user paging met 4 per page page 1', function(done){
        reqeustFunction.makeGetRequest('/users/4/1',200, function(err, res){
            if(err){return done(err); }
            expect(res.body.length).to.equal(2);
            done();
        });
    });
});

function loadUsers(done){
    async.parallel([
        function(callback){
            request(app)
                .post('/signup')
                .set('Accept', 'application/json')
                .type('json')
                .send(loginuser)
                .end(function(err, res){
                    callback(err,res);
                });
        },
        function(callback){
            request(app)
                .post('/signup')
                .set('Accept', 'application/json')
                .type('json')
                .send(testuser)
                .end(function(err, res){
                    callback(err,res);
                });
        },
        function(callback){
            testuser.voornaam = "stijn";
            request(app)
                .post('/signup')
                .set('Accept', 'application/json')
                .type('json')
                .send(loginuser)
                .end(function(err, res){
                    if(err){ return done(err); }
                    callback(err,res);
                });
        },
        function(callback){
            testuser.voornaam = "Niek";
            request(app)
                .post('/signup')
                .set('Accept', 'application/json')
                .type('json')
                .send(loginuser)
                .end(function(err, res){
                    if(err){ return done(err); }
                    callback(err,res);
                });
        },
        function(callback){
            testuser.voornaam = "Paul";
            request(app)
                .post('/signup')
                .set('Accept', 'application/json')
                .type('json')
                .send(loginuser)
                .end(function(err, res){
                    if(err){ return done(err); }
                    callback(err,res);
                });
        },
        function(callback){
            testuser.voornaam = "Quin";
            request(app)
                .post('/signup')
                .set('Accept', 'application/json')
                .type('json')
                .send(loginuser)
                .end(function(err, res){
                    if(err){ return done(err); }
                    callback(err,res);
                });
        },
        function(callback){
            testuser.voornaam = "Jan";
            request(app)
                .post('/signup')
                .set('Accept', 'application/json')
                .type('json')
                .send(loginuser)
                .end(function(err, res){
                    if(err){ return done(err); }
                    callback(err,res);
                });
        }
    ], function(err, data){
        done();
    });
}