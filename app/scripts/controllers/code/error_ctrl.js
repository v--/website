application.controller('ErrorCtrl', function($scope, $stateParams) {
    var error = $scope.error = !$stateParams.error.isEmpty() ? $stateParams.error : {statusText: 'An unknown error occured'},
        title = ['Error', error.status].compact().join(' ');

    console.log($stateParams.error);

    $scope.message = title;

    if (error.statusText)
        $scope.message += ': ' + error.statusText;

    $scope.$emit('changeTitle', [title]);
    $scope.$emit('notify:error', $scope.message);
});
