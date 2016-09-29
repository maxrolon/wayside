(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var requestFrame = window.requestAnimationFrame;
var cancelFrame = window.cancelAnimationFrame;

var singleton = void 0,
    debounce = void 0,
    detectIdle = void 0,
    handleScroll = void 0;

var Scroll = function () {
  function Scroll() {
    var _this = this;

    _classCallCheck(this, Scroll);

    this.queue = [];
    this.tickId = false;
    this.scrollChanged = false;
    this.prevY = -1;
    this.timeout = null;
    this.handlers = 0;
    this.lastError = false;

    debounce = function debounce() {
      return _this.debounce();
    };
    detectIdle = function detectIdle() {
      return _this.detectIdle();
    };
    handleScroll = function handleScroll() {
      return _this.handleScroll();
    };
  }

  /*
   * Add functions into an array.
   * These will be called in the RAF
   *
   * @param {function} cb function to call
   * @param {string} key key to reference the function (todo)
   */


  _createClass(Scroll, [{
    key: 'add',
    value: function add(cb, key) {
      this.queue.push(cb);
    }

    /* Tracks the event handlers attached via
     * this module
     */

  }, {
    key: 'enable',
    value: function enable() {
      window.addEventListener('scroll', debounce);
      document.body.addEventListener('touchmove', debounce);
      this.handlers++;
    }
  }, {
    key: 'disable',
    value: function disable() {
      window.removeEventListener('scroll', debounce);
      document.body.removeEventListener('touchmove', debounce);
      this.handlers--;
    }
  }, {
    key: 'debounce',
    value: function debounce() {
      if (this.tickId) {
        return false;
      } else {
        if (this.handlers > 0) this.disable();
        this.tick();
        return true;
      }
    }
  }, {
    key: 'tick',
    value: function tick() {
      if (this.tickId) {
        this.error('requestFrame called when one exists already');
      } else {
        this.tickId = requestFrame(handleScroll) || true;
      }
    }

    /* The nuts n' bolts. This is the RAF that
     * calls each function in the queue. Each function
     * is passed the current offset value and the last
     * recorded offset value (often the same depending)
     * on the speed of the scroll)
     */

  }, {
    key: 'handleScroll',
    value: function handleScroll() {
      var _this2 = this;

      var y = window.pageYOffset;
      this.queue.forEach(function (fn) {
        return fn(y, _this2.prevY);
      });

      this.scrollChanged = false;
      if (this.prevY != y) {
        this.scrollChanged = true;
        this.prevY = y;
      }

      if (this.scrollChanged) {
        clearTimeout(this.timeout);
        this.timeout = null;
      } else if (!this.timeout) {
        this.timeout = setTimeout(detectIdle, 200);
      }

      this.tickId = false;
      this.tick();
    }

    /* If the user hasn't scrolled in a while
     * we want to exit out of the RAF requence
     * and re-attach event bindings
     */

  }, {
    key: 'detectIdle',
    value: function detectIdle() {
      cancelFrame(this.tickId);
      this.tickId = null;
      this.enable();
    }
  }, {
    key: 'error',
    value: function error(msg) {
      this.lastError = msg;
      console.warn(msg);
    }

    /*
     * @static
     */

  }], [{
    key: 'isSupported',
    value: function isSupported() {
      if (!requestFrame) {
        ['ms', 'moz', 'webkit', 'o'].every(function (prefix) {
          requestFrame = window[prefix + 'RequestAnimationFrame'];
          cancelFrame = window[prefix + 'CancelAnimationFrame'] || window[prefix + 'CancelRequestAnimationFrame'];
          return !requestFrame;
        });
      }
      return requestFrame;
    }
  }]);

  return Scroll;
}();

/*
 * This singleton pattern
 * allows us to unit test the module
 * by exposing all methods. The reset property
 * allows us to reset the state of the singleton
 * between tests.. May be useful outside of the 
 * testing context?
 *
 * @param {function} cb function to add to queue
 * @param {key} key key to reference the function in the queue
 * @param {bool} obj:base Return the base class or the singleton?
 * @param {bool} obj:reset Reset the singleton so that a new instance in created
 * @param {bool} obj:enable Enable the event handler and start the animation frame
 */


exports.default = function () {
  var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var _ref$base = _ref.base;
  var base = _ref$base === undefined ? false : _ref$base;
  var _ref$reset = _ref.reset;
  var reset = _ref$reset === undefined ? false : _ref$reset;
  var _ref$enable = _ref.enable;
  var enable = _ref$enable === undefined ? true : _ref$enable;

  if (reset) singleton = null;

  if (!Scroll.isSupported()) {
    console.warn('Request Animation Frame not supported');
    return false;
  }

  if (!singleton) singleton = new Scroll();

  if (cb) singleton.add(cb, key);

  if (singleton.handlers < 1 && enable) {
    singleton.debounce();
    singleton.enable();
  }

  return base ? Scroll : singleton;
};

},{}],2:[function(require,module,exports){
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Tweezer"] = factory();
	else
		root["Tweezer"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Tweezer = function () {
	  function Tweezer() {
	    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	    _classCallCheck(this, Tweezer);

	    this.duration = opts.duration || 1000;
	    this.ease = opts.easing || this._defaultEase;
	    this.start = opts.start;
	    this.end = opts.end;

	    this.frame = null;
	    this.next = null;
	    this.isRunning = false;
	    this.events = {};
	    this.direction = this.start < this.end ? 'up' : 'down';
	  }

	  _createClass(Tweezer, [{
	    key: 'begin',
	    value: function begin() {
	      if (!this.isRunning && this.next !== this.end) {
	        this.frame = requestAnimationFrame(this._tick.bind(this));
	      }
	      return this;
	    }
	  }, {
	    key: 'stop',
	    value: function stop() {
	      cancelAnimationFrame(this.frame);
	      this.isRunning = false;
	      this.frame = null;
	      this.timeStart = null;
	      this.next = null;
	      return this;
	    }
	  }, {
	    key: 'on',
	    value: function on(name, handler) {
	      this.events[name] = this.events[name] || [];
	      this.events[name].push(handler);
	      return this;
	    }
	  }, {
	    key: 'emit',
	    value: function emit(name, val) {
	      var _this = this;

	      var e = this.events[name];
	      e && e.forEach(function (handler) {
	        return handler.call(_this, val);
	      });
	    }
	  }, {
	    key: '_tick',
	    value: function _tick(currentTime) {
	      this.isRunning = true;

	      var lastTick = this.next || this.start;

	      if (!this.timeStart) this.timeStart = currentTime;
	      this.timeElapsed = currentTime - this.timeStart;
	      this.next = Math.round(this.ease(this.timeElapsed, this.start, this.end - this.start, this.duration));

	      if (this._shouldTick(lastTick)) {
	        this.emit('tick', this.next);
	        this.frame = requestAnimationFrame(this._tick.bind(this));
	      } else {
	        this.emit('tick', this.end);
	        this.emit('done', null);
	      }
	    }
	  }, {
	    key: '_shouldTick',
	    value: function _shouldTick(lastTick) {
	      return {
	        up: this.next < this.end && lastTick <= this.next,
	        down: this.next > this.end && lastTick >= this.next
	      }[this.direction];
	    }
	  }, {
	    key: '_defaultEase',
	    value: function _defaultEase(t, b, c, d) {
	      if ((t /= d / 2) < 1) return c / 2 * t * t + b;
	      return -c / 2 * (--t * (t - 2) - 1) + b;
	    }
	  }]);

	  return Tweezer;
	}();

	exports.default = Tweezer;

/***/ }
/******/ ])
});
;
},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (el) {
  var waypoints = fetchAnchors(el);
  var sticky = el.querySelector('.js-inner');
  var offset = void 0;
  var getAllOffsets = void 0;
  (getAllOffsets = function getAllOffsets() {
    waypoints.map(function (el) {
      return el.dest;
    }).forEach(cacheOffsets);
    offset = getOffset(el);
  })();
  (0, _rafScroll2.default)(function (scrollTop) {
    if (scrollTop >= offset) {
      sticky.classList.add('is-fixed');
    } else {
      sticky.classList.remove('is-fixed');
    }
    waypoints.forEach(function (el) {
      return el.anchor.classList.remove('is-active');
    });
    waypoints.reduce(reduceToClosest(scrollTop)).anchor.classList.add('is-active');
  });
  waypoints.forEach(function (waypoint) {
    waypoint.anchor.addEventListener('click', function (e) {
      e.preventDefault();
      e.returnValue = false;
      new _tweezer2.default({
        start: window.scrollY,
        end: getOffset(waypoint.dest)
      }).on('tick', function (v) {
        return window.scrollTo(0, v);
      }).begin();
    });
  });
  window.addEventListener('resize', getAllOffsets);
};

