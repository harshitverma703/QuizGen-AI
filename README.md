# QuizGenius AI — Starter Project

A beginner-friendly prototype for the IBM SkillsBuild project idea: a quiz generator that evaluates student performance and highlights learning gaps.

## Current features
- Choose a topic, difficulty, and question count.
- Generate a quiz from a local sample question bank.
- Answer multiple-choice questions.
- Get an automatic score, correct answers, explanations, and a simple practice recommendation.
- Responsive layout for desktop and mobile.

## Important current limitation
This starter version uses a predefined question bank. It does **not yet generate questions with an AI model**. AI API integration is a next step, and should be described accurately in your submission.

## Requirements
- Node.js installed
- Internet is not required for the app logic; Google Fonts are optional styling.

## Run on Windows
1. Extract the ZIP.
2. Open the `QuizGenius_AI` folder in VS Code.
3. Open the VS Code terminal in that folder.
4. Run:

   ```bash
   npm install
   npm start
   ```

5. Open `http://localhost:3000` in your browser.

For automatic server restart during development, use `npm run dev` if your Node.js version supports `node --watch`.

## Main files
- `server.js` — Express server and API endpoints.
- `data/questions.js` — sample question bank. Add questions here.
- `public/index.html` — page structure.
- `public/styles.css` — styling.
- `public/app.js` — quiz interaction, scoring, and recommendations.

## Next planned modifications
1. Add more questions and topics.
2. Add real AI question generation through a server-side API key stored in `.env`.
3. Improve performance analytics and recommendations.
4. Optionally save quiz history in a database.

## Project integrity
Present this as a prototype. Do not claim AI-generated questions until the AI API integration is implemented and tested.
