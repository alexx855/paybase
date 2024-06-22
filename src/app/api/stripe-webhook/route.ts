import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const {
  WEBHOOK_SECRET_KEY,
  STRIPE_SECRET_KEY,
} = process.env;

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET_KEY) {
    throw 'Server misconfigured. Did you forget to add a ".env.local" file?';
  }

  if (!STRIPE_SECRET_KEY) {
    throw 'Server misconfigured. Did you forget to add a ".env.local" file?';
  }
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2024-04-10",
  });

  // Validate the Stripe webhook signature.
  const body = await req.text();
  const signature = headers().get("stripe-signature");
  if (!signature) {
    throw "Stripe webhook signature not provided. This request may not be valid.";
  }

  try {
    const event: Stripe.Event = stripe.webhooks.constructEvent(
    body,
    signature,
    WEBHOOK_SECRET_KEY
  );
  switch (event.type) {
    case "charge.succeeded":
      // Handle the webhook
      await handleChargeSucceeded(event.data.object);
      break;
    default:
      // Ignore. Unexpected Stripe event.
      console.log(`Unhandled event type ${event.type}`);
  }
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  return NextResponse.json({ message: "OK" });
}

const handleChargeSucceeded = async (charge: Stripe.Charge) => {
  const { BACKEND_WALLET_PK } = process.env;
  if (!BACKEND_WALLET_PK) {
    throw 'Server misconfigured. Did you forget to add a ".env.local" file?';
  }

  const { buyerWalletAddress } = charge.metadata;
  if (!buyerWalletAddress) {
    throw 'Webhook metadata is missing "buyerWalletAddress".';
  }

  // TODO: Mint an NFT to the buyer

};
