# Mentor Voice Notes and Calls Implementation Plan

> **For agentic workers:** Implemented through native execution. See `2026-10-31-mentor-communications-progress.md` for verified results and implementation decisions.

**Goal:** Let verified paid mentees and their mentors exchange voice notes and place browser-based audio/video calls inside the existing conversation.

**Architecture:** Verify Paystack mentorship purchases on the server and issue short-lived conversation tokens for mentee message/media/call access. Store audio in a dedicated private Supabase Storage bucket using signed uploads and short-lived signed playback URLs; store compact audio metadata in the existing message thread. Use WebRTC for media and Supabase-backed HTTP polling/signaling with an atomic per-thread call claim.

**Tech Stack:** Existing Express/React/TypeScript app, Paystack REST API, Supabase REST/Storage APIs with service-role credentials on the server only, browser MediaRecorder and WebRTC.

**Spec:** `docs/superpowers/specs/2026-10-31-mentor-voice-and-calls-design.md`

## Global Constraints

- A mentee must have a successful, active mentorship purchase verified server-side before opening, reading, or sending in a mentor conversation.
- Voice notes are limited to 3 minutes and 8 MB; audio stays in a private bucket and message rows store metadata only.
- One active call is allowed per conversation; expired/unanswered calls and ICE signals must be cleaned or ignored.
- TURN shared secrets never leave the server; browsers receive only temporary TURN credentials.
- Calls ring only while the recipient has the conversation open; background ringing, call recording, group calling, and PSTN calling are excluded.
- Preserve current mentor bearer-token authentication; do not touch the unrelated dirty change in `src/data/mockData.ts`.

## Review Focus

- Invalid, unpaid, expired, non-mentorship, or mismatched-email payment references must not open a thread.
- Expired or mentor-mismatched student tokens must not read, send, upload, or signal.
- Wrong MIME type, oversized audio, and failed signed uploads must not create playable messages.
- Simultaneous call starts must result in one active call at most.
- Denied permissions, autoplay restrictions, offline polling, and missed/abandoned calls must release media tracks and show a recoverable state.

---

### Task 1: Server-Verified Mentor Access

**Files:**
- Create: `src/server/mentorAccess.ts`
- Modify: `src/server/messageRoutes.ts`
- Modify: `src/components/MentorConversation.tsx`

**Interfaces:**
- Produces `verifyMentorshipPurchase(reference: string, email: string): Promise<{ plan: PlanCode; expiresAt: string }>`; reject if Paystack status/reference/email/plan/amount/currency is invalid or mentorship access has expired.
- Produces `issueStudentConversationToken(input: { threadId: string; email: string; mentorId: string; expiresAt: number }): string` and `verifyStudentConversationToken(token: string | undefined, threadId: string, mentorId: string): boolean`.
- `POST /api/messages/thread` verifies the purchase, opens the deterministic thread, and returns `{ thread, accessToken }`.
- Student `GET/POST /api/messages/:threadId` require `Authorization: Bearer <accessToken>`; mentor/admin routes retain their current checks.

- [x] Implement Paystack verification against the existing transaction-verify endpoint and validate against the shared `PLANS` catalogue, amount, `CURRENCY`, payer email, and active mentorship allowance (`mentorshipDays` and `mentorSlots`).
- [x] Sign short-lived tokens with the existing message-thread signing secret and bind each to the exact thread, mentor, and normalized email.
- [x] Require the token on every student thread read/write; pass the returned token from `MentorConversation` to subsequent requests and clear the old token when switching mentor.
- [x] Run `npm run lint`.

### Task 2: Private Voice-Note Storage and Message Contract

**Files:**
- Create: `src/server/mentorMediaStore.ts`
- Modify: `src/server/messageStore.ts`
- Modify: `src/server/messageRoutes.ts`
- Modify: `.env.example`

**Interfaces:**
- Extend `Message` with optional `audio: { path: string; mimeType: string; durationMs: number; sizeBytes: number }`.
- `POST /api/messages/:threadId/voice/upload-url` validates the authorized participant, allowed MIME type, and max 8 MB, then returns a unique path and signed upload URL.
- `POST /api/messages/:threadId/voice/complete` verifies uploaded object existence, duration <= 180000 ms, and appends the audio message.
- `GET /api/messages/:threadId/voice/:messageId/url` authorizes participant and returns a short-lived private signed playback URL.
- Provision/check a dedicated private `mentor-voice-notes` bucket with an 8 MB limit and only supported audio MIME types; fail closed if it is public or cannot be verified.

- [x] Add a storage helper using existing Supabase env parsing and service-role REST access; never send the key to clients.
- [x] Create the bucket idempotently if absent; check existing bucket configuration without changing unrelated buckets.
- [x] Issue non-upsert signed upload URLs scoped under the HMAC thread ID; verify the completed object with Storage before adding its metadata to the thread.
- [x] Reject invalid MIME, size, duration, object path, missing thread, and wrong-participant requests.
- [x] Run `npm run lint`.

