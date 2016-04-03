/**
 * Created by niek on 29-3-2016.
 */
var socket = require("../socket/socket")(null);
var request = require('request');
var waypoint= require('mongoose').model('wayPoint');
var race = require('mongoose').model('race');
var user = require('mongoose').model('User');
//todo set content header
/*
 *qeury leter betekenis
 * i = id
 * n = naam
 * p = plaats
 * s = status
 * */
function getRace(req, res){
    var query = {};
    var limit = 20;
    var offset = 0;
    if(req.params.id){
        query._id = req.params.id;
    }
    if(req.query.limit){
        limit = req.query.limit;
    }
    if(req.query.offset){
        offset = req.query.offset;
    }
    if(req.query.n){
        query.naam = req.query.n;
    }
    if(req.query.p){
        query.plaats = req.query.p;
    }
    if(req.query.s){
        query.status = req.query.s;
    }

    var result = race
        .find(query)
        .limit(limit)
        .skip(offset);
    result.exec(function(err, data){
        if(err){  return next(err); }
        if(req.params.id){
            data = data[0];
            if(req.headers.accept.indexOf("application/json") > -1){
                res.json(data);
            } else {
                res.render('singleraceView.ejs', {race: data, user_id : req.user._id});
            }
        } else {
            if(req.headers.accept.indexOf("application/json") > -1){
                res.json(data);
            } else {
                res.render('raceoverzicht.ejs', {races: data});
            }
        }
    });
}

function getRacePaged(req, res, next){

    race.find()
        .limit(req.params.pagesize)
        .skip(req.params.pagesize * req.params.pagenumber)
        .exec(function(err, data) {
            if(err){  return next(err); }

            if(req.headers.accept.indexOf("application/json") > -1){
                res.json(data);
            } else {
                res.render('useroverzicht.ejs', {users : data});
            }
        });
}


function addRace(req, res, next){
    var raceItem = new race(req.body);
    raceItem.save(function(err, savedRace){
        if(err){
            return next(err);
        } else {
            socket.sendmsg("raceUpdate", "");
            res.status(201);
            res.send(savedRace);
        }
    });
}

function deleteRace(req, res, next){
    var query = {};
    query._id = req.params.id;

    var result = race.find(query);
    result.exec(function(err, data){
        if(data){
            if(data[0].status != "gestart"){
                if(err){  return next(err); }
                var waypoints = data[0].wayPoints;
                for(var i =0; i< waypoints.length; i++){
                    waypoints.remove({ _id : waypoints[i] }, function(err, removed) {
                        if(err){  return next(err); }
                    });
                }
                race.remove({ _id : req.params.id }, function(err, removed) {
                    if(err){  return next(err); }
                    socket.sendmsg("raceUpdate", "");
                    res.status(202);
                    res.json({"msg" : "Race is verwijdert"});
                });
            }else {
                res.status(304);
                res.json({"msg" : "Gestarte races kunnen niet verwijderd worden"});
            }
        } else {
            res.status(304);
            res.json({"msg" : "race bestaat niet"});
        }
    });
}

function updateRace(req, res, next){
    race.findOne({ _id: req.params.id }, function (err, doc){
        if(err){  return next(err); }
        var body = req.body;
        doc.naam = body.naam;
        doc.plaats = body.plaats;
        doc.status = body.status;
        doc.wayPoints = body.wayPoints;
        doc.lat = body.lat;
        doc.lon = body.lon;

        doc.save(function(err){
            if(err){  return next(err); }
            socket.sendmsg("raceUpdate", "");
            res.status(200);
            res.json(doc);
        });
    });
}

function addWayPoint(req, res, next){
    var query = {};
    query._id = req.params.id;
    var result = race.find(query);
    result.exec(function(err, data){
        if(data.length != 0){
            if(data[0].status === "Niet Gestart"){
                var wp = new waypoint(req.body);
                wp.save(function(err, savedWaypoint){

                    if(err){  return next(err); }
                    else {
                        var raceWaypoins = data[0].wayPoints;
                        raceWaypoins.push(savedWaypoint._id);
                        query = {"_id" : data[0]._id};
                        var options = { multi: true };
                        race.update(query, { $set: { wayPoints: raceWaypoins }}, options, function(err, numAffected){
                            if(err){ return next(err); }
                            socket.sendmsg("wpUpdate", req.params.id);
                            res.status(201);
                            res.json(savedWaypoint);
                        });
                    }
                });
            } else {
                res.json( {"msg" : "race is al gestart en daarom kunnen er geen waypoint aan toegevoegd worden"});
            }
        } else {
            res.json({ "msg": "race bestaat niet"});
        }
    });
}

