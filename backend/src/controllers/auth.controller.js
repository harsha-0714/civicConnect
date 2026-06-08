const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const RewardTransaction = require('../models/RewardTransaction.model');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, phone });
    const token = generateToken(user._id);

    res.status(201).json({ success: true, token, user });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    user.updated_at = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({ success: true, token, user });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.phone) updates.phone = req.body.phone;
    if (req.file) updates.avatar_url = req.file.path;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.getRewardHistory = async (req, res, next) => {
  try {
    const transactions = await RewardTransaction.find({ user_id: req.user._id })
      .sort({ created_at: -1 })
      .limit(20)
      .populate('issue_id', 'title issue_type');

    res.json({ success: true, transactions });
  } catch (error) {
    next(error);
  }
};