const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createIssue,
  getAllIssues,
  getMyIssues,
} = require("../controllers/issueController");

router.post(
  "/",
  protect,
  upload.single("image"),
  createIssue
);

router.get("/", getAllIssues);

router.get("/my", protect, getMyIssues);

module.exports = router;