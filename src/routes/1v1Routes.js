const express = require("express");
const router = express.Router();
const {
    create1v1Match,
  getAll1v1Matches,
  get1v1MatchById,
  submit1v1Solution,
} = require("../controllers/1v1Controller");

// Create a 1v1 match
router.post("/1v1/create", create1v1Match);

// Get all 1v1 matches
router.get("/1v1/", getAll1v1Matches);

// Get specific match
router.get("/1v1/:matchId", get1v1MatchById);

// Submit code for 1v1 match
router.post("/1v1/:matchId/submit", submit1v1Solution);

module.exports = router;
