/**
 * Created by niek on 29-3-2016.
 */
var request = require('request');
var wayPoint= require('mongoose').model('wayPoint');
var race = require('mongoose').model('race');
var user = require('mongoose').model('User');
var socket = require("../socket/socket")(null);
var async = require('async');
var GOOGPLACEID = "AIzaSyA_ttfXmm7f9Rzp3P8SLFT-QsyKO6P5Irw";

function getWayPoint(req, res){
    var query = {};
    if(req.params.id){
        query._id = req.params.id.toLowerCase();
    }

    var result = wayPoint.find(query);
    result.exec(function(err, data){
        console.log("waypoint found");
        async.parallel([
            function(callback){
                var query = {};
                query._id = req.params.id;
                wayPoint
                    .findOne(query)
                    .populate('gemeldeUsers')
                    .exec(function (err, story) {
                        console.log(story);
                        callback(err,story);
                    });
            },
            function(callback){
                var url ='https://maps.googleapis.com/maps/api/place/details/json?key=' + GOOGPLACEID + '&placeid=' + data[0].place_id;
                request(url,function (error, response, body) {
                    callback(error, body);
                })
            }
        ], function(err, data){
            res.json(data);
        });
    });
}

function tagWaypoint (req, res, next){
    var query = {};
    query._id = req.body._id;
    console.log("user id= " + req.body._id);
    var result = user.find(query);
    result.exec(function(err, data){
        if(data){
            result = wayPoint.find({_id : req.params.id});
            result.exec(function(err, data){
                if(data.length != 0){
                    var tagdUsers = data[0].gemeldeUsers;
                    var iduser = req.body._id;
                    var bestaad = false;

                    for(var i=0; i < tagdUsers.length; i++){
                        console.log(tagdUsers[0]);
                        console.log(iduser);

                        if(tagdUsers[0] == iduser){
                            bestaad = true;
                            console.log("id's zijn gelijk");
                            break;
                        }else {
                            console.log("id's zijn niet gelijk");
                            bestaad = false;
                        }
                    }
                    if(!bestaad){
                        tagdUsers.push(iduser);
                        console.log("user id= " + String(iduser));
                        console.log(tagdUsers);
                        query = {"_id" : data[0]._id};
                        var options = { multi: true };
                        wayPoint.update(query, { $set: { gemeldeUsers: tagdUsers }}, options, function(err, numAffected){
                            if(err){  return next(err); }
                            socket.sendmsg("Usertag","");
                            res.status(201);
                            res.json({ msg: "User tagged"});
                        });
                    }else {
                        res.status(304);
                        res.json({"msg":"user is al getagd"});
                    }

                }else {
                    res.status(304);
                    res.json({"msg": "waypoint bestaat niet"});
                }
            });
        } else {
            res.status(304);
            res.json({"msg": "User bestaat niet"});
        }
    });
}

module.exports = {
    getWayPoint : getWayPoint,
    tagWaypoint : tagWaypoint
};