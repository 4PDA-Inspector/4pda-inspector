class QMS {
    list = {}

    get rURL() {
        return inspector.vars.doForumURL('act=inspector&CODE=qms')
    }

    async update_dialogs() {
        return new Promise((resolve, reject) => {
            new XHR(this.rURL).send().then(resp => {
                this.list = {}
                if (resp.responseText) {
                    console.log(resp.responseText)
                    let lines = resp.responseText.split(/\r\n|\n/)
                    lines.forEach(line => {
                        if (line) {
                            try {
                                let dialog = new Dialog(line)
                                this.list[dialog.id] = dialog
                            } catch (e) {

                            }
                        }
                    })
                }
                return resolve()
            }).catch(resp => {
                console.log('no resp')
                console.log(resp)
                return reject()
            })
        })
    }
}

class Dialog {

    id = 0
    title = ''
    opponent_id = ''
    opponent_name = ''
    last_msg_ts = ''
    unread_msgs = 0
    last_msg_id = ''
    // read = false

    constructor(text_line) {
        var obj = Utils.parse(text_line);

        this.id = obj[0];
        this.title = obj[1];
        this.opponent_id = obj[2];
        this.opponent_name = obj[3];
        this.last_msg_ts = obj[4];
        this.unread_msgs = parseInt(obj[5]);
        this.last_msg_id = obj[6];
    }
}