"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import { getParticipants } from "@/lib/api";
import type { Participant } from "@/types/meeting";
import { Mail, Plus } from "lucide-react";
import { avatarColor, getInitials } from "@/lib/utils";

export default function PeoplePage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParticipants()
      .then(setParticipants)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <Topbar title="People & Team Directory">
        <button
          disabled
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed border border-slate-200"
          title="Teammate invitation is coming soon"
        >
          <Plus size={13} />
          Invite Teammate (Coming Soon)
        </button>
      </Topbar>

      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-3.5 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Workspace Participants & Speakers
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active participants registered across your meeting library
              </p>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {participants.length} registered
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-2.5 w-36 bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {p.avatar_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={p.avatar_url}
                        alt={p.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                    ) : (
                      <div
                        className={`w-9 h-9 rounded-full ${avatarColor(
                          p.name
                        )} flex items-center justify-center text-xs font-semibold text-slate-700 shrink-0`}
                      >
                        {getInitials(p.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate flex items-center gap-1">
                        <Mail size={11} />
                        {p.email}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0 ml-2">
                    Participant
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
