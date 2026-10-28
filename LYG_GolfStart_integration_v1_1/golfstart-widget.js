(()=>{
  if(document.getElementById('lyg-golfstart-launcher')) return;
  const script=document.currentScript;
  const frameUrl=new URL('golfstart-chat.html', script.src).href;
  const css=document.createElement('style');
  css.textContent=`#lyg-golfstart-launcher{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:2147483600;font:600 14px system-ui,sans-serif}#lyg-golfstart-button{border:1px solid #d2c693;border-radius:28px;background:#153d2f;color:#fff;display:flex;align-items:center;gap:9px;padding:12px 17px;box-shadow:0 7px 26px #0004;cursor:pointer;font:inherit}#lyg-golfstart-panel{display:none;position:fixed;right:18px;bottom:calc(84px + env(safe-area-inset-bottom));width:min(410px,calc(100vw - 36px));height:min(660px,calc(100dvh - 122px));background:#fff;border-radius:17px;overflow:hidden;box-shadow:0 15px 52px #0005;border:1px solid #bfd0c2}#lyg-golfstart-panel[data-open='true']{display:block}#lyg-golfstart-panel iframe{display:block;border:0;width:100%;height:100%}@media(max-width:520px){#lyg-golfstart-launcher{right:12px;bottom:calc(12px + env(safe-area-inset-bottom))}#lyg-golfstart-panel{right:12px;width:calc(100vw - 24px);bottom:calc(72px + env(safe-area-inset-bottom));height:min(610px,calc(100dvh - 113px))}}`;
  document.head.appendChild(css);
  const root=document.createElement('div');root.id='lyg-golfstart-launcher';
  const panel=document.createElement('div');panel.id='lyg-golfstart-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','LYG GolfStart begynderhjælper');panel.dataset.open='false';
  const iframe=document.createElement('iframe');iframe.src=frameUrl;iframe.title='Spørg GolfStart';iframe.loading='lazy';panel.appendChild(iframe);
  const button=document.createElement('button');button.id='lyg-golfstart-button';button.type='button';button.setAttribute('aria-controls','lyg-golfstart-panel');button.setAttribute('aria-expanded','false');button.textContent='⛳ Spørg GolfStart';
  function toggle(force){const open=typeof force==='boolean'?force:panel.dataset.open!=='true';panel.dataset.open=String(open);button.setAttribute('aria-expanded',String(open));button.textContent=open?'✕ Luk GolfStart':'⛳ Spørg GolfStart';}
  button.addEventListener('click',()=>toggle());document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.dataset.open==='true'){toggle(false);button.focus()}});
  root.appendChild(panel);root.appendChild(button);document.body.appendChild(root);
})();