/**
    @license
    Copyright (C) 2015 Dave Lesage
    License: MIT
    See license.txt for full license text.
*/
"use strict";

let toString = Object.prototype.toString;
let log = console.log.bind(console); /* eslint no-unused-vars: 0 */

/**
    Class for containing a max reference counter
    as well as two stacks of references to objects.
    To be used with deepCopy and equals.

    @class Contains two reference stacks as well as a defined max stack depth.
*/
class RecursiveCounter {
    constructor(maxStackDepth) {
        this.xStack = [];
        this.yStack = [];
        this.count = 0;
        this.maxStackDepth = maxStackDepth;
    }

    push(x, y) {
        this.xStack.push(x);
        this.yStack.push(y);
        this.count++;
    }

    pop() {
        this.xStack.pop();
        this.yStack.pop();
        this.count--;
    }
}

export function getType(val) {
    return toString.call(val);
}

let generatorProto   = (function*(){}()).prototype;
let generatorFnProto = (function*(){}).prototype; // this isn't specific enough at this point. leaving for now, possible rework when ES6 is stable.
export var types = {
      'arguments'         : getType(arguments) // will this work? babel may be accidentally saving us here. swap to iife if necessary
    , 'array'             : getType([])
    , 'boolean'           : getType(true)
    // buffer doesn't work, toString.call(Buffer) returns [object Object]
    , 'date'              : getType(new Date())
    , 'error'             : getType(new Error())
    , 'generator'         : getType(generatorProto)
    , 'generatorFunction' : getType(generatorFnProto)
    , 'function'          : getType(function(){})
    , 'map'               : getType(new Map())
    , 'null'              : getType(null)
    , 'number'            : getType(0)
    , 'object'            : getType({})
    , 'regexp'            : getType(new RegExp())
    , 'string'            : getType('')
    , 'set'               : getType(new Set())
    , 'symbol'            : getType(Symbol())
    , 'undefined'         : getType(undefined)
    , 'weakmap'           : getType(new WeakMap())
    , 'weakset'           : getType(new WeakSet())
};

export function setType(key, value) {
    types[key] = getType(value);
}

function _clone(source, rc) {
    if (rc.count > rc.maxStackDepth) throw new Error("Stack depth exceeded: " + rc.stackMaxDepth + "!");
    switch (getType(source)) {
        // case types.buffer:
            // return _bufferCopy(source, new Buffer(source.length));
        // case types.object:
        case types.array:
            return _singleCopy(source, [], rc);
        case types.regexp:
            return _singleCopy(source, new RegExp(source), rc);
        case types.date:
            return _singleCopy(source, new Date(source), rc);
        case types.set:
            return _setCopy(source, new Set(), rc);
        case types.map:
            return _mapCopy(source, new Map(), rc);
        case types.boolean:
        case types.null:
        case types.number:
        case types.string:
        case types.undefined:
            return source;
        case types.function:
            return source;
        case types.object:
        default:
            if (Buffer.isBuffer(source)) // boo, extra checks on each object because of bad buffer toStringTag
                return _bufferCopy(source, new Buffer(source.length));
            else
                return _objectCopy(source, Object.create(Reflect.getPrototypeOf(source)), rc);
    }
}

function _instanceCopy(sourceRef, copyRef, rc, copier) {
    let origIndex = rc.xStack.indexOf(sourceRef);
    if (origIndex === -1) {
        rc.push(sourceRef, copyRef);
        forEach(sourceRef, function(value, key) {
            copier(copyRef, value, key);
        });
        rc.pop();
        return copyRef;
    }
    else
        return rc.yStack[origIndex];
}

function _objectCopy(sourceRef, copyRef, rc) {
    let origIndex = rc.xStack.indexOf(sourceRef);
    if (origIndex === -1) {
        rc.push(sourceRef, copyRef);
        for (let [key, val] of Object.entries(sourceRef))
            copyRef[key] = _clone(val, rc);
        let symbols = Object.getOwnPropertySymbols(sourceRef);
        for (let symbol of symbols)
            copyRef[symbol] = _clone(sourceRef[symbol], rc);
        rc.pop();
        return copyRef;
    }
    else
        return rc.yStack[origIndex];
}

function _setCopy(sourceRef, copyRef, rc) {
    return _instanceCopy(sourceRef, copyRef, rc, (set, val) => {
        set.add(_clone(val, rc));
    });
}

function _mapCopy(sourceRef, copyRef, rc) {
    return _instanceCopy(sourceRef, copyRef, rc, (map, val, key) => {
        map.set(key, _clone(val, rc));
    });
}

function _singleCopy(sourceRef, copyRef, rc) {
    return _instanceCopy(sourceRef, copyRef, rc, (item, val, key) => {
        copyRef[key] = _clone(val, rc);
    });
}

