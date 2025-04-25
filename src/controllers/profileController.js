const {supabase} = require("../config/supabaseClient");

// Fetch user profile (basic info)
exports.getUserProfile = async (req, res) => {
  const { user_id } = req.params;

  const { data, error } = await supabase
    .from("profiles")
    .select("username, solved_problems, total_submissions, accepted_submissions")
    .eq("id", user_id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "User profile not found" });
  }

  res.json(data);
};

// Aggregate submission stats for user
exports.getUserStats = async (req, res) => {
  const { user_id } = req.params;

  const { data, error } = await supabase
    .from("submissions")
    .select("user_id, problem_id, status")
    .eq("user_id", user_id);

  if (error) {
    return res.status(500).json({ error: "Failed to fetch submissions", details: error });
  }

  const total = data.length;
  const accepted = data.filter(sub => sub.status === "accepted").length;
  const rejected = total - accepted;
  const attemptedProblems = new Set(data.map(sub => sub.problem_id));
  const solvedProblems = new Set(
    data.filter(sub => sub.status === "accepted").map(sub => sub.problem_id)
  );

  res.json({
    problems_attempted: attemptedProblems.size,
    problems_solved: solvedProblems.size,
    total_submissions: total,
    accepted_submissions: accepted,
    rejected_submissions: rejected,
  });
};
