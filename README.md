# zana-util
A utility library for deep equals, cloning, extending, and type checking.

```js
import { clone, equals, type, types } from 'zana-util';

let arr = [1, 2, 3, 4, 5];
let arr2 = clone(arr);
console.log(arr === arr2); //=> false
console.log(equals(arr, arr2)); //=> true
console.log(type(arr) === types.array) //=> true
```

## Installation

```
npm install zana-util
```

## Default Task

* Install node.js
* Clone the zana-util project
* Run `npm install`
* Run `gulp`
    * Executes tests
    * Cleans dist
    * Lints source
    * Builds source
    * Watches source and tests

## Usage

### clone

`clone(val)` will make deep copies of values, including primitives, arrays, objects, buffers, dates, regular expressions, sets, maps, and classes.

```js
import { clone } from 'zana-util';

let obj1 = { a: 1, b: 2, c: 3 };
let obj2 = clone(obj1);
console.log(obj1 === obj2); //=> false
obj1.a = 4;
console.log(obj1); //=> { a: 4, b: 2, c: 3 }
console.log(obj2); //=> { a: 1, b: 2, c: 3 }
```

Note that all nested values will also be cloned.

```js
let arr1 = [
    { a: 1, b: 2, c: [3, 4, 5] },
    { a: 1, b: 2, c: [3, 4, 5] }
];
let arr2 = clone(arr1);
console.log(arr1 === arr2); //=> false
console.log(arr1[0].c === arr2[0].c); //=> false
arr1[0].c.push(6);
console.log(arr1[0]); //=> { a: 1, b: 2, c: [3, 4, 5, 6] }
console.log(arr2[0]); //=> { a: 1, b: 2, c: [3, 4, 5] }
```

### equals

`equals(a, b)` will make a deep comparison of two values.

```js
import { equals } from 'zana-util';

let obj1 = { a: 1, b: 2, c: 3 };
let obj2 = { a: 1, b: 2, c: 3 };
console.log(obj1 === obj2); //=> false
console.log(equals(obj1, obj2)); //=> true
```

As with `clone`, all nested values will be compared.

```js
let arr1 = [
    { a: 1, b: 2, c: [3, 4, 5] },
    { a: 1, b: 2, c: [3, 4, 5] }
];
let arr2 = [
    { a: 1, b: 2, c: [3, 4, 5] },
    { a: 1, b: 2, c: [3, 4, 5] }
];
console.log(arr1 === arr2); //=> false
console.log(equals(arr1, arr2)); //=> true
```

### extend

`extend(obj, ...objects)` will extend the first argument with any number of following arguments.

```js
import { extend } from 'zana-util';

let obj1 = { a: 1, b: 2 };
let obj2 = { c: 3 };
extend(obj1, obj2);
console.log(obj1); //=> { a: 1, b: 2, c: 3 }
```

If the first item contains a property, it will not be overwritten by any of the extensions.

```js
let obj1 = { a: 1, b: 2 };
let obj2 = { a: 9, c: 3 };
extend(obj1, obj2);
console.log(obj1); //=> { a: 1, b: 2, c: 3 }
```

As well as `Objects`, `extend` will also work with other iterable items such as `Arrays`, `Sets`, and `Maps`.

```js
let arr1 = [1, 2, 3];
let arr2 = [4, 5, 6, 7];
extend(arr1, arr2);
console.log(...arr1); //=> [ 1, 2, 3, 7 ]

let set1 = new Set([1, 2, 3]);
let set2 = new Set([4]);
extend(set1, set2);
console.log(...set1); //=> 1 2 3 4

let map1 = new Map([['a', 1], ['b', 2]]);
let map2 = new Map([['c', 3]]);
extend(map1, map2);
console.log(...map1); //=> [ 'a', 1 ] [ 'b', 2 ] [ 'c', 3 ]
```

`extend` will also work with nested values, but will extend references to non primitive values wherever the property is not defined on the first value.

```js
let obj1 = { a: 1, c: [2] };
let obj2 = { b: [3, 4, 5], c: [6, 7] };
extend(obj1, obj2);
console.log(obj1); //=> { a: 1, b: [3, 4, 5], c: [2, 7] }
console.log(obj1.b === obj2.b); //=> true
console.log(obj1.c === obj2.c); //=> false
```

### each

`each(iterable)` will yield a key value pair for iterable items.

```js
import { each } from 'zana-util';

let arr = ['a', 'b', 'c'];
for (let [key, val] of each(arr))
    console.log(key, val);

// console output
//=> 0, 'a'
//=> 1, 'b'
//=> 2, 'c'

let obj = { a: 1, b: 2, c: 3 };
for (let [key, val] of each(obj))
    console.log(key, val);

// console output
//=> 'a', 1
//=> 'b', 2
//=> 'c', 3

let map = new Map([['a', 1], ['b', 2], ['c', 3]]);
for (let [key, val] of each(map))
    console.log(key, val);

// console output
//=> 'a', 1
//=> 'b', 2
//=> 'c', 3

let set = new Set([1, 2, 3]);
for (let [key, val] of each(set))
    console.log(key, val);

// console output
//=> 1, 1
//=> 2, 2
//=> 3, 3
```

### type

`type(val)` will return the type of a value.

```js
import { type, types } from 'zana-util';

console.log(type(arguments)     === types.arguments); //=> true
console.log(type([])            === types.array);     //=> true
console.log(type(true)          === types.boolean);   //=> true
console.log(type(new Date())    === types.date);      //=> true
console.log(type(new Error())   === types.error);     //=> true
console.log(type(function(){})  === types.function);  //=> true
console.log(type(new Map())     === types.map);       //=> true
console.log(type(null)          === types.null);      //=> true
console.log(type(0)             === types.number);    //=> true
console.log(type({})            === types.object);    //=> true
console.log(type(new Promise()) === types.promise);   //=> true
console.log(type(/.*/)          === types.regexp);    //=> true
console.log(type('')            === types.string);    //=> true
console.log(type(new Set())     === types.set);       //=> true
console.log(type(Symbol())      === types.symbol);    //=> true
console.log(type(undefined)     === types.undefined); //=> true
console.log(type(new WeakMap()) === types.weakmap);   //=> true
console.log(type(new WeakSet()) === types.weakset);   //=> true
```
