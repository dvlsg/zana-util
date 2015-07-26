/**
    @license
    Copyright (C) 2015 Dave Lesage
    License: MIT
    See license.txt for full license text.
*/
'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Map = require('babel-runtime/core-js/map')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _Set = require('babel-runtime/core-js/set')['default'];

var _Symbol = require('babel-runtime/core-js/symbol')['default'];

var _WeakMap = require('babel-runtime/core-js/weak-map')['default'];

var _WeakSet = require('babel-runtime/core-js/weak-set')['default'];

var _Object$create = require('babel-runtime/core-js/object/create')['default'];

var _Reflect$getPrototypeOf = require('babel-runtime/core-js/reflect/get-prototype-of')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _Object$entries = require('babel-runtime/core-js/object/entries')['default'];

var _Object$getOwnPropertySymbols = require('babel-runtime/core-js/object/get-own-property-symbols')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _Symbol$iterator = require('babel-runtime/core-js/symbol/iterator')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.getType = getType;
exports.setType = setType;
exports.clone = clone;
exports.equals = equals;
exports.each = each;
exports.forEach = forEach;
exports.inspect = inspect;
exports.extend = extend;
exports.smash = smash;
var marked0$0 = [each].map(_regeneratorRuntime.mark);
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
    'error': getType(new Error()),
    'generator': getType(generatorProto),
    'generatorFunction': getType(generatorFnProto),
    'function': getType(function () {}),
    'map': getType(new _Map()),
    'null': getType(null),
    'number': getType(0),
    'object': getType({}),
    'promise': getType(new _Promise(function () {})),
    'regexp': getType(new RegExp()),
    'string': getType(''),
    'set': getType(new _Set()),
    'symbol': getType(_Symbol()),
    'undefined': getType(undefined),
    'weakmap': getType(new _WeakMap()),
    'weakset': getType(new _WeakSet())
};

exports.types = types;

function setType(key, value) {
    types[key] = getType(value);
}

function _clone(source, rc) {
    if (rc.count > rc.maxStackDepth) throw new Error('Stack depth exceeded: ' + rc.stackMaxDepth + '!');
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
            return _setCopy(source, new _Set(), rc);
        case types.map:
            return _mapCopy(source, new _Map(), rc);
        case types.boolean:
        case types['null']:
        case types.number:
        case types.string:
        case types.undefined:
            return source;
        case types['function']:
            return source;
        case types.object:
        default:
            if (Buffer.isBuffer(source)) // boo, extra checks on each object because of bad buffer toStringTag
                return _bufferCopy(source, new Buffer(source.length));else return _objectCopy(source, _Object$create(_Reflect$getPrototypeOf(source)), rc);
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
    } else return rc.yStack[origIndex];
}

