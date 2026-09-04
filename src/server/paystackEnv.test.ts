import {
  isPaystackConfigured,
  paystackPublicKey,
  paystackSecretKey,
} from './paystackEnv.js';

const originalPublic = process.env.PAYSTACK_PUBLIC_KEY;
const originalSecret = process.env.PAYSTACK_SECRET_KEY;

function restoreEnv() {
  process.env.PAYSTACK_PUBLIC_KEY = originalPublic;
  process.env.PAYSTACK_SECRET_KEY = originalSecret;
}

try {
  process.env.PAYSTACK_PUBLIC_KEY = ' pk_live_public ';
  process.env.PAYSTACK_SECRET_KEY = ' sk_live_secret ';

  if (paystackPublicKey() !== 'pk_live_public') {
    throw new Error('Paystack public key should be trimmed before it is sent to the browser.');
  }

  if (paystackSecretKey() !== 'sk_live_secret') {
    throw new Error('Paystack secret key should be trimmed before it is used for API calls.');
  }

  process.env.PAYSTACK_SECRET_KEY = '   ';
  if (paystackSecretKey() !== undefined || isPaystackConfigured()) {
    throw new Error('Blank Paystack secret values should be treated as missing.');
  }
} finally {
  restoreEnv();
}
