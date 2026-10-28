# LYG GolfStart AI v2.0 – GRATIS

## Vigtig forskel
Pakken fungerer STRAKS som gratis intelligent FAQ. Rigtig AI er først aktiv, når Cloudflare Worker er oprettet, og URL sat ind. Chatten henter ikke live data før da. Det er ikke muligt at hoste server-AI alene via GitHub Pages.

## Installation i eksisterende begynderapp (sikker måde)
1. Download ZIP, pak den ud. Den indeholder mappen `LYG_GolfStart_AI_v2_0`.
2. I GitHub-repo `LYG-Begynder`, upload selve mappen i roden, parallelt med din eksisterende `index.html` og den gamle integrationsmappe.
3. Åbn `index.html` i GitHubs editor. Nederst findes denne linje:
   `<script src="./LYG_GolfStart_integration_v1_1/golfstart-widget.js"></script>`
4. **ERSTAT den linje (ikke indsæt en ekstra) med:**
   `<script src="./LYG_GolfStart_AI_v2_0/golfstart-widget.js"></script>`
5. Commit. Chatten virker nu i FAQ-tilstand på GitHub Pages, uden andre ændringer i appen.

## Gratis Cloudflare AI, valgfri aktivering
1. Opret Cloudflare-konto og vælg **Workers Free**. Vælg IKKE Workers Paid eller AI Gateway betalingskreditter. Kontrollér at gratisplanen er valgt.
2. Opret Worker via Cloudflare Dashboard. Kopiér indholdet af `cloudflare-worker/worker.js` og tilføj en Workers AI binding med navnet `AI`. Alternativt anvend `wrangler.toml` i udviklermiljø.
3. Deploy. Kopiér din offentlige Worker URL, fx `https://lyg-golfstart-ai-free.<din-konto>.workers.dev`.
4. Åbn GitHub-filen `LYG_GolfStart_AI_v2_0/golfstart-chat.js` og indsæt URL'en mellem citationstegn i `GOLFSTART_WORKER_URL = ''` øverst.
5. Commit og test. Lad `index.html` være urørt.

## Helt gratis: væsentlige forbehold
- Cloudflare tilbyder 10.000 gratis Workers AI-neuroner/dag på Workers FREE; over grænsen fejler AI-forespørgslen, og lokal FAQ tager over. Tjek gældende vilkår før opsætning.
- Ingen betalingskort, ingen betalt plan; hvis Cloudflare kræver opgradering, så stop og fortsæt kun med FAQ.
- Dette er en offentlig AI-endpoint; enhver kan potentielt ramme den. På gratisplan kan den bruges op af fremmede og dermed nå gratisgrænsen. Der er ingen garanti for et bestemt antal samtaler.
- Worker henter de 3 offentlige sider ved forespørgsel med cache på Cloudflare. Det er ikke en fuldstændig websøgning; svar afhænger af tilgængelige sider og deres tekst.
- Brug ikke private oplysninger, API-nøgler eller betalingskort i GitHub-kode.
- AI kan begå fejl, især omkring regler, priser og hold. Følg kildelinks og få klubben til at godkende tidsfølsomme svar.
- Hvis AI ikke svarer, fungerer gratis FAQ automatisk.

## Test
Spørg: "Hvordan tilmelder jeg mig?", "Hvad hvis jeg ikke kan deltage i alle moduler?", "Kan man spise i Brasseriet?", "Hvornår starter hold i 2027?".

Tekniske kilder: https://developers.cloudflare.com/workers-ai/platform/pricing/ og https://developers.cloudflare.com/workers-ai/configuration/bindings/
