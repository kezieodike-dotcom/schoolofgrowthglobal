# Paystack Setup

This project already uses Paystack hosted checkout:

- `POST /api/payments/initialize` creates the Paystack transaction.
- `/payment/callback` verifies the returned reference.
- `POST /api/payments/webhook` verifies Paystack webhooks with `x-paystack-signature`.
- `/admin` reads Paystack transactions for enrolments and revenue.

## 1. Add Environment Variables

Local `.env`:

```env
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
APP_URL=http://localhost:3100
```

Production, for example Vercel project settings:

```env
PAYSTACK_SECRET_KEY=sk_live_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_public_key
APP_URL=https://your-domain.com
PAYSTACK_CALLBACK_URL=https://your-domain.com
```

`PAYSTACK_CALLBACK_URL` is optional when `APP_URL` is correct. The app appends
`/payment/callback` itself.

## 2. Paystack Dashboard

In Paystack Dashboard > Settings > API Keys & Webhooks:

- Copy the test secret/public keys into local `.env`.
- Copy live keys into production only when ready for real payments.
- Add webhook URL:

```text
https://your-domain.com/api/payments/webhook
```

Localhost cannot receive Paystack webhooks. Local checkout redirects can still
work because the payer's browser returns to `http://localhost:3100/payment/callback`.

## 3. Test Flow

1. Restart the dev server after editing `.env`.
2. Open `/pricing`.
3. Choose any package.
4. Enter a name and email on `/checkout/:plan`.
5. Complete payment on Paystack's hosted checkout.
6. Confirm the callback page opens the student's access.
7. Confirm `/admin/enrolments` shows the transaction when Paystack is connected.

## 4. Safety Notes

- Never put `PAYSTACK_SECRET_KEY` in frontend code or any `VITE_` variable.
- Test keys start with `sk_test_` and `pk_test_`.
- Live keys start with `sk_live_` and `pk_live_`.
- Amounts are stored in kobo in `src/lib/pricing.ts`; the browser never sends a price.
