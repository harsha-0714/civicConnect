const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboard.controller');

router.get('/stats', ctrl.getStats);
router.get('/leaderboard', ctrl.getLeaderboard);
router.get('/trends', ctrl.getTrends);
router.get('/map-data', ctrl.getMapData);

module.exports = router;
