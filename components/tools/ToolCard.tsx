import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ToolIcon } from "@/components/tools/icon-map";
import type { Tool } from "@/types/tool";

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link href={`/tools/${tool.slug}`} className="group block h-full">
      <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <ToolIcon name={tool.icon} className="h-5 w-5" />
          </div>
          <Badge className={tool.status === "implemented" ? "border-primary/30 text-primary" : ""}>
            {tool.status}
          </Badge>
        </div>
        <div className="mt-5 space-y-2">
          <h3 className="text-base font-semibold tracking-tight group-hover:text-primary">{tool.title}</h3>
          <p className="min-h-12 text-sm leading-6 text-muted-foreground">{tool.description}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>{tool.category}</Badge>
          {tool.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} className="bg-background">
              {tag}
            </Badge>
          ))}
        </div>
      </Card>
    </Link>
  );
}
