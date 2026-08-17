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
      aiResult = await classifyImage(req.file.buffer);
    }

    const finalCategory = aiResult?.category || category;
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required",
      });
    }

    if (!finalCategory) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const duplicateIssue = await Issue.findOne({
      gps: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: 50,
        },
      },
      category: finalCategory,
      status: { $nin: ["Resolved", "Rejected"] },
    });

    if (duplicateIssue) {
      const updatedIssue = await Issue.findOneAndUpdate(
        {
          _id: duplicateIssue._id,
          upvotedBy: { $ne: req.user._id },
        },
        {
          $inc: { upvotes: 1 },
          $addToSet: { upvotedBy: req.user._id },
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        duplicate: true,
        upvoted: Boolean(updatedIssue),
        message: updatedIssue
          ? "Similar unresolved issue already exists nearby. Existing issue upvoted."
          : "Similar unresolved issue already exists nearby. You have already upvoted it.",
        data: updatedIssue || duplicateIssue,
      });
    }

    if (req.file) {
      const uploadedImage = await uploadToCloudinary(req.file.buffer);

      imageUrl = uploadedImage.secure_url;
      console.log(req.file.mimetype);
    }

    const issue = await Issue.create({
      title,
      description,
      ward,
      imageUrl,

      category: finalCategory,
      confidence: aiResult?.confidence || 0,

      gps: {
        type: "Point",
        coordinates: [lng, lat],
      },

      createdBy: req.user._id,
      
    });
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

// Upvote Issue

const upvoteIssue = async (req, res) => {
  try {
    const updatedIssue = await Issue.findOneAndUpdate(
      {
        _id: req.params.id,
        upvotedBy: { $ne: req.user._id },
      },
      {
        $inc: { upvotes: 1 },
        $addToSet: { upvotedBy: req.user._id },
      },
      { new: true }
    );

    if (updatedIssue) {
      return res.json({
        success: true,
        upvoted: true,
        message: "Issue upvoted successfully",
        data: updatedIssue,
      });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.json({
      success: true,
      upvoted: false,
      message: "You have already upvoted this issue",
      data: issue,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const predictIssue = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                message: "Image is required"
            });
        }

        const result = await classifyImage(req.file.buffer);

        res.json(result);

    }

    catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};
module.exports = {
  createIssue,
  getAllIssues,
  getMyIssues,
  upvoteIssue,
  predictIssue,
};
