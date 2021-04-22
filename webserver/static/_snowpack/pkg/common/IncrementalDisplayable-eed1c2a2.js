/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

var BUILTIN_OBJECT = {
    '[object Function]': true,
    '[object RegExp]': true,
    '[object Date]': true,
    '[object Error]': true,
    '[object CanvasGradient]': true,
    '[object CanvasPattern]': true,
    '[object Image]': true,
    '[object Canvas]': true
};
var TYPED_ARRAY = {
    '[object Int8Array]': true,
    '[object Uint8Array]': true,
    '[object Uint8ClampedArray]': true,
    '[object Int16Array]': true,
    '[object Uint16Array]': true,
    '[object Int32Array]': true,
    '[object Uint32Array]': true,
    '[object Float32Array]': true,
    '[object Float64Array]': true
};
var objToString = Object.prototype.toString;
var arrayProto = Array.prototype;
var nativeForEach = arrayProto.forEach;
var nativeFilter = arrayProto.filter;
var nativeSlice = arrayProto.slice;
var nativeMap = arrayProto.map;
var ctorFunction = function () { }.constructor;
var protoFunction = ctorFunction ? ctorFunction.prototype : null;
var methods$1 = {};
function $override(name, fn) {
    methods$1[name] = fn;
}
var idStart = 0x0907;
function guid() {
    return idStart++;
}
function logError() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (typeof console !== 'undefined') {
        console.error.apply(console, args);
    }
}
function clone$2(source) {
    if (source == null || typeof source !== 'object') {
        return source;
    }
    var result = source;
    var typeStr = objToString.call(source);
    if (typeStr === '[object Array]') {
        if (!isPrimitive(source)) {
            result = [];
            for (var i = 0, len = source.length; i < len; i++) {
                result[i] = clone$2(source[i]);
            }
        }
    }
    else if (TYPED_ARRAY[typeStr]) {
        if (!isPrimitive(source)) {
            var Ctor = source.constructor;
            if (Ctor.from) {
                result = Ctor.from(source);
            }
            else {
                result = new Ctor(source.length);
                for (var i = 0, len = source.length; i < len; i++) {
                    result[i] = clone$2(source[i]);
                }
            }
        }
    }
    else if (!BUILTIN_OBJECT[typeStr] && !isPrimitive(source) && !isDom(source)) {
        result = {};
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                result[key] = clone$2(source[key]);
            }
        }
    }
    return result;
}
function merge(target, source, overwrite) {
    if (!isObject(source) || !isObject(target)) {
        return overwrite ? clone$2(source) : target;
    }
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            var targetProp = target[key];
            var sourceProp = source[key];
            if (isObject(sourceProp)
                && isObject(targetProp)
                && !isArray(sourceProp)
                && !isArray(targetProp)
                && !isDom(sourceProp)
                && !isDom(targetProp)
                && !isBuiltInObject(sourceProp)
                && !isBuiltInObject(targetProp)
                && !isPrimitive(sourceProp)
                && !isPrimitive(targetProp)) {
                merge(targetProp, sourceProp, overwrite);
            }
            else if (overwrite || !(key in target)) {
                target[key] = clone$2(source[key]);
            }
        }
    }
    return target;
}
function mergeAll(targetAndSources, overwrite) {
    var result = targetAndSources[0];
    for (var i = 1, len = targetAndSources.length; i < len; i++) {
        result = merge(result, targetAndSources[i], overwrite);
    }
    return result;
}
function extend(target, source) {
    if (Object.assign) {
        Object.assign(target, source);
    }
    else {
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
}
function defaults(target, source, overlay) {
    var keysArr = keys(source);
    for (var i = 0; i < keysArr.length; i++) {
        var key = keysArr[i];
        if ((overlay ? source[key] != null : target[key] == null)) {
            target[key] = source[key];
        }
    }
    return target;
}
var createCanvas = function () {
    return methods$1.createCanvas();
};
methods$1.createCanvas = function () {
    return document.createElement('canvas');
};
function indexOf(array, value) {
    if (array) {
        if (array.indexOf) {
            return array.indexOf(value);
        }
        for (var i = 0, len = array.length; i < len; i++) {
            if (array[i] === value) {
                return i;
            }
        }
    }
    return -1;
}
function inherits(clazz, baseClazz) {
    var clazzPrototype = clazz.prototype;
    function F() { }
    F.prototype = baseClazz.prototype;
    clazz.prototype = new F();
    for (var prop in clazzPrototype) {
        if (clazzPrototype.hasOwnProperty(prop)) {
            clazz.prototype[prop] = clazzPrototype[prop];
        }
    }
    clazz.prototype.constructor = clazz;
    clazz.superClass = baseClazz;
}
function mixin(target, source, override) {
    target = 'prototype' in target ? target.prototype : target;
    source = 'prototype' in source ? source.prototype : source;
    if (Object.getOwnPropertyNames) {
        var keyList = Object.getOwnPropertyNames(source);
        for (var i = 0; i < keyList.length; i++) {
            var key = keyList[i];
            if (key !== 'constructor') {
                if ((override ? source[key] != null : target[key] == null)) {
                    target[key] = source[key];
                }
            }
        }
    }
    else {
        defaults(target, source, override);
    }
}
function isArrayLike(data) {
    if (!data) {
        return false;
    }
    if (typeof data === 'string') {
        return false;
    }
    return typeof data.length === 'number';
}
function each(arr, cb, context) {
    if (!(arr && cb)) {
        return;
    }
    if (arr.forEach && arr.forEach === nativeForEach) {
        arr.forEach(cb, context);
    }
    else if (arr.length === +arr.length) {
        for (var i = 0, len = arr.length; i < len; i++) {
            cb.call(context, arr[i], i, arr);
        }
    }
    else {
        for (var key in arr) {
            if (arr.hasOwnProperty(key)) {
                cb.call(context, arr[key], key, arr);
            }
        }
    }
}
function map(arr, cb, context) {
    if (!arr) {
        return [];
    }
    if (!cb) {
        return slice(arr);
    }
    if (arr.map && arr.map === nativeMap) {
        return arr.map(cb, context);
    }
    else {
        var result = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            result.push(cb.call(context, arr[i], i, arr));
        }
        return result;
    }
}
function reduce(arr, cb, memo, context) {
    if (!(arr && cb)) {
        return;
    }
    for (var i = 0, len = arr.length; i < len; i++) {
        memo = cb.call(context, memo, arr[i], i, arr);
    }
    return memo;
}
function filter(arr, cb, context) {
    if (!arr) {
        return [];
    }
    if (!cb) {
        return slice(arr);
    }
    if (arr.filter && arr.filter === nativeFilter) {
        return arr.filter(cb, context);
    }
    else {
        var result = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            if (cb.call(context, arr[i], i, arr)) {
                result.push(arr[i]);
            }
        }
        return result;
    }
}
function find(arr, cb, context) {
    if (!(arr && cb)) {
        return;
    }
    for (var i = 0, len = arr.length; i < len; i++) {
        if (cb.call(context, arr[i], i, arr)) {
            return arr[i];
        }
    }
}
function keys(obj) {
    if (!obj) {
        return [];
    }
    if (Object.keys) {
        return Object.keys(obj);
    }
    var keyList = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keyList.push(key);
        }
    }
    return keyList;
}
function bindPolyfill(func, context) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return function () {
        return func.apply(context, args.concat(nativeSlice.call(arguments)));
    };
}
var bind = (protoFunction && isFunction(protoFunction.bind))
    ? protoFunction.call.bind(protoFunction.bind)
    : bindPolyfill;
function curry(func) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return function () {
        return func.apply(this, args.concat(nativeSlice.call(arguments)));
    };
}
function isArray(value) {
    if (Array.isArray) {
        return Array.isArray(value);
    }
    return objToString.call(value) === '[object Array]';
}
function isFunction(value) {
    return typeof value === 'function';
}
function isString(value) {
    return typeof value === 'string';
}
function isStringSafe(value) {
    return objToString.call(value) === '[object String]';
}
function isNumber(value) {
    return typeof value === 'number';
}
function isObject(value) {
    var type = typeof value;
    return type === 'function' || (!!value && type === 'object');
}
function isBuiltInObject(value) {
    return !!BUILTIN_OBJECT[objToString.call(value)];
}
function isTypedArray(value) {
    return !!TYPED_ARRAY[objToString.call(value)];
}
function isDom(value) {
    return typeof value === 'object'
        && typeof value.nodeType === 'number'
        && typeof value.ownerDocument === 'object';
}
function isGradientObject(value) {
    return value.colorStops != null;
}
function isPatternObject(value) {
    return value.image != null;
}
function isRegExp(value) {
    return objToString.call(value) === '[object RegExp]';
}
function eqNaN(value) {
    return value !== value;
}
function retrieve() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    for (var i = 0, len = args.length; i < len; i++) {
        if (args[i] != null) {
            return args[i];
        }
    }
}
function retrieve2(value0, value1) {
    return value0 != null
        ? value0
        : value1;
}
function retrieve3(value0, value1, value2) {
    return value0 != null
        ? value0
        : value1 != null
            ? value1
            : value2;
}
function slice(arr) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return nativeSlice.apply(arr, args);
}
function normalizeCssArray(val) {
    if (typeof (val) === 'number') {
        return [val, val, val, val];
    }
    var len = val.length;
    if (len === 2) {
        return [val[0], val[1], val[0], val[1]];
    }
    else if (len === 3) {
        return [val[0], val[1], val[2], val[1]];
    }
    return val;
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
function trim(str) {
    if (str == null) {
        return null;
    }
    else if (typeof str.trim === 'function') {
        return str.trim();
    }
    else {
        return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    }
}
var primitiveKey = '__ec_primitive__';
function setAsPrimitive(obj) {
    obj[primitiveKey] = true;
}
function isPrimitive(obj) {
    return obj[primitiveKey];
}
var HashMap = (function () {
    function HashMap(obj) {
        this.data = {};
        var isArr = isArray(obj);
        this.data = {};
        var thisMap = this;
        (obj instanceof HashMap)
            ? obj.each(visit)
            : (obj && each(obj, visit));
        function visit(value, key) {
            isArr ? thisMap.set(value, key) : thisMap.set(key, value);
        }
    }
    HashMap.prototype.get = function (key) {
        return this.data.hasOwnProperty(key) ? this.data[key] : null;
    };
    HashMap.prototype.set = function (key, value) {
        return (this.data[key] = value);
    };
    HashMap.prototype.each = function (cb, context) {
        for (var key in this.data) {
            if (this.data.hasOwnProperty(key)) {
                cb.call(context, this.data[key], key);
            }
        }
    };
    HashMap.prototype.keys = function () {
        return keys(this.data);
    };
    HashMap.prototype.removeKey = function (key) {
        delete this.data[key];
    };
    return HashMap;
}());
function createHashMap(obj) {
    return new HashMap(obj);
}
function concatArray(a, b) {
    var newArray = new a.constructor(a.length + b.length);
    for (var i = 0; i < a.length; i++) {
        newArray[i] = a[i];
    }
    var offset = a.length;
    for (var i = 0; i < b.length; i++) {
        newArray[i + offset] = b[i];
    }
    return newArray;
}
function createObject(proto, properties) {
    var obj;
    if (Object.create) {
        obj = Object.create(proto);
    }
    else {
        var StyleCtor = function () { };
        StyleCtor.prototype = proto;
        obj = new StyleCtor();
    }
    if (properties) {
        extend(obj, properties);
    }
    return obj;
}
function hasOwn(own, prop) {
    return own.hasOwnProperty(prop);
}
function noop() { }

var util = /*#__PURE__*/Object.freeze({
    __proto__: null,
    $override: $override,
    guid: guid,
    logError: logError,
    clone: clone$2,
    merge: merge,
    mergeAll: mergeAll,
    extend: extend,
    defaults: defaults,
    createCanvas: createCanvas,
    indexOf: indexOf,
    inherits: inherits,
    mixin: mixin,
    isArrayLike: isArrayLike,
    each: each,
    map: map,
    reduce: reduce,
    filter: filter,
    find: find,
    keys: keys,
    bind: bind,
    curry: curry,
    isArray: isArray,
    isFunction: isFunction,
    isString: isString,
    isStringSafe: isStringSafe,
    isNumber: isNumber,
    isObject: isObject,
    isBuiltInObject: isBuiltInObject,
    isTypedArray: isTypedArray,
    isDom: isDom,
    isGradientObject: isGradientObject,
    isPatternObject: isPatternObject,
    isRegExp: isRegExp,
    eqNaN: eqNaN,
    retrieve: retrieve,
    retrieve2: retrieve2,
    retrieve3: retrieve3,
    slice: slice,
    normalizeCssArray: normalizeCssArray,
    assert: assert,
    trim: trim,
    setAsPrimitive: setAsPrimitive,
    isPrimitive: isPrimitive,
    HashMap: HashMap,
    createHashMap: createHashMap,
    concatArray: concatArray,
    createObject: createObject,
    hasOwn: hasOwn,
    noop: noop
});

var Browser = (function () {
    function Browser() {
        this.firefox = false;
        this.ie = false;
        this.edge = false;
        this.newEdge = false;
        this.weChat = false;
    }
    return Browser;
}());
var Env = (function () {
    function Env() {
        this.browser = new Browser();
        this.node = false;
        this.wxa = false;
        this.worker = false;
        this.canvasSupported = false;
        this.svgSupported = false;
        this.touchEventsSupported = false;
        this.pointerEventsSupported = false;
        this.domSupported = false;
    }
    return Env;
}());
var env = new Env();
if (typeof wx === 'object' && typeof wx.getSystemInfoSync === 'function') {
    env.wxa = true;
    env.canvasSupported = true;
    env.touchEventsSupported = true;
}
else if (typeof document === 'undefined' && typeof self !== 'undefined') {
    env.worker = true;
    env.canvasSupported = true;
}
else if (typeof navigator === 'undefined') {
    env.node = true;
    env.canvasSupported = true;
    env.svgSupported = true;
}
else {
    detect(navigator.userAgent, env);
}
function detect(ua, env) {
    var browser = env.browser;
    var firefox = ua.match(/Firefox\/([\d.]+)/);
    var ie = ua.match(/MSIE\s([\d.]+)/)
        || ua.match(/Trident\/.+?rv:(([\d.]+))/);
    var edge = ua.match(/Edge?\/([\d.]+)/);
    var weChat = (/micromessenger/i).test(ua);
    if (firefox) {
        browser.firefox = true;
        browser.version = firefox[1];
    }
    if (ie) {
        browser.ie = true;
        browser.version = ie[1];
    }
    if (edge) {
        browser.edge = true;
        browser.version = edge[1];
        browser.newEdge = +edge[1].split('.')[0] > 18;
    }
    if (weChat) {
        browser.weChat = true;
    }
    env.canvasSupported = !!document.createElement('canvas').getContext;
    env.svgSupported = typeof SVGRect !== 'undefined';
    env.touchEventsSupported = 'ontouchstart' in window && !browser.ie && !browser.edge;
    env.pointerEventsSupported = 'onpointerdown' in window
        && (browser.edge || (browser.ie && +browser.version >= 11));
    env.domSupported = typeof document !== 'undefined';
}

var Entry = (function () {
    function Entry(val) {
        this.value = val;
    }
    return Entry;
}());
var LinkedList = (function () {
    function LinkedList() {
        this._len = 0;
    }
    LinkedList.prototype.insert = function (val) {
        var entry = new Entry(val);
        this.insertEntry(entry);
        return entry;
    };
    LinkedList.prototype.insertEntry = function (entry) {
        if (!this.head) {
            this.head = this.tail = entry;
        }
        else {
            this.tail.next = entry;
            entry.prev = this.tail;
            entry.next = null;
            this.tail = entry;
        }
        this._len++;
    };
    LinkedList.prototype.remove = function (entry) {
        var prev = entry.prev;
        var next = entry.next;
        if (prev) {
            prev.next = next;
        }
        else {
            this.head = next;
        }
        if (next) {
            next.prev = prev;
        }
        else {
            this.tail = prev;
        }
        entry.next = entry.prev = null;
        this._len--;
    };
    LinkedList.prototype.len = function () {
        return this._len;
    };
    LinkedList.prototype.clear = function () {
        this.head = this.tail = null;
        this._len = 0;
    };
    return LinkedList;
}());
var LRU = (function () {
    function LRU(maxSize) {
        this._list = new LinkedList();
        this._maxSize = 10;
        this._map = {};
        this._maxSize = maxSize;
    }
    LRU.prototype.put = function (key, value) {
        var list = this._list;
        var map = this._map;
        var removed = null;
        if (map[key] == null) {
            var len = list.len();
            var entry = this._lastRemovedEntry;
            if (len >= this._maxSize && len > 0) {
                var leastUsedEntry = list.head;
                list.remove(leastUsedEntry);
                delete map[leastUsedEntry.key];
                removed = leastUsedEntry.value;
                this._lastRemovedEntry = leastUsedEntry;
            }
            if (entry) {
                entry.value = value;
            }
            else {
                entry = new Entry(value);
            }
            entry.key = key;
            list.insertEntry(entry);
            map[key] = entry;
        }
        return removed;
    };
    LRU.prototype.get = function (key) {
        var entry = this._map[key];
        var list = this._list;
        if (entry != null) {
            if (entry !== list.tail) {
                list.remove(entry);
                list.insertEntry(entry);
            }
            return entry.value;
        }
    };
    LRU.prototype.clear = function () {
        this._list.clear();
        this._map = {};
    };
    LRU.prototype.len = function () {
        return this._list.len();
    };
    return LRU;
}());

var globalImageCache = new LRU(50);
function findExistImage(newImageOrSrc) {
    if (typeof newImageOrSrc === 'string') {
        var cachedImgObj = globalImageCache.get(newImageOrSrc);
        return cachedImgObj && cachedImgObj.image;
    }
    else {
        return newImageOrSrc;
    }
}
function createOrUpdateImage(newImageOrSrc, image, hostEl, onload, cbPayload) {
    if (!newImageOrSrc) {
        return image;
    }
    else if (typeof newImageOrSrc === 'string') {
        if ((image && image.__zrImageSrc === newImageOrSrc) || !hostEl) {
            return image;
        }
        var cachedImgObj = globalImageCache.get(newImageOrSrc);
        var pendingWrap = { hostEl: hostEl, cb: onload, cbPayload: cbPayload };
        if (cachedImgObj) {
            image = cachedImgObj.image;
            !isImageReady(image) && cachedImgObj.pending.push(pendingWrap);
        }
        else {
            image = new Image();
            image.onload = image.onerror = imageOnLoad;
            globalImageCache.put(newImageOrSrc, image.__cachedImgObj = {
                image: image,
                pending: [pendingWrap]
            });
            image.src = image.__zrImageSrc = newImageOrSrc;
        }
        return image;
    }
    else {
        return newImageOrSrc;
    }
}
function imageOnLoad() {
    var cachedImgObj = this.__cachedImgObj;
    this.onload = this.onerror = this.__cachedImgObj = null;
    for (var i = 0; i < cachedImgObj.pending.length; i++) {
        var pendingWrap = cachedImgObj.pending[i];
        var cb = pendingWrap.cb;
        cb && cb(this, pendingWrap.cbPayload);
        pendingWrap.hostEl.dirty();
    }
    cachedImgObj.pending.length = 0;
}
function isImageReady(image) {
    return image && image.width && image.height;
}

function create$1() {
    return [1, 0, 0, 1, 0, 0];
}
function identity(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
}
function copy$1(out, m) {
    out[0] = m[0];
    out[1] = m[1];
    out[2] = m[2];
    out[3] = m[3];
    out[4] = m[4];
    out[5] = m[5];
    return out;
}
function mul$1(out, m1, m2) {
    var out0 = m1[0] * m2[0] + m1[2] * m2[1];
    var out1 = m1[1] * m2[0] + m1[3] * m2[1];
    var out2 = m1[0] * m2[2] + m1[2] * m2[3];
    var out3 = m1[1] * m2[2] + m1[3] * m2[3];
    var out4 = m1[0] * m2[4] + m1[2] * m2[5] + m1[4];
    var out5 = m1[1] * m2[4] + m1[3] * m2[5] + m1[5];
    out[0] = out0;
    out[1] = out1;
    out[2] = out2;
    out[3] = out3;
    out[4] = out4;
    out[5] = out5;
    return out;
}
function translate(out, a, v) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4] + v[0];
    out[5] = a[5] + v[1];
    return out;
}
function rotate(out, a, rad) {
    var aa = a[0];
    var ac = a[2];
    var atx = a[4];
    var ab = a[1];
    var ad = a[3];
    var aty = a[5];
    var st = Math.sin(rad);
    var ct = Math.cos(rad);
    out[0] = aa * ct + ab * st;
    out[1] = -aa * st + ab * ct;
    out[2] = ac * ct + ad * st;
    out[3] = -ac * st + ct * ad;
    out[4] = ct * atx + st * aty;
    out[5] = ct * aty - st * atx;
    return out;
}
function scale$1(out, a, v) {
    var vx = v[0];
    var vy = v[1];
    out[0] = a[0] * vx;
    out[1] = a[1] * vy;
    out[2] = a[2] * vx;
    out[3] = a[3] * vy;
    out[4] = a[4] * vx;
    out[5] = a[5] * vy;
    return out;
}
function invert(out, a) {
    var aa = a[0];
    var ac = a[2];
    var atx = a[4];
    var ab = a[1];
    var ad = a[3];
    var aty = a[5];
    var det = aa * ad - ab * ac;
    if (!det) {
        return null;
    }
    det = 1.0 / det;
    out[0] = ad * det;
    out[1] = -ab * det;
    out[2] = -ac * det;
    out[3] = aa * det;
    out[4] = (ac * aty - ad * atx) * det;
    out[5] = (ab * atx - aa * aty) * det;
    return out;
}
function clone$1(a) {
    var b = create$1();
    copy$1(b, a);
    return b;
}

var matrix = /*#__PURE__*/Object.freeze({
    __proto__: null,
    create: create$1,
    identity: identity,
    copy: copy$1,
    mul: mul$1,
    translate: translate,
    rotate: rotate,
    scale: scale$1,
    invert: invert,
    clone: clone$1
});

