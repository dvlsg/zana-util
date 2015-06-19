/**
    @license
    Copyright (C) 2015 Dave Lesage
    License: MIT
    See license.txt for full license text.
*/
"use strict";

let toString = Object.prototype.toString;

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

export class Util {

    constructor() {

        let generatorProto   = (function*(){}()).prototype;
        let generatorFnProto = (function*(){}).prototype; // this isn't specific enough at this point. leaving for now, possible rework when ES6 is stable.

        this.types = {
              'arguments'         : this.getType(arguments)
            , 'array'             : this.getType([])
            , 'boolean'           : this.getType(true)
            , 'date'              : this.getType(new Date())
            , 'generator'         : this.getType(generatorProto)
            , 'generatorFunction' : this.getType(generatorFnProto)
            , 'function'          : this.getType(function(){})
            , 'map'               : this.getType(new Map())
            , 'null'              : this.getType(null)
            , 'number'            : this.getType(0)
            , 'object'            : this.getType({})
            , 'regexp'            : this.getType(new RegExp())
            , 'string'            : this.getType('')
            , 'set'               : this.getType(new Set())
            , 'undefined'         : this.getType(undefined)
            , 'weakmap'           : this.getType(new WeakMap())
            , 'weakset'           : this.getType(new WeakSet())
        };
    }

    getType(value) {
        // ditch the regexp for performance
        // this will use @@toStringTag in the future
        return toString.call(value); // just use this.types['type'] for readability.
    }

    setType(key, value) {
        this.types[key] = this.getType(value);
    }

    deepCopy(src) {
        return this.clone(src);
    }

    clone(origSource) {
        let origIndex = -1;
        let rc = new RecursiveCounter(1000);

        let _clone = source => {
            if (rc.count > rc.maxStackDepth) throw new Error("Stack depth exceeded: " + rc.stackMaxDepth + "!");
            switch (this.getType(source)) {
                case this.types.object:
                    return _singleCopy(source, Object.create(Object.getPrototypeOf(source)));
                case this.types.array:
                    return _singleCopy(source, []);
                case this.types.regexp:
                    return _singleCopy(source, new RegExp(source));
                case this.types.date:
                    return _singleCopy(source, new Date(source));
                case this.types.set:
                    return _singleCopy(source, new Set());
                case this.types.map:
                    return _singleCopy(source, new Map()); // might not work / need a _mapCopy?
                default: // need to handle functions/generators differently? tbd.
                    return source;
            }
        };

        // set copy?
        // map copy?

        // move function external for performance? really should.
        let _singleCopy = (sourceRef, copyRef) => {
            origIndex = rc.xStack.indexOf(sourceRef);
            if (origIndex === -1) {
                rc.push(sourceRef, copyRef);
                this.forEach(sourceRef, function(value, key) {
                    copyRef[key] = _clone(value);
                });
                rc.pop();
                return copyRef;
            }
            else {
                // source item has already been copied
                // return the reference to the copied item
                return rc.yStack[origIndex];
            }
        };
        return _clone(origSource);
    }

    equals(item1, item2) {
        let rc = new RecursiveCounter(1000);
        let getType = this.getType;
        let types = this.types;

        function _equals(x, y) {
            if (rc.count > rc.maxStackDepth) throw new Error("Stack depth exceeded: " + rc.maxStackDepth + "!");
            // check for reference and primitive equality
            if (x === y)
                return true;
            // check for type equality
            let xType = getType(x);
            let yType = getType(y);
            if (xType !== yType)
                return false;
            // check for circular references
            let xIndex = rc.xStack.lastIndexOf(x);
            let yIndex = rc.yStack.lastIndexOf(y);
            if (xIndex !== -1) {
                if (yIndex === xIndex) // swapped from yIndex !== -1: is this fair?
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
                    if (!_compareObject(x, y))
                        return false;
                    break;
                case types.array:
                    if (x.length !== y.length)
                        return false;
                    rc.push(x, y);
                    for (let i = 0; i < x.length; i++) {
                        if (!_equals(x[i], y[i]))
                            return false;
                    }
                    rc.pop();
                    break;
                case types.generator:
                // case this.types.generatorFunction:
                    // do we really want to check generator equality other than reference equality?
                    // this could accidentally execute some lazy-loading stuff.

                    // leaning towards no. considering.
                    rc.push(x, y);
                    let a, b;
                    let tempX = x[Symbol.iterator](); // these point to the same object, after the Symbol.iterator get override
                    let tempY = y[Symbol.iterator]();
                    do {
                        a = tempX.next();
                        b = tempY.next();
                        if (!_equals(a.value, b.value))
                            return false;
                    } while (!(a.done || b.done));
                    if (a.done !== b.done)
                        return false;
                    rc.pop();
                    break;
                case types.function: // check for properties set on the function
                case types.object:
                    if (!_compareObject(x, y))
                        return false;
                    break;
                case types.regexp:
                    if (!_equals(x.toString(), y.toString()))
                        return false;
                    if (!_compareObject(x, y))
                        return false;
                    break;
                default:
                    if (x !== y)
                        return false;
                    break;
            }
            return true;
        }

        function _compareObject(x, y) {
            // check for reference equality
            if (x === y)
                return true;
            let xKeys = Object.keys(x);
            let yKeys = Object.keys(y);
            xKeys.sort();
            yKeys.sort();
            if (!_equals(xKeys, yKeys))
                return false;
            rc.push(x, y);
            for (let k in x) {
                if (!_equals(x[k], y[k]))
                    return false;
            }
            rc.pop();
            return true;
        }

        return _equals.call(this, item1, item2);
    }

