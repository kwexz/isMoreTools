import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToolSearch } from "@/components/tools/ToolSearch";
import { tools } from "@/data/tools";

const searchInput = () => screen.getByPlaceholderText("Search tools, formats, workflows...");

describe("ToolSearch", () => {
  it("filters tools by keyword", async () => {
    const user = userEvent.setup();
    render(<ToolSearch tools={tools} />);

    expect(screen.getByRole("heading", { name: "JSON Formatter" })).toBeInTheDocument();

    await user.type(searchInput(), "lorem");

    expect(screen.getByRole("heading", { name: "Lorem Ipsum Generator" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "JSON Formatter" })).not.toBeInTheDocument();
  });

  it("filters tools by category button", async () => {
    const user = userEvent.setup();
    render(<ToolSearch tools={tools} />);

    await user.click(screen.getByRole("button", { name: "Image Tools" }));

    expect(screen.getByRole("heading", { name: "Resize Images" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "JSON Formatter" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(9);
  });

  it("shows an empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<ToolSearch tools={tools} />);

    await user.type(searchInput(), "zzzzzzz");

    expect(screen.getByText("No tools found")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "JSON Formatter" })).not.toBeInTheDocument();
  });
});
