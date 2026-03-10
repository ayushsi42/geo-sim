import { useEffect, useState, useMemo } from 'react'
import { api } from '../api/client'
import {
  Radio, Search, Filter, Clock, ChevronDown, ChevronUp,
  AlertTriangle, Globe2, Swords, Landmark, DollarSign,
  Shield, Flame, BarChart3, X
} from 'lucide-react'

const CATEGORY_META = {
  military_conflict:      { icon: Swords,         color: '#ef4444', bg: 'bg-red-500/10 border-red-500/20' },
  diplomatic_crisis:      { icon: Landmark,        color: '#f59e0b', bg: 'bg-amber-500/10 border-amber-500/20' },
  economic_event:         { icon: DollarSign,      color: '#3b82f6', bg: 'bg-blue-500/10 border-blue-500/20' },
  political_instability:  { icon: AlertTriangle,   color: '#8b5cf6', bg: 'bg-violet-500/10 border-violet-500/20' },
  humanitarian:           { icon: Globe2,          color: '#06b6d4', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  cyber_security:         { icon: Shield,          color: '#10b981', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  terrorism:              { icon: Flame,           color: '#dc2626', bg: 'bg-red-600/10 border-red-600/20' },
  trade_dispute:          { icon: BarChart3,       color: '#f97316', bg: 'bg-orange-500/10 border-orange-500/20' },
  nuclear_proliferation:  { icon: AlertTriangle,   color: '#e11d48', bg: 'bg-rose-500/10 border-rose-500/20' },
  alliance_shift:         { icon: Globe2,          color: '#6366f1', bg: 'bg-indigo-500/10 border-indigo-500/20' },
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
  } catch { return 'unknown' }
}

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [minSeverity, setMinSeverity] = useState(0)
  const [expandedIdx, setExpandedIdx] = useState(null)
  const [sortBy, setSortBy] = useState('time') // time | severity

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getRecentEvents(200)
        setEvents(res.events || [])
      } catch (err) {
        console.error('Events load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  const categories = useMemo(() => {
    const cats = new Set(events.map(e => e.category).filter(Boolean))
    return [...cats].sort()
  }, [events])

  const filtered = useMemo(() => {
    let list = events
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(e =>
        (e.headline || e.title || '').toLowerCase().includes(q) ||
        (e.actors || []).some(a => a.toLowerCase().includes(q)) ||
        (e.location || '').toLowerCase().includes(q)
      )
    }
    if (selectedCategory) {
      list = list.filter(e => e.category === selectedCategory)
    }
    if (minSeverity > 0) {
      list = list.filter(e => (e.severity || 0) >= minSeverity)
    }
    if (sortBy === 'severity') {
      list = [...list].sort((a, b) => (b.severity || 0) - (a.severity || 0))
    }
    return list
  }, [events, search, selectedCategory, minSeverity, sortBy])

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white/90 tracking-tight">Event Feed</h2>
          <p className="text-sm text-slate-500 mt-1">
            {filtered.length} of {events.length} events · Auto-refreshing every 30s
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400/70 font-mono">LIVE</span>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card !p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search events, actors, locations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]
                         text-sm text-slate-200 placeholder:text-slate-600
                         focus:outline-none focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/20
                         transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="relative">
            <select
              value={selectedCategory || ''}
              onChange={e => setSelectedCategory(e.target.value || null)}
              className="appearance-none pl-8 pr-8 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]
                         text-sm text-slate-300 focus:outline-none focus:border-blue-500/30
                         cursor-pointer transition-all"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>

          {/* Severity slider */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Min Severity:</span>
            <input
              type="range" min={0} max={10} step={1}
              value={minSeverity}
              onChange={e => setMinSeverity(Number(e.target.value))}
              className="w-20 accent-blue-500"
            />
            <span className="text-xs text-slate-400 font-mono w-4 text-center">{minSeverity}</span>
          </div>

          {/* Sort */}
          <button
            onClick={() => setSortBy(s => s === 'time' ? 'severity' : 'time')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]
                       text-xs text-slate-400 hover:text-slate-200 hover:border-white/10 transition-all"
          >
            {sortBy === 'time' ? <Clock className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            Sort: {sortBy === 'time' ? 'Latest' : 'Severity'}
          </button>
        </div>
      </div>

      {/* Events list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card h-20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card text-center py-16">
          <Radio className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No events match your filters</p>
          <p className="text-sm text-slate-600 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((evt, i) => (
            <EventCard
              key={i}
              event={evt}
              expanded={expandedIdx === i}
              onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function EventCard({ event, expanded, onToggle }) {
  const sev = event.severity ?? 0
  const meta = CATEGORY_META[event.category] || { icon: Radio, color: '#64748b', bg: 'bg-slate-500/10 border-slate-500/20' }
  const Icon = meta.icon

  return (
    <div
      className={`glass-card-flush transition-all duration-200 cursor-pointer
        ${expanded ? 'ring-1 ring-blue-500/20' : 'hover:border-white/10'}`}
      onClick={onToggle}
    >
      <div className="px-5 py-4 flex items-start gap-4">
        {/* Category icon */}
        <div className={`p-2 rounded-lg border ${meta.bg} flex-shrink-0 mt-0.5`}>
          <Icon className="w-4 h-4" style={{ color: meta.color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-sm text-slate-200 font-medium leading-snug line-clamp-2">
              {event.headline || event.title || 'Untitled Event'}
            </h4>
            <div className="flex items-center gap-2 flex-shrink-0">
              <SeverityBadge severity={sev} />
              {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium"
                  style={{ color: meta.color + 'aa' }}>
              {(event.category || 'unknown').replace(/_/g, ' ')}
            </span>
            {event.actors?.slice(0, 3).map((a, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400">
                {a}
              </span>
            ))}
            <span className="text-[10px] text-slate-600 flex items-center gap-1 ml-auto">
              <Clock className="w-2.5 h-2.5" />
              {getTimeAgo(event.timestamp)}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-4 pt-0 border-t border-white/[0.03] mt-0 space-y-3 animate-fadeIn">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
            <DetailCell label="Confidence" value={event.confidence != null ? `${Math.round(event.confidence * 100)}%` : 'N/A'} />
            <DetailCell label="Source" value={event.source || event.feed_name || 'Unknown'} />
            <DetailCell label="Location" value={event.location || 'Global'} />
            <DetailCell label="Timestamp" value={event.timestamp ? new Date(event.timestamp).toLocaleString() : 'Unknown'} />
          </div>
          {event.actors?.length > 0 && (
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Actors</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {event.actors.map((a, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/15">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
          {event.summary && (
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Summary</span>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{event.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SeverityBadge({ severity }) {
  const cls = severity >= 8 ? 'severity-critical'
    : severity >= 6 ? 'severity-high'
    : severity >= 4 ? 'severity-medium'
    : 'severity-low'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono ${cls}`}>
      SEV {severity}
    </span>
  )
}

function DetailCell({ label, value }) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{label}</span>
      <p className="text-xs text-slate-300 font-medium">{value}</p>
    </div>
  )
}
