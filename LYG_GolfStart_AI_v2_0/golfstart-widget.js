(()=>{
  if(document.getElementById('lyg-golfstart-launcher'))return;
  const script=document.currentScript;
  const frameUrl=new URL('golfstart-chat.html',script.src).href;
  const css=document.createElement('style');
  css.textContent=`
#lyg-golfstart-launcher{position:fixed;right:16px;bottom:calc(20px + env(safe-area-inset-bottom));z-index:2147483600;font:600 14px system-ui,sans-serif}
#lyg-golfstart-button{border:1px solid #d2b45d;border-radius:28px;background:#153d2f;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;padding:11px 16px;box-shadow:0 6px 22px #0003;cursor:pointer;font:inherit;min-height:48px}
#lyg-golfstart-button:focus-visible{outline:3px solid #d2b45d;outline-offset:3px}
#lyg-golfstart-panel{display:none;position:fixed;right:16px;bottom:calc(83px + env(safe-area-inset-bottom));width:min(410px,calc(100vw - 32px));height:min(450px,calc(100dvh - 165px));background:#f9faf6;border-radius:18px;overflow:hidden;box-shadow:0 12px 42px #0004;border:1px solid #bfd0c2}
#lyg-golfstart-panel[data-open='true']{display:block}#lyg-golfstart-launcher:has(#lyg-golfstart-panel[data-open='true']) #lyg-golfstart-button{visibility:hidden}
#lyg-golfstart-panel iframe{display:block;border:0;width:100%;height:100%}
@media(max-width:520px){
 #lyg-golfstart-launcher{right:14px;bottom:calc(90px + env(safe-area-inset-bottom))}
 #lyg-golfstart-button{width:52px;height:52px;min-height:52px;border-radius:50%;padding:0;font-size:24px}
 #lyg-golfstart-panel{right:10px;width:calc(100vw - 20px);bottom:calc(153px + env(safe-area-inset-bottom));height:min(420px,calc(100dvh - 235px));border-radius:16px}
}
@media(max-width:520px) and (max-height:670px){#lyg-golfstart-panel{height:min(420px,calc(100dvh - 210px));bottom:calc(145px + env(safe-area-inset-bottom))}}
@media(prefers-reduced-motion:no-preference){#lyg-golfstart-panel[data-open='true']{animation:lyg-chat-in .15s ease-out}@keyframes lyg-chat-in{from{opacity:.7;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}}
`;
  document.head.appendChild(css);
  const root=document.createElement('div');root.id='lyg-golfstart-launcher';
  const panel=document.createElement('div');panel.id='lyg-golfstart-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','LYG GolfStart begynderhjælper');panel.dataset.open='false';
  const iframe=document.createElement('iframe');iframe.src=frameUrl;iframe.title='Spørg GolfStart';iframe.loading='lazy';panel.appendChild(iframe);
  const button=document.createElement('button');button.id='lyg-golfstart-button';button.type='button';button.setAttribute('aria-controls','lyg-golfstart-panel');button.setAttribute('aria-expanded','false');
  function toggle(force){const open=typeof force==='boolean'?force:panel.dataset.open!=='true';panel.dataset.open=String(open);button.setAttribute('aria-expanded',String(open));button.textContent=window.matchMedia('(max-width:520px)').matches?(open?'✕':'⛳'):(open?'✕ Luk GolfStart':'⛳ Spørg GolfStart');button.setAttribute('aria-label',open?'Luk GolfStart':'Spørg GolfStart');button.title=open?'Luk GolfStart':'Spørg GolfStart'}
  window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===iframe.contentWindow&&e.data==='lyg-golfstart-close'){toggle(false);button.focus()}});
  button.addEventListener('click',()=>toggle());document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.dataset.open==='true'){toggle(false);button.focus()}});
  window.addEventListener('resize',()=>toggle(panel.dataset.open==='true'));
  root.appendChild(panel);root.appendChild(button);document.body.appendChild(root);toggle(false);
})();
