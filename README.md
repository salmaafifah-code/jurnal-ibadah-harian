# Jurnal Ibadah Harian

Aplikasi web sederhana untuk mencatat ibadah harian dan melihat rekap dalam rentang tanggal pilihan. Tampilan dapat digunakan di ponsel maupun komputer.

## Fitur

- Mencatat jurnal berdasarkan tanggal.
- Mengatur daftar ibadah: menambah, mengubah, dan menghapus kegiatan.
- Mencatat jumlah lembar tilawah Al-Qur’an.
- Melihat rekap dan tanggal saat setiap ibadah dicentang.
- Membuat rekap bulanan dalam format siap cetak atau disimpan sebagai PDF.
- Menambahkan nama pengguna pada PDF.
- Mengaktifkan **Sedang udzur (menstruasi)** untuk menampilkan dzikir pagi, dzikir petang, Ratib, Al-Mulk sebelum tidur, Muraja’ah, sedekah, dan olahraga. Tanggal udzur ditandai merah di PDF.

## Menjalankan aplikasi

Aplikasi ini menggunakan HTML, CSS, dan JavaScript tanpa proses build atau instalasi paket.

1. Unduh atau clone repositori.
2. Buka `index.html` di browser.
3. Untuk mengaksesnya dari ponsel melalui GitHub Pages, unggah berkas aplikasi ke repositori GitHub lalu aktifkan Pages pada **Settings → Pages**. Pilih **Deploy from a branch**, cabang `main`, dan folder `/ (root)` jika berkas `index.html` berada di akar repositori.

Berkas utama aplikasi: `index.html`, `app.js`, dan `style.css`. Sertakan juga `manifest.json` dan `icon.svg` jika keduanya ada di repositori.

## Menyimpan PDF

Buka tab **Rekap**, tentukan tanggal mulai dan akhir, lalu pilih **Buat rekap**. Tekan **Cetak / simpan rekap sebagai PDF**, kemudian pilih **Save as PDF / Simpan sebagai PDF** pada dialog cetak browser. Aktifkan pencetakan warna/latar belakang agar penanda tanggal udzur merah tercetak dengan baik.

## Penyimpanan dan privasi

Jurnal dan daftar ibadah disimpan di penyimpanan lokal browser (`localStorage`) pada perangkat yang digunakan. Aplikasi ini tidak memakai akun atau server untuk menyinkronkan data. Data tidak otomatis berpindah saat berganti browser atau perangkat; hindari menghapus data situs jika ingin mempertahankan catatan pada perangkat tersebut.

## Teknologi

- HTML
- CSS
- JavaScript
- Penyimpanan lokal browser (`localStorage`)
