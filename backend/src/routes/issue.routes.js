const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary.config');
const ctrl = require('../controllers/issue.controller');

router.get('/', ctrl.getIssues);  // Public
router.get('/:id', ctrl.getIssueById);  // Public

router.post('/', protect, upload.array('images', 3), ctrl.createIssue);
router.patch('/:id/status', protect, authorize('admin', 'authority'), ctrl.updateIssueStatus);
router.delete('/:id', protect, ctrl.deleteIssue);

module.exports = router;
