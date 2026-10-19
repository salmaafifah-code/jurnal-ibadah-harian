const tanggalInput = document.querySelector("#tanggal");
const tilawahInput = document.querySelector("#tilawah");
const tombolSimpan = document.querySelector("#simpan");
const pesan = document.querySelector("#pesan");
const kotakCentang = document.querySelectorAll('input[type="checkbox"]');
const waktuPengingat = document.querySelector("#waktu-pengingat");
const tombolPengingat = document.querySelector("#aktifkan-pengingat");
const pesanPengingat = document.querySelector("#pesan-pengingat");

const waktuPengingatTersimpan = localStorage.getItem("jurnal-ibadah-waktu-pengingat");
if (waktuPengingatTersimpan) {
  waktuPengingat.value = waktuPengingatTersimpan;
}

tombolPengingat.addEventListener("click", () => {
  const waktu = waktuPengingat.value;

  if (!waktu) {
    pesanPengingat.textContent = "Pilih jam pengingat terlebih dahulu.";
    return;
  }

  localStorage.setItem("jurnal-ibadah-waktu-pengingat", waktu);
  pesanPengingat.textContent = `Pilihan jam ${waktu} tersimpan di perangkat ini. Notifikasi harian akan aktif setelah layanan push disambungkan.`;
});

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

const tanggalAkhirDefault = tanggalHariIni();
const tanggalMulaiDefault = new Date(`${tanggalAkhirDefault}T00:00:00Z`);
tanggalMulaiDefault.setUTCDate(tanggalMulaiDefault.getUTCDate() - 6);

rekapDari.value = tanggalMulaiDefault.toISOString().slice(0, 10);
rekapSampai.value = tanggalAkhirDefault;

document.querySelector("#buat-rekap").addEventListener("click", () => {
  const mulai = rekapDari.value;
  const sampai = rekapSampai.value;

  hasilRekap.replaceChildren();

  if (!mulai || !sampai || mulai > sampai) {
    hasilRekap.textContent = "Pilih rentang tanggal yang benar.";
    return;
  }

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
  navigator.serviceWorker.register("./sw.js").catch((error) => {
    console.error("Service worker gagal didaftarkan:", error);
  });
}
