this.modules = this.modules || {};
this.modules.sorting = (function (Vue) {
'use strict';

Vue = 'default' in Vue ? Vue['default'] : Vue;

function noop() {}

function noopAsync() {
    return Promise.resolve();
}

function identity(value) {
    return value;
}

function factorize(value) {
    var transform = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : identity;

    return function () {
        return transform(value);
    };
}

function functionize(value) {
    return value instanceof Function ? value : factorize(value);
}

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

function getTitle(name, title) {
    if (!title) return factorize([name]);

    if (typeof title === 'string') return factorize([title]);

    return functionize(title);
}

var View = function View(_ref) {
    var name = _ref.name,
        title = _ref.title,
        component = _ref.component,
        testPath = _ref.testPath,
        _ref$inject = _ref.inject,
        inject = _ref$inject === undefined ? false : _ref$inject,
        _ref$resolve = _ref.resolve,
        resolve = _ref$resolve === undefined ? noopAsync : _ref$resolve;
    classCallCheck(this, View);

    Object.assign(this, {
        name: name, component: component, resolve: resolve,
        testPath: testPath || function (path) {
            return path === '/' + name;
        },
        getTitle: getTitle(name, title)
    });

    if (inject) Vue.component(component.options.name, component);

    Object.freeze(this);
};

var template = "<div class=\"radio\"><label v-for=\"item in domain\" :class=\"{ active: item.value === value }\"><button @click=\"onChange(item.value)\">{{ item.text }}</button></label></div>";

var Radio = Vue.extend({
    template: template,

    props: {
        value: { required: true },
        domain: { type: Array, required: true },
        onChange: { type: Function, required: true }
    }
});

var Scheduler = function () {
    createClass(Scheduler, [{
        key: 'isRunning',
        get: function get() {
            return this.interval !== null;
        }
    }]);

    function Scheduler(period) {
        var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        classCallCheck(this, Scheduler);

        this.interval = null;
        this.period = period;
        this.callback = callback || noop;
    }

    createClass(Scheduler, [{
        key: 'start',
        value: function start() {
            this.stop();
            this.interval = setInterval(this.callback, this.period);
        }
    }, {
        key: 'stop',
        value: function stop() {
            clearInterval(this.interval);
            this.interval = null;
        }
    }]);
    return Scheduler;
}();

function last(array) {
    if (!(array.length > 0)) {
        throw new Error('Function "last" precondition failed: array.length > 0');
    }

    return array[array.length - 1];
}

var PERIODS = [{ 'text': 'Slow', value: 500 }, { 'text': 'Medium', value: 100 }, { 'text': 'Fast', value: 10 }];

var DEFAULT_PERIOD = last(PERIODS).value;

var template$1 = "<div class=\"sorting-sorter\"><p class=\"sorting-demo-heading\">{{ name }}</p><div class=\"sorting-demo-lines\" :class=\"{ complete: complete }\"><div v-for=\"item in array\" :style=\"{ width: getWidth(item) }\"></div></div></div>";

var bus = new Vue();

var Sorter = Vue.extend({
    template: template$1,

    props: {
        period: { type: Number, required: true },
        name: { type: String, required: true },
        prototype: { type: Array, required: true },
        algorithm: { type: Object, required: true }
    },

    data: function data() {
        return {
            scheduler: new Scheduler(DEFAULT_PERIOD),
            iterator: null,
            complete: false,
            lastChanged: [],
            array: []
        };
    },

    computed: {
        ratio: function ratio(context) {
            return 100 / context.array.length;
        },
        rawNodes: function rawNodes(context) {
            return context.$el.lastChild.children;
        }
    },

    methods: {
        getWidth: function getWidth(item) {
            return item * this.ratio + '%';
        },
        swap: function swap(a, b) {
            var temp = this.array[a];
            Vue.set(this.array, a, this.array[b]);
            Vue.set(this.array, b, temp);
        },
        clearLastChanged: function clearLastChanged() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.lastChanged[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var index = _step.value;

                    this.rawNodes[index].className = '';
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            this.lastChanged = [];
        },


        // The update itself is done cleanly with Vue, hovewer changing the css classes is not
        iteration: function iteration() {
            var result = this.iterator.next();
            this.clearLastChanged();

            if (result.done) {
                this.complete = true;
                return;
            }

            var _result$value = result.value,
                a = _result$value.a,
                b = _result$value.b;


            if (result.value.swap) this.swap(a, b);

            try {
                this.rawNodes[a].className = this.rawNodes[b].className = result.value.swap ? 'swapped' : 'still';
            } catch (e) {
                this.scheduler.stop();
            }
            this.lastChanged = [a, b];
        },
        reinitialize: function reinitialize() {
            this.scheduler.stop();
            this.clearLastChanged();
            this.array = Object.create(this.prototype);
            this.iterator = this.algorithm.instantiate(this.array);
            this.complete = false;
        },
        sort: function sort(algorithm) {
            if (!algorithm || algorithm === this.algorithm) {
                this.reinitialize();
                this.scheduler.start();
            }
        }
    },

    watch: {
        prototype: function prototype() {
            this.reinitialize();
        },
        period: function period() {
            var start = this.scheduler.isRunning;

            this.scheduler.stop();
            this.scheduler.period = this.period;

            if (start) this.scheduler.start();
        }
    },

    mounted: function mounted() {
        this.reinitialize();
        this.scheduler.callback = this.iteration;
        bus.$on('sort', this.sort);
    },
    beforeDestroy: function beforeDestroy() {
        this.scheduler.stop();
        bus.$off('sort', this.sort);
    }
});

var sorters = [{
    name: 'Ordered',
    prototype: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
}, {
    name: 'Shuffled',
    prototype: [13, 4, 3, 19, 6, 15, 9, 22, 16, 21, 12, 8, 7, 24, 18, 2, 25, 1, 23, 5, 14, 17, 20, 10, 11]
}, {
    name: 'Reversed',
    prototype: [25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
}, {
    name: 'Groupped',
    prototype: [25, 20, 10, 15, 25, 25, 5, 5, 5, 20, 10, 5, 15, 20, 15, 25, 15, 20, 25, 10, 15, 10, 5, 20, 10]
}];

var template$2 = "<div class=\"sorting-demo-container\"><div class=\"sorting-demo\"><div class=\"sorting-demo-section\"><p class=\"sorting-demo-title\">{{ algorithm.name }}</p></div><div class=\"sorting-demo-section\"><Sorter class=\"sorting-demo-subsection\" v-for=\"sorter in sorters\" :period=\"period\" :name=\"sorter.name\" :algorithm=\"algorithm\" :prototype=\"sorter.prototype\"></Sorter></div><div class=\"sorting-demo-section\" v-html=\"algorithm.description\"></div><div class=\"sorting-demo-section\"><button @click=\"sort\">Sort</button></div></div></div>";

var Demo = Vue.extend({
    template: template$2,
    components: { Sorter: Sorter },

    props: {
        period: { type: Number, required: true },
        algorithm: { type: Object, required: true }
    },

    data: factorize({
        sorters: sorters
    }),

    methods: {
        sort: function sort() {
            bus.$emit('sort', this.algorithm);
        }
    }
});

function findMinIndex(array) {
    var min = Infinity,
        minIndex = 0;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = array.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _step$value = slicedToArray(_step.value, 2),
                index = _step$value[0],
                value = _step$value[1];

            if (value < min) {
                min = value;
                minIndex = index;
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return minIndex;
}

var Algorithm = function () {
    createClass(Algorithm, null, [{
        key: 'totalOrder',
        value: function totalOrder(array) {
            var copy = Array.from(array);
            var result = [];

            for (var i = 0; i < copy.length; i++) {
                var minIndex = findMinIndex(copy);
                copy[minIndex] = Infinity;
                result[minIndex] = i;
            }

            return result;
        }
    }]);

    function Algorithm(name, description, sorter) {
        classCallCheck(this, Algorithm);

        Object.assign(this, { name: name, description: description, sorter: sorter });
        Object.freeze(this);
    }

    createClass(Algorithm, [{
        key: 'instantiate',
        value: function instantiate(array) {
            var uniq = Algorithm.totalOrder(array);
            var result = [];

            Object.defineProperty(uniq, 'swap', {
                value: function value(a, b, swap) {
                    result.push({ a: a, b: b, swap: swap });

                    if (swap) {
                        ;

                        var _ref = [this[b], this[a]];
                        this[a] = _ref[0];
                        this[b] = _ref[1];
                    }return last(result);
                }
            });

            this.sorter(uniq);
            return result[Symbol.iterator]();
        }
    }]);
    return Algorithm;
}();

var template$3 = "<div><p>Stable:</p><p>True</p></div><div><p>Time complexity:</p><p><span class=\"katex\"><span class=\"katex-mathml\"><math><semantics><mrow><mrow><mi mathvariant=\"script\">O</mi></mrow><mo>(</mo><msup><mi>n</mi><mn>2</mn></msup><mo>)</mo></mrow><annotation encoding=\"application/x-tex\">\mathcal{O}(n^2)\n</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"strut\" style=\"height:0.8141079999999999em;\"></span><span class=\"strut bottom\" style=\"height:1.064108em;vertical-align:-0.25em;\"></span><span class=\"base textstyle uncramped\"><span class=\"mord textstyle uncramped\"><span class=\"mord mathcal\" style=\"margin-right:0.02778em;\">O</span></span><span class=\"mopen\">(</span><span class=\"mord\"><span class=\"mord mathit\">n</span><span class=\"vlist\"><span style=\"top:-0.363em;margin-right:0.05em;\"><span class=\"fontsize-ensurer reset-size5 size5\"><span style=\"font-size:0em;\">​</span></span><span class=\"reset-textstyle scriptstyle uncramped\"><span class=\"mord mathrm\">2</span></span></span><span class=\"baseline-fix\"><span class=\"fontsize-ensurer reset-size5 size5\"><span style=\"font-size:0em;\">​</span></span>​</span></span></span><span class=\"mclose\">)</span></span></span></span></p></div><div><p>Space complexity:</p><p><span class=\"katex\"><span class=\"katex-mathml\"><math><semantics><mrow><mi mathvariant=\"normal\">Θ</mi><mo>(</mo><mn>1</mn><mo>)</mo></mrow><annotation encoding=\"application/x-tex\">\Theta(1)</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"strut\" style=\"height:0.75em;\"></span><span class=\"strut bottom\" style=\"height:1em;vertical-align:-0.25em;\"></span><span class=\"base textstyle uncramped\"><span class=\"mord mathrm\">Θ</span><span class=\"mopen\">(</span><span class=\"mord mathrm\">1</span><span class=\"mclose\">)</span></span></span></span></p></div>";

function sorter(array) {
    for (var i = 1; i < array.length; i++) {
        for (var j = i; j > 0; --j) {
            array.swap(j - 1, j, array[j - 1] > array[j]);
        }
    }
}

var Insertion = new Algorithm('Insertion sort', template$3, sorter);

var template$4 = "<div><p>Stable:</p><p>False</p></div><div><p>Time complexity:</p><p><span class=\"katex\"><span class=\"katex-mathml\"><math><semantics><mrow><mi mathvariant=\"normal\">Θ</mi><mo>(</mo><msup><mi>n</mi><mn>2</mn></msup><mo>)</mo></mrow><annotation encoding=\"application/x-tex\">\Theta(n^2)\n</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"strut\" style=\"height:0.8141079999999999em;\"></span><span class=\"strut bottom\" style=\"height:1.064108em;vertical-align:-0.25em;\"></span><span class=\"base textstyle uncramped\"><span class=\"mord mathrm\">Θ</span><span class=\"mopen\">(</span><span class=\"mord\"><span class=\"mord mathit\">n</span><span class=\"vlist\"><span style=\"top:-0.363em;margin-right:0.05em;\"><span class=\"fontsize-ensurer reset-size5 size5\"><span style=\"font-size:0em;\">​</span></span><span class=\"reset-textstyle scriptstyle uncramped\"><span class=\"mord mathrm\">2</span></span></span><span class=\"baseline-fix\"><span class=\"fontsize-ensurer reset-size5 size5\"><span style=\"font-size:0em;\">​</span></span>​</span></span></span><span class=\"mclose\">)</span></span></span></span></p></div><div><p>Space complexity:</p><p><span class=\"katex\"><span class=\"katex-mathml\"><math><semantics><mrow><mi mathvariant=\"normal\">Θ</mi><mo>(</mo><mn>1</mn><mo>)</mo></mrow><annotation encoding=\"application/x-tex\">\Theta(1)</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"strut\" style=\"height:0.75em;\"></span><span class=\"strut bottom\" style=\"height:1em;vertical-align:-0.25em;\"></span><span class=\"base textstyle uncramped\"><span class=\"mord mathrm\">Θ</span><span class=\"mopen\">(</span><span class=\"mord mathrm\">1</span><span class=\"mclose\">)</span></span></span></span></p></div>";

function sorter$1(array) {
    for (var i = 0; i < array.length - 1; i++) {
        var min = i;

        for (var j = i; j < array.length; j++) {
            array.swap(i, j, false);

            if (array[j] < array[min]) min = j;
        }

        array.swap(min, i, min !== i);
    }
}

var Selection = new Algorithm('Selection sort', template$4, sorter$1);

var template$5 = "<div><p>Stable:</p><p>True</p></div><div><p>Time complexity:</p><p><span class=\"katex\"><span class=\"katex-mathml\"><math><semantics><mrow><mrow><mi mathvariant=\"script\">O</mi></mrow><mo>(</mo><msup><mi>n</mi><mn>2</mn></msup><mo>)</mo></mrow><annotation encoding=\"application/x-tex\">\mathcal{O}(n^2)\n</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"strut\" style=\"height:0.8141079999999999em;\"></span><span class=\"strut bottom\" style=\"height:1.064108em;vertical-align:-0.25em;\"></span><span class=\"base textstyle uncramped\"><span class=\"mord textstyle uncramped\"><span class=\"mord mathcal\" style=\"margin-right:0.02778em;\">O</span></span><span class=\"mopen\">(</span><span class=\"mord\"><span class=\"mord mathit\">n</span><span class=\"vlist\"><span style=\"top:-0.363em;margin-right:0.05em;\"><span class=\"fontsize-ensurer reset-size5 size5\"><span style=\"font-size:0em;\">​</span></span><span class=\"reset-textstyle scriptstyle uncramped\"><span class=\"mord mathrm\">2</span></span></span><span class=\"baseline-fix\"><span class=\"fontsize-ensurer reset-size5 size5\"><span style=\"font-size:0em;\">​</span></span>​</span></span></span><span class=\"mclose\">)</span></span></span></span></p></div><div><p>Space complexity:</p><p><span class=\"katex\"><span class=\"katex-mathml\"><math><semantics><mrow><mi mathvariant=\"normal\">Θ</mi><mo>(</mo><mn>1</mn><mo>)</mo></mrow><annotation encoding=\"application/x-tex\">\Theta(1)</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"strut\" style=\"height:0.75em;\"></span><span class=\"strut bottom\" style=\"height:1em;vertical-align:-0.25em;\"></span><span class=\"base textstyle uncramped\"><span class=\"mord mathrm\">Θ</span><span class=\"mopen\">(</span><span class=\"mord mathrm\">1</span><span class=\"mclose\">)</span></span></span></span></p></div>";

function sorter$2(array) {
    var ordered = false;

    while (!ordered) {
        ordered = true;

        for (var i = 1; i < array.length; i++) {
            var current = array[i - 1] <= array[i];
            ordered &= current;
            array.swap(i - 1, i, !current);
        }
    }
}

var Bubble = new Algorithm('Bubble sort', template$5, sorter$2);

var template$6 = "<div><p>Stable:</p><p>True</p></div><div><p>Time complexity:</p><p><span class=\"katex\"><span class=\"katex-mathml\"><math><semantics><mrow><mrow><mi mathvariant=\"script\">O</mi></mrow><mo>(</mo><msup><mi>n</mi><mn>2</mn></msup><mo>)</mo></mrow><annotation encoding=\"application/x-tex\">\mathcal{O}(n^2)\n</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"strut\" style=\"height:0.8141079999999999em;\"></span><span class=\"strut bottom\" style=\"height:1.064108em;vertical-align:-0.25em;\"></span><span class=\"base textstyle uncramped\"><span class=\"mord textstyle uncramped\"><span class=\"mord mathcal\" style=\"margin-right:0.02778em;\">O</span></span><span class=\"mopen\">(</span><span class=\"mord\"><span class=\"mord mathit\">n</span><span class=\"vlist\"><span style=\"top:-0.363em;margin-right:0.05em;\"><span class=\"fontsize-ensurer reset-size5 size5\"><span style=\"font-size:0em;\">​</span></span><span class=\"reset-textstyle scriptstyle uncramped\"><span class=\"mord mathrm\">2</span></span></span><span class=\"baseline-fix\"><span class=\"fontsize-ensurer reset-size5 size5\"><span style=\"font-size:0em;\">​</span></span>​</span></span></span><span class=\"mclose\">)</span></span></span></span></p></div><div><p>Space complexity:</p><p><span class=\"katex\"><span class=\"katex-mathml\"><math><semantics><mrow><mi mathvariant=\"normal\">Θ</mi><mo>(</mo><mn>1</mn><mo>)</mo></mrow><annotation encoding=\"application/x-tex\">\Theta(1)</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"strut\" style=\"height:0.75em;\"></span><span class=\"strut bottom\" style=\"height:1em;vertical-align:-0.25em;\"></span><span class=\"base textstyle uncramped\"><span class=\"mord mathrm\">Θ</span><span class=\"mopen\">(</span><span class=\"mord mathrm\">1</span><span class=\"mclose\">)</span></span></span></span></p></div>";

function sorter$3(array) {
    for (var pos = 0; pos < array.length;) {
        var swap = pos !== 0 && array[pos - 1] > array[pos];
        array.swap(Math.max(0, pos - 1), pos, swap);

        if (swap) pos--;else pos++;
    }
}

var Gnome = new Algorithm('Gnome sort', template$6, sorter$3);

var template$7 = "<div><p>Stable:</p><p>False</p></div><div><p>Time complexity:</p><p><span class=\"katex\"><span class=\"katex-mathml\"><math><semantics><mrow><mrow><mi mathvariant=\"script\">O</mi></mrow><mo>(</mo><msup><mi>n</mi><mn>2</mn></msup><mo>)</mo></mrow><annotation encoding=\"application/x-tex\">\mathcal{O}(n^2)\n</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"strut\" style=\"height:0.8141079999999999em;\"></span><span class=\"strut bottom\" style=\"height:1.064108em;vertical-align:-0.25em;\"></span><span class=\"base textstyle uncramped\"><span class=\"mord textstyle uncramped\"><span class=\"mord mathcal\" style=\"margin-right:0.02778em;\">O</span></span><span class=\"mopen\">(</span><span class=\"mord\"><span class=\"mord mathit\">n</span><span class=\"vlist\"><span style=\"top:-0.363em;margin-right:0.05em;\"><span class=\"fontsize-ensurer reset-size5 size5\"><span style=\"font-size:0em;\">​</span></span><span class=\"reset-textstyle scriptstyle uncramped\"><span class=\"mord mathrm\">2</span></span></span><span class=\"baseline-fix\"><span class=\"fontsize-ensurer reset-size5 size5\"><span style=\"font-size:0em;\">​</span></span>​</span></span></span><span class=\"mclose\">)</span></span></span></span></p></div><div><p>Space complexity:</p><p><span class=\"katex\"><span class=\"katex-mathml\"><math><semantics><mrow><mi mathvariant=\"normal\">Θ</mi><mo>(</mo><mn>1</mn><mo>)</mo></mrow><annotation encoding=\"application/x-tex\">\Theta(1)</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"strut\" style=\"height:0.75em;\"></span><span class=\"strut bottom\" style=\"height:1em;vertical-align:-0.25em;\"></span><span class=\"base textstyle uncramped\"><span class=\"mord mathrm\">Θ</span><span class=\"mopen\">(</span><span class=\"mord mathrm\">1</span><span class=\"mclose\">)</span></span></span></span></p></div>";

function sorter$4(array) {
    for (var gap = Math.pow(2, Math.floor(Math.log2(array.length))); gap >= 1; gap /= 2) {
        for (var i = gap; i < array.length; i++) {
            var j = i;
            var swappable = i;

            while (j >= gap) {
                var a = j,
                    b = j - gap;
                var swap = array[b] > array[swappable];
                array.swap(a, b, swap);

                if (swap) {
                    if (swappable === b) swappable = a;
                    if (swappable === a) swappable = b;
                } else {
                    break;
                }

                j -= gap;
            }

            array.swap(j, swappable, true);
        }
    }
}

var Shell = new Algorithm('Shell sort', template$7, sorter$4);

var template$8 = "<div><p>Stable:</p><p>True</p></div><div><p>Time complexity:</p><p><span class=\"katex\"><span class=\"katex-mathml\"><math><semantics><mrow><mrow><mi mathvariant=\"script\">O</mi></mrow><mo>(</mo><mi>n</mi><mi>log</mi><mi>n</mi><mo>)</mo></mrow><annotation encoding=\"application/x-tex\">\mathcal{O}(n \log n)\n</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"strut\" style=\"height:0.75em;\"></span><span class=\"strut bottom\" style=\"height:1em;vertical-align:-0.25em;\"></span><span class=\"base textstyle uncramped\"><span class=\"mord textstyle uncramped\"><span class=\"mord mathcal\" style=\"margin-right:0.02778em;\">O</span></span><span class=\"mopen\">(</span><span class=\"mord mathit\">n</span><span class=\"mop\">lo<span style=\"margin-right:0.01389em;\">g</span></span><span class=\"mord mathit\">n</span><span class=\"mclose\">)</span></span></span></span></p></div><div><p>Space complexity:</p><p><span class=\"katex\"><span class=\"katex-mathml\"><math><semantics><mrow><mrow><mi mathvariant=\"script\">O</mi></mrow><mo>(</mo><mi>n</mi><mo>)</mo></mrow><annotation encoding=\"application/x-tex\">\mathcal{O}(n)</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"strut\" style=\"height:0.75em;\"></span><span class=\"strut bottom\" style=\"height:1em;vertical-align:-0.25em;\"></span><span class=\"base textstyle uncramped\"><span class=\"mord textstyle uncramped\"><span class=\"mord mathcal\" style=\"margin-right:0.02778em;\">O</span></span><span class=\"mopen\">(</span><span class=\"mord mathit\">n</span><span class=\"mclose\">)</span></span></span></span></p></div>";

function sorter$5(array) {
    var buffer = [];

    for (var span = 1; span < array.length; span *= 2) {
        for (var start = 0; start < array.length; start += 2 * span) {
            var middle = Math.min(start + span, array.length),
                end = Math.min(start + 2 * span, array.length);

            var left = start,
                right = middle;

            for (var i = start; i < end; i++) {
                if (left < middle && (end === right || array[left] < array[right])) buffer[i] = array[left++];else buffer[i] = array[right++];
            }for (var _i = start; _i < end; _i++) {
                var index = array.indexOf(buffer[_i]);
                array.swap(index, _i, _i !== index);
            }
        }
    }
}

var Merge = new Algorithm('Merge sort (bottom-up)', template$8, sorter$5);

var template$9 = "<div><p>Stable:</p><p>False</p></div><div><p>Time complexity:</p><p><span class=\"katex\"><span class=\"katex-mathml\"><math><semantics><mrow><mrow><mi mathvariant=\"script\">O</mi></mrow><mo>(</mo><mi>n</mi><mi>log</mi><mi>n</mi><mo>)</mo></mrow><annotation encoding=\"application/x-tex\">\mathcal{O}(n \log n)\n</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"strut\" style=\"height:0.75em;\"></span><span class=\"strut bottom\" style=\"height:1em;vertical-align:-0.25em;\"></span><span class=\"base textstyle uncramped\"><span class=\"mord textstyle uncramped\"><span class=\"mord mathcal\" style=\"margin-right:0.02778em;\">O</span></span><span class=\"mopen\">(</span><span class=\"mord mathit\">n</span><span class=\"mop\">lo<span style=\"margin-right:0.01389em;\">g</span></span><span class=\"mord mathit\">n</span><span class=\"mclose\">)</span></span></span></span></p></div><div><p>Space complexity:</p><p><span class=\"katex\"><span class=\"katex-mathml\"><math><semantics><mrow><mi mathvariant=\"normal\">Θ</mi><mo>(</mo><mn>1</mn><mo>)</mo></mrow><annotation encoding=\"application/x-tex\">\Theta(1)</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"strut\" style=\"height:0.75em;\"></span><span class=\"strut bottom\" style=\"height:1em;vertical-align:-0.25em;\"></span><span class=\"base textstyle uncramped\"><span class=\"mord mathrm\">Θ</span><span class=\"mopen\">(</span><span class=\"mord mathrm\">1</span><span class=\"mclose\">)</span></span></span></span></p></div>";

function sorter$6(array) {
    function heapCheck(heapSize, i) {
        var largest = [i, 2 * i + 1, 2 * i + 2].filter(function (x) {
            return x < heapSize;
        }).reduce(function (x, payload) {
            return array[x] >= array[payload] ? x : payload;
        }); // Max by array[x]

        return array.swap(i, largest, i !== largest);
    }

    for (var i = Math.floor(array.length / 2); i >= 0; --i) {
        var result = heapCheck(array.length, i);

        while (result.swap) {
            result = heapCheck(array.length, result.b);
        }
    }

    for (var _i = array.length - 1; _i >= 1; --_i) {
        array.swap(0, _i, true);
        var _result = heapCheck(_i, 0);

        while (_result.swap) {
            _result = heapCheck(_i, _result.b);
        }
    }
}

var Heap = new Algorithm('Heap sort', template$9, sorter$6);

function randomInt(min, max) {
    return min + Math.round(Math.random() * (max - min));
}

var template$10 = "<div><p>Stable:</p><p>False</p></div><div><p>Time complexity:</p><p><span class=\"katex\"><span class=\"katex-mathml\"><math><semantics><mrow><mrow><mi mathvariant=\"script\">O</mi></mrow><mo>(</mo><msup><mi>n</mi><mn>2</mn></msup><mo>)</mo></mrow><annotation encoding=\"application/x-tex\">\mathcal{O}(n^2)\n</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"strut\" style=\"height:0.8141079999999999em;\"></span><span class=\"strut bottom\" style=\"height:1.064108em;vertical-align:-0.25em;\"></span><span class=\"base textstyle uncramped\"><span class=\"mord textstyle uncramped\"><span class=\"mord mathcal\" style=\"margin-right:0.02778em;\">O</span></span><span class=\"mopen\">(</span><span class=\"mord\"><span class=\"mord mathit\">n</span><span class=\"vlist\"><span style=\"top:-0.363em;margin-right:0.05em;\"><span class=\"fontsize-ensurer reset-size5 size5\"><span style=\"font-size:0em;\">​</span></span><span class=\"reset-textstyle scriptstyle uncramped\"><span class=\"mord mathrm\">2</span></span></span><span class=\"baseline-fix\"><span class=\"fontsize-ensurer reset-size5 size5\"><span style=\"font-size:0em;\">​</span></span>​</span></span></span><span class=\"mclose\">)</span></span></span></span></p></div><div><p>Space complexity:</p><p><span class=\"katex\"><span class=\"katex-mathml\"><math><semantics><mrow><mrow><mi mathvariant=\"script\">O</mi></mrow><mo>(</mo><mi>n</mi><mo>)</mo></mrow><annotation encoding=\"application/x-tex\">\mathcal{O}(n)</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"strut\" style=\"height:0.75em;\"></span><span class=\"strut bottom\" style=\"height:1em;vertical-align:-0.25em;\"></span><span class=\"base textstyle uncramped\"><span class=\"mord textstyle uncramped\"><span class=\"mord mathcal\" style=\"margin-right:0.02778em;\">O</span></span><span class=\"mopen\">(</span><span class=\"mord mathit\">n</span><span class=\"mclose\">)</span></span></span></span></p></div>";

function sorter$7(array) {
    function partition(lower, upper) {
        var pivotIndex = randomInt(lower, upper);
        var pivot = array[pivotIndex];
        var p = lower;

        array.swap(pivotIndex, upper, pivotIndex !== upper);

        for (var i = lower; i < upper; i++) {
            if (array[i] < pivot) array.swap(i, p++, true);else array.swap(i, p, false);
        }return array.swap(p, upper, true).a;
    }

    function quicksort(lower, upper) {
        var pivotIndex = partition(lower, upper);

        if (lower < pivotIndex) quicksort(lower, pivotIndex);

        if (upper > pivotIndex + 1) quicksort(pivotIndex + 1, upper);
    }

    quicksort(0, array.length - 1);
}

var Quick = new Algorithm('QuickSort (randomized Lomuto partitioning)', template$10, sorter$7);

var algorithms = [Insertion, Selection, Bubble, Gnome, Shell, Merge, Heap, Quick];

var template$11 = "<div class=\"code-sorting-view\"><h1 id=\"sorting\">Sorting</h1>\n<p>A visual comparison of array sorting algorithms. Inspired by <a href=\"http://sorting-algorithms.com\">sorting-algorithms.com</a>.</p>\n<b class=\"highlight\">Legend:</b><p>The worst-case time and auxiliary space complexities are presented. After clicking one of the <strong><em>&#39;sort&#39;</em></strong> buttons, the small lines will begin to rearrange and change colors. Green means that the two lines were swapped, red means that they were not. You can run all algorithms at once to compare them.</p>\n<b class=\"highlight\">Animation speed:</b><Radio class=\"sorting-radio\" :value=\"period\" :domain=\"domain\" :onChange=\"onPeriodChange\"></Radio><button class=\"sorting-sortall\" @click=\"sortall\">Sort all</button><template v-for=\"algorithm in algorithms\"><Demo :algorithm=\"algorithm\" :period=\"period\"></Demo></template></div>";

var view = new View({
    name: 'code/sorting',
    title: ['code', 'sorting'],
    inject: true,

    component: Vue.extend({
        name: 'CodeSorting',
        template: template$11,
        components: { Radio: Radio, Demo: Demo },

        data: factorize({
            algorithms: algorithms,
            period: DEFAULT_PERIOD,
            domain: PERIODS
        }),

        methods: {
            sortall: function sortall() {
                bus.$emit('sort');
            },
            onPeriodChange: function onPeriodChange(value) {
                this.period = value;
            }
        }
    })
});

return view;

}(Vue));
//# sourceMappingURL=sorting.js.map
