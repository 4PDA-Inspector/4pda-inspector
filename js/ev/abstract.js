export class AbstractEvents {

    constructor(notifications) {
        this.list = {}
        this.notifications = notifications
    }

    get count() {
        return Object.keys(this.list).length
    }
}