import type { Metadata } from "next";
import { CategorizedToolCatalog } from "@/components/tools/CategorizedToolCatalog";
import { tools } from "@/data/tools";

export const metadata: Metadata = {
  title: "Tools",
  description: "Browse all local browser tools in isMoreTools."
};

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">All tools</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Search, filter, and open privacy-friendly utilities that run entirely inside your browser.
        </p>
      </div>
      <CategorizedToolCatalog
        tools={tools}
        heading="Tools by category"
        description="Search and filter the full catalog while keeping tools grouped by category."
      />
    </div>
  );
}
