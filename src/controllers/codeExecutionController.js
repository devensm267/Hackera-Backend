const axios = require("axios");
const {supabase} = require("../config/supabaseClient");
require("dotenv").config();

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com/submissions";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// 🧠 Helper to convert language to Judge0 language ID
function getLanguageId(language) {
  const languageMap = {
    "cpp": 54,
    "python": 71,
    "java": 62,
    "c": 50,
    "javascript": 63,
    // Add more if needed
  };
  return languageMap[language.toLowerCase()] || 71; // Default to Python
}

// 🧪 Helper to run code with given input using Judge0 API
async function runCodeWithInput(language, sourceCode, input) {
  try {
    const response = await axios.post(
      JUDGE0_URL + "?base64_encoded=false&wait=true",
      {
        language_id: getLanguageId(language),
        source_code: sourceCode,
        stdin: input,
      },
      {
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Code execution error:", error.message);
    return null;
  }
}

// ✅ Validate and run user submission
exports.validateSubmission = async (req, res) => {
  const { problem_id, user_id, language, code } = req.body;

  if (!problem_id || !user_id || !language || !code) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { data: testCases, error: tcError } = await supabase
    .from("test_cases")
    .select("*")
    .eq("problem_id", problem_id);

  if (tcError) {
    return res.status(500).json({ error: "Failed to fetch test cases", details: tcError });
  }

  let allPassed = true;
  let lastOutput = null;
  let executionTime = null;
  let memoryUsed = null;
  let errorOutput = null;

  for (let test of testCases) {
    const input = test.input;
    const result = await runCodeWithInput(language, code, input);

    if (!result || result.status.id !== 3) {
      allPassed = false;
      errorOutput = result?.stderr || "Code execution failed";
      break;
    }

    const cleanedOutput = result.stdout?.trim();
    const expectedOutput = test.expected_output?.trim();

    if (cleanedOutput !== expectedOutput) {
      allPassed = false;
      errorOutput = `Expected: ${expectedOutput}, Got: ${cleanedOutput}`;
      break;
    }

    lastOutput = cleanedOutput;
    executionTime = result.time;
    memoryUsed = result.memory;
  }

  const status = allPassed ? "accepted" : "rejected";

  const { error: insertError } = await supabase.from("submissions").insert([
    {
      user_id,
      problem_id,
      language,
      code,
      output: lastOutput,
      error: errorOutput,
      time: executionTime,
      memory: memoryUsed,
      status,
    }
  ]);

  if (insertError) {
    return res.status(500).json({ error: "Failed to save submission", details: insertError });
  }

  res.json({ message: "Submission evaluated", status });
};


// 📦 Optional: Fetch single problem by ID
exports.getProblemById = async (req, res) => {
  const { problem_id } = req.params;

  const { data: problem, error } = await supabase
    .from("problems")
    .select("id, title, description")
    .eq("id", problem_id)
    .single();

  if (error || !problem) {
    return res.status(404).json({ error: "Problem not found" });
  }

  res.json(problem);
};

