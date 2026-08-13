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
          className="fixed bottom-5 right-5 w-10 h-10 rounded-full bg-purple-700 hover:bg-purple-800 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-40"
          title="Help & Support"
        >
          <HelpCircle size={20} />
        </button>
      </div>
    </div>
  );
}
