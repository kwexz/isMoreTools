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

## Docker Deployment

The app is statically exported by Next.js and served by nginx in the runtime image.

Build and run with Docker:

```bash
docker build -t ismoretools:latest .
docker run -d --name ismoretools --restart unless-stopped -p 8080:80 ismoretools:latest
```

Or with Docker Compose:

```bash
docker compose up -d --build
```

Then open:

```text
http://your-server-ip:8080
```

For production behind a reverse proxy, point Nginx/Caddy/Traefik to the container port `80`.

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
- Clean Extra Spaces
- Change Case
- Transliteration
- Slug Generator
- Remove Duplicate Lines
- Sort Lines
- Extract Emails/URLs
- Lorem Ipsum Generator
- MIME Type Viewer
- File Checksum Generator
- Compare Two Files
- Batch Rename Preview
- Generate Checksum File
- Resize Images
- Compress PNG/JPEG/WebP
- Convert Images
- Crop Image
- Remove Image Metadata
- Generate Favicon Set
- Extract Color Palette
- Placeholder Generator

## Planned / Basic Catalog Entries

- Text Diff
- File Size Converter

## Privacy Model

- User content is not uploaded.
- There are no server actions for processing user data.
- There are no external APIs.
- Files are not stored.
- `localStorage` is used only for theme preference.

## Verification

`npm run build` successfully compiles the app, validates TypeScript, prerenders all routes, and exports the static site.
