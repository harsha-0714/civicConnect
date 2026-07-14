const classifyImage = require("../services/classificationService");
const Issue = require("../models/Issue");

// Create Issue
const createIssue = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      latitude,
      longitude,
      ward,
    } = req.body;

    const imageUrl = req.file ? req.file.path : "";
    const issue = await Issue.create({
      title,
      description,
      category,
      ward,
      imageUrl,

      gps: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      },

      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

// Get All Issues

const getAllIssues = async (req, res) => {

  try {

    const issues = await Issue.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: issues.length,
      data: issues,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};

// My Reports

const getMyIssues = async (req, res) => {

  try {

    const issues = await Issue.find({
      createdBy: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: issues.length,
      data: issues,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};

module.exports = {
  createIssue,
  getAllIssues,
  getMyIssues,
};