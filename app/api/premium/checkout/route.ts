import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { profession, specialization, userContext } = await request.json();

    // I produktion: Integrera med Stripe
    // För nu: Simulera betalning och returnera "success"
    
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: [{
    //     price_data: {
    //       currency: 'sek',
    //       product_data: {
    //         name: 'Premium AI-Analys',
    //         description: `Personlig djupanalys för ${profession} (${specialization})`,
    //       },
    //       unit_amount: 29900, // 299 SEK i ören
    //     },
    //     quantity: 1,
    //   }],
    //   mode: 'payment',
    //   success_url: `${process.env.NEXT_PUBLIC_URL}/premium/interview?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_URL}/premium/cancelled`,
    //   metadata: {
    //     profession,
    //     specialization,
    //   },
    // });

    // För development: Simulera direkt success
    const mockCheckoutUrl = `/premium/interview?mock=true&profession=${encodeURIComponent(profession)}&specialization=${encodeURIComponent(specialization)}`;

    return NextResponse.json({
      checkoutUrl: mockCheckoutUrl,
      // I produktion: url: session.url
    });
  } catch (error) {
    console.error("Error creating checkout:", error);
    return NextResponse.json(
      { error: "Kunde inte skapa betalningslänk" },
      { status: 500 }
    );
  }
}

