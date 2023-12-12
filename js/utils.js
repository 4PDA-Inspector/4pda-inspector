export function request_and_parse(code) {
    return new Promise((resolve, reject) => {
        fetch('https://4pda.to/forum/index.php?act=inspector&CODE=' + code).then(response => {
            if (response.ok) {
                response.text().then(text => {
                    resolve(text)
                }).catch(r => {
                    console.error(r)
                    reject('Cant read')
                })
            } else {
                reject('Cant request to 4pda')
            }
        }).catch(reason => {
            console.error(reason)
            reject('Cant request to 4pda')
        })
    });
}

export function now() {
    return new Date().getTime();
}
