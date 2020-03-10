/*!
 * assert.js - assertions for javascript
 * Copyright (c) 2018, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/bsert
 */
/* eslint-disable */
interface AssertionErrorOptions {
    message?: any;
    actual?: any;
    expected?: any;
    operator?: any;
    generatedMessage?: any;
    stackStartFn?: any;
    stackStartFunction?: any;
}

/**
 * AssertionError
 */
class AssertionError extends Error {
    type: string;
    name: string;
    code: string;
    generatedMessage: boolean;
    actual: any;
    expected: any;
    operator: string;

    constructor(options: AssertionErrorOptions | null) {
        if (typeof options === 'string') options = { message: options };

        if (options === null || typeof options !== 'object') options = {};

        let message = null;
        let operator = 'fail';
        let generatedMessage = Boolean(options.generatedMessage);

        if (options.message != null) message = toString(options.message);

        if (typeof options.operator === 'string') operator = options.operator;

        if (message == null) {
            if (operator === 'fail') {
                message = 'Assertion failed.';
            } else {
                const a = stringify(options.actual);
                const b = stringify(options.expected);

                message = `${a} ${operator} ${b}`;
            }

            generatedMessage = true;
        }

        super(message);

        let start = this.constructor;

        if (typeof options.stackStartFunction === 'function') start = options.stackStartFunction;
        else if (typeof options.stackStartFn === 'function') start = options.stackStartFn;

        this.type = 'AssertionError';
        this.name = 'AssertionError [ERR_ASSERTION]';
        this.code = 'ERR_ASSERTION';
        this.generatedMessage = generatedMessage;
        this.actual = options.actual;
        this.expected = options.expected;
        this.operator = operator;

        if (Error.captureStackTrace) Error.captureStackTrace(this, start);
    }
}

/*
 * Assert
 */
export function assert(value: any, message?: string | null) {
    if (!value) {
        let generatedMessage = false;

        if (arguments.length === 0) {
            message = 'No value argument passed to `assert()`.';
            generatedMessage = true;
        } else if (message == null) {
            message = 'Assertion failed.';
            generatedMessage = true;
        } else if (isError(message)) {
            throw message;
        }

        throw new AssertionError({
            message,
            actual: value,
            expected: true,
            operator: '==',
            generatedMessage,
            stackStartFn: assert,
        });
    }
}

export function equal(actual: any, expected: any, message: any) {
    if (!Object.is(actual, expected)) {
        if (isError(message)) throw message;

        throw new AssertionError({
            message,
            actual,
            expected,
            operator: 'strictEqual',
            stackStartFn: equal,
        });
    }
}

export function notEqual(actual: any, expected: any, message: any) {
    if (Object.is(actual, expected)) {
        if (isError(message)) throw message;

        throw new AssertionError({
            message,
            actual,
            expected,
            operator: 'notStrictEqual',
            stackStartFn: notEqual,
        });
    }
}

export function fail(message: string | null) {
    let generatedMessage = false;

    if (isError(message)) throw message;

    if (message == null) {
        message = 'Assertion failed.';
        generatedMessage = true;
    }

    throw new AssertionError({
        message,
        actual: false,
        expected: true,
        operator: 'fail',
        generatedMessage,
        stackStartFn: fail,
    });
}

export function throws(func: () => void, expected: any, message: string | null) {
    if (typeof expected === 'string') {
        message = expected;
        expected = undefined;
    }

    let thrown = false;
    let err = null;

    enforce(typeof func === 'function', 'func', 'function');

    try {
        func();
    } catch (e) {
        thrown = true;
        err = e;
    }

    if (!thrown) {
        let generatedMessage = false;

        if (message == null) {
            message = 'Missing expected exception.';
            generatedMessage = true;
        }

        throw new AssertionError({
            message,
            actual: undefined,
            expected,
            operator: 'throws',
            generatedMessage,
            stackStartFn: throws,
        });
    }

    if (!testError(err, expected, message, throws)) throw err;
}

export function doesNotThrow(func: () => void, expected: any, message: string | null) {
    if (typeof expected === 'string') {
        message = expected;
        expected = undefined;
    }

    let thrown = false;
    let err = null;

    enforce(typeof func === 'function', 'func', 'function');

    try {
        func();
    } catch (e) {
        thrown = true;
        err = e;
    }

    if (!thrown) return;

    if (testError(err, expected, message, doesNotThrow)) {
        let generatedMessage = false;

        if (message == null) {
            message = 'Got unwanted exception.';
            generatedMessage = true;
        }

        throw new AssertionError({
            message,
            actual: err,
            expected,
            operator: 'doesNotThrow',
            generatedMessage,
            stackStartFn: doesNotThrow,
        });
    }

    throw err;
}

