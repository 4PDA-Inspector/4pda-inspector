var cScript = {

	winobj: null,

    updateTimer: 0,

	init: function(el)
	{
		var obj = document.getElementById("navigator-toolbox");
		this.winobj = (obj) ? window.document : window.opener.document;

        this.request();
    },

    request: function(interval)
    {
        vars.getPrefs();
        utils.log(new Date().toString());
        clearTimeout(this.updateTimer);
        cScript.getData();

        this.updateTimer = setTimeout(function() {
            cScript.request();
        }, (interval || vars.interval));
    },

    getData: function()
    {
        user.request(function() {
            if (user.id) {
                themes.request(function() {QMS.request(cScript.printCount)});
            };
        });
    },

    printCount: function()
    {
        var qCount = QMS.unreadCount;
        var tCount = themes.list.length;

        var btn = cScript.winobj.getElementById('inspectorButton');
        if (!btn)
            return false;

        var canvas_width = 20;
        var canvas_height = 16;
        var canvas_img = "chrome://4pdainspector/content/icons/icon_16x.png";
        var title_padding = 2;
        var fontSize = 8;

        var button_bgcolor = '#4474C4';
        var button_color = '#FFFFFF';

        var canvas = cScript.winobj.getElementById("inspectorButtonCanvas");
        canvas.setAttribute("width", canvas_width);
        canvas.setAttribute("height", canvas_height);
        var ctx = canvas.getContext("2d");

        var img = new Image();
        img.onload = function()
        {
            ctx.textBaseline = 'top';
            ctx.font = 'bold '+fontSize+'px tahoma,arial';
            ctx.clearRect(0, 0, canvas_width, canvas_height);
            ctx.drawImage(img, 2, 0, img.width, img.height);

            var w = ctx.measureText(tCount).width;
            var h = fontSize + title_padding;

            var x = canvas_width - w;
            var y = canvas_height - h;

            ctx.fillStyle = button_bgcolor;
            ctx.fillRect(x-1, y, w+1, h);
            ctx.fillStyle = button_color;
            ctx.fillText(tCount, x, y+1);

            var w = ctx.measureText(qCount).width;
            ctx.fillStyle = button_bgcolor;
            ctx.fillRect(0, y, w+2, h);
            ctx.fillStyle = button_color;
            ctx.fillText(qCount, 1, y+1);

            btn.image = canvas.toDataURL("image/png");
        };

        img.src = canvas_img;
        /*btn.setAttribute('tooltiptext', this.stringBundle.GetStringFromName("4PDA_online")+
            '\n'+this.stringBundle.GetStringFromName("Unread Topics")+': '+tCount+
            '\n'+this.stringBundle.GetStringFromName("New Messages")+': '+qCount
        );*/
    }
};

cScript.init();