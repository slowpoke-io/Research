import "dotenv/config";
import express from "express";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";

// ─────────────────────────────────────────
// Supabase Client
// ─────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// ─────────────────────────────────────────
// Pipeline Config
// ─────────────────────────────────────────
const PIPELINE = {
  code: "study_v1",
  assign: {
    iv1: { mode: "balanced", values: ["independent", "interdependent"] },
    iv2: { mode: "random", values: ["A", "B", "C"] },
  },
  stages: [
    {
      id: "stage_1",
      active: true,
      variant: {
        queryKey: "stage1Task",
        mode: "balanced",
        value: ["pronoun", "scramble"],
        stratifyBy: { column: "iv1" }, // balance within each iv1 value
      },
      validator: {
        pronoun: "stage1_pronoun_f1",
        scramble: "stage1_scramble_75",
      },
      ui: {
        pronoun: { screen: "pronoun_selector" },
        scramble: { screen: "scramble_sentence" },
      },
      params: {},
    },
    {
      id: "stage_2",
      active: true,
      variant: {
        mode: "balanced",
        value: ["inter_first", "ind_first"],
        stratifyBy: { stageVariant: "stage_1" }, // balance within each stage_1 variant
      },
      validator: {
        inter_first: "stage2_likert_complete_both",
        ind_first: "stage2_likert_complete_both",
      },
      ui: {
        inter_first: { screen: "scs_scale", order: "inter_first" },
        ind_first: { screen: "scs_scale", order: "ind_first" },
      },
      params: {},
    },
  ],
};

const STAGES = PIPELINE.stages.filter((s) => s.active !== false);

// ─────────────────────────────────────────
// Prolific Redirect URLs
// ─────────────────────────────────────────
const PROLIFIC_COMPLETE_URL =
  "https://app.prolific.com/submissions/complete?cc=C6SKG6JG";
const PROLIFIC_FAIL_URL =
  "https://app.prolific.com/submissions/complete?cc=C83U7PTM";
const PROLIFIC_NOCONSENT_URL =
  "https://app.prolific.com/submissions/complete?cc=C17N0WEM";

// ─────────────────────────────────────────
// Static Data
// ─────────────────────────────────────────
const SCRAMBLE_ANSWER_KEY = {
  independent: [
    { id: 1, leftOver: "dissimilar" },
    { id: 2, leftOver: "different" },
    { id: 3, leftOver: "mine" },
    { id: 4, leftOver: "disconnect" },
    { id: 5, leftOver: "me" },
    { id: 6, leftOver: "life" },
    { id: 7, leftOver: "individual" },
    { id: 8, leftOver: "solitary" },
    { id: 9, leftOver: "independence" },
    { id: 10, leftOver: "difference" },
    { id: 11, leftOver: "unusually" },
    { id: 12, leftOver: "self-contained" },
    { id: 13, leftOver: "unique" },
    { id: 14, leftOver: "very" },
    { id: 15, leftOver: "good" },
    { id: 16, leftOver: "autonomy" },
    { id: 17, leftOver: "separate" },
    { id: 18, leftOver: "alone" },
    { id: 19, leftOver: "autonomous" },
    { id: 20, leftOver: "distinct" },
  ],
  interdependent: [
    { id: 1, leftOver: "together" },
    { id: 2, leftOver: "company" },
    { id: 3, leftOver: "group" },
    { id: 4, leftOver: "partnership" },
    { id: 5, leftOver: "social" },
    { id: 6, leftOver: "life" },
    { id: 7, leftOver: "connected" },
    { id: 8, leftOver: "membership" },
    { id: 9, leftOver: "harmony" },
    { id: 10, leftOver: "joint" },
    { id: 11, leftOver: "ours" },
    { id: 12, leftOver: "us" },
    { id: 13, leftOver: "community" },
    { id: 14, leftOver: "very" },
    { id: 15, leftOver: "good" },
    { id: 16, leftOver: "our" },
    { id: 17, leftOver: "harmony" },
    { id: 18, leftOver: "interdependence" },
    { id: 19, leftOver: "integrated" },
    { id: 20, leftOver: "us" },
  ],
};

