/* PASO. Multiregion workspace, initially seeded with Kota Yogyakarta. Default numerical inputs are synthetic. */
(function(root){
  'use strict';
  const DATA={
    schema:2,
    version:'2.0.0',
    location:'Wilayah yang dipilih pengguna',
    credits:['Amar Al Haq','Ahmad Habib Ridho','Ahmad Nurjihad'],
    defaults:{
      area:'Zona layanan percontohan (ilustratif)',waste:120, organic:52,plastic:20,paper:12,
      collection:68,sorting:58,capacity:8,budget:1100,demand:50,price:1.2,
      offTaker:false,permission:false,operator:true,marketEvidence:false,
      weights:{environment:35,economy:30,social:20,readiness:15},
      selected:'compost', humanDecision:'pending', humanNotes:'',
      pilot:{days:30,input:150,recovered:72,residue:54,sold:45,cost:80,revenue:40,workers:8,
        materialDoc:false,marketDoc:false,costDoc:false,fieldCheck:false,notes:''},
      conclusion:'revise', feedback:'', updatedAt:null
    },
    options:[
      {id:'compost',label:'Kompos berbasis komunitas',short:'Pengolahan fraksi organik dengan pelibatan komunitas.',category:'Organik',capex:520,opex:0.32,yield:0.32,baseEnv:85,baseSocial:88,color:'#099E89',icon:'leaf',steps:['Pemilahan di sumber','Pengangkutan bahan organik','Komposting','Pematangan & uji mutu','Pemanfaatan produk'],risk:'Mutu input dan pencampuran residu; mutu kompos serta kepastian pemanfaatan perlu diperiksa.'},
      {id:'sort',label:'Bank sampah + fasilitas sortasi',short:'Pemulihan anorganik bernilai melalui jaringan bank sampah.',category:'Anorganik',capex:820,opex:0.52,yield:0.78,baseEnv:78,baseSocial:90,color:'#236BBF',icon:'layers',steps:['Penerimaan & penimbangan','Pemisahan jenis material','Penyimpanan aman','Pengiriman ke pembeli','Verifikasi transaksi'],risk:'Harga komoditas fluktuatif; kualitas dan volume pembeli harus dipastikan.'},
      {id:'rdf',label:'RDF skala fasilitas',short:'Konversi residu terpilah menjadi bahan bakar alternatif.',category:'Residu',capex:2800,opex:1.15,yield:0.60,baseEnv:63,baseSocial:60,color:'#D79742',icon:'factory',steps:['Pemeriksaan feedstock','Pengeringan & pencacahan','Pengujian mutu','Distribusi ke off-taker','Pelaporan emisi dan residu'],risk:'Membutuhkan off-taker terkonfirmasi, izin, kendali emisi, pasokan dan kapasitas teknis.'}
    ],
    menu:[
      {href:'index.html',label:'Beranda',icon:'house'},
      {href:'dashboard.html',label:'Dashboard',icon:'layout-dashboard'},
      {href:'diagnosis.html',label:'01 · Diagnosis',icon:'scan-search'},
      {href:'prioritas.html',label:'02 · Prioritas',icon:'list-filter'},
      {href:'ekonomi.html',label:'03 · Ekonomi',icon:'wallet'},
      {href:'pilot.html',label:'04 · Pilot',icon:'flask-conical'},
      {href:'verifikasi.html',label:'05 · Verifikasi',icon:'shield-check'},
      {href:'laporan.html',label:'Laporan',icon:'file-text'},
      {href:'metodologi.html',label:'Tentang sistem',icon:'book-open'}
    ],
    references:[
      {label:'Diagram mekanisme operasional lima tahap (bahan tim, 2026)',url:''},
      {label:'Draf esai Pusat Audit Sampah Otoritas (PASO), 2026',url:''},
      {label:'SIPSN — Data timbulan sampah (portal pemerintah)',url:'https://sampahnasional.kemenlh.go.id/portal-indikatif/data/timbulan-sampah'},
      {label:'Bappeda Kota Yogyakarta — Tantangan dan peluang pengelolaan sampah (2024)',url:'https://bappeda.jogjakota.go.id/detail/index/35879'},
      {label:'RPJMD Kota Yogyakarta 2025–2029 (14 kemantren, data penduduk 2024)',url:'https://ppid-files.jogjakota.go.id/assets/instansi/ppid-files/files/perda-rpjmd-kota-yogyakarta-2025-2029-19925.pdf'},
      {label:'Artha, Nurasa & Candrawedini (2023)',url:'https://jurnal.utu.ac.id/jppolicy/article/view/7656'},
      {label:'El Jaouhari dkk. (2025)',url:'https://doi.org/10.1016/j.jenvman.2024.123658'},
      {label:'Gutierrez-Lopez dkk. (2023)',url:'https://doi.org/10.3390/su151813316'},
      {label:'Rahman & Wibisono (2026)',url:'https://doi.org/10.1007/s43615-026-01031-w'},
      {label:'Waylen dkk. (2019)',url:'https://doi.org/10.1016/j.scitotenv.2018.12.462'}
    ]
  };
  root.PASO_DATA=DATA;
  if(typeof module==='object'&&module.exports)module.exports=DATA;
})(typeof window!=='undefined'?window:globalThis);
