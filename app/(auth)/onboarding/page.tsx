import type { Metadata } from "next";

import { OnboardingFlow } from "@/components/auth/onboarding-flow";

export const metadata: Metadata = {
  title: "Configurar workspace | PipeFlow CRM",
};

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
