import Link from "next/link";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/88 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="rounded-xl bg-primary p-2 text-primary-foreground">
            <Wrench className="h-4 w-4" />
          </span>
          isMoreTools
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost"><Link href="/tools">Tools</Link></Button>
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
