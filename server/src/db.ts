import { Database } from "bun:sqlite";

const db = new Database("scraper.db", { create: true });

db.exec(`
  CREATE TABLE IF NOT EXISTS extractions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    page_title TEXT NOT NULL,
    selected_text TEXT NOT NULL,
    result TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

export type Extraction = {
  id: number;
  url: string;
  page_title: string;
  selected_text: string;
  result: string;
  created_at: string;
};

export const insertExtraction = db.prepare<
  Extraction,
  [string, string, string, string]
>(
  "INSERT INTO extractions (url, page_title, selected_text, result) VALUES (?, ?, ?, ?) RETURNING *"
);

export const listExtractions = db.prepare<Extraction, []>(
  "SELECT * FROM extractions ORDER BY created_at DESC LIMIT 50"
);

export const deleteExtraction = db.prepare<Extraction, [number]>(
  "DELETE FROM extractions WHERE id = ?"
);

export default db;
