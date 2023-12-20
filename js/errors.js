export class MyError {
    message

    constructor(message) {
        if (message) {
            this.message = message
        }
    }

}

export class UnavailableError extends MyError {
    message = 'Сайт недоступен'
}
export class UnauthorizedError extends MyError {
    message = 'Неавторизован'
}
