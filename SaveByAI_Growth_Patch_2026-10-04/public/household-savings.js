const form=document.querySelector('#savingsCheckForm');
let started=false;
let currentResult=null;

function anonId(){
  let id=localStorage.getItem('savebyai_anon_id');
  if(!id){
    id=(crypto.randomUUID?.()||Math.random().toString(36).slice(2)+Date.now().toString(36));
    localStorage.setItem('savebyai_anon_id',id);
  }
  return id;
}
function money(v){return '₹'+Math.round(Number(v)||0).toLocaleString('en-IN');}
function value(id){return Math.max(0,Math.min(1000000,Number(document.querySelector(id)?.value)||0));}
function cleanText(v,max=50){return String(v||'').trim().replace(/[|<>]/g,' ').slice(0,max);}
async function track(name,props={}){
  try{
    await fetch('/api/event',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event_name:name,props,anon_id:anonId(),path:location.pathname})});
  }catch{}
}
function markStarted(){
  if(started)return;
  started=true;
  track('savings_check_started');
}
function showStep(step){
  document.querySelectorAll('.audit-step').forEach(el=>el.hidden=Number(el.dataset.step)!==step);
  document.querySelectorAll('[data-step-dot]').forEach(el=>{
    const n=Number(el.dataset.stepDot);
    el.classList.toggle('current',n===step);
    el.classList.toggle('done',n<step);
  });
  window.scrollTo({top:Math.max(0,document.querySelector('.audit-card').offsetTop-95),behavior:'smooth'});
}
function spendData(){
  return {
    shopping:value('#spendShopping'),
    fuel:value('#spendFuel'),
    subscriptions:value('#spendSubscriptions'),
    mobile:value('#spendMobile'),
    groceries:value('#spendGroceries'),
    bills:value('#spendBills')
  };
}
function makeOpportunities(spend,priority){
  const candidates=[
    {key:'subscriptions',amount:spend.subscriptions,threshold:400,title:'Subscriptions are worth checking first',body:'Recurring services are often one of the easiest areas to review. We would check unused or overlapping services, bundles and whether monthly vs annual billing changes the real cost.',tag:'EASY REVIEW'},
    {key:'shopping',amount:spend.shopping,threshold:3000,title:'Check the route before your next purchase',body:'For shopping you already plan to do, savings may come from the merchant price, a valid coupon, payment offer or cashback. SaveByAI should recommend the cheapest legitimate route, even when we earn nothing.',tag:'CHECK BEFORE BUYING'},
    {key:'fuel',amount:spend.fuel,threshold:3000,title:'Regular fuel spend may justify payment optimisation',body:'Fuel itself may have no direct discount. The useful check is whether your existing card, wallet or loyalty route changes the effective cost after fees and eligibility rules.',tag:'ROUTE'},
    {key:'mobile',amount:spend.mobile,threshold:1000,title:'Your telecom spend may be worth a plan review',body:'We would check for unused allowances, duplicate connections, contract changes or a cheaper equivalent plan. We do not yet compare every provider automatically.',tag:'PLAN REVIEW'},
    {key:'groceries',amount:spend.groceries,threshold:8000,title:'Recurring grocery spend may reward the right route',body:'For frequent grocery spending, we would check store loyalty, eligible card rewards and genuine gift-card savings without assuming they always stack.',tag:'RECURRING SPEND'},
    {key:'bills',amount:spend.bills,threshold:4000,title:'Some bills can be optimised without a direct discount',body:'If the provider gives no cashback, the next questions are payment route, plan or tariff, avoidable fees and whether a cheaper equivalent service exists.',tag:'BILL REVIEW'}
  ];
  let chosen=candidates.filter(x=>x.amount>=x.threshold);
  if(priority && priority!=='not_sure'){
    const p=candidates.find(x=>x.key===priority);
    if(p && p.amount>0 && !chosen.some(x=>x.key===p.key))chosen.unshift(p);
  }
  if(chosen.length<3){
    candidates
      .filter(x=>x.amount>0&&!chosen.some(y=>y.key===x.key))
      .sort((a,b)=>b.amount-a.amount)
      .forEach(x=>{if(chosen.length<3)chosen.push(x)});
  }
  if(!chosen.length){
    chosen=[
      {key:'subscriptions',title:'Start with subscriptions',body:'List the recurring services you actually pay for. It is usually the easiest place to spot something that is unused, duplicated or on the wrong billing plan.',tag:'START HERE'},
      {key:'shopping',title:'Use shopping as a check-before-you-pay habit',body:'When you already plan to buy something, compare the real payable price, eligible store offer and cashback route before checkout.',tag:'CHECK BEFORE BUYING'}
    ];
  }
  return chosen.slice(0,4);
}
function renderResult(){
  const spend=spendData();
  const total=Object.values(spend).reduce((a,b)=>a+b,0);
  const priority=document.querySelector('#priorityArea').value;
  const opportunities=makeOpportunities(spend,priority);
  currentResult={spend,total,opportunities,priority};
  document.querySelector('#totalSpend').textContent=money(total);
  document.querySelector('#opportunityCount').textContent=String(opportunities.length);
  document.querySelector('#resultHeadline').textContent=`We found ${opportunities.length} area${opportunities.length===1?'':'s'} worth reviewing.`;
  document.querySelector('#opportunityList').innerHTML=opportunities.map((o,i)=>`
    <article class="audit-opportunity">
      <div class="audit-opportunity-no">${i+1}</div>
      <div><span>${i===0?'START HERE · ':''}${o.tag}</span><h3>${o.title}</h3><p>${o.body}</p></div>
    </article>`).join('');
  const firstKey=opportunities[0]?.key;
  const preferred=(priority&&priority!=='not_sure')?priority:firstKey;
  const focus=document.querySelector(`input[name="reviewFocus"][value="${preferred}"]`);
  if(focus)focus.checked=true;
  track('savings_check_completed',{
    household_size:document.querySelector('#householdSize').value,
    priority,
    total_monthly_spend:total,
    spend,
    opportunity_keys:opportunities.map(x=>x.key)
  });
}
function next(step){
  markStarted();
  if(step===2 && !document.querySelector('#householdSize').value){
    document.querySelector('#householdSize').focus();
    return;
  }
  if(step===3)renderResult();
  showStep(step);
}
document.querySelectorAll('[data-next]').forEach(btn=>btn.addEventListener('click',()=>next(Number(btn.dataset.next))));
document.querySelectorAll('[data-back]').forEach(btn=>btn.addEventListener('click',()=>showStep(Number(btn.dataset.back))));
form.addEventListener('input',markStarted);

