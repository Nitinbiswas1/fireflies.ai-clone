"use client";

import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import { CheckSquare, Clock } from "lucide-react";

export default function TasksPage() {
  return (
    <AppShell>
      <Topbar title="Meeting Status & Tasks" />

      <main className="flex-1 overflow-y-auto bg-slate-50/60 p-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200/80 shadow-2xs text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100 shadow-2xs">
            <CheckSquare size={24} />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-base font-bold text-slate-800 tracking-tight">
                Workspace Action Board
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-200">
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Centralized workspace task board to aggregate all meeting action items, assignees, and deadlines across your team.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-left text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Currently available:</p>
            <p className="flex items-center gap-1.5 text-slate-600">
              <Clock size={13} className="text-purple-600 shrink-0" />
              Action items are automatically extracted and managed inside each meeting notebook view.
            </p>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
