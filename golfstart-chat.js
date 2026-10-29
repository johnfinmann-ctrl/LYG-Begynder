// Konfiguration: Cloudflare Worker-URL (ingen API-nøgler i frontend). Tom streng = kun lokal FAQ.
const GOLFSTART_WORKER_URL = 'https://lyg-golfstart-ai.john-finmann.workers.dev/';
const pages={begynder:'https://lyg.dk/begyndergolf/',brass:'https://lyg.dk/brasseriet/',kontakt:'https://lyg.dk/kontakt/',golfbox:'https://www.golfbox.dk/'};
const faq=[
 {find:/2027|næste år|naeste aar/,a:'Programmet for 2027 er ikke bekræftet i denne version. Klubben planlægger turboforløb; se klubbens officielle side for nye datoer.',url:pages.begynder},
 {find:/alle moduler|manglende modul|ikke deltage|springe over|fravær|fravaer|forhindret/,a:'Kontakt begynderteamet hurtigst muligt, så I kan aftale, hvordan du kan gennemføre manglende undervisning. Jeg kan ikke love merit, erstatningsmoduler eller fritagelse uden klubbens godkendelse.',url:pages.kontakt},
 {find:/tilmeld|opret|registr|begynde|starte på|starte paa/,a:'Gå til Lyngbygaards officielle side om begyndergolf, vælg et aktuelt hold og følg klubbens tilmeldingsvejledning. Hvis et hold er lukket, så kontakt klubben på 87 44 10 70 eller info@lyg.dk.',url:pages.begynder},
 {find:/brass|restaurant|mad|spise|frokost|menu|bord/,a:'Brasseriet ligger ved 18. hul og tilbyder servering samt selskaber. Menukort og åbningstider kan ændre sig. Se Brasseriets officielle side, og kontakt restaurant@lyg.dk ved spørgsmål eller bordbestilling.',url:pages.brass},
 {find:/golfbox|book|starttid|tee time/,a:'GolfBox bruges blandt andet til at bestille starttider. Åbn GolfBox og log ind med dine oplysninger. Klubben hjælper, hvis du mangler adgang.',url:pages.golfbox},
 {find:/begyndermix|begynder.mix|mandag/,a:'BegynderMix er en social golfaktivitet, hvor du får erfaring med at spille på banen. På klubbens begynderside beskrives BegynderMix om mandagen. Følg altid dit eget holdprogram.',url:pages.begynder},
 {find:/buggy|golfbil/,a:'Følg klubbens skiltning og lokale restriktioner for golfbuggy. Undgå greens, tees og våde områder, medmindre lokale regler udtrykkeligt tillader kørsel.',url:pages.begynder},
 {find:/handicap|stableford|regelprøve|regler|etik|banevejledning/,a:'Begynderforløbet indeholder undervisning i regler, etik og spil på banen. Spørg begynderteamet om præcis dokumentation for spilletilladelse, og brug den aktuelle holdplan.',url:pages.begynder},
 {find:/pris|koster|medlem|forløb|undervisning|turbo/,a:'Klubbens officielle begynderside beskriver almindelige forløb og turboforløb. Priser og medlemsvilkår kan ændre sig, så kontrollér dem på siden, før du tilmelder dig.',url:pages.begynder}
];
function normalized(s){return s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/æ/g,'ae').replace(/ø/g,'oe').replace(/å/g,'aa')}
function fallback(q){const f=faq.find(x=>x.find.test(normalized(q)));return f||{a:'Jeg kan ikke give et sikkert svar på det spørgsmål endnu. Se klubbens officielle information eller kontakt klubben på info@lyg.dk / 87 44 10 70.',url:pages.kontakt}}
const log=document.querySelector('#messages'),input=document.querySelector('#question'),btn=document.querySelector('.composer button');
function bubble(txt,role){const d=document.createElement('div');d.className='bubble '+role;d.textContent=txt;log.append(d);log.scrollTop=log.scrollHeight;return d}
function addSources(el,urls){const ok=(urls||[]).filter(u=>/^https:\/\//.test(u));if(!ok.length)return;const s=document.createElement('div');s.className='sources';ok.forEach(u=>{const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener noreferrer';a.textContent=u.includes('brasseriet')?'Brasseriet ↗':u.includes('kontakt')?'Kontakt ↗':u.includes('golfbox')?'GolfBox ↗':'Læs mere ↗';s.append(a)});el.append(s)}
let busy=false;
async function send(q){q=q.trim();if(!q||busy)return;busy=true;btn.disabled=true;bubble(q,'user');const pending=bubble('Finder et svar ...','bot pending');
 const r=fallback(q);let answer=r.a,urls=[r.url];
 if(GOLFSTART_WORKER_URL){try{const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),20000);let res;try{res=await fetch(GOLFSTART_WORKER_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q}),signal:ctl.signal})}finally{clearTimeout(t)}
  if(res.ok){const j=await res.json();if(typeof j.answer==='string'&&j.answer.trim()){answer=j.answer.trim();const allowed=Object.values(pages);const s=Array.isArray(j.sources)?j.sources.filter(x=>allowed.includes(x)):[];urls=s.length?s:urls}}}catch(e){/* offline/grænse: bruger lokal FAQ */}}
 pending.className='bubble bot';pending.textContent=answer;addSources(pending,urls);log.scrollTop=log.scrollHeight;busy=false;btn.disabled=false;if(!matchMedia('(pointer:coarse)').matches)input.focus()}
function grow(){input.style.height='auto';const h=Math.min(Math.max(input.scrollHeight,64),130);input.style.height=h+'px'}
input.addEventListener('input',grow);
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();document.querySelector('#form').requestSubmit()}});
input.addEventListener('focus',()=>setTimeout(()=>{log.scrollTop=log.scrollHeight},300));
document.querySelector('#form').addEventListener('submit',e=>{e.preventDefault();const q=input.value;input.value='';grow();send(q)});
document.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>send(b.dataset.q)));
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data==='lyg-golfstart-focus'&&!matchMedia('(pointer:coarse)').matches)input.focus()});