export async function rejects(func: () => any, expected: any, message: string | null) {
    if (typeof expected === 'string') {
        message = expected;
        expected = undefined;
    }

    let thrown = false;
    let err = null;

    if (typeof func !== 'function') enforce(isPromise(func), 'func', 'promise');

    try {
        if (isPromise(func)) await func;
        else await func();
    } catch (e) {
        thrown = true;
        err = e;
    }

    if (!thrown) {
        let generatedMessage = false;

        if (message == null) {
            message = 'Missing expected rejection.';
            generatedMessage = true;
        }

        throw new AssertionError({
            message,
            actual: undefined,
            expected,
            operator: 'rejects',
            generatedMessage,
            stackStartFn: rejects,
        });
    }

    if (!testError(err, expected, message, rejects)) throw err;
}

export async function doesNotReject(func: () => any, expected: any, message: string | null) {
    if (typeof expected === 'string') {
        message = expected;
        expected = undefined;
    }

    let thrown = false;
    let err = null;

    if (typeof func !== 'function') enforce(isPromise(func), 'func', 'promise');

    try {
        if (isPromise(func)) await func;
        else await func();
    } catch (e) {
        thrown = true;
        err = e;
    }

    if (!thrown) return;

    if (testError(err, expected, message, doesNotReject)) {
        let generatedMessage = false;

        if (message == null) {
            message = 'Got unwanted rejection.';
            generatedMessage = true;
        }

        throw new AssertionError({
            message,
            actual: undefined,
            expected,
            operator: 'doesNotReject',
            generatedMessage,
            stackStartFn: doesNotReject,
        });
    }

    throw err;
}

export function ifError(err: { message: string | any[]; constructor: { name: string } } | null) {
    if (err != null) {
        let message = 'ifError got unwanted exception: ';

        if (typeof err === 'object' && typeof err.message === 'string') {
            if (err.message.length === 0 && err.constructor) message += err.constructor.name;
            else message += err.message;
        } else {
            message += stringify(err);
        }

        throw new AssertionError({
            message,
            actual: err,
            expected: null,
            operator: 'ifError',
            generatedMessage: true,
            stackStartFn: ifError,
        });
    }
}

export function deepEqual(actual: any, expected: any, message: any) {
    if (!isDeepEqual(actual, expected, false)) {
        if (isError(message)) throw message;

        throw new AssertionError({
            message,
            actual,
            expected,
            operator: 'deepStrictEqual',
            stackStartFn: deepEqual,
        });
    }
}

export function notDeepEqual(actual: any, expected: any, message: any) {
    if (isDeepEqual(actual, expected, true)) {
        if (isError(message)) throw message;

        throw new AssertionError({
            message,
            actual,
            expected,
            operator: 'notDeepStrictEqual',
            stackStartFn: notDeepEqual,
        });
    }
}

export function bufferEqual(
    actual: { equals: (arg0: any) => any; toString: (arg0: any) => any },
    expected: { toString: (arg0: any) => any },
    enc: string | null,
    message: any,
) {
    if (!isEncoding(enc)) {
        message = enc;
        enc = null;
    }

    if (enc == null) enc = 'hex';

    expected = bufferize(actual, expected, enc);

    enforce(isBuffer(actual), 'actual', 'buffer');
    enforce(isBuffer(expected), 'expected', 'buffer');

    if (actual !== expected && !actual.equals(expected)) {
        if (isError(message)) throw message;

        throw new AssertionError({
            message,
            actual: actual.toString(enc),
            expected: expected.toString(enc),
            operator: 'bufferEqual',
            stackStartFn: bufferEqual,
        });
    }
}

export function notBufferEqual(
    actual: { equals: (arg0: any) => any; toString: (arg0: any) => any },
    expected: { toString: (arg0: any) => any },
    enc: string | null,
    message: any,
) {
    if (!isEncoding(enc)) {
        message = enc;
        enc = null;
    }

    if (enc == null) enc = 'hex';

    expected = bufferize(actual, expected, enc);

    enforce(isBuffer(actual), 'actual', 'buffer');
    enforce(isBuffer(expected), 'expected', 'buffer');

    if (actual === expected || actual.equals(expected)) {
        if (isError(message)) throw message;

        throw new AssertionError({
            message,
            actual: actual.toString(enc),
            expected: expected.toString(enc),
            operator: 'notBufferEqual',
            stackStartFn: notBufferEqual,
        });
    }
}

