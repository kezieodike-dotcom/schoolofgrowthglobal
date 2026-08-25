import type React from 'react';
import { useState } from 'react';
import { FORMS, type FormKey } from './formDefs';

/**
 * Submits a public form to Web3Forms, which emails it to the address its
 * access key was registered to, and tracks the request status.
 *
 * Shared by every form on the site so they behave identically: the button
 * disables while in flight, success is only shown once delivery is
 * confirmed, and a failure surfaces a real message instead of the previous
 * behaviour of alert()-ing success unconditionally.
 *
 * The call runs in the browser rather than through our own server on
 * purpose. Web3Forms rejects server-side callers on the free plan with
 * "Use our API in client side ... (Pro plan is required)" - it accepts the
 * request only from a browser User-Agent. Proxying it would mean forging
 * that header to dodge their plan limit, so the request goes where they
 * intend it to.
 *
 * The consequence is that the access key ships in the client bundle. That
 * is Web3Forms' own model - their keys are public identifiers, not secrets,
 * and the key can only ever deliver mail to the address it was created for.
 */

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

/**
 * Inlined at build time by Vite, so it must be set wherever the site is
 * BUILT (locally in .env, and in Vercel's environment variables) - setting
 * it only at runtime leaves the deployed bundle without a key.
 */
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined;

export type SubmitStatus = 'idle' | 'sending' | 'sent' | 'error';

const DELIVERY_FAILED =
  'We could not deliver your message. Please email infoschoolofgrowth@gmail.com directly.';
const ATTACHMENT_TOO_LARGE =
  'Please upload a CV file under 5 MB.';

/**
 * Keeps a copy of the submission on our server, so the admin panel can list
 * who has enquired and who has not paid yet.
 *
 * Every form goes through this hook, so capturing here means no form can be
 * added later and silently miss the lead list.
 *
 * Failure is swallowed deliberately. Web3Forms is what the visitor is
 * relying on; our lead list being unavailable is our problem, and showing
 * them an error for it would cost a real enquiry.
 */
async function captureLead(
  form: FormKey,
  title: string,
  answers: Record<string, string>
) {
  try {
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: form, sourceLabel: title, answers }),
    });
  } catch {
    // Intentionally ignored - see above.
  }
}

