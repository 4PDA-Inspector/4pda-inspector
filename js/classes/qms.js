inspector4pda.QMS = {
    unreadCount: 0,
    count: {
        messages: 0,
        dialogs: 0
    },
    rUrl: 'http://4pda.ru/forum/index.php?act=inspector&CODE=qms',
    vUrl: 'http://4pda.ru/forum/index.php?act=qms',
    list: {},

    request: function(callback) {
        var xmr = new inspector4pda.XHR();
        xmr.callback.success = function(resp) {
            inspector4pda.QMS.parse(resp.responseText);
            if (callback) {
                callback();
            };
        }
        xmr.send(inspector4pda.QMS.rUrl);
    },

    parse: function(text) {
        inspector4pda.QMS.count.messages = 0;
        inspector4pda.QMS.count.dialogs = 0;
        inspector4pda.QMS.unreadCount = 0;
        inspector4pda.QMS.list = {};
        var tText = text ? text.replace('\r','').split('\n') : [];
        for (var i = 0; i < tText.length; i++) {
            if (tText[i]) {
                var dialog = Object.create(qDialog);

                if (dialog.parse(tText[i])) {
                    inspector4pda.QMS.list[dialog.id] = dialog;
                    inspector4pda.QMS.count.messages += dialog.unread_msgs;
                    inspector4pda.QMS.count.dialogs++;
                }
            }
        }
        inspector4pda.QMS.unreadCount = inspector4pda.QMS.count.dialogs;
    },

    openChat: function(dialogID, themeID, setActive) {
        inspector4pda.utils.openPage('http://4pda.ru/forum/index.php?act=qms&mid=' + dialogID + (themeID ? '&t=' + themeID : ''), setActive);
        if (themeID) {
            delete inspector4pda.QMS.list[themeID];
        };
    },

    getCount: function()
    {
        this.unreadCount = Object.keys(inspector4pda.QMS.list).length;
        return this.unreadCount;
    },

    openPage: function () {
        inspector4pda.utils.openPage(inspector4pda.QMS.vUrl);
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
    }
}