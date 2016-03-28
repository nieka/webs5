/**
 * Created by niek on 22-3-2016.
 */
var express = require('express');
var _ = require('underscore');
var socket = require("../socket/socket")(null);
var router = express();
var request = require('request');
var race;
var waypoint;
var user;
var handleError;

/*
 *qeury leter betekenis
 * i = id
 * n = naam
 * p = plaats
 * s = status
 * */
function getRace(req, res){
    var query = {};

    if(req.params.id){
        query._id = req.params.id;
    }
    if(req.query.n){
        console.log(req.query.n);
        query.naam = req.query.n;
    }
    if(req.query.p){
        console.log(req.query.p);
        query.plaats = req.query.p;
    }
    if(req.query.s){
        console.log(req.query.s);
        query.status = req.query.s;
    }

    var result = race.find(query);
    result.exec(function(err, data){
        if(err){ return handleError(req, res, 500, err); }
        console.log(req.headers.accept);
        if(req.params.id){
            console.log("return single race");
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

        console.log(req.headers.accept);

    });
}

function getRacePaged(req, res){
    console.log("paged")

    race.find()
        .limit(req.params.pagesize)
        .skip(req.params.pagesize * req.params.pagenumber)
        .exec(function(err, data) {
            console.log(
                'paged opgehaalt'
            );
            if(err){ return handleError(req, res, 500, err); }

            if(req.headers.accept.indexOf("application/json") > -1){
                res.json(data);
            } else {
                res.render('useroverzicht.ejs', {users : data});
            }
        });
}


function addRace(req, res){
    var raceItem = new race(req.body);
    raceItem.save(function(err, savedRace){
        if(err){
            return handleError(req, res, 500, err);
        } else {
            socket.sendmsg("raceUpdate", "");
            res.status(201);
            res.send(savedRace);
        }
    });
}

function deleteRace(req, res){
    var query = {};
    query._id = req.params.id;

    var result = race.find(query);
    result.exec(function(err, data){
        if(data){
            if(data[0].status != "gestart"){
                if(err){ return handleError(req, res, 500, err); }
                var waypoints = data[0].wayPoints;
                for(var i =0; i< waypoints.length; i++){
                    waypoints.remove({ _id : waypoints[i] }, function(err, removed) {
                        if(err){ return handleError(req, res, 500, err); }
                    });
                }
                race.remove({ _id : req.params.id }, function(err, removed) {
                    if(err){ return handleError(req, res, 500, err); }
                    socket.sendmsg("raceUpdate", "");
                    res.status(200);
                    res.json({"msg" : "Race is verwijdert"});
                });
            }else {
                res.status(304);
                res.json({"msg" : "Gestarte races kunnen niet verwijderd worden"});
            }
        } else {
            return handleError(req, res, 500, "race bestaat niet");
        }
    });
}

function updateRace(req, res){
    race.findOne({ _id: req.params.id }, function (err, doc){
        if(err){ return handleError(req, res, 500, err); }
        var body = req.body;
        doc.naam = body.naam;
        doc.plaats = body.plaats;
        doc.status = body.status;
        doc.wayPoints = body.wayPoints;
        doc.lat = body.lat;
        doc.lon = body.lon;

        doc.save(function(err){
            if(err){ return handleError(req, res, 500, err); }
            socket.sendmsg("raceUpdate", "");
            res.json(doc);
        });
    });
}

function addWayPoint(req, res){
    var query = {};
    query._id = req.params.id;
    var result = race.find(query);
    result.exec(function(err, data){
        if(data.length != 0){
            if(data[0].status === "Niet Gestart"){
                var wp = new waypoint(req.body);
                wp.save(function(err, savedWaypoint){

                    if(err){ return handleError(req, res, 500, err); }
                    else {
                        var raceWaypoins = data[0].wayPoints;
                        raceWaypoins.push(savedWaypoint._id);
                        query = {"_id" : data[0]._id};
                        var options = { multi: true };
                        race.update(query, { $set: { wayPoints: raceWaypoins }}, options, function(err, numAffected){
                            if(err){ return handleError(req, res, 500, err); }
                            socket.sendmsg("wpUpdate", req.params.id);
                            res.status(201);
                            res.json(savedWaypoint);
                        });
                    }
                });
            } else {
                return handleError(req, res, 200, "race is al gestart en daarom kunnen er geen waypoint aan toegevoegd worden");
            }
        } else {
            return handleError(req, res, 500, "race bestaat niet");
        }
    });
}

function getRaceWayPoints(req, res){
    var query = {};
    query._id = req.params.id;
    race
        .findOne(query)
        .populate('wayPoints')
        .exec(function (err, story) {
            if (err) return handleError(req, res, err, "getWaypoints error");
            res.status(201);
            res.json(story);
        });
}

function deleteWaypoint(req, res){
    var query = {};
    query._id = req.params.id;

    var result = race.find(query);

    result.exec(function(err, data){
        if(data.length === 1){
            if(err){ return handleError(req, res, 500, err); }
            waypoint.remove({ _id : req.params.waypointId }, function(err, removed) {
                if(err){ return handleError(req, res, 500, err); }
                console.log("waypoint verwijderd");
                var raceWaypoints = data[0].wayPoints;
                var index = raceWaypoints.indexOf(req.params.waypointId);
                if (index > -1) {
                    raceWaypoints.splice(index, 1);
                }

                query = {"_id" : data[0]._id};
                var options = { multi: true };
                race.update(query, { $set: { wayPoints: raceWaypoints }}, options, function(err, numAffected){
                    if(err){ return handleError(req, res, 500, err); }
                    socket.sendmsg("wpUpdate", req.params.id);
                    res.status(201);
                    res.json(data);
                });
            });
        } else {
            return handleError(req, res, 500, "Race bestaat niet");
        }
    });
}

function addUser(req, res){
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
                           if(err){ return handleError(req, res, 500, err); }
                           socket.sendmsg("usUpdate", req.params.id);
                           res.status(201);
                           res.json({ msg: "User toegevoegd"});
                       });
                   }else {
                       return handleError(req, res, 200, "race is al gestart en daarom kunnen er geen deelnemers aan toegevoegd worden");
                   }
               } else {
                   return handleError(req, res, 500, "Race bestaat niet");
               }
           });
       } else {
           return handleError(req, res, 500, "User bestaat niet");
       }
    });
}

