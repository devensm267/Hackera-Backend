const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// Route imports
const authRoutes = require("./routes/authRoutes");
const codeExecutionRoutes = require("./routes/codeExecutionRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const profileRoutes = require("./routes/profileRoutes");
const problemRoutes = require("./routes/problemRoutes");
const testCaseRoutes = require("./routes/testCaseRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const userRoutes = require("./routes/userRoutes");
const contestRoutes = require("./routes/contestRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const oneVOneRoutes = require("./routes/1v1Routes");
const languageRoutes = require("./routes/languageRoutes");
const codeRoutes = require('./routes/code');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Auth
app.use("/api/auth", authRoutes);

// Code Execution
app.use("/api/code", codeExecutionRoutes);

// Problems
app.use("/api/problems", problemRoutes);

// Test Cases
app.use("/api/test-cases", testCaseRoutes);

// Submissions
app.use("/api/submissions", submissionRoutes);

// Leaderboard
app.use("/api/leaderboard", leaderboardRoutes);

// Profile (individual user profile)
app.use("/api/profile", profileRoutes);

// User (user-related stuff like submissions and profile info)
app.use("/api/user", userRoutes);

app.use("/api", contestRoutes);

app.use("/api", oneVOneRoutes);

app.use("/api", languageRoutes);

app.use("/api/code", codeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
