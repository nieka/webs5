var express = require('express');
var router = express.Router();

router.get('/useroverzicht', function(req, res, next) {
  console.log("useroverzicht");
  res.render('users.ejs');
});

module.exports = router;
