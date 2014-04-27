inspector4pda.XHR = {

	callback: {
		success: function(){},
		error: function(){},
		timeout: function(){},
		not200Success: function(){}
	},

	timeoutTime: 3000,
	
	send: function(url) {
		var req = new XMLHttpRequest();
		req.onreadystatechange = function() {
			if (req.readyState == 4) {
				if (req.status == 200) {
					inspector4pda.XHR.callback.success(req);
				} else {
					inspector4pda.XHR.callback.not200Success(req);
				}
			}
		}

		req.onerror = function() {
			inspector4pda.XHR.callback.error();
		}

		if (inspector4pda.XHR.timeoutTime) {
			req.timeout = inspector4pda.XHR.timeoutTime;
			req.ontimeout = function () {
				inspector4pda.XHR.callback.timeout();
			}
		};

		req.open("GET", url, true);
		req.send(null);
	}
}