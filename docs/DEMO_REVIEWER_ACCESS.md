# Demo Reviewer Access

Use `/demo-reviewer` when one trusted person needs to preview the Vercel site
without receiving admin credentials.

## Enable

Add this environment variable locally or in the Vercel Preview environment:

```env
DEMO_REVIEWER_PASSWORD="use-a-long-temporary-code"
```

Then redeploy the preview deployment and share:

```text
https://your-vercel-preview-url/demo-reviewer
```

## What It Opens

After the reviewer enters the code, the browser receives:

- A 7-day Elite demo student entitlement for `/portal`.
- A default demo mentor pairing.
- A mentor inbox session for `/mentor/inbox`.

It does not grant access to `/admin` or any `/api/admin/*` route.

## Disable

Remove `DEMO_REVIEWER_PASSWORD` from Vercel and redeploy. This stops issuing new
reviewer sessions. For a stricter cutoff, change the password and redeploy before
sharing a new preview link.
