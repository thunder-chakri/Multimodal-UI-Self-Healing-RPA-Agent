'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Header } from '@/components/layout/Header';
import { OverviewBanner } from '@/components/dashboard/OverviewBanner';
import { AutomationControls } from '@/components/dashboard/AutomationControls';
import { ExecutionHistory } from '@/components/dashboard/ExecutionHistory';
import { FailureReports } from '@/components/dashboard/FailureReports';
import { RunDetailModal } from '@/components/dashboard/RunDetailModal';
import { TestimonialsSection } from '@/components/reviews/TestimonialsSection';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const DashboardMain: React.FC = () => {
  const {
    activeTab,
    isLoading,
    error,
    toast,
    dismissToast,
  } = useDashboard();

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center space-y-4">
        {/* Ambient Gradient Orbs */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="glass-panel p-8 rounded-2xl flex flex-col items-center space-y-4 shadow-xl z-10">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-xs tracking-wider text-slate-800 dark:text-slate-200">
            Hydrating OmniSight Operations Platform...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-md w-full glass-modal border-rose-500/40 rounded-2xl p-6 text-center space-y-3 z-10">
          <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Data Connection Interrupted</h2>
          <p className="text-xs text-rose-400 font-mono">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-grid-pattern text-slate-900 dark:text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-white">
      {/* Background Decorative Mesh Orbs */}
      <div
        className="fixed -top-40 -left-40 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-600/15 to-transparent blur-[140px] pointer-events-none -z-10 animate-pulse"
        aria-hidden="true"
      />
      <div
        className="fixed top-1/4 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-600/15 to-transparent blur-[140px] pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="fixed -bottom-40 left-1/4 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-transparent blur-[150px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Toast Notification Banner */}
      {toast && (
        <div
          role="alert"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl glass-modal shadow-2xl text-xs font-medium animate-in slide-in-from-bottom-3 duration-200 max-w-sm border backdrop-blur-xl"
          style={{
            borderColor:
              toast.type === 'success'
                ? 'rgba(16, 185, 129, 0.6)'
                : toast.type === 'error'
                ? 'rgba(244, 63, 94, 0.6)'
                : toast.type === 'warning'
                ? 'rgba(245, 158, 11, 0.6)'
                : 'rgba(56, 189, 248, 0.6)',
          }}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-500 dark:text-cyan-400 shrink-0" />}
          <span className="flex-1 leading-normal text-slate-800 dark:text-slate-100">{toast.message}</span>
          <button
            onClick={dismissToast}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Persistent Navigation Header */}
      <Header />

      {/* Main Single Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Top KPI & Architecture Overview */}
        <OverviewBanner />

        {/* View Areas */}
        {activeTab === 'all' && (
          <div className="space-y-12">
            {/* Area 1: Automation Controls */}
            <section aria-labelledby="controls-section-heading">
              <AutomationControls />
            </section>

            {/* Area 2: Execution History */}
            <section aria-labelledby="history-section-heading">
              <ExecutionHistory />
            </section>

            {/* Area 3: Failure Reports */}
            <section aria-labelledby="failures-section-heading">
              <FailureReports />
            </section>

            {/* Area 4: Reviews & Feedback */}
            <section aria-labelledby="reviews-section-heading">
              <TestimonialsSection />
            </section>
          </div>
        )}

        {activeTab === 'controls' && (
          <section>
            <AutomationControls />
          </section>
        )}

        {activeTab === 'history' && (
          <section>
            <ExecutionHistory />
          </section>
        )}

        {activeTab === 'failures' && (
          <section>
            <FailureReports />
          </section>
        )}

        {activeTab === 'reviews' && (
          <section>
            <TestimonialsSection />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="glass-header mt-12 py-6 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 dark:border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>OmniSight Multimodal Operations Platform</span>
          </div>
          <span>Autonomous Self-Healing RPA Subsystem &bull; Next-Gen Vision AI</span>
          <span>&copy; {new Date().getFullYear()} OmniSight Enterprise</span>
        </div>
      </footer>

      {/* Details Modal */}
      <RunDetailModal />
    </div>
  );
};
