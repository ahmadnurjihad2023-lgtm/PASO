# PASO — Pusat Audit Sampah Otoritas | Atlas Multilokasi

Website statis 10 halaman yang dapat langsung dibuka di browser, atau di-deploy ke Netlify/GitHub Pages.

## Bantuan isi lokasi (fitur terbaru)

- Buka **Wilayah → Tambah wilayah**, ketik `Jawa` pada **Provinsi**: otomatis muncul Jawa Barat, Jawa Tengah dan Jawa Timur. Ketik `Jawa Tengah` kemudian pilih dari opsi.
- Setelah provinsi dipilih, kolom **Kabupaten/kota** menjadi aktif; ketik `Sema` untuk memilih Kabupaten Semarang atau Kota Semarang. Setelah kabupaten/kota dipilih, kolom **Kecamatan** muncul dan memperlihatkan pilihan yang sesuai. Contoh luring: DI Yogyakarta → Kota Yogyakarta → Umbulharjo, Kotagede, Danurejan, dst.
- Navigasi rekomendasi mendukung klik/tap, tombol panah atas/bawah dan Enter. Kolom juga dapat diedit saat mengubah lokasi yang sudah tersimpan.
- Daftar 38 provinsi, sejumlah kabupaten/kota, dan kecamatan Kota Yogyakarta tersedia **tanpa internet**, termasuk daftar Jawa Barat, Jawa Tengah, Jawa Timur, DI Yogyakarta, Jakarta, Banten, Bali, dan lainnya.
- Untuk kabupaten/kota maupun kecamatan lainnya, website mencoba memperkaya daftar dari sumber API publik [emsifa](https://github.com/emsifa/api-wilayah-indonesia) saat ada internet. Apabila API tidak tersedia, pengguna tetap dapat mengetik nama zona layanan/kabupaten/kota secara manual. Pencarian tidak mengambil data sampah atau metrik lingkungan secara otomatis.
- Daftar nama administratif berasal dari referensi publik dan perlu dicek lagi sebelum digunakan dalam dokumen pemerintahan resmi.

## Fitur: multiwilayah

- Kelola lokasi melalui **Wilayah** di navigasi atau tombol **＋ Wilayah**.
- Tambahkan kabupaten, kota, atau wilayah layanan di provinsi mana pun.
- Setiap lokasi memiliki input diagnosis, pilihan intervensi, analisis biaya, pilot, verifikasi, dan laporan **secara terpisah**.
- Ganti lokasi menggunakan dropdown di header pada semua halaman.
- Hapus atau ubah nama lokasi dari halaman Wilayah. Penghapusan bersifat permanen di perangkat ini.
- Skenario Yogyakarta dimuat sebagai contoh awal, tetapi bukan satu-satunya lokasi.
- Berkas skenario JSON dan laporan CSV menggunakan nama wilayah aktif.

## Transparansi

PASO ditampilkan sebagai platform analisis wilayah. Hasil perhitungan pada data bawaan tetap merupakan simulasi ilustratif; website **tidak boleh ditafsirkan sebagai laporan audit lapangan atau penggunaan AI terlatih**. Data lokasi yang ditambahkan tidak otomatis diambil dari pemerintah. Pengguna perlu menyediakan data yang dapat divalidasi. Pilihan AI dalam esai adalah rencana pengembangan; pemeringkatan sekarang memakai aturan deterministik dan multikriteria.

## Penyimpanan dan migrasi

Data wilayah disimpan di localStorage browser (`paso-regions-v3`), tanpa server, API, ataupun login. Kode memigrasikan skenario satu kota terdahulu (`paso-yogyakarta-v2`) untuk lokasi Yogyakarta bila masih tersedia. Data tidak tersinkron antar perangkat atau browser. Unduh JSON per wilayah jika ingin memindahkan data. Reset hanya memengaruhi wilayah aktif.

## Cara membuka / deploy

Ekstrak ZIP, lalu buka `index.html`, atau gunakan Live Server di VS Code. Untuk Netlify, unggah seluruh isi folder ini; build command kosong, publish directory `.`.

## Halaman

`index.html` · `wilayah.html` · `dashboard.html` · `diagnosis.html` · `prioritas.html` · `ekonomi.html` · `pilot.html` · `verifikasi.html` · `laporan.html` · `metodologi.html`

## Pemeriksaan

Jalankan `node tests/autocomplete.test.cjs`, `node tests/regions.test.cjs`, `node tests/engine.test.cjs`, dan `node tests/pages.test.cjs` untuk memeriksa struktur dan logika. Daftar provinsi dan pilihan offline adalah data yang dibundel; daftar kabupaten/kota yang diambil dari API bergantung pada koneksi dan ketersediaan layanan pihak ketiga.

## Kecamatan sebagai cakupan analisis

- Kecamatan **opsional**. Dikosongkan berarti skenario kabupaten/kota secara keseluruhan; jika diisi, kecamatan ikut nama lokasi pada navigasi, hasil, laporan CSV dan JSON.
- Lokasi di kota yang sama tetapi berbeda kecamatan dapat disimpan sebagai dua analisis terpisah.
- Referensi kecamatan berasal dari `districts/{regency_id}.json` pada API wilayah emsifa v2, dengan daftar contoh 14 kecamatan Kota Yogyakarta tersedia luring. Ketika data belum tersedia, nama dapat diketik manual sehingga harus diperiksa kembali.
- Data kabupaten/kota atau kecamatan tidak otomatis menyediakan data sampah; angka tetap input/simulasi pengguna.
