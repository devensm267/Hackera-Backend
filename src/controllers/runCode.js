const { runCodeWithJudge0 } = require("./codeExecutionController");

const runCode = async (req, res) => {
  const { code, language, test_cases } = req.body;

  try {
    const results = [];
    const { code, language, test_cases } = req.body;
    if (!code || !language || !test_cases) {
      return res.status(400).json({ error: 'Missing input' });
    }

    for (const test of test_cases) {
      const execution = await runCodeWithJudge0({
        source_code: code,
        language,
        stdin: test.input
      });

      results.push({
        input: test.input,
        expected_output: test.expected_output,
        actual_output: execution.stdout?.trim(),
        passed: execution.stdout?.trim() === test.expected_output?.trim(),
        time: execution.time,
        memory: execution.memory
      });
    }

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: "Code execution failed", details: err.message });
  }
};

module.exports = { runCode };
