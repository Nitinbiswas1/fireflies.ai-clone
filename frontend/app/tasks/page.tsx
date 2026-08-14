"use client";

import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import { CheckSquare, Clock } from "lucide-react";

export default function TasksPage() {
  return (
    <AppShell>
      <Topbar title="Meeting Status & Tasks" />

      <main className="flex-1 overflow-y-auto bg-slate-50/60 dark:bg-slate-950 p-4 sm:p-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto border border-purple-100 dark:border-purple-900/60 shadow-2xs">
            <CheckSquare size={24} />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Workspace Action Board
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 text-[11px] font-bold border border-purple-200 dark:border-purple-800">
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Centralized workspace task board to aggregate all meeting action items, assignees, and deadlines across your team.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-left text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-200">Currently available:</p>
            <p className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
              <Clock size={13} className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <span>Action items are automatically extracted and managed inside each meeting notebook view.</span>
            </p>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