function _bufferCopy(sourceRef, copyRef, rc) {
    sourceRef.copy(copyRef);
    return copyRef;
}

export function clone(origSource) {
    let origIndex = -1;
    let rc = new RecursiveCounter(1000);
    return _clone.call(null, origSource, rc);
}

/**
    Internal method for comparing the equivalence of items.

    @param x The first item to compare.
    @param y The second item to compare.
    @param rc The running counter for comparing circular references.
    @returns {boolean} An indication as to whether or not x and y were equal.
*/
function _equals(x, y, rc) {
    if (rc.count > rc.maxStackDepth) throw new Error("Stack depth exceeded: " + rc.maxStackDepth + "!");
    // check for reference and primitive equality
    if (x === y)
        return true;
    // check for type equality
    let xType = getType(x);
    let yType = getType(y);
    if (xType !== yType)
        return false;
    // check for circular references -- may get a perf improvement by only using this when necessary, instead of at the top
    let xIndex = rc.xStack.lastIndexOf(x);
    let yIndex = rc.yStack.lastIndexOf(y);
    if (xIndex !== -1) {
        if (yIndex === xIndex)
            return true;
    }
    // check for inequalities
    switch(xType) {
        case types.number:
            if (x !== y) {
                if (isNaN(x) && isNaN(y))
                    return true;
                return false;
            }
            break;
        case types.date:
            if (x.getTime() !== y.getTime())
                return false;
            // check for extra properties stored on the Date object
            if (!_compareObject(x, y, rc))
                return false;
            break;
        case types.array:
            if (x.length !== y.length)
                return false;
            rc.push(x, y);
            for (let i = 0; i < x.length; i++) {
                if (!_equals(x[i], y[i], rc))
                    return false;
            }
            rc.pop();
            break;
        case types.map:
            if (x.size !== y.size)
                return false;
            let xMapArr = [...x]; // these need to be sorted by key before comparison
            let yMapArr = [...y]; // order shouldn't matter, as long as they are the same
            xMapArr.sort((a, b) => {
                return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
            });
            yMapArr.sort((a, b) => {
                return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
            });
            if (!_equals(xMapArr, yMapArr, rc))
                return false;
            break;
        case types.set:
            if (x.size !== y.size)
                return false;
            let xArr = [...x]; // consider doing a comparison without converting to array?
            let yArr = [...y]; // converting to array may still be the fastest option.
            if (!_equals(xArr, yArr, rc))
                return false;
            break;
        // case types.generator:
        // // case this.types.generatorFunction:
        //     // do we really want to check generator equality other than reference equality?
        //     // this could accidentally execute some lazy-loading stuff.

        //     // leaning towards no. considering.
        //     rc.push(x, y);
        //     let a, b;
        //     let tempX = x[Symbol.iterator](); // these point to the same object, after the Symbol.iterator get override
        //     let tempY = y[Symbol.iterator]();
        //     do {
        //         a = tempX.next();
        //         b = tempY.next();
        //         if (!_equals(a.value, b.value, rc))
        //             return false;
        //     } while (!(a.done || b.done));
        //     if (a.done !== b.done)
        //         return false;
        //     rc.pop();
        //     break;
        case types.function:
            if (!_compareObject(x, y, rc)) // check for properties on function
                return false;
            if (x !== y)
                return false; // other than that, just use reference equality for now
            break;
        case types.object:
            if (Buffer.isBuffer(x)) {
                if (!Buffer.isBuffer(y))
                    return false;
                if (x.length !== y.length)
                    return false;
                if (!x.equals(y))
                    return false;
            }
            else {
                if (!_compareObject(x, y, rc))
                    return false;
            }
            break;
        case types.regexp:
            if (!_equals(x.toString(), y.toString(), rc))
                return false;
            if (!_compareObject(x, y, rc))
                return false;
            break;
        case types.boolean:
        case types.string:
        case types.symbol:
            if (x !== y)
                return false;
            break;
        default:
            // safe to assume that if we hit default, we want to compare object (ie - unknown class type?)
            if (!_compareObject(x, y, rc))
                return false;
            // // how do we compare classes with an overridden toStringTag?
            // // this isn't very helpful... constructor is always a function, even for primitives.
            // if (x.constructor instanceof Function) { // dangerous? more testing, especially on equals that need to fail.
            //     if (!_compareObject(x, y, rc))
            //         return false;
            // }
            // else {
            //     log('in here');
            //     if (x !== y)
            //         return false;
            // }
            break;
    }
    return true;
}

