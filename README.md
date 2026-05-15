# isMoreTools

Privacy-friendly browser tools for developers, text, files, and images.

isMoreTools is a static Next.js App Router project. It has no backend, no authentication, no analytics, no database, and no external processing APIs. User text, files, and images are processed locally in the browser with File API, Canvas API, Web Crypto API, URL API, and Clipboard API.

## Tech Stack

- Next.js App Router with static export
- TypeScript strict
- Tailwind CSS
- shadcn-style reusable UI primitives
- lucide-react icons
- sonner toasts
- yaml, jose, react-markdown, remark-gfm, rehype-sanitize, diff, exifr, browser-image-compression, react-easy-crop

## Getting Started

```bash
npm install
npm run dev
npm run build
```

The project is configured for static export in `next.config.ts`:

```ts
output: "export"
```

## Project Structure

```text
app/
components/
data/
lib/
types/
```

## Implemented Tools

- JSON Formatter
- YAML Formatter
- JSON Validator
- YAML <-> JSON Converter
- Base64 Encode/Decode
- Hash Generator
- JWT Decoder
- JWT Encoder
- UUID Generator
- Timestamp Converter
- URL Parser
- Regex Tester
- Regex Builder
- Markdown Preview
- Rich Text to Markdown
- Diff Checker
- Word/Character Counter
- Change Case
- Slug Generator
- Remove Duplicate Lines
- Sort Lines
- Extract Emails/URLs
- MIME Type Viewer
- File Checksum Generator
- Compare Two Files
- Resize Images
- Convert Images
- Placeholder Generator

## Planned / Basic Catalog Entries

- Clean Extra Spaces
- Transliteration
- Text Diff
- Lorem Ipsum Generator
- File Size Converter
- Batch Rename Preview
- Generate Checksum File
- Compress PNG/JPEG/WebP
- Crop Image
- Remove Image Metadata
- Generate Favicon Set
- Extract Color Palette

## Privacy Model

- User content is not uploaded.
- There are no server actions for processing user data.
- There are no external APIs.
- Files are not stored.
- `localStorage` is used only for theme preference.

## Verification

`npm run build` successfully compiles the app, validates TypeScript, prerenders all routes, and exports the static site.
