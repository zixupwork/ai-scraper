const SERVER = "http://localhost:3579";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "ai-extract",
    title: "Extract with AI",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "ai-extract" || !info.selectionText || !tab?.id) {
    return;
  }

  const tabId = tab.id;

  // Show loading state in the page
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => window.postMessage({ type: "AI_SCRAPER_LOADING" }, "*"),
  });

  try {
    const res = await fetch(`${SERVER}/api/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: info.selectionText,
        url: tab.url ?? "",
        title: tab.title ?? "",
      }),
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = (await res.json()) as { id: number; result: unknown };

    await chrome.scripting.executeScript({
      target: { tabId },
      func: (result) =>
        window.postMessage({ type: "AI_SCRAPER_DONE", result }, "*"),
      args: [data.result],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (msg) =>
        window.postMessage({ type: "AI_SCRAPER_ERROR", message: msg }, "*"),
      args: [message],
    });
  }
});
