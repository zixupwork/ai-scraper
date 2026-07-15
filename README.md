# AI Scraper

Select any text on a webpage, right-click, and instantly extract structured data using Claude AI. Results are saved locally and browsable from the extension popup.

![Chrome Extension](https://img.shields.io/badge/Chrome-MV3-4285F4?logo=googlechrome&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-1.3-fbf0df?logo=bun&logoColor=black)
![Hono](https://img.shields.io/badge/Hono-4-E36002)

## How it works

1. Select any text on any page
2. Right-click → **Extract with AI**
3. A toast shows the extracted summary, entities, and key facts
4. Open the extension popup to browse all saved extractions

The extension calls a local Hono server which sends the text to Claude and stores the result in SQLite.

## Stack

| Layer | Tech |
|---|---|
| Extension | Chrome MV3, TypeScript, Bun build |
| Backend | Bun, Hono, `bun:sqlite` |
| AI | Claude (`claude-sonnet-4-6`) via Anthropic SDK |

## Project structure

```
ai-scraper/
├── extension/
│   ├── manifest.json
│   └── src/
│       ├── background.ts   # context menu → server call
│       ├── content.ts      # in-page toast notification
│       └── popup/
│           ├── popup.html
│           └── popup.ts    # list saved extractions
└── server/
    └── src/
        ├── index.ts        # Hono routes
        ├── db.ts           # SQLite schema + queries
        └── extract.ts      # Claude API call
```

## Setup

**Requirements:** [Bun](https://bun.sh), [Anthropic API key](https://console.anthropic.com)

```bash
git clone https://github.com/zixupwork/ai-scraper
cd ai-scraper
bun install

cp .env.example .env
# add your ANTHROPIC_API_KEY
```

**Run the server:**

```bash
cd server
bun dev
# running on http://localhost:3579
```

**Load the extension:**

```bash
cd extension
bun run build
```

Then open `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select the `extension/` folder.

## API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/extract` | Extract structured data from text |
| `GET` | `/api/extractions` | List all saved extractions |
| `DELETE` | `/api/extractions/:id` | Delete one extraction |

**POST `/api/extract` body:**
```json
{
  "text": "selected text",
  "url": "https://...",
  "title": "Page title"
}
```

**Response:**
```json
{
  "id": 1,
  "result": {
    "summary": "one sentence summary",
    "entities": [{ "type": "person", "value": "..." }],
    "key_facts": ["..."],
    "category": "article"
  }
}
```

## License

MIT
