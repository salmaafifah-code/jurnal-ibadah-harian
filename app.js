const tanggalInput = document.querySelector("#tanggal");
const tilawahInput = document.querySelector("#tilawah");
const tombolSimpan = document.querySelector("#simpan");
const pesan = document.querySelector("#pesan");
const kotakCentang = document.querySelectorAll('input[type="checkbox"]');
localStorage.removeItem("jurnal-ibadah-waktu-pengingat");

function tanggalHariIni() {
  const sekarang = new Date();
  const waktuLokal = new Date(
    sekarang.getTime() - sekarang.getTimezoneOffset() * 60000
  );

  return waktuLokal.toISOString().slice(0, 10);
}

function kunciUntukTanggal(tanggal) {
  return `jurnal-ibadah-${tanggal}`;
}

function muatJurnal() {
  const tanggal = tanggalInput.value;
  const tersimpan = localStorage.getItem(kunciUntukTanggal(tanggal));
  const jurnal = tersimpan ? JSON.parse(tersimpan) : {};

  kotakCentang.forEach((kotak) => {
    kotak.checked = Boolean(jurnal[kotak.name]);
  });

  tilawahInput.value = jurnal.tilawah ?? 0;
  pesan.textContent = tersimpan ? "Jurnal tanggal ini dimuat." : "";
}

tanggalInput.value = tanggalHariIni();
muatJurnal();

tanggalInput.addEventListener("change", muatJurnal);

tombolSimpan.addEventListener("click", () => {
  const tanggal = tanggalInput.value;

  if (!tanggal) {
    pesan.textContent = "Pilih tanggal jurnal terlebih dahulu.";
    return;
  }

  const jurnal = {
    tilawah: Number(tilawahInput.value) || 0,
  };

  kotakCentang.forEach((kotak) => {
    jurnal[kotak.name] = kotak.checked;
  });

  localStorage.setItem(kunciUntukTanggal(tanggal), JSON.stringify(jurnal));
  pesan.textContent = "Jurnal berhasil disimpan.";
});

const rekapDari = document.querySelector("#rekap-dari");
const rekapSampai = document.querySelector("#rekap-sampai");
const hasilRekap = document.querySelector("#hasil-rekap");
const namaPdfInput = document.querySelector("#nama-pdf");
const tombolCetakRekap = document.querySelector("#cetak-rekap");
const dokumenRekap = document.querySelector("#dokumen-rekap");
let rentangRekapCetak = null;

namaPdfInput.value = localStorage.getItem("jurnal-ibadah-nama-pdf") || "";
namaPdfInput.addEventListener("input", () => {
  localStorage.setItem("jurnal-ibadah-nama-pdf", namaPdfInput.value.trim());
});

const tanggalAkhirDefault = tanggalHariIni();
const tanggalMulaiDefault = new Date(`${tanggalAkhirDefault}T00:00:00Z`);
tanggalMulaiDefault.setUTCDate(tanggalMulaiDefault.getUTCDate() - 6);

rekapDari.value = tanggalMulaiDefault.toISOString().slice(0, 10);
rekapSampai.value = tanggalAkhirDefault;

[rekapDari, rekapSampai].forEach((input) => {
  input.addEventListener("change", () => {
    tombolCetakRekap.hidden = true;
    rentangRekapCetak = null;
  });
});

