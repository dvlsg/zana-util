import util from '../dist/util.js';
import assert from 'assert';
let log = console.log.bind(console);

describe('Util', () => {

    describe('clone', () => {

        it('should make clones of primitives', () => {
            assert.equal(undefined, util.clone(undefined));
            assert.equal(null, util.clone(null));
            assert.equal(true, util.clone(true));
            assert.equal(1, util.clone(1));
            assert.equal('string', util.clone('string'));
        });

        it('should make clones of arrays', () => {
            let a1 = [];
            let c1 = util.clone(a1);
            assert.notStrictEqual(a1, c2);
            assert.deepEqual(a1, c1);

            let a2 = [1, 2, 3, 4, 5];
            let c2 = util.clone(a2);
            assert.notStrictEqual(a2, c2);
            assert.deepEqual(a2, c2);

            let a3 = [
                  {id: 1, name: 'obj1', data: [1, 1, 1], date: new Date()}
                , {id: 2, name: 'obj2', data: [2, 2, 2], date: new Date()}
                , {id: 3, name: 'obj3', data: [3, 3, 3], date: new Date()}
            ];
            let c3 = util.clone(a3);
            assert.notStrictEqual(a3, c3);
            assert.notStrictEqual(a3[0], c3[0]);
            assert.notStrictEqual(a3[1], c3[1]);
            assert.notStrictEqual(a3[2], c3[2]);
            assert.deepEqual(a3[0], c3[0]);
            assert.deepEqual(a3[1], c3[1]);
            assert.deepEqual(a3[2], c3[2]);
            assert.deepEqual(a3, c3);
        });

        it('should make clones of objects', () => {
            let o1 = {};
            let c1 = util.clone(o1);
            assert.notStrictEqual(o1, c1);
            assert.deepEqual(o1, c1);

            let o2 = {a: 1, b: 2, c: 3};
            let c2 = util.clone(o2);
            assert.notStrictEqual(o2, c2);
            assert.deepEqual(o2, c2);

            let o3 = {
                a: [1, 2, 3],
                b: { num: 1, date: new Date() },
                c: /[.]*/g
            };
            let c3 = util.clone(o3);
            assert.notStrictEqual(o3, c3);
            assert.notStrictEqual(o3.a, c3.a);
            assert.notStrictEqual(o3.b, c3.b);
            assert.notStrictEqual(o3.c, c3.c);
            assert.deepEqual(o3.a, c3.a);
            assert.deepEqual(o3.b, c3.b);
            assert.deepEqual(o3.c, c3.c);
            assert.deepEqual(o3, c3);

            let s = Symbol('property');
            let o4 = {
                a: 1,
                [s]: {symbol: 'data'}
            };
            let c4 = util.clone(o4);
            assert.deepEqual(o4[s], c4[s]); // symbol should have been copied
            assert.notStrictEqual(o4[s], c4[s]); // should have been a deep copy
            assert.deepEqual(o4, c4);
        });

        it('should make clones of buffers', () => {
            let b1 = new Buffer(0);
            let c1 = util.clone(b1);
            assert.ok(b1.equals(c1));

            let b2 = new Buffer([1, 2, 3, 4, 5]);
            let c2 = util.clone(b2);
            assert.ok(b2.equals(c2));

            let b3 = new Buffer('striiiiiiiing');
            let c3 = util.clone(b3);
            assert.ok(b3.equals(c3));
        });

        it('should make clones of dates', () => {
            let d1 = new Date();
            let c1 = util.clone(d1);
            assert.notStrictEqual(d1, c1);
            assert.deepEqual(d1, c1);
            assert.equal(d1.getTime(), c1.getTime());

            let d2 = new Date('2015-01-01T00:00:00.000Z');
            let c2 = util.clone(d2);
            assert.notStrictEqual(d2, c2);
            assert.deepEqual(d2, c2);
            assert.equal(d2.getTime(), c2.getTime());
        });

        it('should make clones of regular expressions', () => {
            let r1 = /.*/;
            let c1 = util.clone(r1);
            assert.notStrictEqual(r1, c1);
            assert.deepEqual(r1, c1);

            let r2 = /.*/g;
            let c2 = util.clone(r2);
            assert.notStrictEqual(r2, c2);
            assert.deepEqual(r2, c2);

            let r3 = new RegExp('.*', 'ig');
            let c3 = util.clone(r3);
            assert.notStrictEqual(r3, c3);
            assert.deepEqual(r3, c3);
        });

        it('should make clones of sets', () => {
            let s1 = new Set();
            let c1 = util.clone(s1);
            assert.equal(c1.size, 0);
            assert.deepEqual([...s1], [...c1]);

            let s2 = new Set([1, 2, 3]);
            let c2 = util.clone(s2);
            assert.equal(c2.size, 3);
            assert.deepEqual([...s2], [...c2]);

            let oa = {a: 1};
            let ob = {b: 2};
            let oc = {c: 3};
            let s3 = new Set([oa, ob, oc]);
            let c3 = util.clone(s3);
            assert.equal(c3.size, 3);
            assert.deepEqual([...s3], [...c3]);
        });

        it('should make clones of maps', () => {
            let m1 = new Map();
            let c1 = util.clone(m1);
            assert.deepEqual([...m1], [...c1]);

            let m2 = new Map([['a', 1], ['b', 2], ['c', 3]]);
            let c2 = util.clone(m2);
            assert.deepEqual([...m2], [...c2]);
            assert.equal(c2.get('a'), 1);
            assert.equal(c2.get('b'), 2);
            assert.equal(c2.get('c'), 3);
        });

        it('should make clones of objects with circular references', () => {
            let oa = {name: 'oa'};
            let ob = {name: 'ob'};
            oa.b = ob;
            ob.a = oa;
            let ca = util.clone(oa);
            assert.strictEqual(oa, oa.b.a);
            assert.strictEqual(ca, ca.b.a);
            assert.notStrictEqual(ca, oa);
            assert.notStrictEqual(ca, oa.b.a); // should have a circular reference to the clone
            assert.notStrictEqual(oa, ca.b.a);

            let oc = {name: 'oc'};
            oc.c = oc;
            let cc = util.clone(oc);
            assert.strictEqual(oc, oc.c);
            assert.strictEqual(cc, cc.c);
            assert.notStrictEqual(oc, cc.c); // again, circular reference to clone, not the original
            assert.notStrictEqual(cc, oc.c);
        });

        it('should make clones of classes', () => {
            class A {
                constructor(a, b, c) {
                    this.a = a;
                    this.b = b;
                    this.c = c;
                }
                method() {
                    return `${this.a}, ${this.b}, ${this.c}`;
                }
            };
            let a1 = new A(1, 2, 3);
            let c1 = util.clone(a1);
            assert.deepEqual(a1, c1);
            assert.strictEqual(a1.a, c1.a);
            assert.strictEqual(a1.b, c1.b);
            assert.strictEqual(a1.c, c1.c);
            assert.equal(c1.method(), '1, 2, 3');

            // ensure getters and setters don't get in the way of clone
            class B extends A {
                get data() {
                    return [this.a, this.b, this.c];
                }
                set data(arr) {
                    [this.a, this.b, this.c] = arr;
                }
            };
            let b2 = new B(1, 2, 3);
            let c2 = util.clone(b2);
            assert.deepEqual(b2, c2);
            assert.strictEqual(b2.a, c2.a);
            assert.strictEqual(b2.b, c2.b);
            assert.strictEqual(b2.c, c2.c);
            assert.deepEqual(b2.data, c2.data);
            b2.data = [4, 5, 6];
            c2.data = [4, 5, 6];
            assert.deepEqual(b2, c2);
            assert.strictEqual(b2.a, c2.a);
            assert.strictEqual(b2.b, c2.b);
            assert.strictEqual(b2.c, c2.c);
            assert.deepEqual(b2.data, c2.data);

            // ensure we can clone symbols on classes
            let s = Symbol('property');
            class D extends B {
                get [s]() {
                    return 'SymbolData'
                }
            };
            let d3 = new D(1, 2, 3);
            let c3 = util.clone(d3);
            assert.deepEqual(d3, c3);
            assert.strictEqual(d3[s], c3[s]);

            // ensure iterable classes don't get in the way of clone
            class E {
                constructor(...args) {
                    this.arr = args;
                }
                *[Symbol.iterator]() {
                    for (let val of this.arr)
                        yield val;
                }
            };
            let e1 = new E(1, 2, 3);
            let e2 = util.clone(e1);
            assert.deepEqual(e1, e2);
            assert.deepEqual(e1.arr, e2.arr);
            e2.arr = [4, 5, 6];
            assert.deepEqual([...e1], [1, 2, 3]);
            assert.deepEqual([...e2], [4, 5, 6]);
        });
    });

    describe('deepCopy', () => {

        it('should be a reference to clone()', () => {
            assert.strictEqual(util.deepCopy, util.clone);
        });

    });

    describe('equal', () => {

        it('should be a reference to equals()', () => {
            assert.strictEqual(util.equal, util.equals);
        });

    });

    describe('equals', () => {

        it('should pass with both undefined', () => {
            assert.ok(util.equals(undefined, undefined));
            assert.ok(util.equals());
        });

        it('should pass with both null', () => {
            assert.ok(util.equals(null, null));
        });

        it('should pass with equal booleans', () => {
            assert.ok(util.equals(true, true));
            assert.ok(util.equals(false, false));
        });

        it('should pass with equal strings', () => {
            assert.ok(util.equals('', ''));
            assert.ok(util.equals(' ', ' '));
            assert.ok(util.equals('0', '0'));
            assert.ok(util.equals('string', 'string'));
        });

        it('should pass with equal numbers', () => {
            assert.ok(util.equals(0, 0));
            assert.ok(util.equals(1, 1));
            assert.ok(util.equals(1.109258, 1.109258));
            assert.ok(util.equals(Number.MAX_SAFE_INTEGER, 9007199254740991));
        });

        it('should pass with both NaN', () => {
            assert.ok(util.equals(NaN, NaN));
            assert.ok(util.equals(NaN, 0/0));
            assert.ok(util.equals(NaN, "string"/0));
        });

        it('should pass with equal Infinity', () => {
            assert.ok(util.equals(Infinity, Infinity));
            assert.ok(util.equals(Number.POSITIVE_INFINITY, Infinity));
            assert.ok(util.equals(Number.NEGATIVE_INFINITY, -Infinity));
        });

        it('should pass with both +/- 0', () => {
            assert.ok(util.equals(+0, +0));
            assert.ok(util.equals(+0, 0));
            assert.ok(util.equals(+0, -0));
            assert.ok(util.equals(-0, +0));
            assert.ok(util.equals(-0, 0));
            assert.ok(util.equals(-0, -0));
        });

        it('should pass with equal arrays', () => {
            assert.ok(util.equals([], []));
            assert.ok(util.equals([1], [1]));
            assert.ok(util.equals(["1"], ["1"]));
        });

        it('should pass with equal objects', () => {
            assert.ok(util.equals({}, {}));
            assert.ok(util.equals({a: 1}, {a: 1}));
            assert.ok(util.equals({a: 1, b: 2}, {b: 2, a: 1})); // order of keys shouldn't matter
            assert.ok(util.equals({a: 1, data: { arr: [1, 2, 3]}}, {a: 1, data: { arr: [1, 2, 3]}}));
            
            let oa1 = {a: 1};
            let ob1 = {b: 2};
            let oa2 = {a: 1};
            let ob2 = {b: 2};
            oa1.b = ob1;
            ob1.a = oa1;
            oa2.b = ob2;
            ob2.a = oa2;
            assert.ok(util.equals(oa1, oa2));
            assert.ok(util.equals(ob1, ob2));

            let oc1 = {a: 1};
            oc1.c = oc1;
            let oc2 = {a: 1};
            oc2.c = oc2;
            assert.ok(util.equals(oc1, oc2));
        });

        it('should pass with equal dates', () => {
            let d1 = new Date();
            let d2 = new Date(d1);
            assert.ok(util.equals(d1, d2));

            let d3 = new Date('2015-01-01T00:00:00.000');
            let d4 = new Date('2015-01-01T00:00:00.000');
            assert.ok(util.equals(d3, d4));
        });

        it('should pass with equal regular expressions', () => {
            assert.ok(util.equals(/.*/, /.*/));
            assert.ok(util.equals(/.*/g, /.*/g));
            assert.ok(util.equals(/.*/ig, new RegExp('.*', 'gi')));
        });

        it('should pass with equal sets', () => {
            assert.ok(util.equals(new Set(), new Set()));
            assert.ok(util.equals(new Set(), new Set([])));
            let s1 = new Set([1, 2, 3]);
            let s2 = new Set();
            s2.add(1);
            s2.add(2);
            s2.add(3);
            assert.ok(util.equals(s1, s2));

            let oa = {a: 1};
            let ob = {b: 2};
            let oc = {c: 3};
            let od = {d: 4};
            let s3 = new Set([oa, ob, oc]);
            let s4 = new Set([util.clone(oa), util.clone(ob), util.clone(oc)]);
            assert.ok(util.equals(s3, s4));
        });

        it('should pass with equal maps', () => {
            let m1 = new Map();
            let m2 = new Map();
            assert.ok(util.equals(m1, m2));

            let m3 = new Map([['a', 1], ['b', 2], ['c', 3]]);
            let m4 = new Map([['b', 2], ['c', 3], ['a', 1]]); // order shouldn't matter
            assert.ok(util.equals(m3, m4));

            let oa1 = {a: 1};
            let ob1 = {b: 2};
            let oc1 = {c: 3};
            let oa2 = {a: 1};
            let ob2 = {b: 2};
            let oc2 = {c: 3};
            let m5 = new Map([['a', oa1], ['b', ob1], ['c', oc1]]);
            let m6 = new Map([['a', oa2], ['b', ob2], ['c', oc2]]);
            assert.ok(util.equals(m5, m6));
        });

        it('should pass with equal classes', () => {
            class A {
                constructor(a, b, c) {
                    this.a = a;
                    this.b = b;
                    this.c = c;
                }
                get [Symbol.toStringTag]() {
                    return 'A';
                }
            };

            class B extends A {
                get [Symbol.toStringTag]() {
                    return 'B';
                }
            };

            let a1 = new A(1, 2, 3);
            let a2 = new A(1, 2, 3);
            let a3 = new A();
            a3.a = 1;
            a3.b = 2;
            a3.c = 3;
            assert.ok(util.equals(a1, a2));
            assert.ok(util.equals(a1.constructor, a2.constructor));
            assert.ok(util.equals(a1, a3));
            assert.ok(util.equals(a1.constructor, a3.constructor));

            let b1 = new B(1, 2, 3);
            let b2 = new B();
            b2.a = 1;
            b2.b = 2;
            b2.c = 3;
            assert.ok(util.equals(b1, b2));
            assert.ok(util.equals(b1.constructor, b2.constructor));
        });

        it('should pass with equal symbols', () => {
            let s1 = Symbol();
            let s2 = s1;
            assert.ok(util.equals(s1, s2));
            let s3 = Symbol.for('s');
            let s4 = Symbol.for('s');
            assert.ok(util.equals(s3, s4));
        });

        it('should fail with non equal types', () => {
            class A {};
            class B {};
            assert.equal(false, util.equals(A, B));
            assert.equal(false, util.equals(0, '0'));
            assert.equal(false, util.equals(0, false));
            assert.equal(false, util.equals(0, null));
            assert.equal(false, util.equals(0, undefined));
            assert.equal(false, util.equals(null, undefined));
            assert.equal(false, util.equals({}, new A()));
            assert.equal(false, util.equals(A, ()=>{}));
            assert.equal(false, util.equals('null', null));
            assert.equal(false, util.equals(undefined, 'undefined'));
        });

        it('should fail with non equal booleans', () => {
            assert.equal(false, util.equals(true, false));
            assert.equal(false, util.equals(false, true));
        });

        it('should fail with non equal strings', () => {
            assert.equal(false, util.equals('', ' '));
            assert.equal(false, util.equals(' ', ''));
            assert.equal(false, util.equals(' ', '  '));
            assert.equal(false, util.equals('\n', '\r\n'));
            assert.equal(false, util.equals('a', 'A'));
            assert.equal(false, util.equals('false', 'FALSE'));
            assert.equal(false, util.equals('null', 'Null'));
        });

        it('should fail with non equal numbers', () => {
            assert.equal(false, util.equals(0, 1));
            assert.equal(false, util.equals(0, 0.1));
            assert.equal(false, util.equals(0.1 + 0.2, 0.3)); // hooray, javascript! (0.1 + 0.2 is actually 0.30000000000000004)
            assert.equal(false, util.equals(Infinity, -Infinity));
            assert.equal(false, util.equals(-Infinity, Infinity));
        });

        it('should fail with non equal arrays', () => {
            assert.equal(false, util.equals([], [undefined]));
            assert.equal(false, util.equals([], [null]));
            assert.equal(false, util.equals([undefined], [null]));
            assert.equal(false, util.equals([0], [1]));
            assert.equal(false, util.equals([0], ['0']));
            assert.equal(false, util.equals(
                  [{a: 1}, {b: 2}]
                , [{a: 1}, {c: 3}]
            ));
        });

        it('should fail with non equal objects', () => {
            assert.equal(false, util.equals({}, {a: 1}));
            assert.equal(false, util.equals({a: 1}, {a: 2}));
            assert.equal(false, util.equals({a: 1}, {b: 1}));
            assert.equal(false, util.equals({a: null}, {a: undefined}));
        });

        it('should fail with non equal dates', () => {
            let d1 = new Date();
            let d2 = new Date(d1);
            d2.setTime(d2.getTime() + 1);
            assert.equal(false, util.equals(d1, d2));
            assert.equal(false, util.equals(new Date(1000000), new Date(1000001)));
            assert.equal(false, util.equals(new Date('2015-01-01T00:00:00.000', new Date('2015-01-01T00:00:00.001'))));
            assert.equal(false, util.equals(new Date('2015-01-01T00:00:00.000', new Date('2015-01-01T00:00:00.000Z'))));
        });

        it('should fail with non equal regular expressions', () => {
            assert.equal(false, util.equals(/.*/, /[.]*/));
            assert.equal(false, util.equals(/.*/, /(.*)/));
            assert.equal(false, util.equals(/.*/, /.*/g));
            assert.equal(false, util.equals(/.*/i, /.*/g));
        });

        it('should fail with non equal sets', () => {
            assert.equal(false, util.equals(new Set(), new Set([undefined])));
            assert.equal(false, util.equals(
                  new Set([1, 2, 3])
                , new Set([1, 2, 4])
            ));
        });

        it('should fail with non equal maps', () => {
            assert.equal(false, util.equals(new Map([[undefined, undefined]]), new Map()));
            assert.equal(false, util.equals(
                  new Map([['a', 1], ['b', 2], ['c', 3]])
                , new Map([['a', 1], ['b', 4], ['c', 3]])
            ));
        });

        it('should fail with non equal classes', () => {
            class A {
                constructor(a, b, c) {
                    this.a = a;
                    this.b = b;
                    this.c = c;
                }
            };
            let a0 = new A();
            let a1 = new A(1);
            let a2 = new A(1, 2);
            let a3 = new A(1, 2, 3);
            assert.equal(false, util.equals(a0, a1));
            assert.equal(false, util.equals(a0, a2));
            assert.equal(false, util.equals(a0, a3));
            assert.equal(false, util.equals(a1, a2));
            assert.equal(false, util.equals(a1, a3));
            assert.equal(false, util.equals(a2, a3));
        });

        it('should fail with non equal symbols', () => {
            let s1 = Symbol();
            let s2 = Symbol();
            assert.equal(false, util.equals(s1, s2));

            let s3 = Symbol('s');
            let s4 = Symbol('s');
            assert.equal(false, util.equals(s3, s4));

            let s5 = Symbol.for('s');
            let s6 = Symbol('s');
            assert.equal(false, util.equals(s5, s6));
        });
    });

    describe('extend', () => {

        it('should return a reference to the first argument', () => {
            let o1 = {};
            let e1 = util.extend(o1);
            assert.strictEqual(o1, e1);
        });

        it('should extend objects', () => {
            let o1 = util.extend(
                {a: 1, b: 2},
                {c: 3}
            );
            assert.deepEqual(o1, {a: 1, b: 2, c: 3});

            let o2 = util.extend(
                {a: 1, b: [1, 2, 3]},
                {a: 9, b: [4, 5, 6, 7]}
            );
            assert.deepEqual(o2, {a: 1, b: [1, 2, 3, 7]});
        });

        it('should extend arrays', () => {
            let a1 = util.extend(
                [1, 2, 3],
                [4, 5, 6, 7, 8]
            );
            assert.deepEqual(a1, [1, 2, 3, 7, 8]);

            let a2 = util.extend(
                [
                    {a: 1},
                    {b: 2},
                    {c: 3, e: [5]}
                ],
                [
                    {a: 4},
                    {d: 5},
                    {e: [1, 2, 3]}
                ]
            );
            assert.deepEqual(a2, [{ a: 1 }, { b: 2, d: 5 }, { c: 3, e: [5, 2, 3]}]);
        });

        it('should extend sets', () => {
            let s1 = util.extend(
                new Set([1, 2, 3]),
                new Set([3, 4, 5])
            );
            assert.deepEqual([...s1], [1, 2, 3, 4, 5]);
            let o1 = {a: 1};
            let o2 = {b: 2};

            let s2 = util.extend(
                new Set([o1]),
                new Set([o2])
            );
            assert.deepEqual([...s2], [{a: 1}, {b: 2}]);

            let s3 = util.extend(
                new Set([o1, o2]),
                new Set([{b: 2}])
            );
            assert.deepEqual([...s3], [{a: 1}, {b: 2}, {b: 2}]);
        });

        it('should extend maps', () => {
            let m1 = util.extend(
                new Map([['a', 1]]),
                new Map([['b', 2]])
            );
            assert.deepEqual([...m1], [['a', 1], ['b', 2]]);

            let o1 = {a: 1};
            let o2 = {b: 2};
            let m2 = util.extend(
                new Map([['a', o1]]),
                new Map([['a', o2]])
            );
            assert.deepEqual([...m2], [['a', {a: 1, b: 2}]]);
        });

        it('should make shallow references', () => {
            let o1 = {a: 1};
            let o2 = {b: 2};
            let o3 = {c: 3};
            o1.b = o2;
            o1.c = o3;
            let o4 = util.extend(
                {d: 4},
                o1
            );
            assert.strictEqual(o4.b, o2);
            assert.strictEqual(o4.c, o3);
            assert.deepEqual(o4, {a: 1, b: o2, c: o3, d: 4});

            let s1 = util.extend(
                new Set([]),
                new Set([o4]),
                new Set([o4])
            );
            assert.ok(s1.has(o4));
            assert.equal(s1.size, 1);

        });

    });

    describe('forEach', () => {

        it('should iterate over arrays', () => {
            let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            let v = 0;
            util.forEach(arr, (val, key, ref) => {
                assert.strictEqual(key, v);
                assert.strictEqual(val, v);
                assert.strictEqual(arr, ref);
                v++;
            });
        });

        it('should iterate over objects', () => {
            let obj = {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
                e: 5,
                f: 6,
                g: 7,
                h: 8,
                i: 9
            };
            let v = 1;
            let k = 'a'.charCodeAt(0);
            util.forEach(obj, (val, key, ref) => {
                assert.strictEqual(key.charCodeAt(0), k++);
                assert.strictEqual(val, v++);
                assert.strictEqual(obj, ref);
            });
        });

        it('should iterate over sets', () => {
            let set = new Set([5, 6, 7, 8, 9]);
            let v = 5;
            util.forEach(set, (val, key, ref) => {
                assert.strictEqual(key, val); // key === val for set
                assert.strictEqual(val, v);
                assert.strictEqual(set, ref);
                v++;
            });
        });

        it('should iterate over maps', () => {
            let map = new Map([
                ['a', 1],
                ['b', 2],
                ['c', 3],
                ['d', 4],
                ['e', 5],
                ['f', 6],
                ['g', 7],
                ['h', 8],
                ['i', 9]
            ]);
            let v = 1;
            let k = 'a'.charCodeAt(0);
            util.forEach(map, (val, key, ref) => {
                assert.strictEqual(key.charCodeAt(0), k++);
                assert.strictEqual(val, v++);
                assert.strictEqual(map, ref);
            });
        });

        it('should iterate over generators', () => {
            let gen = function*() {
                yield 1; yield 2; yield 3; yield 4; yield 5;
            };
            let iter = gen();
            let v = 1;
            util.forEach(iter, (val, key, ref) => {
                assert.strictEqual(key, undefined);
                assert.strictEqual(val, v++);
                assert.strictEqual(ref, iter);
            });
        });

        it('should iterate over classes', () => {
            class A {
                constructor(a, b, c) {
                    this.a = a;
                    this.b = b;
                    this.c = c;
                }
            };
            let a1 = new A(1, 2, 3);
            let v = 1;
            let k = 'a'.charCodeAt(0);
            util.forEach(a1, (val, key, ref) => {
                assert.strictEqual(key.charCodeAt(0), k++);
                assert.strictEqual(val, v++);
                assert.strictEqual(ref, a1);
            });

            // note that using Symbol.iterator with forEach
            // is a way of overriding the default iteration
            class B extends A {
                *[Symbol.iterator]() {
                    yield* this.arr;
                }
            };
            let b1 = new B(1, 2, 3);
            v = 1;
            util.forEach(b1, (val, key, ref) => {
                assert.strictEqual(key, undefined);
                assert.strictEqual(val, v++);
                assert.strictEqual(ref, b1);
            });
        });

        it('should iterate over anything with Symbol.iterator defined', () => {
            class A {
                constructor(...args) {
                    this.arr = args;
                }
                *[Symbol.iterator]() {
                    for (let val of this.arr)
                        yield val;
                }
                get [Symbol.toStringTag]() {
                    return 'A';
                }
            };

            let a = new A(1, 2, 3, 4, 5);
            let v = 1;
            util.forEach(a, (val, key, ref) => {
                assert.strictEqual(key, undefined);
                assert.strictEqual(val, v++);
                assert.strictEqual(a, ref);
            });
        });

    });

    describe('getType', () => {

        it('should work with undefined', () => {
            assert.equal(util.getType(undefined), util.types.undefined);
            assert.equal(util.getType(), util.types.undefined);
        });

        it('should work with null', () => {
            assert.equal(util.getType(null), util.types.null);
        });

        it('should work with booleans', () => {
            assert.equal(util.getType(false), util.types.boolean);
            assert.equal(util.getType(true), util.types.boolean);
            assert.equal(util.getType(new Boolean()), util.types.boolean);
            assert.equal(util.getType(new Boolean(1)), util.types.boolean);
            assert.equal(util.getType(new Boolean('true')), util.types.boolean);
            assert.equal(util.getType(Boolean()), util.types.boolean);
            assert.equal(util.getType(Boolean.prototype), util.types.boolean);
        });

        it('should work with numbers', () => {
            assert.equal(util.getType(0), util.types.number);
            assert.equal(util.getType(-0), util.types.number);
            assert.equal(util.getType(+0), util.types.number);
            assert.equal(util.getType(Infinity), util.types.number);
            assert.equal(util.getType(-Infinity), util.types.number);
            assert.equal(util.getType(NaN), util.types.number); // hah. this is because toString.call(NaN) returns [object Number]
            assert.equal(util.getType(new Number()), util.types.number); // hah. this is because toString.call(NaN) returns [object Number]
            assert.equal(util.getType(new Number(1)), util.types.number); // hah. this is because toString.call(NaN) returns [object Number]
            assert.equal(util.getType(new Number('1')), util.types.number); // hah. this is because toString.call(NaN) returns [object Number]
            assert.equal(util.getType(Number(1)), util.types.number); // hah. this is because toString.call(NaN) returns [object Number]
            assert.equal(util.getType(Number.prototype), util.types.number); // hah. this is because toString.call(NaN) returns [object Number]
        });

        it('should work with strings', () => {
            assert.equal(util.getType(''), util.types.string);
            assert.equal(util.getType('string'), util.types.string);
            assert.equal(util.getType(new String()), util.types.string);
            assert.equal(util.getType(new String('stuff')), util.types.string);
            assert.equal(util.getType(new String(1)), util.types.string);
            assert.equal(util.getType(String(1)), util.types.string);
            assert.equal(util.getType(String.prototype), util.types.string);
        });

        it('should work with objects', () => {
            assert.equal(util.getType({}), util.types.object);
            assert.equal(util.getType({a: 1}), util.types.object);
            assert.equal(util.getType(new Object()), util.types.object);
            assert.equal(util.getType(new Object({})), util.types.object);
            assert.equal(util.getType(Object()), util.types.object);
            assert.equal(util.getType(Object.prototype), util.types.object);
        });

        it('should work with arrays', () => {
            assert.equal(util.getType([]), util.types.array);
            assert.equal(util.getType(new Array()), util.types.array);
            assert.equal(util.getType(new Array(1)), util.types.array);
            assert.equal(util.getType(new Array(1, 2, 3, 4)), util.types.array);
            assert.equal(util.getType(Array()), util.types.array);
            assert.equal(util.getType(Array.prototype), util.types.array);
        });

        it('should work with arguments', () => {
            assert.equal(util.getType(arguments), util.types.arguments);
        });

        it('should work with maps', () => {
            assert.equal(util.getType(new Map()), util.types.map);
            assert.equal(util.getType(Map.prototype), util.types.map);
        });

        it('should work with sets', () => {
            assert.equal(util.getType(new Set()), util.types.set);
            assert.equal(util.getType(Set.prototype), util.types.set);
        });

        it('should work with classes by toStringTag', () => {
            class A {
                get [Symbol.toStringTag]() { return 'A' };
            };
            assert.equal(util.getType(new A()), util.getType(new A()));
            assert.notEqual(util.getType(new A()), util.types.object);
        });

        it('should work with symbols', () => {
            assert.equal(util.getType(Symbol()), util.types.symbol);
            assert.equal(util.getType(Symbol.prototype), util.types.symbol);
        });

    });

    describe('inspect', () => {

        it('should inspect undefined', () => {
            assert.equal(util.inspect(undefined), 'undefined');
        });

        it('should inspect null', () => {
            assert.equal(util.inspect(null), 'null');
        });

        it('should inspect booleans', () => {
            assert.equal(util.inspect(true), 'true');
            assert.equal(util.inspect(false), 'false');
        });

        it('should inspect strings', () => {
            assert.equal(util.inspect(''), `''`);
            assert.equal(util.inspect('string'), `'string'`);
        });

        it('should inspect numbers', () => {
            assert.equal(util.inspect(0), '0');
            assert.equal(util.inspect(+0), '0');
            assert.equal(util.inspect(-0), '0');
            assert.equal(util.inspect(NaN), 'NaN');
            assert.equal(util.inspect(Infinity), 'Infinity');
            assert.equal(util.inspect(-Infinity), '-Infinity');
        });

        it('should inspect functions', () => {
            function fn1() {};
            assert.equal(util.inspect(function fn1() {}), '[Function: fn1]');
            let fn2 = () => {};
            assert.equal(util.inspect(fn2), '[Function: fn2]');
            assert.equal(util.inspect(function() {}), '[Function]');
            assert.equal(util.inspect(() => {}), '[Function]');
        });

        it('should inspect arrays', () => {
            assert.equal(util.inspect([]), '[]');
            assert.equal(util.inspect([1]), '[ 1 ]');
            assert.equal(util.inspect([1, 2]), '[ 1, 2 ]');
            assert.equal(util.inspect(['']), `[ '' ]`);
            assert.equal(util.inspect(['string']), `[ 'string' ]`);
            assert.equal(util.inspect(['str1', 'str2']), `[ 'str1', 'str2' ]`);
            assert.equal(util.inspect(['array', 'with', 'a', 'really', 'long', 'total', 'length', 'which', 'is', 'over', '60', 'characters']), `[ 'array',\n  'with',\n  'a',\n  'really',\n  'long',\n  'total',\n  'length',\n  'which',\n  'is',\n  'over',\n  '60',\n  'characters' ]`);
            assert.equal(util.inspect([ 1, 2, 3, [ 4, 5, 6, [ 7, 8, 9 ] ] ]), '[ 1, 2, 3, [ 4, 5, 6, [ 7, 8, 9 ] ] ]');
            let arr1 = [
                [ 1, 2, 3 ],
                [ 4, 5, 6 ],
                7,
                8,
                9,
                [ 10, 11, [ 12, 13, 14 ], [ 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25 ] ],
                15,
                16,
                17,
                [ 18, 19, 20 ]
            ];
            assert.equal(util.inspect(arr1), `[ [ 1, 2, 3 ],\n  [ 4, 5, 6 ],\n  7,\n  8,\n  9,\n  [ 10,\n    11,\n    [ 12, 13, 14 ],\n    [ 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25 ] ],\n  15,\n  16,\n  17,\n  [ 18, 19, 20 ] ]`);
            let cir1 = [1, 2, 3];
            let cir2 = [4, 5, 6];
            cir1.push(cir2);
            cir2.push(cir1);
            assert.equal(util.inspect(cir1), `[ 1, 2, 3, [ 4, 5, 6, [Circular] ] ]`);
        });

        it('should inspect objects', () => {
            assert.equal(util.inspect({}), '{}');
            assert.equal(util.inspect({a: 1}), '{ a: 1 }');
            assert.equal(util.inspect({a: 1, b: 2, c: 3}), '{ a: 1, b: 2, c: 3 }');
            assert.equal(util.inspect({a: 'str1', b: 'str2', c: 'str3'}), `{ a: 'str1', b: 'str2', c: 'str3' }`);
            let obj1 = {
                a: 1,
                b: [1, 2, 3],
                c: {
                    d: 1,
                    e: [1, 2, 3, 4, 5, 6, 7],
                    f: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
                },
                g: {
                    h: {
                        i: {
                            j: {
                                k: 1290875129875921875,
                                l: 456987292906876071,
                                m: 98729835798127198
                            }
                        }
                    }
                }
            };
            assert.equal(util.inspect(obj1), `{\n  a: 1,\n  b: [ 1, 2, 3 ],\n  c: {\n    d: 1,\n    e: [ 1, 2, 3, 4, 5, 6, 7 ],\n    f: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ] },\n  g: {\n    h: {\n      i: {\n        j: {\n          k: 1290875129875922000,\n          l: 456987292906876100,\n          m: 98729835798127200 } } } } }`);
            let cir1 = {a: 1};
            let cir2 = {b: 2};
            cir1.c = cir2;
            cir2.c = cir1;
            assert.equal(util.inspect(cir1), `{ a: 1, c: { b: 2, c: [Circular] } }`);
        });

        it('should inspect sets', () => {
            assert.equal(util.inspect(new Set()), '[]');
            assert.equal(util.inspect(new Set([1, 2, 3])), '[ 1, 2, 3 ]');
        });

        it('should inspect maps', () => {
            assert.equal(util.inspect(new Map()), '[]');
            assert.equal(util.inspect(new Map([['a', 1]])), `[ [ 'a', 1 ] ]`);
            assert.equal(util.inspect(new Map([['a', 1], ['b', 2]])), `[ [ 'a', 1 ], [ 'b', 2 ] ]`);
        });

        it('should inspect errors', () => {
            assert.equal(util.inspect(new Error()), '[Error]');
            assert.equal(util.inspect(new Error('message')), '[Error: message]');
        });

    });

});