function _objectCopy(sourceRef, copyRef, rc) {
    var origIndex = rc.xStack.indexOf(sourceRef);
    if (origIndex === -1) {
        rc.push(sourceRef, copyRef);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = _getIterator(_Object$entries(sourceRef)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var _step$value = _slicedToArray(_step.value, 2);

                var key = _step$value[0];
                var val = _step$value[1];

                copyRef[key] = _clone(val, rc);
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

        var symbols = _Object$getOwnPropertySymbols(sourceRef);
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = _getIterator(symbols), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var symbol = _step2.value;

                copyRef[symbol] = _clone(sourceRef[symbol], rc);
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

        rc.pop();
        return copyRef;
    } else return rc.yStack[origIndex];
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
        case types.boolean:
        case types.string:
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

/**
    Compares the equality of two items.

    @param x The first item to compare.
    @param y The second item to compare.
    @returns {boolean} An indication as to whether or not x and y were equal.
*/

function equals(x, y) {
    var rc = new RecursiveCounter(1000);
    return _equals.call(null, x, y, rc);
}

/**
    Generic interface for looping over an iterable,
    yielding a key value pair for each item.

    @param {any} item The item over which to iterate.
    @returns {any} A reference to the original item.
*/

function each(item) {
    var type, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, value, i, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5;

    return _regeneratorRuntime.wrap(function each$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                type = getType(item);
                context$1$0.t0 = type;
                context$1$0.next = context$1$0.t0 === types.date ? 4 : context$1$0.t0 === types['function'] ? 4 : context$1$0.t0 === types.object ? 4 : context$1$0.t0 === types.regexp ? 4 : context$1$0.t0 === types.arguments ? 35 : context$1$0.t0 === types.array ? 35 : context$1$0.t0 === types.map ? 43 : context$1$0.t0 === types.set ? 45 : 72;
                break;

            case 4:
                if (item[_Symbol$iterator]) {
                    context$1$0.next = 8;
                    break;
                }

                return context$1$0.delegateYield(_Object$entries(item), 't1', 6);

            case 6:
                context$1$0.next = 34;
                break;

            case 8:
                _iteratorNormalCompletion3 = true;
                _didIteratorError3 = false;
                _iteratorError3 = undefined;
                context$1$0.prev = 11;
                _iterator3 = _getIterator(item);

            case 13:
                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                    context$1$0.next = 20;
                    break;
                }

                value = _step3.value;
                context$1$0.next = 17;
                return [undefined, value];

            case 17:
                _iteratorNormalCompletion3 = true;
                context$1$0.next = 13;
                break;

            case 20:
                context$1$0.next = 26;
                break;

            case 22:
                context$1$0.prev = 22;
                context$1$0.t2 = context$1$0['catch'](11);
                _didIteratorError3 = true;
                _iteratorError3 = context$1$0.t2;

            case 26:
                context$1$0.prev = 26;
                context$1$0.prev = 27;

                if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                    _iterator3['return']();
                }

            case 29:
                context$1$0.prev = 29;

                if (!_didIteratorError3) {
                    context$1$0.next = 32;
                    break;
                }

                throw _iteratorError3;

            case 32:
                return context$1$0.finish(29);

            case 33:
                return context$1$0.finish(26);

            case 34:
                return context$1$0.abrupt('break', 100);

            case 35:
                i = 0;

            case 36:
                if (!(i < item.length)) {
                    context$1$0.next = 42;
                    break;
                }

                context$1$0.next = 39;
                return [i, item[i]];

            case 39:
                i++;
                context$1$0.next = 36;
                break;

            case 42:
                return context$1$0.abrupt('break', 100);

            case 43:
                return context$1$0.delegateYield(item, 't3', 44);

            case 44:
                return context$1$0.abrupt('break', 100);

            case 45:
                _iteratorNormalCompletion4 = true;
                _didIteratorError4 = false;
                _iteratorError4 = undefined;
                context$1$0.prev = 48;
                _iterator4 = _getIterator(item);

            case 50:
                if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                    context$1$0.next = 57;
                    break;
                }

                value = _step4.value;
                context$1$0.next = 54;
                return [value, value];

            case 54:
                _iteratorNormalCompletion4 = true;
                context$1$0.next = 50;
                break;

            case 57:
                context$1$0.next = 63;
                break;

            case 59:
                context$1$0.prev = 59;
                context$1$0.t4 = context$1$0['catch'](48);
                _didIteratorError4 = true;
                _iteratorError4 = context$1$0.t4;

            case 63:
                context$1$0.prev = 63;
                context$1$0.prev = 64;

                if (!_iteratorNormalCompletion4 && _iterator4['return']) {
                    _iterator4['return']();
                }

            case 66:
                context$1$0.prev = 66;

                if (!_didIteratorError4) {
                    context$1$0.next = 69;
                    break;
                }

                throw _iteratorError4;

            case 69:
                return context$1$0.finish(66);

            case 70:
                return context$1$0.finish(63);

            case 71:
                return context$1$0.abrupt('break', 100);

            case 72:
                if (!item[_Symbol$iterator]) {
                    context$1$0.next = 99;
                    break;
                }

                _iteratorNormalCompletion5 = true;
                _didIteratorError5 = false;
                _iteratorError5 = undefined;
                context$1$0.prev = 76;
                _iterator5 = _getIterator(item);

            case 78:
                if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
                    context$1$0.next = 85;
                    break;
                }

                value = _step5.value;
                context$1$0.next = 82;
                return [undefined, value];

            case 82:
                _iteratorNormalCompletion5 = true;
                context$1$0.next = 78;
                break;

            case 85:
                context$1$0.next = 91;
                break;

            case 87:
                context$1$0.prev = 87;
                context$1$0.t5 = context$1$0['catch'](76);
                _didIteratorError5 = true;
                _iteratorError5 = context$1$0.t5;

            case 91:
                context$1$0.prev = 91;
                context$1$0.prev = 92;

                if (!_iteratorNormalCompletion5 && _iterator5['return']) {
                    _iterator5['return']();
                }

            case 94:
                context$1$0.prev = 94;

                if (!_didIteratorError5) {
                    context$1$0.next = 97;
                    break;
                }

                throw _iteratorError5;

            case 97:
                return context$1$0.finish(94);

            case 98:
                return context$1$0.finish(91);

            case 99:
                return context$1$0.abrupt('break', 100);

            case 100:
                return context$1$0.abrupt('return', item);

            case 101:
            case 'end':
                return context$1$0.stop();
        }
    }, marked0$0[0], this, [[11, 22, 26, 34], [27,, 29, 33], [48, 59, 63, 71], [64,, 66, 70], [76, 87, 91, 99], [92,, 94, 98]]);
}

