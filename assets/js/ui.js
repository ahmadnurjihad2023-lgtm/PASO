(function(root){
'use strict';
const E=root.PASO_ENGINE;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(v,d=1)=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:d}).format(Number(v)||0);
const money=(v,d=1)=>`Rp ${fmt(v,d)} juta`;
const bigMoney=(v,d=1)=>`Rp ${fmt(v,d)} jt`;
const pct=(v,d=1)=>`${fmt(v,d)}%`;
const status=(success,labelOk='Memenuhi',labelFail='Belum memenuhi')=>`<span class="badge ${success?'badge-green':'badge-amber'}">${success?'✓':'!'} ${success?labelOk:labelFail}</span>`;
const badge=(txt,kind='grey')=>`<span class="badge badge-${kind}">${escape(txt)}</span>`;
const metric=(label,val,foot='',cls='')=>`<div class="card metric ${cls}"><span class="metric-name">${escape(label)}</span><strong class="tabular">${val}</strong><span class="metric-foot">${foot}</span></div>`;
const panel=(title,description='',more='')=>`<div class="panel-heading"><div><h2>${title}</h2>${description?`<p>${description}</p>`:''}</div>${more}</div>`;
const note=(text,kind='')=>`<div class="note ${kind}">${text}</div>`;
const chart=(items)=>`<div class="chart-bars">${items.map(({label,value,color='#d05d3e',text})=>`<div class="chart-row"><label>${escape(label)}</label><div class="chart-track"><i style="width:${E.clamp(value,0,100)}%;background:${color}"></i></div><span class="value">${text??pct(value,0)}</span></div>`).join('')}</div>`;
const info=(items)=>`<div class="info-list">${items.map(([l,v])=>`<div class="info-row"><span>${l}</span><strong>${v}</strong></div>`).join('')}</div>`;
const input=(s,k,l,opts={})=>`<div class="form-row"><label for="fld-${k}">${l}</label><input id="fld-${k}" type="number" data-field="${k}" value="${s[k]}" min="${opts.min??0}" max="${opts.max??10000}" step="${opts.step??1}"/><span class="helper">${opts.help||''}</span></div>`;
const range=(s,k,l,opts={})=>`<div class="form-row"><label for="rng-${k}">${l}</label><div class="range-row"><input id="rng-${k}" type="range" data-range="${k}" min="${opts.min??0}" max="${opts.max??100}" step="${opts.step??1}" value="${s[k]}"/><input aria-label="${escape(l)}" type="number" data-field="${k}" min="${opts.min??0}" max="${opts.max??100}" step="${opts.step??1}" value="${s[k]}"/></div><span class="helper">${opts.help||''}</span></div>`;
const toggle=(s,k,l,h='')=>`<label class="switch-row"><span>${l}${h?`<small>${h}</small>`:''}</span><input type="checkbox" data-toggle="${k}" ${s[k]?'checked':''}></label>`;
const pilotInput=(s,k,l,opts={})=>`<div class="form-row"><label for="p-${k}">${l}</label><input id="p-${k}" type="number" min="0" max="200000" step="${opts.step??.1}" data-pilot="${k}" value="${s.pilot[k]}"/><span class="helper">${opts.help||''}</span></div>`;
const pilotToggle=(s,k,l,h='')=>`<label class="switch-row"><span>${l}${h?`<small>${h}</small>`:''}</span><input type="checkbox" data-pilot-toggle="${k}" ${s.pilot[k]?'checked':''}></label>`;
const steps=(current)=>`<div class="stepper" aria-label="Tahapan keputusan">${[
['diagnosis','Data wilayah'],['prioritas','Pilih solusi'],['ekonomi','Kelayakan'],['pilot','Uji coba'],['verifikasi','Periksa hasil']].map(([name,label],i)=>`${i?'<span class="step-arrow">›</span>':''}<a href="${name}.html" ${name===current?'aria-current="step" class="current"':''}>${String(i+1).padStart(2,'0')} · ${label}</a>`).join('')}</div>`;
const scenarioDisclaimer=()=>note('<strong>Transparansi:</strong> semua input angka, ambang, bobot, biaya, dan hasil yang dihitung adalah parameter <em>sintetis untuk demonstrasi</em>. Bukan statistik resmi wilayah aktif, bukan model AI terlatih, dan bukan verifikasi lapangan.','warning');
const box=(icon,title,desc)=>`<div class="actor"><strong>${icon} ${title}</strong><p>${desc}</p></div>`;
root.PASO_UI={escape,fmt,money,bigMoney,pct,status,badge,metric,panel,note,chart,info,input,range,toggle,pilotInput,pilotToggle,steps,scenarioDisclaimer,box};
})(window);
