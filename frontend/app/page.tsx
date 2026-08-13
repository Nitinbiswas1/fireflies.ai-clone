"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import { getMeetings } from "@/lib/api";
import type { Meeting } from "@/types/meeting";
import { formatDate, formatDuration } from "@/lib/utils";
import {
  CalendarDays,
  ChevronRight,
  Download,
  Flame,
  Play,
  Plus,
  Settings,
  Smartphone,
  UploadCloud,
  Video,
} from "lucide-react";
import { AvatarGroup } from "@/components/ui/Avatar";
import { CreateMeetingModal } from "@/components/meetings/MeetingModals";
import { getParticipants, createMeeting } from "@/lib/api";
import type { MeetingCreate, Participant } from "@/types/meeting";
import { useToast } from "@/components/ui/Toast";
import ComingSoonModal, { ComingSoonFeature } from "@/components/ui/ComingSoonModal";

export default function Home() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"recent" | "upcoming" | "feed">("recent");
  const [createOpen, setCreateOpen] = useState(false);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState<ComingSoonFeature | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    getMeetings({ page_size: 5 })
      .then((data) => setMeetings(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));

    getParticipants()
      .then(setAllParticipants)
      .catch(() => {});
  }, []);

  const handleCreateMeeting = async (data: MeetingCreate) => {
    setCreateLoading(true);
    try {
      await createMeeting(data);
      setCreateOpen(false);
      toast("Meeting created successfully");
      const fresh = await getMeetings({ page_size: 5 });
      setMeetings(fresh.items);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to create meeting", "error");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateAndProcess = async (data: MeetingCreate) => {
    setCreateLoading(true);
    try {
      await createMeeting(data);
      setCreateOpen(false);
      toast("Meeting created and processed successfully");
      const fresh = await getMeetings({ page_size: 5 });
      setMeetings(fresh.items);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to process meeting", "error");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <AppShell>
      <Topbar title="Home" />

      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-blue-50/40 via-purple-50/20 to-slate-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950 p-6 sm:p-8 space-y-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero Banner Card matching Reference Screenshot */}
          <div className="relative overflow-hidden bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-pink-50/60 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-pink-950/30 border border-amber-100/80 dark:border-amber-900/40 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2 max-w-md">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Welcome Aboard, Nitin!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Fireflies is now ready to automate your meetings and streamline your workflows.
              </p>
            </div>

            {/* Video Demo Thumbnail Mockup */}
            <div
              onClick={() =>
                setComingSoonFeature({
                  title: "Fireflies Product Demo",
                  description: "Watch a interactive walkthrough of automated speech transcription, AI summary generation, and action item tracking.",
                  icon: <Play size={24} />,
                })
              }
              className="relative shrink-0 w-full md:w-64 h-36 bg-slate-950 rounded-xl overflow-hidden shadow-md group cursor-pointer border border-slate-800 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/60 via-slate-900 to-indigo-900/40 opacity-80" />
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-purple-600 group-hover:bg-purple-500 text-white flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg">
                  <Play size={18} className="fill-white ml-0.5" />
                </div>
                <span className="text-[11px] font-medium text-slate-200 tracking-wide">
                  Fireflies Product Demo
                </span>
              </div>
            </div>
          </div>

          {/* Quick Start Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Quick Start
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Capture your first meeting or upload a recording to see Fireflies in action.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Card 1: Schedule Meeting */}
              <button
                type="button"
                onClick={() =>
                  setComingSoonFeature({
                    title: "Schedule Meeting",
                    description: "Connect your Google Calendar or Outlook Calendar to automatically invite Fireflies AI to upcoming calls.",
                    icon: <CalendarDays size={24} />,
                  })
                }
                className="bg-pink-50/60 hover:bg-pink-50 dark:bg-pink-950/30 dark:hover:bg-pink-950/50 border border-pink-100 dark:border-pink-900/50 rounded-xl p-4 text-left flex items-center justify-between group transition-all shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-2xs">
                    <CalendarDays size={18} />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
                    Schedule Meeting
                  </span>
                </div>
                <ChevronRight size={14} className="text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Card 2: Upload File */}
              <button
                type="button"
                onClick={() =>
                  setComingSoonFeature({
                    title: "Upload File",
                    description: "Upload MP3, WAV, M4A, or MP4 audio and video files for AI transcription and automatic summaries.",
                    icon: <UploadCloud size={24} />,
                  })
                }
                className="bg-emerald-50/60 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-4 text-left flex items-center justify-between group transition-all shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs">
                    <UploadCloud size={18} />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                    Upload File
                  </span>
                </div>
                <ChevronRight size={14} className="text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Card 3: Capture Meeting */}
              <button
                type="button"
                onClick={() =>
                  setComingSoonFeature({
                    title: "Capture Meeting",
                    description: "Dispatch real-time recording bot to your live Zoom, Google Meet, or Webex call.",
                    icon: <Plus size={24} />,
                  })
                }
                className="bg-purple-50/60 hover:bg-purple-50 dark:bg-purple-950/30 dark:hover:bg-purple-950/50 border border-purple-100 dark:border-purple-900/50 rounded-xl p-4 text-left flex items-center justify-between group transition-all shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-2xs">
                    <Plus size={18} />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                    Capture Meeting
                  </span>
                </div>
                <ChevronRight size={14} className="text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Recent Meetings Section with Tabs */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800 p-1 rounded-xl">
                {[
                  { id: "recent", label: "Recent" },
                  { id: "upcoming", label: "Upcoming" },
                  { id: "feed", label: "AI Feed" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === "recent") {
                        setActiveTab("recent");
                      } else {
                        setComingSoonFeature({
                          title: tab.id === "upcoming" ? "Upcoming Meetings" : "AI Feed",
                          description: tab.id === "upcoming"
                            ? "View upcoming scheduled meetings and bot calendar invites."
                            : "Real-time AI activity feed of team meeting summaries and key action alerts.",
                        });
                      }
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === tab.id
                        ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <Link
                href="/settings"
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 font-medium"
              >
                <Settings size={13} />
                Settings
              </Link>
            </div>

            {/* Meetings List Content */}
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 animate-pulse" />
                ))}
              </div>
            ) : meetings.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
                <Flame size={24} className="text-purple-400 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400">No meetings recorded yet.</p>
                <button
                  onClick={() => setCreateOpen(true)}
                  className="px-4 py-2 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  New Meeting
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-2xs">
                {meetings.map((m) => (
                  <Link
                    key={m.id}
                    href={`/meetings/${m.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 border border-pink-100 dark:border-pink-900/50">
                        <Flame size={16} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                          {m.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {formatDate(m.meeting_date)}
                          {m.duration_seconds && ` • ${formatDuration(m.duration_seconds)}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <AvatarGroup participants={m.participants} max={3} size="sm" />
                      <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Try More Section matching Bottom Right of Reference Screenshot */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Try More
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Desktop App Card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                  <Video size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100">Desktop App</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Capture conversations without any bot present in your meeting.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setComingSoonFeature({
                      title: "Fireflies Desktop App",
                      description: "Capture offline meetings, audio input, and system calls without inviting a bot to the meeting.",
                      icon: <Video size={24} />,
                    })
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-2xs"
                >
                  <Download size={13} />
                  Download
                </button>
              </div>

              {/* Mobile App Card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center border border-pink-100 dark:border-pink-900/50">
                  <Smartphone size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100">Mobile App</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Record in-person conversations and review meetings on the go.
                  </p>
                </div>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setComingSoonFeature({
                        title: "Fireflies iOS App",
                        description: "Record in-person conversations and review meeting notes on iPhone and iPad.",
                        icon: <Smartphone size={24} />,
                      })
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    App Store
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setComingSoonFeature({
                        title: "Fireflies Android App",
                        description: "Record in-person conversations and review meeting notes on Android devices.",
                        icon: <Smartphone size={24} />,
                      })
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Google Play
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* New Meeting Modal */}
      <CreateMeetingModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateMeeting}
        onSubmitAndProcess={handleCreateAndProcess}
        loading={createLoading}
        allParticipants={allParticipants}
      />

      {/* Coming Soon Modal */}
      <ComingSoonModal
        open={!!comingSoonFeature}
        feature={comingSoonFeature}
        onClose={() => setComingSoonFeature(null)}
      />
    </AppShell>
  );
}
