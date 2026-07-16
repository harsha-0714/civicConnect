const Issue = require("../models/Issue");
const classifyImage = require("../services/classificationService");
const uploadToCloudinary = require("../services/cloudinaryService");

// Create Issue

const createIssue = async (req, res) => {
  try {
    console.log("========== REQUEST BODY ==========");
    console.log(req.body);

    console.log("========== REQUEST FILE ==========");
    console.log(req.file);
    const {
      title,
      description,
      category,
      latitude,
      longitude,
      ward,
    } = req.body;

    let imageUrl = "";
    let aiResult = null;

    if (req.file) {
      // AI Classification
      aiResult = await classifyImage(req.file.buffer);

      // Upload Image to Cloudinary
      const uploadedImage = await uploadToCloudinary(req.file.buffer);

      imageUrl = uploadedImage.secure_url;
    }

    const issue = await Issue.create({
      title,
      description,
      ward,
      imageUrl,

      category: aiResult?.category || category,
      confidence: aiResult?.confidence || 0,

      gps: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      },

      createdBy: req.user._id,
      
    });
console.log(req.file.mimetype);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue,
    });

  } catch (err) {
    console.error(err.response?.data || err);
    console.error(err.response?.status);

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