var Point = (function () {
    function Point(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    Point.prototype.copy = function (other) {
        this.x = other.x;
        this.y = other.y;
        return this;
    };
    Point.prototype.clone = function () {
        return new Point(this.x, this.y);
    };
    Point.prototype.set = function (x, y) {
        this.x = x;
        this.y = y;
        return this;
    };
    Point.prototype.equal = function (other) {
        return other.x === this.x && other.y === this.y;
    };
    Point.prototype.add = function (other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    };
    Point.prototype.scale = function (scalar) {
        this.x *= scalar;
        this.y *= scalar;
    };
    Point.prototype.scaleAndAdd = function (other, scalar) {
        this.x += other.x * scalar;
        this.y += other.y * scalar;
    };
    Point.prototype.sub = function (other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    };
    Point.prototype.dot = function (other) {
        return this.x * other.x + this.y * other.y;
    };
    Point.prototype.len = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    Point.prototype.lenSquare = function () {
        return this.x * this.x + this.y * this.y;
    };
    Point.prototype.normalize = function () {
        var len = this.len();
        this.x /= len;
        this.y /= len;
        return this;
    };
    Point.prototype.distance = function (other) {
        var dx = this.x - other.x;
        var dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    Point.prototype.distanceSquare = function (other) {
        var dx = this.x - other.x;
        var dy = this.y - other.y;
        return dx * dx + dy * dy;
    };
    Point.prototype.negate = function () {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    };
    Point.prototype.transform = function (m) {
        if (!m) {
            return;
        }
        var x = this.x;
        var y = this.y;
        this.x = m[0] * x + m[2] * y + m[4];
        this.y = m[1] * x + m[3] * y + m[5];
        return this;
    };
    Point.prototype.toArray = function (out) {
        out[0] = this.x;
        out[1] = this.y;
        return out;
    };
    Point.prototype.fromArray = function (input) {
        this.x = input[0];
        this.y = input[1];
    };
    Point.set = function (p, x, y) {
        p.x = x;
        p.y = y;
    };
    Point.copy = function (p, p2) {
        p.x = p2.x;
        p.y = p2.y;
    };
    Point.len = function (p) {
        return Math.sqrt(p.x * p.x + p.y * p.y);
    };
    Point.lenSquare = function (p) {
        return p.x * p.x + p.y * p.y;
    };
    Point.dot = function (p0, p1) {
        return p0.x * p1.x + p0.y * p1.y;
    };
    Point.add = function (out, p0, p1) {
        out.x = p0.x + p1.x;
        out.y = p0.y + p1.y;
    };
    Point.sub = function (out, p0, p1) {
        out.x = p0.x - p1.x;
        out.y = p0.y - p1.y;
    };
    Point.scale = function (out, p0, scalar) {
        out.x = p0.x * scalar;
        out.y = p0.y * scalar;
    };
    Point.scaleAndAdd = function (out, p0, p1, scalar) {
        out.x = p0.x + p1.x * scalar;
        out.y = p0.y + p1.y * scalar;
    };
    Point.lerp = function (out, p0, p1, t) {
        var onet = 1 - t;
        out.x = onet * p0.x + t * p1.x;
        out.y = onet * p0.y + t * p1.y;
    };
    return Point;
}());

var mathMin$2 = Math.min;
var mathMax$2 = Math.max;
var lt = new Point();
var rb = new Point();
var lb = new Point();
var rt = new Point();
var minTv = new Point();
var maxTv = new Point();
var BoundingRect = (function () {
    function BoundingRect(x, y, width, height) {
        if (width < 0 && isFinite(width)) {
            x = x + width;
            width = -width;
        }
        if (height < 0 && isFinite(height)) {
            y = y + height;
            height = -height;
        }
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    BoundingRect.prototype.union = function (other) {
        var x = mathMin$2(other.x, this.x);
        var y = mathMin$2(other.y, this.y);
        if (isFinite(this.x) && isFinite(this.width)) {
            this.width = mathMax$2(other.x + other.width, this.x + this.width) - x;
        }
        else {
            this.width = other.width;
        }
        if (isFinite(this.y) && isFinite(this.height)) {
            this.height = mathMax$2(other.y + other.height, this.y + this.height) - y;
        }
        else {
            this.height = other.height;
        }
        this.x = x;
        this.y = y;
    };
    BoundingRect.prototype.applyTransform = function (m) {
        BoundingRect.applyTransform(this, this, m);
    };
    BoundingRect.prototype.calculateTransform = function (b) {
        var a = this;
        var sx = b.width / a.width;
        var sy = b.height / a.height;
        var m = create$1();
        translate(m, m, [-a.x, -a.y]);
        scale$1(m, m, [sx, sy]);
        translate(m, m, [b.x, b.y]);
        return m;
    };
    BoundingRect.prototype.intersect = function (b, mtv) {
        if (!b) {
            return false;
        }
        if (!(b instanceof BoundingRect)) {
            b = BoundingRect.create(b);
        }
        var a = this;
        var ax0 = a.x;
        var ax1 = a.x + a.width;
        var ay0 = a.y;
        var ay1 = a.y + a.height;
        var bx0 = b.x;
        var bx1 = b.x + b.width;
        var by0 = b.y;
        var by1 = b.y + b.height;
        var overlap = !(ax1 < bx0 || bx1 < ax0 || ay1 < by0 || by1 < ay0);
        if (mtv) {
            var dMin = Infinity;
            var dMax = 0;
            var d0 = Math.abs(ax1 - bx0);
            var d1 = Math.abs(bx1 - ax0);
            var d2 = Math.abs(ay1 - by0);
            var d3 = Math.abs(by1 - ay0);
            var dx = Math.min(d0, d1);
            var dy = Math.min(d2, d3);
            if (ax1 < bx0 || bx1 < ax0) {
                if (dx > dMax) {
                    dMax = dx;
                    if (d0 < d1) {
                        Point.set(maxTv, -d0, 0);
                    }
                    else {
                        Point.set(maxTv, d1, 0);
                    }
                }
            }
            else {
                if (dx < dMin) {
                    dMin = dx;
                    if (d0 < d1) {
                        Point.set(minTv, d0, 0);
                    }
                    else {
                        Point.set(minTv, -d1, 0);
                    }
                }
            }
            if (ay1 < by0 || by1 < ay0) {
                if (dy > dMax) {
                    dMax = dy;
                    if (d2 < d3) {
                        Point.set(maxTv, 0, -d2);
                    }
                    else {
                        Point.set(maxTv, 0, d3);
                    }
                }
            }
            else {
                if (dx < dMin) {
                    dMin = dx;
                    if (d2 < d3) {
                        Point.set(minTv, 0, d2);
                    }
                    else {
                        Point.set(minTv, 0, -d3);
                    }
                }
            }
        }
        if (mtv) {
            Point.copy(mtv, overlap ? minTv : maxTv);
        }
        return overlap;
    };
    BoundingRect.prototype.contain = function (x, y) {
        var rect = this;
        return x >= rect.x
            && x <= (rect.x + rect.width)
            && y >= rect.y
            && y <= (rect.y + rect.height);
    };
    BoundingRect.prototype.clone = function () {
        return new BoundingRect(this.x, this.y, this.width, this.height);
    };
    BoundingRect.prototype.copy = function (other) {
        BoundingRect.copy(this, other);
    };
    BoundingRect.prototype.plain = function () {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    };
    BoundingRect.prototype.isFinite = function () {
        return isFinite(this.x)
            && isFinite(this.y)
            && isFinite(this.width)
            && isFinite(this.height);
    };
    BoundingRect.prototype.isZero = function () {
        return this.width === 0 || this.height === 0;
    };
    BoundingRect.create = function (rect) {
        return new BoundingRect(rect.x, rect.y, rect.width, rect.height);
    };
    BoundingRect.copy = function (target, source) {
        target.x = source.x;
        target.y = source.y;
        target.width = source.width;
        target.height = source.height;
    };
    BoundingRect.applyTransform = function (target, source, m) {
        if (!m) {
            if (target !== source) {
                BoundingRect.copy(target, source);
            }
            return;
        }
        if (m[1] < 1e-5 && m[1] > -1e-5 && m[2] < 1e-5 && m[2] > -1e-5) {
            var sx = m[0];
            var sy = m[3];
            var tx = m[4];
            var ty = m[5];
            target.x = source.x * sx + tx;
            target.y = source.y * sy + ty;
            target.width = source.width * sx;
            target.height = source.height * sy;
            if (target.width < 0) {
                target.x += target.width;
                target.width = -target.width;
            }
            if (target.height < 0) {
                target.y += target.height;
                target.height = -target.height;
            }
            return;
        }
        lt.x = lb.x = source.x;
        lt.y = rt.y = source.y;
        rb.x = rt.x = source.x + source.width;
        rb.y = lb.y = source.y + source.height;
        lt.transform(m);
        rt.transform(m);
        rb.transform(m);
        lb.transform(m);
        target.x = mathMin$2(lt.x, rb.x, lb.x, rt.x);
        target.y = mathMin$2(lt.y, rb.y, lb.y, rt.y);
        var maxX = mathMax$2(lt.x, rb.x, lb.x, rt.x);
        var maxY = mathMax$2(lt.y, rb.y, lb.y, rt.y);
        target.width = maxX - target.x;
        target.height = maxY - target.y;
    };
    return BoundingRect;
}());

var textWidthCache = {};
var DEFAULT_FONT = '12px sans-serif';
var _ctx;
var _cachedFont;
function defaultMeasureText(text, font) {
    if (!_ctx) {
        _ctx = createCanvas().getContext('2d');
    }
    if (_cachedFont !== font) {
        _cachedFont = _ctx.font = font || DEFAULT_FONT;
    }
    return _ctx.measureText(text);
}
var methods = {
    measureText: defaultMeasureText
};
function getWidth(text, font) {
    font = font || DEFAULT_FONT;
    var cacheOfFont = textWidthCache[font];
    if (!cacheOfFont) {
        cacheOfFont = textWidthCache[font] = new LRU(500);
    }
    var width = cacheOfFont.get(text);
    if (width == null) {
        width = methods.measureText(text, font).width;
        cacheOfFont.put(text, width);
    }
    return width;
}
function innerGetBoundingRect(text, font, textAlign, textBaseline) {
    var width = getWidth(text, font);
    var height = getLineHeight(font);
    var x = adjustTextX(0, width, textAlign);
    var y = adjustTextY(0, height, textBaseline);
    var rect = new BoundingRect(x, y, width, height);
    return rect;
}
function getBoundingRect(text, font, textAlign, textBaseline) {
    var textLines = ((text || '') + '').split('\n');
    var len = textLines.length;
    if (len === 1) {
        return innerGetBoundingRect(textLines[0], font, textAlign, textBaseline);
    }
    else {
        var uniondRect = new BoundingRect(0, 0, 0, 0);
        for (var i = 0; i < textLines.length; i++) {
            var rect = innerGetBoundingRect(textLines[i], font, textAlign, textBaseline);
            i === 0 ? uniondRect.copy(rect) : uniondRect.union(rect);
        }
        return uniondRect;
    }
}
function adjustTextX(x, width, textAlign) {
    if (textAlign === 'right') {
        x -= width;
    }
    else if (textAlign === 'center') {
        x -= width / 2;
    }
    return x;
}
function adjustTextY(y, height, verticalAlign) {
    if (verticalAlign === 'middle') {
        y -= height / 2;
    }
    else if (verticalAlign === 'bottom') {
        y -= height;
    }
    return y;
}
function getLineHeight(font) {
    return getWidth('国', font);
}
function parsePercent(value, maxValue) {
    if (typeof value === 'string') {
        if (value.lastIndexOf('%') >= 0) {
            return parseFloat(value) / 100 * maxValue;
        }
        return parseFloat(value);
    }
    return value;
}
function calculateTextPosition(out, opts, rect) {
    var textPosition = opts.position || 'inside';
    var distance = opts.distance != null ? opts.distance : 5;
    var height = rect.height;
    var width = rect.width;
    var halfHeight = height / 2;
    var x = rect.x;
    var y = rect.y;
    var textAlign = 'left';
    var textVerticalAlign = 'top';
    if (textPosition instanceof Array) {
        x += parsePercent(textPosition[0], rect.width);
        y += parsePercent(textPosition[1], rect.height);
        textAlign = null;
        textVerticalAlign = null;
    }
    else {
        switch (textPosition) {
            case 'left':
                x -= distance;
                y += halfHeight;
                textAlign = 'right';
                textVerticalAlign = 'middle';
                break;
            case 'right':
                x += distance + width;
                y += halfHeight;
                textVerticalAlign = 'middle';
                break;
            case 'top':
                x += width / 2;
                y -= distance;
                textAlign = 'center';
                textVerticalAlign = 'bottom';
                break;
            case 'bottom':
                x += width / 2;
                y += height + distance;
                textAlign = 'center';
                break;
            case 'inside':
                x += width / 2;
                y += halfHeight;
                textAlign = 'center';
                textVerticalAlign = 'middle';
                break;
            case 'insideLeft':
                x += distance;
                y += halfHeight;
                textVerticalAlign = 'middle';
                break;
            case 'insideRight':
                x += width - distance;
                y += halfHeight;
                textAlign = 'right';
                textVerticalAlign = 'middle';
                break;
            case 'insideTop':
                x += width / 2;
                y += distance;
                textAlign = 'center';
                break;
            case 'insideBottom':
                x += width / 2;
                y += height - distance;
                textAlign = 'center';
                textVerticalAlign = 'bottom';
                break;
            case 'insideTopLeft':
                x += distance;
                y += distance;
                break;
            case 'insideTopRight':
                x += width - distance;
                y += distance;
                textAlign = 'right';
                break;
            case 'insideBottomLeft':
                x += distance;
                y += height - distance;
                textVerticalAlign = 'bottom';
                break;
            case 'insideBottomRight':
                x += width - distance;
                y += height - distance;
                textAlign = 'right';
                textVerticalAlign = 'bottom';
                break;
        }
    }
    out = out || {};
    out.x = x;
    out.y = y;
    out.align = textAlign;
    out.verticalAlign = textVerticalAlign;
    return out;
}

function create(x, y) {
    if (x == null) {
        x = 0;
    }
    if (y == null) {
        y = 0;
    }
    return [x, y];
}
function copy(out, v) {
    out[0] = v[0];
    out[1] = v[1];
    return out;
}
function clone(v) {
    return [v[0], v[1]];
}
function set(out, a, b) {
    out[0] = a;
    out[1] = b;
    return out;
}
function add(out, v1, v2) {
    out[0] = v1[0] + v2[0];
    out[1] = v1[1] + v2[1];
    return out;
}
function scaleAndAdd(out, v1, v2, a) {
    out[0] = v1[0] + v2[0] * a;
    out[1] = v1[1] + v2[1] * a;
    return out;
}
function sub(out, v1, v2) {
    out[0] = v1[0] - v2[0];
    out[1] = v1[1] - v2[1];
    return out;
}
function len(v) {
    return Math.sqrt(lenSquare(v));
}
var length = len;
function lenSquare(v) {
    return v[0] * v[0] + v[1] * v[1];
}
var lengthSquare = lenSquare;
function mul(out, v1, v2) {
    out[0] = v1[0] * v2[0];
    out[1] = v1[1] * v2[1];
    return out;
}
function div(out, v1, v2) {
    out[0] = v1[0] / v2[0];
    out[1] = v1[1] / v2[1];
    return out;
}
function dot(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1];
}
function scale(out, v, s) {
    out[0] = v[0] * s;
    out[1] = v[1] * s;
    return out;
}
function normalize(out, v) {
    var d = len(v);
    if (d === 0) {
        out[0] = 0;
        out[1] = 0;
    }
    else {
        out[0] = v[0] / d;
        out[1] = v[1] / d;
    }
    return out;
}
function distance(v1, v2) {
    return Math.sqrt((v1[0] - v2[0]) * (v1[0] - v2[0])
        + (v1[1] - v2[1]) * (v1[1] - v2[1]));
}
var dist = distance;
function distanceSquare(v1, v2) {
    return (v1[0] - v2[0]) * (v1[0] - v2[0])
        + (v1[1] - v2[1]) * (v1[1] - v2[1]);
}
var distSquare = distanceSquare;
function negate(out, v) {
    out[0] = -v[0];
    out[1] = -v[1];
    return out;
}
function lerp$1(out, v1, v2, t) {
    out[0] = v1[0] + t * (v2[0] - v1[0]);
    out[1] = v1[1] + t * (v2[1] - v1[1]);
    return out;
}
function applyTransform(out, v, m) {
    var x = v[0];
    var y = v[1];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
}
function min$1(out, v1, v2) {
    out[0] = Math.min(v1[0], v2[0]);
    out[1] = Math.min(v1[1], v2[1]);
    return out;
}
function max$1(out, v1, v2) {
    out[0] = Math.max(v1[0], v2[0]);
    out[1] = Math.max(v1[1], v2[1]);
    return out;
}

var vector = /*#__PURE__*/Object.freeze({
    __proto__: null,
    create: create,
    copy: copy,
    clone: clone,
    set: set,
    add: add,
    scaleAndAdd: scaleAndAdd,
    sub: sub,
    len: len,
    length: length,
    lenSquare: lenSquare,
    lengthSquare: lengthSquare,
    mul: mul,
    div: div,
    dot: dot,
    scale: scale,
    normalize: normalize,
    distance: distance,
    dist: dist,
    distanceSquare: distanceSquare,
    distSquare: distSquare,
    negate: negate,
    lerp: lerp$1,
    applyTransform: applyTransform,
    min: min$1,
    max: max$1
});

var mIdentity = identity;
var EPSILON$2 = 5e-5;
function isNotAroundZero$1(val) {
    return val > EPSILON$2 || val < -EPSILON$2;
}
var scaleTmp = [];
var tmpTransform = [];
var originTransform = create$1();
var abs = Math.abs;
var Transformable = (function () {
    function Transformable() {
    }
    Transformable.prototype.setPosition = function (arr) {
        this.x = arr[0];
        this.y = arr[1];
    };
    Transformable.prototype.setScale = function (arr) {
        this.scaleX = arr[0];
        this.scaleY = arr[1];
    };
    Transformable.prototype.setOrigin = function (arr) {
        this.originX = arr[0];
        this.originY = arr[1];
    };
    Transformable.prototype.needLocalTransform = function () {
        return isNotAroundZero$1(this.rotation)
            || isNotAroundZero$1(this.x)
            || isNotAroundZero$1(this.y)
            || isNotAroundZero$1(this.scaleX - 1)
            || isNotAroundZero$1(this.scaleY - 1);
    };
    Transformable.prototype.updateTransform = function () {
        var parent = this.parent;
        var parentHasTransform = parent && parent.transform;
        var needLocalTransform = this.needLocalTransform();
        var m = this.transform;
        if (!(needLocalTransform || parentHasTransform)) {
            m && mIdentity(m);
            return;
        }
        m = m || create$1();
        if (needLocalTransform) {
            this.getLocalTransform(m);
        }
        else {
            mIdentity(m);
        }
        if (parentHasTransform) {
            if (needLocalTransform) {
                mul$1(m, parent.transform, m);
            }
            else {
                copy$1(m, parent.transform);
            }
        }
        this.transform = m;
        this._resolveGlobalScaleRatio(m);
    };
    Transformable.prototype._resolveGlobalScaleRatio = function (m) {
        var globalScaleRatio = this.globalScaleRatio;
        if (globalScaleRatio != null && globalScaleRatio !== 1) {
            this.getGlobalScale(scaleTmp);
            var relX = scaleTmp[0] < 0 ? -1 : 1;
            var relY = scaleTmp[1] < 0 ? -1 : 1;
            var sx = ((scaleTmp[0] - relX) * globalScaleRatio + relX) / scaleTmp[0] || 0;
            var sy = ((scaleTmp[1] - relY) * globalScaleRatio + relY) / scaleTmp[1] || 0;
            m[0] *= sx;
            m[1] *= sx;
            m[2] *= sy;
            m[3] *= sy;
        }
        this.invTransform = this.invTransform || create$1();
        invert(this.invTransform, m);
    };
    Transformable.prototype.getLocalTransform = function (m) {
        return Transformable.getLocalTransform(this, m);
    };
    Transformable.prototype.getComputedTransform = function () {
        var transformNode = this;
        var ancestors = [];
        while (transformNode) {
            ancestors.push(transformNode);
            transformNode = transformNode.parent;
        }
        while (transformNode = ancestors.pop()) {
            transformNode.updateTransform();
        }
        return this.transform;
    };
    Transformable.prototype.setLocalTransform = function (m) {
        if (!m) {
            return;
        }
        var sx = m[0] * m[0] + m[1] * m[1];
        var sy = m[2] * m[2] + m[3] * m[3];
        if (isNotAroundZero$1(sx - 1)) {
            sx = Math.sqrt(sx);
        }
        if (isNotAroundZero$1(sy - 1)) {
            sy = Math.sqrt(sy);
        }
        if (m[0] < 0) {
            sx = -sx;
        }
        if (m[3] < 0) {
            sy = -sy;
        }
        this.rotation = Math.atan2(-m[1] / sy, m[0] / sx);
        if (sx < 0 && sy < 0) {
            this.rotation += Math.PI;
            sx = -sx;
            sy = -sy;
        }
        this.x = m[4];
        this.y = m[5];
        this.scaleX = sx;
        this.scaleY = sy;
    };
    Transformable.prototype.decomposeTransform = function () {
        if (!this.transform) {
            return;
        }
        var parent = this.parent;
        var m = this.transform;
        if (parent && parent.transform) {
            mul$1(tmpTransform, parent.invTransform, m);
            m = tmpTransform;
        }
        var ox = this.originX;
        var oy = this.originY;
        if (ox || oy) {
            originTransform[4] = ox;
            originTransform[5] = oy;
            mul$1(tmpTransform, m, originTransform);
            tmpTransform[4] -= ox;
            tmpTransform[5] -= oy;
            m = tmpTransform;
        }
        this.setLocalTransform(m);
    };
    Transformable.prototype.getGlobalScale = function (out) {
        var m = this.transform;
        out = out || [];
        if (!m) {
            out[0] = 1;
            out[1] = 1;
            return out;
        }
        out[0] = Math.sqrt(m[0] * m[0] + m[1] * m[1]);
        out[1] = Math.sqrt(m[2] * m[2] + m[3] * m[3]);
        if (m[0] < 0) {
            out[0] = -out[0];
        }
        if (m[3] < 0) {
            out[1] = -out[1];
        }
        return out;
    };
    Transformable.prototype.transformCoordToLocal = function (x, y) {
        var v2 = [x, y];
        var invTransform = this.invTransform;
        if (invTransform) {
            applyTransform(v2, v2, invTransform);
        }
        return v2;
    };
    Transformable.prototype.transformCoordToGlobal = function (x, y) {
        var v2 = [x, y];
        var transform = this.transform;
        if (transform) {
            applyTransform(v2, v2, transform);
        }
        return v2;
    };
    Transformable.prototype.getLineScale = function () {
        var m = this.transform;
        return m && abs(m[0] - 1) > 1e-10 && abs(m[3] - 1) > 1e-10
            ? Math.sqrt(abs(m[0] * m[3] - m[2] * m[1]))
            : 1;
    };
    Transformable.getLocalTransform = function (target, m) {
        m = m || [];
        mIdentity(m);
        var ox = target.originX || 0;
        var oy = target.originY || 0;
        var sx = target.scaleX;
        var sy = target.scaleY;
        var rotation = target.rotation || 0;
        var x = target.x;
        var y = target.y;
        m[4] -= ox;
        m[5] -= oy;
        m[0] *= sx;
        m[1] *= sy;
        m[2] *= sx;
        m[3] *= sy;
        m[4] *= sx;
        m[5] *= sy;
        if (rotation) {
            rotate(m, m, rotation);
        }
        m[4] += ox;
        m[5] += oy;
        m[4] += x;
        m[5] += y;
        return m;
    };
    Transformable.initDefaultProps = (function () {
        var proto = Transformable.prototype;
        proto.x = 0;
        proto.y = 0;
        proto.scaleX = 1;
        proto.scaleY = 1;
        proto.originX = 0;
        proto.originY = 0;
        proto.rotation = 0;
        proto.globalScaleRatio = 1;
    })();
    return Transformable;
}());

var easing = {
    linear: function (k) {
        return k;
    },
    quadraticIn: function (k) {
        return k * k;
    },
    quadraticOut: function (k) {
        return k * (2 - k);
    },
    quadraticInOut: function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k;
        }
        return -0.5 * (--k * (k - 2) - 1);
    },
    cubicIn: function (k) {
        return k * k * k;
    },
    cubicOut: function (k) {
        return --k * k * k + 1;
    },
    cubicInOut: function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k * k;
        }
        return 0.5 * ((k -= 2) * k * k + 2);
    },
    quarticIn: function (k) {
        return k * k * k * k;
    },
    quarticOut: function (k) {
        return 1 - (--k * k * k * k);
    },
    quarticInOut: function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k * k * k;
        }
        return -0.5 * ((k -= 2) * k * k * k - 2);
    },
    quinticIn: function (k) {
        return k * k * k * k * k;
    },
    quinticOut: function (k) {
        return --k * k * k * k * k + 1;
    },
    quinticInOut: function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k * k * k * k;
        }
        return 0.5 * ((k -= 2) * k * k * k * k + 2);
    },
    sinusoidalIn: function (k) {
        return 1 - Math.cos(k * Math.PI / 2);
    },
    sinusoidalOut: function (k) {
        return Math.sin(k * Math.PI / 2);
    },
    sinusoidalInOut: function (k) {
        return 0.5 * (1 - Math.cos(Math.PI * k));
    },
    exponentialIn: function (k) {
        return k === 0 ? 0 : Math.pow(1024, k - 1);
    },
    exponentialOut: function (k) {
        return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
    },
    exponentialInOut: function (k) {
        if (k === 0) {
            return 0;
        }
        if (k === 1) {
            return 1;
        }
        if ((k *= 2) < 1) {
            return 0.5 * Math.pow(1024, k - 1);
        }
        return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
    },
    circularIn: function (k) {
        return 1 - Math.sqrt(1 - k * k);
    },
    circularOut: function (k) {
        return Math.sqrt(1 - (--k * k));
    },
    circularInOut: function (k) {
        if ((k *= 2) < 1) {
            return -0.5 * (Math.sqrt(1 - k * k) - 1);
        }
        return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
    },
    elasticIn: function (k) {
        var s;
        var a = 0.1;
        var p = 0.4;
        if (k === 0) {
            return 0;
        }
        if (k === 1) {
            return 1;
        }
        if (!a || a < 1) {
            a = 1;
            s = p / 4;
        }
        else {
            s = p * Math.asin(1 / a) / (2 * Math.PI);
        }
        return -(a * Math.pow(2, 10 * (k -= 1))
            * Math.sin((k - s) * (2 * Math.PI) / p));
    },
    elasticOut: function (k) {
        var s;
        var a = 0.1;
        var p = 0.4;
        if (k === 0) {
            return 0;
        }
        if (k === 1) {
            return 1;
        }
        if (!a || a < 1) {
            a = 1;
            s = p / 4;
        }
        else {
            s = p * Math.asin(1 / a) / (2 * Math.PI);
        }
        return (a * Math.pow(2, -10 * k)
            * Math.sin((k - s) * (2 * Math.PI) / p) + 1);
    },
    elasticInOut: function (k) {
        var s;
        var a = 0.1;
        var p = 0.4;
        if (k === 0) {
            return 0;
        }
        if (k === 1) {
            return 1;
        }
        if (!a || a < 1) {
            a = 1;
            s = p / 4;
        }
        else {
            s = p * Math.asin(1 / a) / (2 * Math.PI);
        }
        if ((k *= 2) < 1) {
            return -0.5 * (a * Math.pow(2, 10 * (k -= 1))
                * Math.sin((k - s) * (2 * Math.PI) / p));
        }
        return a * Math.pow(2, -10 * (k -= 1))
            * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;
    },
    backIn: function (k) {
        var s = 1.70158;
        return k * k * ((s + 1) * k - s);
    },
    backOut: function (k) {
        var s = 1.70158;
        return --k * k * ((s + 1) * k + s) + 1;
    },
    backInOut: function (k) {
        var s = 1.70158 * 1.525;
        if ((k *= 2) < 1) {
            return 0.5 * (k * k * ((s + 1) * k - s));
        }
        return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
    },
    bounceIn: function (k) {
        return 1 - easing.bounceOut(1 - k);
    },
    bounceOut: function (k) {
        if (k < (1 / 2.75)) {
            return 7.5625 * k * k;
        }
        else if (k < (2 / 2.75)) {
            return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
        }
        else if (k < (2.5 / 2.75)) {
            return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
        }
        else {
            return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
        }
    },
    bounceInOut: function (k) {
        if (k < 0.5) {
            return easing.bounceIn(k * 2) * 0.5;
        }
        return easing.bounceOut(k * 2 - 1) * 0.5 + 0.5;
    }
};

var Clip = (function () {
    function Clip(opts) {
        this._initialized = false;
        this._startTime = 0;
        this._pausedTime = 0;
        this._paused = false;
        this._life = opts.life || 1000;
        this._delay = opts.delay || 0;
        this.loop = opts.loop == null ? false : opts.loop;
        this.gap = opts.gap || 0;
        this.easing = opts.easing || 'linear';
        this.onframe = opts.onframe;
        this.ondestroy = opts.ondestroy;
        this.onrestart = opts.onrestart;
    }
    Clip.prototype.step = function (globalTime, deltaTime) {
        if (!this._initialized) {
            this._startTime = globalTime + this._delay;
            this._initialized = true;
        }
        if (this._paused) {
            this._pausedTime += deltaTime;
            return;
        }
        var percent = (globalTime - this._startTime - this._pausedTime) / this._life;
        if (percent < 0) {
            percent = 0;
        }
        percent = Math.min(percent, 1);
        var easing$1 = this.easing;
        var easingFunc = typeof easing$1 === 'string'
            ? easing[easing$1] : easing$1;
        var schedule = typeof easingFunc === 'function'
            ? easingFunc(percent)
            : percent;
        this.onframe && this.onframe(schedule);
        if (percent === 1) {
            if (this.loop) {
                this._restart(globalTime);
                this.onrestart && this.onrestart();
            }
            else {
                return true;
            }
        }
        return false;
    };
    Clip.prototype._restart = function (globalTime) {
        var remainder = (globalTime - this._startTime - this._pausedTime) % this._life;
        this._startTime = globalTime - remainder + this.gap;
        this._pausedTime = 0;
    };
    Clip.prototype.pause = function () {
        this._paused = true;
    };
    Clip.prototype.resume = function () {
        this._paused = false;
    };
    return Clip;
}());

