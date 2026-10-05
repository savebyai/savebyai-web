const host=document.querySelector('[data-verified-offers]');
if(host){
  const merchant=host.dataset.merchant;
  const limit=Number(host.dataset.limit||3);
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  fetch('/data/verified-offers.json',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(new Error('offer data unavailable'))).then(data=>{
    const m=data?.merchants?.[merchant];
    if(!m)return;
    const offers=(m.offers||[]).slice(0,limit);
    host.innerHTML=`<div class="verified-offer-head"><div><span class="kicker">VERIFIED SAVINGS</span><h2>More ways to save today</h2></div><small>Checked ${esc(m.last_verified)}</small></div>
      <div class="compact-offer-list">${offers.map(o=>`<article class="compact-offer"><span>${esc(o.type)}</span><div><strong>${esc(o.title)}</strong><small>${esc(o.detail||'')}</small></div></article>`).join('')}</div>
      <div class="offer-source-row"><span>Offers can change and may not stack.</span><a href="${esc(m.source_url)}" target="_blank" rel="noopener">Verify on ${esc(m.name)} →</a></div>`;
  }).catch(()=>{host.innerHTML='<p class="offer-load-note">Current store offers could not be loaded. Please verify savings on the merchant site before paying.</p>';});
}
