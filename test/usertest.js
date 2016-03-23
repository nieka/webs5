/**
 * Created by niek on 20-3-2016.
 */
var app = require('../app')(require("../config/testConfig.js"));
var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();

var reqeustFunction= require("../models/testFunction")(request,app);

var testuser = {
    "firstname": "anne",
    "lastname": "spruit",
    "woonplaats" : "Delft",
    "email" : "annespruit@gmail.com"
};

describe('Testing user route', function(){
    it('Add user with user object', function(done){
        reqeustFunction.makePostRequest('/users',testuser, 201, function(err, res){
            if(err){
                return done(err); }

            expect(res.body.firstname).to.equal(testuser.firstname);
            expect(res.body.lastname).to.equal(testuser.lastname);
            expect(res.body.woonplaats).to.equal(testuser.woonplaats);
            expect(res.body.email).to.equal(testuser.email);
            done();
        });
    });
    it('Get users', function(done){
        //zou de gebruiker die net is toegevoegd ophalen
        reqeustFunction.makeGetRequest('/users', 200, function(err, res){
            if(err){ return done(err); }
            testuser = res.body[0];
            console.log("aantal users" + res.body.length);
            expect(res.body.length).to.equal(1);
            done();
        });
    });
    it('update users', function(done){
        testuser.firstname = "Niek";

        //zou de gebruiker die net is toegevoegd ophalen
        reqeustFunction.makePutReqeust('/users/' + testuser._id,testuser, 200, function(err, res){
            if(err){ return done(err); }
            expect(res.body.firstname).to.equal(testuser.firstname);
            done();
        });
    });

    it('delete users with user id', function(done){
        reqeustFunction.makeDelReqeust('/users/' + testuser._id, function(err, res){
            if(err){return done(err); }
            expect(res.body.msg).to.equal("User is verwijdert");
            done();
        });
    });
});