var kCSSColorTable = {
    'transparent': [0, 0, 0, 0], 'aliceblue': [240, 248, 255, 1],
    'antiquewhite': [250, 235, 215, 1], 'aqua': [0, 255, 255, 1],
    'aquamarine': [127, 255, 212, 1], 'azure': [240, 255, 255, 1],
    'beige': [245, 245, 220, 1], 'bisque': [255, 228, 196, 1],
    'black': [0, 0, 0, 1], 'blanchedalmond': [255, 235, 205, 1],
    'blue': [0, 0, 255, 1], 'blueviolet': [138, 43, 226, 1],
    'brown': [165, 42, 42, 1], 'burlywood': [222, 184, 135, 1],
    'cadetblue': [95, 158, 160, 1], 'chartreuse': [127, 255, 0, 1],
    'chocolate': [210, 105, 30, 1], 'coral': [255, 127, 80, 1],
    'cornflowerblue': [100, 149, 237, 1], 'cornsilk': [255, 248, 220, 1],
    'crimson': [220, 20, 60, 1], 'cyan': [0, 255, 255, 1],
    'darkblue': [0, 0, 139, 1], 'darkcyan': [0, 139, 139, 1],
    'darkgoldenrod': [184, 134, 11, 1], 'darkgray': [169, 169, 169, 1],
    'darkgreen': [0, 100, 0, 1], 'darkgrey': [169, 169, 169, 1],
    'darkkhaki': [189, 183, 107, 1], 'darkmagenta': [139, 0, 139, 1],
    'darkolivegreen': [85, 107, 47, 1], 'darkorange': [255, 140, 0, 1],
    'darkorchid': [153, 50, 204, 1], 'darkred': [139, 0, 0, 1],
    'darksalmon': [233, 150, 122, 1], 'darkseagreen': [143, 188, 143, 1],
    'darkslateblue': [72, 61, 139, 1], 'darkslategray': [47, 79, 79, 1],
    'darkslategrey': [47, 79, 79, 1], 'darkturquoise': [0, 206, 209, 1],
    'darkviolet': [148, 0, 211, 1], 'deeppink': [255, 20, 147, 1],
    'deepskyblue': [0, 191, 255, 1], 'dimgray': [105, 105, 105, 1],
    'dimgrey': [105, 105, 105, 1], 'dodgerblue': [30, 144, 255, 1],
    'firebrick': [178, 34, 34, 1], 'floralwhite': [255, 250, 240, 1],
    'forestgreen': [34, 139, 34, 1], 'fuchsia': [255, 0, 255, 1],
    'gainsboro': [220, 220, 220, 1], 'ghostwhite': [248, 248, 255, 1],
    'gold': [255, 215, 0, 1], 'goldenrod': [218, 165, 32, 1],
    'gray': [128, 128, 128, 1], 'green': [0, 128, 0, 1],
    'greenyellow': [173, 255, 47, 1], 'grey': [128, 128, 128, 1],
    'honeydew': [240, 255, 240, 1], 'hotpink': [255, 105, 180, 1],
    'indianred': [205, 92, 92, 1], 'indigo': [75, 0, 130, 1],
    'ivory': [255, 255, 240, 1], 'khaki': [240, 230, 140, 1],
    'lavender': [230, 230, 250, 1], 'lavenderblush': [255, 240, 245, 1],
    'lawngreen': [124, 252, 0, 1], 'lemonchiffon': [255, 250, 205, 1],
    'lightblue': [173, 216, 230, 1], 'lightcoral': [240, 128, 128, 1],
    'lightcyan': [224, 255, 255, 1], 'lightgoldenrodyellow': [250, 250, 210, 1],
    'lightgray': [211, 211, 211, 1], 'lightgreen': [144, 238, 144, 1],
    'lightgrey': [211, 211, 211, 1], 'lightpink': [255, 182, 193, 1],
    'lightsalmon': [255, 160, 122, 1], 'lightseagreen': [32, 178, 170, 1],
    'lightskyblue': [135, 206, 250, 1], 'lightslategray': [119, 136, 153, 1],
    'lightslategrey': [119, 136, 153, 1], 'lightsteelblue': [176, 196, 222, 1],
    'lightyellow': [255, 255, 224, 1], 'lime': [0, 255, 0, 1],
    'limegreen': [50, 205, 50, 1], 'linen': [250, 240, 230, 1],
    'magenta': [255, 0, 255, 1], 'maroon': [128, 0, 0, 1],
    'mediumaquamarine': [102, 205, 170, 1], 'mediumblue': [0, 0, 205, 1],
    'mediumorchid': [186, 85, 211, 1], 'mediumpurple': [147, 112, 219, 1],
    'mediumseagreen': [60, 179, 113, 1], 'mediumslateblue': [123, 104, 238, 1],
    'mediumspringgreen': [0, 250, 154, 1], 'mediumturquoise': [72, 209, 204, 1],
    'mediumvioletred': [199, 21, 133, 1], 'midnightblue': [25, 25, 112, 1],
    'mintcream': [245, 255, 250, 1], 'mistyrose': [255, 228, 225, 1],
    'moccasin': [255, 228, 181, 1], 'navajowhite': [255, 222, 173, 1],
    'navy': [0, 0, 128, 1], 'oldlace': [253, 245, 230, 1],
    'olive': [128, 128, 0, 1], 'olivedrab': [107, 142, 35, 1],
    'orange': [255, 165, 0, 1], 'orangered': [255, 69, 0, 1],
    'orchid': [218, 112, 214, 1], 'palegoldenrod': [238, 232, 170, 1],
    'palegreen': [152, 251, 152, 1], 'paleturquoise': [175, 238, 238, 1],
    'palevioletred': [219, 112, 147, 1], 'papayawhip': [255, 239, 213, 1],
    'peachpuff': [255, 218, 185, 1], 'peru': [205, 133, 63, 1],
    'pink': [255, 192, 203, 1], 'plum': [221, 160, 221, 1],
    'powderblue': [176, 224, 230, 1], 'purple': [128, 0, 128, 1],
    'red': [255, 0, 0, 1], 'rosybrown': [188, 143, 143, 1],
    'royalblue': [65, 105, 225, 1], 'saddlebrown': [139, 69, 19, 1],
    'salmon': [250, 128, 114, 1], 'sandybrown': [244, 164, 96, 1],
    'seagreen': [46, 139, 87, 1], 'seashell': [255, 245, 238, 1],
    'sienna': [160, 82, 45, 1], 'silver': [192, 192, 192, 1],
    'skyblue': [135, 206, 235, 1], 'slateblue': [106, 90, 205, 1],
    'slategray': [112, 128, 144, 1], 'slategrey': [112, 128, 144, 1],
    'snow': [255, 250, 250, 1], 'springgreen': [0, 255, 127, 1],
    'steelblue': [70, 130, 180, 1], 'tan': [210, 180, 140, 1],
    'teal': [0, 128, 128, 1], 'thistle': [216, 191, 216, 1],
    'tomato': [255, 99, 71, 1], 'turquoise': [64, 224, 208, 1],
    'violet': [238, 130, 238, 1], 'wheat': [245, 222, 179, 1],
    'white': [255, 255, 255, 1], 'whitesmoke': [245, 245, 245, 1],
    'yellow': [255, 255, 0, 1], 'yellowgreen': [154, 205, 50, 1]
};
function clampCssByte(i) {
    i = Math.round(i);
    return i < 0 ? 0 : i > 255 ? 255 : i;
}
function clampCssAngle(i) {
    i = Math.round(i);
    return i < 0 ? 0 : i > 360 ? 360 : i;
}
function clampCssFloat(f) {
    return f < 0 ? 0 : f > 1 ? 1 : f;
}
function parseCssInt(val) {
    var str = val;
    if (str.length && str.charAt(str.length - 1) === '%') {
        return clampCssByte(parseFloat(str) / 100 * 255);
    }
    return clampCssByte(parseInt(str, 10));
}
function parseCssFloat(val) {
    var str = val;
    if (str.length && str.charAt(str.length - 1) === '%') {
        return clampCssFloat(parseFloat(str) / 100);
    }
    return clampCssFloat(parseFloat(str));
}
function cssHueToRgb(m1, m2, h) {
    if (h < 0) {
        h += 1;
    }
    else if (h > 1) {
        h -= 1;
    }
    if (h * 6 < 1) {
        return m1 + (m2 - m1) * h * 6;
    }
    if (h * 2 < 1) {
        return m2;
    }
    if (h * 3 < 2) {
        return m1 + (m2 - m1) * (2 / 3 - h) * 6;
    }
    return m1;
}
function lerpNumber(a, b, p) {
    return a + (b - a) * p;
}
function setRgba(out, r, g, b, a) {
    out[0] = r;
    out[1] = g;
    out[2] = b;
    out[3] = a;
    return out;
}
function copyRgba(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
}
var colorCache = new LRU(20);
var lastRemovedArr = null;
function putToCache(colorStr, rgbaArr) {
    if (lastRemovedArr) {
        copyRgba(lastRemovedArr, rgbaArr);
    }
    lastRemovedArr = colorCache.put(colorStr, lastRemovedArr || (rgbaArr.slice()));
}
function parse(colorStr, rgbaArr) {
    if (!colorStr) {
        return;
    }
    rgbaArr = rgbaArr || [];
    var cached = colorCache.get(colorStr);
    if (cached) {
        return copyRgba(rgbaArr, cached);
    }
    colorStr = colorStr + '';
    var str = colorStr.replace(/ /g, '').toLowerCase();
    if (str in kCSSColorTable) {
        copyRgba(rgbaArr, kCSSColorTable[str]);
        putToCache(colorStr, rgbaArr);
        return rgbaArr;
    }
    var strLen = str.length;
    if (str.charAt(0) === '#') {
        if (strLen === 4 || strLen === 5) {
            var iv = parseInt(str.slice(1, 4), 16);
            if (!(iv >= 0 && iv <= 0xfff)) {
                setRgba(rgbaArr, 0, 0, 0, 1);
                return;
            }
            setRgba(rgbaArr, ((iv & 0xf00) >> 4) | ((iv & 0xf00) >> 8), (iv & 0xf0) | ((iv & 0xf0) >> 4), (iv & 0xf) | ((iv & 0xf) << 4), strLen === 5 ? parseInt(str.slice(4), 16) / 0xf : 1);
            putToCache(colorStr, rgbaArr);
            return rgbaArr;
        }
        else if (strLen === 7 || strLen === 9) {
            var iv = parseInt(str.slice(1, 7), 16);
            if (!(iv >= 0 && iv <= 0xffffff)) {
                setRgba(rgbaArr, 0, 0, 0, 1);
                return;
            }
            setRgba(rgbaArr, (iv & 0xff0000) >> 16, (iv & 0xff00) >> 8, iv & 0xff, strLen === 9 ? parseInt(str.slice(7), 16) / 0xff : 1);
            putToCache(colorStr, rgbaArr);
            return rgbaArr;
        }
        return;
    }
    var op = str.indexOf('(');
    var ep = str.indexOf(')');
    if (op !== -1 && ep + 1 === strLen) {
        var fname = str.substr(0, op);
        var params = str.substr(op + 1, ep - (op + 1)).split(',');
        var alpha = 1;
        switch (fname) {
            case 'rgba':
                if (params.length !== 4) {
                    return params.length === 3
                        ? setRgba(rgbaArr, +params[0], +params[1], +params[2], 1)
                        : setRgba(rgbaArr, 0, 0, 0, 1);
                }
                alpha = parseCssFloat(params.pop());
            case 'rgb':
                if (params.length !== 3) {
                    setRgba(rgbaArr, 0, 0, 0, 1);
                    return;
                }
                setRgba(rgbaArr, parseCssInt(params[0]), parseCssInt(params[1]), parseCssInt(params[2]), alpha);
                putToCache(colorStr, rgbaArr);
                return rgbaArr;
            case 'hsla':
                if (params.length !== 4) {
                    setRgba(rgbaArr, 0, 0, 0, 1);
                    return;
                }
                params[3] = parseCssFloat(params[3]);
                hsla2rgba(params, rgbaArr);
                putToCache(colorStr, rgbaArr);
                return rgbaArr;
            case 'hsl':
                if (params.length !== 3) {
                    setRgba(rgbaArr, 0, 0, 0, 1);
                    return;
                }
                hsla2rgba(params, rgbaArr);
                putToCache(colorStr, rgbaArr);
                return rgbaArr;
            default:
                return;
        }
    }
    setRgba(rgbaArr, 0, 0, 0, 1);
    return;
}
function hsla2rgba(hsla, rgba) {
    var h = (((parseFloat(hsla[0]) % 360) + 360) % 360) / 360;
    var s = parseCssFloat(hsla[1]);
    var l = parseCssFloat(hsla[2]);
    var m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
    var m1 = l * 2 - m2;
    rgba = rgba || [];
    setRgba(rgba, clampCssByte(cssHueToRgb(m1, m2, h + 1 / 3) * 255), clampCssByte(cssHueToRgb(m1, m2, h) * 255), clampCssByte(cssHueToRgb(m1, m2, h - 1 / 3) * 255), 1);
    if (hsla.length === 4) {
        rgba[3] = hsla[3];
    }
    return rgba;
}
function rgba2hsla(rgba) {
    if (!rgba) {
        return;
    }
    var R = rgba[0] / 255;
    var G = rgba[1] / 255;
    var B = rgba[2] / 255;
    var vMin = Math.min(R, G, B);
    var vMax = Math.max(R, G, B);
    var delta = vMax - vMin;
    var L = (vMax + vMin) / 2;
    var H;
    var S;
    if (delta === 0) {
        H = 0;
        S = 0;
    }
    else {
        if (L < 0.5) {
            S = delta / (vMax + vMin);
        }
        else {
            S = delta / (2 - vMax - vMin);
        }
        var deltaR = (((vMax - R) / 6) + (delta / 2)) / delta;
        var deltaG = (((vMax - G) / 6) + (delta / 2)) / delta;
        var deltaB = (((vMax - B) / 6) + (delta / 2)) / delta;
        if (R === vMax) {
            H = deltaB - deltaG;
        }
        else if (G === vMax) {
            H = (1 / 3) + deltaR - deltaB;
        }
        else if (B === vMax) {
            H = (2 / 3) + deltaG - deltaR;
        }
        if (H < 0) {
            H += 1;
        }
        if (H > 1) {
            H -= 1;
        }
    }
    var hsla = [H * 360, S, L];
    if (rgba[3] != null) {
        hsla.push(rgba[3]);
    }
    return hsla;
}
function lift(color, level) {
    var colorArr = parse(color);
    if (colorArr) {
        for (var i = 0; i < 3; i++) {
            if (level < 0) {
                colorArr[i] = colorArr[i] * (1 - level) | 0;
            }
            else {
                colorArr[i] = ((255 - colorArr[i]) * level + colorArr[i]) | 0;
            }
            if (colorArr[i] > 255) {
                colorArr[i] = 255;
            }
            else if (colorArr[i] < 0) {
                colorArr[i] = 0;
            }
        }
        return stringify(colorArr, colorArr.length === 4 ? 'rgba' : 'rgb');
    }
}
function toHex(color) {
    var colorArr = parse(color);
    if (colorArr) {
        return ((1 << 24) + (colorArr[0] << 16) + (colorArr[1] << 8) + (+colorArr[2])).toString(16).slice(1);
    }
}
function fastLerp(normalizedValue, colors, out) {
    if (!(colors && colors.length)
        || !(normalizedValue >= 0 && normalizedValue <= 1)) {
        return;
    }
    out = out || [];
    var value = normalizedValue * (colors.length - 1);
    var leftIndex = Math.floor(value);
    var rightIndex = Math.ceil(value);
    var leftColor = colors[leftIndex];
    var rightColor = colors[rightIndex];
    var dv = value - leftIndex;
    out[0] = clampCssByte(lerpNumber(leftColor[0], rightColor[0], dv));
    out[1] = clampCssByte(lerpNumber(leftColor[1], rightColor[1], dv));
    out[2] = clampCssByte(lerpNumber(leftColor[2], rightColor[2], dv));
    out[3] = clampCssFloat(lerpNumber(leftColor[3], rightColor[3], dv));
    return out;
}
var fastMapToColor = fastLerp;
function lerp(normalizedValue, colors, fullOutput) {
    if (!(colors && colors.length)
        || !(normalizedValue >= 0 && normalizedValue <= 1)) {
        return;
    }
    var value = normalizedValue * (colors.length - 1);
    var leftIndex = Math.floor(value);
    var rightIndex = Math.ceil(value);
    var leftColor = parse(colors[leftIndex]);
    var rightColor = parse(colors[rightIndex]);
    var dv = value - leftIndex;
    var color = stringify([
        clampCssByte(lerpNumber(leftColor[0], rightColor[0], dv)),
        clampCssByte(lerpNumber(leftColor[1], rightColor[1], dv)),
        clampCssByte(lerpNumber(leftColor[2], rightColor[2], dv)),
        clampCssFloat(lerpNumber(leftColor[3], rightColor[3], dv))
    ], 'rgba');
    return fullOutput
        ? {
            color: color,
            leftIndex: leftIndex,
            rightIndex: rightIndex,
            value: value
        }
        : color;
}
var mapToColor = lerp;
function modifyHSL(color, h, s, l) {
    var colorArr = parse(color);
    if (color) {
        colorArr = rgba2hsla(colorArr);
        h != null && (colorArr[0] = clampCssAngle(h));
        s != null && (colorArr[1] = parseCssFloat(s));
        l != null && (colorArr[2] = parseCssFloat(l));
        return stringify(hsla2rgba(colorArr), 'rgba');
    }
}
function modifyAlpha(color, alpha) {
    var colorArr = parse(color);
    if (colorArr && alpha != null) {
        colorArr[3] = clampCssFloat(alpha);
        return stringify(colorArr, 'rgba');
    }
}
function stringify(arrColor, type) {
    if (!arrColor || !arrColor.length) {
        return;
    }
    var colorStr = arrColor[0] + ',' + arrColor[1] + ',' + arrColor[2];
    if (type === 'rgba' || type === 'hsva' || type === 'hsla') {
        colorStr += ',' + arrColor[3];
    }
    return type + '(' + colorStr + ')';
}
function lum(color, backgroundLum) {
    var arr = parse(color);
    return arr
        ? (0.299 * arr[0] + 0.587 * arr[1] + 0.114 * arr[2]) * arr[3] / 255
            + (1 - arr[3]) * backgroundLum
        : 0;
}
function random() {
    var r = Math.round(Math.random() * 255);
    var g = Math.round(Math.random() * 255);
    var b = Math.round(Math.random() * 255);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

var color = /*#__PURE__*/Object.freeze({
    __proto__: null,
    parse: parse,
    lift: lift,
    toHex: toHex,
    fastLerp: fastLerp,
    fastMapToColor: fastMapToColor,
    lerp: lerp,
    mapToColor: mapToColor,
    modifyHSL: modifyHSL,
    modifyAlpha: modifyAlpha,
    stringify: stringify,
    lum: lum,
    random: random
});

var arraySlice = Array.prototype.slice;
function interpolateNumber(p0, p1, percent) {
    return (p1 - p0) * percent + p0;
}
function step(p0, p1, percent) {
    return percent > 0.5 ? p1 : p0;
}
function interpolate1DArray(out, p0, p1, percent) {
    var len = p0.length;
    for (var i = 0; i < len; i++) {
        out[i] = interpolateNumber(p0[i], p1[i], percent);
    }
}
function interpolate2DArray(out, p0, p1, percent) {
    var len = p0.length;
    var len2 = len && p0[0].length;
    for (var i = 0; i < len; i++) {
        if (!out[i]) {
            out[i] = [];
        }
        for (var j = 0; j < len2; j++) {
            out[i][j] = interpolateNumber(p0[i][j], p1[i][j], percent);
        }
    }
}
function add1DArray(out, p0, p1, sign) {
    var len = p0.length;
    for (var i = 0; i < len; i++) {
        out[i] = p0[i] + p1[i] * sign;
    }
    return out;
}
function add2DArray(out, p0, p1, sign) {
    var len = p0.length;
    var len2 = len && p0[0].length;
    for (var i = 0; i < len; i++) {
        if (!out[i]) {
            out[i] = [];
        }
        for (var j = 0; j < len2; j++) {
            out[i][j] = p0[i][j] + p1[i][j] * sign;
        }
    }
    return out;
}
function fillArray(val0, val1, arrDim) {
    var arr0 = val0;
    var arr1 = val1;
    if (!arr0.push || !arr1.push) {
        return;
    }
    var arr0Len = arr0.length;
    var arr1Len = arr1.length;
    if (arr0Len !== arr1Len) {
        var isPreviousLarger = arr0Len > arr1Len;
        if (isPreviousLarger) {
            arr0.length = arr1Len;
        }
        else {
            for (var i = arr0Len; i < arr1Len; i++) {
                arr0.push(arrDim === 1 ? arr1[i] : arraySlice.call(arr1[i]));
            }
        }
    }
    var len2 = arr0[0] && arr0[0].length;
    for (var i = 0; i < arr0.length; i++) {
        if (arrDim === 1) {
            if (isNaN(arr0[i])) {
                arr0[i] = arr1[i];
            }
        }
        else {
            for (var j = 0; j < len2; j++) {
                if (isNaN(arr0[i][j])) {
                    arr0[i][j] = arr1[i][j];
                }
            }
        }
    }
}
function is1DArraySame(arr0, arr1) {
    var len = arr0.length;
    if (len !== arr1.length) {
        return false;
    }
    for (var i = 0; i < len; i++) {
        if (arr0[i] !== arr1[i]) {
            return false;
        }
    }
    return true;
}
function catmullRomInterpolate(p0, p1, p2, p3, t, t2, t3) {
    var v0 = (p2 - p0) * 0.5;
    var v1 = (p3 - p1) * 0.5;
    return (2 * (p1 - p2) + v0 + v1) * t3
        + (-3 * (p1 - p2) - 2 * v0 - v1) * t2
        + v0 * t + p1;
}
function catmullRomInterpolate1DArray(out, p0, p1, p2, p3, t, t2, t3) {
    var len = p0.length;
    for (var i = 0; i < len; i++) {
        out[i] = catmullRomInterpolate(p0[i], p1[i], p2[i], p3[i], t, t2, t3);
    }
}
function catmullRomInterpolate2DArray(out, p0, p1, p2, p3, t, t2, t3) {
    var len = p0.length;
    var len2 = p0[0].length;
    for (var i = 0; i < len; i++) {
        if (!out[i]) {
            out[1] = [];
        }
        for (var j = 0; j < len2; j++) {
            out[i][j] = catmullRomInterpolate(p0[i][j], p1[i][j], p2[i][j], p3[i][j], t, t2, t3);
        }
    }
}
function cloneValue(value) {
    if (isArrayLike(value)) {
        var len = value.length;
        if (isArrayLike(value[0])) {
            var ret = [];
            for (var i = 0; i < len; i++) {
                ret.push(arraySlice.call(value[i]));
            }
            return ret;
        }
        return arraySlice.call(value);
    }
    return value;
}
function rgba2String(rgba) {
    rgba[0] = Math.floor(rgba[0]);
    rgba[1] = Math.floor(rgba[1]);
    rgba[2] = Math.floor(rgba[2]);
    return 'rgba(' + rgba.join(',') + ')';
}
function guessArrayDim(value) {
    return isArrayLike(value && value[0]) ? 2 : 1;
}
var tmpRgba = [0, 0, 0, 0];
var Track = (function () {
    function Track(propName) {
        this.keyframes = [];
        this.maxTime = 0;
        this.arrDim = 0;
        this.interpolable = true;
        this._needsSort = false;
        this._isAllValueEqual = true;
        this._lastFrame = 0;
        this._lastFramePercent = 0;
        this.propName = propName;
    }
    Track.prototype.isFinished = function () {
        return this._finished;
    };
    Track.prototype.setFinished = function () {
        this._finished = true;
        if (this._additiveTrack) {
            this._additiveTrack.setFinished();
        }
    };
    Track.prototype.needsAnimate = function () {
        return !this._isAllValueEqual && this.keyframes.length >= 2 && this.interpolable;
    };
    Track.prototype.getAdditiveTrack = function () {
        return this._additiveTrack;
    };
    Track.prototype.addKeyframe = function (time, value) {
        if (time >= this.maxTime) {
            this.maxTime = time;
        }
        else {
            this._needsSort = true;
        }
        var keyframes = this.keyframes;
        var len = keyframes.length;
        if (this.interpolable) {
            if (isArrayLike(value)) {
                var arrayDim = guessArrayDim(value);
                if (len > 0 && this.arrDim !== arrayDim) {
                    this.interpolable = false;
                    return;
                }
                if (arrayDim === 1 && typeof value[0] !== 'number'
                    || arrayDim === 2 && typeof value[0][0] !== 'number') {
                    this.interpolable = false;
                    return;
                }
                if (len > 0) {
                    var lastFrame = keyframes[len - 1];
                    if (this._isAllValueEqual) {
                        if (arrayDim === 1) {
                            if (!is1DArraySame(value, lastFrame.value)) {
                                this._isAllValueEqual = false;
                            }
                        }
                        else {
                            this._isAllValueEqual = false;
                        }
                    }
                }
                this.arrDim = arrayDim;
            }
            else {
                if (this.arrDim > 0) {
                    this.interpolable = false;
                    return;
                }
                if (typeof value === 'string') {
                    var colorArray = parse(value);
                    if (colorArray) {
                        value = colorArray;
                        this.isValueColor = true;
                    }
                    else {
                        this.interpolable = false;
                    }
                }
                else if (typeof value !== 'number') {
                    this.interpolable = false;
                    return;
                }
                if (this._isAllValueEqual && len > 0) {
                    var lastFrame = keyframes[len - 1];
                    if (this.isValueColor && !is1DArraySame(lastFrame.value, value)) {
                        this._isAllValueEqual = false;
                    }
                    else if (lastFrame.value !== value) {
                        this._isAllValueEqual = false;
                    }
                }
            }
        }
        var kf = {
            time: time,
            value: value,
            percent: 0
        };
        this.keyframes.push(kf);
        return kf;
    };
    Track.prototype.prepare = function (additiveTrack) {
        var kfs = this.keyframes;
        if (this._needsSort) {
            kfs.sort(function (a, b) {
                return a.time - b.time;
            });
        }
        var arrDim = this.arrDim;
        var kfsLen = kfs.length;
        var lastKf = kfs[kfsLen - 1];
        for (var i = 0; i < kfsLen; i++) {
            kfs[i].percent = kfs[i].time / this.maxTime;
            if (arrDim > 0 && i !== kfsLen - 1) {
                fillArray(kfs[i].value, lastKf.value, arrDim);
            }
        }
        if (additiveTrack
            && this.needsAnimate()
            && additiveTrack.needsAnimate()
            && arrDim === additiveTrack.arrDim
            && this.isValueColor === additiveTrack.isValueColor
            && !additiveTrack._finished) {
            this._additiveTrack = additiveTrack;
            var startValue = kfs[0].value;
            for (var i = 0; i < kfsLen; i++) {
                if (arrDim === 0) {
                    if (this.isValueColor) {
                        kfs[i].additiveValue
                            = add1DArray([], kfs[i].value, startValue, -1);
                    }
                    else {
                        kfs[i].additiveValue = kfs[i].value - startValue;
                    }
                }
                else if (arrDim === 1) {
                    kfs[i].additiveValue = add1DArray([], kfs[i].value, startValue, -1);
                }
                else if (arrDim === 2) {
                    kfs[i].additiveValue = add2DArray([], kfs[i].value, startValue, -1);
                }
            }
        }
    };
    Track.prototype.step = function (target, percent) {
        if (this._finished) {
            return;
        }
        if (this._additiveTrack && this._additiveTrack._finished) {
            this._additiveTrack = null;
        }
        var isAdditive = this._additiveTrack != null;
        var valueKey = isAdditive ? 'additiveValue' : 'value';
        var keyframes = this.keyframes;
        var kfsNum = this.keyframes.length;
        var propName = this.propName;
        var arrDim = this.arrDim;
        var isValueColor = this.isValueColor;
        var frameIdx;
        if (percent < 0) {
            frameIdx = 0;
        }
        else if (percent < this._lastFramePercent) {
            var start = Math.min(this._lastFrame + 1, kfsNum - 1);
            for (frameIdx = start; frameIdx >= 0; frameIdx--) {
                if (keyframes[frameIdx].percent <= percent) {
                    break;
                }
            }
            frameIdx = Math.min(frameIdx, kfsNum - 2);
        }
        else {
            for (frameIdx = this._lastFrame; frameIdx < kfsNum; frameIdx++) {
                if (keyframes[frameIdx].percent > percent) {
                    break;
                }
            }
            frameIdx = Math.min(frameIdx - 1, kfsNum - 2);
        }
        var nextFrame = keyframes[frameIdx + 1];
        var frame = keyframes[frameIdx];
        if (!(frame && nextFrame)) {
            return;
        }
        this._lastFrame = frameIdx;
        this._lastFramePercent = percent;
        var range = (nextFrame.percent - frame.percent);
        if (range === 0) {
            return;
        }
        var w = (percent - frame.percent) / range;
        var targetArr = isAdditive ? this._additiveValue
            : (isValueColor ? tmpRgba : target[propName]);
        if ((arrDim > 0 || isValueColor) && !targetArr) {
            targetArr = this._additiveValue = [];
        }
        if (this.useSpline) {
            var p1 = keyframes[frameIdx][valueKey];
            var p0 = keyframes[frameIdx === 0 ? frameIdx : frameIdx - 1][valueKey];
            var p2 = keyframes[frameIdx > kfsNum - 2 ? kfsNum - 1 : frameIdx + 1][valueKey];
            var p3 = keyframes[frameIdx > kfsNum - 3 ? kfsNum - 1 : frameIdx + 2][valueKey];
            if (arrDim > 0) {
                arrDim === 1
                    ? catmullRomInterpolate1DArray(targetArr, p0, p1, p2, p3, w, w * w, w * w * w)
                    : catmullRomInterpolate2DArray(targetArr, p0, p1, p2, p3, w, w * w, w * w * w);
            }
            else if (isValueColor) {
                catmullRomInterpolate1DArray(targetArr, p0, p1, p2, p3, w, w * w, w * w * w);
                if (!isAdditive) {
                    target[propName] = rgba2String(targetArr);
                }
            }
            else {
                var value = void 0;
                if (!this.interpolable) {
                    value = p2;
                }
                else {
                    value = catmullRomInterpolate(p0, p1, p2, p3, w, w * w, w * w * w);
                }
                if (isAdditive) {
                    this._additiveValue = value;
                }
                else {
                    target[propName] = value;
                }
            }
        }
        else {
            if (arrDim > 0) {
                arrDim === 1
                    ? interpolate1DArray(targetArr, frame[valueKey], nextFrame[valueKey], w)
                    : interpolate2DArray(targetArr, frame[valueKey], nextFrame[valueKey], w);
            }
            else if (isValueColor) {
                interpolate1DArray(targetArr, frame[valueKey], nextFrame[valueKey], w);
                if (!isAdditive) {
                    target[propName] = rgba2String(targetArr);
                }
            }
            else {
                var value = void 0;
                if (!this.interpolable) {
                    value = step(frame[valueKey], nextFrame[valueKey], w);
                }
                else {
                    value = interpolateNumber(frame[valueKey], nextFrame[valueKey], w);
                }
                if (isAdditive) {
                    this._additiveValue = value;
                }
                else {
                    target[propName] = value;
                }
            }
        }
        if (isAdditive) {
            this._addToTarget(target);
        }
    };
    Track.prototype._addToTarget = function (target) {
        var arrDim = this.arrDim;
        var propName = this.propName;
        var additiveValue = this._additiveValue;
        if (arrDim === 0) {
            if (this.isValueColor) {
                parse(target[propName], tmpRgba);
                add1DArray(tmpRgba, tmpRgba, additiveValue, 1);
                target[propName] = rgba2String(tmpRgba);
            }
            else {
                target[propName] = target[propName] + additiveValue;
            }
        }
        else if (arrDim === 1) {
            add1DArray(target[propName], target[propName], additiveValue, 1);
        }
        else if (arrDim === 2) {
            add2DArray(target[propName], target[propName], additiveValue, 1);
        }
    };
    return Track;
}());
var Animator = (function () {
    function Animator(target, loop, additiveTo) {
        this._tracks = {};
        this._trackKeys = [];
        this._delay = 0;
        this._maxTime = 0;
        this._paused = false;
        this._started = 0;
        this._clip = null;
        this._target = target;
        this._loop = loop;
        if (loop && additiveTo) {
            logError('Can\' use additive animation on looped animation.');
            return;
        }
        this._additiveAnimators = additiveTo;
    }
    Animator.prototype.getTarget = function () {
        return this._target;
    };
    Animator.prototype.changeTarget = function (target) {
        this._target = target;
    };
    Animator.prototype.when = function (time, props) {
        return this.whenWithKeys(time, props, keys(props));
    };
    Animator.prototype.whenWithKeys = function (time, props, propNames) {
        var tracks = this._tracks;
        for (var i = 0; i < propNames.length; i++) {
            var propName = propNames[i];
            var track = tracks[propName];
            if (!track) {
                track = tracks[propName] = new Track(propName);
                var initialValue = void 0;
                var additiveTrack = this._getAdditiveTrack(propName);
                if (additiveTrack) {
                    var lastFinalKf = additiveTrack.keyframes[additiveTrack.keyframes.length - 1];
                    initialValue = lastFinalKf && lastFinalKf.value;
                    if (additiveTrack.isValueColor && initialValue) {
                        initialValue = rgba2String(initialValue);
                    }
                }
                else {
                    initialValue = this._target[propName];
                }
                if (initialValue == null) {
                    continue;
                }
                if (time !== 0) {
                    track.addKeyframe(0, cloneValue(initialValue));
                }
                this._trackKeys.push(propName);
            }
            track.addKeyframe(time, cloneValue(props[propName]));
        }
        this._maxTime = Math.max(this._maxTime, time);
        return this;
    };
    Animator.prototype.pause = function () {
        this._clip.pause();
        this._paused = true;
    };
    Animator.prototype.resume = function () {
        this._clip.resume();
        this._paused = false;
    };
    Animator.prototype.isPaused = function () {
        return !!this._paused;
    };
    Animator.prototype._doneCallback = function () {
        this._setTracksFinished();
        this._clip = null;
        var doneList = this._doneList;
        if (doneList) {
            var len = doneList.length;
            for (var i = 0; i < len; i++) {
                doneList[i].call(this);
            }
        }
    };
    Animator.prototype._abortedCallback = function () {
        this._setTracksFinished();
        var animation = this.animation;
        var abortedList = this._abortedList;
        if (animation) {
            animation.removeClip(this._clip);
        }
        this._clip = null;
        if (abortedList) {
            for (var i = 0; i < abortedList.length; i++) {
                abortedList[i].call(this);
            }
        }
    };
    Animator.prototype._setTracksFinished = function () {
        var tracks = this._tracks;
        var tracksKeys = this._trackKeys;
        for (var i = 0; i < tracksKeys.length; i++) {
            tracks[tracksKeys[i]].setFinished();
        }
    };
    Animator.prototype._getAdditiveTrack = function (trackName) {
        var additiveTrack;
        var additiveAnimators = this._additiveAnimators;
        if (additiveAnimators) {
            for (var i = 0; i < additiveAnimators.length; i++) {
                var track = additiveAnimators[i].getTrack(trackName);
                if (track) {
                    additiveTrack = track;
                }
            }
        }
        return additiveTrack;
    };
    Animator.prototype.start = function (easing, forceAnimate) {
        if (this._started > 0) {
            return;
        }
        this._started = 1;
        var self = this;
        var tracks = [];
        for (var i = 0; i < this._trackKeys.length; i++) {
            var propName = this._trackKeys[i];
            var track = this._tracks[propName];
            var additiveTrack = this._getAdditiveTrack(propName);
            var kfs = track.keyframes;
            track.prepare(additiveTrack);
            if (track.needsAnimate()) {
                tracks.push(track);
            }
            else if (!track.interpolable) {
                var lastKf = kfs[kfs.length - 1];
                if (lastKf) {
                    self._target[track.propName] = lastKf.value;
                }
            }
        }
        if (tracks.length || forceAnimate) {
            var clip = new Clip({
                life: this._maxTime,
                loop: this._loop,
                delay: this._delay,
                onframe: function (percent) {
                    self._started = 2;
                    var additiveAnimators = self._additiveAnimators;
                    if (additiveAnimators) {
                        var stillHasAdditiveAnimator = false;
                        for (var i = 0; i < additiveAnimators.length; i++) {
                            if (additiveAnimators[i]._clip) {
                                stillHasAdditiveAnimator = true;
                                break;
                            }
                        }
                        if (!stillHasAdditiveAnimator) {
                            self._additiveAnimators = null;
                        }
                    }
                    for (var i = 0; i < tracks.length; i++) {
                        tracks[i].step(self._target, percent);
                    }
                    var onframeList = self._onframeList;
                    if (onframeList) {
                        for (var i = 0; i < onframeList.length; i++) {
                            onframeList[i](self._target, percent);
                        }
                    }
                },
                ondestroy: function () {
                    self._doneCallback();
                }
            });
            this._clip = clip;
            if (this.animation) {
                this.animation.addClip(clip);
            }
            if (easing && easing !== 'spline') {
                clip.easing = easing;
            }
        }
        else {
            this._doneCallback();
        }
        return this;
    };
    Animator.prototype.stop = function (forwardToLast) {
        if (!this._clip) {
            return;
        }
        var clip = this._clip;
        if (forwardToLast) {
            clip.onframe(1);
        }
        this._abortedCallback();
    };
    Animator.prototype.delay = function (time) {
        this._delay = time;
        return this;
    };
    Animator.prototype.during = function (cb) {
        if (cb) {
            if (!this._onframeList) {
                this._onframeList = [];
            }
            this._onframeList.push(cb);
        }
        return this;
    };
    Animator.prototype.done = function (cb) {
        if (cb) {
            if (!this._doneList) {
                this._doneList = [];
            }
            this._doneList.push(cb);
        }
        return this;
    };
    Animator.prototype.aborted = function (cb) {
        if (cb) {
            if (!this._abortedList) {
                this._abortedList = [];
            }
            this._abortedList.push(cb);
        }
        return this;
    };
    Animator.prototype.getClip = function () {
        return this._clip;
    };
    Animator.prototype.getTrack = function (propName) {
        return this._tracks[propName];
    };
    Animator.prototype.stopTracks = function (propNames, forwardToLast) {
        if (!propNames.length || !this._clip) {
            return true;
        }
        var tracks = this._tracks;
        var tracksKeys = this._trackKeys;
        for (var i = 0; i < propNames.length; i++) {
            var track = tracks[propNames[i]];
            if (track) {
                if (forwardToLast) {
                    track.step(this._target, 1);
                }
                else if (this._started === 1) {
                    track.step(this._target, 0);
                }
                track.setFinished();
            }
        }
        var allAborted = true;
        for (var i = 0; i < tracksKeys.length; i++) {
            if (!tracks[tracksKeys[i]].isFinished()) {
                allAborted = false;
                break;
            }
        }
        if (allAborted) {
            this._abortedCallback();
        }
        return allAborted;
    };
    Animator.prototype.saveFinalToTarget = function (target, trackKeys) {
        if (!target) {
            return;
        }
        trackKeys = trackKeys || this._trackKeys;
        for (var i = 0; i < trackKeys.length; i++) {
            var propName = trackKeys[i];
            var track = this._tracks[propName];
            if (!track || track.isFinished()) {
                continue;
            }
            var kfs = track.keyframes;
            var lastKf = kfs[kfs.length - 1];
            if (lastKf) {
                var val = cloneValue(lastKf.value);
                if (track.isValueColor) {
                    val = rgba2String(val);
                }
                target[propName] = val;
            }
        }
    };
    Animator.prototype.__changeFinalValue = function (finalProps, trackKeys) {
        trackKeys = trackKeys || keys(finalProps);
        for (var i = 0; i < trackKeys.length; i++) {
            var propName = trackKeys[i];
            var track = this._tracks[propName];
            if (!track) {
                continue;
            }
            var kfs = track.keyframes;
            if (kfs.length > 1) {
                var lastKf = kfs.pop();
                track.addKeyframe(lastKf.time, finalProps[propName]);
                track.prepare(track.getAdditiveTrack());
            }
        }
    };
    return Animator;
}());

var Eventful = (function () {
    function Eventful(eventProcessors) {
        if (eventProcessors) {
            this._$eventProcessor = eventProcessors;
        }
    }
    Eventful.prototype.on = function (event, query, handler, context) {
        if (!this._$handlers) {
            this._$handlers = {};
        }
        var _h = this._$handlers;
        if (typeof query === 'function') {
            context = handler;
            handler = query;
            query = null;
        }
        if (!handler || !event) {
            return this;
        }
        var eventProcessor = this._$eventProcessor;
        if (query != null && eventProcessor && eventProcessor.normalizeQuery) {
            query = eventProcessor.normalizeQuery(query);
        }
        if (!_h[event]) {
            _h[event] = [];
        }
        for (var i = 0; i < _h[event].length; i++) {
            if (_h[event][i].h === handler) {
                return this;
            }
        }
        var wrap = {
            h: handler,
            query: query,
            ctx: (context || this),
            callAtLast: handler.zrEventfulCallAtLast
        };
        var lastIndex = _h[event].length - 1;
        var lastWrap = _h[event][lastIndex];
        (lastWrap && lastWrap.callAtLast)
            ? _h[event].splice(lastIndex, 0, wrap)
            : _h[event].push(wrap);
        return this;
    };
    Eventful.prototype.isSilent = function (eventName) {
        var _h = this._$handlers;
        return !_h || !_h[eventName] || !_h[eventName].length;
    };
    Eventful.prototype.off = function (eventType, handler) {
        var _h = this._$handlers;
        if (!_h) {
            return this;
        }
        if (!eventType) {
            this._$handlers = {};
            return this;
        }
        if (handler) {
            if (_h[eventType]) {
                var newList = [];
                for (var i = 0, l = _h[eventType].length; i < l; i++) {
                    if (_h[eventType][i].h !== handler) {
                        newList.push(_h[eventType][i]);
                    }
                }
                _h[eventType] = newList;
            }
            if (_h[eventType] && _h[eventType].length === 0) {
                delete _h[eventType];
            }
        }
        else {
            delete _h[eventType];
        }
        return this;
    };
    Eventful.prototype.trigger = function (eventType) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!this._$handlers) {
            return this;
        }
        var _h = this._$handlers[eventType];
        var eventProcessor = this._$eventProcessor;
        if (_h) {
            var argLen = args.length;
            var len = _h.length;
            for (var i = 0; i < len; i++) {
                var hItem = _h[i];
                if (eventProcessor
                    && eventProcessor.filter
                    && hItem.query != null
                    && !eventProcessor.filter(eventType, hItem.query)) {
                    continue;
                }
                switch (argLen) {
                    case 0:
                        hItem.h.call(hItem.ctx);
                        break;
                    case 1:
                        hItem.h.call(hItem.ctx, args[0]);
                        break;
                    case 2:
                        hItem.h.call(hItem.ctx, args[0], args[1]);
                        break;
                    default:
                        hItem.h.apply(hItem.ctx, args);
                        break;
                }
            }
        }
        eventProcessor && eventProcessor.afterTrigger
            && eventProcessor.afterTrigger(eventType);
        return this;
    };
    Eventful.prototype.triggerWithContext = function (type) {
        if (!this._$handlers) {
            return this;
        }
        var _h = this._$handlers[type];
        var eventProcessor = this._$eventProcessor;
        if (_h) {
            var args = arguments;
            var argLen = args.length;
            var ctx = args[argLen - 1];
            var len = _h.length;
            for (var i = 0; i < len; i++) {
                var hItem = _h[i];
                if (eventProcessor
                    && eventProcessor.filter
                    && hItem.query != null
                    && !eventProcessor.filter(type, hItem.query)) {
                    continue;
                }
                switch (argLen) {
                    case 0:
                        hItem.h.call(ctx);
                        break;
                    case 1:
                        hItem.h.call(ctx, args[0]);
                        break;
                    case 2:
                        hItem.h.call(ctx, args[0], args[1]);
                        break;
                    default:
                        hItem.h.apply(ctx, args.slice(1, argLen - 1));
                        break;
                }
            }
        }
        eventProcessor && eventProcessor.afterTrigger
            && eventProcessor.afterTrigger(type);
        return this;
    };
    return Eventful;
}());