### Task 3: Voice Note Recording and Playback UI

**Files:**
- Create: `src/components/MentorVoiceNoteComposer.tsx`
- Create: `src/components/MentorVoiceNotePlayer.tsx`
- Modify: `src/components/MentorConversation.tsx`
- Modify: `src/views/MentorInboxView.tsx`

**Interfaces:**
- Composer accepts `onSend(file: Blob, mimeType: string, durationMs: number): Promise<void>` and `disabled?: boolean`.
- Player accepts `{ threadId, messageId, token, role }` and retrieves a signed playback URL from the authorized server route.
- Both message lists render audio messages using the player and text messages unchanged.

- [x] Implement record, elapsed-time display, stop/preview, discard, max-duration stop, upload progress, retry, and permission/unsupported-browser error states with `MediaRecorder`.
- [x] Upload the Blob directly to the returned signed URL; only after successful upload, call the completion route and render the server-confirmed message.
- [x] Implement accessible audio playback with loading/error states and expiring URL refresh.
- [x] Integrate composer/player in both mentee and mentor chats; retain existing text send behavior and responsive layout.
- [x] Run `npm run lint`.

### Task 4: Call Signaling and Server Call Access

**Files:**
- Create: `src/server/mentorCallRoutes.ts`
- Create: `src/server/mentorCallStore.ts`
- Modify: `server.ts`
- Modify: `api/index.ts`
- Modify: `.env.example`

**Interfaces:**
- Authenticated `GET /api/mentor-calls/:threadId` returns STUN and optional TURN servers together with call state/signals; when `TURN_SHARED_SECRET` and `TURN_URLS` are configured, generate time-limited TURN username/credential server-side.
- `POST /api/mentor-calls/:threadId/start` verifies participant authorization, atomically claims the thread's call slot, and returns a new call ID.
- `POST /api/mentor-calls/:threadId/:callId/signals` appends validated offer/answer/ICE/accept/decline/end events from the authorized participant.
- `GET /api/mentor-calls/:threadId?callId=<callId>&after=<cursor>` returns newer peer events and call state.
- Student endpoints require the Task 1 token; mentor endpoints require the current mentor token.

- [x] Store signaling separately from message-thread payloads in Supabase-backed rows; use unique event IDs and a conditional per-thread active-call claim so simultaneous starts cannot produce two active calls.
- [x] Validate call ownership, participant side, signal size/schema, unanswered timeout, active-call expiry, and event age; clean stale signal rows during call lifecycle operations.
- [x] Add `/api` route mounts in both local and Vercel entry points.
- [x] Add `TURN_URLS` and `TURN_SHARED_SECRET` documentation to `.env.example`; STUN-only mode remains usable but reports that some networks require TURN.
- [x] Run `npm run lint`.

### Task 5: Shared WebRTC Call Experience

**Files:**
- Create: `src/components/MentorCallControls.tsx`
- Create: `src/lib/mentorCallSession.ts`
- Modify: `src/components/MentorConversation.tsx`
- Modify: `src/views/MentorInboxView.tsx`

**Interfaces:**
- `MentorCallControls` accepts `{ threadId, peerName, role, token }` and provides start call, incoming accept/decline, mute, camera toggle, hang-up, status, and duration.
- `mentorCallSession` owns peer connection creation, signaling poll/submit, remote media playback, ICE teardown, and ended/failed state cleanup.

- [x] Implement outgoing/ringing/incoming/connecting/connected/declined/missed/ended/failed states and one-active-call button locking.
- [x] Request microphone/camera only after a user gesture; handle audio-only fallback, permission denial, missing devices, autoplay, tab-hidden polling, and ICE failure.
- [x] Always stop local tracks and close peer connections on hang-up, decline, timeout, route unmount, and error.
- [x] Integrate incoming/active call UI with the mentee and mentor conversation surfaces; show clear TURN/network guidance on failed ICE.
- [x] Run `npm run lint`.

### Task 6: Integration Verification

**Files:**
- Modify only integration gaps discovered in `src/server/mentorAccess.ts`, `src/server/mentorMediaStore.ts`, `src/server/mentorCallRoutes.ts`, `src/components/MentorConversation.tsx`, and `src/views/MentorInboxView.tsx`.

- [x] Run `npm run lint` and `npm run build`.
- [x] Verify the configured Supabase REST endpoints can read the private bucket metadata, create signed upload/read URLs, and query call records; report configuration failures without exposing secrets.
- [x] Manually verify local text chat remains unchanged and feature states render for recording permission denial, unpaid access, incoming call, call termination, and failed media upload.
- [x] Confirm no audio bytes or service-role credentials enter message JSON or browser bundles; review `git diff --check` and inspect the final diff.
