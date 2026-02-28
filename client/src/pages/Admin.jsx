import { useState, useCallback } from "react";

// ─── Constants ───────────────────────────────────────────────
const IV1_COLORS = {
  independent: "bg-violet-100 text-violet-700",
  interdependent: "bg-cyan-100 text-cyan-700",
};
const IV2_COLORS = {
  A: "bg-rose-100 text-rose-700",
  B: "bg-amber-100 text-amber-700",
  C: "bg-teal-100 text-teal-700",
};

// ─── Helpers ─────────────────────────────────────────────────
function fmtTime(secs) {
  if (!secs) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusInfo(row) {
  if (row.completed)
    return {
      label: "Completed",
      cls: "bg-emerald-100 text-emerald-700",
      dot: "bg-emerald-500",
    };
  if (row.failed)
    return {
      label: "Failed",
      cls: "bg-red-100 text-red-600",
      dot: "bg-red-500",
    };
  return {
    label: "In Progress",
    cls: "bg-amber-100 text-amber-700",
    dot: "bg-amber-400",
  };
}

function sortRows(rows, key, dir) {
  if (!key) return rows;
  return [...rows].sort((a, b) => {
    let av = a[key],
      bv = b[key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (key === "status") {
      av = a.completed ? 0 : a.failed ? 2 : 1;
      bv = b.completed ? 0 : b.failed ? 2 : 1;
    }
    if (typeof av === "string") av = av.toLowerCase();
    if (typeof bv === "string") bv = bv.toLowerCase();
    if (av < bv) return dir === "asc" ? -1 : 1;
    if (av > bv) return dir === "asc" ? 1 : -1;
    return 0;
  });
}

// ─── Sub-components ──────────────────────────────────────────
function StatCard({ label, value, sub, accent }) {
  const accents = {
    violet: "border-violet-400 text-violet-600",
    emerald: "border-emerald-400 text-emerald-600",
    amber: "border-amber-400  text-amber-600",
    red: "border-red-400    text-red-600",
    slate: "border-slate-300  text-slate-500",
  };
  return (
    <div
      className={`bg-white rounded-2xl border-l-4 p-4 shadow-sm ${accents[accent] ?? accents.slate}`}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
        {label}
      </p>
      <p
        className={`text-2xl md:text-3xl font-black ${accents[accent]?.split(" ")[1]}`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function CompletedCard({ data, total }) {
  const [open, setOpen] = useState(false);

  const completed = data.filter((r) => r.completed);
  const count = completed.length;
  const pct = total ? Math.round((count / total) * 100) : null;

  const cell = (task, iv1) =>
    completed.filter((r) => {
      const stage1 =
        Array.isArray(r.stages) &&
        r.stages.find((s) => s.stage_id === "stage_1");
      return stage1?.variant_id === task && r.iv1 === iv1;
    }).length;

  const tasks = ["pronoun", "scramble"];
  const ivs = ["independent", "interdependent"];

  return (
    <div className="bg-white rounded-2xl border-l-4 border-emerald-400 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-1">
        Completed
      </p>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 group"
      >
        <span className="text-2xl md:text-3xl font-black text-emerald-600">
          {count}
        </span>
        <span
          className={`text-slate-400 text-xs mt-1 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>
      {pct != null && (
        <p className="text-xs text-slate-400 mt-0.5">
          {pct}% · click to expand
        </p>
      )}

      {open && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left text-slate-400 font-medium pb-1.5" />
                {ivs.map((iv) => (
                  <th
                    key={iv}
                    className="text-center text-slate-400 font-medium pb-1.5 capitalize"
                  >
                    {iv === "independent" ? "Inde." : "Inter."}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task} className="border-t border-slate-50">
                  <td className="py-1 text-slate-500 capitalize pr-2">
                    {task}
                  </td>
                  {ivs.map((iv) => (
                    <td
                      key={iv}
                      className="py-1 text-center font-semibold tabular-nums text-slate-700"
                    >
                      {cell(task, iv)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AvgTimeCard({ data }) {
  const [open, setOpen] = useState(false);

  // Helper: avg stage_seconds for a given stageId + optional variantId filter
  const avgStage = (stageId, variantId = null) => {
    const samples = [];
    for (const row of data) {
      if (!row.completed) continue;
      if (!Array.isArray(row.stages)) continue;
      for (const s of row.stages) {
        if (s.stage_id !== stageId) continue;
        if (variantId && s.variant_id !== variantId) continue;
        if (s.stage_seconds) samples.push(s.stage_seconds);
      }
    }
    if (!samples.length) return null;
    return samples.reduce((a, b) => a + b, 0) / samples.length;
  };

  const timeSamples = data.map((r) => r.total_seconds).filter(Boolean);
  const avgTotal = timeSamples.length
    ? timeSamples.reduce((a, b) => a + b, 0) / timeSamples.length
    : null;

  const fmtSec = (s) => (s ? `${(s / 60).toFixed(1)}m` : "—");

  const rows = [
    { label: "Stage 1 · pronoun", val: avgStage("stage_1", "pronoun") },
    { label: "Stage 1 · scramble", val: avgStage("stage_1", "scramble") },
    { label: "Stage 2", val: avgStage("stage_2") },
  ];

  return (
    <div className="bg-white rounded-2xl border-l-4 border-slate-300 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
        Avg Time
      </p>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 group"
      >
        <span className="text-2xl md:text-3xl font-black text-slate-500">
          {fmtSec(avgTotal)}
        </span>
        <span
          className={`text-slate-400 text-xs mt-1 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>
      <p className="text-xs text-slate-400 mt-0.5">
        completed only · click to expand
      </p>

      {open && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
          {rows.map(({ label, val }) => (
            <div
              key={label}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-slate-500">{label}</span>
              <span className="font-semibold tabular-nums text-slate-700">
                {fmtSec(val)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Badge({ label, colorCls }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${colorCls}`}
    >
      {label}
    </span>
  );
}

function StagePill({ stage, onClick }) {
  return (
    <button
      onClick={() => onClick(stage)}
      className={`rounded-lg px-2 py-0.5 text-xs font-bold transition-all hover:scale-105 hover:shadow-md ${
        stage.passed
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          : "bg-red-100 text-red-600 hover:bg-red-200"
      }`}
    >
      {stage.stage_id}
      <span className="opacity-50 ml-1 font-normal text-[10px]">
        {stage.variant_id}
      </span>
    </button>
  );
}

function SortTh({ children, sortKey, current, dir, onSort, className = "" }) {
  const active = current === sortKey;
  return (
    <th
      className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider select-none cursor-pointer group ${
        active ? "text-violet-600" : "text-slate-400"
      } ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <span
          className={`transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}
        >
          {active && dir === "asc" ? "↑" : "↓"}
        </span>
      </span>
    </th>
  );
}

function VerdictModal({ stage, onClose }) {
  if (!stage) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg overflow-hidden">
        <div
          className={`px-5 py-4 flex items-center gap-3 ${stage.passed ? "bg-emerald-50 border-b border-emerald-100" : "bg-red-50 border-b border-red-100"}`}
        >
          <span
            className={`text-base font-black ${stage.passed ? "text-emerald-600" : "text-red-500"}`}
          >
            {stage.passed ? "✓" : "✗"}
          </span>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 text-sm truncate">
              {stage.stage_id} / {stage.variant_id}
            </p>
            <p className="text-xs text-slate-500">
              {fmtDate(stage.submitted_at)} · {fmtTime(stage.stage_seconds)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto shrink-0 text-slate-400 hover:text-slate-600 text-2xl leading-none w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>
        <div className="p-5 max-h-[55vh] overflow-y-auto">
          <pre className="bg-slate-50 rounded-xl p-4 text-xs leading-relaxed text-slate-700 border border-slate-200 whitespace-pre-wrap break-all">
            {JSON.stringify(stage.verdict, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

function ParticipantCard({ row, onStageClick }) {
  const st = statusInfo(row);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md break-all leading-snug">
          {row.prolific_id}
        </span>
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.cls}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
          {st.label}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge
          label={row.iv1}
          colorCls={IV1_COLORS[row.iv1] ?? "bg-slate-100 text-slate-600"}
        />
        <Badge
          label={`iv2: ${row.iv2}`}
          colorCls={IV2_COLORS[row.iv2] ?? "bg-slate-100 text-slate-600"}
        />
      </div>
      {Array.isArray(row.stages) && row.stages.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {row.stages.map((s, i) => (
            <StagePill key={i} stage={s} onClick={onStageClick} />
          ))}
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
        <span>⏱ {fmtTime(row.total_seconds)}</span>
        <span>{fmtDate(row.started_at)}</span>
      </div>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!pwd.trim()) return;
    setLoading(true);
    setError("");
    try {
      const query = window.location.search || "";

      const res = await fetch(`/api/admin/api/summary${query}`, {
        headers: { "x-admin-password": pwd },
      });
      if (res.status === 401) {
        setError("Incorrect password.");
        return;
      }
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      onLogin(pwd, json.data ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600 shadow-lg shadow-violet-600/40 mb-4">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Study Admin
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Enter your password to continue
          </p>
        </div>
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-2xl">
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Password"
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all mb-3"
            autoFocus
          />
          {error && (
            <p className="text-red-400 text-xs mb-3 flex items-center gap-1.5">
              <span>⚠</span> {error}
            </p>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-violet-600/30 active:scale-95"
          >
            {loading ? "Checking…" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────
function Dashboard({ password, initialData }) {
  const [data, setData] = useState(initialData);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterIv1, setFilterIv1] = useState("");
  const [filterIv2, setFilterIv2] = useState("");

  const [sortKey, setSortKey] = useState("started_at");
  const [sortDir, setSortDir] = useState("desc");

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const query = window.location.search || "";
      const res = await fetch(`/api/admin/api/summary${query}`, {
        headers: { "x-admin-password": password },
      });
      const json = await res.json();
      if (json.ok) {
        setData(json.data ?? []);
        setLastUpdated(new Date());
      }
    } finally {
      setRefreshing(false);
    }
  }, [password]);

  const total = data.length;
  const completed = data.filter((r) => r.completed).length;
  const failed = data.filter((r) => r.failed).length;
  const inProg = total - completed - failed;

  const filtered = data.filter((r) => {
    if (search && !r.prolific_id.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (filterIv1 && r.iv1 !== filterIv1) return false;
    if (filterIv2 && r.iv2 !== filterIv2) return false;
    if (filterStatus === "completed" && !r.completed) return false;
    if (filterStatus === "failed" && !r.failed) return false;
    if (filterStatus === "in_progress" && (r.completed || r.failed))
      return false;
    return true;
  });
  const rows = sortRows(filtered, sortKey, sortDir);
  const shProps = { current: sortKey, dir: sortDir, onSort: handleSort };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3.5 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-sm shrink-0">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <span className="font-black text-slate-800 text-base tracking-tight">
            Study Admin
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden sm:inline text-xs text-slate-400">
            {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-all disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-5">
          <StatCard label="Total" value={total} accent="violet" />
          <CompletedCard data={data} total={total} />
          <StatCard label="In Progress" value={inProg} accent="amber" />
          <StatCard
            label="Failed"
            value={failed}
            accent="red"
            sub={total ? `${Math.round((failed / total) * 100)}%` : null}
          />
          <AvgTimeCard data={data} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ID…"
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all w-36 sm:w-52"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400 transition-all text-slate-700"
          >
            <option value="">All status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="in_progress">In Progress</option>
          </select>
          <select
            value={filterIv1}
            onChange={(e) => setFilterIv1(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400 transition-all text-slate-700"
          >
            <option value="">All iv1</option>
            <option value="independent">independent</option>
            <option value="interdependent">interdependent</option>
          </select>
          <select
            value={filterIv2}
            onChange={(e) => setFilterIv2(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400 transition-all text-slate-700"
          >
            <option value="">All iv2</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
          <span className="ml-auto self-center text-xs text-slate-400 whitespace-nowrap">
            {rows.length} / {total}
          </span>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {rows.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-sm">
              No participants match the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <SortTh sortKey="prolific_id" {...shProps} className="pl-5">
                      Prolific ID
                    </SortTh>
                    <SortTh sortKey="iv1" {...shProps}>
                      iv1
                    </SortTh>
                    <SortTh sortKey="iv2" {...shProps}>
                      iv2
                    </SortTh>
                    <SortTh sortKey="status" {...shProps}>
                      Status
                    </SortTh>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Stages
                    </th>
                    <SortTh sortKey="total_seconds" {...shProps}>
                      Time
                    </SortTh>
                    <SortTh sortKey="started_at" {...shProps}>
                      Started
                    </SortTh>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rows.map((row) => {
                    const st = statusInfo(row);
                    return (
                      <tr
                        key={row.prolific_id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="pl-5 pr-4 py-3.5">
                          <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {row.prolific_id.slice(0, 16)}
                            {row.prolific_id.length > 16 ? "…" : ""}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge
                            label={row.iv1}
                            colorCls={
                              IV1_COLORS[row.iv1] ??
                              "bg-slate-100 text-slate-600"
                            }
                          />
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge
                            label={row.iv2}
                            colorCls={
                              IV2_COLORS[row.iv2] ??
                              "bg-slate-100 text-slate-600"
                            }
                          />
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.cls}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${st.dot}`}
                            />
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1.5">
                            {Array.isArray(row.stages) &&
                            row.stages.length > 0 ? (
                              row.stages.map((s, i) => (
                                <StagePill
                                  key={i}
                                  stage={s}
                                  onClick={setSelectedStage}
                                />
                              ))
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 tabular-nums text-xs">
                          {fmtTime(row.total_seconds)}
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                          {fmtDate(row.started_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mobile card list */}
        <div className="md:hidden">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-slate-400 shrink-0">Sort by</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-violet-400 text-slate-700 flex-1"
            >
              <option value="started_at">Started</option>
              <option value="total_seconds">Time</option>
              <option value="status">Status</option>
              <option value="iv1">iv1</option>
              <option value="iv2">iv2</option>
            </select>
            <button
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
            </button>
          </div>
          {rows.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No participants match the current filters.
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <ParticipantCard
                  key={row.prolific_id}
                  row={row}
                  onStageClick={setSelectedStage}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <VerdictModal
        stage={selectedStage}
        onClose={() => setSelectedStage(null)}
      />
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────
export default function Admin() {
  const [password, setPassword] = useState(null);
  const [data, setData] = useState([]);

  if (!password)
    return (
      <LoginScreen
        onLogin={(pwd, d) => {
          setPassword(pwd);
          setData(d);
        }}
      />
    );
  return <Dashboard password={password} initialData={data} />;
}