    isSmashable(...args) {
        if (args.length < 1)
            return false;

        let baseType = this.getType(args[0]);
        if (!(baseType === this.types.array || baseType === this.types.object || baseType === this.types.function))
            return false;

        if (baseType === this.types.function)
            baseType = this.types.object; // allow functions to be smashed onto objects, and vice versa

        for (let i = 1; i < args.length; i++) {
            let targetType = this.getType(args[i]);
            if (targetType === this.types.function)
                targetType = this.types.object; // allow functions to be smashed onto objects, and vice versa

            if (targetType !== baseType)
                return false;
        }
        return true;
    }

    /**
        Internal extend call.
        Performance abstraction to bypass all the argument shenanigans,
        as we know we will only be extending two items at a time internally.

        @param {any} a The item on which to extend the second.
        @param {any} b The item to extend onto the first.
        @returns {any} The reference to the first item.
    */
    // consider moving to static zana
    _extend(a, b) {
        this.forEach(b, function(val, key) {
            if (a[key] !== null && a[key] !== undefined)
                a[key] = b[key];
            else if (this.isSmashable(a[key], b[key])) // find a way to move isSmashable internal
                this._extend(a[key], b[key]);
        });
        return a;
    }

    /**
        Extends the properties on the provided arguments into the original item.
        Any properties on the tail arguments will not overwrite
        any properties on the first argument, and any references will be shallow.

        @param {any} a The target to be extended.
        @param {...any} rest The tail items to extend onto the target.
        @returns {any} A reference to the extended target.
    */
    extend(a, ...rest) {
        rest.forEach(b => {
            if (this.isSmashable(a, b))
                this._extend(a, b);
        });
        return a;
    }

    forEach(item, method, context) {
        let itemType = this.getType(item);
        switch(itemType) {
            case this.types.date:
            case this.types.function:
            case this.types.object:
            case this.types.regexp:
                for (let [key, value] of Object.entries(item)) {
                    if (item.hasOwnProperty(key))
                        method.call(context, value, key, item);
                }
                break;
            case this.types.arguments:
            case this.types.array:
                for (let i = 0; i < item.length; i++)
                    method.call(context, item[i], i, item);
                break;
            case this.types.map: // weakmap is not iterable (?)
                for (let [key, value] of item)
                    method.call(context, value, key, item);
                break;
            case this.types.set: // weakset is not iterable (?)
                for(let value of item) // treat keys and values as equivalent for sets
                    method.call(context, value, value, item);
                break;
            case this.types.iterable: // still need to find a way to handle this
                for(let value of item)
                    method.call(context, value, undefined, item);
                break;
        }
        return item;
    }

    /**
        Internal smash call.
        Performance abstraction to bypass all the argument shenanigans,
        as we know we will only be smashing two items at a time internally.

        @param {any} a The item on which to smash the second.
        @param {any} b The item to smash onto the first.
        @returns {any} The reference to the first item.
    */
    _smash(a, b) {
        this.forEach(b, (val, key) => {
            if (this.isSmashable(a[key], b[key])) // find a way to move isSmashable internal
                this._smash(a[key], b[key]);
            else
                a[key] = this.deepCopy(b[key]);
        });
        return a;
    };

    /**
        Smashes the properties on the provided arguments into the first argument.
        Any properties on the tail arguments will overwrite
        any existing properties on the first argument.

        @param {any} a The target to be smashed.
        @param {...any} rest The tail items to smash onto the target.
        @returns {any} A reference to the smashed target.
    */
    smash(a, ...rest) {
        rest.forEach(b => {
            if (this.isSmashable(a, b)) // find a way to move isSmashable internal
                this._smash(a, b);
        });
        return a;
    };
}

let util = new Util();
export default util;
