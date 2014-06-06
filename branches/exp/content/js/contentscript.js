inspector4pda.cScript = {

	winobj: null,

    updateTimer: 0,

	init: function(el)
	{
		var obj = document.getElementById("navigator-toolbox");
		inspector4pda.cScript.winobj = (obj) ? window.document : window.opener.document;

        inspector4pda.cScript.request();
    },

    request: function(interval)
    {
        inspector4pda.vars.getPrefs();
        inspector4pda.utils.log(new Date().toString());
        clearTimeout(inspector4pda.cScript.updateTimer);
        inspector4pda.cScript.getData();

        inspector4pda.cScript.updateTimer = setTimeout(function() {
            inspector4pda.cScript.request();
        }, (interval || inspector4pda.vars.interval));
    },

    getData: function(callback)
    {
        var finishCallback = function(){
            inspector4pda.cScript.printCount();
            if (callback) {
                callback();
            };
        };

        inspector4pda.user.request(function() {
            if (inspector4pda.user.id) {
                inspector4pda.themes.request(function() {
                    inspector4pda.QMS.request(finishCallback);
                });
            };
        });
    },

    printCount: function()
    {
        var qCount = inspector4pda.QMS.unreadCount;
        var tCount = inspector4pda.themes.getCount();

        var btn = inspector4pda.cScript.winobj.getElementById('inspector4pda_button');
        if (!btn)
            return false;

        var canvas_width = 20;
        var canvas_height = 16;
        var canvas_img = "chrome://4pdainspector/content/icons/icon_16x.png";
        var title_padding = 2;
        var fontSize = 8;

        var button_bgcolor = '#4474C4';
        var button_color = '#FFFFFF';

        var canvas = inspector4pda.cScript.winobj.getElementById("inspector4pda_canvas");
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
        /*btn.setAttribute('tooltiptext', inspector4pda.cScript.stringBundle.GetStringFromName("4PDA_online")+
            '\n'+inspector4pda.cScript.stringBundle.GetStringFromName("Unread Topics")+': '+tCount+
            '\n'+inspector4pda.cScript.stringBundle.GetStringFromName("New Messages")+': '+qCount
        );*/
    }
};

inspector4pda.cScript.init();