import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Radio, Globe2, Crosshair, BarChart3,
  ChevronLeft, ChevronRight, Activity, Zap, Shield
} from 'lucide-react'

const NAV = [
  { to: '/',          label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/events',    label: 'Event Feed',  icon: Radio },
  { to: '/world',     label: 'World State', icon: Globe2 },
  { to: '/simulate',  label: 'Simulate',    icon: Crosshair },
  { to: '/analytics', label: 'Analytics',   icon: BarChart3 },
]

function GeoSimLogo({ collapsed }) {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="relative w-9 h-9 flex-shrink-0">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 opacity-20 blur-sm" />
        <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
      </div>
      {!collapsed && (
        <div className="overflow-hidden">
          <h1 className="text-sm font-bold tracking-[0.2em] text-white/90 uppercase leading-tight">
            Geo-Sim
          </h1>
          <p className="text-[10px] tracking-[0.15em] text-blue-400/60 uppercase">
            Intelligence
          </p>
        </div>
      )}
    </div>
  )
}

function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation()

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen z-40 flex flex-col
        border-r border-white/[0.06]
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[240px]'}
      `}
      style={{
        background: 'linear-gradient(180deg, rgba(10,14,26,0.97) 0%, rgba(5,8,16,0.99) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/[0.04]">
        <GeoSimLogo collapsed={collapsed} />
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to
          return (
            <NavLink
              key={to}
              to={to}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 relative
                ${active
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }
              `}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-blue-400" />
              )}
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {!collapsed && (
                <span className="text-[13px] font-medium truncate">{label}</span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-3">
        {/* System status */}
        {!collapsed && (
          <div className="px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">System</span>
            </div>
            <div className="space-y-1.5">
              <StatusRow label="Pipeline" status="online" />
              <StatusRow label="Kafka" status="online" />
              <StatusRow label="Redis" status="online" />
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                     text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]
                     transition-all duration-200 text-xs"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}

function StatusRow({ label, status }) {
  const isOnline = status === 'online'
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-slate-500">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`}
             style={{ boxShadow: isOnline ? '0 0 4px rgba(52,211,153,0.5)' : '0 0 4px rgba(248,113,113,0.5)' }} />
        <span className={`text-[10px] ${isOnline ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
          {status}
        </span>
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/[0.04]
                        bg-navy-950/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] text-emerald-400/80 font-medium uppercase tracking-wider">Live</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <span className="text-xs text-slate-500 font-mono">
          {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
          <div className="w-2 h-2 rounded-full bg-emerald-400 status-dot-live" />
          <span className="text-[11px] text-slate-400 font-medium">All Systems Operational</span>
        </div>
      </div>
    </header>
  )
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 bg-grid noise-overlay">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[240px]'}`}>
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
