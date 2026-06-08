const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  points: { type: Number, required: true },
  action: { type: String, enum: ['first_report', 'verified_report', 'issue_resolved', 'bonus'], required: true },
  issue_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
  description: String,
  created_at: { type: Date, default: Date.now }
});

rewardSchema.index({ user_id: 1, created_at: -1 });

module.exports = mongoose.model('RewardTransaction', rewardSchema);
