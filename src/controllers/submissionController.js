const {supabase} = require("../config/supabaseClient");
const executeCode = require("../controllers/codeExecutionController"); // Your Judge0 wrapper function

// Submit solution and validate
const submitSolution = async (req, res) => {
  const { user_id, problem_id, language, code, contest_id, match_id } = req.body;

  try {
    // Optional: Check if problem is part of the contest
    if (contest_id) {
      const { data: contestProblem, error: checkError } = await supabase
        .from("contest_problems")
        .select("*")
        .eq("contest_id", contest_id)
        .eq("problem_id", problem_id)
        .single();

      if (checkError || !contestProblem) {
        return res.status(400).json({ error: "This problem is not part of the contest." });
      }
    }

    // Fetch test cases
    const { data: testCases, error: testCaseError } = await supabase
      .from("test_cases")
      .select("*")
      .eq("problem_id", problem_id);

    if (testCaseError) {
      return res.status(500).json({ error: "Failed to fetch test cases", details: testCaseError });
    }

    let passedAll = true;
    let passedCount = 0;
    let totalExecutionTime = 0;
    let combinedStdout = "";
    let combinedStderr = "";

    const resultsArray = [];

    for (const testCase of testCases) {
      const result = await executeCode(code, language, testCase.input);

      const { stdout, stderr, time } = result;
      const trimmedOutput = stdout?.trim() || "";
      const expectedOutput = testCase.expected_output?.trim() || "";

      const passed = trimmedOutput === expectedOutput;

      if (!passed) passedAll = false;
      else passedCount++;

      totalExecutionTime += parseFloat(time || 0);
      combinedStdout += trimmedOutput + "\n";
      combinedStderr += stderr || "";

      resultsArray.push({
        input: testCase.input,
        expected: expectedOutput,
        output: trimmedOutput,
        passed,
        stderr,
        time,
      });
    }

    // Determine if submission is late
    let isLate = false;
    if (contest_id) {
      const { data: contest } = await supabase
        .from("contests")
        .select("end_time")
        .eq("id", contest_id)
        .single();

      if (contest && new Date() > new Date(contest.end_time)) {
        isLate = true;
      }
    }

    if (match_id) {
      const { data: match } = await supabase
        .from("1v1_matches")
        .select("end_time")
        .eq("id", match_id)
        .single();

      if (match && new Date() > new Date(match.end_time)) {
        isLate = true;
      }
    }

    // Save submission
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert([{
        user_id,
        problem_id,
        contest_id,
        match_id,
        language,
        code,
        status: passedAll ? 'accepted' : 'rejected',
        is_late: isLate,
        time: totalExecutionTime,
      }])
      .select()
      .single();

    if (submissionError) {
      return res.status(500).json({ error: "Failed to save submission", details: submissionError });
    }

    // Update profile solved count
    if (passedAll) {
      await supabase
        .from("profiles")
        .update({ solved_count: supabase.rpc("increment_solved", { uid: user_id }) })
        .eq("id", user_id);
    }

    return res.status(200).json({
      message: passedAll ? "✅ All test cases passed" : "❌ Some test cases failed",
      late: isLate,
      submission,
      test_case_results: resultsArray,
      stats: {
        status: passedAll ? "accepted" : "rejected",
        passed_test_cases: passedCount,
        total_test_cases: testCases.length,
        execution_time: totalExecutionTime.toFixed(2),
        stdout: combinedStdout.trim(),
        stderr: combinedStderr.trim(),
      },
    });
  } catch (err) {
    return res.status(500).json({
      error: "Unexpected error during submission",
      details: err.message,
    });
  }
};


// Get all submissions by a user
const getSubmissionsByUser = async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: "Failed to fetch submissions", details: error });
  }

  res.status(200).json(data);
};

// Get single submission by ID
const getSubmissionById = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(500).json({ error: "Failed to fetch submission", details: error });
  }

  res.status(200).json(data);
};

// Submissions for contest
const getUserSubmissionsForContest = async (req, res) => {
  const { userId, contestId } = req.params;

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("user_id", userId)
    .eq("contest_id", contestId)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: "Failed to fetch submissions", details: error });
  }

  res.json(data);
};

// 1v1 submission handler
const handle1v1Submission = async ({ user_id, challenge_id, problem_id, language, code }) => {
  const { data: problemData, error: problemError } = await supabase
    .from("problems")
    .select("test_cases")
    .eq("id", problem_id)
    .single();

  if (problemError || !problemData) {
    return { error: "Problem not found" };
  }

  const testCases = problemData.test_cases;
  let allPassed = true;
  let lastOutput = "", errorOutput = "", executionTime = 0, memoryUsed = 0;

  for (const testCase of testCases) {
    const result = await executeCode(code, language, testCase.input);
    const { stdout, stderr, time, memory } = result;

    lastOutput = stdout;
    errorOutput = stderr;
    executionTime = parseFloat(time || 0);
    memoryUsed = parseInt(memory || 0);

    if (stderr || stdout.trim() !== testCase.expected_output.trim()) {
      allPassed = false;
      break;
    }
  }

  const status = allPassed ? "accepted" : "rejected";

  const { error: submissionError } = await supabase.from("submissions").insert([{
    user_id,
    problem_id,
    language,
    code,
    output: lastOutput,
    error: errorOutput,
    time: executionTime,
    memory: memoryUsed,
    status,
    challenge_id,
  }]);

  if (submissionError) {
    return { error: "Failed to save submission", details: submissionError };
  }

  return { message: "Submission saved", status };
};

// Check winner in 1v1 match
const check1v1Winner = async (matchId) => {
  const { data: match } = await supabase
    .from("1v1_matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (!match) return;

  const { challenger_id, opponent_id, problem_id } = match;

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*")
    .eq("problem_id", problem_id)
    .in("user_id", [challenger_id, opponent_id])
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  if (!submissions || submissions.length < 2) return;

  const [sub1, sub2] = submissions;
  let winnerId = null;

  const isAccepted = (sub) => sub.status === 'accepted';

  if (isAccepted(sub1) && !isAccepted(sub2)) {
    winnerId = sub1.user_id;
  } else if (!isAccepted(sub1) && isAccepted(sub2)) {
    winnerId = sub2.user_id;
  } else if (isAccepted(sub1) && isAccepted(sub2)) {
    winnerId = sub1.time < sub2.time ? sub1.user_id : sub2.user_id;
  }

  if (winnerId) {
    await supabase
      .from("1v1_matches")
      .update({ winner_id: winnerId })
      .eq("id", matchId);
  }
};

module.exports = {
  submitSolution,
  getSubmissionsByUser,
  getSubmissionById,
  getUserSubmissionsForContest,
  handle1v1Submission,
  check1v1Winner,
};
