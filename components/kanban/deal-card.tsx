"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Building2, Clock } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { dealStageConfig } from "@/components/kanban/deal-stage";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";
import type { Deal } from "@/types/deal";

function getDueStatus(dueDate: string, stage: Deal["stage"]) {
  const isOpenStage = stage !== "fechado_ganho" && stage !== "fechado_perdido";
  if (!isOpenStage) return "neutral" as const;

  const due = new Date(`${dueDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  if (diffDays < 0) return "overdue" as const;
  if (diffDays <= 3) return "soon" as const;
  return "neutral" as const;
}

const dueStatusClasses: Record<ReturnType<typeof getDueStatus>, string> = {
  overdue: "text-[#FF4757] font-medium",
  soon: "text-[#FF6B35] font-medium",
  neutral: "text-muted-foreground",
};

interface DealCardContentProps {
  deal: Deal;
  leadName: string;
  className?: string;
}

export const DealCardContent = React.forwardRef<
  HTMLDivElement,
  DealCardContentProps & React.HTMLAttributes<HTMLDivElement>
>(function DealCardContent({ deal, leadName, className, ...props }, ref) {
  const dueStatus = getDueStatus(deal.dueDate, deal.stage);

  return (
    <div
      ref={ref}
      className={cn(
        "space-y-2 rounded-lg border border-border bg-card p-3 shadow-sm transition-all",
        className
      )}
      {...props}
    >
      <p className="truncate text-sm font-medium leading-tight text-foreground">{deal.title}</p>

      <p className="font-mono text-base font-semibold tracking-tight text-foreground">
        {formatCurrency(deal.value)}
      </p>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Building2 className="size-3.5 shrink-0" />
        <span className="truncate">{leadName}</span>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className={cn("flex items-center gap-1 text-xs", dueStatusClasses[dueStatus])}>
          <Clock className="size-3.5 shrink-0" />
          <span>{formatDate(deal.dueDate)}</span>
        </div>

        <Avatar className="size-6" title={deal.ownerName}>
          <AvatarFallback className="text-[10px]">{getInitials(deal.ownerName)}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
});

interface DealCardProps {
  deal: Deal;
  leadName: string;
  onClick: () => void;
}

export function DealCard({ deal, leadName, onClick }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
    data: { stage: deal.stage },
  });

  const config = dealStageConfig[deal.stage];

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <DealCardContent
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      deal={deal}
      leadName={leadName}
      className={cn(
        "cursor-grab hover:-translate-y-0.5 active:cursor-grabbing",
        config.cardHoverShadow,
        isDragging && "opacity-40"
      )}
    />
  );
}
