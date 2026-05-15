import type { Tool, ToolCategory } from "@/types/tool";

export const categories: ToolCategory[] = [
  "Data & Formats",
  "Encoding & Security",
  "Text Tools",
  "File Tools",
  "Image Tools",
  "Developer Utilities"
];

export const implementedSlugs = new Set([
  "json-formatter",
  "yaml-formatter",
  "json-validator",
  "yaml-json-converter",
  "base64",
  "hash-generator",
  "jwt-decoder",
  "jwt-encoder",
  "uuid-generator",
  "timestamp-converter",
  "url-parser",
  "regex-tester",
  "regex-builder",
  "markdown-preview",
  "rich-text-to-markdown",
  "diff-checker",
  "word-counter",
  "change-case",
  "slug-generator",
  "remove-duplicate-lines",
  "sort-lines",
  "extract-emails-urls",
  "mime-type-viewer",
  "file-checksum",
  "compare-files",
  "resize-images",
  "convert-images",
  "placeholder-generator"
]);

export const tools: Tool[] = [
  { slug: "json-formatter", title: "JSON Formatter", description: "Format, minify, validate, and copy JSON locally.", category: "Data & Formats", icon: "Braces", tags: ["json", "formatter", "minify"], featured: true, status: "implemented" },
  { slug: "json-validator", title: "JSON Validator", description: "Check JSON validity and get friendly parse errors.", category: "Data & Formats", icon: "ShieldCheck", tags: ["json", "validate"], featured: false, status: "implemented" },
  { slug: "yaml-formatter", title: "YAML Formatter", description: "Parse and normalize YAML documents in your browser.", category: "Data & Formats", icon: "FileCode2", tags: ["yaml", "formatter"], featured: true, status: "implemented" },
  { slug: "yaml-json-converter", title: "YAML <-> JSON Converter", description: "Convert YAML to JSON and JSON back to YAML.", category: "Data & Formats", icon: "Replace", tags: ["yaml", "json", "convert"], featured: true, status: "implemented" },
  { slug: "url-parser", title: "URL Parser", description: "Inspect protocol, host, path, hash, and query parameters.", category: "Data & Formats", icon: "Link", tags: ["url", "query"], featured: false, status: "implemented" },
  { slug: "timestamp-converter", title: "Timestamp Converter", description: "Convert Unix seconds or milliseconds into readable dates.", category: "Data & Formats", icon: "Clock3", tags: ["time", "unix", "date"], featured: false, status: "implemented" },
  { slug: "base64", title: "Base64 Encode/Decode", description: "Unicode-safe Base64 conversion for text.", category: "Encoding & Security", icon: "Binary", tags: ["base64", "encode", "decode"], featured: true, status: "implemented" },
  { slug: "hash-generator", title: "Hash Generator", description: "Generate SHA hashes and legacy MD5 checksums for text and files.", category: "Encoding & Security", icon: "Fingerprint", tags: ["hash", "sha", "md5", "crypto"], featured: true, status: "implemented" },
  { slug: "jwt-decoder", title: "JWT Decoder", description: "Decode JWT header and payload without verifying signature.", category: "Encoding & Security", icon: "KeyRound", tags: ["jwt", "token"], featured: true, status: "implemented" },
  { slug: "jwt-encoder", title: "JWT Encoder", description: "Create unsigned or HS256-signed JWTs locally in your browser.", category: "Encoding & Security", icon: "KeyRound", tags: ["jwt", "encode", "token"], featured: true, status: "implemented" },
  { slug: "uuid-generator", title: "UUID Generator", description: "Generate secure random UUID v4 values.", category: "Encoding & Security", icon: "Ticket", tags: ["uuid", "random"], featured: false, status: "implemented" },
  { slug: "regex-tester", title: "Regex Tester", description: "Test patterns, flags, match indexes, and groups.", category: "Developer Utilities", icon: "Regex", tags: ["regex", "developer"], featured: true, status: "implemented" },
  { slug: "regex-builder", title: "Regex Builder", description: "Build common regular expressions from readable options.", category: "Developer Utilities", icon: "Blocks", tags: ["regex", "builder", "developer"], featured: true, status: "implemented" },
  { slug: "markdown-preview", title: "Markdown Preview", description: "Preview Markdown with GFM and sanitized output.", category: "Developer Utilities", icon: "FileText", tags: ["markdown", "preview"], featured: true, status: "implemented" },
  { slug: "rich-text-to-markdown", title: "Rich Text to Markdown", description: "Convert pasted rich text or HTML into Markdown locally.", category: "Developer Utilities", icon: "FileType2", tags: ["markdown", "html", "converter"], featured: true, status: "implemented" },
  { slug: "diff-checker", title: "Diff Checker", description: "Compare two snippets with line-level highlighting.", category: "Developer Utilities", icon: "GitCompareArrows", tags: ["diff", "compare"], featured: true, status: "implemented" },
  { slug: "word-counter", title: "Word/Character Counter", description: "Count words, characters, lines, paragraphs, and reading time.", category: "Text Tools", icon: "WholeWord", tags: ["words", "count"], featured: true, status: "implemented" },
  { slug: "clean-extra-spaces", title: "Clean Extra Spaces", description: "Trim lines, collapse spaces, and normalize line endings.", category: "Text Tools", icon: "Eraser", tags: ["text", "spaces"], featured: false, status: "planned" },
  { slug: "change-case", title: "Change Case", description: "Convert text between common naming and writing cases.", category: "Text Tools", icon: "CaseSensitive", tags: ["case", "text"], featured: false, status: "implemented" },
  { slug: "transliteration", title: "Transliteration", description: "Convert Cyrillic text to Latin characters.", category: "Text Tools", icon: "Languages", tags: ["cyrillic", "latin", "slug"], featured: false, status: "planned" },
  { slug: "slug-generator", title: "Slug Generator", description: "Create clean URL slugs from human text.", category: "Text Tools", icon: "Link2", tags: ["slug", "url"], featured: true, status: "implemented" },
  { slug: "text-diff", title: "Text Diff", description: "Text-focused line diff using the same local engine.", category: "Text Tools", icon: "Rows3", tags: ["text", "diff"], featured: false, status: "basic" },
  { slug: "remove-duplicate-lines", title: "Remove Duplicate Lines", description: "Deduplicate lines with trim and case options.", category: "Text Tools", icon: "ListMinus", tags: ["lines", "duplicates"], featured: false, status: "implemented" },
  { slug: "sort-lines", title: "Sort Lines", description: "Sort text lines alphabetically or numerically.", category: "Text Tools", icon: "ArrowDownAZ", tags: ["sort", "lines"], featured: false, status: "implemented" },
  { slug: "extract-emails-urls", title: "Extract Emails/URLs", description: "Pull email addresses and links from pasted text.", category: "Text Tools", icon: "AtSign", tags: ["extract", "email", "url"], featured: false, status: "implemented" },
  { slug: "lorem-ipsum", title: "Lorem Ipsum Generator", description: "Generate words, sentences, or paragraphs of placeholder copy.", category: "Text Tools", icon: "Pilcrow", tags: ["lorem", "placeholder"], featured: false, status: "planned" },
  { slug: "mime-type-viewer", title: "MIME Type Viewer", description: "Inspect file metadata and basic magic-byte signatures.", category: "File Tools", icon: "FileSearch", tags: ["mime", "file"], featured: true, status: "implemented" },
  { slug: "file-size-converter", title: "File Size Converter", description: "Convert bytes into decimal and binary units.", category: "File Tools", icon: "Scale", tags: ["bytes", "size"], featured: false, status: "planned" },
  { slug: "file-checksum", title: "File Checksum Generator", description: "Generate SHA checksums for local files.", category: "File Tools", icon: "FileKey2", tags: ["file", "checksum"], featured: true, status: "implemented" },
  { slug: "compare-files", title: "Compare Two Files", description: "Compare metadata, SHA-256 checksums, and text diffs.", category: "File Tools", icon: "Files", tags: ["file", "compare"], featured: true, status: "implemented" },
  { slug: "batch-rename-preview", title: "Batch Rename Preview", description: "Preview file rename patterns and export CSV.", category: "File Tools", icon: "ListTree", tags: ["rename", "files"], featured: false, status: "planned" },
  { slug: "generate-checksum-file", title: "Generate Checksum File", description: "Create a checksums.sha256.txt file for selected files.", category: "File Tools", icon: "FileArchive", tags: ["sha256", "checksum"], featured: false, status: "planned" },
  { slug: "resize-images", title: "Resize Images", description: "Resize images with aspect-ratio control and export.", category: "Image Tools", icon: "Scan", tags: ["image", "resize"], featured: true, status: "implemented" },
  { slug: "compress-images", title: "Compress PNG/JPEG/WebP", description: "Compress browser-supported images and compare sizes.", category: "Image Tools", icon: "Archive", tags: ["image", "compress"], featured: false, status: "planned" },
  { slug: "convert-images", title: "Convert Images", description: "Convert images to PNG, JPEG, or WebP with preview.", category: "Image Tools", icon: "ImagePlus", tags: ["image", "convert"], featured: true, status: "implemented" },
  { slug: "crop-image", title: "Crop Image", description: "Crop images with aspect presets and export the result.", category: "Image Tools", icon: "Crop", tags: ["image", "crop"], featured: false, status: "planned" },
  { slug: "remove-image-metadata", title: "Remove Image Metadata", description: "Read EXIF when available and re-encode a cleaned image.", category: "Image Tools", icon: "BadgeX", tags: ["exif", "metadata"], featured: false, status: "planned" },
  { slug: "favicon-generator", title: "Generate Favicon Set", description: "Generate common favicon PNG sizes and HTML tags.", category: "Image Tools", icon: "Sparkles", tags: ["favicon", "icons"], featured: false, status: "planned" },
  { slug: "extract-color-palette", title: "Extract Color Palette", description: "Sample dominant colors from an uploaded image.", category: "Image Tools", icon: "Palette", tags: ["color", "palette"], featured: false, status: "planned" },
  { slug: "placeholder-generator", title: "Placeholder Generator", description: "Create PNG or SVG placeholder images.", category: "Image Tools", icon: "PanelTop", tags: ["placeholder", "image"], featured: false, status: "implemented" }
];

export function getTool(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: ToolCategory) {
  return tools.filter((tool) => tool.category === category);
}
