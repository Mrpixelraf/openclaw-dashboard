// ─── Mock Data for OpenClaw Dashboard Demo ──────────────────────────────────
// All data is completely fictional. No real names, IDs, or sensitive info.

// ─── Agents ──────────────────────────────────────────────────────────────────
export const agents = [
  {
    id: 'atlas', name: 'Atlas', emoji: '🤖',
    model: 'claude-sonnet-4-6', status: 'active',
    sessionCount: 47, recentSessions: 3,
    contextUsage: { used: 82000, max: 200000, pct: 41 },
    lastActivity: Date.now() - 120000,
    authErrorCount: 0,
    memory: '# Agent Memory\n\n## Current Focus\n- Building customer portal authentication\n- Reviewing PR #42 for auth module\n\n## Key Decisions\n- Using OAuth 2.0 for auth flow\n- PostgreSQL for session storage\n\n## Learned Patterns\n- Always run tests before pushing\n- Prefer composable middleware over monolithic handlers',
    soul: '# Soul\n\nI am Atlas, a diligent engineering agent focused on delivering robust, well-tested code. I believe in clean architecture, thorough code reviews, and pragmatic solutions.\n\n## Principles\n- Ship quality code, not just fast code\n- Communicate clearly about trade-offs\n- Own my mistakes and learn from them',
    identity: '# Identity\n\n- **Role**: Lead Engineering Agent\n- **Specialty**: Full-stack development, API design\n- **Created**: 2025-01-15\n- **Managed by**: OpenClaw Gateway v2.1',
    dailyLog: "## Today's Log\n\n- 09:00 Reviewed PR #42 — approved with minor suggestions\n- 09:30 Started auth module refactor (OAuth2 flow)\n- 10:15 Fixed pagination bug in user list endpoint\n- 11:00 Updated API docs for v2 endpoints\n- 11:45 Deployed staging build, running integration tests",
  },
  {
    id: 'luna', name: 'Luna', emoji: '🌙',
    model: 'claude-haiku-4-5', status: 'idle',
    sessionCount: 12, recentSessions: 0,
    contextUsage: { used: 15000, max: 200000, pct: 8 },
    lastActivity: Date.now() - 3600000,
    authErrorCount: 0,
    memory: '# Agent Memory\n\n## Recent Tasks\n- Generated weekly analytics report\n- Monitored system health metrics\n- Flagged anomaly in request latency\n\n## Notes\n- Shift to automated alerting pipeline next\n- Dashboard response times nominal',
    soul: '# Soul\n\nI am Luna, an analytical agent specializing in data processing and monitoring. I work quietly in the background to keep systems running smoothly.\n\n## Principles\n- Data tells the truth — trust the numbers\n- Alert early, alert clearly\n- Minimize noise, maximize signal',
    identity: '# Identity\n\n- **Role**: Data & Monitoring Agent\n- **Specialty**: Analytics, health checks, reporting\n- **Created**: 2025-02-20\n- **Managed by**: OpenClaw Gateway v2.1',
    dailyLog: "## Today's Log\n\n- 06:00 Generated daily report — all metrics within bounds\n- 06:15 Health check — all 5 services responding < 200ms\n- 07:00 Entered idle state — next task: weekly rollup (scheduled)",
  },
]

