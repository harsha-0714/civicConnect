const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary.config');
const ctrl = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate.middleware');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Must contain uppercase')
    .matches(/[0-9]/).withMessage('Must contain number')
];

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

router.post('/register', registerRules, validate, ctrl.register);
router.post('/login', loginRules, validate, ctrl.login);
router.get('/me', protect, ctrl.getMe);
router.put('/profile', protect, upload.single('avatar'), ctrl.updateProfile);
router.get('/rewards', protect, ctrl.getRewardHistory);

module.exports = router;

