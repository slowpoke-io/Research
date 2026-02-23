import React, { useState } from "react";
import FullscreenLoading from "./FullscreenLoading";
// ============================================================
// CONFIGURATION
// ============================================================
const CONFIG = {
  scale: {
    min: 1,
    max: 7,
    labels: {
      1: "Strongly Disagree",
      2: "Disagree",
      3: "Somewhat Disagree",
      4: "Neutral",
      5: "Somewhat Agree",
      6: "Agree",
      7: "Strongly Agree",
    },
  },
  display: {
    showProgressBar: true,
    itemsPerPage: 5, // 每頁顯示幾題
    enableSmoothScroll: true,
  },
};

// ============================================================
// QUESTION DATA
// ============================================================
const questionData = {
  independent: [
    {
      id: "SCS_IND_1",
      text: "I enjoy being unique and different from others in many respects.",
    },
    {
      id: "SCS_IND_2",
      text: "I do my own thing, regardless of what others think.",
    },
    {
      id: "SCS_IND_3",
      text: "I feel it is important for me to act as an independent person.",
    },
    {
      id: "SCS_IND_4",
      text: "I am comfortable with being singled out for praise or rewards.",
    },
    {
      id: "SCS_IND_5",
      text: "Speaking up during a class (or a meeting) is not a problem for me.",
    },
    {
      id: "SCS_IND_6",
      text: "I act the same way no matter who I am with.",
    },
    {
      id: "SCS_IND_7",
      text: "I try to do what is best for me, regardless of how that might affect others.",
    },
    {
      id: "SCS_IND_8",
      text: "Being able to take care of myself is a primary concern for me.",
    },
    {
      id: "SCS_IND_9",
      text: "My personal identity, independent of others, is very important to me.",
    },
  ],
  interdependent: [
    {
      id: "SCS_INTER_1",
      text: "Even when I strongly disagree with group members, I avoid an argument.",
    },
    {
      id: "SCS_INTER_2",
      text: "I have respect for the authority figures with whom I interact.",
    },
    {
      id: "SCS_INTER_3",
      text: "I respect people who are modest about themselves.",
    },
    {
      id: "SCS_INTER_4",
      text: "I will sacrifice my self interest for the benefit of the group I am in.",
    },
    {
      id: "SCS_INTER_5",
      text: "I should take into consideration my parents' advice when making education/career plans.",
    },
    {
      id: "SCS_INTER_6",
      text: "I feel my fate is intertwined with the fate of those around me.",
    },
    {
      id: "SCS_INTER_7",
      text: "I feel good when I cooperate with others.",
    },
    {
      id: "SCS_INTER_8",
      text: "I often have the feeling that my relationships with others are more important than my own accomplishments.",
    },
    {
      id: "SCS_INTER_9",
      text: "My happiness depends on the happiness of those around me.",
    },
    {
      id: "SCS_INTER_10",
      text: "I will stay in a group if they need me, even when I am not happy with the group.",
    },
    {
      id: "SCS_INTER_11",
      text: "It is important to me to respect decisions made by the group.",
    },
    {
      id: "SCS_INTER_12",
      text: "It is important for me to maintain harmony within my group.",
    },
    {
      id: "SCS_INTER_13",
      text: "I usually go along with what others want to do, even when I would rather do something different.",
    },
  ],
};

