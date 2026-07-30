export type LeadStatus = "novo" | "contatado" | "qualificado" | "desqualificado";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  status: LeadStatus;
  ownerName: string;
  createdAt: string;
}
