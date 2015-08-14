application.controller('FilesCtrl', function($scope, $stateParams, files) {
    $scope.parent = null;

    $scope.getNestedFolder = function() {
        let paths = $stateParams.sub.replace(/^\//, '').split('/');
        let result = files[0];

        for (let subpath of paths) {
            $scope.parent = result;
            result = $scope.parent.children.find(entry => entry.name === subpath);

            if (!result) {
                $scope.$emit('errorPage');
                return [];
            }
        }

        return result;
    };

    if ($stateParams.sub)
        $scope.files = $scope.getNestedFolder();
    else
        $scope.files = files[0];
});
