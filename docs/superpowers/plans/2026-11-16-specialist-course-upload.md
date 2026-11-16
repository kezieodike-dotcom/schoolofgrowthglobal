# AI and governance course upload

Goal: Add the supplied manuscripts to the existing individual-course platform while preserving their original teaching content, older courses, and paid access boundaries.

Use the existing professional course catalogue, individual checkout, private `leadership-courses` storage, student dashboard and lesson player. Nine attachments represent seven distinct courses because the Public Accountability copies are identical. Permanent IDs follow the manuscripts: ai-001, ai-002, governance-001, governance-005, governance-013, governance-014 and governance-015.

- [x] Audit sources, preserve tables, modules, lectures, assignments, references and completion requirements; record source hashes and complete line coverage privately.
- [x] Import seven private LMS JSON files. Store model answers, correct choices, marking guides and facilitator material outside learner modules. Use original multiple-choice questions for server grading and written responses where choices were not supplied.
- [x] Add public course descriptions and suitable existing course imagery, accurate school/faculty, durations and assessment descriptions. Preserve the existing homepage priorities and merge with the full academic directory without duplicate titles.
- [x] Obtain fees from the user; do not infer new financial terms from unrelated courses. The institution confirmed ₦15,000 per new course.
- [x] Verify unique catalogue identities, server-authoritative checkout amounts, unauthorized access, instructor answer privacy, grading and isolated saved student work. Run TypeScript and the relevant existing regression tests, then inspect desktop/mobile course pages and paid-player fixtures.
- [x] Upload and read back reviewed private course objects using existing server credentials. Keep source manuscripts and private JSON out of public Git. Report publication and any remaining limitations accurately.

Verification: 19 regression tests and the production build passed. Browser checks covered all seven previews, correct module counts, private answer projection, saved AI written work, and all five governance quiz scores in an isolated memory-backed test server. All seven objects were downloaded after upload and compared exactly; anonymous source downloads were rejected. Localhost uses the new production build and its availability endpoint reads all nine professional/specialist courses from the configured private storage.

Pricing: the institution confirmed ₦15,000 per new course on 16 November 2026. The browser and payment server use the same catalogue fee. Both client navigation and server initialization also reject unconfirmed zero placeholders, and zero-value payments cannot issue access. Existing course prices are preserved. No public Git push or Vercel deployment is part of this upload.

Source review notes are stored privately in each imported file's `sourceIssues`. Courses 013–015 contain compact topic descriptions rather than expanded lectures and do not include all named template files or detailed marking rubrics. AI 002 has one question referring to absent choices; its questions remain written and require instructor review. Original progression-number inconsistencies and assessment-weighting ambiguities have not been silently rewritten.

Constraints: No real payment charges, no changes to real learner progress, no public source documents or answer keys, no removal of older courses, no invented teaching material or automated grading of open-ended answers, and no unrelated redesign.
