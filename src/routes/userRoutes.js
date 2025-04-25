const express = require("express");
const router = express.Router();
const { getUserProfile } = require("../controllers/userCOntroller");

// GET /api/users/:id/profile
router.get("/:id/profile", getUserProfile);

module.exports = router;
