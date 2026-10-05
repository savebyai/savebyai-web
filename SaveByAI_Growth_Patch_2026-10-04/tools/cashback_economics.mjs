import { AFFILIATE_MERCHANTS } from '../src/merchant-config.mjs';
let failures=0;
console.log('SaveByAI cashback economics check');
console.log('Merchant                 Affiliate   Customer   Spread   Min spread   Status');
console.log('----------------------------------------------------------------------------');
for(const [slug,m] of Object.entries(AFFILIATE_MERCHANTS)){
  if(!m.cashbackEnabled) continue;
  const aff=Number(m.affiliateCommissionBps||0), user=Number(m.cashbackRateBps||0), spread=aff-user, min=Number(m.minGrossMarginBps||0);
  const ok=aff>0 && user>0 && user<aff && spread>=min;
  if(!ok) failures++;
  const pct=b=>`${(b/100).toFixed(2)}%`;
  console.log(`${m.name.padEnd(24)} ${pct(aff).padStart(9)} ${pct(user).padStart(10)} ${pct(spread).padStart(8)} ${pct(min).padStart(12)}   ${ok?'OK':'REVIEW'}`);
}
if(failures){console.error(`\n${failures} cashback configuration(s) need review.`);process.exit(2)}
console.log('\nAll live cashback rates preserve the configured minimum gross spread.');
