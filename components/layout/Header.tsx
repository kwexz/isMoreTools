import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { categories, getToolsByCategory } from "@/data/tools";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/88 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <img src="/brands/logo.svg" alt="isMoreTools" className="h-9 w-auto max-w-[180px]" />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <div className="group relative">
            <Button asChild variant="ghost">
              <Link href="/tools">
                Tools <ChevronDown className="h-4 w-4" />
              </Link>
            </Button>
            <div className="invisible absolute left-1/2 top-full z-50 w-[760px] max-w-[calc(100vw-2rem)] -translate-x-1/2 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="grid max-h-[70vh] gap-4 overflow-auto rounded-2xl border bg-card p-5 shadow-soft md:grid-cols-2">
                {categories.map((category) => (
                  <div key={category}>
                    <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{category}</div>
                    <div className="space-y-1">
                      {getToolsByCategory(category).map((tool) => (
                        <Link
                          key={tool.slug}
                          href={`/tools/${tool.slug}`}
                          className="block rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          {tool.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button asChild variant="ghost"><Link href="/privacy">Privacy</Link></Button>
          <Button asChild variant="ghost"><Link href="/about">About</Link></Button>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild className="hidden sm:inline-flex"><Link href="/tools">Open tools</Link></Button>
        </div>
      </div>
    </header>
  );
}