/**
    Internal method for comparing the equivalence of objects, or object-like items.

    @param x The first item to compare.
    @param y The second item to compare.
    @param rc The running counter for comparing circular references.
    @returns {boolean} An indication as to whether or not x and y were equal.
*/
function _compareObject(x: any, y: any, rc: RecursiveCounter) {
    if (x === y)
        return true;
    if (x.constructor && y.constructor && x.constructor !== y.constructor)
        return false;
    let xKeys = Object.keys(x);
    let yKeys = Object.keys(y);
    xKeys.sort();
    yKeys.sort();
    if (!_equals(xKeys, yKeys, rc))
        return false;
    rc.push(x, y);
    for (let k in x) {
        if (!_equals(x[k], y[k], rc))
            return false;
    }
    rc.pop();
    return true;
}

/**
    Compares the equality of two items.

    @param x The first item to compare.
    @param y The second item to compare.
    @returns {boolean} An indication as to whether or not x and y were equal.
*/
export function equals(x, y) {
    let rc = new RecursiveCounter(1000);
    return _equals.call(null, x, y, rc);
}

/**
    Generic interface for looping over an iterable,
    yielding a key value pair for each item.

    @param {any} item The item over which to iterate.
    @returns {any} A reference to the original item.
*/
export function* each(item) {
    let type = getType(item);
    switch(type) {
        case types.date:
        case types.function:
        case types.object:
        case types.regexp:
            if (!item[Symbol.iterator])
                yield* Object.entries(item);
            else {
                for (let value of item)
                    yield [undefined, value];
            }
            break;
        case types.arguments:
        case types.array:
            for (let i = 0; i < item.length; i++)
                yield [i, item[i]];
            break;
        case types.map:
            yield* item;
            break;
        case types.set:
            for (let value of item) // treat keys and values as equivalent for sets
                yield [value, value];
            break;
        default:
            // if unknown type, then check for Symbol.iterator
            if (item[Symbol.iterator]) {
                for (let value of item)
                    yield [undefined, value];
            }
            break;
    }
    return item;
}

/**
    Generic interface for looping over an iterable,
    and executing a provided method for each item.

    @param {any} item The item over which to iterate.
    @param {Function} method The callback to execute for each iterated value.
    @param {any} context The optional context to pass to each callback.
    @returns {any} A reference to the original item.
*/
export function forEach(item, method, context) {
    let type = getType(item);
    switch(type) {
        case types.date:
        case types.function:
        case types.object:
        case types.regexp:
            if (!item[Symbol.iterator]) {
                for (let [key, value] of  Object.entries(item)) {
                    if (item.hasOwnProperty(key))
                        method.call(context, value, key, item);
                }
            }
            else { // shenanigans
                for (let value of item) {
                    // do we want to check if value is array, and spread it across value/key?
                    method.call(context, value, undefined, item);
                }
            }
            break;
        case types.arguments:
        case types.array:
            for (let i = 0; i < item.length; i++)
                method.call(context, item[i], i, item);
            break;
        case types.map:
            for (let [key, value] of item)
                method.call(context, value, key, item);
            break;
        case types.set:
            for (let value of item) // treat keys and values as equivalent for sets
                method.call(context, value, value, item);
            break;
        default:
            // if unknown type, then check for Symbol.iterator
            if (item[Symbol.iterator]) {
                for (let value of item)
                    method.call(context, value, undefined, item);
            }
            break;
    }
    return item;
}

/*
    Internal method for inspecting a value
    and providing a string representation of that value.

    (params TBD)
*/
function _inspect(inspecting, inspection = '', seen = [], times = 0, indent = 2) {
    let type = getType(inspecting);
    switch(type) {
        case types.undefined:
            return 'undefined';
        case types.null:
            return 'null';
        case types.function:
            let name = inspecting.name ? ': ' + inspecting.name : '';
            return `[Function${name}]`;
        case types.string:
            return `'${inspecting}'`;
        case types.array:
            if (seen.indexOf(inspecting) > -1)
                return '[Circular]';
            times++;
            inspection = '[ ';
            seen.push(inspecting);
            var inspected = [];
            for (let val of inspecting)
                inspected.push(_inspect(val, inspection, seen, times));
            if (inspected.length === 0)
                return '[]';
            let length = inspected.reduce((prev, cur) => {
                return prev + cur.length;
            }, 0);
            if (length > 60)
                inspection = '[ ' + inspected.join(',\n' + ' '.repeat(times * indent)) + ' ]';
            else
                inspection = '[ ' + inspected.join(', ') + ' ]';
            return inspection;
        case types.object:
            if (seen.indexOf(inspecting) > -1)
                return '[Circular]';
            times++;
            inspection = '{ ';
            seen.push(inspecting);
            let objInspected = [];
            if (inspecting instanceof Error) // to match nodejs inspect methods
                objInspected.push('[' + inspecting.toString() + ']');
            for (let [key, val] of each(inspecting))
                objInspected.push(key + ': ' + _inspect(val, inspection, seen, times));
            if (objInspected.length === 0)
                return '{}';
            let objLength = objInspected.reduce((prev, cur) => {
                return prev + cur.length;
            }, 0);
            if (objLength > 60)
                inspection = '{\n' + ' '.repeat(times * indent) + objInspected.join(',\n' + ' '.repeat(times * indent)) + ' }';
            else
                inspection = '{ ' + objInspected.join(', ') + ' }';
            return inspection;
        case types.map:
        case types.set:
            return _inspect([...inspecting]);
        case types.number:
        case types.boolean:
        default:
            if (inspecting instanceof Error)
                return '[' + inspecting.toString() + ']';
            return inspecting.toString();
    }
}

