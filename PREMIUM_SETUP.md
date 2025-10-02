# 🚀 Premium-funktionen - Setup Guide

## ✅ Vad som är klart

Premium-funktionen är **fullständigt implementerad** och fungerar i development-läge. 

### Implementerade komponenter:

1. **PremiumUpgrade** - Snygg CTA-komponent på resultatsidan
2. **PremiumInterview** - Conversational 10-12 frågor djupintervju
3. **API endpoints:**
   - `/api/premium/checkout` - Stripe integration (mock för dev)
   - `/api/premium/interview/start` - Startar AI-intervju
   - `/api/premium/interview/continue` - Fortsätter intervju med GPT-4o
   - `/api/premium/generate-report` - Genererar personlig rapport med GPT-5
4. **Premium interview page** - `/premium/interview`
5. **Session management** - Global state för intervju-data

---

## 🔧 Aktivera Stripe (Produktion)

### Steg 1: Skapa Stripe-konto
```bash
1. Gå till https://stripe.com
2. Skapa konto (företag: Optero)
3. Verifiera email och företagsinfo
```

### Steg 2: Installera Stripe
```bash
npm install stripe @stripe/stripe-js
```

### Steg 3: Lägg till Stripe-nycklar i `.env.local`
```env
# Stripe Keys (hitta på https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# För produktion, byt till live keys:
# STRIPE_SECRET_KEY=sk_live_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Steg 4: Uppdatera `/app/api/premium/checkout/route.ts`

Avkommentera Stripe-koden:

```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { profession, specialization, userContext } = await request.json();
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'sek',
          product_data: {
            name: 'Premium AI-Analys',
            description: `Personlig djupanalys för ${profession} (${specialization})`,
            images: ['https://yourdomain.com/optero-logo.png'], // Lägg till din logo
          },
          unit_amount: 29900, // 299 SEK i ören
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/premium/interview?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/?cancelled=true`,
      metadata: {
        profession,
        specialization,
        userContext: JSON.stringify(userContext),
      },
    });

    return NextResponse.json({
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout:", error);
    return NextResponse.json(
      { error: "Kunde inte skapa betalningslänk" },
      { status: 500 }
    );
  }
}
```

### Steg 5: Verifiera betalning i `/app/premium/interview/page.tsx`

```typescript
// I useEffect, lägg till:
const sessionId = searchParams.get("session_id");

if (sessionId) {
  // Verifiera Stripe session
  const response = await fetch("/api/premium/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
  
  const data = await response.json();
  
  if (data.verified) {
    setIsVerified(true);
    setProfession(data.metadata.profession);
    setSpecialization(data.metadata.specialization);
    setUserContext(JSON.parse(data.metadata.userContext));
  }
}
```

### Steg 6: Skapa verify-payment endpoint

```typescript
// /app/api/premium/verify-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      return NextResponse.json({
        verified: true,
        metadata: session.metadata,
      });
    }
    
    return NextResponse.json({ verified: false }, { status: 400 });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json({ verified: false }, { status: 500 });
  }
}
```

---

## 📧 Email-integration (Resend eller SendGrid)

### Alternativ 1: Resend (Rekommenderat)

```bash
npm install resend
```

```typescript
// /app/api/premium/send-report/route.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const { email, reportContent, sessionId } = await request.json();
  
  await resend.emails.send({
    from: 'Optero <noreply@optero.se>',
    to: email,
    subject: 'Din personliga AI-strategi är klar! 🚀',
    html: `
      <h1>Din Premium AI-Analys</h1>
      <p>Tack för att du valde Optero Premium!</p>
      <p>Din rapport finns bifogad som PDF.</p>
      <p>Du har även 30 dagars tillgång till support-chatten: 
         <a href="https://optero.se/premium/support?session=${sessionId}">Klicka här</a>
      </p>
    `,
    attachments: [
      {
        filename: 'optero-ai-strategi.pdf',
        content: reportPDF, // Generera PDF från reportContent
      }
    ]
  });
}
```

### Alternativ 2: SendGrid

```bash
npm install @sendgrid/mail
```

---

## 📄 PDF-generering

### Använd jsPDF eller PDFKit:

```bash
npm install jspdf html2canvas
```

```typescript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

async function generatePDF(reportContent: string) {
  // Konvertera markdown till HTML
  const htmlContent = marked(reportContent);
  
  // Skapa PDF
  const doc = new jsPDF();
  
  // Lägg till innehåll (simplified)
  doc.setFontSize(20);
  doc.text('Din Personliga AI-Strategi', 20, 20);
  
  // Lägg till mer innehåll...
  
  return doc.output('arraybuffer');
}
```

---

## 🗄️ Databas (Prisma + PostgreSQL)

För att spara intervju-sessions permanent:

```prisma
// prisma/schema.prisma
model PremiumSession {
  id              String    @id @default(cuid())
  sessionId       String    @unique
  profession      String
  specialization  String
  userEmail       String
  messages        Json
  report          String?   @db.Text
  stripeSessionId String?
  paid            Boolean   @default(false)
  createdAt       DateTime  @default(now())
  completedAt     DateTime?
  reportGeneratedAt DateTime?
}
```

```bash
npx prisma migrate dev --name add_premium_sessions
```

---

## 🚦 Testning

### Development (fungerar nu):
1. Gå till huvudsidan
2. Genomför analys
3. Klicka "Kom igång nu" på Premium-kortet
4. Du redirectas till mock-intervjun
5. Svara på 12 frågor
6. Få rapport

### Produktion:
1. Samma flow
2. Verklig Stripe-betalning (299 kr)
3. Email med PDF
4. 30-dagars support-chatt

---

## 💰 Prissättning & A/B Testing

Testa olika priser:

```typescript
const PRICING_TIERS = {
  A: 199,  // Test: lägre pris
  B: 299,  // Current
  C: 399,  // Test: högre värde
};

// Randomisera per användare
const tier = Math.random() < 0.5 ? 'A' : 'B';
```

---

## 📊 Analytics

Lägg till tracking:

```typescript
// Google Analytics event
gtag('event', 'premium_upgrade_click', {
  profession: profession,
  specialization: specialization,
});

gtag('event', 'premium_purchase', {
  value: 299,
  currency: 'SEK',
});
```

---

## ✅ Checklista innan lansering

- [ ] Stripe-konto skapat och verifierat
- [ ] Live API-nycklar tillagda i .env
- [ ] Betalning verifieras korrekt
- [ ] Email-tjänst konfigurerad (Resend/SendGrid)
- [ ] PDF-generering fungerar
- [ ] Databas sparar sessions
- [ ] Test-köp genomfört
- [ ] Analytics tracking installerat
- [ ] 30-dagars support-chatt konfigurerad
- [ ] Juridiskt: Köpvillkor & Integritetspolicy

---

## 🎯 Nästa steg

1. **Denna vecka:**
   - Sätt upp Stripe test-mode
   - Testa hela flödet end-to-end
   - Generera första PDF-rapporten

2. **Nästa vecka:**
   - Aktivera live payments
   - Soft launch till 10 testanvändare
   - Samla feedback

3. **Vecka 3:**
   - Full lansering
   - Marknadsföring via facklöreningar
   - Samarbete med HR-avdelningar

---

**Frågor? Kontakta development team!** 🚀

