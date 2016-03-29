var express = require('express');
var router = express();
var wayPointRepo = require('../repositories/wayPointRepository');

router.route('/:id')
    .get(wayPointRepo.getWayPoint);
router.route('/:id/user')
    .post(wayPointRepo.tagWaypoint);
// Export
module.exports = router;