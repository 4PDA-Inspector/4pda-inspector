class CS {

    bg
    vars

    user
    favorites
    qms

    constructor() {
        let self = this
        console.log(new Date(), 'init CS')
        this.vars = new Vars()
        this.vars.read_storage().then(() => {
            console.log('this.vars.data', this.vars.data.interval)

            //chrome.notifications.onClicked.addListener(this.bgClass.cScript.notificationClick);
            self.user = new User()
            self.favorites = new Favorites()
            self.qms = new QMS()

            self.user.init().then(() => {
                console.log('user init - OK')
                self.favorites.update_list().then(() => {
                    console.log('favorites init - OK')
                    console.log(self.favorites.list)
                    self.qms.update_dialogs().then(() => {
                        console.log('qms init - OK')
                        console.log(self.qms.list)
                    }).catch(() => {
                        console.error('qms init - bad')
                    })
                }).catch(() => {
                    console.error('favorites init - bad')
                })
            }).catch(() => {
                // inspector4pda.cScript.clearData();
                // inspector4pda.cScript.printLogout(true);
                // inspector4pda.utils.callIfFunction(callback);
                console.error('user init - bad')
            })
        }).catch(() => {
            console.error('Can\'t init inspector')
        })
    }

    request() {

    }
}

var inspector = new CS()
