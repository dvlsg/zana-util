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

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Map = require('babel-runtime/core-js/map')['default'];

var _Set = require('babel-runtime/core-js/set')['default'];

var _WeakMap = require('babel-runtime/core-js/weak-map')['default'];

var _WeakSet = require('babel-runtime/core-js/weak-set')['default'];

var _Object$create = require('babel-runtime/core-js/object/create')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _Object$entries = require('babel-runtime/core-js/object/entries')['default'];

_Object$defineProperty(exports, '__esModule', {
    value: true
});

var toString = Object.prototype.toString;

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

var Util = (function () {
    function Util() {
        _classCallCheck(this, Util);

        var generatorProto = _regeneratorRuntime.mark(function callee$2$0() {
            return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                    case 0:
                    case 'end':
                        return context$3$0.stop();
                }
            }, callee$2$0, this);
        })().prototype;
        var generatorFnProto = _regeneratorRuntime.mark(function callee$2$0() {
            return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                    case 0:
                    case 'end':
                        return context$3$0.stop();
                }
            }, callee$2$0, this);
        }).prototype; // this isn't specific enough at this point. leaving for now, possible rework when ES6 is stable.

        this.types = {
            'arguments': this.getType(arguments),
            'array': this.getType([]),
            'boolean': this.getType(true),
            'date': this.getType(new Date()),
            'generator': this.getType(generatorProto),
            'generatorFunction': this.getType(generatorFnProto),
            'function': this.getType(function () {}),
            'map': this.getType(new _Map()),
            'null': this.getType(null),
            'number': this.getType(0),
            'object': this.getType({}),
            'regexp': this.getType(new RegExp()),
            'string': this.getType(''),
            'set': this.getType(new _Set()),
            'undefined': this.getType(undefined),
            'weakmap': this.getType(new _WeakMap()),
            'weakset': this.getType(new _WeakSet())
        };
    }

    _createClass(Util, [{
        key: 'getType',
        value: function getType(value) {
            // ditch the regexp for performance
            // this will use @@toStringTag in the future
            return toString.call(value); // just use this.types['type'] for readability.
        }
    }, {
        key: 'setType',
        value: function setType(key, value) {
            this.types[key] = this.getType(value);
        }
    }, {
        key: 'clone',
        value: function clone(src) {
            return this.deepCopy(src);
        }
    }, {
        key: 'deepCopy',
        value: function deepCopy(origSource) {
            var origIndex = -1;
            var rc = new RecursiveCounter(1000);

            function _deepCopy(source) {
                if (rc.count > rc.maxStackDepth) throw new Error('Stack depth exceeded: ' + rc.stackMaxDepth + '!');
                switch (this.getType(source)) {
                    case this.types.object:
                        return _singleCopy(source, _Object$create(Object.getPrototypeOf(source)));
                    case this.types.array:
                        return _singleCopy(source, []);
                    case this.types.regexp:
                        return _singleCopy(source, new RegExp(source));
                    case this.types.date:
                        return _singleCopy(source, new Date(source.toString()));
                    case this.types.set:
                        return _singleCopy(source, new _Set());
                    case this.types.map:
                        return _singleCopy(source, new _Map()); // might not work / need a _mapCopy?
                    default:
                        // need to handle functions/generators differently? tbd.
                        return source;
                }
            }

            // move function external for performance? really should.
            function _singleCopy(sourceRef, copyRef) {
                origIndex = rc.xStack.indexOf(sourceRef);
                if (origIndex === -1) {
                    rc.push(sourceRef, copyRef);
                    this.forEach(sourceRef, function (value, key) {
                        copyRef[key] = _deepCopy(value);
                    });
                    rc.pop();
                    return copyRef;
                } else {
                    // source item has already been copied
                    // return the reference to the copied item
                    return rc.yStack[origIndex];
                }
            }
            return _deepCopy(origSource);
        }
    }, {
        key: 'equals',
        value: function equals(item1, item2) {
            var rc = new RecursiveCounter(1000);
            var getType = this.getType;
            var types = this.types;

            function _equals(x, y) {
                if (rc.count > rc.maxStackDepth) throw new Error('Stack depth exceeded: ' + rc.maxStackDepth + '!');
                // check for reference and primitive equality
                if (x === y) return true;
                // check for type equality
                var xType = getType(x);
                var yType = getType(y);
                if (xType !== yType) return false;
                // check for circular references
                var xIndex = rc.xStack.lastIndexOf(x);
                var yIndex = rc.yStack.lastIndexOf(y);
                if (xIndex !== -1) {
                    if (yIndex !== -1) {
                        // don't care about object reference equality
                        // when checking for object equality
                        return true;
                        // if we do care about object reference equality,
                        // then a strict comparison of stack location of objects
                        // needs to be executed and returned
                    }
                }
                // check for inequalities
                switch (xType) {
                    case types.date:
                        if (x.getTime() !== y.getTime()) return false;
                        // check for extra properties stored on the Date object
                        if (!_compareObject(x, y)) return false;
                        break;
                    case types.array:
                        if (x.length !== y.length) return false;
                        rc.push(x, y);
                        for (var i = 0; i < x.length; i++) {
                            if (!_equals(x[i], y[i])) return false;
                        }
                        rc.pop();
                        break;
                    case types.generator:
                        // case this.types.generatorFunction:
                        // do we really want to check generator equality other than reference equality?
                        // this could accidentally execute some lazy-loading stuff.

                        // leaning towards no. considering.
                        rc.push(x, y);
                        var a = undefined,
                            b = undefined;
                        var tempX = _getIterator(x); // these point to the same object, after the Symbol.iterator get override
                        var tempY = _getIterator(y);
                        do {
                            a = tempX.next();
                            b = tempY.next();
                            if (!_equals(a.value, b.value)) return false;
                        } while (!(a.done || b.done));
                        if (a.done !== b.done) return false;
                        rc.pop();
                        break;
                    case types['function']: // check for properties set on the function
                    case types.object:
                    case types.regexp:
                        if (!_compareObject(x, y)) return false;
                        break;
                    default:
                        if (x !== y) return false;
                        break;
                }
                return true;
            }

            function _compareObject(x, y) {
                // check for reference equality
                if (x === y) return true;
                var xKeys = _Object$keys(x);
                var yKeys = _Object$keys(y);
                xKeys.sort();
                yKeys.sort();
                if (!_equals(xKeys, yKeys)) return false;
                rc.push(x, y);
                for (var k in x) {
                    if (!_equals(x[k], y[k])) return false;
                }
                rc.pop();
                return true;
            }

            return _equals.call(this, item1, item2);
        }
    }, {
        key: 'isSmashable',
        value: function isSmashable() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            if (args.length < 1) return false;

            var baseType = this.getType(args[0]);
            if (!(baseType === this.types.array || baseType === this.types.object || baseType === this.types['function'])) return false;

            if (baseType === this.types['function']) baseType = this.types.object; // allow functions to be smashed onto objects, and vice versa

            for (var i = 1; i < args.length; i++) {
                var targetType = this.getType(args[i]);
                if (targetType === this.types['function']) targetType = this.types.object; // allow functions to be smashed onto objects, and vice versa

                if (targetType !== baseType) return false;
            }
            return true;
        }
    }, {
        key: '_extend',

        /**
            Internal extend call.
            Performance abstraction to bypass all the argument shenanigans,
            as we know we will only be extending two items at a time internally.
              @param {any} a The item on which to extend the second.
            @param {any} b The item to extend onto the first.
            @returns {any} The reference to the first item.
        */
        // consider moving to static zana
        value: function _extend(a, b) {
            this.forEach(b, function (val, key) {
                if (a[key] !== null && a[key] !== undefined) a[key] = b[key];else if (this.isSmashable(a[key], b[key])) // find a way to move isSmashable internal
                    this._extend(a[key], b[key]);
            });
            return a;
        }
    }, {
        key: 'extend',

        /**
            Extends the properties on the provided arguments into the original item.
            Any properties on the tail arguments will not overwrite
            any properties on the first argument, and any references will be shallow.
              @param {any} a The target to be extended.
            @param {...any} rest The tail items to extend onto the target.
            @returns {any} A reference to the extended target.
        */
        value: function extend(a) {
            var _this = this;

            for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                rest[_key2 - 1] = arguments[_key2];
            }

            rest.forEach(function (b) {
                if (_this.isSmashable(a, b)) _this._extend(a, b);
            });
            return a;
        }
    }, {
        key: 'forEach',
        value: function forEach(item, method, context) {
            var itemType = this.getType(item);
            switch (itemType) {
                case this.types.date:
                case this.types['function']:
                case this.types.object:
                case this.types.regexp:
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

                    break;
                case this.types.arguments:
                case this.types.array:
                    for (var i = 0; i < item.length; i++) {
                        method.call(context, item[i], i, item);
                    }break;
                case this.types.map:
                    // weakmap is not iterable (?)
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = _getIterator(item), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var _step2$value = _slicedToArray(_step2.value, 2);

                            var key = _step2$value[0];
                            var value = _step2$value[1];

                            method.call(context, value, key, item);
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

                    break;
                case this.types.set:
                    // weakset is not iterable (?)
                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = _getIterator(item), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var value = _step3.value;
                            // treat keys and values as equivalent for sets
                            method.call(context, value, value, item);
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
                case this.types.iterable:
                    // still need to find a way to handle this
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = _getIterator(item), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var value = _step4.value;

                            method.call(context, value, undefined, item);
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
            }
            return item;
        }
    }, {
        key: '_smash',

        /**
            Internal smash call.
            Performance abstraction to bypass all the argument shenanigans,
            as we know we will only be smashing two items at a time internally.
              @param {any} a The item on which to smash the second.
            @param {any} b The item to smash onto the first.
            @returns {any} The reference to the first item.
        */
        value: function _smash(a, b) {
            var _this2 = this;

            this.forEach(b, function (val, key) {
                if (_this2.isSmashable(a[key], b[key])) // find a way to move isSmashable internal
                    _this2._smash(a[key], b[key]);else a[key] = _this2.deepCopy(b[key]);
            });
            return a;
        }
    }, {
        key: 'smash',

        /**
            Smashes the properties on the provided arguments into the first argument.
            Any properties on the tail arguments will overwrite
            any existing properties on the first argument.
              @param {any} a The target to be smashed.
            @param {...any} rest The tail items to smash onto the target.
            @returns {any} A reference to the smashed target.
        */
        value: function smash(a) {
            var _this3 = this;

            for (var _len3 = arguments.length, rest = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                rest[_key3 - 1] = arguments[_key3];
            }

            rest.forEach(function (b) {
                if (_this3.isSmashable(a, b)) // find a way to move isSmashable internal
                    _this3._smash(a, b);
            });
            return a;
        }
    }]);

    return Util;
})();

exports.Util = Util;

var util = new Util();
exports['default'] = util;