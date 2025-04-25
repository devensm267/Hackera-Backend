const express = require("express");
const router = express.Router();

const {
  submitSolution,
  getSubmissionsByUser,
  getSubmissionById,
  getUserSubmissionsForContest,
  handle1v1Submission,
} = require("../controllers/submissionController");
const { validateSubmission } = require("../controllers/codeExecutionController");

router.post("/submit", validateSubmission,submitSolution);
router.get("/:userId", getSubmissionsByUser);
router.get("/submission/:submissionId", getSubmissionById);
router.get("/contests/:contestId/users/:userId/submissions", getUserSubmissionsForContest);
router.post("/challenges/submit", handle1v1Submission);
module.exports = router;
