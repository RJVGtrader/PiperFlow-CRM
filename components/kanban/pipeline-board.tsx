"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { DealCardContent } from "@/components/kanban/deal-card";
import { DealFormSheet } from "@/components/kanban/deal-form-sheet";
import type { DealFormValues } from "@/components/kanban/deal-form";
import { dealStages } from "@/components/kanban/deal-stage";
import { KanbanColumn } from "@/components/kanban/kanban-column";
import { Button } from "@/components/ui/button";
import type { Deal, DealStage } from "@/types/deal";
import type { Lead } from "@/types/lead";

interface PipelineBoardProps {
  initialDeals: Deal[];
  leads: Lead[];
}

export function PipelineBoard({ initialDeals, leads }: PipelineBoardProps) {
  const [deals, setDeals] = React.useState(initialDeals);
  const [activeDeal, setActiveDeal] = React.useState<Deal | null>(null);
  const [editingDeal, setEditingDeal] = React.useState<Deal | null>(null);

  const leadsById = React.useMemo(() => new Map(leads.map((lead) => [lead.id, lead])), [leads]);

  const dealsByStage = React.useMemo(() => {
    const grouped = new Map<DealStage, Deal[]>(dealStages.map((stage) => [stage, []]));
    for (const deal of deals) {
      grouped.get(deal.stage)?.push(deal);
    }
    return grouped;
  }, [deals]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function getContainerId(id: string): DealStage | undefined {
    if ((dealStages as string[]).includes(id)) return id as DealStage;
    return deals.find((deal) => deal.id === id)?.stage;
  }

  function handleDragStart(event: DragStartEvent) {
    const deal = deals.find((d) => d.id === event.active.id);
    setActiveDeal(deal ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDeal(null);
    if (!over) return;

    const activeDealItem = deals.find((deal) => deal.id === active.id);
    if (!activeDealItem) return;

    const overContainer = getContainerId(String(over.id));
    if (!overContainer) return;

    if (activeDealItem.stage !== overContainer) {
      setDeals((prev) =>
        prev.map((deal) => (deal.id === activeDealItem.id ? { ...deal, stage: overContainer } : deal))
      );
      return;
    }

    if (active.id === over.id) return;

    setDeals((prev) => {
      const oldIndex = prev.findIndex((deal) => deal.id === active.id);
      const newIndex = prev.findIndex((deal) => deal.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function handleSave(values: DealFormValues, existing?: Deal) {
    if (existing) {
      setDeals((prev) => prev.map((deal) => (deal.id === existing.id ? { ...existing, ...values } : deal)));
      return;
    }

    const newDeal: Deal = {
      id: `deal_${Date.now()}`,
      ...values,
    };
    setDeals((prev) => [newDeal, ...prev]);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <DealFormSheet
          leads={leads}
          onSave={handleSave}
          trigger={
            <Button
              variant="brand"
              className="transition-shadow hover:shadow-[0_0_0_4px_rgba(202,255,51,0.18)]"
            >
              <Plus className="size-4" />
              Novo negócio
            </Button>
          }
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex snap-x gap-4 overflow-x-auto pb-4">
          {dealStages.map((stage, index) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              index={index}
              deals={dealsByStage.get(stage) ?? []}
              leadsById={leadsById}
              onCardClick={setEditingDeal}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal && (
            <DealCardContent
              deal={activeDeal}
              leadName={leadsById.get(activeDeal.leadId)?.name ?? "Lead removido"}
              className="w-72 rotate-2 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.6)]"
            />
          )}
        </DragOverlay>
      </DndContext>

      <DealFormSheet
        leads={leads}
        deal={editingDeal ?? undefined}
        open={editingDeal !== null}
        onOpenChange={(open) => {
          if (!open) setEditingDeal(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
