"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: string | number;
}

function Section({ title, defaultOpen = true, children, badge }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            {title}
          </span>
          {badge !== undefined && (
            <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {open ? (
          <ChevronDown size={13} className="text-slate-400" />
        ) : (
          <ChevronRight size={13} className="text-slate-400" />
        )}
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}

interface SummaryPanelProps {
  overview: string | null;
  keyPoints: string[] | null;
  topics: { id: number; name: string; start_time: number }[];
  actionItemsSlot: React.ReactNode;
  onSeek: (time: number) => void;
  currentTime: number;
  loading?: boolean;
}

export default function SummaryPanel({
  overview,
  keyPoints,
  topics,
  actionItemsSlot,
  onSeek,
  currentTime,
  loading,
}: SummaryPanelProps) {
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-5 py-4 space-y-2">
            <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-full bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-5/6 bg-slate-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
      {/* Overview */}
      <Section title="Overview">
        {overview ? (
          <p className="text-sm text-slate-600 leading-relaxed">{overview}</p>
        ) : (
          <p className="text-xs text-slate-400 italic">No overview available.</p>
        )}
      </Section>

      {/* Key Points */}
      <Section title="Key Points" badge={keyPoints?.length}>
        {keyPoints && keyPoints.length > 0 ? (
          <ul className="space-y-1.5">
            {keyPoints.map((point, i) => (
              <li key={i} className="flex gap-2 text-xs text-slate-700">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-400 italic">No key points available.</p>
        )}
      </Section>

      {/* Meeting Outline */}
      <Section title="Meeting Outline" badge={topics.length}>
        {topics.length > 0 ? (
          <div className="space-y-0.5">
            {topics.map((topic) => {
              const isActive =
                currentTime >= topic.start_time &&
                (topics.findIndex((t) => t.id === topic.id) ===
                  topics.length - 1 ||
                  currentTime <
                    topics[
                      topics.findIndex((t) => t.id === topic.id) + 1
                    ]?.start_time);

              return (
                <button
                  key={topic.id}
                  onClick={() => onSeek(topic.start_time)}
                  className={`w-full flex items-start gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors text-xs font-medium ${
                    isActive
                      ? "bg-purple-50 text-purple-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="font-mono text-slate-400 shrink-0 text-[10px] mt-0.5">
                    {Math.floor(topic.start_time / 60)}:
                    {String(Math.floor(topic.start_time % 60)).padStart(2, "0")}
                  </span>
                  <span className="flex-1 leading-snug">{topic.name}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No topics identified.</p>
        )}
      </Section>

      {/* Action Items */}
      <Section title="Action Items">{actionItemsSlot}</Section>
    </div>
  );
}
