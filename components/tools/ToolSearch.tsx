"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolCard } from "@/components/tools/ToolCard";
import { categories } from "@/data/tools";
import type { Tool, ToolCategory } from "@/types/tool";

export function ToolSearch({ tools, showFeaturedOnly = false }: { tools: Tool[]; showFeaturedOnly?: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory | "All">("All");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const matchesQuery =
        !normalized ||
        [tool.title, tool.description, tool.category, ...tool.tags].some((item) =>
          item.toLowerCase().includes(normalized)
        );
      const matchesCategory = category === "All" || tool.category === category;
      const matchesFeatured = !showFeaturedOnly || tool.featured;
      return matchesQuery && matchesCategory && matchesFeatured;
    });
  }, [category, query, showFeaturedOnly, tools]);

  return (
    <section className="space-y-6">
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

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
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