var _rafScroll = require('raf-scroll.js');

var _rafScroll2 = _interopRequireDefault(_rafScroll);

var _tweezer = require('tweezer.js');

var _tweezer2 = _interopRequireDefault(_tweezer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var fetchAnchors = function fetchAnchors(el) {
  var anchors = [].slice.call(el.querySelectorAll('[href]'));
  return anchors.filter(restrictToHash).map(fetchDestinations);
};
var restrictToHash = function restrictToHash(el) {
  return (/#/.test(el.anchor = el.getAttribute('href'))
  );
};
var fetchDestinations = function fetchDestinations(el) {
  return {
    anchor: el,
    dest: document.getElementById(/.*#(.*)/.exec(el.anchor).pop())
  };
};
var reduceToClosest = function reduceToClosest(scrollTop) {
  return function (prev, curr) {
    //Create a new object, with the key being the offset
    var obj = [prev, curr].reduce(function (a, b) {
      return a[Math.abs(b.dest.offsetY - scrollTop)] = b, a;
    }, {});
    var closest = Math.min.apply(Math, _toConsumableArray(Object.keys(obj)));
    return obj[closest];
  };
};
var getOffset = function getOffset(el) {
  var win = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : window;
  var docElem = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : document.documentElement;
  var box = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  return box = el.getBoundingClientRect(), box.top + (win.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0);
};
var cacheOffsets = function cacheOffsets(el) {
  return el.offsetY = getOffset(el);
};

},{"raf-scroll.js":1,"tweezer.js":2}],4:[function(require,module,exports){
'use strict';

var _index = require('./../src/index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.addEventListener('DOMContentLoaded', function (e) {
  var el = document.querySelector('.js-wayside');
  new _index2.default(el);
});

},{"./../src/index.js":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcmFmLXNjcm9sbC5qcy9zcmMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvdHdlZXplci5qcy9idWlsZC90d2VlemVyLmpzIiwic3JjL2luZGV4LmpzIiwidGVzdC9kZXYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7O0FDQUEsSUFBSSxlQUFlLE9BQU8scUJBQTFCO0FBQ0EsSUFBSSxjQUFlLE9BQU8sb0JBQTFCOztBQUVBLElBQUksa0JBQUo7QUFBQSxJQUFlLGlCQUFmO0FBQUEsSUFBeUIsbUJBQXpCO0FBQUEsSUFBcUMscUJBQXJDOztJQUVNLE07QUFDSixvQkFBYTtBQUFBOztBQUFBOztBQUNYLFNBQUssS0FBTCxHQUFhLEVBQWI7QUFDQSxTQUFLLE1BQUwsR0FBYyxLQUFkO0FBQ0EsU0FBSyxhQUFMLEdBQXFCLEtBQXJCO0FBQ0EsU0FBSyxLQUFMLEdBQWEsQ0FBQyxDQUFkO0FBQ0EsU0FBSyxPQUFMLEdBQWUsSUFBZjtBQUNBLFNBQUssUUFBTCxHQUFnQixDQUFoQjtBQUNBLFNBQUssU0FBTCxHQUFpQixLQUFqQjs7QUFFQSxlQUFXO0FBQUEsYUFBTSxNQUFLLFFBQUwsRUFBTjtBQUFBLEtBQVg7QUFDQSxpQkFBYTtBQUFBLGFBQU0sTUFBSyxVQUFMLEVBQU47QUFBQSxLQUFiO0FBQ0EsbUJBQWU7QUFBQSxhQUFNLE1BQUssWUFBTCxFQUFOO0FBQUEsS0FBZjtBQUNEOztBQUVEOzs7Ozs7Ozs7Ozt3QkFPSSxFLEVBQUcsRyxFQUFJO0FBQ1QsV0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixFQUFoQjtBQUNEOztBQUVEOzs7Ozs7NkJBR1E7QUFDTixhQUFPLGdCQUFQLENBQXdCLFFBQXhCLEVBQWtDLFFBQWxDO0FBQ0EsZUFBUyxJQUFULENBQWMsZ0JBQWQsQ0FBK0IsV0FBL0IsRUFBNEMsUUFBNUM7QUFDQSxXQUFLLFFBQUw7QUFDRDs7OzhCQUNRO0FBQ1AsYUFBTyxtQkFBUCxDQUEyQixRQUEzQixFQUFxQyxRQUFyQztBQUNBLGVBQVMsSUFBVCxDQUFjLG1CQUFkLENBQWtDLFdBQWxDLEVBQStDLFFBQS9DO0FBQ0EsV0FBSyxRQUFMO0FBQ0Q7OzsrQkFDUztBQUNSLFVBQUksS0FBSyxNQUFULEVBQWdCO0FBQ2QsZUFBTyxLQUFQO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsWUFBSSxLQUFLLFFBQUwsR0FBZ0IsQ0FBcEIsRUFBdUIsS0FBSyxPQUFMO0FBQ3ZCLGFBQUssSUFBTDtBQUNBLGVBQU8sSUFBUDtBQUNEO0FBQ0Y7OzsyQkFDSztBQUNKLFVBQUksS0FBSyxNQUFULEVBQWdCO0FBQ2QsYUFBSyxLQUFMLENBQVcsNkNBQVg7QUFDRCxPQUZELE1BRU87QUFDTCxhQUFLLE1BQUwsR0FBYyxhQUFhLFlBQWIsS0FBOEIsSUFBNUM7QUFDRDtBQUNGOztBQUVEOzs7Ozs7Ozs7bUNBTWM7QUFBQTs7QUFDWixVQUFJLElBQUksT0FBTyxXQUFmO0FBQ0EsV0FBSyxLQUFMLENBQVcsT0FBWCxDQUFvQjtBQUFBLGVBQU0sR0FBRyxDQUFILEVBQU0sT0FBSyxLQUFYLENBQU47QUFBQSxPQUFwQjs7QUFFQSxXQUFLLGFBQUwsR0FBcUIsS0FBckI7QUFDQSxVQUFJLEtBQUssS0FBTCxJQUFjLENBQWxCLEVBQW9CO0FBQ2xCLGFBQUssYUFBTCxHQUFxQixJQUFyQjtBQUNBLGFBQUssS0FBTCxHQUFhLENBQWI7QUFDRDs7QUFFRCxVQUFJLEtBQUssYUFBVCxFQUF1QjtBQUNyQixxQkFBYSxLQUFLLE9BQWxCO0FBQ0EsYUFBSyxPQUFMLEdBQWUsSUFBZjtBQUNELE9BSEQsTUFHTyxJQUFJLENBQUMsS0FBSyxPQUFWLEVBQWtCO0FBQ3ZCLGFBQUssT0FBTCxHQUFlLFdBQVcsVUFBWCxFQUF1QixHQUF2QixDQUFmO0FBQ0Q7O0FBRUQsV0FBSyxNQUFMLEdBQWMsS0FBZDtBQUNBLFdBQUssSUFBTDtBQUNEOztBQUVEOzs7Ozs7O2lDQUlZO0FBQ1Ysa0JBQVksS0FBSyxNQUFqQjtBQUNBLFdBQUssTUFBTCxHQUFjLElBQWQ7QUFDQSxXQUFLLE1BQUw7QUFDRDs7OzBCQUNLLEcsRUFBSTtBQUNSLFdBQUssU0FBTCxHQUFpQixHQUFqQjtBQUNBLGNBQVEsSUFBUixDQUFhLEdBQWI7QUFDRDs7QUFFRDs7Ozs7O2tDQUdvQjtBQUNsQixVQUFJLENBQUMsWUFBTCxFQUFtQjtBQUNqQixTQUFDLElBQUQsRUFBTyxLQUFQLEVBQWMsUUFBZCxFQUF3QixHQUF4QixFQUE2QixLQUE3QixDQUFtQyxrQkFBVTtBQUMzQyx5QkFBZSxPQUFPLFNBQVMsdUJBQWhCLENBQWY7QUFDQSx3QkFBZSxPQUFPLFNBQVMsc0JBQWhCLEtBQ0EsT0FBTyxTQUFTLDZCQUFoQixDQURmO0FBRUEsaUJBQU8sQ0FBQyxZQUFSO0FBQ0QsU0FMRDtBQU9EO0FBQ0QsYUFBTyxZQUFQO0FBQ0Q7Ozs7OztBQUdIOzs7Ozs7Ozs7Ozs7Ozs7O2tCQWNlLFlBQWdFO0FBQUEsTUFBL0QsRUFBK0QsdUVBQTVELEtBQTREO0FBQUEsTUFBdEQsR0FBc0QsdUVBQWxELEtBQWtEOztBQUFBLGlGQUFQLEVBQU87O0FBQUEsdUJBQTNDLElBQTJDO0FBQUEsTUFBM0MsSUFBMkMsNkJBQXRDLEtBQXNDO0FBQUEsd0JBQWhDLEtBQWdDO0FBQUEsTUFBaEMsS0FBZ0MsOEJBQTFCLEtBQTBCO0FBQUEseUJBQXBCLE1BQW9CO0FBQUEsTUFBcEIsTUFBb0IsK0JBQWIsSUFBYTs7QUFDN0UsTUFBSSxLQUFKLEVBQVcsWUFBWSxJQUFaOztBQUVYLE1BQUssQ0FBQyxPQUFPLFdBQVAsRUFBTixFQUE0QjtBQUMxQixZQUFRLElBQVIsQ0FBYSx1Q0FBYjtBQUNBLFdBQU8sS0FBUDtBQUNEOztBQUVELE1BQUksQ0FBQyxTQUFMLEVBQWdCLFlBQVksSUFBSSxNQUFKLEVBQVo7O0FBRWhCLE1BQUksRUFBSixFQUFRLFVBQVUsR0FBVixDQUFjLEVBQWQsRUFBaUIsR0FBakI7O0FBRVIsTUFBSSxVQUFVLFFBQVYsR0FBcUIsQ0FBckIsSUFBMEIsTUFBOUIsRUFBcUM7QUFDbkMsY0FBVSxRQUFWO0FBQ0EsY0FBVSxNQUFWO0FBQ0Q7O0FBRUQsU0FBTyxPQUFPLE1BQVAsR0FBZ0IsU0FBdkI7QUFDRCxDOzs7QUN2SkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QU1BLElBQU0sWUFBWSxTQUFaLFNBQVksQ0FBQyxFQUFEO0FBQUEsTUFBSyxHQUFMLHVFQUFTLE1BQVQ7QUFBQSxNQUFpQixPQUFqQix1RUFBeUIsU0FBUyxlQUFsQztBQUFBLE1BQW1ELEdBQW5ELHVFQUF1RCxLQUF2RDtBQUFBLFNBQ2hCLE1BQU0sR0FBRyxxQkFBSCxFQUFOLEVBQ0EsSUFBSSxHQUFKLElBQVcsSUFBSSxXQUFKLElBQW1CLFFBQVEsU0FBdEMsS0FBb0QsUUFBUSxTQUFSLElBQXFCLENBQXpFLENBRmdCO0FBQUEsQ0FBbEI7QUFJQSxJQUFNLGVBQWUsU0FBZixZQUFlO0FBQUEsU0FBTSxHQUFHLE9BQUgsR0FBYSxVQUFVLEVBQVYsQ0FBbkI7QUFBQSxDQUFyQjs7Ozs7QUN4QkE7Ozs7OztBQUVBLFNBQVMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLGFBQUs7QUFDakQsTUFBTSxLQUFLLFNBQVMsYUFBVCxDQUF1QixhQUF2QixDQUFYO0FBQ0Esc0JBQVksRUFBWjtBQUNELENBSEQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibGV0IHJlcXVlc3RGcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbmxldCBjYW5jZWxGcmFtZSAgPSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWVcblxubGV0IHNpbmdsZXRvbiwgZGVib3VuY2UsIGRldGVjdElkbGUsIGhhbmRsZVNjcm9sbFxuXG5jbGFzcyBTY3JvbGx7XG4gIGNvbnN0cnVjdG9yKCl7XG4gICAgdGhpcy5xdWV1ZSA9IFtdXG4gICAgdGhpcy50aWNrSWQgPSBmYWxzZVxuICAgIHRoaXMuc2Nyb2xsQ2hhbmdlZCA9IGZhbHNlXG4gICAgdGhpcy5wcmV2WSA9IC0xXG4gICAgdGhpcy50aW1lb3V0ID0gbnVsbFxuICAgIHRoaXMuaGFuZGxlcnMgPSAwXG4gICAgdGhpcy5sYXN0RXJyb3IgPSBmYWxzZVxuXG4gICAgZGVib3VuY2UgPSAoKSA9PiB0aGlzLmRlYm91bmNlKClcbiAgICBkZXRlY3RJZGxlID0gKCkgPT4gdGhpcy5kZXRlY3RJZGxlKClcbiAgICBoYW5kbGVTY3JvbGwgPSAoKSA9PiB0aGlzLmhhbmRsZVNjcm9sbCgpXG4gIH1cblxuICAvKlxuICAgKiBBZGQgZnVuY3Rpb25zIGludG8gYW4gYXJyYXkuXG4gICAqIFRoZXNlIHdpbGwgYmUgY2FsbGVkIGluIHRoZSBSQUZcbiAgICpcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2IgZnVuY3Rpb24gdG8gY2FsbFxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IGtleSB0byByZWZlcmVuY2UgdGhlIGZ1bmN0aW9uICh0b2RvKVxuICAgKi9cbiAgYWRkKGNiLGtleSl7XG4gICAgdGhpcy5xdWV1ZS5wdXNoKGNiKVxuICB9XG5cbiAgLyogVHJhY2tzIHRoZSBldmVudCBoYW5kbGVycyBhdHRhY2hlZCB2aWFcbiAgICogdGhpcyBtb2R1bGVcbiAgICovXG4gIGVuYWJsZSgpe1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBkZWJvdW5jZSlcbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGRlYm91bmNlKVxuICAgIHRoaXMuaGFuZGxlcnMrK1xuICB9XG4gIGRpc2FibGUoKXtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZGVib3VuY2UpXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBkZWJvdW5jZSlcbiAgICB0aGlzLmhhbmRsZXJzLS1cbiAgfVxuICBkZWJvdW5jZSgpe1xuICAgIGlmICh0aGlzLnRpY2tJZCl7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuaGFuZGxlcnMgPiAwKSB0aGlzLmRpc2FibGUoKVxuICAgICAgdGhpcy50aWNrKClcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG4gIHRpY2soKXtcbiAgICBpZiAodGhpcy50aWNrSWQpe1xuICAgICAgdGhpcy5lcnJvcigncmVxdWVzdEZyYW1lIGNhbGxlZCB3aGVuIG9uZSBleGlzdHMgYWxyZWFkeScpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudGlja0lkID0gcmVxdWVzdEZyYW1lKGhhbmRsZVNjcm9sbCkgfHwgdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIC8qIFRoZSBudXRzIG4nIGJvbHRzLiBUaGlzIGlzIHRoZSBSQUYgdGhhdFxuICAgKiBjYWxscyBlYWNoIGZ1bmN0aW9uIGluIHRoZSBxdWV1ZS4gRWFjaCBmdW5jdGlvblxuICAgKiBpcyBwYXNzZWQgdGhlIGN1cnJlbnQgb2Zmc2V0IHZhbHVlIGFuZCB0aGUgbGFzdFxuICAgKiByZWNvcmRlZCBvZmZzZXQgdmFsdWUgKG9mdGVuIHRoZSBzYW1lIGRlcGVuZGluZylcbiAgICogb24gdGhlIHNwZWVkIG9mIHRoZSBzY3JvbGwpXG4gICAqL1xuICBoYW5kbGVTY3JvbGwoKXtcbiAgICBsZXQgeSA9IHdpbmRvdy5wYWdlWU9mZnNldFxuICAgIHRoaXMucXVldWUuZm9yRWFjaCggZm4gPT4gZm4oeSwgdGhpcy5wcmV2WSkgKVxuXG4gICAgdGhpcy5zY3JvbGxDaGFuZ2VkID0gZmFsc2VcbiAgICBpZiAodGhpcy5wcmV2WSAhPSB5KXtcbiAgICAgIHRoaXMuc2Nyb2xsQ2hhbmdlZCA9IHRydWVcbiAgICAgIHRoaXMucHJldlkgPSB5XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2Nyb2xsQ2hhbmdlZCl7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KVxuICAgICAgdGhpcy50aW1lb3V0ID0gbnVsbFxuICAgIH0gZWxzZSBpZiAoIXRoaXMudGltZW91dCl7XG4gICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGRldGVjdElkbGUsIDIwMClcbiAgICB9XG5cbiAgICB0aGlzLnRpY2tJZCA9IGZhbHNlXG4gICAgdGhpcy50aWNrKClcbiAgfVxuXG4gIC8qIElmIHRoZSB1c2VyIGhhc24ndCBzY3JvbGxlZCBpbiBhIHdoaWxlXG4gICAqIHdlIHdhbnQgdG8gZXhpdCBvdXQgb2YgdGhlIFJBRiByZXF1ZW5jZVxuICAgKiBhbmQgcmUtYXR0YWNoIGV2ZW50IGJpbmRpbmdzXG4gICAqL1xuICBkZXRlY3RJZGxlKCl7XG4gICAgY2FuY2VsRnJhbWUodGhpcy50aWNrSWQpXG4gICAgdGhpcy50aWNrSWQgPSBudWxsXG4gICAgdGhpcy5lbmFibGUoKVxuICB9XG4gIGVycm9yKG1zZyl7XG4gICAgdGhpcy5sYXN0RXJyb3IgPSBtc2dcbiAgICBjb25zb2xlLndhcm4obXNnKVxuICB9XG5cbiAgLypcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgc3RhdGljIGlzU3VwcG9ydGVkKCl7XG4gICAgaWYgKCFyZXF1ZXN0RnJhbWUpIHtcbiAgICAgIFsnbXMnLCAnbW96JywgJ3dlYmtpdCcsICdvJ10uZXZlcnkocHJlZml4ID0+IHtcbiAgICAgICAgcmVxdWVzdEZyYW1lID0gd2luZG93W3ByZWZpeCArICdSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICAgICAgY2FuY2VsRnJhbWUgID0gd2luZG93W3ByZWZpeCArICdDYW5jZWxBbmltYXRpb25GcmFtZSddIHx8XG4gICAgICAgICAgICAgICAgICAgICAgIHdpbmRvd1twcmVmaXggKyAnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgICAgIHJldHVybiAhcmVxdWVzdEZyYW1lO1xuICAgICAgfSlcblxuICAgIH1cbiAgICByZXR1cm4gcmVxdWVzdEZyYW1lXG4gIH1cbn1cblxuLypcbiAqIFRoaXMgc2luZ2xldG9uIHBhdHRlcm5cbiAqIGFsbG93cyB1cyB0byB1bml0IHRlc3QgdGhlIG1vZHVsZVxuICogYnkgZXhwb3NpbmcgYWxsIG1ldGhvZHMuIFRoZSByZXNldCBwcm9wZXJ0eVxuICogYWxsb3dzIHVzIHRvIHJlc2V0IHRoZSBzdGF0ZSBvZiB0aGUgc2luZ2xldG9uXG4gKiBiZXR3ZWVuIHRlc3RzLi4gTWF5IGJlIHVzZWZ1bCBvdXRzaWRlIG9mIHRoZSBcbiAqIHRlc3RpbmcgY29udGV4dD9cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYiBmdW5jdGlvbiB0byBhZGQgdG8gcXVldWVcbiAqIEBwYXJhbSB7a2V5fSBrZXkga2V5IHRvIHJlZmVyZW5jZSB0aGUgZnVuY3Rpb24gaW4gdGhlIHF1ZXVlXG4gKiBAcGFyYW0ge2Jvb2x9IG9iajpiYXNlIFJldHVybiB0aGUgYmFzZSBjbGFzcyBvciB0aGUgc2luZ2xldG9uP1xuICogQHBhcmFtIHtib29sfSBvYmo6cmVzZXQgUmVzZXQgdGhlIHNpbmdsZXRvbiBzbyB0aGF0IGEgbmV3IGluc3RhbmNlIGluIGNyZWF0ZWRcbiAqIEBwYXJhbSB7Ym9vbH0gb2JqOmVuYWJsZSBFbmFibGUgdGhlIGV2ZW50IGhhbmRsZXIgYW5kIHN0YXJ0IHRoZSBhbmltYXRpb24gZnJhbWVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgKGNiPWZhbHNlLGtleT1mYWxzZSx7YmFzZT1mYWxzZSxyZXNldD1mYWxzZSxlbmFibGU9dHJ1ZX09e30pID0+IHsgXG4gIGlmIChyZXNldCkgc2luZ2xldG9uID0gbnVsbFxuXG4gIGlmICggIVNjcm9sbC5pc1N1cHBvcnRlZCgpICl7XG4gICAgY29uc29sZS53YXJuKCdSZXF1ZXN0IEFuaW1hdGlvbiBGcmFtZSBub3Qgc3VwcG9ydGVkJylcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGlmICghc2luZ2xldG9uKSBzaW5nbGV0b24gPSBuZXcgU2Nyb2xsKClcblxuICBpZiAoY2IpIHNpbmdsZXRvbi5hZGQoY2Isa2V5KVxuXG4gIGlmIChzaW5nbGV0b24uaGFuZGxlcnMgPCAxICYmIGVuYWJsZSl7XG4gICAgc2luZ2xldG9uLmRlYm91bmNlKClcbiAgICBzaW5nbGV0b24uZW5hYmxlKClcbiAgfVxuXG4gIHJldHVybiBiYXNlID8gU2Nyb2xsIDogc2luZ2xldG9uXG59XG4iLCIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJUd2VlemVyXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIlR3ZWV6ZXJcIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiAvKioqKioqLyAoZnVuY3Rpb24obW9kdWxlcykgeyAvLyB3ZWJwYWNrQm9vdHN0cmFwXG4vKioqKioqLyBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuLyoqKioqKi8gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuLyoqKioqKi8gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbi8qKioqKiovIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4vKioqKioqLyBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbi8qKioqKiovIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4vKioqKioqLyBcdFx0XHRleHBvcnRzOiB7fSxcbi8qKioqKiovIFx0XHRcdGlkOiBtb2R1bGVJZCxcbi8qKioqKiovIFx0XHRcdGxvYWRlZDogZmFsc2Vcbi8qKioqKiovIFx0XHR9O1xuXG4vKioqKioqLyBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4vKioqKioqLyBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbi8qKioqKiovIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4vKioqKioqLyBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbi8qKioqKiovIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuLyoqKioqKi8gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbi8qKioqKiovIFx0fVxuXG5cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4vKioqKioqLyBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuLyoqKioqKi8gfSlcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyAoW1xuLyogMCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG5cdCAgdmFsdWU6IHRydWVcblx0fSk7XG5cblx0ZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuXHR2YXIgVHdlZXplciA9IGZ1bmN0aW9uICgpIHtcblx0ICBmdW5jdGlvbiBUd2VlemVyKCkge1xuXHQgICAgdmFyIG9wdHMgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1swXTtcblxuXHQgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFR3ZWV6ZXIpO1xuXG5cdCAgICB0aGlzLmR1cmF0aW9uID0gb3B0cy5kdXJhdGlvbiB8fCAxMDAwO1xuXHQgICAgdGhpcy5lYXNlID0gb3B0cy5lYXNpbmcgfHwgdGhpcy5fZGVmYXVsdEVhc2U7XG5cdCAgICB0aGlzLnN0YXJ0ID0gb3B0cy5zdGFydDtcblx0ICAgIHRoaXMuZW5kID0gb3B0cy5lbmQ7XG5cblx0ICAgIHRoaXMuZnJhbWUgPSBudWxsO1xuXHQgICAgdGhpcy5uZXh0ID0gbnVsbDtcblx0ICAgIHRoaXMuaXNSdW5uaW5nID0gZmFsc2U7XG5cdCAgICB0aGlzLmV2ZW50cyA9IHt9O1xuXHQgICAgdGhpcy5kaXJlY3Rpb24gPSB0aGlzLnN0YXJ0IDwgdGhpcy5lbmQgPyAndXAnIDogJ2Rvd24nO1xuXHQgIH1cblxuXHQgIF9jcmVhdGVDbGFzcyhUd2VlemVyLCBbe1xuXHQgICAga2V5OiAnYmVnaW4nLFxuXHQgICAgdmFsdWU6IGZ1bmN0aW9uIGJlZ2luKCkge1xuXHQgICAgICBpZiAoIXRoaXMuaXNSdW5uaW5nICYmIHRoaXMubmV4dCAhPT0gdGhpcy5lbmQpIHtcblx0ICAgICAgICB0aGlzLmZyYW1lID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX3RpY2suYmluZCh0aGlzKSk7XG5cdCAgICAgIH1cblx0ICAgICAgcmV0dXJuIHRoaXM7XG5cdCAgICB9XG5cdCAgfSwge1xuXHQgICAga2V5OiAnc3RvcCcsXG5cdCAgICB2YWx1ZTogZnVuY3Rpb24gc3RvcCgpIHtcblx0ICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5mcmFtZSk7XG5cdCAgICAgIHRoaXMuaXNSdW5uaW5nID0gZmFsc2U7XG5cdCAgICAgIHRoaXMuZnJhbWUgPSBudWxsO1xuXHQgICAgICB0aGlzLnRpbWVTdGFydCA9IG51bGw7XG5cdCAgICAgIHRoaXMubmV4dCA9IG51bGw7XG5cdCAgICAgIHJldHVybiB0aGlzO1xuXHQgICAgfVxuXHQgIH0sIHtcblx0ICAgIGtleTogJ29uJyxcblx0ICAgIHZhbHVlOiBmdW5jdGlvbiBvbihuYW1lLCBoYW5kbGVyKSB7XG5cdCAgICAgIHRoaXMuZXZlbnRzW25hbWVdID0gdGhpcy5ldmVudHNbbmFtZV0gfHwgW107XG5cdCAgICAgIHRoaXMuZXZlbnRzW25hbWVdLnB1c2goaGFuZGxlcik7XG5cdCAgICAgIHJldHVybiB0aGlzO1xuXHQgICAgfVxuXHQgIH0sIHtcblx0ICAgIGtleTogJ2VtaXQnLFxuXHQgICAgdmFsdWU6IGZ1bmN0aW9uIGVtaXQobmFtZSwgdmFsKSB7XG5cdCAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cblx0ICAgICAgdmFyIGUgPSB0aGlzLmV2ZW50c1tuYW1lXTtcblx0ICAgICAgZSAmJiBlLmZvckVhY2goZnVuY3Rpb24gKGhhbmRsZXIpIHtcblx0ICAgICAgICByZXR1cm4gaGFuZGxlci5jYWxsKF90aGlzLCB2YWwpO1xuXHQgICAgICB9KTtcblx0ICAgIH1cblx0ICB9LCB7XG5cdCAgICBrZXk6ICdfdGljaycsXG5cdCAgICB2YWx1ZTogZnVuY3Rpb24gX3RpY2soY3VycmVudFRpbWUpIHtcblx0ICAgICAgdGhpcy5pc1J1bm5pbmcgPSB0cnVlO1xuXG5cdCAgICAgIHZhciBsYXN0VGljayA9IHRoaXMubmV4dCB8fCB0aGlzLnN0YXJ0O1xuXG5cdCAgICAgIGlmICghdGhpcy50aW1lU3RhcnQpIHRoaXMudGltZVN0YXJ0ID0gY3VycmVudFRpbWU7XG5cdCAgICAgIHRoaXMudGltZUVsYXBzZWQgPSBjdXJyZW50VGltZSAtIHRoaXMudGltZVN0YXJ0O1xuXHQgICAgICB0aGlzLm5leHQgPSBNYXRoLnJvdW5kKHRoaXMuZWFzZSh0aGlzLnRpbWVFbGFwc2VkLCB0aGlzLnN0YXJ0LCB0aGlzLmVuZCAtIHRoaXMuc3RhcnQsIHRoaXMuZHVyYXRpb24pKTtcblxuXHQgICAgICBpZiAodGhpcy5fc2hvdWxkVGljayhsYXN0VGljaykpIHtcblx0ICAgICAgICB0aGlzLmVtaXQoJ3RpY2snLCB0aGlzLm5leHQpO1xuXHQgICAgICAgIHRoaXMuZnJhbWUgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fdGljay5iaW5kKHRoaXMpKTtcblx0ICAgICAgfSBlbHNlIHtcblx0ICAgICAgICB0aGlzLmVtaXQoJ3RpY2snLCB0aGlzLmVuZCk7XG5cdCAgICAgICAgdGhpcy5lbWl0KCdkb25lJywgbnVsbCk7XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9LCB7XG5cdCAgICBrZXk6ICdfc2hvdWxkVGljaycsXG5cdCAgICB2YWx1ZTogZnVuY3Rpb24gX3Nob3VsZFRpY2sobGFzdFRpY2spIHtcblx0ICAgICAgcmV0dXJuIHtcblx0ICAgICAgICB1cDogdGhpcy5uZXh0IDwgdGhpcy5lbmQgJiYgbGFzdFRpY2sgPD0gdGhpcy5uZXh0LFxuXHQgICAgICAgIGRvd246IHRoaXMubmV4dCA+IHRoaXMuZW5kICYmIGxhc3RUaWNrID49IHRoaXMubmV4dFxuXHQgICAgICB9W3RoaXMuZGlyZWN0aW9uXTtcblx0ICAgIH1cblx0ICB9LCB7XG5cdCAgICBrZXk6ICdfZGVmYXVsdEVhc2UnLFxuXHQgICAgdmFsdWU6IGZ1bmN0aW9uIF9kZWZhdWx0RWFzZSh0LCBiLCBjLCBkKSB7XG5cdCAgICAgIGlmICgodCAvPSBkIC8gMikgPCAxKSByZXR1cm4gYyAvIDIgKiB0ICogdCArIGI7XG5cdCAgICAgIHJldHVybiAtYyAvIDIgKiAoLS10ICogKHQgLSAyKSAtIDEpICsgYjtcblx0ICAgIH1cblx0ICB9XSk7XG5cblx0ICByZXR1cm4gVHdlZXplcjtcblx0fSgpO1xuXG5cdGV4cG9ydHMuZGVmYXVsdCA9IFR3ZWV6ZXI7XG5cbi8qKiovIH1cbi8qKioqKiovIF0pXG59KTtcbjsiLCJpbXBvcnQgc2Nyb2xsIGZyb20gJ3JhZi1zY3JvbGwuanMnXG5pbXBvcnQgVHdlZXplciBmcm9tICd0d2VlemVyLmpzJ1xuXG5jb25zdCBmZXRjaEFuY2hvcnMgPSBlbCA9PiB7XG4gIGxldCBhbmNob3JzID0gW10uc2xpY2UuY2FsbCggZWwucXVlcnlTZWxlY3RvckFsbCgnW2hyZWZdJykgKVxuICByZXR1cm4gYW5jaG9ycy5maWx0ZXIoIHJlc3RyaWN0VG9IYXNoICkubWFwKCBmZXRjaERlc3RpbmF0aW9ucyApXG59XG5jb25zdCByZXN0cmljdFRvSGFzaCA9IGVsID0+IC8jLy50ZXN0KCBlbC5hbmNob3IgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSApXG5jb25zdCBmZXRjaERlc3RpbmF0aW9ucyA9IGVsID0+IChcbiAge1xuICAgIGFuY2hvcjogZWwsIFxuICAgIGRlc3Q6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCAvLiojKC4qKS8uZXhlYyhlbC5hbmNob3IpLnBvcCgpIClcbiAgfVxuKVxuY29uc3QgcmVkdWNlVG9DbG9zZXN0ID0gc2Nyb2xsVG9wID0+IChwcmV2LCBjdXJyKSA9PiB7XG4gIC8vQ3JlYXRlIGEgbmV3IG9iamVjdCwgd2l0aCB0aGUga2V5IGJlaW5nIHRoZSBvZmZzZXRcbiAgbGV0IG9iaiA9IFtwcmV2LGN1cnJdLnJlZHVjZSggKGEsYikgPT4gKGFbIE1hdGguYWJzKCBiLmRlc3Qub2Zmc2V0WSAtIHNjcm9sbFRvcCkgXSA9IGIsIGEpLCB7fSlcbiAgbGV0IGNsb3Nlc3QgPSBNYXRoLm1pbiggLi4uT2JqZWN0LmtleXMob2JqKSApXG4gIHJldHVybiBvYmpbY2xvc2VzdF1cbn1cbmNvbnN0IGdldE9mZnNldCA9IChlbCwgd2luPXdpbmRvdywgZG9jRWxlbT1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIGJveD1mYWxzZSkgPT4gKFxuICBib3ggPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgYm94LnRvcCArICh3aW4ucGFnZVlPZmZzZXQgfHwgZG9jRWxlbS5zY3JvbGxUb3ApIC0gKGRvY0VsZW0uY2xpZW50VG9wIHx8IDApXG4pXG5jb25zdCBjYWNoZU9mZnNldHMgPSBlbCA9PiBlbC5vZmZzZXRZID0gZ2V0T2Zmc2V0KGVsKVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihlbCkge1xuICBjb25zdCB3YXlwb2ludHMgPSBmZXRjaEFuY2hvcnMoZWwpXG4gIGNvbnN0IHN0aWNreSA9IGVsLnF1ZXJ5U2VsZWN0b3IoJy5qcy1pbm5lcicpXG4gIGxldCBvZmZzZXQ7XG4gIGxldCBnZXRBbGxPZmZzZXRzO1xuICAoZ2V0QWxsT2Zmc2V0cyA9IGZ1bmN0aW9uKCl7XG4gICAgd2F5cG9pbnRzLm1hcChlbCA9PiBlbC5kZXN0KS5mb3JFYWNoKGNhY2hlT2Zmc2V0cylcbiAgICBvZmZzZXQgPSBnZXRPZmZzZXQoZWwpXG4gIH0pKCk7XG4gIHNjcm9sbCggKHNjcm9sbFRvcCkgPT4ge1xuICAgIGlmICggc2Nyb2xsVG9wID49IG9mZnNldCkge1xuICAgICAgc3RpY2t5LmNsYXNzTGlzdC5hZGQoJ2lzLWZpeGVkJylcbiAgICB9IGVsc2Uge1xuICAgICAgc3RpY2t5LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWZpeGVkJylcbiAgICB9XG4gICAgd2F5cG9pbnRzLmZvckVhY2goIGVsID0+IGVsLmFuY2hvci5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKSlcbiAgICB3YXlwb2ludHMucmVkdWNlKCByZWR1Y2VUb0Nsb3Nlc3Qoc2Nyb2xsVG9wKSApLmFuY2hvci5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKVxuICB9KVxuICB3YXlwb2ludHMuZm9yRWFjaCggd2F5cG9pbnQ9PiB7XG4gICAgd2F5cG9pbnQuYW5jaG9yLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUucmV0dXJuVmFsdWUgPSBmYWxzZVxuICAgICAgbmV3IFR3ZWV6ZXIoe1xuICAgICAgICBzdGFydDogd2luZG93LnNjcm9sbFksXG4gICAgICAgIGVuZDogZ2V0T2Zmc2V0KHdheXBvaW50LmRlc3QpIFxuICAgICAgfSlcbiAgICAgIC5vbigndGljaycsIHYgPT4gd2luZG93LnNjcm9sbFRvKDAsIHYpKVxuICAgICAgLmJlZ2luKClcbiAgICB9KVxuICB9KVxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZ2V0QWxsT2Zmc2V0cylcbn1cbiIsImltcG9ydCBXYXlzaWRlIGZyb20gJy4vLi4vc3JjL2luZGV4LmpzJ1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZSA9PiB7XG4gIGNvbnN0IGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLXdheXNpZGUnKVxuICBuZXcgV2F5c2lkZShlbClcbn0pXG5cbiJdfQ==
