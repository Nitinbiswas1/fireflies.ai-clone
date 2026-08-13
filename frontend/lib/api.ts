import type {
  ActionItem,
  ActionItemCreate,
  ActionItemUpdate,
  ChatMessage,
  ChatResponse,
  GlobalSearchResponse,
  Meeting,
  MeetingCreate,
  MeetingListPage,
  MeetingUpdate,
  Participant,
  Summary,
  TranscriptResponse,
} from "@/types/meeting";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body?.detail ?? detail;
    } catch {
      // ignore JSON parse failure
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Meetings ────────────────────────────────────────────────────────────────

export async function getMeetings(params?: {
  search?: string;
  participant_id?: number;
  topics?: string[];
  sort?: "recent" | "oldest";
  page?: number;
  page_size?: number;
}): Promise<MeetingListPage> {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.participant_id != null)
    q.set("participant_id", String(params.participant_id));
  if (params?.topics && params.topics.length > 0)
    q.set("topics", params.topics.join(","));
  if (params?.sort) q.set("sort", params.sort);
  if (params?.page) q.set("page", String(params.page));
  if (params?.page_size) q.set("page_size", String(params.page_size));
  const qs = q.toString();
  return request<MeetingListPage>(`/api/meetings${qs ? `?${qs}` : ""}`);
}

export async function getTopics(): Promise<string[]> {
  return request<string[]>("/api/topics");
}

export async function getMeeting(id: number): Promise<Meeting> {
  return request<Meeting>(`/api/meetings/${id}`);
}

export async function createMeeting(data: MeetingCreate): Promise<Meeting> {
  return request<Meeting>("/api/meetings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMeeting(
  id: number,
  data: MeetingUpdate
): Promise<Meeting> {
  return request<Meeting>(`/api/meetings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteMeeting(id: number): Promise<void> {
  return request<void>(`/api/meetings/${id}`, { method: "DELETE" });
}

export async function processMeeting(
  id: number,
  transcriptText: string
): Promise<Meeting> {
  return request<Meeting>(`/api/meetings/${id}/process`, {
    method: "POST",
    body: JSON.stringify({ transcript_text: transcriptText }),
  });
}

// ── Participants ──────────────────────────────────────────────────────────────

export async function getParticipants(): Promise<Participant[]> {
  return request<Participant[]>(`/api/participants`);
}

// ── Transcript ───────────────────────────────────────────────────────────────

export async function getTranscript(
  meetingId: number
): Promise<TranscriptResponse> {
  return request<TranscriptResponse>(`/api/meetings/${meetingId}/transcript`);
}

// ── Summary ──────────────────────────────────────────────────────────────────

export async function getSummary(meetingId: number): Promise<Summary> {
  return request<Summary>(`/api/meetings/${meetingId}/summary`);
}

// ── Action Items ─────────────────────────────────────────────────────────────

export async function getActionItems(meetingId: number): Promise<ActionItem[]> {
  return request<ActionItem[]>(`/api/meetings/${meetingId}/actions`);
}

export async function createActionItem(
  meetingId: number,
  data: ActionItemCreate
): Promise<ActionItem> {
  return request<ActionItem>(`/api/meetings/${meetingId}/actions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateActionItem(
  actionId: number,
  data: ActionItemUpdate
): Promise<ActionItem> {
  return request<ActionItem>(`/api/actions/${actionId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteActionItem(actionId: number): Promise<void> {
  return request<void>(`/api/actions/${actionId}`, { method: "DELETE" });
}

export async function askMeetingQuestion(
  meetingId: number,
  message: string,
  history: ChatMessage[] = []
): Promise<ChatResponse> {
  return request<ChatResponse>(`/api/meetings/${meetingId}/chat`, {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
}

export async function searchGlobal(query: string): Promise<GlobalSearchResponse> {
  return request<GlobalSearchResponse>(`/api/search?q=${encodeURIComponent(query)}`);
}