var dpr = 1;
if (typeof window !== 'undefined') {
    dpr = Math.max(window.devicePixelRatio
        || (window.screen && window.screen.deviceXDPI / window.screen.logicalXDPI)
        || 1, 1);
}
var devicePixelRatio = dpr;
var DARK_MODE_THRESHOLD = 0.4;
var DARK_LABEL_COLOR = '#333';
var LIGHT_LABEL_COLOR = '#ccc';
var LIGHTER_LABEL_COLOR = '#eee';

var PRESERVED_NORMAL_STATE = '__zr_normal__';
var PRIMARY_STATES_KEYS$1 = ['x', 'y', 'scaleX', 'scaleY', 'originX', 'originY', 'rotation', 'ignore'];
var DEFAULT_ANIMATABLE_MAP = {
    x: true,
    y: true,
    scaleX: true,
    scaleY: true,
    originX: true,
    originY: true,
    rotation: true,
    ignore: false
};
var tmpTextPosCalcRes = {};
var tmpBoundingRect = new BoundingRect(0, 0, 0, 0);
var Element = (function () {
    function Element(props) {
        this.id = guid();
        this.animators = [];
        this.currentStates = [];
        this.states = {};
        this._init(props);
    }
    Element.prototype._init = function (props) {
        this.attr(props);
    };
    Element.prototype.drift = function (dx, dy, e) {
        switch (this.draggable) {
            case 'horizontal':
                dy = 0;
                break;
            case 'vertical':
                dx = 0;
                break;
        }
        var m = this.transform;
        if (!m) {
            m = this.transform = [1, 0, 0, 1, 0, 0];
        }
        m[4] += dx;
        m[5] += dy;
        this.decomposeTransform();
        this.markRedraw();
    };
    Element.prototype.beforeUpdate = function () { };
    Element.prototype.afterUpdate = function () { };
    Element.prototype.update = function () {
        this.updateTransform();
        if (this.__dirty) {
            this.updateInnerText();
        }
    };
    Element.prototype.updateInnerText = function (forceUpdate) {
        var textEl = this._textContent;
        if (textEl && (!textEl.ignore || forceUpdate)) {
            if (!this.textConfig) {
                this.textConfig = {};
            }
            var textConfig = this.textConfig;
            var isLocal = textConfig.local;
            var attachedTransform = textEl.attachedTransform;
            var textAlign = void 0;
            var textVerticalAlign = void 0;
            var textStyleChanged = false;
            if (isLocal) {
                attachedTransform.parent = this;
            }
            else {
                attachedTransform.parent = null;
            }
            var innerOrigin = false;
            attachedTransform.x = textEl.x;
            attachedTransform.y = textEl.y;
            attachedTransform.originX = textEl.originX;
            attachedTransform.originY = textEl.originY;
            attachedTransform.rotation = textEl.rotation;
            attachedTransform.scaleX = textEl.scaleX;
            attachedTransform.scaleY = textEl.scaleY;
            if (textConfig.position != null) {
                var layoutRect = tmpBoundingRect;
                if (textConfig.layoutRect) {
                    layoutRect.copy(textConfig.layoutRect);
                }
                else {
                    layoutRect.copy(this.getBoundingRect());
                }
                if (!isLocal) {
                    layoutRect.applyTransform(this.transform);
                }
                if (this.calculateTextPosition) {
                    this.calculateTextPosition(tmpTextPosCalcRes, textConfig, layoutRect);
                }
                else {
                    calculateTextPosition(tmpTextPosCalcRes, textConfig, layoutRect);
                }
                attachedTransform.x = tmpTextPosCalcRes.x;
                attachedTransform.y = tmpTextPosCalcRes.y;
                textAlign = tmpTextPosCalcRes.align;
                textVerticalAlign = tmpTextPosCalcRes.verticalAlign;
                var textOrigin = textConfig.origin;
                if (textOrigin && textConfig.rotation != null) {
                    var relOriginX = void 0;
                    var relOriginY = void 0;
                    if (textOrigin === 'center') {
                        relOriginX = layoutRect.width * 0.5;
                        relOriginY = layoutRect.height * 0.5;
                    }
                    else {
                        relOriginX = parsePercent(textOrigin[0], layoutRect.width);
                        relOriginY = parsePercent(textOrigin[1], layoutRect.height);
                    }
                    innerOrigin = true;
                    attachedTransform.originX = -attachedTransform.x + relOriginX + (isLocal ? 0 : layoutRect.x);
                    attachedTransform.originY = -attachedTransform.y + relOriginY + (isLocal ? 0 : layoutRect.y);
                }
            }
            if (textConfig.rotation != null) {
                attachedTransform.rotation = textConfig.rotation;
            }
            var textOffset = textConfig.offset;
            if (textOffset) {
                attachedTransform.x += textOffset[0];
                attachedTransform.y += textOffset[1];
                if (!innerOrigin) {
                    attachedTransform.originX = -textOffset[0];
                    attachedTransform.originY = -textOffset[1];
                }
            }
            var isInside = textConfig.inside == null
                ? (typeof textConfig.position === 'string' && textConfig.position.indexOf('inside') >= 0)
                : textConfig.inside;
            var innerTextDefaultStyle = this._innerTextDefaultStyle || (this._innerTextDefaultStyle = {});
            var textFill = void 0;
            var textStroke = void 0;
            var autoStroke = void 0;
            if (isInside && this.canBeInsideText()) {
                textFill = textConfig.insideFill;
                textStroke = textConfig.insideStroke;
                if (textFill == null || textFill === 'auto') {
                    textFill = this.getInsideTextFill();
                }
                if (textStroke == null || textStroke === 'auto') {
                    textStroke = this.getInsideTextStroke(textFill);
                    autoStroke = true;
                }
            }
            else {
                textFill = textConfig.outsideFill;
                textStroke = textConfig.outsideStroke;
                if (textFill == null || textFill === 'auto') {
                    textFill = this.getOutsideFill();
                }
                if (textStroke == null || textStroke === 'auto') {
                    textStroke = this.getOutsideStroke(textFill);
                    autoStroke = true;
                }
            }
            textFill = textFill || '#000';
            if (textFill !== innerTextDefaultStyle.fill
                || textStroke !== innerTextDefaultStyle.stroke
                || autoStroke !== innerTextDefaultStyle.autoStroke
                || textAlign !== innerTextDefaultStyle.align
                || textVerticalAlign !== innerTextDefaultStyle.verticalAlign) {
                textStyleChanged = true;
                innerTextDefaultStyle.fill = textFill;
                innerTextDefaultStyle.stroke = textStroke;
                innerTextDefaultStyle.autoStroke = autoStroke;
                innerTextDefaultStyle.align = textAlign;
                innerTextDefaultStyle.verticalAlign = textVerticalAlign;
                textEl.setDefaultTextStyle(innerTextDefaultStyle);
            }
            if (textStyleChanged) {
                textEl.dirtyStyle();
            }
            textEl.markRedraw();
        }
    };
    Element.prototype.canBeInsideText = function () {
        return true;
    };
    Element.prototype.getInsideTextFill = function () {
        return '#fff';
    };
    Element.prototype.getInsideTextStroke = function (textFill) {
        return '#000';
    };
    Element.prototype.getOutsideFill = function () {
        return this.__zr && this.__zr.isDarkMode() ? LIGHT_LABEL_COLOR : DARK_LABEL_COLOR;
    };
    Element.prototype.getOutsideStroke = function (textFill) {
        var backgroundColor = this.__zr && this.__zr.getBackgroundColor();
        var colorArr = typeof backgroundColor === 'string' && parse(backgroundColor);
        if (!colorArr) {
            colorArr = [255, 255, 255, 1];
        }
        var alpha = colorArr[3];
        var isDark = this.__zr.isDarkMode();
        for (var i = 0; i < 3; i++) {
            colorArr[i] = colorArr[i] * alpha + (isDark ? 0 : 255) * (1 - alpha);
        }
        colorArr[3] = 1;
        return stringify(colorArr, 'rgba');
    };
    Element.prototype.traverse = function (cb, context) { };
    Element.prototype.attrKV = function (key, value) {
        if (key === 'textConfig') {
            this.setTextConfig(value);
        }
        else if (key === 'textContent') {
            this.setTextContent(value);
        }
        else if (key === 'clipPath') {
            this.setClipPath(value);
        }
        else if (key === 'extra') {
            this.extra = this.extra || {};
            extend(this.extra, value);
        }
        else {
            this[key] = value;
        }
    };
    Element.prototype.hide = function () {
        this.ignore = true;
        this.markRedraw();
    };
    Element.prototype.show = function () {
        this.ignore = false;
        this.markRedraw();
    };
    Element.prototype.attr = function (keyOrObj, value) {
        if (typeof keyOrObj === 'string') {
            this.attrKV(keyOrObj, value);
        }
        else if (isObject(keyOrObj)) {
            var obj = keyOrObj;
            var keysArr = keys(obj);
            for (var i = 0; i < keysArr.length; i++) {
                var key = keysArr[i];
                this.attrKV(key, keyOrObj[key]);
            }
        }
        this.markRedraw();
        return this;
    };
    Element.prototype.saveCurrentToNormalState = function (toState) {
        this._innerSaveToNormal(toState);
        var normalState = this._normalState;
        for (var i = 0; i < this.animators.length; i++) {
            var animator = this.animators[i];
            var fromStateTransition = animator.__fromStateTransition;
            if (fromStateTransition && fromStateTransition !== PRESERVED_NORMAL_STATE) {
                continue;
            }
            var targetName = animator.targetName;
            var target = targetName
                ? normalState[targetName] : normalState;
            animator.saveFinalToTarget(target);
        }
    };
    Element.prototype._innerSaveToNormal = function (toState) {
        var normalState = this._normalState;
        if (!normalState) {
            normalState = this._normalState = {};
        }
        if (toState.textConfig && !normalState.textConfig) {
            normalState.textConfig = this.textConfig;
        }
        this._savePrimaryToNormal(toState, normalState, PRIMARY_STATES_KEYS$1);
    };
    Element.prototype._savePrimaryToNormal = function (toState, normalState, primaryKeys) {
        for (var i = 0; i < primaryKeys.length; i++) {
            var key = primaryKeys[i];
            if (toState[key] != null && !(key in normalState)) {
                normalState[key] = this[key];
            }
        }
    };
    Element.prototype.hasState = function () {
        return this.currentStates.length > 0;
    };
    Element.prototype.getState = function (name) {
        return this.states[name];
    };
    Element.prototype.ensureState = function (name) {
        var states = this.states;
        if (!states[name]) {
            states[name] = {};
        }
        return states[name];
    };
    Element.prototype.clearStates = function (noAnimation) {
        this.useState(PRESERVED_NORMAL_STATE, false, noAnimation);
    };
    Element.prototype.useState = function (stateName, keepCurrentStates, noAnimation) {
        var toNormalState = stateName === PRESERVED_NORMAL_STATE;
        var hasStates = this.hasState();
        if (!hasStates && toNormalState) {
            return;
        }
        var currentStates = this.currentStates;
        var animationCfg = this.stateTransition;
        if (indexOf(currentStates, stateName) >= 0 && (keepCurrentStates || currentStates.length === 1)) {
            return;
        }
        var state;
        if (this.stateProxy && !toNormalState) {
            state = this.stateProxy(stateName);
        }
        if (!state) {
            state = (this.states && this.states[stateName]);
        }
        if (!state && !toNormalState) {
            logError("State " + stateName + " not exists.");
            return;
        }
        if (!toNormalState) {
            this.saveCurrentToNormalState(state);
        }
        var useHoverLayer = !!(state && state.hoverLayer);
        if (useHoverLayer) {
            this._toggleHoverLayerFlag(true);
        }
        this._applyStateObj(stateName, state, this._normalState, keepCurrentStates, !noAnimation && !this.__inHover && animationCfg && animationCfg.duration > 0, animationCfg);
        if (this._textContent) {
            this._textContent.useState(stateName, keepCurrentStates);
        }
        if (this._textGuide) {
            this._textGuide.useState(stateName, keepCurrentStates);
        }
        if (toNormalState) {
            this.currentStates = [];
            this._normalState = {};
        }
        else {
            if (!keepCurrentStates) {
                this.currentStates = [stateName];
            }
            else {
                this.currentStates.push(stateName);
            }
        }
        this._updateAnimationTargets();
        this.markRedraw();
        if (!useHoverLayer && this.__inHover) {
            this._toggleHoverLayerFlag(false);
            this.__dirty &= ~Element.REDARAW_BIT;
        }
        return state;
    };
    Element.prototype.useStates = function (states, noAnimation) {
        if (!states.length) {
            this.clearStates();
        }
        else {
            var stateObjects = [];
            var currentStates = this.currentStates;
            var len = states.length;
            var notChange = len === currentStates.length;
            if (notChange) {
                for (var i = 0; i < len; i++) {
                    if (states[i] !== currentStates[i]) {
                        notChange = false;
                        break;
                    }
                }
            }
            if (notChange) {
                return;
            }
            for (var i = 0; i < len; i++) {
                var stateName = states[i];
                var stateObj = void 0;
                if (this.stateProxy) {
                    stateObj = this.stateProxy(stateName, states);
                }
                if (!stateObj) {
                    stateObj = this.states[stateName];
                }
                if (stateObj) {
                    stateObjects.push(stateObj);
                }
            }
            var useHoverLayer = !!(stateObjects[len - 1] && stateObjects[len - 1].hoverLayer);
            if (useHoverLayer) {
                this._toggleHoverLayerFlag(true);
            }
            var mergedState = this._mergeStates(stateObjects);
            var animationCfg = this.stateTransition;
            this.saveCurrentToNormalState(mergedState);
            this._applyStateObj(states.join(','), mergedState, this._normalState, false, !noAnimation && !this.__inHover && animationCfg && animationCfg.duration > 0, animationCfg);
            if (this._textContent) {
                this._textContent.useStates(states);
            }
            if (this._textGuide) {
                this._textGuide.useStates(states);
            }
            this._updateAnimationTargets();
            this.currentStates = states.slice();
            this.markRedraw();
            if (!useHoverLayer && this.__inHover) {
                this._toggleHoverLayerFlag(false);
                this.__dirty &= ~Element.REDARAW_BIT;
            }
        }
    };
    Element.prototype._updateAnimationTargets = function () {
        for (var i = 0; i < this.animators.length; i++) {
            var animator = this.animators[i];
            if (animator.targetName) {
                animator.changeTarget(this[animator.targetName]);
            }
        }
    };
    Element.prototype.removeState = function (state) {
        var idx = indexOf(this.currentStates, state);
        if (idx >= 0) {
            var currentStates = this.currentStates.slice();
            currentStates.splice(idx, 1);
            this.useStates(currentStates);
        }
    };
    Element.prototype.replaceState = function (oldState, newState, forceAdd) {
        var currentStates = this.currentStates.slice();
        var idx = indexOf(currentStates, oldState);
        var newStateExists = indexOf(currentStates, newState) >= 0;
        if (idx >= 0) {
            if (!newStateExists) {
                currentStates[idx] = newState;
            }
            else {
                currentStates.splice(idx, 1);
            }
        }
        else if (forceAdd && !newStateExists) {
            currentStates.push(newState);
        }
        this.useStates(currentStates);
    };
    Element.prototype.toggleState = function (state, enable) {
        if (enable) {
            this.useState(state, true);
        }
        else {
            this.removeState(state);
        }
    };
    Element.prototype._mergeStates = function (states) {
        var mergedState = {};
        var mergedTextConfig;
        for (var i = 0; i < states.length; i++) {
            var state = states[i];
            extend(mergedState, state);
            if (state.textConfig) {
                mergedTextConfig = mergedTextConfig || {};
                extend(mergedTextConfig, state.textConfig);
            }
        }
        if (mergedTextConfig) {
            mergedState.textConfig = mergedTextConfig;
        }
        return mergedState;
    };
    Element.prototype._applyStateObj = function (stateName, state, normalState, keepCurrentStates, transition, animationCfg) {
        var needsRestoreToNormal = !(state && keepCurrentStates);
        if (state && state.textConfig) {
            this.textConfig = extend({}, keepCurrentStates ? this.textConfig : normalState.textConfig);
            extend(this.textConfig, state.textConfig);
        }
        else if (needsRestoreToNormal) {
            if (normalState.textConfig) {
                this.textConfig = normalState.textConfig;
            }
        }
        var transitionTarget = {};
        var hasTransition = false;
        for (var i = 0; i < PRIMARY_STATES_KEYS$1.length; i++) {
            var key = PRIMARY_STATES_KEYS$1[i];
            var propNeedsTransition = transition && DEFAULT_ANIMATABLE_MAP[key];
            if (state && state[key] != null) {
                if (propNeedsTransition) {
                    hasTransition = true;
                    transitionTarget[key] = state[key];
                }
                else {
                    this[key] = state[key];
                }
            }
            else if (needsRestoreToNormal) {
                if (normalState[key] != null) {
                    if (propNeedsTransition) {
                        hasTransition = true;
                        transitionTarget[key] = normalState[key];
                    }
                    else {
                        this[key] = normalState[key];
                    }
                }
            }
        }
        if (!transition) {
            for (var i = 0; i < this.animators.length; i++) {
                var animator = this.animators[i];
                var targetName = animator.targetName;
                animator.__changeFinalValue(targetName
                    ? (state || normalState)[targetName]
                    : (state || normalState));
            }
        }
        if (hasTransition) {
            this._transitionState(stateName, transitionTarget, animationCfg);
        }
    };
    Element.prototype._attachComponent = function (componentEl) {
        if (componentEl.__zr && !componentEl.__hostTarget) {
            throw new Error('Text element has been added to zrender.');
        }
        if (componentEl === this) {
            throw new Error('Recursive component attachment.');
        }
        var zr = this.__zr;
        if (zr) {
            componentEl.addSelfToZr(zr);
        }
        componentEl.__zr = zr;
        componentEl.__hostTarget = this;
    };
    Element.prototype._detachComponent = function (componentEl) {
        if (componentEl.__zr) {
            componentEl.removeSelfFromZr(componentEl.__zr);
        }
        componentEl.__zr = null;
        componentEl.__hostTarget = null;
    };
    Element.prototype.getClipPath = function () {
        return this._clipPath;
    };
    Element.prototype.setClipPath = function (clipPath) {
        if (this._clipPath && this._clipPath !== clipPath) {
            this.removeClipPath();
        }
        this._attachComponent(clipPath);
        this._clipPath = clipPath;
        this.markRedraw();
    };
    Element.prototype.removeClipPath = function () {
        var clipPath = this._clipPath;
        if (clipPath) {
            this._detachComponent(clipPath);
            this._clipPath = null;
            this.markRedraw();
        }
    };
    Element.prototype.getTextContent = function () {
        return this._textContent;
    };
    Element.prototype.setTextContent = function (textEl) {
        var previousTextContent = this._textContent;
        if (previousTextContent === textEl) {
            return;
        }
        if (previousTextContent && previousTextContent !== textEl) {
            this.removeTextContent();
        }
        if (textEl.__zr && !textEl.__hostTarget) {
            throw new Error('Text element has been added to zrender.');
        }
        textEl.attachedTransform = new Transformable();
        this._attachComponent(textEl);
        this._textContent = textEl;
        this.markRedraw();
    };
    Element.prototype.setTextConfig = function (cfg) {
        if (!this.textConfig) {
            this.textConfig = {};
        }
        extend(this.textConfig, cfg);
        this.markRedraw();
    };
    Element.prototype.removeTextContent = function () {
        var textEl = this._textContent;
        if (textEl) {
            textEl.attachedTransform = null;
            this._detachComponent(textEl);
            this._textContent = null;
            this._innerTextDefaultStyle = null;
            this.markRedraw();
        }
    };
    Element.prototype.getTextGuideLine = function () {
        return this._textGuide;
    };
    Element.prototype.setTextGuideLine = function (guideLine) {
        if (this._textGuide && this._textGuide !== guideLine) {
            this.removeTextGuideLine();
        }
        this._attachComponent(guideLine);
        this._textGuide = guideLine;
        this.markRedraw();
    };
    Element.prototype.removeTextGuideLine = function () {
        var textGuide = this._textGuide;
        if (textGuide) {
            this._detachComponent(textGuide);
            this._textGuide = null;
            this.markRedraw();
        }
    };
    Element.prototype.markRedraw = function () {
        this.__dirty |= Element.REDARAW_BIT;
        var zr = this.__zr;
        if (zr) {
            if (this.__inHover) {
                zr.refreshHover();
            }
            else {
                zr.refresh();
            }
        }
        if (this.__hostTarget) {
            this.__hostTarget.markRedraw();
        }
    };
    Element.prototype.dirty = function () {
        this.markRedraw();
    };
    Element.prototype._toggleHoverLayerFlag = function (inHover) {
        this.__inHover = inHover;
        var textContent = this._textContent;
        var textGuide = this._textGuide;
        if (textContent) {
            textContent.__inHover = inHover;
        }
        if (textGuide) {
            textGuide.__inHover = inHover;
        }
    };
    Element.prototype.addSelfToZr = function (zr) {
        this.__zr = zr;
        var animators = this.animators;
        if (animators) {
            for (var i = 0; i < animators.length; i++) {
                zr.animation.addAnimator(animators[i]);
            }
        }
        if (this._clipPath) {
            this._clipPath.addSelfToZr(zr);
        }
        if (this._textContent) {
            this._textContent.addSelfToZr(zr);
        }
        if (this._textGuide) {
            this._textGuide.addSelfToZr(zr);
        }
    };
    Element.prototype.removeSelfFromZr = function (zr) {
        this.__zr = null;
        var animators = this.animators;
        if (animators) {
            for (var i = 0; i < animators.length; i++) {
                zr.animation.removeAnimator(animators[i]);
            }
        }
        if (this._clipPath) {
            this._clipPath.removeSelfFromZr(zr);
        }
        if (this._textContent) {
            this._textContent.removeSelfFromZr(zr);
        }
        if (this._textGuide) {
            this._textGuide.removeSelfFromZr(zr);
        }
    };
    Element.prototype.animate = function (key, loop) {
        var target = key ? this[key] : this;
        if (!target) {
            logError('Property "'
                + key
                + '" is not existed in element '
                + this.id);
            return;
        }
        var animator = new Animator(target, loop);
        this.addAnimator(animator, key);
        return animator;
    };
    Element.prototype.addAnimator = function (animator, key) {
        var zr = this.__zr;
        var el = this;
        animator.during(function () {
            el.updateDuringAnimation(key);
        }).done(function () {
            var animators = el.animators;
            var idx = indexOf(animators, animator);
            if (idx >= 0) {
                animators.splice(idx, 1);
            }
        });
        this.animators.push(animator);
        if (zr) {
            zr.animation.addAnimator(animator);
        }
        zr && zr.wakeUp();
    };
    Element.prototype.updateDuringAnimation = function (key) {
        this.markRedraw();
    };
    Element.prototype.stopAnimation = function (scope, forwardToLast) {
        var animators = this.animators;
        var len = animators.length;
        var leftAnimators = [];
        for (var i = 0; i < len; i++) {
            var animator = animators[i];
            if (!scope || scope === animator.scope) {
                animator.stop(forwardToLast);
            }
            else {
                leftAnimators.push(animator);
            }
        }
        this.animators = leftAnimators;
        return this;
    };
    Element.prototype.animateTo = function (target, cfg, animationProps) {
        animateTo(this, target, cfg, animationProps);
    };
    Element.prototype.animateFrom = function (target, cfg, animationProps) {
        animateTo(this, target, cfg, animationProps, true);
    };
    Element.prototype._transitionState = function (stateName, target, cfg, animationProps) {
        var animators = animateTo(this, target, cfg, animationProps);
        for (var i = 0; i < animators.length; i++) {
            animators[i].__fromStateTransition = stateName;
        }
    };
    Element.prototype.getBoundingRect = function () {
        return null;
    };
    Element.prototype.getPaintRect = function () {
        return null;
    };
    Element.REDARAW_BIT = 1;
    Element.initDefaultProps = (function () {
        var elProto = Element.prototype;
        elProto.type = 'element';
        elProto.name = '';
        elProto.ignore = false;
        elProto.silent = false;
        elProto.isGroup = false;
        elProto.draggable = false;
        elProto.dragging = false;
        elProto.ignoreClip = false;
        elProto.__inHover = false;
        elProto.__dirty = Element.REDARAW_BIT;
        var logs = {};
        function logDeprecatedError(key, xKey, yKey) {
            if (!logs[key + xKey + yKey]) {
                console.warn("DEPRECATED: '" + key + "' has been deprecated. use '" + xKey + "', '" + yKey + "' instead");
                logs[key + xKey + yKey] = true;
            }
        }
        function createLegacyProperty(key, privateKey, xKey, yKey) {
            Object.defineProperty(elProto, key, {
                get: function () {
                    logDeprecatedError(key, xKey, yKey);
                    if (!this[privateKey]) {
                        var pos = this[privateKey] = [];
                        enhanceArray(this, pos);
                    }
                    return this[privateKey];
                },
                set: function (pos) {
                    logDeprecatedError(key, xKey, yKey);
                    this[xKey] = pos[0];
                    this[yKey] = pos[1];
                    this[privateKey] = pos;
                    enhanceArray(this, pos);
                }
            });
            function enhanceArray(self, pos) {
                Object.defineProperty(pos, 0, {
                    get: function () {
                        return self[xKey];
                    },
                    set: function (val) {
                        self[xKey] = val;
                    }
                });
                Object.defineProperty(pos, 1, {
                    get: function () {
                        return self[yKey];
                    },
                    set: function (val) {
                        self[yKey] = val;
                    }
                });
            }
        }
        if (Object.defineProperty && (!env.browser.ie || env.browser.version > 8)) {
            createLegacyProperty('position', '_legacyPos', 'x', 'y');
            createLegacyProperty('scale', '_legacyScale', 'scaleX', 'scaleY');
            createLegacyProperty('origin', '_legacyOrigin', 'originX', 'originY');
        }
    })();
    return Element;
}());
mixin(Element, Eventful);
mixin(Element, Transformable);
function animateTo(animatable, target, cfg, animationProps, reverse) {
    cfg = cfg || {};
    var animators = [];
    animateToShallow(animatable, '', animatable, target, cfg, animationProps, animators, reverse);
    var finishCount = animators.length;
    var doneHappened = false;
    var cfgDone = cfg.done;
    var cfgAborted = cfg.aborted;
    var doneCb = function () {
        doneHappened = true;
        finishCount--;
        if (finishCount <= 0) {
            doneHappened
                ? (cfgDone && cfgDone())
                : (cfgAborted && cfgAborted());
        }
    };
    var abortedCb = function () {
        finishCount--;
        if (finishCount <= 0) {
            doneHappened
                ? (cfgDone && cfgDone())
                : (cfgAborted && cfgAborted());
        }
    };
    if (!finishCount) {
        cfgDone && cfgDone();
    }
    if (animators.length > 0 && cfg.during) {
        animators[0].during(function (target, percent) {
            cfg.during(percent);
        });
    }
    for (var i = 0; i < animators.length; i++) {
        var animator = animators[i];
        if (doneCb) {
            animator.done(doneCb);
        }
        if (abortedCb) {
            animator.aborted(abortedCb);
        }
        animator.start(cfg.easing, cfg.force);
    }
    return animators;
}
function copyArrShallow(source, target, len) {
    for (var i = 0; i < len; i++) {
        source[i] = target[i];
    }
}
function is2DArray(value) {
    return isArrayLike(value[0]);
}
function copyValue(target, source, key) {
    if (isArrayLike(source[key])) {
        if (!isArrayLike(target[key])) {
            target[key] = [];
        }
        if (isTypedArray(source[key])) {
            var len = source[key].length;
            if (target[key].length !== len) {
                target[key] = new (source[key].constructor)(len);
                copyArrShallow(target[key], source[key], len);
            }
        }
        else {
            var sourceArr = source[key];
            var targetArr = target[key];
            var len0 = sourceArr.length;
            if (is2DArray(sourceArr)) {
                var len1 = sourceArr[0].length;
                for (var i = 0; i < len0; i++) {
                    if (!targetArr[i]) {
                        targetArr[i] = Array.prototype.slice.call(sourceArr[i]);
                    }
                    else {
                        copyArrShallow(targetArr[i], sourceArr[i], len1);
                    }
                }
            }
            else {
                copyArrShallow(targetArr, sourceArr, len0);
            }
            targetArr.length = sourceArr.length;
        }
    }
    else {
        target[key] = source[key];
    }
}
function animateToShallow(animatable, topKey, source, target, cfg, animationProps, animators, reverse) {
    var animatableKeys = [];
    var changedKeys = [];
    var targetKeys = keys(target);
    var duration = cfg.duration;
    var delay = cfg.delay;
    var additive = cfg.additive;
    var setToFinal = cfg.setToFinal;
    var animateAll = !isObject(animationProps);
    for (var k = 0; k < targetKeys.length; k++) {
        var innerKey = targetKeys[k];
        if (source[innerKey] != null
            && target[innerKey] != null
            && (animateAll || animationProps[innerKey])) {
            if (isObject(target[innerKey]) && !isArrayLike(target[innerKey])) {
                if (topKey) {
                    if (!reverse) {
                        source[innerKey] = target[innerKey];
                        animatable.updateDuringAnimation(topKey);
                    }
                    continue;
                }
                animateToShallow(animatable, innerKey, source[innerKey], target[innerKey], cfg, animationProps && animationProps[innerKey], animators, reverse);
            }
            else {
                animatableKeys.push(innerKey);
                changedKeys.push(innerKey);
            }
        }
        else if (!reverse) {
            source[innerKey] = target[innerKey];
            animatable.updateDuringAnimation(topKey);
            changedKeys.push(innerKey);
        }
    }
    var keyLen = animatableKeys.length;
    if (keyLen > 0
        || (cfg.force && !animators.length)) {
        var existsAnimators = animatable.animators;
        var existsAnimatorsOnSameTarget = [];
        for (var i = 0; i < existsAnimators.length; i++) {
            if (existsAnimators[i].targetName === topKey) {
                existsAnimatorsOnSameTarget.push(existsAnimators[i]);
            }
        }
        if (!additive && existsAnimatorsOnSameTarget.length) {
            for (var i = 0; i < existsAnimatorsOnSameTarget.length; i++) {
                var allAborted = existsAnimatorsOnSameTarget[i].stopTracks(changedKeys);
                if (allAborted) {
                    var idx = indexOf(existsAnimators, existsAnimatorsOnSameTarget[i]);
                    existsAnimators.splice(idx, 1);
                }
            }
        }
        var revertedSource = void 0;
        var reversedTarget = void 0;
        var sourceClone = void 0;
        if (reverse) {
            reversedTarget = {};
            if (setToFinal) {
                revertedSource = {};
            }
            for (var i = 0; i < keyLen; i++) {
                var innerKey = animatableKeys[i];
                reversedTarget[innerKey] = source[innerKey];
                if (setToFinal) {
                    revertedSource[innerKey] = target[innerKey];
                }
                else {
                    source[innerKey] = target[innerKey];
                }
            }
        }
        else if (setToFinal) {
            sourceClone = {};
            for (var i = 0; i < keyLen; i++) {
                var innerKey = animatableKeys[i];
                sourceClone[innerKey] = cloneValue(source[innerKey]);
                copyValue(source, target, innerKey);
            }
        }
        var animator = new Animator(source, false, additive ? existsAnimatorsOnSameTarget : null);
        animator.targetName = topKey;
        if (cfg.scope) {
            animator.scope = cfg.scope;
        }
        if (setToFinal && revertedSource) {
            animator.whenWithKeys(0, revertedSource, animatableKeys);
        }
        if (sourceClone) {
            animator.whenWithKeys(0, sourceClone, animatableKeys);
        }
        animator.whenWithKeys(duration == null ? 500 : duration, reverse ? reversedTarget : target, animatableKeys).delay(delay || 0);
        animatable.addAnimator(animator, topKey);
        animators.push(animator);
    }
}

