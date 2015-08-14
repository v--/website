application.factory('cache', function($cacheFactory) {
    return $cacheFactory('global', {
        capacity: 25
    });
});

application.run(function($interval, $http, cache) {
    // Clear the cache every 10 minutes
    // istanbul ignore next
    $interval(cache.removeAll, 1000 * 60 * 10);
    $http.defaults.cache = cache;
});
