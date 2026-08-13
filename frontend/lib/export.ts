import { formatDate, formatDuration, formatTimestamp } from "./utils";
import type { ActionItem, Meeting, Summary, TranscriptSegment } from "@/types/meeting";

/**
 * Triggers a browser file download using a Blob URL.
 */
export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Sanitizes filenames for clean OS saving.
 */
function sanitizeFilename(title: string, ext: string): string {
  const cleanTitle = title.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_").toLowerCase();
  return `${cleanTitle}.${ext}`;
}

/**
 * Generates a clean TXT export of the meeting transcript.
 */
export function exportTranscript(meeting: Meeting, segments: TranscriptSegment[]): { filename: string; content: string } {
  const participants = meeting.participants.map((p) => p.name).join(", ") || "None";

  let content = `Meeting: ${meeting.title}\n`;
  content += `Date: ${formatDate(meeting.meeting_date)}\n`;
  content += `Duration: ${formatDuration(meeting.duration_seconds)}\n`;
  content += `Participants: ${participants}\n\n`;
  content += `TRANSCRIPT\n`;
  content += `----------------------------------------\n\n`;

  if (segments.length === 0) {
    content += `(No transcript segments available for this meeting.)\n`;
  } else {
    segments.forEach((seg) => {
      const speakerName = seg.speaker?.name ?? "Unknown";
      const ts = formatTimestamp(seg.start_time);
      content += `[${ts}] ${speakerName}:\n${seg.text}\n\n`;
    });
  }

  const filename = sanitizeFilename(`transcript_${meeting.title}`, "txt");
  return { filename, content };
}

/**
 * Generates a clean TXT export of the meeting summary, outline, and action items.
 */
export function exportSummary(
  meeting: Meeting,
  summary: Summary | null,
  actions: ActionItem[]
): { filename: string; content: string } {
  const participants = meeting.participants.map((p) => p.name).join(", ") || "None";

  let content = `Meeting: ${meeting.title}\n`;
  content += `Date: ${formatDate(meeting.meeting_date)}\n`;
  content += `Duration: ${formatDuration(meeting.duration_seconds)}\n`;
  content += `Participants: ${participants}\n\n`;

  content += `OVERVIEW\n`;
  content += `----------------------------------------\n`;
  content += summary?.overview ? `${summary.overview}\n\n` : `No overview available.\n\n`;

  content += `KEY POINTS\n`;
  content += `----------------------------------------\n`;
  if (summary?.key_points && summary.key_points.length > 0) {
    summary.key_points.forEach((point) => {
      content += `• ${point}\n`;
    });
    content += `\n`;
  } else {
    content += `No key points available.\n\n`;
  }

  content += `MEETING OUTLINE\n`;
  content += `----------------------------------------\n`;
  if (meeting.topics && meeting.topics.length > 0) {
    meeting.topics.forEach((t) => {
      content += `[${formatTimestamp(t.start_time)}] ${t.name}\n`;
    });
    content += `\n`;
  } else {
    content += `No meeting outline available.\n\n`;
  }

  content += `ACTION ITEMS\n`;
  content += `----------------------------------------\n`;
  if (actions.length > 0) {
    actions.forEach((act) => {
      const check = act.completed ? "☑" : "☐";
      content += `${check} ${act.description}\n`;
      if (act.assignee) {
        content += `  Assignee: ${act.assignee.name}\n`;
      }
      if (act.due_date) {
        content += `  Due: ${formatDate(act.due_date)}\n`;
      }
    });
  } else {
    content += `No action items available.`;
  }

  const filename = sanitizeFilename(`summary_${meeting.title}`, "txt");
  return { filename, content };
}

/**
 * Generates a full Markdown (.md) document of the meeting.
 */
export function exportFullMarkdown(
  meeting: Meeting,
  segments: TranscriptSegment[],
  summary: Summary | null,
  actions: ActionItem[]
): { filename: string; content: string } {
  let content = `# ${meeting.title}\n\n`;
  content += `**Date:** ${formatDate(meeting.meeting_date)}  \n`;
  content += `**Duration:** ${formatDuration(meeting.duration_seconds)}  \n\n`;

  content += `## Participants\n\n`;
  if (meeting.participants.length > 0) {
    meeting.participants.forEach((p) => {
      content += `- ${p.name}\n`;
    });
    content += `\n`;
  } else {
    content += `*No participants listed.*\n\n`;
  }

  content += `## Overview\n\n`;
  content += summary?.overview ? `${summary.overview}\n\n` : `*No overview available.*\n\n`;

  content += `## Key Points\n\n`;
  if (summary?.key_points && summary.key_points.length > 0) {
    summary.key_points.forEach((point) => {
      content += `- ${point}\n`;
    });
    content += `\n`;
  } else {
    content += `*No key points available.*\n\n`;
  }

  content += `## Meeting Outline\n\n`;
  if (meeting.topics && meeting.topics.length > 0) {
    meeting.topics.forEach((t) => {
      content += `- **${formatTimestamp(t.start_time)}** ${t.name}\n`;
    });
    content += `\n`;
  } else {
    content += `*No meeting outline available.*\n\n`;
  }

  content += `## Action Items\n\n`;
  if (actions.length > 0) {
    actions.forEach((act) => {
      const check = act.completed ? "x" : " ";
      const assigneeStr = act.assignee ? ` (${act.assignee.name})` : "";
      content += `- [${check}] ${act.description}${assigneeStr}\n`;
    });
    content += `\n`;
  } else {
    content += `*No action items available.*\n\n`;
  }

  content += `## Transcript\n\n`;
  if (segments.length > 0) {
    segments.forEach((seg) => {
      const speakerName = seg.speaker?.name ?? "Unknown";
      const ts = formatTimestamp(seg.start_time);
      content += `### [${ts}] ${speakerName}\n\n${seg.text}\n\n`;
    });
  } else {
    content += `*No transcript available for this meeting.*\n\n`;
  }

  const filename = sanitizeFilename(`meeting_notes_${meeting.title}`, "md");
  return { filename, content };
}
