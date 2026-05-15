import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-4 text-muted-foreground">This page is not available, but the tool catalog is ready.</p>
      <Button asChild className="mt-6"><Link href="/tools">Open tools</Link></Button>
    </div>
  );
}
