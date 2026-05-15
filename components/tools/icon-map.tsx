"use client";

import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function ToolIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Wrench;
  return <Icon className={className} aria-hidden="true" />;
}
