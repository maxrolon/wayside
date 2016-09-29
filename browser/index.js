(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.srcindex || (g.srcindex = {})).js = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"raf-scroll.js":1,"tweezer.js":2}]},{},[3])(3)
});