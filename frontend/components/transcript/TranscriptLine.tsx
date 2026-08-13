"use client";

import { formatTimestamp } from "@/lib/utils";
import { avatarColor, getInitials } from "@/lib/utils";
import type { TranscriptSegment } from "@/types/meeting";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, query: string) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-amber-200 text-amber-900 dark:bg-amber-900/80 dark:text-amber-100 rounded px-0.5 font-medium">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

interface TranscriptLineProps {
  segment: TranscriptSegment;
  isActive: boolean;
  searchQuery: string;
  onSeek: (time: number) => void;
}

export default function TranscriptLine({
  segment,
  isActive,
  searchQuery,
  onSeek,
}: TranscriptLineProps) {
  const speaker = segment.speaker;
  const initial = speaker ? getInitials(speaker.name) : "?";
  const color = speaker ? avatarColor(speaker.name) : "bg-slate-400";

  return (
    <div
      onClick={() => onSeek(segment.start_time)}
      className={`flex gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all group ${
        isActive
          ? "bg-purple-50/80 border border-purple-200/90 shadow-2xs dark:bg-purple-950/60 dark:border-purple-800/80"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent"
      }`}
    >
      {/* Speaker avatar */}
      <div className="shrink-0 pt-0.5">
        {speaker?.avatar_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={speaker.avatar_url}
            alt={speaker.name}
            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />
        ) : (
          <div
            className={`w-7 h-7 rounded-full ${color} flex items-center justify-center text-[10px] font-bold text-white shadow-2xs`}
          >
            {initial}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
            {speaker?.name ?? "Unknown"}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSeek(segment.start_time);
            }}
            className="text-[10px] font-mono text-slate-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            {formatTimestamp(segment.start_time)}
          </button>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
          {highlightText(segment.text, searchQuery)}
        </p>
      </div>
    </div>
  );
}
