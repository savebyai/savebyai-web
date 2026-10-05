const recentEl=document.querySelector('#recentTrips');
const merchantSelect=document.querySelector('#claimMerchant');
const statusEl=document.querySelector('#claimStatus');
const successEl=document.querySelector('#claimSuccess');
const formWrap=document.querySelector('#claimFormWrap');
const form=document.querySelector('#claimForm');
const submitBtn=form.querySelector('button[type="submit"]');
let trips=[];let merchants=[];
const tripCountEl=document.querySelector('#tripCount');
const claimCountEl=document.querySelector('#claimCount');

function anonId(){let id=localStorage.getItem('savebyai_anon_id');if(!id){id=(crypto.randomUUID?.()||Math.random().toString(36).slice(2)+Date.now().toString(36));localStorage.setItem('savebyai_anon_id',id)}return id}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function fmtDate(iso){try{return new Intl.DateTimeFormat('en-IN',{dateStyle:'medium',timeStyle:'short'}).format(new Date(iso))}catch{return iso}}
function recentTripCandidates(merchant){return trips.filter(t=>t.merchant===merchant&&!t.claimed)}

function selectTrip(clickId){
  const t=trips.find(x=>x.click_id===clickId);if(!t)return;
  document.querySelector('#claimClickId').value=t.click_id;
  merchantSelect.value=t.merchant;
  const selected=document.querySelector('#selectedTrip');
  selected.hidden=false;
  selected.innerHTML=`<b>Tracked trip selected ✓</b><span>${esc(t.name||t.merchant)} · ${esc(fmtDate(t.created_at))}</span><small>We will match this exact SaveByAI click with partner reporting.</small>`;
  document.querySelector('#claimTitle').textContent='Claim this tracked trip.';
  document.querySelector('#claimIntro').textContent='Great — this trip has a SaveByAI tracking ID. Add your email and purchase details below.';
  statusEl.className='form-status';statusEl.textContent='';
  document.querySelector('.claim-form-card').scrollIntoView({behavior:'smooth',block:'start'});
}

function renderTrips(){
  if(tripCountEl)tripCountEl.textContent=String(trips.length);
  if(claimCountEl)claimCountEl.textContent=String(trips.filter(t=>t.claimed).length);
  if(!trips.length){recentEl.innerHTML='<div class="no-trips"><b>No recent tracked trips found on this device.</b><span>You can still submit a manual claim using the form.</span></div>';return}
  recentEl.innerHTML=trips.slice(0,8).map(t=>`<button class="trip-card ${t.claimed?'claimed':''}" data-click="${esc(t.click_id)}" ${t.claimed?'disabled':''}><span><b>${esc(t.name||t.merchant)}</b><small>${esc(fmtDate(t.created_at))}</small></span><em>${t.claimed?'Claim submitted ✓':'Use this tracked trip →'}</em></button>`).join('');
  recentEl.querySelectorAll('[data-click]:not([disabled])').forEach(b=>b.addEventListener('click',()=>selectTrip(b.dataset.click)));
}

function markTripClaimed(clickId){
  if(!clickId)return;
  trips=trips.map(t=>t.click_id===clickId?{...t,claimed:true}:t);
  localStorage.setItem('savebyai_recent_clicks',JSON.stringify(trips));
  renderTrips();
}


function saveClaimLocally(data,body){
  try{
    const items=JSON.parse(localStorage.getItem('savebyai_claims')||'[]');
    items.unshift({
      claim_id:data.claim_id||'',
      merchant:body.merchant||'',
      email:body.email||'',
      created_at:new Date().toISOString(),
      status:data.status||'submitted',
      matched:Boolean(data.matched),
      click_id:body.click_id||''
    });
    localStorage.setItem('savebyai_claims',JSON.stringify(items.slice(0,30)));
  }catch{}
}

