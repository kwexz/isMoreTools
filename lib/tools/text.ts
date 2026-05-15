const cyrillicMap: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i", й: "y",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya"
};

export function transliterate(input: string) {
  return input
    .split("")
    .map((char) => {
      const lower = char.toLowerCase();
      const mapped = cyrillicMap[lower];
      if (mapped === undefined) return char;
      return char === lower ? mapped : mapped.charAt(0).toUpperCase() + mapped.slice(1);
    })
    .join("");
}

export function toSlug(input: string) {
  return transliterate(input)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function words(input: string) {
  return transliterate(input).match(/[A-Za-z0-9]+/g) ?? [];
}

export function changeCase(input: string, mode: string) {
  const tokens = words(input);
  const lower = tokens.map((token) => token.toLowerCase());
  const cap = (token: string) => token.charAt(0).toUpperCase() + token.slice(1);
  switch (mode) {
    case "lowercase":
      return input.toLowerCase();
    case "uppercase":
      return input.toUpperCase();
    case "title":
      return lower.map(cap).join(" ");
    case "sentence":
      return input.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (match) => match.toUpperCase());
    case "camel":
      return lower.map((token, index) => (index === 0 ? token : cap(token))).join("");
    case "pascal":
      return lower.map(cap).join("");
    case "kebab":
      return lower.join("-");
    case "snake":
      return lower.join("_");
    default:
      return input;
  }
}

export function analyzeText(input: string) {
  const wordMatches = input.trim().match(/\S+/g) ?? [];
  const lines = input ? input.split(/\r\n|\r|\n/).length : 0;
  const paragraphs = input.trim() ? input.trim().split(/\n\s*\n/).length : 0;
  const sentences = input.trim() ? (input.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? []).length : 0;
  return {
    chars: input.length,
    charsNoSpaces: input.replace(/\s/g, "").length,
    words: wordMatches.length,
    lines,
    paragraphs,
    sentences,
    readingTime: Math.max(1, Math.ceil(wordMatches.length / 220))
  };
}