document.querySelector("#buat-rekap").addEventListener("click", () => {
  const mulai = rekapDari.value;
  const sampai = rekapSampai.value;

  hasilRekap.replaceChildren();
  tombolCetakRekap.hidden = true;
  rentangRekapCetak = null;

  if (!mulai || !sampai || mulai > sampai) {
    hasilRekap.textContent = "Pilih rentang tanggal yang benar.";
    return;
  }

  rentangRekapCetak = { mulai, sampai };
  tombolCetakRekap.hidden = false;

  let jumlahHari = 0;
  let hariTersimpan = 0;
  let totalTilawah = 0;
  const hitungan = {};
  const tanggalKegiatan = {};

  kotakCentang.forEach((kotak) => {
    hitungan[kotak.name] = 0;
    tanggalKegiatan[kotak.name] = [];
  });

  const tanggal = new Date(`${mulai}T00:00:00Z`);
  const tanggalAkhir = new Date(`${sampai}T00:00:00Z`);

  while (tanggal <= tanggalAkhir) {
    const tanggalTeks = tanggal.toISOString().slice(0, 10);
    const tersimpan = localStorage.getItem(kunciUntukTanggal(tanggalTeks));

    jumlahHari += 1;

    if (tersimpan) {
      const jurnal = JSON.parse(tersimpan);
      hariTersimpan += 1;
      totalTilawah += Number(jurnal.tilawah) || 0;

      kotakCentang.forEach((kotak) => {
        if (jurnal[kotak.name]) {
          hitungan[kotak.name] += 1;
          tanggalKegiatan[kotak.name].push(tanggalTeks);
        }
      });
    }

    tanggal.setUTCDate(tanggal.getUTCDate() + 1);
  }

  const formatTanggalRekap = (nilai) => {
    const tanggalLokal = new Date(`${nilai}T00:00:00Z`);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(tanggalLokal);
  };

  const formatHariTanggalRekap = (nilai) => {
    const tanggalLokal = new Date(`${nilai}T00:00:00Z`);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(tanggalLokal);
  };

  const periode = document.createElement("p");
  periode.className = "rekap-periode";
  periode.textContent = `${formatTanggalRekap(mulai)} sampai ${formatTanggalRekap(sampai)}`;
  hasilRekap.append(periode);

  const ringkasan = document.createElement("div");
  ringkasan.className = "rekap-ringkasan";

  const buatMetrik = (judul, nilai, keterangan) => {
    const kartu = document.createElement("article");
    kartu.className = "rekap-metrik";

    const label = document.createElement("span");
    label.className = "rekap-metrik-label";
    label.textContent = judul;

    const angka = document.createElement("strong");
    angka.className = "rekap-metrik-nilai";
    angka.textContent = nilai;

    const catatan = document.createElement("span");
    catatan.className = "rekap-metrik-catatan";
    catatan.textContent = keterangan;

    kartu.append(label, angka, catatan);
    ringkasan.append(kartu);
  };

  buatMetrik("Hari terisi", `${hariTersimpan} / ${jumlahHari}`, "hari dengan jurnal tersimpan");
  buatMetrik("Total tilawah", `${totalTilawah}`, "lembar dalam rentang ini");
  hasilRekap.append(ringkasan);

  const daftarKegiatan = document.createElement("div");
  daftarKegiatan.className = "rekap-daftar";

  const judulKegiatan = document.createElement("h3");
  judulKegiatan.textContent = "Rincian kegiatan";
  daftarKegiatan.append(judulKegiatan);

  const petunjukKegiatan = document.createElement("p");
  petunjukKegiatan.className = "rekap-petunjuk";
  petunjukKegiatan.textContent = "Ketuk satu kegiatan untuk melihat tanggalnya.";
  daftarKegiatan.append(petunjukKegiatan);

  const kegiatan = document.createElement("div");
  kegiatan.className = "rekap-kegiatan";

  kotakCentang.forEach((kotak) => {
    const kartu = document.createElement("article");
    kartu.className = "rekap-kegiatan-item";

    const tombolRincian = document.createElement("button");
    tombolRincian.type = "button";
    tombolRincian.className = "rekap-kegiatan-tombol";
    tombolRincian.setAttribute("aria-expanded", "false");

    const bagianAtas = document.createElement("div");
    bagianAtas.className = "rekap-kegiatan-header";

    const nama = document.createElement("span");
    nama.className = "rekap-kegiatan-nama";
    nama.textContent = kotak.closest("label").textContent.trim();

    const jumlah = document.createElement("span");
    jumlah.className = "rekap-kegiatan-jumlah";
    jumlah.textContent = `${hitungan[kotak.name]} / ${jumlahHari} hari`;

    const panah = document.createElement("span");
    panah.className = "rekap-kegiatan-panah";
    panah.setAttribute("aria-hidden", "true");
    panah.textContent = "⌄";
    bagianAtas.append(nama, jumlah, panah);

    const persentase = Math.round((hitungan[kotak.name] / jumlahHari) * 100);
    const jalur = document.createElement("div");
    jalur.className = "rekap-progress";

    const isi = document.createElement("div");
    isi.className = "rekap-progress-isi";
    isi.style.width = `${persentase}%`;
    isi.setAttribute("role", "progressbar");
    isi.setAttribute("aria-valuenow", String(persentase));
    isi.setAttribute("aria-valuemin", "0");
    isi.setAttribute("aria-valuemax", "100");
    isi.setAttribute("aria-label", `${nama.textContent}: ${persentase}%`);

    jalur.append(isi);
    tombolRincian.append(bagianAtas, jalur);

    const rincianTanggal = document.createElement("div");
    rincianTanggal.className = "rekap-kegiatan-detail";
    rincianTanggal.hidden = true;

    const daftarTanggal = tanggalKegiatan[kotak.name];
    if (daftarTanggal.length) {
      const labelTanggal = document.createElement("p");
      labelTanggal.textContent = "Dicentang pada:";

      const daftarTanggalVertikal = document.createElement("ul");
      daftarTanggalVertikal.className = "rekap-tanggal-list";

      daftarTanggal.forEach((tanggalDicentang) => {
        const itemTanggal = document.createElement("li");
        itemTanggal.textContent = formatHariTanggalRekap(tanggalDicentang);
        daftarTanggalVertikal.append(itemTanggal);
      });

      rincianTanggal.append(labelTanggal, daftarTanggalVertikal);
    } else {
      rincianTanggal.textContent = "Belum dicentang dalam rentang tanggal ini.";
    }

    tombolRincian.addEventListener("click", () => {
      const terbuka = tombolRincian.getAttribute("aria-expanded") === "true";
      tombolRincian.setAttribute("aria-expanded", String(!terbuka));
      rincianTanggal.hidden = terbuka;
    });

    kartu.append(tombolRincian, rincianTanggal);
    kegiatan.append(kartu);
  });

  daftarKegiatan.append(kegiatan);
  hasilRekap.append(daftarKegiatan);
});

