import Link from "next/link";
import { ArrowRight, Lock, MonitorSmartphone, Search, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CategorizedToolCatalog } from "@/components/tools/CategorizedToolCatalog";
import { ToolIcon } from "@/components/tools/icon-map";
import { categories, getToolsByCategory, tools } from "@/data/tools";

export default function HomePage() {
  return (
    <div>
      <section className="border-b">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <Badge className="mb-5 w-fit border-primary/30 bg-primary/10 text-primary">No uploads. No backend. No tracking.</Badge>
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              isMoreTools
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              A privacy-friendly suite of browser tools for developers, text cleanup, file inspection, and image workflows. Your data stays on your device.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg"><Link href="/tools">Browse all tools <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="#featured">Search tools</Link></Button>
            </div>
          </div>
          <Card className="p-5">
            <div className="rounded-2xl border bg-muted/40 p-5">
              <div className="mb-5 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Search className="h-4 w-4" /> Quick launch
              </div>
              <div className="grid gap-3">
                {tools.filter((tool) => tool.featured).slice(0, 7).map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="flex items-center justify-between rounded-2xl border bg-card p-3 transition hover:border-primary/40"
                  >
                    <span className="flex items-center gap-3">
                      <span className="rounded-xl bg-primary/10 p-2 text-primary">
                        <ToolIcon name={tool.icon} className="h-4 w-4" />
                      </span>
                      <span className="font-medium">{tool.title}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5"><Lock className="mb-4 h-6 w-6 text-primary" /><h2 className="font-semibold">All tools run locally in your browser</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Text, files, and images are processed with browser APIs. There are no server actions for user data.</p></Card>
          <Card className="p-5"><ShieldCheck className="mb-4 h-6 w-6 text-primary" /><h2 className="font-semibold">Privacy by default</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">No external APIs, analytics, accounts, or file storage. Theme preference is the only local setting.</p></Card>
          <Card className="p-5"><MonitorSmartphone className="mb-4 h-6 w-6 text-primary" /><h2 className="font-semibold">Fast static app</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Built with Next.js App Router and ready for static export.</p></Card>
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Tool groups</h2>
            <p className="text-muted-foreground">Focused utilities grouped by everyday workflows.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category} className="p-5">
                <h3 className="font-semibold">{category}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{getToolsByCategory(category).length} local tools</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="featured" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <CategorizedToolCatalog
          tools={tools}
          heading="Tools by category"
          description="Search first, then browse matching tools inside their workflow categories."
        />
      </section>
    </div>
  );
}
