inspector4pda.XHR = function () {
	
	this.callback = {
		success: function(){},
		error: function(){},
		timeout: function(){},
		not200Success: function(){}
	};

	this.timeoutTime = 10000;
	
	this.send = function(url) {

		var self = this;
		var req = new XMLHttpRequest();
		req.onreadystatechange = function() {
			if (req.readyState == 4) {
				if (req.status == 200) {
					self.callback.success(req);
				} else {
					self.callback.not200Success(req);
				}
			}
		};

		req.onerror = function() {
			self.callback.error();
		};

		if (self.timeoutTime) {
			req.timeout = self.timeoutTime;
			req.ontimeout = function () {
				self.callback.timeout();
			}
		}

		req.open("GET", url, true);
		req.send(null);
	};

};