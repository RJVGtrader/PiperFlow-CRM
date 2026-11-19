import type { Metadata } from "next";

import { BillingSettings } from "@/components/settings/billing-settings";
import { getActiveWorkspace, getSubscription } from "@/lib/workspaces/queries";

export const metadata: Metadata = {
  title: "Plano e cobrança",
};

export default async function BillingPage() {
  const workspace = await getActiveWorkspace();
  const subscription = workspace ? await getSubscription(workspace.id) : null;

  return <BillingSettings subscription={subscription} />;
}
