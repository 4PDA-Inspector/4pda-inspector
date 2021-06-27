class CS {

    vars

    user
    favorites
    qms

    timeout_updater = 0

    constructor() {
        console.debug('init CS', new Date())
        this.vars = new Vars()
        this.vars.read_storage().then(() => {
            //chrome.notifications.onClicked.addListener(this.bgClass.cScript.notificationClick);
            this.user = new User()
            this.favorites = new Favorites()
            this.qms = new QMS()

            this.request()
        }).catch(() => {
            console.error('Can\'t init inspector')
        })
    }

    request() {
        console.debug('request', new Date())
        this.user.check_user().then(() => {
            console.debug('user update - OK')
            this.favorites.update_list().then(() => {
                console.debug('favorites update - OK')
                this.qms.update_dialogs().then(() => {
                    console.debug('qms update - OK')
                    this.timeout_updater = setTimeout(() => {
                        this.request()
                    }, this.vars.interval_ms)
                }).catch(() => {
                    console.error('qms update - bad')
                })
            }).catch(() => {
                console.error('favorites update - bad')
            })
        }).catch(() => {
            // inspector4pda.cScript.clearData();
            // inspector4pda.cScript.printLogout(true);
            // inspector4pda.utils.callIfFunction(callback);
            console.error('user update - bad')
        })
    }
}

var inspector = new CS()
