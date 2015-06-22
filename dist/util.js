/**
    @license
    Copyright (C) 2015 Dave Lesage
    License: MIT
    See license.txt for full license text.
*/
'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Map = require('babel-runtime/core-js/map')['default'];

var _Set = require('babel-runtime/core-js/set')['default'];

var _Symbol = require('babel-runtime/core-js/symbol')['default'];

var _WeakMap = require('babel-runtime/core-js/weak-map')['default'];

var _WeakSet = require('babel-runtime/core-js/weak-set')['default'];

var _Object$create = require('babel-runtime/core-js/object/create')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _Symbol$iterator = require('babel-runtime/core-js/symbol/iterator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _Object$entries = require('babel-runtime/core-js/object/entries')['default'];

_Object$defineProperty(exports, '__esModule', {
    value: true
});

exports.getType = getType;
exports.setType = setType;
exports.clone = clone;
exports.equals = equals;
exports.forEach = forEach;
exports.extend = extend;
exports.smash = smash;
var toString = Object.prototype.toString;
var log = console.log.bind(console); /* eslint no-unused-vars: 0 */

/**
    Class for containing a max reference counter
    as well as two stacks of references to objects.
    To be used with deepCopy and equals.

    @class Contains two reference stacks as well as a defined max stack depth.
*/

var RecursiveCounter = (function () {
    function RecursiveCounter(maxStackDepth) {
        _classCallCheck(this, RecursiveCounter);

        this.xStack = [];
        this.yStack = [];
        this.count = 0;
        this.maxStackDepth = maxStackDepth;
    }

    _createClass(RecursiveCounter, [{
        key: 'push',
        value: function push(x, y) {
            this.xStack.push(x);
            this.yStack.push(y);
            this.count++;
        }
    }, {
        key: 'pop',
        value: function pop() {
            this.xStack.pop();
            this.yStack.pop();
            this.count--;
        }
    }]);

    return RecursiveCounter;
})();

function getType(val) {
    return toString.call(val);
}

var generatorProto = _regeneratorRuntime.mark(function callee$0$0() {
    return _regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
            case 'end':
                return context$1$0.stop();
        }
    }, callee$0$0, this);
})().prototype;
var generatorFnProto = _regeneratorRuntime.mark(function callee$0$0() {
    return _regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
            case 'end':
                return context$1$0.stop();
        }
    }, callee$0$0, this);
}).prototype; // this isn't specific enough at this point. leaving for now, possible rework when ES6 is stable.
var types = {
    'arguments': getType(arguments) // will this work? babel may be accidentally saving us here. swap to iife if necessary
    , 'array': getType([]),
    'boolean': getType(true)
    // buffer doesn't work, toString.call(Buffer) returns [object Object]
    , 'date': getType(new Date()),
    'generator': getType(generatorProto),
    'generatorFunction': getType(generatorFnProto),
    'function': getType(function () {}),
    'map': getType(new _Map()),
    'null': getType(null),
    'number': getType(0),
    'object': getType({}),
    'regexp': getType(new RegExp()),
    'string': getType(''),
    'set': getType(new _Set()),
    'symbol': getType(_Symbol()),
    'undefined': getType(undefined),
    'weakmap': getType(new _WeakMap()),
    'weakset': getType(new _WeakSet())
};

function setType(key, value) {
    types[key] = getType(value);
}

function _clone(source, rc) {
    if (rc.count > rc.maxStackDepth) throw new Error('Stack depth exceeded: ' + rc.stackMaxDepth + '!');
    switch (getType(source)) {
        // case types.buffer:
        // return _bufferCopy(source, new Buffer(source.length));
        case types.object:
            if (Buffer.isBuffer(source)) // boo, extra checks on each object because of bad buffer toStringTag
                return _bufferCopy(source, new Buffer(source.length));
            return _singleCopy(source, _Object$create(Object.getPrototypeOf(source)), rc);
        case types.array:
            return _singleCopy(source, [], rc);
        case types.regexp:
            return _singleCopy(source, new RegExp(source), rc);
        case types.date:
            return _singleCopy(source, new Date(source), rc);
        case types.set:
            return _setCopy(source, new _Set(), rc);
        // return _singleCopy(source, new Set());
        case types.map:
            return _mapCopy(source, new _Map(), rc); // might not work / need a _mapCopy?
        default:
            // need to handle functions/generators differently? tbd.
            return source;
    }
}

function _instanceCopy(sourceRef, copyRef, rc, copier) {
    var origIndex = rc.xStack.indexOf(sourceRef);
    if (origIndex === -1) {
        rc.push(sourceRef, copyRef);
        forEach(sourceRef, function (value, key) {
            copier(copyRef, value, key);
        });
        rc.pop();
        return copyRef;
    } else {
        return rc.yStack[origIndex];
    }
}

