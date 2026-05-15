import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ToolIcon } from "@/components/tools/icon-map";
import type { Tool } from "@/types/tool";

export function ToolShell({
  tool,
  children,
  privacyNote
}: {
  tool: Tool;
  children: React.ReactNode;
  privacyNote?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <div className="h-fit rounded-2xl bg-primary/10 p-4 text-primary">
            <ToolIcon name={tool.icon} className="h-7 w-7" />
          </div>
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge>{tool.category}</Badge>
              <Badge>{tool.status}</Badge>
              {tool.tags.map((tag) => (
                <Badge key={tag} className="bg-background">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{tool.title}</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">{tool.description}</p>
          </div>
        </div>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="mb-5 rounded-2xl border bg-muted/50 p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Privacy note:</strong>{" "}
          {privacyNote ?? "All processing runs locally in your browser. Nothing is uploaded or sent to external APIs."}
        </div>
        {children}
      </Card>
    </div>
  );
}
