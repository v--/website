application.filter('capitalize', function() {
    return function(string) {
        return string && string.capitalize();
    };
});
