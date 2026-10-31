# Mentor Voice Notes and Calls Design

## Intent

Extend the existing mentor–mentee conversation so both participants can send and play voice notes and start an in-browser voice/video call without leaving the thread. The interaction should feel like a natural extension of chat and explain browser permission or network problems clearly.

## Goals

- Record, preview, cancel, upload, and play voice notes from student and mentor views.
- Support one active peer-to-peer audio/video call per conversation, with outgoing, ringing, accepted, declined, missed, ended, and failed states.
- Allow the recipient to accept or decline; support hang-up, microphone/camera controls, and call duration.
- Keep media and signaling on the server-side Supabase integration; never expose the service-role key to browser code.
- Preserve text messaging and local development fallback.
- Require a successful, active, server-verified mentorship purchase before a mentee can open, read, or send in a mentor conversation. Issue short-lived, server-signed participant access; do not trust browser-local entitlements or unverified references.

## Non-goals

- Group calls, call recording, transcripts, screen sharing, offline media queues, or PSTN/phone-number calling.
- Guaranteed connectivity on every restrictive network without TURN relay configuration.
- Replacing the entire site's mentor access or student entitlement model.

## Approaches Considered

1. **Browser WebRTC with Supabase-backed signaling and optional TURN** (recommended): no per-minute calling vendor, remains in the site, but some networks require TURN credentials for reliable media connectivity.
2. **Managed calling provider**: provides hosted signaling/relay and simpler reliability, but requires a vendor account, credentials, dependency, and possibly usage charges.

The user approved approach 1, including voice and video calling.

## Architecture

- Voice-note audio files are stored in a private Supabase Storage bucket. Messages store only object path, MIME type, duration, and byte size; the existing JSON message payload must not accumulate audio bytes. Server routes authorize access using short-lived student conversation tokens and mentor bearer tokens, and issue short-lived playback URLs.
- Recording uses browser `MediaRecorder`, with a bounded duration and upload size, permission errors, preview playback, cancel, and retry. Unsupported browsers receive a clear fallback message.
- Calls use WebRTC peer connections in the browser. A server-mediated signaling API persists call sessions and ICE signaling in the existing Supabase-backed content table, scoped to one thread and participant. Clients poll while a call is active; media itself is peer-to-peer unless a TURN server is configured.
- STUN defaults and optional TURN URL/shared-secret are server configuration. TURN credentials returned to browsers are temporary; long-lived secrets stay on the server.
- A call expires when unanswered, only one call can be active per thread, and all end/decline/error paths clear local tracks and signaling state. Enforce one-active-call using a database-backed atomic claim, not a read-then-write check.
- Both chat views gain voice-note and call controls, incoming call handling, active-call controls, and visible sending/connection states while preserving text chat.

## Constraints and Risks

- The current chat uses a single Supabase row per thread. Signaling must use separate, short-lived records to avoid rewriting message history during ICE negotiation.
- Supabase Storage bucket setup and allowed MIME types must be verified against the connected project before enabling uploads. Bucket remains private; access is mediated through the server.
- WebRTC is not universally reachable using STUN alone. Production should configure TURN for best reliability; the UI must explain when direct connection fails.
- Audio/video requires HTTPS (localhost is allowed by browsers) and user permission. Mobile browser lifecycle and autoplay restrictions must be handled.
- Existing participant identity is capability-based, not account-based. Verify a mentee's Paystack reference server-side, require a successful eligible mentorship transaction whose payer email matches the thread email, check that mentorship access is still active, and issue a short-lived capability scoped to that mentee and mentor. This gates all student thread access, not only media. Mentor access continues to use the existing mentor session token. Do not accept the current unverified-reference-only path.
- Incoming calls are delivered while the recipient has the conversation open and polling; background ringing and push notifications are outside this first release.

## Builder Decisions

- Start with audio/video calls and voice notes, matching the approved recommendation.
- Limit voice notes to 3 minutes and 8 MB by default; expose these as server constants so they can be adjusted.
- Use short polling for signaling rather than adding a realtime client dependency; stop polling when the call ends or the page is hidden.
- Provision a dedicated private voice bucket with strict MIME/size limits; never reuse the existing public image bucket. Create short-lived signed read URLs only after thread and participant authorization.
- Keep local JSON chat working, but report that voice storage/calling require the configured Supabase service and HTTPS-capable browser APIs.

## Implementation Notes

- Existing database kind restrictions are preserved by using the established private `team`/`mentor-*` namespace. Conversation, active-call and signal prefixes are distinct; public content excludes these records, and application queries filter their application statuses.
- Call/media routes are composed inside the existing message router, so both the local and serverless entry points serve them.
- Active calls continue signaling while the tab is hidden to maintain their connection lease. Idle polling pauses when hidden.
- Local call safety timers release media when an unanswered deadline or signaling outage occurs, independently of the server response.

## Acceptance Criteria

- Both sides can record, preview, discard, send, and play a voice note; refresh preserves the message and audio.
- One participant can call; the other receives an in-thread incoming call prompt and can accept or decline.
- Accepted calls establish two-way media when ICE paths are available; participants can mute, toggle camera, and hang up.
- Missed, declined, denied-permission, unsupported-browser, and connection-failure states are understandable and do not leave the camera/microphone active.
- Text chat remains intact; lint/build pass; storage and signaling API paths are verified without exposing credentials or public media.
