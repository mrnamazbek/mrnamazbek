import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getModule } from "@/features/studio/modules/registry";
import { ModuleFrame } from "@/features/studio/components/module-frame";
import { ModuleLoader } from "@/features/studio/components/module-loader";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const definition = getModule(slug);
  return {
    title: definition?.title ?? "Workbench not found",
    alternates: {
      canonical: definition ? `/studio/modules/${definition.slug}` : "/studio",
    },
    robots: { index: false, follow: true },
  };
}
export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const definition = getModule(slug);
  if (!definition) notFound();
  return (
    <ModuleFrame definition={definition}>
      <ModuleLoader definition={definition} />
    </ModuleFrame>
  );
}
