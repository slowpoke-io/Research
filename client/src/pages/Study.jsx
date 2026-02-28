import React, { useState, useEffect, useRef } from "react";
import Scramble from "../components/Scramble";
import Pronoun from "../components/Pronoun";
import SCSScale from "../components/SCSScale";
import Debriefing from "./Debriefing";

const STORAGE_KEY = "prolificId";

export default function StudyApp() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [prolificId, setProlificId] = useState(null);
  const [pipeline, setPipeline] = useState(null);
  const [iv1, setIv1] = useState(null);
  const [iv2, setIv2] = useState(null);

  const [currentStage, setCurrentStage] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedReason, setFailedReason] = useState(null);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const stageStartTsRef = useRef(null);

  const getProlificIdFromQuery = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("PROLIFIC_PID") || params.get("prolificId") || null;
  };

  const setProlificIdToQuery = (pid) => {
    if (!pid) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("prolificId") === pid) return;
    url.searchParams.set("prolificId", pid);
    window.history.replaceState({}, "", url.toString());
  };

  const setProlificIdToStorage = (pid) => {
    if (!pid) return;
    try {
      localStorage.setItem(STORAGE_KEY, pid);
    } catch {
      /* empty */
    }
  };

  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const pid = getProlificIdFromQuery();
    if (!pid) {
      setError(
        "No participant ID found. Please access this study through your Prolific link.",
      );
      setLoading(false);
      return;
    }

    setProlificIdToStorage(pid);
    initializeSession(pid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeSession = async (pid) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/init${window.location.search}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prolificId: pid }),
      });

      if (!response.ok) throw new Error("Failed to initialize session");
      const data = await response.json();
      if (!data.ok) throw new Error(data.message || "Initialization failed");

      const finalPid = data.prolificId ?? pid;
      setProlificIdToStorage(finalPid);
      setProlificIdToQuery(finalPid);

      setProlificId(finalPid);
      setPipeline(data.pipeline);
      setIv1(data.iv1);
      setIv2(data.iv2);

      if (data.completed) {
        setCompleted(true);
        setRedirectUrl(data.redirectUrl);
        setCurrentStage(null);
      } else if (data.failed) {
        setFailed(true);
        setFailedReason(data.failed_reason);
        setRedirectUrl(data.redirectUrl);
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
        meta: { stageSeconds },
      }),
    });

    // 403 locked out — session was timed out and cleaned up while user was working
    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.message === "locked out (failed)") {
        setFailed(true);
        setFailedReason({ reason: "timeout" });
        // Fetch the fail redirect URL from the server
        try {
          const urlRes = await fetch(
            `/api/current-stage?prolificId=${prolificId}`,
          );
          const urlData = await urlRes.json();
          setRedirectUrl(urlData.redirectUrl ?? null);
        } catch {
          setRedirectUrl(null);
        }
        setCurrentStage(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      throw new Error(errorData.message || "Submission failed");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Submission failed");
    }

    const data = await response.json();
    if (!data.ok) throw new Error(data.message || "Submission failed");

    if (!data.passed) {
      // Show debriefing with fail message instead of immediate redirect
      setFailed(true);
      setFailedReason(data.verdict);
      setRedirectUrl(data.redirectUrl);
      setCurrentStage(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (data.completed) {
      // Show debriefing with success message instead of immediate redirect
      setCompleted(true);
      setRedirectUrl(data.redirectUrl);
      setCurrentStage(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    await loadNextStage();
  };

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

  const renderStage = () => {
    if (!currentStage?.ui)
      return (
        <div className="text-center text-slate-600">
          <p>No stage configuration found.</p>
        </div>
      );
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

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full text-center border border-slate-200">
          <div className="mb-6">
            <div className="inline-block w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Loading...</h2>
          <p className="text-slate-600">Initializing your session</p>
        </div>
      </div>
    );

  if (error)
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
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );

  // Show debriefing for both completed and failed states
  if (completed || failed)
    return (
      <Debriefing
        passed={completed}
        redirectUrl={redirectUrl}
        failedReason={failedReason}
      />
    );

  return <div className="App">{renderStage()}</div>;
}
