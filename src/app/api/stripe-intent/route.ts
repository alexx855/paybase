import { NextResponse } from "next/server";
import Stripe from "stripe";

const { STRIPE_SECRET_KEY } = process.env;

export async function POST(req: Request) {

  const { buyerWalletAddress } = await req.json();
  if (!buyerWalletAddress) {
    throw 'Request is missing "buyerWalletAddress".';
  }

  // Create a Stripe payment intent for $100 USD.
  if (!STRIPE_SECRET_KEY) {
    throw 'Server misconfigured. Did you forget to add a ".env.local" file?';
  }
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2024-04-10",
  });
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 100_00,
    currency: "usd",
    description: "NFT purchase",
    payment_method_types: ["card"],
    metadata: { buyerWalletAddress },
  });

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
  });
}
