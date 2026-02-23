import React, { useRef, useEffect, useState } from "react";
import FullscreenLoading from "./FullscreenLoading";

// ============ 配置區 ============
const CONFIG = {
  question: {
    instructionPoints: [
      { type: "text", text: "Read the paragraph carefully." },
      {
        type: "text",
        text: "Select (circle) every pronoun you find in the paragraph.",
      },
      {
        type: "examples",
        singular: ["I", "me", "my", "mine", "you", "your", "he", "..."],
        plural: ["we", "us", "our", "ours", "they", "their", "..."],
      },
      {
        type: "text",
        text: "Click a word to toggle selection (select / unselect).",
      },
      {
        type: "text",
        text: "Take your time and submit when you are finished.",
      },
    ],
    totalQuestions: 3,
  },
  display: {
    showSelectedWords: false,
  },

  canvas: {
    maxWidth: 1000,
    desktop: { fontSize: 18, lineHeight: 32, padding: 20, height: 620 },
    mobile: { fontSize: 16, lineHeight: 24, padding: 12, height: 520 },
  },

  colors: {
    selectedText: "#3b82f6",
    normalText: "#0f172a",
  },

  materials: {
    independent: [
      {
        id: "material1_independent",
        title: "Exercise I",
        text: "On Friday, my weekend looks free, so I plan a short trip for myself. After I check my budget, I choose my own route and pick a place that feels unique and different to me. To keep my autonomy, I leave my schedule loose and keep my options separate and apart. At the map, I compare routes and choose the route that fits my pace. If a new idea appears, I diverge and adjust quickly. With my bag ready, I head out alone and enjoy my solitude. By the end, I feel calm and refreshed, and I like the sense of freedom in my choices.",
      },
      {
        id: "material2_independent",
        title: "Exercise II",
        text: "Before I start the assignment, my notes spread across my desk, and my outline stays open. After a quick scan, I choose my own angle and keep my argument distinct and different. To stay free to revise, I build a simple checklist and write my introduction in my own words. As my draft grows, I separate each section and refine my transitions until my logic feels clear to me. When a sentence sounds weak, I rewrite the sentence and stay assertive about my choices. Near the end, I check my citations and my formatting, then I submit my final file. The assignment earns a high score, and my independent approach supports my result.",
      },
      {
        id: "material3_independent",
        title: "Exercise III",
        text: "On Saturday, my short trip begins with a quiet train ride, and I keep my bag close. A new neighborhood feels different from my usual streets, so I follow my curiosity and choose my own pace. At a small shop, my attention moves to a unique local snack, and I decide to try my favorite flavor. A narrow side road looks less crowded, so I turn apart from the main path and enjoy being alone. The moment brings a sense of freedom, and my autonomy feels natural. Later, I sit at a corner table and write a few notes in my notebook. By the end, my solitude feels calm, and I like how my choices stay mine.",
      },
    ],
    interdependent: [
      {
        id: "material1_interdependent",
        title: "Exercise I",
        text: "On Friday, our weekend looks open, so we plan a short trip together. After we check our budget, we choose our shared route and pick a place that feels similar for us. To stay connected, we keep our schedule flexible and share our options in partnership. At the map, we compare routes and choose the route that fits our group pace. If a new idea appears, we agree and adjust quickly, then we keep our plan cohesive. With our bags ready, we head out together and enjoy our closeness. By the end, we feel warm and relaxed, and we like the feeling of connection in our time together.",
      },
      {
        id: "material2_interdependent",
        title: "Exercise II",
        text: "Before we start the assignment, our notes spread across the desk, and our outline stays open. After a quick scan, we choose our shared angle and keep our argument similar across our sections. To work together, we build a simple checklist and write our introduction in our shared voice. As our draft grows, we connect each section and revise with overlap across our edits. When a sentence sounds weak, we rewrite the sentence and stay cooperative and agreeable. Near the end, we check our citations and our formatting, then we submit our final file. The assignment earns a high score, and our interdependent teamwork supports our result.",
      },
      {
        id: "material3_interdependent",
        title: "Exercise III",
        text: "On Saturday, our short trip begins with a quiet train ride, and we keep our bags close. A new neighborhood feels different from our usual streets, so we stay together and choose our shared pace. At a small shop, our attention moves to a local snack, and we share our favorite flavor. A narrow side road looks less crowded, so we turn together and keep our group close. The moment brings a sense of connection, and our partnership feels natural. Later, we sit at a corner table and write a few notes in our notebook. By the end, our closeness feels calm, and we like our time together.",
      },
    ],
  },
};