// ─── Projects ────────────────────────────────────────────────────────────────
export const projects = [
  { id: 'webapp', name: 'Customer Portal', emoji: '🌐', status: 'active', priority: 5,
    stage: 'Auth system + API integration', nextAction: 'Wire up OAuth providers',
    updatedAt: new Date(Date.now() - 86400000).toISOString(), notes: 'React + Next.js' },
  { id: 'mobile', name: 'Mobile App', emoji: '📱', status: 'active', priority: 4,
    stage: 'UI design phase', nextAction: 'Finalize navigation flow',
    updatedAt: new Date(Date.now() - 172800000).toISOString(), notes: 'React Native' },
  { id: 'data-pipeline', name: 'Data Pipeline', emoji: '🔄', status: 'active', priority: 3,
    stage: 'ETL scripts running', nextAction: 'Add monitoring alerts',
    updatedAt: new Date(Date.now() - 43200000).toISOString(), notes: '' },
  { id: 'docs', name: 'Documentation', emoji: '📚', status: 'blocked', priority: 2,
    stage: 'Waiting for API spec', nextAction: 'PM to finalize endpoints',
    updatedAt: new Date(Date.now() - 259200000).toISOString(), notes: 'Docusaurus' },
  { id: 'legacy', name: 'Legacy Migration', emoji: '🏗️', status: 'paused', priority: 1,
    stage: 'On hold until Q3', nextAction: 'Revisit after portal launch',
    updatedAt: new Date(Date.now() - 604800000).toISOString(), notes: '' },
]

// ─── Cron Jobs ───────────────────────────────────────────────────────────────
export const crons = [
  {
    id: 'daily-report', name: 'Daily Report',
    schedule: { expr: '0 9 * * *' },
    lastRunAtMs: Date.now() - 3600000, lastDurationMs: 4200,
    lastStatus: 'ok', enabled: true,
    nextRunAtMs: Date.now() + 72000000,
    consecutiveErrors: 0, lastError: null,
  },
  {
    id: 'health-check', name: 'Health Check',
    schedule: { kind: 'every', everyMs: 900000 },
    lastRunAtMs: Date.now() - 600000, lastDurationMs: 850,
    lastStatus: 'ok', enabled: true,
    nextRunAtMs: Date.now() + 300000,
    consecutiveErrors: 0, lastError: null,
  },
  {
    id: 'backup', name: 'Weekly Backup',
    schedule: { expr: '0 3 * * 0' },
    lastRunAtMs: Date.now() - 86400000 * 3, lastDurationMs: 12500,
    lastStatus: 'ok', enabled: true,
    nextRunAtMs: Date.now() + 86400000 * 4,
    consecutiveErrors: 0, lastError: null,
  },
]

// ─── Sub-agents ──────────────────────────────────────────────────────────────
export const subagents = {
  active: [
    { runId: 'run-001', label: 'Code Review', task: 'Review PR #42 for auth module', model: 'sonnet', startedAt: Date.now() - 300000 },
    { runId: 'run-002', label: 'Bug Fix', task: 'Fix pagination issue in user list', model: 'sonnet', startedAt: Date.now() - 120000 },
  ],
  recent: [
    { runId: 'run-003', label: 'Docs Update', task: 'Update API docs for v2 endpoints', status: 'ok', endedAt: Date.now() - 1800000, durationMs: 45000, model: 'sonnet' },
    { runId: 'run-004', label: 'Test Suite', task: 'Add integration tests for payment flow', status: 'ok', endedAt: Date.now() - 7200000, durationMs: 92000, model: 'haiku' },
  ],
}

// ─── Costs ───────────────────────────────────────────────────────────────────
function generateDailyCosts() {
  const byDay = {}
  const today = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - (13 - i))
    const key = d.toISOString().slice(0, 10)
    const cost = i < 3 ? 1.5 + Math.random() * 2 : 2.5 + Math.random() * 4
    byDay[key] = { cost: Math.round(cost * 100) / 100, tokens: Math.round(cost * 42000) }
  }
  return byDay
}

export const costs = {
  today: { cost: 2.47, tokens: 105000 },
  total: { cost: 67.21, tokens: 2840000 },
  byModel: {
    'claude-sonnet-4-6': { cost: 52.10, tokens: 2100000 },
    'claude-haiku-4-5': { cost: 15.11, tokens: 740000 },
  },
  byDay: generateDailyCosts(),
}

// ─── Gateway ─────────────────────────────────────────────────────────────────
export const gateway = {
  status: 'online',
  version: '2.1.0',
}

