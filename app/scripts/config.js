application.config(function($stateProvider, $locationProvider, $urlRouterProvider, $httpProvider, snapRemoteProvider) {
    snapRemoteProvider.globalOptions = {
        tapToClose: false,
        touchToDrag: false,
        maxPosition: 200,
        disable: 'right'
    };

    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise(function($injector) {
        let $state = $injector.get('$state');

        $state.go('error', {
            error: {
                status: 404,
                statusText: 'Not found'
            }
        });
    });

    $stateProvider
        .state({
            name: 'home',
            url: '/',
            templateUrl: 'home.html'
        })

        .state({
            name: 'files',
            url: '/files{sub:.*}',
            templateUrl: 'files.html',
            controller: 'FilesCtrl',
            resolve: {
                files: function(Files) {
                    return Files.query().$promise;
                }
            }
        })

        .state({
            name: 'code',
            url: '/code',
            controller: 'CodeCtrl',
            templateUrl: 'code.html',
            resolve: {
                list: function(submenuCode) {
                    return submenuCode();
                }
            }
        })

        .state({
            name: 'code_Forex',
            url: '/code/forex',
            controller: 'CodeForexCtrl',
            templateUrl: 'code/forex.html',
            resolve: {
                forexRates: function(ForexRates) {
                    return ForexRates.get({currency: 'usd'}).$promise;
                }
            }
        })

        .state({
            name: 'code_Sorting',
            url: '/code/sorting',
            controller: 'CodeSortingCtrl',
            templateUrl: 'code/sorting.html'
        })

        .state({
            name: 'slides',
            url: '/slides',
            templateUrl: 'slides.html',
            controller: 'SlidesCtrl',
            resolve: {
                slides: function(Slide) {
                    return Slide.slides();
                }
            }
        })

        .state({
            name: 'pacman',
            url: '/pacman',
            templateUrl: 'pacman.html',
            controller: 'PacmanCtrl',
            resolve: {
                packages: function(Package) {
                    return Package.query().$promise;
                }
            }
        })

        .state({
            name: 'error',
            params: {error: {}},
            controller: 'ErrorCtrl',
            templateUrl: 'error.html'
        });
});
