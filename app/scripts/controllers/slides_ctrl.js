application.controller('SlidesCtrl', function($scope, slides) {
    $scope.slides = slides.map(state => state.name);
    $scope.urls = slides.map(state => state.url);
});
