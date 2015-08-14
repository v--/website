application.directive('foundation', function() { return {
    templateUrl: 'views/directives/foundation',
    scope: true,
    transclude: true,
    controller: function($scope, $rootScope, $timeout, $cookieStore, snapRemote) {
        $scope.loading = true;

        snapRemote.getSnapper().then(function(snapper) {
            snapper.on('open', function() {
                $scope.snapperOpen = true;
                $cookieStore.put('sidemenuExpanded', $scope.snapperOpen);
            });

            snapper.on('close', function() {
                $scope.snapperOpen = false;
                $cookieStore.put('sidemenuExpanded', $scope.snapperOpen);
            });

            let expanded = $cookieStore.get('sidemenuExpanded');
            let firstVisit = angular.isUndefined(expanded);
            let largeScreen = document.body.scrollWidth >= 800;

            if (firstVisit && largeScreen || expanded)
                snapper.open('left');
        });

        let timeout = null;
        let title = document.querySelector('title');

        // document.title does not interpolate HTML entries
        $rootScope.$on('changeTitle', function(_e, titles = []) {
            title.innerHTML = ['iVasilev'].concat(titles).join(' &#187; ');
        });

        $rootScope.$on('errorPage', function(_e, error) {
            $scope.error = error || {
                title: 'Error',
                message: 'An unknown error occured'
            };

            $rootScope.$emit('changeTitle', [$scope.error.title]);
        });

        $rootScope.$on('clearError', function() {
            $rootScope.$emit('changeTitle');
            $scope.error = null;
        });

        $rootScope.$on('$stateChangeError', function(_e, _toState, _toParams, _fromState, _fromParams, error) {
            $timeout.cancel(timeout);
            $rootScope.$emit('notify:error', 'Error ' + error.status + ': ' + error.statusText);
            $rootScope.$emit('errorPage', {
                title: 'Error ' + error.status,
                message: error.statusText
            });
        });

        $rootScope.$on('$stateChangeStart', function() {
            timeout = $timeout($rootScope.$emit.fill('notify:info', 'Still loading...', {timeout: 0}), 1500);
            $scope.loading = true;
            $rootScope.$emit('changeTitle', ['Loading']);
        });

        $rootScope.$on('$stateChangeSuccess', function() {
            $timeout.cancel(timeout);
            $scope.loading = false;
            $rootScope.$emit('notify:clear');
        });

        $timeout(() => document.body.classList.remove('preload'));
    }
};});
