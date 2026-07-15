import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export type ExtractResult = {
  summary: string;
  entities: { type: string; value: string }[];
  key_facts: string[];
  category: string;
};

export async function extractWithAI(
  text: string,
  url: string
): Promise<ExtractResult> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system:
      "You are a structured data extractor. Given selected text from a webpage, extract key information as JSON. Always respond with valid JSON only, no markdown.",
    messages: [
      {
        role: "user",
        content: `Extract structured data from this selected text. Page URL: ${url}\n\nSelected text:\n${text}\n\nRespond with JSON matching this shape exactly:\n{\n  "summary": "one sentence summary",\n  "entities": [{"type": "person|org|product|date|price|location", "value": "..."}],\n  "key_facts": ["fact1", "fact2"],\n  "category": "article|product|person|code|other"\n}`,
      },
    ],
  });

  const raw = message.content[0];
  if (raw.type !== "text") throw new Error("Unexpected response type");

  return JSON.parse(raw.text) as ExtractResult;
}
