import { describe, expect, it } from "vitest";
import { analyzeText, changeCase, toSlug, transliterate } from "@/lib/tools/text";

describe("transliterate", () => {
  it("maps Cyrillic to Latin and preserves punctuation", () => {
    expect(transliterate("Привет, мир!")).toBe("Privet, mir!");
  });

  it("uppercases multi-letter mappings correctly", () => {
    expect(transliterate("Ёж")).toBe("Yozh");
  });

  it("leaves Latin text untouched", () => {
    expect(transliterate("Already latin 123")).toBe("Already latin 123");
  });
});

describe("toSlug", () => {
  it("slugifies Latin text", () => {
    expect(toSlug("Hello World!")).toBe("hello-world");
  });

  it("transliterates Cyrillic before slugifying", () => {
    expect(toSlug("Привет мир")).toBe("privet-mir");
  });

  it("strips leading, trailing, and repeated separators", () => {
    expect(toSlug("  --Multiple   Spaces--  ")).toBe("multiple-spaces");
  });
});

describe("changeCase", () => {
  it("supports the documented modes", () => {
    expect(changeCase("hello world", "title")).toBe("Hello World");
    expect(changeCase("hello world", "camel")).toBe("helloWorld");
    expect(changeCase("hello world", "pascal")).toBe("HelloWorld");
    expect(changeCase("hello world", "kebab")).toBe("hello-world");
    expect(changeCase("Hello World", "snake")).toBe("hello_world");
  });

  it("handles lowercase, uppercase, and sentence modes", () => {
    expect(changeCase("HELLO", "lowercase")).toBe("hello");
    expect(changeCase("hello", "uppercase")).toBe("HELLO");
    expect(changeCase("hello world. foo bar", "sentence")).toBe("Hello world. Foo bar");
  });

  it("transliterates words for naming modes", () => {
    expect(changeCase("Привет мир", "kebab")).toBe("privet-mir");
  });

  it("returns the input for unknown modes", () => {
    expect(changeCase("hello", "unknown")).toBe("hello");
  });
});

describe("analyzeText", () => {
  it("counts characters, words, lines, paragraphs, and sentences", () => {
    const result = analyzeText("Hello world");
    expect(result).toMatchObject({
      chars: 11,
      charsNoSpaces: 10,
      words: 2,
      lines: 1,
      paragraphs: 1,
      sentences: 1,
      readingTime: 1
    });
  });

  it("handles empty input", () => {
    expect(analyzeText("")).toMatchObject({
      chars: 0,
      words: 0,
      lines: 0,
      paragraphs: 0,
      sentences: 0,
      readingTime: 1
    });
  });

  it("counts blank-line separated paragraphs", () => {
    const result = analyzeText("one\ntwo\n\nthree");
    expect(result).toMatchObject({ words: 3, lines: 4, paragraphs: 2 });
  });
});
