import type { Metadata } from "next";
import { getProfile } from "@/lib/content";
import { StudioRuntime } from "@/features/studio/runtime/studio-runtime";
import { StudioShell } from "@/features/studio/components/studio-shell";
export const metadata: Metadata = {
  title: "Founder’s Engineering Lab",
  description:
    "Personal engineering experiments, explicit boundaries, and venture hypotheses by Namazbek Bekzhanov.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/studio" },
};
export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  return (
    <StudioRuntime>
      <StudioShell profile={profile}>{children}</StudioShell>
    </StudioRuntime>
  );
}
