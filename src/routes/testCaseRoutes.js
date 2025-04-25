const express = require("express");
const router = express.Router();
const {
  createTestCase,
  getTestCasesByProblem,
  updateTestCase,
  deleteTestCase,
} = require("../controllers/testCaseController");

// Base path: /api/test-cases
router.post("/", createTestCase);                        // Create new test case
router.get("/:problemId", getTestCasesByProblem);        // Get all test cases for a problem
router.put("/:testCaseId", updateTestCase);              // Update a specific test case
router.delete("/:testCaseId", deleteTestCase);           // Delete a specific test case

module.exports = router;
