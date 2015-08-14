## __ianis.js__ a set of useful javascript extension methods

This page shows only some that shorthands ianis.js provides.

There are many methods besides these. For the full documentation, see [GitHub](https://github.com/v--/ianis.js)

To run the test suite in your browser, go [here](/ianis.js)

__Method binding__

```javascript
object.nestedObject.method.bind(object.nestedObject);

// Becomes

object.nestedObject.binded('method');
```

__Check if all elements in an array are functions__

```javascript
[Object, Function, Number]
.map(function(current) {return typeof current === 'function'})
.reduce(function(prev, current) {return prev === current});

// Becomes

[Object, Function, Number].isTypeMonotone('function');
// or even
[Object, Function, Number].isTypeMonotone();
```

__Check if an array is polymorphic__

```javascript
// Assume Apple inherits Fruit and apple and fruit are their instances

[fruit, apple]
.map(function(current) {return current instanceof Fruit})
.reduce(function(prev, current) {return prev === current});

// Becomes

[fruit, apple].isTypeMonotone(Fruit, true);
```

__Check if all elements in an array are equal__

```javascript
['a', 'a', 'a']
.map(function(current, index, array) {return current === array[0]})
.reduce(function(prev, current) {return prev === current});

// Becomes

['a', 'a', 'a'].isMonotone();
```
