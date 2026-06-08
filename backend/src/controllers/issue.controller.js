// ─────────────────────────────────────────────────────────────
// FILE: backend/src/controllers/issue.controller.js
// PRODUCTION-READY — Includes:
//   ✅ Cloudinary image delete on issue delete (no orphan files)
//   ✅ getThumbnailUrl helper used (no extra Cloudinary credit usage)
//   ✅ AI service fallback (app works even if AI is in cold start)
//   ✅ Timeout on AI call (15s max — won't hang Render request)
// ─────────────────────────────────────────────────────────────

const axios = require('axios');
const ngeohash = require('ngeohash');
const Issue = require('../models/Issue.model');
const User = require('../models/User.model');
const Vote = require('../models/Vote.model');
const StatusHistory = require('../models/StatusHistory.model');
const RewardTransaction = require('../models/RewardTransaction.model');
const { cloudinary, getThumbnailUrl } = require('../config/cloudinary.config');

// ─────────────────────────────────────────────
// Helper: Call AI service
// ✅ FIX: 15s timeout prevents hanging when AI is in cold start
//         Returns safe defaults on failure so app still works
// ─────────────────────────────────────────────
async function analyzeImage(imageUrl) {
  try {
    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/detect`,
      { image_url: imageUrl },
      { timeout: 15000 }  // ✅ 15s timeout — AI cold start can take ~30s
    );
    return response.data;
  } catch (error) {
    // ✅ FIX: Graceful fallback — issue still gets created
    //         User can manually select type
    console.warn('⚠️ AI service unavailable:', error.message);
    return {
      detected_class: 'pothole',  // safe default
      confidence: 0,
      severity_score: 5,          // neutral severity
      bounding_box: null,
      model_version: 'fallback-v0'
    };
  }
}

// ─────────────────────────────────────────────
// Helper: Award reward points to user
// ─────────────────────────────────────────────
async function awardPoints(userId, points, action, issueId, description) {
  await RewardTransaction.create({
    user_id: userId,
    points,
    action,
    issue_id: issueId,
    description
  });

  const user = await User.findById(userId);
  user.points += points;
  user.updateBadgeTier();
  await user.save({ validateBeforeSave: false });
}

// ─────────────────────────────────────────────
// POST /api/v1/issues
// Create a new issue
// ─────────────────────────────────────────────
exports.createIssue = async (req, res, next) => {
  try {
    const { title, description, issue_type, lat, lng, address, city, area } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one image is required' });
    }

    const coordinates = [parseFloat(lng), parseFloat(lat)]; // GeoJSON: [lng, lat]
    const geohash = ngeohash.encode(parseFloat(lat), parseFloat(lng), 6);

    // Check for nearby duplicate (50m radius)
    const nearbyIssues = await Issue.find({
      'location.coordinates': {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: 50
        }
      },
      status: { $ne: 'resolved' }
    }).limit(1);

    // ✅ FIX: Use getThumbnailUrl helper — no extra Cloudinary uploads
    const images = req.files.map(file => ({
      url: file.path,
      public_id: file.filename,
      thumbnail_url: getThumbnailUrl(file.path)  // ✅ URL transform only, no credit cost
    }));

    // Call AI with first image URL
    const aiResult = await analyzeImage(images[0].url);

    const issue = await Issue.create({
      title: title || `${(issue_type || aiResult.detected_class || 'Issue').replace(/_/g, ' ')} near ${address || 'reported location'}`,
      description,
      issue_type: issue_type || aiResult.detected_class || 'pothole',
      images,
      location: {
        type: 'Point',
        coordinates,
        address,
        city,
        area,
        geohash
      },
      reporter_id: req.user._id,
      ai_analysis: {
        detected_type: aiResult.detected_class,
        confidence: aiResult.confidence,
        severity_score: aiResult.severity_score,
        bounding_box: aiResult.bounding_box,
        model_version: aiResult.model_version,
        analyzed_at: new Date()
      },
      severity_score: aiResult.severity_score || 5,
      is_duplicate: nearbyIssues.length > 0,
      duplicate_of: nearbyIssues[0]?._id || null,
      is_verified: aiResult.confidence > 0.7
    });

    // Update reporter stats
    await User.findByIdAndUpdate(req.user._id, { $inc: { reports_count: 1 } });

    // Award points
    await awardPoints(req.user._id, 10, 'first_report', issue._id, 'Submitted a new civic issue report');

    if (aiResult.confidence > 0.7) {
      await awardPoints(req.user._id, 20, 'verified_report', issue._id, 'Report verified by AI with high confidence');
      await User.findByIdAndUpdate(req.user._id, { $inc: { verified_reports: 1 } });
    }

    const populated = await Issue.findById(issue._id)
      .populate('reporter_id', 'name badge_tier avatar_url');

    res.status(201).json({ success: true, issue: populated });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// GET /api/v1/issues
// List issues with filters, pagination, geo-search
// ─────────────────────────────────────────────
exports.getIssues = async (req, res, next) => {
  try {
    const { lat, lng, radius_km, type, status, sort, page = 1, limit = 20 } = req.query;
    const query = {};

    if (type)   query.issue_type = type;
    if (status) query.status = status;

    let issueQuery;

    if (lat && lng) {
      const radiusMeters = parseFloat(radius_km || 10) * 1000;
      issueQuery = Issue.find({
        ...query,
        'location.coordinates': {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: radiusMeters
          }
        }
      });
    } else {
      issueQuery = Issue.find(query);
    }

    const sortMap = {
      priority: { priority_score: -1 },
      recent:   { created_at: -1 },
      upvotes:  { upvotes_count: -1 }
    };
    const sortOption = sortMap[sort] || sortMap.priority;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [issues, total] = await Promise.all([
      issueQuery
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('reporter_id', 'name badge_tier avatar_url'),
      Issue.countDocuments(query)
    ]);

    // Attach vote status for authenticated user
    let votedIssueIds = new Set();
    if (req.user) {
      const userVotes = await Vote.find({
        user_id: req.user._id,
        issue_id: { $in: issues.map(i => i._id) }
      });
      votedIssueIds = new Set(userVotes.map(v => v.issue_id.toString()));
    }

    const issuesWithVoteStatus = issues.map(issue => ({
      ...issue.toObject(),
      user_voted: votedIssueIds.has(issue._id.toString())
    }));

    res.json({
      success: true,
      issues: issuesWithVoteStatus,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// GET /api/v1/issues/:id
// Get single issue with history and vote status
// ─────────────────────────────────────────────
exports.getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reporter_id', 'name badge_tier avatar_url points')
      .populate('duplicate_of', 'title status');

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const statusHistory = await StatusHistory.find({ issue_id: issue._id })
      .sort({ created_at: -1 })
      .populate('changed_by', 'name role');

    let user_voted = false;
    if (req.user) {
      const vote = await Vote.findOne({ user_id: req.user._id, issue_id: issue._id });
      user_voted = !!vote;
    }

    res.json({
      success: true,
      issue: { ...issue.toObject(), status_history: statusHistory, user_voted }
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PATCH /api/v1/issues/:id/status
// Update issue status (admin/authority only)
// ─────────────────────────────────────────────
exports.updateIssueStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const prevStatus = issue.status;

    await StatusHistory.create({
      issue_id: issue._id,
      from_status: prevStatus,
      to_status: status,
      changed_by: req.user._id,
      note
    });

    issue.status = status;
    if (status === 'resolved') issue.resolved_at = new Date();
    await issue.save();

    // Award 30 points to reporter on resolution
    if (status === 'resolved') {
      await awardPoints(
        issue.reporter_id,
        30,
        'issue_resolved',
        issue._id,
        'Your reported issue has been resolved!'
      );
    }

    res.json({ success: true, issue });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// DELETE /api/v1/issues/:id
// ✅ FIX: Deletes images from Cloudinary first
//         Prevents orphan files eating free 25GB quota
// ─────────────────────────────────────────────
exports.deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const isOwner = issue.reporter_id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this issue' });
    }

    // ✅ FIX: Delete all images from Cloudinary before deleting the document
    //         This prevents orphaned images eating your free 25GB storage quota
    const deletePromises = issue.images.map(img =>
      cloudinary.uploader.destroy(img.public_id).catch(err =>
        console.warn(`⚠️ Cloudinary delete failed for ${img.public_id}:`, err.message)
      )
    );
    await Promise.all(deletePromises);

    await issue.deleteOne();

    res.json({ success: true, message: 'Issue and associated images deleted successfully' });
  } catch (error) {
    next(error);
  }
};