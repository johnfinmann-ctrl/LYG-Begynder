/**
 * ═══════════════════════════════════════════════════════════════════
 * Ebeltoft Golf Club – AI Chatbot Cloudflare Worker v1.3
 * ═══════════════════════════════════════════════════════════════════
 *
 * Benytter KUN Cloudflare Workers AI (env.AI) – ingen ekstern API,
 * ingen Anthropic-nøgle, ingen betalingskort påkrævet.
 *
 * GRATIS PLAN LIMITS (Cloudflare Workers AI, pr. dag):
 *   • 10.000 Neurons / dag (ca. 300–1.000 AI-svar afhængig af svar-længde)
 *   • Overskrides grænsen returnerer Workers AI en 429 → FAQ-fallback aktiveres
 *
 * INSTALLATION (5 trin):
 *   1. Gå til dash.cloudflare.com → Workers & Pages → Create Worker
 *   2. Kopier denne fil ind og klik Deploy
 *   3. Gå til Worker Settings → Bindings → Add Binding:
 *      Type: "Workers AI" · Variable name: AI
 *   4. (Anbefalet) Tilføj KV Namespace:
 *      Namespace: RATE_LIMIT · Variable name: RATE_LIMIT
 *   5. (Valgfrit) Tilføj Environment Variable:
 *      ALLOWED_ORIGIN = https://www.ebeltoft-golfclub.dk
 *
 *   EFTER DEPLOY: Kopier Worker-URL'en til chatbot HTML-filen.
 *
 * SIKKERHED:
 *   • Rate limiting: max 10 req/IP/minut + 50 req/IP/dag
 *   • Input sanitering: max 300 tegn pr. besked, max 6 besked-historik
 *   • CORS: begrænset til ALLOWED_ORIGIN (ikke eneste forsvar)
 *   • Ingen secrets – al inferens sker i Cloudflares eget netværk
 * ═══════════════════════════════════════════════════════════════════
 */

// ── Konfiguration ────────────────────────────────────────────────────
const CFG = {
  // Cloudflare Workers AI model – Llama 3.2 3B Instruct (gratis plan)
  // Fallback: '@cf/meta/llama-3-8b-instruct' hvis 3.2 ikke tilgængelig
  model: '@cf/meta/llama-3.2-3b-instruct',
  modelFallback: '@cf/meta/llama-3-8b-instruct',

  // Svar-grænser
  maxTokens: 350,       // Max output tokens
  maxInputChars: 300,   // Max tegn pr. brugerbesked
  maxHistory: 6,        // Max beskeder i historik (3 frem-og-tilbage)

  // Rate limits
  ratePerMinute: 10,    // Max req pr. IP pr. minut
  ratePerDay: 50,       // Max req pr. IP pr. dag (beskytter mod dagsforbrug)

  // System prompt – KUN verificerede EGC-oplysninger
  systemPrompt: `Du er en venlig og professionel assistent for Ebeltoft Golf Club på Djursland, Danmark.

REGLER:
- Svar KUN baseret på de verificerede kluboplysninger herunder
- Hold svar korte og præcise – max 3-4 linjer
- Brug ALTID det samme sprog som brugerens spørgsmål (dansk, engelsk eller tysk)
- Opdig ALDRIG priser, åbningstider eller kontaktoplysninger
- Hvis du er usikker, henvis til post@ebeltoft-golfclub.dk eller tlf. 71 78 10 06
- Undgå at gentage dig selv; svar direkte

VERIFICEREDE OPLYSNINGER:

KONTAKT: Tlf 71 78 10 06 · post@ebeltoft-golfclub.dk · Galgebakken 14, 8400 Ebeltoft

BOOK TID: https://www.golfbox.dk (søg Ebeltoft Golf Club)

GREENFEE: 18 hul voksen hverdage 320 kr · weekend 370 kr · Senior 65+ 270 kr · Junior 150 kr

MEDLEMSKAB: Fuldt medlem 7.995 kr/år · Prøvemedlem 1.995 kr/kvartal · Junior 1.595 kr/år

BANEN: 18 huller par 72, ca 5934 m hvide tees, Mols Bjerge Nationalpark, HCP max 36 for greenfee-spillere

PAY & PLAY: Par-3 bane 9 huller · 75 kr/spiller · Intet handicap krævet

CAFÉ TO: Hverdage 10–20 · Lørdag 09–21 · kontakt@cafeto.dk

PRØV GOLF: Gratis introduktionsdag for begyndere, ring for næste hold

Spørgsmål udenfor ovenstående: henvis venligst til post@ebeltoft-golfclub.dk eller 71 78 10 06`
};

