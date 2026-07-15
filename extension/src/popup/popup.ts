const SERVER = "http://localhost:3579";

type ExtractResult = {
  summary: string;
  entities: { type: string; value: string }[];
  key_facts: string[];
  category: string;
};

type Extraction = {
  id: number;
  url: string;
  page_title: string;
  selected_text: string;
  result: ExtractResult;
  created_at: string;
};

async function load() {
  const list = document.getElementById("list")!;
  const countEl = document.getElementById("count")!;

  let rows: Extraction[] = [];
  try {
    const res = await fetch(`${SERVER}/api/extractions`);
    rows = (await res.json()) as Extraction[];
  } catch {
    list.innerHTML = `<div id="empty">Could not reach server.<br>Make sure it's running on port 3579.</div>`;
    return;
  }

  countEl.textContent = `${rows.length} saved`;

  if (!rows.length) {
    list.innerHTML = `<div id="empty">No extractions yet.<br>Select text on any page, right-click → Extract with AI.</div>`;
    return;
  }

  list.innerHTML = "";

  for (const row of rows) {
    const item = document.createElement("div");
    item.className = "item";

    const host = (() => {
      try {
        return new URL(row.url).hostname;
      } catch {
        return row.url;
      }
    })();

    const tags = [
      row.result.category,
      ...row.result.entities.slice(0, 3).map((e) => e.value),
    ]
      .filter(Boolean)
      .map((t) => `<span class="tag">${t}</span>`)
      .join("");

    item.innerHTML = `
      <span class="delete" data-id="${row.id}" title="Delete">×</span>
      <div class="url">${host} — ${row.page_title || "Untitled"}</div>
      <div class="summary">${row.result.summary}</div>
      <div class="tags">${tags}</div>
    `;

    item.querySelector(".delete")!.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = (e.target as HTMLElement).dataset.id!;
      await fetch(`${SERVER}/api/extractions/${id}`, { method: "DELETE" });
      item.remove();
      const remaining = list.querySelectorAll(".item").length;
      countEl.textContent = `${remaining} saved`;
      if (!remaining) {
        list.innerHTML = `<div id="empty">No extractions yet.</div>`;
      }
    });

    list.appendChild(item);
  }
}

load();
