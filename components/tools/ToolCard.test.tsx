import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolCard } from "@/components/tools/ToolCard";
import type { Tool } from "@/types/tool";

const tool: Tool = {
  slug: "json-formatter",
  title: "JSON Formatter",
  description: "Format, minify, validate, and copy JSON locally.",
  category: "Data & Formats",
  icon: "Braces",
  tags: ["json", "formatter", "minify"],
  featured: true,
  status: "implemented"
};

describe("ToolCard", () => {
  it("links to the tool page and shows its core metadata", () => {
    render(<ToolCard tool={tool} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/tools/json-formatter");
    expect(screen.getByRole("heading", { name: "JSON Formatter" })).toBeInTheDocument();
    expect(screen.getByText("Format, minify, validate, and copy JSON locally.")).toBeInTheDocument();
    expect(screen.getByText("Data & Formats")).toBeInTheDocument();
  });

  it("renders the status badge", () => {
    render(<ToolCard tool={tool} />);
    expect(screen.getByText("implemented")).toBeInTheDocument();
  });

  it("shows only the first two tags", () => {
    render(<ToolCard tool={tool} />);
    expect(screen.getByText("json")).toBeInTheDocument();
    expect(screen.getByText("formatter")).toBeInTheDocument();
    expect(screen.queryByText("minify")).not.toBeInTheDocument();
  });
});
