(function() {

    const applicationServerPublicKey = 'BCla-_Ysd2VFPvJOpb6gMWpiJ8Ch8ie27BjHNrdpICRkCmf5cGsySqTcjbLU_eGq5o5wSmEMQ7n0ixCzqdqT-iY';

    const pushButton = document.querySelector('.js-push-btn');

    let isSubscribed = false;
    let swRegistration = null;

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.error("Push messaging is not support");
        pushButton.textContent = "Push not supported";
        return;
    }

    navigator.serviceWorker.register("sw.js")
        .then(swReg => {
            console.log("Service worker registered", swReg);
            swRegistration = swReg
            initializeUi();
        })
        .catch(err => {
            console.error("Service worker error", err);
        });

    function initializeUi() {
        pushButton.addEventListener("click", () => {
            pushButton.disabled = true;
            if (isSubscribed) {
                unsubscribeUser();
            } else {
                subscribeUser();
            }
        });

        // Set initial subscription value
        swRegistration.pushManager.getSubscription()
            .then(subscription => {
                isSubscribed = !!subscription;

                updateSubscriptionOnServer(subscription);
                if (isSubscribed) {
                    console.log("User is subscribed");
                } else {
                    console.log("User is NOT subscribed");
                }

                updateBtn();
            });
    }

    function unsubscribeUser() {
        swRegistration.pushManager.getSubscription()
            .then(subscription => {
                if (subscription) {
                    return subscription.unsubscribe();
                }
            })
            .catch(err => {
                console.error("Error unsubscribing", err);
            })
            .then(() => {
                updateSubscriptionOnServer(null);
                console.log("User is unsubscribed");
                isSubscribed = false;
                updateBtn();
            });
    }

    function subscribeUser() {
        const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
        swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        })
            .then(subscription => {
                console.log("User is subscribed");
                updateSubscriptionOnServer(subscription);
                isSubscribed = true;
                updateBtn();
            })
            .catch(err => {
                console.error("Failed to subscribe user", err);
                updateBtn();
            });
    }

    function updateSubscriptionOnServer(subscription) {
        //TODO: Send subscription to server

        const subscriptionJson = document.querySelector(".js-subscription-json");
        const subscriptionDetails = document.querySelector(".js-subscription-details");

        if (subscription) {
            subscriptionJson.textContent = JSON.stringify(subscription);
            subscriptionDetails.classList.remove("is-invisible");
        } else {
            subscriptionDetails.classList.add("is-invisible");
        }
    }

    function updateBtn() {
        if (Notification.permission === "denied") {
            pushButton.textContent = "Push messaging blocked";
            pushButton.disabled = true;
            updateSubscriptionOnServer(null);
            return;
        }

        if (isSubscribed) {
            pushButton.textContent = "Disable push messaging";
        } else {
            pushButton.textContent = "Enable push messaging";
        }

        pushButton.disabled = false;
    }

    function urlB64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
    
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
    
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
    }
})();
