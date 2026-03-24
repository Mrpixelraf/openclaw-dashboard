import { useState } from 'react'
import Header from './components/Header.jsx'
import StatBar from './components/StatBar.jsx'
import AgentCard from './components/AgentCard.jsx'
import CronTable from './components/CronTable.jsx'
import CronHeatmap from './components/CronHeatmap.jsx'
import SubagentPanel from './components/SubagentPanel.jsx'
import CostPanel from './components/CostPanel.jsx'
import ActivityPulse from './components/ActivityPulse.jsx'
import BurnRate from './components/BurnRate.jsx'
import LogViewer from './components/LogViewer.jsx'
import ClaudeCodeUsage from './components/ClaudeCodeUsage.jsx'
import MemoryBrowser from './components/MemoryBrowser.jsx'
import ProjectBoard from './components/ProjectBoard.jsx'

import {
  agents, projects, crons, subagents, costs, gateway,
  activityData, burnRateData, claudeCodeData,
  memoryTree, memoryFiles, cronHistory, logLines,
} from './mockData.js'

export default function DemoApp() {
  const [page] = useState('dashboard')
  const [lastFetch] = useState(Date.now())

  const data = { agents, subagents, crons, costs, gateway }

  return (
    <div className="min-h-screen bg-oc-bg font-mono">
      <Header
        gateway={gateway}
        lastFetch={lastFetch}
        onRefresh={() => {}}
        page={page}
        onNav={() => {}}
      />

      <StatBar data={data} />

      <div className="p-4 flex flex-col gap-4">

        {/* Agents */}
        <section>
          <div className="text-[10px] text-oc-muted uppercase tracking-widest mb-3 px-0.5">Agents</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>

        {/* Project Board */}
        <ProjectBoard projects={projects} />

        {/* Activity Pulse + Burn Rate */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ActivityPulse data={activityData} />
          <BurnRate data={burnRateData} />
        </div>

        {/* Cron Jobs + Heatmap */}
        <CronTable crons={crons} />
        <CronHeatmap crons={crons} history={cronHistory} />

        {/* Sub-agents + Costs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SubagentPanel subagents={subagents} />
          <CostPanel costs={costs} />
        </div>

        {/* Claude Code Sessions + Memory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ClaudeCodeUsage data={claudeCodeData} />
          <MemoryBrowser tree={memoryTree} files={memoryFiles} />
        </div>

        {/* Live Log */}
        <LogViewer lines={logLines} />
      </div>
    </div>
  )
}
