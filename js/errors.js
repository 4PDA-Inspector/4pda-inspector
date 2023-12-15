import {action_print_unavailable, action_print_logout} from "./utils.js";

export class MyError {
    message

    constructor(message) {
        if (message) {
            this.message = message
        }
    }

    action() {}
}

export class UnavailableError extends MyError {
    message = 'Сайт недоступен'
    action() {
        action_print_unavailable(this.message)
    }
}
export class UnauthorizedError extends MyError {
    message = 'Неавторизован'
    action() {
        action_print_logout(this.message)
    }
}
