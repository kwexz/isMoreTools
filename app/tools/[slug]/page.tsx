import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tools/ToolShell";
import { ToolImplementation } from "@/components/tools/implementations/ToolImplementation";
import { getTool, tools } from "@/data/tools";

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  return {
    title: tool?.title ?? "Tool",
    description: tool?.description ?? "Local browser tool."
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();
  const privacyNote = tool.category === "File Tools" || tool.category === "Image Tools"
    ? "Processed locally in your browser. Files are not uploaded, stored, or sent to external APIs."
    : undefined;
  return (
    <ToolShell tool={tool} privacyNote={privacyNote}>
      <ToolImplementation slug={tool.slug} />
    </ToolShell>
  );
}
