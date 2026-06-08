const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/vote.controller');

router.post('/:issueId', protect, ctrl.upvote);
router.delete('/:issueId', protect, ctrl.removeVote);

module.exports = router;