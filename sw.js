'use strict';

self.addEventListener("push", event => {
    console.log("[Service Worker] Push received");
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    const title = "Push Codelab";
    const options = {
        body: "Yay it works",
        icon: "images/icon.png",
        badge: "images/badge.png"
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
    console.log("[Service Worker] Notification click received");
    event.notification.close();
    event.waitUntil(
        clients.openWindow("https://developers.google.com/web/")
    );
});