// ─── Activity Pulse (24h hourly data) ────────────────────────────────────────
function generateActivityData() {
  const labels = []
  const now = new Date()
  for (let i = 23; i >= 0; i--) {
    const h = new Date(now)
    h.setHours(h.getHours() - i, 0, 0, 0)
    labels.push(h.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }))
  }
  // Atlas: active during work hours, quiet at night
  const atlas = labels.map((_, i) => {
    const hour = (now.getHours() - 23 + i + 24) % 24
    if (hour >= 9 && hour <= 18) return Math.floor(8 + Math.random() * 12)
    if (hour >= 7 && hour <= 21) return Math.floor(2 + Math.random() * 5)
    return Math.floor(Math.random() * 2)
  })
  // Luna: periodic spikes from health checks + reports
  const luna = labels.map((_, i) => {
    const hour = (now.getHours() - 23 + i + 24) % 24
    if (hour === 6 || hour === 9) return Math.floor(5 + Math.random() * 3)
    if (hour % 4 === 0) return Math.floor(1 + Math.random() * 3)
    return Math.floor(Math.random() * 2)
  })
  return { labels, agents: { atlas, luna } }
}

export const activityData = generateActivityData()

// ─── Burn Rate (24h cumulative cost timeline) ────────────────────────────────
function generateBurnRateData() {
  const points = []
  const now = Date.now()
  let cumCost = 0
  for (let i = 0; i < 48; i++) {
    const ts = now - (47 - i) * 1800000 // 30-min intervals
    const hour = new Date(ts).getHours()
    // Higher costs during work hours
    const rate = (hour >= 9 && hour <= 18) ? 0.08 + Math.random() * 0.12 : 0.01 + Math.random() * 0.03
    cumCost += rate
    points.push({ ts, cumCost: Math.round(cumCost * 100) / 100 })
  }
  const total = points[points.length - 1].cumCost
  const ratePerHour = total / 24
  return { points, totalCost: total, ratePerHour: Math.round(ratePerHour * 100) / 100 }
}

export const burnRateData = generateBurnRateData()

// ─── Claude Code Sessions ────────────────────────────────────────────────────
export const claudeCodeData = {
  sessions: [
    { session_id: 'sess-a1b2c3', slug: 'auth-refactor', model: 'claude-sonnet-4-6', cwd: '/projects/customer-portal', turns: 24, input_tokens: 85000, output_tokens: 32000, cache_read_input_tokens: 45000, cache_creation_input_tokens: 0, cost: 3.42, ts: Date.now() - 1800000 },
    { session_id: 'sess-d4e5f6', slug: 'fix-pagination', model: 'claude-sonnet-4-6', cwd: '/projects/customer-portal', turns: 8, input_tokens: 28000, output_tokens: 12000, cache_read_input_tokens: 15000, cache_creation_input_tokens: 0, cost: 1.15, ts: Date.now() - 7200000 },
    { session_id: 'sess-g7h8i9', slug: 'api-docs-v2', model: 'claude-haiku-4-5', cwd: '/projects/documentation', turns: 15, input_tokens: 42000, output_tokens: 18000, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, cost: 0.67, ts: Date.now() - 14400000 },
    { session_id: 'sess-j0k1l2', slug: 'test-payment', model: 'claude-sonnet-4-6', cwd: '/projects/customer-portal', turns: 31, input_tokens: 120000, output_tokens: 48000, cache_read_input_tokens: 62000, cache_creation_input_tokens: 0, cost: 5.89, ts: Date.now() - 28800000 },
    { session_id: 'sess-m3n4o5', slug: 'nav-prototype', model: 'claude-haiku-4-5', cwd: '/projects/mobile-app', turns: 6, input_tokens: 18000, output_tokens: 8000, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, cost: 0.31, ts: Date.now() - 43200000 },
  ],
  total: 5,
  totalCost: 11.44,
}

