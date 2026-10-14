/* PASO — Bantuan lokasi bertingkat: provinsi → kabupaten/kota → kecamatan.
 * Form tetap mengizinkan kecamatan kosong untuk analisis seluruh kabupaten/kota.
 * Referensi emsifa API v2 dipakai bila daring; Yogyakarta memiliki contoh daftar luring.
 */
(function(root){
 'use strict';
 const regions=root.PASO_REGIONS;if(!regions)return;
 const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function mount(form){
  if(!form||form.dataset.addressMounted==='true')return;
  const province=form.querySelector('#regionProvince'),city=form.querySelector('#regionName'),district=form.querySelector('#regionDistrict');
  if(!province||!city||!district)return;
  form.dataset.addressMounted='true';
  const cityHint=form.querySelector('#regionCityHint'),districtHint=form.querySelector('#regionDistrictHint');
  const controls=[
   {input:province,box:form.querySelector('#provinceOptions'),kind:'province',items:[],active:-1},
   {input:city,box:form.querySelector('#cityOptions'),kind:'city',items:[],active:-1},
   {input:district,box:form.querySelector('#districtOptions'),kind:'district',items:[],active:-1}
  ];
  let provinceId=null,cityId=null,provinceReq=0,districtReq=0;
  const close=c=>{if(!c.box)return;c.box.hidden=true;c.input.setAttribute('aria-expanded','false');c.input.removeAttribute('aria-activedescendant');c.active=-1;};
  const closeAll=()=>controls.forEach(close);
  const resetDistrict=()=>{district.value='';district.dataset.selectedDistrict='';districtHint.textContent='Pilih kabupaten/kota terlebih dahulu.';district.disabled=true;districtReq++;close(controls[2]);};
  const findProvince=()=>regions.provinces.find(x=>x.id===provinceId)||null;
  function resolveCity(){return regions.findCity(provinceId,city.value);}
  function applyCity(x,{preserveDistrict=false}={}){
   if(!x)return;
   city.value=x.name;cityId=x.id||null;city.dataset.selectedCity=cityId||'';
   if(!preserveDistrict)resetDistrict();
   district.disabled=false;district.placeholder='Ketik nama kecamatan (opsional)';
   const current=++districtReq;
   if(!cityId){districtHint.textContent='Daftar kecamatan belum tersedia. Isi manual atau lewati untuk analisis tingkat kota/kabupaten.';close(controls[2]);return;}
   districtHint.textContent='Memuat kecamatan untuk '+city.value+'…';
   regions.loadDistricts(cityId).then(()=>{
    if(current!==districtReq)return;
    const n=regions.listDistricts(cityId).length;
    districtHint.textContent=n?'Ketik nama kecamatan dan pilih saran. Kosongkan untuk menganalisis seluruh kabupaten/kota.':'Daftar kecamatan belum tersedia. Nama dapat ditulis manual atau dikosongkan.';
    if(document.activeElement===district)show(controls[2]);
   });
  }
  function applyProvince(x,{preserveCity=false,preserveDistrict=false}={}){
   if(!x)return;
   provinceId=x.id;province.value=x.name;province.dataset.provinceId=x.id;province.setCustomValidity('');
   city.disabled=false;city.placeholder='Ketik nama kabupaten atau kota';
   cityId=null;city.dataset.selectedCity='';
   if(!preserveCity)city.value='';
   if(!preserveDistrict)resetDistrict();
   cityHint.textContent='Cari kabupaten/kota. Pilih saran untuk memuat kecamatannya.';
   closeAll();const current=++provinceReq;
   regions.loadCities(x.id).then(()=>{
    if(current!==provinceReq)return;
    cityHint.textContent='Pilih kabupaten/kota dari saran atau isi manual untuk wilayah layanan khusus.';
    const existing=resolveCity();
    if(existing)applyCity(existing,{preserveDistrict});
    else if(city.value.trim().length>=3){district.disabled=false;districtHint.textContent='Isi kecamatan manual bila diperlukan, atau biarkan kosong.';}
    if(document.activeElement===city)show(controls[1]);
   });
  }
  function matching(c){
   if(c.kind==='province')return regions.searchProvinces(c.input.value);
   if(c.kind==='city')return regions.searchCities(provinceId,c.input.value);
   return regions.searchDistricts(cityId,c.input.value);
  }
  function show(c){
   if(!c.box||c.input.disabled){close(c);return;}
   c.items=matching(c).slice(0,10);c.active=-1;
   if(!c.items.length){
    const typed=c.input.value.trim();
    if(typed){const msg=c.kind==='province'?'Provinsi tidak ditemukan. Periksa penulisannya.':c.kind==='city'?'Tidak ditemukan. Kamu masih bisa menulis nama kabupaten/kota sendiri.':'Kecamatan tidak ditemukan. Kamu bisa menulis nama sendiri atau mengosongkan kolom.';
     c.box.innerHTML='<li class="suggest-empty" role="presentation">'+esc(msg)+'</li>';c.box.hidden=false;c.input.setAttribute('aria-expanded','true');}
    else close(c);return;
   }
   c.box.innerHTML=c.items.map((x,i)=>'<li role="option" class="suggest-option" aria-selected="false" id="'+c.kind+'-option-'+i+'" data-suggest-index="'+i+'"><span class="suggest-icon" aria-hidden="true">'+(c.kind==='district'?'⌁':c.kind==='province'?'⌖':'↗')+'</span><span>'+esc(x.name)+'</span>'+(c.kind==='province'?'<small>Provinsi</small>':'')+'</li>').join('');
   c.box.hidden=false;c.input.setAttribute('aria-expanded','true');
  }
  function highlight(c,index){if(!c.items.length)return;c.active=(index+c.items.length)%c.items.length;
   c.box.querySelectorAll('[role="option"]').forEach((el,i)=>{const on=i===c.active;el.classList.toggle('is-highlighted',on);el.setAttribute('aria-selected',String(on));if(on)el.scrollIntoView({block:'nearest'});});
   c.input.setAttribute('aria-activedescendant',c.kind+'-option-'+c.active);
  }
  function choose(c,index){const x=c.items[index];if(!x)return;
   if(c.kind==='province'){applyProvince(x);city.focus();}
   else if(c.kind==='city'){applyCity(x);district.focus();}
   else{district.value=x.name;district.dataset.selectedDistrict=x.id||'';districtHint.textContent='Kecamatan '+x.name+' dipilih. Kamu bisa lanjut mengisi cakupan atau menyimpan lokasi.';}
   close(c);
  }
  controls.forEach(c=>{
   if(!c.box)return;
   c.input.addEventListener('focus',()=>show(c));
   c.input.addEventListener('input',()=>{
    if(c.kind==='province'){
     const exact=regions.provinceFromName(province.value);
     provinceId=null;province.dataset.provinceId='';provinceReq++;city.disabled=true;city.value='';city.dataset.selectedCity='';resetDistrict();cityHint.textContent='Pilih provinsi dari daftar saran.';
     if(exact)applyProvince(exact);
    }else if(c.kind==='city'){
     const exact=resolveCity();cityId=null;city.dataset.selectedCity='';resetDistrict();
     if(exact)applyCity(exact);
     else if(city.value.trim().length>=3){district.disabled=false;districtHint.textContent='Jika kecamatan diperlukan, isi manual atau pilih dulu kabupaten/kota dari saran.';}
    }else{district.dataset.selectedDistrict='';}
    show(c);
   });
   c.input.addEventListener('keydown',e=>{
    if(e.key==='Escape'){close(c);return;}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(c.box.hidden)show(c);highlight(c,c.active+(e.key==='ArrowDown'?1:-1));return;}
    if(e.key==='Enter'&&!c.box.hidden&&c.active>=0){e.preventDefault();choose(c,c.active);}
   });
   c.input.addEventListener('blur',()=>{
    setTimeout(()=>{close(c);
      if(c.kind==='province'&&!findProvince()){const x=regions.provinceFromName(province.value);if(x)applyProvince(x);}
      if(c.kind==='city'&&!cityId&&resolveCity())applyCity(resolveCity(),{preserveDistrict:true});
    },140);
   });
   c.box.addEventListener('pointerdown',e=>{if(e.target.closest('[data-suggest-index]'))e.preventDefault();});
   c.box.addEventListener('click',e=>{const opt=e.target.closest('[data-suggest-index]');if(opt)choose(c,Number(opt.dataset.suggestIndex));});
  });
  form.addEventListener('reset',()=>{provinceId=null;cityId=null;provinceReq++;resetDistrict();city.disabled=true;closeAll();cityHint.textContent='Pilih provinsi terlebih dahulu.';});
  form.addEventListener('submit',e=>{const valid=findProvince()||regions.provinceFromName(province.value);if(!valid){e.preventDefault();e.stopPropagation();province.setCustomValidity('Pilih provinsi dari saran.');province.reportValidity();province.focus();show(controls[0]);return;}
    province.value=valid.name;
    // Koreksi kode kecamatan ketika input manual tidak cocok dengan saran resmi.
    const selected=regions.listDistricts(cityId).find(x=>regions.normalize(x.name)===regions.normalize(district.value));
    district.dataset.selectedDistrict=selected?.id||'';
  },true);
  form.pasoApplyExisting=item=>{
   const p=regions.provinceFromName(item.province);if(!p){city.disabled=false;district.disabled=false;return;}
   applyProvince(p,{preserveCity:true,preserveDistrict:true});
   const cityEntry=regions.findCity(p.id,item.name);
   if(cityEntry)applyCity(cityEntry,{preserveDistrict:true});
   else{district.disabled=false;districtHint.textContent='Kecamatan tersimpan dapat diubah manual. Daftar baru dimuat setelah kota teridentifikasi.';}
  };
 }
 function fill(form,item){if(!form||!item)return;
  form.querySelector('#regionEditId').value=item.id||'';
  form.querySelector('#regionProvince').value=item.province||'';
  form.querySelector('#regionName').value=item.name||'';
  form.querySelector('#regionDistrict').value=item.district||'';
  form.querySelector('#regionDistrict').dataset.selectedDistrict=item.districtCode||'';
  form.querySelector('#regionArea').value=item.area||'';
  form.querySelector('#regionCopy').checked=false;
  form.querySelector('#regionCopy').closest('label').hidden=true;
  form.querySelector('#regionFormTitle').textContent='Ubah wilayah';
  form.querySelector('#regionFormSubtitle').textContent='Perbarui alamat tanpa menghapus parameter dan laporan wilayah.';
  form.querySelector('#regionSubmit').textContent='Simpan perubahan wilayah';
  form.querySelector('#regionCancelEdit').hidden=false;
  if(typeof form.pasoApplyExisting==='function')form.pasoApplyExisting(item);
 }
 root.PASO_ADDRESS={mount,fill};
})(typeof window!=='undefined'?window:globalThis);
