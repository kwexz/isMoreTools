import { describe, expect, it } from "vitest";
import { categories, getTool, getToolsByCategory, implementedSlugs, tools } from "@/data/tools";
import type { ToolCategory } from "@/types/tool";

describe("tool catalog", () => {
  it("has 41 unique tools", () => {
    expect(tools).toHaveLength(41);
    expect(new Set(tools.map((tool) => tool.slug)).size).toBe(tools.length);
  });

  it("keeps implementedSlugs in sync with the catalog", () => {
    const slugs = new Set(tools.map((tool) => tool.slug));
    expect(implementedSlugs.size).toBe(tools.length);
    for (const slug of slugs) {
      expect(implementedSlugs.has(slug)).toBe(true);
    }
    for (const slug of implementedSlugs) {
      expect(slugs.has(slug)).toBe(true);
    }
  });

  it("marks every catalog entry as implemented", () => {
    for (const tool of tools) {
      expect(tool.status).toBe("implemented");
    }
  });

  it("uses only declared categories and no duplicates", () => {
    expect(new Set(categories).size).toBe(categories.length);
    for (const tool of tools) {
      expect(categories).toContain(tool.category);
    }
  });

  it("gives every tool the metadata the UI needs", () => {
    for (const tool of tools) {
      expect(tool.title.length).toBeGreaterThan(0);
      expect(tool.description.length).toBeGreaterThan(0);
      expect(tool.icon.length).toBeGreaterThan(0);
      expect(tool.tags.length).toBeGreaterThan(0);
    }
  });

  it("exposes lookup helpers", () => {
    expect(getTool("json-formatter")?.title).toBe("JSON Formatter");
    expect(getTool("does-not-exist")).toBeUndefined();
    expect(getToolsByCategory("Image Tools")).toHaveLength(9);
  });

  it("distributes tools across every category", () => {
    for (const category of categories as ToolCategory[]) {
      expect(getToolsByCategory(category).length).toBeGreaterThan(0);
    }
  });
});
