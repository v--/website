// BEGIN HACK: Extending the native error object is a bit "strange"
function ExtendableError(message: string) {
    Error.call(this, message);

    Object.defineProperty(this, 'message', {
        enumerable : false,
        value : message
    });

    Object.defineProperty(this, 'name', {
        enumerable : false,
        value : this.constructor.name
    });
}

ExtendableError.prototype = Error.prototype;
ExtendableError.prototype.constructor = ExtendableError;
// END HACK

class CoolError extends ExtendableError {
    static client = new CoolError('A client-side error occured');

    constructor(message: string) {
        super(message);
        this.title = 'Error';
    }
}

class HTTPError extends CoolError {
    static notFound = new HTTPError(404, 'Not found');

    constructor(code: number, statusText: string) {
        super(statusText);
        this.title = `HTTP Error ${code}`;
    }
}

CoolError.HTTP = HTTPError;

export default CoolError;
