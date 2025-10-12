import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const sig = req.headers.get("stripe-signature") || "";
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!process.env.STRIPE_SECRET_KEY || !secret) return NextResponse.json({ ok: true });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" } as any);
    const raw = await req.text();
    const event = stripe.webhooks.constructEvent(raw, sig, secret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        // Here you would mark subscription active based on session.customer / metadata.botId
        break;
      }
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (e: any) {
    return NextResponse.json({ error: "webhook error" }, { status: 200 });
  }
}


