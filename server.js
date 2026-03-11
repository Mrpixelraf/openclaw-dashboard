const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3721;
const HOME = process.env.HOME || '/Users/morty';
const OC = path.join(HOME, '.openclaw');

app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });

// ─── Simple TTL cache ────────────────────────────────────────────────────────
const _cache = {};
function cached(key, ttlMs, fn) {
  const now = Date.now();
  if (_cache[key] && now - _cache[key].t < ttlMs) return _cache[key].v;
  const v = fn();
  _cache[key] = { v, t: now };
  return v;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}
function readText(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

// ─── Agents ─────────────────────────────────────────────────────────────────
function getAgentData() {
  const config = readJSON(path.join(OC, 'openclaw.json'));
  if (!config) return [];

  return (config.agents?.list || []).map(agent => {
    const agentDir = path.join(OC, 'agents', agent.id);
    const sessions = readJSON(path.join(agentDir, 'sessions', 'sessions.json')) || {};
    const auth     = readJSON(path.join(agentDir, 'agent', 'auth-profiles.json'));

    const sessionList = Object.values(sessions);
    const lastActivity = sessionList.reduce((max, s) => Math.max(max, s.updatedAt || 0), 0);
    const isActive = lastActivity > 0 && Date.now() - lastActivity < 5 * 60 * 1000;

    const authLastUsed = auth?.usageStats
      ? Math.max(...Object.values(auth.usageStats).map(u => u.lastUsed || 0))
      : 0;
    const authErrorCount = auth?.usageStats
      ? Object.values(auth.usageStats).reduce((sum, u) => sum + (u.errorCount || 0), 0)
      : 0;

    // Workspace — main agent uses ~/.openclaw/workspace; others may share it
    const workspaceDir = agent.workspace || path.join(OC, 'workspace');

    const today = new Date().toISOString().slice(0, 10);

    // Count active sessions (only non-deleted .jsonl files modified in last hour)
    let recentSessions = 0;
    try {
      const sessDir = path.join(agentDir, 'sessions');
      recentSessions = fs.readdirSync(sessDir)
        .filter(f => f.endsWith('.jsonl') && !f.includes('.deleted'))
        .filter(f => {
          try { return Date.now() - fs.statSync(path.join(sessDir, f)).mtimeMs < 60 * 60 * 1000; }
          catch { return false; }
        }).length;
    } catch {}

    return {
      id: agent.id,
      name: agent.identity?.name || agent.id,
      emoji: agent.identity?.emoji || '🤖',
      model: agent.model || config.agents?.defaults?.model,
      lastActivity,
      authLastUsed,
      authErrorCount,
      sessionCount: sessionList.length,
      recentSessions,
      status: isActive ? 'active' : 'idle',
      soul: readText(path.join(workspaceDir, 'SOUL.md')),
      identity: readText(path.join(workspaceDir, 'IDENTITY.md')),
      memory: readText(path.join(workspaceDir, 'MEMORY.md')),
      dailyLog: readText(path.join(workspaceDir, 'memory', 'daily', `${today}.md`)),
    };
  });
}

// ─── Sub-agents ──────────────────────────────────────────────────────────────
function getSubagentData() {
  const data = readJSON(path.join(OC, 'subagents', 'runs.json'));
  if (!data) return { active: [], recent: [] };

  const now = Date.now();
  const runs = Object.values(data.runs || {});
  const active = runs.filter(r => !r.endedAt);
  const recent = runs
    .filter(r => r.endedAt && r.endedAt > now - 48 * 60 * 60 * 1000)
    .sort((a, b) => b.endedAt - a.endedAt)
    .slice(0, 20)
    .map(r => ({
      runId: r.runId,
      label: r.label || '(unlabelled)',
      task: r.task ? r.task.slice(0, 200) : '',
      status: r.outcome?.status || 'unknown',
      endedReason: r.endedReason,
      createdAt: r.createdAt,
      endedAt: r.endedAt,
      durationMs: r.endedAt - r.startedAt,
      model: r.model,
      result: r.frozenResultText ? r.frozenResultText.slice(0, 500) : null,
    }));

  return {
    active: active.map(r => ({
      runId: r.runId,
      label: r.label || '(unlabelled)',
      task: r.task ? r.task.slice(0, 200) : '',
      model: r.model,
      createdAt: r.createdAt,
      startedAt: r.startedAt,
    })),
    recent,
  };
}

// ─── Cron jobs ───────────────────────────────────────────────────────────────
function getCronData() {
  const data = readJSON(path.join(OC, 'cron', 'jobs.json'));
  if (!data) return [];

  const runsDir = path.join(OC, 'cron', 'runs');

  return (data.jobs || []).map(job => {
    let recentRuns = [];
    try {
      const runFile = path.join(runsDir, `${job.id}.jsonl`);
      const lines = fs.readFileSync(runFile, 'utf8').trim().split('\n').filter(Boolean);
      recentRuns = lines.slice(-5).map(l => JSON.parse(l)).reverse();
    } catch {}

    return {
      id: job.id,
      name: job.name,
      enabled: job.enabled,
      schedule: job.schedule,
      agentId: job.agentId,
      sessionTarget: job.sessionTarget,
      nextRunAtMs:       job.state?.nextRunAtMs,
      lastRunAtMs:       job.state?.lastRunAtMs,
      lastStatus:        job.state?.lastStatus,
      lastError:         job.state?.lastError,
      consecutiveErrors: job.state?.consecutiveErrors || 0,
      lastDurationMs:    job.state?.lastDurationMs,
      recentRuns,
    };
  });
}

// ─── Token costs ─────────────────────────────────────────────────────────────
function getTokenCosts() {
  const now = Date.now();
  const todayStart = (() => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); })();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const total  = { cost: 0, tokens: 0, input: 0, output: 0 };
  const today  = { cost: 0, tokens: 0, input: 0, output: 0 };
  const byModel = {};
  const byDay   = {};

  for (const agentId of ['main', 'xiaoxiangsu']) {
    const sessDir = path.join(OC, 'agents', agentId, 'sessions');
    let files;
    try {
      files = fs.readdirSync(sessDir)
        .filter(f => f.endsWith('.jsonl') && !f.includes('.deleted'))
        .filter(f => {
          try { return fs.statSync(path.join(sessDir, f)).mtimeMs > thirtyDaysAgo; }
          catch { return false; }
        });
    } catch { continue; }

    for (const file of files) {
      const filePath = path.join(sessDir, file);
      const isModifiedToday = (() => {
        try { return fs.statSync(filePath).mtimeMs > todayStart; } catch { return false; }
      })();

      let content;
      try { content = fs.readFileSync(filePath, 'utf8'); } catch { continue; }

      for (const line of content.split('\n')) {
        if (!line.trim()) continue;
        try {
          const ev = JSON.parse(line);
          if (ev.role !== 'assistant' || !ev.usage?.cost) continue;

          const cost    = ev.usage.cost.total   || 0;
          const tokens  = ev.usage.totalTokens  || 0;
          const inp     = ev.usage.input        || 0;
          const out     = ev.usage.output       || 0;
          const model   = ev.model              || 'unknown';
          const ts      = ev.timestamp          || (isModifiedToday ? Date.now() : todayStart - 1);

          total.cost   += cost;  total.tokens += tokens;
          total.input  += inp;   total.output += out;

          if (ts >= todayStart) {
            today.cost   += cost;  today.tokens += tokens;
            today.input  += inp;   today.output += out;
          }

          if (!byModel[model]) byModel[model] = { cost: 0, tokens: 0 };
          byModel[model].cost   += cost;
          byModel[model].tokens += tokens;

          const day = new Date(ts).toISOString().slice(0, 10);
          if (!byDay[day]) byDay[day] = { cost: 0, tokens: 0 };
          byDay[day].cost   += cost;
          byDay[day].tokens += tokens;
        } catch {}
      }
    }
  }

  return { total, today, byModel, byDay };
}

