import { chromium } from 'playwright';

async function run() {
  const baseUrl = process.env.E2E_BASE || 'https://optero-production.up.railway.app';
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const context = await browser.newContext();
  const page = await context.newPage();

  const log = (...args) => console.log('[E2E]', ...args);

  try {
    log('Open start page');
    await page.goto(`${baseUrl}/business/executive-consultant`, { waitUntil: 'networkidle' });

    log('Fill URL and three problems');
    await page.fill('input[type="url"]', 'https://www.spotify.com');
    const problems = [
      'Säljcykler för långa',
      'Låg konvertering MQL->SQL',
      'Onboarding drar ut på tiden'
    ];
    for (let i = 0; i < 3; i++) {
      await page.locator('textarea').nth(i).fill(problems[i]);
    }

    log('Start consultation');
    await page.click('button:has-text("Starta AI-konsultation")');
    await page.waitForURL('**/business/executive-consultant/interview', { timeout: 120000 });

    // Wait for first AI question or initial content
    await page.waitForSelector('div.p-6 >> text=/Berätta mer|Kan du|Beskriv|specificera/i', { timeout: 90000 }).catch(() => {});

    const sendTurn = async (text) => {
      await page.fill('input[placeholder="Skriv ditt svar..."]', text);
      // On key press Enter to submit
      await page.press('input[placeholder="Skriv ditt svar..."]', 'Enter');
      // Wait a bit for AI response
      await page.waitForTimeout(4000);
      await page.waitForLoadState('networkidle');
    };

    // Iterate up to 3 problems, 5 turns each, until generate button appears
    for (let problemIdx = 0; problemIdx < 3; problemIdx++) {
      log(`Answering interview turns for problem ${problemIdx + 1}`);
      await sendTurn('Beslutsprocessen är lång, få beslutsfattare närvarande.');
      await sendTurn('MQL/SQL-kriterier otydliga och fält fylls i sporadiskt.');
      await sendTurn('Säkerhets- och juridik-granskning tar tid.');
      await sendTurn('Vi saknar automationsregler i CRM.');
      await sendTurn('Onboarding kräver många manuella steg och utbildning.');

      // Check if generate button is available
      const genBtn = page.locator('button:has-text("Generera djupgående lösningar")');
      if (await genBtn.count().then(c => c > 0)) {
        log('Generate solutions');
        await genBtn.first().click();
        break;
      }

      // Wait a moment for auto-advance to next problem
      await page.waitForTimeout(4000);
    }

    await page.waitForURL('**/business/executive-consultant/solution', { timeout: 180000 });
    log('Waiting for solutions to render');
    await page.waitForSelector('text=Executive AI-lösningar', { timeout: 180000 });

    // Check there is at least one solution card
    const cards = page.locator('div.space-y-6 > div.bg-white');
    const cardCount = await cards.count();
    log('Solutions found:', cardCount);
    if (cardCount < 1) {
      throw new Error('No solutions cards rendered');
    }

    // Extract the first solution title for logging
    const firstTitle = await cards.nth(0).locator('h3').first().textContent().catch(() => 'N/A');
    log('First solution title:', firstTitle?.trim());

    console.log(JSON.stringify({ ok: true, cards: cardCount, firstTitle: (firstTitle||'').trim() }));
  } catch (e) {
    console.error(JSON.stringify({ ok: false, error: String(e) }));
    process.exitCode = 1;
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
}

run();


