import { useEffect, useState, useRef } from 'react'
import { api } from '../api/client'
import {
  Activity, AlertTriangle, BarChart3, Globe2, Radio,
  TrendingUp, Shield, Zap, ChevronRight, Clock,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from 'recharts'

const CATEGORY_COLORS = {
  military_conflict: '#ef4444',
  diplomatic_crisis: '#f59e0b',
  economic_event: '#3b82f6',
  political_instability: '#8b5cf6',
  humanitarian: '#06b6d4',
  cyber_security: '#10b981',
  terrorism: '#dc2626',
  trade_dispute: '#f97316',
  nuclear_proliferation: '#e11d48',
  alliance_shift: '#6366f1',
  unknown: '#64748b',
}

const SEVERITY_GRADIENT = ['#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#dc2626', '#b91c1c', '#7f1d1d']

function AnimatedNumber({ value, decimals = 0, duration = 1200 }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const start = display
    const diff = value - start
    const startTime = performance.now()

    function tick(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setDisplay(start + diff * eased)
      if (progress < 1) ref.current = requestAnimationFrame(tick)
    }
    ref.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current)
  }, [value])

  return <span>{decimals > 0 ? display.toFixed(decimals) : Math.round(display)}</span>
}

function MetricCard({ icon: Icon, label, value, decimals, subtitle, color, trend }) {
  return (
    <div className="glass-card group">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-${color}-500/10 border border-${color}-500/20`}>
          <Icon className={`w-4 h-4 text-${color}-400`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend > 0 ? 'text-red-400' : trend < 0 ? 'text-emerald-400' : 'text-slate-500'
          }`}>
            {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : trend < 0 ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="metric-value text-white/90 mb-1">
        <AnimatedNumber value={value} decimals={decimals} />
      </div>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      {subtitle && <p className="text-[10px] text-slate-500 mt-0.5">{subtitle}</p>}

      {/* Hover glow */}
      <div className={`absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-${color}-500/5 to-transparent pointer-events-none`} />
    </div>
  )
}

function EventTicker({ events }) {
  if (!events.length) return null

  return (
    <div className="glass-card-flush">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-200">Live Event Feed</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400/70 font-mono">{events.length} events</span>
        </div>
      </div>
      <div className="divide-y divide-white/[0.03] max-h-[420px] overflow-y-auto">
        {events.slice(0, 15).map((evt, i) => (
          <EventRow key={i} event={evt} />
        ))}
      </div>
    </div>
  )
}

