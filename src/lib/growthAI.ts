/// <reference types="vite/client" />
/**
 * Shared client for the Growth AI endpoints exposed by server.ts.
 *
 * Every view used to call fetch() directly and read `data.reply` without
 * checking res.ok. A 404/500 still parses as JSON, so `data.reply` came back
 * undefined and each caller substituted invented advice - the UI looked like a
 * working assistant while the backend was failing. Route calls through here so
 * a failure always surfaces as a failure.
 *
 * Error text is written for the learner reading it, not the developer
 * debugging it. Diagnostics - provider messages, HTTP status, port hints - go
 * to the console and the server log. Only the dev build puts them on screen.
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

/** False in a production build, so dev-only hints never ship. */
const DEV = import.meta.env.DEV;

/** Shown whenever we have nothing safe and specific to say. */
const GENERIC_FAILURE =
  'Growth AI is temporarily unavailable. Please try again in a moment.';

/** Diagnostics belong in the console, never in a chat bubble. */
function logDiagnostic(context: string, detail: unknown) {
  if (detail) console.error(`[Growth AI] ${context}:`, detail);
}

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
  } catch (err) {
    logDiagnostic(`${path} - network request failed`, err);
    throw new GrowthAIError(
      DEV
        ? 'Growth AI is unreachable - the dev server did not respond. Is it running on the expected port?'
        : GENERIC_FAILURE
    );
  }

  const raw = await res.text();
  let data: any = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      logDiagnostic(
        `${path} - expected JSON, got HTTP ${res.status}`,
        raw.slice(0, 200)
      );
      throw new GrowthAIError(
        DEV
          ? `Growth AI returned a non-JSON response (HTTP ${res.status}). ` +
            'This usually means another app is serving this port.'
          : GENERIC_FAILURE,
        res.status
      );
    }
  }

  if (!res.ok) {
    // `error` is written for the user; `details` is dev-only and stays off screen.
    logDiagnostic(`${path} - HTTP ${res.status}`, data?.details ?? raw);
    throw new GrowthAIError(
      String(data?.error || GENERIC_FAILURE),
      res.status
    );
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
    logDiagnostic('/api/ai/chat - reply missing or empty', data);
    throw new GrowthAIError(GENERIC_FAILURE);
  }

  return { reply: data.reply, simulated: Boolean(data.simulated) };
}

export async function generateScenario(opts: {
  topic: string;
  difficulty?: string;
}): Promise<{ scenario: any; simulated: boolean }> {
  const data = await postJSON('/api/ai/scenario', opts);
  if (!data.scenario) {
    logDiagnostic('/api/ai/scenario - scenario missing', data);
    throw new GrowthAIError(
      'Growth AI could not generate a scenario right now. Please try again in a moment.'
    );
  }
  return { scenario: data.scenario, simulated: Boolean(data.simulated) };
}

export async function analyzeStrategy(
  strategyText: string
): Promise<{ analysis: any; simulated: boolean }> {
  const data = await postJSON('/api/ai/analyze', { strategyText });
  if (!data.analysis) {
    logDiagnostic('/api/ai/analyze - analysis missing', data);
    throw new GrowthAIError(
      'Growth AI could not review that strategy right now. Please try again in a moment.'
    );
  }
  return { analysis: data.analysis, simulated: Boolean(data.simulated) };
}

/**
 * User-facing text for a failed call. Never fabricates advice.
 *
 * GrowthAIError messages are already written for the reader, so they are
 * returned as-is rather than wrapped in another prefix.
 */
export function describeError(err: unknown): string {
  if (err instanceof GrowthAIError) return err.message;
  logDiagnostic('unexpected error', err);
  return GENERIC_FAILURE;
}
