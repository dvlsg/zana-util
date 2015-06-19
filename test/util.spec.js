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
    });

    describe('equals', () => {

        it('should pass with undefined', () => {
            assert.ok(util.equals(undefined, undefined));
            assert.ok(util.equals());
        });

        it('should pass with null', () => {
            assert.ok(util.equals(null, null));
        });

        it('should pass with strings', () => {
            assert.ok(util.equals('', ''));
            assert.ok(util.equals(' ', ' '));
            assert.ok(util.equals('0', '0'));
            assert.ok(util.equals('string', 'string'));
        });

        it('should pass with numbers', () => {
            assert.ok(util.equals(0, 0));
            assert.ok(util.equals(1, 1));
            assert.ok(util.equals(1.109258, 1.109258));
            assert.ok(util.equals(Number.MAX_SAFE_INTEGER, 9007199254740991));
        });

        it('should pass with NaN', () => {
            assert.ok(util.equals(NaN, NaN));
            assert.ok(util.equals(NaN, 0/0));
            assert.ok(util.equals(NaN, "string"/0));
        });

        it('should pass with Infinity', () => {
            assert.ok(util.equals(Infinity, Infinity));
            assert.ok(util.equals(Number.POSITIVE_INFINITY, Infinity));
            assert.ok(util.equals(Number.NEGATIVE_INFINITY, -Infinity));
        });

        it('should pass with +/- 0');
        it('should pass with arrays');
        it('should pass with objects');
        it('should pass with dates');
        it('should pass with regular expressions');
        it('should pass with sets');
        it('should pass with maps');
        it('should pass with classes');
    });

    describe('extend', () => {
        it('will be determined');
    });

    describe('getType', () => {
        it('will be determined');
    });

    

    describe('smash', () => {
        it('will be determined (maybe dropped in favor of extend)');
    });
});
