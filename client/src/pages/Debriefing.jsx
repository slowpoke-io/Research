export default function Debriefing({ passed, redirectUrl, failedReason }) {
  const handleRedirect = () => {
    window.location.href = redirectUrl;
  };

  const getFailReason = () => {
    if (!failedReason) return null;
    const reason = failedReason?.reason ?? failedReason?.kind ?? null;

    if (reason === "timeout")
      return "Your session timed out due to inactivity.";
    if (reason === "Failed attention check")
      return "You did not pass the attention check items.";
    if (failedReason?.kind === "stage1_pronoun_f1")
      return "Your accuracy on the pronoun identification task did not meet the required threshold.";
    if (failedReason?.kind === "stage1_scramble_50")
      return "Your accuracy on the sentence unscrambling task did not meet the required threshold.";
    return "Your responses did not meet the study's data quality requirements.";
  };

  if (passed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-600 px-8 py-6 text-white">
            <div className="flex items-center gap-3 mb-1">
              <svg
                className="w-7 h-7 flex-shrink-0"
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
              <h1 className="text-2xl font-bold">
                Study Complete — Thank You!
              </h1>
            </div>
            <p className="text-emerald-100 text-sm">
              Please read the information below before returning to Prolific.
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-7 space-y-6 text-slate-700 leading-relaxed">
            <section>
              <h2 className="font-semibold text-slate-900 mb-2">
                About This Study
              </h2>
              <p>
                This study used a technique called <strong>priming</strong>. The
                first task — whether you were asked to identify pronouns in
                short passages or to unscramble sentences — was designed to
                subtly activate either an <strong>independent</strong>{" "}
                (individual-focused) or an <strong>interdependent</strong>{" "}
                (group-focused) mindset, without drawing your attention to it at
                the time.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-slate-900 mb-2">
                Why Priming?
              </h2>
              <p>
                Priming is a well-established method in social psychology for
                temporarily activating particular ways of thinking. By measuring
                your responses on the subsequent scale, we can examine how these
                different mindsets may relate to self-construal — how people
                think about themselves in relation to others.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-slate-900 mb-2">
                Confidentiality
              </h2>
              <p>
                Your responses are anonymous and will only be used for research
                purposes. Now that you have read this debriefing, please do not
                share details of the study design with other potential
                participants.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-slate-900 mb-2">Thank You</h2>
              <p>
                We sincerely appreciate your time and careful participation.
                Your contribution helps advance our understanding of how social
                context shapes self-perception.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="px-8 pb-8">
            <button
              onClick={handleRedirect}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg text-base"
            >
              Return to Prolific →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Failed state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-amber-500 px-8 py-6 text-white">
          <div className="flex items-center gap-3 mb-1">
            <svg
              className="w-7 h-7 flex-shrink-0"
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
            <h1 className="text-2xl font-bold">Study Ended</h1>
          </div>
          <p className="text-amber-100 text-sm">
            Please read the information below before returning to Prolific.
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-7 space-y-6 text-slate-700 leading-relaxed">
          {getFailReason() && (
            <section className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-900 text-sm mt-5">
              <strong>Reason: </strong>
              {getFailReason()}
            </section>
          )}

          <section>
            <h2 className="font-semibold text-slate-900 mb-2">
              About This Study
            </h2>
            <p>
              This study used a technique called <strong>priming</strong>. The
              first task was designed to subtly activate either an{" "}
              <strong>independent</strong> (individual-focused) or an{" "}
              <strong>interdependent</strong> (group-focused) mindset, followed
              by a self-construal scale.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-2">Next Steps</h2>
            <p>
              Because your submission did not meet the data quality requirements
              for this study, please <strong>return your submission</strong> on
              Prolific by clicking the button below. You will not be penalised
              for returning your submission.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-2">Thank You</h2>
            <p>
              We appreciate you taking the time to participate. Please do not
              share details of the study design with other potential
              participants.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8">
          <button
            onClick={handleRedirect}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg text-base"
          >
            Return to Prolific →
          </button>
        </div>
      </div>
    </div>
  );
}