export function enforce(value: boolean, name: string | null, type: string | null) {
    if (!value) {
        let msg;

        if (name == null) {
            msg = 'Invalid type for parameter.';
        } else {
            if (type == null) msg = `Invalid type for "${name}".`;
            else msg = `"${name}" must be a(n) ${type}.`;
        }

        const err = new TypeError(msg);

        if (Error.captureStackTrace) Error.captureStackTrace(err, enforce);

        throw err;
    }
}

export function range(value: any, name: null) {
    if (!value) {
        const msg = name != null ? `"${name}" is out of range.` : 'Parameter is out of range.';

        const err = new RangeError(msg);

        if (Error.captureStackTrace) Error.captureStackTrace(err, range);

        throw err;
    }
}

/*
 * Stringification
 */

export function stringify(value: any) {
    switch (typeof value) {
        case 'undefined':
            return 'undefined';
        case 'object':
            if (value === null) return 'null';
            return `[${objectName(value)}]`;
        case 'boolean':
            return `${value}`;
        case 'number':
            return `${value}`;
        case 'string':
            if (value.length > 80) value = `${value.substring(0, 77)}...`;
            return JSON.stringify(value);
        case 'symbol':
            return tryString(value);
        case 'function':
            return `[${funcName(value)}]`;
        case 'bigint':
            return `${value}n`;
        default:
            return `[${typeof value}]`;
    }
}

export function toString(value: any) {
    if (typeof value === 'string') return value;

    if (isError(value)) return tryString(value);

    return stringify(value);
}

export function tryString(value: symbol) {
    try {
        return String(value);
    } catch (e) {
        return 'Object';
    }
}

/*
 * Error Testing
 */

export function testError(err: any, expected: any, message: any, func: any) {
    if (expected == null) return true;

    if (isRegExp(expected)) return expected.test(err);

    if (typeof expected !== 'function') {
        if (func === doesNotThrow || func === doesNotReject) throw new TypeError('"expected" must not be an object.');

        if (typeof expected !== 'object') throw new TypeError('"expected" must be an object.');

        let generatedMessage = false;

        if (message == null) {
            const name = func === rejects ? 'rejection' : 'exception';
            message = `Missing expected ${name}.`;
            generatedMessage = true;
        }

        if (err == null || typeof err !== 'object') {
            throw new AssertionError({
                actual: err,
                expected,
                message,
                operator: func.name,
                generatedMessage,
                stackStartFn: func,
            });
        }

        const keys = Object.keys(expected);

        if (isError(expected)) keys.push('name', 'message');

        if (keys.length === 0) throw new TypeError('"expected" may not be an empty object.');

        for (const key of keys) {
            const expect = expected[key];
            const value = err[key];

            if (typeof value === 'string' && isRegExp(expect) && expect.test(value)) {
                continue;
            }

            if (key in err && isDeepEqual(value, expect, false)) continue;

            throw new AssertionError({
                actual: err,
                expected: expected,
                message,
                operator: func.name,
                generatedMessage,
                stackStartFn: func,
            });
        }

        return true;
    }

    if (expected.prototype !== undefined && err instanceof expected) return true;

    if (Error.isPrototypeOf(expected)) return false;

    return expected.call({}, err) === true;
}

/*
 * Comparisons
 */

export function isDeepEqual(x: any, y: any, fail: boolean) {
    try {
        return compare(x, y, null);
    } catch (e) {
        return fail;
    }
}

export function compare(a: any, b: any, cache: any) {
    // Primitives.
    if (Object.is(a, b)) return true;

    if (!isObject(a) || !isObject(b)) return false;

    // Semi-primitives.
    if (objectString(a) !== objectString(b)) return false;

    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;

    if (isBuffer(a) && isBuffer(b)) return a.equals(b);

    if (isDate(a)) return Object.is(a.getTime(), b.getTime());

    if (isRegExp(a)) {
        return (
            a.source === b.source &&
            a.global === b.global &&
            a.multiline === b.multiline &&
            a.lastIndex === b.lastIndex &&
            a.ignoreCase === b.ignoreCase
        );
    }

    if (isError(a)) {
        if (a.message !== b.message) return false;
    }

    if (isArrayBuffer(a)) {
        a = new Uint8Array(a);
        b = new Uint8Array(b);
    }

    if (isView(a) && !isBuffer(a)) {
        if (isBuffer(b)) return false;

        const x = new Uint8Array(a.buffer);
        const y = new Uint8Array(b.buffer);

        if (x.length !== y.length) return false;

        for (let i = 0; i < x.length; i++) {
            if (x[i] !== y[i]) return false;
        }

        return true;
    }

    if (isSet(a)) {
        if (a.size !== b.size) return false;

        const keys = new Set([...a, ...b]);

        return keys.size === a.size;
    }

    // Recursive.
    if (!cache) {
        cache = {
            a: new Map(),
            b: new Map(),
            p: 0,
        };
    } else {
        const aa = cache.a.get(a);

        if (aa != null) {
            const bb = cache.b.get(b);
            if (bb != null) return aa === bb;
        }

        cache.p += 1;
    }

    cache.a.set(a, cache.p);
    cache.b.set(b, cache.p);

    const ret = recurse(a, b, cache);

    cache.a.delete(a);
    cache.b.delete(b);

    return ret;
}

