const express = require("express");
const { validateSubmission ,getProblemById} = require("../controllers/codeExecutionController");

const router = express.Router();

router.post("/validate", validateSubmission);
router.get("/problem/:problem_id", getProblemById);

module.exports = router;
