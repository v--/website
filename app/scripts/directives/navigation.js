application.directive('navigation', function() { return {
    /*@ngInject*/
    templateUrl: 'views/directives/navigation',
    scope: true,
    controller: function($scope, $element, $state, $location, $injector, State) {
        $scope.iconMap = {
            home: 'home',
            code: 'code',
            files: 'files-o',
            slides: 'line-chart',
            pacman: 'cloud-download'
        };

        $scope.states = [];
        $scope.left = [];
        $scope.sidebar = true;

        for (let uiState of $state.get().slice(2)) {
            let state = new State(uiState);

            if ($scope.iconMap[state.name]) {
                let name = 'submenu' + state.name.capitalize();
                $scope.states.push(state);

                if ($injector.has(name))
                    state.childrenPromise = $injector.get(name);
            }
        }

        $scope.states.unshift(new State($state.get()[1]));

        $scope.$on('$stateChangeSuccess', function() {
            let path = $location.path();

            for (let state of $scope.states)
                state.updateActive(path);
        });
    }
};});
