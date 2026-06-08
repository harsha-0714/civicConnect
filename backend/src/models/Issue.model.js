const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  issue_type: {
    type: String,
    required: true,
    enum: ['pothole', 'garbage_dump', 'broken_streetlight', 'water_leakage', 'open_manhole']
  },
  images: [{
    url: { type: String, required: true },
    public_id: { type: String, required: true },
    thumbnail_url: String
  }],
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
    address: String,
    city: String,
    area: String,
    geohash: String
  },
  reporter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['reported', 'in_progress', 'resolved'], default: 'reported' },
  ai_analysis: {
    detected_type: String,
    confidence: { type: Number, min: 0, max: 1 },
    severity_score: { type: Number, min: 0, max: 10 },
    bounding_box: { x: Number, y: Number, width: Number, height: Number },
    model_version: String,
    analyzed_at: Date
  },
  severity_score: { type: Number, min: 0, max: 10, default: 5 },
  upvotes_count: { type: Number, default: 0 },
  priority_score: { type: Number, default: 0 },
  is_duplicate: { type: Boolean, default: false },
  duplicate_of: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', default: null },
  is_verified: { type: Boolean, default: false },
  resolved_at: { type: Date, default: null }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Geospatial index
issueSchema.index({ 'location.coordinates': '2dsphere' });
issueSchema.index({ priority_score: -1 });
issueSchema.index({ status: 1, issue_type: 1 });
issueSchema.index({ reporter_id: 1 });
issueSchema.index({ created_at: -1 });

// Auto-compute priority_score before save
issueSchema.pre('save', function(next) {
  this.priority_score = (this.severity_score * 0.6) + (this.upvotes_count * 0.4);
  next();
});

module.exports = mongoose.model('Issue', issueSchema);


