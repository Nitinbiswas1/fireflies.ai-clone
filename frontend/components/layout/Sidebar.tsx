"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Bot,
  CalendarDays,
  ChevronDown,
  Clock,
  Flame,
  Grid,
  Home,
  Lock,
  MoreHorizontal,
  Moon,
  Plus,
  Settings,
  Sparkles,
  Star,
  Sun,
  UploadCloud,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import ComingSoonModal, { ComingSoonFeature } from "@/components/ui/ComingSoonModal";
import { useTheme } from "@/components/providers/ThemeProvider";

interface NavItem {
  label: string;
  href?: string;
  isPlaceholder?: boolean;
  featureDescription?: string;
  icon: React.ReactNode;
  badge?: string;
  shortcut?: string;
  children?: { label: string; href: string }[];
}

const NAV_MAIN: NavItem[] = [
  { label: "Home", href: "/", icon: <Home size={16} /> },
  {
    label: "AskFred",
    isPlaceholder: true,
    featureDescription: "AskFred AI workspace assistant for cross-meeting search and intelligence across all your recorded calls.",
    icon: <Sparkles size={16} />,
    shortcut: "⌘J",
  },
  {
    label: "Meetings",
    icon: <CalendarDays size={16} />,
    children: [
      { label: "My Meetings", href: "/meetings" },
      { label: "All Meetings", href: "/meetings" },
      { label: "Shared with Me", href: "/meetings" },
    ],
  },
  {
    label: "Meeting Status",
    isPlaceholder: true,
    featureDescription: "Real-time bot status, recording queue, and meeting calendar sync status.",
    icon: <Clock size={16} />,
  },
  {
    label: "Uploads",
    isPlaceholder: true,
    featureDescription: "Bulk audio and video file uploads with automated AI speech-to-text transcription.",
    icon: <UploadCloud size={16} />,
  },
];

const NAV_APPS: NavItem[] = [
  {
    label: "Integrations",
    isPlaceholder: true,
    featureDescription: "Connect your meetings with Zoom, Google Meet, Calendar, CRM, and other productivity tools.",
    icon: <Grid size={16} />,
  },
  {
    label: "Analytics",
    isPlaceholder: true,
    featureDescription: "Meeting analytics, workspace speaker talk-time ratios, sentiment trends, and topic insights.",
    icon: <BarChart2 size={16} />,
  },
  {
    label: "Voice Agents",
    isPlaceholder: true,
    featureDescription: "Autonomous AI voice agents capable of conducting interviews and automated calls.",
    icon: <Bot size={16} />,
    badge: "NEW",
  },
  {
    label: "AI Skills",
    isPlaceholder: true,
    featureDescription: "Custom AI prompts, summary templates, and workspace workflow automation.",
    icon: <Sparkles size={16} />,
  },
];