var STYLE_MAGIC_KEY = '__zr_style_' + Math.round((Math.random() * 10));
var DEFAULT_COMMON_STYLE = {
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowColor: '#000',
    opacity: 1,
    blend: 'source-over'
};
var DEFAULT_COMMON_ANIMATION_PROPS = {
    style: {
        shadowBlur: true,
        shadowOffsetX: true,
        shadowOffsetY: true,
        shadowColor: true,
        opacity: true
    }
};
DEFAULT_COMMON_STYLE[STYLE_MAGIC_KEY] = true;
var PRIMARY_STATES_KEYS = ['z', 'z2', 'invisible'];
var Displayable = (function (_super) {
    __extends(Displayable, _super);
    function Displayable(props) {
        return _super.call(this, props) || this;
    }
    Displayable.prototype._init = function (props) {
        var keysArr = keys(props);
        for (var i = 0; i < keysArr.length; i++) {
            var key = keysArr[i];
            if (key === 'style') {
                this.useStyle(props[key]);
            }
            else {
                _super.prototype.attrKV.call(this, key, props[key]);
            }
        }
        if (!this.style) {
            this.useStyle({});
        }
    };
    Displayable.prototype.beforeBrush = function () { };
    Displayable.prototype.afterBrush = function () { };
    Displayable.prototype.innerBeforeBrush = function () { };
    Displayable.prototype.innerAfterBrush = function () { };
    Displayable.prototype.shouldBePainted = function (viewWidth, viewHeight, considerClipPath, considerAncestors) {
        var m = this.transform;
        if (this.ignore
            || this.invisible
            || this.style.opacity === 0
            || (this.culling
                && isDisplayableCulled(this, viewWidth, viewHeight))
            || (m && !m[0] && !m[3])) {
            return false;
        }
        if (considerClipPath && this.__clipPaths) {
            for (var i = 0; i < this.__clipPaths.length; ++i) {
                if (this.__clipPaths[i].isZeroArea()) {
                    return false;
                }
            }
        }
        if (considerAncestors && this.parent) {
            var parent_1 = this.parent;
            while (parent_1) {
                if (parent_1.ignore) {
                    return false;
                }
                parent_1 = parent_1.parent;
            }
        }
        return true;
    };
    Displayable.prototype.contain = function (x, y) {
        return this.rectContain(x, y);
    };
    Displayable.prototype.traverse = function (cb, context) {
        cb.call(context, this);
    };
    Displayable.prototype.rectContain = function (x, y) {
        var coord = this.transformCoordToLocal(x, y);
        var rect = this.getBoundingRect();
        return rect.contain(coord[0], coord[1]);
    };
    Displayable.prototype.getPaintRect = function () {
        var rect = this._paintRect;
        if (!this._paintRect || this.__dirty) {
            var transform = this.transform;
            var elRect = this.getBoundingRect();
            var style = this.style;
            var shadowSize = style.shadowBlur || 0;
            var shadowOffsetX = style.shadowOffsetX || 0;
            var shadowOffsetY = style.shadowOffsetY || 0;
            rect = this._paintRect || (this._paintRect = new BoundingRect(0, 0, 0, 0));
            if (transform) {
                BoundingRect.applyTransform(rect, elRect, transform);
            }
            else {
                rect.copy(elRect);
            }
            if (shadowSize || shadowOffsetX || shadowOffsetY) {
                rect.width += shadowSize * 2 + Math.abs(shadowOffsetX);
                rect.height += shadowSize * 2 + Math.abs(shadowOffsetY);
                rect.x = Math.min(rect.x, rect.x + shadowOffsetX - shadowSize);
                rect.y = Math.min(rect.y, rect.y + shadowOffsetY - shadowSize);
            }
            var tolerance = this.dirtyRectTolerance;
            if (!rect.isZero()) {
                rect.x = Math.floor(rect.x - tolerance);
                rect.y = Math.floor(rect.y - tolerance);
                rect.width = Math.ceil(rect.width + 1 + tolerance * 2);
                rect.height = Math.ceil(rect.height + 1 + tolerance * 2);
            }
        }
        return rect;
    };
    Displayable.prototype.setPrevPaintRect = function (paintRect) {
        if (paintRect) {
            this._prevPaintRect = this._prevPaintRect || new BoundingRect(0, 0, 0, 0);
            this._prevPaintRect.copy(paintRect);
        }
        else {
            this._prevPaintRect = null;
        }
    };
    Displayable.prototype.getPrevPaintRect = function () {
        return this._prevPaintRect;
    };
    Displayable.prototype.animateStyle = function (loop) {
        return this.animate('style', loop);
    };
    Displayable.prototype.updateDuringAnimation = function (targetKey) {
        if (targetKey === 'style') {
            this.dirtyStyle();
        }
        else {
            this.markRedraw();
        }
    };
    Displayable.prototype.attrKV = function (key, value) {
        if (key !== 'style') {
            _super.prototype.attrKV.call(this, key, value);
        }
        else {
            if (!this.style) {
                this.useStyle(value);
            }
            else {
                this.setStyle(value);
            }
        }
    };
    Displayable.prototype.setStyle = function (keyOrObj, value) {
        if (typeof keyOrObj === 'string') {
            this.style[keyOrObj] = value;
        }
        else {
            extend(this.style, keyOrObj);
        }
        this.dirtyStyle();
        return this;
    };
    Displayable.prototype.dirtyStyle = function () {
        this.markRedraw();
        this.__dirty |= Displayable.STYLE_CHANGED_BIT;
        if (this._rect) {
            this._rect = null;
        }
    };
    Displayable.prototype.dirty = function () {
        this.dirtyStyle();
    };
    Displayable.prototype.styleChanged = function () {
        return !!(this.__dirty & Displayable.STYLE_CHANGED_BIT);
    };
    Displayable.prototype.styleUpdated = function () {
        this.__dirty &= ~Displayable.STYLE_CHANGED_BIT;
    };
    Displayable.prototype.createStyle = function (obj) {
        return createObject(DEFAULT_COMMON_STYLE, obj);
    };
    Displayable.prototype.useStyle = function (obj) {
        if (!obj[STYLE_MAGIC_KEY]) {
            obj = this.createStyle(obj);
        }
        if (this.__inHover) {
            this.__hoverStyle = obj;
        }
        else {
            this.style = obj;
        }
        this.dirtyStyle();
    };
    Displayable.prototype.isStyleObject = function (obj) {
        return obj[STYLE_MAGIC_KEY];
    };
    Displayable.prototype._innerSaveToNormal = function (toState) {
        _super.prototype._innerSaveToNormal.call(this, toState);
        var normalState = this._normalState;
        if (toState.style && !normalState.style) {
            normalState.style = this._mergeStyle(this.createStyle(), this.style);
        }
        this._savePrimaryToNormal(toState, normalState, PRIMARY_STATES_KEYS);
    };
    Displayable.prototype._applyStateObj = function (stateName, state, normalState, keepCurrentStates, transition, animationCfg) {
        _super.prototype._applyStateObj.call(this, stateName, state, normalState, keepCurrentStates, transition, animationCfg);
        var needsRestoreToNormal = !(state && keepCurrentStates);
        var targetStyle;
        if (state && state.style) {
            if (transition) {
                if (keepCurrentStates) {
                    targetStyle = state.style;
                }
                else {
                    targetStyle = this._mergeStyle(this.createStyle(), normalState.style);
                    this._mergeStyle(targetStyle, state.style);
                }
            }
            else {
                targetStyle = this._mergeStyle(this.createStyle(), keepCurrentStates ? this.style : normalState.style);
                this._mergeStyle(targetStyle, state.style);
            }
        }
        else if (needsRestoreToNormal) {
            targetStyle = normalState.style;
        }
        if (targetStyle) {
            if (transition) {
                var sourceStyle = this.style;
                this.style = this.createStyle(needsRestoreToNormal ? {} : sourceStyle);
                if (needsRestoreToNormal) {
                    var changedKeys = keys(sourceStyle);
                    for (var i = 0; i < changedKeys.length; i++) {
                        var key = changedKeys[i];
                        if (key in targetStyle) {
                            targetStyle[key] = targetStyle[key];
                            this.style[key] = sourceStyle[key];
                        }
                    }
                }
                var targetKeys = keys(targetStyle);
                for (var i = 0; i < targetKeys.length; i++) {
                    var key = targetKeys[i];
                    this.style[key] = this.style[key];
                }
                this._transitionState(stateName, {
                    style: targetStyle
                }, animationCfg, this.getAnimationStyleProps());
            }
            else {
                this.useStyle(targetStyle);
            }
        }
        for (var i = 0; i < PRIMARY_STATES_KEYS.length; i++) {
            var key = PRIMARY_STATES_KEYS[i];
            if (state && state[key] != null) {
                this[key] = state[key];
            }
            else if (needsRestoreToNormal) {
                if (normalState[key] != null) {
                    this[key] = normalState[key];
                }
            }
        }
    };
    Displayable.prototype._mergeStates = function (states) {
        var mergedState = _super.prototype._mergeStates.call(this, states);
        var mergedStyle;
        for (var i = 0; i < states.length; i++) {
            var state = states[i];
            if (state.style) {
                mergedStyle = mergedStyle || {};
                this._mergeStyle(mergedStyle, state.style);
            }
        }
        if (mergedStyle) {
            mergedState.style = mergedStyle;
        }
        return mergedState;
    };
    Displayable.prototype._mergeStyle = function (targetStyle, sourceStyle) {
        extend(targetStyle, sourceStyle);
        return targetStyle;
    };
    Displayable.prototype.getAnimationStyleProps = function () {
        return DEFAULT_COMMON_ANIMATION_PROPS;
    };
    Displayable.STYLE_CHANGED_BIT = 2;
    Displayable.initDefaultProps = (function () {
        var dispProto = Displayable.prototype;
        dispProto.type = 'displayable';
        dispProto.invisible = false;
        dispProto.z = 0;
        dispProto.z2 = 0;
        dispProto.zlevel = 0;
        dispProto.culling = false;
        dispProto.cursor = 'pointer';
        dispProto.rectHover = false;
        dispProto.incremental = false;
        dispProto._rect = null;
        dispProto.dirtyRectTolerance = 0;
        dispProto.__dirty = Element.REDARAW_BIT | Displayable.STYLE_CHANGED_BIT;
    })();
    return Displayable;
}(Element));
var tmpRect = new BoundingRect(0, 0, 0, 0);
var viewRect = new BoundingRect(0, 0, 0, 0);
function isDisplayableCulled(el, width, height) {
    tmpRect.copy(el.getBoundingRect());
    if (el.transform) {
        tmpRect.applyTransform(el.transform);
    }
    viewRect.width = width;
    viewRect.height = height;
    return !tmpRect.intersect(viewRect);
}

