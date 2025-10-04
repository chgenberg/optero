import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Lazy initialization to avoid build-time errors
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-09-30.clover",
  });
}

export async function POST(request: NextRequest) {
  try {
    const { profession, specialization, discountPrice } = await request.json();
    
    // Initialize Stripe only when needed
    const stripe = getStripe();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
          product_data: {
            name: `Mendio Premium - ${specialization || profession}`,
            description: "Personlig AI-guide med djupgående analys, 15+ verktyg, 50+ prompts, implementeringsplan och 30 dagars support",
            images: ["https://mendio.io/mendio_logo.png"],
          },
            unit_amount: (discountPrice || 10) * 100, // Price in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.nextUrl.origin}/premium/interview?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}?cancelled=true`,
      metadata: {
        profession,
        specialization,
      },
      locale: "sv",
      // Swedish payment experience
      payment_intent_data: {
        description: `Mendio Premium för ${specialization || profession}`,
      },
      // Customer info collection
      billing_address_collection: "required",
      customer_email: undefined, // Will be filled by customer
      // Invoice settings for Swedish customers
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Mendio Premium - AI-guide för ${specialization || profession}`,
          metadata: {
            profession,
            specialization,
          },
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
