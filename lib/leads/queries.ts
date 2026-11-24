import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { Lead, LeadFilters, LeadOwnerOption, LeadPeriod, LeadStatus } from "@/types/lead";

/**
 * Leituras de leads. O escopo por workspace vem do filtro explícito, mas quem
 * garante o isolamento é a RLS: lead de outro workspace simplesmente não volta.
 */

const LEAD_COLUMNS =
  "id, name, email, phone, company, job_title, status, owner_id, created_at, owner:profiles(full_name)";

const leadStatuses: LeadStatus[] = ["novo", "contatado", "qualificado", "desqualificado"];
const leadPeriods: LeadPeriod[] = ["all", "7d", "30d", "month"];

interface LeadRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  status: LeadStatus;
  owner_id: string | null;
  created_at: string;
  owner: { full_name: string } | null;
}

function toLead(row: LeadRow): Lead {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? "",
    phone: row.phone ?? "",
    company: row.company ?? "",
    jobTitle: row.job_title ?? "",
    status: row.status,
    ownerId: row.owner_id,
    ownerName: row.owner?.full_name ?? "",
    createdAt: row.created_at.slice(0, 10),
  };
}

/** Normaliza os searchParams da URL; valores desconhecidos viram "all". */
export function parseLeadFilters(params: Record<string, string | string[] | undefined>): LeadFilters {
  const read = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value) ?? "";
  };

  const status = read("status");
  const period = read("period");

  return {
    q: read("q").trim().slice(0, 100),
    status: leadStatuses.includes(status as LeadStatus) ? (status as LeadStatus) : "all",
    owner: read("owner") || "all",
    period: leadPeriods.includes(period as LeadPeriod) ? (period as LeadPeriod) : "all",
  };
}

function periodStart(period: LeadPeriod) {
  if (period === "all") return null;

  const now = new Date();
  if (period === "month") return new Date(now.getFullYear(), now.getMonth(), 1);

  const start = new Date(now);
  start.setDate(start.getDate() - (period === "7d" ? 7 : 30));
  return start;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getLeads(workspaceId: string, filters: LeadFilters): Promise<Lead[]> {
  const supabase = createClient();
  let query = supabase
    .from("leads")
    .select(LEAD_COLUMNS)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (filters.q) {
    // Remove caracteres com significado na sintaxe do .or() e curingas do ilike.
    const term = filters.q.replace(/[%_,()\\*]/g, " ").trim();
    if (term) query = query.or(`name.ilike.%${term}%,company.ilike.%${term}%`);
  }

  if (filters.status !== "all") query = query.eq("status", filters.status);

  if (filters.owner === "none") {
    query = query.is("owner_id", null);
  } else if (UUID_PATTERN.test(filters.owner)) {
    query = query.eq("owner_id", filters.owner);
  }

  const start = periodStart(filters.period);
  if (start) query = query.gte("created_at", start.toISOString());

  const { data, error } = await query;
  if (error) throw error;

  return data.map(toLead);
}

/** Membros do workspace que podem ser responsáveis por um lead, em ordem alfabética. */
export async function getLeadOwnerOptions(workspaceId: string): Promise<LeadOwnerOption[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("user_id, profile:profiles!inner(full_name, email)")
    .eq("workspace_id", workspaceId);

  if (error) throw error;

  return data
    .map((member) => ({
      id: member.user_id,
      name: member.profile.full_name || member.profile.email,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

/**
 * Null quando o lead não existe, é de outro workspace ou o usuário não tem acesso (RLS).
 * cache(): generateMetadata e a página compartilham a mesma consulta.
 */
export const getLead = cache(async (workspaceId: string, leadId: string): Promise<Lead | null> => {
  if (!UUID_PATTERN.test(leadId)) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_COLUMNS)
    .eq("workspace_id", workspaceId)
    .eq("id", leadId)
    .maybeSingle();

  if (error) throw error;
  return data ? toLead(data) : null;
});
