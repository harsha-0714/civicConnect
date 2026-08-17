const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createIssue,
  getAllIssues,
  getMyIssues,
  predictIssue,
  upvoteIssue,
} = require("../controllers/issueController");
router.post(
    "/predict",
    protect,
    upload.single("image"),
    predictIssue
);
router.post(
  "/",
  protect,
  upload.single("image"),
  createIssue
);

router.get("/", getAllIssues);

router.get("/my", protect, getMyIssues);

router.patch("/:id/upvote", protect, upvoteIssue);

module.exports = router;
