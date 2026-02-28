import { useState } from "react";
import FullscreenLoading from "./FullscreenLoading";

// ============================================================
// CONFIGURATION
// ============================================================
const CONFIG = {
  itemsPerPage: 5,
  answerMode: "click", // 'input' | 'click'

  validation: {
    caseInsensitive: true,
    trimWhitespace: true,
  },

  display: {
    showProgressBar: true,
    animateCards: true,
    enableSmoothScroll: true,
  },
};

// ============================================================
// EXAMPLE ITEM (neutral, shown in instructions)
// words: the sky is blue and very cold tall
// valid sentence: "The sky is blue and very cold" → leftover: "tall"
// ============================================================
const EXAMPLE = {
  words: ["the", "is", "blue", "sky", "very", "tall"],
  answer: "tall", // correct leftover word
  sentence: "The sky is very blue.",
};

// ============================================================
// SCRAMBLE DATA
// ============================================================
const scrambleData = {
  independent: [
    {
      id: 1,
      question: ["unlike", "I", "act", "on my own", "others", "dissimilar"],
    },
    { id: 2, question: ["solely", "I", "rely", "on", "different", "myself"] },
    { id: 3, question: ["I", "do not", "others", "care about", "mine"] },
    { id: 4, question: ["unique", "disconnect", "that", "feel", "I", "I am"] },
    { id: 5, question: ["me", "person", "I'm", "competitive", "a", "very"] },
    { id: 6, question: ["different", "books", "reading", "I", "like", "life"] },
    {
      id: 7,
      question: ["individual", "I am", "others", "from", "independent"],
    },
    {
      id: 8,
      question: ["person", "solitary", "assertive", "I am", "a", "very"],
    },
    {
      id: 9,
      question: ["others", "being free", "from", "I", "like", "independence"],
    },
    { id: 10, question: ["opinions", "my", "difference", "unusual", "are"] },
    {
      id: 11,
      question: [
        "unusually",
        "self-sufficiency",
        "individual",
        "is",
        "important",
      ],
    },
    {
      id: 12,
      question: [
        "self-contained",
        "independent",
        "definitely",
        "I am",
        "others",
        "from",
      ],
    },
    {
      id: 13,
      question: ["independently", "working", "mostly", "I", "like", "unique"],
    },
    {
      id: 14,
      question: ["very", "watching", "I", "like", "nature", "beautiful"],
    },
    { id: 15, question: ["boring", "I", "often", "good", "tasks", "avoid"] },
    { id: 16, question: ["my", "distinct", "autonomy", "interests", "are"] },
    {
      id: 17,
      question: [
        "distinguished",
        "being",
        "separate",
        "like",
        "I",
        "or",
        "rewarded",
      ],
    },
    {
      id: 18,
      question: ["my", "in general", "is", "autonomy", "important", "alone"],
    },
    {
      id: 19,
      question: ["autonomous", "be the best", "to", "always", "try", "I"],
    },
    {
      id: 20,
      question: [
        "I",
        "often",
        "people",
        "from",
        "distinct",
        "myself",
        "isolate",
      ],
    },
  ],
  interdependent: [
    {
      id: 1,
      question: ["we", "agree", "always", "with each other", "together"],
    },
    { id: 2, question: ["our", "company", "similar", "views", "are"] },
    {
      id: 3,
      question: ["than", "others", "more", "cooperative", "we are", "group"],
    },
    {
      id: 4,
      question: ["do", "we", "what", "our team", "helps", "partnership"],
    },
    {
      id: 5,
      question: [
        "social",
        "with each other",
        "interests",
        "common",
        "have",
        "we",
      ],
    },
    { id: 6, question: ["similar", "reading", "we", "like", "books", "life"] },
    { id: 7, question: ["much", "connected", "for", "us", "means", "group"] },
    { id: 8, question: ["community", "we", "belong", "membership", "a", "to"] },
    {
      id: 9,
      question: ["for", "can", "we", "harmony", "sacrifice", "group", "the"],
    },
    { id: 10, question: ["our", "group", "matters", "most", "joint"] },
    {
      id: 11,
      question: ["in many matters", "we", "a", "team", "join", "as", "ours"],
    },
    {
      id: 12,
      question: ["us", "in a group", "cooperate", "well", "we", "very"],
    },
    {
      id: 13,
      question: ["our", "community", "mutually", "respect", "we", "opinions"],
    },
    {
      id: 14,
      question: ["very", "watching", "we", "like", "nature", "beautiful"],
    },
    { id: 15, question: ["boring", "often", "good", "tasks", "we", "avoid"] },
    {
      id: 16,
      question: ["we", "willingly", "always", "help", "each other", "our"],
    },
    {
      id: 17,
      question: [
        "for each other",
        "co-responsible",
        "we",
        "feel",
        "harmony",
        "often",
      ],
    },
    {
      id: 18,
      question: [
        "we're",
        "part of",
        "our",
        "team",
        "always",
        "interdependence",
      ],
    },
    {
      id: 19,
      question: ["always", "integrated", "support", "team", "we", "our"],
    },
    { id: 20, question: ["us", "we", "act", "together", "often"] },
  ],
};