// ─── Memory Browser (mock file tree + content) ──────────────────────────────
export const memoryTree = [
  {
    name: 'daily', type: 'dir', children: [
      { name: '2025-03-24.md', type: 'file', path: 'daily/2025-03-24.md' },
      { name: '2025-03-23.md', type: 'file', path: 'daily/2025-03-23.md' },
      { name: '2025-03-22.md', type: 'file', path: 'daily/2025-03-22.md' },
    ],
  },
  {
    name: 'learning', type: 'dir', children: [
      { name: 'coding-patterns.md', type: 'file', path: 'learning/coding-patterns.md' },
      { name: 'debugging-tips.md', type: 'file', path: 'learning/debugging-tips.md' },
    ],
  },
  {
    name: 'projects', type: 'dir', children: [
      { name: 'customer-portal.md', type: 'file', path: 'projects/customer-portal.md' },
      { name: 'mobile-app.md', type: 'file', path: 'projects/mobile-app.md' },
    ],
  },
  { name: 'MEMORY.md', type: 'file', path: 'MEMORY.md' },
  { name: 'SOUL.md', type: 'file', path: 'SOUL.md' },
]

export const memoryFiles = {
  'daily/2025-03-24.md': '# Daily Log — 2025-03-24\n\n## Summary\nFocused on customer portal authentication. Reviewed PR #42, fixed pagination bug, and updated API docs.\n\n## Tasks Completed\n- [x] Review PR #42 (auth module)\n- [x] Fix pagination in user list\n- [x] Update v2 API documentation\n\n## Insights\n- OAuth2 PKCE flow works well for SPAs\n- Need to add rate limiting on token refresh endpoint',
  'daily/2025-03-23.md': '# Daily Log — 2025-03-23\n\n## Summary\nSet up CI/CD pipeline for staging deployments. Worked on database migration scripts.\n\n## Tasks Completed\n- [x] Configure GitHub Actions workflow\n- [x] Write migration for user_sessions table\n- [x] Performance test: 2000 concurrent users OK',
  'daily/2025-03-22.md': '# Daily Log — 2025-03-22\n\n## Summary\nKicked off the Customer Portal project. Set up the repo, installed dependencies, and created the initial project structure.\n\n## Tasks Completed\n- [x] Initialize Next.js project\n- [x] Configure Tailwind + dark mode\n- [x] Set up Prisma with PostgreSQL',
  'learning/coding-patterns.md': '# Coding Patterns\n\n## Error Handling\n- Always use custom error classes for domain-specific errors\n- Catch at boundaries, not deep in the call stack\n- Log context: what was attempted + what went wrong\n\n## API Design\n- Prefer REST for CRUD, WebSockets for real-time\n- Paginate all list endpoints (cursor-based > offset)\n- Version the API from day one (`/v1/`, `/v2/`)',
  'learning/debugging-tips.md': '# Debugging Tips\n\n## General\n1. Read the error message carefully — it usually tells you exactly what happened\n2. Reproduce first, then fix\n3. Check recent changes with `git diff`\n\n## Node.js Specific\n- Use `--inspect` flag for Chrome DevTools\n- `process.memoryUsage()` for memory leak hunting\n- Enable source maps in production for useful stack traces',
  'projects/customer-portal.md': '# Customer Portal\n\n**Status**: Active | **Priority**: High\n\n## Architecture\n- **Frontend**: Next.js 14, React 18, Tailwind CSS\n- **Backend**: Node.js, Express, Prisma ORM\n- **Database**: PostgreSQL 15\n- **Auth**: OAuth 2.0 (Google, GitHub)\n\n## Milestones\n1. ~~Project setup~~ ✓\n2. Auth system ← **current**\n3. User dashboard\n4. Admin panel\n5. Public launch',
  'projects/mobile-app.md': '# Mobile App\n\n**Status**: Active | **Priority**: Medium\n\n## Architecture\n- **Framework**: React Native + Expo\n- **Navigation**: React Navigation v6\n- **State**: Zustand\n\n## Design Phase\n- Finalize wireframes for 5 core screens\n- Prototype navigation flow\n- Accessibility audit on color contrast',
  'MEMORY.md': '# Memory Index\n\nThis is the root memory file for the Atlas agent.\n\n## Quick Links\n- [Daily logs](daily/) — Day-by-day activity\n- [Learning](learning/) — Patterns, tips, insights\n- [Projects](projects/) — Per-project knowledge base\n\n## Active Context\n- Working on **Customer Portal** auth system\n- Using **OAuth 2.0 PKCE** flow for SPA\n- Next milestone: user dashboard scaffolding',
  'SOUL.md': '# Soul\n\nI am Atlas, a diligent engineering agent focused on delivering robust, well-tested code.\n\n## Core Values\n- **Quality over speed** — Ship code that works correctly\n- **Clear communication** — Explain trade-offs honestly\n- **Continuous learning** — Every bug is a lesson\n\n## Working Style\n- I prefer to understand the full context before making changes\n- I write tests alongside implementation, not after\n- I document decisions in memory for future reference',
}

