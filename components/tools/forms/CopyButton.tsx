"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  async function copy() {
    if (!value) {
      toast.error("Nothing to copy yet.");
      return;
    }
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard.");
  }

  return (
    <Button type="button" variant="outline" onClick={copy}>
      <Copy className="h-4 w-4" />
      {label}
    </Button>
  );
}
