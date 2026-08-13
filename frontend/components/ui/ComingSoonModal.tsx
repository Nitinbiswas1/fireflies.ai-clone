"use client";

import { Sparkles } from "lucide-react";
import Modal from "./Modal";

export interface ComingSoonFeature {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface ComingSoonModalProps {
  open: boolean;
  feature: ComingSoonFeature | null;
  onClose: () => void;
}

export default function ComingSoonModal({ open, feature, onClose }: ComingSoonModalProps) {
  if (!feature) return null;

  return (
    <Modal open={open} onClose={onClose} title="" size="sm">
      <div className="py-2 px-1 text-center space-y-4 select-none">
        {/* Feature Icon Header */}
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/70 dark:text-purple-400 flex items-center justify-center mx-auto border border-purple-100 dark:border-purple-900/60 shadow-2xs">
          {feature.icon || <Sparkles size={24} />}
        </div>

        {/* Title & Badge */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              {feature.title}
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-purple-100/80 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider">
              Coming Soon
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            {feature.description}
          </p>
        </div>

        {/* Info card */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700/60 text-left text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Planned Feature: </span>
          This capability is part of the full Fireflies platform roadmap and is not included in the current core assignment scope.
        </div>

        {/* Actions */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </Modal>
  );
}
