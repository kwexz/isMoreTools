"use client";

import { useMemo, useState } from "react";
import imageCompression from "browser-image-compression";
import { diffLines } from "diff";
import * as exifr from "exifr";
import { decodeJwt, decodeProtectedHeader, SignJWT } from "jose";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Download, RefreshCw, Wand2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/tools/forms/CopyButton";
import { FileDropzone } from "@/components/tools/forms/FileDropzone";
import { OutputPanel } from "@/components/tools/forms/OutputPanel";
import { formatJson, getJsonError, minifyJson } from "@/lib/tools/json";
import { formatYaml, jsonToYaml, yamlToJson } from "@/lib/tools/yaml";
import { analyzeText, changeCase, toSlug, transliterate } from "@/lib/tools/text";
import { hashAlgorithms, hashFile, hashText, type HashAlgorithm } from "@/lib/tools/hash";
import { detectMagicType, extensionOf } from "@/lib/tools/files";
import { downloadBlob, formatBinaryBytes, formatBytes } from "@/lib/tools/format";
import { canvasFromImage, canvasToBlob, exportCanvas, hexFromRgb } from "@/lib/tools/images";
import { implementedSlugs } from "@/data/tools";

type ToolProps = { slug: string };
type KV = Record<string, unknown>;

const sampleJson = '{ "name": "isMoreTools", "local": true, "tools": ["json", "hash", "images"] }';
const sampleMarkdown = "## Markdown Preview\n\n- GFM tables\n- **Sanitized** HTML\n\n| Tool | Local |\n| --- | --- |\n| Preview | yes |";
const loremWords = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua".split(" ");

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="space-y-2 text-sm font-medium">{label}{children}</label>;
}