// ============ 確認對話框元件 ============
const ConfirmDialog = ({ isOpen, onConfirm, onCancel, isLastQuestion }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-3">
          Confirm submission
        </h3>
        <p className="text-slate-600 mb-6 leading-relaxed">
          {isLastQuestion
            ? "This is the last page. Once you submit, you cannot go back. Are you sure you want to submit?"
            : "Once you submit, you cannot go back to this page. Are you sure you want to continue?"}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
          >
            Yes, submit
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ Canvas 題目組件 ============
const QuestionCanvas = ({
  material,
  questionNumber,
  totalQuestions,
  onConfirmSubmit,
  isLastQuestion,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [selectedWords, setSelectedWords] = useState(new Set());
  const [wordPositions, setWordPositions] = useState([]);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 620 });
  const [canvasLayout, setCanvasLayout] = useState(CONFIG.canvas.desktop);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setSelectedWords(new Set());
  }, [material.id]);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;

      // ✅ 不要再 -32，外層容器已經有 padding 了
      const width = Math.min(containerWidth, CONFIG.canvas.maxWidth);

      const isMobile = width < 640;
      const layout = isMobile ? CONFIG.canvas.mobile : CONFIG.canvas.desktop;

      setCanvasLayout(layout);
      setCanvasSize({ width, height: layout.height });
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  // layout words -> positions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const width = canvasSize.width;
    const height = canvasSize.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const { fontSize, lineHeight, padding } = canvasLayout;
    const maxWidth = width - padding * 2;

    ctx.font = `${fontSize}px Arial`;
    ctx.textBaseline = "top";

    const words = material.text.match(/[^\s]+/g) || [];
    const positions = [];

    let x = padding;
    let y = padding;

    words.forEach((word, index) => {
      const wordMatch = word.match(/^([a-zA-Z']+)(.*)$/);
      const pureWord = wordMatch ? wordMatch[1] : word;
      const punctuation = wordMatch ? wordMatch[2] : "";

      const wordWidth = ctx.measureText(word + " ").width;
      const pureWordWidth = ctx.measureText(pureWord).width;

      if (x + wordWidth > maxWidth && x > padding) {
        x = padding;
        y += lineHeight;
      }

      positions.push({
        displayWord: word,
        pureWord,
        punctuation,
        x,
        y,
        width: pureWordWidth,
        height: fontSize,
        index,
      });

      x += wordWidth;
    });

    setWordPositions(positions);
  }, [material.text, canvasSize, canvasLayout]);

  // draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { fontSize } = canvasLayout;

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.font = `${fontSize}px Arial`;
    ctx.textBaseline = "top";

    wordPositions.forEach((pos) => {
      const isSelected = selectedWords.has(pos.index);

      ctx.fillStyle = isSelected
        ? CONFIG.colors.selectedText
        : CONFIG.colors.normalText;

      ctx.fillText(pos.pureWord, pos.x, pos.y);

      if (pos.punctuation) {
        ctx.fillStyle = CONFIG.colors.normalText;
        ctx.fillText(pos.punctuation, pos.x + pos.width, pos.y);
      }
    });
  }, [wordPositions, selectedWords, canvasSize, canvasLayout]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const pos of wordPositions) {
      if (
        x >= pos.x &&
        x <= pos.x + pos.width &&
        y >= pos.y &&
        y <= pos.y + pos.height
      ) {
        setSelectedWords((prev) => {
          const next = new Set(prev);
          if (next.has(pos.index)) next.delete(pos.index);
          else next.add(pos.index);
          return next;
        });
        break;
      }
    }
  };

  const getSelectedWordsList = () => {
    return Array.from(selectedWords)
      .sort((a, b) => a - b)
      .map((index) => wordPositions[index]?.pureWord)
      .filter(Boolean);
  };

  const submitPayload = () => ({
    materialId: material.id,
    selectedWords: getSelectedWordsList(),
    completed: true,
  });

  return (
    <div className="space-y-4">
      {/* Header row */}
      <h2 className="text-xl font-bold text-slate-800">{material.title}</h2>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="border border-slate-200 rounded-xl p-2 sm:p-4 bg-white shadow-sm"
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="cursor-pointer w-full"
          style={{ display: "block" }}
        />
      </div>

      {/* Selected words */}
      {CONFIG.display.showSelectedWords && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-sm font-semibold text-slate-700 mb-2">
            Selected words ({selectedWords.size})
          </p>

          {getSelectedWordsList().length > 0 ? (
            <div className="text-slate-800 leading-relaxed flex flex-wrap gap-2">
              {getSelectedWordsList().map((word, idx) => (
                <span
                  key={idx}
                  className="bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-md text-sm"
                >
                  {word}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">
              Click words in the paragraph above to select pronouns.
            </p>
          )}
        </div>
      )}

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowConfirm(true)}
          className="px-6 py-3 rounded-lg font-semibold transition-all bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg"
        >
          {isLastQuestion ? "Submit →" : "Continue →"}
        </button>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        isLastQuestion={isLastQuestion}
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => {
          setShowConfirm(false);
          onConfirmSubmit(submitPayload());
        }}
      />
    </div>
  );
};

