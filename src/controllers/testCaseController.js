const {supabase} = require("../config/supabaseClient");

// Create a new test case
exports.createTestCase = async (req, res) => {
  const { problem_id, input, expected_output } = req.body;

  const { data, error } = await supabase
    .from("test_cases")
    .insert([{ problem_id, input, expected_output }]);

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ message: "Test case created", data });
};

// Get all test cases for a specific problem
exports.getTestCasesByProblem = async (req, res) => {
  const { problemId } = req.params;

  const { data, error } = await supabase
    .from("test_cases")
    .select("*")
    .eq("problem_id", problemId);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json(data);
};

// Update a test case by ID
exports.updateTestCase = async (req, res) => {
  const { testCaseId } = req.params;
  const { input, expected_output } = req.body;

  const { data, error } = await supabase
    .from("test_cases")
    .update({ input, expected_output })
    .eq("id", testCaseId);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ message: "Test case updated", data });
};

// Delete a test case by ID
exports.deleteTestCase = async (req, res) => {
  const { testCaseId } = req.params;

  const { error } = await supabase
    .from("test_cases")
    .delete()
    .eq("id", testCaseId);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ message: "Test case deleted" });
};
