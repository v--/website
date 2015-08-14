application.factory('SortingAlgorithm', function() {
    let data = {
        ordered:  () => [1,  2,  3,  4,  5,  6,  7,  8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
        shuffled: () => [8,  3,  10, 16, 11, 21, 7,  6,  1,  17, 20, 14, 5,  12, 25, 9,  23, 15, 18, 4,  22, 13, 19, 24, 2 ],
        reversed: () => [25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9,  8,  7,  6,  5,  4,  3,  2,  1 ]
    };

    class Nodes {
        getCollectionIndex(collection) {
            switch (collection) {
                case 'ordered': return 0;
                case 'shuffled': return 1;
                case 'reversed': return 2;
            }
        }

        onDone() {
            this.lines.attr('class', 'done');
            this.done = true;
        }

        highlight(index, good = false) {
            let line = d3.select(this.lines[0][index]);
            line.attr('class', good ? 'highlight': 'swap');
            setTimeout(line.binded('attr').partial('class', ''), this.sa.pause);
        }

        swap(a, b) {
            this.nodes.swap(a, b);
            this.highlight(a);
            this.highlight(b);
            let aLine = d3.select(this.lines[0][a]);
            let bLine = d3.select(this.lines[0][b]);
            this.lines[0].swap(a, b);
            let ay = aLine.attr('y');
            let by = bLine.attr('y');
            aLine.attr('y', by);
            bLine.attr('y', ay);
        }

        constructor(sa, collection) {
            this.startY = 60 + (this.getCollectionIndex(collection) * 110);
            this.collection = collection;
            this.sa = sa;

            this.text = sa.svg
                .append('text')
                .text(collection.capitalize() + ':')
                .attr('class', 'description')
                .attr('y', this.startY - 10);

            this.build();
        }

        build() {
            this.nodes = data[this.collection]();
            this.algorithm = this.sa.algorithm(this.nodes);

            this.lines = this.sa.svg
                .append('g')
                .selectAll('rect')
                .data(this.nodes)
                .enter().append('rect')
                .attr('x', 0)
                .attr('y', (d, i) => this.startY + (i * 3))
                .attr('width', d => d * 4)
                .attr('height', 1);
        }

        destroy() {
            this.lines.remove();
        }

        iterate() {
            let result = this.algorithm.next();

            if (result.done) {
                this.onDone();
                return;
            }

            if (result.value.good) {
                this.highlight(result.value.a, true);
                this.highlight(result.value.b, true);
            }

            else
                this.swap(result.value.a, result.value.b);

            setTimeout(this.binded('iterate'), this.sa.pause);
        }

        sort() {
            if (this.done) {
                this.destroy();
                this.build();
            }

            this.iterate();
        }
    }

    return class SortingAlgorithm {
        createButton() {
            this.button = this.svg
                .append('rect')
                .attr('class', 'button')
                .attr('x', 0)
                .attr('y', 372)
                .attr('width', 120)
                .attr('height', 27)
                .attr('rx', 5)
                .on('click', this.binded('sort'));

            this.svg
                .append('text')
                .text('Sort')
                .attr('x', 42)
                .attr('y', 391)
                .attr('pointer-events', 'none');
        }

        constructor(name, algorithm, pause = 10) {
            this.pause = pause;
            this.name = name;
            this.algorithm = algorithm;
            this.svg = d3.select(document.getElementById('sorting')).append('svg');
            this.svg.append('text').text(this.name).attr('y', 20);

            for (let collection of ['ordered', 'shuffled', 'reversed'])
                this[collection] = new Nodes(this, collection);

            this.createButton();
        }

        sort() {
            this.ordered.sort();
            this.shuffled.sort();
            this.reversed.sort();
        }
    };
});