// ─── Gateway status ──────────────────────────────────────────────────────────
function getGatewayStatus() {
  try {
    const logPath = path.join(OC, 'logs', 'gateway.log');
    const stat    = fs.statSync(logPath);
    const update  = readJSON(path.join(OC, 'update-check.json'));
    return {
      status:      Date.now() - stat.mtimeMs < 5 * 60 * 1000 ? 'online' : 'stale',
      version:     update?.currentVersion || null,
      logModified: stat.mtimeMs,
      logSize:     stat.size,
    };
  } catch {
    return { status: 'offline', version: null };
  }
}

// ─── Recent log lines ────────────────────────────────────────────────────────
function getRecentLog(n = 200) {
  try {
    const content = fs.readFileSync(path.join(OC, 'logs', 'gateway.log'), 'utf8');
    return content.split('\n').filter(Boolean).slice(-n);
  } catch { return []; }
}

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/api/data', (req, res) => {
  res.json({
    agents:    cached('agents',    15_000, getAgentData),
    subagents: cached('subagents', 10_000, getSubagentData),
    crons:     cached('crons',     15_000, getCronData),
    costs:     cached('costs',    120_000, getTokenCosts),
    gateway:   cached('gateway',   30_000, getGatewayStatus),
    ts: Date.now(),
  });
});

app.get('/api/log', (req, res) => {
  res.json(getRecentLog(300));
});

// SSE: live log tail
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();

  const logPath = path.join(OC, 'logs', 'gateway.log');
  let offset = 0;
  try { offset = fs.statSync(logPath).size; } catch {}

  const timer = setInterval(() => {
    try {
      const size = fs.statSync(logPath).size;
      if (size > offset) {
        const fd  = fs.openSync(logPath, 'r');
        const buf = Buffer.alloc(size - offset);
        fs.readSync(fd, buf, 0, buf.length, offset);
        fs.closeSync(fd);
        offset = size;
        buf.toString('utf8').split('\n').filter(Boolean).forEach(line => {
          res.write(`data: ${JSON.stringify(line)}\n\n`);
        });
      }
    } catch {}
  }, 1500);

  req.on('close', () => clearInterval(timer));
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🦞 OpenClaw Dashboard → http://localhost:${PORT}\n`);
});
