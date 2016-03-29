/**
 * Created by niek on 20-3-2016.
 */
//todo Zorgen dat na en voor de test de database leeg gegooit word.
var app = require('../app')(require("../config/testConfig.js"));
var mongoose = require('mongoose');
var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();

var testuser ={
    "password": "123456789",
    "email": "annespruit@gmail.com",
    "voornaam": "anne",
    "achternaam": "spruit"
};

var reqeustFunction = reqeustFunction= require("../models/testFunction")(request,app, testuser.email, testuser.password);

describe('Testing user crud', function(){

    /*after(function(done){
        User = mongoose.model('User');
        User.remove({}, function(err) {
            console.log('collection removed');
            done();
        });
    });*/

    it('Add user with user object', function(done){
        reqeustFunction.makePostRequest('/signup',testuser, 302, function(err, res){
            if(err){
                return done(err); }
            done();
        });
    });
    /*it('inloggen', function(done){
        var logingegevens ={
            "email": testuser.email,
            "password": testuser.password
        };
        reqeustFunction.makePostRequest('/login',logingegevens, 302, function(err, res){
            if(err){
                return done(err); }
            done();
        });
    });*/
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