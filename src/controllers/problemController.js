// src/controllers/problemController.js
const {supabase} = require("../config/supabaseClient");

// Create a new problem
exports.createProblem = async (req, res) => {
  const {
    title,
    description,
    input_format,
    output_format,
    examples,
    difficulty,
    test_cases,
    tags,
    contest_id
  } = req.body;

  const { data, error } = await supabase
    .from("problems")
    .insert([
      {
        title,
        description,
        input_format,
        output_format,
        examples,
        difficulty,
        test_cases,
        tags,
        contest_id: contest_id || null,
      }
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: "Failed to create problem", details: error });
  }

  res.status(201).json({ message: "Problem created", problem: data });
};

// Get all problems
exports.getProblems = async (req, res) => {
  const { data, error } = await supabase
    .from("problems")
    .select("id, title, difficulty, tags");

  if (error) {
    return res.status(500).json({ error: "Failed to fetch problems", details: error });
  }

  res.json(data);
};

// Get a problem by ID
exports.getProblemById = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return res.status(404).json({ error: "Problem not found" });

  res.json(data);
};

// Update a problem
exports.updateProblem = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    difficulty,
    test_cases,
    input_format,
    output_format,
    examples,
    tags
  } = req.body;

  const { data, error } = await supabase
    .from("problems")
    .update({
      title,
      description,
      difficulty,
      test_cases,
      input_format,
      output_format,
      examples,
      tags
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Problem updated", problem: data });
};

// Delete a problem
exports.deleteProblem = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("problems").delete().eq("id", id);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Problem deleted" });
};

// Optional: Get user profile (should probably be in profileController)
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
