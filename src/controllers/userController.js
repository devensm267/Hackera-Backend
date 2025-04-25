const { supabase } = require("../config/supabaseClient");

const getUserProfile = async (req, res) => {
  const userId = req.params.id;

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, email")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return res.status(404).json({ error: "User profile not found" });
  }

  // Fetch submissions
  const { data: submissions, error: submissionsError } = await supabase
    .from("submissions")
    .select("problem_id, status")
    .eq("user_id", userId);

  if (submissionsError) {
    return res.status(500).json({ error: "Failed to fetch submissions" });
  }

  // Analyze solved problems
  const solvedProblems = new Set();
  submissions.forEach((sub) => {
    if (sub.status === "Accepted") {
      solvedProblems.add(sub.problem_id);
    }
  });

  // Prepare final data
  const profileData = {
    ...profile,
    totalSubmissions: submissions.length,
    problemsSolved: solvedProblems.size,
    accuracy:
      submissions.length > 0
        ? `${((solvedProblems.size / submissions.length) * 100).toFixed(2)}%`
        : "0%",
  };

  res.status(200).json(profileData);
};

module.exports = { getUserProfile };
