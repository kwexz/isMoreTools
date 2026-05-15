import type { Metadata } from "next";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy details for isMoreTools."
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Privacy</h1>
      <Card className="mt-6 space-y-5 p-6 leading-7 text-muted-foreground">
        <p>
          isMoreTools is designed as a local-first static web app. User text, files, and images are processed in the browser with File API, Canvas API, Web Crypto API, URL API, and Clipboard API.
        </p>
        <p>
          The app does not include a backend, server actions for processing user data, analytics, accounts, databases, or external processing APIs.
        </p>
        <p>
          Local storage is used only for UI preferences such as theme. It is not used to persist uploaded files or pasted file content.
        </p>
      </Card>
    </div>
  );
}
