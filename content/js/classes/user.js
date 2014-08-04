inspector4pda.user = {
    rUrl: 'http://4pda.ru/forum/index.php?act=inspector&CODE=id',
    id: 0,
    name: '',

    request: function(callback) {
        var xmr = new inspector4pda.XHR();
        xmr.callback.timeout = function() {
            inspector4pda.cScript.printLogout(true);
        }
        xmr.callback.not200Success = function() {
            inspector4pda.cScript.printLogout(true);
        }
        xmr.callback.error = function() {
            inspector4pda.cScript.printLogout();
        }
        xmr.callback.success = function(resp) {

            inspector4pda.user.id = 0;
            inspector4pda.user.name = '';
            if (resp.responseText) {
                var res = inspector4pda.utils.parse(resp.responseText);
                if (res.length == 2) {
                    inspector4pda.user.id = res[0];
                    inspector4pda.user.name = res[1];
                };
            } else {
                inspector4pda.cScript.printLogout();
            }
            
            if (callback) {
                callback();
            };
        }
        xmr.send(this.rUrl);
    },

    open: function(id) {
        inspector4pda.utils.openPage('http://4pda.ru/forum/index.php?showuser=' + id);
    }
}