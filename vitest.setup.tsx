import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import type { AnchorHTMLAttributes, ReactNode } from "react";

afterEach(() => {
  cleanup();
});

// next/link expects the App Router context, which is not mounted in unit tests.
// Render a plain anchor so component tests can assert on the resolved href.
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}));
