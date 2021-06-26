class XHR {
    url
    timeoutTime = 10000

    constructor(url) {
        this.url = url
    }

    async send() {
        let self = this
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest()
            req.onreadystatechange = function () {
                if (req.readyState == 4) {
                    if (req.status == 200) {
                        //self.callback.success(req);
                        return resolve(req);
                    } else {
                        //self.callback.not200Success(req);
                        return reject(req)
                    }
                }
            };

            req.onerror = function () {
                //self.callback.error();
                return reject(req)
            };

            if (self.timeoutTime) {
                req.timeout = self.timeoutTime;
                req.ontimeout = function () {
                    //self.callback.timeout();
                    return reject(req)
                }
            }

            req.open("GET", self.url, true);
            req.send(null);
        })
    }
}