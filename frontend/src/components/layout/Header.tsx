import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import {
  LayoutDashboard,
  Layers,
  History,
  ShieldAlert,
  Moon,
  Sun,
  Monitor,
  Cpu,
  MessageSquare,
  LucideIcon,
} from 'lucide-react';

interface NavItem {
  id: 'all' | 'controls' | 'history' | 'failures' | 'reviews';
  label: string;
  icon: LucideIcon;
  badge?: number;
  badgeType?: 'alert' | 'live' | 'neutral';
}

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    theme,
    resolvedTheme,
    setTheme,
    automations,
    runs,
  } = useDashboard();

  const activeAutomationsCount = automations.filter((a) => a.status === 'running').length;
  const inProgressRunsCount = runs.filter((r) => r.outcome === 'in_progress').length;
  const failureCount = runs.filter((r) => r.outcome === 'failure').length;

  const navItems: NavItem[] = [
    { id: 'all', label: 'Overview', icon: LayoutDashboard },
    { id: 'controls', label: 'Automation Controls', icon: Layers, badge: activeAutomationsCount },
    { id: 'history', label: 'Execution History', icon: History, badge: inProgressRunsCount, badgeType: 'live' },
    { id: 'failures', label: 'Failure Reports', icon: ShieldAlert, badge: failureCount, badgeType: 'alert' },
    { id: 'reviews', label: 'Operator Reviews', icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Subtitle Branding */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                  OmniSight
                </h1>
                <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded-full bg-cyan-500/10 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                  RPA Agent
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Multimodal UI Self-Healing & Operations Dashboard
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 glass-card p-1 rounded-xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 dark:bg-slate-800/80 text-cyan-600 dark:text-cyan-400 shadow-sm border border-cyan-500/30 dark:border-slate-700/80'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>

                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                        item.badgeType === 'alert'
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          : item.badgeType === 'live'
                          ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 animate-pulse'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Theme & Status Indicators */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs px-2.5 py-1 rounded-lg glass-card text-slate-600 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px]">Engine: Online</span>
            </div>

            {/* Light / System / Dark Mode Switcher */}
            <div
              className="flex items-center p-0.5 rounded-xl glass-card border border-slate-200/80 dark:border-white/10 shadow-inner"
              role="group"
              aria-label="Theme selection"
            >
              <button
                type="button"
                onClick={() => setTheme('light')}
                data-testid="theme-btn-light"
                className={`flex items-center justify-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  theme === 'light'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 shadow-sm border border-amber-500/30'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title="Light mode"
                aria-pressed={theme === 'light'}
                aria-label="Switch to light mode"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden xl:inline text-[11px]">Light</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                data-testid="theme-btn-system"
                className={`flex items-center justify-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  theme === 'system'
                    ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 shadow-sm border border-cyan-500/30'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title={`System mode (${resolvedTheme === 'dark' ? 'currently dark' : 'currently light'})`}
                aria-pressed={theme === 'system'}
                aria-label="Switch to system default theme"
              >
                <Monitor className="w-3.5 h-3.5 text-cyan-500" />
                <span className="hidden xl:inline text-[11px]">Auto</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                data-testid="theme-btn-dark"
                className={`flex items-center justify-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 shadow-sm border border-indigo-500/30'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title="Dark mode"
                aria-pressed={theme === 'dark'}
                aria-label="Switch to dark mode"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden xl:inline text-[11px]">Dark</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-200 dark:border-slate-800/60 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-cyan-500/15 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
