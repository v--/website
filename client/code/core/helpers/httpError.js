import CoolError from 'code/core/helpers/coolError';

export default class HTTPError extends CoolError {
    constructor(code: number, statusText: string) {
        super(statusText);
        this.name = `HTTP Error ${code}`;
        this.message = statusText;
    }
}
