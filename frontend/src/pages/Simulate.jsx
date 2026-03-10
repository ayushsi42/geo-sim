import { useState } from 'react'
import { api } from '../api/client'
import {
  Crosshair, Play, Loader2, AlertTriangle, ChevronRight,
  Shield, Target, Clock, TrendingUp, FileText, Zap,
  BarChart3, Brain, BookOpen, XCircle
} from 'lucide-react'

const PRESET_SCENARIOS = [
  { actor: 'Russia', action_type: 'military_escalation', target: 'Ukraine', label: 'Russia escalates in Ukraine' },
  { actor: 'China', action_type: 'trade_embargo', target: 'Taiwan', label: 'China imposes Taiwan trade embargo' },
  { actor: 'Iran', action_type: 'nuclear_test', target: null, label: 'Iran conducts nuclear test' },
  { actor: 'NATO', action_type: 'military_deployment', target: 'Baltic States', label: 'NATO deploys to Baltics' },
  { actor: 'North Korea', action_type: 'missile_launch', target: 'Japan', label: 'DPRK launches missile toward Japan' },
  { actor: 'India', action_type: 'diplomatic_break', target: 'Pakistan', label: 'India breaks ties with Pakistan' },
]

export default function Simulate() {
  const [actor, setActor] = useState('')
  const [actionType, setActionType] = useState('')
  const [target, setTarget] = useState('')
  const [depth, setDepth] = useState(5)
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!actor || !actionType) return
    setLoading(true)
    setError(null)
    setReport(null)
    try {
      const result = await api.simulate({
        actor,
        action_type: actionType,
        target: target || null,
        simulation_depth: depth,
      })
      setReport(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function loadPreset(p) {
    setActor(p.actor)
    setActionType(p.action_type)
    setTarget(p.target || '')
    setReport(null)
    setError(null)
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-white/90 tracking-tight">Simulate</h2>
        <p className="text-sm text-slate-500 mt-1">
          Run what-if scenarios through the geopolitical simulation engine
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Input form */}
        <div className="xl:col-span-1 space-y-4">
          {/* Preset scenarios */}
          <div className="glass-card-flush">
            <div className="px-5 py-3 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-200">Quick Scenarios</h3>
              </div>
            </div>
            <div className="p-3 space-y-1">
              {PRESET_SCENARIOS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => loadPreset(p)}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-xs text-slate-400
                             hover:text-slate-200 hover:bg-white/[0.04] transition-all
                             flex items-center justify-between group"
                >
                  <span>{p.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
                </button>
              ))}
            </div>
          </div>

          {/* Custom form */}
          <form onSubmit={handleSubmit} className="glass-card space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Crosshair className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-200">Custom Scenario</h3>
            </div>

            <FormField label="Actor" required>
              <input
                type="text"
                value={actor}
                onChange={e => setActor(e.target.value)}
                placeholder="e.g. Russia, China, NATO"
                className="form-input"
              />
            </FormField>

            <FormField label="Action Type" required>
              <input
                type="text"
                value={actionType}
                onChange={e => setActionType(e.target.value)}
                placeholder="e.g. military_escalation, sanctions"
                className="form-input"
              />
            </FormField>

            <FormField label="Target">
              <input
                type="text"
                value={target}
                onChange={e => setTarget(e.target.value)}
                placeholder="e.g. Ukraine, Taiwan (optional)"
                className="form-input"
              />
            </FormField>

            <FormField label="Simulation Depth">
              <div className="flex items-center gap-3">
                <input
                  type="range" min={2} max={10} step={1}
                  value={depth}
                  onChange={e => setDepth(Number(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-sm font-mono text-slate-300 w-6 text-center">{depth}</span>
              </div>
            </FormField>

            <button
              type="submit"
              disabled={loading || !actor || !actionType}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                         bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400
                         text-white text-sm font-semibold
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all duration-200 shadow-lg shadow-blue-500/20
                         hover:shadow-blue-500/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Simulation
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Results */}
        <div className="xl:col-span-2">
          {error && (
            <div className="glass-card border-red-500/20 mb-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-300 font-medium">Simulation Failed</p>
                  <p className="text-xs text-red-400/70 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!report && !error && !loading && (
            <div className="glass-card text-center py-20">
              <Crosshair className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 font-medium text-lg">Configure a Scenario</p>
              <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                Select a preset scenario or build your own to simulate cascading geopolitical consequences
              </p>
            </div>
          )}

          {loading && (
            <div className="glass-card text-center py-20">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
                <div className="absolute inset-0 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                <Brain className="absolute inset-0 m-auto w-6 h-6 text-blue-400" />
              </div>
              <p className="text-slate-300 font-medium">Running simulation...</p>
              <p className="text-xs text-slate-500 mt-1">Analyzing cascading effects across {depth} decision layers</p>
            </div>
          )}

          {report && <SimulationReport report={report} />}
        </div>
      </div>
    </div>
  )
}