export function useFormSubmit(form: FormKey) {
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  /**
   * Reads values straight off the form element, so inputs stay uncontrolled
   * and each field only needs a name attribute matching its definition.
   * `extra` carries context the visitor did not type, e.g. which programme
   * an application modal was opened from.
   */
  const submit = async (
    event: React.FormEvent<HTMLFormElement>,
    extra?: Record<string, string>
  ) => {
    event.preventDefault();
    const element = event.currentTarget;
    const raw: Record<string, string> = {
      ...Object.fromEntries(
        Array.from(new FormData(element).entries()).map(([k, v]) => [k, String(v)])
      ),
      ...extra,
    };

    // Honeypot: a hidden input no human fills in. Bots complete every field,
    // so a value here means a script. Show success so it has nothing to tune,
    // and send nothing.
    if (raw.company?.trim()) {
      setStatus('sent');
      element.reset();
      return;
    }

    const def = FORMS[form];

    // Build the payload from the form definition rather than from whatever
    // the DOM happened to contain, so the email always carries the intended
    // labels and no stray inputs leak into it.
    const payload: Record<string, string> = {
      access_key: ACCESS_KEY ?? '',
      subject: `[Website] ${def.title}`,
      from_name: 'School of Growth Global',
    };
    for (const field of def.fields) {
      const value = raw[field.name]?.trim();
      if (value) payload[field.label] = value;
    }
    if (def.replyToField && raw[def.replyToField]?.trim()) {
      payload.replyto = raw[def.replyToField].trim();
    }

    setStatus('sending');
    setError(null);

    // Captured before delivery is attempted, so an enquiry still reaches the
    // admin list on the days Web3Forms is down.
    const captured: Record<string, string> = {};
    for (const field of def.fields) {
      const value = raw[field.name]?.trim();
      if (value) captured[field.label] = value;
    }
    void captureLead(form, def.title, captured);

    // No key means nothing can be delivered. Fail loudly rather than showing
    // a success screen for a lead that was never sent anywhere.
    if (!ACCESS_KEY) {
      console.error(
        'VITE_WEB3FORMS_ACCESS_KEY is not set, so this submission was not delivered:',
        payload
      );
      setError(DELIVERY_FAILED);
      setStatus('error');
      return;
    }

    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      // A rejected key returns HTTP 200 with success:false, so the status
      // code alone does not prove the mail was accepted.
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.success) {
        console.error('Web3Forms rejected the submission:', body);
        throw new Error(DELIVERY_FAILED);
      }

      setStatus('sent');
      element.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : DELIVERY_FAILED);
      setStatus('error');
    }
  };

  /**
   * Sends already-labelled values instead of reading them off a form element.
   *
   * A multi-step wizard cannot use submit(): its earlier steps are unmounted
   * by the time the last one is submitted, so a FormData read would see only
   * the final step's inputs. The wizard holds the answers in state and hands
   * them over here, which keeps delivery, error handling and status in one
   * place rather than forking a second implementation.
   *
   * `entries` is [label, value] pairs, already formatted for a human reading
   * the email - the caller owns presentation because only it knows how to
   * render its own field types.
   */
  const submitValues = async (
    entries: [string, string][],
    opts?: { replyTo?: string }
  ) => {
    const def = FORMS[form];
    const payload: Record<string, string> = {
      access_key: ACCESS_KEY ?? '',
      subject: `[Website] ${def.title}`,
      from_name: 'School of Growth Global',
    };
    for (const [label, value] of entries) {
      const trimmed = value.trim();
      if (trimmed) payload[label] = trimmed;
    }
    if (opts?.replyTo?.trim()) payload.replyto = opts.replyTo.trim();

    setStatus('sending');
    setError(null);

    void captureLead(form, def.title, Object.fromEntries(entries));

    if (!ACCESS_KEY) {
      console.error(
        'VITE_WEB3FORMS_ACCESS_KEY is not set, so this submission was not delivered:',
        payload
      );
      setError(DELIVERY_FAILED);
      setStatus('error');
      return false;
    }

    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.success) {
        console.error('Web3Forms rejected the submission:', body);
        throw new Error(DELIVERY_FAILED);
      }

      setStatus('sent');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : DELIVERY_FAILED);
      setStatus('error');
      return false;
    }
  };

  const submitValuesWithAttachment = async (
    entries: [string, string][],
    attachment: File,
    opts?: { replyTo?: string }
  ) => {
    const def = FORMS[form];
    if (attachment.size > 5 * 1024 * 1024) {
      setError(ATTACHMENT_TOO_LARGE);
      setStatus('error');
      return false;
    }

    setStatus('sending');
    setError(null);

    void captureLead(form, def.title, Object.fromEntries(entries));

    if (!ACCESS_KEY) {
      console.error(
        'VITE_WEB3FORMS_ACCESS_KEY is not set, so this submission was not delivered:',
        Object.fromEntries(entries)
      );
      setError(DELIVERY_FAILED);
      setStatus('error');
      return false;
    }

    const payload = new FormData();
    payload.append('access_key', ACCESS_KEY);
    payload.append('subject', `[Website] ${def.title}`);
    payload.append('from_name', 'School of Growth Global');
    for (const [label, value] of entries) {
      const trimmed = value.trim();
      if (trimmed) payload.append(label, trimmed);
    }
    if (opts?.replyTo?.trim()) payload.append('replyto', opts.replyTo.trim());
    payload.append('attachment', attachment);

    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        body: payload,
      });

      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.success) {
        console.error('Web3Forms rejected the submission:', body);
        throw new Error(DELIVERY_FAILED);
      }

      setStatus('sent');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : DELIVERY_FAILED);
      setStatus('error');
      return false;
    }
  };

  const reset = () => {
    setStatus('idle');
    setError(null);
  };

  return {
    status,
    error,
    submit,
    submitValues,
    submitValuesWithAttachment,
    reset,
    sending: status === 'sending',
  };
}

/**
 * The hidden field the honeypot check reads. Off-screen rather than
 * display:none, which some bots skip, and hidden from assistive tech.
 */
export const HONEYPOT_PROPS = {
  type: 'text' as const,
  name: 'company',
  tabIndex: -1,
  autoComplete: 'off',
  'aria-hidden': true,
  className: 'absolute left-[-9999px] w-px h-px opacity-0 pointer-events-none',
};
