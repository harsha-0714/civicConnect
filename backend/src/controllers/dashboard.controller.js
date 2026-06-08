const Issue = require('../models/Issue.model');
const User = require('../models/User.model');

exports.getStats = async (req, res, next) => {
  try {
    const [total, resolved, in_progress, byType, thisWeek] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'resolved' }),
      Issue.countDocuments({ status: 'in_progress' }),
      Issue.aggregate([{ $group: { _id: '$issue_type', count: { $sum: 1 } } }]),
      Issue.countDocuments({ created_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
    ]);

    const issuesByType = byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {});

    res.json({
      success: true,
      stats: {
        total_issues: total,
        resolved_issues: resolved,
        active_issues: total - resolved,
        in_progress_issues: in_progress,
        resolution_rate: total ? ((resolved / total) * 100).toFixed(1) : 0,
        this_week: thisWeek,
        issues_by_type: issuesByType
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'citizen', is_active: true })
      .sort({ points: -1 })
      .limit(10)
      .select('name points badge_tier avatar_url reports_count verified_reports');

    const leaderboard = users.map((user, index) => ({ rank: index + 1, ...user.toObject() }));
    res.json({ success: true, leaderboard });
  } catch (error) {
    next(error);
  }
};

exports.getTrends = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
    const days = period === '30d' ? 30 : period === '90d' ? 90 : 7;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [reported, resolved] = await Promise.all([
      Issue.aggregate([
        { $match: { created_at: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Issue.aggregate([
        { $match: { resolved_at: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$resolved_at' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({ success: true, reported, resolved });
  } catch (error) {
    next(error);
  }
};

exports.getMapData = async (req, res, next) => {
  try {
    const { lat, lng, radius_km = 20 } = req.query;
    const query = {};

    if (lat && lng) {
      query['location.coordinates'] = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius_km) * 1000
        }
      };
    }

    const issues = await Issue.find(query)
      .select('title issue_type location status severity_score upvotes_count priority_score images created_at')
      .limit(500);

    res.json({ success: true, issues });
  } catch (error) {
    next(error);
  }
};

