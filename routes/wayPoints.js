var express = require('express');
var router = express();
var wayPoint;
var race;
var user;
var socket = require("../socket/socket")(null);
var _ = require('underscore');
var handleError;
var async = require('async');

function getWayPoint(req, res){
    //todo zorgen dat de informatie van het cafe uit google places async ingeladen word
    var query = {};
    if(req.params.id){
        query._id = req.params.id.toLowerCase();
    }

    var result = wayPoint.find(query);

    result.exec(function(err, data){
        if(err){ return handleError(req, res, 500, err); }

        // We hebben gezocht op id, dus we gaan geen array teruggeven.
        if(req.params.id){
            data = data[0];
        }
        res.json(data);
    });
}

function tagWaypoint (req, res){
    var query = {};
    query._id = req.body._id;

    var result = user.find(query);
    result.exec(function(err, data){
        if(data){
            result = wayPoint.find({_id : req.params.id});
            result.exec(function(err, data){
                if(data){
                    var tagdUsers = data[0].gemeldeUsers;
                    tagdUsers.push(req.body._id);
                    console.log("user id= " + data[0]._id);
                    query = {"_id" : data[0]._id};
                    var options = { multi: true };
                    wayPoint.update(query, { $set: { gemeldeUsers: tagdUsers }}, options, function(err, numAffected){
                        if(err){ return handleError(req, res, 500, err); }
                        socket.emit("Usertag","");
                        res.status(201);
                        res.json({ msg: "User tagged"});
                    });
                }else {
                    return handleError(req, res, 500, "waypoint bestaat niet");
                }
            });
        } else {
            return handleError(req, res, 500, "User bestaat niet");
        }
    });
}

// Routing
router.route('/')
    .get(getWayPoint);

router.route('/:id')
    .get(getWayPoint);
router.route('/:id/user')
    .post(tagWaypoint);
// Export
module.exports = function (mongoose, errCallback){
    console.log('Initializing wayPoints routing module');
    race = mongoose.model('race');
    user = mongoose.model('User');
    wayPoint = mongoose.model('wayPoint');
    handleError = errCallback;
    return router;
};