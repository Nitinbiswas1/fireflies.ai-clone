"use client";

import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";

interface TranscriptSearchProps {
  query: string;
  onChange: (q: string) => void;
  matchCount: number;
  currentMatch: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function TranscriptSearch({
  query,
  onChange,
  matchCount,
  currentMatch,
  onPrev,
  onNext,
}: TranscriptSearchProps) {
  return (
    <div className="flex items-center gap-2 px-2.5 sm:px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="relative flex-1">
        <Search
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search transcript…"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-7 pr-7 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors"
        />
        {query && (
          <button
            onClick={() => onChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={11} />
          </button>
        )}
      </div>

      {query && (
        <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
          <span>
            {matchCount === 0
              ? "No results"
              : `${currentMatch + 1} / ${matchCount}`}
          </span>
          <button
            onClick={onPrev}
            disabled={matchCount === 0}
            className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={onNext}
            disabled={matchCount === 0}
            className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
