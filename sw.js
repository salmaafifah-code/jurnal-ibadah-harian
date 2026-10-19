self.addEventListener("push", (event) => {
  const pesan = event.data ? event.data.json() : {};

  event.waitUntil(
    self.registration.showNotification(
      pesan.title || "Jurnal Ibadah Harian",
      {
        body: pesan.body || "Waktunya mengisi jurnal ibadah hari ini.",
        icon: new URL("./icon.svg", self.registration.scope).href,
        data: {
          url: new URL("./", self.registration.scope).href
        }
      }
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const alamatAplikasi = event.notification.data.url;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((jendela) => {
        const sudahTerbuka = jendela.find((item) =>
          item.url.startsWith(self.registration.scope)
        );

        if (sudahTerbuka) {
          return sudahTerbuka.focus();
        }

        return self.clients.openWindow(alamatAplikasi);
      })
  );
});