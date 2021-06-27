class Utils {
    static parseStringRegexp = /([^\s"']+|"([^"]*)"|'([^']*)')/g

    static parse(str) {
        let parsed = str.match(this.parseStringRegexp);
        for (let i = 0; i < parsed.length; i++) {
            let pq = parsed[i].match(/"(.*)"/);
            if (pq) {
                parsed[i] = pq[1];
            }
        }
        return parsed;
    }
}