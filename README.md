## Getting Started

First, run the development server:

```bash
npm install
# and then
cp .env.example .env
# for window 
copy .env.example .env
# then edit .env file to set your environment variables
# finally, run the development server
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Stripe Subscription Setup

This project uses Stripe Billing for monthly subscriptions.

Required environment variables:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_GROWTH_MONTHLY`
- `STRIPE_PRICE_SCALE_MONTHLY`
- `NEXT_PUBLIC_APP_URL`

Recommended local webhook setup:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Create a Growth recurring monthly price ($10) and Scale recurring monthly price ($20) in Stripe,
then copy their `price_...` IDs into `.env`.


