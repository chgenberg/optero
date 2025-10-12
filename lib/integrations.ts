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


