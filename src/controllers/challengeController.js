const {supabase} = require("../config/supabaseClient");

// Create a new 1v1 challenge
exports.createChallenge = async (req, res) => {
  const { challenger_id, opponent_id, problem_id } = req.body;

  const { data, error } = await supabase.from("challenges").insert([
    {
      challenger_id,
      opponent_id,
      problem_id,
    },
  ]);

  if (error) {
    return res.status(500).json({ error: "Failed to create challenge", details: error });
  }

  res.status(201).json({ message: "Challenge created", challenge: data[0] });
};

// Accept or reject a challenge
exports.respondToChallenge = async (req, res) => {
    const { challengeId } = req.params;
    const { status } = req.body; // expected: 'accepted' or 'rejected'
  
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
  
    const { data, error } = await supabase
      .from("challenges")
      .update({ status })
      .eq("id", challengeId)
      .select();
  
    if (error) {
      return res.status(500).json({ error: "Failed to update challenge", details: error });
    }
  
    res.status(200).json({ message: `Challenge ${status}`, challenge: data[0] });
  };

// Get incoming and outgoing challenges for a user
exports.getUserChallenges = async (req, res) => {
    const { userId } = req.params;
  
    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
      .order("created_at", { ascending: false });
  
    if (error) {
      return res.status(500).json({ error: "Failed to fetch challenges", details: error });
    }
  
    res.status(200).json(data);
  };    

const determineWinnerForMatch = async (match_id) => {
    const { data: match, error: matchError } = await supabase
      .from("1v1_matches")
      .select("*")
      .eq("id", match_id)
      .single();
  
    if (matchError || !match) {
      throw new Error("Match not found.");
    }
  
    const { challenger_id, opponent_id, problem_id } = match;
  
    // Fetch submissions by both users for this problem in this match
    const { data: submissions, error: subError } = await supabase
      .from("submissions")
      .select("*")
      .eq("problem_id", problem_id)
      .in("user_id", [challenger_id, opponent_id])
      .eq("match_id", match_id)
      .order("created_at", { ascending: true });
  
    if (subError || submissions.length < 1) {
      throw new Error("Submissions not found for both users.");
    }
  
    const scores = {};
    for (const submission of submissions) {
      const { user_id, passed, time } = submission;
      if (!scores[user_id] && passed) {
        scores[user_id] = { time, passed: true };
      }
    }
  
    let winner_id = null;
  
    if (scores[challenger_id]?.passed && scores[opponent_id]?.passed) {
      winner_id = scores[challenger_id].time < scores[opponent_id].time
        ? challenger_id
        : opponent_id;
    } else if (scores[challenger_id]?.passed) {
      winner_id = challenger_id;
    } else if (scores[opponent_id]?.passed) {
      winner_id = opponent_id;
    }
  
    // Save winner to the match
    if (winner_id) {
      await supabase
        .from("1v1_matches")
        .update({ winner_id })
        .eq("id", match_id);
    }
  
    return winner_id;
  };

  