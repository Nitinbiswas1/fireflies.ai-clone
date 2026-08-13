"use client";

import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import { FolderKanban, Hash } from "lucide-react";

export default function ChannelsPage() {
  return (
    <AppShell>
      <Topbar title="Channels & Topic Hubs" />

      <main className="flex-1 overflow-y-auto bg-slate-50 p-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto border border-violet-100">
            <Hash size={24} />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-base font-semibold text-slate-800">
                Meeting Channels & Folders
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[11px] font-semibold border border-violet-200">
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Organize meeting transcripts, summaries, and recordings into project channels, team folders, and client hubs.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Currently available:</p>
            <p className="flex items-center gap-1.5 text-slate-600">
              <FolderKanban size={12} className="text-violet-600" />
              Use the Meetings library search and participant filters to organize and access all your meetings.
            </p>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
