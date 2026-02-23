import React from "react";

/**
 * Fullscreen overlay loading.
 * Props:
 * - open: boolean (是否顯示)
 * - title?: string
 * - message?: string
 * - spinnerClassName?: string (可選)
 */
export default function FullscreenLoading({
  open,
  title = "Submitting…",
  message = "Please wait. Do not refresh the page.",
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white/70 backdrop-blur-sm flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>

        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        {message ? (
          <p className="text-sm text-slate-600 mt-1">{message}</p>
        ) : null}
      </div>
    </div>
  );
}
