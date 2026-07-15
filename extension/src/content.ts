type ExtractResult = {
  summary: string;
  entities: { type: string; value: string }[];
  key_facts: string[];
  category: string;
};

type Message =
  | { type: "AI_SCRAPER_LOADING" }
  | { type: "AI_SCRAPER_DONE"; result: ExtractResult }
  | { type: "AI_SCRAPER_ERROR"; message: string };

function createToast(): HTMLElement {
  const el = document.createElement("div");
  el.id = "ai-scraper-toast";
  Object.assign(el.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    zIndex: "2147483647",
    background: "#18181b",
    color: "#fff",
    padding: "14px 18px",
    borderRadius: "10px",
    fontFamily: "system-ui, sans-serif",
    fontSize: "14px",
    maxWidth: "360px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
    lineHeight: "1.5",
    transition: "opacity 0.2s",
  });
  document.body.appendChild(el);
  return el;
}

function getOrCreateToast(): HTMLElement {
  return (
    (document.getElementById("ai-scraper-toast") as HTMLElement) ??
    createToast()
  );
}

function hideToast(toast: HTMLElement, delay = 4000) {
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 200);
  }, delay);
}

window.addEventListener("message", (e) => {
  if (e.source !== window) return;
  const msg = e.data as Message;
  if (!msg?.type?.startsWith("AI_SCRAPER_")) return;

  const toast = getOrCreateToast();

  if (msg.type === "AI_SCRAPER_LOADING") {
    toast.style.opacity = "1";
    toast.innerHTML = `<b>AI Scraper</b><br>Extracting…`;
    return;
  }

  if (msg.type === "AI_SCRAPER_ERROR") {
    toast.innerHTML = `<b>AI Scraper — Error</b><br>${msg.message}`;
    hideToast(toast, 5000);
    return;
  }

  if (msg.type === "AI_SCRAPER_DONE") {
    const { summary, entities, key_facts, category } = msg.result;
    const entityLines = entities
      .slice(0, 4)
      .map((e) => `<span style="opacity:.6">${e.type}</span> ${e.value}`)
      .join("<br>");
    toast.innerHTML = `
      <b>AI Scraper</b> <span style="opacity:.5;font-size:12px">${category}</span><br>
      ${summary}<br><br>
      ${entityLines}
      ${key_facts.length ? `<br><br><b>Facts</b><br>${key_facts.slice(0, 3).map((f) => `• ${f}`).join("<br>")}` : ""}
    `.trim();
    hideToast(toast, 6000);
  }
});
