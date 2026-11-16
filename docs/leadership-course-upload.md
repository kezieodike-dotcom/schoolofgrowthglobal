# School of Leadership: individual courses

The 19 individual titles and NGN fees from the pricing recommendation are defined in `src/data/leadershipPricing.ts`. Their IDs run from `leadership-001` through `leadership-019` in PDF order. Each ID is also its checkout code. These purchases do not unlock cohort packages, two-week intensives, or mentorship. The recommended bundle and indicative USD amounts are not active products.

## Publish a course

1. Convert the supplied teaching material to the existing LMS JSON format in `data/lms/<course-id>.json`. Do not place lessons in `public/`.
2. Use the exact catalogue ID, a course title, and at least one module. Each module needs a title and at least one lesson; each lesson needs a title and a non-empty text block. Use unique module, lesson and block IDs made of lowercase letters, digits and hyphens.
3. Keep `published` false while reviewing. Set it to true only after the complete course has been reviewed and is ready to sell. A valid published file opens checkout at `/courses/leadership`; missing or incomplete files remain Coming soon.
4. Publish the reviewed files from a trusted server or workstation using `node --import tsx scripts/publish-leadership-courses.ts leadership-004`. Add more catalogue IDs to upload multiple courses. The command validates the files and checks that the `leadership-courses` Supabase bucket is private before uploading. Run it with the intended project's server-side Supabase credentials. Keep the lesson files and answer keys out of the public GitHub repository.
5. Confirm the course is open for enrolment on `/courses/leadership`. The catalogue may take up to 30 seconds to refresh. Test checkout with Paystack test credentials before relying on a new payment configuration. With no Supabase configuration, the local development server reads the reviewed files from `data/lms/`.

Example structure (not published material):

```json
{
  "id": "leadership-001",
  "title": "Foundations of Leadership",
  "published": false,
  "modules": [{
    "id": "module-1",
    "title": "Module title",
    "lessons": [{
      "id": "lesson-1",
      "title": "Lesson title",
      "blocks": [{ "id": "reading-1", "type": "reading", "content": "Reviewed lesson material goes here." }]
    }]
  }]
}
```

Course checkout uses the server-side NGN catalogue and the existing Paystack account. Keep the payment reference: a verified payment confirmation restores the browser's lesson access when its 30-day access credential expires. That credential lifetime is not a course subscription or another charge.

The course player supports headings, lists and tables in the lesson body. For an objective assessment, use a `leadership_quiz` block with public question prompts and choices under `metadata.questions`. Keep correct choices in the course file's top-level `answerKey` field. The authenticated quiz endpoint returns an aggregate score for the current attempt. Projects and certification follow the school's separate assessment procedures.

The file-backed progress and submission stores require a persistent writable host. Configure durable progress storage before relying on saved submissions or completion records on Vercel.

## Additional manuscripts received on 16 November 2026

`scripts/import-leadership-updates.py` imports the reviewed Leadership Character, Change Leadership and Crisis Leadership manuscripts into ignored `data/lms/` files. It reuses the shared DOCX extraction/table helpers, preserves the original module order, and verifies every source line by reconstructing it from its actual public or private destination. Run it with the bundled Python and `-B`; use `--verify-only` to compare imported JSON against the unchanged original manuscripts without rewriting it. Synthetic parser and privacy checks are in `scripts/test_import_leadership_updates.py`.

| Permanent course ID | Course | Original manuscript modules | Approved individual fee |
| --- | --- | --- | --- |
| leadership-003 | Leadership Character | 10 | ₦15,000 |
| leadership-016 | Change Leadership | 21 | ₦20,000 |
| leadership-017 | Crisis Leadership | 16 | ₦25,000 |

The module counts include the assessment and completion modules where the author numbered them. Keep original exercises, projects, practical evaluation criteria and certification requirements. Model answers, correct choices and explanations belong only in private top-level fields. Publishing these existing catalogue IDs makes them available through the existing enrolment and paid lesson routes; no duplicate course listing is needed.

The attachment named `SGG-COURSE -LEADERSHIP ACCOUNTABILITY.docx` contains the institutional company profile. Hold `leadership-018` until the actual Leadership Accountability teaching manuscript is supplied. The importer records this rejected source privately and does not generate or publish course material for it.
