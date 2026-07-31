"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { DealCard } from "@/components/kanban/deal-card";
import { dealStageConfig } from "@/components/kanban/deal-stage";
import { cn, formatCurrency } from "@/lib/utils";
import type { Deal, DealStage } from "@/types/deal";
import type { Lead } from "@/types/lead";

interface KanbanColumnProps {
  stage: DealStage;
  deals: Deal[];
  leadsById: Map<string, Lead>;
  onCardClick: (deal: Deal) => void;
  /** Posição da coluna no board, usada para escalonar a animação de entrada. */
  index: number;
}

export function KanbanColumn({ stage, deals, leadsById, onCardClick, index }: KanbanColumnProps) {
  const config = dealStageConfig[stage];
  const { setNodeRef, isOver } = useDroppable({ id: stage, data: { stage } });
  const total = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div
      className={cn(
        "flex w-72 shrink-0 flex-col snap-start overflow-hidden rounded-lg border transition-colors",
        "animate-fade-slide-up",
        isOver ? config.dropBorder : "border-border/60"
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={cn("h-1 shrink-0", config.accent)} />

      <div className={cn("shrink-0 px-3 py-3", config.columnBg)}>
        <div className="flex items-center gap-2">
          <span className={cn("size-2 shrink-0 rounded-full", config.accent)} />
          <h2 className="truncate font-display text-sm font-semibold text-foreground">
            {config.label}
          </h2>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {deals.length} {deals.length === 1 ? "negócio" : "negócios"}
          </span>
          <span className="font-mono font-medium text-foreground">{formatCurrency(total)}</span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[120px] flex-1 flex-col gap-2 overflow-y-auto bg-muted/20 p-2 transition-colors",
          isOver && config.dropBg
        )}
        style={{ maxHeight: "calc(100vh - 21rem)" }}
      >
        <SortableContext items={deals.map((deal) => deal.id)} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              leadName={leadsById.get(deal.leadId)?.name ?? "Lead removido"}
              onClick={() => onCardClick(deal)}
            />
          ))}
        </SortableContext>

        {deals.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-border/70 px-3 py-6 text-center text-xs text-muted-foreground">
            Arraste um negócio para cá
          </div>
        )}
      </div>
    </div>
  );
}
