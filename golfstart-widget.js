/* GolfStart AI – chatknap og chatvindue (Lyngbygaard Golf Begynder). Ingen API-nøgler; AI-kald sker via Cloudflare Worker i golfstart-chat.js */
(()=>{
  if(document.getElementById('lyg-golfstart-launcher'))return;
  const script=document.currentScript;
  const base=script&&script.src?script.src:location.href;
  const frameUrl=new URL('golfstart-chat.html',base).href;
  const css=document.createElement('style');
  css.textContent=`
#lyg-golfstart-launcher{--lyg-nav:65px;position:fixed;right:16px;bottom:24px;z-index:550;font:600 14px system-ui,-apple-system,"Segoe UI",sans-serif}
#lyg-golfstart-button{display:flex;align-items:center;justify-content:center;gap:9px;min-height:52px;padding:0 20px 0 14px;border:1.5px solid #c9a84c;border-radius:30px;background:linear-gradient(155deg,#245a2b,#17381b);color:#f3e2b0;font:inherit;letter-spacing:.2px;cursor:pointer;box-shadow:0 6px 20px rgba(10,30,12,.38);-webkit-tap-highlight-color:transparent}
#lyg-golfstart-button svg{width:24px;height:24px;flex:none}
#lyg-golfstart-button:hover{background:linear-gradient(155deg,#2b6a33,#1c4421)}
#lyg-golfstart-button:focus-visible{outline:3px solid #e9c98b;outline-offset:3px}
#lyg-golfstart-panel{display:none;position:fixed;right:16px;bottom:92px;width:min(420px,calc(100vw - 32px));height:min(640px,calc(100vh - 130px));height:min(640px,calc(100dvh - 130px));background:#f7f4ec;border:1.5px solid #c9a84c;border-radius:20px;overflow:hidden;box-shadow:0 16px 48px rgba(10,30,12,.45);z-index:551}
#lyg-golfstart-panel[data-open='true']{display:block}
#lyg-golfstart-launcher[data-open='true'] #lyg-golfstart-button{visibility:hidden}
#lyg-golfstart-panel iframe{display:block;border:0;width:100%;height:100%;background:#f7f4ec}
#lyg-golfstart-backdrop{display:none;position:fixed;left:0;right:0;top:0;bottom:calc(var(--lyg-nav,65px) + env(safe-area-inset-bottom,0px));background:rgba(10,30,12,.4);z-index:549;touch-action:none}
@media(max-width:1000px){
 #lyg-golfstart-launcher{right:14px;bottom:calc(var(--lyg-nav,65px) + env(safe-area-inset-bottom,0px) + 14px)}
 #lyg-golfstart-button{width:56px;height:56px;min-height:56px;padding:0;border-radius:50%}
 #lyg-golfstart-button .lyg-txt{display:none}
 #lyg-golfstart-button svg{width:28px;height:28px}
 #lyg-golfstart-panel{right:8px;width:min(440px,calc(100vw - 16px));bottom:calc(var(--lyg-nav,65px) + env(safe-area-inset-bottom,0px) + 10px);height:calc(100vh - var(--lyg-nav,65px) - env(safe-area-inset-bottom,0px) - 28px);height:min(90dvh,640px,calc(100dvh - var(--lyg-nav,65px) - env(safe-area-inset-bottom,0px) - 28px));border-radius:18px}
}
@media(max-width:600px){
 #lyg-golfstart-panel{left:8px;width:auto;height:calc(100vh - var(--lyg-nav,65px) - env(safe-area-inset-bottom,0px) - 28px);height:min(90dvh,calc(100dvh - var(--lyg-nav,65px) - env(safe-area-inset-bottom,0px) - 28px))}
 #lyg-golfstart-launcher[data-open='true'] ~ #lyg-golfstart-backdrop{display:block}
}
@media(prefers-reduced-motion:no-preference){#lyg-golfstart-panel[data-open='true']{animation:lyg-chat-in .18s ease-out}@keyframes lyg-chat-in{from{opacity:.6;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}}
`;
  document.head.appendChild(css);
  const root=document.createElement('div');root.id='lyg-golfstart-launcher';root.dataset.open='false';
  const panel=document.createElement('div');panel.id='lyg-golfstart-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Spørg GolfStart AI');panel.dataset.open='false';
  const iframe=document.createElement('iframe');iframe.title='Spørg GolfStart AI';iframe.loading='lazy';iframe.src=frameUrl;panel.appendChild(iframe);
  const button=document.createElement('button');button.id='lyg-golfstart-button';button.type='button';button.setAttribute('aria-controls','lyg-golfstart-panel');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Spørg GolfStart AI');button.title='Spørg GolfStart AI';
  button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="#e9c98b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 21V3M7 4.5l10 3.5-10 3.5"/><path d="M3.5 21h8"/><circle cx="17.5" cy="18" r="2.2"/></svg><span class="lyg-txt">Spørg GolfStart AI</span>';
  const backdrop=document.createElement('div');backdrop.id='lyg-golfstart-backdrop';
  let scrollY=0,locked=false;
  function lock(on){
    const mobile=window.matchMedia('(max-width:600px)').matches;
    if(on&&mobile&&!locked){scrollY=window.scrollY;const b=document.body.style;b.position='fixed';b.top=(-scrollY)+'px';b.left='0';b.right='0';b.width='100%';b.overflow='hidden';document.documentElement.style.overscrollBehavior='none';locked=true}
    else if(!on&&locked){const b=document.body.style;b.position='';b.top='';b.left='';b.right='';b.width='';b.overflow='';document.documentElement.style.overscrollBehavior='';locked=false;const h=document.documentElement.style.scrollBehavior;document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,scrollY);document.documentElement.style.scrollBehavior=h}
  }
  function fitKeyboard(){
    const vv=window.visualViewport;if(!vv||panel.dataset.open!=='true'||!window.matchMedia('(max-width:600px)').matches){panel.style.bottom='';panel.style.height='';return}
    const kb=window.innerHeight-vv.height-vv.offsetTop;
    if(kb>120){panel.style.bottom=(kb+8)+'px';panel.style.height=Math.max(220,vv.height-16)+'px'}
    else{panel.style.bottom='';panel.style.height=''}
  }
  function navHeight(){const n=document.querySelector('.bottom-nav');const h=n?Math.round(n.getBoundingClientRect().height):65;root.style.setProperty('--lyg-nav',h+'px');backdrop.style.setProperty('--lyg-nav',h+'px')}
  function toggle(force){
    const open=typeof force==='boolean'?force:panel.dataset.open!=='true';
    panel.dataset.open=String(open);root.dataset.open=String(open);button.setAttribute('aria-expanded',String(open));
    lock(open);navHeight();fitKeyboard();
    if(open){try{iframe.contentWindow.postMessage('lyg-golfstart-focus',location.origin)}catch(e){}}
  }
  window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===iframe.contentWindow&&e.data==='lyg-golfstart-close'){toggle(false);button.focus()}});
  button.addEventListener('click',()=>toggle());
  backdrop.addEventListener('click',()=>toggle(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.dataset.open==='true'){toggle(false);button.focus()}});
  window.addEventListener('resize',()=>{navHeight();fitKeyboard()});
  if(window.visualViewport){visualViewport.addEventListener('resize',fitKeyboard);visualViewport.addEventListener('scroll',fitKeyboard)}
  root.appendChild(button);
  document.body.appendChild(root);document.body.appendChild(panel);document.body.appendChild(backdrop);
  // panel og backdrop ligger uden for launcher, så knappen kan skjules uden at skjule vinduet
  root.insertAdjacentElement('afterend',backdrop);
  navHeight();
})();
