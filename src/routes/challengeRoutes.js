const express = require("express");
const router = express.Router();
const { createChallenge } = require("../controllers/challengeController");
const { respondToChallenge } = require("../controllers/challengeController");
const { getUserChallenges } = require("../controllers/challengeController");
const { determineWinnerForMatch } = require("../controllers/challengeController");

router.post("/challenges", createChallenge);

router.patch("/challenges/:challengeId/respond", respondToChallenge);

router.get("/challenges/user/:userId", getUserChallenges);

module.exports = router;
