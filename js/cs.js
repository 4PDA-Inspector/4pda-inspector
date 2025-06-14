import { parse_response, fetch4, getLogDatetime, FETCH_TIMEOUT } from "./utils.js";
import { Favorites } from "./e/favorites.js";
import { Mentions } from "./e/mentions.js";
import { QMS } from "./e/qms.js";
import { print_count, print_logout, print_unavailable } from "./browser.js";


const ALARM_NAME = 'periodicApiCheck';
const PARSE_APPBK_REGEXP = /u\d+:\d+:\d+:(\d+)/;

export let SETTINGS = {
    notification_qms_level: 10,
    notification_themes_level: 10,
    notification_mentions_level: 20,

    toolbar_pin_themes_level: 0,
    // toolbar_only_pin: false,
    toolbar_open_theme_hide: true,
    
    interval: 30,

    /*notification_qms_popup: true,
    notification_qms_all_messages: false,
    notification_themes_popup: true,
    notification_themes_all_comments: false,
    notification_mentions_popup: true*/

    /*interval: 30,
    open_themes_limit: 0,

    notification_sound_volume: 0.5,

    notification_themes_sound: true,

    notification_qms_sound: true,

    notification_mentions_sound: true,

    toolbar_pin_color: true,
    toolbar_pin_up: false,
    toolbar_simple_list: false,

    toolbar_button_open_all: true,
    toolbar_button_read_all: true,

    toolbar_width_fixed: false,
    toolbar_width: 400,
    toolbar_theme: 'auto',

    open_in_current_tab: false,
    user_links: [],

    build: 0*/
    //, setting1: false
}


export class CS {
    #initialized = false;
    #update_in_process = false;
    #timeout_id = null;

    #cookie_authorized = false;
    #available = true;

    #user_id = 0;
    #user_name = '';
    #last_event = 0;

    constructor() {
        console.log('Start CS', getLogDatetime());

        this.favorites = new Favorites(this);
        this.qms = new QMS(this);
        this.mentions = new Mentions(this);

        // clear from old alarms; todo delete from prod
        chrome.alarms.clear(ALARM_NAME);

        chrome.storage.local.get(Object.keys(SETTINGS))
            .then((items) => {
                console.debug('Settings are loaded', items);
                let to_save = {};
                for (const [key, value] of Object.entries(SETTINGS)) {
                    if (key in items) {
                        SETTINGS[key] = items[key];
                    } else {
                        to_save[key] = value;
                    }
                    // console.debug(`${key}: ${value}`, key in items);
                }
                if (Object.keys(to_save).length) {
                    chrome.storage.local.set(to_save, () => {
                        console.debug('Settings are saved');
                    });
                }
            })
            .then(() => {
                return this.#get_cookie_member_id()
                    .then(start_member_id => {
                        this.heartbeat = setInterval(() => {
                            if (this.#update_in_process) return;

                            this.#get_cookie_member_id()
                                .then(member_id => {
                                    //console.debug('Check auth cookie:', member_id, getLogDatetime());
                                    if (this.#cookie_authorized == (member_id != null)) return;

                                    if (member_id) {
                                        console.debug('! Auth found');
                                        this.#cookie_authorized = true;
                                        this.update();
                                    } else {
                                        console.debug('! Auth lost');
                                        clearTimeout(this.#timeout_id);
                                        this.#do_logout();
                                        this.#cookie_authorized = false;
                                    }
                                });
                        }, 1000);

                        this.#cookie_authorized  = start_member_id != null;
                        return this.#cookie_authorized
                    });
            })
            .then(auth => {
                console.debug('CS initialized; auth: ', auth);
                if (auth) {
                    this.update();
                } else {
                    this.#do_logout();
                }
            })
            .finally(() => {
                this.#initialized = true; // ? todo after save settings?
            });
    }

    #get_cookie_member_id() {
        return chrome.cookies.get({
            url: 'https://4pda.to',
            name: 'member_id',
        })
            .then(cookie => {
                return cookie ? cookie.value : null;
            });
    }

    #do_logout() {
        this.#user_id = 0;
        this.#user_name = '';
        print_logout();
    }

    reset_timeout() {
        if (this.#update_in_process) {
            console.debug('SET INTERVAL: Update conflict. Skip.')
            return;
        }
        clearTimeout(this.#timeout_id);
        this.update();
    }

    get initialized() { return this.#initialized; }
    get available() { return this.#available; }
    get user_id() { return this.#user_id; }
    

    get popup_data() {
        return {
            user_id: this.#user_id,
            user_name: this.#user_name,
            favorites: {
                count: this.favorites.count,
                list: this.favorites.list
            },
            qms: {
                count: this.qms.count
            },
            mentions: {
                count: this.mentions.count
            }
        };
    }

    update_action() {
        print_count(
            this.qms.count,
            this.favorites.count
        );
    }

    async update() {
        console.debug('* Start new update:', getLogDatetime(), this.#timeout_id);
        if (!this.#cookie_authorized) {
            console.debug('Hasn\'t cookie. Skip.')
            return;
        }
        if (this.#update_in_process) {
            console.debug('Update conflict. Skip.')
            return;
        }
        let next_interval = SETTINGS.interval * 1000;
        this.#update_in_process = true;

        return fetch4('https://4pda.to/forum/index.php?act=inspector&CODE=id')
            .then(data => {
                let user_data = parse_response(data);
                if (user_data && user_data.length == 2) {
                    if (user_data[0] == this.#user_id) {
                        this.#user_name = user_data[1];
                    } else {
                        this.#user_id = user_data[0];
                        this.#user_name = user_data[1];
                        console.debug('New user:', this.#user_id, this.#user_name);

                        this.#last_event = 0;
                        this.favorites.reset();
                        this.qms.reset();
                        this.mentions.reset();
                    }   
                    return this.#update_all_data();                 
                } else {
                    console.debug('Unauthorized');
                    this.#do_logout();
                }
            })
            .catch(error => {
                this.#available = false;
                print_unavailable();
                console.error('API request failed:', error);
                next_interval = 5000;
            })
            .finally(() => {
                this.#timeout_id = setTimeout(
                    () => this.update(),
                    next_interval
                );
                this.#update_in_process = false;
            });
    }

    async #update_all_data() {
        return fetch(
            `https://appbk.4pda.to/er/u${this.#user_id}/s${this.#last_event}`,
            {
                method: 'GET',
                signal: AbortSignal.timeout(FETCH_TIMEOUT),
            }
        )
            .then(response => response.text())
            .then(data => {
                /*if (!this.qms.notify || Math.random() < 0.5) {
                    this.qms.notify = true;
                    throw new Error('Simulated error');
                }*/
                if (data) {
                    let parsed = data.match(PARSE_APPBK_REGEXP);
                    if (parsed) {
                        console.debug('! Has new events');
                        return Promise.all([
                            this.favorites.update(),
                            this.qms.update(),
                            this.mentions.update()
                        ])
                            .then(() => {
                                this.#last_event = parsed[1];
                                return true;
                            });
                    }
                } // else: no new events
                return false;
            })
            .then(has_updates => {
                console.debug('Update done', has_updates, this.#available, getLogDatetime());
                // if (has_updates || !this.#available || !notify) {}
                this.update_action();
                this.#available = true;
            });
    }
}