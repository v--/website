application.controller('PacmanCtrl', function($scope, packages) {
    $scope.repos = packages[0].children.map(x => Object({
        name: x.name,
        packages: x.children.map(y => {
            var parsed = y.name.match(/^(.+?)(?:-([\d.]+)-\d-(?:any|i386|x86_64)\.pkg\.tar\.xz)$/);

            return {
                name: parsed && parsed[1],
                version: parsed && parsed[2]
            };
        }).filter(x => x.name)
    }));
});
