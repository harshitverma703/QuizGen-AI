require("dotenv").config();
const express = require("express");
const path = require("path");
const questions = require("./data/questions");

const app = express();
const PORT = process.env.PORT || 3000;
const generatedQuestions = new Map();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "QuizGenius AI server is running" });
});

app.get("/api/topics", (_req, res) => {
  const topics = [...new Set(questions.map((q) => q.topic))];
  res.json(topics);
});

app.post("/api/quiz", (req, res) => {
  const { topic, difficulty, count } = req.body || {};
  const allowedDifficulties = ["Easy", "Medium", "Hard"];
  const requestedCount = Math.max(1, Math.min(Number(count) || 5, 10));

  if (!topic || !allowedDifficulties.includes(difficulty)) {
    return res.status(400).json({ error: "Choose a topic and a valid difficulty." });
  }

  const pool = questions.filter(
    (q) => q.topic === topic && q.difficulty === difficulty
  );

  if (!pool.length) {
    return res.status(404).json({
      error: "There are no questions for this combination yet. Try another topic or difficulty."
    });
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, requestedCount).map((q) => ({
    id: q.id,
    topic: q.topic,
    difficulty: q.difficulty,
    question: q.question,
    options: q.options
  }));

  res.json({
    topic,
    difficulty,
    questions: selected,
    totalAvailable: pool.length
  });
});
app.post("/api/quiz-ai", async (req, res) => {
  try {
    const { topic, difficulty, count } = req.body || {};

    const questionCount = Math.max(
      1,
      Math.min(Number(count) || 5, 10)
    );

    if (!topic || typeof topic !== "string") {
      return res.status(400).json({
        error: "Please enter a valid topic."
      });
    }

    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
      return res.status(400).json({
        error: "Invalid difficulty level."
      });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({
        error: "API key missing. Check your .env file."
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openrouter/free",
          temperature: 0.9,
          max_tokens: 5000,
          messages: [
            {
              role: "system",
              content: `
You are an expert educational quiz generator.

Return ONLY valid JSON in this exact format:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": "Exact correct option text",
      "explanation": "Short explanation"
    }
  ]
}

STRICT RULES:
- Generate exactly the requested number of questions.
- Every question must be unique.
- Cover different concepts within the topic.
- Generate exactly four distinct options per question.
- The correct answer must exactly match one option.
- Match the requested difficulty.
- Ensure questions are factually accurate.
- Return no markdown or additional text.
`
            },
            {
              role: "user",
              content: `
Generate ${questionCount} unique multiple-choice questions.

Topic: ${topic.trim().slice(0, 120)}
Difficulty: ${difficulty}

Do not repeat questions or concepts.
`
            }
          ]
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("OpenRouter API error:", result);

      return res.status(502).json({
        error:
          result.error?.message ||
          "OpenRouter could not generate the quiz."
      });
    }

    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({
        error: "The AI returned an empty response."
      });
    }

// Safely extract JSON from the AI response.
function extractJSON(text) {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("AI returned an empty response.");
  }

  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // First, try parsing the complete response.
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    // Continue and try extracting the JSON object.
  }

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not contain a JSON object.");
  }

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch (error) {
    throw new Error("AI returned malformed JSON.");
  }
}

const parsed = extractJSON(content);
console.log("AI raw response:", content);
    if (
      !Array.isArray(parsed.questions) ||
      parsed.questions.length !== questionCount
    ) {
      return res.status(502).json({
        error: `The AI did not return exactly ${questionCount} questions. Please try again.`
      });
    }

    const quizId =
      "ai-" + Date.now() + "-" +
      Math.random().toString(36).slice(2, 8);

    const validatedQuestions = parsed.questions.map((q, index) => {
      if (
        typeof q.question !== "string" ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        !q.options.every((option) => typeof option === "string") ||
        new Set(q.options).size !== 4 ||
        typeof q.answer !== "string" ||
        !q.options.includes(q.answer) ||
        typeof q.explanation !== "string"
      ) {
        throw new Error(
          `Invalid question format at question ${index + 1}.`
        );
      }

      return {
        id: `${quizId}-${index + 1}`,
        topic: topic.trim().slice(0, 120),
        difficulty,
        question: q.question,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation
      };
    });

    // Save correct answers on the server.
    validatedQuestions.forEach((q) => {
      generatedQuestions.set(q.id, {
        correctAnswer: q.answer,
        explanation: q.explanation,
        topic: q.topic
      });
    });

    // Never send the answer key before the quiz is completed.
    res.json({
      quizId,
      topic: topic.trim(),
      difficulty,
      questions: validatedQuestions.map(
        ({ answer, explanation, ...question }) => question
      )
    });

  } catch (error) {
    console.error("AI quiz generation error:", error);

    res.status(502).json({
      error: "Quiz generation failed. Check the server terminal."
    });
  }
});
app.post("/api/answer-key", (req, res) => {
  const { questionIds } = req.body || {};

  if (!Array.isArray(questionIds)) {
    return res.status(400).json({
      error: "questionIds must be an array."
    });
  }

  const answerKey = questionIds.map((id) => {
    const generated = generatedQuestions.get(id);

    if (generated) {
      return {
        id,
        correctAnswer: generated.correctAnswer,
        explanation: generated.explanation,
        topic: generated.topic
      };
    }

    const existing = questions.find((q) => q.id === id);

    if (existing) {
      return {
        id: existing.id,
        correctAnswer: existing.answer,
        explanation: existing.explanation,
        topic: existing.topic
      };
    }

    return null;
  }).filter(Boolean);

  res.json({ answerKey });
});

app.listen(PORT, () => {
  console.log(`QuizGenius AI running at http://localhost:${PORT}`);
});
