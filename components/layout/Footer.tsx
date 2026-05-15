import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>isMoreTools. Local-first browser utilities for careful work.</p>
        <div className="flex gap-4">
          <Link href="/tools" className="hover:text-foreground">Tools</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/about" className="hover:text-foreground">About</Link>
        </div>
      </div>
    </footer>
  );
}
