'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AutomationRun } from '@/types/dashboard';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Film,
  Sparkles,
  Gauge,
  X,
} from 'lucide-react';

interface VideoPlaybackWindowProps {
  run: AutomationRun;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoPlaybackWindow: React.FC<VideoPlaybackWindowProps> = ({
  run,
  isOpen,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(Math.max(12, run.durationSeconds || 18));
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chapters' | 'healing' | 'audit'>('chapters');

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Active testing video source: use run.videoPlaybackUrl or fallback to /sample-run.mp4
  const videoSrc = run.videoPlaybackUrl || '/sample-run.mp4';
  const [useRealVideo, setUseRealVideo] = useState<boolean>(true);
  const [videoLoadError, setVideoLoadError] = useState<boolean>(false);
  const hasRealVideo = useRealVideo && !videoLoadError;

  // Generate synthetic chapters mapping to the 7 RPA workflow stages if not provided
  const chapters = run.videoChapters || [
    { timeSeconds: 0, label: 'Task Input Ingestion', stepId: 1 },
    { timeSeconds: Math.floor(duration * 0.15), label: 'DOM & Multimodal Vision Observation', stepId: 2 },
    { timeSeconds: Math.floor(duration * 0.30), label: 'Action Decisioning & Selector Matching', stepId: 3 },
    { timeSeconds: Math.floor(duration * 0.45), label: 'RPA Browser Action Dispatch', stepId: 4 },
    { timeSeconds: Math.floor(duration * 0.65), label: 'Expected State Verification & Visual Diff', stepId: 5 },
    { timeSeconds: Math.floor(duration * 0.82), label: 'Task Completion Audit', stepId: 6 },
    { timeSeconds: Math.floor(duration * 0.95), label: 'Telemetry & Persist Execution Log', stepId: 7 },
  ];

  // Current active chapter based on currentTime
  const currentChapter = [...chapters]
    .reverse()
    .find((ch) => currentTime >= ch.timeSeconds) || chapters[0];

  // Self-healing timestamp (usually around step 4/5)
  const healingTime = Math.floor(duration * 0.55);
  const isNearHealing = run.selfHealingEvents.length > 0 && Math.abs(currentTime - healingTime) <= 3;

  // Synthetic timer ticker for preview when video is paused/playing without real media file
  useEffect(() => {
    if (!isOpen) return;

    if (!hasRealVideo && isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            return 0; // Loop or end
          }
          return Math.min(duration, +(prev + 0.25 * playbackSpeed).toFixed(2));
        });
      }, 250);
      return () => clearInterval(interval);
    }
  }, [isOpen, isPlaying, duration, playbackSpeed, hasRealVideo]);

  // Sync playback speed with the HTML5 video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, hasRealVideo]);

  // Handle real video time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const togglePlay = () => {
    if (hasRealVideo && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay policies might require mute
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().catch(() => {});
            }
          });
        }
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (hasRealVideo && videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-playback-heading"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-[92vh] glass-modal rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 border border-cyan-500/30"
      >
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between px-6 py-3.5 border-b border-slate-200 dark:border-slate-800/80 bg-black/5 dark:bg-white/5 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="video-playback-heading" className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-white">
                  Agent Session Video Playback
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                  {run.id}
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  {run.outcome === 'success' ? '100% Verified' : run.outcome === 'failure' ? 'Incident Trace' : 'Live Capture'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {run.automationName} &bull; Multimodal DOM & Browser Canvas Recording
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 rounded-xl glass-card text-xs">
              <button
                type="button"
                onClick={() => setUseRealVideo(true)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  useRealVideo && !videoLoadError
                    ? 'bg-cyan-500 text-white font-bold shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                MP4 Video
              </button>
              <button
                type="button"
                onClick={() => setUseRealVideo(false)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  !useRealVideo || videoLoadError
                    ? 'bg-cyan-500 text-white font-bold shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                AI Scanner
              </button>
            </div>

            <button
              onClick={() => handleSeek(0)}
              className="p-2 rounded-xl glass-btn text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              title="Restart Recording"
              aria-label="Restart Video"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl glass-btn text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              title="Toggle Fullscreen"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl glass-btn text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              aria-label="Close Playback Window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Canvas & Telemetry Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 8 Cols: Video Stage */}
            <div className="lg:col-span-8 flex flex-col space-y-3">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/30 shadow-2xl flex items-center justify-center group">
                {hasRealVideo ? (
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    className="w-full h-full object-contain cursor-pointer"
                    onTimeUpdate={handleTimeUpdate}
                    onError={() => setVideoLoadError(true)}
                    muted={isMuted}
                    autoPlay
                    loop
                    playsInline
                    onClick={togglePlay}
                  />
                ) : (
                  /* High-Fidelity Synthetic Browser Canvas Simulation */
                  <div className="relative w-full h-full bg-slate-900 overflow-hidden flex flex-col">
                    {/* Simulated Browser Chrome Bar */}
                    <div className="h-8 bg-slate-950/90 border-b border-slate-800 px-3 flex items-center justify-between select-none">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                      <div className="flex-1 max-w-md mx-3 px-3 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 truncate text-center">
                        https://ops.internal.network/app/run/{run.id.toLowerCase()}
                      </div>
                      <div className="text-[10px] font-mono text-cyan-400 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        REC
                      </div>
                    </div>

                    {/* Simulated Browser Viewport Stage */}
                    <div className="flex-1 relative bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 flex flex-col justify-between">
                      {/* Ambient Grid overlay */}
                      <div
                        className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-25 pointer-events-none"
                      />

                      {/* Laser Scanline */}
                      {isPlaying && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-pulse pointer-events-none" />
                      )}

                      {/* Stage Badge & Timestamp overlay */}
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="px-3 py-1 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs flex items-center gap-2 backdrop-blur-md">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                          <span>STAGE {currentChapter.stepId}: {currentChapter.label.toUpperCase()}</span>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-black/60 font-mono text-[11px] text-slate-300 backdrop-blur-md border border-white/10">
                          T+{formatSeconds(currentTime)} / {formatSeconds(duration)}
                        </div>
                      </div>

                      {/* Center Visual Mock: UI Element Targeted with Bounding Box */}
                      <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center space-y-3">
                        <div className={`p-4 rounded-2xl border-2 transition-all duration-300 backdrop-blur-md max-w-md w-full ${
                          isNearHealing
                            ? 'border-amber-400 bg-amber-500/15 ring-4 ring-amber-400/30'
                            : 'border-cyan-400/80 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                        }`}>
                          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px] font-mono">
                            <span className="text-slate-300">Target Element Inspector</span>
                            <span className={isNearHealing ? 'text-amber-400 font-bold' : 'text-cyan-400 font-semibold'}>
                              {isNearHealing ? '⚡ Self-Healing Triggered' : 'Confidence: 98.4%'}
                            </span>
                          </div>
                          <div className="py-2 text-left font-mono text-xs space-y-1">
                            <div className="text-slate-400 text-[10px]">Active Selector:</div>
                            <div className="text-white bg-black/40 px-2.5 py-1 rounded-lg truncate">
                              {isNearHealing
                                ? 'button[role="button"][name="confirm-action"]'
                                : 'button#btn-submit.btn-primary[data-action="execute"]'}
                            </div>
                            <div className="text-slate-400 text-[10px] pt-1">Multimodal Vision Diff:</div>
                            <div className="text-cyan-300 text-[11px]">
                              {isNearHealing
                                ? 'Glyph matched with +95.8% spatial invariant confidence.'
                                : 'Visual bounding box (x: 482, y: 196, w: 140, h: 42) calibrated.'}
                            </div>
                          </div>
                        </div>

                        {/* Artificial Cursor Click Indicator */}
                        {isPlaying && (
                          <div
                            className="w-5 h-5 rounded-full border-2 border-cyan-300 bg-cyan-400/40 pointer-events-none animate-ping"
                            style={{
                              transform: `translate(${(currentTime * 12) % 60}px, ${(currentTime * 8) % 40}px)`,
                            }}
                          />
                        )}
                      </div>

                      {/* Bottom Status bar inside canvas */}
                      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-black/60 p-2 rounded-xl border border-white/10 backdrop-blur-md">
                        <span>Agent Engine: Playwright Chromium v124</span>
                        <span className="text-slate-300">Viewport: 1440x900 @ 60fps</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Big Center Play Button Overlay on Pause */}
                {!isPlaying && (
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs transition-opacity"
                    aria-label="Resume Video Playback"
                  >
                    <div className="w-16 h-16 rounded-full bg-cyan-500/90 text-white flex items-center justify-center shadow-xl shadow-cyan-500/40 transform hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 fill-current ml-1" />
                    </div>
                  </button>
                )}
              </div>

              {/* Video Player Controller Bar */}
              <div className="p-3.5 rounded-2xl glass-card space-y-2">
                {/* Seek Bar with Chapter Markers */}
                <div className="relative w-full group">
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={currentTime}
                    onChange={(e) => handleSeek(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none"
                    aria-label="Seek timeline"
                  />
                  {/* Visual Step Markers on Timeline */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 pointer-events-none flex justify-between px-1">
                    {chapters.map((ch) => {
                      const posPercent = (ch.timeSeconds / duration) * 100;
                      return (
                        <div
                          key={ch.stepId}
                          style={{ left: `${posPercent}%` }}
                          title={`Stage ${ch.stepId}: ${ch.label}`}
                          className="absolute w-1.5 h-3 bg-white/40 dark:bg-slate-400/40 rounded-full"
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Controls Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlay}
                      className="p-2 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 rounded-xl glass-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <div className="font-mono text-slate-700 dark:text-slate-300">
                      <span>{formatSeconds(currentTime)}</span>
                      <span className="text-slate-400"> / </span>
                      <span className="text-slate-500">{formatSeconds(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 glass-card px-2 py-1 rounded-xl font-mono text-[11px]">
                      <Gauge className="w-3.5 h-3.5 text-cyan-500" />
                      <span className="text-slate-500 mr-1">Speed:</span>
                      {[0.5, 1, 1.5, 2].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setPlaybackSpeed(spd)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            playbackSpeed === spd
                              ? 'bg-cyan-500 text-white'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Chapter Navigation, Healing Inspector & Telemetry */}
            <div className="lg:col-span-4 space-y-3">
              {/* Tabs */}
              <div className="flex items-center p-1 rounded-xl glass-card gap-1 text-xs">
                <button
                  onClick={() => setActiveTab('chapters')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                    activeTab === 'chapters'
                      ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/30'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Chapters ({chapters.length})
                </button>
                <button
                  onClick={() => setActiveTab('healing')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 ${
                    activeTab === 'healing'
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Healing ({run.selfHealingEvents.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                    activeTab === 'audit'
                      ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/30'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Audit
                </button>
              </div>

              {/* Tab 1: Stage Chapters List */}
              {activeTab === 'chapters' && (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {chapters.map((ch) => {
                    const isActive = currentChapter.stepId === ch.stepId;
                    return (
                      <div
                        key={ch.stepId}
                        onClick={() => handleSeek(ch.timeSeconds)}
                        className={`p-2.5 rounded-xl transition-all cursor-pointer text-xs border ${
                          isActive
                            ? 'bg-cyan-500/15 border-cyan-500/50 shadow-md shadow-cyan-500/10 text-slate-900 dark:text-white font-semibold ring-1 ring-cyan-500/40'
                            : 'glass-card border-slate-200/60 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-cyan-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={`w-5 h-5 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold ${
                                isActive
                                  ? 'bg-cyan-500 text-white'
                                  : 'bg-black/10 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {ch.stepId}
                            </span>
                            <span className="truncate">{ch.label}</span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 shrink-0">
                            {formatSeconds(ch.timeSeconds)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 2: Self-Healing Events */}
              {activeTab === 'healing' && (
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 text-xs">
                  {run.selfHealingEvents.length === 0 ? (
                    <div className="p-6 rounded-2xl glass-card text-center space-y-2 text-slate-500">
                      <Sparkles className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="text-xs">No element displacement or selector healing required during this run.</p>
                    </div>
                  ) : (
                    run.selfHealingEvents.map((evt, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSeek(healingTime)}
                        className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2 cursor-pointer hover:bg-amber-500/20 transition-colors"
                      >
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="font-bold text-amber-500 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            Step {evt.stepId} Healed
                          </span>
                          <span className="text-amber-400 font-bold">{evt.confidenceScore}% conf</span>
                        </div>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-normal">
                          {evt.triggerReason}
                        </p>
                        <div className="p-2 rounded bg-black/40 font-mono text-[10px] space-y-0.5">
                          <div className="text-rose-400 truncate">- Old: {evt.originalTarget}</div>
                          <div className="text-emerald-400 truncate">+ New: {evt.healedTarget}</div>
                        </div>
                        <span className="text-[10px] text-amber-400/80 font-mono flex items-center gap-1">
                          Jump to video timestamp &rarr;
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: Execution Telemetry */}
              {activeTab === 'audit' && (
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 text-xs font-mono">
                  <div className="p-3 rounded-xl glass-card space-y-1.5">
                    <div className="text-slate-500 text-[10px] uppercase">Recorded Run ID</div>
                    <div className="text-cyan-400 font-bold">{run.id}</div>
                  </div>
                  <div className="p-3 rounded-xl glass-card space-y-1.5">
                    <div className="text-slate-500 text-[10px] uppercase">Automation Name</div>
                    <div className="text-slate-200">{run.automationName}</div>
                  </div>
                  <div className="p-3 rounded-xl glass-card space-y-1.5">
                    <div className="text-slate-500 text-[10px] uppercase">Playback Duration</div>
                    <div className="text-slate-200">{duration}s total ({Math.floor(duration / 60)}m {duration % 60}s)</div>
                  </div>
                  <div className="p-3 rounded-xl glass-card space-y-1.5">
                    <div className="text-slate-500 text-[10px] uppercase">Execution Outcome</div>
                    <div className={run.outcome === 'success' ? 'text-emerald-400' : run.outcome === 'failure' ? 'text-rose-400' : 'text-cyan-400'}>
                      {run.outcome.toUpperCase()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800/80 bg-black/5 dark:bg-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>OmniSight High-Definition Multimodal Session Replay</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl glass-btn text-slate-800 dark:text-slate-200 font-semibold"
          >
            Close Playback
          </button>
        </div>
      </div>
    </div>
  );
};