/**
    Generic interface for looping over an iterable,
    and executing a provided method for each item.

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
                var _iteratorNormalCompletion6 = true;
                var _didIteratorError6 = false;
                var _iteratorError6 = undefined;

                try {
                    for (var _iterator6 = _getIterator(_Object$entries(item)), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                        var _step6$value = _slicedToArray(_step6.value, 2);

                        var key = _step6$value[0];
                        var value = _step6$value[1];

                        if (item.hasOwnProperty(key)) method.call(context, value, key, item);
                    }
                } catch (err) {
                    _didIteratorError6 = true;
                    _iteratorError6 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion6 && _iterator6['return']) {
                            _iterator6['return']();
                        }
                    } finally {
                        if (_didIteratorError6) {
                            throw _iteratorError6;
                        }
                    }
                }
            } else {
                // shenanigans
                var _iteratorNormalCompletion7 = true;
                var _didIteratorError7 = false;
                var _iteratorError7 = undefined;

                try {
                    for (var _iterator7 = _getIterator(item), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                        var value = _step7.value;

                        // do we want to check if value is array, and spread it across value/key?
                        method.call(context, value, undefined, item);
                    }
                } catch (err) {
                    _didIteratorError7 = true;
                    _iteratorError7 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion7 && _iterator7['return']) {
                            _iterator7['return']();
                        }
                    } finally {
                        if (_didIteratorError7) {
                            throw _iteratorError7;
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
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = _getIterator(item), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var _step8$value = _slicedToArray(_step8.value, 2);

                    var key = _step8$value[0];
                    var value = _step8$value[1];

                    method.call(context, value, key, item);
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8['return']) {
                        _iterator8['return']();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }

            break;
        case types.set:
            var _iteratorNormalCompletion9 = true;
            var _didIteratorError9 = false;
            var _iteratorError9 = undefined;

            try {
                for (var _iterator9 = _getIterator(item), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    var value = _step9.value;
                    // treat keys and values as equivalent for sets
                    method.call(context, value, value, item);
                }
            } catch (err) {
                _didIteratorError9 = true;
                _iteratorError9 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion9 && _iterator9['return']) {
                        _iterator9['return']();
                    }
                } finally {
                    if (_didIteratorError9) {
                        throw _iteratorError9;
                    }
                }
            }

            break;
        default:
            // if unknown type, then check for Symbol.iterator
            if (item[_Symbol$iterator]) {
                var _iteratorNormalCompletion10 = true;
                var _didIteratorError10 = false;
                var _iteratorError10 = undefined;

                try {
                    for (var _iterator10 = _getIterator(item), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                        var value = _step10.value;

                        method.call(context, value, undefined, item);
                    }
                } catch (err) {
                    _didIteratorError10 = true;
                    _iteratorError10 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion10 && _iterator10['return']) {
                            _iterator10['return']();
                        }
                    } finally {
                        if (_didIteratorError10) {
                            throw _iteratorError10;
                        }
                    }
                }
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
function _inspect(_x6) {
    var _arguments = arguments;
    var _again = true;

    _function: while (_again) {
        var inspecting = _x6;
        inspection = seen = times = indent = type = name = inspected = _iteratorNormalCompletion11 = _didIteratorError11 = _iteratorError11 = length = objInspected = _iteratorNormalCompletion12 = _didIteratorError12 = _iteratorError12 = objLength = undefined;
        var inspection = _arguments[1] === undefined ? '' : _arguments[1];
        var seen = _arguments[2] === undefined ? [] : _arguments[2];
        var times = _arguments[3] === undefined ? 0 : _arguments[3];
        _again = false;
        var indent = _arguments[4] === undefined ? 2 : _arguments[4];

        var type = getType(inspecting);
        switch (type) {
            case types.undefined:
                return 'undefined';
            case types['null']:
                return 'null';
            case types['function']:
                var name = inspecting.name ? ': ' + inspecting.name : '';
                return '[Function' + name + ']';
            case types.string:
                return '\'' + inspecting + '\'';
            case types.array:
                if (seen.indexOf(inspecting) > -1) return '[Circular]';
                times++;
                inspection = '[ ';
                seen.push(inspecting);
                var inspected = [];
                var _iteratorNormalCompletion11 = true;
                var _didIteratorError11 = false;
                var _iteratorError11 = undefined;

                try {
                    for (var _iterator11 = _getIterator(inspecting), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                        var val = _step11.value;

                        inspected.push(_inspect(val, inspection, seen, times));
                    }
                } catch (err) {
                    _didIteratorError11 = true;
                    _iteratorError11 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion11 && _iterator11['return']) {
                            _iterator11['return']();
                        }
                    } finally {
                        if (_didIteratorError11) {
                            throw _iteratorError11;
                        }
                    }
                }

                if (inspected.length === 0) return '[]';
                var length = inspected.reduce(function (prev, cur) {
                    return prev + cur.length;
                }, 0);
                if (length > 60) inspection = '[ ' + inspected.join(',\n' + ' '.repeat(times * indent)) + ' ]';else inspection = '[ ' + inspected.join(', ') + ' ]';
                return inspection;
            case types.object:
                if (seen.indexOf(inspecting) > -1) return '[Circular]';
                times++;
                inspection = '{ ';
                seen.push(inspecting);
                var objInspected = [];
                if (inspecting instanceof Error) // to match nodejs inspect methods
                    objInspected.push('[' + inspecting.toString() + ']');
                var _iteratorNormalCompletion12 = true;
                var _didIteratorError12 = false;
                var _iteratorError12 = undefined;

                try {
                    for (var _iterator12 = _getIterator(each(inspecting)), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                        var _step12$value = _slicedToArray(_step12.value, 2);

                        var key = _step12$value[0];
                        var val = _step12$value[1];

                        objInspected.push(key + ': ' + _inspect(val, inspection, seen, times));
                    }
                } catch (err) {
                    _didIteratorError12 = true;
                    _iteratorError12 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion12 && _iterator12['return']) {
                            _iterator12['return']();
                        }
                    } finally {
                        if (_didIteratorError12) {
                            throw _iteratorError12;
                        }
                    }
                }

                if (objInspected.length === 0) return '{}';
                var objLength = objInspected.reduce(function (prev, cur) {
                    return prev + cur.length;
                }, 0);
                if (objLength > 60) inspection = '{\n' + ' '.repeat(times * indent) + objInspected.join(',\n' + ' '.repeat(times * indent)) + ' }';else inspection = '{ ' + objInspected.join(', ') + ' }';
                return inspection;
            case types.map:
            case types.set:
                _arguments = [_x6 = [].concat(_toConsumableArray(inspecting))];
                _again = true;
                continue _function;

            case types.number:
            case types.boolean:
            default:
                if (inspecting instanceof Error) return '[' + inspecting.toString() + ']';
                return inspecting.toString();
        }
    }
}

/*
    Method for inspecting a value
    and providing a string
    representation that value.

    (params TBD)
*/

function inspect(val) {
    var indent = arguments[1] === undefined ? 2 : arguments[1];

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

var deepCopy = clone;
exports.deepCopy = deepCopy;
var equal = equals;
exports.equal = equal;
var type = getType;
exports.type = type;
var typeOf = getType;

exports.typeOf = typeOf;
exports['default'] = {
    clone: clone,
    deepCopy: clone,
    each: each,
    equal: equals,
    equals: equals,
    extend: extend,
    forEach: forEach,
    getType: getType,
    inspect: inspect,
    // smash,
    type: getType,
    typeOf: getType,
    types: types
};
// treat keys and values as equivalent for sets

// if unknown type, then check for Symbol.iterator