var mathPow = Math.pow;
var mathSqrt$1 = Math.sqrt;
var EPSILON$1 = 1e-8;
var EPSILON_NUMERIC = 1e-4;
var THREE_SQRT = mathSqrt$1(3);
var ONE_THIRD = 1 / 3;
var _v0 = create();
var _v1 = create();
var _v2 = create();
function isAroundZero(val) {
    return val > -EPSILON$1 && val < EPSILON$1;
}
function isNotAroundZero(val) {
    return val > EPSILON$1 || val < -EPSILON$1;
}
function cubicAt(p0, p1, p2, p3, t) {
    var onet = 1 - t;
    return onet * onet * (onet * p0 + 3 * t * p1)
        + t * t * (t * p3 + 3 * onet * p2);
}
function cubicDerivativeAt(p0, p1, p2, p3, t) {
    var onet = 1 - t;
    return 3 * (((p1 - p0) * onet + 2 * (p2 - p1) * t) * onet
        + (p3 - p2) * t * t);
}
function cubicRootAt(p0, p1, p2, p3, val, roots) {
    var a = p3 + 3 * (p1 - p2) - p0;
    var b = 3 * (p2 - p1 * 2 + p0);
    var c = 3 * (p1 - p0);
    var d = p0 - val;
    var A = b * b - 3 * a * c;
    var B = b * c - 9 * a * d;
    var C = c * c - 3 * b * d;
    var n = 0;
    if (isAroundZero(A) && isAroundZero(B)) {
        if (isAroundZero(b)) {
            roots[0] = 0;
        }
        else {
            var t1 = -c / b;
            if (t1 >= 0 && t1 <= 1) {
                roots[n++] = t1;
            }
        }
    }
    else {
        var disc = B * B - 4 * A * C;
        if (isAroundZero(disc)) {
            var K = B / A;
            var t1 = -b / a + K;
            var t2 = -K / 2;
            if (t1 >= 0 && t1 <= 1) {
                roots[n++] = t1;
            }
            if (t2 >= 0 && t2 <= 1) {
                roots[n++] = t2;
            }
        }
        else if (disc > 0) {
            var discSqrt = mathSqrt$1(disc);
            var Y1 = A * b + 1.5 * a * (-B + discSqrt);
            var Y2 = A * b + 1.5 * a * (-B - discSqrt);
            if (Y1 < 0) {
                Y1 = -mathPow(-Y1, ONE_THIRD);
            }
            else {
                Y1 = mathPow(Y1, ONE_THIRD);
            }
            if (Y2 < 0) {
                Y2 = -mathPow(-Y2, ONE_THIRD);
            }
            else {
                Y2 = mathPow(Y2, ONE_THIRD);
            }
            var t1 = (-b - (Y1 + Y2)) / (3 * a);
            if (t1 >= 0 && t1 <= 1) {
                roots[n++] = t1;
            }
        }
        else {
            var T = (2 * A * b - 3 * a * B) / (2 * mathSqrt$1(A * A * A));
            var theta = Math.acos(T) / 3;
            var ASqrt = mathSqrt$1(A);
            var tmp = Math.cos(theta);
            var t1 = (-b - 2 * ASqrt * tmp) / (3 * a);
            var t2 = (-b + ASqrt * (tmp + THREE_SQRT * Math.sin(theta))) / (3 * a);
            var t3 = (-b + ASqrt * (tmp - THREE_SQRT * Math.sin(theta))) / (3 * a);
            if (t1 >= 0 && t1 <= 1) {
                roots[n++] = t1;
            }
            if (t2 >= 0 && t2 <= 1) {
                roots[n++] = t2;
            }
            if (t3 >= 0 && t3 <= 1) {
                roots[n++] = t3;
            }
        }
    }
    return n;
}
function cubicExtrema(p0, p1, p2, p3, extrema) {
    var b = 6 * p2 - 12 * p1 + 6 * p0;
    var a = 9 * p1 + 3 * p3 - 3 * p0 - 9 * p2;
    var c = 3 * p1 - 3 * p0;
    var n = 0;
    if (isAroundZero(a)) {
        if (isNotAroundZero(b)) {
            var t1 = -c / b;
            if (t1 >= 0 && t1 <= 1) {
                extrema[n++] = t1;
            }
        }
    }
    else {
        var disc = b * b - 4 * a * c;
        if (isAroundZero(disc)) {
            extrema[0] = -b / (2 * a);
        }
        else if (disc > 0) {
            var discSqrt = mathSqrt$1(disc);
            var t1 = (-b + discSqrt) / (2 * a);
            var t2 = (-b - discSqrt) / (2 * a);
            if (t1 >= 0 && t1 <= 1) {
                extrema[n++] = t1;
            }
            if (t2 >= 0 && t2 <= 1) {
                extrema[n++] = t2;
            }
        }
    }
    return n;
}
function cubicSubdivide(p0, p1, p2, p3, t, out) {
    var p01 = (p1 - p0) * t + p0;
    var p12 = (p2 - p1) * t + p1;
    var p23 = (p3 - p2) * t + p2;
    var p012 = (p12 - p01) * t + p01;
    var p123 = (p23 - p12) * t + p12;
    var p0123 = (p123 - p012) * t + p012;
    out[0] = p0;
    out[1] = p01;
    out[2] = p012;
    out[3] = p0123;
    out[4] = p0123;
    out[5] = p123;
    out[6] = p23;
    out[7] = p3;
}
function cubicProjectPoint(x0, y0, x1, y1, x2, y2, x3, y3, x, y, out) {
    var t;
    var interval = 0.005;
    var d = Infinity;
    var prev;
    var next;
    var d1;
    var d2;
    _v0[0] = x;
    _v0[1] = y;
    for (var _t = 0; _t < 1; _t += 0.05) {
        _v1[0] = cubicAt(x0, x1, x2, x3, _t);
        _v1[1] = cubicAt(y0, y1, y2, y3, _t);
        d1 = distSquare(_v0, _v1);
        if (d1 < d) {
            t = _t;
            d = d1;
        }
    }
    d = Infinity;
    for (var i = 0; i < 32; i++) {
        if (interval < EPSILON_NUMERIC) {
            break;
        }
        prev = t - interval;
        next = t + interval;
        _v1[0] = cubicAt(x0, x1, x2, x3, prev);
        _v1[1] = cubicAt(y0, y1, y2, y3, prev);
        d1 = distSquare(_v1, _v0);
        if (prev >= 0 && d1 < d) {
            t = prev;
            d = d1;
        }
        else {
            _v2[0] = cubicAt(x0, x1, x2, x3, next);
            _v2[1] = cubicAt(y0, y1, y2, y3, next);
            d2 = distSquare(_v2, _v0);
            if (next <= 1 && d2 < d) {
                t = next;
                d = d2;
            }
            else {
                interval *= 0.5;
            }
        }
    }
    if (out) {
        out[0] = cubicAt(x0, x1, x2, x3, t);
        out[1] = cubicAt(y0, y1, y2, y3, t);
    }
    return mathSqrt$1(d);
}
function cubicLength(x0, y0, x1, y1, x2, y2, x3, y3, iteration) {
    var px = x0;
    var py = y0;
    var d = 0;
    var step = 1 / iteration;
    for (var i = 1; i <= iteration; i++) {
        var t = i * step;
        var x = cubicAt(x0, x1, x2, x3, t);
        var y = cubicAt(y0, y1, y2, y3, t);
        var dx = x - px;
        var dy = y - py;
        d += Math.sqrt(dx * dx + dy * dy);
        px = x;
        py = y;
    }
    return d;
}
function quadraticAt(p0, p1, p2, t) {
    var onet = 1 - t;
    return onet * (onet * p0 + 2 * t * p1) + t * t * p2;
}
function quadraticDerivativeAt(p0, p1, p2, t) {
    return 2 * ((1 - t) * (p1 - p0) + t * (p2 - p1));
}
function quadraticRootAt(p0, p1, p2, val, roots) {
    var a = p0 - 2 * p1 + p2;
    var b = 2 * (p1 - p0);
    var c = p0 - val;
    var n = 0;
    if (isAroundZero(a)) {
        if (isNotAroundZero(b)) {
            var t1 = -c / b;
            if (t1 >= 0 && t1 <= 1) {
                roots[n++] = t1;
            }
        }
    }
    else {
        var disc = b * b - 4 * a * c;
        if (isAroundZero(disc)) {
            var t1 = -b / (2 * a);
            if (t1 >= 0 && t1 <= 1) {
                roots[n++] = t1;
            }
        }
        else if (disc > 0) {
            var discSqrt = mathSqrt$1(disc);
            var t1 = (-b + discSqrt) / (2 * a);
            var t2 = (-b - discSqrt) / (2 * a);
            if (t1 >= 0 && t1 <= 1) {
                roots[n++] = t1;
            }
            if (t2 >= 0 && t2 <= 1) {
                roots[n++] = t2;
            }
        }
    }
    return n;
}
function quadraticExtremum(p0, p1, p2) {
    var divider = p0 + p2 - 2 * p1;
    if (divider === 0) {
        return 0.5;
    }
    else {
        return (p0 - p1) / divider;
    }
}
function quadraticSubdivide(p0, p1, p2, t, out) {
    var p01 = (p1 - p0) * t + p0;
    var p12 = (p2 - p1) * t + p1;
    var p012 = (p12 - p01) * t + p01;
    out[0] = p0;
    out[1] = p01;
    out[2] = p012;
    out[3] = p012;
    out[4] = p12;
    out[5] = p2;
}
function quadraticProjectPoint(x0, y0, x1, y1, x2, y2, x, y, out) {
    var t;
    var interval = 0.005;
    var d = Infinity;
    _v0[0] = x;
    _v0[1] = y;
    for (var _t = 0; _t < 1; _t += 0.05) {
        _v1[0] = quadraticAt(x0, x1, x2, _t);
        _v1[1] = quadraticAt(y0, y1, y2, _t);
        var d1 = distSquare(_v0, _v1);
        if (d1 < d) {
            t = _t;
            d = d1;
        }
    }
    d = Infinity;
    for (var i = 0; i < 32; i++) {
        if (interval < EPSILON_NUMERIC) {
            break;
        }
        var prev = t - interval;
        var next = t + interval;
        _v1[0] = quadraticAt(x0, x1, x2, prev);
        _v1[1] = quadraticAt(y0, y1, y2, prev);
        var d1 = distSquare(_v1, _v0);
        if (prev >= 0 && d1 < d) {
            t = prev;
            d = d1;
        }
        else {
            _v2[0] = quadraticAt(x0, x1, x2, next);
            _v2[1] = quadraticAt(y0, y1, y2, next);
            var d2 = distSquare(_v2, _v0);
            if (next <= 1 && d2 < d) {
                t = next;
                d = d2;
            }
            else {
                interval *= 0.5;
            }
        }
    }
    if (out) {
        out[0] = quadraticAt(x0, x1, x2, t);
        out[1] = quadraticAt(y0, y1, y2, t);
    }
    return mathSqrt$1(d);
}
function quadraticLength(x0, y0, x1, y1, x2, y2, iteration) {
    var px = x0;
    var py = y0;
    var d = 0;
    var step = 1 / iteration;
    for (var i = 1; i <= iteration; i++) {
        var t = i * step;
        var x = quadraticAt(x0, x1, x2, t);
        var y = quadraticAt(y0, y1, y2, t);
        var dx = x - px;
        var dy = y - py;
        d += Math.sqrt(dx * dx + dy * dy);
        px = x;
        py = y;
    }
    return d;
}

var mathMin$1 = Math.min;
var mathMax$1 = Math.max;
var mathSin$1 = Math.sin;
var mathCos$1 = Math.cos;
var PI2$4 = Math.PI * 2;
var start = create();
var end = create();
var extremity = create();
function fromPoints(points, min, max) {
    if (points.length === 0) {
        return;
    }
    var p = points[0];
    var left = p[0];
    var right = p[0];
    var top = p[1];
    var bottom = p[1];
    for (var i = 1; i < points.length; i++) {
        p = points[i];
        left = mathMin$1(left, p[0]);
        right = mathMax$1(right, p[0]);
        top = mathMin$1(top, p[1]);
        bottom = mathMax$1(bottom, p[1]);
    }
    min[0] = left;
    min[1] = top;
    max[0] = right;
    max[1] = bottom;
}
function fromLine(x0, y0, x1, y1, min, max) {
    min[0] = mathMin$1(x0, x1);
    min[1] = mathMin$1(y0, y1);
    max[0] = mathMax$1(x0, x1);
    max[1] = mathMax$1(y0, y1);
}
var xDim = [];
var yDim = [];
function fromCubic(x0, y0, x1, y1, x2, y2, x3, y3, min, max) {
    var cubicExtrema$1 = cubicExtrema;
    var cubicAt$1 = cubicAt;
    var n = cubicExtrema$1(x0, x1, x2, x3, xDim);
    min[0] = Infinity;
    min[1] = Infinity;
    max[0] = -Infinity;
    max[1] = -Infinity;
    for (var i = 0; i < n; i++) {
        var x = cubicAt$1(x0, x1, x2, x3, xDim[i]);
        min[0] = mathMin$1(x, min[0]);
        max[0] = mathMax$1(x, max[0]);
    }
    n = cubicExtrema$1(y0, y1, y2, y3, yDim);
    for (var i = 0; i < n; i++) {
        var y = cubicAt$1(y0, y1, y2, y3, yDim[i]);
        min[1] = mathMin$1(y, min[1]);
        max[1] = mathMax$1(y, max[1]);
    }
    min[0] = mathMin$1(x0, min[0]);
    max[0] = mathMax$1(x0, max[0]);
    min[0] = mathMin$1(x3, min[0]);
    max[0] = mathMax$1(x3, max[0]);
    min[1] = mathMin$1(y0, min[1]);
    max[1] = mathMax$1(y0, max[1]);
    min[1] = mathMin$1(y3, min[1]);
    max[1] = mathMax$1(y3, max[1]);
}
function fromQuadratic(x0, y0, x1, y1, x2, y2, min, max) {
    var quadraticExtremum$1 = quadraticExtremum;
    var quadraticAt$1 = quadraticAt;
    var tx = mathMax$1(mathMin$1(quadraticExtremum$1(x0, x1, x2), 1), 0);
    var ty = mathMax$1(mathMin$1(quadraticExtremum$1(y0, y1, y2), 1), 0);
    var x = quadraticAt$1(x0, x1, x2, tx);
    var y = quadraticAt$1(y0, y1, y2, ty);
    min[0] = mathMin$1(x0, x2, x);
    min[1] = mathMin$1(y0, y2, y);
    max[0] = mathMax$1(x0, x2, x);
    max[1] = mathMax$1(y0, y2, y);
}
function fromArc(x, y, rx, ry, startAngle, endAngle, anticlockwise, min, max) {
    var vec2Min = min$1;
    var vec2Max = max$1;
    var diff = Math.abs(startAngle - endAngle);
    if (diff % PI2$4 < 1e-4 && diff > 1e-4) {
        min[0] = x - rx;
        min[1] = y - ry;
        max[0] = x + rx;
        max[1] = y + ry;
        return;
    }
    start[0] = mathCos$1(startAngle) * rx + x;
    start[1] = mathSin$1(startAngle) * ry + y;
    end[0] = mathCos$1(endAngle) * rx + x;
    end[1] = mathSin$1(endAngle) * ry + y;
    vec2Min(min, start, end);
    vec2Max(max, start, end);
    startAngle = startAngle % (PI2$4);
    if (startAngle < 0) {
        startAngle = startAngle + PI2$4;
    }
    endAngle = endAngle % (PI2$4);
    if (endAngle < 0) {
        endAngle = endAngle + PI2$4;
    }
    if (startAngle > endAngle && !anticlockwise) {
        endAngle += PI2$4;
    }
    else if (startAngle < endAngle && anticlockwise) {
        startAngle += PI2$4;
    }
    if (anticlockwise) {
        var tmp = endAngle;
        endAngle = startAngle;
        startAngle = tmp;
    }
    for (var angle = 0; angle < endAngle; angle += Math.PI / 2) {
        if (angle > startAngle) {
            extremity[0] = mathCos$1(angle) * rx + x;
            extremity[1] = mathSin$1(angle) * ry + y;
            vec2Min(min, extremity, min);
            vec2Max(max, extremity, max);
        }
    }
}