function HowItWorks({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-muted/50 p-4 text-sm leading-6 text-muted-foreground"><strong className="text-foreground">How it works:</strong> {children}</div>;
}

function TextActions({ onClear, onSample }: { onClear: () => void; onSample?: () => void }) {
  return <div className="flex flex-wrap gap-2">{onSample ? <Button type="button" variant="outline" onClick={onSample}><Wand2 className="h-4 w-4" /> Sample</Button> : null}<Button type="button" variant="outline" onClick={onClear}>Clear</Button></div>;
}

function useObjectUrl(file?: File | Blob | null) {
  return useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
}

function JsonFormatter() {
  const [input, setInput] = useState(sampleJson);
  const [spaces, setSpaces] = useState(2);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  function run(mode: "format" | "minify") {
    try {
      setError("");
      setOutput(mode === "format" ? formatJson(input, spaces) : minifyJson(input));
      toast.success("JSON processed locally.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON.");
    }
  }
  return <div className="space-y-5"><div className="flex flex-wrap gap-2"><Button onClick={() => run("format")}>Format</Button><Button variant="secondary" onClick={() => run("minify")}>Minify</Button><CopyButton value={output} /><Button variant="outline" onClick={() => { setInput(""); setOutput(""); setError(""); }}>Clear</Button><Select value={String(spaces)} onChange={(e) => setSpaces(Number(e.target.value))}><option value="2">2 spaces</option><option value="4">4 spaces</option></Select></div><Textarea className="min-h-60 font-mono" value={input} onChange={(e) => setInput(e.target.value)} /><OutputPanel value={output} error={error} /><HowItWorks>JSON.parse validates the input, then JSON.stringify formats or minifies it in memory.</HowItWorks></div>;
}

function JsonValidator() {
  const [input, setInput] = useState(sampleJson);
  const error = input.trim() ? getJsonError(input) : null;
  return <div className="space-y-5"><Textarea className="min-h-64 font-mono" value={input} onChange={(e) => setInput(e.target.value)} /><div className={error ? "rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive" : "rounded-xl border border-primary/30 bg-primary/10 p-4 text-primary"}>{error ? <XCircle className="mr-2 inline h-4 w-4" /> : <CheckCircle2 className="mr-2 inline h-4 w-4" />}{error ?? "Valid JSON."}</div><TextActions onClear={() => setInput("")} onSample={() => setInput(sampleJson)} /><HowItWorks>The browser parses your text with the JavaScript JSON parser and shows the parse message if validation fails.</HowItWorks></div>;
}

function YamlFormatter() {
  const [input, setInput] = useState("name: isMoreTools\nlocal: true\ntools:\n  - yaml\n  - json\n");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  function format() { try { setError(""); setOutput(formatYaml(input)); } catch (err) { setError(err instanceof Error ? err.message : "Invalid YAML."); } }
  return <div className="space-y-5"><div className="flex gap-2"><Button onClick={format}>Format</Button><CopyButton value={output} /><Button variant="outline" onClick={() => { setInput(""); setOutput(""); }}>Clear</Button></div><Textarea className="min-h-60 font-mono" value={input} onChange={(e) => setInput(e.target.value)} /><OutputPanel value={output} error={error} /><HowItWorks>The yaml package parses the document and stringifies it back locally.</HowItWorks></div>;
}

function YamlJsonConverter() {
  const [mode, setMode] = useState<"yaml-json" | "json-yaml">("yaml-json");
  const [input, setInput] = useState("name: isMoreTools\nlocal: true\n");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  function convert() { try { setError(""); setOutput(mode === "yaml-json" ? yamlToJson(input, 2) : jsonToYaml(input)); } catch (err) { setError(err instanceof Error ? err.message : "Could not convert."); } }
  function swap() { setMode(mode === "yaml-json" ? "json-yaml" : "yaml-json"); setInput(output || (mode === "yaml-json" ? sampleJson : "name: isMoreTools\n")); setOutput(""); }
  return <div className="space-y-5"><div className="flex flex-wrap gap-2"><Select value={mode} onChange={(e) => setMode(e.target.value as "yaml-json" | "json-yaml")}><option value="yaml-json">YAML to JSON</option><option value="json-yaml">JSON to YAML</option></Select><Button onClick={convert}>Convert</Button><Button variant="outline" onClick={swap}><RefreshCw className="h-4 w-4" /> Swap</Button><CopyButton value={output} /></div><Textarea className="min-h-60 font-mono" value={input} onChange={(e) => setInput(e.target.value)} /><OutputPanel value={output} error={error} /><HowItWorks>The converter parses one syntax and serializes the same object graph into the other syntax.</HowItWorks></div>;
}

function UrlParser() {
  const [value, setValue] = useState("https://example.com:443/tools?query=json&local=true#preview");
  const parsed = useMemo(() => { try { return new URL(value); } catch { return null; } }, [value]);
  return <div className="space-y-5"><Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="https://example.com/path?x=1" />{parsed ? <div className="grid gap-3 md:grid-cols-2">{(["protocol", "hostname", "port", "pathname", "hash"] as const).map((key) => <Card key={key} className="p-3"><div className="text-xs text-muted-foreground">{key}</div><div className="break-all font-mono text-sm">{parsed[key] || "none"}</div></Card>)}<Card className="p-3 md:col-span-2"><div className="mb-2 text-xs text-muted-foreground">query params</div><div className="overflow-auto"><table className="w-full text-left text-sm"><tbody>{Array.from(parsed.searchParams.entries()).map(([k, v]) => <tr key={k}><td className="border p-2 font-mono">{k}</td><td className="border p-2 font-mono">{v}</td></tr>)}</tbody></table></div></Card></div> : <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">Invalid URL.</div>}<HowItWorks>The standard URL API splits the value into browser-native URL fields.</HowItWorks></div>;
}

function TimestampConverter() {
  const [value, setValue] = useState(String(Date.now()));
  const date = useMemo(() => { const n = Number(value); return Number.isFinite(n) ? new Date(String(Math.trunc(Math.abs(n))).length <= 10 ? n * 1000 : n) : null; }, [value]);
  return <div className="space-y-5"><div className="flex gap-2"><Input value={value} onChange={(e) => setValue(e.target.value)} /><Button onClick={() => setValue(String(Date.now()))}>Now</Button></div>{date && !Number.isNaN(date.getTime()) ? <div className="grid gap-3 md:grid-cols-2"><Card className="p-4"><span className="text-xs text-muted-foreground">ISO</span><p className="font-mono">{date.toISOString()}</p></Card><Card className="p-4"><span className="text-xs text-muted-foreground">UTC</span><p>{date.toUTCString()}</p></Card><Card className="p-4"><span className="text-xs text-muted-foreground">Local</span><p>{date.toLocaleString()}</p></Card><Card className="p-4"><span className="text-xs text-muted-foreground">Timezone</span><p>{Intl.DateTimeFormat().resolvedOptions().timeZone}</p></Card></div> : <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">Enter Unix seconds or milliseconds.</div>}<HowItWorks>10-digit values are treated as Unix seconds; longer values are treated as milliseconds.</HowItWorks></div>;
}

function Base64Tool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("Hello, мир!");
  const [error, setError] = useState("");
  const output = useMemo(() => { try { setError(""); if (mode === "encode") return btoa(String.fromCharCode(...new TextEncoder().encode(input))); return new TextDecoder().decode(Uint8Array.from(atob(input), (c) => c.charCodeAt(0))); } catch { setError("Input is not valid Base64 for decoding."); return ""; } }, [input, mode]);
  return <div className="space-y-5"><Select value={mode} onChange={(e) => setMode(e.target.value as "encode" | "decode")}><option value="encode">Encode</option><option value="decode">Decode</option></Select><Textarea className="min-h-48 font-mono" value={input} onChange={(e) => setInput(e.target.value)} /><OutputPanel value={output} error={error} /><HowItWorks>TextEncoder and TextDecoder make the conversion Unicode-safe before Base64 operations.</HowItWorks></div>;
}

function HashGenerator({ fileOnly = false }: { fileOnly?: boolean }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  async function run() { try { setBusy(true); setOutput(file ? await hashFile(file, algorithm) : await hashText(text, algorithm)); toast.success("Hash generated locally."); } finally { setBusy(false); } }
  return <div className="space-y-5">{!fileOnly ? <Textarea className="font-mono" value={text} onChange={(e) => setText(e.target.value)} placeholder="Text to hash" /> : null}<FileDropzone label={fileOnly ? "Choose file for checksum" : "Choose optional file"} onFiles={(files) => setFile(files[0] ?? null)} />{file ? <p className="text-sm text-muted-foreground">{file.name} · {formatBytes(file.size)}</p> : null}<div className="flex flex-wrap gap-2"><Select value={algorithm} onChange={(e) => setAlgorithm(e.target.value as HashAlgorithm)}>{hashAlgorithms.map((item) => <option key={item}>{item === "MD5" ? "MD5 (legacy, non-secure)" : item}</option>)}</Select><Button onClick={run} disabled={busy || (!file && !text)}>{busy ? "Working..." : "Generate"}</Button><CopyButton value={output} /></div>{algorithm === "MD5" ? <div className="rounded-xl border border-accent/50 bg-accent/10 p-3 text-sm"><AlertTriangle className="mr-2 inline h-4 w-4" />MD5 is legacy and non-secure. Use it only for compatibility checks, not for passwords, signatures, or security decisions.</div> : null}<OutputPanel value={output} title="Hex digest" /><HowItWorks>SHA hashes use Web Crypto API. MD5 is implemented locally only for legacy compatibility and is explicitly marked non-secure.</HowItWorks></div>;
}

function JwtDecoder() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const decoded = useMemo(() => { if (!input.trim()) return ""; try { setError(""); return JSON.stringify({ header: decodeProtectedHeader(input), payload: decodeJwt(input) }, null, 2); } catch (err) { setError(err instanceof Error ? err.message : "Invalid JWT."); return ""; } }, [input]);
  return <div className="space-y-5"><div className="rounded-xl border border-accent/50 bg-accent/10 p-3 text-sm"><AlertTriangle className="mr-2 inline h-4 w-4" />Decoded only. Signature is not verified.</div><Textarea className="min-h-40 font-mono" value={input} onChange={(e) => setInput(e.target.value)} placeholder="eyJ..." /><OutputPanel value={decoded} error={error} /><HowItWorks>jose decodes the protected header and payload locally without verifying trust or signatures.</HowItWorks></div>;
}

function base64UrlJson(value: unknown) {
  const json = JSON.stringify(value);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function JwtEncoder() {
  const [algorithm, setAlgorithm] = useState<"none" | "HS256">("none");
  const [header, setHeader] = useState('{\n  "typ": "JWT"\n}');
  const [payload, setPayload] = useState('{\n  "sub": "1234567890",\n  "name": "isMoreTools",\n  "iat": 1710000000\n}');
  const [secret, setSecret] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  async function encode() {
    try {
      setError("");
      const parsedHeader = JSON.parse(header) as Record<string, unknown>;
      const parsedPayload = JSON.parse(payload) as Record<string, unknown>;
      if (algorithm === "none") {
        setOutput(`${base64UrlJson({ ...parsedHeader, alg: "none" })}.${base64UrlJson(parsedPayload)}.`);
        toast.success("Unsigned JWT encoded locally.");
        return;
      }
      if (!secret) throw new Error("Enter a secret for HS256 signing.");
      const token = await new SignJWT(parsedPayload)
        .setProtectedHeader({ ...parsedHeader, alg: "HS256" })
        .sign(new TextEncoder().encode(secret));
      setOutput(token);
      toast.success("JWT signed locally.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not encode JWT.");
      setOutput("");
    }
  }

  return <div className="space-y-5"><div className="rounded-xl border border-accent/50 bg-accent/10 p-3 text-sm"><AlertTriangle className="mr-2 inline h-4 w-4" />JWTs are created locally. Keep secrets private; do not paste production secrets into shared screens.</div><div className="grid gap-4 lg:grid-cols-2"><Field label="Header JSON"><Textarea className="min-h-44 font-mono" value={header} onChange={(e) => setHeader(e.target.value)} /></Field><Field label="Payload JSON"><Textarea className="min-h-44 font-mono" value={payload} onChange={(e) => setPayload(e.target.value)} /></Field></div><div className="grid gap-3 md:grid-cols-2"><Field label="Algorithm"><Select value={algorithm} onChange={(e) => setAlgorithm(e.target.value as "none" | "HS256")}><option value="none">none (unsigned)</option><option value="HS256">HS256</option></Select></Field>{algorithm === "HS256" ? <Field label="Secret"><Input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="local signing secret" /></Field> : null}</div><div className="flex flex-wrap gap-2"><Button onClick={encode}>Encode JWT</Button><CopyButton value={output} /><Button variant="outline" onClick={() => { setOutput(""); setError(""); }}>Clear output</Button></div><OutputPanel value={output} error={error} title="JWT" /><HowItWorks>Unsigned tokens are base64url-encoded locally with alg none. HS256 tokens are signed in the browser with jose and your local secret.</HowItWorks></div>;
}

function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [items, setItems] = useState<string[]>([]);
  return <div className="space-y-5"><div className="flex flex-wrap gap-2"><Input className="w-32" type="number" min={1} max={100} value={count} onChange={(e) => setCount(Number(e.target.value))} /><Button onClick={() => setItems(Array.from({ length: Math.min(100, Math.max(1, count)) }, () => crypto.randomUUID()))}>Generate</Button><CopyButton value={items.join("\n")} label="Copy all" /></div><div className="grid gap-2">{items.map((item) => <div key={item} className="flex items-center justify-between gap-2 rounded-xl border p-2 font-mono text-sm"><span className="break-all">{item}</span><CopyButton value={item} label="Copy one" /></div>)}</div><HowItWorks>crypto.randomUUID creates RFC 4122 version 4 UUIDs with secure randomness.</HowItWorks></div>;
}

function RegexTester() {
  const [pattern, setPattern] = useState("\\btool\\w*\\b");
  const [flags, setFlags] = useState("gi");
  const [text, setText] = useState("Tooling is better when tools stay local.");
  const result = useMemo(() => { try { const re = new RegExp(pattern, flags.includes("g") ? flags : `${flags}g`); const matches = Array.from(text.matchAll(re)); return { error: "", matches }; } catch (err) { return { error: err instanceof Error ? err.message : "Invalid regex.", matches: [] as RegExpMatchArray[] }; } }, [flags, pattern, text]);
  return <div className="space-y-5"><div className="grid gap-3 md:grid-cols-[1fr_160px]"><Input value={pattern} onChange={(e) => setPattern(e.target.value)} /><Input value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="gim" /></div><Textarea className="min-h-48 font-mono" value={text} onChange={(e) => setText(e.target.value)} />{result.error ? <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-destructive">{result.error}</div> : <OutputPanel value={JSON.stringify(result.matches.map((m) => ({ match: m[0], index: m.index, groups: m.slice(1) })), null, 2)} title="Matches" />}<HowItWorks>JavaScript RegExp runs against your text and reports matches, capture groups, and indexes.</HowItWorks></div>;
}

function RegexBuilder() {
  const [preset, setPreset] = useState("email");
  const [custom, setCustom] = useState("");
  const [starts, setStarts] = useState(false);
  const [ends, setEnds] = useState(false);
  const [global, setGlobal] = useState(true);
  const [ignoreCase, setIgnoreCase] = useState(true);
  const [multiline, setMultiline] = useState(false);
  const [testText, setTestText] = useState("Email hello@example.com, visit https://example.com, or use ABC-123.");

  const presets: Record<string, { label: string; pattern: string }> = {
    email: { label: "Email", pattern: "[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}" },
    url: { label: "HTTP URL", pattern: "https?:\\/\\/[^\\s<>\"']+" },
    uuid: { label: "UUID", pattern: "[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}" },
    slug: { label: "Slug", pattern: "[a-z0-9]+(?:-[a-z0-9]+)*" },
    words: { label: "Words", pattern: "\\b\\w+\\b" },
    number: { label: "Number", pattern: "-?\\d+(?:\\.\\d+)?" },
    custom: { label: "Custom", pattern: custom || "\\w+" }
  };
  const pattern = `${starts ? "^" : ""}${presets[preset].pattern}${ends ? "$" : ""}`;
  const flags = `${global ? "g" : ""}${ignoreCase ? "i" : ""}${multiline ? "m" : ""}`;
  const result = useMemo(() => {
    try {
      const regex = new RegExp(pattern, flags.includes("g") ? flags : `${flags}g`);
      return { error: "", matches: Array.from(testText.matchAll(regex)).map((match) => ({ match: match[0], index: match.index })) };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Invalid regex.", matches: [] };
    }
  }, [flags, pattern, testText]);

  return <div className="space-y-5"><div className="grid gap-3 md:grid-cols-3"><Field label="Pattern preset"><Select value={preset} onChange={(e) => setPreset(e.target.value)}>{Object.entries(presets).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</Select></Field>{preset === "custom" ? <Field label="Custom source"><Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="\\w+" /></Field> : null}<Field label="Flags"><Input readOnly value={flags || "none"} /></Field></div><div className="flex flex-wrap gap-4 text-sm"><label><input type="checkbox" checked={starts} onChange={(e) => setStarts(e.target.checked)} /> Starts with</label><label><input type="checkbox" checked={ends} onChange={(e) => setEnds(e.target.checked)} /> Ends with</label><label><input type="checkbox" checked={global} onChange={(e) => setGlobal(e.target.checked)} /> Global</label><label><input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} /> Ignore case</label><label><input type="checkbox" checked={multiline} onChange={(e) => setMultiline(e.target.checked)} /> Multiline</label></div><OutputPanel value={`/${pattern}/${flags}`} title="Regular expression" error={result.error} /><Textarea className="min-h-36 font-mono" value={testText} onChange={(e) => setTestText(e.target.value)} /><OutputPanel value={JSON.stringify(result.matches, null, 2)} title="Test matches" /><HowItWorks>The builder assembles a JavaScript RegExp from safe presets, anchors, and flags, then tests it locally against your sample text.</HowItWorks></div>;
}

function escapeMarkdown(value: string) {
  return value.replace(/([\\`*_{}[\]()#+\-.!|>])/g, "\\$1");
}

function nodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return escapeMarkdown(node.textContent ?? "");
  if (!(node instanceof HTMLElement)) return Array.from(node.childNodes).map(nodeToMarkdown).join("");
  const children = () => Array.from(node.childNodes).map(nodeToMarkdown).join("");
  const text = children().trim();
  switch (node.tagName.toLowerCase()) {
    case "h1": return `# ${text}\n\n`;
    case "h2": return `## ${text}\n\n`;
    case "h3": return `### ${text}\n\n`;
    case "h4": return `#### ${text}\n\n`;
    case "p": return `${children().trim()}\n\n`;
    case "br": return "\n";
    case "strong":
    case "b": return `**${children()}**`;
    case "em":
    case "i": return `_${children()}_`;
    case "code": return node.parentElement?.tagName.toLowerCase() === "pre" ? children() : `\`${(node.textContent ?? "").replaceAll("`", "\\`")}\``;
    case "pre": return `\n\`\`\`\n${node.textContent?.trim() ?? ""}\n\`\`\`\n\n`;
    case "blockquote": return children().split("\n").filter(Boolean).map((line) => `> ${line}`).join("\n") + "\n\n";
    case "a": return `[${children() || node.getAttribute("href") || "link"}](${node.getAttribute("href") ?? ""})`;
    case "ul": return `${Array.from(node.children).map((child) => `- ${nodeToMarkdown(child).trim()}`).join("\n")}\n\n`;
    case "ol": return `${Array.from(node.children).map((child, index) => `${index + 1}. ${nodeToMarkdown(child).trim()}`).join("\n")}\n\n`;
    case "li": return children();
    case "img": return `![${node.getAttribute("alt") ?? ""}](${node.getAttribute("src") ?? ""})`;
    case "table": {
      const rows = Array.from(node.querySelectorAll("tr")).map((row) => Array.from(row.children).map((cell) => nodeToMarkdown(cell).trim()));
      if (!rows.length) return "";
      const header = rows[0];
      const body = rows.slice(1);
      return `| ${header.join(" | ")} |\n| ${header.map(() => "---").join(" | ")} |\n${body.map((row) => `| ${row.join(" | ")} |`).join("\n")}\n\n`;
    }
    case "th":
    case "td": return children();
    default: return children();
  }
}

function htmlToMarkdown(html: string) {
  const document = new DOMParser().parseFromString(html, "text/html");
  return Array.from(document.body.childNodes).map(nodeToMarkdown).join("").replace(/\n{3,}/g, "\n\n").trim();
}

function RichTextToMarkdown() {
  const sampleHtml = "<h2>Release notes</h2><p><strong>isMoreTools</strong> converts rich text locally.</p><ul><li>No uploads</li><li>No external APIs</li></ul>";
  const [html, setHtml] = useState(sampleHtml);
  const [markdown, setMarkdown] = useState("");
  const [error, setError] = useState("");

  function convert(nextHtml = html) {
    try {
      setError("");
      setMarkdown(htmlToMarkdown(nextHtml));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not convert rich text.");
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    const rich = event.clipboardData.getData("text/html");
    const plain = event.clipboardData.getData("text/plain");
    if (!rich && !plain) return;
    event.preventDefault();
    const nextHtml = rich || `<p>${plain.replaceAll("\n", "<br>")}</p>`;
    setHtml(nextHtml);
    convert(nextHtml);
  }

  return <div className="space-y-5"><div onPaste={handlePaste} className="min-h-28 rounded-2xl border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground" contentEditable suppressContentEditableWarning>Paste rich text here from a browser, document editor, or email.</div><div className="flex flex-wrap gap-2"><Button onClick={() => convert()}>Convert</Button><Button variant="outline" onClick={() => { setHtml(sampleHtml); convert(sampleHtml); }}>Sample</Button><Button variant="outline" onClick={() => { setHtml(""); setMarkdown(""); setError(""); }}>Clear</Button><CopyButton value={markdown} /></div><Field label="HTML input"><Textarea className="min-h-44 font-mono" value={html} onChange={(e) => setHtml(e.target.value)} /></Field><OutputPanel value={markdown} error={error} title="Markdown" /><div className="prose-tools min-h-40 overflow-auto rounded-xl border bg-background p-4"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>{markdown}</ReactMarkdown></div><HowItWorks>The converter reads pasted HTML or typed HTML with DOMParser and maps common rich-text elements to Markdown locally.</HowItWorks></div>;
}

function MarkdownPreview() {
  const [value, setValue] = useState(sampleMarkdown);
  return <div className="space-y-5"><div className="flex gap-2"><Button variant="outline" onClick={() => setValue(sampleMarkdown)}>Sample</Button><Button variant="outline" onClick={() => setValue("")}>Clear</Button></div><div className="grid gap-4 lg:grid-cols-2"><Textarea className="min-h-96 font-mono" value={value} onChange={(e) => setValue(e.target.value)} /><div className="prose-tools min-h-96 overflow-auto rounded-xl border bg-background p-4"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>{value}</ReactMarkdown></div></div><HowItWorks>react-markdown renders an AST with GFM support and rehype-sanitize. No dangerouslySetInnerHTML is used.</HowItWorks></div>;
}

function DiffTool() {
  const [left, setLeft] = useState("one\ntwo\nthree");
  const [right, setRight] = useState("one\nTwo\nthree\nfour");
  const parts = useMemo(() => diffLines(left, right), [left, right]);
  return <div className="space-y-5"><div className="grid gap-4 lg:grid-cols-2"><Textarea className="min-h-56 font-mono" value={left} onChange={(e) => setLeft(e.target.value)} /><Textarea className="min-h-56 font-mono" value={right} onChange={(e) => setRight(e.target.value)} /></div><div className="overflow-auto rounded-xl border font-mono text-sm">{parts.map((part, index) => <pre key={index} className={part.added ? "bg-emerald-500/15 p-2" : part.removed ? "bg-rose-500/15 p-2" : "bg-muted/30 p-2"}>{part.value}</pre>)}</div><HowItWorks>The diff package compares both inputs line by line and labels added, removed, and unchanged ranges.</HowItWorks></div>;
}

function WordCounter() {
  const [text, setText] = useState("Privacy-friendly tools run locally in your browser.");
  const stats = analyzeText(text);
  return <div className="space-y-5"><Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-56" /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(stats).map(([k, v]) => <Card key={k} className="p-4"><div className="text-xs text-muted-foreground">{k}</div><div className="text-2xl font-semibold">{v}</div></Card>)}</div><HowItWorks>Counts are computed with local string operations. Sentence detection and reading time are practical estimates.</HowItWorks></div>;
}

function CleanSpaces() {
  const [text, setText] = useState("  hello    world  \n\n\n second   line  ");
  const [trim, setTrim] = useState(true), [collapse, setCollapse] = useState(true), [blank, setBlank] = useState(true);
  const output = useMemo(() => { let lines = text.replace(/\r\n?/g, "\n").split("\n"); if (trim) lines = lines.map((line) => line.trim()); let out = lines.join("\n"); if (collapse) out = out.replace(/[ \t]{2,}/g, " "); if (blank) out = out.replace(/\n{3,}/g, "\n\n"); return out; }, [blank, collapse, text, trim]);
  return <div className="space-y-5"><div className="flex flex-wrap gap-4 text-sm"><label><input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} /> Trim lines</label><label><input type="checkbox" checked={collapse} onChange={(e) => setCollapse(e.target.checked)} /> Collapse spaces</label><label><input type="checkbox" checked={blank} onChange={(e) => setBlank(e.target.checked)} /> Remove extra blank lines</label></div><Textarea value={text} onChange={(e) => setText(e.target.value)} /><OutputPanel value={output} /><HowItWorks>Line endings are normalized to LF, then selected cleanup rules are applied.</HowItWorks></div>;
}

function ChangeCaseTool() {
  const [text, setText] = useState("Hello local browser tools");
  const [mode, setMode] = useState("camel");
  const output = changeCase(text, mode);
  return <div className="space-y-5"><Select value={mode} onChange={(e) => setMode(e.target.value)}>{["lowercase","uppercase","title","sentence","camel","pascal","kebab","snake"].map((m) => <option key={m} value={m}>{m}</option>)}</Select><Textarea value={text} onChange={(e) => setText(e.target.value)} /><OutputPanel value={output} /><HowItWorks>Text is tokenized locally and rebuilt according to the selected case style.</HowItWorks></div>;
}

function TransliterationTool({ slugOnly = false }: { slugOnly?: boolean }) {
  const [text, setText] = useState("Привет мир tools");
  const [slug, setSlug] = useState(slugOnly);
  const output = slug ? toSlug(text) : transliterate(text);
  return <div className="space-y-5"><label className="text-sm"><input type="checkbox" checked={slug} onChange={(e) => setSlug(e.target.checked)} /> Slug-friendly output</label><Textarea value={text} onChange={(e) => setText(e.target.value)} /><OutputPanel value={output} /><HowItWorks>A built-in RU transliteration table maps Cyrillic characters to Latin equivalents.</HowItWorks></div>;
}

function DuplicateLines() {
  const [text, setText] = useState("Alpha\nbeta\nalpha\nBeta");
  const [caseSensitive, setCaseSensitive] = useState(false), [trim, setTrim] = useState(true);
  const { output, removed } = useMemo(() => { const seen = new Set<string>(); const out: string[] = []; let removedCount = 0; for (const line of text.split(/\r\n|\r|\n/)) { const normalized = trim ? line.trim() : line; const key = caseSensitive ? normalized : normalized.toLowerCase(); if (seen.has(key)) removedCount += 1; else { seen.add(key); out.push(trim ? normalized : line); } } return { output: out.join("\n"), removed: removedCount }; }, [caseSensitive, text, trim]);
  return <div className="space-y-5"><div className="flex gap-4 text-sm"><label><input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} /> Case-sensitive</label><label><input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} /> Trim lines</label></div><Textarea value={text} onChange={(e) => setText(e.target.value)} /><p className="text-sm text-muted-foreground">Removed: {removed}</p><OutputPanel value={output} /><HowItWorks>A Set tracks normalized lines and preserves the first occurrence.</HowItWorks></div>;
}

function SortLines() {
  const [text, setText] = useState("10\n2\nalpha\nbeta");
  const [mode, setMode] = useState("az");
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const output = useMemo(() => { const lines = text.split(/\r\n|\r|\n/).filter((l) => !removeEmpty || l.trim()); return lines.sort((a, b) => mode === "za" ? b.localeCompare(a) : mode === "num-asc" ? Number(a) - Number(b) : mode === "num-desc" ? Number(b) - Number(a) : a.localeCompare(b)).join("\n"); }, [mode, removeEmpty, text]);
  return <div className="space-y-5"><div className="flex flex-wrap gap-3"><Select value={mode} onChange={(e) => setMode(e.target.value)}><option value="az">Alphabetical asc</option><option value="za">Alphabetical desc</option><option value="num-asc">Numeric asc</option><option value="num-desc">Numeric desc</option></Select><label className="text-sm"><input type="checkbox" checked={removeEmpty} onChange={(e) => setRemoveEmpty(e.target.checked)} /> Remove empty lines</label></div><Textarea value={text} onChange={(e) => setText(e.target.value)} /><OutputPanel value={output} /><HowItWorks>Lines are split, optionally filtered, and sorted with localeCompare or numeric comparison.</HowItWorks></div>;
}

function ExtractEmailsUrls() {
  const [text, setText] = useState("Email hello@example.com or visit https://example.com/tools.");
  const emails = Array.from(new Set(text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []));
  const urls = Array.from(new Set(text.match(/https?:\/\/[^\s<>"')]+/gi) ?? []));
  const output = `Emails:\n${emails.join("\n") || "none"}\n\nURLs:\n${urls.join("\n") || "none"}`;
  return <div className="space-y-5"><Textarea value={text} onChange={(e) => setText(e.target.value)} /><OutputPanel value={output} /><HowItWorks>Local regular expressions extract likely emails and HTTP(S) URLs from the text.</HowItWorks></div>;
}

function LoremGenerator() {
  const [unit, setUnit] = useState("paragraphs"), [count, setCount] = useState(3), [output, setOutput] = useState("");
  function generate() { const sentence = () => Array.from({ length: 12 }, (_, i) => loremWords[(i + Math.floor(Math.random() * loremWords.length)) % loremWords.length]).join(" ") + "."; const safe = Math.max(1, Math.min(100, count)); if (unit === "words") setOutput(Array.from({ length: safe }, (_, i) => loremWords[i % loremWords.length]).join(" ")); else if (unit === "sentences") setOutput(Array.from({ length: safe }, sentence).join(" ")); else setOutput(Array.from({ length: safe }, () => Array.from({ length: 4 }, sentence).join(" ")).join("\n\n")); }
  return <div className="space-y-5"><div className="flex gap-2"><Select value={unit} onChange={(e) => setUnit(e.target.value)}><option>paragraphs</option><option>sentences</option><option>words</option></Select><Input className="w-28" type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} /><Button onClick={generate}>Generate</Button></div><OutputPanel value={output} /><HowItWorks>Placeholder copy is generated from a local word list without network requests.</HowItWorks></div>;
}

function MimeViewer() {
  const [info, setInfo] = useState("");
  async function read(files: File[]) { const file = files[0]; if (!file) return; const magic = await detectMagicType(file); setInfo(JSON.stringify({ name: file.name, extension: extensionOf(file.name), browserType: file.type || "unknown", size: `${formatBytes(file.size)} / ${formatBinaryBytes(file.size)}`, lastModified: new Date(file.lastModified).toLocaleString(), magic }, null, 2)); }
  return <div className="space-y-5"><FileDropzone onFiles={read} /><div className="rounded-xl border border-accent/50 bg-accent/10 p-3 text-sm">Browser MIME values can be inaccurate; magic-byte detection is a lightweight hint.</div><OutputPanel value={info} /><HowItWorks>The selected file is read only in the browser, using metadata and the first bytes for type hints.</HowItWorks></div>;
}

function FileSizeConverter() {
  const [bytes, setBytes] = useState("1048576");
  const n = Number(bytes);
  const value = Number.isFinite(n) ? `Decimal:\nB ${n}\nKB ${(n/1000).toFixed(4)}\nMB ${(n/1e6).toFixed(4)}\nGB ${(n/1e9).toFixed(4)}\n\nBinary:\nKiB ${(n/1024).toFixed(4)}\nMiB ${(n/1024**2).toFixed(4)}\nGiB ${(n/1024**3).toFixed(4)}` : "";
  return <div className="space-y-5"><Input value={bytes} onChange={(e) => setBytes(e.target.value)} /><OutputPanel value={value} error={value ? undefined : "Enter a numeric byte value."} /><HowItWorks>Decimal units use powers of 1000. Binary units use powers of 1024.</HowItWorks></div>;
}

function CompareFiles() {
  const [files, setFiles] = useState<File[]>([]);
  const [output, setOutput] = useState("");
  const [textDiff, setTextDiff] = useState("");
  async function compare(next: File[]) { setFiles(next.slice(0, 2)); if (next.length < 2) return; const [a, b] = next; const [ha, hb] = await Promise.all([hashFile(a, "SHA-256"), hashFile(b, "SHA-256")]); setOutput(JSON.stringify({ equal: ha === hb, left: { name: a.name, size: a.size, type: a.type, sha256: ha }, right: { name: b.name, size: b.size, type: b.type, sha256: hb } }, null, 2)); if ((a.type.startsWith("text") || extensionOf(a.name).match(/txt|json|csv|md/)) && (b.type.startsWith("text") || extensionOf(b.name).match(/txt|json|csv|md/))) setTextDiff(diffLines(await a.text(), await b.text()).map((p) => `${p.added ? "+ " : p.removed ? "- " : "  "}${p.value}`).join("")); }
  return <div className="space-y-5"><FileDropzone multiple onFiles={compare} label="Choose two files" />{files.length ? <p className="text-sm text-muted-foreground">{files.map((f) => f.name).join(" vs ")}</p> : null}<OutputPanel value={output} />{textDiff ? <OutputPanel value={textDiff} title="Text diff" /> : null}<HowItWorks>Both files are hashed locally with SHA-256. Text-like files also get a local line diff.</HowItWorks></div>;
}

function BatchRenamePreview() {
  const [files, setFiles] = useState<File[]>([]), [pattern, setPattern] = useState("{index}-{name}.{ext}"), [start, setStart] = useState(1), [padding, setPadding] = useState(2);
  const rows = files.map((file, i) => { const ext = extensionOf(file.name); const base = ext ? file.name.slice(0, -(ext.length + 1)) : file.name; const index = String(start + i).padStart(padding, "0"); const date = new Date(file.lastModified).toISOString().slice(0, 10); return { old: file.name, next: pattern.replaceAll("{name}", base).replaceAll("{ext}", ext).replaceAll("{index}", index).replaceAll("{date}", date) }; });
  const csv = ["old,new", ...rows.map((r) => `"${r.old.replaceAll('"', '""')}","${r.next.replaceAll('"', '""')}"`)].join("\n");
  return <div className="space-y-5"><FileDropzone multiple onFiles={setFiles} /><div className="grid gap-3 md:grid-cols-3"><Input value={pattern} onChange={(e) => setPattern(e.target.value)} /><Input type="number" value={start} onChange={(e) => setStart(Number(e.target.value))} /><Input type="number" value={padding} onChange={(e) => setPadding(Number(e.target.value))} /></div><Button variant="outline" onClick={() => downloadBlob(new Blob([csv], { type: "text/csv" }), "rename-preview.csv")}>Export CSV</Button><OutputPanel value={rows.map((r) => `${r.old} -> ${r.next}`).join("\n")} /><HowItWorks>Browsers cannot rename files on disk here, so this tool only previews names and exports a CSV.</HowItWorks></div>;
}

function ChecksumFile() {
  const [output, setOutput] = useState("");
  async function run(files: File[]) { const lines = await Promise.all(files.map(async (file) => `${await hashFile(file, "SHA-256")}  ${file.name}`)); setOutput(lines.join("\n")); }
  return <div className="space-y-5"><FileDropzone multiple onFiles={run} /><Button variant="outline" onClick={() => downloadBlob(new Blob([output], { type: "text/plain" }), "checksums.sha256.txt")} disabled={!output}><Download className="h-4 w-4" /> Download checksums.sha256.txt</Button><OutputPanel value={output} /><HowItWorks>Each selected file is hashed locally and written in the standard “hash filename” format.</HowItWorks></div>;
}

function ResizeImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [sourceSize, setSourceSize] = useState<{ width: number; height: number } | null>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [keepAspect, setKeepAspect] = useState(true);
  const [format, setFormat] = useState("image/png");
  const [quality, setQuality] = useState(0.9);
  const [output, setOutput] = useState("");

  async function pick(files: File[]) {
    const next = files[0] ?? null;
    setFile(next);
    setOutput("");
    if (!next) return;
    const url = URL.createObjectURL(next);
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not read image."));
      image.src = url;
    });
    URL.revokeObjectURL(url);
    setSourceSize({ width: image.naturalWidth, height: image.naturalHeight });
    setWidth(image.naturalWidth);
    setHeight(image.naturalHeight);
    setPreview(URL.createObjectURL(next));
  }

  function setNextWidth(nextWidth: number) {
    setWidth(nextWidth);
    if (keepAspect && sourceSize) setHeight(Math.max(1, Math.round((nextWidth * sourceSize.height) / sourceSize.width)));
  }

  function setNextHeight(nextHeight: number) {
    setHeight(nextHeight);
    if (keepAspect && sourceSize) setWidth(Math.max(1, Math.round((nextHeight * sourceSize.width) / sourceSize.height)));
  }

  async function process() {
    try {
      if (!file) throw new Error("Choose an image first.");
      const canvas = await canvasFromImage(file, Math.max(1, width), Math.max(1, height));
      const blob = await canvasToBlob(canvas, format, format === "image/png" ? undefined : quality);
      const ext = format.split("/")[1].replace("jpeg", "jpg");
      downloadBlob(blob, `resized-${file.name.replace(/\.[^.]+$/, "")}.${ext}`);
      setOutput(`Original: ${sourceSize?.width}x${sourceSize?.height}, ${formatBytes(file.size)}\nOutput: ${canvas.width}x${canvas.height}, ${formatBytes(blob.size)}`);
      toast.success("Image resized locally.");
    } catch (err) {
      setOutput(err instanceof Error ? err.message : "Resize failed.");
    }
  }

  return <div className="space-y-5"><FileDropzone accept="image/*" onFiles={pick} label="Choose image" />{preview ? <img src={preview} alt="" className="max-h-80 rounded-2xl border object-contain" /> : null}<div className="grid gap-3 md:grid-cols-4"><Field label="Width"><Input type="number" min={1} value={width} onChange={(e) => setNextWidth(Number(e.target.value))} /></Field><Field label="Height"><Input type="number" min={1} value={height} onChange={(e) => setNextHeight(Number(e.target.value))} /></Field><Field label="Format"><Select value={format} onChange={(e) => setFormat(e.target.value)}><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></Select></Field><Field label={`Quality ${Math.round(quality * 100)}%`}><Input type="range" min="0.1" max="1" step="0.01" value={quality} disabled={format === "image/png"} onChange={(e) => setQuality(Number(e.target.value))} /></Field></div><label className="text-sm"><input type="checkbox" checked={keepAspect} onChange={(e) => setKeepAspect(e.target.checked)} /> Keep aspect ratio</label><Button onClick={process}>Resize and download</Button><OutputPanel value={output} /><HowItWorks>The selected image is drawn to a resized Canvas and exported locally as PNG, JPEG, or WebP.</HowItWorks></div>;
}

function ConvertImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [format, setFormat] = useState("image/webp");
  const [quality, setQuality] = useState(0.9);
  const [output, setOutput] = useState("");

  function pick(files: File[]) {
    const next = files[0] ?? null;
    setFile(next);
    setOutput("");
    setPreview(next ? URL.createObjectURL(next) : "");
  }

  async function process() {
    try {
      if (!file) throw new Error("Choose an image first.");
      const canvas = await canvasFromImage(file);
      const blob = await canvasToBlob(canvas, format, format === "image/png" ? undefined : quality);
      const ext = format.split("/")[1].replace("jpeg", "jpg");
      downloadBlob(blob, `converted-${file.name.replace(/\.[^.]+$/, "")}.${ext}`);
      setOutput(`Original: ${file.type || "unknown"}, ${formatBytes(file.size)}\nOutput: ${format}, ${formatBytes(blob.size)}`);
      toast.success("Image converted locally.");
    } catch (err) {
      setOutput(err instanceof Error ? err.message : "Conversion failed.");
    }
  }

  return <div className="space-y-5"><FileDropzone accept="image/*" onFiles={pick} label="Choose image" />{preview ? <img src={preview} alt="" className="max-h-80 rounded-2xl border object-contain" /> : null}<div className="grid gap-3 md:grid-cols-2"><Field label="Output format"><Select value={format} onChange={(e) => setFormat(e.target.value)}><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></Select></Field><Field label={`Quality ${Math.round(quality * 100)}%`}><Input type="range" min="0.1" max="1" step="0.01" value={quality} disabled={format === "image/png"} onChange={(e) => setQuality(Number(e.target.value))} /></Field></div><Button onClick={process}>Convert and download</Button><OutputPanel value={output} /><HowItWorks>The browser decodes the image into Canvas and re-encodes it into the selected output format.</HowItWorks></div>;
}

function PlaceholderGenerator() {
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(630);
  const [bg, setBg] = useState("#e2e8f0");
  const [fg, setFg] = useState("#0f172a");
  const [text, setText] = useState("isMoreTools");
  const [format, setFormat] = useState("png");
  const [output, setOutput] = useState("");

  async function generate() {
    const safeWidth = Math.max(1, width);
    const safeHeight = Math.max(1, height);
    const fontSize = Math.max(16, Math.floor(Math.min(safeWidth, safeHeight) / 8));
    if (format === "svg") {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${safeWidth}" height="${safeHeight}" viewBox="0 0 ${safeWidth} ${safeHeight}"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${fg}" font-family="Arial, sans-serif" font-size="${fontSize}">${text}</text></svg>`;
      downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "placeholder.svg");
      setOutput(svg);
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = safeWidth;
    canvas.height = safeHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setOutput("Canvas is not available.");
      return;
    }
    context.fillStyle = bg;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = fg;
    context.font = `${fontSize}px Arial, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, canvas.height / 2, canvas.width - 32);
    const blob = await canvasToBlob(canvas, "image/png");
    downloadBlob(blob, "placeholder.png");
    setOutput(`Generated PNG placeholder: ${safeWidth}x${safeHeight}, ${formatBytes(blob.size)}.`);
  }

  return <div className="space-y-5"><div className="grid gap-3 md:grid-cols-3"><Field label="Width"><Input type="number" min={1} value={width} onChange={(e) => setWidth(Number(e.target.value))} /></Field><Field label="Height"><Input type="number" min={1} value={height} onChange={(e) => setHeight(Number(e.target.value))} /></Field><Field label="Format"><Select value={format} onChange={(e) => setFormat(e.target.value)}><option value="png">PNG</option><option value="svg">SVG</option></Select></Field><Field label="Background"><Input value={bg} onChange={(e) => setBg(e.target.value)} /></Field><Field label="Text color"><Input value={fg} onChange={(e) => setFg(e.target.value)} /></Field><Field label="Text"><Input value={text} onChange={(e) => setText(e.target.value)} /></Field></div><Button onClick={generate}>Generate and download</Button><OutputPanel value={output} /><HowItWorks>The placeholder is generated locally with Canvas for PNG or a safe inline SVG string for SVG.</HowItWorks></div>;
}

function PlannedTool() {
  return <div className="rounded-2xl border border-dashed bg-muted/30 p-10 text-center"><h2 className="text-xl font-semibold">Planned tool</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">This tool is already in the catalog with route, metadata, privacy note, and page structure. The full local implementation is intentionally deferred.</p></div>;
}

function CropImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [aspect, setAspect] = useState("free");
  const [format, setFormat] = useState("image/png");
  const [quality, setQuality] = useState(0.9);
  const [output, setOutput] = useState("");

  async function pick(files: File[]) {
    const next = files[0] ?? null;
    setFile(next);
    setOutput("");
    if (!next) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(next);
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not read image."));
      image.src = url;
    });
    URL.revokeObjectURL(url);
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    setNatural({ width: image.naturalWidth, height: image.naturalHeight });
    setX(Math.floor((image.naturalWidth - side) / 2));
    setY(Math.floor((image.naturalHeight - side) / 2));
    setWidth(side);
    setHeight(side);
    setPreview(URL.createObjectURL(next));
  }

  function applyAspect(nextAspect: string) {
    setAspect(nextAspect);
    if (!natural.width || nextAspect === "free") return;
    const ratio = nextAspect === "1:1" ? 1 : nextAspect === "16:9" ? 16 / 9 : 4 / 3;
    const maxWidth = natural.width - x;
    const maxHeight = natural.height - y;
    let nextWidth = maxWidth;
    let nextHeight = Math.round(nextWidth / ratio);
    if (nextHeight > maxHeight) {
      nextHeight = maxHeight;
      nextWidth = Math.round(nextHeight * ratio);
    }
    setWidth(Math.max(1, nextWidth));
    setHeight(Math.max(1, nextHeight));
  }

  async function crop() {
    try {
      if (!file) throw new Error("Choose an image first.");
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.onerror = () => reject(new Error("Could not read image."));
        img.src = url;
      });
      const sx = Math.max(0, Math.min(x, image.naturalWidth - 1));
      const sy = Math.max(0, Math.min(y, image.naturalHeight - 1));
      const sw = Math.max(1, Math.min(width, image.naturalWidth - sx));
      const sh = Math.max(1, Math.min(height, image.naturalHeight - sy));
      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is not available.");
      context.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
      const blob = await canvasToBlob(canvas, format, format === "image/png" ? undefined : quality);
      const ext = format.split("/")[1].replace("jpeg", "jpg");
      downloadBlob(blob, `cropped-${file.name.replace(/\.[^.]+$/, "")}.${ext}`);
      setOutput(`Crop: x=${sx}, y=${sy}, ${sw}x${sh}\nOutput: ${format}, ${formatBytes(blob.size)}`);
      toast.success("Image cropped locally.");
    } catch (err) {
      setOutput(err instanceof Error ? err.message : "Crop failed.");
    }
  }

  return <div className="space-y-5"><FileDropzone accept="image/*" onFiles={pick} label="Choose image" />{preview ? <img src={preview} alt="" className="max-h-80 rounded-2xl border object-contain" /> : null}{natural.width ? <p className="text-sm text-muted-foreground">Source: {natural.width}x{natural.height}. Enter crop coordinates in source pixels.</p> : null}<div className="grid gap-3 md:grid-cols-4"><Field label="X"><Input type="number" min={0} value={x} onChange={(e) => setX(Number(e.target.value))} /></Field><Field label="Y"><Input type="number" min={0} value={y} onChange={(e) => setY(Number(e.target.value))} /></Field><Field label="Width"><Input type="number" min={1} value={width} onChange={(e) => setWidth(Number(e.target.value))} /></Field><Field label="Height"><Input type="number" min={1} value={height} onChange={(e) => setHeight(Number(e.target.value))} /></Field><Field label="Aspect"><Select value={aspect} onChange={(e) => applyAspect(e.target.value)}><option value="free">Free</option><option value="1:1">1:1</option><option value="16:9">16:9</option><option value="4:3">4:3</option></Select></Field><Field label="Format"><Select value={format} onChange={(e) => setFormat(e.target.value)}><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></Select></Field><Field label={`Quality ${Math.round(quality * 100)}%`}><Input type="range" min="0.1" max="1" step="0.01" value={quality} disabled={format === "image/png"} onChange={(e) => setQuality(Number(e.target.value))} /></Field></div><Button onClick={crop}>Crop and download</Button><OutputPanel value={output} /><HowItWorks>The image is loaded locally, the selected source rectangle is drawn to Canvas, and the crop is exported as a local Blob download.</HowItWorks></div>;
}

