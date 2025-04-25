const {supabase} = require("../config/supabaseClient");

// Create a new contest
exports.createContest = async (req, res) => {
  const { name, description, start_time, end_time } = req.body;

  const { data, error } = await supabase.from("contests").insert([
    { name, description, start_time, end_time },
  ]);

  if (error) return res.status(500).json({ error: "Failed to create contest", details: error });
  res.status(201).json(data);
};

// Get all contests
exports.getAllContests = async (_req, res) => {
  const { data, error } = await supabase.from("contests").select("*").order("start_time");

  if (error) return res.status(500).json({ error: "Failed to fetch contests", details: error });
  res.json(data);
};

// Get contest by ID
exports.getContestById = async (req, res) => {
  const { contestId } = req.params;

  const { data, error } = await supabase
    .from("contests")
    .select("*")
    .eq("id", contestId)
    .single();

  if (error) return res.status(404).json({ error: "Contest not found", details: error });
  res.json(data);
};

// Update a contest
exports.updateContest = async (req, res) => {
  const { contestId } = req.params;
  const { name, description, start_time, end_time } = req.body;

  const { data, error } = await supabase
    .from("contests")
    .update({ name, description, start_time, end_time })
    .eq("id", contestId)
    .select();

  if (error) return res.status(500).json({ error: "Failed to update contest", details: error });
  res.json(data);
};

// Delete a contest
exports.deleteContest = async (req, res) => {
  const { contestId } = req.params;

  const { error } = await supabase.from("contests").delete().eq("id", contestId);

  if (error) return res.status(500).json({ error: "Failed to delete contest", details: error });
  res.status(204).send();
};
exports.joinContest = async (req, res) => {
    const { user_id, contest_id } = req.body;
    if (new Date() > new Date(contest.start_time)) {
      return res.status(400).json({ error: "Contest already started" });
    }
    
  
    const { error } = await supabase.from("contest_participants").insert([
      { user_id, contest_id }
    ]);
  
    if (error) {
      return res.status(500).json({ error: "Failed to join contest", details: error });
    }
    const { data: existing, error: checkError } = await supabase
  .from("contest_participants")
  .select("*")
  .eq("user_id", user_id)
  .eq("contest_id", contest_id)
  .maybeSingle();

  if (existing) {
    return res.status(400).json({ error: "User already joined this contest" });
  }

  
    res.status(200).json({ message: "Joined contest successfully" });
  };


  exports.submitContestSolution = async (req, res) => {
    const { problem_id, user_id, language, code, contest_id, status, output, error: errorOutput, time, memory } = req.body;
  
    try {
      const { error } = await supabase.from("submissions").insert([
        {
          user_id,
          problem_id,
          language,
          code,
          output,
          error: errorOutput,
          time,
          memory,
          status,
          contest_id,
        }
      ]);
  
      if (error) {
        return res.status(500).json({ error: "Failed to submit solution", details: error });
      }
  
      res.status(200).json({ message: "Solution submitted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Server error", details: err.message });
    }
  };
// Get problems for a specific contest
exports.getProblemsForContest = async (req, res) => {
    const { contestId } = req.params;
  
    const { data, error } = await supabase
      .from("contest_problems")
      .select("problem_id, problems(id, title, difficulty)")
      .eq("contest_id", contestId)
      .order("problem_id")
      .returns({ problems: "problems" }); // For nested join
  
    if (error) {
      return res.status(500).json({ error: "Failed to fetch problems for contest", details: error });
    }
  
    const problems = data.map(item => item.problems);
    res.json(problems);
  };

// src/controllers/contestController.js
exports.getProblemsByContest = async (req, res) => {
    const { contestId } = req.params;
  
    const { data, error } = await supabase
      .from("problems")
      .select("*")
      .eq("contest_id", contestId); // Ensure this column exists
  
    if (error) {
      return res.status(500).json({ error: "Failed to fetch problems", details: error });
    }
  
    res.json(data);
  };

  exports.getContestLeaderboard = async (req, res) => {
    const { contestId } = req.params;
  
    const { data, error } = await supabase.rpc("get_contest_leaderboard", {
      contest_id_input: contestId,
    });
  
    if (error) {
      return res.status(500).json({ error: "Failed to fetch leaderboard", details: error });
    }
  
    res.json(data);
  };
    