var CMD$1 = {
    M: 1,
    L: 2,
    C: 3,
    Q: 4,
    A: 5,
    Z: 6,
    R: 7
};
var tmpOutX = [];
var tmpOutY = [];
var min = [];
var max = [];
var min2 = [];
var max2 = [];
var mathMin = Math.min;
var mathMax = Math.max;
var mathCos = Math.cos;
var mathSin = Math.sin;
var mathSqrt = Math.sqrt;
var mathAbs = Math.abs;
var PI = Math.PI;
var PI2$3 = PI * 2;
var hasTypedArray = typeof Float32Array !== 'undefined';
var tmpAngles = [];
function modPI2(radian) {
    var n = Math.round(radian / PI * 1e8) / 1e8;
    return (n % 2) * PI;
}
function normalizeArcAngles(angles, anticlockwise) {
    var newStartAngle = modPI2(angles[0]);
    if (newStartAngle < 0) {
        newStartAngle += PI2$3;
    }
    var delta = newStartAngle - angles[0];
    var newEndAngle = angles[1];
    newEndAngle += delta;
    if (!anticlockwise && newEndAngle - newStartAngle >= PI2$3) {
        newEndAngle = newStartAngle + PI2$3;
    }
    else if (anticlockwise && newStartAngle - newEndAngle >= PI2$3) {
        newEndAngle = newStartAngle - PI2$3;
    }
    else if (!anticlockwise && newStartAngle > newEndAngle) {
        newEndAngle = newStartAngle +
            (PI2$3 - modPI2(newStartAngle - newEndAngle));
    }
    else if (anticlockwise && newStartAngle < newEndAngle) {
        newEndAngle = newStartAngle -
            (PI2$3 - modPI2(newEndAngle - newStartAngle));
    }
    angles[0] = newStartAngle;
    angles[1] = newEndAngle;
}
var PathProxy = (function () {
    function PathProxy(notSaveData) {
        this.dpr = 1;
        this._version = 0;
        this._xi = 0;
        this._yi = 0;
        this._x0 = 0;
        this._y0 = 0;
        this._len = 0;
        if (notSaveData) {
            this._saveData = false;
        }
        if (this._saveData) {
            this.data = [];
        }
    }
    PathProxy.prototype.increaseVersion = function () {
        this._version++;
    };
    PathProxy.prototype.getVersion = function () {
        return this._version;
    };
    PathProxy.prototype.setScale = function (sx, sy, segmentIgnoreThreshold) {
        segmentIgnoreThreshold = segmentIgnoreThreshold || 0;
        if (segmentIgnoreThreshold > 0) {
            this._ux = mathAbs(segmentIgnoreThreshold / devicePixelRatio / sx) || 0;
            this._uy = mathAbs(segmentIgnoreThreshold / devicePixelRatio / sy) || 0;
        }
    };
    PathProxy.prototype.setDPR = function (dpr) {
        this.dpr = dpr;
    };
    PathProxy.prototype.setContext = function (ctx) {
        this._ctx = ctx;
    };
    PathProxy.prototype.getContext = function () {
        return this._ctx;
    };
    PathProxy.prototype.beginPath = function () {
        this._ctx && this._ctx.beginPath();
        this.reset();
        return this;
    };
    PathProxy.prototype.reset = function () {
        if (this._saveData) {
            this._len = 0;
        }
        if (this._lineDash) {
            this._lineDash = null;
            this._dashOffset = 0;
        }
        if (this._pathSegLen) {
            this._pathSegLen = null;
            this._pathLen = 0;
        }
        this._version++;
    };
    PathProxy.prototype.moveTo = function (x, y) {
        this.addData(CMD$1.M, x, y);
        this._ctx && this._ctx.moveTo(x, y);
        this._x0 = x;
        this._y0 = y;
        this._xi = x;
        this._yi = y;
        return this;
    };
    PathProxy.prototype.lineTo = function (x, y) {
        var exceedUnit = mathAbs(x - this._xi) > this._ux
            || mathAbs(y - this._yi) > this._uy
            || this._len < 5;
        this.addData(CMD$1.L, x, y);
        if (this._ctx && exceedUnit) {
            this._needsDash ? this._dashedLineTo(x, y)
                : this._ctx.lineTo(x, y);
        }
        if (exceedUnit) {
            this._xi = x;
            this._yi = y;
        }
        return this;
    };
    PathProxy.prototype.bezierCurveTo = function (x1, y1, x2, y2, x3, y3) {
        this.addData(CMD$1.C, x1, y1, x2, y2, x3, y3);
        if (this._ctx) {
            this._needsDash ? this._dashedBezierTo(x1, y1, x2, y2, x3, y3)
                : this._ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
        }
        this._xi = x3;
        this._yi = y3;
        return this;
    };
    PathProxy.prototype.quadraticCurveTo = function (x1, y1, x2, y2) {
        this.addData(CMD$1.Q, x1, y1, x2, y2);
        if (this._ctx) {
            this._needsDash ? this._dashedQuadraticTo(x1, y1, x2, y2)
                : this._ctx.quadraticCurveTo(x1, y1, x2, y2);
        }
        this._xi = x2;
        this._yi = y2;
        return this;
    };
    PathProxy.prototype.arc = function (cx, cy, r, startAngle, endAngle, anticlockwise) {
        tmpAngles[0] = startAngle;
        tmpAngles[1] = endAngle;
        normalizeArcAngles(tmpAngles, anticlockwise);
        startAngle = tmpAngles[0];
        endAngle = tmpAngles[1];
        var delta = endAngle - startAngle;
        this.addData(CMD$1.A, cx, cy, r, r, startAngle, delta, 0, anticlockwise ? 0 : 1);
        this._ctx && this._ctx.arc(cx, cy, r, startAngle, endAngle, anticlockwise);
        this._xi = mathCos(endAngle) * r + cx;
        this._yi = mathSin(endAngle) * r + cy;
        return this;
    };
    PathProxy.prototype.arcTo = function (x1, y1, x2, y2, radius) {
        if (this._ctx) {
            this._ctx.arcTo(x1, y1, x2, y2, radius);
        }
        return this;
    };
    PathProxy.prototype.rect = function (x, y, w, h) {
        this._ctx && this._ctx.rect(x, y, w, h);
        this.addData(CMD$1.R, x, y, w, h);
        return this;
    };
    PathProxy.prototype.closePath = function () {
        this.addData(CMD$1.Z);
        var ctx = this._ctx;
        var x0 = this._x0;
        var y0 = this._y0;
        if (ctx) {
            this._needsDash && this._dashedLineTo(x0, y0);
            ctx.closePath();
        }
        this._xi = x0;
        this._yi = y0;
        return this;
    };
    PathProxy.prototype.fill = function (ctx) {
        ctx && ctx.fill();
        this.toStatic();
    };
    PathProxy.prototype.stroke = function (ctx) {
        ctx && ctx.stroke();
        this.toStatic();
    };
    PathProxy.prototype.setLineDash = function (lineDash) {
        if (lineDash instanceof Array) {
            this._lineDash = lineDash;
            this._dashIdx = 0;
            var lineDashSum = 0;
            for (var i = 0; i < lineDash.length; i++) {
                lineDashSum += lineDash[i];
            }
            this._dashSum = lineDashSum;
            this._needsDash = true;
        }
        else {
            this._lineDash = null;
            this._needsDash = false;
        }
        return this;
    };
    PathProxy.prototype.setLineDashOffset = function (offset) {
        this._dashOffset = offset;
        return this;
    };
    PathProxy.prototype.len = function () {
        return this._len;
    };
    PathProxy.prototype.setData = function (data) {
        var len = data.length;
        if (!(this.data && this.data.length === len) && hasTypedArray) {
            this.data = new Float32Array(len);
        }
        for (var i = 0; i < len; i++) {
            this.data[i] = data[i];
        }
        this._len = len;
    };
    PathProxy.prototype.appendPath = function (path) {
        if (!(path instanceof Array)) {
            path = [path];
        }
        var len = path.length;
        var appendSize = 0;
        var offset = this._len;
        for (var i = 0; i < len; i++) {
            appendSize += path[i].len();
        }
        if (hasTypedArray && (this.data instanceof Float32Array)) {
            this.data = new Float32Array(offset + appendSize);
        }
        for (var i = 0; i < len; i++) {
            var appendPathData = path[i].data;
            for (var k = 0; k < appendPathData.length; k++) {
                this.data[offset++] = appendPathData[k];
            }
        }
        this._len = offset;
    };
    PathProxy.prototype.addData = function (cmd, a, b, c, d, e, f, g, h) {
        if (!this._saveData) {
            return;
        }
        var data = this.data;
        if (this._len + arguments.length > data.length) {
            this._expandData();
            data = this.data;
        }
        for (var i = 0; i < arguments.length; i++) {
            data[this._len++] = arguments[i];
        }
    };
    PathProxy.prototype._expandData = function () {
        if (!(this.data instanceof Array)) {
            var newData = [];
            for (var i = 0; i < this._len; i++) {
                newData[i] = this.data[i];
            }
            this.data = newData;
        }
    };
    PathProxy.prototype._dashedLineTo = function (x1, y1) {
        var dashSum = this._dashSum;
        var lineDash = this._lineDash;
        var ctx = this._ctx;
        var offset = this._dashOffset;
        var x0 = this._xi;
        var y0 = this._yi;
        var dx = x1 - x0;
        var dy = y1 - y0;
        var dist = mathSqrt(dx * dx + dy * dy);
        var x = x0;
        var y = y0;
        var nDash = lineDash.length;
        var dash;
        var idx;
        dx /= dist;
        dy /= dist;
        if (offset < 0) {
            offset = dashSum + offset;
        }
        offset %= dashSum;
        x -= offset * dx;
        y -= offset * dy;
        while ((dx > 0 && x <= x1) || (dx < 0 && x >= x1)
            || (dx === 0 && ((dy > 0 && y <= y1) || (dy < 0 && y >= y1)))) {
            idx = this._dashIdx;
            dash = lineDash[idx];
            x += dx * dash;
            y += dy * dash;
            this._dashIdx = (idx + 1) % nDash;
            if ((dx > 0 && x < x0) || (dx < 0 && x > x0) || (dy > 0 && y < y0) || (dy < 0 && y > y0)) {
                continue;
            }
            ctx[idx % 2 ? 'moveTo' : 'lineTo'](dx >= 0 ? mathMin(x, x1) : mathMax(x, x1), dy >= 0 ? mathMin(y, y1) : mathMax(y, y1));
        }
        dx = x - x1;
        dy = y - y1;
        this._dashOffset = -mathSqrt(dx * dx + dy * dy);
    };
    PathProxy.prototype._dashedBezierTo = function (x1, y1, x2, y2, x3, y3) {
        var ctx = this._ctx;
        var dashSum = this._dashSum;
        var offset = this._dashOffset;
        var lineDash = this._lineDash;
        var x0 = this._xi;
        var y0 = this._yi;
        var bezierLen = 0;
        var idx = this._dashIdx;
        var nDash = lineDash.length;
        var t;
        var dx;
        var dy;
        var x;
        var y;
        var tmpLen = 0;
        if (offset < 0) {
            offset = dashSum + offset;
        }
        offset %= dashSum;
        for (t = 0; t < 1; t += 0.1) {
            dx = cubicAt(x0, x1, x2, x3, t + 0.1)
                - cubicAt(x0, x1, x2, x3, t);
            dy = cubicAt(y0, y1, y2, y3, t + 0.1)
                - cubicAt(y0, y1, y2, y3, t);
            bezierLen += mathSqrt(dx * dx + dy * dy);
        }
        for (; idx < nDash; idx++) {
            tmpLen += lineDash[idx];
            if (tmpLen > offset) {
                break;
            }
        }
        t = (tmpLen - offset) / bezierLen;
        while (t <= 1) {
            x = cubicAt(x0, x1, x2, x3, t);
            y = cubicAt(y0, y1, y2, y3, t);
            idx % 2 ? ctx.moveTo(x, y)
                : ctx.lineTo(x, y);
            t += lineDash[idx] / bezierLen;
            idx = (idx + 1) % nDash;
        }
        (idx % 2 !== 0) && ctx.lineTo(x3, y3);
        dx = x3 - x;
        dy = y3 - y;
        this._dashOffset = -mathSqrt(dx * dx + dy * dy);
    };
    PathProxy.prototype._dashedQuadraticTo = function (x1, y1, x2, y2) {
        var x3 = x2;
        var y3 = y2;
        x2 = (x2 + 2 * x1) / 3;
        y2 = (y2 + 2 * y1) / 3;
        x1 = (this._xi + 2 * x1) / 3;
        y1 = (this._yi + 2 * y1) / 3;
        this._dashedBezierTo(x1, y1, x2, y2, x3, y3);
    };
    PathProxy.prototype.toStatic = function () {
        if (!this._saveData) {
            return;
        }
        var data = this.data;
        if (data instanceof Array) {
            data.length = this._len;
            if (hasTypedArray && this._len > 11) {
                this.data = new Float32Array(data);
            }
        }
    };
    PathProxy.prototype.getBoundingRect = function () {
        min[0] = min[1] = min2[0] = min2[1] = Number.MAX_VALUE;
        max[0] = max[1] = max2[0] = max2[1] = -Number.MAX_VALUE;
        var data = this.data;
        var xi = 0;
        var yi = 0;
        var x0 = 0;
        var y0 = 0;
        var i;
        for (i = 0; i < this._len;) {
            var cmd = data[i++];
            var isFirst = i === 1;
            if (isFirst) {
                xi = data[i];
                yi = data[i + 1];
                x0 = xi;
                y0 = yi;
            }
            switch (cmd) {
                case CMD$1.M:
                    xi = x0 = data[i++];
                    yi = y0 = data[i++];
                    min2[0] = x0;
                    min2[1] = y0;
                    max2[0] = x0;
                    max2[1] = y0;
                    break;
                case CMD$1.L:
                    fromLine(xi, yi, data[i], data[i + 1], min2, max2);
                    xi = data[i++];
                    yi = data[i++];
                    break;
                case CMD$1.C:
                    fromCubic(xi, yi, data[i++], data[i++], data[i++], data[i++], data[i], data[i + 1], min2, max2);
                    xi = data[i++];
                    yi = data[i++];
                    break;
                case CMD$1.Q:
                    fromQuadratic(xi, yi, data[i++], data[i++], data[i], data[i + 1], min2, max2);
                    xi = data[i++];
                    yi = data[i++];
                    break;
                case CMD$1.A:
                    var cx = data[i++];
                    var cy = data[i++];
                    var rx = data[i++];
                    var ry = data[i++];
                    var startAngle = data[i++];
                    var endAngle = data[i++] + startAngle;
                    i += 1;
                    var anticlockwise = !data[i++];
                    if (isFirst) {
                        x0 = mathCos(startAngle) * rx + cx;
                        y0 = mathSin(startAngle) * ry + cy;
                    }
                    fromArc(cx, cy, rx, ry, startAngle, endAngle, anticlockwise, min2, max2);
                    xi = mathCos(endAngle) * rx + cx;
                    yi = mathSin(endAngle) * ry + cy;
                    break;
                case CMD$1.R:
                    x0 = xi = data[i++];
                    y0 = yi = data[i++];
                    var width = data[i++];
                    var height = data[i++];
                    fromLine(x0, y0, x0 + width, y0 + height, min2, max2);
                    break;
                case CMD$1.Z:
                    xi = x0;
                    yi = y0;
                    break;
            }
            min$1(min, min, min2);
            max$1(max, max, max2);
        }
        if (i === 0) {
            min[0] = min[1] = max[0] = max[1] = 0;
        }
        return new BoundingRect(min[0], min[1], max[0] - min[0], max[1] - min[1]);
    };
    PathProxy.prototype._calculateLength = function () {
        var data = this.data;
        var len = this._len;
        var ux = this._ux;
        var uy = this._uy;
        var xi = 0;
        var yi = 0;
        var x0 = 0;
        var y0 = 0;
        if (!this._pathSegLen) {
            this._pathSegLen = [];
        }
        var pathSegLen = this._pathSegLen;
        var pathTotalLen = 0;
        var segCount = 0;
        for (var i = 0; i < len;) {
            var cmd = data[i++];
            var isFirst = i === 1;
            if (isFirst) {
                xi = data[i];
                yi = data[i + 1];
                x0 = xi;
                y0 = yi;
            }
            var l = -1;
            switch (cmd) {
                case CMD$1.M:
                    xi = x0 = data[i++];
                    yi = y0 = data[i++];
                    break;
                case CMD$1.L: {
                    var x2 = data[i++];
                    var y2 = data[i++];
                    var dx = x2 - xi;
                    var dy = y2 - yi;
                    if (mathAbs(dx) > ux || mathAbs(dy) > uy || i === len - 1) {
                        l = Math.sqrt(dx * dx + dy * dy);
                        xi = x2;
                        yi = y2;
                    }
                    break;
                }
                case CMD$1.C: {
                    var x1 = data[i++];
                    var y1 = data[i++];
                    var x2 = data[i++];
                    var y2 = data[i++];
                    var x3 = data[i++];
                    var y3 = data[i++];
                    l = cubicLength(xi, yi, x1, y1, x2, y2, x3, y3, 10);
                    xi = x3;
                    yi = y3;
                    break;
                }
                case CMD$1.Q: {
                    var x1 = data[i++];
                    var y1 = data[i++];
                    var x2 = data[i++];
                    var y2 = data[i++];
                    l = quadraticLength(xi, yi, x1, y1, x2, y2, 10);
                    xi = x2;
                    yi = y2;
                    break;
                }
                case CMD$1.A:
                    var cx = data[i++];
                    var cy = data[i++];
                    var rx = data[i++];
                    var ry = data[i++];
                    var startAngle = data[i++];
                    var delta = data[i++];
                    var endAngle = delta + startAngle;
                    i += 1;
                    !data[i++];
                    if (isFirst) {
                        x0 = mathCos(startAngle) * rx + cx;
                        y0 = mathSin(startAngle) * ry + cy;
                    }
                    l = mathMax(rx, ry) * mathMin(PI2$3, Math.abs(delta));
                    xi = mathCos(endAngle) * rx + cx;
                    yi = mathSin(endAngle) * ry + cy;
                    break;
                case CMD$1.R: {
                    x0 = xi = data[i++];
                    y0 = yi = data[i++];
                    var width = data[i++];
                    var height = data[i++];
                    l = width * 2 + height * 2;
                    break;
                }
                case CMD$1.Z: {
                    var dx = x0 - xi;
                    var dy = y0 - yi;
                    l = Math.sqrt(dx * dx + dy * dy);
                    xi = x0;
                    yi = y0;
                    break;
                }
            }
            if (l >= 0) {
                pathSegLen[segCount++] = l;
                pathTotalLen += l;
            }
        }
        this._pathLen = pathTotalLen;
        return pathTotalLen;
    };
    PathProxy.prototype.rebuildPath = function (ctx, percent) {
        var d = this.data;
        var ux = this._ux;
        var uy = this._uy;
        var len = this._len;
        var x0;
        var y0;
        var xi;
        var yi;
        var x;
        var y;
        var drawPart = percent < 1;
        var pathSegLen;
        var pathTotalLen;
        var accumLength = 0;
        var segCount = 0;
        var displayedLength;
        if (drawPart) {
            if (!this._pathSegLen) {
                this._calculateLength();
            }
            pathSegLen = this._pathSegLen;
            pathTotalLen = this._pathLen;
            displayedLength = percent * pathTotalLen;
            if (!displayedLength) {
                return;
            }
        }
        lo: for (var i = 0; i < len;) {
            var cmd = d[i++];
            var isFirst = i === 1;
            if (isFirst) {
                xi = d[i];
                yi = d[i + 1];
                x0 = xi;
                y0 = yi;
            }
            switch (cmd) {
                case CMD$1.M:
                    x0 = xi = d[i++];
                    y0 = yi = d[i++];
                    ctx.moveTo(xi, yi);
                    break;
                case CMD$1.L: {
                    x = d[i++];
                    y = d[i++];
                    if (mathAbs(x - xi) > ux || mathAbs(y - yi) > uy || i === len - 1) {
                        if (drawPart) {
                            var l = pathSegLen[segCount++];
                            if (accumLength + l > displayedLength) {
                                var t = (displayedLength - accumLength) / l;
                                ctx.lineTo(xi * (1 - t) + x * t, yi * (1 - t) + y * t);
                                break lo;
                            }
                            accumLength += l;
                        }
                        ctx.lineTo(x, y);
                        xi = x;
                        yi = y;
                    }
                    break;
                }
                case CMD$1.C: {
                    var x1 = d[i++];
                    var y1 = d[i++];
                    var x2 = d[i++];
                    var y2 = d[i++];
                    var x3 = d[i++];
                    var y3 = d[i++];
                    if (drawPart) {
                        var l = pathSegLen[segCount++];
                        if (accumLength + l > displayedLength) {
                            var t = (displayedLength - accumLength) / l;
                            cubicSubdivide(xi, x1, x2, x3, t, tmpOutX);
                            cubicSubdivide(yi, y1, y2, y3, t, tmpOutY);
                            ctx.bezierCurveTo(tmpOutX[1], tmpOutY[1], tmpOutX[2], tmpOutY[2], tmpOutX[3], tmpOutY[3]);
                            break lo;
                        }
                        accumLength += l;
                    }
                    ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
                    xi = x3;
                    yi = y3;
                    break;
                }
                case CMD$1.Q: {
                    var x1 = d[i++];
                    var y1 = d[i++];
                    var x2 = d[i++];
                    var y2 = d[i++];
                    if (drawPart) {
                        var l = pathSegLen[segCount++];
                        if (accumLength + l > displayedLength) {
                            var t = (displayedLength - accumLength) / l;
                            quadraticSubdivide(xi, x1, x2, t, tmpOutX);
                            quadraticSubdivide(yi, y1, y2, t, tmpOutY);
                            ctx.quadraticCurveTo(tmpOutX[1], tmpOutY[1], tmpOutX[2], tmpOutY[2]);
                            break lo;
                        }
                        accumLength += l;
                    }
                    ctx.quadraticCurveTo(x1, y1, x2, y2);
                    xi = x2;
                    yi = y2;
                    break;
                }
                case CMD$1.A:
                    var cx = d[i++];
                    var cy = d[i++];
                    var rx = d[i++];
                    var ry = d[i++];
                    var startAngle = d[i++];
                    var delta = d[i++];
                    var psi = d[i++];
                    var anticlockwise = !d[i++];
                    var r = (rx > ry) ? rx : ry;
                    var isEllipse = mathAbs(rx - ry) > 1e-3;
                    var endAngle = startAngle + delta;
                    var breakBuild = false;
                    if (drawPart) {
                        var l = pathSegLen[segCount++];
                        if (accumLength + l > displayedLength) {
                            endAngle = startAngle + delta * (displayedLength - accumLength) / l;
                            breakBuild = true;
                        }
                        accumLength += l;
                    }
                    if (isEllipse && ctx.ellipse) {
                        ctx.ellipse(cx, cy, rx, ry, psi, startAngle, endAngle, anticlockwise);
                    }
                    else {
                        ctx.arc(cx, cy, r, startAngle, endAngle, anticlockwise);
                    }
                    if (breakBuild) {
                        break lo;
                    }
                    if (isFirst) {
                        x0 = mathCos(startAngle) * rx + cx;
                        y0 = mathSin(startAngle) * ry + cy;
                    }
                    xi = mathCos(endAngle) * rx + cx;
                    yi = mathSin(endAngle) * ry + cy;
                    break;
                case CMD$1.R:
                    x0 = xi = d[i];
                    y0 = yi = d[i + 1];
                    x = d[i++];
                    y = d[i++];
                    var width = d[i++];
                    var height = d[i++];
                    if (drawPart) {
                        var l = pathSegLen[segCount++];
                        if (accumLength + l > displayedLength) {
                            var d_1 = displayedLength - accumLength;
                            ctx.moveTo(x, y);
                            ctx.lineTo(x + mathMin(d_1, width), y);
                            d_1 -= width;
                            if (d_1 > 0) {
                                ctx.lineTo(x + width, y + mathMin(d_1, height));
                            }
                            d_1 -= height;
                            if (d_1 > 0) {
                                ctx.lineTo(x + mathMax(width - d_1, 0), y + height);
                            }
                            d_1 -= width;
                            if (d_1 > 0) {
                                ctx.lineTo(x, y + mathMax(height - d_1, 0));
                            }
                            break lo;
                        }
                        accumLength += l;
                    }
                    ctx.rect(x, y, width, height);
                    break;
                case CMD$1.Z:
                    if (drawPart) {
                        var l = pathSegLen[segCount++];
                        if (accumLength + l > displayedLength) {
                            var t = (displayedLength - accumLength) / l;
                            ctx.lineTo(xi * (1 - t) + x0 * t, yi * (1 - t) + y0 * t);
                            break lo;
                        }
                        accumLength += l;
                    }
                    ctx.closePath();
                    xi = x0;
                    yi = y0;
            }
        }
    };
    PathProxy.CMD = CMD$1;
    PathProxy.initDefaultProps = (function () {
        var proto = PathProxy.prototype;
        proto._saveData = true;
        proto._needsDash = false;
        proto._dashOffset = 0;
        proto._dashIdx = 0;
        proto._dashSum = 0;
        proto._ux = 0;
        proto._uy = 0;
    })();
    return PathProxy;
}());

function containStroke$4(x0, y0, x1, y1, lineWidth, x, y) {
    if (lineWidth === 0) {
        return false;
    }
    var _l = lineWidth;
    var _a = 0;
    var _b = x0;
    if ((y > y0 + _l && y > y1 + _l)
        || (y < y0 - _l && y < y1 - _l)
        || (x > x0 + _l && x > x1 + _l)
        || (x < x0 - _l && x < x1 - _l)) {
        return false;
    }
    if (x0 !== x1) {
        _a = (y0 - y1) / (x0 - x1);
        _b = (x0 * y1 - x1 * y0) / (x0 - x1);
    }
    else {
        return Math.abs(x - x0) <= _l / 2;
    }
    var tmp = _a * x - y + _b;
    var _s = tmp * tmp / (_a * _a + 1);
    return _s <= _l / 2 * _l / 2;
}

function containStroke$3(x0, y0, x1, y1, x2, y2, x3, y3, lineWidth, x, y) {
    if (lineWidth === 0) {
        return false;
    }
    var _l = lineWidth;
    if ((y > y0 + _l && y > y1 + _l && y > y2 + _l && y > y3 + _l)
        || (y < y0 - _l && y < y1 - _l && y < y2 - _l && y < y3 - _l)
        || (x > x0 + _l && x > x1 + _l && x > x2 + _l && x > x3 + _l)
        || (x < x0 - _l && x < x1 - _l && x < x2 - _l && x < x3 - _l)) {
        return false;
    }
    var d = cubicProjectPoint(x0, y0, x1, y1, x2, y2, x3, y3, x, y, null);
    return d <= _l / 2;
}

function containStroke$2(x0, y0, x1, y1, x2, y2, lineWidth, x, y) {
    if (lineWidth === 0) {
        return false;
    }
    var _l = lineWidth;
    if ((y > y0 + _l && y > y1 + _l && y > y2 + _l)
        || (y < y0 - _l && y < y1 - _l && y < y2 - _l)
        || (x > x0 + _l && x > x1 + _l && x > x2 + _l)
        || (x < x0 - _l && x < x1 - _l && x < x2 - _l)) {
        return false;
    }
    var d = quadraticProjectPoint(x0, y0, x1, y1, x2, y2, x, y, null);
    return d <= _l / 2;
}

var PI2$2 = Math.PI * 2;
function normalizeRadian(angle) {
    angle %= PI2$2;
    if (angle < 0) {
        angle += PI2$2;
    }
    return angle;
}

var PI2$1 = Math.PI * 2;
function containStroke$1(cx, cy, r, startAngle, endAngle, anticlockwise, lineWidth, x, y) {
    if (lineWidth === 0) {
        return false;
    }
    var _l = lineWidth;
    x -= cx;
    y -= cy;
    var d = Math.sqrt(x * x + y * y);
    if ((d - _l > r) || (d + _l < r)) {
        return false;
    }
    if (Math.abs(startAngle - endAngle) % PI2$1 < 1e-4) {
        return true;
    }
    if (anticlockwise) {
        var tmp = startAngle;
        startAngle = normalizeRadian(endAngle);
        endAngle = normalizeRadian(tmp);
    }
    else {
        startAngle = normalizeRadian(startAngle);
        endAngle = normalizeRadian(endAngle);
    }
    if (startAngle > endAngle) {
        endAngle += PI2$1;
    }
    var angle = Math.atan2(y, x);
    if (angle < 0) {
        angle += PI2$1;
    }
    return (angle >= startAngle && angle <= endAngle)
        || (angle + PI2$1 >= startAngle && angle + PI2$1 <= endAngle);
}

function windingLine(x0, y0, x1, y1, x, y) {
    if ((y > y0 && y > y1) || (y < y0 && y < y1)) {
        return 0;
    }
    if (y1 === y0) {
        return 0;
    }
    var t = (y - y0) / (y1 - y0);
    var dir = y1 < y0 ? 1 : -1;
    if (t === 1 || t === 0) {
        dir = y1 < y0 ? 0.5 : -0.5;
    }
    var x_ = t * (x1 - x0) + x0;
    return x_ === x ? Infinity : x_ > x ? dir : 0;
}

