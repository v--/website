application.factory('Package', function($resource) {
    return $resource('/api/packages');
});
