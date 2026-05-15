"use client";

import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";

export function FileDropzone({
  multiple,
  accept,
  onFiles,
  label = "Choose file"
}: {
  multiple?: boolean;
  accept?: string;
  label?: string;
  onFiles: (files: File[]) => void;
}) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/40 p-8 text-center transition hover:bg-muted">
      <Upload className="mb-3 h-6 w-6 text-primary" />
      <span className="font-medium">{label}</span>
      <span className="mt-1 text-sm text-muted-foreground">Processed locally in your browser.</span>
      <Input
        type="file"
        multiple={multiple}
        accept={accept}
        className="sr-only"
        onChange={(event) => onFiles(Array.from(event.target.files ?? []))}
      />
    </label>
  );
}