function _setCopy(sourceRef, copyRef, rc) {
    return _instanceCopy(sourceRef, copyRef, rc, function (set, val) {
        set.add(_clone(val, rc));
    });
}

function _mapCopy(sourceRef, copyRef, rc) {
    return _instanceCopy(sourceRef, copyRef, rc, function (map, val, key) {
        map.set(key, _clone(val, rc));
    });
}

function _singleCopy(sourceRef, copyRef, rc) {
    return _instanceCopy(sourceRef, copyRef, rc, function (item, val, key) {
        copyRef[key] = _clone(val, rc);
    });
}

function _bufferCopy(sourceRef, copyRef, rc) {
    sourceRef.copy(copyRef);
    return copyRef;
}

function clone(origSource) {
    var origIndex = -1;
    var rc = new RecursiveCounter(1000);
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
    if (rc.count > rc.maxStackDepth) throw new Error('Stack depth exceeded: ' + rc.maxStackDepth + '!');
    // check for reference and primitive equality
    if (x === y) return true;
    // check for type equality
    var xType = getType(x);
    var yType = getType(y);
    if (xType !== yType) return false;
    // check for circular references -- may get a perf improvement by only using this when necessary, instead of at the top
    var xIndex = rc.xStack.lastIndexOf(x);
    var yIndex = rc.yStack.lastIndexOf(y);
    if (xIndex !== -1) {
        if (yIndex === xIndex) return true;
    }
    // check for inequalities
    switch (xType) {
        case types.number:
            if (x !== y) {
                if (isNaN(x) && isNaN(y)) return true;
                return false;
            }
            break;
        case types.date:
            if (x.getTime() !== y.getTime()) return false;
            // check for extra properties stored on the Date object
            if (!_compareObject(x, y, rc)) return false;
            break;
        case types.array:
            if (x.length !== y.length) return false;
            rc.push(x, y);
            for (var i = 0; i < x.length; i++) {
                if (!_equals(x[i], y[i], rc)) return false;
            }
            rc.pop();
            break;
        case types.map:
            if (x.size !== y.size) return false;
            var xMapArr = [].concat(_toConsumableArray(x)); // these need to be sorted by key before comparison
            var yMapArr = [].concat(_toConsumableArray(y)); // order shouldn't matter, as long as they are the same
            xMapArr.sort(function (a, b) {
                return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
            });
            yMapArr.sort(function (a, b) {
                return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
            });
            if (!_equals(xMapArr, yMapArr, rc)) return false;
            break;
        case types.set:
            if (x.size !== y.size) return false;
            var xArr = [].concat(_toConsumableArray(x)); // consider doing a comparison without converting to array?
            var yArr = [].concat(_toConsumableArray(y)); // converting to array may still be the fastest option.
            if (!_equals(xArr, yArr, rc)) return false;
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
        case types['function']:
            if (!_compareObject(x, y, rc)) // check for properties on function
                return false;
            if (x !== y) return false; // other than that, just use reference equality for now
            break;
        case types.object:
            if (Buffer.isBuffer(x)) {
                if (!Buffer.isBuffer(y)) return false;
                if (x.length !== y.length) return false;
                if (!x.equals(y)) return false;
            } else {
                if (!_compareObject(x, y, rc)) return false;
            }
            break;
        case types.regexp:
            if (!_equals(x.toString(), y.toString(), rc)) return false;
            if (!_compareObject(x, y, rc)) return false;
            break;
        case types.string:
            if (x !== y) return false;
            break;
        case types.symbol:
            if (x !== y) return false;
            break;
        default:
            // safe to assume that if we hit default, we want to compare object (ie - unknown class type?)
            if (!_compareObject(x, y, rc)) return false;
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
function _compareObject(x, y, rc) {
    if (x === y) return true;
    if (x.constructor && y.constructor && x.constructor !== y.constructor) return false;
    var xKeys = _Object$keys(x);
    var yKeys = _Object$keys(y);
    xKeys.sort();
    yKeys.sort();
    if (!_equals(xKeys, yKeys, rc)) return false;
    rc.push(x, y);
    for (var k in x) {
        if (!_equals(x[k], y[k], rc)) return false;
    }
    rc.pop();
    return true;
}

function equals(item1, item2) {
    var rc = new RecursiveCounter(1000);
    return _equals.call(null, item1, item2, rc);
}

/**
    Generic interface for looping over an iterable item,
    and executing a provided method for each value.

    @param {any} item The item over which to iterate.
    @param {Function} method The callback to execute for each iterated value.
    @param {any} context The optional context to pass to each callback.
    @returns {any} A reference to the original item.
*/

function forEach(item, method, context) {
    var type = getType(item);
    switch (type) {
        case types.date:
        case types['function']:
        case types.object:
        case types.regexp:
            if (!item[_Symbol$iterator]) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = _getIterator(_Object$entries(item)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var _step$value = _slicedToArray(_step.value, 2);

                        var key = _step$value[0];
                        var value = _step$value[1];

                        if (item.hasOwnProperty(key)) method.call(context, value, key, item);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator['return']) {
                            _iterator['return']();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            } else {
                // note: generator is being mistakenly counted as an object
                // so we need to take care of it here. ideally,
                // we would be able to use the default for performance reasons,
                // but that's not working with getType as it is defined
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = _getIterator(item), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var value = _step2.value;

                        // do we want to check if value is array, and spread it across value/key?
                        method.call(context, value, undefined, item);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                            _iterator2['return']();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }
            break;
        case types.arguments:
        case types.array:
            for (var i = 0; i < item.length; i++) {
                method.call(context, item[i], i, item);
            }break;
        case types.map:
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = _getIterator(item), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var _step3$value = _slicedToArray(_step3.value, 2);

                    var key = _step3$value[0];
                    var value = _step3$value[1];

                    method.call(context, value, key, item);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                        _iterator3['return']();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            break;
        case types.set:
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = _getIterator(item), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var value = _step4.value;
                    // treat keys and values as equivalent for sets
                    method.call(context, value, value, item);
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4['return']) {
                        _iterator4['return']();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            break;
        default:
            // if unknown type, then check for Symbol.iterator
            if (item[_Symbol$iterator]) {
                var _iteratorNormalCompletion5 = true;
                var _didIteratorError5 = false;
                var _iteratorError5 = undefined;

                try {
                    for (var _iterator5 = _getIterator(item), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                        var value = _step5.value;

                        method.call(context, value, undefined, item);
                    }
                } catch (err) {
                    _didIteratorError5 = true;
                    _iteratorError5 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion5 && _iterator5['return']) {
                            _iterator5['return']();
                        }
                    } finally {
                        if (_didIteratorError5) {
                            throw _iteratorError5;
                        }
                    }
                }
            }
            break;
    }
    return item;
}

