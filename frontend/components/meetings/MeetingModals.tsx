"use client";

import { useState } from "react";
import { Check, ChevronDown, Loader2, X, Zap } from "lucide-react";
import type { Meeting, MeetingCreate, MeetingUpdate, Participant } from "@/types/meeting";
import Modal from "@/components/ui/Modal";

// ---------------------------------------------------------------------------
// Participant multi-select dropdown with chip badges
// ---------------------------------------------------------------------------

interface ParticipantSelectProps {
  allParticipants: Participant[];
  selected: number[];
  onChange: (ids: number[]) => void;
  loading?: boolean;
}

function ParticipantSelect({
  allParticipants,
  selected,
  onChange,
  loading,
}: ParticipantSelectProps) {
  const [open, setOpen] = useState(false);

  const toggle = (id: number) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const remove = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((s) => s !== id));
  };

  const selectedParticipants = allParticipants.filter((p) => selected.includes(p.id));

  return (
    <div className="relative space-y-2">
      {/* Selected participant badges */}
      {selectedParticipants.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
          {selectedParticipants.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-700 font-medium shadow-xs"
            >
              <span>{p.name}</span>
              <button
                type="button"
                onClick={(e) => remove(p.id, e)}
                className="text-slate-400 hover:text-red-500 transition-colors"
                title={`Remove ${p.name}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Multi-select dropdown button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors text-left"
      >
        <span className={selected.length === 0 ? "text-slate-400" : "text-slate-700"}>
          {loading
            ? "Loading participants…"
            : selected.length === 0
            ? "Select participants…"
            : `${selected.length} participant${selected.length > 1 ? "s" : ""} selected`}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && !loading && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          {allParticipants.length === 0 ? (
            <p className="px-3 py-2 text-xs text-slate-400">No participants found</p>
          ) : (
            allParticipants.map((p) => {
              const isSelected = selected.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 transition-colors text-left"
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      isSelected
                        ? "bg-violet-600 border-violet-600"
                        : "border-slate-300"
                    }`}
                  >
                    {isSelected && <Check size={10} className="text-white" />}
                  </div>
                  <span className="flex-1 text-slate-700">{p.name}</span>
                  <span className="text-xs text-slate-400">{p.email}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CreateMeetingModal
// ---------------------------------------------------------------------------

interface CreateMeetingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MeetingCreate) => Promise<void>;
  onSubmitAndProcess: (data: MeetingCreate) => Promise<void>;
  loading?: boolean;
  allParticipants: Participant[];
  participantsLoading?: boolean;
}

export function CreateMeetingModal({
  open,
  onClose,
  onSubmit,
  onSubmitAndProcess,
  loading,
  allParticipants,
  participantsLoading,
}: CreateMeetingModalProps) {
  const [prevOpen, setPrevOpen] = useState(open);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingDate, setMeetingDate] = useState(
    () => new Date().toISOString().slice(0, 16)
  );
  const [duration, setDuration] = useState("");
  const [participantIds, setParticipantIds] = useState<number[]>([]);
  const [transcript, setTranscript] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);

  // Sync state when modal open changes (React state adjustment pattern)
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setTitle("");
      setDescription("");
      setMeetingDate(new Date().toISOString().slice(0, 16));
      setDuration("");
      setParticipantIds([]);
      setTranscript("");
      setShowTranscript(false);
    }
  }

  const buildData = (): MeetingCreate => ({
    title: title.trim(),
    description: description.trim() || null,
    meeting_date: new Date(meetingDate).toISOString(),
    duration_seconds: duration ? Number(duration) * 60 : null,
    participant_ids: participantIds,
    transcript_text: transcript.trim() || null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(buildData());
  };

  const handleSubmitAndProcess = async (e: React.MouseEvent) => {
    e.preventDefault();
    await onSubmitAndProcess(buildData());
  };

  return (
    <Modal open={open} onClose={onClose} title="New Meeting" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            required
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q3 Product Strategy Review"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional meeting description…"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors resize-none"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="datetime-local"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 60"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors"
            />
          </div>
        </div>

        {/* Participant selector */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Participants
          </label>
          <ParticipantSelect
            allParticipants={allParticipants}
            selected={participantIds}
            onChange={setParticipantIds}
            loading={participantsLoading}
          />
        </div>

        {/* Transcript toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowTranscript((v) => !v)}
            className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
          >
            <Zap size={12} />
            {showTranscript ? "Hide transcript" : "Add transcript (optional)"}
          </button>
          {showTranscript && (
            <div className="mt-2">
              <textarea
                rows={6}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={`Paste transcript here…\n\nFormats supported:\n  Alice: Hello everyone.\n  Bob: Thanks for joining.\n  [0:00] Alice: Hello everyone.\n\nOr plain paragraphs.`}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors resize-none font-mono text-xs"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Automatic speech-to-text is coming soon. For now, paste a transcript to process your meeting.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          {transcript.trim() ? (
            <button
              type="button"
              onClick={handleSubmitAndProcess}
              disabled={loading || !title.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Zap size={13} />
                  Create & Process
                </>
              )}
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating…" : "Create Meeting"}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// EditMeetingModal
// ---------------------------------------------------------------------------

interface EditMeetingModalProps {
  open: boolean;
  meeting: Meeting | null;
  onClose: () => void;
  onSubmit: (id: number, data: MeetingUpdate) => Promise<void>;
  loading?: boolean;
  allParticipants: Participant[];
  participantsLoading?: boolean;
}

export function EditMeetingModal({
  open,
  meeting,
  onClose,
  onSubmit,
  loading,
  allParticipants,
  participantsLoading,
}: EditMeetingModalProps) {
  const [prevMeetingId, setPrevMeetingId] = useState<number | null>(meeting?.id ?? null);
  const [title, setTitle] = useState(meeting?.title ?? "");
  const [description, setDescription] = useState(meeting?.description ?? "");
  const [participantIds, setParticipantIds] = useState<number[]>(
    meeting?.participants.map((p) => p.id) ?? []
  );

  // Sync state when meeting changes
  if (meeting && meeting.id !== prevMeetingId) {
    setPrevMeetingId(meeting.id);
    setTitle(meeting.title);
    setDescription(meeting.description ?? "");
    setParticipantIds(meeting.participants.map((p) => p.id));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meeting) return;
    await onSubmit(meeting.id, {
      title: title.trim(),
      description: description.trim() || null,
      participant_ids: participantIds,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Meeting">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            required
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors resize-none"
          />
        </div>

        {/* Participant selector */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Participants
          </label>
          <ParticipantSelect
            allParticipants={allParticipants}
            selected={participantIds}
            onChange={setParticipantIds}
            loading={participantsLoading}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// DeleteConfirmModal
// ---------------------------------------------------------------------------

interface DeleteConfirmModalProps {
  open: boolean;
  meeting: Meeting | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export function DeleteConfirmModal({
  open,
  meeting,
  onClose,
  onConfirm,
  loading,
}: DeleteConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Meeting" size="sm">
      <p className="text-sm text-slate-600 mb-1">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-slate-800">
          &ldquo;{meeting?.title}&rdquo;
        </span>
        ?
      </p>
      <p className="text-xs text-slate-400 mb-5">
        This will permanently delete the meeting, transcript, summary, and all
        action items. This action cannot be undone.
      </p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Deleting…" : "Delete Meeting"}
        </button>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// AddTranscriptModal
// ---------------------------------------------------------------------------

interface AddTranscriptModalProps {
  open: boolean;
  meeting: Meeting | null;
  onClose: () => void;
  onProcess: (transcriptText: string) => Promise<void>;
  loading?: boolean;
}

export function AddTranscriptModal({
  open,
  meeting,
  onClose,
  onProcess,
  loading,
}: AddTranscriptModalProps) {
  const [prevOpen, setPrevOpen] = useState(open);
  const [transcript, setTranscript] = useState("");

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setTranscript("");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) return;
    await onProcess(transcript.trim());
  };

  return (
    <Modal open={open} onClose={onClose} title="Add & Process Transcript" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-500">
          Automatic speech-to-text is coming soon. For now, paste a transcript for{" "}
          <span className="font-semibold text-slate-700">&ldquo;{meeting?.title}&rdquo;</span>.
          The processor will parse speakers, generate a summary, topics, and action items.
        </p>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Transcript <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            autoFocus
            rows={10}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={`Paste transcript here…\n\nFormats supported:\n  Sarah: Hello everyone.\n  Marcus: The project is on track.\n  [0:00] Sarah: Hello everyone.\n\nOr plain paragraphs.`}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors resize-none font-mono text-xs"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            Supports &ldquo;Speaker: text&rdquo; or &ldquo;[MM:SS] Speaker: text&rdquo; format.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !transcript.trim()}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Zap size={13} />
                Process Transcript
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
