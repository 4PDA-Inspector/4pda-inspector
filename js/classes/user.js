inspector4pda.user = {
    rUrl: 'http://4pda.ru/forum/index.php?act=inspector&CODE=id',
    id: 0,
    name: '',

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
                var res = inspector4pda.utils.parse(resp.responseText);
                if (res.length == 2) {
                    inspector4pda.user.id = parseInt(res[0]);
                    inspector4pda.user.name = res[1];
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
        var id = id || inspector4pda.user.id;
        inspector4pda.utils.openPage('http://4pda.ru/forum/index.php?showuser=' + id);
    }
};