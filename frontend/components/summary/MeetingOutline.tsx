"use client";

import { MapPin } from "lucide-react";
import { formatTimestamp } from "@/lib/utils";

interface MeetingOutlineProps {
  topics: { id: number; name: string; start_time: number }[];
  onSeek: (time: number) => void;
  currentTime: number;
}

export default function MeetingOutline({
  topics,
  onSeek,
  currentTime,
}: MeetingOutlineProps) {
  if (topics.length === 0) return null;

  // Active topic = last topic whose start_time <= currentTime
  const activeTopic = topics.reduce<(typeof topics)[0] | null>((acc, t) => {
    if (currentTime >= t.start_time) return t;
    return acc;
  }, null);

  return (
    <div className="space-y-0.5">
      {topics.map((topic) => {
        const isActive = activeTopic?.id === topic.id;
        return (
          <button
            key={topic.id}
            onClick={() => onSeek(topic.start_time)}
            className={`w-full flex items-start gap-2.5 px-2 py-1.5 rounded-md text-left transition-colors text-xs group ${
              isActive
                ? "bg-violet-50 text-violet-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <span className="font-mono text-slate-400 mt-0.5 shrink-0 text-[10px]">
              {formatTimestamp(topic.start_time)}
            </span>
            <span className="flex-1 leading-snug">{topic.name}</span>
            {isActive && (
              <span className="shrink-0 mt-0.5">
                <MapPin size={10} className="text-violet-400" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
