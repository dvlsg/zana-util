import util from '../dist/util.js';
import assert from 'assert';
let log = console.log.bind(console);

describe('Util', () => {

    describe('clone', () => {

        it('should make clones of primitives', () => {
            assert.equal(1, util.clone(1));
            assert.equal(undefined, util.clone(undefined));
            assert.equal(null, util.clone(null));
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
            }
            let a1 = new A(1, 2, 3);
            let c1 = util.clone(a1);
            assert.ok(util.equals(a1, c1));
            assert.ok(util.equals(a1.a, c1.a));
            assert.ok(util.equals(a1.b, c1.b));
            assert.ok(util.equals(a1.c, c1.c));
            assert.equal(c1.method(), '1, 2, 3');
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

        it('should fail with non equal types', () => {
            class A {};
            class B {};
            assert.equal(false, util.equals(A, B));
            assert.equal(false, util.equals(0, '0'));
            assert.equal(false, util.equals(0, null));
            assert.equal(false, util.equals(0, undefined));
            assert.equal(false, util.equals(null, undefined));
            assert.equal(false, util.equals({}, new A()));
            assert.equal(false, util.equals(A, ()=>{}));
            assert.equal(false, util.equals('null', null));
            assert.equal(false, util.equals(undefined, 'undefined'));
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
    });

    describe('extend', () => {
        it('will be determined');
    });

    describe('forEach', () => {
        it('will be determined');
    });

    describe('getType', () => {
        it('will be determined');
    });

    describe('smash', () => {
        it('will be determined (maybe dropped in favor of extend)');
    });
});