export function recurse(a: any, b: any, cache: any) {
    if (isMap(a)) {
        if (a.size !== b.size) return false;

        const keys = new Set([...a.keys(), ...b.keys()]);

        if (keys.size !== a.size) return false;

        keys.forEach(key => {
            if (!compare(a.get(key), b.get(key), cache)) return false;
        });

        return true;
    }

    if (isArray(a)) {
        if (a.length !== b.length) return false;

        for (let i = 0; i < a.length; i++) {
            if (!compare(a[i], b[i], cache)) return false;
        }

        return true;
    }

    const ak = ownKeys(a);
    const bk = ownKeys(b);

    if (ak.length !== bk.length) return false;

    const keys = new Set([...ak, ...bk]);

    if (keys.size !== ak.length) return false;

    keys.forEach(key => {
        if (!compare(a[key], b[key], cache)) return false;
    })

    return true;
}

export function ownKeys(obj: any) {
    const keys = Object.keys(obj);

    if (!Object.getOwnPropertySymbols) return keys;

    if (!Object.getOwnPropertyDescriptor) return keys;

    const symbols = Object.getOwnPropertySymbols(obj);

    for (const symbol of symbols) {
        const desc = Object.getOwnPropertyDescriptor(obj, symbol);

        if (desc && desc.enumerable) keys.push(symbol.toString());
    }

    return keys;
}

/*
 * Helpers
 */

export function objectString(obj: null | undefined) {
    if (obj === undefined) return '[object Undefined]';

    if (obj === null) return '[object Null]';

    try {
        return Object.prototype.toString.call(obj);
    } catch (e) {
        return '[object Object]';
    }
}

export function objectType(obj: any) {
    return objectString(obj).slice(8, -1);
}

export function objectName(obj: { constructor: any } | null) {
    const type = objectType(obj);

    if (obj == null) return type;

    if (type !== 'Object' && type !== 'Error') return type;

    let ctor, name;

    try {
        ctor = obj.constructor;
    } catch (e) {}

    if (ctor == null) return type;

    try {
        name = ctor.name;
    } catch (e) {
        return type;
    }

    if (typeof name !== 'string' || name.length === 0) return type;

    return name;
}

export function funcName(func: { name: any }) {
    let name;

    try {
        name = func.name;
    } catch (e) {}

    if (typeof name !== 'string' || name.length === 0) return 'Function';

    return `Function: ${name}`;
}

export function isArray(obj: any) {
    return Array.isArray(obj);
}

export function isArrayBuffer(obj: any) {
    return obj instanceof ArrayBuffer;
}

export function isBuffer(obj: any) {
    return isObject(obj) && typeof obj.writeUInt32LE === 'function' && typeof obj.equals === 'function';
}

export function isDate(obj: any) {
    return obj instanceof Date;
}

export function isError(obj: any) {
    return obj instanceof Error;
}

export function isMap(obj: any) {
    return obj instanceof Map;
}

export function isObject(obj: any) {
    return obj && typeof obj === 'object';
}

export function isPromise(obj: any) {
    return obj instanceof Promise;
}

export function isRegExp(obj: any) {
    return obj instanceof RegExp;
}

export function isSet(obj: any) {
    return obj instanceof Set;
}

export function isView(obj: any) {
    return ArrayBuffer.isView(obj);
}

export function isEncoding(enc: any) {
    if (typeof enc !== 'string') return false;

    switch (enc) {
        case 'ascii':
        case 'binary':
        case 'base64':
        case 'hex':
        case 'latin1':
        case 'ucs2':
        case 'utf8':
        case 'utf16le':
            return true;
    }

    return false;
}

export function bufferize(actual: any, expected: any, enc: string) {
    if (typeof expected === 'string') {
        if (!isBuffer(actual)) return null;

        const { constructor } = actual;

        if (!constructor || typeof constructor.from !== 'function') return null;

        if (!isEncoding(enc)) return null;

        if (enc === 'hex' && expected.length & 1) return null;

        const raw = constructor.from(expected, enc);

        if (enc === 'hex' && raw.length !== expected.length >>> 1) return null;

        return raw;
    }

    return expected;
}
