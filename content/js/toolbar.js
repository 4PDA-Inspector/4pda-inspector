var iToolbar = {

    panel: null,
    labels: {
        username: null
    },

    init: function()
    {
        this.panel = cScript.winobj.getElementById('inspectorPanel');

        this.labels.username = cScript.winobj.getElementById('inspectorPanelUsername');
        this.labels.username.onclick = function() {
            alert(user.id);
        };
    },
    
    bClick: function(parent)
    {
        if (user.auth) {
            // alert(user.name);
            if (!this.panel) {
                this.init();
            };
            this.panel.openPopup(parent, 'after_start', 0, 0, false, true);
            this.labels.username.value = user.name;
        } else {
            // открыть страницу авторизации
        }
    }
}