function ImageTool({ mode }: { mode: "resize" | "compress" | "convert" | "metadata" | "favicon" | "palette" | "placeholder" | "crop" }) {
  const [file, setFile] = useState<File | null>(null), [preview, setPreview] = useState(""), [output, setOutput] = useState(""), [width, setWidth] = useState(512), [height, setHeight] = useState(512), [quality, setQuality] = useState(0.82), [format, setFormat] = useState("image/png"), [bg, setBg] = useState("#e2e8f0"), [fg, setFg] = useState("#0f172a"), [text, setText] = useState("512 × 512");
  const fileUrl = useObjectUrl(file);
  async function pick(files: File[]) { const next = files[0] ?? null; setFile(next); setPreview(next ? URL.createObjectURL(next) : ""); setOutput(""); }
  async function drawBase() { if (!file) throw new Error("Choose an image first."); return canvasFromImage(file, width, height); }
  async function run() {
    try {
      if (mode === "compress" && file) { const blob = await imageCompression(file, { maxSizeMB: 1, initialQuality: quality, useWebWorker: true }); setOutput(`Original: ${formatBytes(file.size)}\nOutput: ${formatBytes(blob.size)}`); downloadBlob(blob, `compressed-${file.name}`); return; }
      if (mode === "metadata" && file) { const tags = await exifr.parse(file).catch(() => null) as KV | null; const canvas = await canvasFromImage(file); const blob = await canvasToBlob(canvas, file.type || "image/png", quality); setOutput(JSON.stringify({ exif: tags ?? "No EXIF found or unsupported.", cleanedSize: formatBytes(blob.size), note: "Canvas re-encode usually removes metadata, but may not preserve every color profile." }, null, 2)); downloadBlob(blob, `cleaned-${file.name}`); return; }
      if (mode === "favicon" && file) { const sizes = [16, 32, 48, 180, 192, 512]; for (const size of sizes) { const canvas = await canvasFromImage(file, size, size); downloadBlob(await canvasToBlob(canvas, "image/png"), `favicon-${size}x${size}.png`); } setOutput(sizes.map((s) => `<link rel="icon" sizes="${s}x${s}" href="/favicon-${s}x${s}.png">`).join("\n")); return; }
      if (mode === "palette" && file) { const canvas = await canvasFromImage(file, 120, 120); const ctx = canvas.getContext("2d"); if (!ctx) return; const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data; const buckets = new Map<string, number>(); for (let i = 0; i < data.length; i += 64) { const r = Math.round(data[i] / 32) * 32, g = Math.round(data[i+1] / 32) * 32, b = Math.round(data[i+2] / 32) * 32; const hex = hexFromRgb(Math.min(r,255), Math.min(g,255), Math.min(b,255)); buckets.set(hex, (buckets.get(hex) ?? 0) + 1); } setOutput(Array.from(buckets.entries()).sort((a,b) => b[1]-a[1]).slice(0, 12).map(([hex]) => hex).join("\n")); return; }
      if (mode === "placeholder") { const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height; const ctx = canvas.getContext("2d"); if (!ctx) return; ctx.fillStyle = bg; ctx.fillRect(0,0,width,height); ctx.fillStyle = fg; ctx.font = `${Math.max(18, Math.floor(width/12))}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, width/2, height/2); if (format === "image/svg+xml") { const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${fg}" font-family="sans-serif" font-size="${Math.max(18, Math.floor(width/12))}">${text}</text></svg>`; downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "placeholder.svg"); setOutput(svg); return; } downloadBlob(await canvasToBlob(canvas, "image/png"), "placeholder.png"); setOutput("Generated placeholder image."); return; }
      const canvas = await drawBase(); await exportCanvas(canvas, format, `output.${format.split("/")[1]}`, quality); setOutput(`Exported ${canvas.width}x${canvas.height} as ${format}.`);
    } catch (err) { setOutput(err instanceof Error ? err.message : "Image operation failed."); }
  }
  return <div className="space-y-5"><FileDropzone accept="image/*" onFiles={pick} label={mode === "placeholder" ? "Optional image not required" : "Choose image"} />{preview || fileUrl ? <img src={preview || fileUrl} alt="" className="max-h-80 rounded-2xl border object-contain" /> : null}<div className="grid gap-3 md:grid-cols-4"><Input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} placeholder="Width" /><Input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} placeholder="Height" /><Select value={format} onChange={(e) => setFormat(e.target.value)}><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option>{mode === "placeholder" ? <option value="image/svg+xml">SVG</option> : null}</Select><Input type="range" min="0.1" max="1" step="0.01" value={quality} onChange={(e) => setQuality(Number(e.target.value))} /></div>{mode === "placeholder" ? <div className="grid gap-3 md:grid-cols-3"><Input value={bg} onChange={(e) => setBg(e.target.value)} /><Input value={fg} onChange={(e) => setFg(e.target.value)} /><Input value={text} onChange={(e) => setText(e.target.value)} /></div> : null}<Button onClick={run}>{mode === "palette" ? "Extract" : "Process"}</Button>{mode === "compress" ? <p className="text-sm text-muted-foreground">PNG canvas re-encoding does not always reduce file size.</p> : null}{mode === "crop" ? <p className="text-sm text-muted-foreground">Basic crop exports a resized center crop. Full drag UI can be extended with react-easy-crop.</p> : null}<OutputPanel value={output} /><HowItWorks>Images are decoded into canvas or processed by browser-image-compression. Downloads are generated from local Blob URLs.</HowItWorks></div>;
}

