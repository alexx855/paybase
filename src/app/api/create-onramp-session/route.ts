import { NextResponse } from "next/server";
import Stripe from "stripe";

const { STRIPE_SECRET_KEY, NEXT_PUBLIC_BASE_URL } = process.env;

export async function POST(req: Request) {
  console.log(`new request: ${req.url}`);
  const { wallet_addresses } = await req.json();
  if (!wallet_addresses) {
    throw 'Request is missing "wallet_addresses".';
  }

  // Create a Stripe payment intent for $100 USD.
  if (!STRIPE_SECRET_KEY) {
    throw 'Server misconfigured. Did you forget to add a ".env.local" file?';
  }
  const OnrampSessionResource = Stripe.StripeResource.extend({
    create: Stripe.StripeResource.method({
      method: 'POST',
      path: 'crypto/onramp_sessions',
    }),
  });
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2024-04-10",
  });



  // Create an OnrampSession with the order amount and currency
  const onrampSession = await new OnrampSessionResource(stripe).create({
    transaction_details: {
      destination_currency: "eth",
      destination_network: "base",
      wallet_addresses: {
        base_network: wallet_addresses,
      },
    },
  });

  const session = onrampSession as unknown as { client_secret: string, redirect_url: string };

  if (!session) {
    throw 'Server misconfigured. Did you forget to add a ".env.local" file?';
  }

  return NextResponse.json({
    clientSecret: session.client_secret,
    redirectUrl: session.redirect_url,
  });
}
