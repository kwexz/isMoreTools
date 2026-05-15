export type ToolCategory =
  | "Data & Formats"
  | "Encoding & Security"
  | "Text Tools"
  | "File Tools"
  | "Image Tools"
  | "Developer Utilities";

export type ToolStatus = "implemented" | "basic" | "planned";

export interface Tool {
  slug: string;
  title: string;
  description: string;
  category: ToolCategory;
  icon: string;
  tags: string[];
  featured: boolean;
  status: ToolStatus;
}
