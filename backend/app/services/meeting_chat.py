"""Service for constructing meeting context and querying Hugging Face Inference Providers."""

from __future__ import annotations

import os
from typing import TYPE_CHECKING

from sqlalchemy.orm import Session
from huggingface_hub import InferenceClient
from huggingface_hub.errors import HfHubHTTPError

from app.models.action_item import ActionItem
from app.models.meeting import Meeting
from app.models.summary import Summary
from app.models.topic import Topic
from app.models.transcript import TranscriptSegment

if TYPE_CHECKING:
    from app.schemas.chat import ChatMessage


class HuggingFaceNotConfiguredError(Exception):
    """Raised when HF_TOKEN environment variable is not configured."""


class HuggingFaceUnavailableError(Exception):
    """Raised when Hugging Face API is unreachable or fails."""


class HuggingFaceModelNotFoundError(Exception):
    """Raised when configured Hugging Face model is unavailable."""


def build_meeting_context(db: Session, meeting: Meeting) -> str:
    """Build a compact, structured textual context for a meeting."""
    lines: list[str] = []

    lines.append(f"MEETING TITLE: {meeting.title}")
    if meeting.description:
        lines.append(f"MEETING DESCRIPTION: {meeting.description}")
    lines.append(f"DATE: {meeting.meeting_date.strftime('%Y-%m-%d %H:%M')}")
    if meeting.duration_seconds:
        lines.append(f"DURATION: {max(1, meeting.duration_seconds // 60)} minutes")

    # Participants
    if meeting.participants:
        spk_str = ", ".join(p.name for p in meeting.participants)
        lines.append(f"\nPARTICIPANTS:\n{spk_str}")

    # Summary & Key Points
    summary = db.query(Summary).filter(Summary.meeting_id == meeting.id).first()
    if summary:
        if summary.overview:
            lines.append(f"\nOVERVIEW:\n{summary.overview}")
        if summary.key_points:
            kp_str = "\n".join(f"- {kp}" for kp in summary.key_points)
            lines.append(f"\nKEY POINTS:\n{kp_str}")

    # Topics / Outline
    topics = (
        db.query(Topic)
        .filter(Topic.meeting_id == meeting.id)
        .order_by(Topic.start_time.asc())
        .all()
    )
    if topics:
        top_str = "\n".join(
            f"- [{int(t.start_time // 60):02d}:{int(t.start_time % 60):02d}] {t.name}"
            for t in topics
        )
        lines.append(f"\nMEETING OUTLINE / TOPICS:\n{top_str}")

    # Action Items
    actions = (
        db.query(ActionItem)
        .filter(ActionItem.meeting_id == meeting.id)
        .all()
    )
    if actions:
        act_lines: list[str] = []
        for a in actions:
            assignee = a.assignee.name if a.assignee else "Unassigned"
            due = a.due_date.strftime("%Y-%m-%d") if a.due_date else "No deadline"
            status = "Completed" if a.completed else "Pending"
            act_lines.append(f"- [{assignee}] (Due: {due}, Status: {status}): {a.title}")
        lines.append(f"\nACTION ITEMS:\n" + "\n".join(act_lines))

    # Transcript Segments
    segments = (
        db.query(TranscriptSegment)
        .filter(TranscriptSegment.meeting_id == meeting.id)
        .order_by(TranscriptSegment.sequence.asc())
        .all()
    )
    if segments:
        seg_lines: list[str] = []
        for s in segments:
            spk = s.speaker.name if s.speaker else "Unknown Speaker"
            ts_min = int(s.start_time // 60)
            ts_sec = int(s.start_time % 60)
            seg_lines.append(f"[{ts_min:02d}:{ts_sec:02d}] {spk}: {s.text}")
        lines.append(f"\nTRANSCRIPT SEGMENTS:\n" + "\n".join(seg_lines))

    return "\n".join(lines)


def query_huggingface(
    meeting_context: str,
    question: str,
    history: list[ChatMessage],
) -> str:
    hf_token = os.environ.get("HF_TOKEN", "").strip()
    if not hf_token:
        from pathlib import Path
        from dotenv import load_dotenv
        _env_path = Path(__file__).resolve().parent.parent.parent / ".env"
        if _env_path.exists():
            load_dotenv(dotenv_path=_env_path)
        else:
            load_dotenv()
        hf_token = os.environ.get("HF_TOKEN", "").strip()

    if not hf_token:
        raise HuggingFaceNotConfiguredError("HF_TOKEN environment variable is not configured.")

    model = os.environ.get("HF_MODEL", "Qwen/Qwen2.5-7B-Instruct-1M").strip()

    system_prompt = f"""You are the AI meeting assistant inside a meeting-notes application.

Your job is to answer questions about ONE specific meeting.

Use ONLY the meeting context provided below.

Rules:
1. Do not use outside knowledge.
2. Do not invent facts.
3. Do not assume information that is not present.
4. If the answer is not contained in the meeting context, say:
   "I couldn't find that information in this meeting."
5. When possible, mention the relevant speaker, topic, or action item.
6. Keep answers concise and useful.
7. Never answer using information from another meeting.

MEETING CONTEXT:
{meeting_context}"""

    messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]

    for msg in history[-6:]:
        messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": question})

    try:
        client = InferenceClient(api_key=hf_token, provider="auto")
        completion = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=512,
            temperature=0.2,
        )
        answer = completion.choices[0].message.content or ""
        answer = answer.strip()
        if not answer:
            answer = "I couldn't find that information in this meeting."
        return answer
    except HfHubHTTPError as exc:
        status_code = getattr(exc.response, "status_code", 500) if hasattr(exc, "response") else 500
        if status_code in (401, 403):
            raise HuggingFaceNotConfiguredError("Invalid or missing Hugging Face API token.") from exc
        if status_code == 404:
            raise HuggingFaceModelNotFoundError(f"Model '{model}' not found on Hugging Face.") from exc
        raise HuggingFaceUnavailableError(f"Hugging Face API returned error status {status_code}") from exc
    except Exception as exc:
        raise HuggingFaceUnavailableError(f"Hugging Face inference request failed: {exc}") from exc
