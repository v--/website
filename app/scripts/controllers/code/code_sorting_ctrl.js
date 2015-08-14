application.controller('CodeSortingCtrl', function($scope, SortingAlgorithm) {
    $scope.algorithms = [];

    function* insertionSort(collection) {
        var ordered = true;

        for (var i = 1; i < collection.length; ++i) {
            for (var j = i; j > 0 && collection[j - 1] > collection[j]; --j)
                yield {
                    a: j - 1,
                    b: j,
                    good: false
                };
        }
    }

    function* selectionSort(collection) {
        var ordered = true;

        for (var i = 0; i < collection.length - 1; ++i) {
            for (var j = 0; j < collection.length - 1; ++j) {
                var min = d3.min(collection.slice(j));

                yield {
                    a: j,
                    b: j + 1,
                    good: min === collection[j]
                };
            }
        }
    }

    function* bubbleSort(collection) {
        var ordered = true;

        for (var i = 1; i < collection.length; ++i) {
            var current = collection[i - 1] < collection[i];
            ordered = ordered && current;

            yield {
                a: i - 1,
                b: i,
                good: current
            };

            if (i === collection.length - 1 && !ordered) {
                ordered = true;
                i = 0;
            }
        }
    }

    function* shellSort(collection) {
        for (var gap of [5, 3, 1]) {
            for (var i = gap; i < collection.length; ++i) {
                var temp = collection[i];

                for (var j = i; j >= gap && collection[j - gap] > temp; j -= gap)
                    yield {
                        a: j,
                        b: j - gap,
                        good: false
                    };

                yield {
                    a: j,
                    b: collection.indexOf(temp),
                    good: false
                };
            }
        }
    }

    function* mergeSort(collection) {
        for (var i = 2; i <= collection.length * 2; i *= 2) {
            for (var j = 0; j < Math.ceil(collection.length / i); ++j) {
                var start = i * j;
                var segment = collection.slice(start, start + i);

                for (var k = 0; k < segment.length - 1; ++k) {
                    var subsegment = segment.slice(k);
                    var min = d3.min(subsegment);
                    var minIndex = segment.indexOf(min);
                    var isMin = subsegment[0] === min;

                    if (!isMin)
                        segment.swap(k, minIndex);

                    yield {
                        a: start + k,
                        b: start + minIndex,
                        good: isMin
                    };
                }
            }
        }
    }

    $scope.sortAll = function() {
        for (var algorithms of $scope.algorithms)
            algorithms.sort();
    };

    $scope.$on('$viewContentLoaded', function() {
        $scope.algorithms = [
            'insertion',
            'selection',
            'bubble',
            'shell',
            'merge'
        ].map(name => new SortingAlgorithm(name.capitalize() + ' sort', eval(name + 'Sort')));
    });
});
