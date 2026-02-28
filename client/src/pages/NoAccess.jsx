export default function NoAccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full text-center border border-slate-200 p-12">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-6V5m0 0a2 2 0 100-4 2 2 0 000 4zm6 6a6 6 0 11-12 0 6 6 0 0112 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-3">
          Access Restricted
        </h1>
        <p className="text-slate-600 leading-relaxed">
          This study can only be accessed through a valid{" "}
          <strong>Prolific</strong> study link. Please return to Prolific and
          click the study link to participate.
        </p>
      </div>
    </div>
  );
}
