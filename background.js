// background.js - Chrome Extension MV3 Service Worker
import {CS, SETTINGS} from './js/cs.js';
import {open_url} from './js/browser.js';
import {getLogDatetime} from "./js/utils.js";


const bg = new CS();
console.debug('Background started');

// Set up the alarm when the service worker starts
chrome.runtime.onInstalled.addListener(reason => {
    console.debug('onInstalled', reason, bg.initialized);
    // bg.init();
});

// Also set up the alarm if the service worker starts (in case of reload)
chrome.runtime.onStartup.addListener(() => {
    console.debug('onStartup', bg.initialized);
    // bg.init();
});

chrome.idle.onStateChanged.addListener(newState => {
    console.debug('idle.onStateChanged', newState, getLogDatetime());
});

// Listen for messages from popup or other extension parts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'popup_loaded':
            if (bg.user_id) {
                sendResponse(bg.popup_data);
                break;
            } else {
                return open_url('https://4pda.to/forum/index.php?act=auth');
            }
        case 'open_url':
            switch (message.what) {
                case 'user':
                    return open_url(`https://4pda.to/forum/index.php?showuser=${bg.user_id}`);
                case 'options':
                    return open_url('/html/options.html');
                case 'qms':
                    return bg.qms.open();
                case 'favorites':
                    return bg.favorites.open(
                        message['id'],
                        message['view'],
                        SETTINGS.toolbar_open_theme_hide
                    );
                case 'mentions':
                    return bg.mentions.open();
            }
            break;
    }
    // Return true if you want to send a response asynchronously
    //return true;
});

// https://developer.chrome.com/docs/extensions/reference/api/notifications#type-NotificationOptions
chrome.notifications.onClicked.addListener(notificationId => {
    console.debug('notification_click', notificationId);
    const n_data = notificationId.split('/');
    switch (n_data[1]) {
        case 'theme':
            bg.favorites.open(n_data[2]);
            break;
        case 'dialog':
            bg.qms.open(n_data[2]);
            break;
        case 'mention':
            bg.mentions.open(n_data[2]);
            break;
    }
});

chrome.action.onClicked.addListener(tab => {
    if (bg.initialized && bg.available) {
        if (bg.user_id) {
            console.warn('action click & authorized')
        } else {
            return open_url('https://4pda.to/forum/index.php?act=auth');
        }
    }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.debug(
            `Storage key "${key}" in namespace "${namespace}" changed.`,
            `Old value was "${oldValue}", new value is "${newValue}".`
        );
        SETTINGS[key] = newValue;
        if (!bg.initialized) return;
        switch (key) {
            case 'toolbar_pin_themes_level':
                if (oldValue == 20) {
                    bg.favorites.filter_pin(false);
                } else if (newValue == 20) {
                    bg.favorites.filter_pin(true);
                }
                break;
            case 'interval':
                bg.reset_timeout();
                break;
        }
    }
});
