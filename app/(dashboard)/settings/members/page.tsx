import type { Metadata } from "next";

import { MembersSettings } from "@/components/settings/members-settings";

export const metadata: Metadata = {
  title: "Membros",
};

export default function MembersPage() {
  return <MembersSettings />;
}
