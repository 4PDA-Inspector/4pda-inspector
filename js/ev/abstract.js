export class AbstractEvents {

    constructor(notifications, data) {
        this.list = {}
        this.notifications = notifications
        this.data = data
    }

    get count() {
        return Object.keys(this.list).length
    }
}