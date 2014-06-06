inspector4pda.QMS = {
    unreadCount: 0,
    rUrl: 'http://4pda.ru/forum/index.php?act=inspector&CODE=qms',
    list: [],

    request: function(callback) {
        var xmr = new inspector4pda.XHR();
        xmr.callback.success = function(resp) {
            if (resp.responseText) {
                inspector4pda.QMS.parse(resp.responseText);
            };
            if (callback) {
                callback();
            };
        }
        xmr.send(inspector4pda.QMS.rUrl);
    },

    parse: function(text) {
        this.unreadCount = 0;
        inspector4pda.QMS.list = [];
        var tText = text.replace('\r','').split('\n');

        inspector4pda.utils.log('QMS parse');
        // inspector4pda.utils.log(text);
        for (var i = 0; i < tText.length; i++) {
            if (tText[i]) {
                var dialog = Object.create(qDialog);

                if (dialog.parse(tText[i])) {
                    inspector4pda.QMS.list.push(dialog);
                    inspector4pda.QMS.unreadCount += dialog.unread_msgs;
                }
            }
        }
        // inspector4pda.utils.log(inspector4pda.QMS.list.length);
    }
}

var qDialog = {
    id: 0,
    title: '',
    opponent_id: '',
    opponent_name: '',
    last_msg_ts: '',
    unread_msgs: 0,
    last_msg_id: '',

    parse: function(text) {
        try {
// inspector4pda.utils.log(text);
            var obj = inspector4pda.utils.parse(text);
            this.id = obj[0];
            this.title = obj[1];
            this.opponent_id = obj[2];
            this.opponent_name = obj[3];
            this.last_msg_ts = obj[4];
            this.unread_msgs = parseInt(obj[5]);
            this.last_msg_id = obj[6];
        } catch(e) {
            return false;
        }
        return this;
        // tid title posts_num last_user_id last_user_name last_post_ts last_read_ts
    }
}