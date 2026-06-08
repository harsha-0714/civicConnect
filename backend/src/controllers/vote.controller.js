const Vote = require('../models/Vote.model');
const Issue = require('../models/Issue.model');

exports.upvote = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.issueId);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    if (issue.reporter_id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot vote on your own issue' });
    }

    const existingVote = await Vote.findOne({ user_id: req.user._id, issue_id: issue._id });
    if (existingVote) {
      return res.status(409).json({ success: false, message: 'Already voted on this issue' });
    }

    await Vote.create({ user_id: req.user._id, issue_id: issue._id });

    issue.upvotes_count += 1;
    issue.priority_score = (issue.severity_score * 0.6) + (issue.upvotes_count * 0.4);
    await issue.save();

    res.json({ success: true, upvotes_count: issue.upvotes_count, priority_score: issue.priority_score, user_voted: true });
  } catch (error) {
    next(error);
  }
};

exports.removeVote = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.issueId);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    const vote = await Vote.findOneAndDelete({ user_id: req.user._id, issue_id: issue._id });
    if (!vote) return res.status(404).json({ success: false, message: 'Vote not found' });

    issue.upvotes_count = Math.max(0, issue.upvotes_count - 1);
    issue.priority_score = (issue.severity_score * 0.6) + (issue.upvotes_count * 0.4);
    await issue.save();

    res.json({ success: true, upvotes_count: issue.upvotes_count, priority_score: issue.priority_score, user_voted: false });
  } catch (error) {
    next(error);
  }
};
