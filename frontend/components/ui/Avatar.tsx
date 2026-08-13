"use client";

import { Participant } from "@/types/meeting";
import { avatarColor, getInitials } from "@/lib/utils";

interface AvatarProps {
  participant: Participant;
  size?: "xs" | "sm" | "md";
}

export default function Avatar({ participant, size = "sm" }: AvatarProps) {
  const sizes = { xs: "w-5 h-5 text-[9px]", sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm" };

  if (participant.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={participant.avatar_url}
        alt={participant.name}
        title={participant.name}
        className={`${sizes[size]} rounded-full object-cover ring-1 ring-white`}
      />
    );
  }

  return (
    <div
      title={participant.name}
      className={`${sizes[size]} ${avatarColor(participant.name)} rounded-full flex items-center justify-center font-semibold text-white ring-1 ring-white`}
    >
      {getInitials(participant.name)}
    </div>
  );
}

interface AvatarGroupProps {
  participants: Participant[];
  max?: number;
  size?: "xs" | "sm" | "md";
}

export function AvatarGroup({ participants, max = 4, size = "xs" }: AvatarGroupProps) {
  const visible = participants.slice(0, max);
  const overflow = participants.length - max;

  const sizes = { xs: "w-5 h-5 text-[9px]", sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm" };

  return (
    <div className="flex -space-x-1.5">
      {visible.map((p) => (
        <Avatar key={p.id} participant={p} size={size} />
      ))}
      {overflow > 0 && (
        <div
          className={`${sizes[size]} rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-semibold text-slate-600 ring-1 ring-white`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
