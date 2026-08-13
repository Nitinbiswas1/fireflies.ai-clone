"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { formatTimestamp } from "@/lib/utils";

interface MeetingPlayerProps {
  duration: number;
  onTimeUpdate: (currentTime: number) => void;
  onSeek: (seekFn: (time: number) => void) => void;
}

export default function MeetingPlayer({
  duration,
  onTimeUpdate,
  onSeek,
}: MeetingPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const simRef = useRef<number | null>(null);
  const simTimeRef = useRef(0);

  const startSim = useCallback(() => {
    if (simRef.current) return;
    const intervalId = setInterval(() => {
      simTimeRef.current = Math.min(simTimeRef.current + 0.1, duration);
      setCurrentTime(simTimeRef.current);
      onTimeUpdate(simTimeRef.current);
      if (simTimeRef.current >= duration) {
        clearInterval(intervalId);
        simRef.current = null;
        setPlaying(false);
      }
    }, 100);
    simRef.current = intervalId as unknown as number;
  }, [duration, onTimeUpdate]);

  const stopSim = useCallback(() => {
    if (simRef.current) {
      clearInterval(simRef.current);
      simRef.current = null;
    }
  }, []);

  const togglePlay = () => {
    if (playing) {
      stopSim();
      setPlaying(false);
    } else {
      setPlaying(true);
      startSim();
    }
  };

  useEffect(() => {
    onSeek((time: number) => {
      simTimeRef.current = Math.max(0, Math.min(time, duration));
      setCurrentTime(simTimeRef.current);
      onTimeUpdate(simTimeRef.current);
    });
  }, [duration, onSeek, onTimeUpdate]);

  useEffect(() => {
    return () => stopSim();
  }, [stopSim]);

  const displayDuration = duration || 3600;
  const progress = displayDuration > 0 ? (currentTime / displayDuration) * 100 : 0;

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newTime = ratio * displayDuration;
    simTimeRef.current = newTime;
    setCurrentTime(newTime);
    onTimeUpdate(newTime);
  };

  return (
    <div className="bg-white border-b border-slate-200/80 px-6 py-2.5 flex items-center gap-4 select-none">
      {/* Play/pause button */}
      <button
        type="button"
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-white transition-colors shrink-0 shadow-2xs"
      >
        {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>

      {/* Timestamps */}
      <span className="text-xs font-mono font-medium text-slate-600 w-11 text-right shrink-0">
        {formatTimestamp(currentTime)}
      </span>

      {/* Progress bar */}
      <div
        className="flex-1 h-2 bg-slate-100 border border-slate-200/60 rounded-full cursor-pointer relative group"
        onClick={handleScrub}
      >
        <div
          className="h-full bg-purple-600 rounded-full transition-none shadow-2xs"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-purple-700 border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
          style={{ left: `calc(${progress}% - 7px)` }}
        />
      </div>

      <span className="text-xs font-mono text-slate-400 w-11 shrink-0">
        {formatTimestamp(displayDuration)}
      </span>

      {/* Mute toggle */}
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        className="p-1 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
      >
        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      <span className="text-[10px] text-slate-300 font-medium shrink-0 hidden sm:inline">
        Simulated audio player
      </span>
    </div>
  );
}
