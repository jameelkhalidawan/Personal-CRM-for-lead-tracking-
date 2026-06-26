const { scrapeGoogleMaps } = require('./googleMapsScraper.cjs');

function send(message) {
  if (process.send) process.send(message);
}

function required(value, name) {
  if (!String(value ?? '').trim()) {
    throw new Error(`${name} is required.`);
  }
  return String(value).trim();
}

function restHeaders({ anonKey, accessToken }, extra = {}) {
  return {
    apikey: anonKey,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

function restUrl(baseUrl, path, query = '') {
  return `${baseUrl.replace(/\/$/, '')}/rest/v1/${path}${query}`;
}

async function restRequest(config, path, { method = 'GET', query = '', body, headers = {} } = {}) {
  const response = await fetch(restUrl(config.supabaseUrl, path, query), {
    method,
    headers: restHeaders(config, headers),
    body: body == null ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message = data?.message || data?.hint || text || `Supabase request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

function eqFilter(column, value) {
  return `${column}=eq.${encodeURIComponent(value)}`;
}

async function createJob(config, payload) {
  const rows = await restRequest(config, 'scrape_jobs', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: {
      keyword: payload.keyword,
      city: payload.city,
      state: payload.state,
      status: 'running',
      started_at: new Date().toISOString(),
      created_by: payload.userId || null,
    },
  });
  return rows?.[0];
}

async function updateJob(config, jobId, patch) {
  await restRequest(config, 'scrape_jobs', {
    method: 'PATCH',
    query: `?id=eq.${encodeURIComponent(jobId)}`,
    headers: { Prefer: 'return=minimal' },
    body: patch,
  });
}

async function findDuplicateLead(config, lead) {
  const name = String(lead.business_name ?? '').trim();
  if (!name) return null;

  const filters = [];
  if (lead.address) {
    filters.push([eqFilter('business_name', name), eqFilter('address', lead.address)]);
  }
  if (lead.phone_number) {
    filters.push([eqFilter('business_name', name), eqFilter('phone_number', lead.phone_number)]);
  }

  for (const pair of filters) {
    const query = `?select=id&${pair.join('&')}&limit=1`;
    const rows = await restRequest(config, 'scraped_leads', { query });
    if (rows?.[0]) return rows[0];
  }

  return null;
}

async function insertLeadIfNew(config, lead, payload, jobId) {
  const duplicate = await findDuplicateLead(config, lead);
  if (duplicate) return { inserted: false, duplicateId: duplicate.id };

  const rows = await restRequest(config, 'scraped_leads', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: {
      business_name: lead.business_name,
      email: lead.email || null,
      phone_number: lead.phone_number || null,
      website: lead.website || null,
      address: lead.address || null,
      area_served: lead.area_served || null,
      rating: lead.rating ?? null,
      total_reviews: lead.total_reviews ?? null,
      search_keyword: payload.keyword,
      search_city: payload.city,
      search_state: payload.state,
      status: 'fresh',
      scrape_job_id: jobId,
    },
  });

  return { inserted: true, lead: rows?.[0] };
}

async function run(payload) {
  const config = {
    supabaseUrl: required(payload.supabaseUrl, 'Supabase URL'),
    anonKey: required(payload.supabaseAnonKey, 'Supabase anon key'),
    accessToken: required(payload.accessToken, 'Supabase access token'),
  };

  const input = {
    keyword: required(payload.keyword, 'Keyword'),
    city: required(payload.city, 'City'),
    state: required(payload.state, 'State'),
    userId: payload.userId || null,
    maxResults: Number(payload.maxResults) || 30,
  };

  const job = await createJob(config, input);
  if (!job?.id) throw new Error('Could not create scrape job.');

  send({ type: 'job-created', jobId: job.id });

  try {
    const leads = await scrapeGoogleMaps({
      ...input,
      onProgress: (progress) => send({ type: 'progress', jobId: job.id, progress }),
    });

    let insertedCount = 0;
    let duplicateCount = 0;

    for (let i = 0; i < leads.length; i += 1) {
      const lead = leads[i];
      send({
        type: 'progress',
        jobId: job.id,
        progress: {
          stage: 'saving',
          message: `Saving lead ${i + 1} of ${leads.length}`,
          found: leads.length,
          processed: i,
          inserted: insertedCount,
          duplicates: duplicateCount,
        },
      });

      const result = await insertLeadIfNew(config, lead, input, job.id);
      if (result.inserted) insertedCount += 1;
      else duplicateCount += 1;
    }

    await updateJob(config, job.id, {
      status: 'completed',
      results_count: insertedCount,
      completed_at: new Date().toISOString(),
      error_message: null,
    });

    send({
      type: 'complete',
      jobId: job.id,
      result: {
        ok: true,
        jobId: job.id,
        scrapedCount: leads.length,
        insertedCount,
        duplicateCount,
      },
    });
  } catch (error) {
    await updateJob(config, job.id, {
      status: 'failed',
      error_message: error.message,
      completed_at: new Date().toISOString(),
    });
    throw error;
  }
}

process.on('message', async (payload) => {
  try {
    await run(payload ?? {});
  } catch (error) {
    send({
      type: 'failed',
      error: error.message || 'Scrape failed.',
    });
    process.exitCode = 1;
  }
});

send({ type: 'ready' });
