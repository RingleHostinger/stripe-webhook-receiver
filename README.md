# Stripe Webhook Receiver

External webhook receiver for Stripe events. Forwards events to Hostinger PocketBase.

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env`
3. Add your Stripe webhook secret and API key
4. Run `npm install`
5. Run `npm start`

## Environment Variables

- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret (whsec_...)
- `STRIPE_SECRET_KEY` - Stripe secret API key (sk_...)
- `HOSTINGER_API_URL` - Hostinger API base URL
- `PORT` - Server port (default: 3000)

## Endpoints

- `POST /webhooks/stripe` - Stripe webhook endpoint
- `GET /health` - Health check

## Deployment

Deploy to Railway:
1. Connect GitHub repository
2. Add environment variables in Railway dashboard
3. Railway will auto-deploy on push
