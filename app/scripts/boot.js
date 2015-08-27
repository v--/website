// removeIf(production)
// jshint evil:true
document.write('<script src="http://localhost:35729/livereload.js"></script>');
// endRemoveIf(production)

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
    'picardy.fontawesome',
    'templates'
]);
