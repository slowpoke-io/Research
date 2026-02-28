import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Consent() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const [declining, setDeclining] = useState(false);

  const handleAgree = () => {
    navigate(`/study${search}`);
  };

  const handleDecline = async () => {
    setDeclining(true);
    try {
      const res = await fetch("/api/decline-url");
      const data = await res.json();
      if (data.ok && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch {
      // fallback: stay on page if fetch fails
      setDeclining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Informed Consent</h1>
          <p className="text-indigo-200 text-sm mt-1">
            Please read the following carefully before proceeding.
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-5 text-slate-700 text-[15px] leading-7">
          <section>
            <h2 className="font-semibold text-slate-900 mb-1">
              Purpose of the Study
            </h2>
            <p>
              You are invited to participate in a research study examining how
              people perceive and interpret information. The study will take
              approximately <strong>8–10 minutes</strong> to complete.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-1">
              What You Will Be Asked to Do
            </h2>
            <p>
              You will complete a series of tasks and questionnaires. Please
              read each item carefully and respond as accurately as possible.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-1">
              Risks and Benefits
            </h2>
            <p>
              There are no known risks associated with participation beyond
              those of everyday life. Your participation contributes to
              scientific knowledge about human cognition and behavior.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-1">
              Confidentiality
            </h2>
            <p>
              Your responses are anonymous. Data will be stored securely and
              used for research purposes only. No personally identifying
              information will be collected beyond your Prolific ID, which is
              used solely to process your payment.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-2 text-lg">
              Data Quality & Performance Requirements
            </h2>
            <p className="mb-3">
              To ensure the integrity of our research, we require a{" "}
              <strong>minimum performance threshold</strong> for this task.
              Please stay focused and complete the task to the best of your
              ability.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-base text-amber-900">
              <p className="mb-2">
                This task requires a <strong>high level of engagement</strong>.
                You will be automatically redirected to Prolific to{" "}
                <strong>return your slot without compensation</strong> if any of
                the following occur:
              </p>
              <ul className="space-y-1.5 ml-1">
                {[
                  <>
                    Your task accuracy falls <strong>below 75%</strong>
                  </>,
                  <>
                    You fail the <strong>internal attention check</strong> items
                  </>,
                  <>
                    The study is completed <strong>too quickly</strong>{" "}
                    (indicating insufficient engagement)
                  </>,
                  <>
                    The session is left inactive for more than{" "}
                    <strong>20 minutes</strong> (timeout)
                  </>,
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-1">
              Voluntary Participation
            </h2>
            <p>
              Participation is entirely voluntary. You may withdraw at any time
              by closing this window, though you will not receive compensation
              if you do not complete the study.
            </p>
          </section>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm text-slate-600">
            By clicking <strong>"I Agree"</strong> below, you confirm that you
            have read and understood the information above, including the
            performance, attention, and session timeout requirements. You verify
            that you are at least 18 years old and voluntarily agree to
            participate in this study under these conditions.
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={handleDecline}
            disabled={declining}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            {declining ? "Redirecting…" : "I Do Not Agree"}
          </button>
          <button
            onClick={handleAgree}
            className="w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
          >
            I Agree →
          </button>
        </div>
      </div>
    </div>
  );
}
