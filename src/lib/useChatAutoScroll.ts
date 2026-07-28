import { useEffect, useRef } from 'react';

/**
 * Keeps a chat transcript scrolled sensibly as messages arrive.
 *
 * Jumping to the very bottom is wrong for an assistant reply: Growth AI answers
 * at length, so the reader lands on the last line of an answer they have not
 * read and has to scroll back up to find where it started. Align the top of the
 * new reply with the top of the viewport instead, so reading begins at the
 * first line.
 *
 * The bottom is still the right target for the user's own message and for the
 * pending indicator, where the newest content is precisely the point.
 *
 * Attach `containerRef` to the scrolling element and `lastMessageRef` to the
 * final message in the list.
 */
export function useChatAutoScroll<T extends { sender: 'user' | 'assistant' }>(
  messages: T[],
  pending = false
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const last = messages[messages.length - 1];
    const lastEl = lastMessageRef.current;

    if (!pending && last?.sender === 'assistant' && lastEl) {
      // Measured with getBoundingClientRect rather than offsetTop so it stays
      // correct regardless of which ancestor is the offset parent.
      const containerTop = container.getBoundingClientRect().top;
      const messageTop = lastEl.getBoundingClientRect().top;
      // Browsers clamp this, so a short reply near the end simply rests at the
      // bottom rather than leaving blank space.
      container.scrollTop += messageTop - containerTop;
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [messages, pending]);

  return { containerRef, lastMessageRef };
}
