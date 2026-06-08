const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 50 },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  avatar_url: { type: String, default: null },
  phone: { type: String, default: null },
  role: { type: String, enum: ['citizen', 'admin', 'authority'], default: 'citizen' },
  points: { type: Number, default: 0, min: 0 },
  badge_tier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
  reports_count: { type: Number, default: 0 },
  verified_reports: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

userSchema.index({ email: 1 });
userSchema.index({ points: -1 });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update badge tier based on points
userSchema.methods.updateBadgeTier = function() {
  if (this.points >= 600) this.badge_tier = 'Platinum';
  else if (this.points >= 300) this.badge_tier = 'Gold';
  else if (this.points >= 100) this.badge_tier = 'Silver';
  else this.badge_tier = 'Bronze';
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