/*
    Method for inspecting a value
    and providing a string
    representation that value.

    (params TBD)
*/
export function inspect(val, indent = 2) : String {
    return _inspect(val, '', [], 0, indent);
}

/**
    Internal method determining whether or not the provided arguments
    can be smashed or extended together, based on types.

    @param x The first item to compare.
    @param y The second item to compare.
    @param rc The running counter for comparing circular references.
    @returns {boolean} An indication as to whether or not x and y were equal.
*/
function isSmashable(...args) {
    // this is a fairly expensive call. find a way to optimize further?
    if (args.length < 1)
        return false;

    let baseType = getType(args[0]);
    if (!(
               baseType === types.array
            || baseType === types.object
            || baseType === types.set
            || baseType === types.map
            || baseType === types.function)) {
        return false;
    }

    if (baseType === types.function)
        baseType = types.object; // allow functions to be smashed onto objects, and vice versa

    for (let i = 1; i < args.length; i++) {
        let targetType = getType(args[i]);
        if (targetType === types.function)
            targetType = types.object; // allow functions to be smashed onto objects, and vice versa

        if (targetType !== baseType)
            return false;
    }
    return baseType;
}

/**
    Internal extend call.
    Performance abstraction to bypass all the argument shenanigans,
    as we know we will only be extending two items at a time internally.

    @param {any} a The item on which to extend the second.
    @param {any} b The item to extend onto the first.
    @returns {any} The reference to the first item.
*/
function _extend(a, b) {
    forEach(b, (bVal, key) => {
        let type = getType(a);
        switch(type) {
            case types.array:
            case types.object:
                if (a[key] === undefined || a[key] === null)
                    a[key] = b[key];
                else if (isSmashable(a[key], b[key]))
                    _extend(a[key], b[key]);
                break;
            case types.set:
                if (!a.has(bVal))
                    a.add(bVal);
                break;
            case types.map:
                if (!a.has(key))
                    a.set(key, bVal);
                else {
                    let aVal = a.get(key);
                    if (aVal === undefined || aVal === null)
                        a.set(key, bVal);
                    else if (isSmashable(aVal, bVal))
                        _extend(aVal, bVal);
                }
                break;
        }
    });
    return a;
}

/**
    Extends the properties on the provided arguments into the original item.
    Any properties on the tail arguments will not overwrite any properties
    on the first argument unless they are null or undefined,
    and any non primitive references will be shallow.

    @param {any} a The target to be extended.
    @param {...any} rest The tail items to extend onto the target.
    @returns {any} A reference to the extended target.
*/
export function extend(a, ...rest) {
    rest.forEach(b => {
        if (isSmashable(a, b))
            _extend(a, b);
    });
    return a;
}

/**
    Internal smash call.
    Performance abstraction to bypass all the argument shenanigans,
    as we know we will only be smashing two items at a time internally.

    @param {any} a The item on which to smash the second.
    @param {any} b The item to smash onto the first.
    @returns {any} The reference to the first item.
*/
function _smash(a, b) {
    this.forEach(b, (val, key) => {
        if (this.isSmashable(a[key], b[key])) // find a way to move isSmashable internal
            this._smash(a[key], b[key]);
        else
            a[key] = this.deepCopy(b[key]);
    });
    return a;
}

/**
    Smashes the properties on the provided arguments into the first argument.
    Any properties on the tail arguments will overwrite
    any existing properties on the first argument.

    @param {any} a The target to be smashed.
    @param {...any} rest The tail items to smash onto the target.
    @returns {any} A reference to the smashed target.
*/
export function smash(a, ...rest) {
    rest.forEach(b => {
        if (this.isSmashable(a, b)) // find a way to move isSmashable internal
            this._smash(a, b);
    });
    return a;
}

export var deepCopy = clone;
export var equal = equals;
export var type = getType;
export var typeOf = getType;

export default {
    clone,
    deepCopy: clone,
    each,
    equal: equals,
    equals,
    extend,
    forEach,
    getType,
    inspect,
    // smash,
    type: getType,
    typeOf: getType,
    types
};
