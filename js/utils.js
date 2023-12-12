export function request_and_parse(code) {
    return new Promise((resolve, reject) => {
        fetch('https://4pda.to/forum/index.php?act=inspector&CODE=' + code).then(response => {
            if (response.ok) {
                response.text().then(text => {
                    resolve(text)
                }).catch(r => {
                    console.error(r)
                    reject('Cant read')
                })
            } else {
                reject('Cant request to 4pda')
            }
        }).catch(reason => {
            console.error(reason)
            reject('Cant request to 4pda')
        })
    });
}

// export function now() {
//     return new Date().getTime();
// }

function focus_window(window) {
    // return new Promise((resolve, reject) => {
    //
    // })
    let upd = {
        focused: true
    }
    if (window.state === "minimized") {
        upd.state = "normal"
    }
    chrome.windows.update(window.id, upd).then()
    // , () => {
    //         return resolve()
    //     }
}

export function open_url(url, set_active, set_window_focus, open_in_current_tab) {
    if (!/\w+:\/\/.+/.test(url)) {
        url = chrome.runtime.getURL(url)
    }
    // set_active = set_active || inspector.vars.data.toolbar_open_theme_hide

    return new Promise((resolve, reject) => {
        chrome.tabs.query({
            url: url
        }, (tabs) => {
            if (tabs && tabs.length) {
                let current_tab = tabs[0]
                chrome.tabs.highlight({
                    tabs: current_tab.index,
                    windowId: current_tab.windowId
                }, (window) => {
                    if (!window.focused) {
                        focus_window(window)
                    }
                    return resolve(current_tab)
                })
            } else {
                // if (inspector.vars.data.open_in_current_tab) {
                if (open_in_current_tab) {
                    chrome.tabs.query({
                        active: true,
                        //currentWindow: true
                    }, (tabs) => {
                        chrome.tabs.update(
                            tabs[0].id, {
                                url: url
                            }, (tab) => {
                                if (set_window_focus) {
                                    chrome.windows.get(tab.windowId, (window => {
                                        if (!window.focused) {
                                            focus_window(window)
                                        }
                                    }))
                                }
                                return resolve(tab)
                            }
                        )
                    })
                } else {
                    chrome.tabs.create({
                        url: url,
                        active: set_active
                    }, (tab) => {
                        if (set_window_focus) {
                            chrome.windows.get(tab.windowId, (window => {
                                if (!window.focused) {
                                    focus_window(window)
                                }
                            }))
                        }
                        return resolve(tab)
                    })
                }
            }
        })
    })
}
