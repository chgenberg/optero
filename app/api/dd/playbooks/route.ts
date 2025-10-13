import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { url, analysis, problem, userKpis, integrations, blueprint, selectedTemplates } = await req.json();
    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });
    const normalizeUrl = (input: string) => {
      let u = (input || '').trim();
      if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
      return u;
    };
    const normUrl = normalizeUrl(url);

    const suggested: any = analysis?.scoring?.suggestedKPIs || {};
    // Map raw user inputs to structured KPIs (override suggestions when provided)
    const toNumber = (v: any) => (v === 0 || v === '0') ? 0 : (v ? Number(v) : undefined);
    const mql = toNumber(userKpis?.mql);
    const tickets = toNumber(userKpis?.tickets);
    const aht = toNumber(userKpis?.aht);
    const conversion = toNumber(userKpis?.conversion);

    const mergedKPIs: any = {
      lead: suggested.lead ? { ...suggested.lead } : undefined,
      support: suggested.support ? { ...suggested.support } : undefined,
      knowledge: suggested.knowledge ? { ...suggested.knowledge } : undefined
    };
    if (typeof mql === 'number' && !Number.isNaN(mql)) {
      mergedKPIs.lead = { ...(mergedKPIs.lead || {}), targetMQL: mql };
    }
    if (typeof tickets === 'number' && !Number.isNaN(tickets)) {
      // If user provides current tickets, keep suggested deflection; user target could be future extension
      mergedKPIs.support = { ...(mergedKPIs.support || {}), currentTickets: tickets };
    }
    if (typeof aht === 'number' && !Number.isNaN(aht)) {
      mergedKPIs.knowledge = { ...(mergedKPIs.knowledge || {}), targetAHT: aht };
    }
    if (typeof conversion === 'number' && !Number.isNaN(conversion)) {
      mergedKPIs.lead = { ...(mergedKPIs.lead || {}), currentConversion: conversion };
    }

    const blueprintChoice = (blueprint as string) || 'standard';
    const requireApprovalDefault = blueprintChoice === 'aggressive' ? false : true;

    const sharedSpec: any = {
      role: 'company_bot',
      url,
      context: { websiteMainText: analysis?.scrape?.summary?.mainText || analysis?.scrape?.content || '' },
      plan: 'free',
      problem: problem || undefined,
      kpis: mergedKPIs || undefined,
      webhookUrl: integrations?.webhookUrl || undefined,
      slackWebhook: integrations?.slackWebhook || undefined,
      hubspotEnabled: Boolean(integrations?.hubspotEnabled) || false,
      blueprint: blueprintChoice
    };

    const created = [] as any[];

    const templates: string[] = Array.isArray(selectedTemplates) && selectedTemplates.length
      ? selectedTemplates
      : ['knowledge.faq','lead.standard','support.standard'];

    for (const tpl of templates) {
      const [type, subtype] = String(tpl).split('.') as [string, string?];
      const name = `${(type||'bot')[0].toUpperCase()}${(type||'bot').slice(1)}${subtype? ` (${subtype.replace(/_/g,' ')})` : ''} for ${normUrl}`;
      created.push(await prisma.bot.create({ data: { name, type, companyUrl: normUrl, spec: { ...sharedSpec, subtype: subtype || null, requireApproval: requireApprovalDefault } } }));
    }

    return NextResponse.json({ created, url: normUrl });
  } catch (e: any) {
    return NextResponse.json({ error: 'dd_playbooks_failed' }, { status: 500 });
  }
}


