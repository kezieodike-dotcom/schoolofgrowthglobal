/**
 * Shared client for the Growth AI endpoints exposed by server.ts.
 *
 * Every view used to call fetch() directly and read `data.reply` without
 * checking res.ok. A 404/500 still parses as JSON, so `data.reply` came back
 * undefined and each caller substituted invented advice — the UI looked like a
 * working assistant while the backend was failing. Route calls through here so
 * a failure always surfaces as a failure.
 */

export type ChatSender = 'user' | 'assistant';

export interface ChatMessage {
  sender: ChatSender;
  text: string;
  /** True when the server answered from its no-API-key fallback, not the model. */
  simulated?: boolean;
  /** True when this message is an error notice rather than assistant output. */
  failed?: boolean;
}

export interface AskResult {
  reply: string;
  simulated: boolean;
}

/** Turns sent as context. Keeps the prompt bounded on long conversations. */
const MAX_HISTORY_TURNS = 12;

export class GrowthAIError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'GrowthAIError';
    this.status = status;
  }
}

async function postJSON(path: string, body: unknown): Promise<any> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new GrowthAIError(
      'Could not reach the Growth AI server. Is the dev server running?'
    );
  }

  const raw = await res.text();
  let data: any = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      throw new GrowthAIError(
        `Growth AI returned a non-JSON response (HTTP ${res.status}). ` +
          'This usually means another app is serving this port.',
        res.status
      );
    }
  }

  if (!res.ok) {
    const detail = data?.details || data?.error || `HTTP ${res.status}`;
    throw new GrowthAIError(String(detail), res.status);
  }

  return data ?? {};
}

/** Recent turns in the shape server.ts expects, oldest first. */
function toHistoryPayload(history: ChatMessage[] = []) {
  return history
    .filter(m => !m.failed)
    .slice(-MAX_HISTORY_TURNS)
    .map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      content: m.text,
    }));
}

export async function askGrowthAI(opts: {
  message: string;
  context?: string;
  history?: ChatMessage[];
}): Promise<AskResult> {
  const data = await postJSON('/api/ai/chat', {
    message: opts.message,
    context: opts.context,
    history: toHistoryPayload(opts.history),
  });

  if (typeof data.reply !== 'string' || !data.reply.trim()) {
    throw new GrowthAIError('Growth AI returned an empty reply.');
  }

  return { reply: data.reply, simulated: Boolean(data.simulated) };
}

export async function generateScenario(opts: {
  topic: string;
  difficulty?: string;
}): Promise<{ scenario: any; simulated: boolean }> {
  const data = await postJSON('/api/ai/scenario', opts);
  if (!data.scenario) throw new GrowthAIError('Growth AI returned no scenario.');
  return { scenario: data.scenario, simulated: Boolean(data.simulated) };
}

export async function analyzeStrategy(
  strategyText: string
): Promise<{ analysis: any; simulated: boolean }> {
  const data = await postJSON('/api/ai/analyze', { strategyText });
  if (!data.analysis) throw new GrowthAIError('Growth AI returned no analysis.');
  return { analysis: data.analysis, simulated: Boolean(data.simulated) };
}

/** User-facing text for a failed call. Never fabricates advice. */
export function describeError(err: unknown): string {
  if (err instanceof GrowthAIError) return `Growth AI is unavailable — ${err.message}`;
  return 'Growth AI is unavailable — an unexpected error occurred.';
}
