"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TranscriptSegment } from "@/types/meeting";
import TranscriptLine from "./TranscriptLine";
import TranscriptSearch from "./TranscriptSearch";
import { FileText } from "lucide-react";

interface TranscriptPanelProps {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeek: (time: number) => void;
  loading?: boolean;
  onAddTranscript?: () => void;
  initialQuery?: string;
}

export default function TranscriptPanel({
  segments,
  currentTime,
  onSeek,
  loading,
  onAddTranscript,
  initialQuery = "",
}: TranscriptPanelProps) {
  const [query, setQuery] = useState(initialQuery);
  const [matchIndex, setMatchIndex] = useState(0);

  useEffect(() => {
    if (initialQuery) {
      const timer = setTimeout(() => setQuery(initialQuery), 0);
      return () => clearTimeout(timer);
    }
  }, [initialQuery]);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    setMatchIndex(0);
  };
  const activeRef = useRef<HTMLDivElement>(null);

  // Active segment based on player time
  const activeSegmentId = useMemo(() => {
    let active: TranscriptSegment | null = null;
    for (const seg of segments) {
      if (currentTime >= seg.start_time) active = seg;
      else break;
    }
    return active?.id ?? null;
  }, [segments, currentTime]);

  // Matching segment indices
  const matchingSegmentIds = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return segments
      .filter((s) => s.text.toLowerCase().includes(q))
      .map((s) => s.id);
  }, [segments, query]);

  // Scroll active segment into view
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeSegmentId]);

  const handlePrev = () => {
    setMatchIndex((i) =>
      i === 0 ? matchingSegmentIds.length - 1 : i - 1
    );
  };

  const handleNext = () => {
    setMatchIndex((i) =>
      i === matchingSegmentIds.length - 1 ? 0 : i + 1
    );
  };

  // Scroll to current match result
  useEffect(() => {
    if (matchingSegmentIds.length > 0) {
      const targetId = matchingSegmentIds[matchIndex];
      const el = document.getElementById(`seg-${targetId}`);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [matchIndex, matchingSegmentIds]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <TranscriptSearch
          query={query}
          onChange={handleQueryChange}
          matchCount={0}
          currentMatch={0}
          onPrev={handlePrev}
          onNext={handleNext}
        />
        <div className="flex-1 p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3">
              <div className="w-6 h-6 rounded-full bg-slate-200 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-full bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (segments.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <TranscriptSearch
          query={query}
          onChange={handleQueryChange}
          matchCount={0}
          currentMatch={0}
          onPrev={handlePrev}
          onNext={handleNext}
        />
        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div>
            <FileText size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">No transcript available</p>
            {onAddTranscript ? (
              <button
                onClick={onAddTranscript}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors mx-auto"
              >
                Add Transcript
              </button>
            ) : (
              <p className="text-xs text-slate-400 mt-1">
                Automatic speech-to-text is coming soon. Transcript segments will appear here once pasted or processed.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TranscriptSearch
        query={query}
        onChange={handleQueryChange}
        matchCount={matchingSegmentIds.length}
        currentMatch={matchIndex}
        onPrev={handlePrev}
        onNext={handleNext}
      />
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {segments.map((seg) => {
          const isActive = seg.id === activeSegmentId;
          const isSearchMatch = matchingSegmentIds.includes(seg.id);
          const isCurrentMatch =
            isSearchMatch &&
            seg.id === matchingSegmentIds[matchIndex];

          return (
            <div
              key={seg.id}
              id={`seg-${seg.id}`}
              ref={isActive ? activeRef : undefined}
              className={isCurrentMatch ? "ring-2 ring-yellow-400 rounded-lg" : ""}
            >
              <TranscriptLine
                segment={seg}
                isActive={isActive}
                searchQuery={query}
                onSeek={onSeek}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
