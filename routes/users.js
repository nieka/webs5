var express = require('express');
var router = express();
var userRepo = require('../repositories/userRepository');

/* Routing */
router.route('/')
    .get(userRepo.getUser);

router.route('/:id')
    .get(userRepo.getUser)
    .put(userRepo.updateUser)
    .delete(userRepo.deleteUser);

module.exports = router;
