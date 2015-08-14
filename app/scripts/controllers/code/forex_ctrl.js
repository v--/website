application.controller('CodeForexCtrl', function($scope, forexRates) {
    delete forexRates.$promise;
    delete forexRates.$resolved;
    let dateStrings = forexRates.keys().sort();
    let dates = dateStrings.map(dateString => new Date(dateString));
    let rates = dateStrings.map(dateString => parseFloat(forexRates[dateString]));

    let colors = {
        normal: '#7fbf40',
        success: '#0687ff',
        failure: '#ff2408'
    };

    let min = d3.min(rates);
    let max = d3.max(rates);
    let svg = d3.select('svg');
    let width = 800;
    // let height = 600;

    let xScale = d3.time.scale()
        .domain([dates.first(), dates.last()])
        .range([50, width]);

    let yScale = d3.scale.linear()
        .domain([min * 0.999, max * 1.001])
        .range([550, 0]);

    let timeScale = function(rate, index) {
        return xScale(dates[index]);
    };

    let mean = d3.mean(rates);
    let squares = rates.map(rate => rate * rate);
    let deviation = Math.sqrt((d3.sum(squares) - (rates.length * mean * mean) )/(rates.length - 1));
    let normal = rates.filter(rate => rate - mean <= deviation);

    let rises = new Array(rates.length);
    {
        for (let i = 0; i < rises.length - 1; ++i)
            rises[i] = rates[i + 1] > rates[i];
    }

    let history = 2;
    let naiveBayesPost = function(index, positive) {
        let filterLambda = d => positive ? d : !d;
        let count = rises.slice(0, index).filter(filterLambda).length;

        if (count === 0)
            return 0;

        let ratio = count / index;
        let historyCrop = rises.slice(index - history, index);
        let historyCount = historyCrop.filter(filterLambda).length;
        let likehood = historyCount / count;
        return ratio * likehood;
    };

    let naiveBayes = function*() {
        let index = 0;

        while (true) {
            let rise = naiveBayesPost(index, true);
            let fall = naiveBayesPost(index++, false);
            yield rise > fall;
        }
    };

    let xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom');

    let yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .tickSize(width - 50)
        .ticks(20);

    svg.append('g')
        .attr('class', 'axis')
    .attr('transform', 'translate(0, 550)')
        .call(xAxis);

    svg.append('g')
        .attr('class', 'axis')
    .attr('transform', 'translate(800, 0)')
        .call(yAxis);

    let normalLine = d3.svg.line()
        .interpolate('linear')
        .x(timeScale)
        .y(yScale);

    svg.append('path')
        .attr('id', 'line-usd')
        .attr('d', normalLine(rates))
        .style('stroke', colors.normal);

    let bi = naiveBayes();
    let iterated = new Array(rises.length);
    let dispenser = function(rise, index) {
        iterated[index] = bi.next().value;
        if (rise === iterated[index])
            return colors.success;
        else
            return colors.failure;
    };

    let circles = svg.selectAll('circle')
        .data(rises)
        .enter().append('circle')
        .attr('r', 5)
        .attr('cx', (rise, index) => xScale(dates[index]))
        .attr('cy', (rise, index) => yScale(rates[index]))
        .style('fill', dispenser);

    let success = iterated.filter((d, i) => d === rises[i]).length;
    let ratio = Math.floor(100 * success / iterated.length);

    svg.append('text')
        .attr('x', 50)
        .attr('y', 600)
        .text(ratio + '% (' + success + ') EUR/USD ratio changes guessed using the naive Bayes classification');
});
