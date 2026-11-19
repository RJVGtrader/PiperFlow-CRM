import type { Metadata } from "next";

import { BillingSettings } from "@/components/settings/billing-settings";

export const metadata: Metadata = {
  title: "Plano e cobrança",
};

export default function BillingPage() {
  return <BillingSettings />;
}
