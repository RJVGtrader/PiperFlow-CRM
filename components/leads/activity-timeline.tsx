import { FileText, Mail, Phone, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { formatDate } from "@/lib/utils";
import type { Activity, ActivityType } from "@/types/activity";

const activityConfig: Record<ActivityType, { label: string; icon: LucideIcon }> = {
  ligacao: { label: "Ligação", icon: Phone },
  email: { label: "E-mail", icon: Mail },
  reuniao: { label: "Reunião", icon: Users },
  nota: { label: "Nota", icon: FileText },
};

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  const sorted = [...activities].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <ol className="space-y-6">
      {sorted.map((activity, index) => {
        const config = activityConfig[activity.type];
        const Icon = config.icon;
        const isLast = index === sorted.length - 1;

        return (
          <li key={activity.id} className="relative flex gap-3">
            {!isLast && <span aria-hidden className="absolute left-4 top-9 h-full w-px bg-border" />}
            <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Icon className="size-4" />
            </span>
            <div className="flex-1 space-y-1 pb-6 pt-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{config.label}</span>
                <span className="text-xs text-muted-foreground">{formatDate(activity.date)}</span>
              </div>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
              <p className="text-xs text-muted-foreground">por {activity.author}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
