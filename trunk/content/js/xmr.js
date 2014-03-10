var iXMR = {

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
					iXMR.callback.success(req);
				} else {
					iXMR.callback.not200Success(req);
				}
			}
		}

		req.onerror = function() {
			iXMR.callback.error();
		}

		if (iXMR.timeoutTime) {
			req.timeout = iXMR.timeoutTime;
			req.ontimeout = function () {
				iXMR.callback.timeout();
			}
		};

		req.open("GET", url, true);
		req.send(null);
	}
}