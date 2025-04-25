const express = require("express");
const router = express.Router();
const {
  createContest,
  getAllContests,
  getContestById,
  updateContest,
  deleteContest,
  joinContest,
  submitContestSolution,
  getProblemsForContest,
  getProblemsByContest,
  getContestLeaderboard
} = require("../controllers/contestController");

router.post("/", createContest);
router.get("/contests", getAllContests);
router.get("/:contestId", getContestById);
router.put("/:contestId", updateContest);
router.delete("/:contestId", deleteContest);
router.post("/join", joinContest);
router.post("/submit", submitContestSolution);
router.get("/:contestId/problems", getProblemsForContest);
router.get("/:contestId/leaderboard", getContestLeaderboard);

module.exports = router;
