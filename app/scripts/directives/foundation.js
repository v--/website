application.directive('foundation', function() { return {
    templateUrl: 'directives/foundation.html',
    scope: true,
    transclude: true,
    controller: function($scope, $state, $rootScope, $timeout, $cookieStore, snapRemote) {
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
            title.innerHTML = ['ivasilev.net'].concat(titles).join(' &#187; ');
        });

        $rootScope.$on('clearError', function() {
            $rootScope.$emit('changeTitle');
        });

        $rootScope.$on('$stateChangeError', function(e, _toState, _toParams, _fromState, _fromParams, error) {
            // Force URL change
            e.preventDefault();
            $timeout.cancel(timeout);
            $scope.loading = false;
            $state.go('error', {error: error});
        });

        $rootScope.$on('$stateChangeStart', function() {
            $timeout.cancel(timeout);
            timeout = $timeout($rootScope.$emit.fill('notify:info', 'Still loading...', {timeout: 0}).bind($rootScope), 1500);
            $scope.loading = true;
            $rootScope.$emit('changeTitle', ['loading...']);
        });

        $rootScope.$on('$stateChangeSuccess', function() {
            $timeout.cancel(timeout);
            $scope.loading = false;
            $rootScope.$emit('notify:clear');
        });

        $timeout(() => document.body.classList.remove('preload'));
    }
};});