var CMD = PathProxy.CMD;
var PI2 = Math.PI * 2;
var EPSILON = 1e-4;
function isAroundEqual(a, b) {
    return Math.abs(a - b) < EPSILON;
}
var roots = [-1, -1, -1];
var extrema = [-1, -1];
function swapExtrema() {
    var tmp = extrema[0];
    extrema[0] = extrema[1];
    extrema[1] = tmp;
}
function windingCubic(x0, y0, x1, y1, x2, y2, x3, y3, x, y) {
    if ((y > y0 && y > y1 && y > y2 && y > y3)
        || (y < y0 && y < y1 && y < y2 && y < y3)) {
        return 0;
    }
    var nRoots = cubicRootAt(y0, y1, y2, y3, y, roots);
    if (nRoots === 0) {
        return 0;
    }
    else {
        var w = 0;
        var nExtrema = -1;
        var y0_ = void 0;
        var y1_ = void 0;
        for (var i = 0; i < nRoots; i++) {
            var t = roots[i];
            var unit = (t === 0 || t === 1) ? 0.5 : 1;
            var x_ = cubicAt(x0, x1, x2, x3, t);
            if (x_ < x) {
                continue;
            }
            if (nExtrema < 0) {
                nExtrema = cubicExtrema(y0, y1, y2, y3, extrema);
                if (extrema[1] < extrema[0] && nExtrema > 1) {
                    swapExtrema();
                }
                y0_ = cubicAt(y0, y1, y2, y3, extrema[0]);
                if (nExtrema > 1) {
                    y1_ = cubicAt(y0, y1, y2, y3, extrema[1]);
                }
            }
            if (nExtrema === 2) {
                if (t < extrema[0]) {
                    w += y0_ < y0 ? unit : -unit;
                }
                else if (t < extrema[1]) {
                    w += y1_ < y0_ ? unit : -unit;
                }
                else {
                    w += y3 < y1_ ? unit : -unit;
                }
            }
            else {
                if (t < extrema[0]) {
                    w += y0_ < y0 ? unit : -unit;
                }
                else {
                    w += y3 < y0_ ? unit : -unit;
                }
            }
        }
        return w;
    }
}
function windingQuadratic(x0, y0, x1, y1, x2, y2, x, y) {
    if ((y > y0 && y > y1 && y > y2)
        || (y < y0 && y < y1 && y < y2)) {
        return 0;
    }
    var nRoots = quadraticRootAt(y0, y1, y2, y, roots);
    if (nRoots === 0) {
        return 0;
    }
    else {
        var t = quadraticExtremum(y0, y1, y2);
        if (t >= 0 && t <= 1) {
            var w = 0;
            var y_ = quadraticAt(y0, y1, y2, t);
            for (var i = 0; i < nRoots; i++) {
                var unit = (roots[i] === 0 || roots[i] === 1) ? 0.5 : 1;
                var x_ = quadraticAt(x0, x1, x2, roots[i]);
                if (x_ < x) {
                    continue;
                }
                if (roots[i] < t) {
                    w += y_ < y0 ? unit : -unit;
                }
                else {
                    w += y2 < y_ ? unit : -unit;
                }
            }
            return w;
        }
        else {
            var unit = (roots[0] === 0 || roots[0] === 1) ? 0.5 : 1;
            var x_ = quadraticAt(x0, x1, x2, roots[0]);
            if (x_ < x) {
                return 0;
            }
            return y2 < y0 ? unit : -unit;
        }
    }
}
function windingArc(cx, cy, r, startAngle, endAngle, anticlockwise, x, y) {
    y -= cy;
    if (y > r || y < -r) {
        return 0;
    }
    var tmp = Math.sqrt(r * r - y * y);
    roots[0] = -tmp;
    roots[1] = tmp;
    var dTheta = Math.abs(startAngle - endAngle);
    if (dTheta < 1e-4) {
        return 0;
    }
    if (dTheta >= PI2 - 1e-4) {
        startAngle = 0;
        endAngle = PI2;
        var dir = anticlockwise ? 1 : -1;
        if (x >= roots[0] + cx && x <= roots[1] + cx) {
            return dir;
        }
        else {
            return 0;
        }
    }
    if (startAngle > endAngle) {
        var tmp_1 = startAngle;
        startAngle = endAngle;
        endAngle = tmp_1;
    }
    if (startAngle < 0) {
        startAngle += PI2;
        endAngle += PI2;
    }
    var w = 0;
    for (var i = 0; i < 2; i++) {
        var x_ = roots[i];
        if (x_ + cx > x) {
            var angle = Math.atan2(y, x_);
            var dir = anticlockwise ? 1 : -1;
            if (angle < 0) {
                angle = PI2 + angle;
            }
            if ((angle >= startAngle && angle <= endAngle)
                || (angle + PI2 >= startAngle && angle + PI2 <= endAngle)) {
                if (angle > Math.PI / 2 && angle < Math.PI * 1.5) {
                    dir = -dir;
                }
                w += dir;
            }
        }
    }
    return w;
}
function containPath(path, lineWidth, isStroke, x, y) {
    var data = path.data;
    var len = path.len();
    var w = 0;
    var xi = 0;
    var yi = 0;
    var x0 = 0;
    var y0 = 0;
    var x1;
    var y1;
    for (var i = 0; i < len;) {
        var cmd = data[i++];
        var isFirst = i === 1;
        if (cmd === CMD.M && i > 1) {
            if (!isStroke) {
                w += windingLine(xi, yi, x0, y0, x, y);
            }
        }
        if (isFirst) {
            xi = data[i];
            yi = data[i + 1];
            x0 = xi;
            y0 = yi;
        }
        switch (cmd) {
            case CMD.M:
                x0 = data[i++];
                y0 = data[i++];
                xi = x0;
                yi = y0;
                break;
            case CMD.L:
                if (isStroke) {
                    if (containStroke$4(xi, yi, data[i], data[i + 1], lineWidth, x, y)) {
                        return true;
                    }
                }
                else {
                    w += windingLine(xi, yi, data[i], data[i + 1], x, y) || 0;
                }
                xi = data[i++];
                yi = data[i++];
                break;
            case CMD.C:
                if (isStroke) {
                    if (containStroke$3(xi, yi, data[i++], data[i++], data[i++], data[i++], data[i], data[i + 1], lineWidth, x, y)) {
                        return true;
                    }
                }
                else {
                    w += windingCubic(xi, yi, data[i++], data[i++], data[i++], data[i++], data[i], data[i + 1], x, y) || 0;
                }
                xi = data[i++];
                yi = data[i++];
                break;
            case CMD.Q:
                if (isStroke) {
                    if (containStroke$2(xi, yi, data[i++], data[i++], data[i], data[i + 1], lineWidth, x, y)) {
                        return true;
                    }
                }
                else {
                    w += windingQuadratic(xi, yi, data[i++], data[i++], data[i], data[i + 1], x, y) || 0;
                }
                xi = data[i++];
                yi = data[i++];
                break;
            case CMD.A:
                var cx = data[i++];
                var cy = data[i++];
                var rx = data[i++];
                var ry = data[i++];
                var theta = data[i++];
                var dTheta = data[i++];
                i += 1;
                var anticlockwise = !!(1 - data[i++]);
                x1 = Math.cos(theta) * rx + cx;
                y1 = Math.sin(theta) * ry + cy;
                if (!isFirst) {
                    w += windingLine(xi, yi, x1, y1, x, y);
                }
                else {
                    x0 = x1;
                    y0 = y1;
                }
                var _x = (x - cx) * ry / rx + cx;
                if (isStroke) {
                    if (containStroke$1(cx, cy, ry, theta, theta + dTheta, anticlockwise, lineWidth, _x, y)) {
                        return true;
                    }
                }
                else {
                    w += windingArc(cx, cy, ry, theta, theta + dTheta, anticlockwise, _x, y);
                }
                xi = Math.cos(theta + dTheta) * rx + cx;
                yi = Math.sin(theta + dTheta) * ry + cy;
                break;
            case CMD.R:
                x0 = xi = data[i++];
                y0 = yi = data[i++];
                var width = data[i++];
                var height = data[i++];
                x1 = x0 + width;
                y1 = y0 + height;
                if (isStroke) {
                    if (containStroke$4(x0, y0, x1, y0, lineWidth, x, y)
                        || containStroke$4(x1, y0, x1, y1, lineWidth, x, y)
                        || containStroke$4(x1, y1, x0, y1, lineWidth, x, y)
                        || containStroke$4(x0, y1, x0, y0, lineWidth, x, y)) {
                        return true;
                    }
                }
                else {
                    w += windingLine(x1, y0, x1, y1, x, y);
                    w += windingLine(x0, y1, x0, y0, x, y);
                }
                break;
            case CMD.Z:
                if (isStroke) {
                    if (containStroke$4(xi, yi, x0, y0, lineWidth, x, y)) {
                        return true;
                    }
                }
                else {
                    w += windingLine(xi, yi, x0, y0, x, y);
                }
                xi = x0;
                yi = y0;
                break;
        }
    }
    if (!isStroke && !isAroundEqual(yi, y0)) {
        w += windingLine(xi, yi, x0, y0, x, y) || 0;
    }
    return w !== 0;
}
function contain(pathProxy, x, y) {
    return containPath(pathProxy, 0, false, x, y);
}
function containStroke(pathProxy, lineWidth, x, y) {
    return containPath(pathProxy, lineWidth, true, x, y);
}

var DEFAULT_PATH_STYLE = defaults({
    fill: '#000',
    stroke: null,
    strokePercent: 1,
    fillOpacity: 1,
    strokeOpacity: 1,
    lineDashOffset: 0,
    lineWidth: 1,
    lineCap: 'butt',
    miterLimit: 10,
    strokeNoScale: false,
    strokeFirst: false
}, DEFAULT_COMMON_STYLE);
var DEFAULT_PATH_ANIMATION_PROPS = {
    style: defaults({
        fill: true,
        stroke: true,
        strokePercent: true,
        fillOpacity: true,
        strokeOpacity: true,
        lineDashOffset: true,
        lineWidth: true,
        miterLimit: true
    }, DEFAULT_COMMON_ANIMATION_PROPS.style)
};
var pathCopyParams = [
    'x', 'y', 'rotation', 'scaleX', 'scaleY', 'originX', 'originY', 'invisible',
    'culling', 'z', 'z2', 'zlevel', 'parent'
];
var Path = (function (_super) {
    __extends(Path, _super);
    function Path(opts) {
        return _super.call(this, opts) || this;
    }
    Path.prototype.update = function () {
        var _this = this;
        _super.prototype.update.call(this);
        var style = this.style;
        if (style.decal) {
            var decalEl = this._decalEl
                = this._decalEl || new Path();
            if (decalEl.buildPath === Path.prototype.buildPath) {
                decalEl.buildPath = function (ctx) {
                    _this.buildPath(ctx, _this.shape);
                };
            }
            decalEl.silent = true;
            var decalElStyle = decalEl.style;
            for (var key in style) {
                if (decalElStyle[key] !== style[key]) {
                    decalElStyle[key] = style[key];
                }
            }
            decalElStyle.fill = style.fill ? style.decal : null;
            decalElStyle.decal = null;
            decalElStyle.shadowColor = null;
            style.strokeFirst && (decalElStyle.stroke = null);
            for (var i = 0; i < pathCopyParams.length; ++i) {
                decalEl[pathCopyParams[i]] = this[pathCopyParams[i]];
            }
            decalEl.__dirty |= Element.REDARAW_BIT;
        }
        else if (this._decalEl) {
            this._decalEl = null;
        }
    };
    Path.prototype.getDecalElement = function () {
        return this._decalEl;
    };
    Path.prototype._init = function (props) {
        var keysArr = keys(props);
        this.shape = this.getDefaultShape();
        var defaultStyle = this.getDefaultStyle();
        if (defaultStyle) {
            this.useStyle(defaultStyle);
        }
        for (var i = 0; i < keysArr.length; i++) {
            var key = keysArr[i];
            var value = props[key];
            if (key === 'style') {
                if (!this.style) {
                    this.useStyle(value);
                }
                else {
                    extend(this.style, value);
                }
            }
            else if (key === 'shape') {
                extend(this.shape, value);
            }
            else {
                _super.prototype.attrKV.call(this, key, value);
            }
        }
        if (!this.style) {
            this.useStyle({});
        }
    };
    Path.prototype.getDefaultStyle = function () {
        return null;
    };
    Path.prototype.getDefaultShape = function () {
        return {};
    };
    Path.prototype.canBeInsideText = function () {
        return this.hasFill();
    };
    Path.prototype.getInsideTextFill = function () {
        var pathFill = this.style.fill;
        if (pathFill !== 'none') {
            if (isString(pathFill)) {
                var fillLum = lum(pathFill, 0);
                if (fillLum > 0.5) {
                    return DARK_LABEL_COLOR;
                }
                else if (fillLum > 0.2) {
                    return LIGHTER_LABEL_COLOR;
                }
                return LIGHT_LABEL_COLOR;
            }
            else if (pathFill) {
                return LIGHT_LABEL_COLOR;
            }
        }
        return DARK_LABEL_COLOR;
    };
    Path.prototype.getInsideTextStroke = function (textFill) {
        var pathFill = this.style.fill;
        if (isString(pathFill)) {
            var zr = this.__zr;
            var isDarkMode = !!(zr && zr.isDarkMode());
            var isDarkLabel = lum(textFill, 0) < DARK_MODE_THRESHOLD;
            if (isDarkMode === isDarkLabel) {
                return pathFill;
            }
        }
    };
    Path.prototype.buildPath = function (ctx, shapeCfg, inBundle) { };
    Path.prototype.pathUpdated = function () {
        this.__dirty &= ~Path.SHAPE_CHANGED_BIT;
    };
    Path.prototype.createPathProxy = function () {
        this.path = new PathProxy(false);
    };
    Path.prototype.hasStroke = function () {
        var style = this.style;
        var stroke = style.stroke;
        return !(stroke == null || stroke === 'none' || !(style.lineWidth > 0));
    };
    Path.prototype.hasFill = function () {
        var style = this.style;
        var fill = style.fill;
        return fill != null && fill !== 'none';
    };
    Path.prototype.getBoundingRect = function () {
        var rect = this._rect;
        var style = this.style;
        var needsUpdateRect = !rect;
        if (needsUpdateRect) {
            var firstInvoke = false;
            if (!this.path) {
                firstInvoke = true;
                this.createPathProxy();
            }
            var path = this.path;
            if (firstInvoke || (this.__dirty & Path.SHAPE_CHANGED_BIT)) {
                path.beginPath();
                this.buildPath(path, this.shape, false);
                this.pathUpdated();
            }
            rect = path.getBoundingRect();
        }
        this._rect = rect;
        if (this.hasStroke() && this.path && this.path.len() > 0) {
            var rectWithStroke = this._rectWithStroke || (this._rectWithStroke = rect.clone());
            if (this.__dirty || needsUpdateRect) {
                rectWithStroke.copy(rect);
                var lineScale = style.strokeNoScale ? this.getLineScale() : 1;
                var w = style.lineWidth;
                if (!this.hasFill()) {
                    var strokeContainThreshold = this.strokeContainThreshold;
                    w = Math.max(w, strokeContainThreshold == null ? 4 : strokeContainThreshold);
                }
                if (lineScale > 1e-10) {
                    rectWithStroke.width += w / lineScale;
                    rectWithStroke.height += w / lineScale;
                    rectWithStroke.x -= w / lineScale / 2;
                    rectWithStroke.y -= w / lineScale / 2;
                }
            }
            return rectWithStroke;
        }
        return rect;
    };
    Path.prototype.contain = function (x, y) {
        var localPos = this.transformCoordToLocal(x, y);
        var rect = this.getBoundingRect();
        var style = this.style;
        x = localPos[0];
        y = localPos[1];
        if (rect.contain(x, y)) {
            var pathProxy = this.path;
            if (this.hasStroke()) {
                var lineWidth = style.lineWidth;
                var lineScale = style.strokeNoScale ? this.getLineScale() : 1;
                if (lineScale > 1e-10) {
                    if (!this.hasFill()) {
                        lineWidth = Math.max(lineWidth, this.strokeContainThreshold);
                    }
                    if (containStroke(pathProxy, lineWidth / lineScale, x, y)) {
                        return true;
                    }
                }
            }
            if (this.hasFill()) {
                return contain(pathProxy, x, y);
            }
        }
        return false;
    };
    Path.prototype.dirtyShape = function () {
        this.__dirty |= Path.SHAPE_CHANGED_BIT;
        if (this._rect) {
            this._rect = null;
        }
        if (this._decalEl) {
            this._decalEl.dirtyShape();
        }
        this.markRedraw();
    };
    Path.prototype.dirty = function () {
        this.dirtyStyle();
        this.dirtyShape();
    };
    Path.prototype.animateShape = function (loop) {
        return this.animate('shape', loop);
    };
    Path.prototype.updateDuringAnimation = function (targetKey) {
        if (targetKey === 'style') {
            this.dirtyStyle();
        }
        else if (targetKey === 'shape') {
            this.dirtyShape();
        }
        else {
            this.markRedraw();
        }
    };
    Path.prototype.attrKV = function (key, value) {
        if (key === 'shape') {
            this.setShape(value);
        }
        else {
            _super.prototype.attrKV.call(this, key, value);
        }
    };
    Path.prototype.setShape = function (keyOrObj, value) {
        var shape = this.shape;
        if (!shape) {
            shape = this.shape = {};
        }
        if (typeof keyOrObj === 'string') {
            shape[keyOrObj] = value;
        }
        else {
            extend(shape, keyOrObj);
        }
        this.dirtyShape();
        return this;
    };
    Path.prototype.shapeChanged = function () {
        return !!(this.__dirty & Path.SHAPE_CHANGED_BIT);
    };
    Path.prototype.createStyle = function (obj) {
        return createObject(DEFAULT_PATH_STYLE, obj);
    };
    Path.prototype._innerSaveToNormal = function (toState) {
        _super.prototype._innerSaveToNormal.call(this, toState);
        var normalState = this._normalState;
        if (toState.shape && !normalState.shape) {
            normalState.shape = extend({}, this.shape);
        }
    };
    Path.prototype._applyStateObj = function (stateName, state, normalState, keepCurrentStates, transition, animationCfg) {
        _super.prototype._applyStateObj.call(this, stateName, state, normalState, keepCurrentStates, transition, animationCfg);
        var needsRestoreToNormal = !(state && keepCurrentStates);
        var targetShape;
        if (state && state.shape) {
            if (transition) {
                if (keepCurrentStates) {
                    targetShape = state.shape;
                }
                else {
                    targetShape = extend({}, normalState.shape);
                    extend(targetShape, state.shape);
                }
            }
            else {
                targetShape = extend({}, keepCurrentStates ? this.shape : normalState.shape);
                extend(targetShape, state.shape);
            }
        }
        else if (needsRestoreToNormal) {
            targetShape = normalState.shape;
        }
        if (targetShape) {
            if (transition) {
                this.shape = extend({}, this.shape);
                var targetShapePrimaryProps = {};
                var shapeKeys = keys(targetShape);
                for (var i = 0; i < shapeKeys.length; i++) {
                    var key = shapeKeys[i];
                    if (typeof targetShape[key] === 'object') {
                        this.shape[key] = targetShape[key];
                    }
                    else {
                        targetShapePrimaryProps[key] = targetShape[key];
                    }
                }
                this._transitionState(stateName, {
                    shape: targetShapePrimaryProps
                }, animationCfg);
            }
            else {
                this.shape = targetShape;
                this.dirtyShape();
            }
        }
    };
    Path.prototype._mergeStates = function (states) {
        var mergedState = _super.prototype._mergeStates.call(this, states);
        var mergedShape;
        for (var i = 0; i < states.length; i++) {
            var state = states[i];
            if (state.shape) {
                mergedShape = mergedShape || {};
                this._mergeStyle(mergedShape, state.shape);
            }
        }
        if (mergedShape) {
            mergedState.shape = mergedShape;
        }
        return mergedState;
    };
    Path.prototype.getAnimationStyleProps = function () {
        return DEFAULT_PATH_ANIMATION_PROPS;
    };
    Path.prototype.isZeroArea = function () {
        return false;
    };
    Path.extend = function (defaultProps) {
        var Sub = (function (_super) {
            __extends(Sub, _super);
            function Sub(opts) {
                var _this = _super.call(this, opts) || this;
                defaultProps.init && defaultProps.init.call(_this, opts);
                return _this;
            }
            Sub.prototype.getDefaultStyle = function () {
                return clone$2(defaultProps.style);
            };
            Sub.prototype.getDefaultShape = function () {
                return clone$2(defaultProps.shape);
            };
            return Sub;
        }(Path));
        for (var key in defaultProps) {
            if (typeof defaultProps[key] === 'function') {
                Sub.prototype[key] = defaultProps[key];
            }
        }
        return Sub;
    };
    Path.SHAPE_CHANGED_BIT = 4;
    Path.initDefaultProps = (function () {
        var pathProto = Path.prototype;
        pathProto.type = 'path';
        pathProto.strokeContainThreshold = 5;
        pathProto.segmentIgnoreThreshold = 0;
        pathProto.subPixelOptimize = false;
        pathProto.autoBatch = false;
        pathProto.__dirty = Element.REDARAW_BIT | Displayable.STYLE_CHANGED_BIT | Path.SHAPE_CHANGED_BIT;
    })();
    return Path;
}(Displayable));

var DEFAULT_TSPAN_STYLE = defaults({
    strokeFirst: true,
    font: DEFAULT_FONT,
    x: 0,
    y: 0,
    textAlign: 'left',
    textBaseline: 'top',
    miterLimit: 2
}, DEFAULT_PATH_STYLE);
var TSpan = (function (_super) {
    __extends(TSpan, _super);
    function TSpan() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TSpan.prototype.hasStroke = function () {
        var style = this.style;
        var stroke = style.stroke;
        return stroke != null && stroke !== 'none' && style.lineWidth > 0;
    };
    TSpan.prototype.hasFill = function () {
        var style = this.style;
        var fill = style.fill;
        return fill != null && fill !== 'none';
    };
    TSpan.prototype.createStyle = function (obj) {
        return createObject(DEFAULT_TSPAN_STYLE, obj);
    };
    TSpan.prototype.setBoundingRect = function (rect) {
        this._rect = rect;
    };
    TSpan.prototype.getBoundingRect = function () {
        var style = this.style;
        if (!this._rect) {
            var text = style.text;
            text != null ? (text += '') : (text = '');
            var rect = getBoundingRect(text, style.font, style.textAlign, style.textBaseline);
            rect.x += style.x || 0;
            rect.y += style.y || 0;
            if (this.hasStroke()) {
                var w = style.lineWidth;
                rect.x -= w / 2;
                rect.y -= w / 2;
                rect.width += w;
                rect.height += w;
            }
            this._rect = rect;
        }
        return this._rect;
    };
    TSpan.initDefaultProps = (function () {
        var tspanProto = TSpan.prototype;
        tspanProto.dirtyRectTolerance = 10;
    })();
    return TSpan;
}(Displayable));
TSpan.prototype.type = 'tspan';

var DEFAULT_IMAGE_STYLE = defaults({
    x: 0,
    y: 0
}, DEFAULT_COMMON_STYLE);
var DEFAULT_IMAGE_ANIMATION_PROPS = {
    style: defaults({
        x: true,
        y: true,
        width: true,
        height: true,
        sx: true,
        sy: true,
        sWidth: true,
        sHeight: true
    }, DEFAULT_COMMON_ANIMATION_PROPS.style)
};
function isImageLike(source) {
    return !!(source
        && typeof source !== 'string'
        && source.width && source.height);
}
var ZRImage = (function (_super) {
    __extends(ZRImage, _super);
    function ZRImage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZRImage.prototype.createStyle = function (obj) {
        return createObject(DEFAULT_IMAGE_STYLE, obj);
    };
    ZRImage.prototype._getSize = function (dim) {
        var style = this.style;
        var size = style[dim];
        if (size != null) {
            return size;
        }
        var imageSource = isImageLike(style.image)
            ? style.image : this.__image;
        if (!imageSource) {
            return 0;
        }
        var otherDim = dim === 'width' ? 'height' : 'width';
        var otherDimSize = style[otherDim];
        if (otherDimSize == null) {
            return imageSource[dim];
        }
        else {
            return imageSource[dim] / imageSource[otherDim] * otherDimSize;
        }
    };
    ZRImage.prototype.getWidth = function () {
        return this._getSize('width');
    };
    ZRImage.prototype.getHeight = function () {
        return this._getSize('height');
    };
    ZRImage.prototype.getAnimationStyleProps = function () {
        return DEFAULT_IMAGE_ANIMATION_PROPS;
    };
    ZRImage.prototype.getBoundingRect = function () {
        var style = this.style;
        if (!this._rect) {
            this._rect = new BoundingRect(style.x || 0, style.y || 0, this.getWidth(), this.getHeight());
        }
        return this._rect;
    };
    return ZRImage;
}(Displayable));
ZRImage.prototype.type = 'image';

var m = [];
var IncrementalDisplayable = (function (_super) {
    __extends(IncrementalDisplayable, _super);
    function IncrementalDisplayable() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.notClear = true;
        _this.incremental = true;
        _this._displayables = [];
        _this._temporaryDisplayables = [];
        _this._cursor = 0;
        return _this;
    }
    IncrementalDisplayable.prototype.traverse = function (cb, context) {
        cb.call(context, this);
    };
    IncrementalDisplayable.prototype.useStyle = function () {
        this.style = {};
    };
    IncrementalDisplayable.prototype.getCursor = function () {
        return this._cursor;
    };
    IncrementalDisplayable.prototype.innerAfterBrush = function () {
        this._cursor = this._displayables.length;
    };
    IncrementalDisplayable.prototype.clearDisplaybles = function () {
        this._displayables = [];
        this._temporaryDisplayables = [];
        this._cursor = 0;
        this.markRedraw();
        this.notClear = false;
    };
    IncrementalDisplayable.prototype.clearTemporalDisplayables = function () {
        this._temporaryDisplayables = [];
    };
    IncrementalDisplayable.prototype.addDisplayable = function (displayable, notPersistent) {
        if (notPersistent) {
            this._temporaryDisplayables.push(displayable);
        }
        else {
            this._displayables.push(displayable);
        }
        this.markRedraw();
    };
    IncrementalDisplayable.prototype.addDisplayables = function (displayables, notPersistent) {
        notPersistent = notPersistent || false;
        for (var i = 0; i < displayables.length; i++) {
            this.addDisplayable(displayables[i], notPersistent);
        }
    };
    IncrementalDisplayable.prototype.getDisplayables = function () {
        return this._displayables;
    };
    IncrementalDisplayable.prototype.getTemporalDisplayables = function () {
        return this._temporaryDisplayables;
    };
    IncrementalDisplayable.prototype.eachPendingDisplayable = function (cb) {
        for (var i = this._cursor; i < this._displayables.length; i++) {
            cb && cb(this._displayables[i]);
        }
        for (var i = 0; i < this._temporaryDisplayables.length; i++) {
            cb && cb(this._temporaryDisplayables[i]);
        }
    };
    IncrementalDisplayable.prototype.update = function () {
        this.updateTransform();
        for (var i = this._cursor; i < this._displayables.length; i++) {
            var displayable = this._displayables[i];
            displayable.parent = this;
            displayable.update();
            displayable.parent = null;
        }
        for (var i = 0; i < this._temporaryDisplayables.length; i++) {
            var displayable = this._temporaryDisplayables[i];
            displayable.parent = this;
            displayable.update();
            displayable.parent = null;
        }
    };
    IncrementalDisplayable.prototype.getBoundingRect = function () {
        if (!this._rect) {
            var rect = new BoundingRect(Infinity, Infinity, -Infinity, -Infinity);
            for (var i = 0; i < this._displayables.length; i++) {
                var displayable = this._displayables[i];
                var childRect = displayable.getBoundingRect().clone();
                if (displayable.needLocalTransform()) {
                    childRect.applyTransform(displayable.getLocalTransform(m));
                }
                rect.union(childRect);
            }
            this._rect = rect;
        }
        return this._rect;
    };
    IncrementalDisplayable.prototype.contain = function (x, y) {
        var localPos = this.transformCoordToLocal(x, y);
        var rect = this.getBoundingRect();
        if (rect.contain(localPos[0], localPos[1])) {
            for (var i = 0; i < this._displayables.length; i++) {
                var displayable = this._displayables[i];
                if (displayable.contain(x, y)) {
                    return true;
                }
            }
        }
        return false;
    };
    return IncrementalDisplayable;
}(Displayable));

export { clone as $, findExistImage as A, isImageReady as B, copy$1 as C, DEFAULT_COMMON_ANIMATION_PROPS as D, keys as E, DEFAULT_FONT as F, BoundingRect as G, adjustTextX as H, adjustTextY as I, trim as J, Displayable as K, normalizeCssArray as L, isStringSafe as M, env as N, interpolateNumber as O, Path as P, lift as Q, LRU as R, applyTransform as S, TSpan as T, Element as U, normalizeArcAngles as V, distance as W, min$1 as X, max$1 as Y, ZRImage as Z, __extends as _, isObject as a, sub as a0, scale as a1, add as a2, quadraticSubdivide as a3, cubicSubdivide as a4, normalize as a5, cubicDerivativeAt as a6, quadraticDerivativeAt as a7, quadraticAt as a8, Point as a9, lerp$1 as aA, normalizeRadian as aB, Animator as aC, noop as aD, guid as aE, lum as aF, DARK_MODE_THRESHOLD as aG, setAsPrimitive as aH, createCanvas as aI, $override as aJ, eqNaN as aK, parsePercent as aL, createOrUpdateImage as aM, DEFAULT_COMMON_STYLE as aN, windingLine as aO, fromPoints as aP, matrix as aQ, vector as aR, util as aS, color as aT, devicePixelRatio as aU, isGradientObject as aV, isPatternObject as aW, logError as aX, identity as aa, mul$1 as ab, Transformable as ac, invert as ad, IncrementalDisplayable as ae, merge as af, mixin as ag, isTypedArray as ah, hasOwn as ai, isNumber as aj, bind as ak, calculateTextPosition as al, filter as am, retrieve as an, rotate as ao, Eventful as ap, translate as aq, getBoundingRect as ar, create$1 as as, isDom as at, toHex as au, parse as av, stringify as aw, quadraticProjectPoint as ax, cubicProjectPoint as ay, dist as az, PathProxy as b, cubicRootAt as c, cubicAt as d, extend as e, defaults as f, each as g, createHashMap as h, isArray as i, isArrayLike as j, indexOf as k, clone$2 as l, map as m, isString as n, isFunction as o, curry as p, inherits as q, assert as r, slice as s, createObject as t, __spreadArrays as u, retrieve2 as v, getWidth as w, reduce as x, getLineHeight as y, retrieve3 as z };
