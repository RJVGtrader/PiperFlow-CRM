"use client";

import * as React from "react";
import Link from "next/link";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

import { DeleteLeadDialog } from "@/components/leads/delete-lead-dialog";
import { LeadFormSheet } from "@/components/leads/lead-form-sheet";
import { LeadStatusBadge, leadStatusOptions } from "@/components/leads/lead-status-badge";
import { EmptyState } from "@/components/shell/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { LeadFormValues } from "@/components/leads/lead-form";
import type { Lead, LeadStatus } from "@/types/lead";

const dateRangeOptions = [
  { value: "all", label: "Todas as datas" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "month", label: "Este mês" },
] as const;

type DateRange = (typeof dateRangeOptions)[number]["value"];

function matchesDateRange(createdAt: string, range: DateRange) {
  if (range === "all") return true;

  const createdDate = new Date(`${createdAt}T00:00:00`);
  const now = new Date();

  if (range === "month") {
    return createdDate.getFullYear() === now.getFullYear() && createdDate.getMonth() === now.getMonth();
  }

  const days = range === "7d" ? 7 : 30;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  return createdDate >= cutoff;
}

export function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = React.useState(initialLeads);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<LeadStatus | "all">("all");
  const [dateRange, setDateRange] = React.useState<DateRange>("all");

  function handleSave(values: LeadFormValues, existing?: Lead) {
    if (existing) {
      setLeads((prev) => prev.map((lead) => (lead.id === existing.id ? { ...existing, ...values } : lead)));
      return;
    }

    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      ...values,
    };
    setLeads((prev) => [newLead, ...prev]);
  }

  function handleDelete(lead: Lead) {
    setLeads((prev) => prev.filter((item) => item.id !== lead.id));
  }

  const filteredLeads = leads.filter((lead) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      query.length === 0 ||
      lead.name.toLowerCase().includes(query) ||
      lead.company.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesDate = matchesDateRange(lead.createdAt, dateRange);

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou empresa..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-8"
            />
          </div>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeadStatus | "all")}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {leadStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Data" />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <LeadFormSheet
          onSave={handleSave}
          trigger={
            <Button variant="brand" className="sm:w-auto">
              <Plus className="size-4" />
              Novo lead
            </Button>
          }
        />
      </div>

      {filteredLeads.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhum lead encontrado"
          description="Ajuste a busca ou os filtros para ver outros resultados."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Link href={`/leads/${lead.id}`} className="block hover:underline">
                      <span className="font-medium text-foreground">{lead.name}</span>
                    </Link>
                    <span className="block text-sm text-muted-foreground">
                      {lead.jobTitle} · {lead.company}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="block text-sm">{lead.email}</span>
                    <span className="block text-sm text-muted-foreground">{lead.phone}</span>
                  </TableCell>
                  <TableCell>
                    <LeadStatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{lead.ownerName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(lead.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <LeadFormSheet
                        lead={lead}
                        onSave={handleSave}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label={`Editar ${lead.name}`}>
                            <Pencil className="size-4" />
                          </Button>
                        }
                      />
                      <DeleteLeadDialog
                        lead={lead}
                        onConfirm={handleDelete}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label={`Excluir ${lead.name}`}>
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