// ============================================================
// LIKERT SCALE ITEM COMPONENT
// ============================================================
const LikertItem = ({ question, value, onChange, questionNumber }) => {
  const scaleValues = Array.from(
    { length: CONFIG.scale.max - CONFIG.scale.min + 1 },
    (_, i) => i + CONFIG.scale.min,
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
      {/* Question */}
      <div className="flex items-center gap-3 mb-5">
        <span className="flex-shrink-0 mt-0.5 w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-semibold text-slate-700 text-sm">
          {questionNumber}
        </span>

        <p className="flex-1 text-slate-900 font-medium text-[15px] leading-5.5 md:text-[16px] md:leading-7 tracking-[0.01em]">
          {question.text}
        </p>
      </div>

      {/* Desktop: clean 1–7 row */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Strongly Disagree</span>
          <span>Strongly Agree</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {scaleValues.map((val) => {
            const selected = value === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => onChange(question.id, val)}
                className={[
                  "rounded-lg border px-2 py-3 transition-all",
                  "hover:bg-slate-50",
                  selected
                    ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200"
                    : "border-slate-200 bg-white",
                ].join(" ")}
                aria-pressed={selected}
              >
                <div className="flex flex-col items-center gap-2">
                  {/* radio dot */}
                  <span
                    className={[
                      "w-4 h-4 rounded-full border flex items-center justify-center",
                      selected ? "border-indigo-600" : "border-slate-300",
                    ].join(" ")}
                  >
                    {selected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    )}
                  </span>

                  {/* small number */}
                  <span
                    className={[
                      "text-sm font-semibold",
                      selected ? "text-indigo-700" : "text-slate-700",
                    ].join(" ")}
                  >
                    {val}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile: minimal vertical list */}
      <div className="md:hidden">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="w-[10ch]">Strongly Disagree</span>
          <span className="w-[10ch] text-right">Strongly Agree</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {scaleValues.map((val) => {
            const selected = value === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => onChange(question.id, val)}
                className={[
                  "rounded-lg border px-2 py-3 transition-all",
                  selected
                    ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200"
                    : "border-slate-200 bg-white",
                ].join(" ")}
                aria-pressed={selected}
              >
                <div className="flex flex-col items-center gap-2">
                  <span
                    className={[
                      "w-4 h-4 rounded-full border flex items-center justify-center",
                      selected ? "border-indigo-600" : "border-slate-300",
                    ].join(" ")}
                  >
                    {selected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    )}
                  </span>
                  <span
                    className={[
                      "text-sm font-semibold",
                      selected ? "text-indigo-700" : "text-slate-700",
                    ].join(" ")}
                  >
                    {val}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function SCSScale({ order = "ind_first", onSubmit, onError }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ind = questionData.independent;
  const inter = questionData.interdependent;

  const questions =
    order === "ind_first" ? [...ind, ...inter] : [...inter, ...ind];
  const totalPages = Math.ceil(questions.length / CONFIG.display.itemsPerPage);
  const startIndex = currentPage * CONFIG.display.itemsPerPage;
  const endIndex = Math.min(
    startIndex + CONFIG.display.itemsPerPage,
    questions.length,
  );
  const currentQuestions = questions.slice(startIndex, endIndex);

  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const areCurrentPageAnswersFilled = () => {
    return currentQuestions.every((q) => responses[q.id] !== undefined);
  };

  const handleNext = async () => {
    if (!areCurrentPageAnswersFilled()) return;

    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
      if (CONFIG.display.enableSmoothScroll) {
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
      }
    } else {
      // Submit to backend
      setIsSubmitting(true);
      try {
        const likertAnswers = questions.map((q) => ({
          id: q.id,
          response: responses[q.id],
        }));

        await onSubmit({ likertAnswers });
      } catch (error) {
        onError?.(error);
        setIsSubmitting(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
      if (CONFIG.display.enableSmoothScroll) {
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
      }
    }
  };

  const answeredCount = Object.keys(responses).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-purple-600">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            Part 1: Questionnaire
          </h1>
          <div className="text-slate-700 space-y-2 leading-relaxed">
            <p>
              Please indicate the extent to which you{" "}
              <strong>agree or disagree</strong> with each of the following
              statements using the scale below:
            </p>
            <div className="bg-slate-50 rounded-lg p-4 mt-3">
              {/* 手機：可橫向滑動，保留完整 1–7 + 全部 label */}
              <div className="sm:hidden overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {Array.from({ length: 7 }, (_, i) => i + 1).map((n) => (
                      <div
                        key={n}
                        className="bg-white/70 rounded-md border border-slate-200 p-2"
                      >
                        <div className="font-bold text-slate-700 text-sm">
                          {n}
                        </div>
                        <div className="text-[11px] leading-tight text-slate-600 mt-1">
                          {CONFIG.scale.labels[n]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 平板/桌機：固定 7 欄 */}
              <div className="hidden sm:grid grid-cols-7 gap-2 text-center text-sm">
                {Array.from({ length: 7 }, (_, i) => i + 1).map((n) => (
                  <div key={n}>
                    <div className="font-bold text-slate-700">{n}</div>
                    <div className="text-xs text-slate-600">
                      {CONFIG.scale.labels[n]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {CONFIG.display.showProgressBar && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">
                Page {currentPage + 1} of {totalPages}
              </span>
              <span className="text-sm text-slate-600">
                {answeredCount} / {questions.length} answered
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-6 mb-8">
          {currentQuestions.map((question, index) => (
            <LikertItem
              key={question.id}
              question={question}
              value={responses[question.id]}
              onChange={handleResponseChange}
              questionNumber={startIndex + index + 1}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all ${
                currentPage === 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-slate-600 text-white hover:bg-slate-700 shadow-md hover:shadow-lg"
              }`}
            >
              ← Previous
            </button>

            <div className="text-center sm:flex-1 sm:px-4">
              <p className="text-sm text-slate-600">
                {areCurrentPageAnswersFilled() ? (
                  <span className="text-emerald-600 font-semibold">
                    ✓ All questions answered
                  </span>
                ) : (
                  <span>Please answer all questions on this page</span>
                )}
              </p>
            </div>

            <button
              onClick={handleNext}
              disabled={!areCurrentPageAnswersFilled() || isSubmitting}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all ${
                !areCurrentPageAnswersFilled() || isSubmitting
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : currentPage === totalPages - 1
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg"
                    : "bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg"
              }`}
            >
              {isSubmitting
                ? "Submitting..."
                : currentPage === totalPages - 1
                  ? "Submit →"
                  : "Next →"}
            </button>
          </div>
        </div>
      </div>

      <FullscreenLoading open={isSubmitting} />
    </div>
  );
}