function showSuccess(data,body){
  const ref=(data.claim_id||'').slice(0,8).toUpperCase();
  const matched=Boolean(data.matched);
  successEl.hidden=false;
  formWrap.hidden=true;
  successEl.innerHTML=`
    <div class="success-icon">✓</div>
    <span class="kicker">CLAIM RECEIVED</span>
    <h2>${matched?'Your tracked trip is linked.':'Your claim is in manual review.'}</h2>
    <p>${matched
      ?'We matched your claim to the SaveByAI click from this device. The merchant/network still needs to report and confirm an eligible purchase before cashback can become payable.'
      :'We saved your claim, but could not automatically link it to a tracked SaveByAI click. We will use the details you supplied for manual review.'}</p>
    <div class="claim-receipt">
      <span>Claim reference</span><strong>${esc(ref||data.claim_id||'Saved')}</strong>
      <span>Merchant</span><strong>${esc(merchantSelect.options[merchantSelect.selectedIndex]?.textContent||body.merchant)}</strong>
      <span>Email</span><strong>${esc(body.email)}</strong>
      <span>Status</span><strong>${matched?'Tracked click linked':'Manual review'}</strong>
    </div>
    <div class="success-actions"><a class="btn btn-primary" href="/">Back to SaveByAI</a><button class="btn btn-secondary" id="anotherClaim" type="button">Submit another claim</button></div>`;
  successEl.querySelector('#anotherClaim')?.addEventListener('click',()=>{successEl.hidden=true;formWrap.hidden=false;form.reset();document.querySelector('#claimClickId').value='';document.querySelector('#selectedTrip').hidden=true;document.querySelector('#claimEmail').value=localStorage.getItem('savebyai_cashback_email')||'';document.querySelector('#claimTitle').textContent='Tell us about the purchase.';document.querySelector('#claimIntro').textContent='If your purchase started through SaveByAI, we’ll try to match it to a tracked click. A tracked click gives us the best chance of recovering it.';statusEl.textContent='';formWrap.scrollIntoView({behavior:'smooth',block:'start'})});
  successEl.scrollIntoView({behavior:'smooth',block:'center'});
}

async function load(){
  try{trips=JSON.parse(localStorage.getItem('savebyai_recent_clicks')||'[]')}catch{trips=[]}
  renderTrips();
  document.querySelector('#claimEmail').value=localStorage.getItem('savebyai_cashback_email')||'';
  try{
    const [m,c]=await Promise.all([fetch('/data/merchants.json').then(r=>r.json()),fetch('/api/cashback/config').then(r=>r.json()).catch(()=>({merchants:{}}))]);
    const cfg=c.merchants||{};merchants=m.filter(x=>x.live||cfg[x.slug]?.live);
    merchants.forEach(x=>{const o=document.createElement('option');o.value=x.slug;o.textContent=x.name;merchantSelect.appendChild(o)});
    if(!merchants.length){m.slice(0,20).forEach(x=>{const o=document.createElement('option');o.value=x.slug;o.textContent=x.name;merchantSelect.appendChild(o)})}
  }catch{}
}

form.addEventListener('submit',async e=>{
  e.preventDefault();
  statusEl.className='form-status';statusEl.textContent='';
  let clickId=document.querySelector('#claimClickId').value;
  const merchant=merchantSelect.value;

  // If the user forgot to click the recent-trip card but there is exactly one matching
  // tracked trip for that merchant on this device, attach it automatically.
  if(!clickId&&merchant){
    const candidates=recentTripCandidates(merchant);
    if(candidates.length===1){clickId=candidates[0].click_id;document.querySelector('#claimClickId').value=clickId}
    else if(candidates.length>1){statusEl.className='form-status error';statusEl.textContent='We found more than one recent tracked trip for this merchant. Please choose the correct trip under “Recent trips” first.';return}
  }

  const body={email:document.querySelector('#claimEmail').value.trim().toLowerCase(),merchant,click_id:clickId,anon_id:anonId(),purchase_date:document.querySelector('#purchaseDate').value,order_reference:document.querySelector('#orderReference').value.trim(),notes:document.querySelector('#claimNotes').value.trim()};
  submitBtn.disabled=true;const oldText=submitBtn.textContent;submitBtn.textContent='Submitting…';statusEl.textContent='Saving your cashback claim…';
  try{
    const r=await fetch('/api/cashback/claim',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'Could not submit claim');
    localStorage.setItem('savebyai_cashback_email',body.email);
    if(data.matched)markTripClaimed(body.click_id);
    saveClaimLocally(data,body);
    showSuccess(data,body);
  }catch(err){statusEl.className='form-status error';statusEl.textContent=err.message||'Please try again.'}
  finally{submitBtn.disabled=false;submitBtn.textContent=oldText}
});

load();