function SimulationReport({ report }) {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Executive Summary */}
      <div className="glass-card border-glow">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-200">Executive Summary</h3>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono">
              Confidence: {Math.round((report.confidence || 0) * 100)}%
            </span>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{report.executive_summary}</p>
      </div>

      {/* Risk Matrix */}
      {report.risk_matrix && Object.keys(report.risk_matrix).length > 0 && (
        <div className="glass-card-flush">
          <div className="px-5 py-3 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-200">Risk Assessment</h3>
            </div>
          </div>
          <div className="p-5 space-y-2.5">
            {Object.entries(report.risk_matrix).sort(([,a],[,b]) => b - a).map(([risk, score]) => (
              <div key={risk}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-300 capitalize">{risk.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] font-mono" style={{ color: riskColor(score) }}>
                    {(score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${score * 100}%`,
                      backgroundColor: riskColor(score),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Most Likely Path */}
      {report.most_likely_path?.length > 0 && (
        <div className="glass-card-flush">
          <div className="px-5 py-3 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-200">Most Likely Path</h3>
            </div>
          </div>
          <div className="p-5">
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-blue-500/50 via-cyan-500/30 to-transparent" />
              {report.most_likely_path.map((step, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-4 top-1 w-3 h-3 rounded-full bg-navy-900 border-2 border-blue-400"
                       style={{ boxShadow: '0 0 8px rgba(59,130,246,0.3)' }} />
                  <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-blue-400 font-mono uppercase">Step {i + 1}</span>
                      {step.probability != null && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          P={typeof step.probability === 'number' ? step.probability.toFixed(2) : step.probability}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {step.description || step.action || JSON.stringify(step)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Key Uncertainties */}
      {report.key_uncertainties?.length > 0 && (
        <div className="glass-card">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200">Key Uncertainties</h3>
          </div>
          <ul className="space-y-2">
            {report.key_uncertainties.map((u, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                <span className="text-indigo-400/60 mt-0.5">•</span>
                {u}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Analogies */}
      {report.analogies?.length > 0 && (
        <div className="glass-card">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-200">Historical Analogies</h3>
          </div>
          <ul className="space-y-2">
            {report.analogies.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                <span className="text-amber-400/60 mt-0.5">→</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="block text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-1.5">
        {label} {required && <span className="text-red-400/60">*</span>}
      </label>
      {children}
      <style>{`
        .form-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          color: #e2e8f0;
          font-size: 0.8125rem;
          transition: all 0.2s;
        }
        .form-input:focus {
          outline: none;
          border-color: rgba(59,130,246,0.3);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
        }
        .form-input::placeholder {
          color: #475569;
        }
      `}</style>
    </div>
  )
}

function riskColor(score) {
  if (score >= 0.7) return '#ef4444'
  if (score >= 0.5) return '#f97316'
  if (score >= 0.3) return '#eab308'
  return '#10b981'
}
