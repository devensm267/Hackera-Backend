const {supabase} = require("../config/supabaseClient");
const executeCode = require("../controllers/codeExecutionController"); // This should handle Judge0 execution

// Create a 1v1 challenge
const create1v1Match = async (req, res) => {
    const {
        player1_id,
        player2_id,
        problem_id,
        start_time,
        end_time,
    } = req.body;
    console.log("Request Body:", req.body);

    if (!player1_id || !player2_id || !problem_id || !start_time || !end_time) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    try {
      const { data, error } = await supabase
        .from("1v1_matches")
        .insert([
          {
            player1_id,
            player2_id,
            problem_id,
            start_time,
            end_time,
          },
        ])
        .select()
        .single();
  
      if (error) {
        console.error("Supabase insert error:", error); // 👈 This line helps!
        return res.status(500).json({ error: "Failed to create match", details: error });
      }
  
      res.status(201).json({ message: "1v1 Match created successfully", match: data });
    } catch (err) {
      res.status(500).json({ error: "Unexpected error", details: err.message });
    }
  };
  

// Get all 1v1 matches
const getAll1v1Matches = async (_req, res) => {
  const { data, error } = await supabase.from("1v1_matches").select("*");

  if (error) {
    return res.status(500).json({ error: "Failed to fetch matches", details: error });
  }

  res.json(data);
};

// Get 1v1 match by ID
const get1v1MatchById = async (req, res) => {
  const { matchId } = req.params;

  const { data, error } = await supabase
    .from("1v1_matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (error) {
    return res.status(404).json({ error: "Match not found", details: error });
  }

  res.json(data);
};

// Submit solution for 1v1 match
const submit1v1Solution = async (req, res) => {
    const { user_id, match_id, language, code } = req.body;
  
    try {
      // 1. Get the match info
      const { data: match, error: matchError } = await supabase
        .from("1v1_matches")
        .select("*")
        .eq("id", match_id)
        .single();
  
      if (matchError || !match) {
        return res.status(404).json({ error: "Match not found", details: matchError });
      }
  
      // 2. Check if late
      const now = new Date();
      const endTime = new Date(match.end_time);
      const isLate = now > endTime;
  
      // 3. Fetch problem's test cases
      const { data: testCases, error: testCaseError } = await supabase
        .from("test_cases")
        .select("*")
        .eq("problem_id", match.problem_id);
  
      if (testCaseError) {
        return res.status(500).json({ error: "Failed to fetch test cases", details: testCaseError });
      }
  
      let passedAll = true;
  
      // 4. Run code against test cases
      for (const testCase of testCases) {
        const result = await executeCode(code, language, testCase.input);
  
        if (result.stdout?.trim() !== testCase.expected_output?.trim()) {
          passedAll = false;
          break;
        }
      }
  
      // 5. Store submission
      const { data: submission, error: submissionError } = await supabase
        .from("1v1_submissions")
        .insert([
          {
            match_id,
            user_id,
            code,
            language,
            passed: passedAll,
            is_late: isLate,
          },
        ])
        .select()
        .single();
  
      if (submissionError) {
        return res.status(500).json({ error: "Failed to save submission", details: submissionError });
      }
  
      res.status(201).json({
        message: passedAll
          ? isLate
            ? "Passed all test cases but submission was late ⏱️❌"
            : "Passed all test cases ✅"
          : "Failed some test cases ❌",
        submission,
      });
    } catch (err) {
      res.status(500).json({ error: "Unexpected error", details: err.message });
    }
        // 6. Check if both players submitted (and not late)
        const { data: allSubmissions, error: fetchError } = await supabase
        .from("1v1_submissions")
        .select("*")
        .eq("match_id", match_id)
        .eq("is_late", false);
  
      if (fetchError) {
        console.error("Failed to fetch submissions for winner check", fetchError);
        return;
      }
  
      if (allSubmissions.length === 2) {
        const [sub1, sub2] = allSubmissions;
  
        let winnerId = null;
  
        if (sub1.passed && !sub2.passed) winnerId = sub1.user_id;
        else if (!sub1.passed && sub2.passed) winnerId = sub2.user_id;
        else if (sub1.passed && sub2.passed) {
          // Optional: Compare execution time here if you track it
          // For now, we'll just call it a tie (null) or pick the first submitter
          winnerId = sub1.created_at < sub2.created_at ? sub1.user_id : sub2.user_id;
        }
  
        await supabase
          .from("1v1_matches")
          .update({ winner_id: winnerId })
          .eq("id", match_id);
      }
  
  };
  
module.exports = {
  create1v1Match,
  getAll1v1Matches,
  get1v1MatchById,
  submit1v1Solution
};