// ============ 主組件 ============
export default function PronounSelector({ iv1, onSubmit, onError }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allResults, setAllResults] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const materials = CONFIG.materials[iv1] || CONFIG.materials.independent;
  const total = CONFIG.question.totalQuestions;
  const currentMaterial = materials[currentQuestionIndex];

  const progressPct = ((currentQuestionIndex + 1) / total) * 100;

  const handleQuestionSubmit = async (result) => {
    const newResults = [...allResults, result];
    setAllResults(newResults);

    if (currentQuestionIndex < total - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      //   window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ pronounAnswers: newResults });
    } catch (error) {
      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-l-4 border-indigo-600">
          <h1 className="text-2xl font-bold text-slate-800">Warm-up</h1>
          <p className="mt-2 text-slate-600 italic text-base sm:text-lg leading-normal">
            Before the next task, we’ll do a brief mental focusing exercise to
            clear your mind.
          </p>

          <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
            <ul className="space-y-3 text-slate-700 text-base sm:text-lg leading-normal">
              {CONFIG.question.instructionPoints.map((item, i) => (
                <li key={i} className="flex gap-3 font-medium ">
                  <span className="mt-2 w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />

                  {item.type === "examples" ? (
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800 mb-1">
                        Pronouns can be{" "}
                        <span className="text-indigo-700">singular</span> or{" "}
                        <span className="text-indigo-700">plural</span>.
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2 mt-2">
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                          <div className="text-sm font-bold text-slate-800 mb-2">
                            Singular{" "}
                            <span className="text-slate-500 font-semibold">
                              (examples)
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {item.singular.map((w) => (
                              <span
                                key={w}
                                className="px-2 py-0.5 rounded-md text-sm font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200"
                              >
                                {w}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                          <div className="text-sm font-bold text-slate-800 mb-2">
                            Plural{" "}
                            <span className="text-slate-500 font-semibold">
                              (examples)
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {item.plural.map((w) => (
                              <span
                                key={w}
                                className="px-2 py-0.5 rounded-md text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200"
                              >
                                {w}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="flex-1">{item.text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-end mb-2">
            <span className="text-sm font-semibold text-slate-700">
              Page {currentQuestionIndex + 1} of {total}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200">
          <QuestionCanvas
            material={currentMaterial}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={total}
            isLastQuestion={currentQuestionIndex === total - 1}
            onConfirmSubmit={handleQuestionSubmit}
          />
        </div>
      </div>

      <FullscreenLoading open={isSubmitting} title="Submitting…" />
    </div>
  );
}
