import React, { useState, useMemo } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { OutcomeBadge } from '@/components/common/OutcomeBadge';
import { ViewFilterOutcome, SortOrder, AutomationRun } from '@/types/dashboard';
import { VideoPlaybackWindow } from './VideoPlaybackWindow';
import {
  History,
  Filter,
  ArrowUpDown,
  Search,
  ChevronRight,
  Sparkles,
  Clock,
  Inbox,
  Film,
} from 'lucide-react';

export const ExecutionHistory: React.FC = () => {
  const { runs, automations, selectedRunId, selectRun } = useDashboard();
  const [videoModalRun, setVideoModalRun] = useState<AutomationRun | null>(null);

  // Filters & Sorting state
  const [selectedAutomationFilter, setSelectedAutomationFilter] = useState<string>('all');
  const [selectedOutcomeFilter, setSelectedOutcomeFilter] = useState<ViewFilterOutcome>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAndSortedRuns = useMemo(() => {
    return runs
      .filter((run) => {
        // Automation Filter
        if (selectedAutomationFilter !== 'all' && run.automationId !== selectedAutomationFilter) {
          return false;
        }
        // Outcome Filter
        if (selectedOutcomeFilter !== 'all' && run.outcome !== selectedOutcomeFilter) {
          return false;
        }
        // Text Search
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchesId = run.id.toLowerCase().includes(q);
          const matchesName = run.automationName.toLowerCase().includes(q);
          return matchesId || matchesName;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.startTime).getTime();
        const timeB = new Date(b.startTime).getTime();

        switch (sortOrder) {
          case 'newest':
            return timeB - timeA;
          case 'oldest':
            return timeA - timeB;
          case 'duration_desc':
            return b.durationSeconds - a.durationSeconds;
          case 'duration_asc':
            return a.durationSeconds - b.durationSeconds;
          default:
            return timeB - timeA;
        }
      });
  }, [runs, selectedAutomationFilter, selectedOutcomeFilter, sortOrder, searchQuery]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const rem = seconds % 60;
    return `${mins}m ${rem}s`;
  };

  const formatStartTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            Execution History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chronological log of automated and manual runs across all registered workflows
          </p>
        </div>
        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Showing <strong>{filteredAndSortedRuns.length}</strong> of <strong>{runs.length}</strong> runs
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search input */}
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search run ID or automation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input rounded-xl pl-8 pr-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Automation Filter */}
          <div className="flex items-center gap-1.5 glass-card px-3 py-2 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              aria-label="Filter by automation"
              value={selectedAutomationFilter}
              onChange={(e) => setSelectedAutomationFilter(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-slate-900">All Automations</option>
              {automations.map((a) => (
                <option key={a.id} value={a.id} className="bg-white dark:bg-slate-900">
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Outcome Filter */}
          <div className="flex items-center gap-1.5 glass-card px-3 py-2 rounded-xl">
            <span className="text-slate-400">Outcome:</span>
            <select
              aria-label="Filter by outcome"
              value={selectedOutcomeFilter}
              onChange={(e) => setSelectedOutcomeFilter(e.target.value as ViewFilterOutcome)}
              className="bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-slate-900">All Outcomes</option>
              <option value="in_progress" className="bg-white dark:bg-slate-900">In Progress</option>
              <option value="success" className="bg-white dark:bg-slate-900">Success</option>
              <option value="failure" className="bg-white dark:bg-slate-900">Failure</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 glass-card px-3 py-2 rounded-xl">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              aria-label="Sort runs"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-white dark:bg-slate-900">Newest First</option>
              <option value="oldest" className="bg-white dark:bg-slate-900">Oldest First</option>
              <option value="duration_desc" className="bg-white dark:bg-slate-900">Duration (High to Low)</option>
              <option value="duration_asc" className="bg-white dark:bg-slate-900">Duration (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Execution Table */}
      {filteredAndSortedRuns.length === 0 ? (
        <div className="rounded-2xl glass-panel p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full glass-card mx-auto flex items-center justify-center text-slate-400">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No matching execution runs</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria, clearing active filters, or triggering a manual run from Automation Controls.
          </p>
          <button
            onClick={() => {
              setSelectedAutomationFilter('all');
              setSelectedOutcomeFilter('all');
              setSearchQuery('');
            }}
            className="text-xs px-3.5 py-1.5 rounded-xl glass-btn text-slate-700 dark:text-slate-300 font-medium"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="rounded-2xl glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold bg-black/5 dark:bg-white/5">
                  <th className="py-3.5 px-4">Run ID</th>
                  <th className="py-3.5 px-4">Automation Name</th>
                  <th className="py-3.5 px-4">Start Time</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Pipeline Status</th>
                  <th className="py-3.5 px-4">Outcome</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                {filteredAndSortedRuns.map((run) => {
                  const isSelected = selectedRunId === run.id;
                  const hasSelfHealing = run.selfHealingEvents.length > 0;

                  return (
                    <tr
                      key={run.id}
                      data-testid={`run-row-${run.id}`}
                      onClick={() => selectRun(isSelected ? null : run.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-cyan-500/15 border-l-4 border-cyan-500 shadow-inner'
                          : 'hover:bg-cyan-500/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {/* Run ID */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span>{run.id}</span>
                          {hasSelfHealing && (
                            <span
                              title="Self-healing events recorded"
                              className="text-amber-500 dark:text-amber-400 bg-amber-500/10 p-0.5 rounded"
                            >
                              <Sparkles className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Automation Name */}
                      <td className="py-3.5 px-4 text-slate-900 dark:text-slate-100 font-medium">
                        {run.automationName}
                      </td>

                      {/* Start Time */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatStartTime(run.startTime)}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-mono">
                        {formatDuration(run.durationSeconds)}
                      </td>

                      {/* Pipeline Progress bar */}
                      <td className="py-3.5 px-4 min-w-[140px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                            <span>Step {run.currentStepIndex}/7</span>
                            <span>{run.progressPercent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                run.outcome === 'failure'
                                  ? 'bg-rose-500'
                                  : run.outcome === 'success'
                                  ? 'bg-emerald-500'
                                  : 'bg-cyan-400'
                              }`}
                              style={{ width: `${run.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Outcome Badge */}
                      <td className="py-3.5 px-4">
                        <OutcomeBadge outcome={run.outcome} size="sm" />
                      </td>

                      {/* Details & Video triggers */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setVideoModalRun(run);
                            }}
                            className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 transition-all shadow-xs flex items-center gap-1 text-[11px] font-medium"
                            title={`Watch session video replay for ${run.id}`}
                            aria-label={`Watch video playback for ${run.id}`}
                          >
                            <Film className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Replay</span>
                          </button>

                          <button
                            aria-label={`Open details for run ${run.id}`}
                            className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors ${
                              isSelected ? 'text-cyan-500 bg-cyan-500/20' : ''
                            }`}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Video Playback Modal Window */}
      {videoModalRun && (
        <VideoPlaybackWindow
          run={videoModalRun}
          isOpen={Boolean(videoModalRun)}
          onClose={() => setVideoModalRun(null)}
        />
      )}
    </div>
  );
};
