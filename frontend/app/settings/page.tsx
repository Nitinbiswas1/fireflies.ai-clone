"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import {
  Bot,
  Calendar,
  CheckCircle2,
  Database,
  FileText,
  Globe,
  Layers,
  Lock,
  Mic,
  Moon,
  Sparkles,
  Sun,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<
    "profile" | "bot" | "integrations" | "team" | "transcription"
  >("profile");

  return (
    <AppShell>
      <Topbar title="Settings" />

      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-3.5 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 gap-3 sm:gap-6 bg-white dark:bg-slate-900 px-3 sm:px-6 pt-3 rounded-t-xl border border-b-0 shrink-0">
            {[
              { id: "profile", label: "Profile & Account", icon: <Users size={14} /> },
              { id: "bot", label: "Meeting Bot", icon: <Bot size={14} /> },
              { id: "integrations", label: "Integrations", icon: <Zap size={14} /> },
              { id: "team", label: "Team & Collaboration", icon: <Layers size={14} /> },
              { id: "transcription", label: "Speech-to-Text", icon: <Mic size={14} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 pb-3 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-violet-600 text-violet-600 dark:text-purple-400"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: PROFILE & ACCOUNT */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Appearance & Dark Mode Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun size={16} className="text-amber-500 dark:hidden" />
                    <Moon size={16} className="text-purple-400 hidden dark:block" />
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      Appearance & Theme
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    Persisted in localStorage
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Interface Theme
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Switch between clean Light mode and dark charcoal/navy Fireflies theme
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-200/80 dark:bg-slate-700 p-1 rounded-xl">
                    <button
                      type="button"
                      aria-label="Switch to light mode"
                      onClick={() => setTheme("light")}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                        theme === "light"
                          ? "bg-white text-slate-800 shadow-2xs"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Light
                    </button>
                    <button
                      type="button"
                      aria-label="Switch to dark mode"
                      onClick={() => setTheme("dark")}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                        theme === "dark"
                          ? "bg-purple-600 text-white shadow-2xs"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>
              </div>
              {/* Profile Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Users size={16} className="text-violet-600 dark:text-purple-400" />
                    Default User Profile
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-900/60">
                    <CheckCircle2 size={11} />
                    Active Session
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Logged-in User
                    </label>
                    <div className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium">
                      Nitin Biswas
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Email Address
                    </label>
                    <div className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium">
                      nitin.biswas@workspace.local
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Current Workspace
                    </label>
                    <div className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium">
                      Default Workspace (Primary)
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Role & Permissions
                    </label>
                    <div className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium">
                      Workspace Administrator
                    </div>
                  </div>
                </div>
              </div>

              {/* Authentication Placeholder */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock size={16} className="text-slate-400" />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        Real User Authentication
                      </h4>
                      <p className="text-xs text-slate-400">
                        OAuth 2.0, Single Sign-On (SSO), and Multi-Factor Auth
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200">
                    Coming Soon
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  Authentication is currently bypassed. The application runs with a default
                  logged-in user context. Full authentication (Google Sign-In, SAML SSO, and JWT tokens) will be enabled in a future release.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    disabled
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed border border-slate-200"
                  >
                    Change Password (Coming Soon)
                  </button>
                  <button
                    disabled
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed border border-slate-200"
                  >
                    Sign Out (Coming Soon)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REAL-TIME MEETING BOT */}
          {activeTab === "bot" && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-violet-50 text-violet-600 rounded-xl border border-violet-100">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">
                      Real-Time Meeting Bot
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Automatically join, record, and transcribe live video meetings
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold border border-violet-200">
                  Coming Soon
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Firefiles Meeting Bot automatically joins your scheduled Google Meet, Zoom, and Microsoft Teams calls as a participant, records audio streams, and pushes live transcriptions directly to your notebook.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center gap-2 text-xs text-slate-600">
                    <Video size={14} className="text-blue-500" />
                    Auto-join Google Meet calls
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center gap-2 text-xs text-slate-600">
                    <Video size={14} className="text-violet-500" />
                    Auto-join Zoom Video meetings
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  Meeting bot functionality is currently simulated. Real-time media capture is out of scope for this build.
                </p>
                <button
                  disabled
                  className="px-4 py-2 text-xs font-medium bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed border border-slate-200 shrink-0"
                >
                  Configure Bot (Coming Soon)
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: INTEGRATIONS */}
          {activeTab === "integrations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Integrations & Apps
                  </h3>
                  <p className="text-xs text-slate-400">
                    Connect Firefiles with your calendar, video conferencing, and CRM platforms
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Zoom */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <Video size={18} />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800">Zoom</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Connect your Zoom meetings automatically to capture recordings and transcripts.
                    </p>
                  </div>
                  <button
                    disabled
                    className="w-full py-1.5 text-xs font-medium bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed border border-slate-200"
                  >
                    Connect Zoom (Coming Soon)
                  </button>
                </div>

                {/* Google Meet */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <Globe size={18} />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800">Google Meet</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Automatically capture Google Meet sessions directly from Chrome.
                    </p>
                  </div>
                  <button
                    disabled
                    className="w-full py-1.5 text-xs font-medium bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed border border-slate-200"
                  >
                    Connect Google Meet (Coming Soon)
                  </button>
                </div>

                {/* Google Calendar */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                          <Calendar size={18} />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800">Google Calendar</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Sync your upcoming meeting schedule to automatically trigger notes.
                    </p>
                  </div>
                  <button
                    disabled
                    className="w-full py-1.5 text-xs font-medium bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed border border-slate-200"
                  >
                    Sync Calendar (Coming Soon)
                  </button>
                </div>

                {/* CRM Integrations */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                          <Database size={18} />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800">CRM (Salesforce / HubSpot)</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Sync meeting summaries, key points, and action items with your CRM records.
                    </p>
                  </div>
                  <button
                    disabled
                    className="w-full py-1.5 text-xs font-medium bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed border border-slate-200"
                  >
                    Connect CRM (Coming Soon)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEAM & COLLABORATION */}
          {activeTab === "team" && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">
                    Team & Workspace Collaboration
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Invite teammates and collaborate on meeting notes, transcripts, and action items.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold border border-violet-200">
                  Coming Soon
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Workspace Sharing Options
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <p className="text-xs font-semibold text-slate-700">Team Members</p>
                      <p className="text-[11px] text-slate-400">Manage seats & access roles</p>
                      <span className="inline-block mt-2 text-[10px] text-slate-400 font-medium">Coming Soon</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <p className="text-xs font-semibold text-slate-700">Sharing Policies</p>
                      <p className="text-[11px] text-slate-400">Default visibility settings</p>
                      <span className="inline-block mt-2 text-[10px] text-slate-400 font-medium">Coming Soon</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <p className="text-xs font-semibold text-slate-700">Workspace Channels</p>
                      <p className="text-[11px] text-slate-400">Shared topic notebook folders</p>
                      <span className="inline-block mt-2 text-[10px] text-slate-400 font-medium">Coming Soon</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    disabled
                    className="px-4 py-2 text-xs font-medium bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed border border-slate-200"
                  >
                    Invite Teammates (Coming Soon)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SPEECH-TO-TEXT */}
          {activeTab === "transcription" && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-violet-50 text-violet-600 rounded-xl border border-violet-100">
                    <Mic size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">
                      Speech-to-Text & Transcripts
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configure transcription audio engines and parsing preferences
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
                  Pasted & Mocked Active
                </span>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-600" />
                  Automatic speech-to-text is coming soon.
                </p>
                <p className="text-amber-700 leading-relaxed">
                  For now, transcripts are created through pasted transcript text or seeded mock data. External paid APIs (Whisper, AssemblyAI, Deepgram) are intentionally kept out of scope per assignment rules.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <FileText size={14} className="text-violet-600" />
                    Pasted Transcript Parser
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Supports line-by-line speaker format <code className="bg-white px-1 rounded text-violet-700 font-mono">Speaker: text</code> and timestamps.
                  </p>
                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded">
                    Active & Functional
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Mic size={14} className="text-slate-400" />
                    Live Audio Transcription
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Real-time web browser microphone transcription and audio file upload.
                  </p>
                  <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-semibold rounded">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