// ─── Cron History (for heatmap — 35 days) ────────────────────────────────────
function generateCronHistory() {
  const history = {}
  const now = new Date()
  for (const cron of crons) {
    const runs = []
    for (let d = 0; d < 35; d++) {
      const day = new Date(now)
      day.setDate(day.getDate() - d)
      // Different run patterns per job
      if (cron.id === 'daily-report') {
        // Runs once daily
        runs.push({ ts: day.toISOString(), status: d === 12 ? 'error' : 'ok' })
      } else if (cron.id === 'health-check') {
        // Runs many times daily
        for (let h = 0; h < 96; h++) {
          const t = new Date(day)
          t.setMinutes(t.getMinutes() - h * 15)
          if (t.toISOString().slice(0, 10) === day.toISOString().slice(0, 10)) {
            runs.push({ ts: t.toISOString(), status: 'ok' })
          }
        }
      } else if (cron.id === 'backup') {
        // Runs once per week (Sundays)
        if (day.getDay() === 0) {
          runs.push({ ts: day.toISOString(), status: 'ok' })
        }
      }
    }
    history[cron.id] = runs
  }
  return history
}

export const cronHistory = generateCronHistory()

// ─── Log Lines (mock gateway log) ────────────────────────────────────────────
function generateLogLines() {
  const templates = [
    '[gateway] Heartbeat OK — all agents responsive',
    '[gateway] Request routed: atlas → claude-sonnet-4-6',
    '[gateway] Request routed: luna → claude-haiku-4-5',
    '[gateway] SSE connection opened (dashboard)',
    '[gateway] Session created: atlas/sess-a1b2c3.jsonl',
    '[ws] WebSocket ping — latency 12ms',
    '[ws] WebSocket ping — latency 8ms',
    '[gateway] Cron triggered: health-check',
    '[gateway] Cron completed: health-check (850ms)',
    '[gateway] Sub-agent spawned: run-001 (Code Review)',
    '[gateway] Sub-agent spawned: run-002 (Bug Fix)',
    '[gateway] Sub-agent completed: run-003 (Docs Update) — 45s',
    '[gateway] Token usage: atlas 3.2k in / 1.1k out',
    '[gateway] Token usage: luna 800 in / 320 out',
    '[gateway] Cost update: today $2.47 (+$0.12)',
    '[gateway] Memory write: daily/2025-03-24.md',
    '[gateway] Context compaction: atlas 180k → 45k tokens',
  ]
  const now = new Date()
  return templates.map((line, i) => {
    const t = new Date(now - (templates.length - i) * 15000)
    const ts = t.toTimeString().slice(0, 8)
    return `${ts} ${line}`
  })
}

export const logLines = generateLogLines()
