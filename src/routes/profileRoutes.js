const express = require("express");
const { getUserProfile } = require("../controllers/profileController");
const { getUserStats } = require("../controllers/profileController")

const router = express.Router();

router.get("/:user_id/info", getUserProfile);
router.get("/:user_id/profile", getUserStats);

module.exports = router;
