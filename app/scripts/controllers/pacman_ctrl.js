application.controller('PacmanCtrl', function($scope, packages) {
    $scope.repos = packages[0].children.map(x => {
        var parsed = x.name.match(/^(.+?)(?:-([\d.]+)-\d-(any|i386|x86_64)\.pkg\.tar\.xz)$/);

        return {
            name: parsed && parsed[1],
            version: parsed && parsed[2],
            type: parsed && parsed[3]
        };
    }).filter(x => x.name).groupBy('type');
});