/**
    Internal method determining whether or not the provided arguments
    can be smashed or extended together, based on types.

    @param x The first item to compare.
    @param y The second item to compare.
    @param rc The running counter for comparing circular references.
    @returns {boolean} An indication as to whether or not x and y were equal.
*/
function isSmashable() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    // this is a fairly expensive call. find a way to optimize further?
    if (args.length < 1) return false;

    var baseType = getType(args[0]);
    if (!(baseType === types.array || baseType === types.object || baseType === types.set || baseType === types.map || baseType === types['function'])) {
        return false;
    }

    if (baseType === types['function']) baseType = types.object; // allow functions to be smashed onto objects, and vice versa

    for (var i = 1; i < args.length; i++) {
        var targetType = getType(args[i]);
        if (targetType === types['function']) targetType = types.object; // allow functions to be smashed onto objects, and vice versa

        if (targetType !== baseType) return false;
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
    forEach(b, function (bVal, key) {
        // will most likely need to be altered to accomodate maps and sets
        // let type = isSmashable(a[key], b[key]);
        var type = getType(a);
        switch (type) {
            case types.array:
            case types.object:
                if (a[key] === undefined || a[key] === null) a[key] = b[key];else if (isSmashable(a[key], b[key])) _extend(a[key], b[key]);
                break;
            case types.set:
                if (!a.has(bVal)) a.add(bVal);
                break;
            case types.map:
                if (!a.has(key)) a.set(key, bVal);else {
                    var aVal = a.get(key);
                    if (aVal === undefined || aVal === null) a.set(key, bVal);else if (isSmashable(aVal, bVal)) _extend(aVal, bVal);
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

function extend(a) {
    for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        rest[_key2 - 1] = arguments[_key2];
    }

    rest.forEach(function (b) {
        if (isSmashable(a, b)) _extend(a, b);
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
    var _this = this;

    this.forEach(b, function (val, key) {
        if (_this.isSmashable(a[key], b[key])) // find a way to move isSmashable internal
            _this._smash(a[key], b[key]);else a[key] = _this.deepCopy(b[key]);
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

function smash(a) {
    var _this2 = this;

    for (var _len3 = arguments.length, rest = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        rest[_key3 - 1] = arguments[_key3];
    }

    rest.forEach(function (b) {
        if (_this2.isSmashable(a, b)) // find a way to move isSmashable internal
            _this2._smash(a, b);
    });
    return a;
}

exports['default'] = {
    clone: clone,
    deepCopy: clone,
    equal: equals,
    equals: equals,
    extend: extend,
    forEach: forEach,
    getType: getType,
    // smash,
    types: types
};