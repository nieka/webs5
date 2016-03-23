var express = require('express');
var _ = require('underscore');
var socket = require("../socket/socket")(null);
var router = express();
var User;
var handleError;
function getUser(req, res){
  var query = {};

  if(req.params.id){
    query._id = req.params.id;
  }

  var result = User.find(query);
  result.exec(function(err, data){
    if(err){ return handleError(req, res, 500, err); }

    // We hebben gezocht op id, dus we gaan geen array teruggeven.
    if(req.params.id){
      data = data[0];
    }
    res.json(data);
  });
}

function addUser(req, res){
  console.log("add user aangeroepen");
  var user = new User(req.body);

  user.save(function(err, savedUser){
    if(err){
      return handleError(req, res, 500, err);
    } else {
      socket.sendmsg("userUpdate", "");
      res.status(201);
      res.send(savedUser);
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
    doc.firstname = body.firstname;
    doc.lastname = body.lastname;
    doc.woonplaats = body.woonplaats;
    doc.email = body.email;

   // doc.visits.$inc();
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
    .post(addUser);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

module.exports = function (mongoose, errCallback){
  console.log('Initializing user routing module');
  User = mongoose.model('User');
  handleError = errCallback;
  return router;
};
