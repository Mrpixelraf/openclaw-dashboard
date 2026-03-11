import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app  = express()
const PORT = 3721
const HOME = process.env.HOME || '/Users/morty'
const OC   = path.join(HOME, '.openclaw')

// In production serve the Vite build; in dev Vite handles the frontend
app.use(express.static(path.join(__dirname, 'dist')))
app.use((req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next() })

// ─── Cache ───────────────────────────────────────────────────────────────────
const _cache = {}
function cached(key, ttlMs, fn) {
  const now = Date.now()
  if (_cache[key] && now - _cache[key].t < ttlMs) return _cache[key].v
  const v = fn()
  _cache[key] = { v, t: now }
  return v
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function readJSON(p)  { try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return null } }
function readText(p)  { try { return fs.readFileSync(p, 'utf8') } catch { return null } }

// ─── Agents ──────────────────────────────────────────────────────────────────
function getAgentData() {
  const config = readJSON(path.join(OC, 'openclaw.json'))
  if (!config) return []

  return (config.agents?.list || []).map(agent => {
    const agentDir   = path.join(OC, 'agents', agent.id)
    const sessions   = readJSON(path.join(agentDir, 'sessions', 'sessions.json')) || {}
    const auth       = readJSON(path.join(agentDir, 'agent', 'auth-profiles.json'))
    const sessionList = Object.values(sessions)
    const lastActivity = sessionList.reduce((max, s) => Math.max(max, s.updatedAt || 0), 0)
    const isActive   = lastActivity > 0 && Date.now() - lastActivity < 5 * 60 * 1000
    const authErrorCount = auth?.usageStats
      ? Object.values(auth.usageStats).reduce((s, u) => s + (u.errorCount || 0), 0) : 0

    const workspaceDir = agent.workspace || path.join(OC, 'workspace')
    const today = new Date().toISOString().slice(0, 10)

    let recentSessions = 0
    try {
      const sessDir = path.join(agentDir, 'sessions')
      recentSessions = fs.readdirSync(sessDir)
        .filter(f => f.endsWith('.jsonl') && !f.includes('.deleted'))
        .filter(f => { try { return Date.now() - fs.statSync(path.join(sessDir, f)).mtimeMs < 3600000 } catch { return false } })
        .length
    } catch {}

    return {
      id: agent.id, name: agent.identity?.name || agent.id, emoji: agent.identity?.emoji || '🤖',
      model: agent.model || config.agents?.defaults?.model,
      lastActivity, sessionCount: sessionList.length, recentSessions,
      status: isActive ? 'active' : 'idle', authErrorCount,
      soul:     readText(path.join(workspaceDir, 'SOUL.md')),
      identity: readText(path.join(workspaceDir, 'IDENTITY.md')),
      memory:   readText(path.join(workspaceDir, 'MEMORY.md')),
      dailyLog: readText(path.join(workspaceDir, 'memory', 'daily', `${today}.md`)),
    }
  })
}

// ─── Sub-agents ───────────────────────────────────────────────────────────────
function getSubagentData() {
  const data = readJSON(path.join(OC, 'subagents', 'runs.json'))
  if (!data) return { active: [], recent: [] }
  const now  = Date.now()
  const runs = Object.values(data.runs || {})
  const active = runs.filter(r => !r.endedAt)
  const recent = runs
    .filter(r => r.endedAt && r.endedAt > now - 48 * 3600000)
    .sort((a, b) => b.endedAt - a.endedAt).slice(0, 20)
    .map(r => ({
      runId: r.runId, label: r.label || '(unlabelled)',
      task: (r.task || '').slice(0, 200),
      status: r.outcome?.status || 'unknown', endedReason: r.endedReason,
      createdAt: r.createdAt, endedAt: r.endedAt,
      durationMs: r.endedAt - r.startedAt, model: r.model,
      result: r.frozenResultText ? r.frozenResultText.slice(0, 500) : null,
    }))
  return {
    active: active.map(r => ({ runId: r.runId, label: r.label || '(unlabelled)',
      task: (r.task || '').slice(0, 200), model: r.model, createdAt: r.createdAt, startedAt: r.startedAt })),
    recent,
  }
}

