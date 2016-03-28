/**
 * Created by niek on 20-3-2016.
 */
//todo Zorgen dat na en voor de test de database leeg gegooit word.
var app = require('../app')(require("../config/testConfig.js"));
var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();

var reqeustFunction= require("../models/testFunction")(request,app);

var testuser ={
    local: {
        "password": "123456789",
        "email": "annespruit@gmail.com",
        "voornaam": "anne",
        "achternaam": "spruit"
    }
};

describe('Testing user route', function(){
    it('Add user with user object', function(done){
        reqeustFunction.makePostRequest('/users',testuser, 201, function(err, res){
            if(err){
                return done(err); }

            expect(res.body.local.voornaam).to.equal(testuser.local.voornaam);
            expect(res.body.local.achternaam).to.equal(testuser.local.achternaam);
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
        testuser.local.voornaam = "Niek";

        //zou de gebruiker die net is toegevoegd ophalen
        reqeustFunction.makePutReqeust('/users/' + testuser._id,testuser, 200, function(err, res){
            if(err){ return done(err); }
            expect(res.body.local.voornaam).to.equal(testuser.locsl.voornaam);
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