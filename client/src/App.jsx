import React, { useState, useEffect, useRef } from "react";
import Scramble from "./components/Scramble";
import Pronoun from "./components/Pronoun";
import SCSScale from "./components/SCSScale";

const STORAGE_KEY = "prolificId";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Session state
  const [prolificId, setProlificId] = useState(null);
  const [pipeline, setPipeline] = useState(null);
  const [iv1, setIv1] = useState(null);
  const [iv2, setIv2] = useState(null);

  // Stage state
  const [currentStage, setCurrentStage] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedReason, setFailedReason] = useState(null);
  const stageStartTsRef = useRef(null); // 記錄目前 stage 進入時間（ms）

  // ---- helpers: prolificId ----

  const getProlificIdFromQuery = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("PROLIFIC_PID") || params.get("prolificId") || null;
  };

  const setProlificIdToQuery = (pid) => {
    if (!pid) return;
    const url = new URL(window.location.href);
    const params = url.searchParams;

    // 避免重複 replaceState
    if (params.get("prolificId") === pid) return;

    params.set("prolificId", pid);
    // 若你也想同步 PROLIFIC_PID：
    // params.set("PROLIFIC_PID", pid);

    window.history.replaceState({}, "", url.toString());
  };

  const getProlificIdFromStorage = () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const setProlificIdToStorage = (pid) => {
    if (!pid) return;
    try {
      localStorage.setItem(STORAGE_KEY, pid);
    } catch {
      /* empty */
    }
  };

  const generateProlificId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `pid_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  };

  // ---- helpers: stage1Task ----
  const getStage1Task = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("stage1Task") || null;
  };

  // ---- init (guarded) ----
  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    // 1) query 優先
    let pid = getProlificIdFromQuery();

    // 2) 若 query 沒有 →（可選）用 storage 當 refresh fallback
    //    如果你堅持「只 query->generate」，就把這行刪掉
    if (!pid) pid = getProlificIdFromStorage();

    // 3) 都沒有 → 前端產生
    if (!pid) pid = generateProlificId();

    // 4) 一律同步到 localStorage + query
    setProlificIdToStorage(pid);
    setProlificIdToQuery(pid);

    // 5) 用 pid init
    initializeSession(pid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeSession = async (pid) => {
    try {
      setLoading(true);
      setError(null);

      const stage1Task = getStage1Task();
      const qs = new URLSearchParams();
      if (stage1Task) qs.set("stage1Task", stage1Task);

      const response = await fetch(`/api/init?${qs.toString()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prolificId: pid }),
      });

      if (!response.ok) throw new Error("Failed to initialize session");

      const data = await response.json();
      if (!data.ok) throw new Error(data.message || "Initialization failed");

      // 後端若回傳不同 prolificId，以後端為準並同步回 storage/query
      const finalPid = data.prolificId ?? pid;
      setProlificIdToStorage(finalPid);
      setProlificIdToQuery(finalPid);

      setProlificId(finalPid);
      setPipeline(data.pipeline);
      setIv1(data.iv1);
      setIv2(data.iv2);

      if (data.completed) {
        setCompleted(true);
        setCurrentStage(null);
      } else if (data.failed) {
        setFailed(true);
        setFailedReason(data.failed_reason);
        setCurrentStage(null);
      } else {
        setCurrentStage(data.stage);
        stageStartTsRef.current = Date.now();
      }

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Submit answers for current stage
  const handleSubmit = async (answers) => {
    const now = Date.now();
    const started = stageStartTsRef.current ?? now;
    const stageSeconds = Math.max(0, Math.round((now - started) / 1000));
    const response = await fetch(`/api/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prolificId,
        stageId: currentStage.id,
        answers,
        meta: {
          stageSeconds,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Submission failed");
    }

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.message || "Submission failed");
    }

    if (!data.passed) {
      setFailed(true);
      setFailedReason(data.verdict);
      return;
    }

    if (data.completed) {
      setCompleted(true);
      setCurrentStage(null);
    } else {
      await loadNextStage();
    }
  };

  // Load next stage
  const loadNextStage = async () => {
    try {
      const response = await fetch(
        `/api/current-stage?prolificId=${prolificId}`,
      );

      if (!response.ok) throw new Error("Failed to load next stage");

      const data = await response.json();
      if (!data.ok) throw new Error(data.message || "Failed to load stage");

      if (data.completed) {
        setCompleted(true);
        setCurrentStage(null);
      } else if (data.failed) {
        setFailed(true);
        setFailedReason(data.failed_reason);
      } else {
        setCurrentStage(data.stage);
        stageStartTsRef.current = Date.now();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Render current stage component
  const renderStage = () => {
    if (!currentStage || !currentStage.ui) {
      return (
        <div className="text-center text-slate-600">
          <p>No stage configuration found.</p>
        </div>
      );
    }

    const { screen } = currentStage.ui;

    switch (screen) {
      case "scramble_sentence":
        return (
          <Scramble iv1={iv1} onSubmit={handleSubmit} onError={setError} />
        );

      case "pronoun_selector":
        return <Pronoun iv1={iv1} onSubmit={handleSubmit} onError={setError} />;

      case "scs_scale":
        return (
          <SCSScale
            iv1={iv1}
            order={currentStage?.ui?.order ?? "ind_first"}
            onSubmit={handleSubmit}
            onError={setError}
          />
        );

      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full text-center border border-slate-200">
              <p className="text-slate-600">
                Unknown screen type: <code>{screen}</code>
              </p>
            </div>
          </div>
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full text-center border border-slate-200">
          <div className="mb-6">
            <div className="inline-block w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Loading...</h2>
          <p className="text-slate-600">Initializing your session</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full text-center border border-red-200">
          <div className="mb-6">
            <svg
              className="w-20 h-20 mx-auto text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            An Error Occurred
          </h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Completed state
  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full text-center border border-slate-200">
          <div className="mb-6">
            <svg
              className="w-20 h-20 mx-auto text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-slate-800 mb-4">
            Study Complete!
          </h2>
          <p className="text-lg text-slate-600 mb-2">
            Thank you for participating in this study.
          </p>
          <p className="text-sm text-slate-500 mb-8">
            You may now close this window.
          </p>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-600">
              Participant ID:{" "}
              <span className="font-mono font-semibold">{prolificId}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Failed state
  if (failed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full text-center border border-amber-200">
          <div className="mb-6">
            <svg
              className="w-20 h-20 mx-auto text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Study Ended
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Unfortunately, you did not meet the criteria to continue with this
            study.
          </p>
          <p className="text-sm text-slate-500">
            Thank you for your time and participation.
          </p>
        </div>
      </div>
    );
  }

  return <div className="App">{renderStage()}</div>;
}
