/* Beacon service worker — Web Push */
self.addEventListener("push", (event) => {
  let data = { title: "Beacon", body: "Tienes un aviso", link: "/home" };
  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    // ignore malformed payload
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "Beacon", {
      body: data.body || "",
      data: { link: data.link || "/home" },
      tag: data.tag || "beacon",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = event.notification?.data?.link || "/home";
  const url = new URL(link, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
      return undefined;
    }),
  );
});
