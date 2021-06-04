inspector4pda.user = {
    rUrl: inspector4pda.vars.BASE_URL + '/forum/index.php?act=inspector&CODE=id',
    id: 0,
    name: '',
    appUrl: '',

    getCookieId: function(callback) {
        inspector4pda.browser.getCookie('member_id', function(uid) {
            callback(uid);
        });
    },

    request: function(successCallback, notSuccessCallback) {
        var xmr = new inspector4pda.XHR();

        xmr.callback.timeout = function() {
            inspector4pda.cScript.printLogout(true);
            if (typeof notSuccessCallback == 'function') {
                notSuccessCallback();
            }
        };
        xmr.callback.not200Success = function() {
            inspector4pda.cScript.printLogout(true);
            if (typeof notSuccessCallback == 'function') {
                notSuccessCallback();
            }
        };
        xmr.callback.error = function() {
            inspector4pda.cScript.printLogout(true);
            if (typeof notSuccessCallback == 'function') {
                notSuccessCallback();
            }
        };
        xmr.callback.success = function(resp) {

            inspector4pda.user.clearData();
            if (resp.responseText) {
                let res = inspector4pda.utils.parse(resp.responseText);
                if (res.length == 2) {
                    inspector4pda.user.id = parseInt(res[0]);
                    inspector4pda.user.name = res[1];
                    inspector4pda.user.appUrl = 'https://app.4pda.ru/er/u' + inspector4pda.user.id + '/s0';
                } else {
                    inspector4pda.cScript.printLogout();
                }
                if (!inspector4pda.user.id) {
                    inspector4pda.cScript.printLogout();
                }
            } else {
                inspector4pda.cScript.printLogout();
            }
            
            if (typeof successCallback == 'function') {
                successCallback();
            }
        };
        xmr.send(this.rUrl);
    },

    clearData: function() {
        this.id = 0;
        this.name = '';
    },

    open: function(id) {
        id = id || inspector4pda.user.id;
        inspector4pda.utils.openPage(inspector4pda.vars.BASE_URL + '/forum/index.php?showuser=' + id, true);
    }
};