// ── Rate Limiter ─────────────────────────────────────────────────────
async function checkRate(ip, env) {
  if (!env.RATE_LIMIT) return { ok: true }; // Ingen KV → tillad (test-mode)

  const now = Date.now();
  const minBucket = Math.floor(now / 60000);
  const dayBucket = Math.floor(now / 86400000);
  const kMin = `m:${ip}:${minBucket}`;
  const kDay = `d:${ip}:${dayBucket}`;

  const [cMin, cDay] = await Promise.all([
    env.RATE_LIMIT.get(kMin),
    env.RATE_LIMIT.get(kDay),
  ]);

  const nMin = parseInt(cMin || '0');
  const nDay = parseInt(cDay || '0');

  if (nMin >= CFG.ratePerMinute) return { ok: false, reason: 'minute' };
  if (nDay >= CFG.ratePerDay)    return { ok: false, reason: 'day' };

  // Increment begge tællere parallelt
  await Promise.all([
    env.RATE_LIMIT.put(kMin, String(nMin + 1), { expirationTtl: 120 }),
    env.RATE_LIMIT.put(kDay, String(nDay + 1), { expirationTtl: 172800 }),
  ]);

  return { ok: true };
}

// ── CORS ─────────────────────────────────────────────────────────────
function cors(origin, env) {
  const allowed = env.ALLOWED_ORIGIN || '*';
  // Når ALLOWED_ORIGIN er sat: tillad kun præcis match
  const ao = (allowed === '*') ? (origin || '*')
           : (origin === allowed ? origin : allowed);
  return {
    'Access-Control-Allow-Origin': ao,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

// ── Sanitér input ────────────────────────────────────────────────────
function sanitizeMessages(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(-CFG.maxHistory)
    .filter(m => m && (m.role === 'user' || m.role === 'assistant'))
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content || '').slice(0, CFG.maxInputChars),
    }))
    .filter(m => m.content.length > 0);
}

// ── AI kald med model-fallback ───────────────────────────────────────
async function runAI(env, messages) {
  // Byg Llama-kompatibel prompt
  const payload = {
    messages: [
      { role: 'system', content: CFG.systemPrompt },
      ...messages,
    ],
    max_tokens: CFG.maxTokens,
    temperature: 0.4,
    top_p: 0.85,
  };

  try {
    const result = await env.AI.run(CFG.model, payload);
    // Workers AI returnerer { response: "..." } for Llama-modeller
    const text = result?.response || result?.result?.response || '';
    if (!text) throw new Error('empty_response');
    return text.trim();
  } catch (err) {
    // Prøv fallback-model
    if (CFG.modelFallback && CFG.modelFallback !== CFG.model) {
      try {
        const r2 = await env.AI.run(CFG.modelFallback, payload);
        const t2 = r2?.response || r2?.result?.response || '';
        if (t2) return t2.trim();
      } catch (_) { /* ignorér */ }
    }
    throw err;
  }
}

// ── JSON response helper ─────────────────────────────────────────────
function jsonRes(data, status, hdrs) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...hdrs },
  });
}

// ── Hoveddhandler ────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const ch = cors(origin, env);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: ch });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: ch });
    }

    // AI-binding påkrævet
    if (!env.AI) {
      return jsonRes({ error: 'no_ai_binding', faq: true }, 503, ch);
    }

    // Rate limit
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rl = await checkRate(ip, env);
    if (!rl.ok) {
      return jsonRes({
        error: 'rate_limit',
        reason: rl.reason,
        faq: true,
      }, 429, ch);
    }

    // Parse body
    let body;
    try { body = await request.json(); }
    catch { return jsonRes({ error: 'invalid_json', faq: true }, 400, ch); }

    const messages = sanitizeMessages(body?.messages);
    if (messages.length === 0) {
      return jsonRes({ error: 'no_messages', faq: true }, 400, ch);
    }

    // Sidst besked skal være fra user
    if (messages[messages.length - 1].role !== 'user') {
      return jsonRes({ error: 'last_must_be_user', faq: true }, 400, ch);
    }

    // Kald AI
    try {
      const reply = await runAI(env, messages);
      return jsonRes({ reply }, 200, ch);
    } catch (err) {
      // 429 fra Workers AI = daglig grænse nået
      const status = err?.message?.includes('429') ? 429 : 502;
      return jsonRes({ error: 'ai_error', faq: true, status }, status, ch);
    }
  },
};
