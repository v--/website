/* eslint no-var: 0 */
Object.extend(); // sugar.js

// sugar.js's groupBy breaks because a loosy key comparison is performed
Array.prototype.defineMethod('groupBy', function(accessorArg) {
    var result = {},
        accessor = accessorArg.isString() ? Function.accessor(accessorArg) : accessorArg;

    Object.assertType('function', accessor);

    this.forEach((function(data) {
        var prop = accessor(data);

        if (!result.hasOwnProperty(prop))
            result[prop] = [];

        result[prop].push(data);
    }).bind(this));

    return result;
});

Array.prototype.defineMethod('swap', function(i1, i2) {
    var temp = this[i1];
    this[i1] = this[i2];
    this[i2] = temp;
});
