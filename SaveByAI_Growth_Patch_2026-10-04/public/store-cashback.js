const root=document.querySelector('[data-cashback-store]');
if(root){
  const merchant=root.dataset.merchant;
  const merchantName=root.dataset.name;
  let rateBps=Number(root.dataset.rateBps)||0;
  const spendInput=document.querySelector('#plannedSpend');
  const cashbackAmount=document.querySelector('#estimatedCashback');
  const cashbackRate=document.querySelector('#cashbackRate');
  const activateBtn=document.querySelector('#activateStoreCashback');
  const modal=document.querySelector('#storeCashbackModal');
  const modalAmount=document.querySelector('#storeModalAmount');
  const modalMerchant=document.querySelector('#storeModalMerchant');
  const modalEmail=document.querySelector('#storeCashbackEmail');
  const modalStatus=document.querySelector('#storeCashbackStatus');
  const modalActivate=document.querySelector('#storeActivateBtn');

  function anonId(){
    let id=localStorage.getItem('savebyai_anon_id');
    if(!id){id=(crypto.randomUUID?.()||Math.random().toString(36).slice(2)+Date.now().toString(36));localStorage.setItem('savebyai_anon_id',id);}
    return id;
  }
  function money(v){return '₹'+Math.round(Number(v)||0).toLocaleString('en-IN');}
  function estimate(){return Math.round(((Number(spendInput.value)||0)*rateBps/10000)*100)/100;}
  async function track(name,props={}){try{await fetch('/api/event',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event_name:name,props,anon_id:anonId(),path:location.pathname})});}catch{}}
  function refresh(){
    const spend=Math.max(0,Number(spendInput.value)||0);const amount=estimate();
    cashbackAmount.textContent=money(amount);
    cashbackRate.textContent=`${(rateBps/100).toFixed(rateBps%100?1:0)}% SaveByAI cashback`;
    activateBtn.textContent=amount>0?`Activate ${money(amount)} cashback`:'Activate cashback';
  }
  function openModal(){
    const spend=Math.max(0,Number(spendInput.value)||0);if(spend<=0){spendInput.focus();return;}
    modalAmount.textContent=`${money(estimate())} estimated cashback`;
    modalMerchant.textContent=`${merchantName} · planned spend ${money(spend)}`;
    modalEmail.value=localStorage.getItem('savebyai_cashback_email')||'';
    modalStatus.textContent='';
    modal.hidden=false;document.body.classList.add('modal-open');
    setTimeout(()=>modalEmail.focus(),40);
    track('cashback_modal_opened',{merchant,cashback_rate_bps:rateBps,planned_spend:spend});
  }
  function closeModal(){modal.hidden=true;document.body.classList.remove('modal-open');}
  function saveRecentClick(data,email,spend){
    try{const items=JSON.parse(localStorage.getItem('savebyai_recent_clicks')||'[]');items.unshift({click_id:data.click_id,merchant,name:merchantName,created_at:new Date().toISOString(),cashback_label:data.cashback_label||'',cashback_rate_bps:data.cashback_rate_bps||rateBps,planned_spend:spend,estimated_cashback:data.estimated_cashback||estimate(),identified:Boolean(email)});localStorage.setItem('savebyai_recent_clicks',JSON.stringify(items.slice(0,20)));}catch{}
  }
  async function startTrip(email=''){
    const spend=Math.max(0,Number(spendInput.value)||0);if(spend<=0)return;
    modalStatus.textContent='Activating cashback…';modalActivate.disabled=true;
    try{
      const r=await fetch('/api/cashback/start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({merchant,email,anon_id:anonId(),planned_spend:spend})});
      const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'Could not activate cashback.');
      if(email){localStorage.setItem('savebyai_cashback_email',email);if(data.user_id)localStorage.setItem('savebyai_cashback_user_id',data.user_id);}
      saveRecentClick(data,email,spend);location.href=data.redirect_url;
    }catch(err){modalStatus.textContent=err.message;modalActivate.disabled=false;}
  }

  spendInput.addEventListener('input',refresh);
  activateBtn.addEventListener('click',openModal);
  document.querySelector('#storeCashbackForm').addEventListener('submit',e=>{e.preventDefault();const email=modalEmail.value.trim().toLowerCase();if(!email)return;startTrip(email);});
  document.querySelector('#storeModalClose').addEventListener('click',closeModal);
  modal.addEventListener('click',e=>{if(e.target===modal)closeModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeModal();});
  async function loadLiveRate(){
    try{
      const r=await fetch('/api/cashback/config');const data=await r.json();const cfg=data?.merchants?.[merchant];
      if(cfg?.cashbackEnabled&&Number(cfg.cashbackRateBps)>0)rateBps=Number(cfg.cashbackRateBps);
    }catch{}
    refresh();track('page_loaded',{path:location.pathname,merchant,cashback_rate_bps:rateBps});
  }
  loadLiveRate();
}
