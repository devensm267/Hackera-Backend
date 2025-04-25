// src/controllers/leaderboardController.js
const {supabase} = require("../config/supabaseClient");
const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leaderboard`);
exports.getLeaderboard = async (req, res) => {
  const { data, error } = await supabase
    .from("submissions")
    .select("user_id")
    .eq("status", "accepted");

  if (error) {
    return res.status(500).json({ error: "Failed to fetch submissions", details: error });
  }

  const leaderboardMap = {};

  for (let submission of data) {
    const userId = submission.user_id;
    leaderboardMap[userId] = leaderboardMap[userId] || { user_id: userId, accepted: 0 };
    leaderboardMap[userId].accepted++;
  }

  const leaderboard = Object.values(leaderboardMap).sort((a, b) => b.accepted - a.accepted);

  // Optional: Pagination
  const page = parseInt(req.query.page) || 1;
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  res.status(200).json(leaderboard.slice(offset, offset + pageSize));
};
