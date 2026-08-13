"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  FileText,
  Loader2,
  Mic,
  MessageSquare,
  Search,
  User,
  Video,
  X,
} from "lucide-react";
import ComingSoonModal, { ComingSoonFeature } from "@/components/ui/ComingSoonModal";
import { searchGlobal } from "@/lib/api";
import type { SearchResultItem } from "@/types/meeting";
import { formatDate, formatTimestamp } from "@/lib/utils";

interface TopbarProps {
  title?: string;
  onSearchChange?: (val: string) => void;
  children?: React.ReactNode;
}

export default function Topbar({ title, onSearchChange, children }: TopbarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState<ComingSoonFeature | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard Shortcuts: Cmd/Ctrl + K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setDropdownOpen(true);
      } else if (e.key === "Escape") {
        setDropdownOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search backend fetch
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      const resetTimer = setTimeout(() => {
        setResults([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    const timer = setTimeout(() => {
      setLoading(true);
      searchGlobal(trimmed)
        .then((res) => setResults(res.results))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setDropdownOpen(true);
    onSearchChange?.(val);
  };

  const handleResultClick = (item: SearchResultItem) => {
    setDropdownOpen(false);
    if (item.match_type === "transcript" && item.timestamp !== null && item.timestamp !== undefined) {
      router.push(`/meetings/${item.meeting_id}?t=${item.timestamp}&q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/meetings/${item.meeting_id}`);
    }
  };

  const meetingsMatches = results.filter((r) => r.match_type !== "transcript");
  const transcriptMatches = results.filter((r) => r.match_type === "transcript");

  return (
    <>
      <header className="h-14 border-b border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md flex items-center px-6 gap-4 shrink-0 sticky top-0 z-30 select-none">
        {/* Left Title */}
        <div className="min-w-[120px]">
          {title && (
            <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h1>
          )}
        </div>

        {/* Center Global Search Input with Dropdown Overlay */}
        <div ref={containerRef} className="flex-1 max-w-md mx-auto relative">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleSearchInputChange}
              onFocus={() => setDropdownOpen(true)}
              placeholder="Search by title or keyword"
              className="w-full pl-9 pr-16 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-2xs"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  onSearchChange?.("");
                }}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X size={13} />
              </button>
            ) : (
              <span className="absolute right-3 text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
                ⌘K
              </span>
            )}
          </div>

          {/* Global Search Results Dropdown Overlay */}
          {dropdownOpen && query.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-10 mt-1 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 overflow-hidden z-50 max-h-[480px] flex flex-col">
              {loading ? (
                <div className="p-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin text-purple-600" />
                  Searching across workspace meetings…
                </div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center space-y-1 text-xs text-slate-500">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">No results found</p>
                  <p className="text-slate-400 text-[11px]">
                    No matches for &quot;{query}&quot; across titles, transcripts, or summaries.
                  </p>
                </div>
              ) : (
                <div className="overflow-y-auto divide-y divide-slate-100 p-2 space-y-3">
                  {/* Category 1: Meetings & Summaries Matches */}
                  {meetingsMatches.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Meetings ({meetingsMatches.length})
                      </div>
                      <div className="space-y-0.5">
                        {meetingsMatches.map((item, idx) => (
                          <div
                            key={`m-${item.meeting_id}-${idx}`}
                            onClick={() => handleResultClick(item)}
                            className="p-2.5 rounded-xl hover:bg-purple-50/60 cursor-pointer transition-colors group flex items-start gap-2.5"
                          >
                            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700 shrink-0 mt-0.5">
                              <FileText size={13} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-xs font-semibold text-slate-800 group-hover:text-purple-700 truncate">
                                  {item.meeting_title}
                                </h4>
                                <span className="text-[10px] font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 uppercase shrink-0">
                                  {item.match_type.replace("_", " ")}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {item.text}
                              </p>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {formatDate(item.meeting_date)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category 2: Transcript Matches */}
                  {transcriptMatches.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Transcript Matches ({transcriptMatches.length})
                      </div>
                      <div className="space-y-0.5">
                        {transcriptMatches.map((item, idx) => (
                          <div
                            key={`t-${item.meeting_id}-${idx}`}
                            onClick={() => handleResultClick(item)}
                            className="p-2.5 rounded-xl hover:bg-purple-50/60 cursor-pointer transition-colors group flex items-start gap-2.5"
                          >
                            <div className="p-1.5 rounded-lg bg-pink-50 text-pink-600 shrink-0 mt-0.5">
                              <MessageSquare size={13} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-xs font-semibold text-slate-800 group-hover:text-purple-700 truncate">
                                  {item.meeting_title}
                                </h4>
                                {item.timestamp !== null && (
                                  <span className="text-[10px] font-mono text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded shrink-0">
                                    {formatTimestamp(item.timestamp!)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-semibold text-slate-700 flex items-center gap-1">
                                  <User size={10} className="text-slate-400" />
                                  {item.speaker || "Unknown"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-relaxed mt-1 line-clamp-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                &quot;{item.text}&quot;
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {children}

          {/* Upgrade Green Button */}
          <button
            type="button"
            onClick={() =>
              setComingSoonFeature({
                title: "Upgrade Plan",
                description: "Upgrade to Fireflies Pro or Business plans to unlock unlimited recording, transcription, and AI summary minutes.",
              })
            }
            className="hidden sm:inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/70 text-emerald-700 text-xs font-semibold transition-colors shadow-2xs"
          >
            Upgrade
          </button>

          {/* Capture Primary Dropdown Button */}
          <button
            type="button"
            onClick={() =>
              setComingSoonFeature({
                title: "Capture Meeting",
                description: "Automatically invite Fireflies meeting assistant bot to join live Zoom, Google Meet, or Microsoft Teams calls.",
                icon: <Video size={24} />,
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-colors shadow-xs"
          >
            <Video size={13} />
            <span>Capture</span>
            <ChevronDown size={12} className="opacity-80" />
          </button>

          {/* Mic icon */}
          <button
            type="button"
            onClick={() =>
              setComingSoonFeature({
                title: "Voice Notes",
                description: "Record in-person voice memos directly from your browser or mobile microphone.",
                icon: <Mic size={24} />,
              })
            }
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Voice notes"
          >
            <Mic size={15} />
          </button>

          {/* Bell icon with notification indicator */}
          <button
            type="button"
            onClick={() =>
              setComingSoonFeature({
                title: "Notifications",
                description: "Real-time notifications for completed transcripts, action item assignments, and team summary shares.",
                icon: <Bell size={24} />,
              })
            }
            className="relative p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell size={15} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* User avatar badge (Matching teal N circle in reference) */}
          <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs cursor-pointer hover:opacity-90 transition-opacity">
            N
          </div>
        </div>
      </header>

      {/* Coming Soon Modal */}
      <ComingSoonModal
        open={!!comingSoonFeature}
        feature={comingSoonFeature}
        onClose={() => setComingSoonFeature(null)}
      />
    </>
  );
}
