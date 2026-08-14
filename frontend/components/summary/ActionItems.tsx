"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import type { ActionItem, ActionItemCreate } from "@/types/meeting";
import { formatDate } from "@/lib/utils";
import { avatarColor, getInitials } from "@/lib/utils";

interface ActionItemsProps {
  items: ActionItem[];
  loading?: boolean;
  onToggle: (item: ActionItem) => Promise<void>;
  onDelete: (item: ActionItem) => Promise<void>;
  onCreate: (data: ActionItemCreate) => Promise<void>;
}

export default function ActionItems({
  items,
  loading,
  onToggle,
  onDelete,
  onCreate,
}: ActionItemsProps) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      await onCreate({ description: newTitle.trim() });
      setNewTitle("");
      setAdding(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 bg-slate-100 rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {items.length === 0 && !adding && (
        <p className="text-xs text-slate-400 dark:text-slate-500 italic py-1">No action items yet.</p>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className={`flex items-start gap-2.5 p-2 rounded-md group transition-colors ${
            item.completed ? "opacity-60" : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
          }`}
        >
          <button
            onClick={() => onToggle(item)}
            className="mt-0.5 shrink-0 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            {item.completed ? (
              <CheckCircle2 size={15} className="text-emerald-500" />
            ) : (
              <Circle size={15} />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <p
              className={`text-xs leading-snug break-words ${
                item.completed
                  ? "line-through text-slate-400 dark:text-slate-500"
                  : "text-slate-700 dark:text-slate-200"
              }`}
            >
              {item.description}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {item.assignee && (
                <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                  <div
                    className={`w-3.5 h-3.5 rounded-full ${avatarColor(item.assignee.name)} flex items-center justify-center text-[7px] font-bold text-white`}
                  >
                    {getInitials(item.assignee.name)[0]}
                  </div>
                  {item.assignee.name.split(" ")[0]}
                </span>
              )}
              {item.due_date && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  Due {formatDate(item.due_date)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onDelete(item)}
            className="shrink-0 opacity-80 sm:opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-0.5"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}

      {adding ? (
        <form onSubmit={handleCreate} className="flex flex-wrap sm:flex-nowrap items-center gap-2 mt-1">
          <input
            autoFocus
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Action item title…"
            className="flex-1 min-w-[150px] px-2.5 py-1.5 text-xs border border-purple-300 dark:border-purple-800 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="submit"
              disabled={saving || !newTitle.trim()}
              className="px-2.5 py-1.5 text-xs font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              {saving ? <Loader2 size={11} className="animate-spin" /> : null}
              Add
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setNewTitle(""); }}
              className="px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors mt-1 px-2 py-1"
        >
          <Plus size={13} /> Add action item
        </button>
      )}
    </div>
  );
}
