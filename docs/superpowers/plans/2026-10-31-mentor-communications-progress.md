# Execution ledger: mentor voice notes and calls

- Approved: browser voice/video calling, private voice notes, and paid-only mentee access.
- Native implementation in current checkout on `codex/mentor-communications`; existing work retained.
- Ruling: use the existing private `team`/`mentor-*` record namespace, since the documented database CHECK constraint rejects new content kinds. Application queries exclude communication records. This avoids requiring an unavailable database schema administration connection.
- Ruling: call/media routes mount through the existing message router so local and serverless entry points share the same route composition.
- Ruling: idle call polling pauses in hidden pages; active-call polling continues to maintain the call lease and permit hang-up signaling.
- Implemented: paid payment verification and signed conversation tokens; private signed voice upload/playback routes; voice recorder/player; call claim and signaling routes; shared WebRTC controller and call dialog; integration in both chat surfaces.
- Verification in progress: access denial, upload ownership, call races, browser media flow, TypeScript and production build.
- Verified: 11 server tests for payment/token/voice authorization, atomic call claims and signaling roles; TypeScript and production build passed; real Supabase bucket privacy and concurrent message writes passed.
- Final review found two important lifecycle defects: offline ringing lacked local capture expiry, and a poll could invalidate a pending start. Both were reproduced by failing client tests, fixed, and the two tests now pass.
- Browser verification is using disposable participants and real Supabase media/signaling; fixture data is removed in a finally block.
- Tasks 1-6 complete. Final targeted suite: 16/16 passing, including both lifecycle regressions; TypeScript passed.
- Real-project verification passed: private bucket provision/privacy, signed audio upload/playback both directions, concurrent message writes, atomic concurrent call claims, audio/video media bytes, nonblank video pixel check, mute/camera controls, hang-up/decline, reload persistence, permission denial, and mobile overflow check. Browser runtime errors: zero. Disposable data/audio removed.
- Existing broader startup check `src/server/vercelStartup.test.ts` fails because `api/index.ts` statically imports `mentorRoutes`. `git show HEAD:api/index.ts` confirms the same import in the pre-existing baseline; this feature does not modify that entry point.
- Ruling: TURN credentials last five hours to cover the four-hour maximum call; the shared secret stays server-side.
- Ruling: authenticated call polling returns ICE configuration and signaling together, reducing requests and avoiding a public relay-credential endpoint.
- Final review's considered-but-set-aside items remain within the approved scope: the existing private mentor record namespace, capability-based payment proof, and STUN-only network limits. No additional concrete authorization or upload-receipt bypass was identified.
- Final production build passed after the fixes. Browser bundle credential scan found zero server secrets. TURN is not currently configured; direct WebRTC calls passed, and relay setup is documented for restrictive networks.
- Preview server is running at http://localhost:3100. No deployment or git push was performed.
