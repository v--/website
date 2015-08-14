application.config(function($stateProvider, $locationProvider, $urlRouterProvider, $httpProvider, snapRemoteProvider) {
    snapRemoteProvider.globalOptions = {
        tapToClose: false,
        touchToDrag: false,
        maxPosition: 200,
        disable: 'right'
    };

    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise(function($injector) {
        let $rootScope = $injector.get('$rootScope');

        $rootScope.$emit('errorPage', {
            title: 'Error 404',
            message: 'Not found'
        });
    });

    $stateProvider
        .state({
            name: 'home',
            url: '/',
            templateUrl: 'views/home'
        })

        .state({
            name: 'files',
            url: '/files{sub:.*}',
            templateUrl: 'views/files',
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
            templateUrl: 'views/code',
            resolve: {
                list: function(submenuCode) {
                    return submenuCode();
                }
            }
        })

        .state({
            name: 'code_ianis',
            url: '/code/ianis.js',
            templateUrl: 'views/code/ianis'
        })

        .state({
            name: 'code_Forex',
            url: '/code/forex',
            controller: 'CodeForexCtrl',
            templateUrl: 'views/code/forex',
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
            templateUrl: 'views/code/sorting'
        })

        .state({
            name: 'slides',
            url: '/slides',
            templateUrl: 'views/slides',
            controller: 'SlidesCtrl',
            resolve: {
                slides: function(submenuSlides) {
                    return submenuSlides();
                }
            }
        })

        .state({
            name: 'slides_display',
            url: '/slides/:slide',
            templateUrl: 'views/slides_display',
            controller: 'SlidesDisplayCtrl'
        })

        .state({
            name: 'pacman',
            url: '/pacman{repo:|/any|/i686|/x86_64}',
            templateUrl: 'views/pacman',
            controller: 'PacmanCtrl',
            resolve: {
                packages: function(Package) {
                    return Package.query().$promise;
                }
            }
        });
});
