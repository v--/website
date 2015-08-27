application.directive('pagination', function() { return {
    templateUrl: 'directives/pagination.html',
    scope: {
        original: '=',
        paginated: '=',
        _perPage: '=perPage'
    },

    link: function(scope) {
        scope.buttons = new Array(1);
        scope.pageCount = 1;
        scope.active = 0;

        scope.setPerPage = function() {
            scope.perPage = scope._perPage || 8;
        };

        scope.setPerPage();

        scope.draw = function() {
            let start = scope.active * scope.perPage;
            scope.paginated = scope.original.slice(start, start + scope.perPage);
            scope.pageCount = Math.ceil(scope.original.length / scope.perPage);
            scope.buttons = new Array(scope.pageCount);
        };

        scope.goTo = function(index) {
            scope.active = index;
            scope.draw();
        };

        scope.$watch('original', scope.draw);
        scope.$watch('perPage', scope.setPerPage);
    }
};});