// ─── Cron jobs ───────────────────────────────────────────────────────────────
function getCronData() {
  const data = readJSON(path.join(OC, 'cron', 'jobs.json'))
  if (!data) return []
  const runsDir = path.join(OC, 'cron', 'runs')
  return (data.jobs || []).map(job => {
    let recentRuns = []
    try {
      const lines = fs.readFileSync(path.join(runsDir, `${job.id}.jsonl`), 'utf8')
        .trim().split('\n').filter(Boolean)
      recentRuns = lines.slice(-5).map(l => JSON.parse(l)).reverse()
    } catch {}
    return {
      id: job.id, name: job.name, enabled: job.enabled,
      schedule: job.schedule, agentId: job.agentId,
      nextRunAtMs:       job.state?.nextRunAtMs,
      lastRunAtMs:       job.state?.lastRunAtMs,
      lastStatus:        job.state?.lastStatus,
      lastError:         job.state?.lastError,
      consecutiveErrors: job.state?.consecutiveErrors || 0,
      lastDurationMs:    job.state?.lastDurationMs,
      recentRuns,
    }
  })
}

// ─── Token costs ─────────────────────────────────────────────────────────────
function getTokenCosts() {
  const now  = Date.now()
  const todayStart   = (() => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime() })()
  const thirtyDaysAgo = now - 30 * 86400000
  const total = { cost: 0, tokens: 0, input: 0, output: 0 }
  const today = { cost: 0, tokens: 0, input: 0, output: 0 }
  const byModel = {}, byDay = {}

  for (const agentId of ['main', 'xiaoxiangsu']) {
    const sessDir = path.join(OC, 'agents', agentId, 'sessions')
    let files
    try {
      files = fs.readdirSync(sessDir)
        .filter(f => f.endsWith('.jsonl') && !f.includes('.deleted'))
        .filter(f => { try { return fs.statSync(path.join(sessDir, f)).mtimeMs > thirtyDaysAgo } catch { return false } })
    } catch { continue }

    for (const file of files) {
      const fp = path.join(sessDir, file)
      const isToday = (() => { try { return fs.statSync(fp).mtimeMs > todayStart } catch { return false } })()
      let content
      try { content = fs.readFileSync(fp, 'utf8') } catch { continue }

      for (const line of content.split('\n')) {
        if (!line.trim()) continue
        try {
          const ev = JSON.parse(line)
          if (ev.type !== 'message' || ev.message?.role !== 'assistant') continue
          if (ev.message?.model === 'delivery-mirror') continue
          const u = ev.message.usage
          if (!u?.cost) continue
          const cost = u.cost.total || 0, tokens = u.totalTokens || 0
          const ts = ev.timestamp ? new Date(ev.timestamp).getTime() : (isToday ? Date.now() : 0)
          const model = ev.message.model || 'unknown'

          total.cost   += cost;  total.tokens += tokens
          total.input  += u.input || 0; total.output += u.output || 0
          if (ts >= todayStart) { today.cost += cost; today.tokens += tokens }

          if (!byModel[model]) byModel[model] = { cost: 0, tokens: 0 }
          byModel[model].cost += cost; byModel[model].tokens += tokens

          const day = new Date(ts || Date.now()).toISOString().slice(0, 10)
          if (!byDay[day]) byDay[day] = { cost: 0, tokens: 0 }
          byDay[day].cost += cost; byDay[day].tokens += tokens
        } catch {}
      }
    }
  }
  return { total, today, byModel, byDay }
}

// ─── Gateway status ───────────────────────────────────────────────────────────
function getGatewayStatus() {
  try {
    const stat   = fs.statSync(path.join(OC, 'logs', 'gateway.log'))
    const update = readJSON(path.join(OC, 'update-check.json'))
    return {
      status:      Date.now() - stat.mtimeMs < 300000 ? 'online' : 'stale',
      version:     update?.currentVersion || null,
      logModified: stat.mtimeMs,
    }
  } catch { return { status: 'offline', version: null } }
}

