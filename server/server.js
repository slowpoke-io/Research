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
    iv1: ["independent", "interdependent"],
    iv2: ["A", "B", "C"],
  },
  stages: [
    {
      id: "stage_1",
      active: true,
      variant: {
        queryKey: "stage1Task",
        mode: "balanced",
        value: ["pronoun", "scramble"],
      },
      validator: {
        pronoun: "stage1_pronoun_f1",
        scramble: "stage1_scramble_50",
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
        queryKey: "stage2Task",
        mode: "balanced",
        value: ["inter_first", "ind_first"],
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
      materialId: "material1_independent",
      text: "On Friday, my weekend looks free, so I plan a short trip for myself. After I check my budget, I choose my own route and pick a place that feels unique and different to me. To keep my autonomy, I leave my schedule loose and keep my options separate and apart. At the map, I compare routes and choose the route that fits my pace. If a new idea appears, I diverge and adjust quickly. With my bag ready, I head out alone and enjoy my solitude. By the end, I feel calm and refreshed, and I like the sense of freedom in my choices.",
    },
    {
      materialId: "material2_independent",
      text: "Before I start the assignment, my notes spread across my desk, and my outline stays open. After a quick scan, I choose my own angle and keep my argument distinct and different. To stay free to revise, I build a simple checklist and write my introduction in my own words. As my draft grows, I separate each section and refine my transitions until my logic feels clear to me. When a sentence sounds weak, I rewrite the sentence and stay assertive about my choices. Near the end, I check my citations and my formatting, then I submit my final file. The assignment earns a high score, and my independent approach supports my result.",
    },
    {
      materialId: "material3_independent",
      text: "On Saturday, my short trip begins with a quiet train ride, and I keep my bag close. A new neighborhood feels different from my usual streets, so I follow my curiosity and choose my own pace. At a small shop, my attention moves to a unique local snack, and I decide to try my favorite flavor. A narrow side road looks less crowded, so I turn apart from the main path and enjoy being alone. The moment brings a sense of freedom, and my autonomy feels natural. Later, I sit at a corner table and write a few notes in my notebook. By the end, my solitude feels calm, and I like how my choices stay mine.",
    },
  ],
  interdependent: [
    {
      materialId: "material1_interdependent",
      text: "On Friday, our weekend looks open, so we plan a short trip together. After we check our budget, we choose our shared route and pick a place that feels similar for us. To stay connected, we keep our schedule flexible and share our options in partnership. At the map, we compare routes and choose the route that fits our group pace. If a new idea appears, we agree and adjust quickly, then we keep our plan cohesive. With our bags ready, we head out together and enjoy our closeness. By the end, we feel warm and relaxed, and we like the feeling of connection in our time together.",
    },
    {
      materialId: "material2_interdependent",
      text: "Before we start the assignment, our notes spread across the desk, and our outline stays open. After a quick scan, we choose our shared angle and keep our argument similar across our sections. To work together, we build a simple checklist and write our introduction in our shared voice. As our draft grows, we connect each section and revise with overlap across our edits. When a sentence sounds weak, we rewrite the sentence and stay cooperative and agreeable. Near the end, we check our citations and our formatting, then we submit our final file. The assignment earns a high score, and our interdependent teamwork supports our result.",
    },
    {
      materialId: "material3_interdependent",
      text: "On Saturday, our short trip begins with a quiet train ride, and we keep our bags close. A new neighborhood feels different from our usual streets, so we stay together and choose our shared pace. At a small shop, our attention moves to a local snack, and we share our favorite flavor. A narrow side road looks less crowded, so we turn together and keep our group close. The moment brings a sense of connection, and our partnership feels natural. Later, we sit at a corner table and write a few notes in our notebook. By the end, our closeness feels calm, and we like our time together.",
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

function assignIV() {
  return {
    iv1: rnd(PIPELINE.assign.iv1),
    iv2: rnd(PIPELINE.assign.iv2),
  };
}

// ─────────────────────────────────────────
// Balanced Variant Picker
// ─────────────────────────────────────────
async function balancedPick(stageId, variants) {
  const { data, error } = await supabase
    .from("submissions")
    .select("variant_id")
    .eq("pipeline_code", PIPELINE.code)
    .eq("stage_id", stageId);

  if (error) throw error;

  const count = Object.fromEntries(variants.map((v) => [v, 0]));
  for (const row of data ?? []) {
    if (count[row.variant_id] !== undefined) count[row.variant_id] += 1;
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
      out[iv1].set(m.materialId, {
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

  const threshold = 0;

  const perItem = items.map((it) => {
    const completed = it.completed === true;
    const truth = PRONOUN_TRUTH[iv1].get(it.materialId);
    if (!truth) {
      return {
        materialId: it.materialId ?? null,
        completed,
        passed: false,
        reason: "materialId not found",
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
      materialId: it.materialId,
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

function stage1_scramble_50(ctx, answers) {
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

  return {
    passed: accuracy >= 0,
    verdict: {
      kind: "stage1_scramble_50",
      iv1: ctx.iv1,
      summary: { total, correct, accuracy, threshold: 50 },
    },
  };
}

function stage2_likert_complete_both(ctx, answers) {
  const items = answers?.likertAnswers;
  if (!Array.isArray(items)) throw new Error("likertAnswers must be an array");

  const expectedInd = Array.from({ length: 9 }, (_, i) => `SCS_IND_${i + 1}`);
  const expectedInter = Array.from(
    { length: 13 },
    (_, i) => `SCS_INTER_${i + 1}`,
  );
  const expectedAll = [...expectedInd, ...expectedInter];
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
  const mean = (ids) =>
    ids.reduce((acc, id) => acc + (byId.get(id) ?? 0), 0) / ids.length;
  const round2 = (n) => Math.round(n * 100) / 100;

  const meanIndependent = mean(expectedInd);
  const meanInterdependent = mean(expectedInter);

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
  stage1_scramble_50,
  attention_checks,
  stage2_likert_complete_both,
};

// ─────────────────────────────────────────
// Shared Helpers (DB operations)
// ─────────────────────────────────────────

// 純計算，不碰 DB
async function pickVariant(stage, query = {}) {
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
      variantId = await balancedPick(stage.id, all);
    else throw new Error(`Unknown variant mode: ${cfg.mode}`);
  }

  return variantId;
}

// init 時一次鎖定所有 stage 的 variant，寫入 DB
async function resolveAllVariants(
  prolificId,
  existingVariants = {},
  query = {},
) {
  const stage_variants = { ...existingVariants };

  for (const stage of STAGES) {
    if (stage_variants[stage.id]) continue; // 已鎖定，跳過
    stage_variants[stage.id] = await pickVariant(stage, query);
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
    let prolificId = req.body?.prolificId;
    if (!prolificId) prolificId = newId();

    await supabase.from("participants").upsert({ prolific_id: prolificId });

    let { data: prog, error } = await supabase
      .from("progress")
      .select("*")
      .eq("pipeline_code", PIPELINE.code)
      .eq("prolific_id", prolificId)
      .maybeSingle();
    if (error) throw error;

    if (!prog) {
      const { iv1, iv2 } = assignIV(req.query);
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
      return res.json({ ok: true, prolificId, completed: true });
    if (prog.failed)
      return res.json({
        ok: true,
        prolificId,
        failed: true,
        failed_stage_id: prog.failed_stage_id,
        failed_reason: prog.failed_reason,
      });

    // 一次鎖定所有 stage variant（已鎖定的不會被覆蓋）
    const stage_variants = await resolveAllVariants(
      prolificId,
      prog.stage_variants,
      req.query,
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
      return res.json({ ok: true, prolificId, completed: true });
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

    // Insert submission record
    const ins = await supabase.from("submissions").insert({
      pipeline_code: PIPELINE.code,
      stage_id: stageId,
      variant_id: variantId,
      prolific_id: prolificId,
      iv1: prog.iv1,
      iv2: prog.iv2,
      answers,
      passed,
      verdict,
      stage_seconds: stageSeconds,
      total_seconds: totalSeconds,
    });
    if (ins.error) throw ins.error;

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
      return res.json({ ok: true, passed: false, lockedOut: true, verdict });
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
      verdict,
    });
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
