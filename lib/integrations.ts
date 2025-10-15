export type IntegrationAvailability = {
  gmail: boolean;
  googleCalendar: boolean;
  hubspot: boolean;
  zendesk: boolean;
  slackWebhook: boolean;
};

export function getIntegrationAvailability(): IntegrationAvailability {
  return {
    gmail: Boolean(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET),
    googleCalendar: Boolean(process.env.GOOGLE_CAL_CLIENT_ID && process.env.GOOGLE_CAL_CLIENT_SECRET),
    hubspot: Boolean(process.env.HUBSPOT_CLIENT_ID && process.env.HUBSPOT_CLIENT_SECRET),
    zendesk: Boolean(process.env.ZENDESK_SUBDOMAIN && process.env.ZENDESK_TOKEN),
    slackWebhook: true // fritt att använda inkommande webhook
  };
}

// No-op stubs (safe to call without credentials)
export async function sendEmailStub(payload: { to: string; subject: string; text: string }) {
  if (!getIntegrationAvailability().gmail) return { ok: false, reason: 'gmail_not_configured' };
  return { ok: true };
}

export async function createCalendarEventStub(payload: { title: string; when: string }) {
  if (!getIntegrationAvailability().googleCalendar) return { ok: false, reason: 'calendar_not_configured' };
  return { ok: true };
}

export async function upsertHubspotContactStub(payload: { email: string; name?: string }) {
  if (!getIntegrationAvailability().hubspot) return { ok: false, reason: 'hubspot_not_configured' };
  return { ok: true };
}

export async function createZendeskTicketStub(payload: { subject: string; description: string; priority?: string }) {
  if (!getIntegrationAvailability().zendesk) return { ok: false, reason: 'zendesk_not_configured' };
  return { ok: true };
}

// Simple AES-GCM encryption helpers for secrets at rest
// NOTE: For production, prefer KMS or environment-level secret management
import crypto from 'crypto';

const ENC_ALGO = 'aes-256-gcm';
const ENC_KEY = (process.env.SECRET_ENC_KEY || '').padEnd(32, '0').slice(0, 32);

export function encryptSecret(plain: string | null | undefined): string | null {
  if (!plain) return null;
  
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ENC_ALGO, Buffer.from(ENC_KEY), iv);
    const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, enc]).toString('base64');
  } catch (error) {
    console.error('Failed to encrypt secret:', error);
    return null;
  }
}

export function decryptSecret(encB64: string | null | undefined): string | null {
  if (!encB64) return null;
  
  try {
    const buf = Buffer.from(encB64, 'base64');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const data = buf.subarray(28);
    const decipher = crypto.createDecipheriv(ENC_ALGO, Buffer.from(ENC_KEY), iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(data), decipher.final()]);
    return dec.toString('utf8');
  } catch (error) {
    console.error('Failed to decrypt secret:', error);
    return null;
  }
}
