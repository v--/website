application.factory('ForexRates', function($resource) {
    return $resource('/api/forex/:currency');
});
