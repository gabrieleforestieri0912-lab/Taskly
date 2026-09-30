/**
 * Unico provider AI di Taskly: xKiro (OpenAI-compatible).
 * Docs: https://docs.xkiro.com/guides/quickstart/
 * Endpoint: POST {XKIRO_BASE_URL}/chat/completions
 * Auth: Authorization: Bearer {XKIRO_API_KEY}
 */

export const XKIRO_BASE_URL =
  process.env.XKIRO_BASE_URL || "https://api.xkiro.com/v1";

export const XKIRO_CHAT_MODEL =
  process.env.XKIRO_CHAT_MODEL || "mistralai/mistral-medium-3.5";

function getApiKey(): string {
  const key = (process.env.XKIRO_API_KEY || "").trim();
  if (!key) throw new Error("Missing XKIRO_API_KEY");
  return key;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionsResponse {
  choices?: Array<{
    message?: { content?: string };
  }>;
}

/** Chat completion singola via xKiro, con timeout (default 60s, max consigliato <95s). */
export async function xkiroChat(
  messages: ChatMessage[],
  opts?: { model?: string; temperature?: number; maxTokens?: number; timeoutMs?: number },
): Promise<string> {
  const apiKey = getApiKey();
  const baseUrl = XKIRO_BASE_URL.replace(/\/+$/, "");
  const model = opts?.model || XKIRO_CHAT_MODEL;
  const timeoutMs = opts?.timeoutMs ?? 60000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        ...(opts?.temperature !== undefined ? { temperature: opts.temperature } : {}),
        ...(opts?.maxTokens !== undefined ? { max_tokens: opts.maxTokens } : {}),
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`xKiro ${res.status}: ${text.slice(0, 300)}`);
    }
    const json = (await res.json()) as ChatCompletionsResponse;
    const content = json?.choices?.[0]?.message?.content?.trim() || "";
    if (!content) throw new Error("Empty xKiro response");
    return content;
  } finally {
    clearTimeout(timer);
  }
}