function buatRentangTanggal(mulai, sampai) {
  const tanggal = new Date(`${mulai}T00:00:00Z`);
  const tanggalAkhir = new Date(`${sampai}T00:00:00Z`);
  const hasil = [];

  while (tanggal <= tanggalAkhir) {
    hasil.push(tanggal.toISOString().slice(0, 10));
    tanggal.setUTCDate(tanggal.getUTCDate() + 1);
  }

  return hasil;
}

function buatLembarRekap({ mulai, sampai }) {
  const semuaTanggal = buatRentangTanggal(mulai, sampai);
  const kelompokBulan = new Map();

  semuaTanggal.forEach((tanggal) => {
    const kunciBulan = tanggal.slice(0, 7);
    if (!kelompokBulan.has(kunciBulan)) kelompokBulan.set(kunciBulan, []);
    kelompokBulan.get(kunciBulan).push(tanggal);
  });

  const namaUntuk = (tanggal, opsi) => new Intl.DateTimeFormat("id-ID", {
    ...opsi,
    timeZone: "UTC",
  }).format(new Date(`${tanggal}T00:00:00Z`));

  const barisAktivitas = [
    { type: "activity", number: "1", name: "Salat 5 waktu", key: "salat" },
    { type: "activity", number: "2", name: "Tahajud 1/3 malam", key: "tahajud" },
    { type: "activity", number: "3", name: "Witir setelah Isya", key: "witir" },
    { type: "group", number: "4", name: "Rawatib:" },
    { type: "activity", name: "Qabla Subuh", key: "rawatib_subuh" },
    { type: "activity", name: "Qabla Dzuhur", key: "rawatib_dzuhur" },
    { type: "activity", name: "Ba’da Dzuhur", key: "rawatib_bada_dzuhur" },
    { type: "activity", name: "Ba’da Maghrib", key: "rawatib_maghrib" },
    { type: "activity", name: "Ba’da Isya", key: "rawatib_isya" },
    { type: "activity", number: "5", name: "Dhuha", key: "dhuha" },
    { type: "activity", number: "6", name: "Shaum", key: "shaum" },
    { type: "tilawah", number: "7", name: "Tilawah Al-Qur’an (tulis jumlah lembar)" },
    { type: "activity", number: "8", name: "Dzikir pagi", key: "dzikir_pagi" },
    { type: "activity", number: "9", name: "Dzikir petang", key: "dzikir_petang" },
    { type: "activity", number: "10", name: "Ratib", key: "ratib" },
    { type: "activity", number: "11", name: "Al-Mulk setelah Isya / sebelum tidur", key: "almulk" },
    { type: "activity", number: "12", name: "Sedekah / Infak", key: "sedekah" },
    { type: "activity", number: "13", name: "Muraja’ah / Ziyadah", key: "murajaah" },
  ];

  dokumenRekap.replaceChildren();

  kelompokBulan.forEach((tanggalBulan, bulan) => {
    const halaman = document.createElement("article");
    halaman.className = "lembar-rekap-bulan";

    const judul = document.createElement("h1");
    judul.textContent = "JURNAL IBADAH HARIAN";
    halaman.append(judul);

    const meta = document.createElement("div");
    meta.className = "lembar-rekap-meta";
    const nama = document.createElement("span");
    const namaPengguna = namaPdfInput.value.trim();
    nama.textContent = namaPengguna ? `NAMA: ${namaPengguna}` : "NAMA: ______________________________";
    const periode = document.createElement("span");
    periode.textContent = `PERIODE: ${namaUntuk(tanggalBulan[0], { day: "numeric", month: "long", year: "numeric" })} – ${namaUntuk(tanggalBulan.at(-1), { day: "numeric", month: "long", year: "numeric" })}`;
    meta.append(nama, periode);
    halaman.append(meta);

    const bulanLabel = document.createElement("h2");
    bulanLabel.textContent = namaUntuk(`${bulan}-01`, { month: "long", year: "numeric" });
    halaman.append(bulanLabel);

    const tabel = document.createElement("table");
    tabel.className = "tabel-rekap-cetak";

    const lebarNama = document.createElement("colgroup");
    const colNomor = document.createElement("col");
    colNomor.className = "kolom-nomor";
    const colNama = document.createElement("col");
    colNama.className = "kolom-amal";
    lebarNama.append(colNomor, colNama);
    tanggalBulan.forEach(() => lebarNama.append(document.createElement("col")));
    tabel.append(lebarNama);

    const thead = document.createElement("thead");
    const barisTanggal = document.createElement("tr");
    const no = document.createElement("th");
    no.rowSpan = 2;
    no.textContent = "NO";
    const amal = document.createElement("th");
    amal.rowSpan = 2;
    amal.textContent = "AMAL YAUMI";
    const tanggalHeader = document.createElement("th");
    tanggalHeader.colSpan = tanggalBulan.length;
    tanggalHeader.textContent = "TANGGAL";
    barisTanggal.append(no, amal, tanggalHeader);
    thead.append(barisTanggal);

    const barisHari = document.createElement("tr");
    tanggalBulan.forEach((tanggal) => {
      const sel = document.createElement("th");
      sel.textContent = String(Number(tanggal.slice(-2)));
      sel.title = namaUntuk(tanggal, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      barisHari.append(sel);
    });
    thead.append(barisHari);
    tabel.append(thead);

    const tbody = document.createElement("tbody");
    barisAktivitas.forEach((aktivitas) => {
      const baris = document.createElement("tr");
      if (aktivitas.type === "group") baris.className = "baris-subkelompok";

      const nomor = document.createElement("td");
      nomor.textContent = aktivitas.number || "";
      const namaAktivitas = document.createElement("td");
      namaAktivitas.textContent = aktivitas.name;
      baris.append(nomor, namaAktivitas);

      tanggalBulan.forEach((tanggal) => {
        const sel = document.createElement("td");
        sel.className = "sel-rekap-cetak";
        const tersimpan = localStorage.getItem(kunciUntukTanggal(tanggal));
        const jurnal = tersimpan ? JSON.parse(tersimpan) : {};

        if (aktivitas.type === "activity" && jurnal[aktivitas.key]) {
          sel.textContent = "✓";
          sel.classList.add("selesai");
        } else if (aktivitas.type === "tilawah" && Number(jurnal.tilawah) > 0) {
          sel.textContent = String(Number(jurnal.tilawah));
          sel.classList.add("tilawah-terisi");
        }

        baris.append(sel);
      });

      tbody.append(baris);
    });
    tabel.append(tbody);
    halaman.append(tabel);

    const catatan = document.createElement("p");
    catatan.className = "lembar-rekap-catatan";
    catatan.textContent = "✓ Ibadah telah dilakukan. Angka pada Tilawah menunjukkan jumlah lembar.";
    halaman.append(catatan);

    dokumenRekap.append(halaman);
  });
}

tombolCetakRekap.addEventListener("click", () => {
  if (!rentangRekapCetak) return;

  buatLembarRekap(rentangRekapCetak);
  const judulSebelumnya = document.title;
  document.title = `Rekap-Jurnal-Ibadah-${rentangRekapCetak.mulai}-${rentangRekapCetak.sampai}`;
  window.print();
  document.title = judulSebelumnya;
});

const tabNavigasi = document.querySelectorAll('[role="tab"]');

tabNavigasi.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabNavigasi.forEach((item) => {
      const aktif = item === tab;
      item.setAttribute("aria-selected", String(aktif));
      document.getElementById(item.getAttribute("aria-controls")).hidden = !aktif;
    });
  });
});

if ("serviceWorker" in navigator && window.isSecureContext) {
  navigator.serviceWorker.getRegistration("./").then(async (registration) => {
    if (!registration) return;

    const subscription = await registration.pushManager?.getSubscription();
    if (subscription) await subscription.unsubscribe();
    await registration.unregister();
  }).catch((error) => {
    console.error("Pembersihan notifikasi lama gagal:", error);
  });
}