document.querySelector('#requestReviewBtn').addEventListener('click',async()=>{
  if(!currentResult)renderResult();
  const email=document.querySelector('#reviewEmail').value.trim().toLowerCase();
  const consent=document.querySelector('#reviewConsent').checked;
  const status=document.querySelector('#reviewStatus');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){status.textContent='Please enter a valid email.';status.className='form-status error';return;}
  if(!consent){status.textContent='Please tick the consent box so we can send the beta review.';status.className='form-status error';return;}
  const checkId=(crypto.randomUUID?.()||Date.now().toString(36));
  const s=currentResult.spend;
  const reviewFocus=document.querySelector('input[name="reviewFocus"]:checked')?.value||currentResult.priority||'not_sure';
  const compact=[
    'audit',`id=${checkId.slice(0,12)}`,`hh=${document.querySelector('#householdSize').value}`,
    `city=${cleanText(document.querySelector('#city').value,25)}`,`p=${document.querySelector('#priorityArea').value}`,`focus=${reviewFocus}`,
    `sh=${s.shopping}`,`fu=${s.fuel}`,`su=${s.subscriptions}`,`mb=${s.mobile}`,`gr=${s.groceries}`,`bi=${s.bills}`
  ].join('|').slice(0,235);
  status.textContent='Saving your request…';status.className='form-status';
  try{
    const r=await fetch('/api/lead',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,interest:compact,source:'household-savings-check',consent:true,company:''})});
    const data=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(data.error||'Could not save your request.');
    localStorage.setItem('savebyai_savings_review_email',email);
    localStorage.setItem('savebyai_last_savings_check',JSON.stringify({check_id:checkId,household_size:document.querySelector('#householdSize').value,city:cleanText(document.querySelector('#city').value),priority:currentResult.priority,spend:s,total:currentResult.total,created_at:new Date().toISOString()}));
    await track('savings_review_requested',{check_id:checkId.slice(0,12),priority:currentResult.priority,review_focus:reviewFocus,total_monthly_spend:currentResult.total});
    status.textContent='Request received. We are reviewing early beta submissions manually and will use your email for this savings review.';
    status.className='form-status success';
    document.querySelector('#requestReviewBtn').disabled=true;
  }catch(err){
    status.textContent=err.message;
    status.className='form-status error';
  }
});

const savedEmail=localStorage.getItem('savebyai_savings_review_email');
if(savedEmail)document.querySelector('#reviewEmail').value=savedEmail;

const mobileMenu=document.querySelector('#mobileMenu');
const mobileNav=document.querySelector('#mobileNav');
mobileMenu?.addEventListener('click',()=>{
  const isOpen=!mobileNav.hidden;
  mobileNav.hidden=isOpen;
  mobileMenu.setAttribute('aria-expanded',String(!isOpen));
});
