this.modules = this.modules || {};
(function (Vue) {
'use strict';

Vue = 'default' in Vue ? Vue['default'] : Vue;

(function (self) {
  'use strict';

  if (self.fetch) {
    return;
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && function () {
      try {
        new Blob();
        return true;
      } catch (e) {
        return false;
      }
    }(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name');
    }
    return name.toLowerCase();
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value;
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function next() {
        var value = items.shift();
        return { done: value === undefined, value: value };
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function () {
        return iterator;
      };
    }

    return iterator;
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function (value, name) {
        this.append(name, value);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function (name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function (name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var list = this.map[name];
    if (!list) {
      list = [];
      this.map[name] = list;
    }
    list.push(value);
  };

  Headers.prototype['delete'] = function (name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function (name) {
    var values = this.map[normalizeName(name)];
    return values ? values[0] : null;
  };

  Headers.prototype.getAll = function (name) {
    return this.map[normalizeName(name)] || [];
  };

  Headers.prototype.has = function (name) {
    return this.map.hasOwnProperty(normalizeName(name));
  };

  Headers.prototype.set = function (name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)];
  };

  Headers.prototype.forEach = function (callback, thisArg) {
    Object.getOwnPropertyNames(this.map).forEach(function (name) {
      this.map[name].forEach(function (value) {
        callback.call(thisArg, value, name, this);
      }, this);
    }, this);
  };

  Headers.prototype.keys = function () {
    var items = [];
    this.forEach(function (value, name) {
      items.push(name);
    });
    return iteratorFor(items);
  };

  Headers.prototype.values = function () {
    var items = [];
    this.forEach(function (value) {
      items.push(value);
    });
    return iteratorFor(items);
  };

  Headers.prototype.entries = function () {
    var items = [];
    this.forEach(function (value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items);
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'));
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function (resolve, reject) {
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function () {
        reject(reader.error);
      };
    });
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    return fileReaderReady(reader);
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    reader.readAsText(blob);
    return fileReaderReady(reader);
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function (body) {
      this._bodyInit = body;
      if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (!body) {
        this._bodyText = '';
      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
        // Only support ArrayBuffers for POST method.
        // Receiving ArrayBuffers happens via Blobs, instead.
      } else {
        throw new Error('unsupported BodyInit type');
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function () {
        var rejected = consumed(this);
        if (rejected) {
          return rejected;
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob);
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob');
        } else {
          return Promise.resolve(new Blob([this._bodyText]));
        }
      };

      this.arrayBuffer = function () {
        return this.blob().then(readBlobAsArrayBuffer);
      };

      this.text = function () {
        var rejected = consumed(this);
        if (rejected) {
          return rejected;
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob);
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text');
        } else {
          return Promise.resolve(this._bodyText);
        }
      };
    } else {
      this.text = function () {
        var rejected = consumed(this);
        return rejected ? rejected : Promise.resolve(this._bodyText);
      };
    }

    if (support.formData) {
      this.formData = function () {
        return this.text().then(decode);
      };
    }

    this.json = function () {
      return this.text().then(JSON.parse);
    };

    return this;
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method;
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;
    if (Request.prototype.isPrototypeOf(input)) {
      if (input.bodyUsed) {
        throw new TypeError('Already read');
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      if (!body) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = input;
    }

    this.credentials = options.credentials || this.credentials || 'omit';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests');
    }
    this._initBody(body);
  }

  Request.prototype.clone = function () {
    return new Request(this);
  };

  function decode(body) {
    var form = new FormData();
    body.trim().split('&').forEach(function (bytes) {
      if (bytes) {
        var split = bytes.split('=');
        var name = split.shift().replace(/\+/g, ' ');
        var value = split.join('=').replace(/\+/g, ' ');
        form.append(decodeURIComponent(name), decodeURIComponent(value));
      }
    });
    return form;
  }

  function headers(xhr) {
    var head = new Headers();
    var pairs = (xhr.getAllResponseHeaders() || '').trim().split('\n');
    pairs.forEach(function (header) {
      var split = header.trim().split(':');
      var key = split.shift().trim();
      var value = split.join(':').trim();
      head.append(key, value);
    });
    return head;
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = options.statusText;
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function () {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    });
  };

  Response.error = function () {
    var response = new Response(null, { status: 0, statusText: '' });
    response.type = 'error';
    return response;
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function (url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code');
    }

    return new Response(null, { status: status, headers: { location: url } });
  };

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function (input, init) {
    return new Promise(function (resolve, reject) {
      var request;
      if (Request.prototype.isPrototypeOf(input) && !init) {
        request = input;
      } else {
        request = new Request(input, init);
      }

      var xhr = new XMLHttpRequest();

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL;
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL');
        }

        return;
      }

      xhr.onload = function () {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        };
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function () {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function () {
        reject(new TypeError('Network request failed'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function (value, name) {
        xhr.setRequestHeader(name, value);
      });

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    });
  };
  self.fetch.polyfill = true;
})(typeof self !== 'undefined' ? self : undefined);

var bus = new Vue();

Vue.directive('i-href', {
    deep: true,

    bind: function bind(el, binding) {
        binding.onClick = function (e) {
            e.preventDefault();
            bus.$emit('updatePath', binding.value);
        };

        el.addEventListener('click', binding.onClick);
    },
    update: function update(el, binding) {
        el.setAttribute('href', binding.value);
    },
    unbind: function unbind(el, binding) {
        el.removeEventListener('click', binding.onClick);
    }
});

var DEBUG = typeof PRODUCTION === 'undefined';

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

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

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

// BEGIN HACK: Extending the native error object is a bit "strange"
function ExtendableError(message) {
    Error.call(this, message);

    Object.defineProperty(this, 'message', {
        enumerable: false,
        value: message
    });

    Object.defineProperty(this, 'name', {
        enumerable: false,
        value: this.constructor.name
    });
}

ExtendableError.prototype = Error.prototype;
ExtendableError.prototype.constructor = ExtendableError;
// END HACK

var CoolError = function (_ExtendableError) {
    inherits(CoolError, _ExtendableError);

    function CoolError(message) {
        classCallCheck(this, CoolError);

        var _this = possibleConstructorReturn(this, (CoolError.__proto__ || Object.getPrototypeOf(CoolError)).call(this, message));

        _this.title = 'Error';
        return _this;
    }

    return CoolError;
}(ExtendableError);

CoolError.client = new CoolError('A client-side error occured');

var HTTPError = function (_CoolError) {
    inherits(HTTPError, _CoolError);

    function HTTPError(code, statusText) {
        classCallCheck(this, HTTPError);

        var _this2 = possibleConstructorReturn(this, (HTTPError.__proto__ || Object.getPrototypeOf(HTTPError)).call(this, statusText));

        _this2.title = 'HTTP Error ' + code;
        return _this2;
    }

    return HTTPError;
}(CoolError);

HTTPError.notFound = new HTTPError(404, 'Not found');


CoolError.HTTP = HTTPError;

var Cache = function () {
    function Cache(timeout) {
        classCallCheck(this, Cache);

        this.cleaners = new Map();
        this.payload = new Map();
        this.timeout = timeout;
    }

    createClass(Cache, [{
        key: "add",
        value: function add(key, value) {
            this.payload.set(key, value);
            this.resetTimer(key);
        }
    }, {
        key: "get",
        value: function get(key) {
            return this.payload.get(key);
        }
    }, {
        key: "has",
        value: function has(key) {
            return this.payload.has(key);
        }
    }, {
        key: "remove",
        value: function remove(key) {
            this.payload.delete(key);
            this.cleaners.delete(key);
        }
    }, {
        key: "resetTimer",
        value: function resetTimer(key) {
            var _this = this;

            if (this.cleaners.has(key)) clearTimeout(this.cleaners.get(key));

            this.cleaners.set(key, setTimeout(function () {
                return _this.remove(key);
            }, this.timeout));
        }
    }]);
    return Cache;
}();

var TABLET_WIDTH = 800;
var fetchCache = new Cache(10 * 1000);
var injected = new Set();

function pushState(location) {
    if (typeof history !== 'undefined') history.pushState({ path: window.location.pathname }, null, location);else window.location.pathname = location;
}

function fetch(url) {
    return window.fetch(url).then(function (response) {
        if (response.ok) return response;

        throw new CoolError.HTTP(response.status, response.statusText);
    });
}

function fetchJSON(url) {
    if (fetchCache.has(url)) return fetchCache.get(url);

    var promise = fetch(url).then(function (response) {
        return response.json();
    });

    fetchCache.add(url, promise);
    return promise;
}

function injectScript(name) {
    if (injected.has(name)) return Promise.resolve(window.modules[name]);

    return new Promise(function (resolve, reject) {
        var tag = document.createElement('script');
        tag.src = '/code/' + name + '.js';
        document.head.appendChild(tag);
        tag.onerror = reject;
        tag.onload = function () {
            injected.add(name);
            resolve(window.modules[name]);
        };
    });
}

function injectStylesheet(name) {
    if (injected.has(name)) return;

    var tag = document.createElement('link');
    tag.rel = 'stylesheet';
    tag.href = '/styles/' + name + '.css';
    document.head.appendChild(tag);
}

function updateWindowTitle(subtitles) {
    document.title = ['ivasilev.net'].concat(subtitles).join(' :: ');
}

function inGridtMode() {
    return window.innerWidth >= TABLET_WIDTH;
}

function getPath() {
    return decodeURI(window.location.pathname);
}

function on(event, callback) {
    window.addEventListener(event, callback);
    return off.bind(null, event, callback);
}

function off(event, callback) {
    window.removeEventListener(event, callback);
}

function documentReadyResolver() {
    if (document.readyState === 'complete') return Promise.resolve();

    return new Promise(function (resolve) {
        function listener() {
            unreg();
            resolve();
        }

        var unreg = on('DOMContentLoaded', listener);
    });
}

var SPRITE_URL = 'images/icons.svg';

var cached = null;
var fetchPromise = null;

function loadSheet() {
    if (cached !== null) return Promise.resolve(cached);

    if (fetchPromise !== null) return fetchPromise;

    fetchPromise = fetch(SPRITE_URL).then(function (response) {
        return response.text();
    }).then(function (text) {
        var wrapper = document.createElement('div');
        wrapper.innerHTML = text;

        var svg = wrapper.querySelector('svg');
        cached = new Map();

        var node = svg.firstChild;

        while (node !== null) {
            var next = node.nextSibling;
            cached.set(node.id, node);
            svg.removeChild(node);
            node = next;
        }

        return cached;
    });

    return fetchPromise;
}

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

function asyncFactorize(value) {
    return factorize(value, Promise.resolve.bind(Promise));
}

function constructs(constructor) {
    return function () {
        for (var _len = arguments.length, data = Array(_len), _key = 0; _key < _len; _key++) {
            data[_key] = arguments[_key];
        }

        return new (Function.prototype.bind.apply(constructor, [null].concat(data)))();
    };
}

function functionize(value) {
    return value instanceof Function ? value : factorize(value);
}

function accessor(accessor) {
    if (accessor instanceof Function) return accessor;

    if (accessor !== undefined) return function (value) {
        return value[accessor];
    };

    return identity;
}

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

var template = "<span class=\"icon-container\" :title=\"title\"><svg class=\"icon\" viewBox=\"0 0 20 20\" :style=\"{ transform: transform }\"></svg></span>";

var Icon = Vue.extend({
    template: template,

    props: {
        name: { type: String, required: true },
        title: { type: String, default: '' },
        rotate: { type: Number, default: 0 },
        verticalFlip: { type: Boolean, default: false },
        horizontalFlip: { type: Boolean, default: false }
    },

    data: function data() {
        return {
            oldName: null
        };
    },

    computed: {
        transform: function transform(context) {
            var transforms = [];

            if (context.verticalFlip) transforms.push('scaleY(-1)');

            if (context.horizontalFlip) transforms.push('scaleX(-1)');

            if (context.rotate) transforms.push('rotate(' + context.rotate + ')');

            return transforms.join(' ');
        }
    },

    methods: {
        updateCode: function updateCode(name) {
            var _this = this;

            Vue.set(this, 'oldName', name);

            loadSheet().then(function (hash) {
                if (!hash.has(name)) throw new CoolError('Cannot find SVG sprite "' + name + '"');

                var node = hash.get(name);
                var clone = node.cloneNode(true);
                var container = _this.$el.querySelector('svg');

                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }while (clone.firstChild) {
                    container.appendChild(clone.firstChild);
                }
            });
        }
    },

    watch: {
        name: function name() {
            this.updateCode(this.name);
        }
    },

    created: function created() {
        if (this.oldName !== this.name) this.updateCode(this.name);
    }
});

function basename(string) {
    var suffix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    var result = string.match(/([^\/]*)(?:\/+)?$/)[1];

    if (result.endsWith(suffix)) return result.replace(suffix, '');

    return result;
}

function groupBy(source) {
    var prop = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : identity;

    var result = {};
    var getter = accessor(prop);

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = source[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;

            var key = getter(item);

            if (key in result) result[key].push(item);else result[key] = [item];
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

    return result;
}

function mapToObject(source, transform) {
    var result = {};

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = source[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var item = _step2.value;

            var value = transform(item);
            result[value[0]] = value[1];
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    return result;
}

function startsWith(array, subarr) {
    return subarr.every(function (element, i) {
        return array[i] === element;
    });
}

function startsWithString(string, substr) {
    return string.slice(0, substr.length) === substr;
}

function repeat(value, goal) {
    return new Array(goal + 1).join(value);
}

var cow = '\n        o   ^__^\n         o  (oo)_______\n            (__)       )/\\\n                ||----w |\n                ||     ||\n';

function cowthink(message) {
    var lineLength = message.length + 2; // The 2 is for padding
    return ' ' + repeat('_', lineLength) + '\n( ' + message + ' )\n ' + repeat('-', lineLength) + cow;
}

var template$1 = "<div class=\"error-container\"><Icon name=\"warning\"></Icon><pre><code>{{ message }}</code></pre><p><span>Please try refreshing the browser or&nbsp;</span><a :href=\"bugurl\">reporting a bug</a></p></div>";

var NAME = 'Ianis G. Vasilev';
var EMAIL = 'mail@ivasilev.net';
var MAILTO = 'mailto:"' + NAME + '" <' + EMAIL + '>';
var GITHUB = 'https://github.com/v--';
var DEVIANTART = 'http://ianisvasilev.deviantart.com';
var LINKEDIN = 'https://bg.linkedin.com/in/ianisvasilev';
var FACEBOOK = 'https://www.facebook.com/ianis.vasilev';
var BUGREPORT = MAILTO + '?subject=ivasilev.net bug';
var CONTACTS = [{ name: 'Email', icon: 'email', uri: MAILTO }, { name: 'GitHub', icon: 'github', uri: GITHUB }, { name: 'DeviantArt', icon: 'deviantart', uri: DEVIANTART }, { name: 'LinkedIn', icon: 'linkedin', uri: LINKEDIN }, { name: 'Facebook', icon: 'facebook', uri: FACEBOOK }];

var component = Vue.extend({
    name: 'ErrorView',
    template: template$1,
    components: { Icon: Icon },

    props: {
        data: { type: Error, required: true }
    },

    data: factorize({
        bugurl: BUGREPORT
    }),

    computed: {
        message: function message(context) {
            return cowthink(context.error.title + ': ' + context.error.message);
        },
        error: function error() {
            if (this.data instanceof CoolError) return this.data;else return CoolError.client;
        }
    }
});

var ErrorView = new View({
    name: 'error',
    testPath: factorize(false),
    component: component
});

var DEFAULT_CONFIG = { view: null, route: null, subroutes: [], subroute: null, data: null };

var Page = function () {
    createClass(Page, null, [{
        key: 'fromError',
        value: function fromError(error) {
            return new Page({ view: ErrorView, data: error });
        }
    }]);

    function Page(config) {
        classCallCheck(this, Page);

        Object.assign(this, config);
        Object.freeze(this);
    }

    return Page;
}();

Page.blank = new Page(DEFAULT_CONFIG);

var template$2 = "<div class=\"home-view\"><h1 id=\"welcome-\">Welcome!</h1>\n<p>This is a simple personal website - nothing more.</p>\n<h2 id=\"about-me\">About me</h2>\n<p>My name is Ianis Vasilev (pronounce it however you want). For some reason, I am studying statistics at Sofia University. According to my contract I am a programmer and according to my ego I am also a musician. Otherwise I am a relatively sane person.</p>\n<h2 id=\"about-this-website\">About this website</h2>\n<p>This website contains random stuff that would otherwise be uploaded to other websites. Since you got here you probably need my <a href=\"/files\">file server</a> or my <a href=\"/pacman\">pacman</a> repo. I also have some <a href=\"/code\">code experiments</a>. Everything here should be pretty self-descriptive.</p>\n<h2>Contacts</h2><ul><li v-for=\"contact in contacts\"><a class=\"home-contact\" :href=\"contact.uri\"><Icon :name=\"contact.icon\"></Icon><span>{{ contact.name }}</span></a></li></ul></div>";

var Home$1 = new View({
    name: 'home',
    testPath: function testPath(path) {
        return path === '/';
    },

    component: Vue.extend({
        name: 'HomeView',
        template: template$2,

        components: { Icon: Icon },

        data: factorize({
            contacts: CONTACTS
        })
    })
});

var FSNode = function () {
    createClass(FSNode, [{
        key: 'name',
        get: function get() {
            return this._name || basename(this.path);
        },
        set: function set(name) {
            this._name = name;
        }
    }, {
        key: 'isDirectory',
        get: function get() {
            throw new Error('FSNode#isDirectory must be overriden');
        }
    }]);

    function FSNode(path, modified, size) {
        classCallCheck(this, FSNode);

        if (!(this.constructor !== FSNode)) {
            throw new Error('Function "FSNode" precondition failed: this.constructor !== FSNode');
        }

        this.path = path;
        this.size = size;
        this.modified = modified;
        this.parent = null;
    }

    createClass(FSNode, [{
        key: 'matchesPath',
        value: function matchesPath(path) {
            return this.path === path.replace(/\/$/, '');
        }
    }, {
        key: 'setParent',
        value: function setParent(parent) {
            this.parent = parent;
        }
    }]);
    return FSNode;
}();

var File = function (_FSNode) {
    inherits(File, _FSNode);
    createClass(File, [{
        key: 'type',
        get: function get() {
            var name = this.name;
            var type = this.name.split('.').pop();

            if (type === name || type === '') return 'Dotfile';

            return type.toUpperCase() + ' file';
        }
    }, {
        key: 'isDirectory',
        get: function get() {
            return false;
        }
    }]);

    function File(path, modified, size, parent) {
        classCallCheck(this, File);
        return possibleConstructorReturn(this, (File.__proto__ || Object.getPrototypeOf(File)).call(this, path, modified, size, parent));
    }

    return File;
}(FSNode);

var Dir = function (_FSNode) {
    inherits(Dir, _FSNode);
    createClass(Dir, [{
        key: 'type',
        get: function get() {
            return 'Directory';
        }
    }, {
        key: 'isDirectory',
        get: function get() {
            return true;
        }
    }, {
        key: 'files',
        get: function get() {
            return this.children.filter(this.children, function (child) {
                return child.isDirectory;
            });
        }
    }, {
        key: 'dirs',
        get: function get() {
            return this.children.filter(this.children, function (child) {
                return !child.isDirectory;
            });
        }
    }, {
        key: 'hasDescription',
        get: function get() {
            return this.description !== '';
        }
    }, {
        key: 'ancestors',
        get: function get() {
            var current = this;
            var stack = [];

            do {
                stack.push(current);
                current = current.parent;
            } while (current);

            return stack.reverse();
        }
    }]);

    function Dir(path, modified, size, description) {
        var children = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
        classCallCheck(this, Dir);

        var _this = possibleConstructorReturn(this, (Dir.__proto__ || Object.getPrototypeOf(Dir)).call(this, path, modified, size));

        _this.description = description;
        _this.children = children;
        children.forEach(function (child) {
            return child.setParent(_this);
        });
        return _this;
    }

    createClass(Dir, [{
        key: 'findByPath',
        value: function findByPath(path) {
            if (this.matchesPath(path)) return this;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var child = _step.value;

                    var result = void 0;

                    if (child.matchesPath(path)) return child;

                    if (child.isDirectory) result = child.findByPath(path);

                    if (result) return result;
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

            return null;
        }
    }, {
        key: 'dup',
        value: function dup() {
            return new Dir(this.path, this.modified, this.size, this.description);
        }
    }]);
    return Dir;
}(FSNode);

Dir.parseServerResponse = function (res) {
    var modified = new Date(res.modified);

    if (!res.isDirectory) return new File(res.path, modified, res.size);

    return new Dir(res.path, modified, res.size, res.description, res.children.map(Dir.parseServerResponse));
};

var GridColumn = function GridColumn(_ref) {
    var name = _ref.name,
        _ref$width = _ref.width,
        width = _ref$width === undefined ? 1 : _ref$width,
        _ref$onClick = _ref.onClick,
        onClick = _ref$onClick === undefined ? noop : _ref$onClick,
        _ref$accessors = _ref.accessors,
        accessors = _ref$accessors === undefined ? {} : _ref$accessors;
    classCallCheck(this, GridColumn);

    Object.assign(this, { name: name, width: width, onClick: onClick });
    var valueAccessor = accessor(accessors.value);

    function generateAccessor(key) {
        return key in accessors ? accessor(accessors[key]) : valueAccessor;
    }

    this.accessors = {
        value: valueAccessor,
        view: generateAccessor('view'),
        hyperlink: generateAccessor('hyperlink')
    };

    this.hasLink = 'hyperlink' in accessors;
    Object.freeze(this);
};

var template$3 = "<table><thead><tr class=\"column-names\"><th v-for=\"(column, index) in parsedColumns\" :title=\"column.name\" :style=\"{ width: columnWidth(column) }\" @click=\"sortByColumn(index)\"><Icon :name=\"sortIcon(column)\"></Icon><p>{{ column.name }}</p></th></tr></thead><tbody><tr v-for=\"row in fragment\"><td v-for=\"column in parsedColumns\" :title=\"column.name\"><a v-if=\"column.hasLink\" :href=\"column.accessors.hyperlink(row)\" @click=\"onClick($event, column, row)\">{{ column.accessors.view(row) }}</a><p v-else=\"v-else\">{{ column.accessors.view(row) }}</p></td></tr></tbody><thead><tr><th :colspan=\"columns.length\"><div class=\"pagination\"><Icon name=\"chevron-right\" :class=\"{ disabled: page === 0 }\" :horizontal-flip=\"true\" @click=\"changePage(page - 1)\"></Icon><span v-for=\"i in pages\" :class=\"{ active: i === page }\" @click=\"changePage(i)\">{{ i + 1 }}</span><Icon name=\"chevron-right\" :class=\"{ disabled: page === pageCount - 1 }\" @click=\"changePage(page + 1)\"></Icon></div></th></tr></thead></table>";

var BINARY_INCREMENT = 1024;

function humanizeSize(bytes) {
    if (bytes < BINARY_INCREMENT) return bytes + ' Bytes';

    var ratio = bytes / BINARY_INCREMENT;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = 'KMGTP'[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var size = _step.value;

            if (ratio < BINARY_INCREMENT / 2) return ratio.toFixed(2) + ' ' + size + 'iB';

            ratio /= BINARY_INCREMENT;
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

    return 'Invalid size';
}

function clam(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function isBetween(value, min, max) {
    return value >= min && value <= max;
}

function extendTo(value, min, max) {
    if (!isBetween(value, 0, 1)) {
        throw new Error('Function "extendTo" precondition failed: isBetween(value, 0, 1)');
    }

    return min + (max - min) * value;
}

function percentize(value) {
    if (!isBetween(value, 0, 1)) {
        throw new Error('Function "percentize" precondition failed: isBetween(value, 0, 1)');
    }

    return extendTo(value, 0, 100) + '%';
}

function direction(condition) {
    return condition ? 1 : -1;
}

var ROWS = 10;

function ascendingComparator(a, b) {
    return a === b ? 0 : direction(a > b);
}

function descendingComparator(a, b) {
    return ascendingComparator(b, a);
}

var Grid = Vue.extend({
    template: template$3,
    components: { Icon: Icon },

    props: {
        sort: { type: Number, default: 0 },
        columns: { type: Array, required: true },
        data: { type: Array, required: true },
        staticData: { type: Array, default: function _default() {
                return [];
            } }
    },

    data: function data() {
        return {
            page: 0,
            sortBy: -1,
            ascending: true
        };
    },

    computed: {
        parsedColumns: function parsedColumns(context) {
            return context.columns.map(constructs(GridColumn));
        },
        fragment: function fragment(context) {
            var count = Math.max(1, ROWS - context.staticData.length);
            var start = this.page * count;

            return context.staticData.concat(context.sorted.slice(start, start + count));
        },
        totalWidth: function totalWidth(context) {
            return context.parsedColumns.reduce(function (payload, col) {
                return payload + col.width;
            }, 0);
        },
        pageCount: function pageCount(context) {
            var total = context.data.length + context.staticData.length;
            return Math.ceil(total / ROWS);
        },
        pages: function pages(context) {
            return Array.from({ length: context.pageCount }, function (_key, page) {
                return page;
            });
        },
        sorted: function sorted(context) {
            var _this = this;

            if (this.sortBy === -1) return context.data;

            var accessor = context.sortColumn.accessors.value;
            return context.data.slice().sort(function (a, b) {
                return _this.comparator(accessor(a), accessor(b));
            });
        },
        sortColumn: function sortColumn(context) {
            return context.parsedColumns[context.sortBy];
        },
        comparator: function comparator(context) {
            return context.ascending ? ascendingComparator : descendingComparator;
        }
    },

    methods: {
        changePage: function changePage(page) {
            var normalized = clam(page, 0, this.pageCount - 1);

            if (normalized > 0 && page === this.page) return;

            this.page = normalized;
        },
        updateSort: function updateSort(sort) {
            if (!(Math.abs(sort) <= this.columns.length)) {
                throw new Error('Function  precondition failed: Math.abs(sort) <= this.columns.length');
            }

            this.sortBy = Math.abs(sort) - 1;
            this.ascending = sort > 0;
        },
        sortIcon: function sortIcon(column) {
            if (column !== this.sortColumn) return 'sort-both';

            return this.ascending ? 'sort-up' : 'sort-down';
        },
        columnWidth: function columnWidth(column) {
            return percentize(column.width / this.totalWidth);
        },
        sortByColumn: function sortByColumn(index) {
            if (this.sortBy === index) {
                this.ascending = !this.ascending;
            } else {
                this.sortBy = index;
                this.ascending = true;
            }
        },
        onClick: function onClick($event, column, row) {
            column.onClick.call(this, $event, row);
        }
    },

    watch: {
        sort: function sort() {
            this.updateSort(this.sort);
        },
        data: function data() {
            this.changePage(0);
        }
    },

    mounted: function mounted() {
        this.updateSort(this.sort);
    }
});

var template$4 = "<div class=\"files-view\"><h1 v-text=\"data.path\"></h1><Grid :columns=\"columns\" :data=\"data.children\" :static-data=\"staticData\" :sort=\"1\"></Grid><div v-html=\"description\"></div></div>";

var component$1 = Vue.extend({
    name: 'FilesView',
    template: template$4,
    components: { Grid: Grid },

    props: {
        data: { type: Dir, required: true }
    },

    data: factorize({
        columns: [{
            name: 'Name',
            width: 2,
            accessors: { value: 'name', hyperlink: 'path' },
            onClick: function onClick(e, row) {
                if (!row.isDirectory) return;

                e.preventDefault();
                bus.$emit('updatePath', row.path);
            }
        }, {
            name: 'Type',
            width: 2,
            accessors: { value: 'type' }
        }, {
            name: 'Size',
            width: 2,
            accessors: {
                value: 'size',
                view: function view(node) {
                    return humanizeSize(node.size);
                }
            }
        }, {
            name: 'Modified',
            width: 3,
            accessors: {
                value: function value(node) {
                    return node.modified.getTime();
                },
                view: function view(node) {
                    return node.modified.toLocaleString();
                }
            }
        }]
    }),

    computed: {
        description: function description(context) {
            return context.data.description;
        },
        staticData: function staticData(context) {
            if (context.data.parent === null) return [];

            var mock = context.data.parent.dup();
            mock.name = '..';
            return [mock];
        }
    }
});

var Files = new View({
    name: 'files',
    title: function title(dir) {
        return dir.ancestors.map(function (node) {
            return node.name;
        });
    },
    testPath: function testPath(path) {
        return startsWithString(path, '/files');
    },

    component: component$1,

    resolve: function resolve(path) {
        return fetchJSON('/api/files').then(function (data) {
            var root = Dir.parseServerResponse(data).findByPath(path);

            if (root === null) throw CoolError.HTTP.notFound;

            return root;
        });
    }
});

var bundles = Object.freeze([{
    name: 'Sorting',
    path: '/code/sorting',
    summary: 'A visual comparison of array sorting algorithms'
}]);

var template$5 = "<div class=\"code-view\"><h1>JS playground</h1><Grid :columns=\"columns\" :data=\"bundles\"></Grid></div>";

var Code = new View({
    name: 'code',

    component: Vue.extend({
        name: 'CodeView',
        template: template$5,
        components: { Grid: Grid },

        data: factorize({
            bundles: bundles,
            columns: [{
                name: 'Name',
                accessors: { value: 'name', hyperlink: 'path' },
                onClick: function onClick(e, row) {
                    e.preventDefault();
                    bus.$emit('updatePath', row.path);
                }
            }, {
                name: 'Summary',
                width: 2,
                accessors: { value: 'summary' }
            }]
        })
    })
});

var PacmanPackage = function PacmanPackage(raw) {
    classCallCheck(this, PacmanPackage);

    this.name = raw.name;
    this.version = raw.version;
    this.arch = raw.arch;
};

var template$6 = "<div class=\"pacman-view\"><h1 id=\"-pacman-https-www-archlinux-org-pacman-repository\"><a href=\"https://www.archlinux.org/pacman/\">pacman</a> repository</h1>\n<p>The repo contains a variety of packages, mostly my own software and AUR builds.</p>\n<p>I mantain <strong>&#39;any&#39;</strong> and <strong>&#39;x86_64&#39;</strong> repos. <strong>&#39;x86_64&#39;</strong> includes packages from <strong>&#39;any&#39;</strong>. <strong>$arch</strong> can be replaced with any of the two:</p>\n<pre><code><span class=\"hljs-title\">[ivasilev]</span>\n<span class=\"hljs-setting\">Server = <span class=\"hljs-value\">http://ivasilev.net/pacman/<span class=\"hljs-variable\">$arch</span></span></span>\n<span class=\"hljs-comment\"># Server = http://ivasilev.net/pacman/any</span>\n<span class=\"hljs-comment\"># Server = http://ivasilev.net/pacman/x86_64</span>\n</code></pre><p>All packages are signed, so you can import my GPG key ({{ key }}) into the pacman keychain. The key can be downloaded from:</p><ul><li v-for=\"server in keyservers\"><a :href=\"server.url\"><span v-text=\"server.origin\"></span><span class=\"semitransparent\" v-text=\"server.path\"></span></a></li></ul><h2>Packages:</h2><div class=\"pacman-packages\"><div v-for=\"(packageGroup, arch) in packages\"><h3>{{ arch }}</h3><ul><li v-for=\"pkg in packageGroup\">{{ pkg.name }} {{ pkg.version }}</li></ul></div></div></div>";

var GPGKey = function GPGKey(url) {
    classCallCheck(this, GPGKey);

    var anchor = document.createElement('a');
    anchor.href = url;
    this.url = url;
    this.origin = anchor.origin || url;
    this.path = url.slice(this.origin.length);
};

var KEY = '436BB513';

var KEYSERVERS = [new GPGKey('http://ivasilev.net/files/mail@ivasilev.net.asc'), new GPGKey('http://pgp.mit.edu/pks/lookup?op=vindex&search=0x78630B3B436BB513'), new GPGKey('http://keys.gnupg.net/pks/lookup?search=mail%40ivasilev.net&op=vindex'), new GPGKey('http://pool.sks-keyservers.net/pks/lookup?search=mail%40ivasilev.net&op=vindex')];

var Pacman = new View({
    name: 'pacman',

    component: Vue.extend({
        name: 'PacmanView',
        template: template$6,

        props: {
            data: { type: Array, required: true }
        },

        data: factorize({
            key: KEY,
            keyservers: KEYSERVERS
        }),

        computed: {
            packages: function packages(context) {
                return groupBy(context.data, 'arch');
            }
        }
    }),

    resolve: function resolve(_path) {
        return fetchJSON('/api/pacman').then(function (data) {
            return data.map(constructs(PacmanPackage));
        });
    }
});

var Doc = function Doc(path, name) {
    classCallCheck(this, Doc);

    this.path = path;
    this.name = name;
};

var template$7 = "<div class=\"docs-view\"><h1>Hosted documentations</h1><Grid :columns=\"columns\" :data=\"data\" :sort=\"1\"></Grid></div>";

var component$2 = Vue.extend({
    name: 'DocsView',
    template: template$7,
    components: { Grid: Grid },

    props: {
        data: { type: Array, required: true }
    },

    data: factorize({
        columns: [{
            name: 'Name',
            accessors: { value: 'name', hyperlink: 'path' }
        }]
    })
});

var Docs = new View({
    name: 'docs',
    component: component$2,
    resolve: function resolve() {
        return fetchJSON('/api/docs').then(function (data) {
            return data.map(function (raw) {
                return new Doc(raw.path, raw.name);
            });
        });
    }
});

var views = Object.freeze([Home$1, Files, Code, Pacman, Docs]);

function getChildrenResolver(children) {
    if (!children) return asyncFactorize([]);

    if (children instanceof Function) return function (path) {
        return Promise.resolve(children(path));
    };

    return asyncFactorize(children);
}

function wrapResolver(resolver, path) {
    if (resolver) {
        return function (path) {
            return Promise.resolve(resolver(path));
        };
    }

    var view = views.find(function (view) {
        return view.testPath(path);
    });

    return function (path) {
        return new Promise(function (resolve) {
            return view.testPath(path) ? resolve(view) : resolve([]);
        });
    };
}

var Route = function () {
    function Route(_ref) {
        var name = _ref.name,
            path = _ref.path,
            children = _ref.children,
            resolver = _ref.resolve;
        classCallCheck(this, Route);

        Object.assign(this, {
            name: name, path: path,
            hasChildren: children !== undefined,
            pathFragments: path.split('/'),
            resolveChildren: getChildrenResolver(children),
            resolve: wrapResolver(resolver, path)
        });

        Object.freeze(this);
    }

    createClass(Route, [{
        key: 'testPath',
        value: function testPath(path) {
            return startsWith(path.split('/'), this.pathFragments);
        }
    }]);
    return Route;
}();

var Home = new Route({
    name: 'home',
    icon: 'home',
    path: '/'
});

var Files$1 = new Route({
    name: 'files',
    path: '/files',

    children: function children() {
        return fetchJSON('/api/files').then(function (data) {
            return data.children.filter(function (child) {
                return child.isDirectory;
            }).map(function (child) {
                return new Route({
                    name: basename(child.path),
                    path: child.path
                });
            }).sort(function (a, b) {
                return a.name > b.name;
            });
        });
    }
});

var Sorting = new Route({
    name: 'sorting',
    path: '/code/sorting',
    resolve: function resolve() {
        injectStylesheet('katex');
        return injectScript('sorting');
    }
});

var bundles$1 = Object.freeze([Sorting]);

var Code$1 = new Route({
    name: 'code',
    path: '/code',
    children: bundles$1,
    resolve: function resolve(path) {
        if (path === '/code') return Code;

        var bundle = bundles$1.find(function (bundle) {
            return bundle.path === path;
        });

        if (bundle !== undefined) return bundle.resolve(path);
    }
});

var Pacman$1 = new Route({
    name: 'pacman',
    path: '/pacman'
});

var Docs$1 = new Route({
    name: 'docs',
    path: '/docs'
});

var routes = Object.freeze([Home, Files$1, Code$1, Pacman$1, Docs$1]);

var template$8 = "<div class=\"navbar-wrapper\"><Icon class=\"navbar-icon navbar-toggle-icon\" name=\"chevron-right\" title=\"Toggle navbar\" :class=\"{ expanded: expanded }\" :horizontal-flip=\"expanded\" @click.native=\"toggleExpanded\"></Icon><transition name=\"navbar\"><aside class=\"navbar\" v-if=\"expanded\"><div class=\"navbar-contents\"><button class=\"button navbar-button navbar-button-toggle\" @click=\"hideNavbar\">Hide navbar</button><div v-for=\"route in routes\"><a class=\"button navbar-button navbar-route-button\" v-i-href=\"route.path\" :class=\"{ active: isActive(route) }\"><Icon class=\"navbar-icon navbar-route-icon\" :name=\"route.name\"></Icon><span class=\"navbar-route-text\">{{ route.name }}</span><Icon class=\"navbar-icon navbar-route-icon navbar-route-chevron\" name=\"chevron-up\" :style=\"{ visibility: route.hasChildren ? 'visible' : 'hidden' }\" :vertical-flip=\"isActive(route)\"></Icon></a><transition-group name=\"accordeon\"><a class=\"button navbar-button navbar-subroute-button\" :key=\"subroute.path\" v-if=\"isActive(route)\" v-for=\"subroute in page.subroutes\" v-i-href=\"subroute.path\" :class=\"{ active: page.subroute === subroute }\">{{ subroute.name }}</a></transition-group></div></div></aside></transition></div>";

var Navbar = Vue.extend({
    template: template$8,
    components: { Icon: Icon },

    props: {
        page: { page: Page, required: true }
    },

    data: factorize({
        expanded: inGridtMode(),
        routes: routes
    }),

    methods: {
        isActive: function isActive(route) {
            return this.page.route && route.path === this.page.route.path;
        },
        toggleExpanded: function toggleExpanded() {
            this.expanded = !this.expanded;
        },
        hideNavbar: function hideNavbar() {
            this.expanded = false;
        }
    }
});

var template$9 = "<div class=\"root-wrapper\"><Navbar :page=\"page\"></Navbar><main v-if=\"page.view !== null\"><component :is=\"component\" :data=\"page.data\"></component></main></div>";

var Root = Vue.extend({
    template: template$9,
    components: _extends({}, mapToObject(views, function (view) {
        return [view.component.options.name, view.component];
    }), {
        ErrorView: ErrorView.component,
        Navbar: Navbar
    }),

    data: factorize({
        page: Page.blank
    }),

    computed: {
        component: function component(context) {
            return context.page.view.component.options.name;
        }
    },

    methods: {
        updatePage: function updatePage(path) {
            var _this = this;

            var route = routes.find(function (route) {
                return route.testPath(path);
            });

            if (route === undefined) {
                bus.$emit('handleError', CoolError.HTTP.notFound);
                return;
            }

            Promise.all([route.resolve(path), route.resolveChildren(path)]).then(function (_ref) {
                var _ref2 = slicedToArray(_ref, 2),
                    view = _ref2[0],
                    subroutes = _ref2[1];

                var subroute = subroutes.find(function (route) {
                    return route.testPath(path);
                });

                if (view === undefined) {
                    bus.$emit('handleError', CoolError.HTTP.notFound);
                    return;
                }

                return view.resolve(path).then(function (data) {
                    var page = new Page({ view: view, route: route, subroutes: subroutes, subroute: subroute, data: data });
                    updateWindowTitle(view.getTitle(data));
                    Vue.set(_this, 'page', page);
                });
            });
        },
        updatePath: function updatePath(path) {
            if (getPath() !== path) pushState(path);

            bus.$emit('updatePage', path);
        },
        handleError: function handleError(error) {
            if (!(error instanceof Error)) {
                throw new Error('Function  precondition failed: error instanceof Error');
            }

            updateWindowTitle(['error']);
            console.error(error.name + ': ' + error.message); // eslint-disable-line no-console
            Vue.set(this, 'page', Page.fromError(error));
        }
    },

    mounted: function mounted() {
        bus.$on('updatePage', this.updatePage);
        bus.$on('updatePath', this.updatePath);
        bus.$on('handleError', this.handleError);
    },
    beforeDestroy: function beforeDestroy() {
        bus.$off('updatePage', this.updatePage);
        bus.$off('updatePath', this.updatePath);
        bus.$off('handleError', this.handleError);
    }
});

if (DEBUG) Vue.config.debug = true;

loadSheet(); // This is only called here to ensure that the sheets start loading ASAP
documentReadyResolver().then(function () {
    new Root({ el: document.querySelector('div.root') });

    window.onunhandledrejection = function onError(e) {
        bus.$emit('handleError', e.reason);
    };

    on('error', function (e) {
        e.preventDefault();
        bus.$emit('handleError', e.error);
    });

    on('popstate', function () {
        bus.$emit('updatePage', getPath());
    });

    bus.$emit('updatePage', getPath());
});

}(Vue));
//# sourceMappingURL=core.js.map
