import Sidebar from "./Sidebar";
import { HelpCircle } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased selection:bg-purple-100 selection:text-purple-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
        {children}

        {/* Floating help button matching bottom-right of reference screenshot */}
        <button
          type="button"
          className="fixed bottom-3 sm:bottom-5 right-3 sm:right-5 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-purple-700 hover:bg-purple-800 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-40"
          title="Help & Support"
        >
          <HelpCircle size={18} />
        </button>
      </div>
    </div>
  );
}
