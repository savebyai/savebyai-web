import { AFFILIATE_MERCHANTS } from './merchant-config.mjs';
const ALLOWED_EVENTS=new Set([
  'page_loaded','search_submitted','search_chip','merchant_viewed','calculator_used','guide_clicked','lead_submitted',
  'affiliate_click','cashback_modal_opened','cashback_started','cashback_claim_submitted',
  'savings_check_started','savings_check_completed','savings_review_requested'
]);

// Cashback is enabled only where the programme explicitly permits cashback traffic.
// cashbackRateBps is the customer-facing rate (1000 = 10.00%).
// The user's planned spend is only an estimate; final cashback uses the eligible tracked order value confirmed by the merchant/network.


function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
function text(v,max=500){return typeof v==='string'?v.trim().slice(0,max):''}
function refHost(request){try{return new URL(request.headers.get('referer')||'').hostname.slice(0,160)}catch{return ''}}
function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)&&v.length<=254}
function validDate(v){return !v||/^\d{4}-\d{2}-\d{2}$/.test(v)}
function affiliateUrlWithClickId(baseUrl,clickId){const target=new URL(baseUrl);target.searchParams.set('subid4',clickId);return target.toString()}
function cleanMoney(v,max=1000000){const n=Number(v);if(!Number.isFinite(n)||n<=0)return 0;return Math.min(Math.round(n*100)/100,max)}
function estimateCashback(config,plannedSpend){return config.cashbackEnabled&&config.cashbackRateBps?Math.round((plannedSpend*config.cashbackRateBps/10000)*100)/100:0}

async function logEvent(env,request,eventName,anonId,path,props={}){
  if(!ALLOWED_EVENTS.has(eventName))return;
  let propsJson='{}';try{propsJson=JSON.stringify(props).slice(0,2000)}catch{}
  await env.DB.prepare('INSERT INTO events (created_at,event_name,anon_id,path,props_json,country,referrer_host) VALUES (?,?,?,?,?,?,?)')
    .bind(new Date().toISOString(),eventName,text(anonId,80),text(path,200),propsJson,request.cf?.country||'',refHost(request)).run();
}

async function ensureCashbackUser(env,email){
  const normalized=email.toLowerCase();
  const existing=await env.DB.prepare('SELECT user_id FROM cashback_users WHERE email=? LIMIT 1').bind(normalized).first();
  const now=new Date().toISOString();
  if(existing?.user_id){
    await env.DB.prepare('UPDATE cashback_users SET updated_at=? WHERE user_id=?').bind(now,existing.user_id).run();
    return existing.user_id;
  }
  const userId=crypto.randomUUID();
  try{
    await env.DB.prepare('INSERT INTO cashback_users (user_id,email,created_at,updated_at) VALUES (?,?,?,?)')
      .bind(userId,normalized,now,now).run();
    return userId;
  }catch{
    const retry=await env.DB.prepare('SELECT user_id FROM cashback_users WHERE email=? LIMIT 1').bind(normalized).first();
    if(retry?.user_id)return retry.user_id;
    throw new Error('Could not create cashback identity');
  }
}

async function createAffiliateClick(env,request,merchant,config,{anonId='',userId=null,plannedSpend=0,estimatedCashback=0}={}){
  const clickId=crypto.randomUUID();
  const now=new Date().toISOString();
  const props={merchant,network:config.network,click_id:clickId,subid4:clickId,cashback_enabled:Boolean(config.cashbackEnabled),cashback_rate_bps:config.cashbackRateBps??null,planned_spend:plannedSpend||0,estimated_cashback:estimatedCashback||0};
  if(userId)props.user_id=userId;

  // Keep the proven event stream working even if the cashback tables are not yet migrated.
  try{await logEvent(env,request,'affiliate_click',anonId||clickId,`/go/${merchant}`,props)}catch(e){console.error('affiliate event log failed',e)}
  try{
    await env.DB.prepare(`INSERT INTO cashback_clicks
      (click_id,created_at,merchant,network,anon_id,user_id,cashback_label,cashback_rate_bps,country,referrer_host)
      VALUES (?,?,?,?,?,?,?,?,?,?)`)
      .bind(clickId,now,merchant,config.network,text(anonId,80),userId,config.cashbackLabel||'',config.cashbackRateBps,request.cf?.country||'',refHost(request)).run();
  }catch(e){console.error('cashback click log failed',e)}

  return {clickId,redirectUrl:affiliateUrlWithClickId(config.affiliateUrl,clickId)};
}

function publicCashbackConfig(){
  return Object.fromEntries(Object.entries(AFFILIATE_MERCHANTS).map(([slug,c])=>[slug,{
    slug,name:c.name,live:Boolean(c.live),network:c.network,cashbackEnabled:Boolean(c.cashbackEnabled),
    cashbackLabel:c.cashbackLabel||'',cashbackRateBps:c.cashbackRateBps??null,customerNote:c.customerNote||''
  }]));
}

