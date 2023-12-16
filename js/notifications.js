import {NOTIFICATION_ICONS} from "./data.js";

export class Notifications {

    constructor() {
        this.list = {}
    }

    create(text, icon) {
        chrome.notifications.create({
            type: 'basic',
            title: '4PDA Инспектор',
            message: text,
            iconUrl: icon
        }, ntf => {
            return ntf
        })
    }

    show_error(text) {
        return this.create(text, NOTIFICATION_ICONS.out)
    }

    add_event(event, object) {
        console.log('new event', event, object)
    }
}
