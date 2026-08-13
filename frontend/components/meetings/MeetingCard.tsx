"use client";

import { useRouter } from "next/navigation";
import { Clock, Flame, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import type { Meeting } from "@/types/meeting";
import { formatDuration } from "@/lib/utils";
import { AvatarGroup } from "@/components/ui/Avatar";

interface MeetingCardProps {
  meeting: Meeting;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meeting: Meeting) => void;
}

export default function MeetingCard({
  meeting,
  onEdit,
  onDelete,
}: MeetingCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (menuRef.current?.contains(e.target as Node)) return;
    router.push(`/meetings/${meeting.id}`);
  };

  const meetingDateObj = new Date(meeting.meeting_date);

  return (
    <div
      onClick={handleClick}
      className="group flex items-center gap-4 px-5 py-3.5 bg-white hover:bg-purple-50/20 dark:bg-slate-900 dark:hover:bg-slate-800/80 cursor-pointer border-b border-slate-100/90 dark:border-slate-800/90 transition-all"
    >
      {/* Flame Icon / Date Badge */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/70 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900/60 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-2xs">
          <Flame size={18} />
        </div>
        <div className="w-10 text-center shrink-0">
          <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider leading-none">
            {meetingDateObj.toLocaleDateString("en-US", { month: "short" })}
          </div>
          <div className="text-base font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
            {meetingDateObj.getDate()}
          </div>
        </div>
      </div>

      {/* Title & Metadata */}
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {meeting.title}
        </p>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
            <Clock size={12} className="text-slate-400 dark:text-slate-500" />
            {formatDuration(meeting.duration_seconds)}
          </span>
          {meeting.participants.length > 0 && (
            <span className="truncate hidden sm:inline text-slate-400 dark:text-slate-500">
              {meeting.participants.map((p) => p.name.split(" ")[0]).join(", ")}
            </span>
          )}
        </div>
        {/* Topic Chips */}
        {meeting.topics && meeting.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {meeting.topics.slice(0, 3).map((topic) => (
              <span
                key={topic.id}
                className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900/60 text-[10px] font-medium"
              >
                {topic.name}
              </span>
            ))}
            {meeting.topics.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                +{meeting.topics.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Avatars */}
      <div className="shrink-0">
        <AvatarGroup participants={meeting.participants} max={4} size="sm" />
      </div>

      {/* Actions */}
      <div ref={menuRef} className="relative shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <MoreHorizontal size={15} />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-8 z-20 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-800 py-1 text-xs font-medium">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onEdit(meeting);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Pencil size={13} className="text-slate-400" /> Edit
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete(meeting);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
