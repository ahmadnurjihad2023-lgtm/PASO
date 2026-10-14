/* All calculations are deterministic demonstration rules, NOT an AI training/inference model. */
(function(root){
'use strict';
const D=root.PASO_DATA||(typeof require==='function'?require('./data.js'):null);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const num=(n,f=0)=>Number.isFinite(Number(n))?Number(n):f;
const round=(n,d=1)=>Math.round(n*10**d)/10**d;
const clone=o=>JSON.parse(JSON.stringify(o));
const initial=()=>clone(D.defaults);
function sanitize(raw){
  const s=initial(),v=raw||{};
  for(const k of ['area','selected','humanDecision','humanNotes','conclusion','feedback'])if(typeof v[k]==='string')s[k]=v[k].slice(0,500);
  const ranges={waste:[1,1000],organic:[0,100],plastic:[0,100],paper:[0,100],collection:[0,100],sorting:[0,100],capacity:[0.1,150],budget:[0,15000],demand:[0,5000],price:[0,30]};
  for(const [k,[lo,hi]]of Object.entries(ranges))s[k]=clamp(num(v[k],s[k]),lo,hi);
  if(s.organic+s.plastic+s.paper>100){const sum=s.organic+s.plastic+s.paper;for(const k of ['organic','plastic','paper'])s[k]=round(s[k]/sum*100,2);}
  for(const k of ['offTaker','permission','operator','marketEvidence'])s[k]=!!v[k];
  if(v.weights&&typeof v.weights==='object')for(const k of Object.keys(s.weights))s.weights[k]=clamp(num(v.weights[k],s.weights[k]),0,100);
  if(v.pilot&&typeof v.pilot==='object'){
    for(const k of ['days','input','recovered','residue','sold','cost','revenue','workers'])s.pilot[k]=clamp(num(v.pilot[k],s.pilot[k]),0,200000);
    for(const k of ['materialDoc','marketDoc','costDoc','fieldCheck'])s.pilot[k]=!!v.pilot[k];
    s.pilot.notes=String(v.pilot.notes||'').slice(0,1000);
  }
  s.selected=D.options.some(o=>o.id===s.selected)?s.selected:'compost';
  s.updatedAt=typeof v.updatedAt==='string'?v.updatedAt:null;
  return s;
}
function mass(s){
  const received=s.waste*s.collection/100;
  const organic=s.waste*s.organic/100;
  const plastic=s.waste*s.plastic/100;
  const paper=s.waste*s.paper/100;
  const rest=s.waste-organic-plastic-paper;
  const eligibleOrg=organic*s.collection/100*s.sorting/100;
  const eligibleDry=(plastic+paper)*s.collection/100*s.sorting/100;
  const residual=Math.max(0,received-eligibleOrg-eligibleDry);
  return {received,organic,plastic,paper,rest,eligibleOrg,eligibleDry,residual,uncollected:s.waste-received};
}
function chooseVolume(option,m){return option.id==='compost'?m.eligibleOrg:option.id==='sort'?m.eligibleDry:m.residual;}
function rankOne(s,o){
  const m=mass(s),available=chooseVolume(o,m),processedDay=Math.min(s.capacity,available),processedMonth=processedDay*30,
        recoveredMonth=processedMonth*o.yield,soldMonth=Math.min(recoveredMonth,s.demand),revenueMonth=soldMonth*s.price,
        costMonth=processedMonth*o.opex,netMonth=revenueMonth-costMonth;
  const reasons=[];
  if(!s.operator)reasons.push('Operator terlatih belum dinyatakan tersedia.');
  if(s.budget<o.capex)reasons.push('Anggaran belum mencukupi CAPEX ilustratif.');
  if(s.collection<35)reasons.push('Cakupan pengumpulan terlalu rendah untuk skenario ini.');
  if(s.capacity<.5)reasons.push('Kapasitas pilot minimum tidak terpenuhi.');
  if(available<.5)reasons.push('Feedstock tertangkap dan terpilah kurang dari 0,5 ton/hari.');
  if(o.id==='compost'&&s.organic<30)reasons.push('Fraksi organik di bawah batas ilustratif 30%.');
  if((o.id==='compost'||o.id==='sort')&&s.sorting<30)reasons.push('Kesiapan pemilahan di bawah 30%.');
  if(o.id==='sort'&&s.plastic+s.paper<20)reasons.push('Fraksi anorganik pemulihan di bawah 20%.');
  if(o.id==='rdf'){
    if(s.capacity<25)reasons.push('Kapasitas fasilitas RDF ilustratif minimum 25 ton/hari.');
    if(!s.offTaker)reasons.push('Off-taker RDF belum dikonfirmasi.');
    if(!s.permission)reasons.push('Perizinan dan kendali lingkungan RDF belum dinyatakan terpenuhi.');
  }
  const eligible=reasons.length===0;
  const fundFit=clamp(s.budget/o.capex,0,1),materialFit=clamp(available/Math.max(s.capacity,.1),0,1),
        absorption=recoveredMonth?clamp(s.demand/recoveredMonth,0,1):0,
        profitRatio=costMonth?clamp(netMonth/costMonth,-1,1):0;
  const sub={
    environment:round(clamp(o.baseEnv*.7+materialFit*15+s.collection*.15,0,100),0),
    economy:round(clamp(36+absorption*31+profitRatio*17+fundFit*16,0,100),0),
    social:round(clamp(o.baseSocial*.77+s.collection*.13+s.sorting*.10,0,100),0),
    readiness:round(clamp(18+fundFit*31+s.sorting*.24+materialFit*27,0,100),0)
  };
  const weightTotal=Object.values(s.weights).reduce((a,b)=>a+num(b),0);
  const weights=weightTotal?Object.fromEntries(Object.entries(s.weights).map(([k,v])=>[k,num(v)/weightTotal])):{environment:.35,economy:.30,social:.20,readiness:.15};
  const score=round(Object.entries(sub).reduce((t,[k,v])=>t+v*weights[k],0),1);
  return {...o,available,processedDay,processedMonth,recoveredMonth,soldMonth,revenueMonth,costMonth,netMonth,absorption,score,eligible,reasons,sub,weights,
    operatingMargin:costMonth?netMonth/costMonth*100:0,
    capacityWarning:s.capacity>available};
}
function ranking(s){return D.options.map(o=>rankOne(s,o)).sort((a,b)=>Number(b.eligible)-Number(a.eligible)||b.score-a.score);}
function selected(s){return ranking(s).find(o=>o.id===s.selected);}
function sensitivity(s){
  const rankingBase=ranking(s).filter(o=>o.eligible);
  return [-20,0,20].map(delta=>{
    const copy=clone(s);copy.demand=clamp(round(s.demand*(1+delta/100)),0,5000);
    const r=ranking(copy).filter(x=>x.eligible);
    return {delta,top:r[0]||null,ranking:r,changed:!!r[0]&&!!rankingBase[0]&&r[0].id!==rankingBase[0].id};
  });
}
function economics(s){
  const o=selected(s),margin=o.revenueMonth-o.costMonth;
  const cashRecovery=margin>0?o.capex/margin:null;
  const costTon=o.processedMonth>0?o.costMonth/o.processedMonth:0;
  const recoveredCostTon=o.recoveredMonth>0?o.costMonth/o.recoveredMonth:0;
  const screening=o.eligible&&!!s.marketEvidence&&s.demand>0&&s.humanDecision==='approved';
  const warnings=[];
  if(!o.eligible)warnings.push('Alternatif tidak memenuhi prasyarat dasar; jangan memulai implementasi.');
  if(!s.marketEvidence)warnings.push('Belum ada bukti minat/kebutuhan pembeli atau pemanfaat yang tervalidasi.');
  if(margin<0)warnings.push('Pendapatan komersial ilustratif belum menutup OPEX; pertimbangkan manfaat layanan publik dan dukungan anggaran.');
  if(s.humanDecision!=='approved')warnings.push('Persetujuan manusia untuk pilot belum diberikan.');
  return {...o,margin,cashRecovery,costTon,recoveredCostTon,screening,warnings};
}
function verification(s){
  const p=s.pilot;
  const unknown=p.input-p.recovered-p.residue;
  const massValid=p.input>0&&p.recovered>=0&&p.residue>=0&&unknown>=-0.001;
  const saleValid=p.sold>=0&&p.sold<=p.recovered&&p.recovered>0;
  const materialStatus=massValid&&Math.abs(unknown)<=p.input*.05&&p.materialDoc&&p.fieldCheck;
  const marketStatus=saleValid&&p.marketDoc;
  const costStatus=p.costDoc&&p.recovered>0;
  const absorption=p.recovered>0?Math.min(100,p.sold/p.recovered*100):0;
  const recovery=p.input>0?p.recovered/p.input*100:0;
  const costPerRecovered=p.recovered>0?p.cost/p.recovered:null;
  const netCost=p.cost-p.revenue;
  const missing=[];
  if(!massValid)missing.push('Neraca material tidak masuk akal: keluaran lebih besar dari masukan.');
  else if(Math.abs(unknown)>p.input*.05)missing.push('Material belum terklasifikasi >5%: lengkapi residu atau jelaskan selisih.');
  if(!p.materialDoc)missing.push('Dokumen timbangan/material belum tersedia.');
  if(!p.fieldCheck)missing.push('Pemeriksaan lapangan belum dikonfirmasi.');
  if(!saleValid)missing.push('Penjualan tidak boleh melebihi volume yang dipulihkan.');
  if(!p.marketDoc)missing.push('Bukti penjualan/pemanfaatan belum tersedia.');
  if(!p.costDoc)missing.push('Dokumen biaya dan penerimaan belum tersedia.');
  const allVerified=materialStatus&&marketStatus&&costStatus;
  return {unknown,massValid,saleValid,materialStatus,marketStatus,costStatus,allVerified,missing,absorption,recovery,costPerRecovered,netCost,margin:p.revenue-p.cost};
}
function recommendation(s){
 const v=verification(s),eco=economics(s);
 if(!eco.eligible)return {key:'stop',title:'Hentikan / revisi kelayakan',description:'Alternatif tidak memenuhi prasyarat minimum pada skenario.'};
 if(s.humanDecision==='rejected')return {key:'stop',title:'Hentikan / revisi keputusan',description:'Persetujuan manusia tidak diberikan.'};
 if(!v.allVerified)return {key:'revise',title:'Perbaiki bukti dan catatan',description:'Hasil simulasi pilot belum lolos seluruh pemeriksaan verifikasi.'};
 if(v.recovery<15||v.absorption<40)return {key:'revise',title:'Perbaiki sebelum diperluas',description:'Indikator pemulihan atau serapan pasar masih di bawah ambang demonstrasi.'};
 if(eco.margin<0)return {key:'review',title:'Lanjut bersyarat: kaji pembiayaan',description:'Bukti lengkap, tetapi margin komersial skenario negatif; pertimbangkan manfaat publik dan biaya.'};
 return {key:'continue',title:'Layak dipertimbangkan untuk dilanjutkan',description:'Pemeriksaan demonstrasi terpenuhi; keputusan nyata tetap memerlukan penilaian manusia.'};
}
const engine={initial,sanitize,mass,ranking,selected,sensitivity,economics,verification,recommendation,round,clamp};
root.PASO_ENGINE=engine;
if(typeof module==='object'&&module.exports)module.exports=engine;
})(typeof window!=='undefined'?window:globalThis);
