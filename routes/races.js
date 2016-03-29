/**
 * Created by niek on 22-3-2016.
 */
var express = require('express');
var router = express();
var raceRepo = require('../repositories/raceRepository');

/* Routing */
router.route('/')
    .get(raceRepo.getRace)
    .post(raceRepo.addRace);

router.route('/:id')
    .get(raceRepo.getRace)
    .put(raceRepo.updateRace)
    .delete(raceRepo.deleteRace);
router.route('/:id/waypoint')
    .post(raceRepo.addWayPoint)
    .get(raceRepo.getRaceWayPoints);
router.route('/:id/waypoint/:waypointId')
    .delete(raceRepo.deleteWaypoint);
router.route('/:id/user')
    .post(raceRepo.addUser)
    .get(raceRepo.getUsers);
router.route('/:id/user/:userId')
    .delete(raceRepo.deleteUser);
router.route('/:pagesize/:pagenumber')
    .get(raceRepo.getRacePaged);

module.exports = router;