const NAV_FOOTER: NavItem[] = [
  { label: "Team", href: "/people", icon: <Users size={16} /> },
  {
    label: "Upgrade",
    isPlaceholder: true,
    featureDescription: "Upgrade to Fireflies Pro, Business, or Enterprise plans for unlimited transcription minutes.",
    icon: <Star size={16} />,
  },
  { label: "Settings", href: "/settings", icon: <Settings size={16} /> },
  {
    label: "More",
    isPlaceholder: true,
    featureDescription: "Explore extra workspace utilities, API keys, export options, and custom webhooks.",
    icon: <MoreHorizontal size={16} />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [expanded, setExpanded] = useState<string>("Meetings");
  const [comingSoonFeature, setComingSoonFeature] = useState<ComingSoonFeature | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setMobileOpen((prev) => !prev);
    const handleClose = () => setMobileOpen(false);
    window.addEventListener("fireflies:toggle-sidebar", handleToggle);
    window.addEventListener("fireflies:close-sidebar", handleClose);
    return () => {
      window.removeEventListener("fireflies:toggle-sidebar", handleToggle);
      window.removeEventListener("fireflies:close-sidebar", handleClose);
    };
  }, []);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href.split("?")[0]) && href !== "/";

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  const handlePlaceholderClick = (item: NavItem) => {
    setMobileOpen(false);
    setComingSoonFeature({
      title: item.label,
      description: item.featureDescription || `${item.label} feature will be available in a future update.`,
      icon: item.icon,
    });
  };

  const renderSidebarInner = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800/90 text-slate-600 dark:text-slate-300 select-none font-sans text-xs overflow-y-auto">
      {/* Brand Logo & Theme Toggle */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-xs">
            <Flame size={14} className="text-white fill-white/20" />
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
            fireflies.ai
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === "dark" ? (
              <Sun size={14} className="text-amber-400" />
            ) : (
              <Moon size={14} className="text-purple-600" />
            )}
          </button>
          {mobileOpen && (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close navigation"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-4">
        {/* Primary Group */}
        <div className="space-y-0.5">
          {NAV_MAIN.map((item) => {
            if (item.children) {
              const open = expanded === item.label;
              const childActive = item.children.some((c) => isActive(c.href));
              return (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? "" : item.label)}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                      childActive
                        ? "bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={childActive ? "text-purple-600 dark:text-purple-400" : "text-slate-400 dark:text-slate-500"}>
                        {item.icon}
                      </span>
                      {item.label}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`text-slate-400 transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {open && (
                    <div className="ml-5 mt-0.5 space-y-0.5 border-l border-slate-100 dark:border-slate-800 pl-2.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={handleNavClick}
                          className={`block px-2 py-1.5 rounded-md transition-colors ${
                            isActive(child.href)
                              ? "text-purple-700 dark:text-purple-300 font-semibold bg-purple-50/60 dark:bg-purple-950/50"
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            if (item.isPlaceholder) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handlePlaceholderClick(item)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-slate-400 dark:text-slate-500">{item.icon}</span>
                    {item.label}
                  </span>
                  {item.shortcut && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      {item.shortcut}
                    </span>
                  )}
                </button>
              );
            }

            const active = isActive(item.href!);
            return (
              <Link
                key={item.label}
                href={item.href!}
                onClick={handleNavClick}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  active
                    ? "bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className={active ? "text-purple-600 dark:text-purple-400" : "text-slate-400 dark:text-slate-500"}>
                    {item.icon}
                  </span>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-0.5">
          {NAV_APPS.map((item) => {
            if (item.isPlaceholder) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handlePlaceholderClick(item)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-slate-400 dark:text-slate-500">{item.icon}</span>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 tracking-wide uppercase">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            }

            const active = isActive(item.href!);
            return (
              <Link
                key={item.label}
                href={item.href!}
                onClick={handleNavClick}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  active
                    ? "bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className={active ? "text-purple-600 dark:text-purple-400" : "text-slate-400 dark:text-slate-500"}>
                    {item.icon}
                  </span>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-0.5">
          {NAV_FOOTER.map((item) => {
            if (item.isPlaceholder) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handlePlaceholderClick(item)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-left"
                >
                  <span className="text-slate-400 dark:text-slate-500">{item.icon}</span>
                  {item.label}
                </button>
              );
            }

            const active = isActive(item.href!);
            return (
              <Link
                key={item.label}
                href={item.href!}
                onClick={handleNavClick}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  active
                    ? "bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <span className={active ? "text-purple-600 dark:text-purple-400" : "text-slate-400 dark:text-slate-500"}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Promo & Privacy Section */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-3 shrink-0">
        <div className="flex items-center gap-1.5 px-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
          <Lock size={12} />
          <span>Your Privacy Choices</span>
        </div>

        {/* Promo card matching reference image bottom left */}
        <div className="bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 rounded-xl p-3 space-y-2">
          <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-tight">
            Invite coworkers to your Fireflies team
          </p>
          <Link
            href="/people"
            onClick={handleNavClick}
            className="flex items-center justify-center gap-1 w-full py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-xs"
          >
            <Plus size={13} />
            Create Team
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Preserved exact 215px fixed layout for >= lg) */}
      <aside className="hidden lg:block w-[215px] shrink-0 h-screen sticky top-0">
        {renderSidebarInner()}
      </aside>

      {/* Mobile Drawer (Collapsible slide-over drawer for < lg) */}
      {mobileOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 shadow-2xl transition-transform">
            {renderSidebarInner()}
          </aside>
        </div>
      )}

      {/* Coming Soon Modal */}
      <ComingSoonModal
        open={!!comingSoonFeature}
        feature={comingSoonFeature}
        onClose={() => setComingSoonFeature(null)}
      />
    </>
  );
}
