"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, Loader2, AlertCircle, User, RefreshCw } from "lucide-react";
import { askMeetingQuestion } from "@/lib/api";
import type { ChatMessage } from "@/types/meeting";

interface MeetingChatProps {
  meetingId: number;
  hasContent: boolean;
}

const SUGGESTED_QUESTIONS = [
  "What were the main decisions?",
  "What were the biggest risks?",
  "Who has action items?",
  "What deadlines were mentioned?",
  "What did Marcus say about the timeline?",
  "What topics were discussed?",
];

export default function MeetingChat({ meetingId, hasContent }: MeetingChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText?: string) => {
    const textToSend = (questionText ?? input).trim();
    if (!textToSend || loading) return;

    if (!hasContent) {
      setError(
        "This meeting doesn't have enough content for AI questions yet. Add and process a transcript first."
      );
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: textToSend };
    const newHistory = [...messages, userMessage];

    setMessages(newHistory);
    if (!questionText) setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await askMeetingQuestion(meetingId, textToSend, messages);
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: res.answer,
      };
      setMessages([...newHistory, assistantMessage]);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? err.message
          : "AI assistant is temporarily unavailable. Please try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!hasContent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50/50 dark:bg-slate-900/50">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 border border-amber-100 dark:border-amber-900/60">
          <Bot size={24} />
        </div>
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
          No Meeting Content Yet
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
          This meeting doesn&apos;t have enough content for AI questions yet. Add and process a transcript first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900">
      {/* Header Info */}
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-2xs">
            <Sparkles size={13} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight">Ask about this meeting</h3>
            <p className="text-[10px] text-slate-400 font-medium">Powered by Hugging Face Inference Providers</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => {
              setMessages([]);
              setError(null);
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Clear chat history"
          >
            <RefreshCw size={13} />
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-4 my-2">
            <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 text-xs text-purple-900 dark:text-purple-200 leading-relaxed shadow-2xs">
              <p className="font-semibold mb-1 flex items-center gap-1.5 text-purple-800 dark:text-purple-300">
                <Bot size={14} className="text-purple-600 dark:text-purple-400" />
                Meeting AI Assistant
              </p>
              Ask questions about the transcript, summary, key decisions, topics, and action items for this meeting.
            </div>

            {/* Suggested questions */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Suggested questions:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSend(q)}
                    disabled={loading}
                    className="text-left text-xs px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 text-slate-700 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300 border border-slate-200/80 dark:border-slate-700 hover:border-purple-200 transition-colors disabled:opacity-50 font-medium shadow-2xs"
                  >
                    • {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-2xs">
                  <Bot size={13} />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white rounded-br-none shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none whitespace-pre-wrap"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                  <User size={13} />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 w-fit shadow-2xs font-medium">
            <Loader2 size={13} className="animate-spin text-purple-600 dark:text-purple-400" />
            Generating answer from meeting context…
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 p-3 rounded-xl border border-red-100 dark:border-red-900/60 shadow-2xs">
            <AlertCircle size={14} className="shrink-0 text-red-500 mt-0.5" />
            <p className="flex-1">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2"
        >
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this meeting… (Press Enter to send)"
            disabled={loading}
            className="flex-1 px-3 py-2 text-xs border border-slate-200/80 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-colors resize-none disabled:bg-slate-50 dark:disabled:bg-slate-900 shadow-2xs"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 shadow-2xs"
            title="Ask"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </form>
      </div>
    </div>
  );
}
