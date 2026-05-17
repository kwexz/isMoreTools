import Link from "next/link";
import { categories, getToolsByCategory } from "@/data/tools";
import { cn } from "@/lib/utils";

export function ToolSidebar({ currentSlug }: { currentSlug: string }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-auto rounded-2xl border bg-card p-3 shadow-soft">
        <div className="px-3 pb-3 text-sm font-semibold">Tools</div>
        <div className="space-y-2">
          {categories.map((category) => {
            const categoryTools = getToolsByCategory(category);
            const hasCurrent = categoryTools.some((tool) => tool.slug === currentSlug);
            return (
              <details key={category} open={hasCurrent} className="group rounded-xl border bg-background/60">
                <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium">
                  <span>{category}</span>
                </summary>
                <div className="space-y-1 border-t p-2">
                  {categoryTools.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      className={cn(
                        "block rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                        tool.slug === currentSlug && "bg-primary/10 font-medium text-primary"
                      )}
                    >
                      {tool.title}
                    </Link>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
