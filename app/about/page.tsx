import type { Metadata } from "next";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
  description: "About isMoreTools."
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">About isMoreTools</h1>
      <Card className="mt-6 space-y-5 p-6 leading-7 text-muted-foreground">
        <p>
          isMoreTools collects practical utilities for developers and knowledge workers into one fast, static, privacy-friendly interface.
        </p>
        <p>
          The project focuses on tools that benefit from instant local processing: formatting data, hashing files, transforming text, inspecting files, and preparing images.
        </p>
      </Card>
    </div>
  );
}
