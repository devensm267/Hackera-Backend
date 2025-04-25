const express = require("express");
const router = express.Router();
const { runCode } = require("../controllers/runCode");
const { submitSolution } = require("../controllers/submissionController"); // ✅ make sure this path is correct

router.post("/run", runCode);
router.post("/submit", submitSolution);

module.exports = router;
