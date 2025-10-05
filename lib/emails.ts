import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMagicLinkEmail(email: string, magicLink: string, profession: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Mendio <noreply@mendio.io>',
      to: email,
      subject: 'Din AI-analys från Mendio',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background-color: #111827; padding: 32px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                          Mendio
                        </h1>
                        <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 14px;">
                          AI som sparar dig tid
                        </p>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 32px;">
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 20px; font-weight: 600;">
                          Din AI-analys är klar!
                        </h2>
                        
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                          Vi har skapat en personlig AI-guide för dig som <strong>${profession}</strong>. 
                          Klicka på knappen nedan för att se dina resultat.
                        </p>

                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 24px 0;">
                              <a href="${magicLink}" style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                                Se dina resultat
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                          Länken är giltig i 7 dagar. Om knappen inte fungerar, kopiera denna länk:
                        </p>
                        <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px; word-break: break-all;">
                          ${magicLink}
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                          © 2025 Mendio. Gör jobbet enklare med AI.
                        </p>
                        <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 11px; text-align: center;">
                          Vill du inte få fler mail? <a href="#" style="color: #6b7280; text-decoration: underline;">Avsluta prenumeration</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

export async function sendPurchaseConfirmationEmail(email: string, name: string, tier: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Mendio <noreply@mendio.io>',
      to: email,
      subject: 'Tack för ditt köp - Mendio Pro',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background-color: #1e40af; padding: 32px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                          🎉 Välkommen till Mendio Pro!
                        </h1>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 32px;">
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 20px; font-weight: 600;">
                          Hej ${name}!
                        </h2>
                        
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                          Tack för ditt köp! Du har nu tillgång till <strong>Mendio Pro</strong> och kan börja din djupgående AI-analys.
                        </p>

                        <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0;">
                          <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 16px; font-weight: 600;">
                            Vad ingår i Pro:
                          </h3>
                          <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
                            <li>15-20 djupgående frågor om din arbetsdag</li>
                            <li>Komplett AI-guide skräddarsydd för dig</li>
                            <li>15+ AI-verktyg med detaljerade guider</li>
                            <li>Nedladdningsbar PDF (20-30 sidor)</li>
                            <li>AI-Coach i 30 dagar</li>
                            <li>4-veckors implementeringsplan</li>
                          </ul>
                        </div>

                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 24px 0;">
                              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://mendio.io'}/premium/interview" style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                                Starta din analys
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                          Har du frågor? Svara på detta mail så hjälper vi dig!
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                          © 2025 Mendio. Gör jobbet enklare med AI.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
