import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" } as any);

export async function POST(req: NextRequest) {
  try {
    const { plan, botId } = await req.json();
    if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_BOT_MONTHLY || "",
          quantity: 1
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://optero-production.up.railway.app"}/business/executive-consultant/build?success=1&botId=${encodeURIComponent(botId || "")}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://optero-production.up.railway.app"}/business/executive-consultant/build?canceled=1`,
      metadata: { botId: botId || "" }
    });
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error("stripe checkout error", e);
    return NextResponse.json({ error: "checkout failed" }, { status: 500 });
  }
}


