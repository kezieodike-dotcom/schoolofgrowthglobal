import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Voice input for the Growth AI chat boxes, built on the browser's Web Speech
 * API. Nothing is sent to our server and there is no per-use cost.
 *
 * Support is not universal: Chrome and Edge implement it, including Chrome on
 * Android, while Firefox does not. Callers must hide their microphone control
 * when `supported` is false rather than showing a button that cannot work.
 *
 * A secure context is required — https in production, localhost in dev.
 *
 * Speech fills the input rather than sending it. Recognition mishears names
 * and figures often enough that auto-sending would put words in the user's
 * mouth, so they get to read and correct the text before it goes anywhere.
 */

// The Web Speech API is absent from TypeScript's DOM library. Declare only the
// members used here rather than taking on a dependency for types.
interface SpeechAlternative {
  transcript: string;
}
interface SpeechResult {
  readonly length: number;
  isFinal: boolean;
  [index: number]: SpeechAlternative;
}
interface SpeechResultList {
  readonly length: number;
  [index: number]: SpeechResult;
}
interface SpeechResultEvent {
  resultIndex: number;
  results: SpeechResultList;
}
interface SpeechErrorEvent {
  error: string;
}
interface SpeechRecognizer {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognizerCtor = new () => SpeechRecognizer;

function getRecognizerCtor(): SpeechRecognizerCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognizerCtor;
    webkitSpeechRecognition?: SpeechRecognizerCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

/** The audience is Nigerian, so ask for that accent model first. */
const PRIMARY_LANG = 'en-NG';
const FALLBACK_LANG = 'en-US';

function messageForError(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access is blocked. Allow it in your browser settings to use voice input.';
    case 'audio-capture':
      return 'No microphone was found.';
    case 'no-speech':
      return 'No speech detected. Tap the microphone and try again.';
    case 'network':
      return 'The speech service could not be reached.';
    case 'aborted':
      return '';
    default:
      return 'Voice input stopped unexpectedly. Please try again.';
  }
}

export interface VoiceInput {
  /** False when the browser has no Web Speech API. Hide the control entirely. */
  supported: boolean;
  listening: boolean;
  /** User-facing text, or null. Empty-string errors are suppressed. */
  error: string | null;
  start: () => void;
  stop: () => void;
  toggle: () => void;
  dismissError: () => void;
}

export function useVoiceInput(opts: {
  /** Current input text. Speech is appended to it. */
  value: string;
  /** Receives the full new value, ready to put straight into state. */
  onValueChange: (next: string) => void;
  lang?: string;
}): VoiceInput {
  const { value, onValueChange, lang = PRIMARY_LANG } = opts;

  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognizerRef = useRef<SpeechRecognizer | null>(null);
  // Text already in the box when recording started; speech is appended to it
  // so a user can type, dictate, and keep both.
  const baseTextRef = useRef('');
  const finalTextRef = useRef('');

  // Refs keep the callbacks stable so starting does not re-create the
  // recognizer on every keystroke.
  const valueRef = useRef(value);
  valueRef.current = value;
  const onValueChangeRef = useRef(onValueChange);
  onValueChangeRef.current = onValueChange;
  const langRef = useRef(lang);
  langRef.current = lang;

  const supported = useMemo(() => getRecognizerCtor() !== null, []);

  const emit = useCallback((spoken: string) => {
    const base = baseTextRef.current.trim();
    const next = base ? `${base} ${spoken}` : spoken;
    onValueChangeRef.current(next);
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognizerCtor();
    if (!Ctor) {
      setError('Voice input is not supported in this browser.');
      return;
    }
    if (recognizerRef.current) return;

    setError(null);
    baseTextRef.current = valueRef.current;
    finalTextRef.current = '';

    const startWith = (language: string, isRetry: boolean) => {
      const recognizer = new Ctor();
      recognizer.lang = language;
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.maxAlternatives = 1;

      recognizer.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0]?.transcript ?? '';
          if (result.isFinal) {
            finalTextRef.current = `${finalTextRef.current} ${text}`.trim();
          } else {
            interim += text;
          }
        }
        // Interim words appear as they are spoken, then settle when final.
        emit(`${finalTextRef.current} ${interim}`.trim());
      };

      recognizer.onerror = (event) => {
        // Not every browser ships an en-NG model. Retry once in a widely
        // supported locale instead of failing over a regional preference.
        if (event.error === 'language-not-supported' && !isRetry) {
          recognizer.onend = null;
          recognizer.abort();
          recognizerRef.current = null;
          startWith(FALLBACK_LANG, true);
          return;
        }
        const message = messageForError(event.error);
        if (message) setError(message);
      };

      recognizer.onend = () => {
        recognizerRef.current = null;
        setListening(false);
      };

      recognizerRef.current = recognizer;
      try {
        recognizer.start();
        setListening(true);
      } catch {
        recognizerRef.current = null;
        setListening(false);
        setError('Voice input could not start. Please try again.');
      }
    };

    startWith(langRef.current, false);
  }, [emit]);

  const stop = useCallback(() => {
    const recognizer = recognizerRef.current;
    if (!recognizer) {
      setListening(false);
      return;
    }
    recognizer.stop();
  }, []);

  const toggle = useCallback(() => {
    if (recognizerRef.current) stop();
    else start();
  }, [start, stop]);

  const dismissError = useCallback(() => setError(null), []);

  // Leaving the page mid-sentence must release the microphone.
  useEffect(() => {
    return () => {
      const recognizer = recognizerRef.current;
      if (recognizer) {
        recognizer.onend = null;
        recognizer.abort();
        recognizerRef.current = null;
      }
    };
  }, []);

  return { supported, listening, error, start, stop, toggle, dismissError };
}