const MATERIALS = {
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
};

const PRONOUNS = {
  independent: new Set(["i", "me", "my", "mine"]),
  interdependent: new Set(["we", "our", "us", "ours"]),
};

// ─────────────────────────────────────────
// Utils
// ─────────────────────────────────────────
const nowIso = () => new Date().toISOString();
const norm = (x) =>
  String(x ?? "")
    .trim()
    .toLowerCase();
const rnd = (arr) => arr[crypto.randomInt(0, arr.length)];

function newId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `anon_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
}

function token(s) {
  return String(s ?? "")
    .toLowerCase()
    .trim()
    .replace(/^[^a-z']+|[^a-z']+$/g, "");
}

function tokens(text) {
  return String(text ?? "")
    .split(/\s+/)
    .map(token)
    .filter(Boolean);
}

function stageAt(i) {
  return STAGES[i] ?? null;
}

async function assignIV() {
  const pick = async (cfg) => {
    if (cfg.mode === "balanced") {
      // Count non-failed progress rows per value
      const { data, error } = await supabase
        .from("progress")
        .select("iv1")
        .eq("pipeline_code", PIPELINE.code)
        .eq("failed", false);
      if (error) throw error;

      const count = Object.fromEntries(cfg.values.map((v) => [v, 0]));
      for (const row of data ?? []) {
        if (count[row.iv1] !== undefined) count[row.iv1]++;
      }
      let min = Infinity;
      for (const v of cfg.values) min = Math.min(min, count[v]);
      const least = cfg.values.filter((v) => count[v] === min);
      return rnd(least);
    }
    // default: random
    return rnd(cfg.values);
  };

  const [iv1, iv2] = await Promise.all([
    pick(PIPELINE.assign.iv1),
    pick(PIPELINE.assign.iv2),
  ]);
  return { iv1, iv2 };
}

// ─────────────────────────────────────────
// Cleanup abandoned sessions (called on every /api/init)
// In-progress sessions with updated_at older than ABANDON_TIMEOUT_MINUTES
// are marked failed so they stop occupying balance slots.
// ─────────────────────────────────────────
const ABANDON_TIMEOUT_MINUTES = 30;

async function cleanupAbandoned() {
  const cutoff = new Date(
    Date.now() - ABANDON_TIMEOUT_MINUTES * 60 * 1000,
  ).toISOString();

  const { error } = await supabase
    .from("progress")
    .update({
      failed: true,
      failed_reason: {
        reason: "timeout",
        cutoff_minutes: ABANDON_TIMEOUT_MINUTES,
      },
      updated_at: nowIso(),
    })
    .eq("pipeline_code", PIPELINE.code)
    .eq("completed", false)
    .eq("failed", false)
    .lt("updated_at", cutoff);

  if (error) console.error("cleanupAbandoned error:", error.message);
}

// ─────────────────────────────────────────
// Balanced Variant Picker
//
// Queries progress table directly — no join to submissions needed.
// Counts all rows where failed=false (i.e. completed + genuinely in-progress).
// Abandoned sessions are cleaned up before this runs, so failed=false
// reliably reflects only active participants.
// ─────────────────────────────────────────
async function balancedPick(stageId, variants, stratifyBy = null) {
  // stratifyBy supports two forms:
  //   { column: "iv1", value: "independent" }     — filter by a direct progress column
  //   { stageVariant: "stage_1", value: "pronoun" } — filter by a stage_variants JSON key
  const { data, error } = await supabase
    .from("progress")
    .select("stage_variants, iv1, iv2")
    .eq("pipeline_code", PIPELINE.code)
    .eq("failed", false);

  if (error) throw error;

  const count = Object.fromEntries(variants.map((v) => [v, 0]));
  for (const row of data ?? []) {
    if (stratifyBy) {
      const actual = stratifyBy.column
        ? row[stratifyBy.column] // direct column (e.g. iv1)
        : row.stage_variants?.[stratifyBy.stageVariant]; // stage_variants JSON key
      if (actual !== stratifyBy.value) continue;
    }
    const v = row.stage_variants?.[stageId];
    if (v && count[v] !== undefined) count[v]++;
  }

  let min = Infinity;
  for (const v of variants) min = Math.min(min, count[v]);

  const least = variants.filter((v) => count[v] === min);
  return rnd(least);
}

// ─────────────────────────────────────────
// Precompute Pronoun Ground Truth
// ─────────────────────────────────────────
const PRONOUN_TRUTH = (() => {
  const makeCounts = (arr) => {
    const m = new Map();
    for (const x of arr) {
      const k = token(x);
      if (!k) continue;
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  };

  const out = { independent: new Map(), interdependent: new Map() };

  for (const iv1 of ["independent", "interdependent"]) {
    const set = PRONOUNS[iv1];
    for (const m of MATERIALS[iv1]) {
      const truthList = tokens(m.text).filter((t) => set.has(t));
      out[iv1].set(m.id, {
        truthCounts: makeCounts(truthList),
        truthTotal: truthList.length,
      });
    }
  }

  return out;
})();

// ─────────────────────────────────────────
// Validators
// ─────────────────────────────────────────
function stage1_pronoun_f1(ctx, answers) {
  const iv1 = ctx.iv1;
  const mats = MATERIALS[iv1];
  if (!PRONOUN_TRUTH[iv1] || !Array.isArray(mats) || mats.length !== 3) {
    throw new Error("pronoun config missing");
  }

  const items = answers?.pronounAnswers;
  if (!Array.isArray(items) || items.length !== 3) {
    throw new Error("pronounAnswers must be length 3");
  }

  const countMap = (arr) => {
    const m = new Map();
    for (const x of arr) {
      const k = token(x);
      if (!k) continue;
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  };

  const threshold = 0.75;

  const perItem = items.map((it) => {
    const completed = it.completed === true;
    const truth = PRONOUN_TRUTH[iv1].get(it.id);
    if (!truth) {
      return {
        id: it.id ?? null,
        completed,
        passed: false,
        reason: "id not found",
      };
    }

    const selectedRaw = Array.isArray(it.selectedWords) ? it.selectedWords : [];
    const selectedList = selectedRaw.map(token).filter(Boolean);
    const selCounts = countMap(selectedList);

    let tp = 0;
    for (const [w, cSel] of selCounts.entries()) {
      const cTruth = truth.truthCounts.get(w) ?? 0;
      tp += Math.min(cSel, cTruth);
    }

    const totalSel = selectedList.length;
    const totalTruth = truth.truthTotal;
    const fp = totalSel - tp;
    const fn = totalTruth - tp;
    const precision = totalSel === 0 ? 0 : tp / totalSel;
    const recall = totalTruth === 0 ? 0 : tp / totalTruth;
    const f1 =
      precision + recall === 0
        ? 0
        : (2 * precision * recall) / (precision + recall);
    const round3 = (n) => Math.round(n * 1000) / 1000;

    return {
      id: it.id,
      completed,
      expectedCount: totalTruth,
      selectedCount: totalSel,
      tp,
      fp,
      fn,
      precision: round3(precision),
      recall: round3(recall),
      f1: round3(f1),
      threshold,
      passed: completed && f1 >= threshold,
    };
  });

  return {
    passed: perItem.every((x) => x.passed),
    verdict: { kind: "stage1_pronoun_f1", iv1, perItem },
  };
}

function stage1_scramble_75(ctx, answers) {
  const key = SCRAMBLE_ANSWER_KEY[ctx.iv1];
  if (!key) throw new Error("scramble key missing");

  const arr = answers?.scrambleAnswers;
  if (!Array.isArray(arr) || arr.length === 0)
    throw new Error("scrambleAnswers must be non-empty array");

  const map = new Map(key.map((x) => [x.id, x.leftOver]));
  let correct = 0;
  for (const ua of arr) {
    const ca = map.get(ua.id);
    const ok =
      typeof ca === "string" &&
      String(ua.answer ?? "")
        .trim()
        .toLowerCase() === ca.trim().toLowerCase();
    if (ok) correct++;
  }

  const total = arr.length;
  const accuracy =
    total === 0 ? 0 : Math.round((correct / total) * 10000) / 100;
  const threshold = 75;
  return {
    passed: accuracy >= threshold,
    verdict: {
      kind: "stage1_scramble_75",
      iv1: ctx.iv1,
      summary: { total, correct, accuracy, threshold },
    },
  };
}

function stage2_likert_complete_both(ctx, answers) {
  // ── Attention check config ──────────────────────────────────
  // mode: "any"  → fail if ANY attention check is wrong
  //       "both" → fail only if BOTH attention checks are wrong
  const ATTN_CHECK_MODE = "any";

  const ATTN_CHECKS = [
    { id: "SCS_IND_ATTN", correctResponse: 6 }, // "Please select Agree"
    { id: "SCS_INTER_ATTN", correctResponse: 2 }, // "Please select Disagree"
  ];
  const ATTN_IDS = new Set(ATTN_CHECKS.map((a) => a.id));
  // ───────────────────────────────────────────────────────────

  const items = answers?.likertAnswers;
  if (!Array.isArray(items)) throw new Error("likertAnswers must be an array");

  const expectedInd = Array.from({ length: 9 }, (_, i) => `SCS_IND_${i + 1}`);
  const expectedInter = Array.from(
    { length: 13 },
    (_, i) => `SCS_INTER_${i + 1}`,
  );
  const expectedAll = [
    ...expectedInd,
    ...expectedInter,
    ...ATTN_CHECKS.map((a) => a.id),
  ];
  const expectedSet = new Set(expectedAll);

  const invalid = items.filter(
    (it) =>
      !it?.id ||
      !expectedSet.has(it.id) ||
      !Number.isInteger(it.response) ||
      it.response < 1 ||
      it.response > 7,
  );
  if (invalid.length > 0) {
    return {
      passed: false,
      verdict: {
        kind: "stage2_likert_complete_both",
        reason: "Invalid items detected",
        invalidCount: invalid.length,
        invalidItems: invalid.slice(0, 10).map((x) => x.id ?? null),
      },
    };
  }

  const gotIds = new Set(items.map((x) => x.id));
  const missing = expectedAll.filter((id) => !gotIds.has(id));
  if (missing.length > 0 || gotIds.size !== expectedAll.length) {
    return {
      passed: false,
      verdict: {
        kind: "stage2_likert_complete_both",
        reason: "Missing or duplicate question IDs",
        expectedCount: expectedAll.length,
        receivedUniqueCount: gotIds.size,
        missing: missing.slice(0, 10),
      },
    };
  }

  const byId = new Map(items.map((x) => [x.id, x.response]));

  // ── Attention check validation ──────────────────────────────
  const attnResults = ATTN_CHECKS.map((a) => ({
    id: a.id,
    expected: a.correctResponse,
    actual: byId.get(a.id),
    passed: byId.get(a.id) === a.correctResponse,
  }));

  const attnFailed = attnResults.filter((r) => !r.passed);
  const attnFail =
    ATTN_CHECK_MODE === "any"
      ? attnFailed.length > 0 // any wrong → fail
      : attnFailed.length === ATTN_CHECKS.length; // all wrong → fail

  if (attnFail) {
    return {
      passed: false,
      verdict: {
        kind: "stage2_likert_complete_both",
        reason: "Failed attention check",
        attn_check_mode: ATTN_CHECK_MODE,
        attn_results: attnResults,
      },
    };
  }
  // ───────────────────────────────────────────────────────────

  // ── Mean calculation (exclude attention check items) ────────
  const mean = (ids) =>
    ids.reduce((acc, id) => acc + (byId.get(id) ?? 0), 0) / ids.length;
  const round2 = (n) => Math.round(n * 100) / 100;

  const meanIndependent = mean(expectedInd); // SCS_IND_1..9 only
  const meanInterdependent = mean(expectedInter); // SCS_INTER_1..13 only
  // ───────────────────────────────────────────────────────────

  const iv1 = ctx?.iv1;
  let manipulationSuccess = null;
  if (iv1 === "independent")
    manipulationSuccess = meanIndependent > meanInterdependent;
  else if (iv1 === "interdependent")
    manipulationSuccess = meanInterdependent > meanIndependent;

  return {
    passed: true,
    verdict: {
      kind: "stage2_likert_complete_both",
      mean_independent: round2(meanIndependent),
      mean_interdependent: round2(meanInterdependent),
      manipulation_success: manipulationSuccess,
    },
  };
}

function attention_checks(ctx, answers, params) {
  const checks = params?.checks ?? [];
  if (!Array.isArray(checks) || checks.length === 0)
    throw new Error("checks missing");

  const results = checks.map((c) => {
    const actual = answers?.[c.key];
    const ok =
      actual !== undefined &&
      JSON.stringify(actual) === JSON.stringify(c.expected);
    return {
      key: c.key,
      expected: c.expected,
      actual: actual ?? null,
      isCorrect: ok,
    };
  });

  return {
    passed: results.every((r) => r.isCorrect),
    verdict: { kind: "attention_checks", results },
  };
}

const V = {
  stage1_pronoun_f1,
  stage1_scramble_75,
  attention_checks,
  stage2_likert_complete_both,
};

// ─────────────────────────────────────────
// Shared Helpers (DB operations)
// ─────────────────────────────────────────

// 純計算，不碰 DB
async function pickVariant(stage, query = {}, stratifyBy = null) {
  const cfg = stage.variant;
  const all = cfg.value;
  let variantId = null;

  if (cfg.queryKey) {
    const q = norm(query?.[cfg.queryKey]);
    if (q && all.map(norm).includes(q))
      variantId = all.find((v) => norm(v) === q);
  }

  if (!variantId) {
    if (cfg.mode === "random") variantId = rnd(all);
    else if (cfg.mode === "balanced")
      variantId = await balancedPick(stage.id, all, stratifyBy);
    else throw new Error(`Unknown variant mode: ${cfg.mode}`);
  }

  return variantId;
}

// init 時一次鎖定所有 stage 的 variant，寫入 DB
async function resolveAllVariants(
  prolificId,
  existingVariants = {},
  query = {},
  prog = {},
) {
  const stage_variants = { ...existingVariants };

  for (const stage of STAGES) {
    if (stage_variants[stage.id]) continue; // 已鎖定，跳過

    // Read stratifyBy from stage variant config
    // Two config forms supported:
    //   { column: "iv1" }        → stratify by a direct progress column (value from prog)
    //   { stageVariant: "stage_1" } → stratify by an already-locked stage variant
    const stratifyCfg = stage.variant?.stratifyBy ?? null;
    let stratifyBy = null;
    if (stratifyCfg) {
      if (stratifyCfg.column) {
        // value comes from the current participant's progress record
        stratifyBy = {
          column: stratifyCfg.column,
          value: prog[stratifyCfg.column],
        };
      } else if (stratifyCfg.stageVariant) {
        stratifyBy = {
          stageVariant: stratifyCfg.stageVariant,
          value: stage_variants[stratifyCfg.stageVariant],
        };
      }
    }

    stage_variants[stage.id] = await pickVariant(stage, query, stratifyBy);
  }

  const up = await supabase
    .from("progress")
    .update({ stage_variants, updated_at: nowIso() })
    .eq("pipeline_code", PIPELINE.code)
    .eq("prolific_id", prolificId);
  if (up.error) throw up.error;

  return stage_variants;
}

function buildStageResponse(prog, stage, variantId) {
  return {
    ok: true,
    pipeline: PIPELINE.code,
    prolificId: prog.prolific_id,
    iv1: prog.iv1,
    iv2: prog.iv2,
    stage: {
      id: stage.id,
      variant: variantId,
      ui: stage.ui?.[variantId] ?? null,
    },
  };
}

// ─────────────────────────────────────────
// Router: /api
// ─────────────────────────────────────────
const apiRouter = express.Router();

// POST /api/init
apiRouter.post("/init", async (req, res) => {
  try {
    // 清掉超時的 in-progress session，確保 balancedPick 計數準確
    await cleanupAbandoned();

    const prolificId = req.body?.prolificId;
    if (!prolificId)
      return res
        .status(400)
        .json({ ok: false, message: "prolificId required" });

    await supabase.from("participants").upsert({ prolific_id: prolificId });

    let { data: prog, error } = await supabase
      .from("progress")
      .select("*")
      .eq("pipeline_code", PIPELINE.code)
      .eq("prolific_id", prolificId)
      .maybeSingle();
    if (error) throw error;

    if (!prog) {
      const { iv1, iv2 } = await assignIV();
      const ins = await supabase.from("progress").insert({
        pipeline_code: PIPELINE.code,
        prolific_id: prolificId,
        iv1,
        iv2,
        current_stage_index: 0,
        completed: false,
        failed: false,
        stage_variants: {},
        started_at: nowIso(),
        updated_at: nowIso(),
      });
      if (ins.error) throw ins.error;

      const again = await supabase
        .from("progress")
        .select("*")
        .eq("pipeline_code", PIPELINE.code)
        .eq("prolific_id", prolificId)
        .single();
      if (again.error) throw again.error;
      prog = again.data;
    }

    if (prog.completed)
      return res.json({
        ok: true,
        prolificId,
        completed: true,
        redirectUrl: PROLIFIC_COMPLETE_URL,
      });
    if (prog.failed)
      return res.json({
        ok: true,
        prolificId,
        failed: true,
        failed_stage_id: prog.failed_stage_id,
        failed_reason: prog.failed_reason,
        redirectUrl: PROLIFIC_FAIL_URL,
      });

    // 一次鎖定所有 stage variant（已鎖定的不會被覆蓋）
    const stage_variants = await resolveAllVariants(
      prolificId,
      prog.stage_variants,
      req.query,
      prog,
    );
    prog.stage_variants = stage_variants;

    const stage = stageAt(prog.current_stage_index);
    if (!stage) {
      const up = await supabase
        .from("progress")
        .update({ completed: true, updated_at: nowIso() })
        .eq("pipeline_code", PIPELINE.code)
        .eq("prolific_id", prolificId);
      if (up.error) throw up.error;
      return res.json({
        ok: true,
        prolificId,
        completed: true,
        redirectUrl: PROLIFIC_COMPLETE_URL,
      });
    }

    const variantId = stage_variants[stage.id];
    return res.json(buildStageResponse(prog, stage, variantId));
  } catch (e) {
    return res.status(500).json({ ok: false, message: e.message });
  }
});

// GET /api/current-stage
apiRouter.get("/current-stage", async (req, res) => {
  try {
    const prolificId = String(req.query?.prolificId ?? "");
    if (!prolificId)
      return res
        .status(400)
        .json({ ok: false, message: "prolificId required" });

    const got = await supabase
      .from("progress")
      .select("*")
      .eq("pipeline_code", PIPELINE.code)
      .eq("prolific_id", prolificId)
      .single();
    if (got.error)
      return res
        .status(404)
        .json({ ok: false, message: "call /api/init first" });

    const prog = got.data;
    if (prog.completed)
      return res.json({ ok: true, prolificId, completed: true });
    if (prog.failed)
      return res.json({
        ok: true,
        prolificId,
        failed: true,
        failed_stage_id: prog.failed_stage_id,
        failed_reason: prog.failed_reason,
        redirectUrl: PROLIFIC_FAIL_URL,
      });

    const stage = stageAt(prog.current_stage_index);
    if (!stage) return res.json({ ok: true, prolificId, completed: true });

    const variantId = prog.stage_variants?.[stage.id];
    if (!variantId)
      return res.status(500).json({
        ok: false,
        message: "variant not initialized, call /api/init first",
      });

    return res.json(buildStageResponse(prog, stage, variantId));
  } catch (e) {
    return res.status(500).json({ ok: false, message: e.message });
  }
});

// POST /api/submit
apiRouter.post("/submit", async (req, res) => {
  try {
    const { prolificId, stageId, answers, meta } = req.body ?? {};
    const clientStageSeconds = Number(meta?.stageSeconds);

    if (!prolificId || !stageId || answers === undefined) {
      return res
        .status(400)
        .json({ ok: false, message: "prolificId, stageId, answers required" });
    }

    const got = await supabase
      .from("progress")
      .select("*")
      .eq("pipeline_code", PIPELINE.code)
      .eq("prolific_id", prolificId)
      .single();
    if (got.error)
      return res
        .status(404)
        .json({ ok: false, message: "call /api/init first" });

    const prog = got.data;
    if (prog.completed)
      return res.status(409).json({ ok: false, message: "already completed" });
    if (prog.failed)
      return res
        .status(403)
        .json({ ok: false, message: "locked out (failed)" });

    const stage = stageAt(prog.current_stage_index);
    if (!stage)
      return res.status(409).json({ ok: false, message: "already completed" });
    if (stage.id !== stageId)
      return res.status(403).json({ ok: false, message: "stage locked" });

    // Duplicate submit guard
    const exist = await supabase
      .from("submissions")
      .select("id")
      .eq("pipeline_code", PIPELINE.code)
      .eq("stage_id", stageId)
      .eq("prolific_id", prolificId)
      .maybeSingle();
    if (exist.error) throw exist.error;
    if (exist.data)
      return res
        .status(409)
        .json({ ok: false, message: "already submitted this stage" });

    const variantId = prog.stage_variants?.[stage.id];
    if (!variantId)
      return res.status(500).json({
        ok: false,
        message: "variant not initialized, call /api/init first",
      });

    // Validate
    const vName = stage.validator?.[variantId];
    if (!vName)
      throw new Error(`validator not configured for ${stage.id}/${variantId}`);
    const fn = V[vName];
    if (!fn) throw new Error(`validator not found: ${vName}`);

    const params = stage.params?.[variantId];
    const ctx = { iv1: prog.iv1, iv2: prog.iv2 };
    const { passed, verdict } = fn(ctx, answers, params);

    // Timing
    const startedAt = prog.started_at ? new Date(prog.started_at) : null;
    const totalSeconds = startedAt
      ? Math.max(0, Math.round((Date.now() - startedAt.getTime()) / 1000))
      : null;
    const stageSeconds = Number.isFinite(clientStageSeconds)
      ? Math.max(0, Math.min(86400, Math.round(clientStageSeconds)))
      : null;

    // Timeout check — total session exceeded ABANDON_TIMEOUT_MINUTES
    const timeoutSeconds = ABANDON_TIMEOUT_MINUTES * 60;
    const timedOut = totalSeconds != null && totalSeconds > timeoutSeconds;

    // Insert submission record (always, to preserve data even on timeout)
    const ins = await supabase.from("submissions").insert({
      pipeline_code: PIPELINE.code,
      stage_id: stageId,
      variant_id: variantId,
      prolific_id: prolificId,
      answers,
      passed,
      verdict,
      stage_seconds: stageSeconds,
    });
    if (ins.error) throw ins.error;

    // Handle timeout — total session exceeded limit
    if (timedOut) {
      const up = await supabase
        .from("progress")
        .update({
          failed: true,
          failed_reason: {
            reason: "timeout",
            cutoff_minutes: ABANDON_TIMEOUT_MINUTES,
            total_seconds: totalSeconds,
          },
          updated_at: nowIso(),
        })
        .eq("pipeline_code", PIPELINE.code)
        .eq("prolific_id", prolificId);
      if (up.error) throw up.error;
      return res.status(403).json({
        ok: false,
        message: "locked out (failed)",
      });
    }

    // Handle fail
    if (!passed) {
      const up = await supabase
        .from("progress")
        .update({
          failed: true,
          failed_stage_id: stageId,
          failed_reason: verdict,
          updated_at: nowIso(),
        })
        .eq("pipeline_code", PIPELINE.code)
        .eq("prolific_id", prolificId);
      if (up.error) throw up.error;
      return res.json({
        ok: true,
        passed: false,
        lockedOut: true,
        verdict,
        redirectUrl: PROLIFIC_FAIL_URL,
      });
    }

    // Advance stage or complete
    const nextIndex = prog.current_stage_index + 1;
    const done = nextIndex >= STAGES.length;
    const updatePayload = {
      current_stage_index: done ? prog.current_stage_index : nextIndex,
      completed: done,
      updated_at: nowIso(),
      ...(done && totalSeconds != null ? { total_seconds: totalSeconds } : {}),
    };

    const up = await supabase
      .from("progress")
      .update(updatePayload)
      .eq("pipeline_code", PIPELINE.code)
      .eq("prolific_id", prolificId);
    if (up.error) throw up.error;

    return res.json({
      ok: true,
      passed: true,
      completed: done,
      nextStageId: done ? null : STAGES[nextIndex].id,
      redirectUrl: done ? PROLIFIC_COMPLETE_URL : null,
      verdict,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, message: e.message });
  }
});

// GET /api/decline-url  — 給 consent 頁面拒絕時導轉用
apiRouter.get("/decline-url", (_, res) => {
  res.json({ ok: true, redirectUrl: PROLIFIC_NOCONSENT_URL });
});

// ─────────────────────────────────────────
// Router: /admin
// ─────────────────────────────────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "changeme";

function requireAdminPassword(req, res, next) {
  const pwd = req.headers["x-admin-password"] ?? req.query?.pwd;
  if (pwd !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }
  next();
}

const adminRouter = express.Router();

// GET /admin/api/summary?pipeline=study_v1
adminRouter.get("/api/summary", requireAdminPassword, async (req, res) => {
  try {
    const pipeline = req.query?.pipeline ?? PIPELINE.code;
    const { data, error } = await supabase
      .from("admin_summary")
      .select("*")
      .eq("pipeline_code", pipeline)
      .order("started_at", { ascending: false });

    if (error) throw error;
    return res.json({ ok: true, data });
  } catch (e) {
    return res.status(500).json({ ok: false, message: e.message });
  }
});

// ─────────────────────────────────────────
// App Setup
// ─────────────────────────────────────────
const app = express();
app.use(express.json());
app.use("/api", apiRouter);
app.use("/api/admin", adminRouter); // admin API 移到 /api/admin，不佔 /admin 路徑
app.get("/health", (_, res) => res.json({ ok: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, "..", "client", "dist");

app.use(express.static(clientDistPath));
app.get(/^(?!\/api).*/, (_req, res) =>
  res.sendFile(path.join(clientDistPath, "index.html")),
);

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => console.log(`Server running on :${PORT}`));