// ============================================================
// EXAMPLE DEMO (interactive, inside instructions)
// ============================================================
function ExampleDemo() {
  return (
    <div className="mt-4 bg-slate-50 rounded-xl border border-slate-200 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
        Example
      </p>

      {/* Word chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {EXAMPLE.words.map((word) => (
          <span
            key={word}
            className={`px-4 py-2 rounded-lg font-medium border shadow-sm text-sm ${
              word === EXAMPLE.answer
                ? "bg-indigo-500 text-white border-indigo-600 shadow-md"
                : "bg-white text-slate-800 border-slate-300"
            }`}
          >
            {word}
          </span>
        ))}
      </div>

      {/* Explanation */}
      <div className="flex items-start gap-2 text-sm text-slate-600 bg-white rounded-lg p-3 border border-slate-200">
        <span className="font-bold text-indigo-500 text-base leading-none mt-0.5">
          ✓
        </span>
        <div>
          The correct sentence is:{" "}
          <span className="italic">"{EXAMPLE.sentence}"</span> — the leftover
          word is{" "}
          <span className="font-semibold text-indigo-600">
            "{EXAMPLE.answer}"
          </span>
          .
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENT
// ============================================================
export default function Scramble({ iv1, onSubmit, onError }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const items = scrambleData[iv1] || scrambleData.independent;

  const totalPages = Math.ceil(items.length / CONFIG.itemsPerPage);
  const startIndex = currentPage * CONFIG.itemsPerPage;
  const endIndex = Math.min(startIndex + CONFIG.itemsPerPage, items.length);
  const currentItems = items.slice(startIndex, endIndex);

  const handleAnswerChange = (itemId, value) => {
    setAnswers((prev) => ({ ...prev, [itemId]: value }));
    if (errors[itemId]) setErrors((prev) => ({ ...prev, [itemId]: null }));
  };

  const handleWordClick = (itemId, word) => {
    handleAnswerChange(itemId, answers[itemId] === word ? "" : word);
  };

  const validateAnswer = (itemId, answer) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return true;

    let processed = answer;
    if (CONFIG.validation.trimWhitespace) processed = processed.trim();
    if (CONFIG.validation.caseInsensitive) processed = processed.toLowerCase();
    if (processed === "") return true;

    const isValid = item.question.some((word) => {
      let w = word;
      if (CONFIG.validation.caseInsensitive) w = w.toLowerCase();
      return w === processed;
    });

    if (!isValid)
      setErrors((prev) => ({
        ...prev,
        [itemId]: `"${answer.trim()}" is not in the word list for this item.`,
      }));

    return isValid;
  };

  const handleBlur = (itemId) => {
    const answer = answers[itemId];
    if (answer && answer.trim()) validateAnswer(itemId, answer);
  };

  const areCurrentPageAnswersFilled = () =>
    currentItems.every((item) => answers[item.id]?.trim().length > 0);

  const areCurrentPageAnswersValid = () => {
    if (!areCurrentPageAnswersFilled()) return false;
    return currentItems.every((item) => {
      const trimmed = answers[item.id]?.trim().toLowerCase();
      return item.question.some((w) => w.toLowerCase() === trimmed);
    });
  };

  const handleNext = async () => {
    let hasErrors = false;
    currentItems.forEach((item) => {
      const answer = answers[item.id];
      if (answer && answer.trim()) {
        if (!validateAnswer(item.id, answer)) hasErrors = true;
      }
    });
    if (hasErrors) return;

    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
      if (CONFIG.display.enableSmoothScroll)
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
    } else {
      setIsSubmitting(true);
      try {
        const submissionData = items.map((item) => ({
          id: item.id,
          answer: answers[item.id]?.trim() || "",
        }));
        await onSubmit({ scrambleAnswers: submissionData });
      } catch (error) {
        onError?.(error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
      if (CONFIG.display.enableSmoothScroll)
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-indigo-600">
          <h1 className="text-2xl font-bold text-slate-800">Instruction</h1>
          <p className="my-2 text-slate-600 italic text-base sm:text-lg leading-normal">
            {/* Before the next task, we'll do a brief mental focusing exercise to
            clear your mind. */}
          </p>
          <div className="text-slate-700 space-y-2 leading-relaxed">
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                The task consists of 20 items, each showing a set of words.
              </li>
              <li>
                Use the words to form{" "}
                <strong>one grammatically correct, meaningful sentence</strong>.
              </li>
              <li>
                There will always be <strong>one extra word</strong> that you{" "}
                <strong>do not</strong> use (the <strong>leftover word</strong>
                ).
              </li>
              <li>
                Click on the <strong>leftover word</strong> to indicate your
                answer.
              </li>
              <li>
                Use each word <strong>at most once</strong>. Do{" "}
                <strong>not</strong> add any extra words.
              </li>
            </ul>
          </div>

          {/* Interactive example */}
          <ExampleDemo />
        </div>

        {/* Progress Bar */}
        {CONFIG.display.showProgressBar && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">
                Page {currentPage + 1} of {totalPages}
              </span>
              <span className="text-sm text-slate-600">
                Items {startIndex + 1}–{endIndex} of {items.length}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Question Cards */}
        <div className="space-y-6 mb-8">
          {currentItems.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow"
              style={
                CONFIG.display.animateCards
                  ? {
                      animation: "fadeIn 0.5s ease-out",
                      animationDelay: `${index * 0.1}s`,
                      animationFillMode: "both",
                    }
                  : {}
              }
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                  {startIndex + index + 1}
                </div>
                <div className="flex-1">
                  <div className="mb-4">
                    {CONFIG.answerMode === "click" && (
                      <h3 className="text-sm font-semibold text-slate-600 mb-2 h-10 leading-10">
                        Select the leftover word (not used)
                      </h3>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {item.question.map((word, wordIndex) => {
                        const isSelected =
                          CONFIG.answerMode === "click" &&
                          answers[item.id] === word;
                        return (
                          <span
                            key={wordIndex}
                            onClick={() =>
                              CONFIG.answerMode === "click" &&
                              handleWordClick(item.id, word)
                            }
                            className={`px-4 py-2 rounded-lg font-medium border shadow-sm transition-all select-none ${
                              CONFIG.answerMode === "click"
                                ? "cursor-pointer hover:scale-105"
                                : ""
                            } ${
                              isSelected
                                ? "bg-indigo-500 text-white border-indigo-600 shadow-md"
                                : "bg-slate-100 text-slate-800 border-slate-300"
                            }`}
                          >
                            {word}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {CONFIG.answerMode === "input" ? (
                    <div>
                      <input
                        type="text"
                        value={answers[item.id] || ""}
                        onChange={(e) =>
                          handleAnswerChange(item.id, e.target.value)
                        }
                        onBlur={() => handleBlur(item.id)}
                        placeholder="Enter the unused word"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 outline-none transition-all text-slate-800 placeholder-slate-400 ${
                          errors[item.id]
                            ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                            : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-200"
                        }`}
                      />
                      {errors[item.id] && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors[item.id]}
                        </p>
                      )}
                    </div>
                  ) : (
                    errors[item.id] && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors[item.id]}
                      </p>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 0 || isSubmitting}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all ${
                currentPage === 0 || isSubmitting
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-slate-600 text-white hover:bg-slate-700 shadow-md hover:shadow-lg"
              }`}
            >
              ← Previous
            </button>

            <div className="text-center sm:flex-1 sm:px-4">
              <p className="text-sm text-slate-600">
                {areCurrentPageAnswersValid() ? (
                  <span className="text-emerald-600 font-semibold">
                    ✓ All answers provided
                  </span>
                ) : !areCurrentPageAnswersFilled() ? (
                  <span>Please answer all questions</span>
                ) : (
                  <span className="text-amber-600 font-semibold">
                    Please check your answers
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={handleNext}
              disabled={!areCurrentPageAnswersValid() || isSubmitting}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all ${
                !areCurrentPageAnswersValid() || isSubmitting
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : currentPage === totalPages - 1
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg"
              }`}
            >
              {currentPage === totalPages - 1 ? "Submit →" : "Next →"}
            </button>
          </div>
        </div>
      </div>

      <FullscreenLoading open={isSubmitting} />

      {CONFIG.display.animateCards && (
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      )}
    </div>
  );
}
