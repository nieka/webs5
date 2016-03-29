/**
 * Created by niek on 29-3-2016.
 */
var socket = require("../socket/socket")(null);
var passport = require('passport');
var User = require('mongoose').model('User');

function getUser(req, res){
    var query = {};

    if(req.params.id){
        query._id = req.params.id;
    }

    var result = User.find(query);
    result.exec(function(err, data){
        if(err){ return next(err); }

        // We hebben gezocht op id, dus we gaan geen array teruggeven.
        if(req.params.id){
            data = data[0];
        }

        if(req.headers.accept.indexOf("application/json") > -1){
            res.json(data);
        } else {
            res.render('useroverzicht.ejs', {users : data});
        }
    });
}

function getUserPaged(req, res){
    User.find()
        .limit(req.params.pagesize)
        .skip(req.params.pagesize * req.params.pagenumber)
        .exec(function(err, data) {
            if(err){ return next(err); }

            if(req.headers.accept.indexOf("application/json") > -1){
                res.json(data);
            } else {
                res.render('useroverzicht.ejs', {users : data});
            }
        });
}

function deleteUser(req, res){
    var query = {};
    query._id = req.params.id;

    var result = User.find(query);
    result.exec(function(err, data){
        if(data){
            if(err){ return next(err); }
            User.remove({ _id : req.params.id }, function(err, removed) {
                if(err){ return next(err); }
                socket.sendmsg("userUpdate", "");
                res.status(202);
                res.json({"msg" : "User is verwijdert"});
            });
        } else {
            res.status(304);
            res.json({"msg" : "User bestaat niet"});
        }
    });
}
function updateUser(req, res, next){
    User.findOne({ _id: req.params.id }, function (err, doc){
        if(err){ return next(err); }
        var body = req.body;
        doc.local.email = body.email;
        doc.local.voornaam = body.voornaam;
        doc.local.achternaam = body.achternaam;

        doc.save(function(err){
            if(err){ return next(err); }
            socket.sendmsg("userUpdate", "");
            res.json(doc);
        });
    });
}

module.exports = {
    getUser : getUser,
    getUserPaged : getUserPaged,
    updateUser : updateUser,
    deleteUser : deleteUser
};