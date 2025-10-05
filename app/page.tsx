"use client";

import { useState, useEffect } from "react";

interface MathProblem {
  problem_text: string;
  final_answer: number;
  difficulty?: string;
  problem_type?: string;
  hint?: string;
  solution_steps?: string;
}

interface HistoryItem {
  id: string;
  created_at: string;
  problem_text: string;
  correct_answer: number;
  math_problem_submissions: Array<{
    user_answer: number;
    is_correct: boolean;
    feedback_text: string;
    created_at: string;
  }>;
}

export default function Home() {
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // features
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [problemType, setProblemType] = useState<
    "addition" | "subtraction" | "multiplication" | "division" | "mixed"
  >("addition");
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchHistory();
    loadScore();
  }, []);

  const loadScore = () => {
    const savedScore = localStorage.getItem("totalScore");
    if (savedScore) setTotalScore(parseInt(savedScore));
  };

  const updateScore = (
    correct: boolean,
    level: string,
    hintWasUsed: boolean
  ) => {
    let points = 0;
    if (correct) {
      if (level === "easy") points = 1;
      else if (level === "medium") points = 2;
      else if (level === "hard") points = 3;
      if (hintWasUsed) points -= 1;
    } else {
      if (hintWasUsed) points = -1;
    }
    const newScore = totalScore + points;
    setTotalScore(newScore);
    localStorage.setItem("totalScore", newScore.toString());
  };

  const resetScore = () => {
    setTotalScore(0);
    localStorage.setItem("totalScore", "0");
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/history?limit=10");
      const data = await response.json();
      if (data.success) setHistory(data.history);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const generateProblem = async () => {

    // TODO: Implement problem generation logic
    // This should call your API route to generate a new problem
    // and save it to the database

    setIsLoading(true);
    setFeedback("");
    setUserAnswer("");
    setIsCorrect(null);
    setShowHint(false);
    setShowSolution(false);
    setHintUsed(false);

    try {
      const response = await fetch("/api/math-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty, problem_type: problemType }),
      });
      const data = await response.json();
      if (data.success) {
        setProblem(data.problem);
        setSessionId(data.session_id);
      } else {
        setFeedback("Failed to generate problem. Please try again.");
      }
    } catch (error) {
      console.error("Error generating problem:", error);
      setFeedback("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async (e: React.FormEvent) => {
    // TODO: Implement answer submission logic
    // This should call your API route to check the answer,
    // save the submission, and generate feedback
    e.preventDefault();
    if (!sessionId || !userAnswer) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/math-problem/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          user_answer: userAnswer,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setIsCorrect(data.is_correct);
        setFeedback(data.feedback);
        updateScore(data.is_correct, problem?.difficulty || "medium", hintUsed);
        fetchHistory();
        if (data.is_correct) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2600);
        }
      } else {
        setFeedback("Failed to submit answer. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      setFeedback("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const difficultyBadge = (d: string) => {
    const map: Record<string, string> = {
      easy: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
      hard: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
          map[d] || ""
        }`}
      >
        {d.toUpperCase()}
      </span>
    );
  };

  const topicBadge = (t: string) => (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-sky-50 text-sky-700 ring-1 ring-sky-200">
      {t}
    </span>
  );

  const chip = (label: string, active: boolean) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition 
     ${
       active
         ? "bg-blue-600 text-white shadow-sm"
         : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
     }`;

  // an arbitrary "target" for progress bar; you can customize
  const scoreTarget = 20;
  const percent = Math.max(
    0,
    Math.min(100, Math.round((totalScore / scoreTarget) * 100))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(70)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-12px",
                backgroundColor: [
                  "#0ea5e9",
                  "#22c55e",
                  "#f97316",
                  "#e11d48",
                  "#8b5cf6",
                  "#06b6d4",
                  "#84cc16",
                ][Math.floor(Math.random() * 7)],
                width: `${Math.random() * 8 + 6}px`,
                height: `${Math.random() * 8 + 6}px`,
                borderRadius: "2px",
                animationDelay: `${Math.random() * 0.8}s`,
                animationDuration: `${Math.random() * 1.8 + 1.6}s`,
              }}
            />
          ))}
        </div>
      )}

      <header className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10 blur-2xl" />
        <div className="container mx-auto max-w-5xl px-4 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                Math Problem Generator
              </h1>
              <p className="mt-2 text-gray-600">
                AI-powered math practice for Primary 5
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              {difficultyBadge(difficulty)}
              {topicBadge(problemType)}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 pb-16">
        {/* Score + Reset */}
        <section className="mb-8">
          <div className="rounded-2xl bg-white/70 backdrop-blur border border-gray-200 shadow-sm p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="w-full md:w-2/3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Total Score
                  </span>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {totalScore}
                  </span>
                </div>
                <div className="mt-2 h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-[width] duration-500"
                    style={{ width: `${percent}%` }}
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Goal: {scoreTarget} pts
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={resetScore}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {/* reset icon */}
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 12a9 9 0 1 0 9-9M3 3v6h6"
                    />
                  </svg>
                  Reset
                </button>
                <div className="hidden sm:flex items-center gap-2">
                  {difficultyBadge(difficulty)}
                  {topicBadge(problemType)}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Scoring tips */}
        <section className="mb-8">
          <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-white border border-sky-100 p-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <svg
                  className="h-5 w-5 text-sky-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M11 17h2v2h-2v-2Zm1-14C6.48 3 2 7.48 2 13c0 4.63 3.51 8.44 8 8.94V23h4v-1.06c4.49-.5 8-4.31 8-8.94 0-5.52-4.48-10-10-10Zm1 14h-2v-6h2v6Zm0-8h-2V7h2v2Z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Using a hint costs{" "}
                  <span className="text-red-600">-1 point</span>.
                </p>
                <p className="mt-1 text-gray-700 text-sm">
                  Easy 1pt · Medium 2pts · Hard 3pts · Wrong 0pt（hint used:
                  -1）
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="mb-8">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["easy", "medium", "hard"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={chip(d, difficulty === d)}
                      type="button"
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      "addition",
                      "subtraction",
                      "multiplication",
                      "division",
                      "mixed",
                    ] as const
                  ).map((t) => (
                    <button
                      key={t}
                      onClick={() => setProblemType(t)}
                      className={chip(t, problemType === t)}
                      type="button"
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={generateProblem}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold shadow-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="white"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="white"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6l4 2"
                      />
                      <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
                    </svg>
                    Generate New Problem
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* History toggle */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
          >
            <span>View problem history</span>
            <svg
              className={`h-4 w-4 transition ${showHistory ? "rotate-90" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 18l6-6-6-6"
              />
            </svg>
          </button>
        </div>

        {/* Problem card */}
        {problem && (
          <section className="mb-8">
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Problem</h2>
                  <p className="mt-3 text-lg text-gray-800 leading-relaxed">
                    {problem.problem_text}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    {difficultyBadge(problem.difficulty || difficulty)}
                    {topicBadge(problem.problem_type || problemType)}
                  </div>
                </div>
              </div>

              {/* Hint */}
              {problem.hint && !showSolution && (
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setShowHint(!showHint);
                      if (!showHint && !hintUsed) setHintUsed(true);
                    }}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium focus:outline-none"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2a7 7 0 00-7 7c0 2.76 1.67 5.14 4.06 6.24L9 18h6l-.06-2.76A7.003 7.003 0 0019 9a7 7 0 00-7-7Zm-1 19h2v1h-2v-1Z" />
                    </svg>
                    {showHint ? "Hide Hint" : "Show Hint (-1 point)"}
                  </button>
                  {showHint && (
                    <div className="mt-3 rounded-xl border-l-4 border-amber-400 bg-amber-50 px-4 py-3">
                      <p className="text-gray-800">{problem.hint}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Answer form */}
              <form onSubmit={submitAnswer} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="answer"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Answer
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="answer"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 px-4 py-2.5 disabled:bg-gray-100"
                    placeholder="Enter your answer"
                    required
                    disabled={isCorrect !== null}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!userAnswer || isLoading || isCorrect !== null}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-white font-semibold shadow-sm hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="white"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="white"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      Checking...
                    </>
                  ) : isCorrect !== null ? (
                    <>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20 6L9 17l-5-5"
                        />
                      </svg>
                      Submitted
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 12h14M12 5v14"
                        />
                      </svg>
                      Submit Answer
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* Feedback */}
        {feedback && (
          <section className="mb-8" aria-live="polite">
            <div
              className={`rounded-2xl border-2 p-6 ${
                isCorrect
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-rose-200 bg-rose-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {isCorrect ? (
                    <svg
                      className="h-6 w-6 text-emerald-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20 6L9 17l-5-5"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-6 w-6 text-rose-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${
                      isCorrect ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </h3>
                  <p className="mt-1 text-gray-800">{feedback}</p>

                  {/* Solution */}
                  {problem?.solution_steps && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowSolution(!showSolution)}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 20l9-5-9-5-9 5 9 5Zm0-10l9-5-9-5-9 5 9 5Z"
                          />
                        </svg>
                        {showSolution
                          ? "Hide Solution"
                          : "Show Step-by-Step Solution"}
                      </button>
                      {showSolution && (
                        <div className="mt-3 rounded-xl border-l-4 border-blue-400 bg-blue-50 px-4 py-3">
                          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                            {problem.solution_steps}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* History */}
        {showHistory && (
          <section>
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Problem History
              </h2>
              {history.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-8 text-center">
                  <p className="text-gray-600">No problems attempted yet.</p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.problem_text}
                          </p>
                          <div className="mt-2 text-sm text-gray-600">
                            Correct Answer:{" "}
                            <span className="font-semibold text-gray-900">
                              {item.correct_answer}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {item.math_problem_submissions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {item.math_problem_submissions.map((sub, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-sm"
                            >
                              <span
                                className={`${
                                  sub.is_correct
                                    ? "text-emerald-600"
                                    : "text-rose-600"
                                }`}
                              >
                                {sub.is_correct ? "✓" : "✗"}
                              </span>
                              <span className="text-gray-700">
                                Your answer:{" "}
                                <span className="font-medium">
                                  {sub.user_answer}
                                </span>
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-500">
                                {new Date(sub.created_at).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <style jsx>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0.9;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0.8;
          }
        }
        .animate-confetti {
          animation-name: confettiFall;
          animation-timing-function: ease-in;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
