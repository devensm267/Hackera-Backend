// controllers/languageController.js

const languageTemplates = [
    {
      id: 54,
      name: "C++",
      template: "#include <iostream>\nusing namespace std;\nint main() {\n  // your code\n  return 0;\n}",
    },
    {
      id: 62,
      name: "Java",
      template: "public class Main {\n  public static void main(String[] args) {\n    // your code\n  }\n}",
    },
    {
      id: 63,
      name: "JavaScript",
      template: "console.log('Hello World');",
    },
    {
      id: 71,
      name: "Python",
      template: "print('Hello World')",
    },
  ];
  
  const getLanguages = (req, res) => {
    res.json(languageTemplates);
  };
  
  module.exports = { getLanguages };
  