export function ToolImplementation({ slug }: ToolProps) {
  if (!implementedSlugs.has(slug)) return <PlannedTool />;

  switch (slug) {
    case "json-formatter": return <JsonFormatter />;
    case "json-validator": return <JsonValidator />;
    case "yaml-formatter": return <YamlFormatter />;
    case "yaml-json-converter": return <YamlJsonConverter />;
    case "url-parser": return <UrlParser />;
    case "timestamp-converter": return <TimestampConverter />;
    case "base64": return <Base64Tool />;
    case "hash-generator": return <HashGenerator />;
    case "file-checksum": return <HashGenerator fileOnly />;
    case "jwt-decoder": return <JwtDecoder />;
    case "jwt-encoder": return <JwtEncoder />;
    case "uuid-generator": return <UuidGenerator />;
    case "regex-tester": return <RegexTester />;
    case "regex-builder": return <RegexBuilder />;
    case "markdown-preview": return <MarkdownPreview />;
    case "rich-text-to-markdown": return <RichTextToMarkdown />;
    case "diff-checker": return <DiffTool />;
    case "word-counter": return <WordCounter />;
    case "clean-extra-spaces": return <CleanSpaces />;
    case "change-case": return <ChangeCaseTool />;
    case "transliteration": return <TransliterationTool />;
    case "slug-generator": return <TransliterationTool slugOnly />;
    case "remove-duplicate-lines": return <DuplicateLines />;
    case "sort-lines": return <SortLines />;
    case "extract-emails-urls": return <ExtractEmailsUrls />;
    case "lorem-ipsum": return <LoremGenerator />;
    case "mime-type-viewer": return <MimeViewer />;
    case "compare-files": return <CompareFiles />;
    case "batch-rename-preview": return <BatchRenamePreview />;
    case "generate-checksum-file": return <ChecksumFile />;
    case "resize-images": return <ResizeImageTool />;
    case "compress-images": return <ImageTool mode="compress" />;
    case "convert-images": return <ConvertImageTool />;
    case "crop-image": return <CropImageTool />;
    case "remove-image-metadata": return <ImageTool mode="metadata" />;
    case "favicon-generator": return <ImageTool mode="favicon" />;
    case "extract-color-palette": return <ImageTool mode="palette" />;
    case "placeholder-generator": return <PlaceholderGenerator />;
    default: return <PlannedTool />;
  }
}
