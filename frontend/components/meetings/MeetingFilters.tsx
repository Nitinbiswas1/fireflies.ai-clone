"use client";

import { useState } from "react";
import { Check, ChevronDown, FilterX, Hash, Search, SlidersHorizontal, Users, X } from "lucide-react";
import type { Participant } from "@/types/meeting";

interface MeetingFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  sort: "recent" | "oldest";
  onSortChange: (v: "recent" | "oldest") => void;
  allParticipants: Participant[];
  selectedParticipantId: number | null;
  onParticipantChange: (id: number | null) => void;
  allTopics: string[];
  selectedTopics: string[];
  onTopicsChange: (topics: string[]) => void;
  onClearAllFilters: () => void;
}

export default function MeetingFilters({
  search,
  onSearchChange,
  sort,
  onSortChange,
  allParticipants,
  selectedParticipantId,
  onParticipantChange,
  allTopics,
  selectedTopics,
  onTopicsChange,
  onClearAllFilters,
}: MeetingFiltersProps) {
  const [topicsDropdownOpen, setTopicsDropdownOpen] = useState(false);

  const toggleTopic = (topicName: string) => {
    if (selectedTopics.includes(topicName)) {
      onTopicsChange(selectedTopics.filter((t) => t !== topicName));
    } else {
      onTopicsChange([...selectedTopics, topicName]);
    }
  };

  const removeTopic = (topicName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onTopicsChange(selectedTopics.filter((t) => t !== topicName));
  };

  const hasActiveFilters = Boolean(search || selectedParticipantId !== null || selectedTopics.length > 0);

  return (
    <div className="border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-6 py-3 space-y-2.5 select-none">
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Search by title/keyword */}
        <div className="relative flex-1 min-w-[140px] sm:min-w-[200px] max-w-full sm:max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by title or keyword…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 text-xs border border-slate-200/80 rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-400 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-2xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Participant filter */}
        {allParticipants.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium shadow-2xs">
            <Users size={13} className="text-purple-600 dark:text-purple-400 shrink-0" />
            <select
              value={selectedParticipantId ?? ""}
              onChange={(e) =>
                onParticipantChange(e.target.value ? Number(e.target.value) : null)
              }
              className="bg-transparent text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="" className="dark:bg-slate-900 dark:text-slate-100">All Participants</option>
              {allParticipants.map((p) => (
                <option key={p.id} value={p.id} className="dark:bg-slate-900 dark:text-slate-100">
                  {p.name}
                </option>
              ))}
            </select>
            {selectedParticipantId !== null && (
              <button
                type="button"
                onClick={() => onParticipantChange(null)}
                className="ml-1 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
                title="Clear participant filter"
              >
                <X size={11} />
              </button>
            )}
          </div>
        )}

        {/* Topics multi-select filter */}
        {allTopics.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setTopicsDropdownOpen((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs ${
                selectedTopics.length > 0
                  ? "border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300"
                  : "border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <Hash size={13} className="text-purple-600 dark:text-purple-400 shrink-0" />
              <span>
                Topics {selectedTopics.length > 0 ? `(${selectedTopics.length})` : ""}
              </span>
              <ChevronDown size={12} className="opacity-70" />
            </button>

            {topicsDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setTopicsDropdownOpen(false)}
                />
                <div className="absolute left-0 top-9 z-20 w-64 max-h-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200/90 dark:border-slate-800 py-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Select Topics
                  </div>
                  <div className="p-1 space-y-0.5">
                    {allTopics.map((topic) => {
                      const selected = selectedTopics.includes(topic);
                      return (
                        <div
                          key={topic}
                          onClick={() => toggleTopic(topic)}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-purple-50 dark:hover:bg-slate-800 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                        >
                          <span className="truncate text-slate-700 dark:text-slate-200 font-medium">
                            {topic}
                          </span>
                          {selected && (
                            <Check size={13} className="text-purple-600 dark:text-purple-400 shrink-0 ml-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Sort */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium shadow-2xs">
          <SlidersHorizontal size={13} className="text-purple-600 dark:text-purple-400 shrink-0" />
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as "recent" | "oldest")}
            className="bg-transparent text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="recent" className="dark:bg-slate-900 dark:text-slate-100">Most Recent</option>
            <option value="oldest" className="dark:bg-slate-900 dark:text-slate-100">Oldest First</option>
          </select>
        </div>

        {/* Clear All Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAllFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 transition-colors shadow-2xs"
          >
            <FilterX size={13} />
            <span>Clear all filters</span>
          </button>
        )}
      </div>

      {/* Selected Topics Badges Bar */}
      {selectedTopics.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Active Topics:
          </span>
          {selectedTopics.map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100/80 text-purple-800 text-[11px] font-semibold border border-purple-200"
            >
              {topic}
              <button
                type="button"
                onClick={(e) => removeTopic(topic, e)}
                className="hover:text-purple-950 transition-colors"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