export default{async fetch(request,env){
  const url=new URL(request.url);
  if(request.method==='OPTIONS'&&url.pathname.startsWith('/api/'))return new Response(null,{status:204,headers:{'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'}});

  if(url.pathname==='/api/event'&&request.method==='POST'){
    try{
      const b=await request.json();const eventName=text(b.event_name,64);
      if(!ALLOWED_EVENTS.has(eventName))return json({error:'invalid event'},400);
      await logEvent(env,request,eventName,text(b.anon_id,80),text(b.path||url.pathname,200),b.props||{});
      return json({ok:true});
    }catch{return json({error:'bad request'},400)}
  }

  if(url.pathname==='/api/lead'&&request.method==='POST'){
    try{
      const b=await request.json();if(text(b.company,100))return json({ok:true});
      const email=text(b.email,254).toLowerCase();const interest=text(b.interest,240);const source=text(b.source,80)||'website';
      if(!validEmail(email))return json({error:'Please enter a valid email.'},400);
      if(b.consent!==true)return json({error:'Consent is required.'},400);
      const now=new Date().toISOString();
      await env.DB.prepare(`INSERT INTO leads (email,interest,source,country,created_at,updated_at) VALUES (?,?,?,?,?,?)
        ON CONFLICT(email) DO UPDATE SET interest=excluded.interest,source=excluded.source,country=excluded.country,updated_at=excluded.updated_at`)
        .bind(email,interest,source,request.cf?.country||'',now,now).run();
      return json({ok:true});
    }catch{return json({error:'Could not save your request.'},400)}
  }

  if(url.pathname==='/api/cashback/config'&&request.method==='GET')return json({merchants:publicCashbackConfig()});

  if(url.pathname==='/api/cashback/start'&&request.method==='POST'){
    try{
      const b=await request.json();
      const merchant=text(b.merchant,80).toLowerCase();const config=AFFILIATE_MERCHANTS[merchant];
      if(!config||!config.live)return json({error:'This partner route is not live yet.'},404);
      const anonId=text(b.anon_id,80);const email=text(b.email,254).toLowerCase();
      const plannedSpend=cleanMoney(b.planned_spend);
      const estimatedCashback=estimateCashback(config,plannedSpend);
      let userId=null;
      if(email){
        if(!config.cashbackEnabled)return json({error:'Customer cashback is not enabled for this merchant yet.'},409);
        if(!validEmail(email))return json({error:'Please enter a valid email.'},400);
        userId=await ensureCashbackUser(env,email);
      }
      const {clickId,redirectUrl}=await createAffiliateClick(env,request,merchant,config,{anonId,userId,plannedSpend,estimatedCashback});
      try{await logEvent(env,request,'cashback_started',anonId,'/',{merchant,click_id:clickId,identified:Boolean(userId),cashback_enabled:Boolean(config.cashbackEnabled),cashback_rate_bps:config.cashbackRateBps??null,planned_spend:plannedSpend,estimated_cashback:estimatedCashback})}catch{}
      return json({ok:true,click_id:clickId,user_id:userId,redirect_url:redirectUrl,cashback_enabled:Boolean(config.cashbackEnabled),cashback_label:config.cashbackLabel||'',cashback_rate_bps:config.cashbackRateBps??null,planned_spend:plannedSpend,estimated_cashback:estimatedCashback});
    }catch(e){console.error(e);return json({error:'Could not start this shopping trip. Please try again.'},500)}
  }

  if(url.pathname==='/api/cashback/claim'&&request.method==='POST'){
    try{
      const b=await request.json();
      const email=text(b.email,254).toLowerCase();const merchant=text(b.merchant,80).toLowerCase();
      const clickId=text(b.click_id,80);const anonId=text(b.anon_id,80);const orderReference=text(b.order_reference,120);
      const purchaseDate=text(b.purchase_date,20);const notes=text(b.notes,500);
      if(!validEmail(email))return json({error:'Please enter a valid email.'},400);
      if(!AFFILIATE_MERCHANTS[merchant])return json({error:'Please choose a supported merchant.'},400);
      if(!validDate(purchaseDate))return json({error:'Please enter a valid purchase date.'},400);
      const userId=await ensureCashbackUser(env,email);
      let status='manual_review';let matched=false;
      if(clickId){
        const row=await env.DB.prepare('SELECT click_id,merchant,anon_id,user_id FROM cashback_clicks WHERE click_id=? LIMIT 1').bind(clickId).first();
        if(row&&row.merchant===merchant){
          if(row.user_id===userId)matched=true;
          else if(!row.user_id&&row.anon_id&&anonId&&row.anon_id===anonId){
            await env.DB.prepare('UPDATE cashback_clicks SET user_id=? WHERE click_id=?').bind(userId,clickId).run();
            matched=true;
          }
        }
      }
      if(matched)status='submitted';
      const claimId=crypto.randomUUID();const now=new Date().toISOString();
      await env.DB.prepare(`INSERT INTO cashback_claims
        (claim_id,click_id,user_id,merchant,order_reference,purchase_date,notes,status,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?)`)
        .bind(claimId,clickId||null,userId,merchant,orderReference,purchaseDate||null,notes,status,now,now).run();
      try{await logEvent(env,request,'cashback_claim_submitted',anonId,'/claim.html',{merchant,claim_id:claimId,click_matched:matched})}catch{}
      return json({ok:true,claim_id:claimId,status,matched});
    }catch(e){console.error(e);return json({error:'Could not submit your cashback claim. Please try again.'},500)}
  }

  // Legacy/direct route remains available. It creates an anonymous tracked click and redirects immediately.
  if(url.pathname.startsWith('/go/')&&request.method==='GET'){
    const merchant=text(url.pathname.slice(4).split('/')[0],80).toLowerCase();const config=AFFILIATE_MERCHANTS[merchant];
    if(!config||!config.live)return json({error:'Affiliate merchant is not enabled.'},404);
    const {redirectUrl}=await createAffiliateClick(env,request,merchant,config,{anonId:''});
    return Response.redirect(redirectUrl,302);
  }

  if(url.pathname==='/api/health')return json({ok:true,service:'savebyai'});
  return env.ASSETS.fetch(request);
}};
