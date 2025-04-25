// src/routes/problemRoutes.js
const express = require("express");
const {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
} = require("../controllers/problemController");

const router = express.Router();

router.post("/", createProblem);
router.get("/", getProblems);
router.get("/:id", getProblemById);
router.put("/:id", updateProblem);
router.delete("/:id", deleteProblem);

module.exports = router;
