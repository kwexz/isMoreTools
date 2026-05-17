"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToolCard } from "@/components/tools/ToolCard";
import { categories } from "@/data/tools";
import type { Tool, ToolCategory } from "@/types/tool";

export function CategorizedToolCatalog({
  tools,
  heading = "Tools by category",
  description = "Browse the full catalog grouped by workflow."
}: {
  tools: Tool[];
  heading?: string;
  description?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory | "All">("All");

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("category");
    if (requested && categories.includes(requested as ToolCategory)) {
      setCategory(requested as ToolCategory);
    }
  }, []);

  const grouped = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return categories
      .map((item) => {
        const categoryTools = tools.filter((tool) => {
          const matchesCategory = category === "All" || tool.category === category;
          const matchesGroup = tool.category === item;
          const matchesQuery =
            !normalized ||
            [tool.title, tool.description, tool.category, ...tool.tags].some((value) =>
              value.toLowerCase().includes(normalized)
            );
          return matchesCategory && matchesGroup && matchesQuery;
        });
        return { category: item, tools: categoryTools };
      })
      .filter((group) => group.tools.length > 0);
  }, [category, query, tools]);

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{heading}</h2>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tools, formats, workflows..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["All", ...categories] as const).map((item) => (
            <Button
              key={item}
              type="button"
              variant={category === item ? "default" : "outline"}
              onClick={() => setCategory(item)}
              className="shrink-0"
            >
              {item}
            </Button>
          ))}
        </div>
      </div>

      {grouped.length > 0 ? (
        <div className="space-y-12">
          {grouped.map((group) => (
            <section key={group.category} id={group.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="scroll-mt-24">
              <div className="mb-4">
                <h3 className="text-xl font-semibold tracking-tight">{group.category}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{group.tools.length} matching tools</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.tools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed bg-card p-10 text-center">
          <h3 className="text-lg font-semibold">No tools found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Try a different keyword or category.</p>
        </div>
      )}
    </section>
  );
}
