const quizForm = document.querySelector("#quizForm");
const setupPanel = document.querySelector("#setupPanel");
const quizPanel = document.querySelector("#quizPanel");
const resultPanel = document.querySelector("#resultPanel");
const questionArea = document.querySelector("#questionArea");
const nextBtn = document.querySelector("#nextBtn");
const backBtn = document.querySelector("#backBtn");
const retryBtn = document.querySelector("#retryBtn");

let currentQuiz = null;
let currentIndex = 0;
let answers = [];
quizForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const setupMessage = document.querySelector("#setupMessage");
  const loadingIndicator = document.querySelector("#loadingIndicator");
  const submitButton = quizForm.querySelector('button[type="submit"]');

  setupMessage.textContent = "";
  loadingIndicator.classList.remove("hidden");
  submitButton.disabled = true;
  submitButton.textContent = "Generating...";
  const formData = new FormData(quizForm);

  try {
 const response = await fetch("/api/quiz-ai", {

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: formData.get("topic"),
        difficulty: formData.get("difficulty"),
        count: Number(formData.get("count"))
      })
    });
   const responseText = await response.text();

console.log("HTTP Status:", response.status);
console.log("Response:", responseText);

let data;

try {
  data = JSON.parse(responseText);
} catch {
  throw new Error(
    "The server returned HTML instead of JSON. Check server.js and the API route."
  );
}
    if (!response.ok) throw new Error(data.error || "Could not create the quiz.");
    currentQuiz = data;
    currentIndex = 0;
    answers = new Array(data.questions.length).fill(null);
    setupPanel.classList.add("hidden");
    resultPanel.classList.add("hidden");
    quizPanel.classList.remove("hidden");
    document.querySelector("#quizTitle").textContent = `${data.topic} practice`;
    document.querySelector("#quizMeta").textContent = `${data.difficulty.toUpperCase()} LEVEL`;
    renderQuestion();
    quizPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
  setupMessage.textContent = error.message;
} finally {
  loadingIndicator.classList.add("hidden");

  submitButton.disabled = false;
  submitButton.innerHTML =
    'Generate my quiz <span aria-hidden="true">→</span>';
}
});

function renderQuestion() {
  const question = currentQuiz.questions[currentIndex];
  document.querySelector("#progressText").textContent =
    `Question ${currentIndex + 1} of ${currentQuiz.questions.length}`;
  document.querySelector("#progressBar").style.width =
    `${((currentIndex + 1) / currentQuiz.questions.length) * 100}%`;

  questionArea.innerHTML = "";
  const number = document.createElement("p");
  number.className = "question-number";
  number.textContent = `QUESTION ${String(currentIndex + 1).padStart(2, "0")}`;
  const title = document.createElement("h3");
  title.className = "question-text";
  title.textContent = question.question;
  const options = document.createElement("div");
  options.className = "options";

  question.options.forEach((option, optionIndex) => {
    const label = document.createElement("label");
    label.className = `option${answers[currentIndex] === option ? " selected" : ""}`;
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "answer";
    radio.value = option;
    radio.checked = answers[currentIndex] === option;
    radio.addEventListener("change", () => {
      answers[currentIndex] = option;
      options.querySelectorAll(".option").forEach((node) => node.classList.remove("selected"));
      label.classList.add("selected");
      nextBtn.disabled = false;
      document.querySelector("#quizMessage").textContent = "";
    });
    const text = document.createElement("span");
    text.textContent = option;
    label.append(radio, text);
    options.append(label);
  });

  questionArea.append(number, title, options);
  nextBtn.disabled = !answers[currentIndex];
  nextBtn.textContent = currentIndex === currentQuiz.questions.length - 1 ? "See my results ✓" : "Next question →";
  document.querySelector("#quizMessage").textContent = "";
}

nextBtn.addEventListener("click", () => {
  if (!answers[currentIndex]) {
    document.querySelector("#quizMessage").textContent = "Choose an answer to continue.";
    return;
  }
  if (currentIndex < currentQuiz.questions.length - 1) {
    currentIndex += 1;
    renderQuestion();
  } else {
    showResults();
  }
});

function showResults() {
  const ids = currentQuiz.questions.map((q) => q.id);
  fetch("/api/answer-key", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionIds: ids })
  })
    .then((response) => response.json())
    .then((data) => {
      const keyById = new Map(data.answerKey.map((item) => [item.id, item]));
      const review = currentQuiz.questions.map((q, index) => ({
        ...q, ...keyById.get(q.id), chosen: answers[index],
        correct: answers[index] === keyById.get(q.id)?.correctAnswer
      }));
      const correctCount = review.filter((item) => item.correct).length;
      const percentage = Math.round((correctCount / review.length) * 100);
      
      // Save this completed quiz for the dashboard.
const history = getQuizHistory();

history.push({
  topic: currentQuiz.topic,
  difficulty: currentQuiz.difficulty,
  score: percentage,
  correct: correctCount,
  total: review.length,
  date: new Date().toISOString()
});

saveQuizHistory(history);
updateDashboard();
      document.querySelector("#scoreValue").textContent = `${percentage}%`;
      document.querySelector("#scoreLabel").textContent =
        percentage >= 80 ? "Great work — strong understanding!" :
        percentage >= 50 ? "Good start — review a few concepts." :
        "Keep practicing — every attempt helps.";
      document.querySelector("#correctValue").textContent = correctCount;
      document.querySelector("#totalValue").textContent = review.length;
      document.querySelector("#missedValue").textContent = review.length - correctCount;

      const reviewList = document.querySelector("#reviewList");
      reviewList.innerHTML = "";
      review.forEach((item) => {
        const card = document.createElement("div");
        card.className = "review-item";
        const title = document.createElement("strong");
        title.textContent = item.question;
        const status = document.createElement("div");
        status.className = item.correct ? "right" : "wrong";
        status.textContent = item.correct ? "✓ Correct" : `✕ Your answer: ${item.chosen}`;
        const answer = document.createElement("div");
        answer.textContent = `Correct answer: ${item.correctAnswer}`;
        const explanation = document.createElement("div");
        explanation.textContent = item.explanation;
        card.append(title, status, answer, explanation);
        reviewList.append(card);
      });

      const missedTopics = [...new Set(review.filter((item) => !item.correct).map((item) => item.topic))];
      document.querySelector("#recommendation").textContent = missedTopics.length
        ? `Recommended next step: review ${missedTopics.join(", ")} and try another quiz. This recommendation is based on the questions you missed.`
        : "Recommended next step: try a harder difficulty or explore another topic to keep learning.";
      quizPanel.classList.add("hidden");
      resultPanel.classList.remove("hidden");
      resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    })
    .catch(() => {
      document.querySelector("#quizMessage").textContent = "Could not load the answer key. Please try again.";
    });
}

