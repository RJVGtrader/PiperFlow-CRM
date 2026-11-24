"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Pencil, Plus, Search, Trash2, Users } from "lucide-react";

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
import { cn, formatDate } from "@/lib/utils";
import type { Lead, LeadFilters, LeadOwnerOption } from "@/types/lead";

const dateRangeOptions = [
  { value: "all", label: "Todas as datas" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "month", label: "Este mês" },
] as const;

const SEARCH_DEBOUNCE_MS = 300;

interface LeadsTableProps {
  leads: Lead[];
  filters: LeadFilters;
  owners: LeadOwnerOption[];
}

/** Filtros vivem na URL: a página (Server Component) consulta o Supabase com eles. */
export function LeadsTable({ leads, filters, owners }: LeadsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();
  const [search, setSearch] = React.useState(filters.q);

  const updateFilter = React.useCallback(
    (key: keyof LeadFilters, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  React.useEffect(() => {
    if (search.trim() === filters.q) return;
    const timeout = setTimeout(() => updateFilter("q", search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search, filters.q, updateFilter]);

  const hasFilters =
    filters.q !== "" || filters.status !== "all" || filters.owner !== "all" || filters.period !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative sm:w-64">
            {isPending ? (
              <Loader2 className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            ) : (
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            )}
            <Input
              placeholder="Buscar por nome ou empresa..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-8"
              aria-label="Buscar leads"
            />
          </div>

          <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
            <SelectTrigger className="sm:w-44" aria-label="Filtrar por status">
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

          <Select value={filters.owner} onValueChange={(value) => updateFilter("owner", value)}>
            <SelectTrigger className="sm:w-44" aria-label="Filtrar por responsável">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os responsáveis</SelectItem>
              <SelectItem value="none">Sem responsável</SelectItem>
              {owners.map((owner) => (
                <SelectItem key={owner.id} value={owner.id}>
                  {owner.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.period} onValueChange={(value) => updateFilter("period", value)}>
            <SelectTrigger className="sm:w-44" aria-label="Filtrar por data de criação">
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
          owners={owners}
          trigger={
            <Button variant="brand" className="sm:w-auto">
              <Plus className="size-4" />
              Novo lead
            </Button>
          }
        />
      </div>

      {leads.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={Search}
            title="Nenhum lead encontrado"
            description="Ajuste a busca ou os filtros para ver outros resultados."
          />
        ) : (
          <EmptyState
            icon={Users}
            title="Nenhum lead cadastrado"
            description="Cadastre seu primeiro lead para começar a acompanhar o relacionamento."
          />
        )
      ) : (
        <div
          className={cn(
            "overflow-x-auto rounded-lg border border-border transition-opacity",
            isPending && "opacity-60"
          )}
        >
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
              {leads.map((lead) => {
                const subtitle = [lead.jobTitle, lead.company].filter(Boolean).join(" · ");

                return (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Link href={`/leads/${lead.id}`} className="block hover:underline">
                        <span className="font-medium text-foreground">{lead.name}</span>
                      </Link>
                      {subtitle && (
                        <span className="block text-sm text-muted-foreground">{subtitle}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.email || lead.phone ? (
                        <>
                          {lead.email && <span className="block text-sm">{lead.email}</span>}
                          {lead.phone && (
                            <span className="block text-sm text-muted-foreground">{lead.phone}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <LeadStatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lead.ownerName || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(lead.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <LeadFormSheet
                          lead={lead}
                          owners={owners}
                          trigger={
                            <Button variant="ghost" size="icon" aria-label={`Editar ${lead.name}`}>
                              <Pencil className="size-4" />
                            </Button>
                          }
                        />
                        <DeleteLeadDialog
                          lead={lead}
                          trigger={
                            <Button variant="ghost" size="icon" aria-label={`Excluir ${lead.name}`}>
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