function getUsers(req, res){
    var query = {};
    query._id = req.params.id;
    race
        .findOne(query)
        .populate('deelnemers')
        .exec(function (err, story) {
            if (err) return handleError(req, res, err, "deelnemers error");
            res.status(201);
            res.json(story);
        });
}

function deleteUser(req, res){
    var query = {};
    query._id = req.params.id;

    var result = race.find(query);

    result.exec(function(err, data){
        if(data.length === 1){
            if(err){ return handleError(req, res, 500, err); }
            var raceUsers = data[0].deelnemers;
            var index = raceUsers.indexOf(req.params.userId);
            if (index > -1) {
                raceUsers.splice(index, 1);
            }

            query = {"_id" : data[0]._id};
            var options = { multi: true };
            race.update(query, { $set: { deelnemers: raceUsers }}, options, function(err, numAffected){
                if(err){ return handleError(req, res, 500, err); }
                socket.sendmsg("usUpdate", req.params.id);
                res.status(201);
                res.json({ msg: "User verwijderd"});
            });
        } else {
            return handleError(req, res, 500, "author bestaat niet");
        }
    });
}

/* Routing */
router.route('/')
    .get(getRace)
    .post(addRace);

router.route('/:id')
    .get(getRace)
    .put(updateRace)
    .delete(deleteRace);
router.route('/:id/waypoint')
    .post(addWayPoint)
    .get(getRaceWayPoints);
router.route('/:id/waypoint/:waypointId')
    .delete(deleteWaypoint);
router.route('/:id/user')
    .post(addUser)
    .get(getUsers);
router.route('/:id/user/:userId')
    .delete(deleteUser);
router.route('/:pagesize/:pagenumber')
    .get(getRacePaged);


module.exports = function (mongoose, errCallback){
    console.log('Initializing race routing module');
    race = mongoose.model('race');
    waypoint = mongoose.model('wayPoint');
    user = mongoose.model('User');
    handleError = errCallback;
    return router;
};
