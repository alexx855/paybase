import { NextResponse } from "next/server";
import Stripe from "stripe";

const { STRIPE_SECRET_KEY, NEXT_PUBLIC_BASE_URL } = process.env;

export async function POST(req: Request) {
  console.log(`new request: ${req.url}`);
  // const { transaction_details } = await req.json();
  // if (!transaction_details) {
  //   throw 'Request is missing "transaction_details".';
  // }

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

  const transaction_details = {
    destination_currency: "avax",
    destination_exchange_amount: "3",
    destination_network: "avalanche",
  };
  // -d "wallet_addresses[ethereum]"="0xB00F0759DbeeF5E543Cc3E3B07A6442F5f3928a2" \
  // -d "source_currency"="usd" \
  // -d "destination_currency"="eth" \
  // -d "destination_network"="ethereum" \
  // -d "destination_currencies[]"="eth" \
  // -d "destination_networks[]"="ethereum"

  // Create an OnrampSession with the order amount and currency
  const onrampSession = await new OnrampSessionResource(stripe).create({
    transaction_details: {
      destination_currency: transaction_details["destination_currency"],
      destination_exchange_amount: transaction_details["destination_exchange_amount"],
      destination_network: transaction_details["destination_network"],
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
