export interface Participant {
  id: number;
  name: string;
  email?: string | null;
  avatar_url?: string | null;
}

export interface Topic {
  id: number;
  meeting_id: number;
  name: string;
  start_time: number;
}

export interface Meeting {
  id: number;
  title: string;
  description?: string | null;
  meeting_date: string;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
  participants: Participant[];
  topics: Topic[];
}

export interface MeetingCreate {
  title: string;
  description?: string | null;
  meeting_date: string;
  duration_seconds?: number | null;
  participant_ids?: number[];
  transcript?: string;
  transcript_text?: string | null;
}

export interface MeetingUpdate {
  title?: string;
  description?: string | null;
  meeting_date?: string;
  duration_seconds?: number | null;
  participant_ids?: number[];
}

export interface TranscriptSegment {
  id: number;
  meeting_id: number;
  speaker: Participant | null;
  start_time: number;
  end_time: number;
  text: string;
  sequence: number;
}

export interface TranscriptResponse {
  meeting_id: number;
  segments: TranscriptSegment[];
}

export interface Summary {
  id: number;
  meeting_id: number;
  overview: string | null;
  key_points: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  id: number;
  meeting_id: number;
  description: string;
  completed: boolean;
  assignee?: Participant | null;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionItemCreate {
  description: string;
  assignee_id?: number | null;
  due_date?: string | null;
}

export interface ActionItemUpdate {
  description?: string;
  completed?: boolean;
  assignee_id?: number | null;
  due_date?: string | null;
}

export interface MeetingListPage {
  items: Meeting[];
  total: number;
  page: number;
  page_size: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatPayload {
  message: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  answer: string;
}

export interface SearchResultItem {
  meeting_id: number;
  meeting_title: string;
  meeting_date: string;
  match_type: "transcript" | "title" | "description" | "participant" | "summary" | "key_point" | "action_item";
  speaker?: string | null;
  timestamp?: number | null;
  text: string;
}

export interface GlobalSearchResponse {
  query: string;
  total: number;
  results: SearchResultItem[];
}