// ─── Session list ─────────────────────────────────────────────────────────────
app.get('/api/sessions/:agentId', (req, res) => {
  const { agentId } = req.params
  const sessDir = path.join(OC, 'agents', agentId, 'sessions')
  const index   = readJSON(path.join(sessDir, 'sessions.json')) || {}

  // Current active sessions from index
  const current = Object.entries(index).map(([key, s]) => ({
    key,
    sessionId:   s.sessionId,
    file:        path.basename(s.sessionFile || ''),
    updatedAt:   s.updatedAt,
    channel:     s.deliveryContext?.channel || s.lastChannel,
    chatType:    s.chatType,
    origin:      s.origin,
    displayName: s.displayName || s.origin?.label || key,
  })).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))

  // All historical files sorted by mtime
  let history = []
  try {
    history = fs.readdirSync(sessDir)
      .filter(f => f.endsWith('.jsonl') && !f.includes('.deleted'))
      .map(f => {
        const stat = fs.statSync(path.join(sessDir, f))
        return { file: f, mtime: stat.mtimeMs, size: stat.size }
      })
      .sort((a, b) => b.mtime - a.mtime)
  } catch {}

  res.json({ current, history })
})

// ─── Session events ───────────────────────────────────────────────────────────
app.get('/api/session/:agentId/:file', (req, res) => {
  const { agentId, file } = req.params
  // Security: only allow .jsonl files, no path traversal
  if (!file.endsWith('.jsonl') || file.includes('/') || file.includes('..')) {
    return res.status(400).json({ error: 'Invalid file' })
  }
  const filePath = path.join(OC, 'agents', agentId, 'sessions', file)
  let events = []
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    events = content.split('\n')
      .filter(l => l.trim())
      .map(l => { try { return JSON.parse(l) } catch { return null } })
      .filter(Boolean)
      .filter(e => !(e.type === 'message' && e.message?.model === 'delivery-mirror'))
  } catch (err) {
    return res.status(404).json({ error: err.message })
  }
  res.json(events)
})

// ─── Main dashboard data ──────────────────────────────────────────────────────
app.get('/api/data', (req, res) => {
  res.json({
    agents:    cached('agents',    15000, getAgentData),
    subagents: cached('subagents', 10000, getSubagentData),
    crons:     cached('crons',     15000, getCronData),
    costs:     cached('costs',    120000, getTokenCosts),
    gateway:   cached('gateway',   30000, getGatewayStatus),
    ts: Date.now(),
  })
})

// ─── Log tail ─────────────────────────────────────────────────────────────────
app.get('/api/log', (req, res) => {
  try {
    const content = fs.readFileSync(path.join(OC, 'logs', 'gateway.log'), 'utf8')
    res.json(content.split('\n').filter(Boolean).slice(-300))
  } catch { res.json([]) }
})

// ─── SSE live log ─────────────────────────────────────────────────────────────
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Cache-Control', 'no-cache')
  res.flushHeaders()

  const logPath = path.join(OC, 'logs', 'gateway.log')
  let offset = 0
  try { offset = fs.statSync(logPath).size } catch {}

  const timer = setInterval(() => {
    try {
      const size = fs.statSync(logPath).size
      if (size > offset) {
        const fd  = fs.openSync(logPath, 'r')
        const buf = Buffer.alloc(size - offset)
        fs.readSync(fd, buf, 0, buf.length, offset)
        fs.closeSync(fd)
        offset = size
        buf.toString('utf8').split('\n').filter(Boolean).forEach(line => {
          res.write(`data: ${JSON.stringify(line)}\n\n`)
        })
      }
    } catch {}
  }, 1500)

  req.on('close', () => clearInterval(timer))
})

// ─── SPA fallback ─────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  const index = path.join(__dirname, 'dist', 'index.html')
  if (fs.existsSync(index)) res.sendFile(index)
  else res.status(404).send('Run `npm run build` first, or use `npm run dev`')
})

app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🦞 OpenClaw API → http://localhost:${PORT}`)
  console.log(`   Frontend dev → npm run dev  (http://localhost:5173)\n`)
})
