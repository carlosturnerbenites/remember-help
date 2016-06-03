(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],4:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":3,"_process":2,"inherits":1}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

// Released under MIT license
// Copyright (c) 2009-2010 Dominic Baggott
// Copyright (c) 2009-2010 Ash Berlin
// Copyright (c) 2011 Christoph Dorn <christoph@christophdorn.com> (http://www.christophdorn.com)
// Date: 2013-09-15T16:12Z

(function (expose) {

  var MarkdownHelpers = {};

  // For Spidermonkey based engines
  function mk_block_toSource() {
    return "Markdown.mk_block( " + uneval(this.toString()) + ", " + uneval(this.trailing) + ", " + uneval(this.lineNumber) + " )";
  }

  // node
  function mk_block_inspect() {
    var util = require("util");
    return "Markdown.mk_block( " + util.inspect(this.toString()) + ", " + util.inspect(this.trailing) + ", " + util.inspect(this.lineNumber) + " )";
  }

  MarkdownHelpers.mk_block = function (block, trail, line) {
    // Be helpful for default case in tests.
    if (arguments.length === 1) trail = "\n\n";

    // We actually need a String object, not a string primitive
    /* jshint -W053 */
    var s = new String(block);
    s.trailing = trail;
    // To make it clear its not just a string
    s.inspect = mk_block_inspect;
    s.toSource = mk_block_toSource;

    if (line !== undefined) s.lineNumber = line;

    return s;
  };

  var isArray = MarkdownHelpers.isArray = Array.isArray || function (obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };

  // Don't mess with Array.prototype. Its not friendly
  if (Array.prototype.forEach) {
    MarkdownHelpers.forEach = function forEach(arr, cb, thisp) {
      return arr.forEach(cb, thisp);
    };
  } else {
    MarkdownHelpers.forEach = function forEach(arr, cb, thisp) {
      for (var i = 0; i < arr.length; i++) {
        cb.call(thisp || arr, arr[i], i, arr);
      }
    };
  }

  MarkdownHelpers.isEmpty = function isEmpty(obj) {
    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
  };

  MarkdownHelpers.extract_attr = function extract_attr(jsonml) {
    return isArray(jsonml) && jsonml.length > 1 && _typeof(jsonml[1]) === "object" && !isArray(jsonml[1]) ? jsonml[1] : undefined;
  };

  /**
    *  class Markdown
    *
    *  Markdown processing in Javascript done right. We have very particular views
    *  on what constitutes 'right' which include:
    *
    *  - produces well-formed HTML (this means that em and strong nesting is
    *    important)
    *
    *  - has an intermediate representation to allow processing of parsed data (We
    *    in fact have two, both as [JsonML]: a markdown tree and an HTML tree).
    *
    *  - is easily extensible to add new dialects without having to rewrite the
    *    entire parsing mechanics
    *
    *  - has a good test suite
    *
    *  This implementation fulfills all of these (except that the test suite could
    *  do with expanding to automatically run all the fixtures from other Markdown
    *  implementations.)
    *
    *  ##### Intermediate Representation
    *
    *  *TODO* Talk about this :) Its JsonML, but document the node names we use.
    *
    *  [JsonML]: http://jsonml.org/ "JSON Markup Language"
    **/
  var Markdown = function Markdown(dialect) {
    switch (typeof dialect === "undefined" ? "undefined" : _typeof(dialect)) {
      case "undefined":
        this.dialect = Markdown.dialects.Gruber;
        break;
      case "object":
        this.dialect = dialect;
        break;
      default:
        if (dialect in Markdown.dialects) this.dialect = Markdown.dialects[dialect];else throw new Error("Unknown Markdown dialect '" + String(dialect) + "'");
        break;
    }
    this.em_state = [];
    this.strong_state = [];
    this.debug_indent = "";
  };

  /**
   * Markdown.dialects
   *
   * Namespace of built-in dialects.
   **/
  Markdown.dialects = {};

  // Imported functions
  var mk_block = Markdown.mk_block = MarkdownHelpers.mk_block,
      isArray = MarkdownHelpers.isArray;

  /**
   *  parse( markdown, [dialect] ) -> JsonML
   *  - markdown (String): markdown string to parse
   *  - dialect (String | Dialect): the dialect to use, defaults to gruber
   *
   *  Parse `markdown` and return a markdown document as a Markdown.JsonML tree.
   **/
  Markdown.parse = function (source, dialect) {
    // dialect will default if undefined
    var md = new Markdown(dialect);
    return md.toTree(source);
  };

  function count_lines(str) {
    var n = 0,
        i = -1;
    while ((i = str.indexOf("\n", i + 1)) !== -1) {
      n++;
    }return n;
  }

  // Internal - split source into rough blocks
  Markdown.prototype.split_blocks = function splitBlocks(input) {
    input = input.replace(/(\r\n|\n|\r)/g, "\n");
    // [\s\S] matches _anything_ (newline or space)
    // [^] is equivalent but doesn't work in IEs.
    var re = /([\s\S]+?)($|\n#|\n(?:\s*\n|$)+)/g,
        blocks = [],
        m;

    var line_no = 1;

    if ((m = /^(\s*\n)/.exec(input)) !== null) {
      // skip (but count) leading blank lines
      line_no += count_lines(m[0]);
      re.lastIndex = m[0].length;
    }

    while ((m = re.exec(input)) !== null) {
      if (m[2] === "\n#") {
        m[2] = "\n";
        re.lastIndex--;
      }
      blocks.push(mk_block(m[1], m[2], line_no));
      line_no += count_lines(m[0]);
    }

    return blocks;
  };

  /**
   *  Markdown#processBlock( block, next ) -> undefined | [ JsonML, ... ]
   *  - block (String): the block to process
   *  - next (Array): the following blocks
   *
   * Process `block` and return an array of JsonML nodes representing `block`.
   *
   * It does this by asking each block level function in the dialect to process
   * the block until one can. Succesful handling is indicated by returning an
   * array (with zero or more JsonML nodes), failure by a false value.
   *
   * Blocks handlers are responsible for calling [[Markdown#processInline]]
   * themselves as appropriate.
   *
   * If the blocks were split incorrectly or adjacent blocks need collapsing you
   * can adjust `next` in place using shift/splice etc.
   *
   * If any of this default behaviour is not right for the dialect, you can
   * define a `__call__` method on the dialect that will get invoked to handle
   * the block processing.
   */
  Markdown.prototype.processBlock = function processBlock(block, next) {
    var cbs = this.dialect.block,
        ord = cbs.__order__;

    if ("__call__" in cbs) return cbs.__call__.call(this, block, next);

    for (var i = 0; i < ord.length; i++) {
      //D:this.debug( "Testing", ord[i] );
      var res = cbs[ord[i]].call(this, block, next);
      if (res) {
        //D:this.debug("  matched");
        if (!isArray(res) || res.length > 0 && !isArray(res[0])) this.debug(ord[i], "didn't return a proper array");
        //D:this.debug( "" );
        return res;
      }
    }

    // Uhoh! no match! Should we throw an error?
    return [];
  };

  Markdown.prototype.processInline = function processInline(block) {
    return this.dialect.inline.__call__.call(this, String(block));
  };

  /**
   *  Markdown#toTree( source ) -> JsonML
   *  - source (String): markdown source to parse
   *
   *  Parse `source` into a JsonML tree representing the markdown document.
   **/
  // custom_tree means set this.tree to `custom_tree` and restore old value on return
  Markdown.prototype.toTree = function toTree(source, custom_root) {
    var blocks = source instanceof Array ? source : this.split_blocks(source);

    // Make tree a member variable so its easier to mess with in extensions
    var old_tree = this.tree;
    try {
      this.tree = custom_root || this.tree || ["markdown"];

      blocks_loop: while (blocks.length) {
        var b = this.processBlock(blocks.shift(), blocks);

        // Reference blocks and the like won't return any content
        if (!b.length) continue blocks_loop;

        this.tree.push.apply(this.tree, b);
      }
      return this.tree;
    } finally {
      if (custom_root) this.tree = old_tree;
    }
  };

  // Noop by default
  Markdown.prototype.debug = function () {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(this.debug_indent);
    if (typeof print !== "undefined") print.apply(print, args);
    if (typeof console !== "undefined" && typeof console.log !== "undefined") console.log.apply(null, args);
  };

  Markdown.prototype.loop_re_over_block = function (re, block, cb) {
    // Dont use /g regexps with this
    var m,
        b = block.valueOf();

    while (b.length && (m = re.exec(b)) !== null) {
      b = b.substr(m[0].length);
      cb.call(this, m);
    }
    return b;
  };

  // Build default order from insertion order.
  Markdown.buildBlockOrder = function (d) {
    var ord = [];
    for (var i in d) {
      if (i === "__order__" || i === "__call__") continue;
      ord.push(i);
    }
    d.__order__ = ord;
  };

  // Build patterns for inline matcher
  Markdown.buildInlinePatterns = function (d) {
    var patterns = [];

    for (var i in d) {
      // __foo__ is reserved and not a pattern
      if (i.match(/^__.*__$/)) continue;
      var l = i.replace(/([\\.*+?|()\[\]{}])/g, "\\$1").replace(/\n/, "\\n");
      patterns.push(i.length === 1 ? l : "(?:" + l + ")");
    }

    patterns = patterns.join("|");
    d.__patterns__ = patterns;
    //print("patterns:", uneval( patterns ) );

    var fn = d.__call__;
    d.__call__ = function (text, pattern) {
      if (pattern !== undefined) return fn.call(this, text, pattern);else return fn.call(this, text, patterns);
    };
  };

  var extract_attr = MarkdownHelpers.extract_attr;

  /**
   *  renderJsonML( jsonml[, options] ) -> String
   *  - jsonml (Array): JsonML array to render to XML
   *  - options (Object): options
   *
   *  Converts the given JsonML into well-formed XML.
   *
   *  The options currently understood are:
   *
   *  - root (Boolean): wether or not the root node should be included in the
   *    output, or just its children. The default `false` is to not include the
   *    root itself.
   */
  Markdown.renderJsonML = function (jsonml, options) {
    options = options || {};
    // include the root element in the rendered output?
    options.root = options.root || false;

    var content = [];

    if (options.root) {
      content.push(render_tree(jsonml));
    } else {
      jsonml.shift(); // get rid of the tag
      if (jsonml.length && _typeof(jsonml[0]) === "object" && !(jsonml[0] instanceof Array)) jsonml.shift(); // get rid of the attributes

      while (jsonml.length) {
        content.push(render_tree(jsonml.shift()));
      }
    }

    return content.join("\n\n");
  };

  /**
   *  toHTMLTree( markdown, [dialect] ) -> JsonML
   *  toHTMLTree( md_tree ) -> JsonML
   *  - markdown (String): markdown string to parse
   *  - dialect (String | Dialect): the dialect to use, defaults to gruber
   *  - md_tree (Markdown.JsonML): parsed markdown tree
   *
   *  Turn markdown into HTML, represented as a JsonML tree. If a string is given
   *  to this function, it is first parsed into a markdown tree by calling
   *  [[parse]].
   **/
  Markdown.toHTMLTree = function toHTMLTree(input, dialect, options) {

    // convert string input to an MD tree
    if (typeof input === "string") input = this.parse(input, dialect);

    // Now convert the MD tree to an HTML tree

    // remove references from the tree
    var attrs = extract_attr(input),
        refs = {};

    if (attrs && attrs.references) refs = attrs.references;

    var html = convert_tree_to_html(input, refs, options);
    merge_text_nodes(html);
    return html;
  };

  /**
   *  toHTML( markdown, [dialect]  ) -> String
   *  toHTML( md_tree ) -> String
   *  - markdown (String): markdown string to parse
   *  - md_tree (Markdown.JsonML): parsed markdown tree
   *
   *  Take markdown (either as a string or as a JsonML tree) and run it through
   *  [[toHTMLTree]] then turn it into a well-formated HTML fragment.
   **/
  Markdown.toHTML = function toHTML(source, dialect, options) {
    var input = this.toHTMLTree(source, dialect, options);

    return this.renderJsonML(input);
  };

  function escapeHTML(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function render_tree(jsonml) {
    // basic case
    if (typeof jsonml === "string") return escapeHTML(jsonml);

    var tag = jsonml.shift(),
        attributes = {},
        content = [];

    if (jsonml.length && _typeof(jsonml[0]) === "object" && !(jsonml[0] instanceof Array)) attributes = jsonml.shift();

    while (jsonml.length) {
      content.push(render_tree(jsonml.shift()));
    }var tag_attrs = "";
    for (var a in attributes) {
      tag_attrs += " " + a + '="' + escapeHTML(attributes[a]) + '"';
    } // be careful about adding whitespace here for inline elements
    if (tag === "img" || tag === "br" || tag === "hr") return "<" + tag + tag_attrs + "/>";else return "<" + tag + tag_attrs + ">" + content.join("") + "</" + tag + ">";
  }

  function convert_tree_to_html(tree, references, options) {
    var i;
    options = options || {};

    // shallow clone
    var jsonml = tree.slice(0);

    if (typeof options.preprocessTreeNode === "function") jsonml = options.preprocessTreeNode(jsonml, references);

    // Clone attributes if they exist
    var attrs = extract_attr(jsonml);
    if (attrs) {
      jsonml[1] = {};
      for (i in attrs) {
        jsonml[1][i] = attrs[i];
      }
      attrs = jsonml[1];
    }

    // basic case
    if (typeof jsonml === "string") return jsonml;

    // convert this node
    switch (jsonml[0]) {
      case "header":
        jsonml[0] = "h" + jsonml[1].level;
        delete jsonml[1].level;
        break;
      case "bulletlist":
        jsonml[0] = "ul";
        break;
      case "numberlist":
        jsonml[0] = "ol";
        break;
      case "listitem":
        jsonml[0] = "li";
        break;
      case "para":
        jsonml[0] = "p";
        break;
      case "markdown":
        jsonml[0] = "html";
        if (attrs) delete attrs.references;
        break;
      case "code_block":
        jsonml[0] = "pre";
        i = attrs ? 2 : 1;
        var code = ["code"];
        code.push.apply(code, jsonml.splice(i, jsonml.length - i));
        jsonml[i] = code;
        break;
      case "inlinecode":
        jsonml[0] = "code";
        break;
      case "img":
        jsonml[1].src = jsonml[1].href;
        delete jsonml[1].href;
        break;
      case "linebreak":
        jsonml[0] = "br";
        break;
      case "link":
        jsonml[0] = "a";
        break;
      case "link_ref":
        jsonml[0] = "a";

        // grab this ref and clean up the attribute node
        var ref = references[attrs.ref];

        // if the reference exists, make the link
        if (ref) {
          delete attrs.ref;

          // add in the href and title, if present
          attrs.href = ref.href;
          if (ref.title) attrs.title = ref.title;

          // get rid of the unneeded original text
          delete attrs.original;
        }
        // the reference doesn't exist, so revert to plain text
        else {
            return attrs.original;
          }
        break;
      case "img_ref":
        jsonml[0] = "img";

        // grab this ref and clean up the attribute node
        var ref = references[attrs.ref];

        // if the reference exists, make the link
        if (ref) {
          delete attrs.ref;

          // add in the href and title, if present
          attrs.src = ref.href;
          if (ref.title) attrs.title = ref.title;

          // get rid of the unneeded original text
          delete attrs.original;
        }
        // the reference doesn't exist, so revert to plain text
        else {
            return attrs.original;
          }
        break;
    }

    // convert all the children
    i = 1;

    // deal with the attribute node, if it exists
    if (attrs) {
      // if there are keys, skip over it
      for (var key in jsonml[1]) {
        i = 2;
        break;
      }
      // if there aren't, remove it
      if (i === 1) jsonml.splice(i, 1);
    }

    for (; i < jsonml.length; ++i) {
      jsonml[i] = convert_tree_to_html(jsonml[i], references, options);
    }

    return jsonml;
  }

  // merges adjacent text nodes into a single node
  function merge_text_nodes(jsonml) {
    // skip the tag name and attribute hash
    var i = extract_attr(jsonml) ? 2 : 1;

    while (i < jsonml.length) {
      // if it's a string check the next item too
      if (typeof jsonml[i] === "string") {
        if (i + 1 < jsonml.length && typeof jsonml[i + 1] === "string") {
          // merge the second string into the first and remove it
          jsonml[i] += jsonml.splice(i + 1, 1)[0];
        } else {
          ++i;
        }
      }
      // if it's not a string recurse
      else {
          merge_text_nodes(jsonml[i]);
          ++i;
        }
    }
  };

  var DialectHelpers = {};
  DialectHelpers.inline_until_char = function (text, want) {
    var consumed = 0,
        nodes = [];

    while (true) {
      if (text.charAt(consumed) === want) {
        // Found the character we were looking for
        consumed++;
        return [consumed, nodes];
      }

      if (consumed >= text.length) {
        // No closing char found. Abort.
        return null;
      }

      var res = this.dialect.inline.__oneElement__.call(this, text.substr(consumed));
      consumed += res[0];
      // Add any returned nodes.
      nodes.push.apply(nodes, res.slice(1));
    }
  };

  // Helper function to make sub-classing a dialect easier
  DialectHelpers.subclassDialect = function (d) {
    function Block() {}
    Block.prototype = d.block;
    function Inline() {}
    Inline.prototype = d.inline;

    return { block: new Block(), inline: new Inline() };
  };

  var forEach = MarkdownHelpers.forEach,
      extract_attr = MarkdownHelpers.extract_attr,
      mk_block = MarkdownHelpers.mk_block,
      isEmpty = MarkdownHelpers.isEmpty,
      inline_until_char = DialectHelpers.inline_until_char;

  /**
   * Gruber dialect
   *
   * The default dialect that follows the rules set out by John Gruber's
   * markdown.pl as closely as possible. Well actually we follow the behaviour of
   * that script which in some places is not exactly what the syntax web page
   * says.
   **/
  var Gruber = {
    block: {
      atxHeader: function atxHeader(block, next) {
        var m = block.match(/^(#{1,6})\s*(.*?)\s*#*\s*(?:\n|$)/);

        if (!m) return undefined;

        var header = ["header", { level: m[1].length }];
        Array.prototype.push.apply(header, this.processInline(m[2]));

        if (m[0].length < block.length) next.unshift(mk_block(block.substr(m[0].length), block.trailing, block.lineNumber + 2));

        return [header];
      },

      setextHeader: function setextHeader(block, next) {
        var m = block.match(/^(.*)\n([-=])\2\2+(?:\n|$)/);

        if (!m) return undefined;

        var level = m[2] === "=" ? 1 : 2,
            header = ["header", { level: level }, m[1]];

        if (m[0].length < block.length) next.unshift(mk_block(block.substr(m[0].length), block.trailing, block.lineNumber + 2));

        return [header];
      },

      code: function code(block, next) {
        // |    Foo
        // |bar
        // should be a code block followed by a paragraph. Fun
        //
        // There might also be adjacent code block to merge.

        var ret = [],
            re = /^(?: {0,3}\t| {4})(.*)\n?/;

        // 4 spaces + content
        if (!block.match(re)) return undefined;

        block_search: do {
          // Now pull out the rest of the lines
          var b = this.loop_re_over_block(re, block.valueOf(), function (m) {
            ret.push(m[1]);
          });

          if (b.length) {
            // Case alluded to in first comment. push it back on as a new block
            next.unshift(mk_block(b, block.trailing));
            break block_search;
          } else if (next.length) {
            // Check the next block - it might be code too
            if (!next[0].match(re)) break block_search;

            // Pull how how many blanks lines follow - minus two to account for .join
            ret.push(block.trailing.replace(/[^\n]/g, "").substring(2));

            block = next.shift();
          } else {
            break block_search;
          }
        } while (true);

        return [["code_block", ret.join("\n")]];
      },

      horizRule: function horizRule(block, next) {
        // this needs to find any hr in the block to handle abutting blocks
        var m = block.match(/^(?:([\s\S]*?)\n)?[ \t]*([-_*])(?:[ \t]*\2){2,}[ \t]*(?:\n([\s\S]*))?$/);

        if (!m) return undefined;

        var jsonml = [["hr"]];

        // if there's a leading abutting block, process it
        if (m[1]) {
          var contained = mk_block(m[1], "", block.lineNumber);
          jsonml.unshift.apply(jsonml, this.toTree(contained, []));
        }

        // if there's a trailing abutting block, stick it into next
        if (m[3]) next.unshift(mk_block(m[3], block.trailing, block.lineNumber + 1));

        return jsonml;
      },

      // There are two types of lists. Tight and loose. Tight lists have no whitespace
      // between the items (and result in text just in the <li>) and loose lists,
      // which have an empty line between list items, resulting in (one or more)
      // paragraphs inside the <li>.
      //
      // There are all sorts weird edge cases about the original markdown.pl's
      // handling of lists:
      //
      // * Nested lists are supposed to be indented by four chars per level. But
      //   if they aren't, you can get a nested list by indenting by less than
      //   four so long as the indent doesn't match an indent of an existing list
      //   item in the 'nest stack'.
      //
      // * The type of the list (bullet or number) is controlled just by the
      //    first item at the indent. Subsequent changes are ignored unless they
      //    are for nested lists
      //
      lists: function () {
        // Use a closure to hide a few variables.
        var any_list = "[*+-]|\\d+\\.",
            bullet_list = /[*+-]/,

        // Capture leading indent as it matters for determining nested lists.
        is_list_re = new RegExp("^( {0,3})(" + any_list + ")[ \t]+"),
            indent_re = "(?: {0,3}\\t| {4})";

        // TODO: Cache this regexp for certain depths.
        // Create a regexp suitable for matching an li for a given stack depth
        function regex_for_depth(depth) {

          return new RegExp(
          // m[1] = indent, m[2] = list_type
          "(?:^(" + indent_re + "{0," + depth + "} {0,3})(" + any_list + ")\\s+)|" +
          // m[3] = cont
          "(^" + indent_re + "{0," + (depth - 1) + "}[ ]{0,4})");
        }
        function expand_tab(input) {
          return input.replace(/ {0,3}\t/g, "    ");
        }

        // Add inline content `inline` to `li`. inline comes from processInline
        // so is an array of content
        function add(li, loose, inline, nl) {
          if (loose) {
            li.push(["para"].concat(inline));
            return;
          }
          // Hmmm, should this be any block level element or just paras?
          var add_to = li[li.length - 1] instanceof Array && li[li.length - 1][0] === "para" ? li[li.length - 1] : li;

          // If there is already some content in this list, add the new line in
          if (nl && li.length > 1) inline.unshift(nl);

          for (var i = 0; i < inline.length; i++) {
            var what = inline[i],
                is_str = typeof what === "string";
            if (is_str && add_to.length > 1 && typeof add_to[add_to.length - 1] === "string") add_to[add_to.length - 1] += what;else add_to.push(what);
          }
        }

        // contained means have an indent greater than the current one. On
        // *every* line in the block
        function get_contained_blocks(depth, blocks) {

          var re = new RegExp("^(" + indent_re + "{" + depth + "}.*?\\n?)*$"),
              replace = new RegExp("^" + indent_re + "{" + depth + "}", "gm"),
              ret = [];

          while (blocks.length > 0) {
            if (re.exec(blocks[0])) {
              var b = blocks.shift(),

              // Now remove that indent
              x = b.replace(replace, "");

              ret.push(mk_block(x, b.trailing, b.lineNumber));
            } else break;
          }
          return ret;
        }

        // passed to stack.forEach to turn list items up the stack into paras
        function paragraphify(s, i, stack) {
          var list = s.list;
          var last_li = list[list.length - 1];

          if (last_li[1] instanceof Array && last_li[1][0] === "para") return;
          if (i + 1 === stack.length) {
            // Last stack frame
            // Keep the same array, but replace the contents
            last_li.push(["para"].concat(last_li.splice(1, last_li.length - 1)));
          } else {
            var sublist = last_li.pop();
            last_li.push(["para"].concat(last_li.splice(1, last_li.length - 1)), sublist);
          }
        }

        // The matcher function
        return function (block, next) {
          var m = block.match(is_list_re);
          if (!m) return undefined;

          function make_list(m) {
            var list = bullet_list.exec(m[2]) ? ["bulletlist"] : ["numberlist"];

            stack.push({ list: list, indent: m[1] });
            return list;
          }

          var stack = [],
              // Stack of lists for nesting.
          list = make_list(m),
              last_li,
              loose = false,
              ret = [stack[0].list],
              i;

          // Loop to search over block looking for inner block elements and loose lists
          loose_search: while (true) {
            // Split into lines preserving new lines at end of line
            var lines = block.split(/(?=\n)/);

            // We have to grab all lines for a li and call processInline on them
            // once as there are some inline things that can span lines.
            var li_accumulate = "",
                nl = "";

            // Loop over the lines in this block looking for tight lists.
            tight_search: for (var line_no = 0; line_no < lines.length; line_no++) {
              nl = "";
              var l = lines[line_no].replace(/^\n/, function (n) {
                nl = n;return "";
              });

              // TODO: really should cache this
              var line_re = regex_for_depth(stack.length);

              m = l.match(line_re);
              //print( "line:", uneval(l), "\nline match:", uneval(m) );

              // We have a list item
              if (m[1] !== undefined) {
                // Process the previous list item, if any
                if (li_accumulate.length) {
                  add(last_li, loose, this.processInline(li_accumulate), nl);
                  // Loose mode will have been dealt with. Reset it
                  loose = false;
                  li_accumulate = "";
                }

                m[1] = expand_tab(m[1]);
                var wanted_depth = Math.floor(m[1].length / 4) + 1;
                //print( "want:", wanted_depth, "stack:", stack.length);
                if (wanted_depth > stack.length) {
                  // Deep enough for a nested list outright
                  //print ( "new nested list" );
                  list = make_list(m);
                  last_li.push(list);
                  last_li = list[1] = ["listitem"];
                } else {
                  // We aren't deep enough to be strictly a new level. This is
                  // where Md.pl goes nuts. If the indent matches a level in the
                  // stack, put it there, else put it one deeper then the
                  // wanted_depth deserves.
                  var found = false;
                  for (i = 0; i < stack.length; i++) {
                    if (stack[i].indent !== m[1]) continue;

                    list = stack[i].list;
                    stack.splice(i + 1, stack.length - (i + 1));
                    found = true;
                    break;
                  }

                  if (!found) {
                    //print("not found. l:", uneval(l));
                    wanted_depth++;
                    if (wanted_depth <= stack.length) {
                      stack.splice(wanted_depth, stack.length - wanted_depth);
                      //print("Desired depth now", wanted_depth, "stack:", stack.length);
                      list = stack[wanted_depth - 1].list;
                      //print("list:", uneval(list) );
                    } else {
                        //print ("made new stack for messy indent");
                        list = make_list(m);
                        last_li.push(list);
                      }
                  }

                  //print( uneval(list), "last", list === stack[stack.length-1].list );
                  last_li = ["listitem"];
                  list.push(last_li);
                } // end depth of shenegains
                nl = "";
              }

              // Add content
              if (l.length > m[0].length) li_accumulate += nl + l.substr(m[0].length);
            } // tight_search

            if (li_accumulate.length) {
              add(last_li, loose, this.processInline(li_accumulate), nl);
              // Loose mode will have been dealt with. Reset it
              loose = false;
              li_accumulate = "";
            }

            // Look at the next block - we might have a loose list. Or an extra
            // paragraph for the current li
            var contained = get_contained_blocks(stack.length, next);

            // Deal with code blocks or properly nested lists
            if (contained.length > 0) {
              // Make sure all listitems up the stack are paragraphs
              forEach(stack, paragraphify, this);

              last_li.push.apply(last_li, this.toTree(contained, []));
            }

            var next_block = next[0] && next[0].valueOf() || "";

            if (next_block.match(is_list_re) || next_block.match(/^ /)) {
              block = next.shift();

              // Check for an HR following a list: features/lists/hr_abutting
              var hr = this.dialect.block.horizRule(block, next);

              if (hr) {
                ret.push.apply(ret, hr);
                break;
              }

              // Make sure all listitems up the stack are paragraphs
              forEach(stack, paragraphify, this);

              loose = true;
              continue loose_search;
            }
            break;
          } // loose_search

          return ret;
        };
      }(),

      blockquote: function blockquote(block, next) {
        if (!block.match(/^>/m)) return undefined;

        var jsonml = [];

        // separate out the leading abutting block, if any. I.e. in this case:
        //
        //  a
        //  > b
        //
        if (block[0] !== ">") {
          var lines = block.split(/\n/),
              prev = [],
              line_no = block.lineNumber;

          // keep shifting lines until you find a crotchet
          while (lines.length && lines[0][0] !== ">") {
            prev.push(lines.shift());
            line_no++;
          }

          var abutting = mk_block(prev.join("\n"), "\n", block.lineNumber);
          jsonml.push.apply(jsonml, this.processBlock(abutting, []));
          // reassemble new block of just block quotes!
          block = mk_block(lines.join("\n"), block.trailing, line_no);
        }

        // if the next block is also a blockquote merge it in
        while (next.length && next[0][0] === ">") {
          var b = next.shift();
          block = mk_block(block + block.trailing + b, b.trailing, block.lineNumber);
        }

        // Strip off the leading "> " and re-process as a block.
        var input = block.replace(/^> ?/gm, ""),
            old_tree = this.tree,
            processedBlock = this.toTree(input, ["blockquote"]),
            attr = extract_attr(processedBlock);

        // If any link references were found get rid of them
        if (attr && attr.references) {
          delete attr.references;
          // And then remove the attribute object if it's empty
          if (isEmpty(attr)) processedBlock.splice(1, 1);
        }

        jsonml.push(processedBlock);
        return jsonml;
      },

      referenceDefn: function referenceDefn(block, next) {
        var re = /^\s*\[(.*?)\]:\s*(\S+)(?:\s+(?:(['"])(.*?)\3|\((.*?)\)))?\n?/;
        // interesting matches are [ , ref_id, url, , title, title ]

        if (!block.match(re)) return undefined;

        // make an attribute node if it doesn't exist
        if (!extract_attr(this.tree)) this.tree.splice(1, 0, {});

        var attrs = extract_attr(this.tree);

        // make a references hash if it doesn't exist
        if (attrs.references === undefined) attrs.references = {};

        var b = this.loop_re_over_block(re, block, function (m) {

          if (m[2] && m[2][0] === "<" && m[2][m[2].length - 1] === ">") m[2] = m[2].substring(1, m[2].length - 1);

          var ref = attrs.references[m[1].toLowerCase()] = {
            href: m[2]
          };

          if (m[4] !== undefined) ref.title = m[4];else if (m[5] !== undefined) ref.title = m[5];
        });

        if (b.length) next.unshift(mk_block(b, block.trailing));

        return [];
      },

      para: function para(block) {
        // everything's a para!
        return [["para"].concat(this.processInline(block))];
      }
    },

    inline: {

      __oneElement__: function oneElement(text, patterns_or_re, previous_nodes) {
        var m, res;

        patterns_or_re = patterns_or_re || this.dialect.inline.__patterns__;
        var re = new RegExp("([\\s\\S]*?)(" + (patterns_or_re.source || patterns_or_re) + ")");

        m = re.exec(text);
        if (!m) {
          // Just boring text
          return [text.length, text];
        } else if (m[1]) {
          // Some un-interesting text matched. Return that first
          return [m[1].length, m[1]];
        }

        var res;
        if (m[2] in this.dialect.inline) {
          res = this.dialect.inline[m[2]].call(this, text.substr(m.index), m, previous_nodes || []);
        }
        // Default for now to make dev easier. just slurp special and output it.
        res = res || [m[2].length, m[2]];
        return res;
      },

      __call__: function inline(text, patterns) {

        var out = [],
            res;

        function add(x) {
          //D:self.debug("  adding output", uneval(x));
          if (typeof x === "string" && typeof out[out.length - 1] === "string") out[out.length - 1] += x;else out.push(x);
        }

        while (text.length > 0) {
          res = this.dialect.inline.__oneElement__.call(this, text, patterns, out);
          text = text.substr(res.shift());
          forEach(res, add);
        }

        return out;
      },

      // These characters are intersting elsewhere, so have rules for them so that
      // chunks of plain text blocks don't include them
      "]": function _() {},
      "}": function _() {},

      __escape__: /^\\[\\`\*_{}\[\]()#\+.!\-]/,

      "\\": function escaped(text) {
        // [ length of input processed, node/children to add... ]
        // Only esacape: \ ` * _ { } [ ] ( ) # * + - . !
        if (this.dialect.inline.__escape__.exec(text)) return [2, text.charAt(1)];else
          // Not an esacpe
          return [1, "\\"];
      },

      "![": function image(text) {

        // Unlike images, alt text is plain text only. no other elements are
        // allowed in there

        // ![Alt text](/path/to/img.jpg "Optional title")
        //      1          2            3       4         <--- captures
        var m = text.match(/^!\[(.*?)\][ \t]*\([ \t]*([^")]*?)(?:[ \t]+(["'])(.*?)\3)?[ \t]*\)/);

        if (m) {
          if (m[2] && m[2][0] === "<" && m[2][m[2].length - 1] === ">") m[2] = m[2].substring(1, m[2].length - 1);

          m[2] = this.dialect.inline.__call__.call(this, m[2], /\\/)[0];

          var attrs = { alt: m[1], href: m[2] || "" };
          if (m[4] !== undefined) attrs.title = m[4];

          return [m[0].length, ["img", attrs]];
        }

        // ![Alt text][id]
        m = text.match(/^!\[(.*?)\][ \t]*\[(.*?)\]/);

        if (m) {
          // We can't check if the reference is known here as it likely wont be
          // found till after. Check it in md tree->hmtl tree conversion
          return [m[0].length, ["img_ref", { alt: m[1], ref: m[2].toLowerCase(), original: m[0] }]];
        }

        // Just consume the '!['
        return [2, "!["];
      },

      "[": function link(text) {

        var orig = String(text);
        // Inline content is possible inside `link text`
        var res = inline_until_char.call(this, text.substr(1), "]");

        // No closing ']' found. Just consume the [
        if (!res) return [1, "["];

        var consumed = 1 + res[0],
            children = res[1],
            link,
            attrs;

        // At this point the first [...] has been parsed. See what follows to find
        // out which kind of link we are (reference or direct url)
        text = text.substr(consumed);

        // [link text](/path/to/img.jpg "Optional title")
        //                 1            2       3         <--- captures
        // This will capture up to the last paren in the block. We then pull
        // back based on if there a matching ones in the url
        //    ([here](/url/(test))
        // The parens have to be balanced
        var m = text.match(/^\s*\([ \t]*([^"']*)(?:[ \t]+(["'])(.*?)\2)?[ \t]*\)/);
        if (m) {
          var url = m[1];
          consumed += m[0].length;

          if (url && url[0] === "<" && url[url.length - 1] === ">") url = url.substring(1, url.length - 1);

          // If there is a title we don't have to worry about parens in the url
          if (!m[3]) {
            var open_parens = 1; // One open that isn't in the capture
            for (var len = 0; len < url.length; len++) {
              switch (url[len]) {
                case "(":
                  open_parens++;
                  break;
                case ")":
                  if (--open_parens === 0) {
                    consumed -= url.length - len;
                    url = url.substring(0, len);
                  }
                  break;
              }
            }
          }

          // Process escapes only
          url = this.dialect.inline.__call__.call(this, url, /\\/)[0];

          attrs = { href: url || "" };
          if (m[3] !== undefined) attrs.title = m[3];

          link = ["link", attrs].concat(children);
          return [consumed, link];
        }

        // [Alt text][id]
        // [Alt text] [id]
        m = text.match(/^\s*\[(.*?)\]/);

        if (m) {

          consumed += m[0].length;

          // [links][] uses links as its reference
          attrs = { ref: (m[1] || String(children)).toLowerCase(), original: orig.substr(0, consumed) };

          link = ["link_ref", attrs].concat(children);

          // We can't check if the reference is known here as it likely wont be
          // found till after. Check it in md tree->hmtl tree conversion.
          // Store the original so that conversion can revert if the ref isn't found.
          return [consumed, link];
        }

        // [id]
        // Only if id is plain (no formatting.)
        if (children.length === 1 && typeof children[0] === "string") {

          attrs = { ref: children[0].toLowerCase(), original: orig.substr(0, consumed) };
          link = ["link_ref", attrs, children[0]];
          return [consumed, link];
        }

        // Just consume the "["
        return [1, "["];
      },

      "<": function autoLink(text) {
        var m;

        if ((m = text.match(/^<(?:((https?|ftp|mailto):[^>]+)|(.*?@.*?\.[a-zA-Z]+))>/)) !== null) {
          if (m[3]) return [m[0].length, ["link", { href: "mailto:" + m[3] }, m[3]]];else if (m[2] === "mailto") return [m[0].length, ["link", { href: m[1] }, m[1].substr("mailto:".length)]];else return [m[0].length, ["link", { href: m[1] }, m[1]]];
        }

        return [1, "<"];
      },

      "`": function inlineCode(text) {
        // Inline code block. as many backticks as you like to start it
        // Always skip over the opening ticks.
        var m = text.match(/(`+)(([\s\S]*?)\1)/);

        if (m && m[2]) return [m[1].length + m[2].length, ["inlinecode", m[3]]];else {
          // TODO: No matching end code found - warn!
          return [1, "`"];
        }
      },

      "  \n": function lineBreak() {
        return [3, ["linebreak"]];
      }

    }
  };

  // Meta Helper/generator method for em and strong handling
  function strong_em(tag, md) {

    var state_slot = tag + "_state",
        other_slot = tag === "strong" ? "em_state" : "strong_state";

    function CloseTag(len) {
      this.len_after = len;
      this.name = "close_" + md;
    }

    return function (text) {

      if (this[state_slot][0] === md) {
        // Most recent em is of this type
        //D:this.debug("closing", md);
        this[state_slot].shift();

        // "Consume" everything to go back to the recrusion in the else-block below
        return [text.length, new CloseTag(text.length - md.length)];
      } else {
        // Store a clone of the em/strong states
        var other = this[other_slot].slice(),
            state = this[state_slot].slice();

        this[state_slot].unshift(md);

        //D:this.debug_indent += "  ";

        // Recurse
        var res = this.processInline(text.substr(md.length));
        //D:this.debug_indent = this.debug_indent.substr(2);

        var last = res[res.length - 1];

        //D:this.debug("processInline from", tag + ": ", uneval( res ) );

        var check = this[state_slot].shift();
        if (last instanceof CloseTag) {
          res.pop();
          // We matched! Huzzah.
          var consumed = text.length - last.len_after;
          return [consumed, [tag].concat(res)];
        } else {
          // Restore the state of the other kind. We might have mistakenly closed it.
          this[other_slot] = other;
          this[state_slot] = state;

          // We can't reuse the processed result as it could have wrong parsing contexts in it.
          return [md.length, md];
        }
      }
    }; // End returned function
  }

  Gruber.inline["**"] = strong_em("strong", "**");
  Gruber.inline["__"] = strong_em("strong", "__");
  Gruber.inline["*"] = strong_em("em", "*");
  Gruber.inline["_"] = strong_em("em", "_");

  Markdown.dialects.Gruber = Gruber;
  Markdown.buildBlockOrder(Markdown.dialects.Gruber.block);
  Markdown.buildInlinePatterns(Markdown.dialects.Gruber.inline);

  var Maruku = DialectHelpers.subclassDialect(Gruber),
      extract_attr = MarkdownHelpers.extract_attr,
      forEach = MarkdownHelpers.forEach;

  Maruku.processMetaHash = function processMetaHash(meta_string) {
    var meta = split_meta_hash(meta_string),
        attr = {};

    for (var i = 0; i < meta.length; ++i) {
      // id: #foo
      if (/^#/.test(meta[i])) attr.id = meta[i].substring(1);
      // class: .foo
      else if (/^\./.test(meta[i])) {
          // if class already exists, append the new one
          if (attr["class"]) attr["class"] = attr["class"] + meta[i].replace(/./, " ");else attr["class"] = meta[i].substring(1);
        }
        // attribute: foo=bar
        else if (/\=/.test(meta[i])) {
            var s = meta[i].split(/\=/);
            attr[s[0]] = s[1];
          }
    }

    return attr;
  };

  function split_meta_hash(meta_string) {
    var meta = meta_string.split(""),
        parts = [""],
        in_quotes = false;

    while (meta.length) {
      var letter = meta.shift();
      switch (letter) {
        case " ":
          // if we're in a quoted section, keep it
          if (in_quotes) parts[parts.length - 1] += letter;
          // otherwise make a new part
          else parts.push("");
          break;
        case "'":
        case '"':
          // reverse the quotes and move straight on
          in_quotes = !in_quotes;
          break;
        case "\\":
          // shift off the next letter to be used straight away.
          // it was escaped so we'll keep it whatever it is
          letter = meta.shift();
        /* falls through */
        default:
          parts[parts.length - 1] += letter;
          break;
      }
    }

    return parts;
  }

  Maruku.block.document_meta = function document_meta(block) {
    // we're only interested in the first block
    if (block.lineNumber > 1) return undefined;

    // document_meta blocks consist of one or more lines of `Key: Value\n`
    if (!block.match(/^(?:\w+:.*\n)*\w+:.*$/)) return undefined;

    // make an attribute node if it doesn't exist
    if (!extract_attr(this.tree)) this.tree.splice(1, 0, {});

    var pairs = block.split(/\n/);
    for (var p in pairs) {
      var m = pairs[p].match(/(\w+):\s*(.*)$/),
          key = m[1].toLowerCase(),
          value = m[2];

      this.tree[1][key] = value;
    }

    // document_meta produces no content!
    return [];
  };

  Maruku.block.block_meta = function block_meta(block) {
    // check if the last line of the block is an meta hash
    var m = block.match(/(^|\n) {0,3}\{:\s*((?:\\\}|[^\}])*)\s*\}$/);
    if (!m) return undefined;

    // process the meta hash
    var attr = this.dialect.processMetaHash(m[2]),
        hash;

    // if we matched ^ then we need to apply meta to the previous block
    if (m[1] === "") {
      var node = this.tree[this.tree.length - 1];
      hash = extract_attr(node);

      // if the node is a string (rather than JsonML), bail
      if (typeof node === "string") return undefined;

      // create the attribute hash if it doesn't exist
      if (!hash) {
        hash = {};
        node.splice(1, 0, hash);
      }

      // add the attributes in
      for (var a in attr) {
        hash[a] = attr[a];
      } // return nothing so the meta hash is removed
      return [];
    }

    // pull the meta hash off the block and process what's left
    var b = block.replace(/\n.*$/, ""),
        result = this.processBlock(b, []);

    // get or make the attributes hash
    hash = extract_attr(result[0]);
    if (!hash) {
      hash = {};
      result[0].splice(1, 0, hash);
    }

    // attach the attributes to the block
    for (var a in attr) {
      hash[a] = attr[a];
    }return result;
  };

  Maruku.block.definition_list = function definition_list(block, next) {
    // one or more terms followed by one or more definitions, in a single block
    var tight = /^((?:[^\s:].*\n)+):\s+([\s\S]+)$/,
        list = ["dl"],
        i,
        m;

    // see if we're dealing with a tight or loose block
    if (m = block.match(tight)) {
      // pull subsequent tight DL blocks out of `next`
      var blocks = [block];
      while (next.length && tight.exec(next[0])) {
        blocks.push(next.shift());
      }for (var b = 0; b < blocks.length; ++b) {
        var m = blocks[b].match(tight),
            terms = m[1].replace(/\n$/, "").split(/\n/),
            defns = m[2].split(/\n:\s+/);

        // print( uneval( m ) );

        for (i = 0; i < terms.length; ++i) {
          list.push(["dt", terms[i]]);
        }for (i = 0; i < defns.length; ++i) {
          // run inline processing over the definition
          list.push(["dd"].concat(this.processInline(defns[i].replace(/(\n)\s+/, "$1"))));
        }
      }
    } else {
      return undefined;
    }

    return [list];
  };

  // splits on unescaped instances of @ch. If @ch is not a character the result
  // can be unpredictable

  Maruku.block.table = function table(block) {

    var _split_on_unescaped = function _split_on_unescaped(s, ch) {
      ch = ch || '\\s';
      if (ch.match(/^[\\|\[\]{}?*.+^$]$/)) ch = '\\' + ch;
      var res = [],
          r = new RegExp('^((?:\\\\.|[^\\\\' + ch + '])*)' + ch + '(.*)'),
          m;
      while (m = s.match(r)) {
        res.push(m[1]);
        s = m[2];
      }
      res.push(s);
      return res;
    };

    var leading_pipe = /^ {0,3}\|(.+)\n {0,3}\|\s*([\-:]+[\-| :]*)\n((?:\s*\|.*(?:\n|$))*)(?=\n|$)/,

    // find at least an unescaped pipe in each line
    no_leading_pipe = /^ {0,3}(\S(?:\\.|[^\\|])*\|.*)\n {0,3}([\-:]+\s*\|[\-| :]*)\n((?:(?:\\.|[^\\|])*\|.*(?:\n|$))*)(?=\n|$)/,
        i,
        m;
    if (m = block.match(leading_pipe)) {
      // remove leading pipes in contents
      // (header and horizontal rule already have the leading pipe left out)
      m[3] = m[3].replace(/^\s*\|/gm, '');
    } else if (!(m = block.match(no_leading_pipe))) {
      return undefined;
    }

    var table = ["table", ["thead", ["tr"]], ["tbody"]];

    // remove trailing pipes, then split on pipes
    // (no escaped pipes are allowed in horizontal rule)
    m[2] = m[2].replace(/\|\s*$/, '').split('|');

    // process alignment
    var html_attrs = [];
    forEach(m[2], function (s) {
      if (s.match(/^\s*-+:\s*$/)) html_attrs.push({ align: "right" });else if (s.match(/^\s*:-+\s*$/)) html_attrs.push({ align: "left" });else if (s.match(/^\s*:-+:\s*$/)) html_attrs.push({ align: "center" });else html_attrs.push({});
    });

    // now for the header, avoid escaped pipes
    m[1] = _split_on_unescaped(m[1].replace(/\|\s*$/, ''), '|');
    for (i = 0; i < m[1].length; i++) {
      table[1][1].push(['th', html_attrs[i] || {}].concat(this.processInline(m[1][i].trim())));
    }

    // now for body contents
    forEach(m[3].replace(/\|\s*$/mg, '').split('\n'), function (row) {
      var html_row = ['tr'];
      row = _split_on_unescaped(row, '|');
      for (i = 0; i < row.length; i++) {
        html_row.push(['td', html_attrs[i] || {}].concat(this.processInline(row[i].trim())));
      }table[2].push(html_row);
    }, this);

    return [table];
  };

  Maruku.inline["{:"] = function inline_meta(text, matches, out) {
    if (!out.length) return [2, "{:"];

    // get the preceeding element
    var before = out[out.length - 1];

    if (typeof before === "string") return [2, "{:"];

    // match a meta hash
    var m = text.match(/^\{:\s*((?:\\\}|[^\}])*)\s*\}/);

    // no match, false alarm
    if (!m) return [2, "{:"];

    // attach the attributes to the preceeding element
    var meta = this.dialect.processMetaHash(m[1]),
        attr = extract_attr(before);

    if (!attr) {
      attr = {};
      before.splice(1, 0, attr);
    }

    for (var k in meta) {
      attr[k] = meta[k];
    } // cut out the string and replace it with nothing
    return [m[0].length, ""];
  };

  Markdown.dialects.Maruku = Maruku;
  Markdown.dialects.Maruku.inline.__escape__ = /^\\[\\`\*_{}\[\]()#\+.!\-|:]/;
  Markdown.buildBlockOrder(Markdown.dialects.Maruku.block);
  Markdown.buildInlinePatterns(Markdown.dialects.Maruku.inline);

  // Include all our depndencies and;
  expose.Markdown = Markdown;
  expose.parse = Markdown.parse;
  expose.toHTML = Markdown.toHTML;
  expose.toHTMLTree = Markdown.toHTMLTree;
  expose.renderJsonML = Markdown.renderJsonML;
})(function () {
  window.markdown = {};
  return window.markdown;
}());
exports.markdown = markdown;

},{"util":4}],6:[function(require,module,exports){
'use strict';

var _utilities = require('./utilities');

google.charts.load('current', { 'packages': ['corechart'] });

var Stoday = document.querySelector('.statisticToday'),
    SRangeDate = document.querySelector('.statisticRangeDates'),
    statisticsWindow = new _utilities.Modal('statisticsWindow', '.contentWidth'),
    buildSatistic = new BuildStatistic(),
    notification = new _utilities.NotificationC();

var statistics = Array.from(document.querySelectorAll('.statistic')),
    containerOptionsStatistic = document.querySelector('.containerOptionsStatistic');

statistics.forEach(function (statistic) {
	statistic.addEventListener('click', showOptionStatistic);
});

function showOptionStatistic() {
	containerOptionsStatistic.innerHTML = '';

	var tOptionsStatistic = this.querySelector('.optionsStatistic'),
	    cOptionsStatistic = document.importNode(tOptionsStatistic.content, true);

	var btnClose = cOptionsStatistic.querySelector('#closeOptionsStatistic');

	btnClose.onclick = function (e) {
		var parent = e.target.parentNode;
		parent.remove();
	};

	containerOptionsStatistic.appendChild(cOptionsStatistic);
	FStatistics[this.dataset.statistic]();
}

function getDimensionsChart() {
	var width = document.querySelector('.bodyModal').offsetWidth,
	    height = document.querySelector('.bodyModal').offsetWidth;
	if (height > document.querySelector('.bodyModal').offsetHeight) height = document.querySelector('.bodyModal').offsetHeight;
	return { width: width, height: height };
}

function BuildStatistic() {
	this.today = function (histories) {
		var container = document.createElement('section');

		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = histories[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var history = _step.value;

				var clone = Stoday.querySelector('.resultStatistics'),
				    template = document.importNode(clone.content, true),
				    dateActivity = new Date(history.activity.hour),
				    dateHistory = new Date(history.time);

				dateHistory.setDate(dateActivity.getDate());
				dateHistory.setFullYear(dateActivity.getFullYear());
				dateHistory.setMonth(dateActivity.getMonth());

				var timeText = dateHistory > dateActivity ? 'Despues' : 'A tiempo';

				template.querySelector('.nameActivity').innerHTML = history.activity.text;
				template.querySelector('.timeActivity').innerHTML = dateActivity.toHour12();
				template.querySelector('.timeHistory').innerHTML = dateHistory.toHour12();
				template.querySelector('.timeText').innerHTML = timeText;

				container.appendChild(template);
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

		return container;
	};
	this.rangeDate = function () {
		var clone = SRangeDate.querySelector('.resultStatistics'),
		    template = document.importNode(clone.content, true);
		return template;
	};
	this.evolution = function () {
		var clone = SRangeDate.querySelector('.resultStatistics'),
		    template = document.importNode(clone.content, true);
		return template;
	};
}

var FStatistics = {
	today: function today() {
		var formSToday = document.querySelector('#today');
		formSToday.onsubmit = function (event) {
			event.preventDefault();
			(0, _utilities.ajax)({
				type: 'POST',
				URL: '/statistics/today',
				async: true,
				contentType: 'application/json',
				onSuccess: function onSuccess(response) {
					if (!response.histories.length) return notification.show({ msg: '**No** se han **completado** actividades **hoy**', type: 2 });

					var node = buildSatistic.today(response.histories);

					statisticsWindow.setTitle('Resumen de Actividad Actual').addContent(node).show();
				},
				data: JSON.stringify({ children: formSToday.children.value })
			});
		};
	},
	rangeDate: function rangeDate() {
		var formSRangeDate = document.querySelector('#rangeDate'),
		    validator = new _utilities.Validator(formSRangeDate);

		validator.config([{ fn: 'mayor', params: 'dateEnd dateInit', messageError: 'La **Fecha Inicial** debe ser **mayor** a la **Fecha Final**' }]);

		formSRangeDate.onsubmit = function (event) {
			event.preventDefault();
			var formValidation = validator.isValid();
			if (formValidation.isValid) {
				(0, _utilities.ajax)({
					type: 'POST',
					URL: '/statistics/rangeDate',
					async: true,
					contentType: 'application/json',
					onSuccess: function onSuccess(response) {
						if (!response.length) return notification.show({ msg: '**No** hay **datos** para generar la **estadistica**.', type: 2 });

						var node = buildSatistic.rangeDate(),
						    rows = [];

						var _iteratorNormalCompletion2 = true;
						var _didIteratorError2 = false;
						var _iteratorError2 = undefined;

						try {
							for (var _iterator2 = response[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
								var record = _step2.value;

								var dataRecord = [];
								dataRecord.push(record._id.day + '/' + record._id.month + '/' + record._id.year);
								dataRecord.push(record.complete);
								dataRecord.push(record.incomplete);
								rows.push(dataRecord);
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

						statisticsWindow.setTitle('Actividades por Rango de Fechas').addContent(node).show();

						google.charts.setOnLoadCallback(drawRangeDates);

						function drawRangeDates() {
							var data = new google.visualization.DataTable();

							data.addColumn('string', 'Date');
							data.addColumn('number', 'Completadas');
							data.addColumn('number', 'Incompletas');
							data.addRows(rows);
							statisticsWindow.modal.addEventListener('fullOpen', function (e) {
								var dimensions = getDimensionsChart();

								var options = {
									title: 'Actividades Completas/Incompletas',
									legend: 'bottom',
									width: dimensions.width,
									height: dimensions.height,
									vAxis: { title: '# de Actividades' },
									hAxis: { title: 'Fecha' },
									seriesType: 'bars'
								};

								var chart = new google.visualization.ComboChart(document.getElementById('chartRangeDate'));
								chart.draw(data, options);
							});
						}
					},
					data: JSON.stringify({ dateInit: formSRangeDate.dateInit.value, dateEnd: formSRangeDate.dateEnd.value, children: formSRangeDate.children.value })
				});
			} else {
				validator.showErrors('.errors');
			}
		};
	},
	evolution: function evolution() {
		var formSEvolution = document.querySelector('#evolution'),
		    validator = new _utilities.Validator(formSEvolution);

		validator.config([{ fn: 'mayor', params: 'dateEnd dateInit', messageError: 'La **Fecha Inicial** debe ser **mayor** a la **Fecha Final**' }]);

		formSEvolution.onsubmit = function (event) {
			event.preventDefault();
			var formValidation = validator.isValid();
			if (formValidation.isValid) {
				(0, _utilities.ajax)({
					type: 'POST',
					URL: '/statistics/line-evolution',
					async: true,
					contentType: 'application/json',
					onSuccess: function onSuccess(response) {
						if (!response.length) return notification.show({ msg: '**No** hay **datos** para generar la **estadistica**.', type: 2 });

						var node = buildSatistic.rangeDate(),
						    rows = [];

						var _iteratorNormalCompletion3 = true;
						var _didIteratorError3 = false;
						var _iteratorError3 = undefined;

						try {
							for (var _iterator3 = response[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
								var record = _step3.value;

								var dataRecord = [];
								dataRecord.push(record._id.day + '/' + record._id.month + '/' + record._id.year);
								dataRecord.push(record.complete);
								dataRecord.push(record.incomplete);
								rows.push(dataRecord);
							}
						} catch (err) {
							_didIteratorError3 = true;
							_iteratorError3 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion3 && _iterator3.return) {
									_iterator3.return();
								}
							} finally {
								if (_didIteratorError3) {
									throw _iteratorError3;
								}
							}
						}

						statisticsWindow.setTitle('Evolución').addContent(node).show();

						google.charts.setOnLoadCallback(drawEvolution);

						function drawEvolution() {
							var data = new google.visualization.DataTable();

							data.addColumn('string', 'Date');
							data.addColumn('number', 'Completadas');
							data.addColumn('number', 'Incompletas');
							data.addRows(rows);

							statisticsWindow.modal.addEventListener('fullOpen', function (e) {
								var dimensions = getDimensionsChart();
								var options = {
									title: 'Evolución',
									pointSize: 10,
									width: dimensions.width,
									height: dimensions.height,
									hAxis: { titleTextStyle: { color: '#333' }, direction: -1, slantedText: false, slantedTextAngle: 90 },
									colors: ['#34A853', '#EA4235'],
									vAxis: { minValue: 0, title: '# de Actividades' },
									legend: 'bottom'
								};

								var chart = new google.visualization.AreaChart(document.getElementById('chartRangeDate'));
								chart.draw(data, options);
							}, false);
						}
					},
					data: JSON.stringify({ dateInit: formSEvolution.dateInit.value, dateEnd: formSEvolution.dateEnd.value, children: formSEvolution.children.value })
				});
			} else {
				validator.showErrors('.errors');
			}
		};
	}
};

},{"./utilities":7}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ajax = exports.NotificationC = exports.Modal = exports.getValueInput = exports.Validator = exports.Loader = exports.CommonElement = undefined;

var _markdown = require('./lib/markdown');

Date.prototype.toHour12 = function () {
	/*
 	Formatea un Object Date en Time (12 horas)
 */
	return this.toLocaleTimeString('es-CO', { hour12: true }).replace('p. m.', 'PM').replace('a. m.', 'AM');
};

Date.prototype.getTimeHumanize = function () {
	var time = this.getHours() + ':' + this.getMinutes() + ':' + this.getSeconds();
	return time;
};

Date.prototype.getValueInput = function (format) {
	var d = String(this.getDate()).length == 2 ? this.getDate() : '0' + this.getDate(),
	    m = String(this.getMonth()).length == 2 ? this.getMonth() + 1 : '0' + (this.getMonth() + 1),
	    y = this.getFullYear(),
	    dateFormat = format.replace('d', d).replace('m', m).replace('y', y);
	return dateFormat;
};

HTMLFormElement.prototype.isValid = function () {
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = Array.from(this.elements)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var element = _step.value;

			if (element.validity.valid == false) return false;
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

	return true;
};

HTMLInputElement.prototype.checkSizeImage = function (data, cb) {

	if (!this.files.length) return cb(new Error('No Se ha seleccionado ningun archivo'));

	var fr = new FileReader(),
	    maxWidth = data.maxWidth,
	    maxHeight = data.maxHeight,
	    response = {
		valid: true,
		type: 0,
		message: ''
	};

	fr.onload = function () {
		var img = new Image();

		img.onload = function () {
			if (img.width > maxWidth) {
				response.valid = false;
				response.type = 2;
				response.message += 'El **ancho** de la imagen **no es aceptado**, el **ancho maximo** permitido es **' + maxWidth + '**\n\n';
			}
			if (img.height > maxHeight) {
				response.valid = false;
				response.type = 2;
				response.message += 'El **largo** de la imagen **no es aceptado**, el **largo maximo** permitido es **' + maxHeight + '**';
			}
			cb(null, response);
		};

		img.src = fr.result;
	};

	fr.readAsDataURL(this.files[0]);
};

HTMLElement.prototype.serialize = function () {
	var elements = this instanceof HTMLFormElement ? this.elements : this.querySelector('input, select'),
	    exceptions = ['submit', 'reset'];

	var data = {};
	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator2 = Array.from(elements)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			var element = _step2.value;

			if (exceptions.indexOf(element.type) < 0) {
				data[element.name] = element.value;
			}
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

	return data;
};

HTMLElement.prototype.remove = function () {
	/*
 	Remueve del DOM un elemento
 */
	this.parentNode.removeChild(this);
};

HTMLElement.prototype.disabeldInputs = function (valueDisabled, selector, exceptions) {
	var elements = this.querySelectorAll(selector);
	var _iteratorNormalCompletion3 = true;
	var _didIteratorError3 = false;
	var _iteratorError3 = undefined;

	try {
		for (var _iterator3 = Array.from(elements)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
			var element = _step3.value;

			if (exceptions.indexOf(element.name) < 0) element.disabled = valueDisabled;
		}
	} catch (err) {
		_didIteratorError3 = true;
		_iteratorError3 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion3 && _iterator3.return) {
				_iterator3.return();
			}
		} finally {
			if (_didIteratorError3) {
				throw _iteratorError3;
			}
		}
	}

	return this;
};
HTMLElement.prototype.readOnlyInputs = function (valueReadOnly, selector, exceptions) {
	var elements = this.querySelectorAll(selector);
	var _iteratorNormalCompletion4 = true;
	var _didIteratorError4 = false;
	var _iteratorError4 = undefined;

	try {
		for (var _iterator4 = Array.from(elements)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
			var element = _step4.value;

			if (exceptions.indexOf(element.name) < 0) element.readOnly = valueReadOnly;
		}
	} catch (err) {
		_didIteratorError4 = true;
		_iteratorError4 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion4 && _iterator4.return) {
				_iterator4.return();
			}
		} finally {
			if (_didIteratorError4) {
				throw _iteratorError4;
			}
		}
	}

	return this;
};

HTMLElement.prototype.emptyInputs = function (selector, exceptions) {
	/*
 	Vacia el attributo 'value' de los elementos de un HTMLFormElement
 	El array exceptions, contiene los inputs que no se deben vaciar
 */
	var elements = this.querySelectorAll(selector);
	var _iteratorNormalCompletion5 = true;
	var _didIteratorError5 = false;
	var _iteratorError5 = undefined;

	try {
		for (var _iterator5 = Array.from(elements)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
			var element = _step5.value;

			if (exceptions.indexOf(element.name) < 0) element.value = '';
		}
	} catch (err) {
		_didIteratorError5 = true;
		_iteratorError5 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion5 && _iterator5.return) {
				_iterator5.return();
			}
		} finally {
			if (_didIteratorError5) {
				throw _iteratorError5;
			}
		}
	}

	return this;
};

function CommonElement() {
	var _this = this;

	this.init = function () {
		_this.template = document.querySelector('#commonElements');
		_this.cloneTemplate = document.importNode(_this.template.content, true);
	};
	this.get = function (name, data) {
		this.init();
		var element = this.cloneTemplate.querySelector(name),
		    cloneElement = element.cloneNode(true);
		cloneElement.innerHTML = data.html;

		if (data.css) {
			data.css.forEach(function (classCss) {
				cloneElement.classList.add(classCss);
			});
		}
		if (data.general) {
			for (var key in data.general) {
				cloneElement.setAttribute(key, data.general[key]);
			}
		}
		return cloneElement;
	};
}

function Loader(selectorReference) {
	var container = document.createElement('section'),
	    loader = document.createElement('div'),
	    reference = document.querySelector(selectorReference);

	container.appendChild(loader);

	loader.classList.add('loader');
	container.classList.add('containerLoader');

	this.show = function () {
		container.style.width = window.innerWidth + 'px';
		container.style.height = window.innerHeight + 'px';
		reference.setAttribute('data-reference-loader', '');
		reference.appendChild(container);
	};
	this.hide = function () {
		reference.removeAttribute('data-reference-loader');
		reference.removeChild(container);
	};
}
function Validator(form) {

	this.stagesFaild = [];

	this.config = function (stages) {
		this.stages = stages;
		this.stages.forEach(function (stage) {
			stage.isValid = false;
		});
	};

	this.showErrors = function () {
		var section = document.createElement('section');
		section.classList.add('errors');
		this.stagesFaild.forEach(function (e) {
			section.innerHTML += _markdown.markdown.toHTML(e.messageError);
		});
		form.appendChild(section);
		section.scrollIntoView();

		window.setTimeout(function () {
			form.removeChild(section);
		}, 10000);

		return section;
	};

	this.validateStage = function () {
		var _this2 = this;

		this.stages.forEach(function (stage) {
			var fn = _this2[stage.fn];
			stage.isValid = fn(stage.params.split(' '));
		});
	};

	this.isValid = function () {

		this.validateStage();

		this.stagesFaild = this.stages.filter(function (stage) {
			return stage.isValid == false;
		});

		if (this.stagesFaild.length) return { isValid: false, stagesFaild: this.stagesFaild };
		return { isValid: true };
	};

	this.equals = function (elements) {
		var valueOne = form[elements[0]],
		    valueTwo = form[elements[1]];
		if (valueOne.value == valueTwo.value) {
			return true;
		}
		return false;
	};

	this.notEquals = function (elements) {
		var valueOne = form[elements[0]],
		    valueTwo = form[elements[1]];
		if (valueOne.value != valueTwo.value) {
			return true;
		}
		return false;
	};

	this.mayor = function (elements) {
		var valueOne = form[elements[0]],
		    valueTwo = form[elements[1]];
		if (valueOne.value > valueTwo.value) {
			return true;
		}
		return false;
	};
}

function getValueInput(date, format) {
	var d = String(date.getDate()).length == 2 ? date.getDate() : '0' + date.getDate(),
	    m = String(date.getMonth()).length == 2 ? date.getMonth() : '0' + date.getMonth(),
	    y = date.getFullYear(),
	    dateFormat = format.replace('d', d).replace('m', m).replace('y', y);
	return dateFormat;
}

function Modal(modalReference, selectorParentElement) {

	var fullOpen = new Event('fullOpen');

	this.modal = document.getElementById(modalReference);

	var body = document.body,
	    bodyModal = this.modal.querySelector('.bodyModal'),
	    close = this.modal.querySelector('[data-closemodal]'),
	    bodyTitle = this.modal.querySelector('.titleModal'),
	    parentElement = document.querySelector(selectorParentElement);

	this.show = function () {
		var _this3 = this;

		this.modal.classList.add('effectShowModal');
		this.modal.setAttribute('modalActive', 'true');
		parentElement.classList.add('sectionInactive');
		body.classList.add('overflowHidden');
		setTimeout(function () {
			_this3.modal.dispatchEvent(fullOpen);
		}, 1000);
	};

	this.hide = function () {
		var _this4 = this;

		this.modal.classList.remove('effectShowModal');
		this.modal.classList.add('effectHideModal');
		bodyModal.innerHTML = '';

		window.setTimeout(function () {
			_this4.modal.classList.remove('effectHideModal');
			_this4.modal.removeAttribute('modalActive');
			parentElement.classList.remove('sectionInactive');
			body.classList.remove('overflowHidden');
		}, 1000);
	};

	this.addContent = function (element) {
		bodyModal.innerHTML = '';
		bodyModal.appendChild(element);
		return this;
	};

	this.setTitle = function (title) {
		bodyTitle.innerHTML = '';
		var titleContent = document.createElement('h2');
		titleContent.innerHTML = title;
		bodyTitle.appendChild(titleContent);
		return this;
	};

	close.addEventListener('click', this.hide.bind(this));
}

function NotificationC() {
	var contenedorPrincipal = document.body;

	var createMessage = function createMessage(data) {
		var contenedorMSG = document.createElement('article');
		contenedorMSG.classList.add('contenedorMensaje');
		var mensaje = document.createElement('p');
		mensaje.innerHTML = _markdown.markdown.toHTML(data.msg);
		contenedorMSG.classList.add('MSG');
		var icon = document.createElement('img');

		contenedorMSG.appendChild(icon);
		contenedorMSG.appendChild(mensaje);

		if (data.type == 0) icon.src = '/images/notifications/correcto.png';else if (data.type == 1) icon.src = '/images/notifications/incorrecto.png';else if (data.type == 2) icon.src = '/images/notifications/informacion.png';

		icon.classList.add('contenedorIcon');
		mensaje.classList.add('contenedorMensaje');

		return contenedorMSG;
	};

	this.show = function (data) {
		var contenedorMSG = createMessage(data),
		    top = window.window.scrollY,
		    time = data.time || 3000;

		contenedorMSG.setAttribute('style', 'top:' + top + 'px');
		contenedorPrincipal.appendChild(contenedorMSG);
		setTimeout(this.hide.bind(this), time);
	};
	this.hide = function () {
		contenedorPrincipal.removeChild(contenedorPrincipal.lastChild);
	};
}

function ajax(config) {
	var xhr = new XMLHttpRequest(),
	    responseJSON = config | true;

	xhr.open(config.type, config.URL, config.async);
	xhr.setRequestHeader('Content-Type', config.contentType);

	xhr.send(config.data);

	if (config.async) {
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				var response = responseJSON ? JSON.parse(this.responseText) : this.responseText;
				config.onSuccess(response);
			}
		};
	} else {
		var response = responseJSON ? JSON.parse(xhr.responseText) : xhr.responseText;
		config.onSuccess(response);
	}
}

exports.CommonElement = CommonElement;
exports.Loader = Loader;
exports.Validator = Validator;
exports.getValueInput = getValueInput;
exports.Modal = Modal;
exports.NotificationC = NotificationC;
exports.ajax = ajax;

},{"./lib/markdown":5}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCJzcmMvanMvbGliL21hcmtkb3duLmpzIiwic3JjL2pzL3N0YXRpc3RpYy5qcyIsInNyYy9qcy91dGlsaXRpZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUNyQixLQUFJLE1BQU0sSUFBSSxjQUFKLEVBQVY7S0FDQyxlQUFlLFNBQVMsSUFEekI7O0FBR0EsS0FBSSxJQUFKLENBQVMsT0FBTyxJQUFoQixFQUFzQixPQUFPLEdBQTdCLEVBQWtDLE9BQU8sS0FBekM7QUFDQSxLQUFJLGdCQUFKLENBQXFCLGNBQXJCLEVBQXFDLE9BQU8sV0FBNUM7O0FBRUEsS0FBSSxJQUFKLENBQVMsT0FBTyxJQUFoQjs7QUFFQSxLQUFHLE9BQU8sS0FBVixFQUFnQjtBQUNmLE1BQUksa0JBQUosR0FBeUIsWUFBWTtBQUNwQyxPQUFJLEtBQUssVUFBTCxJQUFtQixDQUFuQixJQUF3QixLQUFLLE1BQUwsSUFBZSxHQUEzQyxFQUFnRDtBQUMvQyxRQUFJLFdBQVcsZUFBZSxLQUFLLEtBQUwsQ0FBVyxLQUFLLFlBQWhCLENBQWYsR0FBK0MsS0FBSyxZQUFuRTtBQUNBLFdBQU8sU0FBUCxDQUFpQixRQUFqQjtBQUNBO0FBQ0QsR0FMRDtBQU1BLEVBUEQsTUFPSztBQUNKLE1BQUksV0FBVyxlQUFlLEtBQUssS0FBTCxDQUFXLElBQUksWUFBZixDQUFmLEdBQThDLElBQUksWUFBakU7QUFDQSxTQUFPLFNBQVAsQ0FBaUIsUUFBakI7QUFDQTtBQUNEOztRQUVPLGEsR0FBQSxhO1FBQWMsTSxHQUFBLE07UUFBTyxTLEdBQUEsUztRQUFVLGEsR0FBQSxhO1FBQWMsSyxHQUFBLEs7UUFBTSxhLEdBQUEsYTtRQUFjLEksR0FBQSxJIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59IiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8vIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4vLyBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuLy8gSWYgLS1uby1kZXByZWNhdGlvbiBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbmV4cG9ydHMuZGVwcmVjYXRlID0gZnVuY3Rpb24oZm4sIG1zZykge1xuICAvLyBBbGxvdyBmb3IgZGVwcmVjYXRpbmcgdGhpbmdzIGluIHRoZSBwcm9jZXNzIG9mIHN0YXJ0aW5nIHVwLlxuICBpZiAoaXNVbmRlZmluZWQoZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMuZGVwcmVjYXRlKGZuLCBtc2cpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLm5vRGVwcmVjYXRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZpcm9uO1xuZXhwb3J0cy5kZWJ1Z2xvZyA9IGZ1bmN0aW9uKHNldCkge1xuICBpZiAoaXNVbmRlZmluZWQoZGVidWdFbnZpcm9uKSlcbiAgICBkZWJ1Z0Vudmlyb24gPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnO1xuICBzZXQgPSBzZXQudG9VcHBlckNhc2UoKTtcbiAgaWYgKCFkZWJ1Z3Nbc2V0XSkge1xuICAgIGlmIChuZXcgUmVnRXhwKCdcXFxcYicgKyBzZXQgKyAnXFxcXGInLCAnaScpLnRlc3QoZGVidWdFbnZpcm9uKSkge1xuICAgICAgdmFyIHBpZCA9IHByb2Nlc3MucGlkO1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1zZyA9IGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyVzICVkOiAlcycsIHNldCwgcGlkLCBtc2cpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHt9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVidWdzW3NldF07XG59O1xuXG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMsIGN0eCk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIElFIGRvZXNuJ3QgbWFrZSBlcnJvciBmaWVsZHMgbm9uLWVudW1lcmFibGVcbiAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2R3dzUyc2J0KHY9dnMuOTQpLmFzcHhcbiAgaWYgKGlzRXJyb3IodmFsdWUpXG4gICAgICAmJiAoa2V5cy5pbmRleE9mKCdtZXNzYWdlJykgPj0gMCB8fCBrZXlzLmluZGV4T2YoJ2Rlc2NyaXB0aW9uJykgPj0gMCkpIHtcbiAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuIiwiLy8gUmVsZWFzZWQgdW5kZXIgTUlUIGxpY2Vuc2Vcbi8vIENvcHlyaWdodCAoYykgMjAwOS0yMDEwIERvbWluaWMgQmFnZ290dFxuLy8gQ29weXJpZ2h0IChjKSAyMDA5LTIwMTAgQXNoIEJlcmxpblxuLy8gQ29weXJpZ2h0IChjKSAyMDExIENocmlzdG9waCBEb3JuIDxjaHJpc3RvcGhAY2hyaXN0b3BoZG9ybi5jb20+IChodHRwOi8vd3d3LmNocmlzdG9waGRvcm4uY29tKVxuLy8gRGF0ZTogMjAxMy0wOS0xNVQxNjoxMlpcblxuKGZ1bmN0aW9uKGV4cG9zZSkge1xuXG5cblxuXG4gIHZhciBNYXJrZG93bkhlbHBlcnMgPSB7fTtcblxuICAvLyBGb3IgU3BpZGVybW9ua2V5IGJhc2VkIGVuZ2luZXNcbiAgZnVuY3Rpb24gbWtfYmxvY2tfdG9Tb3VyY2UoKSB7XG4gICAgcmV0dXJuIFwiTWFya2Rvd24ubWtfYmxvY2soIFwiICtcbiAgICAgICAgICAgIHVuZXZhbCh0aGlzLnRvU3RyaW5nKCkpICtcbiAgICAgICAgICAgIFwiLCBcIiArXG4gICAgICAgICAgICB1bmV2YWwodGhpcy50cmFpbGluZykgK1xuICAgICAgICAgICAgXCIsIFwiICtcbiAgICAgICAgICAgIHVuZXZhbCh0aGlzLmxpbmVOdW1iZXIpICtcbiAgICAgICAgICAgIFwiIClcIjtcbiAgfVxuXG4gIC8vIG5vZGVcbiAgZnVuY3Rpb24gbWtfYmxvY2tfaW5zcGVjdCgpIHtcbiAgICB2YXIgdXRpbCA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xuICAgIHJldHVybiBcIk1hcmtkb3duLm1rX2Jsb2NrKCBcIiArXG4gICAgICAgICAgICB1dGlsLmluc3BlY3QodGhpcy50b1N0cmluZygpKSArXG4gICAgICAgICAgICBcIiwgXCIgK1xuICAgICAgICAgICAgdXRpbC5pbnNwZWN0KHRoaXMudHJhaWxpbmcpICtcbiAgICAgICAgICAgIFwiLCBcIiArXG4gICAgICAgICAgICB1dGlsLmluc3BlY3QodGhpcy5saW5lTnVtYmVyKSArXG4gICAgICAgICAgICBcIiApXCI7XG5cbiAgfVxuXG4gIE1hcmtkb3duSGVscGVycy5ta19ibG9jayA9IGZ1bmN0aW9uKGJsb2NrLCB0cmFpbCwgbGluZSkge1xuICAgIC8vIEJlIGhlbHBmdWwgZm9yIGRlZmF1bHQgY2FzZSBpbiB0ZXN0cy5cbiAgICBpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT09IDEgKVxuICAgICAgdHJhaWwgPSBcIlxcblxcblwiO1xuXG4gICAgLy8gV2UgYWN0dWFsbHkgbmVlZCBhIFN0cmluZyBvYmplY3QsIG5vdCBhIHN0cmluZyBwcmltaXRpdmVcbiAgICAvKiBqc2hpbnQgLVcwNTMgKi9cbiAgICB2YXIgcyA9IG5ldyBTdHJpbmcoYmxvY2spO1xuICAgIHMudHJhaWxpbmcgPSB0cmFpbDtcbiAgICAvLyBUbyBtYWtlIGl0IGNsZWFyIGl0cyBub3QganVzdCBhIHN0cmluZ1xuICAgIHMuaW5zcGVjdCA9IG1rX2Jsb2NrX2luc3BlY3Q7XG4gICAgcy50b1NvdXJjZSA9IG1rX2Jsb2NrX3RvU291cmNlO1xuXG4gICAgaWYgKCBsaW5lICE9PSB1bmRlZmluZWQgKVxuICAgICAgcy5saW5lTnVtYmVyID0gbGluZTtcblxuICAgIHJldHVybiBzO1xuICB9O1xuXG5cbiAgdmFyIGlzQXJyYXkgPSBNYXJrZG93bkhlbHBlcnMuaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSBcIltvYmplY3QgQXJyYXldXCI7XG4gIH07XG5cbiAgLy8gRG9uJ3QgbWVzcyB3aXRoIEFycmF5LnByb3RvdHlwZS4gSXRzIG5vdCBmcmllbmRseVxuICBpZiAoIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoICkge1xuICAgIE1hcmtkb3duSGVscGVycy5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaCggYXJyLCBjYiwgdGhpc3AgKSB7XG4gICAgICByZXR1cm4gYXJyLmZvckVhY2goIGNiLCB0aGlzcCApO1xuICAgIH07XG4gIH1cbiAgZWxzZSB7XG4gICAgTWFya2Rvd25IZWxwZXJzLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKGFyciwgY2IsIHRoaXNwKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKylcbiAgICAgICAgY2IuY2FsbCh0aGlzcCB8fCBhcnIsIGFycltpXSwgaSwgYXJyKTtcbiAgICB9O1xuICB9XG5cbiAgTWFya2Rvd25IZWxwZXJzLmlzRW1wdHkgPSBmdW5jdGlvbiBpc0VtcHR5KCBvYmogKSB7XG4gICAgZm9yICggdmFyIGtleSBpbiBvYmogKSB7XG4gICAgICBpZiAoIGhhc093blByb3BlcnR5LmNhbGwoIG9iaiwga2V5ICkgKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIE1hcmtkb3duSGVscGVycy5leHRyYWN0X2F0dHIgPSBmdW5jdGlvbiBleHRyYWN0X2F0dHIoIGpzb25tbCApIHtcbiAgICByZXR1cm4gaXNBcnJheShqc29ubWwpXG4gICAgICAgICYmIGpzb25tbC5sZW5ndGggPiAxXG4gICAgICAgICYmIHR5cGVvZiBqc29ubWxbIDEgXSA9PT0gXCJvYmplY3RcIlxuICAgICAgICAmJiAhKCBpc0FycmF5KGpzb25tbFsgMSBdKSApXG4gICAgICAgID8ganNvbm1sWyAxIF1cbiAgICAgICAgOiB1bmRlZmluZWQ7XG4gIH07XG5cblxuXG5cbiAvKipcbiAgICogIGNsYXNzIE1hcmtkb3duXG4gICAqXG4gICAqICBNYXJrZG93biBwcm9jZXNzaW5nIGluIEphdmFzY3JpcHQgZG9uZSByaWdodC4gV2UgaGF2ZSB2ZXJ5IHBhcnRpY3VsYXIgdmlld3NcbiAgICogIG9uIHdoYXQgY29uc3RpdHV0ZXMgJ3JpZ2h0JyB3aGljaCBpbmNsdWRlOlxuICAgKlxuICAgKiAgLSBwcm9kdWNlcyB3ZWxsLWZvcm1lZCBIVE1MICh0aGlzIG1lYW5zIHRoYXQgZW0gYW5kIHN0cm9uZyBuZXN0aW5nIGlzXG4gICAqICAgIGltcG9ydGFudClcbiAgICpcbiAgICogIC0gaGFzIGFuIGludGVybWVkaWF0ZSByZXByZXNlbnRhdGlvbiB0byBhbGxvdyBwcm9jZXNzaW5nIG9mIHBhcnNlZCBkYXRhIChXZVxuICAgKiAgICBpbiBmYWN0IGhhdmUgdHdvLCBib3RoIGFzIFtKc29uTUxdOiBhIG1hcmtkb3duIHRyZWUgYW5kIGFuIEhUTUwgdHJlZSkuXG4gICAqXG4gICAqICAtIGlzIGVhc2lseSBleHRlbnNpYmxlIHRvIGFkZCBuZXcgZGlhbGVjdHMgd2l0aG91dCBoYXZpbmcgdG8gcmV3cml0ZSB0aGVcbiAgICogICAgZW50aXJlIHBhcnNpbmcgbWVjaGFuaWNzXG4gICAqXG4gICAqICAtIGhhcyBhIGdvb2QgdGVzdCBzdWl0ZVxuICAgKlxuICAgKiAgVGhpcyBpbXBsZW1lbnRhdGlvbiBmdWxmaWxscyBhbGwgb2YgdGhlc2UgKGV4Y2VwdCB0aGF0IHRoZSB0ZXN0IHN1aXRlIGNvdWxkXG4gICAqICBkbyB3aXRoIGV4cGFuZGluZyB0byBhdXRvbWF0aWNhbGx5IHJ1biBhbGwgdGhlIGZpeHR1cmVzIGZyb20gb3RoZXIgTWFya2Rvd25cbiAgICogIGltcGxlbWVudGF0aW9ucy4pXG4gICAqXG4gICAqICAjIyMjIyBJbnRlcm1lZGlhdGUgUmVwcmVzZW50YXRpb25cbiAgICpcbiAgICogICpUT0RPKiBUYWxrIGFib3V0IHRoaXMgOikgSXRzIEpzb25NTCwgYnV0IGRvY3VtZW50IHRoZSBub2RlIG5hbWVzIHdlIHVzZS5cbiAgICpcbiAgICogIFtKc29uTUxdOiBodHRwOi8vanNvbm1sLm9yZy8gXCJKU09OIE1hcmt1cCBMYW5ndWFnZVwiXG4gICAqKi9cbiAgdmFyIE1hcmtkb3duID0gZnVuY3Rpb24oZGlhbGVjdCkge1xuICAgIHN3aXRjaCAodHlwZW9mIGRpYWxlY3QpIHtcbiAgICBjYXNlIFwidW5kZWZpbmVkXCI6XG4gICAgICB0aGlzLmRpYWxlY3QgPSBNYXJrZG93bi5kaWFsZWN0cy5HcnViZXI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwib2JqZWN0XCI6XG4gICAgICB0aGlzLmRpYWxlY3QgPSBkaWFsZWN0O1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGlmICggZGlhbGVjdCBpbiBNYXJrZG93bi5kaWFsZWN0cyApXG4gICAgICAgIHRoaXMuZGlhbGVjdCA9IE1hcmtkb3duLmRpYWxlY3RzW2RpYWxlY3RdO1xuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIE1hcmtkb3duIGRpYWxlY3QgJ1wiICsgU3RyaW5nKGRpYWxlY3QpICsgXCInXCIpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHRoaXMuZW1fc3RhdGUgPSBbXTtcbiAgICB0aGlzLnN0cm9uZ19zdGF0ZSA9IFtdO1xuICAgIHRoaXMuZGVidWdfaW5kZW50ID0gXCJcIjtcbiAgfTtcblxuICAvKipcbiAgICogTWFya2Rvd24uZGlhbGVjdHNcbiAgICpcbiAgICogTmFtZXNwYWNlIG9mIGJ1aWx0LWluIGRpYWxlY3RzLlxuICAgKiovXG4gIE1hcmtkb3duLmRpYWxlY3RzID0ge307XG5cblxuXG5cbiAgLy8gSW1wb3J0ZWQgZnVuY3Rpb25zXG4gIHZhciBta19ibG9jayA9IE1hcmtkb3duLm1rX2Jsb2NrID0gTWFya2Rvd25IZWxwZXJzLm1rX2Jsb2NrLFxuICAgICAgaXNBcnJheSA9IE1hcmtkb3duSGVscGVycy5pc0FycmF5O1xuXG4gIC8qKlxuICAgKiAgcGFyc2UoIG1hcmtkb3duLCBbZGlhbGVjdF0gKSAtPiBKc29uTUxcbiAgICogIC0gbWFya2Rvd24gKFN0cmluZyk6IG1hcmtkb3duIHN0cmluZyB0byBwYXJzZVxuICAgKiAgLSBkaWFsZWN0IChTdHJpbmcgfCBEaWFsZWN0KTogdGhlIGRpYWxlY3QgdG8gdXNlLCBkZWZhdWx0cyB0byBncnViZXJcbiAgICpcbiAgICogIFBhcnNlIGBtYXJrZG93bmAgYW5kIHJldHVybiBhIG1hcmtkb3duIGRvY3VtZW50IGFzIGEgTWFya2Rvd24uSnNvbk1MIHRyZWUuXG4gICAqKi9cbiAgTWFya2Rvd24ucGFyc2UgPSBmdW5jdGlvbiggc291cmNlLCBkaWFsZWN0ICkge1xuICAgIC8vIGRpYWxlY3Qgd2lsbCBkZWZhdWx0IGlmIHVuZGVmaW5lZFxuICAgIHZhciBtZCA9IG5ldyBNYXJrZG93biggZGlhbGVjdCApO1xuICAgIHJldHVybiBtZC50b1RyZWUoIHNvdXJjZSApO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGNvdW50X2xpbmVzKCBzdHIgKSB7XG4gICAgdmFyIG4gPSAwLFxuICAgICAgICBpID0gLTE7XG4gICAgd2hpbGUgKCAoIGkgPSBzdHIuaW5kZXhPZihcIlxcblwiLCBpICsgMSkgKSAhPT0gLTEgKVxuICAgICAgbisrO1xuICAgIHJldHVybiBuO1xuICB9XG5cbiAgLy8gSW50ZXJuYWwgLSBzcGxpdCBzb3VyY2UgaW50byByb3VnaCBibG9ja3NcbiAgTWFya2Rvd24ucHJvdG90eXBlLnNwbGl0X2Jsb2NrcyA9IGZ1bmN0aW9uIHNwbGl0QmxvY2tzKCBpbnB1dCApIHtcbiAgICBpbnB1dCA9IGlucHV0LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccikvZywgXCJcXG5cIik7XG4gICAgLy8gW1xcc1xcU10gbWF0Y2hlcyBfYW55dGhpbmdfIChuZXdsaW5lIG9yIHNwYWNlKVxuICAgIC8vIFteXSBpcyBlcXVpdmFsZW50IGJ1dCBkb2Vzbid0IHdvcmsgaW4gSUVzLlxuICAgIHZhciByZSA9IC8oW1xcc1xcU10rPykoJHxcXG4jfFxcbig/OlxccypcXG58JCkrKS9nLFxuICAgICAgICBibG9ja3MgPSBbXSxcbiAgICAgICAgbTtcblxuICAgIHZhciBsaW5lX25vID0gMTtcblxuICAgIGlmICggKCBtID0gL14oXFxzKlxcbikvLmV4ZWMoaW5wdXQpICkgIT09IG51bGwgKSB7XG4gICAgICAvLyBza2lwIChidXQgY291bnQpIGxlYWRpbmcgYmxhbmsgbGluZXNcbiAgICAgIGxpbmVfbm8gKz0gY291bnRfbGluZXMoIG1bMF0gKTtcbiAgICAgIHJlLmxhc3RJbmRleCA9IG1bMF0ubGVuZ3RoO1xuICAgIH1cblxuICAgIHdoaWxlICggKCBtID0gcmUuZXhlYyhpbnB1dCkgKSAhPT0gbnVsbCApIHtcbiAgICAgIGlmIChtWzJdID09PSBcIlxcbiNcIikge1xuICAgICAgICBtWzJdID0gXCJcXG5cIjtcbiAgICAgICAgcmUubGFzdEluZGV4LS07XG4gICAgICB9XG4gICAgICBibG9ja3MucHVzaCggbWtfYmxvY2soIG1bMV0sIG1bMl0sIGxpbmVfbm8gKSApO1xuICAgICAgbGluZV9ubyArPSBjb3VudF9saW5lcyggbVswXSApO1xuICAgIH1cblxuICAgIHJldHVybiBibG9ja3M7XG4gIH07XG5cbiAgLyoqXG4gICAqICBNYXJrZG93biNwcm9jZXNzQmxvY2soIGJsb2NrLCBuZXh0ICkgLT4gdW5kZWZpbmVkIHwgWyBKc29uTUwsIC4uLiBdXG4gICAqICAtIGJsb2NrIChTdHJpbmcpOiB0aGUgYmxvY2sgdG8gcHJvY2Vzc1xuICAgKiAgLSBuZXh0IChBcnJheSk6IHRoZSBmb2xsb3dpbmcgYmxvY2tzXG4gICAqXG4gICAqIFByb2Nlc3MgYGJsb2NrYCBhbmQgcmV0dXJuIGFuIGFycmF5IG9mIEpzb25NTCBub2RlcyByZXByZXNlbnRpbmcgYGJsb2NrYC5cbiAgICpcbiAgICogSXQgZG9lcyB0aGlzIGJ5IGFza2luZyBlYWNoIGJsb2NrIGxldmVsIGZ1bmN0aW9uIGluIHRoZSBkaWFsZWN0IHRvIHByb2Nlc3NcbiAgICogdGhlIGJsb2NrIHVudGlsIG9uZSBjYW4uIFN1Y2Nlc2Z1bCBoYW5kbGluZyBpcyBpbmRpY2F0ZWQgYnkgcmV0dXJuaW5nIGFuXG4gICAqIGFycmF5ICh3aXRoIHplcm8gb3IgbW9yZSBKc29uTUwgbm9kZXMpLCBmYWlsdXJlIGJ5IGEgZmFsc2UgdmFsdWUuXG4gICAqXG4gICAqIEJsb2NrcyBoYW5kbGVycyBhcmUgcmVzcG9uc2libGUgZm9yIGNhbGxpbmcgW1tNYXJrZG93biNwcm9jZXNzSW5saW5lXV1cbiAgICogdGhlbXNlbHZlcyBhcyBhcHByb3ByaWF0ZS5cbiAgICpcbiAgICogSWYgdGhlIGJsb2NrcyB3ZXJlIHNwbGl0IGluY29ycmVjdGx5IG9yIGFkamFjZW50IGJsb2NrcyBuZWVkIGNvbGxhcHNpbmcgeW91XG4gICAqIGNhbiBhZGp1c3QgYG5leHRgIGluIHBsYWNlIHVzaW5nIHNoaWZ0L3NwbGljZSBldGMuXG4gICAqXG4gICAqIElmIGFueSBvZiB0aGlzIGRlZmF1bHQgYmVoYXZpb3VyIGlzIG5vdCByaWdodCBmb3IgdGhlIGRpYWxlY3QsIHlvdSBjYW5cbiAgICogZGVmaW5lIGEgYF9fY2FsbF9fYCBtZXRob2Qgb24gdGhlIGRpYWxlY3QgdGhhdCB3aWxsIGdldCBpbnZva2VkIHRvIGhhbmRsZVxuICAgKiB0aGUgYmxvY2sgcHJvY2Vzc2luZy5cbiAgICovXG4gIE1hcmtkb3duLnByb3RvdHlwZS5wcm9jZXNzQmxvY2sgPSBmdW5jdGlvbiBwcm9jZXNzQmxvY2soIGJsb2NrLCBuZXh0ICkge1xuICAgIHZhciBjYnMgPSB0aGlzLmRpYWxlY3QuYmxvY2ssXG4gICAgICAgIG9yZCA9IGNicy5fX29yZGVyX187XG5cbiAgICBpZiAoIFwiX19jYWxsX19cIiBpbiBjYnMgKVxuICAgICAgcmV0dXJuIGNicy5fX2NhbGxfXy5jYWxsKHRoaXMsIGJsb2NrLCBuZXh0KTtcblxuICAgIGZvciAoIHZhciBpID0gMDsgaSA8IG9yZC5sZW5ndGg7IGkrKyApIHtcbiAgICAgIC8vRDp0aGlzLmRlYnVnKCBcIlRlc3RpbmdcIiwgb3JkW2ldICk7XG4gICAgICB2YXIgcmVzID0gY2JzWyBvcmRbaV0gXS5jYWxsKCB0aGlzLCBibG9jaywgbmV4dCApO1xuICAgICAgaWYgKCByZXMgKSB7XG4gICAgICAgIC8vRDp0aGlzLmRlYnVnKFwiICBtYXRjaGVkXCIpO1xuICAgICAgICBpZiAoICFpc0FycmF5KHJlcykgfHwgKCByZXMubGVuZ3RoID4gMCAmJiAhKCBpc0FycmF5KHJlc1swXSkgKSApIClcbiAgICAgICAgICB0aGlzLmRlYnVnKG9yZFtpXSwgXCJkaWRuJ3QgcmV0dXJuIGEgcHJvcGVyIGFycmF5XCIpO1xuICAgICAgICAvL0Q6dGhpcy5kZWJ1ZyggXCJcIiApO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFVob2ghIG5vIG1hdGNoISBTaG91bGQgd2UgdGhyb3cgYW4gZXJyb3I/XG4gICAgcmV0dXJuIFtdO1xuICB9O1xuXG4gIE1hcmtkb3duLnByb3RvdHlwZS5wcm9jZXNzSW5saW5lID0gZnVuY3Rpb24gcHJvY2Vzc0lubGluZSggYmxvY2sgKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlhbGVjdC5pbmxpbmUuX19jYWxsX18uY2FsbCggdGhpcywgU3RyaW5nKCBibG9jayApICk7XG4gIH07XG5cbiAgLyoqXG4gICAqICBNYXJrZG93biN0b1RyZWUoIHNvdXJjZSApIC0+IEpzb25NTFxuICAgKiAgLSBzb3VyY2UgKFN0cmluZyk6IG1hcmtkb3duIHNvdXJjZSB0byBwYXJzZVxuICAgKlxuICAgKiAgUGFyc2UgYHNvdXJjZWAgaW50byBhIEpzb25NTCB0cmVlIHJlcHJlc2VudGluZyB0aGUgbWFya2Rvd24gZG9jdW1lbnQuXG4gICAqKi9cbiAgLy8gY3VzdG9tX3RyZWUgbWVhbnMgc2V0IHRoaXMudHJlZSB0byBgY3VzdG9tX3RyZWVgIGFuZCByZXN0b3JlIG9sZCB2YWx1ZSBvbiByZXR1cm5cbiAgTWFya2Rvd24ucHJvdG90eXBlLnRvVHJlZSA9IGZ1bmN0aW9uIHRvVHJlZSggc291cmNlLCBjdXN0b21fcm9vdCApIHtcbiAgICB2YXIgYmxvY2tzID0gc291cmNlIGluc3RhbmNlb2YgQXJyYXkgPyBzb3VyY2UgOiB0aGlzLnNwbGl0X2Jsb2Nrcyggc291cmNlICk7XG5cbiAgICAvLyBNYWtlIHRyZWUgYSBtZW1iZXIgdmFyaWFibGUgc28gaXRzIGVhc2llciB0byBtZXNzIHdpdGggaW4gZXh0ZW5zaW9uc1xuICAgIHZhciBvbGRfdHJlZSA9IHRoaXMudHJlZTtcbiAgICB0cnkge1xuICAgICAgdGhpcy50cmVlID0gY3VzdG9tX3Jvb3QgfHwgdGhpcy50cmVlIHx8IFsgXCJtYXJrZG93blwiIF07XG5cbiAgICAgIGJsb2Nrc19sb29wOlxuICAgICAgd2hpbGUgKCBibG9ja3MubGVuZ3RoICkge1xuICAgICAgICB2YXIgYiA9IHRoaXMucHJvY2Vzc0Jsb2NrKCBibG9ja3Muc2hpZnQoKSwgYmxvY2tzICk7XG5cbiAgICAgICAgLy8gUmVmZXJlbmNlIGJsb2NrcyBhbmQgdGhlIGxpa2Ugd29uJ3QgcmV0dXJuIGFueSBjb250ZW50XG4gICAgICAgIGlmICggIWIubGVuZ3RoIClcbiAgICAgICAgICBjb250aW51ZSBibG9ja3NfbG9vcDtcblxuICAgICAgICB0aGlzLnRyZWUucHVzaC5hcHBseSggdGhpcy50cmVlLCBiICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy50cmVlO1xuICAgIH1cbiAgICBmaW5hbGx5IHtcbiAgICAgIGlmICggY3VzdG9tX3Jvb3QgKVxuICAgICAgICB0aGlzLnRyZWUgPSBvbGRfdHJlZTtcbiAgICB9XG4gIH07XG5cbiAgLy8gTm9vcCBieSBkZWZhdWx0XG4gIE1hcmtkb3duLnByb3RvdHlwZS5kZWJ1ZyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCBhcmd1bWVudHMpO1xuICAgIGFyZ3MudW5zaGlmdCh0aGlzLmRlYnVnX2luZGVudCk7XG4gICAgaWYgKCB0eXBlb2YgcHJpbnQgIT09IFwidW5kZWZpbmVkXCIgKVxuICAgICAgcHJpbnQuYXBwbHkoIHByaW50LCBhcmdzICk7XG4gICAgaWYgKCB0eXBlb2YgY29uc29sZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgY29uc29sZS5sb2cgIT09IFwidW5kZWZpbmVkXCIgKVxuICAgICAgY29uc29sZS5sb2cuYXBwbHkoIG51bGwsIGFyZ3MgKTtcbiAgfTtcblxuICBNYXJrZG93bi5wcm90b3R5cGUubG9vcF9yZV9vdmVyX2Jsb2NrID0gZnVuY3Rpb24oIHJlLCBibG9jaywgY2IgKSB7XG4gICAgLy8gRG9udCB1c2UgL2cgcmVnZXhwcyB3aXRoIHRoaXNcbiAgICB2YXIgbSxcbiAgICAgICAgYiA9IGJsb2NrLnZhbHVlT2YoKTtcblxuICAgIHdoaWxlICggYi5sZW5ndGggJiYgKG0gPSByZS5leGVjKGIpICkgIT09IG51bGwgKSB7XG4gICAgICBiID0gYi5zdWJzdHIoIG1bMF0ubGVuZ3RoICk7XG4gICAgICBjYi5jYWxsKHRoaXMsIG0pO1xuICAgIH1cbiAgICByZXR1cm4gYjtcbiAgfTtcblxuICAvLyBCdWlsZCBkZWZhdWx0IG9yZGVyIGZyb20gaW5zZXJ0aW9uIG9yZGVyLlxuICBNYXJrZG93bi5idWlsZEJsb2NrT3JkZXIgPSBmdW5jdGlvbihkKSB7XG4gICAgdmFyIG9yZCA9IFtdO1xuICAgIGZvciAoIHZhciBpIGluIGQgKSB7XG4gICAgICBpZiAoIGkgPT09IFwiX19vcmRlcl9fXCIgfHwgaSA9PT0gXCJfX2NhbGxfX1wiIClcbiAgICAgICAgY29udGludWU7XG4gICAgICBvcmQucHVzaCggaSApO1xuICAgIH1cbiAgICBkLl9fb3JkZXJfXyA9IG9yZDtcbiAgfTtcblxuICAvLyBCdWlsZCBwYXR0ZXJucyBmb3IgaW5saW5lIG1hdGNoZXJcbiAgTWFya2Rvd24uYnVpbGRJbmxpbmVQYXR0ZXJucyA9IGZ1bmN0aW9uKGQpIHtcbiAgICB2YXIgcGF0dGVybnMgPSBbXTtcblxuICAgIGZvciAoIHZhciBpIGluIGQgKSB7XG4gICAgICAvLyBfX2Zvb19fIGlzIHJlc2VydmVkIGFuZCBub3QgYSBwYXR0ZXJuXG4gICAgICBpZiAoIGkubWF0Y2goIC9eX18uKl9fJC8pIClcbiAgICAgICAgY29udGludWU7XG4gICAgICB2YXIgbCA9IGkucmVwbGFjZSggLyhbXFxcXC4qKz98KClcXFtcXF17fV0pL2csIFwiXFxcXCQxXCIgKVxuICAgICAgICAgICAgICAgLnJlcGxhY2UoIC9cXG4vLCBcIlxcXFxuXCIgKTtcbiAgICAgIHBhdHRlcm5zLnB1c2goIGkubGVuZ3RoID09PSAxID8gbCA6IFwiKD86XCIgKyBsICsgXCIpXCIgKTtcbiAgICB9XG5cbiAgICBwYXR0ZXJucyA9IHBhdHRlcm5zLmpvaW4oXCJ8XCIpO1xuICAgIGQuX19wYXR0ZXJuc19fID0gcGF0dGVybnM7XG4gICAgLy9wcmludChcInBhdHRlcm5zOlwiLCB1bmV2YWwoIHBhdHRlcm5zICkgKTtcblxuICAgIHZhciBmbiA9IGQuX19jYWxsX187XG4gICAgZC5fX2NhbGxfXyA9IGZ1bmN0aW9uKHRleHQsIHBhdHRlcm4pIHtcbiAgICAgIGlmICggcGF0dGVybiAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywgdGV4dCwgcGF0dGVybik7XG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIHRleHQsIHBhdHRlcm5zKTtcbiAgICB9O1xuICB9O1xuXG5cblxuXG4gIHZhciBleHRyYWN0X2F0dHIgPSBNYXJrZG93bkhlbHBlcnMuZXh0cmFjdF9hdHRyO1xuXG4gIC8qKlxuICAgKiAgcmVuZGVySnNvbk1MKCBqc29ubWxbLCBvcHRpb25zXSApIC0+IFN0cmluZ1xuICAgKiAgLSBqc29ubWwgKEFycmF5KTogSnNvbk1MIGFycmF5IHRvIHJlbmRlciB0byBYTUxcbiAgICogIC0gb3B0aW9ucyAoT2JqZWN0KTogb3B0aW9uc1xuICAgKlxuICAgKiAgQ29udmVydHMgdGhlIGdpdmVuIEpzb25NTCBpbnRvIHdlbGwtZm9ybWVkIFhNTC5cbiAgICpcbiAgICogIFRoZSBvcHRpb25zIGN1cnJlbnRseSB1bmRlcnN0b29kIGFyZTpcbiAgICpcbiAgICogIC0gcm9vdCAoQm9vbGVhbik6IHdldGhlciBvciBub3QgdGhlIHJvb3Qgbm9kZSBzaG91bGQgYmUgaW5jbHVkZWQgaW4gdGhlXG4gICAqICAgIG91dHB1dCwgb3IganVzdCBpdHMgY2hpbGRyZW4uIFRoZSBkZWZhdWx0IGBmYWxzZWAgaXMgdG8gbm90IGluY2x1ZGUgdGhlXG4gICAqICAgIHJvb3QgaXRzZWxmLlxuICAgKi9cbiAgTWFya2Rvd24ucmVuZGVySnNvbk1MID0gZnVuY3Rpb24oIGpzb25tbCwgb3B0aW9ucyApIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAvLyBpbmNsdWRlIHRoZSByb290IGVsZW1lbnQgaW4gdGhlIHJlbmRlcmVkIG91dHB1dD9cbiAgICBvcHRpb25zLnJvb3QgPSBvcHRpb25zLnJvb3QgfHwgZmFsc2U7XG5cbiAgICB2YXIgY29udGVudCA9IFtdO1xuXG4gICAgaWYgKCBvcHRpb25zLnJvb3QgKSB7XG4gICAgICBjb250ZW50LnB1c2goIHJlbmRlcl90cmVlKCBqc29ubWwgKSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGpzb25tbC5zaGlmdCgpOyAvLyBnZXQgcmlkIG9mIHRoZSB0YWdcbiAgICAgIGlmICgganNvbm1sLmxlbmd0aCAmJiB0eXBlb2YganNvbm1sWyAwIF0gPT09IFwib2JqZWN0XCIgJiYgISgganNvbm1sWyAwIF0gaW5zdGFuY2VvZiBBcnJheSApIClcbiAgICAgICAganNvbm1sLnNoaWZ0KCk7IC8vIGdldCByaWQgb2YgdGhlIGF0dHJpYnV0ZXNcblxuICAgICAgd2hpbGUgKCBqc29ubWwubGVuZ3RoIClcbiAgICAgICAgY29udGVudC5wdXNoKCByZW5kZXJfdHJlZSgganNvbm1sLnNoaWZ0KCkgKSApO1xuICAgIH1cblxuICAgIHJldHVybiBjb250ZW50LmpvaW4oIFwiXFxuXFxuXCIgKTtcbiAgfTtcblxuXG4gIC8qKlxuICAgKiAgdG9IVE1MVHJlZSggbWFya2Rvd24sIFtkaWFsZWN0XSApIC0+IEpzb25NTFxuICAgKiAgdG9IVE1MVHJlZSggbWRfdHJlZSApIC0+IEpzb25NTFxuICAgKiAgLSBtYXJrZG93biAoU3RyaW5nKTogbWFya2Rvd24gc3RyaW5nIHRvIHBhcnNlXG4gICAqICAtIGRpYWxlY3QgKFN0cmluZyB8IERpYWxlY3QpOiB0aGUgZGlhbGVjdCB0byB1c2UsIGRlZmF1bHRzIHRvIGdydWJlclxuICAgKiAgLSBtZF90cmVlIChNYXJrZG93bi5Kc29uTUwpOiBwYXJzZWQgbWFya2Rvd24gdHJlZVxuICAgKlxuICAgKiAgVHVybiBtYXJrZG93biBpbnRvIEhUTUwsIHJlcHJlc2VudGVkIGFzIGEgSnNvbk1MIHRyZWUuIElmIGEgc3RyaW5nIGlzIGdpdmVuXG4gICAqICB0byB0aGlzIGZ1bmN0aW9uLCBpdCBpcyBmaXJzdCBwYXJzZWQgaW50byBhIG1hcmtkb3duIHRyZWUgYnkgY2FsbGluZ1xuICAgKiAgW1twYXJzZV1dLlxuICAgKiovXG4gIE1hcmtkb3duLnRvSFRNTFRyZWUgPSBmdW5jdGlvbiB0b0hUTUxUcmVlKCBpbnB1dCwgZGlhbGVjdCAsIG9wdGlvbnMgKSB7XG5cbiAgICAvLyBjb252ZXJ0IHN0cmluZyBpbnB1dCB0byBhbiBNRCB0cmVlXG4gICAgaWYgKCB0eXBlb2YgaW5wdXQgPT09IFwic3RyaW5nXCIgKVxuICAgICAgaW5wdXQgPSB0aGlzLnBhcnNlKCBpbnB1dCwgZGlhbGVjdCApO1xuXG4gICAgLy8gTm93IGNvbnZlcnQgdGhlIE1EIHRyZWUgdG8gYW4gSFRNTCB0cmVlXG5cbiAgICAvLyByZW1vdmUgcmVmZXJlbmNlcyBmcm9tIHRoZSB0cmVlXG4gICAgdmFyIGF0dHJzID0gZXh0cmFjdF9hdHRyKCBpbnB1dCApLFxuICAgICAgICByZWZzID0ge307XG5cbiAgICBpZiAoIGF0dHJzICYmIGF0dHJzLnJlZmVyZW5jZXMgKVxuICAgICAgcmVmcyA9IGF0dHJzLnJlZmVyZW5jZXM7XG5cbiAgICB2YXIgaHRtbCA9IGNvbnZlcnRfdHJlZV90b19odG1sKCBpbnB1dCwgcmVmcyAsIG9wdGlvbnMgKTtcbiAgICBtZXJnZV90ZXh0X25vZGVzKCBodG1sICk7XG4gICAgcmV0dXJuIGh0bWw7XG4gIH07XG5cbiAgLyoqXG4gICAqICB0b0hUTUwoIG1hcmtkb3duLCBbZGlhbGVjdF0gICkgLT4gU3RyaW5nXG4gICAqICB0b0hUTUwoIG1kX3RyZWUgKSAtPiBTdHJpbmdcbiAgICogIC0gbWFya2Rvd24gKFN0cmluZyk6IG1hcmtkb3duIHN0cmluZyB0byBwYXJzZVxuICAgKiAgLSBtZF90cmVlIChNYXJrZG93bi5Kc29uTUwpOiBwYXJzZWQgbWFya2Rvd24gdHJlZVxuICAgKlxuICAgKiAgVGFrZSBtYXJrZG93biAoZWl0aGVyIGFzIGEgc3RyaW5nIG9yIGFzIGEgSnNvbk1MIHRyZWUpIGFuZCBydW4gaXQgdGhyb3VnaFxuICAgKiAgW1t0b0hUTUxUcmVlXV0gdGhlbiB0dXJuIGl0IGludG8gYSB3ZWxsLWZvcm1hdGVkIEhUTUwgZnJhZ21lbnQuXG4gICAqKi9cbiAgTWFya2Rvd24udG9IVE1MID0gZnVuY3Rpb24gdG9IVE1MKCBzb3VyY2UgLCBkaWFsZWN0ICwgb3B0aW9ucyApIHtcbiAgICB2YXIgaW5wdXQgPSB0aGlzLnRvSFRNTFRyZWUoIHNvdXJjZSAsIGRpYWxlY3QgLCBvcHRpb25zICk7XG5cbiAgICByZXR1cm4gdGhpcy5yZW5kZXJKc29uTUwoIGlucHV0ICk7XG4gIH07XG5cblxuICBmdW5jdGlvbiBlc2NhcGVIVE1MKCB0ZXh0ICkge1xuICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoIC8mL2csIFwiJmFtcDtcIiApXG4gICAgICAgICAgICAgICAucmVwbGFjZSggLzwvZywgXCImbHQ7XCIgKVxuICAgICAgICAgICAgICAgLnJlcGxhY2UoIC8+L2csIFwiJmd0O1wiIClcbiAgICAgICAgICAgICAgIC5yZXBsYWNlKCAvXCIvZywgXCImcXVvdDtcIiApXG4gICAgICAgICAgICAgICAucmVwbGFjZSggLycvZywgXCImIzM5O1wiICk7XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJfdHJlZSgganNvbm1sICkge1xuICAgIC8vIGJhc2ljIGNhc2VcbiAgICBpZiAoIHR5cGVvZiBqc29ubWwgPT09IFwic3RyaW5nXCIgKVxuICAgICAgcmV0dXJuIGVzY2FwZUhUTUwoIGpzb25tbCApO1xuXG4gICAgdmFyIHRhZyA9IGpzb25tbC5zaGlmdCgpLFxuICAgICAgICBhdHRyaWJ1dGVzID0ge30sXG4gICAgICAgIGNvbnRlbnQgPSBbXTtcblxuICAgIGlmICgganNvbm1sLmxlbmd0aCAmJiB0eXBlb2YganNvbm1sWyAwIF0gPT09IFwib2JqZWN0XCIgJiYgISgganNvbm1sWyAwIF0gaW5zdGFuY2VvZiBBcnJheSApIClcbiAgICAgIGF0dHJpYnV0ZXMgPSBqc29ubWwuc2hpZnQoKTtcblxuICAgIHdoaWxlICgganNvbm1sLmxlbmd0aCApXG4gICAgICBjb250ZW50LnB1c2goIHJlbmRlcl90cmVlKCBqc29ubWwuc2hpZnQoKSApICk7XG5cbiAgICB2YXIgdGFnX2F0dHJzID0gXCJcIjtcbiAgICBmb3IgKCB2YXIgYSBpbiBhdHRyaWJ1dGVzIClcbiAgICAgIHRhZ19hdHRycyArPSBcIiBcIiArIGEgKyAnPVwiJyArIGVzY2FwZUhUTUwoIGF0dHJpYnV0ZXNbIGEgXSApICsgJ1wiJztcblxuICAgIC8vIGJlIGNhcmVmdWwgYWJvdXQgYWRkaW5nIHdoaXRlc3BhY2UgaGVyZSBmb3IgaW5saW5lIGVsZW1lbnRzXG4gICAgaWYgKCB0YWcgPT09IFwiaW1nXCIgfHwgdGFnID09PSBcImJyXCIgfHwgdGFnID09PSBcImhyXCIgKVxuICAgICAgcmV0dXJuIFwiPFwiKyB0YWcgKyB0YWdfYXR0cnMgKyBcIi8+XCI7XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIFwiPFwiKyB0YWcgKyB0YWdfYXR0cnMgKyBcIj5cIiArIGNvbnRlbnQuam9pbiggXCJcIiApICsgXCI8L1wiICsgdGFnICsgXCI+XCI7XG4gIH1cblxuICBmdW5jdGlvbiBjb252ZXJ0X3RyZWVfdG9faHRtbCggdHJlZSwgcmVmZXJlbmNlcywgb3B0aW9ucyApIHtcbiAgICB2YXIgaTtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIC8vIHNoYWxsb3cgY2xvbmVcbiAgICB2YXIganNvbm1sID0gdHJlZS5zbGljZSggMCApO1xuXG4gICAgaWYgKCB0eXBlb2Ygb3B0aW9ucy5wcmVwcm9jZXNzVHJlZU5vZGUgPT09IFwiZnVuY3Rpb25cIiApXG4gICAgICBqc29ubWwgPSBvcHRpb25zLnByZXByb2Nlc3NUcmVlTm9kZShqc29ubWwsIHJlZmVyZW5jZXMpO1xuXG4gICAgLy8gQ2xvbmUgYXR0cmlidXRlcyBpZiB0aGV5IGV4aXN0XG4gICAgdmFyIGF0dHJzID0gZXh0cmFjdF9hdHRyKCBqc29ubWwgKTtcbiAgICBpZiAoIGF0dHJzICkge1xuICAgICAganNvbm1sWyAxIF0gPSB7fTtcbiAgICAgIGZvciAoIGkgaW4gYXR0cnMgKSB7XG4gICAgICAgIGpzb25tbFsgMSBdWyBpIF0gPSBhdHRyc1sgaSBdO1xuICAgICAgfVxuICAgICAgYXR0cnMgPSBqc29ubWxbIDEgXTtcbiAgICB9XG5cbiAgICAvLyBiYXNpYyBjYXNlXG4gICAgaWYgKCB0eXBlb2YganNvbm1sID09PSBcInN0cmluZ1wiIClcbiAgICAgIHJldHVybiBqc29ubWw7XG5cbiAgICAvLyBjb252ZXJ0IHRoaXMgbm9kZVxuICAgIHN3aXRjaCAoIGpzb25tbFsgMCBdICkge1xuICAgIGNhc2UgXCJoZWFkZXJcIjpcbiAgICAgIGpzb25tbFsgMCBdID0gXCJoXCIgKyBqc29ubWxbIDEgXS5sZXZlbDtcbiAgICAgIGRlbGV0ZSBqc29ubWxbIDEgXS5sZXZlbDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJidWxsZXRsaXN0XCI6XG4gICAgICBqc29ubWxbIDAgXSA9IFwidWxcIjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJudW1iZXJsaXN0XCI6XG4gICAgICBqc29ubWxbIDAgXSA9IFwib2xcIjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJsaXN0aXRlbVwiOlxuICAgICAganNvbm1sWyAwIF0gPSBcImxpXCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwicGFyYVwiOlxuICAgICAganNvbm1sWyAwIF0gPSBcInBcIjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJtYXJrZG93blwiOlxuICAgICAganNvbm1sWyAwIF0gPSBcImh0bWxcIjtcbiAgICAgIGlmICggYXR0cnMgKVxuICAgICAgICBkZWxldGUgYXR0cnMucmVmZXJlbmNlcztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJjb2RlX2Jsb2NrXCI6XG4gICAgICBqc29ubWxbIDAgXSA9IFwicHJlXCI7XG4gICAgICBpID0gYXR0cnMgPyAyIDogMTtcbiAgICAgIHZhciBjb2RlID0gWyBcImNvZGVcIiBdO1xuICAgICAgY29kZS5wdXNoLmFwcGx5KCBjb2RlLCBqc29ubWwuc3BsaWNlKCBpLCBqc29ubWwubGVuZ3RoIC0gaSApICk7XG4gICAgICBqc29ubWxbIGkgXSA9IGNvZGU7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiaW5saW5lY29kZVwiOlxuICAgICAganNvbm1sWyAwIF0gPSBcImNvZGVcIjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJpbWdcIjpcbiAgICAgIGpzb25tbFsgMSBdLnNyYyA9IGpzb25tbFsgMSBdLmhyZWY7XG4gICAgICBkZWxldGUganNvbm1sWyAxIF0uaHJlZjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJsaW5lYnJlYWtcIjpcbiAgICAgIGpzb25tbFsgMCBdID0gXCJiclwiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImxpbmtcIjpcbiAgICAgIGpzb25tbFsgMCBdID0gXCJhXCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwibGlua19yZWZcIjpcbiAgICAgIGpzb25tbFsgMCBdID0gXCJhXCI7XG5cbiAgICAgIC8vIGdyYWIgdGhpcyByZWYgYW5kIGNsZWFuIHVwIHRoZSBhdHRyaWJ1dGUgbm9kZVxuICAgICAgdmFyIHJlZiA9IHJlZmVyZW5jZXNbIGF0dHJzLnJlZiBdO1xuXG4gICAgICAvLyBpZiB0aGUgcmVmZXJlbmNlIGV4aXN0cywgbWFrZSB0aGUgbGlua1xuICAgICAgaWYgKCByZWYgKSB7XG4gICAgICAgIGRlbGV0ZSBhdHRycy5yZWY7XG5cbiAgICAgICAgLy8gYWRkIGluIHRoZSBocmVmIGFuZCB0aXRsZSwgaWYgcHJlc2VudFxuICAgICAgICBhdHRycy5ocmVmID0gcmVmLmhyZWY7XG4gICAgICAgIGlmICggcmVmLnRpdGxlIClcbiAgICAgICAgICBhdHRycy50aXRsZSA9IHJlZi50aXRsZTtcblxuICAgICAgICAvLyBnZXQgcmlkIG9mIHRoZSB1bm5lZWRlZCBvcmlnaW5hbCB0ZXh0XG4gICAgICAgIGRlbGV0ZSBhdHRycy5vcmlnaW5hbDtcbiAgICAgIH1cbiAgICAgIC8vIHRoZSByZWZlcmVuY2UgZG9lc24ndCBleGlzdCwgc28gcmV2ZXJ0IHRvIHBsYWluIHRleHRcbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gYXR0cnMub3JpZ2luYWw7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiaW1nX3JlZlwiOlxuICAgICAganNvbm1sWyAwIF0gPSBcImltZ1wiO1xuXG4gICAgICAvLyBncmFiIHRoaXMgcmVmIGFuZCBjbGVhbiB1cCB0aGUgYXR0cmlidXRlIG5vZGVcbiAgICAgIHZhciByZWYgPSByZWZlcmVuY2VzWyBhdHRycy5yZWYgXTtcblxuICAgICAgLy8gaWYgdGhlIHJlZmVyZW5jZSBleGlzdHMsIG1ha2UgdGhlIGxpbmtcbiAgICAgIGlmICggcmVmICkge1xuICAgICAgICBkZWxldGUgYXR0cnMucmVmO1xuXG4gICAgICAgIC8vIGFkZCBpbiB0aGUgaHJlZiBhbmQgdGl0bGUsIGlmIHByZXNlbnRcbiAgICAgICAgYXR0cnMuc3JjID0gcmVmLmhyZWY7XG4gICAgICAgIGlmICggcmVmLnRpdGxlIClcbiAgICAgICAgICBhdHRycy50aXRsZSA9IHJlZi50aXRsZTtcblxuICAgICAgICAvLyBnZXQgcmlkIG9mIHRoZSB1bm5lZWRlZCBvcmlnaW5hbCB0ZXh0XG4gICAgICAgIGRlbGV0ZSBhdHRycy5vcmlnaW5hbDtcbiAgICAgIH1cbiAgICAgIC8vIHRoZSByZWZlcmVuY2UgZG9lc24ndCBleGlzdCwgc28gcmV2ZXJ0IHRvIHBsYWluIHRleHRcbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gYXR0cnMub3JpZ2luYWw7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBjb252ZXJ0IGFsbCB0aGUgY2hpbGRyZW5cbiAgICBpID0gMTtcblxuICAgIC8vIGRlYWwgd2l0aCB0aGUgYXR0cmlidXRlIG5vZGUsIGlmIGl0IGV4aXN0c1xuICAgIGlmICggYXR0cnMgKSB7XG4gICAgICAvLyBpZiB0aGVyZSBhcmUga2V5cywgc2tpcCBvdmVyIGl0XG4gICAgICBmb3IgKCB2YXIga2V5IGluIGpzb25tbFsgMSBdICkge1xuICAgICAgICBpID0gMjtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICAvLyBpZiB0aGVyZSBhcmVuJ3QsIHJlbW92ZSBpdFxuICAgICAgaWYgKCBpID09PSAxIClcbiAgICAgICAganNvbm1sLnNwbGljZSggaSwgMSApO1xuICAgIH1cblxuICAgIGZvciAoIDsgaSA8IGpzb25tbC5sZW5ndGg7ICsraSApIHtcbiAgICAgIGpzb25tbFsgaSBdID0gY29udmVydF90cmVlX3RvX2h0bWwoIGpzb25tbFsgaSBdLCByZWZlcmVuY2VzLCBvcHRpb25zICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGpzb25tbDtcbiAgfVxuXG5cbiAgLy8gbWVyZ2VzIGFkamFjZW50IHRleHQgbm9kZXMgaW50byBhIHNpbmdsZSBub2RlXG4gIGZ1bmN0aW9uIG1lcmdlX3RleHRfbm9kZXMoIGpzb25tbCApIHtcbiAgICAvLyBza2lwIHRoZSB0YWcgbmFtZSBhbmQgYXR0cmlidXRlIGhhc2hcbiAgICB2YXIgaSA9IGV4dHJhY3RfYXR0cigganNvbm1sICkgPyAyIDogMTtcblxuICAgIHdoaWxlICggaSA8IGpzb25tbC5sZW5ndGggKSB7XG4gICAgICAvLyBpZiBpdCdzIGEgc3RyaW5nIGNoZWNrIHRoZSBuZXh0IGl0ZW0gdG9vXG4gICAgICBpZiAoIHR5cGVvZiBqc29ubWxbIGkgXSA9PT0gXCJzdHJpbmdcIiApIHtcbiAgICAgICAgaWYgKCBpICsgMSA8IGpzb25tbC5sZW5ndGggJiYgdHlwZW9mIGpzb25tbFsgaSArIDEgXSA9PT0gXCJzdHJpbmdcIiApIHtcbiAgICAgICAgICAvLyBtZXJnZSB0aGUgc2Vjb25kIHN0cmluZyBpbnRvIHRoZSBmaXJzdCBhbmQgcmVtb3ZlIGl0XG4gICAgICAgICAganNvbm1sWyBpIF0gKz0ganNvbm1sLnNwbGljZSggaSArIDEsIDEgKVsgMCBdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICsraTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gaWYgaXQncyBub3QgYSBzdHJpbmcgcmVjdXJzZVxuICAgICAgZWxzZSB7XG4gICAgICAgIG1lcmdlX3RleHRfbm9kZXMoIGpzb25tbFsgaSBdICk7XG4gICAgICAgICsraTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cblxuXG4gIHZhciBEaWFsZWN0SGVscGVycyA9IHt9O1xuICBEaWFsZWN0SGVscGVycy5pbmxpbmVfdW50aWxfY2hhciA9IGZ1bmN0aW9uKCB0ZXh0LCB3YW50ICkge1xuICAgIHZhciBjb25zdW1lZCA9IDAsXG4gICAgICAgIG5vZGVzID0gW107XG5cbiAgICB3aGlsZSAoIHRydWUgKSB7XG4gICAgICBpZiAoIHRleHQuY2hhckF0KCBjb25zdW1lZCApID09PSB3YW50ICkge1xuICAgICAgICAvLyBGb3VuZCB0aGUgY2hhcmFjdGVyIHdlIHdlcmUgbG9va2luZyBmb3JcbiAgICAgICAgY29uc3VtZWQrKztcbiAgICAgICAgcmV0dXJuIFsgY29uc3VtZWQsIG5vZGVzIF07XG4gICAgICB9XG5cbiAgICAgIGlmICggY29uc3VtZWQgPj0gdGV4dC5sZW5ndGggKSB7XG4gICAgICAgIC8vIE5vIGNsb3NpbmcgY2hhciBmb3VuZC4gQWJvcnQuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVzID0gdGhpcy5kaWFsZWN0LmlubGluZS5fX29uZUVsZW1lbnRfXy5jYWxsKHRoaXMsIHRleHQuc3Vic3RyKCBjb25zdW1lZCApICk7XG4gICAgICBjb25zdW1lZCArPSByZXNbIDAgXTtcbiAgICAgIC8vIEFkZCBhbnkgcmV0dXJuZWQgbm9kZXMuXG4gICAgICBub2Rlcy5wdXNoLmFwcGx5KCBub2RlcywgcmVzLnNsaWNlKCAxICkgKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gSGVscGVyIGZ1bmN0aW9uIHRvIG1ha2Ugc3ViLWNsYXNzaW5nIGEgZGlhbGVjdCBlYXNpZXJcbiAgRGlhbGVjdEhlbHBlcnMuc3ViY2xhc3NEaWFsZWN0ID0gZnVuY3Rpb24oIGQgKSB7XG4gICAgZnVuY3Rpb24gQmxvY2soKSB7fVxuICAgIEJsb2NrLnByb3RvdHlwZSA9IGQuYmxvY2s7XG4gICAgZnVuY3Rpb24gSW5saW5lKCkge31cbiAgICBJbmxpbmUucHJvdG90eXBlID0gZC5pbmxpbmU7XG5cbiAgICByZXR1cm4geyBibG9jazogbmV3IEJsb2NrKCksIGlubGluZTogbmV3IElubGluZSgpIH07XG4gIH07XG5cblxuXG5cbiAgdmFyIGZvckVhY2ggPSBNYXJrZG93bkhlbHBlcnMuZm9yRWFjaCxcbiAgICAgIGV4dHJhY3RfYXR0ciA9IE1hcmtkb3duSGVscGVycy5leHRyYWN0X2F0dHIsXG4gICAgICBta19ibG9jayA9IE1hcmtkb3duSGVscGVycy5ta19ibG9jayxcbiAgICAgIGlzRW1wdHkgPSBNYXJrZG93bkhlbHBlcnMuaXNFbXB0eSxcbiAgICAgIGlubGluZV91bnRpbF9jaGFyID0gRGlhbGVjdEhlbHBlcnMuaW5saW5lX3VudGlsX2NoYXI7XG5cbiAgLyoqXG4gICAqIEdydWJlciBkaWFsZWN0XG4gICAqXG4gICAqIFRoZSBkZWZhdWx0IGRpYWxlY3QgdGhhdCBmb2xsb3dzIHRoZSBydWxlcyBzZXQgb3V0IGJ5IEpvaG4gR3J1YmVyJ3NcbiAgICogbWFya2Rvd24ucGwgYXMgY2xvc2VseSBhcyBwb3NzaWJsZS4gV2VsbCBhY3R1YWxseSB3ZSBmb2xsb3cgdGhlIGJlaGF2aW91ciBvZlxuICAgKiB0aGF0IHNjcmlwdCB3aGljaCBpbiBzb21lIHBsYWNlcyBpcyBub3QgZXhhY3RseSB3aGF0IHRoZSBzeW50YXggd2ViIHBhZ2VcbiAgICogc2F5cy5cbiAgICoqL1xuICB2YXIgR3J1YmVyID0ge1xuICAgIGJsb2NrOiB7XG4gICAgICBhdHhIZWFkZXI6IGZ1bmN0aW9uIGF0eEhlYWRlciggYmxvY2ssIG5leHQgKSB7XG4gICAgICAgIHZhciBtID0gYmxvY2subWF0Y2goIC9eKCN7MSw2fSlcXHMqKC4qPylcXHMqIypcXHMqKD86XFxufCQpLyApO1xuXG4gICAgICAgIGlmICggIW0gKVxuICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgICAgICAgdmFyIGhlYWRlciA9IFsgXCJoZWFkZXJcIiwgeyBsZXZlbDogbVsgMSBdLmxlbmd0aCB9IF07XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGhlYWRlciwgdGhpcy5wcm9jZXNzSW5saW5lKG1bIDIgXSkpO1xuXG4gICAgICAgIGlmICggbVswXS5sZW5ndGggPCBibG9jay5sZW5ndGggKVxuICAgICAgICAgIG5leHQudW5zaGlmdCggbWtfYmxvY2soIGJsb2NrLnN1YnN0ciggbVswXS5sZW5ndGggKSwgYmxvY2sudHJhaWxpbmcsIGJsb2NrLmxpbmVOdW1iZXIgKyAyICkgKTtcblxuICAgICAgICByZXR1cm4gWyBoZWFkZXIgXTtcbiAgICAgIH0sXG5cbiAgICAgIHNldGV4dEhlYWRlcjogZnVuY3Rpb24gc2V0ZXh0SGVhZGVyKCBibG9jaywgbmV4dCApIHtcbiAgICAgICAgdmFyIG0gPSBibG9jay5tYXRjaCggL14oLiopXFxuKFstPV0pXFwyXFwyKyg/OlxcbnwkKS8gKTtcblxuICAgICAgICBpZiAoICFtIClcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuXG4gICAgICAgIHZhciBsZXZlbCA9ICggbVsgMiBdID09PSBcIj1cIiApID8gMSA6IDIsXG4gICAgICAgICAgICBoZWFkZXIgPSBbIFwiaGVhZGVyXCIsIHsgbGV2ZWwgOiBsZXZlbCB9LCBtWyAxIF0gXTtcblxuICAgICAgICBpZiAoIG1bMF0ubGVuZ3RoIDwgYmxvY2subGVuZ3RoIClcbiAgICAgICAgICBuZXh0LnVuc2hpZnQoIG1rX2Jsb2NrKCBibG9jay5zdWJzdHIoIG1bMF0ubGVuZ3RoICksIGJsb2NrLnRyYWlsaW5nLCBibG9jay5saW5lTnVtYmVyICsgMiApICk7XG5cbiAgICAgICAgcmV0dXJuIFsgaGVhZGVyIF07XG4gICAgICB9LFxuXG4gICAgICBjb2RlOiBmdW5jdGlvbiBjb2RlKCBibG9jaywgbmV4dCApIHtcbiAgICAgICAgLy8gfCAgICBGb29cbiAgICAgICAgLy8gfGJhclxuICAgICAgICAvLyBzaG91bGQgYmUgYSBjb2RlIGJsb2NrIGZvbGxvd2VkIGJ5IGEgcGFyYWdyYXBoLiBGdW5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhlcmUgbWlnaHQgYWxzbyBiZSBhZGphY2VudCBjb2RlIGJsb2NrIHRvIG1lcmdlLlxuXG4gICAgICAgIHZhciByZXQgPSBbXSxcbiAgICAgICAgICAgIHJlID0gL14oPzogezAsM31cXHR8IHs0fSkoLiopXFxuPy87XG5cbiAgICAgICAgLy8gNCBzcGFjZXMgKyBjb250ZW50XG4gICAgICAgIGlmICggIWJsb2NrLm1hdGNoKCByZSApIClcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuXG4gICAgICAgIGJsb2NrX3NlYXJjaDpcbiAgICAgICAgZG8ge1xuICAgICAgICAgIC8vIE5vdyBwdWxsIG91dCB0aGUgcmVzdCBvZiB0aGUgbGluZXNcbiAgICAgICAgICB2YXIgYiA9IHRoaXMubG9vcF9yZV9vdmVyX2Jsb2NrKFxuICAgICAgICAgICAgICAgICAgICByZSwgYmxvY2sudmFsdWVPZigpLCBmdW5jdGlvbiggbSApIHsgcmV0LnB1c2goIG1bMV0gKTsgfSApO1xuXG4gICAgICAgICAgaWYgKCBiLmxlbmd0aCApIHtcbiAgICAgICAgICAgIC8vIENhc2UgYWxsdWRlZCB0byBpbiBmaXJzdCBjb21tZW50LiBwdXNoIGl0IGJhY2sgb24gYXMgYSBuZXcgYmxvY2tcbiAgICAgICAgICAgIG5leHQudW5zaGlmdCggbWtfYmxvY2soYiwgYmxvY2sudHJhaWxpbmcpICk7XG4gICAgICAgICAgICBicmVhayBibG9ja19zZWFyY2g7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKCBuZXh0Lmxlbmd0aCApIHtcbiAgICAgICAgICAgIC8vIENoZWNrIHRoZSBuZXh0IGJsb2NrIC0gaXQgbWlnaHQgYmUgY29kZSB0b29cbiAgICAgICAgICAgIGlmICggIW5leHRbMF0ubWF0Y2goIHJlICkgKVxuICAgICAgICAgICAgICBicmVhayBibG9ja19zZWFyY2g7XG5cbiAgICAgICAgICAgIC8vIFB1bGwgaG93IGhvdyBtYW55IGJsYW5rcyBsaW5lcyBmb2xsb3cgLSBtaW51cyB0d28gdG8gYWNjb3VudCBmb3IgLmpvaW5cbiAgICAgICAgICAgIHJldC5wdXNoICggYmxvY2sudHJhaWxpbmcucmVwbGFjZSgvW15cXG5dL2csIFwiXCIpLnN1YnN0cmluZygyKSApO1xuXG4gICAgICAgICAgICBibG9jayA9IG5leHQuc2hpZnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBicmVhayBibG9ja19zZWFyY2g7XG4gICAgICAgICAgfVxuICAgICAgICB9IHdoaWxlICggdHJ1ZSApO1xuXG4gICAgICAgIHJldHVybiBbIFsgXCJjb2RlX2Jsb2NrXCIsIHJldC5qb2luKFwiXFxuXCIpIF0gXTtcbiAgICAgIH0sXG5cbiAgICAgIGhvcml6UnVsZTogZnVuY3Rpb24gaG9yaXpSdWxlKCBibG9jaywgbmV4dCApIHtcbiAgICAgICAgLy8gdGhpcyBuZWVkcyB0byBmaW5kIGFueSBociBpbiB0aGUgYmxvY2sgdG8gaGFuZGxlIGFidXR0aW5nIGJsb2Nrc1xuICAgICAgICB2YXIgbSA9IGJsb2NrLm1hdGNoKCAvXig/OihbXFxzXFxTXSo/KVxcbik/WyBcXHRdKihbLV8qXSkoPzpbIFxcdF0qXFwyKXsyLH1bIFxcdF0qKD86XFxuKFtcXHNcXFNdKikpPyQvICk7XG5cbiAgICAgICAgaWYgKCAhbSApXG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcblxuICAgICAgICB2YXIganNvbm1sID0gWyBbIFwiaHJcIiBdIF07XG5cbiAgICAgICAgLy8gaWYgdGhlcmUncyBhIGxlYWRpbmcgYWJ1dHRpbmcgYmxvY2ssIHByb2Nlc3MgaXRcbiAgICAgICAgaWYgKCBtWyAxIF0gKSB7XG4gICAgICAgICAgdmFyIGNvbnRhaW5lZCA9IG1rX2Jsb2NrKCBtWyAxIF0sIFwiXCIsIGJsb2NrLmxpbmVOdW1iZXIgKTtcbiAgICAgICAgICBqc29ubWwudW5zaGlmdC5hcHBseSgganNvbm1sLCB0aGlzLnRvVHJlZSggY29udGFpbmVkLCBbXSApICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiB0aGVyZSdzIGEgdHJhaWxpbmcgYWJ1dHRpbmcgYmxvY2ssIHN0aWNrIGl0IGludG8gbmV4dFxuICAgICAgICBpZiAoIG1bIDMgXSApXG4gICAgICAgICAgbmV4dC51bnNoaWZ0KCBta19ibG9jayggbVsgMyBdLCBibG9jay50cmFpbGluZywgYmxvY2subGluZU51bWJlciArIDEgKSApO1xuXG4gICAgICAgIHJldHVybiBqc29ubWw7XG4gICAgICB9LFxuXG4gICAgICAvLyBUaGVyZSBhcmUgdHdvIHR5cGVzIG9mIGxpc3RzLiBUaWdodCBhbmQgbG9vc2UuIFRpZ2h0IGxpc3RzIGhhdmUgbm8gd2hpdGVzcGFjZVxuICAgICAgLy8gYmV0d2VlbiB0aGUgaXRlbXMgKGFuZCByZXN1bHQgaW4gdGV4dCBqdXN0IGluIHRoZSA8bGk+KSBhbmQgbG9vc2UgbGlzdHMsXG4gICAgICAvLyB3aGljaCBoYXZlIGFuIGVtcHR5IGxpbmUgYmV0d2VlbiBsaXN0IGl0ZW1zLCByZXN1bHRpbmcgaW4gKG9uZSBvciBtb3JlKVxuICAgICAgLy8gcGFyYWdyYXBocyBpbnNpZGUgdGhlIDxsaT4uXG4gICAgICAvL1xuICAgICAgLy8gVGhlcmUgYXJlIGFsbCBzb3J0cyB3ZWlyZCBlZGdlIGNhc2VzIGFib3V0IHRoZSBvcmlnaW5hbCBtYXJrZG93bi5wbCdzXG4gICAgICAvLyBoYW5kbGluZyBvZiBsaXN0czpcbiAgICAgIC8vXG4gICAgICAvLyAqIE5lc3RlZCBsaXN0cyBhcmUgc3VwcG9zZWQgdG8gYmUgaW5kZW50ZWQgYnkgZm91ciBjaGFycyBwZXIgbGV2ZWwuIEJ1dFxuICAgICAgLy8gICBpZiB0aGV5IGFyZW4ndCwgeW91IGNhbiBnZXQgYSBuZXN0ZWQgbGlzdCBieSBpbmRlbnRpbmcgYnkgbGVzcyB0aGFuXG4gICAgICAvLyAgIGZvdXIgc28gbG9uZyBhcyB0aGUgaW5kZW50IGRvZXNuJ3QgbWF0Y2ggYW4gaW5kZW50IG9mIGFuIGV4aXN0aW5nIGxpc3RcbiAgICAgIC8vICAgaXRlbSBpbiB0aGUgJ25lc3Qgc3RhY2snLlxuICAgICAgLy9cbiAgICAgIC8vICogVGhlIHR5cGUgb2YgdGhlIGxpc3QgKGJ1bGxldCBvciBudW1iZXIpIGlzIGNvbnRyb2xsZWQganVzdCBieSB0aGVcbiAgICAgIC8vICAgIGZpcnN0IGl0ZW0gYXQgdGhlIGluZGVudC4gU3Vic2VxdWVudCBjaGFuZ2VzIGFyZSBpZ25vcmVkIHVubGVzcyB0aGV5XG4gICAgICAvLyAgICBhcmUgZm9yIG5lc3RlZCBsaXN0c1xuICAgICAgLy9cbiAgICAgIGxpc3RzOiAoZnVuY3Rpb24oICkge1xuICAgICAgICAvLyBVc2UgYSBjbG9zdXJlIHRvIGhpZGUgYSBmZXcgdmFyaWFibGVzLlxuICAgICAgICB2YXIgYW55X2xpc3QgPSBcIlsqKy1dfFxcXFxkK1xcXFwuXCIsXG4gICAgICAgICAgICBidWxsZXRfbGlzdCA9IC9bKistXS8sXG4gICAgICAgICAgICAvLyBDYXB0dXJlIGxlYWRpbmcgaW5kZW50IGFzIGl0IG1hdHRlcnMgZm9yIGRldGVybWluaW5nIG5lc3RlZCBsaXN0cy5cbiAgICAgICAgICAgIGlzX2xpc3RfcmUgPSBuZXcgUmVnRXhwKCBcIl4oIHswLDN9KShcIiArIGFueV9saXN0ICsgXCIpWyBcXHRdK1wiICksXG4gICAgICAgICAgICBpbmRlbnRfcmUgPSBcIig/OiB7MCwzfVxcXFx0fCB7NH0pXCI7XG5cbiAgICAgICAgLy8gVE9ETzogQ2FjaGUgdGhpcyByZWdleHAgZm9yIGNlcnRhaW4gZGVwdGhzLlxuICAgICAgICAvLyBDcmVhdGUgYSByZWdleHAgc3VpdGFibGUgZm9yIG1hdGNoaW5nIGFuIGxpIGZvciBhIGdpdmVuIHN0YWNrIGRlcHRoXG4gICAgICAgIGZ1bmN0aW9uIHJlZ2V4X2Zvcl9kZXB0aCggZGVwdGggKSB7XG5cbiAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChcbiAgICAgICAgICAgIC8vIG1bMV0gPSBpbmRlbnQsIG1bMl0gPSBsaXN0X3R5cGVcbiAgICAgICAgICAgIFwiKD86XihcIiArIGluZGVudF9yZSArIFwiezAsXCIgKyBkZXB0aCArIFwifSB7MCwzfSkoXCIgKyBhbnlfbGlzdCArIFwiKVxcXFxzKyl8XCIgK1xuICAgICAgICAgICAgLy8gbVszXSA9IGNvbnRcbiAgICAgICAgICAgIFwiKF5cIiArIGluZGVudF9yZSArIFwiezAsXCIgKyAoZGVwdGgtMSkgKyBcIn1bIF17MCw0fSlcIlxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gZXhwYW5kX3RhYiggaW5wdXQgKSB7XG4gICAgICAgICAgcmV0dXJuIGlucHV0LnJlcGxhY2UoIC8gezAsM31cXHQvZywgXCIgICAgXCIgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBpbmxpbmUgY29udGVudCBgaW5saW5lYCB0byBgbGlgLiBpbmxpbmUgY29tZXMgZnJvbSBwcm9jZXNzSW5saW5lXG4gICAgICAgIC8vIHNvIGlzIGFuIGFycmF5IG9mIGNvbnRlbnRcbiAgICAgICAgZnVuY3Rpb24gYWRkKGxpLCBsb29zZSwgaW5saW5lLCBubCkge1xuICAgICAgICAgIGlmICggbG9vc2UgKSB7XG4gICAgICAgICAgICBsaS5wdXNoKCBbIFwicGFyYVwiIF0uY29uY2F0KGlubGluZSkgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gSG1tbSwgc2hvdWxkIHRoaXMgYmUgYW55IGJsb2NrIGxldmVsIGVsZW1lbnQgb3IganVzdCBwYXJhcz9cbiAgICAgICAgICB2YXIgYWRkX3RvID0gbGlbbGkubGVuZ3RoIC0xXSBpbnN0YW5jZW9mIEFycmF5ICYmIGxpW2xpLmxlbmd0aCAtIDFdWzBdID09PSBcInBhcmFcIlxuICAgICAgICAgICAgICAgICAgICAgPyBsaVtsaS5sZW5ndGggLTFdXG4gICAgICAgICAgICAgICAgICAgICA6IGxpO1xuXG4gICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYWxyZWFkeSBzb21lIGNvbnRlbnQgaW4gdGhpcyBsaXN0LCBhZGQgdGhlIG5ldyBsaW5lIGluXG4gICAgICAgICAgaWYgKCBubCAmJiBsaS5sZW5ndGggPiAxIClcbiAgICAgICAgICAgIGlubGluZS51bnNoaWZ0KG5sKTtcblxuICAgICAgICAgIGZvciAoIHZhciBpID0gMDsgaSA8IGlubGluZS5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIHZhciB3aGF0ID0gaW5saW5lW2ldLFxuICAgICAgICAgICAgICAgIGlzX3N0ciA9IHR5cGVvZiB3aGF0ID09PSBcInN0cmluZ1wiO1xuICAgICAgICAgICAgaWYgKCBpc19zdHIgJiYgYWRkX3RvLmxlbmd0aCA+IDEgJiYgdHlwZW9mIGFkZF90b1thZGRfdG8ubGVuZ3RoLTFdID09PSBcInN0cmluZ1wiIClcbiAgICAgICAgICAgICAgYWRkX3RvWyBhZGRfdG8ubGVuZ3RoLTEgXSArPSB3aGF0O1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBhZGRfdG8ucHVzaCggd2hhdCApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNvbnRhaW5lZCBtZWFucyBoYXZlIGFuIGluZGVudCBncmVhdGVyIHRoYW4gdGhlIGN1cnJlbnQgb25lLiBPblxuICAgICAgICAvLyAqZXZlcnkqIGxpbmUgaW4gdGhlIGJsb2NrXG4gICAgICAgIGZ1bmN0aW9uIGdldF9jb250YWluZWRfYmxvY2tzKCBkZXB0aCwgYmxvY2tzICkge1xuXG4gICAgICAgICAgdmFyIHJlID0gbmV3IFJlZ0V4cCggXCJeKFwiICsgaW5kZW50X3JlICsgXCJ7XCIgKyBkZXB0aCArIFwifS4qP1xcXFxuPykqJFwiICksXG4gICAgICAgICAgICAgIHJlcGxhY2UgPSBuZXcgUmVnRXhwKFwiXlwiICsgaW5kZW50X3JlICsgXCJ7XCIgKyBkZXB0aCArIFwifVwiLCBcImdtXCIpLFxuICAgICAgICAgICAgICByZXQgPSBbXTtcblxuICAgICAgICAgIHdoaWxlICggYmxvY2tzLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgICAgICBpZiAoIHJlLmV4ZWMoIGJsb2Nrc1swXSApICkge1xuICAgICAgICAgICAgICB2YXIgYiA9IGJsb2Nrcy5zaGlmdCgpLFxuICAgICAgICAgICAgICAgICAgLy8gTm93IHJlbW92ZSB0aGF0IGluZGVudFxuICAgICAgICAgICAgICAgICAgeCA9IGIucmVwbGFjZSggcmVwbGFjZSwgXCJcIik7XG5cbiAgICAgICAgICAgICAgcmV0LnB1c2goIG1rX2Jsb2NrKCB4LCBiLnRyYWlsaW5nLCBiLmxpbmVOdW1iZXIgKSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHBhc3NlZCB0byBzdGFjay5mb3JFYWNoIHRvIHR1cm4gbGlzdCBpdGVtcyB1cCB0aGUgc3RhY2sgaW50byBwYXJhc1xuICAgICAgICBmdW5jdGlvbiBwYXJhZ3JhcGhpZnkocywgaSwgc3RhY2spIHtcbiAgICAgICAgICB2YXIgbGlzdCA9IHMubGlzdDtcbiAgICAgICAgICB2YXIgbGFzdF9saSA9IGxpc3RbbGlzdC5sZW5ndGgtMV07XG5cbiAgICAgICAgICBpZiAoIGxhc3RfbGlbMV0gaW5zdGFuY2VvZiBBcnJheSAmJiBsYXN0X2xpWzFdWzBdID09PSBcInBhcmFcIiApXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgaWYgKCBpICsgMSA9PT0gc3RhY2subGVuZ3RoICkge1xuICAgICAgICAgICAgLy8gTGFzdCBzdGFjayBmcmFtZVxuICAgICAgICAgICAgLy8gS2VlcCB0aGUgc2FtZSBhcnJheSwgYnV0IHJlcGxhY2UgdGhlIGNvbnRlbnRzXG4gICAgICAgICAgICBsYXN0X2xpLnB1c2goIFtcInBhcmFcIl0uY29uY2F0KCBsYXN0X2xpLnNwbGljZSgxLCBsYXN0X2xpLmxlbmd0aCAtIDEpICkgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgc3VibGlzdCA9IGxhc3RfbGkucG9wKCk7XG4gICAgICAgICAgICBsYXN0X2xpLnB1c2goIFtcInBhcmFcIl0uY29uY2F0KCBsYXN0X2xpLnNwbGljZSgxLCBsYXN0X2xpLmxlbmd0aCAtIDEpICksIHN1Ymxpc3QgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgbWF0Y2hlciBmdW5jdGlvblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oIGJsb2NrLCBuZXh0ICkge1xuICAgICAgICAgIHZhciBtID0gYmxvY2subWF0Y2goIGlzX2xpc3RfcmUgKTtcbiAgICAgICAgICBpZiAoICFtIClcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgICAgICAgICBmdW5jdGlvbiBtYWtlX2xpc3QoIG0gKSB7XG4gICAgICAgICAgICB2YXIgbGlzdCA9IGJ1bGxldF9saXN0LmV4ZWMoIG1bMl0gKVxuICAgICAgICAgICAgICAgICAgICAgPyBbXCJidWxsZXRsaXN0XCJdXG4gICAgICAgICAgICAgICAgICAgICA6IFtcIm51bWJlcmxpc3RcIl07XG5cbiAgICAgICAgICAgIHN0YWNrLnB1c2goIHsgbGlzdDogbGlzdCwgaW5kZW50OiBtWzFdIH0gKTtcbiAgICAgICAgICAgIHJldHVybiBsaXN0O1xuICAgICAgICAgIH1cblxuXG4gICAgICAgICAgdmFyIHN0YWNrID0gW10sIC8vIFN0YWNrIG9mIGxpc3RzIGZvciBuZXN0aW5nLlxuICAgICAgICAgICAgICBsaXN0ID0gbWFrZV9saXN0KCBtICksXG4gICAgICAgICAgICAgIGxhc3RfbGksXG4gICAgICAgICAgICAgIGxvb3NlID0gZmFsc2UsXG4gICAgICAgICAgICAgIHJldCA9IFsgc3RhY2tbMF0ubGlzdCBdLFxuICAgICAgICAgICAgICBpO1xuXG4gICAgICAgICAgLy8gTG9vcCB0byBzZWFyY2ggb3ZlciBibG9jayBsb29raW5nIGZvciBpbm5lciBibG9jayBlbGVtZW50cyBhbmQgbG9vc2UgbGlzdHNcbiAgICAgICAgICBsb29zZV9zZWFyY2g6XG4gICAgICAgICAgd2hpbGUgKCB0cnVlICkge1xuICAgICAgICAgICAgLy8gU3BsaXQgaW50byBsaW5lcyBwcmVzZXJ2aW5nIG5ldyBsaW5lcyBhdCBlbmQgb2YgbGluZVxuICAgICAgICAgICAgdmFyIGxpbmVzID0gYmxvY2suc3BsaXQoIC8oPz1cXG4pLyApO1xuXG4gICAgICAgICAgICAvLyBXZSBoYXZlIHRvIGdyYWIgYWxsIGxpbmVzIGZvciBhIGxpIGFuZCBjYWxsIHByb2Nlc3NJbmxpbmUgb24gdGhlbVxuICAgICAgICAgICAgLy8gb25jZSBhcyB0aGVyZSBhcmUgc29tZSBpbmxpbmUgdGhpbmdzIHRoYXQgY2FuIHNwYW4gbGluZXMuXG4gICAgICAgICAgICB2YXIgbGlfYWNjdW11bGF0ZSA9IFwiXCIsIG5sID0gXCJcIjtcblxuICAgICAgICAgICAgLy8gTG9vcCBvdmVyIHRoZSBsaW5lcyBpbiB0aGlzIGJsb2NrIGxvb2tpbmcgZm9yIHRpZ2h0IGxpc3RzLlxuICAgICAgICAgICAgdGlnaHRfc2VhcmNoOlxuICAgICAgICAgICAgZm9yICggdmFyIGxpbmVfbm8gPSAwOyBsaW5lX25vIDwgbGluZXMubGVuZ3RoOyBsaW5lX25vKysgKSB7XG4gICAgICAgICAgICAgIG5sID0gXCJcIjtcbiAgICAgICAgICAgICAgdmFyIGwgPSBsaW5lc1tsaW5lX25vXS5yZXBsYWNlKC9eXFxuLywgZnVuY3Rpb24obikgeyBubCA9IG47IHJldHVybiBcIlwiOyB9KTtcblxuXG4gICAgICAgICAgICAgIC8vIFRPRE86IHJlYWxseSBzaG91bGQgY2FjaGUgdGhpc1xuICAgICAgICAgICAgICB2YXIgbGluZV9yZSA9IHJlZ2V4X2Zvcl9kZXB0aCggc3RhY2subGVuZ3RoICk7XG5cbiAgICAgICAgICAgICAgbSA9IGwubWF0Y2goIGxpbmVfcmUgKTtcbiAgICAgICAgICAgICAgLy9wcmludCggXCJsaW5lOlwiLCB1bmV2YWwobCksIFwiXFxubGluZSBtYXRjaDpcIiwgdW5ldmFsKG0pICk7XG5cbiAgICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIGxpc3QgaXRlbVxuICAgICAgICAgICAgICBpZiAoIG1bMV0gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgICAgICAvLyBQcm9jZXNzIHRoZSBwcmV2aW91cyBsaXN0IGl0ZW0sIGlmIGFueVxuICAgICAgICAgICAgICAgIGlmICggbGlfYWNjdW11bGF0ZS5sZW5ndGggKSB7XG4gICAgICAgICAgICAgICAgICBhZGQoIGxhc3RfbGksIGxvb3NlLCB0aGlzLnByb2Nlc3NJbmxpbmUoIGxpX2FjY3VtdWxhdGUgKSwgbmwgKTtcbiAgICAgICAgICAgICAgICAgIC8vIExvb3NlIG1vZGUgd2lsbCBoYXZlIGJlZW4gZGVhbHQgd2l0aC4gUmVzZXQgaXRcbiAgICAgICAgICAgICAgICAgIGxvb3NlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICBsaV9hY2N1bXVsYXRlID0gXCJcIjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBtWzFdID0gZXhwYW5kX3RhYiggbVsxXSApO1xuICAgICAgICAgICAgICAgIHZhciB3YW50ZWRfZGVwdGggPSBNYXRoLmZsb29yKG1bMV0ubGVuZ3RoLzQpKzE7XG4gICAgICAgICAgICAgICAgLy9wcmludCggXCJ3YW50OlwiLCB3YW50ZWRfZGVwdGgsIFwic3RhY2s6XCIsIHN0YWNrLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgaWYgKCB3YW50ZWRfZGVwdGggPiBzdGFjay5sZW5ndGggKSB7XG4gICAgICAgICAgICAgICAgICAvLyBEZWVwIGVub3VnaCBmb3IgYSBuZXN0ZWQgbGlzdCBvdXRyaWdodFxuICAgICAgICAgICAgICAgICAgLy9wcmludCAoIFwibmV3IG5lc3RlZCBsaXN0XCIgKTtcbiAgICAgICAgICAgICAgICAgIGxpc3QgPSBtYWtlX2xpc3QoIG0gKTtcbiAgICAgICAgICAgICAgICAgIGxhc3RfbGkucHVzaCggbGlzdCApO1xuICAgICAgICAgICAgICAgICAgbGFzdF9saSA9IGxpc3RbMV0gPSBbIFwibGlzdGl0ZW1cIiBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIC8vIFdlIGFyZW4ndCBkZWVwIGVub3VnaCB0byBiZSBzdHJpY3RseSBhIG5ldyBsZXZlbC4gVGhpcyBpc1xuICAgICAgICAgICAgICAgICAgLy8gd2hlcmUgTWQucGwgZ29lcyBudXRzLiBJZiB0aGUgaW5kZW50IG1hdGNoZXMgYSBsZXZlbCBpbiB0aGVcbiAgICAgICAgICAgICAgICAgIC8vIHN0YWNrLCBwdXQgaXQgdGhlcmUsIGVsc2UgcHV0IGl0IG9uZSBkZWVwZXIgdGhlbiB0aGVcbiAgICAgICAgICAgICAgICAgIC8vIHdhbnRlZF9kZXB0aCBkZXNlcnZlcy5cbiAgICAgICAgICAgICAgICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBzdGFjay5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBzdGFja1sgaSBdLmluZGVudCAhPT0gbVsxXSApXG4gICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAgICAgbGlzdCA9IHN0YWNrWyBpIF0ubGlzdDtcbiAgICAgICAgICAgICAgICAgICAgc3RhY2suc3BsaWNlKCBpKzEsIHN0YWNrLmxlbmd0aCAtIChpKzEpICk7XG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGlmICghZm91bmQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9wcmludChcIm5vdCBmb3VuZC4gbDpcIiwgdW5ldmFsKGwpKTtcbiAgICAgICAgICAgICAgICAgICAgd2FudGVkX2RlcHRoKys7XG4gICAgICAgICAgICAgICAgICAgIGlmICggd2FudGVkX2RlcHRoIDw9IHN0YWNrLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICAgICAgICBzdGFjay5zcGxpY2Uod2FudGVkX2RlcHRoLCBzdGFjay5sZW5ndGggLSB3YW50ZWRfZGVwdGgpO1xuICAgICAgICAgICAgICAgICAgICAgIC8vcHJpbnQoXCJEZXNpcmVkIGRlcHRoIG5vd1wiLCB3YW50ZWRfZGVwdGgsIFwic3RhY2s6XCIsIHN0YWNrLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgbGlzdCA9IHN0YWNrW3dhbnRlZF9kZXB0aC0xXS5saXN0O1xuICAgICAgICAgICAgICAgICAgICAgIC8vcHJpbnQoXCJsaXN0OlwiLCB1bmV2YWwobGlzdCkgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAvL3ByaW50IChcIm1hZGUgbmV3IHN0YWNrIGZvciBtZXNzeSBpbmRlbnRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgbGlzdCA9IG1ha2VfbGlzdChtKTtcbiAgICAgICAgICAgICAgICAgICAgICBsYXN0X2xpLnB1c2gobGlzdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgLy9wcmludCggdW5ldmFsKGxpc3QpLCBcImxhc3RcIiwgbGlzdCA9PT0gc3RhY2tbc3RhY2subGVuZ3RoLTFdLmxpc3QgKTtcbiAgICAgICAgICAgICAgICAgIGxhc3RfbGkgPSBbIFwibGlzdGl0ZW1cIiBdO1xuICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKGxhc3RfbGkpO1xuICAgICAgICAgICAgICAgIH0gLy8gZW5kIGRlcHRoIG9mIHNoZW5lZ2FpbnNcbiAgICAgICAgICAgICAgICBubCA9IFwiXCI7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBBZGQgY29udGVudFxuICAgICAgICAgICAgICBpZiAoIGwubGVuZ3RoID4gbVswXS5sZW5ndGggKVxuICAgICAgICAgICAgICAgIGxpX2FjY3VtdWxhdGUgKz0gbmwgKyBsLnN1YnN0ciggbVswXS5sZW5ndGggKTtcbiAgICAgICAgICAgIH0gLy8gdGlnaHRfc2VhcmNoXG5cbiAgICAgICAgICAgIGlmICggbGlfYWNjdW11bGF0ZS5sZW5ndGggKSB7XG4gICAgICAgICAgICAgIGFkZCggbGFzdF9saSwgbG9vc2UsIHRoaXMucHJvY2Vzc0lubGluZSggbGlfYWNjdW11bGF0ZSApLCBubCApO1xuICAgICAgICAgICAgICAvLyBMb29zZSBtb2RlIHdpbGwgaGF2ZSBiZWVuIGRlYWx0IHdpdGguIFJlc2V0IGl0XG4gICAgICAgICAgICAgIGxvb3NlID0gZmFsc2U7XG4gICAgICAgICAgICAgIGxpX2FjY3VtdWxhdGUgPSBcIlwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMb29rIGF0IHRoZSBuZXh0IGJsb2NrIC0gd2UgbWlnaHQgaGF2ZSBhIGxvb3NlIGxpc3QuIE9yIGFuIGV4dHJhXG4gICAgICAgICAgICAvLyBwYXJhZ3JhcGggZm9yIHRoZSBjdXJyZW50IGxpXG4gICAgICAgICAgICB2YXIgY29udGFpbmVkID0gZ2V0X2NvbnRhaW5lZF9ibG9ja3MoIHN0YWNrLmxlbmd0aCwgbmV4dCApO1xuXG4gICAgICAgICAgICAvLyBEZWFsIHdpdGggY29kZSBibG9ja3Mgb3IgcHJvcGVybHkgbmVzdGVkIGxpc3RzXG4gICAgICAgICAgICBpZiAoIGNvbnRhaW5lZC5sZW5ndGggPiAwICkge1xuICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgYWxsIGxpc3RpdGVtcyB1cCB0aGUgc3RhY2sgYXJlIHBhcmFncmFwaHNcbiAgICAgICAgICAgICAgZm9yRWFjaCggc3RhY2ssIHBhcmFncmFwaGlmeSwgdGhpcyk7XG5cbiAgICAgICAgICAgICAgbGFzdF9saS5wdXNoLmFwcGx5KCBsYXN0X2xpLCB0aGlzLnRvVHJlZSggY29udGFpbmVkLCBbXSApICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBuZXh0X2Jsb2NrID0gbmV4dFswXSAmJiBuZXh0WzBdLnZhbHVlT2YoKSB8fCBcIlwiO1xuXG4gICAgICAgICAgICBpZiAoIG5leHRfYmxvY2subWF0Y2goaXNfbGlzdF9yZSkgfHwgbmV4dF9ibG9jay5tYXRjaCggL14gLyApICkge1xuICAgICAgICAgICAgICBibG9jayA9IG5leHQuc2hpZnQoKTtcblxuICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgYW4gSFIgZm9sbG93aW5nIGEgbGlzdDogZmVhdHVyZXMvbGlzdHMvaHJfYWJ1dHRpbmdcbiAgICAgICAgICAgICAgdmFyIGhyID0gdGhpcy5kaWFsZWN0LmJsb2NrLmhvcml6UnVsZSggYmxvY2ssIG5leHQgKTtcblxuICAgICAgICAgICAgICBpZiAoIGhyICkge1xuICAgICAgICAgICAgICAgIHJldC5wdXNoLmFwcGx5KHJldCwgaHIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gTWFrZSBzdXJlIGFsbCBsaXN0aXRlbXMgdXAgdGhlIHN0YWNrIGFyZSBwYXJhZ3JhcGhzXG4gICAgICAgICAgICAgIGZvckVhY2goIHN0YWNrLCBwYXJhZ3JhcGhpZnksIHRoaXMpO1xuXG4gICAgICAgICAgICAgIGxvb3NlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgY29udGludWUgbG9vc2Vfc2VhcmNoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfSAvLyBsb29zZV9zZWFyY2hcblxuICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgIH07XG4gICAgICB9KSgpLFxuXG4gICAgICBibG9ja3F1b3RlOiBmdW5jdGlvbiBibG9ja3F1b3RlKCBibG9jaywgbmV4dCApIHtcbiAgICAgICAgaWYgKCAhYmxvY2subWF0Y2goIC9ePi9tICkgKVxuICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgICAgICAgdmFyIGpzb25tbCA9IFtdO1xuXG4gICAgICAgIC8vIHNlcGFyYXRlIG91dCB0aGUgbGVhZGluZyBhYnV0dGluZyBibG9jaywgaWYgYW55LiBJLmUuIGluIHRoaXMgY2FzZTpcbiAgICAgICAgLy9cbiAgICAgICAgLy8gIGFcbiAgICAgICAgLy8gID4gYlxuICAgICAgICAvL1xuICAgICAgICBpZiAoIGJsb2NrWyAwIF0gIT09IFwiPlwiICkge1xuICAgICAgICAgIHZhciBsaW5lcyA9IGJsb2NrLnNwbGl0KCAvXFxuLyApLFxuICAgICAgICAgICAgICBwcmV2ID0gW10sXG4gICAgICAgICAgICAgIGxpbmVfbm8gPSBibG9jay5saW5lTnVtYmVyO1xuXG4gICAgICAgICAgLy8ga2VlcCBzaGlmdGluZyBsaW5lcyB1bnRpbCB5b3UgZmluZCBhIGNyb3RjaGV0XG4gICAgICAgICAgd2hpbGUgKCBsaW5lcy5sZW5ndGggJiYgbGluZXNbIDAgXVsgMCBdICE9PSBcIj5cIiApIHtcbiAgICAgICAgICAgIHByZXYucHVzaCggbGluZXMuc2hpZnQoKSApO1xuICAgICAgICAgICAgbGluZV9ubysrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBhYnV0dGluZyA9IG1rX2Jsb2NrKCBwcmV2LmpvaW4oIFwiXFxuXCIgKSwgXCJcXG5cIiwgYmxvY2subGluZU51bWJlciApO1xuICAgICAgICAgIGpzb25tbC5wdXNoLmFwcGx5KCBqc29ubWwsIHRoaXMucHJvY2Vzc0Jsb2NrKCBhYnV0dGluZywgW10gKSApO1xuICAgICAgICAgIC8vIHJlYXNzZW1ibGUgbmV3IGJsb2NrIG9mIGp1c3QgYmxvY2sgcXVvdGVzIVxuICAgICAgICAgIGJsb2NrID0gbWtfYmxvY2soIGxpbmVzLmpvaW4oIFwiXFxuXCIgKSwgYmxvY2sudHJhaWxpbmcsIGxpbmVfbm8gKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy8gaWYgdGhlIG5leHQgYmxvY2sgaXMgYWxzbyBhIGJsb2NrcXVvdGUgbWVyZ2UgaXQgaW5cbiAgICAgICAgd2hpbGUgKCBuZXh0Lmxlbmd0aCAmJiBuZXh0WyAwIF1bIDAgXSA9PT0gXCI+XCIgKSB7XG4gICAgICAgICAgdmFyIGIgPSBuZXh0LnNoaWZ0KCk7XG4gICAgICAgICAgYmxvY2sgPSBta19ibG9jayggYmxvY2sgKyBibG9jay50cmFpbGluZyArIGIsIGIudHJhaWxpbmcsIGJsb2NrLmxpbmVOdW1iZXIgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0cmlwIG9mZiB0aGUgbGVhZGluZyBcIj4gXCIgYW5kIHJlLXByb2Nlc3MgYXMgYSBibG9jay5cbiAgICAgICAgdmFyIGlucHV0ID0gYmxvY2sucmVwbGFjZSggL14+ID8vZ20sIFwiXCIgKSxcbiAgICAgICAgICAgIG9sZF90cmVlID0gdGhpcy50cmVlLFxuICAgICAgICAgICAgcHJvY2Vzc2VkQmxvY2sgPSB0aGlzLnRvVHJlZSggaW5wdXQsIFsgXCJibG9ja3F1b3RlXCIgXSApLFxuICAgICAgICAgICAgYXR0ciA9IGV4dHJhY3RfYXR0ciggcHJvY2Vzc2VkQmxvY2sgKTtcblxuICAgICAgICAvLyBJZiBhbnkgbGluayByZWZlcmVuY2VzIHdlcmUgZm91bmQgZ2V0IHJpZCBvZiB0aGVtXG4gICAgICAgIGlmICggYXR0ciAmJiBhdHRyLnJlZmVyZW5jZXMgKSB7XG4gICAgICAgICAgZGVsZXRlIGF0dHIucmVmZXJlbmNlcztcbiAgICAgICAgICAvLyBBbmQgdGhlbiByZW1vdmUgdGhlIGF0dHJpYnV0ZSBvYmplY3QgaWYgaXQncyBlbXB0eVxuICAgICAgICAgIGlmICggaXNFbXB0eSggYXR0ciApIClcbiAgICAgICAgICAgIHByb2Nlc3NlZEJsb2NrLnNwbGljZSggMSwgMSApO1xuICAgICAgICB9XG5cbiAgICAgICAganNvbm1sLnB1c2goIHByb2Nlc3NlZEJsb2NrICk7XG4gICAgICAgIHJldHVybiBqc29ubWw7XG4gICAgICB9LFxuXG4gICAgICByZWZlcmVuY2VEZWZuOiBmdW5jdGlvbiByZWZlcmVuY2VEZWZuKCBibG9jaywgbmV4dCkge1xuICAgICAgICB2YXIgcmUgPSAvXlxccypcXFsoLio/KVxcXTpcXHMqKFxcUyspKD86XFxzKyg/OihbJ1wiXSkoLio/KVxcM3xcXCgoLio/KVxcKSkpP1xcbj8vO1xuICAgICAgICAvLyBpbnRlcmVzdGluZyBtYXRjaGVzIGFyZSBbICwgcmVmX2lkLCB1cmwsICwgdGl0bGUsIHRpdGxlIF1cblxuICAgICAgICBpZiAoICFibG9jay5tYXRjaChyZSkgKVxuICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgICAgICAgLy8gbWFrZSBhbiBhdHRyaWJ1dGUgbm9kZSBpZiBpdCBkb2Vzbid0IGV4aXN0XG4gICAgICAgIGlmICggIWV4dHJhY3RfYXR0ciggdGhpcy50cmVlICkgKVxuICAgICAgICAgIHRoaXMudHJlZS5zcGxpY2UoIDEsIDAsIHt9ICk7XG5cbiAgICAgICAgdmFyIGF0dHJzID0gZXh0cmFjdF9hdHRyKCB0aGlzLnRyZWUgKTtcblxuICAgICAgICAvLyBtYWtlIGEgcmVmZXJlbmNlcyBoYXNoIGlmIGl0IGRvZXNuJ3QgZXhpc3RcbiAgICAgICAgaWYgKCBhdHRycy5yZWZlcmVuY2VzID09PSB1bmRlZmluZWQgKVxuICAgICAgICAgIGF0dHJzLnJlZmVyZW5jZXMgPSB7fTtcblxuICAgICAgICB2YXIgYiA9IHRoaXMubG9vcF9yZV9vdmVyX2Jsb2NrKHJlLCBibG9jaywgZnVuY3Rpb24oIG0gKSB7XG5cbiAgICAgICAgICBpZiAoIG1bMl0gJiYgbVsyXVswXSA9PT0gXCI8XCIgJiYgbVsyXVttWzJdLmxlbmd0aC0xXSA9PT0gXCI+XCIgKVxuICAgICAgICAgICAgbVsyXSA9IG1bMl0uc3Vic3RyaW5nKCAxLCBtWzJdLmxlbmd0aCAtIDEgKTtcblxuICAgICAgICAgIHZhciByZWYgPSBhdHRycy5yZWZlcmVuY2VzWyBtWzFdLnRvTG93ZXJDYXNlKCkgXSA9IHtcbiAgICAgICAgICAgIGhyZWY6IG1bMl1cbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgaWYgKCBtWzRdICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgcmVmLnRpdGxlID0gbVs0XTtcbiAgICAgICAgICBlbHNlIGlmICggbVs1XSAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHJlZi50aXRsZSA9IG1bNV07XG5cbiAgICAgICAgfSApO1xuXG4gICAgICAgIGlmICggYi5sZW5ndGggKVxuICAgICAgICAgIG5leHQudW5zaGlmdCggbWtfYmxvY2soIGIsIGJsb2NrLnRyYWlsaW5nICkgKTtcblxuICAgICAgICByZXR1cm4gW107XG4gICAgICB9LFxuXG4gICAgICBwYXJhOiBmdW5jdGlvbiBwYXJhKCBibG9jayApIHtcbiAgICAgICAgLy8gZXZlcnl0aGluZydzIGEgcGFyYSFcbiAgICAgICAgcmV0dXJuIFsgW1wicGFyYVwiXS5jb25jYXQoIHRoaXMucHJvY2Vzc0lubGluZSggYmxvY2sgKSApIF07XG4gICAgICB9XG4gICAgfSxcblxuICAgIGlubGluZToge1xuXG4gICAgICBfX29uZUVsZW1lbnRfXzogZnVuY3Rpb24gb25lRWxlbWVudCggdGV4dCwgcGF0dGVybnNfb3JfcmUsIHByZXZpb3VzX25vZGVzICkge1xuICAgICAgICB2YXIgbSxcbiAgICAgICAgICAgIHJlcztcblxuICAgICAgICBwYXR0ZXJuc19vcl9yZSA9IHBhdHRlcm5zX29yX3JlIHx8IHRoaXMuZGlhbGVjdC5pbmxpbmUuX19wYXR0ZXJuc19fO1xuICAgICAgICB2YXIgcmUgPSBuZXcgUmVnRXhwKCBcIihbXFxcXHNcXFxcU10qPykoXCIgKyAocGF0dGVybnNfb3JfcmUuc291cmNlIHx8IHBhdHRlcm5zX29yX3JlKSArIFwiKVwiICk7XG5cbiAgICAgICAgbSA9IHJlLmV4ZWMoIHRleHQgKTtcbiAgICAgICAgaWYgKCFtKSB7XG4gICAgICAgICAgLy8gSnVzdCBib3JpbmcgdGV4dFxuICAgICAgICAgIHJldHVybiBbIHRleHQubGVuZ3RoLCB0ZXh0IF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIG1bMV0gKSB7XG4gICAgICAgICAgLy8gU29tZSB1bi1pbnRlcmVzdGluZyB0ZXh0IG1hdGNoZWQuIFJldHVybiB0aGF0IGZpcnN0XG4gICAgICAgICAgcmV0dXJuIFsgbVsxXS5sZW5ndGgsIG1bMV0gXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXM7XG4gICAgICAgIGlmICggbVsyXSBpbiB0aGlzLmRpYWxlY3QuaW5saW5lICkge1xuICAgICAgICAgIHJlcyA9IHRoaXMuZGlhbGVjdC5pbmxpbmVbIG1bMl0gXS5jYWxsKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0LnN1YnN0ciggbS5pbmRleCApLCBtLCBwcmV2aW91c19ub2RlcyB8fCBbXSApO1xuICAgICAgICB9XG4gICAgICAgIC8vIERlZmF1bHQgZm9yIG5vdyB0byBtYWtlIGRldiBlYXNpZXIuIGp1c3Qgc2x1cnAgc3BlY2lhbCBhbmQgb3V0cHV0IGl0LlxuICAgICAgICByZXMgPSByZXMgfHwgWyBtWzJdLmxlbmd0aCwgbVsyXSBdO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfSxcblxuICAgICAgX19jYWxsX186IGZ1bmN0aW9uIGlubGluZSggdGV4dCwgcGF0dGVybnMgKSB7XG5cbiAgICAgICAgdmFyIG91dCA9IFtdLFxuICAgICAgICAgICAgcmVzO1xuXG4gICAgICAgIGZ1bmN0aW9uIGFkZCh4KSB7XG4gICAgICAgICAgLy9EOnNlbGYuZGVidWcoXCIgIGFkZGluZyBvdXRwdXRcIiwgdW5ldmFsKHgpKTtcbiAgICAgICAgICBpZiAoIHR5cGVvZiB4ID09PSBcInN0cmluZ1wiICYmIHR5cGVvZiBvdXRbb3V0Lmxlbmd0aC0xXSA9PT0gXCJzdHJpbmdcIiApXG4gICAgICAgICAgICBvdXRbIG91dC5sZW5ndGgtMSBdICs9IHg7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3V0LnB1c2goeCk7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoIHRleHQubGVuZ3RoID4gMCApIHtcbiAgICAgICAgICByZXMgPSB0aGlzLmRpYWxlY3QuaW5saW5lLl9fb25lRWxlbWVudF9fLmNhbGwodGhpcywgdGV4dCwgcGF0dGVybnMsIG91dCApO1xuICAgICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0ciggcmVzLnNoaWZ0KCkgKTtcbiAgICAgICAgICBmb3JFYWNoKHJlcywgYWRkICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgfSxcblxuICAgICAgLy8gVGhlc2UgY2hhcmFjdGVycyBhcmUgaW50ZXJzdGluZyBlbHNld2hlcmUsIHNvIGhhdmUgcnVsZXMgZm9yIHRoZW0gc28gdGhhdFxuICAgICAgLy8gY2h1bmtzIG9mIHBsYWluIHRleHQgYmxvY2tzIGRvbid0IGluY2x1ZGUgdGhlbVxuICAgICAgXCJdXCI6IGZ1bmN0aW9uICgpIHt9LFxuICAgICAgXCJ9XCI6IGZ1bmN0aW9uICgpIHt9LFxuXG4gICAgICBfX2VzY2FwZV9fIDogL15cXFxcW1xcXFxgXFwqX3t9XFxbXFxdKCkjXFwrLiFcXC1dLyxcblxuICAgICAgXCJcXFxcXCI6IGZ1bmN0aW9uIGVzY2FwZWQoIHRleHQgKSB7XG4gICAgICAgIC8vIFsgbGVuZ3RoIG9mIGlucHV0IHByb2Nlc3NlZCwgbm9kZS9jaGlsZHJlbiB0byBhZGQuLi4gXVxuICAgICAgICAvLyBPbmx5IGVzYWNhcGU6IFxcIGAgKiBfIHsgfSBbIF0gKCApICMgKiArIC0gLiAhXG4gICAgICAgIGlmICggdGhpcy5kaWFsZWN0LmlubGluZS5fX2VzY2FwZV9fLmV4ZWMoIHRleHQgKSApXG4gICAgICAgICAgcmV0dXJuIFsgMiwgdGV4dC5jaGFyQXQoIDEgKSBdO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgLy8gTm90IGFuIGVzYWNwZVxuICAgICAgICAgIHJldHVybiBbIDEsIFwiXFxcXFwiIF07XG4gICAgICB9LFxuXG4gICAgICBcIiFbXCI6IGZ1bmN0aW9uIGltYWdlKCB0ZXh0ICkge1xuXG4gICAgICAgIC8vIFVubGlrZSBpbWFnZXMsIGFsdCB0ZXh0IGlzIHBsYWluIHRleHQgb25seS4gbm8gb3RoZXIgZWxlbWVudHMgYXJlXG4gICAgICAgIC8vIGFsbG93ZWQgaW4gdGhlcmVcblxuICAgICAgICAvLyAhW0FsdCB0ZXh0XSgvcGF0aC90by9pbWcuanBnIFwiT3B0aW9uYWwgdGl0bGVcIilcbiAgICAgICAgLy8gICAgICAxICAgICAgICAgIDIgICAgICAgICAgICAzICAgICAgIDQgICAgICAgICA8LS0tIGNhcHR1cmVzXG4gICAgICAgIHZhciBtID0gdGV4dC5tYXRjaCggL14hXFxbKC4qPylcXF1bIFxcdF0qXFwoWyBcXHRdKihbXlwiKV0qPykoPzpbIFxcdF0rKFtcIiddKSguKj8pXFwzKT9bIFxcdF0qXFwpLyApO1xuXG4gICAgICAgIGlmICggbSApIHtcbiAgICAgICAgICBpZiAoIG1bMl0gJiYgbVsyXVswXSA9PT0gXCI8XCIgJiYgbVsyXVttWzJdLmxlbmd0aC0xXSA9PT0gXCI+XCIgKVxuICAgICAgICAgICAgbVsyXSA9IG1bMl0uc3Vic3RyaW5nKCAxLCBtWzJdLmxlbmd0aCAtIDEgKTtcblxuICAgICAgICAgIG1bMl0gPSB0aGlzLmRpYWxlY3QuaW5saW5lLl9fY2FsbF9fLmNhbGwoIHRoaXMsIG1bMl0sIC9cXFxcLyApWzBdO1xuXG4gICAgICAgICAgdmFyIGF0dHJzID0geyBhbHQ6IG1bMV0sIGhyZWY6IG1bMl0gfHwgXCJcIiB9O1xuICAgICAgICAgIGlmICggbVs0XSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgYXR0cnMudGl0bGUgPSBtWzRdO1xuXG4gICAgICAgICAgcmV0dXJuIFsgbVswXS5sZW5ndGgsIFsgXCJpbWdcIiwgYXR0cnMgXSBdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gIVtBbHQgdGV4dF1baWRdXG4gICAgICAgIG0gPSB0ZXh0Lm1hdGNoKCAvXiFcXFsoLio/KVxcXVsgXFx0XSpcXFsoLio/KVxcXS8gKTtcblxuICAgICAgICBpZiAoIG0gKSB7XG4gICAgICAgICAgLy8gV2UgY2FuJ3QgY2hlY2sgaWYgdGhlIHJlZmVyZW5jZSBpcyBrbm93biBoZXJlIGFzIGl0IGxpa2VseSB3b250IGJlXG4gICAgICAgICAgLy8gZm91bmQgdGlsbCBhZnRlci4gQ2hlY2sgaXQgaW4gbWQgdHJlZS0+aG10bCB0cmVlIGNvbnZlcnNpb25cbiAgICAgICAgICByZXR1cm4gWyBtWzBdLmxlbmd0aCwgWyBcImltZ19yZWZcIiwgeyBhbHQ6IG1bMV0sIHJlZjogbVsyXS50b0xvd2VyQ2FzZSgpLCBvcmlnaW5hbDogbVswXSB9IF0gXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEp1c3QgY29uc3VtZSB0aGUgJyFbJ1xuICAgICAgICByZXR1cm4gWyAyLCBcIiFbXCIgXTtcbiAgICAgIH0sXG5cbiAgICAgIFwiW1wiOiBmdW5jdGlvbiBsaW5rKCB0ZXh0ICkge1xuXG4gICAgICAgIHZhciBvcmlnID0gU3RyaW5nKHRleHQpO1xuICAgICAgICAvLyBJbmxpbmUgY29udGVudCBpcyBwb3NzaWJsZSBpbnNpZGUgYGxpbmsgdGV4dGBcbiAgICAgICAgdmFyIHJlcyA9IGlubGluZV91bnRpbF9jaGFyLmNhbGwoIHRoaXMsIHRleHQuc3Vic3RyKDEpLCBcIl1cIiApO1xuXG4gICAgICAgIC8vIE5vIGNsb3NpbmcgJ10nIGZvdW5kLiBKdXN0IGNvbnN1bWUgdGhlIFtcbiAgICAgICAgaWYgKCAhcmVzIClcbiAgICAgICAgICByZXR1cm4gWyAxLCBcIltcIiBdO1xuXG4gICAgICAgIHZhciBjb25zdW1lZCA9IDEgKyByZXNbIDAgXSxcbiAgICAgICAgICAgIGNoaWxkcmVuID0gcmVzWyAxIF0sXG4gICAgICAgICAgICBsaW5rLFxuICAgICAgICAgICAgYXR0cnM7XG5cbiAgICAgICAgLy8gQXQgdGhpcyBwb2ludCB0aGUgZmlyc3QgWy4uLl0gaGFzIGJlZW4gcGFyc2VkLiBTZWUgd2hhdCBmb2xsb3dzIHRvIGZpbmRcbiAgICAgICAgLy8gb3V0IHdoaWNoIGtpbmQgb2YgbGluayB3ZSBhcmUgKHJlZmVyZW5jZSBvciBkaXJlY3QgdXJsKVxuICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHIoIGNvbnN1bWVkICk7XG5cbiAgICAgICAgLy8gW2xpbmsgdGV4dF0oL3BhdGgvdG8vaW1nLmpwZyBcIk9wdGlvbmFsIHRpdGxlXCIpXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAxICAgICAgICAgICAgMiAgICAgICAzICAgICAgICAgPC0tLSBjYXB0dXJlc1xuICAgICAgICAvLyBUaGlzIHdpbGwgY2FwdHVyZSB1cCB0byB0aGUgbGFzdCBwYXJlbiBpbiB0aGUgYmxvY2suIFdlIHRoZW4gcHVsbFxuICAgICAgICAvLyBiYWNrIGJhc2VkIG9uIGlmIHRoZXJlIGEgbWF0Y2hpbmcgb25lcyBpbiB0aGUgdXJsXG4gICAgICAgIC8vICAgIChbaGVyZV0oL3VybC8odGVzdCkpXG4gICAgICAgIC8vIFRoZSBwYXJlbnMgaGF2ZSB0byBiZSBiYWxhbmNlZFxuICAgICAgICB2YXIgbSA9IHRleHQubWF0Y2goIC9eXFxzKlxcKFsgXFx0XSooW15cIiddKikoPzpbIFxcdF0rKFtcIiddKSguKj8pXFwyKT9bIFxcdF0qXFwpLyApO1xuICAgICAgICBpZiAoIG0gKSB7XG4gICAgICAgICAgdmFyIHVybCA9IG1bMV07XG4gICAgICAgICAgY29uc3VtZWQgKz0gbVswXS5sZW5ndGg7XG5cbiAgICAgICAgICBpZiAoIHVybCAmJiB1cmxbMF0gPT09IFwiPFwiICYmIHVybFt1cmwubGVuZ3RoLTFdID09PSBcIj5cIiApXG4gICAgICAgICAgICB1cmwgPSB1cmwuc3Vic3RyaW5nKCAxLCB1cmwubGVuZ3RoIC0gMSApO1xuXG4gICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSB0aXRsZSB3ZSBkb24ndCBoYXZlIHRvIHdvcnJ5IGFib3V0IHBhcmVucyBpbiB0aGUgdXJsXG4gICAgICAgICAgaWYgKCAhbVszXSApIHtcbiAgICAgICAgICAgIHZhciBvcGVuX3BhcmVucyA9IDE7IC8vIE9uZSBvcGVuIHRoYXQgaXNuJ3QgaW4gdGhlIGNhcHR1cmVcbiAgICAgICAgICAgIGZvciAoIHZhciBsZW4gPSAwOyBsZW4gPCB1cmwubGVuZ3RoOyBsZW4rKyApIHtcbiAgICAgICAgICAgICAgc3dpdGNoICggdXJsW2xlbl0gKSB7XG4gICAgICAgICAgICAgIGNhc2UgXCIoXCI6XG4gICAgICAgICAgICAgICAgb3Blbl9wYXJlbnMrKztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSBcIilcIjpcbiAgICAgICAgICAgICAgICBpZiAoIC0tb3Blbl9wYXJlbnMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN1bWVkIC09IHVybC5sZW5ndGggLSBsZW47XG4gICAgICAgICAgICAgICAgICB1cmwgPSB1cmwuc3Vic3RyaW5nKDAsIGxlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUHJvY2VzcyBlc2NhcGVzIG9ubHlcbiAgICAgICAgICB1cmwgPSB0aGlzLmRpYWxlY3QuaW5saW5lLl9fY2FsbF9fLmNhbGwoIHRoaXMsIHVybCwgL1xcXFwvIClbMF07XG5cbiAgICAgICAgICBhdHRycyA9IHsgaHJlZjogdXJsIHx8IFwiXCIgfTtcbiAgICAgICAgICBpZiAoIG1bM10gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIGF0dHJzLnRpdGxlID0gbVszXTtcblxuICAgICAgICAgIGxpbmsgPSBbIFwibGlua1wiLCBhdHRycyBdLmNvbmNhdCggY2hpbGRyZW4gKTtcbiAgICAgICAgICByZXR1cm4gWyBjb25zdW1lZCwgbGluayBdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gW0FsdCB0ZXh0XVtpZF1cbiAgICAgICAgLy8gW0FsdCB0ZXh0XSBbaWRdXG4gICAgICAgIG0gPSB0ZXh0Lm1hdGNoKCAvXlxccypcXFsoLio/KVxcXS8gKTtcblxuICAgICAgICBpZiAoIG0gKSB7XG5cbiAgICAgICAgICBjb25zdW1lZCArPSBtWyAwIF0ubGVuZ3RoO1xuXG4gICAgICAgICAgLy8gW2xpbmtzXVtdIHVzZXMgbGlua3MgYXMgaXRzIHJlZmVyZW5jZVxuICAgICAgICAgIGF0dHJzID0geyByZWY6ICggbVsgMSBdIHx8IFN0cmluZyhjaGlsZHJlbikgKS50b0xvd2VyQ2FzZSgpLCAgb3JpZ2luYWw6IG9yaWcuc3Vic3RyKCAwLCBjb25zdW1lZCApIH07XG5cbiAgICAgICAgICBsaW5rID0gWyBcImxpbmtfcmVmXCIsIGF0dHJzIF0uY29uY2F0KCBjaGlsZHJlbiApO1xuXG4gICAgICAgICAgLy8gV2UgY2FuJ3QgY2hlY2sgaWYgdGhlIHJlZmVyZW5jZSBpcyBrbm93biBoZXJlIGFzIGl0IGxpa2VseSB3b250IGJlXG4gICAgICAgICAgLy8gZm91bmQgdGlsbCBhZnRlci4gQ2hlY2sgaXQgaW4gbWQgdHJlZS0+aG10bCB0cmVlIGNvbnZlcnNpb24uXG4gICAgICAgICAgLy8gU3RvcmUgdGhlIG9yaWdpbmFsIHNvIHRoYXQgY29udmVyc2lvbiBjYW4gcmV2ZXJ0IGlmIHRoZSByZWYgaXNuJ3QgZm91bmQuXG4gICAgICAgICAgcmV0dXJuIFsgY29uc3VtZWQsIGxpbmsgXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFtpZF1cbiAgICAgICAgLy8gT25seSBpZiBpZCBpcyBwbGFpbiAobm8gZm9ybWF0dGluZy4pXG4gICAgICAgIGlmICggY2hpbGRyZW4ubGVuZ3RoID09PSAxICYmIHR5cGVvZiBjaGlsZHJlblswXSA9PT0gXCJzdHJpbmdcIiApIHtcblxuICAgICAgICAgIGF0dHJzID0geyByZWY6IGNoaWxkcmVuWzBdLnRvTG93ZXJDYXNlKCksICBvcmlnaW5hbDogb3JpZy5zdWJzdHIoIDAsIGNvbnN1bWVkICkgfTtcbiAgICAgICAgICBsaW5rID0gWyBcImxpbmtfcmVmXCIsIGF0dHJzLCBjaGlsZHJlblswXSBdO1xuICAgICAgICAgIHJldHVybiBbIGNvbnN1bWVkLCBsaW5rIF07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBKdXN0IGNvbnN1bWUgdGhlIFwiW1wiXG4gICAgICAgIHJldHVybiBbIDEsIFwiW1wiIF07XG4gICAgICB9LFxuXG5cbiAgICAgIFwiPFwiOiBmdW5jdGlvbiBhdXRvTGluayggdGV4dCApIHtcbiAgICAgICAgdmFyIG07XG5cbiAgICAgICAgaWYgKCAoIG0gPSB0ZXh0Lm1hdGNoKCAvXjwoPzooKGh0dHBzP3xmdHB8bWFpbHRvKTpbXj5dKyl8KC4qP0AuKj9cXC5bYS16QS1aXSspKT4vICkgKSAhPT0gbnVsbCApIHtcbiAgICAgICAgICBpZiAoIG1bM10gKVxuICAgICAgICAgICAgcmV0dXJuIFsgbVswXS5sZW5ndGgsIFsgXCJsaW5rXCIsIHsgaHJlZjogXCJtYWlsdG86XCIgKyBtWzNdIH0sIG1bM10gXSBdO1xuICAgICAgICAgIGVsc2UgaWYgKCBtWzJdID09PSBcIm1haWx0b1wiIClcbiAgICAgICAgICAgIHJldHVybiBbIG1bMF0ubGVuZ3RoLCBbIFwibGlua1wiLCB7IGhyZWY6IG1bMV0gfSwgbVsxXS5zdWJzdHIoXCJtYWlsdG86XCIubGVuZ3RoICkgXSBdO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBbIG1bMF0ubGVuZ3RoLCBbIFwibGlua1wiLCB7IGhyZWY6IG1bMV0gfSwgbVsxXSBdIF07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gWyAxLCBcIjxcIiBdO1xuICAgICAgfSxcblxuICAgICAgXCJgXCI6IGZ1bmN0aW9uIGlubGluZUNvZGUoIHRleHQgKSB7XG4gICAgICAgIC8vIElubGluZSBjb2RlIGJsb2NrLiBhcyBtYW55IGJhY2t0aWNrcyBhcyB5b3UgbGlrZSB0byBzdGFydCBpdFxuICAgICAgICAvLyBBbHdheXMgc2tpcCBvdmVyIHRoZSBvcGVuaW5nIHRpY2tzLlxuICAgICAgICB2YXIgbSA9IHRleHQubWF0Y2goIC8oYCspKChbXFxzXFxTXSo/KVxcMSkvICk7XG5cbiAgICAgICAgaWYgKCBtICYmIG1bMl0gKVxuICAgICAgICAgIHJldHVybiBbIG1bMV0ubGVuZ3RoICsgbVsyXS5sZW5ndGgsIFsgXCJpbmxpbmVjb2RlXCIsIG1bM10gXSBdO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBUT0RPOiBObyBtYXRjaGluZyBlbmQgY29kZSBmb3VuZCAtIHdhcm4hXG4gICAgICAgICAgcmV0dXJuIFsgMSwgXCJgXCIgXTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgXCIgIFxcblwiOiBmdW5jdGlvbiBsaW5lQnJlYWsoKSB7XG4gICAgICAgIHJldHVybiBbIDMsIFsgXCJsaW5lYnJlYWtcIiBdIF07XG4gICAgICB9XG5cbiAgICB9XG4gIH07XG5cbiAgLy8gTWV0YSBIZWxwZXIvZ2VuZXJhdG9yIG1ldGhvZCBmb3IgZW0gYW5kIHN0cm9uZyBoYW5kbGluZ1xuICBmdW5jdGlvbiBzdHJvbmdfZW0oIHRhZywgbWQgKSB7XG5cbiAgICB2YXIgc3RhdGVfc2xvdCA9IHRhZyArIFwiX3N0YXRlXCIsXG4gICAgICAgIG90aGVyX3Nsb3QgPSB0YWcgPT09IFwic3Ryb25nXCIgPyBcImVtX3N0YXRlXCIgOiBcInN0cm9uZ19zdGF0ZVwiO1xuXG4gICAgZnVuY3Rpb24gQ2xvc2VUYWcobGVuKSB7XG4gICAgICB0aGlzLmxlbl9hZnRlciA9IGxlbjtcbiAgICAgIHRoaXMubmFtZSA9IFwiY2xvc2VfXCIgKyBtZDtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKCB0ZXh0ICkge1xuXG4gICAgICBpZiAoIHRoaXNbc3RhdGVfc2xvdF1bMF0gPT09IG1kICkge1xuICAgICAgICAvLyBNb3N0IHJlY2VudCBlbSBpcyBvZiB0aGlzIHR5cGVcbiAgICAgICAgLy9EOnRoaXMuZGVidWcoXCJjbG9zaW5nXCIsIG1kKTtcbiAgICAgICAgdGhpc1tzdGF0ZV9zbG90XS5zaGlmdCgpO1xuXG4gICAgICAgIC8vIFwiQ29uc3VtZVwiIGV2ZXJ5dGhpbmcgdG8gZ28gYmFjayB0byB0aGUgcmVjcnVzaW9uIGluIHRoZSBlbHNlLWJsb2NrIGJlbG93XG4gICAgICAgIHJldHVyblsgdGV4dC5sZW5ndGgsIG5ldyBDbG9zZVRhZyh0ZXh0Lmxlbmd0aC1tZC5sZW5ndGgpIF07XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gU3RvcmUgYSBjbG9uZSBvZiB0aGUgZW0vc3Ryb25nIHN0YXRlc1xuICAgICAgICB2YXIgb3RoZXIgPSB0aGlzW290aGVyX3Nsb3RdLnNsaWNlKCksXG4gICAgICAgICAgICBzdGF0ZSA9IHRoaXNbc3RhdGVfc2xvdF0uc2xpY2UoKTtcblxuICAgICAgICB0aGlzW3N0YXRlX3Nsb3RdLnVuc2hpZnQobWQpO1xuXG4gICAgICAgIC8vRDp0aGlzLmRlYnVnX2luZGVudCArPSBcIiAgXCI7XG5cbiAgICAgICAgLy8gUmVjdXJzZVxuICAgICAgICB2YXIgcmVzID0gdGhpcy5wcm9jZXNzSW5saW5lKCB0ZXh0LnN1YnN0ciggbWQubGVuZ3RoICkgKTtcbiAgICAgICAgLy9EOnRoaXMuZGVidWdfaW5kZW50ID0gdGhpcy5kZWJ1Z19pbmRlbnQuc3Vic3RyKDIpO1xuXG4gICAgICAgIHZhciBsYXN0ID0gcmVzW3Jlcy5sZW5ndGggLSAxXTtcblxuICAgICAgICAvL0Q6dGhpcy5kZWJ1ZyhcInByb2Nlc3NJbmxpbmUgZnJvbVwiLCB0YWcgKyBcIjogXCIsIHVuZXZhbCggcmVzICkgKTtcblxuICAgICAgICB2YXIgY2hlY2sgPSB0aGlzW3N0YXRlX3Nsb3RdLnNoaWZ0KCk7XG4gICAgICAgIGlmICggbGFzdCBpbnN0YW5jZW9mIENsb3NlVGFnICkge1xuICAgICAgICAgIHJlcy5wb3AoKTtcbiAgICAgICAgICAvLyBXZSBtYXRjaGVkISBIdXp6YWguXG4gICAgICAgICAgdmFyIGNvbnN1bWVkID0gdGV4dC5sZW5ndGggLSBsYXN0Lmxlbl9hZnRlcjtcbiAgICAgICAgICByZXR1cm4gWyBjb25zdW1lZCwgWyB0YWcgXS5jb25jYXQocmVzKSBdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIFJlc3RvcmUgdGhlIHN0YXRlIG9mIHRoZSBvdGhlciBraW5kLiBXZSBtaWdodCBoYXZlIG1pc3Rha2VubHkgY2xvc2VkIGl0LlxuICAgICAgICAgIHRoaXNbb3RoZXJfc2xvdF0gPSBvdGhlcjtcbiAgICAgICAgICB0aGlzW3N0YXRlX3Nsb3RdID0gc3RhdGU7XG5cbiAgICAgICAgICAvLyBXZSBjYW4ndCByZXVzZSB0aGUgcHJvY2Vzc2VkIHJlc3VsdCBhcyBpdCBjb3VsZCBoYXZlIHdyb25nIHBhcnNpbmcgY29udGV4dHMgaW4gaXQuXG4gICAgICAgICAgcmV0dXJuIFsgbWQubGVuZ3RoLCBtZCBdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTsgLy8gRW5kIHJldHVybmVkIGZ1bmN0aW9uXG4gIH1cblxuICBHcnViZXIuaW5saW5lW1wiKipcIl0gPSBzdHJvbmdfZW0oXCJzdHJvbmdcIiwgXCIqKlwiKTtcbiAgR3J1YmVyLmlubGluZVtcIl9fXCJdID0gc3Ryb25nX2VtKFwic3Ryb25nXCIsIFwiX19cIik7XG4gIEdydWJlci5pbmxpbmVbXCIqXCJdICA9IHN0cm9uZ19lbShcImVtXCIsIFwiKlwiKTtcbiAgR3J1YmVyLmlubGluZVtcIl9cIl0gID0gc3Ryb25nX2VtKFwiZW1cIiwgXCJfXCIpO1xuXG4gIE1hcmtkb3duLmRpYWxlY3RzLkdydWJlciA9IEdydWJlcjtcbiAgTWFya2Rvd24uYnVpbGRCbG9ja09yZGVyICggTWFya2Rvd24uZGlhbGVjdHMuR3J1YmVyLmJsb2NrICk7XG4gIE1hcmtkb3duLmJ1aWxkSW5saW5lUGF0dGVybnMoIE1hcmtkb3duLmRpYWxlY3RzLkdydWJlci5pbmxpbmUgKTtcblxuXG5cbiAgdmFyIE1hcnVrdSA9IERpYWxlY3RIZWxwZXJzLnN1YmNsYXNzRGlhbGVjdCggR3J1YmVyICksXG4gICAgICBleHRyYWN0X2F0dHIgPSBNYXJrZG93bkhlbHBlcnMuZXh0cmFjdF9hdHRyLFxuICAgICAgZm9yRWFjaCA9IE1hcmtkb3duSGVscGVycy5mb3JFYWNoO1xuXG4gIE1hcnVrdS5wcm9jZXNzTWV0YUhhc2ggPSBmdW5jdGlvbiBwcm9jZXNzTWV0YUhhc2goIG1ldGFfc3RyaW5nICkge1xuICAgIHZhciBtZXRhID0gc3BsaXRfbWV0YV9oYXNoKCBtZXRhX3N0cmluZyApLFxuICAgICAgICBhdHRyID0ge307XG5cbiAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCBtZXRhLmxlbmd0aDsgKytpICkge1xuICAgICAgLy8gaWQ6ICNmb29cbiAgICAgIGlmICggL14jLy50ZXN0KCBtZXRhWyBpIF0gKSApXG4gICAgICAgIGF0dHIuaWQgPSBtZXRhWyBpIF0uc3Vic3RyaW5nKCAxICk7XG4gICAgICAvLyBjbGFzczogLmZvb1xuICAgICAgZWxzZSBpZiAoIC9eXFwuLy50ZXN0KCBtZXRhWyBpIF0gKSApIHtcbiAgICAgICAgLy8gaWYgY2xhc3MgYWxyZWFkeSBleGlzdHMsIGFwcGVuZCB0aGUgbmV3IG9uZVxuICAgICAgICBpZiAoIGF0dHJbXCJjbGFzc1wiXSApXG4gICAgICAgICAgYXR0cltcImNsYXNzXCJdID0gYXR0cltcImNsYXNzXCJdICsgbWV0YVsgaSBdLnJlcGxhY2UoIC8uLywgXCIgXCIgKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGF0dHJbXCJjbGFzc1wiXSA9IG1ldGFbIGkgXS5zdWJzdHJpbmcoIDEgKTtcbiAgICAgIH1cbiAgICAgIC8vIGF0dHJpYnV0ZTogZm9vPWJhclxuICAgICAgZWxzZSBpZiAoIC9cXD0vLnRlc3QoIG1ldGFbIGkgXSApICkge1xuICAgICAgICB2YXIgcyA9IG1ldGFbIGkgXS5zcGxpdCggL1xcPS8gKTtcbiAgICAgICAgYXR0clsgc1sgMCBdIF0gPSBzWyAxIF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGF0dHI7XG4gIH07XG5cbiAgZnVuY3Rpb24gc3BsaXRfbWV0YV9oYXNoKCBtZXRhX3N0cmluZyApIHtcbiAgICB2YXIgbWV0YSA9IG1ldGFfc3RyaW5nLnNwbGl0KCBcIlwiICksXG4gICAgICAgIHBhcnRzID0gWyBcIlwiIF0sXG4gICAgICAgIGluX3F1b3RlcyA9IGZhbHNlO1xuXG4gICAgd2hpbGUgKCBtZXRhLmxlbmd0aCApIHtcbiAgICAgIHZhciBsZXR0ZXIgPSBtZXRhLnNoaWZ0KCk7XG4gICAgICBzd2l0Y2ggKCBsZXR0ZXIgKSB7XG4gICAgICBjYXNlIFwiIFwiIDpcbiAgICAgICAgLy8gaWYgd2UncmUgaW4gYSBxdW90ZWQgc2VjdGlvbiwga2VlcCBpdFxuICAgICAgICBpZiAoIGluX3F1b3RlcyApXG4gICAgICAgICAgcGFydHNbIHBhcnRzLmxlbmd0aCAtIDEgXSArPSBsZXR0ZXI7XG4gICAgICAgIC8vIG90aGVyd2lzZSBtYWtlIGEgbmV3IHBhcnRcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHBhcnRzLnB1c2goIFwiXCIgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiJ1wiIDpcbiAgICAgIGNhc2UgJ1wiJyA6XG4gICAgICAgIC8vIHJldmVyc2UgdGhlIHF1b3RlcyBhbmQgbW92ZSBzdHJhaWdodCBvblxuICAgICAgICBpbl9xdW90ZXMgPSAhaW5fcXVvdGVzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJcXFxcXCIgOlxuICAgICAgICAvLyBzaGlmdCBvZmYgdGhlIG5leHQgbGV0dGVyIHRvIGJlIHVzZWQgc3RyYWlnaHQgYXdheS5cbiAgICAgICAgLy8gaXQgd2FzIGVzY2FwZWQgc28gd2UnbGwga2VlcCBpdCB3aGF0ZXZlciBpdCBpc1xuICAgICAgICBsZXR0ZXIgPSBtZXRhLnNoaWZ0KCk7XG4gICAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICAgIGRlZmF1bHQgOlxuICAgICAgICBwYXJ0c1sgcGFydHMubGVuZ3RoIC0gMSBdICs9IGxldHRlcjtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcnRzO1xuICB9XG5cbiAgTWFydWt1LmJsb2NrLmRvY3VtZW50X21ldGEgPSBmdW5jdGlvbiBkb2N1bWVudF9tZXRhKCBibG9jayApIHtcbiAgICAvLyB3ZSdyZSBvbmx5IGludGVyZXN0ZWQgaW4gdGhlIGZpcnN0IGJsb2NrXG4gICAgaWYgKCBibG9jay5saW5lTnVtYmVyID4gMSApXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuXG4gICAgLy8gZG9jdW1lbnRfbWV0YSBibG9ja3MgY29uc2lzdCBvZiBvbmUgb3IgbW9yZSBsaW5lcyBvZiBgS2V5OiBWYWx1ZVxcbmBcbiAgICBpZiAoICEgYmxvY2subWF0Y2goIC9eKD86XFx3KzouKlxcbikqXFx3KzouKiQvICkgKVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcblxuICAgIC8vIG1ha2UgYW4gYXR0cmlidXRlIG5vZGUgaWYgaXQgZG9lc24ndCBleGlzdFxuICAgIGlmICggIWV4dHJhY3RfYXR0ciggdGhpcy50cmVlICkgKVxuICAgICAgdGhpcy50cmVlLnNwbGljZSggMSwgMCwge30gKTtcblxuICAgIHZhciBwYWlycyA9IGJsb2NrLnNwbGl0KCAvXFxuLyApO1xuICAgIGZvciAoIHZhciBwIGluIHBhaXJzICkge1xuICAgICAgdmFyIG0gPSBwYWlyc1sgcCBdLm1hdGNoKCAvKFxcdyspOlxccyooLiopJC8gKSxcbiAgICAgICAgICBrZXkgPSBtWyAxIF0udG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICB2YWx1ZSA9IG1bIDIgXTtcblxuICAgICAgdGhpcy50cmVlWyAxIF1bIGtleSBdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgLy8gZG9jdW1lbnRfbWV0YSBwcm9kdWNlcyBubyBjb250ZW50IVxuICAgIHJldHVybiBbXTtcbiAgfTtcblxuICBNYXJ1a3UuYmxvY2suYmxvY2tfbWV0YSA9IGZ1bmN0aW9uIGJsb2NrX21ldGEoIGJsb2NrICkge1xuICAgIC8vIGNoZWNrIGlmIHRoZSBsYXN0IGxpbmUgb2YgdGhlIGJsb2NrIGlzIGFuIG1ldGEgaGFzaFxuICAgIHZhciBtID0gYmxvY2subWF0Y2goIC8oXnxcXG4pIHswLDN9XFx7OlxccyooKD86XFxcXFxcfXxbXlxcfV0pKilcXHMqXFx9JC8gKTtcbiAgICBpZiAoICFtIClcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgICAvLyBwcm9jZXNzIHRoZSBtZXRhIGhhc2hcbiAgICB2YXIgYXR0ciA9IHRoaXMuZGlhbGVjdC5wcm9jZXNzTWV0YUhhc2goIG1bIDIgXSApLFxuICAgICAgICBoYXNoO1xuXG4gICAgLy8gaWYgd2UgbWF0Y2hlZCBeIHRoZW4gd2UgbmVlZCB0byBhcHBseSBtZXRhIHRvIHRoZSBwcmV2aW91cyBibG9ja1xuICAgIGlmICggbVsgMSBdID09PSBcIlwiICkge1xuICAgICAgdmFyIG5vZGUgPSB0aGlzLnRyZWVbIHRoaXMudHJlZS5sZW5ndGggLSAxIF07XG4gICAgICBoYXNoID0gZXh0cmFjdF9hdHRyKCBub2RlICk7XG5cbiAgICAgIC8vIGlmIHRoZSBub2RlIGlzIGEgc3RyaW5nIChyYXRoZXIgdGhhbiBKc29uTUwpLCBiYWlsXG4gICAgICBpZiAoIHR5cGVvZiBub2RlID09PSBcInN0cmluZ1wiIClcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcblxuICAgICAgLy8gY3JlYXRlIHRoZSBhdHRyaWJ1dGUgaGFzaCBpZiBpdCBkb2Vzbid0IGV4aXN0XG4gICAgICBpZiAoICFoYXNoICkge1xuICAgICAgICBoYXNoID0ge307XG4gICAgICAgIG5vZGUuc3BsaWNlKCAxLCAwLCBoYXNoICk7XG4gICAgICB9XG5cbiAgICAgIC8vIGFkZCB0aGUgYXR0cmlidXRlcyBpblxuICAgICAgZm9yICggdmFyIGEgaW4gYXR0ciApXG4gICAgICAgIGhhc2hbIGEgXSA9IGF0dHJbIGEgXTtcblxuICAgICAgLy8gcmV0dXJuIG5vdGhpbmcgc28gdGhlIG1ldGEgaGFzaCBpcyByZW1vdmVkXG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLy8gcHVsbCB0aGUgbWV0YSBoYXNoIG9mZiB0aGUgYmxvY2sgYW5kIHByb2Nlc3Mgd2hhdCdzIGxlZnRcbiAgICB2YXIgYiA9IGJsb2NrLnJlcGxhY2UoIC9cXG4uKiQvLCBcIlwiICksXG4gICAgICAgIHJlc3VsdCA9IHRoaXMucHJvY2Vzc0Jsb2NrKCBiLCBbXSApO1xuXG4gICAgLy8gZ2V0IG9yIG1ha2UgdGhlIGF0dHJpYnV0ZXMgaGFzaFxuICAgIGhhc2ggPSBleHRyYWN0X2F0dHIoIHJlc3VsdFsgMCBdICk7XG4gICAgaWYgKCAhaGFzaCApIHtcbiAgICAgIGhhc2ggPSB7fTtcbiAgICAgIHJlc3VsdFsgMCBdLnNwbGljZSggMSwgMCwgaGFzaCApO1xuICAgIH1cblxuICAgIC8vIGF0dGFjaCB0aGUgYXR0cmlidXRlcyB0byB0aGUgYmxvY2tcbiAgICBmb3IgKCB2YXIgYSBpbiBhdHRyIClcbiAgICAgIGhhc2hbIGEgXSA9IGF0dHJbIGEgXTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgTWFydWt1LmJsb2NrLmRlZmluaXRpb25fbGlzdCA9IGZ1bmN0aW9uIGRlZmluaXRpb25fbGlzdCggYmxvY2ssIG5leHQgKSB7XG4gICAgLy8gb25lIG9yIG1vcmUgdGVybXMgZm9sbG93ZWQgYnkgb25lIG9yIG1vcmUgZGVmaW5pdGlvbnMsIGluIGEgc2luZ2xlIGJsb2NrXG4gICAgdmFyIHRpZ2h0ID0gL14oKD86W15cXHM6XS4qXFxuKSspOlxccysoW1xcc1xcU10rKSQvLFxuICAgICAgICBsaXN0ID0gWyBcImRsXCIgXSxcbiAgICAgICAgaSwgbTtcblxuICAgIC8vIHNlZSBpZiB3ZSdyZSBkZWFsaW5nIHdpdGggYSB0aWdodCBvciBsb29zZSBibG9ja1xuICAgIGlmICggKCBtID0gYmxvY2subWF0Y2goIHRpZ2h0ICkgKSApIHtcbiAgICAgIC8vIHB1bGwgc3Vic2VxdWVudCB0aWdodCBETCBibG9ja3Mgb3V0IG9mIGBuZXh0YFxuICAgICAgdmFyIGJsb2NrcyA9IFsgYmxvY2sgXTtcbiAgICAgIHdoaWxlICggbmV4dC5sZW5ndGggJiYgdGlnaHQuZXhlYyggbmV4dFsgMCBdICkgKVxuICAgICAgICBibG9ja3MucHVzaCggbmV4dC5zaGlmdCgpICk7XG5cbiAgICAgIGZvciAoIHZhciBiID0gMDsgYiA8IGJsb2Nrcy5sZW5ndGg7ICsrYiApIHtcbiAgICAgICAgdmFyIG0gPSBibG9ja3NbIGIgXS5tYXRjaCggdGlnaHQgKSxcbiAgICAgICAgICAgIHRlcm1zID0gbVsgMSBdLnJlcGxhY2UoIC9cXG4kLywgXCJcIiApLnNwbGl0KCAvXFxuLyApLFxuICAgICAgICAgICAgZGVmbnMgPSBtWyAyIF0uc3BsaXQoIC9cXG46XFxzKy8gKTtcblxuICAgICAgICAvLyBwcmludCggdW5ldmFsKCBtICkgKTtcblxuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IHRlcm1zLmxlbmd0aDsgKytpIClcbiAgICAgICAgICBsaXN0LnB1c2goIFsgXCJkdFwiLCB0ZXJtc1sgaSBdIF0gKTtcblxuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGRlZm5zLmxlbmd0aDsgKytpICkge1xuICAgICAgICAgIC8vIHJ1biBpbmxpbmUgcHJvY2Vzc2luZyBvdmVyIHRoZSBkZWZpbml0aW9uXG4gICAgICAgICAgbGlzdC5wdXNoKCBbIFwiZGRcIiBdLmNvbmNhdCggdGhpcy5wcm9jZXNzSW5saW5lKCBkZWZuc1sgaSBdLnJlcGxhY2UoIC8oXFxuKVxccysvLCBcIiQxXCIgKSApICkgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIFsgbGlzdCBdO1xuICB9O1xuXG4gIC8vIHNwbGl0cyBvbiB1bmVzY2FwZWQgaW5zdGFuY2VzIG9mIEBjaC4gSWYgQGNoIGlzIG5vdCBhIGNoYXJhY3RlciB0aGUgcmVzdWx0XG4gIC8vIGNhbiBiZSB1bnByZWRpY3RhYmxlXG5cbiAgTWFydWt1LmJsb2NrLnRhYmxlID0gZnVuY3Rpb24gdGFibGUgKCBibG9jayApIHtcblxuICAgIHZhciBfc3BsaXRfb25fdW5lc2NhcGVkID0gZnVuY3Rpb24oIHMsIGNoICkge1xuICAgICAgY2ggPSBjaCB8fCAnXFxcXHMnO1xuICAgICAgaWYgKCBjaC5tYXRjaCgvXltcXFxcfFxcW1xcXXt9PyouK14kXSQvKSApXG4gICAgICAgIGNoID0gJ1xcXFwnICsgY2g7XG4gICAgICB2YXIgcmVzID0gWyBdLFxuICAgICAgICAgIHIgPSBuZXcgUmVnRXhwKCdeKCg/OlxcXFxcXFxcLnxbXlxcXFxcXFxcJyArIGNoICsgJ10pKiknICsgY2ggKyAnKC4qKScpLFxuICAgICAgICAgIG07XG4gICAgICB3aGlsZSAoICggbSA9IHMubWF0Y2goIHIgKSApICkge1xuICAgICAgICByZXMucHVzaCggbVsxXSApO1xuICAgICAgICBzID0gbVsyXTtcbiAgICAgIH1cbiAgICAgIHJlcy5wdXNoKHMpO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9O1xuXG4gICAgdmFyIGxlYWRpbmdfcGlwZSA9IC9eIHswLDN9XFx8KC4rKVxcbiB7MCwzfVxcfFxccyooW1xcLTpdK1tcXC18IDpdKilcXG4oKD86XFxzKlxcfC4qKD86XFxufCQpKSopKD89XFxufCQpLyxcbiAgICAgICAgLy8gZmluZCBhdCBsZWFzdCBhbiB1bmVzY2FwZWQgcGlwZSBpbiBlYWNoIGxpbmVcbiAgICAgICAgbm9fbGVhZGluZ19waXBlID0gL14gezAsM30oXFxTKD86XFxcXC58W15cXFxcfF0pKlxcfC4qKVxcbiB7MCwzfShbXFwtOl0rXFxzKlxcfFtcXC18IDpdKilcXG4oKD86KD86XFxcXC58W15cXFxcfF0pKlxcfC4qKD86XFxufCQpKSopKD89XFxufCQpLyxcbiAgICAgICAgaSxcbiAgICAgICAgbTtcbiAgICBpZiAoICggbSA9IGJsb2NrLm1hdGNoKCBsZWFkaW5nX3BpcGUgKSApICkge1xuICAgICAgLy8gcmVtb3ZlIGxlYWRpbmcgcGlwZXMgaW4gY29udGVudHNcbiAgICAgIC8vIChoZWFkZXIgYW5kIGhvcml6b250YWwgcnVsZSBhbHJlYWR5IGhhdmUgdGhlIGxlYWRpbmcgcGlwZSBsZWZ0IG91dClcbiAgICAgIG1bM10gPSBtWzNdLnJlcGxhY2UoL15cXHMqXFx8L2dtLCAnJyk7XG4gICAgfSBlbHNlIGlmICggISAoIG0gPSBibG9jay5tYXRjaCggbm9fbGVhZGluZ19waXBlICkgKSApIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdmFyIHRhYmxlID0gWyBcInRhYmxlXCIsIFsgXCJ0aGVhZFwiLCBbIFwidHJcIiBdIF0sIFsgXCJ0Ym9keVwiIF0gXTtcblxuICAgIC8vIHJlbW92ZSB0cmFpbGluZyBwaXBlcywgdGhlbiBzcGxpdCBvbiBwaXBlc1xuICAgIC8vIChubyBlc2NhcGVkIHBpcGVzIGFyZSBhbGxvd2VkIGluIGhvcml6b250YWwgcnVsZSlcbiAgICBtWzJdID0gbVsyXS5yZXBsYWNlKC9cXHxcXHMqJC8sICcnKS5zcGxpdCgnfCcpO1xuXG4gICAgLy8gcHJvY2VzcyBhbGlnbm1lbnRcbiAgICB2YXIgaHRtbF9hdHRycyA9IFsgXTtcbiAgICBmb3JFYWNoIChtWzJdLCBmdW5jdGlvbiAocykge1xuICAgICAgaWYgKHMubWF0Y2goL15cXHMqLSs6XFxzKiQvKSlcbiAgICAgICAgaHRtbF9hdHRycy5wdXNoKHthbGlnbjogXCJyaWdodFwifSk7XG4gICAgICBlbHNlIGlmIChzLm1hdGNoKC9eXFxzKjotK1xccyokLykpXG4gICAgICAgIGh0bWxfYXR0cnMucHVzaCh7YWxpZ246IFwibGVmdFwifSk7XG4gICAgICBlbHNlIGlmIChzLm1hdGNoKC9eXFxzKjotKzpcXHMqJC8pKVxuICAgICAgICBodG1sX2F0dHJzLnB1c2goe2FsaWduOiBcImNlbnRlclwifSk7XG4gICAgICBlbHNlXG4gICAgICAgIGh0bWxfYXR0cnMucHVzaCh7fSk7XG4gICAgfSk7XG5cbiAgICAvLyBub3cgZm9yIHRoZSBoZWFkZXIsIGF2b2lkIGVzY2FwZWQgcGlwZXNcbiAgICBtWzFdID0gX3NwbGl0X29uX3VuZXNjYXBlZChtWzFdLnJlcGxhY2UoL1xcfFxccyokLywgJycpLCAnfCcpO1xuICAgIGZvciAoaSA9IDA7IGkgPCBtWzFdLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0YWJsZVsxXVsxXS5wdXNoKFsndGgnLCBodG1sX2F0dHJzW2ldIHx8IHt9XS5jb25jYXQoXG4gICAgICAgIHRoaXMucHJvY2Vzc0lubGluZShtWzFdW2ldLnRyaW0oKSkpKTtcbiAgICB9XG5cbiAgICAvLyBub3cgZm9yIGJvZHkgY29udGVudHNcbiAgICBmb3JFYWNoIChtWzNdLnJlcGxhY2UoL1xcfFxccyokL21nLCAnJykuc3BsaXQoJ1xcbicpLCBmdW5jdGlvbiAocm93KSB7XG4gICAgICB2YXIgaHRtbF9yb3cgPSBbJ3RyJ107XG4gICAgICByb3cgPSBfc3BsaXRfb25fdW5lc2NhcGVkKHJvdywgJ3wnKTtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCByb3cubGVuZ3RoOyBpKyspXG4gICAgICAgIGh0bWxfcm93LnB1c2goWyd0ZCcsIGh0bWxfYXR0cnNbaV0gfHwge31dLmNvbmNhdCh0aGlzLnByb2Nlc3NJbmxpbmUocm93W2ldLnRyaW0oKSkpKTtcbiAgICAgIHRhYmxlWzJdLnB1c2goaHRtbF9yb3cpO1xuICAgIH0sIHRoaXMpO1xuXG4gICAgcmV0dXJuIFt0YWJsZV07XG4gIH07XG5cbiAgTWFydWt1LmlubGluZVsgXCJ7OlwiIF0gPSBmdW5jdGlvbiBpbmxpbmVfbWV0YSggdGV4dCwgbWF0Y2hlcywgb3V0ICkge1xuICAgIGlmICggIW91dC5sZW5ndGggKVxuICAgICAgcmV0dXJuIFsgMiwgXCJ7OlwiIF07XG5cbiAgICAvLyBnZXQgdGhlIHByZWNlZWRpbmcgZWxlbWVudFxuICAgIHZhciBiZWZvcmUgPSBvdXRbIG91dC5sZW5ndGggLSAxIF07XG5cbiAgICBpZiAoIHR5cGVvZiBiZWZvcmUgPT09IFwic3RyaW5nXCIgKVxuICAgICAgcmV0dXJuIFsgMiwgXCJ7OlwiIF07XG5cbiAgICAvLyBtYXRjaCBhIG1ldGEgaGFzaFxuICAgIHZhciBtID0gdGV4dC5tYXRjaCggL15cXHs6XFxzKigoPzpcXFxcXFx9fFteXFx9XSkqKVxccypcXH0vICk7XG5cbiAgICAvLyBubyBtYXRjaCwgZmFsc2UgYWxhcm1cbiAgICBpZiAoICFtIClcbiAgICAgIHJldHVybiBbIDIsIFwiezpcIiBdO1xuXG4gICAgLy8gYXR0YWNoIHRoZSBhdHRyaWJ1dGVzIHRvIHRoZSBwcmVjZWVkaW5nIGVsZW1lbnRcbiAgICB2YXIgbWV0YSA9IHRoaXMuZGlhbGVjdC5wcm9jZXNzTWV0YUhhc2goIG1bIDEgXSApLFxuICAgICAgICBhdHRyID0gZXh0cmFjdF9hdHRyKCBiZWZvcmUgKTtcblxuICAgIGlmICggIWF0dHIgKSB7XG4gICAgICBhdHRyID0ge307XG4gICAgICBiZWZvcmUuc3BsaWNlKCAxLCAwLCBhdHRyICk7XG4gICAgfVxuXG4gICAgZm9yICggdmFyIGsgaW4gbWV0YSApXG4gICAgICBhdHRyWyBrIF0gPSBtZXRhWyBrIF07XG5cbiAgICAvLyBjdXQgb3V0IHRoZSBzdHJpbmcgYW5kIHJlcGxhY2UgaXQgd2l0aCBub3RoaW5nXG4gICAgcmV0dXJuIFsgbVsgMCBdLmxlbmd0aCwgXCJcIiBdO1xuICB9O1xuXG5cbiAgTWFya2Rvd24uZGlhbGVjdHMuTWFydWt1ID0gTWFydWt1O1xuICBNYXJrZG93bi5kaWFsZWN0cy5NYXJ1a3UuaW5saW5lLl9fZXNjYXBlX18gPSAvXlxcXFxbXFxcXGBcXCpfe31cXFtcXF0oKSNcXCsuIVxcLXw6XS87XG4gIE1hcmtkb3duLmJ1aWxkQmxvY2tPcmRlciAoIE1hcmtkb3duLmRpYWxlY3RzLk1hcnVrdS5ibG9jayApO1xuICBNYXJrZG93bi5idWlsZElubGluZVBhdHRlcm5zKCBNYXJrZG93bi5kaWFsZWN0cy5NYXJ1a3UuaW5saW5lICk7XG5cblxuLy8gSW5jbHVkZSBhbGwgb3VyIGRlcG5kZW5jaWVzIGFuZDtcbiAgZXhwb3NlLk1hcmtkb3duID0gTWFya2Rvd247XG4gIGV4cG9zZS5wYXJzZSA9IE1hcmtkb3duLnBhcnNlO1xuICBleHBvc2UudG9IVE1MID0gTWFya2Rvd24udG9IVE1MO1xuICBleHBvc2UudG9IVE1MVHJlZSA9IE1hcmtkb3duLnRvSFRNTFRyZWU7XG4gIGV4cG9zZS5yZW5kZXJKc29uTUwgPSBNYXJrZG93bi5yZW5kZXJKc29uTUw7XG5cbn0pKGZ1bmN0aW9uKCkge1xuICB3aW5kb3cubWFya2Rvd24gPSB7fTtcbiAgcmV0dXJuIHdpbmRvdy5tYXJrZG93bjtcbn0oKSk7XG5leHBvcnQge21hcmtkb3dufVxuXG4iLCJpbXBvcnQge1ZhbGlkYXRvcixNb2RhbCxOb3RpZmljYXRpb25DLGFqYXh9IGZyb20gJy4vdXRpbGl0aWVzJ1xuXG5nb29nbGUuY2hhcnRzLmxvYWQoJ2N1cnJlbnQnLCB7J3BhY2thZ2VzJzpbJ2NvcmVjaGFydCddfSlcblxudmFyIFN0b2RheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zdGF0aXN0aWNUb2RheScpLFxuXHRTUmFuZ2VEYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnN0YXRpc3RpY1JhbmdlRGF0ZXMnKSxcblx0c3RhdGlzdGljc1dpbmRvdyA9IG5ldyBNb2RhbCgnc3RhdGlzdGljc1dpbmRvdycsJy5jb250ZW50V2lkdGgnKSxcblx0YnVpbGRTYXRpc3RpYyA9IG5ldyBCdWlsZFN0YXRpc3RpYygpLFxuXHRub3RpZmljYXRpb24gPSBuZXcgTm90aWZpY2F0aW9uQygpXG5cbnZhciBzdGF0aXN0aWNzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc3RhdGlzdGljJykpLFxuXHRjb250YWluZXJPcHRpb25zU3RhdGlzdGljID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRhaW5lck9wdGlvbnNTdGF0aXN0aWMnKVxuXG5zdGF0aXN0aWNzLmZvckVhY2goc3RhdGlzdGljID0+IHtcblx0c3RhdGlzdGljLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2hvd09wdGlvblN0YXRpc3RpYylcbn0pXG5cbmZ1bmN0aW9uIHNob3dPcHRpb25TdGF0aXN0aWMgKCkge1xuXHRjb250YWluZXJPcHRpb25zU3RhdGlzdGljLmlubmVySFRNTCA9ICcnXG5cblx0dmFyIHRPcHRpb25zU3RhdGlzdGljID0gdGhpcy5xdWVyeVNlbGVjdG9yKCcub3B0aW9uc1N0YXRpc3RpYycpLFxuXHRcdGNPcHRpb25zU3RhdGlzdGljID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0T3B0aW9uc1N0YXRpc3RpYy5jb250ZW50LCB0cnVlKVxuXG5cdHZhciBidG5DbG9zZSA9IGNPcHRpb25zU3RhdGlzdGljLnF1ZXJ5U2VsZWN0b3IoJyNjbG9zZU9wdGlvbnNTdGF0aXN0aWMnKVxuXG5cdGJ0bkNsb3NlLm9uY2xpY2sgPSBmdW5jdGlvbiAoZSl7XG5cdFx0dmFyIHBhcmVudCA9IGUudGFyZ2V0LnBhcmVudE5vZGVcblx0XHRwYXJlbnQucmVtb3ZlKClcblx0fVxuXG5cdGNvbnRhaW5lck9wdGlvbnNTdGF0aXN0aWMuYXBwZW5kQ2hpbGQoY09wdGlvbnNTdGF0aXN0aWMpXG5cdEZTdGF0aXN0aWNzW3RoaXMuZGF0YXNldC5zdGF0aXN0aWNdKClcbn1cblxuZnVuY3Rpb24gZ2V0RGltZW5zaW9uc0NoYXJ0ICgpe1xuXHR2YXIgd2lkdGggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYm9keU1vZGFsJykub2Zmc2V0V2lkdGgsXG5cdFx0aGVpZ2h0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJvZHlNb2RhbCcpLm9mZnNldFdpZHRoXG5cdGlmIChoZWlnaHQgPiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYm9keU1vZGFsJykub2Zmc2V0SGVpZ2h0KSBoZWlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYm9keU1vZGFsJykub2Zmc2V0SGVpZ2h0XG5cdHJldHVybiB7d2lkdGg6IHdpZHRoLCBoZWlnaHQ6aGVpZ2h0fVxufVxuXG5mdW5jdGlvbiBCdWlsZFN0YXRpc3RpYyAoKXtcblx0dGhpcy50b2RheSA9IGZ1bmN0aW9uIChoaXN0b3JpZXMpe1xuXHRcdHZhciBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJylcblxuXHRcdGZvciAodmFyIGhpc3Rvcnkgb2YgaGlzdG9yaWVzKXtcblx0XHRcdHZhciBjbG9uZSA9IFN0b2RheS5xdWVyeVNlbGVjdG9yKCcucmVzdWx0U3RhdGlzdGljcycpLFxuXHRcdFx0XHR0ZW1wbGF0ZSA9IGRvY3VtZW50LmltcG9ydE5vZGUoY2xvbmUuY29udGVudCwgdHJ1ZSksXG5cdFx0XHRcdGRhdGVBY3Rpdml0eSA9IG5ldyBEYXRlKGhpc3RvcnkuYWN0aXZpdHkuaG91ciksXG5cdFx0XHRcdGRhdGVIaXN0b3J5ID0gbmV3IERhdGUoaGlzdG9yeS50aW1lKVxuXG5cdFx0XHRkYXRlSGlzdG9yeS5zZXREYXRlKGRhdGVBY3Rpdml0eS5nZXREYXRlKCkpXG5cdFx0XHRkYXRlSGlzdG9yeS5zZXRGdWxsWWVhcihkYXRlQWN0aXZpdHkuZ2V0RnVsbFllYXIoKSlcblx0XHRcdGRhdGVIaXN0b3J5LnNldE1vbnRoKGRhdGVBY3Rpdml0eS5nZXRNb250aCgpKVxuXG5cdFx0XHR2YXIgdGltZVRleHQgPSBkYXRlSGlzdG9yeSA+IGRhdGVBY3Rpdml0eSA/ICdEZXNwdWVzJyA6ICdBIHRpZW1wbydcblxuXHRcdFx0dGVtcGxhdGUucXVlcnlTZWxlY3RvcignLm5hbWVBY3Rpdml0eScpLmlubmVySFRNTCA9IGhpc3RvcnkuYWN0aXZpdHkudGV4dFxuXHRcdFx0dGVtcGxhdGUucXVlcnlTZWxlY3RvcignLnRpbWVBY3Rpdml0eScpLmlubmVySFRNTCA9IGRhdGVBY3Rpdml0eS50b0hvdXIxMigpXG5cdFx0XHR0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCcudGltZUhpc3RvcnknKS5pbm5lckhUTUwgPSBkYXRlSGlzdG9yeS50b0hvdXIxMigpXG5cdFx0XHR0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCcudGltZVRleHQnKS5pbm5lckhUTUwgPSB0aW1lVGV4dFxuXG5cdFx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQodGVtcGxhdGUpXG5cdFx0fVxuXHRcdHJldHVybiBjb250YWluZXJcblx0fVxuXHR0aGlzLnJhbmdlRGF0ZSA9IGZ1bmN0aW9uICgpe1xuXHRcdHZhciBjbG9uZSA9IFNSYW5nZURhdGUucXVlcnlTZWxlY3RvcignLnJlc3VsdFN0YXRpc3RpY3MnKSxcblx0XHRcdHRlbXBsYXRlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZShjbG9uZS5jb250ZW50LCB0cnVlKVxuXHRcdHJldHVybiB0ZW1wbGF0ZVxuXHR9XG5cdHRoaXMuZXZvbHV0aW9uID0gZnVuY3Rpb24gKCl7XG5cdFx0dmFyIGNsb25lID0gU1JhbmdlRGF0ZS5xdWVyeVNlbGVjdG9yKCcucmVzdWx0U3RhdGlzdGljcycpLFxuXHRcdFx0dGVtcGxhdGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKGNsb25lLmNvbnRlbnQsIHRydWUpXG5cdFx0cmV0dXJuIHRlbXBsYXRlXG5cdH1cbn1cblxudmFyIEZTdGF0aXN0aWNzID0ge1xuXHR0b2RheSA6IGZ1bmN0aW9uICgpe1xuXHRcdHZhciBmb3JtU1RvZGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RvZGF5Jylcblx0XHRmb3JtU1RvZGF5Lm9uc3VibWl0ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRhamF4KHtcblx0XHRcdFx0dHlwZSA6ICdQT1NUJyxcblx0XHRcdFx0VVJMIDogJy9zdGF0aXN0aWNzL3RvZGF5Jyxcblx0XHRcdFx0YXN5bmMgOiB0cnVlLFxuXHRcdFx0XHRjb250ZW50VHlwZSA6ICdhcHBsaWNhdGlvbi9qc29uJyxcblx0XHRcdFx0b25TdWNjZXNzIDogcmVzcG9uc2UgPT4ge1xuXHRcdFx0XHRcdGlmKCFyZXNwb25zZS5oaXN0b3JpZXMubGVuZ3RoKSByZXR1cm4gbm90aWZpY2F0aW9uLnNob3coe21zZzogJyoqTm8qKiBzZSBoYW4gKipjb21wbGV0YWRvKiogYWN0aXZpZGFkZXMgKipob3kqKicsIHR5cGU6IDJ9KVxuXG5cdFx0XHRcdFx0dmFyIG5vZGUgPSBidWlsZFNhdGlzdGljLnRvZGF5KHJlc3BvbnNlLmhpc3RvcmllcylcblxuXHRcdFx0XHRcdHN0YXRpc3RpY3NXaW5kb3dcblx0XHRcdFx0XHQuc2V0VGl0bGUoJ1Jlc3VtZW4gZGUgQWN0aXZpZGFkIEFjdHVhbCcpXG5cdFx0XHRcdFx0LmFkZENvbnRlbnQobm9kZSlcblx0XHRcdFx0XHQuc2hvdygpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRhdGEgOiBKU09OLnN0cmluZ2lmeSh7Y2hpbGRyZW46IGZvcm1TVG9kYXkuY2hpbGRyZW4udmFsdWUgfSlcblx0XHRcdH0pXG5cdFx0fVxuXHR9LFxuXHRyYW5nZURhdGUgOiBmdW5jdGlvbiAoKXtcblx0XHR2YXIgZm9ybVNSYW5nZURhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmFuZ2VEYXRlJyksXG5cdFx0XHR2YWxpZGF0b3IgPSBuZXcgVmFsaWRhdG9yKGZvcm1TUmFuZ2VEYXRlKVxuXG5cdFx0dmFsaWRhdG9yLmNvbmZpZyhbXG5cdFx0XHR7Zm4gOiAnbWF5b3InLCBwYXJhbXMgOiAnZGF0ZUVuZCBkYXRlSW5pdCcsIG1lc3NhZ2VFcnJvciA6ICdMYSAqKkZlY2hhIEluaWNpYWwqKiBkZWJlIHNlciAqKm1heW9yKiogYSBsYSAqKkZlY2hhIEZpbmFsKionfVxuXHRcdF0pXG5cblx0XHRmb3JtU1JhbmdlRGF0ZS5vbnN1Ym1pdCA9IGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0dmFyIGZvcm1WYWxpZGF0aW9uID0gdmFsaWRhdG9yLmlzVmFsaWQoKVxuXHRcdFx0aWYoZm9ybVZhbGlkYXRpb24uaXNWYWxpZCl7XG5cdFx0XHRcdGFqYXgoe1xuXHRcdFx0XHRcdHR5cGUgOiAnUE9TVCcsXG5cdFx0XHRcdFx0VVJMIDogJy9zdGF0aXN0aWNzL3JhbmdlRGF0ZScsXG5cdFx0XHRcdFx0YXN5bmMgOiB0cnVlLFxuXHRcdFx0XHRcdGNvbnRlbnRUeXBlIDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuXHRcdFx0XHRcdG9uU3VjY2VzcyA6IHJlc3BvbnNlID0+IHtcblx0XHRcdFx0XHRcdGlmKCFyZXNwb25zZS5sZW5ndGgpIHJldHVybiBub3RpZmljYXRpb24uc2hvdyh7bXNnOiAnKipObyoqIGhheSAqKmRhdG9zKiogcGFyYSBnZW5lcmFyIGxhICoqZXN0YWRpc3RpY2EqKi4nLCB0eXBlOiAyfSlcblxuXHRcdFx0XHRcdFx0dmFyIG5vZGUgPSBidWlsZFNhdGlzdGljLnJhbmdlRGF0ZSgpLFxuXHRcdFx0XHRcdFx0XHRyb3dzID0gW11cblxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgcmVjb3JkIG9mIHJlc3BvbnNlKXtcblx0XHRcdFx0XHRcdFx0dmFyIGRhdGFSZWNvcmQgPSBbXVxuXHRcdFx0XHRcdFx0XHRkYXRhUmVjb3JkLnB1c2gocmVjb3JkLl9pZC5kYXkgKyAnLycgKyByZWNvcmQuX2lkLm1vbnRoICsgJy8nICsgcmVjb3JkLl9pZC55ZWFyKVxuXHRcdFx0XHRcdFx0XHRkYXRhUmVjb3JkLnB1c2gocmVjb3JkLmNvbXBsZXRlKVxuXHRcdFx0XHRcdFx0XHRkYXRhUmVjb3JkLnB1c2gocmVjb3JkLmluY29tcGxldGUpXG5cdFx0XHRcdFx0XHRcdHJvd3MucHVzaChkYXRhUmVjb3JkKVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRzdGF0aXN0aWNzV2luZG93XG5cdFx0XHRcdFx0XHQuc2V0VGl0bGUoJ0FjdGl2aWRhZGVzIHBvciBSYW5nbyBkZSBGZWNoYXMnKVxuXHRcdFx0XHRcdFx0LmFkZENvbnRlbnQobm9kZSlcblx0XHRcdFx0XHRcdC5zaG93KClcblxuXHRcdFx0XHRcdFx0Z29vZ2xlLmNoYXJ0cy5zZXRPbkxvYWRDYWxsYmFjayhkcmF3UmFuZ2VEYXRlcylcblxuXHRcdFx0XHRcdFx0ZnVuY3Rpb24gZHJhd1JhbmdlRGF0ZXMgKCkge1xuXHRcdFx0XHRcdFx0XHR2YXIgZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuXG5cdFx0XHRcdFx0XHRcdGRhdGEuYWRkQ29sdW1uKCdzdHJpbmcnLCAnRGF0ZScpXG5cdFx0XHRcdFx0XHRcdGRhdGEuYWRkQ29sdW1uKCdudW1iZXInLCAnQ29tcGxldGFkYXMnKVxuXHRcdFx0XHRcdFx0XHRkYXRhLmFkZENvbHVtbignbnVtYmVyJywgJ0luY29tcGxldGFzJylcblx0XHRcdFx0XHRcdFx0ZGF0YS5hZGRSb3dzKHJvd3MpXG5cdFx0XHRcdFx0XHRcdHN0YXRpc3RpY3NXaW5kb3cubW9kYWwuYWRkRXZlbnRMaXN0ZW5lcignZnVsbE9wZW4nLCAoZSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdHZhciBkaW1lbnNpb25zID0gZ2V0RGltZW5zaW9uc0NoYXJ0KClcblxuXHRcdFx0XHRcdFx0XHRcdHZhciBvcHRpb25zID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0dGl0bGUgOiAnQWN0aXZpZGFkZXMgQ29tcGxldGFzL0luY29tcGxldGFzJyxcblx0XHRcdFx0XHRcdFx0XHRcdGxlZ2VuZDonYm90dG9tJyxcblx0XHRcdFx0XHRcdFx0XHRcdHdpZHRoOiBkaW1lbnNpb25zLndpZHRoLFxuXHRcdFx0XHRcdFx0XHRcdFx0aGVpZ2h0OiBkaW1lbnNpb25zLmhlaWdodCxcblx0XHRcdFx0XHRcdFx0XHRcdHZBeGlzOiB7dGl0bGU6ICcjIGRlIEFjdGl2aWRhZGVzJ30sXG5cdFx0XHRcdFx0XHRcdFx0XHRoQXhpczoge3RpdGxlOiAnRmVjaGEnfSxcblx0XHRcdFx0XHRcdFx0XHRcdHNlcmllc1R5cGU6ICdiYXJzJ1xuXHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdHZhciBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db21ib0NoYXJ0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGFydFJhbmdlRGF0ZScpKVxuXHRcdFx0XHRcdFx0XHRcdGNoYXJ0LmRyYXcoZGF0YSwgb3B0aW9ucylcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZGF0YSA6IEpTT04uc3RyaW5naWZ5KHtkYXRlSW5pdDogZm9ybVNSYW5nZURhdGUuZGF0ZUluaXQudmFsdWUgLGRhdGVFbmQ6IGZvcm1TUmFuZ2VEYXRlLmRhdGVFbmQudmFsdWUsY2hpbGRyZW46IGZvcm1TUmFuZ2VEYXRlLmNoaWxkcmVuLnZhbHVlIH0pXG5cdFx0XHRcdH0pXG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dmFsaWRhdG9yLnNob3dFcnJvcnMoJy5lcnJvcnMnKVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0ZXZvbHV0aW9uIDogZnVuY3Rpb24gKCl7XG5cdFx0dmFyIGZvcm1TRXZvbHV0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2V2b2x1dGlvbicpLFxuXHRcdFx0dmFsaWRhdG9yID0gbmV3IFZhbGlkYXRvcihmb3JtU0V2b2x1dGlvbilcblxuXHRcdHZhbGlkYXRvci5jb25maWcoW1xuXHRcdFx0e2ZuIDogJ21heW9yJywgcGFyYW1zIDogJ2RhdGVFbmQgZGF0ZUluaXQnLCBtZXNzYWdlRXJyb3IgOiAnTGEgKipGZWNoYSBJbmljaWFsKiogZGViZSBzZXIgKiptYXlvcioqIGEgbGEgKipGZWNoYSBGaW5hbCoqJ31cblx0XHRdKVxuXG5cdFx0Zm9ybVNFdm9sdXRpb24ub25zdWJtaXQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdHZhciBmb3JtVmFsaWRhdGlvbiA9IHZhbGlkYXRvci5pc1ZhbGlkKClcblx0XHRcdGlmKGZvcm1WYWxpZGF0aW9uLmlzVmFsaWQpe1xuXHRcdFx0XHRhamF4KHtcblx0XHRcdFx0XHR0eXBlIDogJ1BPU1QnLFxuXHRcdFx0XHRcdFVSTCA6ICcvc3RhdGlzdGljcy9saW5lLWV2b2x1dGlvbicsXG5cdFx0XHRcdFx0YXN5bmMgOiB0cnVlLFxuXHRcdFx0XHRcdGNvbnRlbnRUeXBlIDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuXHRcdFx0XHRcdG9uU3VjY2VzcyA6IHJlc3BvbnNlID0+IHtcblx0XHRcdFx0XHRcdGlmKCFyZXNwb25zZS5sZW5ndGgpIHJldHVybiBub3RpZmljYXRpb24uc2hvdyh7bXNnOiAnKipObyoqIGhheSAqKmRhdG9zKiogcGFyYSBnZW5lcmFyIGxhICoqZXN0YWRpc3RpY2EqKi4nLCB0eXBlOiAyfSlcblxuXHRcdFx0XHRcdFx0dmFyIG5vZGUgPSBidWlsZFNhdGlzdGljLnJhbmdlRGF0ZSgpLFxuXHRcdFx0XHRcdFx0XHRyb3dzID0gW11cblxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgcmVjb3JkIG9mIHJlc3BvbnNlKXtcblx0XHRcdFx0XHRcdFx0dmFyIGRhdGFSZWNvcmQgPSBbXVxuXHRcdFx0XHRcdFx0XHRkYXRhUmVjb3JkLnB1c2gocmVjb3JkLl9pZC5kYXkgKyAnLycgKyByZWNvcmQuX2lkLm1vbnRoICsgJy8nICsgcmVjb3JkLl9pZC55ZWFyKVxuXHRcdFx0XHRcdFx0XHRkYXRhUmVjb3JkLnB1c2gocmVjb3JkLmNvbXBsZXRlKVxuXHRcdFx0XHRcdFx0XHRkYXRhUmVjb3JkLnB1c2gocmVjb3JkLmluY29tcGxldGUpXG5cdFx0XHRcdFx0XHRcdHJvd3MucHVzaChkYXRhUmVjb3JkKVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRzdGF0aXN0aWNzV2luZG93XG5cdFx0XHRcdFx0XHQuc2V0VGl0bGUoJ0V2b2x1Y2nDs24nKVxuXHRcdFx0XHRcdFx0LmFkZENvbnRlbnQobm9kZSlcblx0XHRcdFx0XHRcdC5zaG93KClcblxuXHRcdFx0XHRcdFx0Z29vZ2xlLmNoYXJ0cy5zZXRPbkxvYWRDYWxsYmFjayhkcmF3RXZvbHV0aW9uKVxuXG5cdFx0XHRcdFx0XHRmdW5jdGlvbiBkcmF3RXZvbHV0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0dmFyIGRhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcblxuXHRcdFx0XHRcdFx0XHRkYXRhLmFkZENvbHVtbignc3RyaW5nJywgJ0RhdGUnKVxuXHRcdFx0XHRcdFx0XHRkYXRhLmFkZENvbHVtbignbnVtYmVyJywgJ0NvbXBsZXRhZGFzJylcblx0XHRcdFx0XHRcdFx0ZGF0YS5hZGRDb2x1bW4oJ251bWJlcicsICdJbmNvbXBsZXRhcycpXG5cdFx0XHRcdFx0XHRcdGRhdGEuYWRkUm93cyhyb3dzKVxuXG5cdFx0XHRcdFx0XHRcdHN0YXRpc3RpY3NXaW5kb3cubW9kYWwuYWRkRXZlbnRMaXN0ZW5lcignZnVsbE9wZW4nLCAoZSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdHZhciBkaW1lbnNpb25zID0gZ2V0RGltZW5zaW9uc0NoYXJ0KClcblx0XHRcdFx0XHRcdFx0XHR2YXIgb3B0aW9ucyA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdHRpdGxlOiAnRXZvbHVjacOzbicsXG5cdFx0XHRcdFx0XHRcdFx0XHRwb2ludFNpemU6IDEwLFxuXHRcdFx0XHRcdFx0XHRcdFx0d2lkdGg6IGRpbWVuc2lvbnMud2lkdGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRoZWlnaHQ6IGRpbWVuc2lvbnMuaGVpZ2h0LFxuXHRcdFx0XHRcdFx0XHRcdFx0aEF4aXM6IHt0aXRsZVRleHRTdHlsZToge2NvbG9yOiAnIzMzMyd9LCBkaXJlY3Rpb246LTEsIHNsYW50ZWRUZXh0OmZhbHNlLCBzbGFudGVkVGV4dEFuZ2xlOjkwfSxcblx0XHRcdFx0XHRcdFx0XHRcdGNvbG9yczogWycjMzRBODUzJywnI0VBNDIzNSddLFxuXHRcdFx0XHRcdFx0XHRcdFx0dkF4aXM6IHttaW5WYWx1ZTogMCwgdGl0bGU6ICcjIGRlIEFjdGl2aWRhZGVzJ30sXG5cdFx0XHRcdFx0XHRcdFx0XHRsZWdlbmQ6J2JvdHRvbSdcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHR2YXIgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQXJlYUNoYXJ0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGFydFJhbmdlRGF0ZScpKVxuXHRcdFx0XHRcdFx0XHRcdGNoYXJ0LmRyYXcoZGF0YSwgb3B0aW9ucylcblx0XHRcdFx0XHRcdFx0fSwgZmFsc2UpXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRhdGEgOiBKU09OLnN0cmluZ2lmeSh7ZGF0ZUluaXQ6IGZvcm1TRXZvbHV0aW9uLmRhdGVJbml0LnZhbHVlICxkYXRlRW5kOiBmb3JtU0V2b2x1dGlvbi5kYXRlRW5kLnZhbHVlLGNoaWxkcmVuOiBmb3JtU0V2b2x1dGlvbi5jaGlsZHJlbi52YWx1ZSB9KVxuXHRcdFx0XHR9KVxuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdHZhbGlkYXRvci5zaG93RXJyb3JzKCcuZXJyb3JzJylcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cbiIsImltcG9ydCB7bWFya2Rvd259IGZyb20gJy4vbGliL21hcmtkb3duJ1xuXG5EYXRlLnByb3RvdHlwZS50b0hvdXIxMiA9IGZ1bmN0aW9uICgpIHtcblx0Lypcblx0XHRGb3JtYXRlYSB1biBPYmplY3QgRGF0ZSBlbiBUaW1lICgxMiBob3Jhcylcblx0Ki9cblx0cmV0dXJuIHRoaXMudG9Mb2NhbGVUaW1lU3RyaW5nKCdlcy1DTycse2hvdXIxMjp0cnVlfSlcblx0XHQucmVwbGFjZSgncC4gbS4nLCdQTScpXG5cdFx0LnJlcGxhY2UoJ2EuIG0uJywnQU0nKVxufVxuXG5EYXRlLnByb3RvdHlwZS5nZXRUaW1lSHVtYW5pemUgPSBmdW5jdGlvbiAoKSB7XG5cdHZhciB0aW1lID0gdGhpcy5nZXRIb3VycygpICsgJzonICsgdGhpcy5nZXRNaW51dGVzKCkgKyAnOicgKyB0aGlzLmdldFNlY29uZHMoKVxuXHRyZXR1cm4gdGltZVxufVxuXG5EYXRlLnByb3RvdHlwZS5nZXRWYWx1ZUlucHV0ID0gZnVuY3Rpb24gKGZvcm1hdCl7XG5cdHZhciBkID0gU3RyaW5nKHRoaXMuZ2V0RGF0ZSgpKS5sZW5ndGggPT0gMiA/IHRoaXMuZ2V0RGF0ZSgpIDogJzAnICsgdGhpcy5nZXREYXRlKCksXG5cdFx0bSA9IFN0cmluZyh0aGlzLmdldE1vbnRoKCkpLmxlbmd0aCA9PSAyID8gdGhpcy5nZXRNb250aCgpKzEgOiAnMCcgKyAodGhpcy5nZXRNb250aCgpKzEpLFxuXHRcdHkgPSB0aGlzLmdldEZ1bGxZZWFyKCksXG5cdFx0ZGF0ZUZvcm1hdCA9IGZvcm1hdC5yZXBsYWNlKCdkJyxkKS5yZXBsYWNlKCdtJyxtKS5yZXBsYWNlKCd5Jyx5KVxuXHRyZXR1cm4gZGF0ZUZvcm1hdFxufVxuXG5IVE1MRm9ybUVsZW1lbnQucHJvdG90eXBlLmlzVmFsaWQgPSBmdW5jdGlvbiAoKXtcblx0Zm9yICh2YXIgZWxlbWVudCBvZiBBcnJheS5mcm9tKHRoaXMuZWxlbWVudHMpKXtcblx0XHRpZiAoZWxlbWVudC52YWxpZGl0eS52YWxpZCA9PSBmYWxzZSkgcmV0dXJuIGZhbHNlXG5cdH1cblx0cmV0dXJuIHRydWVcbn1cblxuSFRNTElucHV0RWxlbWVudC5wcm90b3R5cGUuY2hlY2tTaXplSW1hZ2UgPSBmdW5jdGlvbiAoZGF0YSxjYil7XG5cblx0aWYoIXRoaXMuZmlsZXMubGVuZ3RoKSByZXR1cm4gY2IobmV3IEVycm9yKCdObyBTZSBoYSBzZWxlY2Npb25hZG8gbmluZ3VuIGFyY2hpdm8nKSlcblxuXHR2YXIgZnIgPSBuZXcgRmlsZVJlYWRlcixcblx0XHRtYXhXaWR0aCA9IGRhdGEubWF4V2lkdGgsXG5cdFx0bWF4SGVpZ2h0ID0gZGF0YS5tYXhIZWlnaHQsXG5cdFx0cmVzcG9uc2UgPSB7XG5cdFx0XHR2YWxpZCA6IHRydWUsXG5cdFx0XHR0eXBlOiAwLFxuXHRcdFx0bWVzc2FnZSA6ICcnXG5cdFx0fVxuXG5cdGZyLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgaW1nID0gbmV3IEltYWdlXG5cblx0XHRpbWcub25sb2FkID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYoaW1nLndpZHRoID4gbWF4V2lkdGgpe1xuXHRcdFx0XHRyZXNwb25zZS52YWxpZCA9IGZhbHNlXG5cdFx0XHRcdHJlc3BvbnNlLnR5cGUgPSAyXG5cdFx0XHRcdHJlc3BvbnNlLm1lc3NhZ2UgKz0gJ0VsICoqYW5jaG8qKiBkZSBsYSBpbWFnZW4gKipubyBlcyBhY2VwdGFkbyoqLCBlbCAqKmFuY2hvIG1heGltbyoqIHBlcm1pdGlkbyBlcyAqKicgKyBtYXhXaWR0aCArICcqKlxcblxcbidcblx0XHRcdH1cblx0XHRcdGlmKGltZy5oZWlnaHQgPiBtYXhIZWlnaHQpe1xuXHRcdFx0XHRyZXNwb25zZS52YWxpZCA9IGZhbHNlXG5cdFx0XHRcdHJlc3BvbnNlLnR5cGUgPSAyXG5cdFx0XHRcdHJlc3BvbnNlLm1lc3NhZ2UgKz0gJ0VsICoqbGFyZ28qKiBkZSBsYSBpbWFnZW4gKipubyBlcyBhY2VwdGFkbyoqLCBlbCAqKmxhcmdvIG1heGltbyoqIHBlcm1pdGlkbyBlcyAqKicgKyBtYXhIZWlnaHQgKyAnKionXG5cdFx0XHR9XG5cdFx0XHRjYihudWxsLCByZXNwb25zZSlcblx0XHR9XG5cblx0XHRpbWcuc3JjID0gZnIucmVzdWx0XG5cdH1cblxuXHRmci5yZWFkQXNEYXRhVVJMKHRoaXMuZmlsZXNbMF0pXG59XG5cbkhUTUxFbGVtZW50LnByb3RvdHlwZS5zZXJpYWxpemUgPSBmdW5jdGlvbiAoKXtcblx0dmFyIGVsZW1lbnRzID0gdGhpcyBpbnN0YW5jZW9mIEhUTUxGb3JtRWxlbWVudCA/IHRoaXMuZWxlbWVudHM6IHRoaXMucXVlcnlTZWxlY3RvcignaW5wdXQsIHNlbGVjdCcpLFxuXHRcdGV4Y2VwdGlvbnMgPSBbJ3N1Ym1pdCcsJ3Jlc2V0J11cblxuXHR2YXIgZGF0YSA9IHt9XG5cdGZvcih2YXIgZWxlbWVudCBvZiBBcnJheS5mcm9tKGVsZW1lbnRzKSl7XG5cdFx0aWYoZXhjZXB0aW9ucy5pbmRleE9mKGVsZW1lbnQudHlwZSkgPCAwKXtcblx0XHRcdGRhdGFbZWxlbWVudC5uYW1lXSA9IGVsZW1lbnQudmFsdWVcblx0XHR9XG5cdH1cblx0cmV0dXJuIGRhdGFcbn1cblxuSFRNTEVsZW1lbnQucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uICgpe1xuXHQvKlxuXHRcdFJlbXVldmUgZGVsIERPTSB1biBlbGVtZW50b1xuXHQqL1xuXHR0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcylcbn1cblxuSFRNTEVsZW1lbnQucHJvdG90eXBlLmRpc2FiZWxkSW5wdXRzID0gZnVuY3Rpb24gKHZhbHVlRGlzYWJsZWQsIHNlbGVjdG9yLCBleGNlcHRpb25zKXtcblx0dmFyIGVsZW1lbnRzID0gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuXHRmb3IgKHZhciBlbGVtZW50IG9mIEFycmF5LmZyb20oZWxlbWVudHMpKXtcblx0XHRpZiAoZXhjZXB0aW9ucy5pbmRleE9mKGVsZW1lbnQubmFtZSkgPCAwKSBlbGVtZW50LmRpc2FibGVkID0gdmFsdWVEaXNhYmxlZFxuXHR9XG5cdHJldHVybiB0aGlzXG59XG5IVE1MRWxlbWVudC5wcm90b3R5cGUucmVhZE9ubHlJbnB1dHMgPSBmdW5jdGlvbiAodmFsdWVSZWFkT25seSwgc2VsZWN0b3IsIGV4Y2VwdGlvbnMpe1xuXHR2YXIgZWxlbWVudHMgPSB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG5cdGZvciAodmFyIGVsZW1lbnQgb2YgQXJyYXkuZnJvbShlbGVtZW50cykpe1xuXHRcdGlmIChleGNlcHRpb25zLmluZGV4T2YoZWxlbWVudC5uYW1lKSA8IDApIGVsZW1lbnQucmVhZE9ubHkgPSB2YWx1ZVJlYWRPbmx5XG5cdH1cblx0cmV0dXJuIHRoaXNcbn1cblxuSFRNTEVsZW1lbnQucHJvdG90eXBlLmVtcHR5SW5wdXRzID0gZnVuY3Rpb24gKHNlbGVjdG9yLGV4Y2VwdGlvbnMpe1xuXHQvKlxuXHRcdFZhY2lhIGVsIGF0dHJpYnV0byAndmFsdWUnIGRlIGxvcyBlbGVtZW50b3MgZGUgdW4gSFRNTEZvcm1FbGVtZW50XG5cdFx0RWwgYXJyYXkgZXhjZXB0aW9ucywgY29udGllbmUgbG9zIGlucHV0cyBxdWUgbm8gc2UgZGViZW4gdmFjaWFyXG5cdCovXG5cdHZhciBlbGVtZW50cyA9IHRoaXMucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcilcblx0Zm9yICh2YXIgZWxlbWVudCBvZiBBcnJheS5mcm9tKGVsZW1lbnRzKSl7XG5cdFx0aWYgKGV4Y2VwdGlvbnMuaW5kZXhPZihlbGVtZW50Lm5hbWUpIDwgMCkgZWxlbWVudC52YWx1ZSA9ICcnXG5cdH1cblx0cmV0dXJuIHRoaXNcbn1cblxuZnVuY3Rpb24gQ29tbW9uRWxlbWVudCAoKXtcblx0dGhpcy5pbml0ID0gKCkgPT4ge1xuXHRcdHRoaXMudGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY29tbW9uRWxlbWVudHMnKVxuXHRcdHRoaXMuY2xvbmVUZW1wbGF0ZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGhpcy50ZW1wbGF0ZS5jb250ZW50LCB0cnVlKVxuXHR9XG5cdHRoaXMuZ2V0ID0gZnVuY3Rpb24gKG5hbWUsZGF0YSl7XG5cdFx0dGhpcy5pbml0KClcblx0XHR2YXIgZWxlbWVudCA9IHRoaXMuY2xvbmVUZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKG5hbWUpLFxuXHRcdFx0Y2xvbmVFbGVtZW50ID0gZWxlbWVudC5jbG9uZU5vZGUodHJ1ZSlcblx0XHRjbG9uZUVsZW1lbnQuaW5uZXJIVE1MID0gZGF0YS5odG1sXG5cblx0XHRpZihkYXRhLmNzcyl7XG5cdFx0XHRkYXRhLmNzcy5mb3JFYWNoKGNsYXNzQ3NzID0+IHtcblx0XHRcdFx0Y2xvbmVFbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NDc3MpXG5cdFx0XHR9KVxuXHRcdH1cblx0XHRpZihkYXRhLmdlbmVyYWwpe1xuXHRcdFx0Zm9yKHZhciBrZXkgaW4gZGF0YS5nZW5lcmFsKXtjbG9uZUVsZW1lbnQuc2V0QXR0cmlidXRlKGtleSxkYXRhLmdlbmVyYWxba2V5XSl9XG5cdFx0fVxuXHRcdHJldHVybiBjbG9uZUVsZW1lbnRcblx0fVxufVxuXG5mdW5jdGlvbiBMb2FkZXIgKHNlbGVjdG9yUmVmZXJlbmNlKXtcblx0dmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlY3Rpb24nKSxcblx0XHRsb2FkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcblx0XHRyZWZlcmVuY2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yUmVmZXJlbmNlKVxuXG5cdGNvbnRhaW5lci5hcHBlbmRDaGlsZChsb2FkZXIpXG5cblx0bG9hZGVyLmNsYXNzTGlzdC5hZGQoJ2xvYWRlcicpXG5cdGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdjb250YWluZXJMb2FkZXInKVxuXG5cdHRoaXMuc2hvdyA9IGZ1bmN0aW9uICgpe1xuXHRcdGNvbnRhaW5lci5zdHlsZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoICsgJ3B4J1xuXHRcdGNvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnXG5cdFx0cmVmZXJlbmNlLnNldEF0dHJpYnV0ZSgnZGF0YS1yZWZlcmVuY2UtbG9hZGVyJywnJylcblx0XHRyZWZlcmVuY2UuYXBwZW5kQ2hpbGQoY29udGFpbmVyKVxuXG5cdH1cblx0dGhpcy5oaWRlID0gZnVuY3Rpb24gKCl7XG5cdFx0cmVmZXJlbmNlLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1yZWZlcmVuY2UtbG9hZGVyJylcblx0XHRyZWZlcmVuY2UucmVtb3ZlQ2hpbGQoY29udGFpbmVyKVxuXG5cdH1cbn1cbmZ1bmN0aW9uIFZhbGlkYXRvciAoZm9ybSl7XG5cblx0dGhpcy5zdGFnZXNGYWlsZCA9IFtdXG5cblx0dGhpcy5jb25maWcgPSBmdW5jdGlvbiAoc3RhZ2VzKXtcblx0XHR0aGlzLnN0YWdlcyA9IHN0YWdlc1xuXHRcdHRoaXMuc3RhZ2VzLmZvckVhY2goKHN0YWdlKSA9PiB7IHN0YWdlLmlzVmFsaWQgPSBmYWxzZSB9KVxuXHR9XG5cblx0dGhpcy5zaG93RXJyb3JzID0gZnVuY3Rpb24gKCl7XG5cdFx0dmFyIHNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJylcblx0XHRzZWN0aW9uLmNsYXNzTGlzdC5hZGQoJ2Vycm9ycycpXG5cdFx0dGhpcy5zdGFnZXNGYWlsZC5mb3JFYWNoKChlKSA9PiB7IHNlY3Rpb24uaW5uZXJIVE1MICs9IG1hcmtkb3duLnRvSFRNTChlLm1lc3NhZ2VFcnJvcikgfSlcblx0XHRmb3JtLmFwcGVuZENoaWxkKHNlY3Rpb24pXG5cdFx0c2VjdGlvbi5zY3JvbGxJbnRvVmlldygpXG5cblx0XHR3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7IGZvcm0ucmVtb3ZlQ2hpbGQoc2VjdGlvbikgfSwgMTAwMDApXG5cblx0XHRyZXR1cm4gc2VjdGlvblxuXHR9XG5cblx0dGhpcy52YWxpZGF0ZVN0YWdlID0gZnVuY3Rpb24gKCl7XG5cdFx0dGhpcy5zdGFnZXMuZm9yRWFjaCgoc3RhZ2UpID0+IHtcblx0XHRcdHZhciBmbiA9IHRoaXNbc3RhZ2UuZm5dXG5cdFx0XHRzdGFnZS5pc1ZhbGlkID0gZm4oc3RhZ2UucGFyYW1zLnNwbGl0KCcgJykpXG5cdFx0fSlcblx0fVxuXG5cdHRoaXMuaXNWYWxpZCA9IGZ1bmN0aW9uICgpe1xuXG5cdFx0dGhpcy52YWxpZGF0ZVN0YWdlKClcblxuXHRcdHRoaXMuc3RhZ2VzRmFpbGQgPSB0aGlzLnN0YWdlcy5maWx0ZXIoKHN0YWdlKSA9PiB7XG5cdFx0XHRyZXR1cm4gc3RhZ2UuaXNWYWxpZCA9PSBmYWxzZVxuXHRcdH0pXG5cblx0XHRpZiAodGhpcy5zdGFnZXNGYWlsZC5sZW5ndGgpIHJldHVybiB7aXNWYWxpZCA6IGZhbHNlLCBzdGFnZXNGYWlsZCA6IHRoaXMuc3RhZ2VzRmFpbGR9XG5cdFx0cmV0dXJuIHtpc1ZhbGlkIDogdHJ1ZX1cblx0fVxuXG5cdHRoaXMuZXF1YWxzID0gZnVuY3Rpb24gKGVsZW1lbnRzKXtcblx0XHR2YXIgdmFsdWVPbmUgPSBmb3JtW2VsZW1lbnRzWzBdXSxcblx0XHRcdHZhbHVlVHdvID0gZm9ybVtlbGVtZW50c1sxXV1cblx0XHRpZiAodmFsdWVPbmUudmFsdWUgPT0gdmFsdWVUd28udmFsdWUpIHtcblx0XHRcdHJldHVybiB0cnVlXG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZVxuXHR9XG5cblx0dGhpcy5ub3RFcXVhbHMgPSBmdW5jdGlvbiAoZWxlbWVudHMpe1xuXHRcdHZhciB2YWx1ZU9uZSA9IGZvcm1bZWxlbWVudHNbMF1dLFxuXHRcdFx0dmFsdWVUd28gPSBmb3JtW2VsZW1lbnRzWzFdXVxuXHRcdGlmICh2YWx1ZU9uZS52YWx1ZSAhPSB2YWx1ZVR3by52YWx1ZSkge1xuXHRcdFx0cmV0dXJuIHRydWVcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlXG5cdH1cblxuXHR0aGlzLm1heW9yID0gZnVuY3Rpb24gKGVsZW1lbnRzKXtcblx0XHR2YXIgdmFsdWVPbmUgPSBmb3JtW2VsZW1lbnRzWzBdXSxcblx0XHRcdHZhbHVlVHdvID0gZm9ybVtlbGVtZW50c1sxXV1cblx0XHRpZiAodmFsdWVPbmUudmFsdWUgPiB2YWx1ZVR3by52YWx1ZSkge1xuXHRcdFx0cmV0dXJuIHRydWVcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlXG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWVJbnB1dCAoZGF0ZSxmb3JtYXQpe1xuXHR2YXIgZCA9IFN0cmluZyhkYXRlLmdldERhdGUoKSkubGVuZ3RoID09IDIgPyBkYXRlLmdldERhdGUoKSA6ICcwJyArIGRhdGUuZ2V0RGF0ZSgpLFxuXHRcdG0gPSBTdHJpbmcoZGF0ZS5nZXRNb250aCgpKS5sZW5ndGggPT0gMiA/IGRhdGUuZ2V0TW9udGgoKSA6ICcwJyArIGRhdGUuZ2V0TW9udGgoKSxcblx0XHR5ID0gZGF0ZS5nZXRGdWxsWWVhcigpLFxuXHRcdGRhdGVGb3JtYXQgPSBmb3JtYXQucmVwbGFjZSgnZCcsZCkucmVwbGFjZSgnbScsbSkucmVwbGFjZSgneScseSlcblx0cmV0dXJuIGRhdGVGb3JtYXRcbn1cblxuZnVuY3Rpb24gTW9kYWwgKG1vZGFsUmVmZXJlbmNlLHNlbGVjdG9yUGFyZW50RWxlbWVudCl7XG5cblx0dmFyIGZ1bGxPcGVuID0gbmV3IEV2ZW50KCdmdWxsT3BlbicpXG5cblx0dGhpcy5tb2RhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG1vZGFsUmVmZXJlbmNlKVxuXG5cdHZhciBib2R5ID0gZG9jdW1lbnQuYm9keSxcblx0XHRib2R5TW9kYWwgPSB0aGlzLm1vZGFsLnF1ZXJ5U2VsZWN0b3IoJy5ib2R5TW9kYWwnKSxcblx0XHRjbG9zZSA9IHRoaXMubW9kYWwucXVlcnlTZWxlY3RvcignW2RhdGEtY2xvc2Vtb2RhbF0nKSxcblx0XHRib2R5VGl0bGUgPSB0aGlzLm1vZGFsLnF1ZXJ5U2VsZWN0b3IoJy50aXRsZU1vZGFsJyksXG5cdFx0cGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JQYXJlbnRFbGVtZW50KVxuXG5cdHRoaXMuc2hvdyA9IGZ1bmN0aW9uICgpe1xuXHRcdHRoaXMubW9kYWwuY2xhc3NMaXN0LmFkZCgnZWZmZWN0U2hvd01vZGFsJylcblx0XHR0aGlzLm1vZGFsLnNldEF0dHJpYnV0ZSgnbW9kYWxBY3RpdmUnLCd0cnVlJylcblx0XHRwYXJlbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3NlY3Rpb25JbmFjdGl2ZScpXG5cdFx0Ym9keS5jbGFzc0xpc3QuYWRkKCdvdmVyZmxvd0hpZGRlbicpXG5cdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHR0aGlzLm1vZGFsLmRpc3BhdGNoRXZlbnQoZnVsbE9wZW4pXG5cdFx0fSwxMDAwKVxuXHR9XG5cblx0dGhpcy5oaWRlID0gZnVuY3Rpb24gKCl7XG5cdFx0dGhpcy5tb2RhbC5jbGFzc0xpc3QucmVtb3ZlKCdlZmZlY3RTaG93TW9kYWwnKVxuXHRcdHRoaXMubW9kYWwuY2xhc3NMaXN0LmFkZCgnZWZmZWN0SGlkZU1vZGFsJylcblx0XHRib2R5TW9kYWwuaW5uZXJIVE1MID0gJydcblxuXHRcdHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdHRoaXMubW9kYWwuY2xhc3NMaXN0LnJlbW92ZSgnZWZmZWN0SGlkZU1vZGFsJylcblx0XHRcdHRoaXMubW9kYWwucmVtb3ZlQXR0cmlidXRlKCdtb2RhbEFjdGl2ZScpXG5cdFx0XHRwYXJlbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3NlY3Rpb25JbmFjdGl2ZScpXG5cdFx0XHRib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ292ZXJmbG93SGlkZGVuJylcblx0XHR9LDEwMDApXG5cdH1cblxuXHR0aGlzLmFkZENvbnRlbnQgPSBmdW5jdGlvbiAoZWxlbWVudCl7XG5cdFx0Ym9keU1vZGFsLmlubmVySFRNTCA9ICcnXG5cdFx0Ym9keU1vZGFsLmFwcGVuZENoaWxkKGVsZW1lbnQpXG5cdFx0cmV0dXJuIHRoaXNcblx0fVxuXG5cdHRoaXMuc2V0VGl0bGUgPSBmdW5jdGlvbiAodGl0bGUpe1xuXHRcdGJvZHlUaXRsZS5pbm5lckhUTUwgPSAnJ1xuXHRcdHZhciB0aXRsZUNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpXG5cdFx0dGl0bGVDb250ZW50LmlubmVySFRNTCA9IHRpdGxlXG5cdFx0Ym9keVRpdGxlLmFwcGVuZENoaWxkKHRpdGxlQ29udGVudClcblx0XHRyZXR1cm4gdGhpc1xuXHR9XG5cblx0Y2xvc2UuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLHRoaXMuaGlkZS5iaW5kKHRoaXMpKVxufVxuXG5mdW5jdGlvbiBOb3RpZmljYXRpb25DICgpe1xuXHR2YXIgY29udGVuZWRvclByaW5jaXBhbCA9IGRvY3VtZW50LmJvZHlcblxuXHR2YXIgY3JlYXRlTWVzc2FnZSA9IGZ1bmN0aW9uIChkYXRhKXtcblx0XHR2YXIgY29udGVuZWRvck1TRyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2FydGljbGUnKVxuXHRcdGNvbnRlbmVkb3JNU0cuY2xhc3NMaXN0LmFkZCgnY29udGVuZWRvck1lbnNhamUnKVxuXHRcdHZhciBtZW5zYWplID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpXG5cdFx0bWVuc2FqZS5pbm5lckhUTUw9IG1hcmtkb3duLnRvSFRNTChkYXRhLm1zZylcblx0XHRjb250ZW5lZG9yTVNHLmNsYXNzTGlzdC5hZGQoJ01TRycpXG5cdFx0dmFyIGljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKVxuXG5cdFx0Y29udGVuZWRvck1TRy5hcHBlbmRDaGlsZChpY29uKVxuXHRcdGNvbnRlbmVkb3JNU0cuYXBwZW5kQ2hpbGQobWVuc2FqZSlcblxuXHRcdGlmIChkYXRhLnR5cGUgPT0gMCkgaWNvbi5zcmMgPSAnL2ltYWdlcy9ub3RpZmljYXRpb25zL2NvcnJlY3RvLnBuZydcblx0XHRlbHNlIGlmKGRhdGEudHlwZSA9PSAxKSBpY29uLnNyYyA9ICcvaW1hZ2VzL25vdGlmaWNhdGlvbnMvaW5jb3JyZWN0by5wbmcnXG5cdFx0ZWxzZSBpZihkYXRhLnR5cGUgPT0gMikgaWNvbi5zcmMgPSAnL2ltYWdlcy9ub3RpZmljYXRpb25zL2luZm9ybWFjaW9uLnBuZydcblxuXHRcdGljb24uY2xhc3NMaXN0LmFkZCgnY29udGVuZWRvckljb24nKVxuXHRcdG1lbnNhamUuY2xhc3NMaXN0LmFkZCgnY29udGVuZWRvck1lbnNhamUnKVxuXG5cdFx0cmV0dXJuIGNvbnRlbmVkb3JNU0dcblx0fVxuXG5cdHRoaXMuc2hvdyA9IGZ1bmN0aW9uIChkYXRhKXtcblx0XHR2YXIgY29udGVuZWRvck1TRyA9IGNyZWF0ZU1lc3NhZ2UoZGF0YSksXG5cdFx0XHR0b3AgPSB3aW5kb3cud2luZG93LnNjcm9sbFksXG5cdFx0XHR0aW1lID0gZGF0YS50aW1lIHx8IDMwMDBcblxuXHRcdGNvbnRlbmVkb3JNU0cuc2V0QXR0cmlidXRlKCdzdHlsZScsICd0b3A6JyArIHRvcCArICdweCcpXG5cdFx0Y29udGVuZWRvclByaW5jaXBhbC5hcHBlbmRDaGlsZChjb250ZW5lZG9yTVNHKVxuXHRcdHNldFRpbWVvdXQodGhpcy5oaWRlLmJpbmQodGhpcyksIHRpbWUpXG5cdH1cblx0dGhpcy5oaWRlID0gZnVuY3Rpb24gKCl7XG5cdFx0Y29udGVuZWRvclByaW5jaXBhbC5yZW1vdmVDaGlsZChjb250ZW5lZG9yUHJpbmNpcGFsLmxhc3RDaGlsZClcblx0fVxufVxuXG5mdW5jdGlvbiBhamF4IChjb25maWcpe1xuXHR2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCksXG5cdFx0cmVzcG9uc2VKU09OID0gY29uZmlnIHwgdHJ1ZVxuXG5cdHhoci5vcGVuKGNvbmZpZy50eXBlLCBjb25maWcuVVJMLCBjb25maWcuYXN5bmMpXG5cdHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCBjb25maWcuY29udGVudFR5cGUpXG5cblx0eGhyLnNlbmQoY29uZmlnLmRhdGEpXG5cblx0aWYoY29uZmlnLmFzeW5jKXtcblx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKHRoaXMucmVhZHlTdGF0ZSA9PSA0ICYmIHRoaXMuc3RhdHVzID09IDIwMCkge1xuXHRcdFx0XHR2YXIgcmVzcG9uc2UgPSByZXNwb25zZUpTT04gPyBKU09OLnBhcnNlKHRoaXMucmVzcG9uc2VUZXh0KSA6IHRoaXMucmVzcG9uc2VUZXh0XG5cdFx0XHRcdGNvbmZpZy5vblN1Y2Nlc3MocmVzcG9uc2UpXG5cdFx0XHR9XG5cdFx0fVxuXHR9ZWxzZXtcblx0XHR2YXIgcmVzcG9uc2UgPSByZXNwb25zZUpTT04gPyBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpIDogeGhyLnJlc3BvbnNlVGV4dFxuXHRcdGNvbmZpZy5vblN1Y2Nlc3MocmVzcG9uc2UpXG5cdH1cbn1cblxuZXhwb3J0IHtDb21tb25FbGVtZW50LExvYWRlcixWYWxpZGF0b3IsZ2V0VmFsdWVJbnB1dCxNb2RhbCxOb3RpZmljYXRpb25DLGFqYXh9XG4iXX0=
