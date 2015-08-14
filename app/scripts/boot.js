Array.prototype.defineMethod('swap', function(a, b) {
    var temp = this[a];
    this[a] = this[b];
    this[b] = temp;
});

window.application = angular.module('ivasilev', [
    'ngResource',
    'ngAnimate',
    'ngCookies',
    'ui.router',
    'ui.alias',
    'snap',
    'hc.marked',
    'tableSort',
    'picardy.fontawesome'
]);
