"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import MeetingCard from "@/components/meetings/MeetingCard";
import MeetingFilters from "@/components/meetings/MeetingFilters";
import {
  CreateMeetingModal,
  DeleteConfirmModal,
  EditMeetingModal,
} from "@/components/meetings/MeetingModals";
import { useToast } from "@/components/ui/Toast";
import {
  createMeeting,
  deleteMeeting,
  getMeetings,
  getParticipants,
  getTopics,
  updateMeeting,
} from "@/lib/api";
import type {
  Meeting,
  MeetingCreate,
  MeetingUpdate,
  Participant,
} from "@/types/meeting";

export default function MeetingsPage() {
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "oldest">("recent");
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // Participant & Topic lists for filters + modals
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [allTopics, setAllTopics] = useState<string[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [editTarget, setEditTarget] = useState<Meeting | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Meeting | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load participants & unique topics once on mount
  useEffect(() => {
    getParticipants()
      .then(setAllParticipants)
      .catch(() => {/* non-fatal */})
      .finally(() => setParticipantsLoading(false));

    getTopics()
      .then(setAllTopics)
      .catch(() => {/* non-fatal */});
  }, []);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMeetings({
        search: search || undefined,
        sort,
        participant_id: selectedParticipantId ?? undefined,
        topics: selectedTopics.length > 0 ? selectedTopics : undefined,
      });
      setMeetings(data.items);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load meetings");
    } finally {
      setLoading(false);
    }
  }, [search, sort, selectedParticipantId, selectedTopics]);

  useEffect(() => {
    const id = setTimeout(fetchMeetings, search ? 300 : 0);
    return () => clearTimeout(id);
  }, [fetchMeetings, search]);

  const handleClearAllFilters = () => {
    setSearch("");
    setSelectedParticipantId(null);
    setSelectedTopics([]);
  };

  const handleCreate = async (data: MeetingCreate) => {
    setCreateLoading(true);
    try {
      await createMeeting(data);
      setCreateOpen(false);
      toast("Meeting created successfully");
      fetchMeetings();
      // Refresh participants in case new speakers were created
      getParticipants().then(setAllParticipants).catch(() => {});
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to create meeting", "error");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateAndProcess = async (data: MeetingCreate) => {
    setCreateLoading(true);
    try {
      // Create the meeting first (without processing if transcript was provided,
      // the backend handles this in one shot via transcript_text)
      await createMeeting(data);
      setCreateOpen(false);
      toast(
        data.transcript_text
          ? "Meeting created and processed successfully"
          : "Meeting created successfully"
      );
      fetchMeetings();
      getParticipants().then(setAllParticipants).catch(() => {});
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to create meeting", "error");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = async (id: number, data: MeetingUpdate) => {
    setEditLoading(true);
    try {
      await updateMeeting(id, data);
      setEditTarget(null);
      toast("Meeting updated");
      fetchMeetings();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to update meeting", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteMeeting(deleteTarget.id);
      setDeleteTarget(null);
      toast("Meeting deleted");
      fetchMeetings();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to delete meeting", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AppShell>
      <Topbar title="My Meetings" onSearchChange={setSearch}>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-xs"
        >
          <Plus size={14} />
          New Meeting
        </button>
      </Topbar>

      <MeetingFilters
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        allParticipants={allParticipants}
        selectedParticipantId={selectedParticipantId}
        onParticipantChange={setSelectedParticipantId}
        allTopics={allTopics}
        selectedTopics={selectedTopics}
        onTopicsChange={setSelectedTopics}
        onClearAllFilters={handleClearAllFilters}
      />

      <main className="flex-1 overflow-y-auto bg-slate-50/60 dark:bg-slate-950 p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Meeting Notebook ({total})
            </h2>
          </div>

          {loading && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-2xs">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                  <div className="w-10 space-y-1">
                    <div className="h-2 w-6 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                    <div className="h-5 w-8 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-2.5 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="flex -space-x-1.5">
                    {[0, 1, 2].map((j) => (
                      <div key={j} className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 ring-2 ring-white dark:ring-slate-900" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center text-xs text-red-600 dark:text-red-400">
              {error} —{" "}
              <button
                onClick={fetchMeetings}
                className="ml-1 underline text-purple-600 dark:text-purple-400 font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && meetings.length === 0 && (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center space-y-3 shadow-2xs">
              <BookOpen size={36} className="text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No meetings found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                {search || selectedParticipantId || selectedTopics.length > 0
                  ? "Try removing a topic filter or adjusting your search."
                  : "Create your first meeting to experience AI transcription and automated summaries."}
              </p>
              {!search && !selectedParticipantId && selectedTopics.length === 0 && (
                <button
                  onClick={() => setCreateOpen(true)}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-xs"
                >
                  <Plus size={14} />
                  Create Meeting
                </button>
              )}
            </div>
          )}

          {!loading && !error && meetings.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-2xs">
              {meetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateMeetingModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        onSubmitAndProcess={handleCreateAndProcess}
        loading={createLoading}
        allParticipants={allParticipants}
        participantsLoading={participantsLoading}
      />
      <EditMeetingModal
        open={!!editTarget}
        meeting={editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEdit}
        loading={editLoading}
        allParticipants={allParticipants}
        participantsLoading={participantsLoading}
      />
      <DeleteConfirmModal
        open={!!deleteTarget}
        meeting={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </AppShell>
  );
}
