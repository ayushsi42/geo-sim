import { useEffect, useState } from 'react'
import { api } from '../api/client'
import {
  BarChart3, PieChart as PieIcon, TrendingUp, Activity, Globe2,
  Clock, AlertTriangle, Layers
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, RadialBarChart, RadialBar
} from 'recharts'

const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#f97316', '#6366f1', '#ec4899', '#14b8a6']
const SEVERITY_GRADIENT = ['#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#dc2626', '#b91c1c', '#7f1d1d']

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, evtRes] = await Promise.all([
          api.getEventStats(),
          api.getRecentEvents(200),
        ])
        setStats(statsRes)
        setEvents(evtRes.events || [])
      } catch (err) {
        console.error('Analytics load error:', err)
        setStats({ total: 0, by_category: {}, by_severity: {}, avg_confidence: 0, avg_severity: 0, top_actors: [], recent_24h: 0 })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <AnalyticsSkeleton />

  // Derived data
  const categoryPieData = Object.entries(stats.by_category || {}).map(([name, value], i) => ({
    name: name.replace(/_/g, ' '),
    value,
    color: COLORS[i % COLORS.length],
  }))

  const severityBarData = Object.entries(stats.by_severity || {}).map(([sev, count]) => ({
    severity: `Level ${sev}`,
    count,
    color: SEVERITY_GRADIENT[Math.min(parseInt(sev), 9)],
  }))

  const actorBarData = (stats.top_actors || []).slice(0, 10).map(([name, count], i) => ({
    name: name.length > 15 ? name.slice(0, 15) + '…' : name,
    fullName: name,
    count,
    color: COLORS[i % COLORS.length],
  }))

  // Confidence distribution
  const confBuckets = { '< 50%': 0, '50-70%': 0, '70-85%': 0, '85-95%': 0, '> 95%': 0 }
  events.forEach(e => {
    const c = (e.confidence || 0) * 100
    if (c < 50) confBuckets['< 50%']++
    else if (c < 70) confBuckets['50-70%']++
    else if (c < 85) confBuckets['70-85%']++
    else if (c < 95) confBuckets['85-95%']++
    else confBuckets['> 95%']++
  })
  const confData = Object.entries(confBuckets).map(([name, value], i) => ({
    name, value, color: COLORS[i],
  }))

  // Time series (events per hour, last 24 hours)
  const now = Date.now()
  const hourBuckets = Array.from({ length: 24 }, (_, i) => ({
    hour: `${23 - i}h ago`,
    count: 0,
    hourIdx: 23 - i,
  })).reverse()
  events.forEach(e => {
    if (!e.timestamp) return
    const diff = (now - new Date(e.timestamp).getTime()) / 3600000
    if (diff >= 0 && diff < 24) {
      const idx = Math.floor(diff)
      const bucket = hourBuckets.find(b => b.hourIdx === idx)
      if (bucket) bucket.count++
    }
  })

  // Severity trend by category
  const categoryAvgSeverity = Object.entries(stats.by_category || {}).map(([cat, count]) => {
    const catEvents = events.filter(e => e.category === cat)
    const avgSev = catEvents.length ? catEvents.reduce((s, e) => s + (e.severity || 0), 0) / catEvents.length : 0
    return { name: cat.replace(/_/g, ' '), avgSeverity: parseFloat(avgSev.toFixed(1)), count }
  }).sort((a, b) => b.avgSeverity - a.avgSeverity)

  // Summary gauges
  const gaugeData = [
    { name: 'Confidence', value: Math.round((stats.avg_confidence || 0) * 100), fill: '#3b82f6' },
    { name: 'Severity', value: Math.round((stats.avg_severity || 0) * 10), fill: '#f59e0b' },
  ]

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-white/90 tracking-tight">Analytics</h2>
        <p className="text-sm text-slate-500 mt-1">
          Deep analysis of {stats.total} ingested events
        </p>
      </div>

      {/* Summary stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard icon={Layers} label="Total Events" value={stats.total} color="blue" />
        <SummaryCard icon={Clock} label="Last 24h" value={stats.recent_24h} color="cyan" />
        <SummaryCard icon={AlertTriangle} label="Avg Severity" value={stats.avg_severity?.toFixed(1)} color="amber" />
        <SummaryCard icon={TrendingUp} label="Avg Confidence" value={`${Math.round((stats.avg_confidence || 0) * 100)}%`} color="emerald" />
      </div>

      {/* Row 1: Category Pie + Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Pie Chart */}
        <div className="glass-card-flush">
          <div className="px-5 py-3 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-200">Category Distribution</h3>
            </div>
          </div>
          <div className="p-5 flex flex-col md:flex-row items-center gap-4">
            <div className="h-64 w-64 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%" cy="50%"
                    innerRadius="55%"
                    outerRadius="85%"
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15,22,41,0.95)',
                      border: '1px solid rgba(59,130,246,0.2)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 flex-1">
              {categoryPieData.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs text-slate-400 capitalize flex-1 truncate">{entry.name}</span>
                  <span className="text-xs text-slate-300 font-mono">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Severity Histogram */}
        <div className="glass-card-flush">
          <div className="px-5 py-3 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-200">Severity Histogram</h3>
            </div>
          </div>
          <div className="p-5">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityBarData} margin={{ left: -10, right: 0, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
                  <XAxis dataKey="severity" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{
                    background: 'rgba(15,22,41,0.95)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: 8, fontSize: 12,
                  }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {severityBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Timeline + Top Actors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Event Timeline (24h) */}
        <div className="glass-card-flush">
          <div className="px-5 py-3 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-200">24h Event Timeline</h3>
            </div>
          </div>
          <div className="p-5">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourBuckets} margin={{ left: -10, right: 0, top: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
                  <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false}
                    interval={3} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{
                    background: 'rgba(15,22,41,0.95)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: 8, fontSize: 12,
                  }} />
                  <Area
                    type="monotone" dataKey="count"
                    stroke="#06b6d4" strokeWidth={2}
                    fill="url(#areaGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Actors */}
        <div className="glass-card-flush">
          <div className="px-5 py-3 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-200">Top Actors</h3>
            </div>
          </div>
          <div className="p-5">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={actorBarData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={100}
                    tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15,22,41,0.95)',
                      border: '1px solid rgba(59,130,246,0.2)',
                      borderRadius: 8, fontSize: 12,
                    }}
                    formatter={(val, name, props) => [val, props.payload.fullName]}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
                    {actorBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} fillOpacity={0.75} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Confidence Distribution + Severity by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Confidence Distribution */}
        <div className="glass-card-flush">
          <div className="px-5 py-3 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-200">Confidence Distribution</h3>
            </div>
          </div>
          <div className="p-5">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confData} margin={{ left: -10, right: 0, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{
                    background: 'rgba(15,22,41,0.95)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: 8, fontSize: 12,
                  }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={36}>
                    {confData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Avg Severity by Category */}
        <div className="glass-card-flush">
          <div className="px-5 py-3 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-semibold text-slate-200">Avg Severity by Category</h3>
            </div>
          </div>
          <div className="p-5 space-y-2.5 max-h-[280px] overflow-y-auto">
            {categoryAvgSeverity.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400 capitalize truncate">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">{item.count} events</span>
                    <span className="text-xs font-mono font-bold" style={{
                      color: item.avgSeverity >= 7 ? '#ef4444' : item.avgSeverity >= 5 ? '#f59e0b' : '#10b981'
                    }}>
                      {item.avgSeverity}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.avgSeverity * 10}%`,
                      background: `linear-gradient(90deg, ${
                        item.avgSeverity >= 7 ? '#ef4444' : item.avgSeverity >= 5 ? '#f59e0b' : '#10b981'
                      }, ${
                        item.avgSeverity >= 7 ? '#dc2626' : item.avgSeverity >= 5 ? '#f97316' : '#22c55e'
                      })`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="glass-card">
      <div className={`p-2 rounded-lg bg-${color}-500/10 border border-${color}-500/20 w-fit mb-2`}>
        <Icon className={`w-4 h-4 text-${color}-400`} />
      </div>
      <p className="text-2xl font-bold font-mono text-white/90">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-36 bg-white/[0.04] rounded-lg" />
        <div className="h-4 w-60 bg-white/[0.03] rounded mt-2" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="glass-card h-24" />)}
      </div>
      <div className="grid grid-cols-2 gap-5">
        {[...Array(4)].map((_, i) => <div key={i} className="glass-card h-72" />)}
      </div>
    </div>
  )
}
