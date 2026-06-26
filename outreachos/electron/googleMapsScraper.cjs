const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const DEFAULT_MAX_RESULTS = 30;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(min = 1500, max = 4000) {
  return sleep(Math.floor(min + Math.random() * (max - min)));
}

function cleanText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function parseReviewCount(value) {
  const match = cleanText(value).match(/\(?([\d,]+)\)?/);
  return match ? Number(match[1].replace(/,/g, '')) : null;
}

function normalizeWebsite(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('google.') || parsed.hostname.includes('gstatic.')) {
      return '';
    }
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return '';
  }
}

async function acceptConsentIfPresent(page) {
  try {
    const labels = ['Accept all', 'I agree', 'Accept'];
    for (const label of labels) {
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await page.evaluate((el) => el.textContent, button);
        if (cleanText(text).toLowerCase() === label.toLowerCase()) {
          await button.click();
          await randomDelay(500, 1200);
          return;
        }
      }
    }
  } catch {
    // Consent UI varies by account/region; ignore when not present.
  }
}

async function collectResultLinks(page, maxResults, onProgress) {
  const seen = new Map();
  const feedSelector = '[role="feed"]';

  await page.waitForSelector('body', { timeout: 30000 });
  await acceptConsentIfPresent(page);

  for (let i = 0; i < 12 && seen.size < maxResults; i += 1) {
    const links = await page.evaluate(() => {
      return [...document.querySelectorAll('a[href*="/maps/place/"]')]
        .map((anchor) => ({
          href: anchor.href,
          name: anchor.getAttribute('aria-label') || anchor.textContent || '',
        }))
        .filter((item) => item.href);
    });

    for (const link of links) {
      if (!seen.has(link.href)) {
        seen.set(link.href, {
          href: link.href,
          name: cleanText(link.name),
        });
      }
    }

    onProgress?.({
      stage: 'collecting',
      message: `Found ${seen.size} result links`,
      found: seen.size,
    });

    const scrolled = await page.evaluate((selector) => {
      const feed = document.querySelector(selector);
      const target = feed || document.scrollingElement || document.body;
      const before = target.scrollTop;
      target.scrollBy(0, 1400);
      return target.scrollTop !== before;
    }, feedSelector);

    if (!scrolled && i > 2) break;
    await randomDelay();
  }

  return [...seen.values()].slice(0, maxResults);
}

async function extractLeadFromDetail(page, fallbackName) {
  return page.evaluate((fallback) => {
    const text = (value) => String(value || '').replace(/\s+/g, ' ').trim();
    const attr = (selector, name) => document.querySelector(selector)?.getAttribute(name) || '';
    const title = text(document.querySelector('h1')?.textContent) || fallback;
    const pageText = text(document.body?.innerText);

    const website =
      document.querySelector('a[data-item-id="authority"]')?.href ||
      [...document.querySelectorAll('a[href^="http"]')]
        .map((a) => a.href)
        .find((href) => !/google|gstatic|schema\.org/.test(href)) ||
      '';

    const address =
      attr('button[data-item-id="address"]', 'aria-label').replace(/^Address:\s*/i, '') ||
      text(document.querySelector('button[data-item-id="address"]')?.textContent);

    const phoneButton =
      document.querySelector('button[data-item-id^="phone"]') ||
      [...document.querySelectorAll('button[aria-label]')].find((button) =>
        /^Phone:/.test(button.getAttribute('aria-label') || ''),
      );

    const phone =
      (phoneButton?.getAttribute('aria-label') || '').replace(/^Phone:\s*/i, '') ||
      text(phoneButton?.textContent);

    const ratingMatch = pageText.match(/([0-5]\.\d)\s*(?:stars?)?\s*\(?([\d,]+)?\)?/i);
    const category =
      text(document.querySelector('button[jsaction][aria-label]:not([data-item-id])')?.textContent) ||
      text([...document.querySelectorAll('button')].find((button) => {
        const value = text(button.textContent);
        return value && value.length < 60 && !/\d|Directions|Save|Share|Call|Website/.test(value);
      })?.textContent);

    return {
      business_name: title,
      website,
      address,
      phone_number: phone,
      area_served: category,
      rating: ratingMatch ? Number(ratingMatch[1]) : null,
      total_reviews: ratingMatch?.[2] ? Number(ratingMatch[2].replace(/,/g, '')) : null,
    };
  }, fallbackName);
}

async function fetchText(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
        accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!response.ok) return '';
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return '';
    return await response.text();
  } catch {
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

function firstEmailFromHtml(html) {
  if (!html) return '';
  const mailto = html.match(/mailto:([^"'?#\s>]+)/i)?.[1];
  if (mailto) return mailto.trim();
  const match = html.match(EMAIL_REGEX)?.find((email) => {
    const lower = email.toLowerCase();
    return !lower.endsWith('.png') && !lower.endsWith('.jpg') && !lower.includes('example.');
  });
  return match || '';
}

async function findEmailOnWebsite(website) {
  const normalized = normalizeWebsite(website);
  if (!normalized) return '';

  const urls = [];
  try {
    const base = new URL(normalized);
    urls.push(base.toString());
    urls.push(new URL('/contact', base).toString());
    urls.push(new URL('/contact-us', base).toString());
    urls.push(new URL('/about', base).toString());
  } catch {
    return '';
  }

  for (const url of [...new Set(urls)]) {
    const html = await fetchText(url);
    const email = firstEmailFromHtml(html);
    if (email) return email;
    await randomDelay(300, 900);
  }

  return '';
}

async function scrapeGoogleMaps({ keyword, city, state, maxResults = DEFAULT_MAX_RESULTS, onProgress }) {
  const query = `${keyword} in ${city}, ${state}`;
  const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  let browser;

  onProgress?.({ stage: 'starting', message: `Opening Google Maps for "${query}"` });

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 900 });
    await page.setUserAgent(USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const links = await collectResultLinks(page, maxResults, onProgress);
    if (!links.length) {
      const bodyText = await page.evaluate(() => document.body?.innerText || '');
      if (/captcha|unusual traffic|sorry/i.test(bodyText)) {
        throw new Error('Google blocked the scrape with a CAPTCHA or unusual traffic page.');
      }
      return [];
    }

    const leads = [];
    for (let index = 0; index < links.length; index += 1) {
      const listing = links[index];
      onProgress?.({
        stage: 'extracting',
        message: `Opening listing ${index + 1} of ${links.length}`,
        found: links.length,
        processed: index,
      });

      await page.goto(listing.href, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForSelector('body', { timeout: 30000 });
      await randomDelay();

      const lead = await extractLeadFromDetail(page, listing.name);
      lead.business_name = cleanText(lead.business_name || listing.name);
      lead.website = normalizeWebsite(lead.website);
      lead.phone_number = cleanText(lead.phone_number);
      lead.address = cleanText(lead.address);
      lead.area_served = cleanText(lead.area_served);
      lead.total_reviews = lead.total_reviews ?? parseReviewCount(lead.total_reviews);

      if (lead.website) {
        onProgress?.({
          stage: 'email_lookup',
          message: `Checking website email for ${lead.business_name}`,
          found: links.length,
          processed: index,
        });
        lead.email = await findEmailOnWebsite(lead.website);
      } else {
        lead.email = '';
      }

      if (lead.business_name) leads.push(lead);
      onProgress?.({
        stage: 'extracting',
        message: `Scraped ${leads.length} leads`,
        found: links.length,
        processed: index + 1,
      });
      await randomDelay();
    }

    return leads;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = {
  scrapeGoogleMaps,
};
