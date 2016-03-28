var express = require('express');
var _ = require('underscore');
var socket = require("../socket/socket")(null);
var passport = require('passport');
var router = express();
var User;
var handleError;

//todo google signin implementeren

function getUser(req, res){
  var query = {};

  if(req.params.id){
    query._id = req.params.id;
  }

  var result = User.find(query);
  console.log("user find called");
  result.exec(function(err, data){
    console.log("users found");
    if(err){ return handleError(req, res, 500, err); }

    // We hebben gezocht op id, dus we gaan geen array teruggeven.
    if(req.params.id){
      data = data[0];
    }

    console.log(req.headers.accept);
    if(req.headers.accept.indexOf("application/json") > -1){
      res.json(data);
    } else {
      res.render('useroverzicht.ejs', {users : data});
    }
  });
}

function getUserPaged(req, res){
  console.log("paged")

      User.find()
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

function deleteUser(req, res){
  var query = {};
  query._id = req.params.id;

  var result = User.find(query);
  result.exec(function(err, data){
    if(data){
      if(err){ return handleError(req, res, 500, err); }
      User.remove({ _id : req.params.id }, function(err, removed) {
        if(err){ return handleError(req, res, 500, err); }
        socket.sendmsg("userUpdate", "");
        res.status(200);
        res.json({"msg" : "User is verwijdert"});
      });
    } else {
      return handleError(req, res, 500, "User bestaat niet");
    }
  });
}
function updateUser(req, res){
  User.findOne({ _id: req.params.id }, function (err, doc){
    if(err){ return handleError(req, res, 500, err); }
    var body = req.body;
    doc.local.email = body.email;
    doc.local.voornaam = body.voornaam;
    doc.local.achternaam = body.achternaam;

    doc.save(function(err){
      if(err){ return handleError(req, res, 500, err); }
      socket.sendmsg("userUpdate", "");
      res.json(doc);
    });
  });
}

/* Routing */
router.route('/')
    .get(getUser)
    .post(passport.authenticate('local-signup', {
      successRedirect : '/profile', // redirect to the secure profile section
      failureRedirect : '/signup', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
    }));

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);
router.route('/:pagesize/:pagenumber')
    .get(getUserPaged);


module.exports = function (mongoose, errCallback){
  console.log('Initializing user routing module');
  User = mongoose.model('User');
  handleError = errCallback;
  return router;
};
