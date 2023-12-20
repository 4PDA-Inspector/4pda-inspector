setInterval(() => {
    // (await navigator.serviceWorker.ready).active.postMessage('keepAlive');
    chrome.runtime.sendMessage({action: 'check_user'}).then()
}, 20e3)