function EventRow({ event }) {
  const sev = event.severity ?? 0
  const sevColor = sev >= 8 ? 'red' : sev >= 6 ? 'orange' : sev >= 4 ? 'amber' : 'emerald'
  const catColor = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.unknown
  const timeAgo = getTimeAgo(event.timestamp)

  return (
    <div className="px-5 py-3 hover:bg-white/[0.02] transition-colors group cursor-default">
      <div className="flex items-start gap-3">
        <div className="mt-1.5 flex-shrink-0">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: catColor, boxShadow: `0 0 6px ${catColor}40` }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-slate-200 leading-snug line-clamp-2 mb-1.5">
            {event.headline || event.title || 'Untitled Event'}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium severity-${
              sev >= 8 ? 'critical' : sev >= 6 ? 'high' : sev >= 4 ? 'medium' : 'low'
            }`}>
              SEV {sev}
            </span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              {(event.category || 'unknown').replace(/_/g, ' ')}
            </span>
            <span className="text-[10px] text-slate-600">·</span>
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {timeAgo}
            </span>
            {event.confidence != null && (
              <>
                <span className="text-[10px] text-slate-600">·</span>
                <span className="text-[10px] text-slate-500">{Math.round(event.confidence * 100)}% conf</span>
              </>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
      </div>
    </div>
  )
}

function CategoryBreakdown({ stats }) {
  const data = Object.entries(stats.by_category || {}).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
    color: CATEGORY_COLORS[name] || CATEGORY_COLORS.unknown,
  })).sort((a, b) => b.value - a.value)

  if (!data.length) return null

  return (
    <div className="glass-card-flush">
      <div className="px-5 py-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-200">Category Distribution</h3>
        </div>
      </div>
      <div className="p-5">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.slice(0, 8)} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={120}
                tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15,22,41,0.95)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: 8,
                  fontSize: 12
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
                {data.slice(0, 8).map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function SeverityDistribution({ stats }) {
  const data = Object.entries(stats.by_severity || {}).map(([sev, count]) => ({
    severity: `S${sev}`,
    count,
    color: SEVERITY_GRADIENT[Math.min(parseInt(sev), 9)],
  }))

  if (!data.length) return null

  return (
    <div className="glass-card-flush">
      <div className="px-5 py-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-200">Severity Distribution</h3>
        </div>
      </div>
      <div className="p-5">
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -10, right: 0, top: 0, bottom: 0 }}>
              <XAxis dataKey="severity" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15,22,41,0.95)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: 8,
                  fontSize: 12
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={28}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.75} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function TopActors({ stats }) {
  const actors = (stats.top_actors || []).slice(0, 8)
  if (!actors.length) return null

  const max = actors[0]?.[1] || 1

  return (
    <div className="glass-card-flush">
      <div className="px-5 py-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Top Actors</h3>
        </div>
      </div>
      <div className="p-5 space-y-2.5">
        {actors.map(([name, count], i) => (
          <div key={name} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-300 font-medium truncate">{name}</span>
              <span className="text-[10px] text-slate-500 font-mono">{count}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${(count / max) * 100}%`,
                  background: `linear-gradient(90deg, #3b82f6, #06b6d4)`,
                  opacity: 1 - i * 0.08,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ThreatRadar({ stats }) {
  const categories = Object.entries(stats.by_category || {})
  if (categories.length < 3) return null

  const data = categories.slice(0, 6).map(([name, value]) => ({
    subject: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    A: value,
  }))

  return (
    <div className="glass-card-flush">
      <div className="px-5 py-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">Threat Radar</h3>
        </div>
      </div>
      <div className="p-5">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="75%">
              <PolarGrid stroke="rgba(59,130,246,0.1)" />
              <PolarAngleAxis dataKey="subject"
                tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Radar dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function getTimeAgo(ts) {
  if (!ts) return 'unknown'
  try {
    const d = new Date(ts)
    const now = new Date()
    const diff = (now - d) / 1000
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  } catch {
    return 'unknown'
  }
}

export default function Dashboard() {
  const [events, setEvents] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [evtRes, statsRes] = await Promise.all([
          api.getRecentEvents(50),
          api.getEventStats(),
        ])
        setEvents(evtRes.events || [])
        setStats(statsRes)
      } catch (err) {
        console.error('Dashboard load error:', err)
        // Show empty state
        setStats({ total: 0, by_category: {}, by_severity: {}, avg_confidence: 0, avg_severity: 0, top_actors: [], recent_24h: 0 })
      } finally {
        setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [])

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-white/90 tracking-tight">
          Situation Overview
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Real-time global intelligence monitoring and analysis
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          icon={Activity}
          label="Total Events"
          value={stats?.total || 0}
          subtitle="Ingested from all sources"
          color="blue"
        />
        <MetricCard
          icon={Zap}
          label="Last 24 Hours"
          value={stats?.recent_24h || 0}
          subtitle="Events in rolling window"
          color="cyan"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Avg Severity"
          value={stats?.avg_severity || 0}
          decimals={1}
          subtitle="Across all tracked events"
          color="amber"
          trend={stats?.avg_severity > 5 ? 12 : -5}
        />
        <MetricCard
          icon={TrendingUp}
          label="Avg Confidence"
          value={(stats?.avg_confidence || 0) * 100}
          decimals={1}
          subtitle="Classification accuracy"
          color="emerald"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Event Feed — spans 2 cols */}
        <div className="xl:col-span-2">
          <EventTicker events={events} />
        </div>

        {/* Right sidebar stack */}
        <div className="space-y-5">
          <CategoryBreakdown stats={stats || {}} />
          <TopActors stats={stats || {}} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SeverityDistribution stats={stats || {}} />
        <ThreatRadar stats={stats || {}} />
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-56 bg-white/[0.04] rounded-lg" />
        <div className="h-4 w-80 bg-white/[0.03] rounded mt-2" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card h-28" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 glass-card h-80" />
        <div className="glass-card h-80" />
      </div>
    </div>
  )
}
