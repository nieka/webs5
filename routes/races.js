/**
 * Created by niek on 22-3-2016.
 */
var express = require('express');
var _ = require('underscore');
var socket = require("../socket/socket")(null);
var router = express();
var race;
var waypoint;
var user;
var handleError;


function getRace(req, res){
    var query = {};

    if(req.params.id){
        query._id = req.params.id;
    }

    var result = race.find(query);
    result.exec(function(err, data){
        if(err){ return handleError(req, res, 500, err); }

        // We hebben gezocht op id, dus we gaan geen array teruggeven.
        if(req.params.id){
            data = data[0];
        }
        res.json(data);
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
        if(data){
            var wp = new waypoint(req.body);
            wp.save(function(err, savedWaypoint){

                if(err){ return handleError(req, res, 500, err); }
                else {
                    console.log("book toegevoegd");
                    var raceWaypoins = data[0].wayPoints;
                    raceWaypoins.push(savedWaypoint._id);
                    query = {"_id" : data[0]._id};
                    var options = { multi: true };
                    race.update(query, { $set: { wayPoints: raceWaypoins }}, options, function(err, numAffected){
                        if(err){ return handleError(req, res, 500, err); }
                        res.status(201);
                        res.json(savedWaypoint);
                    });
                }
            });
        } else {
            return handleError(req, res, 500, "race bestaat niet");
        }
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
    var query = {};
    query._id = req.params.id;

    var result = race.find(query);
    result.exec(function(err, data){
        if(data){
            var raceUsers = data[0].deelnemers;
            raceUsers.push(req.body._id);
            query = {"_id" : data[0]._id};
            var options = { multi: true };
            race.update(query, { $set: { deelnemers: raceUsers }}, options, function(err, numAffected){
                if(err){ return handleError(req, res, 500, err); }
                res.status(201);
                res.json({ msg: "User toegevoegd"});
            });
        } else {
            return handleError(req, res, 500, "User bestaat niet");
        }
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
    .post(addWayPoint);
router.route('/:id/waypoint/:waypointId')
    .delete(deleteWaypoint);
router.route('/:id/user')
    .post(addUser);
router.route('/:id/user/:userId')
    .delete(deleteUser);


module.exports = function (mongoose, errCallback){
    console.log('Initializing race routing module');
    race = mongoose.model('race');
    waypoint = mongoose.model('wayPoint');
    user = mongoose.model('User');
    handleError = errCallback;
    return router;
};
