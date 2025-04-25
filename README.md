# Hack Era - Backend

This is the backend for **Hack Era**, a competitive programming platform built with Node.js, Express, and Supabase. It supports features like problem solving, contest participation, 1v1 challenges, leaderboard tracking, and user profiles.

---

## 🚀 Features

- 🔐 User Authentication (Supabase)
- 🧑‍💻 Code Submission & Judge0 Execution Integration
- ✅ Test Case Validation
- 🏆 Leaderboards (Overall and Contest-based)
- 🏁 Contest Management (Create, Join, View Problems, Leaderboard)
- ⚔️ 1v1 Challenge System
- 📄 User Profiles with stats (solved, submissions, accuracy)

---

## ⚙️ Technologies Used

- **Node.js & Express** – Server and API handling
- **Supabase** – Authentication & Database (PostgreSQL)
- **Judge0** – Code execution engine
- **Axios** – API communication
- **Dotenv** – Environment variable handling

---

## 📁 Project Structure

\`\`\`
HackEra-Backend/
│
├── src/
│   ├── controllers/          # Route controllers (auth, submissions, contests, etc.)
│   ├── routes/               # Express routers
│   ├── config/               # Supabase client setup
│   └── utils/                # Utility functions (e.g. test validation, winner logic)
│
├── .env                      # Supabase keys and server port
├── package.json
└── server.js                 # Entry point
\`\`\`

---

## 🛠️ Setup Instructions

### 1. Clone the repo

\`\`\`bash
git clone https://github.com/yourusername/HackEra-Backend.git
cd HackEra-Backend
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set up environment variables

Create a \`.env\` file in the root:

\`\`\`env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your-judge0-api-key
PORT=5000
\`\`\`

> 🔐 **Keep your keys secret and use \`.env\` for development.**

---

## ▶️ Running the Server

\`\`\`bash
npm start
\`\`\`

Server will run on: [http://localhost:5000](http://localhost:5000)

---

## 🔌 API Endpoints Overview

### 🔐 Auth
- \`POST /api/auth/register\`
- \`POST /api/auth/login\`

### 📤 Submissions
- \`POST /api/submissions/submit\`
- \`GET /api/submissions/:userId\`
- \`GET /api/submissions/:id\`

### 🧩 Problems
- \`GET /api/problems/\`
- \`GET /api/problems/:id\`

### 🏆 Leaderboard
- \`GET /api/leaderboard\` – Overall leaderboard
- \`GET /api/contests/:contestId/leaderboard\` – Contest leaderboard

### 🏁 Contests
- \`POST /api/contests/create\`
- \`GET /api/contests/\` – List contests
- \`GET /api/contests/:id/problems\` – Problems in a contest

### ⚔️ 1v1 Challenges
- \`POST /api/1v1/challenge\`
- \`POST /api/1v1/submit\`
- \`GET /api/1v1/:id\` – Challenge view

---

## 📌 Notes

- Ensure your Supabase database has the necessary tables (\`profiles\`, \`submissions\`, \`contests\`, etc.).
- Enable RLS or use service role keys with appropriate permissions.
- Judge0 free plan has execution limits — use caching or queuing if needed for production.

---

## 🧑‍💻 OWNER

Made with 💻 by [ DEVEN MAHAJAN ]
With team meMbers Ojha Vinayak,Shree Kumbhar,Gaurav More


---

## 📜 License
