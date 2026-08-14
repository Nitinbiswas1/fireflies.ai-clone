"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, Download, FileText, Pencil, Sparkles, Trash2, Zap } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import MeetingPlayer from "@/components/player/MeetingPlayer";
import SummaryPanel from "@/components/summary/SummaryPanel";
import TranscriptPanel from "@/components/transcript/TranscriptPanel";
import ActionItemsPanel from "@/components/summary/ActionItems";
import MeetingChat from "@/components/chat/MeetingChat";
import { downloadFile, exportFullMarkdown, exportSummary, exportTranscript } from "@/lib/export";
import { AvatarGroup } from "@/components/ui/Avatar";
import {
  AddTranscriptModal,
  DeleteConfirmModal,
  EditMeetingModal,
} from "@/components/meetings/MeetingModals";
import { useToast } from "@/components/ui/Toast";
import {
  createActionItem,
  deleteActionItem,
  deleteMeeting,
  getActionItems,
  getMeeting,
  getParticipants,
  getSummary,
  getTranscript,
  processMeeting,
  updateActionItem,
  updateMeeting,
} from "@/lib/api";
import { formatDate, formatDuration } from "@/lib/utils";
import type {
  ActionItem,
  ActionItemCreate,
  Meeting,
  MeetingUpdate,
  Participant,
  Summary,
  TranscriptSegment,
} from "@/types/meeting";

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const meetingId = Number(params.meetingId);
  const initialTimestamp = searchParams.get("t");
  const searchQueryParam = searchParams.get("q") || "";

  // Data state — all loading flags start true so skeleton shows immediately
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [loadingMeeting, setLoadingMeeting] = useState(true);
  const [loadingTranscript, setLoadingTranscript] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingActions, setLoadingActions] = useState(true);
  const [participantsLoading, setParticipantsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Player sync & tab state
  const [activeTab, setActiveTab] = useState<"notes" | "chat">("notes");
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const seekFnRef = useRef<((t: number) => void) | null>(null);

  const handleSeek = useCallback((time: number) => {
    seekFnRef.current?.(time);
    setCurrentTime(time);
  }, []);

  const handleSeekRegister = useCallback((fn: (t: number) => void) => {
    seekFnRef.current = fn;
  }, []);

  // Modal state
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addTranscriptOpen, setAddTranscriptOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [processLoading, setProcessLoading] = useState(false);

  // Load participants for edit modal
  useEffect(() => {
    getParticipants()
      .then(setAllParticipants)
      .catch(() => { })
      .finally(() => setParticipantsLoading(false));
  }, []);

  // Fetch all data in parallel
  useEffect(() => {
    if (!meetingId) return;

    getMeeting(meetingId)
      .then((m) => { setMeeting(m); setLoadingMeeting(false); })
      .catch(() => { setError("Meeting not found"); setLoadingMeeting(false); });

    getTranscript(meetingId)
      .then((t) => { setSegments(t.segments); setLoadingTranscript(false); })
      .catch(() => setLoadingTranscript(false));

    getSummary(meetingId)
      .then((s) => { setSummary(s); setLoadingSummary(false); })
      .catch(() => setLoadingSummary(false));

    getActionItems(meetingId)
      .then((a) => { setActions(a); setLoadingActions(false); })
      .catch(() => setLoadingActions(false));
  }, [meetingId]);

  // Deep-link auto-seek for global search result timestamp
  useEffect(() => {
    if (!loadingTranscript && initialTimestamp !== null) {
      const timeVal = Number(initialTimestamp);
      if (!isNaN(timeVal)) {
        const timer = setTimeout(() => handleSeek(timeVal), 0);
        return () => clearTimeout(timer);
      }
    }
  }, [loadingTranscript, initialTimestamp, handleSeek]);

  // Action item handlers
  const handleToggleAction = async (item: ActionItem) => {
    try {
      const updated = await updateActionItem(item.id, { completed: !item.completed });
      setActions((prev) => prev.map((a) => (a.id === item.id ? updated : a)));
      toast(updated.completed ? "Marked complete" : "Marked incomplete");
    } catch {
      toast("Failed to update action item", "error");
    }
  };

  const handleDeleteAction = async (item: ActionItem) => {
    try {
      await deleteActionItem(item.id);
      setActions((prev) => prev.filter((a) => a.id !== item.id));
      toast("Action item deleted");
    } catch {
      toast("Failed to delete action item", "error");
    }
  };

  const handleCreateAction = async (data: ActionItemCreate) => {
    const created = await createActionItem(meetingId, data);
    setActions((prev) => [...prev, created]);
    toast("Action item added");
  };

  // Meeting edit / delete
  const handleEdit = async (id: number, data: MeetingUpdate) => {
    setEditLoading(true);
    try {
      const updated = await updateMeeting(id, data);
      setMeeting(updated);
      setEditOpen(false);
      toast("Meeting updated");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to update", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteMeeting(meetingId);
      toast("Meeting deleted");
      router.push("/meetings");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to delete", "error");
      setDeleteLoading(false);
    }
  };

  // Process transcript handler
  const handleProcess = async (transcriptText: string) => {
    setProcessLoading(true);
    try {
      const updated = await processMeeting(meetingId, transcriptText);
      setMeeting(updated);
      setAddTranscriptOpen(false);
      toast("Transcript processed! Refreshing…");

      // Reload all data
      getTranscript(meetingId).then((t) => setSegments(t.segments)).catch(() => { });
      getSummary(meetingId).then(setSummary).catch(() => { });
      getActionItems(meetingId).then(setActions).catch(() => { });
      getParticipants().then(setAllParticipants).catch(() => { });
    } catch (e) {
      toast(e instanceof Error ? e.message : "Processing failed", "error");
    } finally {
      setProcessLoading(false);
    }
  };

  if (error) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-3">{error}</p>
            <button onClick={() => router.push("/meetings")} className="text-xs text-violet-600 underline">
              Back to meetings
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Top Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-6 py-3 shrink-0 select-none">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 w-full sm:w-auto">
            <button
              onClick={() => router.push("/meetings")}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="Back to meetings"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="min-w-0 flex-1">
              {loadingMeeting ? (
                <div className="space-y-2">
                  <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-3 w-40 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <h1 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-tight truncate tracking-tight">
                    {meeting?.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3.5 mt-1">
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <CalendarDays size={12} className="text-purple-600 dark:text-purple-400" />
                      {meeting?.meeting_date ? formatDate(meeting.meeting_date) : "—"}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <Clock size={12} className="text-purple-600 dark:text-purple-400" />
                      {formatDuration(meeting?.duration_seconds)}
                    </span>
                    {meeting && meeting.participants.length > 0 && (
                      <AvatarGroup participants={meeting.participants} max={5} size="xs" />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            {/* Export Dropdown Menu */}
            <div ref={exportMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setExportMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/70 hover:bg-purple-100 dark:hover:bg-purple-900/80 border border-purple-200/80 dark:border-purple-800/80 rounded-lg transition-colors shadow-2xs"
                title="Export meeting data"
              >
                <Download size={13} />
                <span>Export</span>
              </button>

              {exportMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setExportMenuOpen(false)} />
                  <div className="absolute right-0 top-9 z-20 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200/90 dark:border-slate-800 py-1 text-xs font-medium divide-y divide-slate-100 dark:divide-slate-800 select-none">
                    <button
                      type="button"
                      onClick={() => {
                        setExportMenuOpen(false);
                        if (segments.length === 0) {
                          toast("Transcript is not available for this meeting.", "error");
                          return;
                        }
                        if (!meeting) return;
                        const { filename, content } = exportTranscript(meeting, segments);
                        downloadFile(filename, content, "text/plain");
                        toast("Transcript exported successfully");
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-slate-800 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                    >
                      <FileText size={13} className="text-slate-400" />
                      <span>Transcript (.txt)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setExportMenuOpen(false);
                        if (!meeting) return;
                        const { filename, content } = exportSummary(meeting, summary, actions);
                        downloadFile(filename, content, "text/plain");
                        toast("Summary exported successfully");
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-slate-800 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                    >
                      <FileText size={13} className="text-slate-400" />
                      <span>Summary (.txt)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setExportMenuOpen(false);
                        if (!meeting) return;
                        const { filename, content } = exportFullMarkdown(meeting, segments, summary, actions);
                        downloadFile(filename, content, "text/markdown");
                        toast("Meeting notes exported successfully");
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-slate-800 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                    >
                      <FileText size={13} className="text-slate-400" />
                      <span>Full Meeting Notes (.md)</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Process / Add Transcript button */}
            {!loadingTranscript && segments.length === 0 && (
              <button
                onClick={() => setAddTranscriptOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/70 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-200/80 dark:border-purple-800/80 rounded-lg transition-colors shadow-2xs"
                title="Add & process transcript"
              >
                <Zap size={13} />
                Add Transcript
              </button>
            )}
            {!loadingTranscript && segments.length > 0 && (
              <button
                onClick={() => setAddTranscriptOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Re-process transcript"
              >
                <Zap size={13} />
                Re-process
              </button>
            )}
            <button
              onClick={() => setEditOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit meeting"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
              title="Delete meeting"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Player */}
      <MeetingPlayer
        duration={meeting?.duration_seconds ?? 3600}
        onTimeUpdate={setCurrentTime}
        onSeek={handleSeekRegister}
      />

      {/* Two-panel workspace: Stacks vertically on mobile/tablet (< lg), side-by-side on desktop (>= lg) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden min-h-0">
        {/* LEFT — Notes / Ask AI Chat */}
        <div className="w-full lg:w-[380px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-hidden min-h-[360px] max-h-[500px] lg:max-h-none">
          <div className="px-5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <button
              onClick={() => setActiveTab("notes")}
              className={`text-[10px] font-bold uppercase tracking-wider transition-colors py-1.5 ${
                activeTab === "notes"
                  ? "text-purple-700 dark:text-purple-400 border-b-2 border-purple-600 font-extrabold"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors py-1.5 ${
                activeTab === "chat"
                  ? "text-purple-700 dark:text-purple-400 border-b-2 border-purple-600 font-extrabold"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <Sparkles size={11} className="text-purple-600 dark:text-purple-400" />
              Ask AI ⚡
            </button>
          </div>

          {activeTab === "notes" ? (
            <SummaryPanel
              overview={summary?.overview ?? null}
              keyPoints={summary?.key_points ?? null}
              topics={meeting?.topics ?? []}
              currentTime={currentTime}
              onSeek={handleSeek}
              loading={loadingSummary}
              actionItemsSlot={
                <ActionItemsPanel
                  items={actions}
                  loading={loadingActions}
                  onToggle={handleToggleAction}
                  onDelete={handleDeleteAction}
                  onCreate={handleCreateAction}
                />
              }
            />
          ) : (
            <MeetingChat
              meetingId={meetingId}
              hasContent={segments.length > 0 || !!summary?.overview}
            />
          )}
        </div>

        {/* RIGHT — Transcript */}
        <div className="w-full flex-1 flex flex-col overflow-hidden min-h-[400px] lg:min-h-0 bg-white dark:bg-slate-900">
          <div className="px-5 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Transcript</span>
            <span className="text-[10px] text-slate-400">{segments.length} segments</span>
          </div>
          <TranscriptPanel
            segments={segments}
            currentTime={currentTime}
            onSeek={handleSeek}
            loading={loadingTranscript}
            onAddTranscript={segments.length === 0 ? () => setAddTranscriptOpen(true) : undefined}
            initialQuery={searchQueryParam}
          />
        </div>
      </div>

      {/* Modals */}
      <EditMeetingModal
        open={editOpen}
        meeting={meeting}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEdit}
        loading={editLoading}
        allParticipants={allParticipants}
        participantsLoading={participantsLoading}
      />
      <DeleteConfirmModal
        open={deleteOpen}
        meeting={meeting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
      <AddTranscriptModal
        open={addTranscriptOpen}
        meeting={meeting}
        onClose={() => setAddTranscriptOpen(false)}
        onProcess={handleProcess}
        loading={processLoading}
      />
    </AppShell>
  );
}
