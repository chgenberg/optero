import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, botId } = await req.json();
    
    if (!email || !botId) {
      return NextResponse.json({ error: "Email and botId required" }, { status: 400 });
    }

    const chatUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mendio.se'}/agent/chat/${botId}`;

    await resend.emails.send({
      from: "MENDIO <no-reply@mendio.se>",
      to: email,
      subject: "Your AI Assistant is Ready!",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: #000; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px;">🤖</span>
            </div>
            <h1 style="color: #000; font-size: 28px; margin: 0;">Your AI Assistant is Ready!</h1>
          </div>
          
          <div style="background: #f5f5f5; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
              Great news! Your personal AI assistant has been trained on your company data and is ready to help.
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
              You can now:
            </p>
            
            <ul style="color: #333; font-size: 16px; line-height: 1.8; margin: 0 0 20px; padding-left: 20px;">
              <li>Ask questions about your company</li>
              <li>Get instant answers from your documents</li>
              <li>Upload new files anytime to expand knowledge</li>
              <li>Access from any device</li>
            </ul>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${chatUrl}" style="display: inline-block; background: #000; color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Open Your Assistant →
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0 0 10px;">
              Bookmark this link to access your assistant anytime:<br>
              <a href="${chatUrl}" style="color: #000; text-decoration: underline;">${chatUrl}</a>
            </p>
            
            <p style="margin: 20px 0 0;">
              Need help? Reply to this email or visit our support center.
            </p>
          </div>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Welcome email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
