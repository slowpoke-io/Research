import React, { useRef, useEffect, useState } from "react";
import FullscreenLoading from "./FullscreenLoading";

// ============ 配置區 ============
const CONFIG = {
  question: {
    instructionPoints: [
      {
        type: "text",
        text: "There are 3 short paragraphs in total. Please read each one carefully.",
      },
      {
        type: "text",
        text: "Select every pronoun you find in the paragraph.",
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
        type: "animated_example",
        sentence: [
          { word: "She", isPronoun: true },
          { word: "finished", isPronoun: false },
          { word: "her", isPronoun: true },
          { word: "report,", isPronoun: false },
          { word: "and", isPronoun: false },
          { word: "we", isPronoun: true },
          { word: "reviewed", isPronoun: false },
          { word: "it", isPronoun: true },
          { word: "together.", isPronoun: false },
        ],
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
        id: "PRON_IND_1",
        title: "Task I",
        text: "On Friday afternoon, my work queue becomes open, and I review my tasks before I begin. After I check my schedule, I choose my own order and move my highest priority item to the top. My focus stays on my goal, so I keep my options separate and apart while I compare deadlines. If a new request appears, I pause, diverge from my first order, and adjust my plan for my pace and for me. A clear list helps me track my progress, and I mark my completed steps in my notebook. Near the end, I return to my first priority and finish my remaining work. By the end, I feel calm and focused, and my work choices give me a clear sense of freedom.",
      },
      {
        id: "PRON_IND_2",
        title: "Task II",
        text: "Before I start the report, I review my source list and mark my key points in my notebook. After a quick scan, I choose my own angle and keep my argument distinct and different. To stay free to revise, I build a simple checklist and write my opening paragraph in my own words. As my draft grows, I separate each section and refine my transitions until my logic feels clear to me. When a sentence sounds weak, I rewrite the sentence and stay assertive about my choices, and my checklist helps me keep my structure consistent. Near the end, I check my citations and my formatting, then I submit my final file. The report earns a high evaluation, and my own approach supports my result for me.",
      },
      {
        id: "PRON_IND_3",
        title: "Task III",
        text: "On Monday, my project review begins in a meeting room, and I open my notes before my update. After a quick scan, I choose my own order and keep my main points distinct and clear. During my review, I explain my decisions in my own words and stay assertive about my choices. If a new question appears, I pause, compare options, and adjust my response for my pace and for me. After my review, I return to my desk and record my next steps in my notebook, and my notes stay with me for my next task. Near the end of my workday, I check my task list and organize my materials. By the end, I feel steady and clear, and I like how my work choices stay mine.",
      },
    ],
    interdependent: [
      {
        id: "PRON_INTER_1",
        title: "Task I",
        text: "On Friday afternoon, our work queue becomes open, and we review our tasks before we begin. After we check our schedule, we choose our shared order and move our highest priority item to the top. Our focus stays on our goal, so we keep our options connected while we compare deadlines. If a new request appears, we pause, agree on a new order, and adjust our plan for our pace and for us. A clear list helps us track our progress, and we mark our completed steps in our notebook. Near the end, we return to our first priority and finish our remaining work. By the end, we feel calm and focused, and our work choices give us a clear sense of connection.",
      },
      {
        id: "PRON_INTER_2",
        title: "Task II",
        text: "Before we start the report, we review our source list and mark our key points in our notebook. After a quick scan, we choose our shared angle and keep our argument similar across our sections. To work together, we build a simple checklist and write our opening paragraph in our shared voice. As our draft grows, we connect each section and revise with overlap across our edits until our logic feels clear to us. When a sentence sounds weak, we rewrite the sentence and stay cooperative and agreeable, and our checklist helps us keep our structure consistent. Near the end, we check our citations and our formatting, then we submit our final file. The report earns a high evaluation, and our shared teamwork supports our result for us.",
      },
      {
        id: "PRON_INTER_3",
        title: "Task III",
        text: "On Monday, our project review begins in a meeting room, and we open our notes before our update. After a quick scan, we choose our shared order and keep our main points connected and clear. During our review, we explain our decisions in our shared voice and stay cooperative and agreeable in our choices. If a new question appears, we pause, compare options, and adjust our response for our pace and for us. After our review, we return to our work area and record our next steps in our notebook, and our notes stay with us for our next task. Near the end of our workday, we check our task list and organize our materials. By the end, we feel steady and clear, and we like our work time together.",
      },
    ],
  },
};

// ============ Animated example ============
const AnimatedExample = ({ sentence }) => {
  const pronounIndices = sentence
    .map((t, i) => (t.isPronoun ? i : -1))
    .filter((i) => i !== -1);

  const [lit, setLit] = useState(new Set());

  useEffect(() => {
    // Sequentially highlight each pronoun, then pause, then repeat
    let cancelled = false;
    let timeouts = [];

    const run = () => {
      // Reset
      setLit(new Set());

      pronounIndices.forEach((idx, order) => {
        const t1 = setTimeout(
          () => {
            if (cancelled) return;
            setLit((prev) => new Set([...prev, idx]));
          },
          600 + order * 500,
        );
        timeouts.push(t1);
      });

      // Hold fully lit, then restart
      const totalDelay = 600 + pronounIndices.length * 500 + 1800;
      const t2 = setTimeout(() => {
        if (cancelled) return;
        run();
      }, totalDelay);
      timeouts.push(t2);
    };

    run();
    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1">
      <p className="mb-2 font-medium">
        Example — pronouns are highlighted as you select them:
      </p>
      <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 flex flex-wrap gap-x-1.5 gap-y-1 text-base leading-relaxed">
        {sentence.map((token, i) => {
          const active = lit.has(i);
          return (
            <span
              key={i}
              className={`rounded px-1 transition-all duration-300 font-medium ${
                active
                  ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300"
                  : "text-slate-800"
              }`}
            >
              {token.word}
            </span>
          );
        })}
      </div>
    </div>
  );
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvasSize;

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
    let x = padding,
      y = padding;

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

  const getSelectedWordsList = () =>
    Array.from(selectedWords)
      .sort((a, b) => a - b)
      .map((i) => wordPositions[i]?.pureWord)
      .filter(Boolean);

  const submitPayload = () => ({
    id: material.id,
    selectedWords: getSelectedWordsList(),
    completed: true,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">{material.title}</h2>
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
      {CONFIG.display.showSelectedWords && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-sm font-semibold text-slate-700 mb-2">
            Selected words ({selectedWords.size})
          </p>
          {getSelectedWordsList().length > 0 ? (
            <div className="flex flex-wrap gap-2">
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
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 0);
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
          <h1 className="text-2xl font-bold text-slate-800">
            {"Instruction" /*Warm-up*/}
          </h1>
          <p className="mt-2 text-slate-600 italic text-base sm:text-lg leading-normal">
            {/* Before the next task, we'll do a brief mental focusing exercise to
            clear your mind. */}
          </p>

          <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
            <ul className="space-y-3 text-slate-700 text-base sm:text-lg leading-normal">
              {CONFIG.question.instructionPoints.map((item, i) => (
                <li key={i} className="flex gap-3 font-medium">
                  <span className="mt-2 w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />

                  {item.type === "examples" ? (
                    <div className="flex-1">
                      <div className="text-slate-800 mb-1">
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
                  ) : item.type === "animated_example" ? (
                    <AnimatedExample sentence={item.sentence} />
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