function getRaceWayPoints(req, res, next){
    var query = {};
    query._id = req.params.id;
    race
        .findOne(query)
        .populate('wayPoints')
        .exec(function (err, story) {
            if (err)  return next(err);
            res.status(200);
            res.json(story);
        });
}

function deleteWaypoint(req, res, next){
    var query = {};
    query._id = req.params.id;

    var result = race.find(query);

    result.exec(function(err, data){
        if(data.length === 1){
            if(err){  return next(err); }
            waypoint.remove({ _id : req.params.waypointId }, function(err, removed) {
                if(err){  return next(err); }
                var raceWaypoints = data[0].wayPoints;
                var index = raceWaypoints.indexOf(req.params.waypointId);
                if (index > -1) {
                    raceWaypoints.splice(index, 1);
                }

                query = {"_id" : data[0]._id};
                var options = { multi: true };
                race.update(query, { $set: { wayPoints: raceWaypoints }}, options, function(err, numAffected){
                    if(err){  return next(err); }
                    socket.sendmsg("wpUpdate", req.params.id);
                    res.status(204);
                    res.json(data);
                });
            });
        } else {
            res.json({"msg" : "Race bestaat niet"});
        }
    });
}

function addUser(req, res, next){
    //niet gestart
    var query = {};
    query._id = req.body._id;
    var result = user.find(query);
    result.exec(function(err, data){
        if(data.length != 0){
            query = {};
            query._id = req.params.id;
            result = race.find(query);
            result.exec(function(err, data){
                if(data.length != 0){
                    if(data[0].status === "Niet Gestart"){
                        var raceUsers = data[0].deelnemers;
                        raceUsers.push(req.body._id);
                        query = {"_id" : data[0]._id};
                        var options = { multi: true };
                        race.update(query, { $set: { deelnemers: raceUsers }}, options, function(err, numAffected){
                            if(err){  return next(err); }
                            socket.sendmsg("usUpdate", req.params.id);
                            res.status(200);
                            res.json({ msg: "User toegevoegd"});
                        });
                    }else {
                        res.status(304);
                        res.json({"msg" : "race is al gestart en daarom kunnen er geen deelnemers aan toegevoegd worden"});
                    }
                } else {
                    res.status(304);
                    res.json({"msg" : "Race bestaat niet"});
                }
            });
        } else {
            res.status(304);
            res.json({"msg" :"User bestaat niet"});
        }
    });
}

function getUsers(req, res, next){
    var query = {};
    query._id = req.params.id;
    race
        .findOne(query)
        .populate('deelnemers')
        .exec(function (err, story) {
            if (err)  return next(err);
            res.status(200);
            res.json(story);
        });
}

function deleteUser(req, res, next){
    var query = {};
    query._id = req.params.id;

    var result = race.find(query);

    result.exec(function(err, data){
        if(data.length === 1){
            if(err){  return next(err); }
            var raceUsers = data[0].deelnemers;
            var index = raceUsers.indexOf(req.params.userId);
            if (index > -1) {
                raceUsers.splice(index, 1);
            }

            query = {"_id" : data[0]._id};
            var options = { multi: true };
            race.update(query, { $set: { deelnemers: raceUsers }}, options, function(err, numAffected){
                if(err){  return next(err); }
                socket.sendmsg("usUpdate", req.params.id);
                res.status(204);
                res.json({ msg: "User verwijderd"});
            });
        } else {
            res.status(304);
            res.json({"msg" : "author bestaat niet"});
        }
    });
}

module.exports = {
    getRace : getRace,
    getRacePaged : getRacePaged,
    addRace : addRace,
    deleteRace : deleteRace,
    updateRace : updateRace,
    addWayPoint : addWayPoint,
    getRaceWayPoints :getRaceWayPoints,
    deleteWaypoint : deleteWaypoint,
    addUser : addUser,
    getUsers : getUsers,
    deleteUser : deleteUser
};