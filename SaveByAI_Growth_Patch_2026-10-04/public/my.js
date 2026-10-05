const tripsEl=document.querySelector('#myTrips');
const claimsEl=document.querySelector('#myClaims');

function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function fmtDate(iso){try{return new Intl.DateTimeFormat('en-IN',{dateStyle:'medium',timeStyle:'short'}).format(new Date(iso))}catch{return iso}}
function maskEmail(email=''){const [a,b]=String(email).split('@');if(!a||!b)return '';return `${a.slice(0,2)}${a.length>2?'•••':''}@${b}`}
function read(key){try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return []}}

const trips=read('savebyai_recent_clicks');
const claims=read('savebyai_claims');
const email=localStorage.getItem('savebyai_cashback_email')||'';

document.querySelector('#myTripCount').textContent=String(trips.length);
document.querySelector('#myClaimCount').textContent=String(claims.length);

if(email){
  document.querySelector('#identityValue').textContent=maskEmail(email);
  document.querySelector('#identityHint').textContent='Connected on this browser. Secure cross-device email access will be added before balances or withdrawals go live.';
}

if(!trips.length){
  tripsEl.innerHTML='<div class="dash-empty"><b>No tracked trips yet.</b><span>Start from a live store route on SaveByAI.</span></div>';
}else{
  tripsEl.innerHTML=trips.slice(0,5).map(t=>`<div class="dash-row"><span><b>${esc(t.name||t.merchant)}</b><small>${esc(fmtDate(t.created_at))}</small></span><em>${t.claimed?'Claimed':'Tracked'}</em></div>`).join('');
}

if(!claims.length){
  claimsEl.innerHTML='<div class="dash-empty"><b>No cashback claims on this browser.</b><span>Only use claims when a tracked purchase did not attach correctly.</span></div>';
}else{
  claimsEl.innerHTML=claims.slice(0,5).map(c=>`<div class="dash-row"><span><b>${esc(c.merchant||'Cashback claim')}</b><small>${esc(fmtDate(c.created_at))}</small></span><em>${c.matched?'Tracked link':'Manual review'}</em></div>`).join('');
}
