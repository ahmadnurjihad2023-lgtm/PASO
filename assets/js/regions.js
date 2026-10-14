/* Hierarki lokasi Indonesia: provinsi, kabupaten/kota, kecamatan (bertahap).
 * Data API: https://github.com/emsifa/api-wilayah-indonesia (pembaharuan berkala, periksa ulang untuk penggunaan resmi).
 */
(function(root){
  'use strict';
  const provinces=[
    ['11','Aceh'],['12','Sumatera Utara'],['13','Sumatera Barat'],['14','Riau'],['15','Jambi'],
    ['16','Sumatera Selatan'],['17','Bengkulu'],['18','Lampung'],['19','Kepulauan Bangka Belitung'],['21','Kepulauan Riau'],
    ['31','DKI Jakarta'],['32','Jawa Barat'],['33','Jawa Tengah'],['34','DI Yogyakarta'],['35','Jawa Timur'],['36','Banten'],
    ['51','Bali'],['52','Nusa Tenggara Barat'],['53','Nusa Tenggara Timur'],
    ['61','Kalimantan Barat'],['62','Kalimantan Tengah'],['63','Kalimantan Selatan'],['64','Kalimantan Timur'],['65','Kalimantan Utara'],
    ['71','Sulawesi Utara'],['72','Sulawesi Tengah'],['73','Sulawesi Selatan'],['74','Sulawesi Tenggara'],['75','Gorontalo'],['76','Sulawesi Barat'],
    ['81','Maluku'],['82','Maluku Utara'],['91','Papua'],['92','Papua Barat'],['93','Papua Selatan'],['94','Papua Tengah'],['95','Papua Pegunungan'],['96','Papua Barat Daya']
  ].map(([id,name])=>({id,name}));
  const fallback={
    '31':{kab:'Kepulauan Seribu',kota:'Jakarta Pusat|Jakarta Utara|Jakarta Barat|Jakarta Selatan|Jakarta Timur'},
    '32':{kab:'Bogor|Sukabumi|Cianjur|Bandung|Garut|Tasikmalaya|Ciamis|Kuningan|Cirebon|Majalengka|Sumedang|Indramayu|Subang|Purwakarta|Karawang|Bekasi|Bandung Barat|Pangandaran',kota:'Bogor|Sukabumi|Bandung|Cirebon|Bekasi|Depok|Cimahi|Tasikmalaya|Banjar'},
    '33':{kab:'Cilacap|Banyumas|Purbalingga|Banjarnegara|Kebumen|Purworejo|Wonosobo|Magelang|Boyolali|Klaten|Sukoharjo|Wonogiri|Karanganyar|Sragen|Grobogan|Blora|Rembang|Pati|Kudus|Jepara|Demak|Semarang|Temanggung|Kendal|Batang|Pekalongan|Pemalang|Tegal|Brebes',kota:'Magelang|Surakarta|Salatiga|Semarang|Pekalongan|Tegal'},
    '34':{kab:'Kulon Progo|Bantul|Gunungkidul|Sleman',kota:'Yogyakarta'},
    '35':{kab:'Pacitan|Ponorogo|Trenggalek|Tulungagung|Blitar|Kediri|Malang|Lumajang|Jember|Banyuwangi|Bondowoso|Situbondo|Probolinggo|Pasuruan|Sidoarjo|Mojokerto|Jombang|Nganjuk|Madiun|Magetan|Ngawi|Bojonegoro|Tuban|Lamongan|Gresik|Bangkalan|Sampang|Pamekasan|Sumenep',kota:'Kediri|Blitar|Malang|Probolinggo|Pasuruan|Mojokerto|Madiun|Surabaya|Batu'},
    '36':{kab:'Pandeglang|Lebak|Tangerang|Serang',kota:'Tangerang|Cilegon|Serang|Tangerang Selatan'},
    '51':{kab:'Jembrana|Tabanan|Badung|Gianyar|Klungkung|Bangli|Karangasem|Buleleng',kota:'Denpasar'},
    '52':{kab:'Lombok Barat|Lombok Tengah|Lombok Timur|Sumbawa|Dompu|Bima|Sumbawa Barat|Lombok Utara',kota:'Mataram|Bima'},
    '14':{kab:'Kampar|Indragiri Hulu|Indragiri Hilir|Pelalawan|Siak|Kuantan Singingi|Rokan Hulu|Rokan Hilir|Bengkalis|Kepulauan Meranti',kota:'Pekanbaru|Dumai'},
    '73':{kab:'Gowa|Maros|Bone|Bulukumba|Takalar|Pangkajene dan Kepulauan|Barru|Soppeng|Wajo|Sidenreng Rappang|Pinrang|Enrekang|Luwu|Tana Toraja|Luwu Utara|Toraja Utara|Luwu Timur|Bantaeng|Jeneponto|Sinjai|Selayar',kota:'Makassar|Parepare|Palopo'}
  };
  const synonyms={'daerah istimewa yogyakarta':'34','diy':'34','jogja':'34','yogyakarta':'34','jakarta':'31','daerah khusus jakarta':'31'};
  const normalize=(s)=>String(s||'').toLocaleLowerCase('id-ID').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const localList=id=>{
    const entry=fallback[id]; if(!entry)return [];
    return ['kab','kota'].flatMap(type=>String(entry[type]||'').split('|').filter(Boolean).map(name=>({id:(id==='34'&&type==='kota'&&name==='Yogyakarta')?'34.71':'',name:(type==='kab'?'Kabupaten ':'Kota ')+name})));
  };
  const dedup=entries=>Array.from(entries.reduce((map,x)=>{const key=normalize(x.name),before=map.get(key);if(!before||(x.id&&!before.id))map.set(key,x);return map;},new Map()).values()).sort((a,b)=>a.name.localeCompare(b.name,'id'));
  const cache=new Map();
  let checked=new Set();
  const districtCache=new Map(),checkedDistricts=new Set();
  // Pilihan dasar Kota Yogyakarta tersedia tanpa koneksi; wilayah lain memuat daftar dari API.
  const offlineDistricts={'34.71':'Danurejan|Gedongtengen|Gondokusuman|Gondomanan|Jetis|Kotagede|Kraton|Mantrijeron|Mergangsan|Ngampilan|Pakualaman|Tegalrejo|Umbulharjo|Wirobrajan'};
  const listDistricts=id=>dedup([...(districtCache.get(id)||[]),...(offlineDistricts[id]||'').split('|').filter(Boolean).map(name=>({id:'',name}))]);
  async function loadDistricts(regencyId){
    if(!/^\d{2}\.\d{2}$/.test(String(regencyId||'')))return listDistricts(regencyId);
    if(checkedDistricts.has(regencyId))return listDistricts(regencyId);
    checkedDistricts.add(regencyId);
    try{
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6500);
      let response;try{response=await fetch('https://www.emsifa.com/api-wilayah-indonesia/v2/districts/'+encodeURIComponent(regencyId)+'.json',{signal:controller.signal});}finally{clearTimeout(timer);}
      if(!response.ok)throw Error('HTTP '+response.status);
      const payload=await response.json();
      if(!Array.isArray(payload.data)||!payload.data.length)throw Error('Tidak ada kecamatan');
      districtCache.set(regencyId,payload.data.filter(x=>x&&typeof x.name==='string').map(x=>({id:x.id||'',name:x.name})));
    }catch(_){checkedDistricts.delete(regencyId);}
    return listDistricts(regencyId);
  }
  const provinceFromName=name=>provinces.find(x=>normalize(x.name)===normalize(name))||provinces.find(x=>x.id===synonyms[normalize(name)])||null;
  function rankItems(entries,q){const key=normalize(q);const list=entries.filter(x=>normalize(x.name).includes(key));return list.sort((a,b)=>{
    const an=normalize(a.name),bn=normalize(b.name);const ax=an.startsWith(key)?0:1,bx=bn.startsWith(key)?0:1;
    return ax-bx||an.localeCompare(bn,'id');
  });}
  function listCities(provinceId){return dedup([...(cache.get(provinceId)||[]),...localList(provinceId)]);}
  async function loadCities(provinceId){
    if(!provinces.some(x=>x.id===provinceId))return listCities(provinceId);
    if(checked.has(provinceId))return listCities(provinceId);
    checked.add(provinceId);
    try{
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6500);
      let response;try{response=await fetch('https://www.emsifa.com/api-wilayah-indonesia/v2/regencies/'+encodeURIComponent(provinceId)+'.json',{signal:controller.signal});}finally{clearTimeout(timer);}
      if(!response.ok)throw Error('HTTP '+response.status);
      const payload=await response.json();
      if(!Array.isArray(payload.data)||!payload.data.length)throw Error('Data kosong');
      cache.set(provinceId,payload.data.filter(x=>x&&typeof x.name==='string').map(x=>({id:x.id||'',name:x.name})));
    }catch(_){checked.delete(provinceId); /* Luring / server gagal: pilihan lokal dan pengetikan manual tetap dapat dipakai. */}
    return listCities(provinceId);
  }
  root.PASO_REGIONS={provinces,normalize,provinceFromName,searchProvinces:q=>rankItems(provinces,q),searchCities:(id,q)=>rankItems(listCities(id),q),listCities,loadCities,findCity:(id,name)=>listCities(id).find(x=>normalize(x.name)===normalize(name))||null,searchDistricts:(id,q)=>rankItems(listDistricts(id),q),listDistricts,loadDistricts};
  if(typeof module==='object'&&module.exports)module.exports=root.PASO_REGIONS;
})(typeof window!=='undefined'?window:globalThis);
