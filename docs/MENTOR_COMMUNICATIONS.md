# Mentor Conversations, Voice Notes and Calls

Mentees open conversations from their mentorship area. The server confirms their Paystack reference, payer email, successful payment, catalogue amount/currency, and current mentorship allowance before returning a conversation token. The token expires within one hour or when the paid mentorship expires, whichever comes first. Reopening the conversation renews access through payment verification. Course-only purchases without mentorship access do not unlock conversations. Production rejects Paystack test transactions.

Mentors use the existing mentor inbox session. Student text messages, private audio, and call signaling all require a participant token for the exact conversation. Thread IDs by themselves do not provide student access.

## Voice Notes

Voice notes support browser microphone recording, preview, discard, retry, and playback. Limits are three minutes and 8 MB. Audio uploads go directly to a signed Supabase Storage upload URL, avoiding serverless function body limits. A signed receipt binds completion to the participant, conversation, object path, MIME type, size, and duration.

The server creates `mentor-voice-notes` if it is absent. It must remain private, with an 8 MB file limit and `audio/webm`, `audio/ogg`, and `audio/mp4` allowed MIME types. Configure another dedicated bucket with `SUPABASE_MENTOR_VOICE_BUCKET`. The existing public image bucket is not used. Audio playback uses ten-minute signed URLs after authorization.

## Browser Calls

Both chat surfaces provide voice/video calling, incoming accept/decline, microphone mute, camera toggle, and hang-up. The recipient must have the conversation open to receive an incoming prompt. This release does not send background push notifications, record calls, dial phone numbers, or provide group calling.

One active call slot per conversation is enforced by atomic insert/conditional updates in the database. ICE and SDP events are separate private records. Unanswered calls expire after 45 seconds. Accepted calls expire after four hours, and missing participant heartbeats fail the call after 45 seconds. Local safety timers stop capture even if signaling is offline. Signaling older than 24 hours is cleaned during subsequent call starts.

Calls require HTTPS (localhost is permitted), browser microphone/camera permission, and WebRTC support. Public STUN is provided by default. To connect reliably across restrictive mobile, corporate, and NAT networks, configure a coturn-compatible TURN service:

```env
TURN_URLS="turn:relay.example.com:3478,turns:relay.example.com:5349"
TURN_SHARED_SECRET="your-coturn-static-auth-secret"
```

The shared secret stays on the server. The browser receives time-limited credentials, generated using the coturn REST authentication scheme. Configure the same shared secret on the TURN server. No calling vendor account or phone-number service is required by the application.

## Persistence

Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` on the server. The existing content table's allowed kinds are retained: private conversation and signaling records use `team` with `mentor-thread-`, `mentor-call-`, and `mentor-signal-` ID prefixes. Public content queries exclude `mentor-*`; mentor-application queries restrict application status so they do not return communication records. Local text-chat JSON is retained, and existing threads are migrated when reopened or listed.

`MESSAGE_THREAD_SECRET` can provide a dedicated signing key. Keep it stable across server instances. If omitted, the configured Paystack key signs student access and derives thread IDs. Never add server credentials under a `VITE_` environment variable.