backBtn.addEventListener("click", () => {
  quizPanel.classList.add("hidden");
  setupPanel.classList.remove("hidden");
  document.querySelector("#setupMessage").textContent = "";
});
retryBtn.addEventListener("click", () => {
  resultPanel.classList.add("hidden");
  setupPanel.classList.remove("hidden");
  setupPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});
// ========================================
// PERFORMANCE DASHBOARD
// ========================================

const HISTORY_KEY = "quizGeniusQuizHistory";
let performanceChart = null;

// Load saved quiz history.
function getQuizHistory() {
  try {
    const history = JSON.parse(
      localStorage.getItem(HISTORY_KEY) || "[]"
    );

    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error("Could not load quiz history:", error);
    return [];
  }
}

// Save quiz history.
function saveQuizHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

// Calculate and display dashboard statistics.
function updateDashboard() {
  const history = getQuizHistory();

  const totalQuizzes = history.length;

  const averageScore = totalQuizzes
    ? Math.round(
        history.reduce((sum, quiz) => sum + quiz.score, 0) /
        totalQuizzes
      )
    : 0;

  const bestScore = totalQuizzes
    ? Math.max(...history.map((quiz) => quiz.score))
    : 0;

  const totalCorrect = history.reduce(
    (sum, quiz) => sum + quiz.correct,
    0
  );

  document.querySelector("#dashTotalQuizzes").textContent =
    totalQuizzes;

  document.querySelector("#dashAverageScore").textContent =
    `${averageScore}%`;

  document.querySelector("#dashBestScore").textContent =
    `${bestScore}%`;

  document.querySelector("#dashCorrectAnswers").textContent =
    totalCorrect;

  renderPerformanceChart(history);
  renderQuizHistory(history);
}

// Draw the performance chart.
function renderPerformanceChart(history) {
  const canvas = document.querySelector("#performanceChart");
  const emptyMessage = document.querySelector("#chartEmptyMessage");

  if (!canvas || !emptyMessage) return;

  if (performanceChart) {
    performanceChart.destroy();
    performanceChart = null;
  }

  if (!history.length) {
    emptyMessage.style.display = "block";
    canvas.style.display = "none";
    return;
  }

  emptyMessage.style.display = "none";
  canvas.style.display = "block";

  if (typeof Chart === "undefined") {
    emptyMessage.textContent =
      "Chart library unavailable. Check your internet connection.";
    emptyMessage.style.display = "block";
    return;
  }

  const recentHistory = history.slice(-10);

  performanceChart = new Chart(canvas, {
    type: "line",

    data: {
      labels: recentHistory.map((quiz, index) =>
        `Quiz ${index + 1}`
      ),

      datasets: [{
        label: "Score (%)",
        data: recentHistory.map((quiz) => quiz.score),
        borderWidth: 3,
        tension: 0.3,
        fill: false
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value) => `${value}%`
          }
        }
      },

      plugins: {
        legend: {
          display: true
        }
      }
    }
  });
}

// Display recent quiz attempts.
function renderQuizHistory(history) {
  const historyContainer = document.querySelector("#quizHistory");

  if (!historyContainer) return;

  historyContainer.innerHTML = "";

  if (!history.length) {
    const message = document.createElement("p");
    message.className = "dashboard-empty";
    message.textContent =
      "No quizzes completed yet. Your results will appear here.";

    historyContainer.appendChild(message);
    return;
  }

  history
    .slice()
    .reverse()
    .slice(0, 10)
    .forEach((quiz) => {
      const card = document.createElement("article");
      card.className = "history-item";

      const details = document.createElement("div");

      const title = document.createElement("h4");
      title.textContent = quiz.topic;

      const subtitle = document.createElement("p");
      subtitle.textContent =
        `${quiz.difficulty} · ${quiz.correct}/${quiz.total} correct`;

      const date = document.createElement("small");
      date.textContent = new Date(quiz.date).toLocaleString();

      details.append(title, subtitle, date);

      const score = document.createElement("strong");
      score.className = "history-score";
      score.textContent = `${quiz.score}%`;

      card.append(details, score);
      historyContainer.appendChild(card);
    });
}

// Clear all saved quiz history.
const clearHistoryBtn = document.querySelector("#clearHistoryBtn");

if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener("click", () => {
    const history = getQuizHistory();

    if (!history.length) {
      updateDashboard();
      return;
    }

    const confirmed = confirm(
      "Are you sure you want to clear all quiz history?"
    );

    if (!confirmed) return;

    localStorage.removeItem(HISTORY_KEY);
    updateDashboard();
  });
}

// Initialize the dashboard when the page loads.
updateDashboard();