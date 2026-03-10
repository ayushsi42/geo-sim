import { useEffect, useState } from 'react'
import { api } from '../api/client'
import {
  Globe2, Users, Shield, Swords, TrendingDown, TrendingUp,
  AlertTriangle, Handshake, ChevronRight, Loader2, Crown,
  Activity, Landmark
} from 'lucide-react'

const REGIME_COLORS = {
  democracy: '#10b981',
  authoritarian: '#ef4444',
  hybrid: '#f59e0b',
  theocracy: '#8b5cf6',
  communist: '#dc2626',
  monarchy: '#6366f1',
}

function tensionColor(score) {
  if (score >= 8) return '#ef4444'
  if (score >= 6) return '#f97316'
  if (score >= 4) return '#eab308'
  if (score >= 2) return '#22c55e'
  return '#10b981'
}

function tensionLabel(score) {
  if (score >= 8) return 'Critical'
  if (score >= 6) return 'High'
  if (score >= 4) return 'Elevated'
  if (score >= 2) return 'Low'
  return 'Stable'
}

export default function WorldState() {
  const [state, setWorldState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [view, setView] = useState('countries') // countries | tensions | alliances | conflicts

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getCurrentState()
        setWorldState(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <WorldStateSkeleton />

  if (error) {
    return (
      <div className="animate-fadeIn">
        <h2 className="text-2xl font-bold text-white/90 tracking-tight mb-2">World State</h2>
        <div className="glass-card text-center py-16">
          <AlertTriangle className="w-12 h-12 text-amber-400/50 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">State Not Initialized</p>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
            Run the state builder to initialize the GlobalState in Redis.
            <code className="block mt-2 text-xs text-blue-400/70 font-mono bg-white/[0.03] rounded px-3 py-2">
              python scripts/bootstrap_state.py
            </code>
          </p>
        </div>
      </div>
    )
  }

  const structured = state?.structured || {}
  const countries = Object.values(structured.countries || {})
  const dyads = Object.values(structured.dyads || {})
  const alliances = Object.values(structured.alliances || {})
  const conflicts = structured.conflicts || []

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white/90 tracking-tight">World State</h2>
          <p className="text-sm text-slate-500 mt-1">
            {countries.length} countries · {dyads.length} dyadic relationships · {conflicts.length} active conflicts
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Snapshot: {structured.snapshot_id?.slice(0, 8) || 'N/A'}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 p-1 bg-white/[0.02] rounded-lg border border-white/[0.04] w-fit">
        {[
          { key: 'countries', label: 'Countries', icon: Globe2 },
          { key: 'tensions', label: 'Tensions', icon: Activity },
          { key: 'alliances', label: 'Alliances', icon: Handshake },
          { key: 'conflicts', label: 'Conflicts', icon: Swords },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
              ${view === key
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'text-slate-500 hover:text-slate-300'
              }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Country detail modal */}
      {selectedCountry && (
        <CountryDetail
          country={selectedCountry}
          dyads={dyads}
          onClose={() => setSelectedCountry(null)}
        />
      )}

      {/* Views */}
      {view === 'countries' && (
        <CountriesGrid countries={countries} onSelect={setSelectedCountry} />
      )}
      {view === 'tensions' && (
        <TensionMatrix dyads={dyads} />
      )}
      {view === 'alliances' && (
        <AllianceList alliances={alliances} />
      )}
      {view === 'conflicts' && (
        <ConflictList conflicts={conflicts} />
      )}
    </div>
  )
}

function CountriesGrid({ countries, onSelect }) {
  const sorted = [...countries].sort((a, b) => (b.military_power_index || 0) - (a.military_power_index || 0))
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sorted.map(c => (
        <div
          key={c.country_id}
          className="glass-card group cursor-pointer"
          onClick={() => onSelect(c)}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                {c.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded border"
                      style={{
                        color: (REGIME_COLORS[c.regime_type] || '#64748b') + 'cc',
                        borderColor: (REGIME_COLORS[c.regime_type] || '#64748b') + '30',
                        backgroundColor: (REGIME_COLORS[c.regime_type] || '#64748b') + '10',
                      }}>
                  {c.regime_type}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </div>

          {/* Leader */}
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-3 h-3 text-amber-400/60" />
            <span className="text-xs text-slate-400">{c.leader}</span>
            <StabilityTag value={c.leader_stability} />
          </div>

          {/* Key metrics grid */}
          <div className="grid grid-cols-3 gap-2">
            <MiniMetric label="GDP" value={formatGDP(c.gdp)} sub={`${c.gdp_growth > 0 ? '+' : ''}${c.gdp_growth}%`} />
            <MiniMetric label="Military" value={c.military_power_index?.toFixed(2)} />
            <MiniMetric label="Nukes" value={c.nuclear_weapons || 0} highlight={c.nuclear_weapons > 0} />
          </div>

          {/* Stability bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-500">Internal Stability</span>
              <span className="text-[10px] text-slate-400 font-mono">{(c.internal_stability * 100).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${c.internal_stability * 100}%`,
                  background: c.internal_stability > 0.7 ? '#10b981'
                    : c.internal_stability > 0.4 ? '#eab308'
                    : '#ef4444',
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function TensionMatrix({ dyads }) {
  const sorted = [...dyads].sort((a, b) => b.tension_score - a.tension_score)

  return (
    <div className="glass-card-flush">
      <div className="px-5 py-3 border-b border-white/[0.04]">
        <h3 className="text-sm font-semibold text-slate-200">Dyadic Tension Scores</h3>
        <p className="text-xs text-slate-500 mt-0.5">{dyads.length} relationships tracked</p>
      </div>
      <div className="divide-y divide-white/[0.03]">
        {sorted.map((d, i) => (
          <div key={i} className="px-5 py-3 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-2 w-48">
              <span className="text-xs text-slate-300 font-medium">{d.country_a}</span>
              <span className="text-[10px] text-slate-600">↔</span>
              <span className="text-xs text-slate-300 font-medium">{d.country_b}</span>
            </div>
            <div className="flex-1">
              <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${d.tension_score * 10}%`,
                    backgroundColor: tensionColor(d.tension_score),
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 w-32 justify-end">
              <span className="text-xs font-mono font-bold" style={{ color: tensionColor(d.tension_score) }}>
                {d.tension_score.toFixed(1)}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded border"
                    style={{
                      color: tensionColor(d.tension_score) + 'cc',
                      borderColor: tensionColor(d.tension_score) + '30',
                      backgroundColor: tensionColor(d.tension_score) + '10',
                    }}>
                {tensionLabel(d.tension_score)}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 w-24 text-right capitalize">
              {d.diplomatic_status}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AllianceList({ alliances }) {
  if (!alliances.length) {
    return (
      <div className="glass-card text-center py-12">
        <Handshake className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">No alliances in current state</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {alliances.map(a => (
        <div key={a.alliance_id} className="glass-card">
          <div className="flex items-center gap-2 mb-3">
            <Handshake className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200">{a.name}</h3>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {a.members.map(m => (
              <span key={m} className="text-[11px] px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/15">
                {m}
              </span>
            ))}
          </div>
          {a.treaties?.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Treaties</span>
              {a.treaties.map((t, i) => (
                <p key={i} className="text-xs text-slate-400">{t}</p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ConflictList({ conflicts }) {
  if (!conflicts.length) {
    return (
      <div className="glass-card text-center py-12">
        <Shield className="w-10 h-10 text-emerald-500/30 mx-auto mb-3" />
        <p className="text-slate-400">No active conflicts in current state</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {conflicts.map((c, i) => (
        <div key={i} className="glass-card">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-semibold text-slate-200">{c.conflict_id}</h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                  style={{
                    color: tensionColor(c.intensity),
                    backgroundColor: tensionColor(c.intensity) + '15',
                    border: `1px solid ${tensionColor(c.intensity)}30`,
                  }}>
              Intensity: {c.intensity}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1">Participants:</span>
            {c.participants.map((p, j) => (
              <span key={j} className="text-[11px] px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/15">
                {p}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function CountryDetail({ country: c, dyads, onClose }) {
  const relatedDyads = dyads.filter(d => d.country_a === c.country_id || d.country_b === c.country_id)
    .sort((a, b) => b.tension_score - a.tension_score)

  return (
    <div className="glass-card border-glow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white/90">{c.name}</h3>
          <p className="text-xs text-slate-400">ID: {c.country_id}</p>
        </div>
        <button onClick={onClose}
          className="text-slate-500 hover:text-red-400 transition-colors text-xs px-2 py-1 rounded hover:bg-red-500/10">
          Close ✕
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <InfoCell icon={Crown} label="Leader" value={c.leader} />
        <InfoCell icon={Landmark} label="Regime" value={c.regime_type} />
        <InfoCell icon={TrendingUp} label="GDP Growth" value={`${c.gdp_growth}%`} />
        <InfoCell icon={Shield} label="Military Index" value={c.military_power_index?.toFixed(2)} />
      </div>
      {relatedDyads.length > 0 && (
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Key Relationships</span>
          <div className="mt-2 space-y-1.5">
            {relatedDyads.slice(0, 5).map((d, i) => {
              const other = d.country_a === c.country_id ? d.country_b : d.country_a
              return (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 w-24 truncate">{other}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${d.tension_score * 10}%`,
                      backgroundColor: tensionColor(d.tension_score),
                    }} />
                  </div>
                  <span className="font-mono text-[10px]" style={{ color: tensionColor(d.tension_score) }}>
                    {d.tension_score.toFixed(1)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function MiniMetric({ label, value, sub, highlight }) {
  return (
    <div className="text-center">
      <p className={`text-sm font-bold font-mono ${highlight ? 'text-amber-400' : 'text-slate-200'}`}>
        {value}
      </p>
      <p className="text-[10px] text-slate-500">{label}</p>
      {sub && <p className="text-[9px] text-slate-600">{sub}</p>}
    </div>
  )
}

function StabilityTag({ value }) {
  const pct = Math.round(value * 100)
  const color = pct > 70 ? 'emerald' : pct > 40 ? 'amber' : 'red'
  return (
    <span className={`text-[9px] px-1 py-0.5 rounded bg-${color}-500/10 text-${color}-400 border border-${color}-500/15 font-mono`}>
      {pct}%
    </span>
  )
}

function InfoCell({ icon: Icon, label, value }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <Icon className="w-3 h-3 text-slate-500" />
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs text-slate-300 font-medium capitalize">{value}</p>
    </div>
  )
}

function formatGDP(gdp) {
  if (!gdp) return 'N/A'
  if (gdp >= 1e12) return `$${(gdp / 1e12).toFixed(1)}T`
  if (gdp >= 1e9) return `$${(gdp / 1e9).toFixed(0)}B`
  if (gdp >= 1e6) return `$${(gdp / 1e6).toFixed(0)}M`
  return `$${gdp}`
}

function WorldStateSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-44 bg-white/[0.04] rounded-lg" />
        <div className="h-4 w-72 bg-white/[0.03] rounded mt-2" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="glass-card h-48" />)}
      </div>
    </div>
  )
}
