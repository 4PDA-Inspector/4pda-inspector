class CS {

    bg
    vars
    user

    constructor() {
        let self = this
        console.log(new Date(), 'init CS')
        this.vars = new Vars()
        this.vars.read_storage().then(() => {
            console.log('this.vars.data', this.vars.data.interval)

            //chrome.notifications.onClicked.addListener(this.bgClass.cScript.notificationClick);
            self.user = new User()
            self.user.init().then(() => {
                console.log('user init - OK')
            }).catch(() => {
                // inspector4pda.cScript.clearData();
                // inspector4pda.cScript.printLogout(true);
                // inspector4pda.utils.callIfFunction(callback);
                console.log('user init - bad')
            })
        })
    }

    request() {

    }
}

var inspector = new CS()
