const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  issue_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
  from_status: { type: String, enum: ['reported', 'in_progress', 'resolved'] },
  to_status: { type: String, enum: ['reported', 'in_progress', 'resolved'], required: true },
  changed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  note: String,
  created_at: { type: Date, default: Date.now }
});

statusHistorySchema.index({ issue_id: 1 });

module.exports = mongoose.model('StatusHistory', statusHistorySchema);
