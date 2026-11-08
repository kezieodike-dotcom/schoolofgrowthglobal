# School of Leadership: individual courses

The 19 individual titles and NGN fees from the pricing recommendation are defined in `src/data/leadershipPricing.ts`. Their IDs run from `leadership-001` through `leadership-019` in PDF order. Each ID is also its checkout code. These purchases do not unlock cohort packages, two-week intensives, or mentorship. The recommended bundle and indicative USD amounts are not active products.

## Publish a course

1. Convert the supplied teaching material to the existing LMS JSON format in `data/lms/<course-id>.json`. Do not place lessons in `public/`.
2. Use the exact catalogue ID, a course title, and at least one module. Each module needs a title and at least one lesson; each lesson needs a title and a non-empty text block. Use unique module, lesson and block IDs made of lowercase letters, digits and hyphens.
3. Keep `published` false while reviewing. Set it to true only after the complete course has been reviewed and is ready to sell. A valid published file opens checkout at `/courses/leadership`; missing or incomplete files remain Coming soon.
4. Include the course file in a private deployment source. The Vercel API bundle includes `data/lms/**`. Keep the paid course files out of the public GitHub repository. Test the course on staging with Paystack test credentials before accepting live payments.

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
