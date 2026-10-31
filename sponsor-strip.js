/* Add agreed sponsors here: {name, url, logo}. Empty list hides the strip.
   ?sponsorPreview=1 displays clearly labelled examples, without live sponsor claims. */
(() => {
  const sponsors = [
    {name: 'Golfeksperten', url: 'https://www.golfeksperten.dk'},
    {name: 'Lyngbygaard Golf', url: 'https://lyg.dk'},
    {name: 'Brasseriet', url: 'https://www.lyg-brasseriet.dk'}
  ];
  const preview = new URLSearchParams(location.search).get('sponsorPreview') === '1';
  const entries = preview ? ['Golfeksperten', 'Sponsor 2', 'Sponsor 3', 'Sponsor 4', 'Sponsor 5', 'Sponsor 6'].map(name => ({name})) : sponsors;
  if (!entries.length) return;
  const nav = document.querySelector('.bottom-nav');
  if (!nav) return;
  const style = document.createElement('style');
  style.textContent = `
.lyg-sponsors{position:fixed;left:0;right:0;margin:auto;max-width:500px;bottom:var(--sponsor-nav-height);height:50px;box-sizing:border-box;background:#faf6ec;border-top:1px solid #c9a84c;z-index:499;display:flex;align-items:center;color:#1a3d1a;font:600 12px system-ui}
.lyg-sponsor-label{padding:0 9px;font-size:9px;max-width:62px;flex-shrink:0}
.lyg-sponsor-window{overflow:hidden;flex:1;min-width:0;height:100%;display:flex;align-items:center}
.lyg-sponsor-track{display:flex;width:max-content;animation:lyg-sponsor-roll var(--sponsor-duration) linear infinite}
.lyg-sponsor-group{display:flex;align-items:center;flex-shrink:0}
.lyg-sponsor-item{width:132px;padding:0 12px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;height:38px;color:#1a3d1a;text-decoration:none;text-align:center;white-space:nowrap}
.lyg-sponsor-item img{max-width:108px;max-height:30px;object-fit:contain}
.lyg-sponsor-pause{border:0;background:transparent;color:#1a3d1a;cursor:pointer;padding:8px;font-size:16px}
.lyg-sponsors:focus-within .lyg-sponsor-track,.lyg-sponsors:hover .lyg-sponsor-track,.lyg-sponsors[data-paused=true] .lyg-sponsor-track{animation-play-state:paused}
@keyframes lyg-sponsor-roll{to{transform:translateX(-50%)}}
html.lyg-has-sponsors body{padding-bottom:calc(var(--sponsor-nav-height) + 68px)}
html.lyg-has-sponsors{scroll-padding-bottom:calc(var(--sponsor-nav-height) + 68px)}
html.lyg-has-sponsors #lyg-golfstart-launcher{bottom:calc(var(--sponsor-nav-height) + 64px)!important}
@media(prefers-reduced-motion:reduce){.lyg-sponsor-track{animation:none}.lyg-sponsor-window{overflow-x:auto}.lyg-sponsor-group[aria-hidden=true]{display:none}}
`;
  document.head.append(style);
  const bar = document.createElement('aside'); bar.className='lyg-sponsors'; bar.setAttribute('aria-label', preview ? 'Sponsorstribe – demonstration' : 'Sponsorer');
  const label = document.createElement('span'); label.className='lyg-sponsor-label'; label.textContent=preview?'DEMO · sponsorer':'Vores sponsorer';bar.append(label);
  const windowEl = document.createElement('div'); windowEl.className='lyg-sponsor-window';
  const track = document.createElement('div');track.className='lyg-sponsor-track';track.style.setProperty('--sponsor-duration', Math.max(20, entries.length*5)+'s');
  const group = document.createElement('div'); group.className='lyg-sponsor-group';
  entries.forEach(sponsor => {
    const item=document.createElement(sponsor.url&&!preview?'a':'span');item.className='lyg-sponsor-item';
    if(item.tagName==='A'){item.href=sponsor.url;item.target='_blank';item.rel='noopener noreferrer';}
    if(sponsor.logo){const img=document.createElement('img');img.src=sponsor.logo;img.alt=sponsor.name;item.append(img);}else item.textContent=sponsor.name;
    group.append(item);
  });
  // Repeat short sponsor lists to cover wide screens throughout the loop.
  while (group.children.length < 6) {
    entries.forEach((_, i) => {const duplicate=group.children[i].cloneNode(true);duplicate.setAttribute('aria-hidden','true');duplicate.inert=true;group.append(duplicate);});
  }
  const copy=group.cloneNode(true);copy.setAttribute('aria-hidden','true');copy.inert=true;
  track.append(group,copy);windowEl.append(track);bar.append(windowEl);
  const pause=document.createElement('button');pause.type='button';pause.className='lyg-sponsor-pause';pause.textContent='Ⅱ';pause.setAttribute('aria-label','Sæt sponsorstriben på pause');pause.setAttribute('aria-pressed','false');
  pause.onclick=()=>{const paused=bar.dataset.paused!=='true';bar.dataset.paused=String(paused);pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Start sponsorstriben':'Sæt sponsorstriben på pause');};bar.append(pause);
  document.body.append(bar);document.documentElement.classList.add('lyg-has-sponsors');
  const measure=()=>document.documentElement.style.setProperty('--sponsor-nav-height',nav.getBoundingClientRect().height+'px');
  measure();new ResizeObserver(measure).observe(nav);
})();
