import { e as extend, q as inherits, g as each$1, r as assert, t as createObject, u as __spreadArrays, k as indexOf, v as retrieve2, w as getWidth, x as reduce, y as getLineHeight, z as retrieve3, A as findExistImage, B as isImageReady, _ as __extends, P as Path, f as defaults, D as DEFAULT_COMMON_ANIMATION_PROPS, C as copy, E as keys, F as DEFAULT_FONT, T as TSpan, G as BoundingRect, H as adjustTextX, I as adjustTextY, Z as ZRImage, J as trim, K as Displayable, L as normalizeCssArray$1, n as isString, m as map, a as isObject, M as isStringSafe, i as isArray, h as createHashMap, N as env, O as interpolateNumber, j as isArrayLike, Q as lift, R as LRU, S as applyTransform$1, b as PathProxy, U as Element, V as normalizeArcAngles, W as distance, X as min, Y as max, $ as clone, a0 as sub, a1 as scale, a2 as add, a3 as quadraticSubdivide, a4 as cubicSubdivide, a5 as normalize, a6 as cubicDerivativeAt, d as cubicAt, a7 as quadraticDerivativeAt, a8 as quadraticAt, a9 as Point, aa as identity, ab as mul, ac as Transformable, ad as invert, ae as IncrementalDisplayable, o as isFunction, af as merge, l as clone$1, ag as mixin, ah as isTypedArray, ai as hasOwn, aj as isNumber, ak as bind, p as curry, al as calculateTextPosition } from './IncrementalDisplayable-eed1c2a2.js';

var TYPE_DELIMITER = '.';
var IS_CONTAINER = '___EC__COMPONENT__CONTAINER___';
var IS_EXTENDED_CLASS = '___EC__EXTENDED_CLASS___';
/**
 * Notice, parseClassType('') should returns {main: '', sub: ''}
 * @public
 */

function parseClassType(componentType) {
  var ret = {
    main: '',
    sub: ''
  };

  if (componentType) {
    var typeArr = componentType.split(TYPE_DELIMITER);
    ret.main = typeArr[0] || '';
    ret.sub = typeArr[1] || '';
  }

  return ret;
}
/**
 * @public
 */

function checkClassType(componentType) {
  assert(/^[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)?$/.test(componentType), 'componentType "' + componentType + '" illegal');
}

function isExtendedClass(clz) {
  return !!(clz && clz[IS_EXTENDED_CLASS]);
}
/**
 * Implements `ExtendableConstructor` for `rootClz`.
 *
 * @usage
 * ```ts
 * class Xxx {}
 * type XxxConstructor = typeof Xxx & ExtendableConstructor
 * enableClassExtend(Xxx as XxxConstructor);
 * ```
 */

function enableClassExtend(rootClz, mandatoryMethods) {
  rootClz.$constructor = rootClz; // FIXME: not necessary?

  rootClz.extend = function (proto) {

    var superClass = this; // For backward compat, we both support ts class inheritance and this
    // "extend" approach.
    // The constructor should keep the same behavior as ts class inheritance:
    // If this constructor/$constructor is not declared, auto invoke the super
    // constructor.
    // If this constructor/$constructor is declared, it is responsible for
    // calling the super constructor.

    function ExtendedClass() {
      var args = [];

      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }

      if (!proto.$constructor) {
        if (!isESClass(superClass)) {
          // Will throw error if superClass is an es6 native class.
          superClass.apply(this, arguments);
        } else {
          var ins = createObject( // @ts-ignore
          ExtendedClass.prototype, new (superClass.bind.apply(superClass, __spreadArrays([void 0], args)))());
          return ins;
        }
      } else {
        proto.$constructor.apply(this, arguments);
      }
    }

    ExtendedClass[IS_EXTENDED_CLASS] = true;
    extend(ExtendedClass.prototype, proto);
    ExtendedClass.extend = this.extend;
    ExtendedClass.superCall = superCall;
    ExtendedClass.superApply = superApply;
    inherits(ExtendedClass, this);
    ExtendedClass.superClass = superClass;
    return ExtendedClass;
  };
}

function isESClass(fn) {
  return typeof fn === 'function' && /^class\s/.test(Function.prototype.toString.call(fn));
}
/**
 * A work around to both support ts extend and this extend mechanism.
 * on sub-class.
 * @usage
 * ```ts
 * class Component { ... }
 * classUtil.enableClassExtend(Component);
 * classUtil.enableClassManagement(Component, {registerWhenExtend: true});
 *
 * class Series extends Component { ... }
 * // Without calling `markExtend`, `registerWhenExtend` will not work.
 * Component.markExtend(Series);
 * ```
 */


function mountExtend(SubClz, SupperClz) {
  SubClz.extend = SupperClz.extend;
} // A random offset.

var classBase = Math.round(Math.random() * 10);
/**
 * Implements `CheckableConstructor` for `target`.
 * Can not use instanceof, consider different scope by
 * cross domain or es module import in ec extensions.
 * Mount a method "isInstance()" to Clz.
 *
 * @usage
 * ```ts
 * class Xxx {}
 * type XxxConstructor = typeof Xxx & CheckableConstructor;
 * enableClassCheck(Xxx as XxxConstructor)
 * ```
 */

function enableClassCheck(target) {
  var classAttr = ['__\0is_clz', classBase++].join('_');
  target.prototype[classAttr] = true;

  target.isInstance = function (obj) {
    return !!(obj && obj[classAttr]);
  };
} // superCall should have class info, which can not be fetch from 'this'.
// Consider this case:
// class A has method f,
// class B inherits class A, overrides method f, f call superApply('f'),
// class C inherits class B, do not overrides method f,
// then when method of class C is called, dead loop occured.

function superCall(context, methodName) {
  var args = [];

  for (var _i = 2; _i < arguments.length; _i++) {
    args[_i - 2] = arguments[_i];
  }

  return this.superClass.prototype[methodName].apply(context, args);
}

function superApply(context, methodName, args) {
  return this.superClass.prototype[methodName].apply(context, args);
}
/**
 * Implements `ClassManager` for `target`
 *
 * @usage
 * ```ts
 * class Xxx {}
 * type XxxConstructor = typeof Xxx & ClassManager
 * enableClassManagement(Xxx as XxxConstructor);
 * ```
 */


function enableClassManagement(target) {
  /**
   * Component model classes
   * key: componentType,
   * value:
   *     componentClass, when componentType is 'xxx'
   *     or Object.<subKey, componentClass>, when componentType is 'xxx.yy'
   */
  var storage = {};

  target.registerClass = function (clz) {
    // `type` should not be a "instance memeber".
    // If using TS class, should better declared as `static type = 'series.pie'`.
    // otherwise users have to mount `type` on prototype manually.
    // For backward compat and enable instance visit type via `this.type`,
    // we stil support fetch `type` from prototype.
    var componentFullType = clz.type || clz.prototype.type;

    if (componentFullType) {
      checkClassType(componentFullType); // If only static type declared, we assign it to prototype mandatorily.

      clz.prototype.type = componentFullType;
      var componentTypeInfo = parseClassType(componentFullType);

      if (!componentTypeInfo.sub) {

        storage[componentTypeInfo.main] = clz;
      } else if (componentTypeInfo.sub !== IS_CONTAINER) {
        var container = makeContainer(componentTypeInfo);
        container[componentTypeInfo.sub] = clz;
      }
    }

    return clz;
  };

  target.getClass = function (mainType, subType, throwWhenNotFound) {
    var clz = storage[mainType];

    if (clz && clz[IS_CONTAINER]) {
      clz = subType ? clz[subType] : null;
    }

    if (throwWhenNotFound && !clz) {
      throw new Error(!subType ? mainType + '.' + 'type should be specified.' : 'Component ' + mainType + '.' + (subType || '') + ' not exists. Load it first.');
    }

    return clz;
  };

  target.getClassesByMainType = function (componentType) {
    var componentTypeInfo = parseClassType(componentType);
    var result = [];
    var obj = storage[componentTypeInfo.main];

    if (obj && obj[IS_CONTAINER]) {
      each$1(obj, function (o, type) {
        type !== IS_CONTAINER && result.push(o);
      });
    } else {
      result.push(obj);
    }

    return result;
  };

  target.hasClass = function (componentType) {
    // Just consider componentType.main.
    var componentTypeInfo = parseClassType(componentType);
    return !!storage[componentTypeInfo.main];
  };
  /**
   * @return Like ['aa', 'bb'], but can not be ['aa.xx']
   */


  target.getAllClassMainTypes = function () {
    var types = [];
    each$1(storage, function (obj, type) {
      types.push(type);
    });
    return types;
  };
  /**
   * If a main type is container and has sub types
   */


  target.hasSubTypes = function (componentType) {
    var componentTypeInfo = parseClassType(componentType);
    var obj = storage[componentTypeInfo.main];
    return obj && obj[IS_CONTAINER];
  };

  function makeContainer(componentTypeInfo) {
    var container = storage[componentTypeInfo.main];

    if (!container || !container[IS_CONTAINER]) {
      container = storage[componentTypeInfo.main] = {};
      container[IS_CONTAINER] = true;
    }

    return container;
  }
} // /**
//  * @param {string|Array.<string>} properties
//  */
// export function setReadOnly(obj, properties) {
// FIXME It seems broken in IE8 simulation of IE11
// if (!zrUtil.isArray(properties)) {
//     properties = properties != null ? [properties] : [];
// }
// zrUtil.each(properties, function (prop) {
//     let value = obj[prop];
//     Object.defineProperty
//         && Object.defineProperty(obj, prop, {
//             value: value, writable: false
//         });
//     zrUtil.isArray(obj[prop])
//         && Object.freeze
//         && Object.freeze(obj[prop]);
// });
// }

function makeStyleMapper(properties, ignoreParent) {
  // Normalize
  for (var i = 0; i < properties.length; i++) {
    if (!properties[i][1]) {
      properties[i][1] = properties[i][0];
    }
  }

  ignoreParent = ignoreParent || false;
  return function (model, excludes, includes) {
    var style = {};

    for (var i = 0; i < properties.length; i++) {
      var propName = properties[i][1];

      if (excludes && indexOf(excludes, propName) >= 0 || includes && indexOf(includes, propName) < 0) {
        continue;
      }

      var val = model.getShallow(propName, ignoreParent);

      if (val != null) {
        style[properties[i][0]] = val;
      }
    } // TODO Text or image?


    return style;
  };
}

var AREA_STYLE_KEY_MAP = [['fill', 'color'], ['shadowBlur'], ['shadowOffsetX'], ['shadowOffsetY'], ['opacity'], ['shadowColor'] // Option decal is in `DecalObject` but style.decal is in `PatternObject`.
// So do not transfer decal directly.
];
var getAreaStyle = makeStyleMapper(AREA_STYLE_KEY_MAP);

var AreaStyleMixin =
/** @class */
function () {
  function AreaStyleMixin() {}

  AreaStyleMixin.prototype.getAreaStyle = function (excludes, includes) {
    return getAreaStyle(this, excludes, includes);
  };

  return AreaStyleMixin;
}();

var STYLE_REG = /\{([a-zA-Z0-9_]+)\|([^}]*)\}/g;
function truncateText(text, containerWidth, font, ellipsis, options) {
    if (!containerWidth) {
        return '';
    }
    var textLines = (text + '').split('\n');
    options = prepareTruncateOptions(containerWidth, font, ellipsis, options);
    for (var i = 0, len = textLines.length; i < len; i++) {
        textLines[i] = truncateSingleLine(textLines[i], options);
    }
    return textLines.join('\n');
}
function prepareTruncateOptions(containerWidth, font, ellipsis, options) {
    options = options || {};
    var preparedOpts = extend({}, options);
    preparedOpts.font = font;
    ellipsis = retrieve2(ellipsis, '...');
    preparedOpts.maxIterations = retrieve2(options.maxIterations, 2);
    var minChar = preparedOpts.minChar = retrieve2(options.minChar, 0);
    preparedOpts.cnCharWidth = getWidth('国', font);
    var ascCharWidth = preparedOpts.ascCharWidth = getWidth('a', font);
    preparedOpts.placeholder = retrieve2(options.placeholder, '');
    var contentWidth = containerWidth = Math.max(0, containerWidth - 1);
    for (var i = 0; i < minChar && contentWidth >= ascCharWidth; i++) {
        contentWidth -= ascCharWidth;
    }
    var ellipsisWidth = getWidth(ellipsis, font);
    if (ellipsisWidth > contentWidth) {
        ellipsis = '';
        ellipsisWidth = 0;
    }
    contentWidth = containerWidth - ellipsisWidth;
    preparedOpts.ellipsis = ellipsis;
    preparedOpts.ellipsisWidth = ellipsisWidth;
    preparedOpts.contentWidth = contentWidth;
    preparedOpts.containerWidth = containerWidth;
    return preparedOpts;
}
function truncateSingleLine(textLine, options) {
    var containerWidth = options.containerWidth;
    var font = options.font;
    var contentWidth = options.contentWidth;
    if (!containerWidth) {
        return '';
    }
    var lineWidth = getWidth(textLine, font);
    if (lineWidth <= containerWidth) {
        return textLine;
    }
    for (var j = 0;; j++) {
        if (lineWidth <= contentWidth || j >= options.maxIterations) {
            textLine += options.ellipsis;
            break;
        }
        var subLength = j === 0
            ? estimateLength(textLine, contentWidth, options.ascCharWidth, options.cnCharWidth)
            : lineWidth > 0
                ? Math.floor(textLine.length * contentWidth / lineWidth)
                : 0;
        textLine = textLine.substr(0, subLength);
        lineWidth = getWidth(textLine, font);
    }
    if (textLine === '') {
        textLine = options.placeholder;
    }
    return textLine;
}
function estimateLength(text, contentWidth, ascCharWidth, cnCharWidth) {
    var width = 0;
    var i = 0;
    for (var len = text.length; i < len && width < contentWidth; i++) {
        var charCode = text.charCodeAt(i);
        width += (0 <= charCode && charCode <= 127) ? ascCharWidth : cnCharWidth;
    }
    return i;
}
function parsePlainText(text, style) {
    text != null && (text += '');
    var overflow = style.overflow;
    var padding = style.padding;
    var font = style.font;
    var truncate = overflow === 'truncate';
    var calculatedLineHeight = getLineHeight(font);
    var lineHeight = retrieve2(style.lineHeight, calculatedLineHeight);
    var truncateLineOverflow = style.lineOverflow === 'truncate';
    var width = style.width;
    var lines;
    if (width != null && overflow === 'break' || overflow === 'breakAll') {
        lines = text ? wrapText(text, style.font, width, overflow === 'breakAll', 0).lines : [];
    }
    else {
        lines = text ? text.split('\n') : [];
    }
    var contentHeight = lines.length * lineHeight;
    var height = retrieve2(style.height, contentHeight);
    if (contentHeight > height && truncateLineOverflow) {
        var lineCount = Math.floor(height / lineHeight);
        lines = lines.slice(0, lineCount);
    }
    var outerHeight = height;
    var outerWidth = width;
    if (padding) {
        outerHeight += padding[0] + padding[2];
        if (outerWidth != null) {
            outerWidth += padding[1] + padding[3];
        }
    }
    if (text && truncate && outerWidth != null) {
        var options = prepareTruncateOptions(width, font, style.ellipsis, {
            minChar: style.truncateMinChar,
            placeholder: style.placeholder
        });
        for (var i = 0; i < lines.length; i++) {
            lines[i] = truncateSingleLine(lines[i], options);
        }
    }
    if (width == null) {
        var maxWidth = 0;
        for (var i = 0; i < lines.length; i++) {
            maxWidth = Math.max(getWidth(lines[i], font), maxWidth);
        }
        width = maxWidth;
    }
    return {
        lines: lines,
        height: height,
        outerHeight: outerHeight,
        lineHeight: lineHeight,
        calculatedLineHeight: calculatedLineHeight,
        contentHeight: contentHeight,
        width: width
    };
}
var RichTextToken = (function () {
    function RichTextToken() {
    }
    return RichTextToken;
}());
var RichTextLine = (function () {
    function RichTextLine(tokens) {
        this.tokens = [];
        if (tokens) {
            this.tokens = tokens;
        }
    }
    return RichTextLine;
}());
var RichTextContentBlock = (function () {
    function RichTextContentBlock() {
        this.width = 0;
        this.height = 0;
        this.contentWidth = 0;
        this.contentHeight = 0;
        this.outerWidth = 0;
        this.outerHeight = 0;
        this.lines = [];
    }
    return RichTextContentBlock;
}());
function parseRichText(text, style) {
    var contentBlock = new RichTextContentBlock();
    text != null && (text += '');
    if (!text) {
        return contentBlock;
    }
    var topWidth = style.width;
    var topHeight = style.height;
    var overflow = style.overflow;
    var wrapInfo = (overflow === 'break' || overflow === 'breakAll') && topWidth != null
        ? { width: topWidth, accumWidth: 0, breakAll: overflow === 'breakAll' }
        : null;
    var lastIndex = STYLE_REG.lastIndex = 0;
    var result;
    while ((result = STYLE_REG.exec(text)) != null) {
        var matchedIndex = result.index;
        if (matchedIndex > lastIndex) {
            pushTokens(contentBlock, text.substring(lastIndex, matchedIndex), style, wrapInfo);
        }
        pushTokens(contentBlock, result[2], style, wrapInfo, result[1]);
        lastIndex = STYLE_REG.lastIndex;
    }
    if (lastIndex < text.length) {
        pushTokens(contentBlock, text.substring(lastIndex, text.length), style, wrapInfo);
    }
    var pendingList = [];
    var calculatedHeight = 0;
    var calculatedWidth = 0;
    var stlPadding = style.padding;
    var truncate = overflow === 'truncate';
    var truncateLine = style.lineOverflow === 'truncate';
    function finishLine(line, lineWidth, lineHeight) {
        line.width = lineWidth;
        line.lineHeight = lineHeight;
        calculatedHeight += lineHeight;
        calculatedWidth = Math.max(calculatedWidth, lineWidth);
    }
    outer: for (var i = 0; i < contentBlock.lines.length; i++) {
        var line = contentBlock.lines[i];
        var lineHeight = 0;
        var lineWidth = 0;
        for (var j = 0; j < line.tokens.length; j++) {
            var token = line.tokens[j];
            var tokenStyle = token.styleName && style.rich[token.styleName] || {};
            var textPadding = token.textPadding = tokenStyle.padding;
            var paddingH = textPadding ? textPadding[1] + textPadding[3] : 0;
            var font = token.font = tokenStyle.font || style.font;
            token.contentHeight = getLineHeight(font);
            var tokenHeight = retrieve2(tokenStyle.height, token.contentHeight);
            token.innerHeight = tokenHeight;
            textPadding && (tokenHeight += textPadding[0] + textPadding[2]);
            token.height = tokenHeight;
            token.lineHeight = retrieve3(tokenStyle.lineHeight, style.lineHeight, tokenHeight);
            token.align = tokenStyle && tokenStyle.align || style.align;
            token.verticalAlign = tokenStyle && tokenStyle.verticalAlign || 'middle';
            if (truncateLine && topHeight != null && calculatedHeight + token.lineHeight > topHeight) {
                if (j > 0) {
                    line.tokens = line.tokens.slice(0, j);
                    finishLine(line, lineWidth, lineHeight);
                    contentBlock.lines = contentBlock.lines.slice(0, i + 1);
                }
                else {
                    contentBlock.lines = contentBlock.lines.slice(0, i);
                }
                break outer;
            }
            var styleTokenWidth = tokenStyle.width;
            var tokenWidthNotSpecified = styleTokenWidth == null || styleTokenWidth === 'auto';
            if (typeof styleTokenWidth === 'string' && styleTokenWidth.charAt(styleTokenWidth.length - 1) === '%') {
                token.percentWidth = styleTokenWidth;
                pendingList.push(token);
                token.contentWidth = getWidth(token.text, font);
            }
            else {
                if (tokenWidthNotSpecified) {
                    var textBackgroundColor = tokenStyle.backgroundColor;
                    var bgImg = textBackgroundColor && textBackgroundColor.image;
                    if (bgImg) {
                        bgImg = findExistImage(bgImg);
                        if (isImageReady(bgImg)) {
                            token.width = Math.max(token.width, bgImg.width * tokenHeight / bgImg.height);
                        }
                    }
                }
                var remainTruncWidth = truncate && topWidth != null
                    ? topWidth - lineWidth : null;
                if (remainTruncWidth != null && remainTruncWidth < token.width) {
                    if (!tokenWidthNotSpecified || remainTruncWidth < paddingH) {
                        token.text = '';
                        token.width = token.contentWidth = 0;
                    }
                    else {
                        token.text = truncateText(token.text, remainTruncWidth - paddingH, font, style.ellipsis, { minChar: style.truncateMinChar });
                        token.width = token.contentWidth = getWidth(token.text, font);
                    }
                }
                else {
                    token.contentWidth = getWidth(token.text, font);
                }
            }
            token.width += paddingH;
            lineWidth += token.width;
            tokenStyle && (lineHeight = Math.max(lineHeight, token.lineHeight));
        }
        finishLine(line, lineWidth, lineHeight);
    }
    contentBlock.outerWidth = contentBlock.width = retrieve2(topWidth, calculatedWidth);
    contentBlock.outerHeight = contentBlock.height = retrieve2(topHeight, calculatedHeight);
    contentBlock.contentHeight = calculatedHeight;
    contentBlock.contentWidth = calculatedWidth;
    if (stlPadding) {
        contentBlock.outerWidth += stlPadding[1] + stlPadding[3];
        contentBlock.outerHeight += stlPadding[0] + stlPadding[2];
    }
    for (var i = 0; i < pendingList.length; i++) {
        var token = pendingList[i];
        var percentWidth = token.percentWidth;
        token.width = parseInt(percentWidth, 10) / 100 * contentBlock.width;
    }
    return contentBlock;
}
function pushTokens(block, str, style, wrapInfo, styleName) {
    var isEmptyStr = str === '';
    var tokenStyle = styleName && style.rich[styleName] || {};
    var lines = block.lines;
    var font = tokenStyle.font || style.font;
    var newLine = false;
    var strLines;
    var linesWidths;
    if (wrapInfo) {
        var tokenPadding = tokenStyle.padding;
        var tokenPaddingH = tokenPadding ? tokenPadding[1] + tokenPadding[3] : 0;
        if (tokenStyle.width != null && tokenStyle.width !== 'auto') {
            var outerWidth_1 = parsePercent$1(tokenStyle.width, wrapInfo.width) + tokenPaddingH;
            if (lines.length > 0) {
                if (outerWidth_1 + wrapInfo.accumWidth > wrapInfo.width) {
                    strLines = str.split('\n');
                    newLine = true;
                }
            }
            wrapInfo.accumWidth = outerWidth_1;
        }
        else {
            var res = wrapText(str, font, wrapInfo.width, wrapInfo.breakAll, wrapInfo.accumWidth);
            wrapInfo.accumWidth = res.accumWidth + tokenPaddingH;
            linesWidths = res.linesWidths;
            strLines = res.lines;
        }
    }
    else {
        strLines = str.split('\n');
    }
    for (var i = 0; i < strLines.length; i++) {
        var text = strLines[i];
        var token = new RichTextToken();
        token.styleName = styleName;
        token.text = text;
        token.isLineHolder = !text && !isEmptyStr;
        if (typeof tokenStyle.width === 'number') {
            token.width = tokenStyle.width;
        }
        else {
            token.width = linesWidths
                ? linesWidths[i]
                : getWidth(text, font);
        }
        if (!i && !newLine) {
            var tokens = (lines[lines.length - 1] || (lines[0] = new RichTextLine())).tokens;
            var tokensLen = tokens.length;
            (tokensLen === 1 && tokens[0].isLineHolder)
                ? (tokens[0] = token)
                : ((text || !tokensLen || isEmptyStr) && tokens.push(token));
        }
        else {
            lines.push(new RichTextLine([token]));
        }
    }
}
function isLatin(ch) {
    var code = ch.charCodeAt(0);
    return code >= 0x21 && code <= 0xFF;
}
var breakCharMap = reduce(',&?/;] '.split(''), function (obj, ch) {
    obj[ch] = true;
    return obj;
}, {});
function isWordBreakChar(ch) {
    if (isLatin(ch)) {
        if (breakCharMap[ch]) {
            return true;
        }
        return false;
    }
    return true;
}
function wrapText(text, font, lineWidth, isBreakAll, lastAccumWidth) {
    var lines = [];
    var linesWidths = [];
    var line = '';
    var currentWord = '';
    var currentWordWidth = 0;
    var accumWidth = 0;
    for (var i = 0; i < text.length; i++) {
        var ch = text.charAt(i);
        if (ch === '\n') {
            if (currentWord) {
                line += currentWord;
                accumWidth += currentWordWidth;
            }
            lines.push(line);
            linesWidths.push(accumWidth);
            line = '';
            currentWord = '';
            currentWordWidth = 0;
            accumWidth = 0;
            continue;
        }
        var chWidth = getWidth(ch, font);
        var inWord = isBreakAll ? false : !isWordBreakChar(ch);
        if (!lines.length
            ? lastAccumWidth + accumWidth + chWidth > lineWidth
            : accumWidth + chWidth > lineWidth) {
            if (!accumWidth) {
                if (inWord) {
                    lines.push(currentWord);
                    linesWidths.push(currentWordWidth);
                    currentWord = ch;
                    currentWordWidth = chWidth;
                }
                else {
                    lines.push(ch);
                    linesWidths.push(chWidth);
                }
            }
            else if (line || currentWord) {
                if (inWord) {
                    if (!line) {
                        line = currentWord;
                        currentWord = '';
                        currentWordWidth = 0;
                        accumWidth = currentWordWidth;
                    }
                    lines.push(line);
                    linesWidths.push(accumWidth - currentWordWidth);
                    currentWord += ch;
                    currentWordWidth += chWidth;
                    line = '';
                    accumWidth = currentWordWidth;
                }
                else {
                    if (currentWord) {
                        line += currentWord;
                        accumWidth += currentWordWidth;
                        currentWord = '';
                        currentWordWidth = 0;
                    }
                    lines.push(line);
                    linesWidths.push(accumWidth);
                    line = ch;
                    accumWidth = chWidth;
                }
            }
            continue;
        }
        accumWidth += chWidth;
        if (inWord) {
            currentWord += ch;
            currentWordWidth += chWidth;
        }
        else {
            if (currentWord) {
                line += currentWord;
                currentWord = '';
                currentWordWidth = 0;
            }
            line += ch;
        }
    }
    if (!lines.length && !line) {
        line = text;
        currentWord = '';
        currentWordWidth = 0;
    }
    if (currentWord) {
        line += currentWord;
    }
    if (line) {
        lines.push(line);
        linesWidths.push(accumWidth);
    }
    if (lines.length === 1) {
        accumWidth += lastAccumWidth;
    }
    return {
        accumWidth: accumWidth,
        lines: lines,
        linesWidths: linesWidths
    };
}
function parsePercent$1(value, maxValue) {
    if (typeof value === 'string') {
        if (value.lastIndexOf('%') >= 0) {
            return parseFloat(value) / 100 * maxValue;
        }
        return parseFloat(value);
    }
    return value;
}

function buildPath$2(ctx, shape) {
    var x = shape.x;
    var y = shape.y;
    var width = shape.width;
    var height = shape.height;
    var r = shape.r;
    var r1;
    var r2;
    var r3;
    var r4;
    if (width < 0) {
        x = x + width;
        width = -width;
    }
    if (height < 0) {
        y = y + height;
        height = -height;
    }
    if (typeof r === 'number') {
        r1 = r2 = r3 = r4 = r;
    }
    else if (r instanceof Array) {
        if (r.length === 1) {
            r1 = r2 = r3 = r4 = r[0];
        }
        else if (r.length === 2) {
            r1 = r3 = r[0];
            r2 = r4 = r[1];
        }
        else if (r.length === 3) {
            r1 = r[0];
            r2 = r4 = r[1];
            r3 = r[2];
        }
        else {
            r1 = r[0];
            r2 = r[1];
            r3 = r[2];
            r4 = r[3];
        }
    }
    else {
        r1 = r2 = r3 = r4 = 0;
    }
    var total;
    if (r1 + r2 > width) {
        total = r1 + r2;
        r1 *= width / total;
        r2 *= width / total;
    }
    if (r3 + r4 > width) {
        total = r3 + r4;
        r3 *= width / total;
        r4 *= width / total;
    }
    if (r2 + r3 > height) {
        total = r2 + r3;
        r2 *= height / total;
        r3 *= height / total;
    }
    if (r1 + r4 > height) {
        total = r1 + r4;
        r1 *= height / total;
        r4 *= height / total;
    }
    ctx.moveTo(x + r1, y);
    ctx.lineTo(x + width - r2, y);
    r2 !== 0 && ctx.arc(x + width - r2, y + r2, r2, -Math.PI / 2, 0);
    ctx.lineTo(x + width, y + height - r3);
    r3 !== 0 && ctx.arc(x + width - r3, y + height - r3, r3, 0, Math.PI / 2);
    ctx.lineTo(x + r4, y + height);
    r4 !== 0 && ctx.arc(x + r4, y + height - r4, r4, Math.PI / 2, Math.PI);
    ctx.lineTo(x, y + r1);
    r1 !== 0 && ctx.arc(x + r1, y + r1, r1, Math.PI, Math.PI * 1.5);
}

var round$1 = Math.round;
function subPixelOptimizeLine$1(outputShape, inputShape, style) {
    if (!inputShape) {
        return;
    }
    var x1 = inputShape.x1;
    var x2 = inputShape.x2;
    var y1 = inputShape.y1;
    var y2 = inputShape.y2;
    outputShape.x1 = x1;
    outputShape.x2 = x2;
    outputShape.y1 = y1;
    outputShape.y2 = y2;
    var lineWidth = style && style.lineWidth;
    if (!lineWidth) {
        return outputShape;
    }
    if (round$1(x1 * 2) === round$1(x2 * 2)) {
        outputShape.x1 = outputShape.x2 = subPixelOptimize$1(x1, lineWidth, true);
    }
    if (round$1(y1 * 2) === round$1(y2 * 2)) {
        outputShape.y1 = outputShape.y2 = subPixelOptimize$1(y1, lineWidth, true);
    }
    return outputShape;
}
function subPixelOptimizeRect$1(outputShape, inputShape, style) {
    if (!inputShape) {
        return;
    }
    var originX = inputShape.x;
    var originY = inputShape.y;
    var originWidth = inputShape.width;
    var originHeight = inputShape.height;
    outputShape.x = originX;
    outputShape.y = originY;
    outputShape.width = originWidth;
    outputShape.height = originHeight;
    var lineWidth = style && style.lineWidth;
    if (!lineWidth) {
        return outputShape;
    }
    outputShape.x = subPixelOptimize$1(originX, lineWidth, true);
    outputShape.y = subPixelOptimize$1(originY, lineWidth, true);
    outputShape.width = Math.max(subPixelOptimize$1(originX + originWidth, lineWidth, false) - outputShape.x, originWidth === 0 ? 0 : 1);
    outputShape.height = Math.max(subPixelOptimize$1(originY + originHeight, lineWidth, false) - outputShape.y, originHeight === 0 ? 0 : 1);
    return outputShape;
}
function subPixelOptimize$1(position, lineWidth, positiveOrNegative) {
    if (!lineWidth) {
        return position;
    }
    var doubledPosition = round$1(position * 2);
    return (doubledPosition + round$1(lineWidth)) % 2 === 0
        ? doubledPosition / 2
        : (doubledPosition + (positiveOrNegative ? 1 : -1)) / 2;
}

var RectShape = (function () {
    function RectShape() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
    }
    return RectShape;
}());
var subPixelOptimizeOutputShape$1 = {};
var Rect = (function (_super) {
    __extends(Rect, _super);
    function Rect(opts) {
        return _super.call(this, opts) || this;
    }
    Rect.prototype.getDefaultShape = function () {
        return new RectShape();
    };
    Rect.prototype.buildPath = function (ctx, shape) {
        var x;
        var y;
        var width;
        var height;
        if (this.subPixelOptimize) {
            var optimizedShape = subPixelOptimizeRect$1(subPixelOptimizeOutputShape$1, shape, this.style);
            x = optimizedShape.x;
            y = optimizedShape.y;
            width = optimizedShape.width;
            height = optimizedShape.height;
            optimizedShape.r = shape.r;
            shape = optimizedShape;
        }
        else {
            x = shape.x;
            y = shape.y;
            width = shape.width;
            height = shape.height;
        }
        if (!shape.r) {
            ctx.rect(x, y, width, height);
        }
        else {
            buildPath$2(ctx, shape);
        }
    };
    Rect.prototype.isZeroArea = function () {
        return !this.shape.width || !this.shape.height;
    };
    return Rect;
}(Path));
Rect.prototype.type = 'rect';

var DEFAULT_RICH_TEXT_COLOR = {
    fill: '#000'
};
var DEFAULT_STROKE_LINE_WIDTH = 2;
var DEFAULT_TEXT_ANIMATION_PROPS = {
    style: defaults({
        fill: true,
        stroke: true,
        fillOpacity: true,
        strokeOpacity: true,
        lineWidth: true,
        fontSize: true,
        lineHeight: true,
        width: true,
        height: true,
        textShadowColor: true,
        textShadowBlur: true,
        textShadowOffsetX: true,
        textShadowOffsetY: true,
        backgroundColor: true,
        padding: true,
        borderColor: true,
        borderWidth: true,
        borderRadius: true
    }, DEFAULT_COMMON_ANIMATION_PROPS.style)
};
var ZRText = (function (_super) {
    __extends(ZRText, _super);
    function ZRText(opts) {
        var _this = _super.call(this) || this;
        _this.type = 'text';
        _this._children = [];
        _this._defaultStyle = DEFAULT_RICH_TEXT_COLOR;
        _this.attr(opts);
        return _this;
    }
    ZRText.prototype.childrenRef = function () {
        return this._children;
    };
    ZRText.prototype.update = function () {
        if (this.styleChanged()) {
            this._updateSubTexts();
        }
        for (var i = 0; i < this._children.length; i++) {
            var child = this._children[i];
            child.zlevel = this.zlevel;
            child.z = this.z;
            child.z2 = this.z2;
            child.culling = this.culling;
            child.cursor = this.cursor;
            child.invisible = this.invisible;
        }
        var attachedTransform = this.attachedTransform;
        if (attachedTransform) {
            attachedTransform.updateTransform();
            var m = attachedTransform.transform;
            if (m) {
                this.transform = this.transform || [];
                copy(this.transform, m);
            }
            else {
                this.transform = null;
            }
        }
        else {
            _super.prototype.update.call(this);
        }
    };
    ZRText.prototype.getComputedTransform = function () {
        if (this.__hostTarget) {
            this.__hostTarget.getComputedTransform();
            this.__hostTarget.updateInnerText(true);
        }
        return this.attachedTransform ? this.attachedTransform.getComputedTransform()
            : _super.prototype.getComputedTransform.call(this);
    };
    ZRText.prototype._updateSubTexts = function () {
        this._childCursor = 0;
        normalizeTextStyle(this.style);
        this.style.rich
            ? this._updateRichTexts()
            : this._updatePlainTexts();
        this._children.length = this._childCursor;
        this.styleUpdated();
    };
    ZRText.prototype.addSelfToZr = function (zr) {
        _super.prototype.addSelfToZr.call(this, zr);
        for (var i = 0; i < this._children.length; i++) {
            this._children[i].__zr = zr;
        }
    };
    ZRText.prototype.removeSelfFromZr = function (zr) {
        _super.prototype.removeSelfFromZr.call(this, zr);
        for (var i = 0; i < this._children.length; i++) {
            this._children[i].__zr = null;
        }
    };
    ZRText.prototype.getBoundingRect = function () {
        if (this.styleChanged()) {
            this._updateSubTexts();
        }
        if (!this._rect) {
            var tmpRect = new BoundingRect(0, 0, 0, 0);
            var children = this._children;
            var tmpMat = [];
            var rect = null;
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                var childRect = child.getBoundingRect();
                var transform = child.getLocalTransform(tmpMat);
                if (transform) {
                    tmpRect.copy(childRect);
                    tmpRect.applyTransform(transform);
                    rect = rect || tmpRect.clone();
                    rect.union(tmpRect);
                }
                else {
                    rect = rect || childRect.clone();
                    rect.union(childRect);
                }
            }
            this._rect = rect || tmpRect;
        }
        return this._rect;
    };
    ZRText.prototype.setDefaultTextStyle = function (defaultTextStyle) {
        this._defaultStyle = defaultTextStyle || DEFAULT_RICH_TEXT_COLOR;
    };
    ZRText.prototype.setTextContent = function (textContent) {
        throw new Error('Can\'t attach text on another text');
    };
    ZRText.prototype._mergeStyle = function (targetStyle, sourceStyle) {
        if (!sourceStyle) {
            return targetStyle;
        }
        var sourceRich = sourceStyle.rich;
        var targetRich = targetStyle.rich || (sourceRich && {});
        extend(targetStyle, sourceStyle);
        if (sourceRich && targetRich) {
            this._mergeRich(targetRich, sourceRich);
            targetStyle.rich = targetRich;
        }
        else if (targetRich) {
            targetStyle.rich = targetRich;
        }
        return targetStyle;
    };
    ZRText.prototype._mergeRich = function (targetRich, sourceRich) {
        var richNames = keys(sourceRich);
        for (var i = 0; i < richNames.length; i++) {
            var richName = richNames[i];
            targetRich[richName] = targetRich[richName] || {};
            extend(targetRich[richName], sourceRich[richName]);
        }
    };
    ZRText.prototype.getAnimationStyleProps = function () {
        return DEFAULT_TEXT_ANIMATION_PROPS;
    };
    ZRText.prototype._getOrCreateChild = function (Ctor) {
        var child = this._children[this._childCursor];
        if (!child || !(child instanceof Ctor)) {
            child = new Ctor();
        }
        this._children[this._childCursor++] = child;
        child.__zr = this.__zr;
        child.parent = this;
        return child;
    };
    ZRText.prototype._updatePlainTexts = function () {
        var style = this.style;
        var textFont = style.font || DEFAULT_FONT;
        var textPadding = style.padding;
        var text = getStyleText(style);
        var contentBlock = parsePlainText(text, style);
        var needDrawBg = needDrawBackground(style);
        var bgColorDrawn = !!(style.backgroundColor);
        var outerHeight = contentBlock.outerHeight;
        var textLines = contentBlock.lines;
        var lineHeight = contentBlock.lineHeight;
        var defaultStyle = this._defaultStyle;
        var baseX = style.x || 0;
        var baseY = style.y || 0;
        var textAlign = style.align || defaultStyle.align || 'left';
        var verticalAlign = style.verticalAlign || defaultStyle.verticalAlign || 'top';
        var textX = baseX;
        var textY = adjustTextY(baseY, contentBlock.contentHeight, verticalAlign);
        if (needDrawBg || textPadding) {
            var outerWidth_1 = contentBlock.width;
            textPadding && (outerWidth_1 += textPadding[1] + textPadding[3]);
            var boxX = adjustTextX(baseX, outerWidth_1, textAlign);
            var boxY = adjustTextY(baseY, outerHeight, verticalAlign);
            needDrawBg && this._renderBackground(style, style, boxX, boxY, outerWidth_1, outerHeight);
        }
        textY += lineHeight / 2;
        if (textPadding) {
            textX = getTextXForPadding(baseX, textAlign, textPadding);
            if (verticalAlign === 'top') {
                textY += textPadding[0];
            }
            else if (verticalAlign === 'bottom') {
                textY -= textPadding[2];
            }
        }
        var defaultLineWidth = 0;
        var useDefaultFill = false;
        var textFill = getFill('fill' in style
            ? style.fill
            : (useDefaultFill = true, defaultStyle.fill));
        var textStroke = getStroke('stroke' in style
            ? style.stroke
            : (!bgColorDrawn
                && (!defaultStyle.autoStroke || useDefaultFill))
                ? (defaultLineWidth = DEFAULT_STROKE_LINE_WIDTH, defaultStyle.stroke)
                : null);
        var hasShadow = style.textShadowBlur > 0;
        var fixedBoundingRect = style.width != null
            && (style.overflow === 'truncate' || style.overflow === 'break' || style.overflow === 'breakAll');
        var calculatedLineHeight = contentBlock.calculatedLineHeight;
        for (var i = 0; i < textLines.length; i++) {
            var el = this._getOrCreateChild(TSpan);
            var subElStyle = el.createStyle();
            el.useStyle(subElStyle);
            subElStyle.text = textLines[i];
            subElStyle.x = textX;
            subElStyle.y = textY;
            if (textAlign) {
                subElStyle.textAlign = textAlign;
            }
            subElStyle.textBaseline = 'middle';
            subElStyle.opacity = style.opacity;
            subElStyle.strokeFirst = true;
            if (hasShadow) {
                subElStyle.shadowBlur = style.textShadowBlur || 0;
                subElStyle.shadowColor = style.textShadowColor || 'transparent';
                subElStyle.shadowOffsetX = style.textShadowOffsetX || 0;
                subElStyle.shadowOffsetY = style.textShadowOffsetY || 0;
            }
            if (textStroke) {
                subElStyle.stroke = textStroke;
                subElStyle.lineWidth = style.lineWidth || defaultLineWidth;
                subElStyle.lineDash = style.lineDash;
                subElStyle.lineDashOffset = style.lineDashOffset || 0;
            }
            if (textFill) {
                subElStyle.fill = textFill;
            }
            subElStyle.font = textFont;
            textY += lineHeight;
            if (fixedBoundingRect) {
                el.setBoundingRect(new BoundingRect(adjustTextX(subElStyle.x, style.width, subElStyle.textAlign), adjustTextY(subElStyle.y, calculatedLineHeight, subElStyle.textBaseline), style.width, calculatedLineHeight));
            }
        }
    };
    ZRText.prototype._updateRichTexts = function () {
        var style = this.style;
        var text = getStyleText(style);
        var contentBlock = parseRichText(text, style);
        var contentWidth = contentBlock.width;
        var outerWidth = contentBlock.outerWidth;
        var outerHeight = contentBlock.outerHeight;
        var textPadding = style.padding;
        var baseX = style.x || 0;
        var baseY = style.y || 0;
        var defaultStyle = this._defaultStyle;
        var textAlign = style.align || defaultStyle.align;
        var verticalAlign = style.verticalAlign || defaultStyle.verticalAlign;
        var boxX = adjustTextX(baseX, outerWidth, textAlign);
        var boxY = adjustTextY(baseY, outerHeight, verticalAlign);
        var xLeft = boxX;
        var lineTop = boxY;
        if (textPadding) {
            xLeft += textPadding[3];
            lineTop += textPadding[0];
        }
        var xRight = xLeft + contentWidth;
        if (needDrawBackground(style)) {
            this._renderBackground(style, style, boxX, boxY, outerWidth, outerHeight);
        }
        var bgColorDrawn = !!(style.backgroundColor);
        for (var i = 0; i < contentBlock.lines.length; i++) {
            var line = contentBlock.lines[i];
            var tokens = line.tokens;
            var tokenCount = tokens.length;
            var lineHeight = line.lineHeight;
            var remainedWidth = line.width;
            var leftIndex = 0;
            var lineXLeft = xLeft;
            var lineXRight = xRight;
            var rightIndex = tokenCount - 1;
            var token = void 0;
            while (leftIndex < tokenCount
                && (token = tokens[leftIndex], !token.align || token.align === 'left')) {
                this._placeToken(token, style, lineHeight, lineTop, lineXLeft, 'left', bgColorDrawn);
                remainedWidth -= token.width;
                lineXLeft += token.width;
                leftIndex++;
            }
            while (rightIndex >= 0
                && (token = tokens[rightIndex], token.align === 'right')) {
                this._placeToken(token, style, lineHeight, lineTop, lineXRight, 'right', bgColorDrawn);
                remainedWidth -= token.width;
                lineXRight -= token.width;
                rightIndex--;
            }
            lineXLeft += (contentWidth - (lineXLeft - xLeft) - (xRight - lineXRight) - remainedWidth) / 2;
            while (leftIndex <= rightIndex) {
                token = tokens[leftIndex];
                this._placeToken(token, style, lineHeight, lineTop, lineXLeft + token.width / 2, 'center', bgColorDrawn);
                lineXLeft += token.width;
                leftIndex++;
            }
            lineTop += lineHeight;
        }
    };
    ZRText.prototype._placeToken = function (token, style, lineHeight, lineTop, x, textAlign, parentBgColorDrawn) {
        var tokenStyle = style.rich[token.styleName] || {};
        tokenStyle.text = token.text;
        var verticalAlign = token.verticalAlign;
        var y = lineTop + lineHeight / 2;
        if (verticalAlign === 'top') {
            y = lineTop + token.height / 2;
        }
        else if (verticalAlign === 'bottom') {
            y = lineTop + lineHeight - token.height / 2;
        }
        var needDrawBg = !token.isLineHolder && needDrawBackground(tokenStyle);
        needDrawBg && this._renderBackground(tokenStyle, style, textAlign === 'right'
            ? x - token.width
            : textAlign === 'center'
                ? x - token.width / 2
                : x, y - token.height / 2, token.width, token.height);
        var bgColorDrawn = !!tokenStyle.backgroundColor;
        var textPadding = token.textPadding;
        if (textPadding) {
            x = getTextXForPadding(x, textAlign, textPadding);
            y -= token.height / 2 - textPadding[0] - token.innerHeight / 2;
        }
        var el = this._getOrCreateChild(TSpan);
        var subElStyle = el.createStyle();
        el.useStyle(subElStyle);
        var defaultStyle = this._defaultStyle;
        var useDefaultFill = false;
        var defaultLineWidth = 0;
        var textFill = getStroke('fill' in tokenStyle ? tokenStyle.fill
            : 'fill' in style ? style.fill
                : (useDefaultFill = true, defaultStyle.fill));
        var textStroke = getStroke('stroke' in tokenStyle ? tokenStyle.stroke
            : 'stroke' in style ? style.stroke
                : (!bgColorDrawn
                    && !parentBgColorDrawn
                    && (!defaultStyle.autoStroke || useDefaultFill)) ? (defaultLineWidth = DEFAULT_STROKE_LINE_WIDTH, defaultStyle.stroke)
                    : null);
        var hasShadow = tokenStyle.textShadowBlur > 0
            || style.textShadowBlur > 0;
        subElStyle.text = token.text;
        subElStyle.x = x;
        subElStyle.y = y;
        if (hasShadow) {
            subElStyle.shadowBlur = tokenStyle.textShadowBlur || style.textShadowBlur || 0;
            subElStyle.shadowColor = tokenStyle.textShadowColor || style.textShadowColor || 'transparent';
            subElStyle.shadowOffsetX = tokenStyle.textShadowOffsetX || style.textShadowOffsetX || 0;
            subElStyle.shadowOffsetY = tokenStyle.textShadowOffsetY || style.textShadowOffsetY || 0;
        }
        subElStyle.textAlign = textAlign;
        subElStyle.textBaseline = 'middle';
        subElStyle.font = token.font || DEFAULT_FONT;
        subElStyle.opacity = retrieve3(tokenStyle.opacity, style.opacity, 1);
        if (textStroke) {
            subElStyle.lineWidth = retrieve3(tokenStyle.lineWidth, style.lineWidth, defaultLineWidth);
            subElStyle.lineDash = retrieve2(tokenStyle.lineDash, style.lineDash);
            subElStyle.lineDashOffset = style.lineDashOffset || 0;
            subElStyle.stroke = textStroke;
        }
        if (textFill) {
            subElStyle.fill = textFill;
        }
        var textWidth = token.contentWidth;
        var textHeight = token.contentHeight;
        el.setBoundingRect(new BoundingRect(adjustTextX(subElStyle.x, textWidth, subElStyle.textAlign), adjustTextY(subElStyle.y, textHeight, subElStyle.textBaseline), textWidth, textHeight));
    };
    ZRText.prototype._renderBackground = function (style, topStyle, x, y, width, height) {
        var textBackgroundColor = style.backgroundColor;
        var textBorderWidth = style.borderWidth;
        var textBorderColor = style.borderColor;
        var isPlainBg = isString(textBackgroundColor);
        var textBorderRadius = style.borderRadius;
        var self = this;
        var rectEl;
        var imgEl;
        if (isPlainBg || (textBorderWidth && textBorderColor)) {
            rectEl = this._getOrCreateChild(Rect);
            rectEl.useStyle(rectEl.createStyle());
            rectEl.style.fill = null;
            var rectShape = rectEl.shape;
            rectShape.x = x;
            rectShape.y = y;
            rectShape.width = width;
            rectShape.height = height;
            rectShape.r = textBorderRadius;
            rectEl.dirtyShape();
        }
        if (isPlainBg) {
            var rectStyle = rectEl.style;
            rectStyle.fill = textBackgroundColor || null;
            rectStyle.fillOpacity = retrieve2(style.fillOpacity, 1);
        }
        else if (textBackgroundColor && textBackgroundColor.image) {
            imgEl = this._getOrCreateChild(ZRImage);
            imgEl.onload = function () {
                self.dirtyStyle();
            };
            var imgStyle = imgEl.style;
            imgStyle.image = textBackgroundColor.image;
            imgStyle.x = x;
            imgStyle.y = y;
            imgStyle.width = width;
            imgStyle.height = height;
        }
        if (textBorderWidth && textBorderColor) {
            var rectStyle = rectEl.style;
            rectStyle.lineWidth = textBorderWidth;
            rectStyle.stroke = textBorderColor;
            rectStyle.strokeOpacity = retrieve2(style.strokeOpacity, 1);
            rectStyle.lineDash = style.borderDash;
            rectStyle.lineDashOffset = style.borderDashOffset || 0;
            rectEl.strokeContainThreshold = 0;
            if (rectEl.hasFill() && rectEl.hasStroke()) {
                rectStyle.strokeFirst = true;
                rectStyle.lineWidth *= 2;
            }
        }
        var commonStyle = (rectEl || imgEl).style;
        commonStyle.shadowBlur = style.shadowBlur || 0;
        commonStyle.shadowColor = style.shadowColor || 'transparent';
        commonStyle.shadowOffsetX = style.shadowOffsetX || 0;
        commonStyle.shadowOffsetY = style.shadowOffsetY || 0;
        commonStyle.opacity = retrieve3(style.opacity, topStyle.opacity, 1);
    };
    ZRText.makeFont = function (style) {
        var font = '';
        if (style.fontSize || style.fontFamily || style.fontWeight) {
            var fontSize = '';
            if (typeof style.fontSize === 'string'
                && (style.fontSize.indexOf('px') !== -1
                    || style.fontSize.indexOf('rem') !== -1
                    || style.fontSize.indexOf('em') !== -1)) {
                fontSize = style.fontSize;
            }
            else if (!isNaN(+style.fontSize)) {
                fontSize = style.fontSize + 'px';
            }
            else {
                fontSize = '12px';
            }
            font = [
                style.fontStyle,
                style.fontWeight,
                fontSize,
                style.fontFamily || 'sans-serif'
            ].join(' ');
        }
        return font && trim(font) || style.textFont || style.font;
    };
    return ZRText;
}(Displayable));
var VALID_TEXT_ALIGN = { left: true, right: 1, center: 1 };
var VALID_TEXT_VERTICAL_ALIGN = { top: 1, bottom: 1, middle: 1 };
function normalizeTextStyle(style) {
    normalizeStyle(style);
    each$1(style.rich, normalizeStyle);
    return style;
}
function normalizeStyle(style) {
    if (style) {
        style.font = ZRText.makeFont(style);
        var textAlign = style.align;
        textAlign === 'middle' && (textAlign = 'center');
        style.align = (textAlign == null || VALID_TEXT_ALIGN[textAlign]) ? textAlign : 'left';
        var verticalAlign = style.verticalAlign;
        verticalAlign === 'center' && (verticalAlign = 'middle');
        style.verticalAlign = (verticalAlign == null || VALID_TEXT_VERTICAL_ALIGN[verticalAlign]) ? verticalAlign : 'top';
        var textPadding = style.padding;
        if (textPadding) {
            style.padding = normalizeCssArray$1(style.padding);
        }
    }
}
function getStroke(stroke, lineWidth) {
    return (stroke == null || lineWidth <= 0 || stroke === 'transparent' || stroke === 'none')
        ? null
        : (stroke.image || stroke.colorStops)
            ? '#000'
            : stroke;
}
function getFill(fill) {
    return (fill == null || fill === 'none')
        ? null
        : (fill.image || fill.colorStops)
            ? '#000'
            : fill;
}
function getTextXForPadding(x, textAlign, textPadding) {
    return textAlign === 'right'
        ? (x - textPadding[1])
        : textAlign === 'center'
            ? (x + textPadding[3] / 2 - textPadding[1] / 2)
            : (x + textPadding[3]);
}
function getStyleText(style) {
    var text = style.text;
    text != null && (text += '');
    return text;
}
function needDrawBackground(style) {
    return !!(style.backgroundColor
        || (style.borderWidth && style.borderColor));
}

var RADIAN_EPSILON = 1e-4;

function _trim(str) {
  return str.replace(/^\s+|\s+$/g, '');
}
/**
 * Linear mapping a value from domain to range
 * @param  val
 * @param  domain Domain extent domain[0] can be bigger than domain[1]
 * @param  range  Range extent range[0] can be bigger than range[1]
 * @param  clamp Default to be false
 */


function linearMap(val, domain, range, clamp) {
  var subDomain = domain[1] - domain[0];
  var subRange = range[1] - range[0];

  if (subDomain === 0) {
    return subRange === 0 ? range[0] : (range[0] + range[1]) / 2;
  } // Avoid accuracy problem in edge, such as
  // 146.39 - 62.83 === 83.55999999999999.
  // See echarts/test/ut/spec/util/number.js#linearMap#accuracyError
  // It is a little verbose for efficiency considering this method
  // is a hotspot.


  if (clamp) {
    if (subDomain > 0) {
      if (val <= domain[0]) {
        return range[0];
      } else if (val >= domain[1]) {
        return range[1];
      }
    } else {
      if (val >= domain[0]) {
        return range[0];
      } else if (val <= domain[1]) {
        return range[1];
      }
    }
  } else {
    if (val === domain[0]) {
      return range[0];
    }

    if (val === domain[1]) {
      return range[1];
    }
  }

  return (val - domain[0]) / subDomain * subRange + range[0];
}
/**
 * Convert a percent string to absolute number.
 * Returns NaN if percent is not a valid string or number
 */

function parsePercent(percent, all) {
  switch (percent) {
    case 'center':
    case 'middle':
      percent = '50%';
      break;

    case 'left':
    case 'top':
      percent = '0%';
      break;

    case 'right':
    case 'bottom':
      percent = '100%';
      break;
  }

  if (typeof percent === 'string') {
    if (_trim(percent).match(/%$/)) {
      return parseFloat(percent) / 100 * all;
    }

    return parseFloat(percent);
  }

  return percent == null ? NaN : +percent;
}
function round(x, precision, returnStr) {
  if (precision == null) {
    precision = 10;
  } // Avoid range error


  precision = Math.min(Math.max(0, precision), 20);
  x = (+x).toFixed(precision);
  return returnStr ? x : +x;
}
/**
 * Inplacd asc sort arr.
 * The input arr will be modified.
 */

function asc(arr) {
  arr.sort(function (a, b) {
    return a - b;
  });
  return arr;
}
/**
 * Get precision
 */

function getPrecision(val) {
  val = +val;

  if (isNaN(val)) {
    return 0;
  } // It is much faster than methods converting number to string as follows
  //      let tmp = val.toString();
  //      return tmp.length - 1 - tmp.indexOf('.');
  // especially when precision is low


  var e = 1;
  var count = 0;

  while (Math.round(val * e) / e !== val) {
    e *= 10;
    count++;
  }

  return count;
}
/**
 * Get precision with slow but safe method
 */

function getPrecisionSafe(val) {
  var str = val.toString(); // Consider scientific notation: '3.4e-12' '3.4e+12'

  var eIndex = str.indexOf('e');

  if (eIndex > 0) {
    var precision = +str.slice(eIndex + 1);
    return precision < 0 ? -precision : 0;
  } else {
    var dotIndex = str.indexOf('.');
    return dotIndex < 0 ? 0 : str.length - 1 - dotIndex;
  }
}
/**
 * Minimal dicernible data precisioin according to a single pixel.
 */

function getPixelPrecision(dataExtent, pixelExtent) {
  var log = Math.log;
  var LN10 = Math.LN10;
  var dataQuantity = Math.floor(log(dataExtent[1] - dataExtent[0]) / LN10);
  var sizeQuantity = Math.round(log(Math.abs(pixelExtent[1] - pixelExtent[0])) / LN10); // toFixed() digits argument must be between 0 and 20.

  var precision = Math.min(Math.max(-dataQuantity + sizeQuantity, 0), 20);
  return !isFinite(precision) ? 20 : precision;
}
/**
 * Get a data of given precision, assuring the sum of percentages
 * in valueList is 1.
 * The largest remainer method is used.
 * https://en.wikipedia.org/wiki/Largest_remainder_method
 *
 * @param valueList a list of all data
 * @param idx index of the data to be processed in valueList
 * @param precision integer number showing digits of precision
 * @return percent ranging from 0 to 100
 */

function getPercentWithPrecision(valueList, idx, precision) {
  if (!valueList[idx]) {
    return 0;
  }

  var sum = reduce(valueList, function (acc, val) {
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  if (sum === 0) {
    return 0;
  }

  var digits = Math.pow(10, precision);
  var votesPerQuota = map(valueList, function (val) {
    return (isNaN(val) ? 0 : val) / sum * digits * 100;
  });
  var targetSeats = digits * 100;
  var seats = map(votesPerQuota, function (votes) {
    // Assign automatic seats.
    return Math.floor(votes);
  });
  var currentSum = reduce(seats, function (acc, val) {
    return acc + val;
  }, 0);
  var remainder = map(votesPerQuota, function (votes, idx) {
    return votes - seats[idx];
  }); // Has remainding votes.

  while (currentSum < targetSeats) {
    // Find next largest remainder.
    var max = Number.NEGATIVE_INFINITY;
    var maxId = null;

    for (var i = 0, len = remainder.length; i < len; ++i) {
      if (remainder[i] > max) {
        max = remainder[i];
        maxId = i;
      }
    } // Add a vote to max remainder.


    ++seats[maxId];
    remainder[maxId] = 0;
    ++currentSum;
  }

  return seats[idx] / digits;
} // Number.MAX_SAFE_INTEGER, ie do not support.

var MAX_SAFE_INTEGER = 9007199254740991;
/**
 * To 0 - 2 * PI, considering negative radian.
 */

function remRadian(radian) {
  var pi2 = Math.PI * 2;
  return (radian % pi2 + pi2) % pi2;
}
/**
 * @param {type} radian
 * @return {boolean}
 */

function isRadianAroundZero(val) {
  return val > -RADIAN_EPSILON && val < RADIAN_EPSILON;
} // eslint-disable-next-line

var TIME_REG = /^(?:(\d{4})(?:[-\/](\d{1,2})(?:[-\/](\d{1,2})(?:[T ](\d{1,2})(?::(\d{1,2})(?::(\d{1,2})(?:[.,](\d+))?)?)?(Z|[\+\-]\d\d:?\d\d)?)?)?)?)?$/; // jshint ignore:line

/**
 * @param value valid type: number | string | Date, otherwise return `new Date(NaN)`
 *   These values can be accepted:
 *   + An instance of Date, represent a time in its own time zone.
 *   + Or string in a subset of ISO 8601, only including:
 *     + only year, month, date: '2012-03', '2012-03-01', '2012-03-01 05', '2012-03-01 05:06',
 *     + separated with T or space: '2012-03-01T12:22:33.123', '2012-03-01 12:22:33.123',
 *     + time zone: '2012-03-01T12:22:33Z', '2012-03-01T12:22:33+8000', '2012-03-01T12:22:33-05:00',
 *     all of which will be treated as local time if time zone is not specified
 *     (see <https://momentjs.com/>).
 *   + Or other string format, including (all of which will be treated as loacal time):
 *     '2012', '2012-3-1', '2012/3/1', '2012/03/01',
 *     '2009/6/12 2:00', '2009/6/12 2:05:08', '2009/6/12 2:05:08.123'
 *   + a timestamp, which represent a time in UTC.
 * @return date Never be null/undefined. If invalid, return `new Date(NaN)`.
 */

function parseDate(value) {
  if (value instanceof Date) {
    return value;
  } else if (typeof value === 'string') {
    // Different browsers parse date in different way, so we parse it manually.
    // Some other issues:
    // new Date('1970-01-01') is UTC,
    // new Date('1970/01/01') and new Date('1970-1-01') is local.
    // See issue #3623
    var match = TIME_REG.exec(value);

    if (!match) {
      // return Invalid Date.
      return new Date(NaN);
    } // Use local time when no timezone offset specifed.


    if (!match[8]) {
      // match[n] can only be string or undefined.
      // But take care of '12' + 1 => '121'.
      return new Date(+match[1], +(match[2] || 1) - 1, +match[3] || 1, +match[4] || 0, +(match[5] || 0), +match[6] || 0, +match[7] || 0);
    } // Timezoneoffset of Javascript Date has considered DST (Daylight Saving Time,
    // https://tc39.github.io/ecma262/#sec-daylight-saving-time-adjustment).
    // For example, system timezone is set as "Time Zone: America/Toronto",
    // then these code will get different result:
    // `new Date(1478411999999).getTimezoneOffset();  // get 240`
    // `new Date(1478412000000).getTimezoneOffset();  // get 300`
    // So we should not use `new Date`, but use `Date.UTC`.
    else {
        var hour = +match[4] || 0;

        if (match[8].toUpperCase() !== 'Z') {
          hour -= +match[8].slice(0, 3);
        }

        return new Date(Date.UTC(+match[1], +(match[2] || 1) - 1, +match[3] || 1, hour, +(match[5] || 0), +match[6] || 0, +match[7] || 0));
      }
  } else if (value == null) {
    return new Date(NaN);
  }

  return new Date(Math.round(value));
}
/**
 * Quantity of a number. e.g. 0.1, 1, 10, 100
 *
 * @param val
 * @return
 */

function quantity(val) {
  return Math.pow(10, quantityExponent(val));
}
/**
 * Exponent of the quantity of a number
 * e.g., 1234 equals to 1.234*10^3, so quantityExponent(1234) is 3
 *
 * @param val non-negative value
 * @return
 */

function quantityExponent(val) {
  if (val === 0) {
    return 0;
  }

  var exp = Math.floor(Math.log(val) / Math.LN10);
  /**
   * exp is expected to be the rounded-down result of the base-10 log of val.
   * But due to the precision loss with Math.log(val), we need to restore it
   * using 10^exp to make sure we can get val back from exp. #11249
   */

  if (val / Math.pow(10, exp) >= 10) {
    exp++;
  }

  return exp;
}
/**
 * find a “nice” number approximately equal to x. Round the number if round = true,
 * take ceiling if round = false. The primary observation is that the “nicest”
 * numbers in decimal are 1, 2, and 5, and all power-of-ten multiples of these numbers.
 *
 * See "Nice Numbers for Graph Labels" of Graphic Gems.
 *
 * @param  val Non-negative value.
 * @param  round
 * @return Niced number
 */

function nice(val, round) {
  var exponent = quantityExponent(val);
  var exp10 = Math.pow(10, exponent);
  var f = val / exp10; // 1 <= f < 10

  var nf;

  if (round) {
    if (f < 1.5) {
      nf = 1;
    } else if (f < 2.5) {
      nf = 2;
    } else if (f < 4) {
      nf = 3;
    } else if (f < 7) {
      nf = 5;
    } else {
      nf = 10;
    }
  } else {
    if (f < 1) {
      nf = 1;
    } else if (f < 2) {
      nf = 2;
    } else if (f < 3) {
      nf = 3;
    } else if (f < 5) {
      nf = 5;
    } else {
      nf = 10;
    }
  }

  val = nf * exp10; // Fix 3 * 0.1 === 0.30000000000000004 issue (see IEEE 754).
  // 20 is the uppper bound of toFixed.

  return exponent >= -20 ? +val.toFixed(exponent < 0 ? -exponent : 0) : val;
}
/**
 * This code was copied from "d3.js"
 * <https://github.com/d3/d3/blob/9cc9a875e636a1dcf36cc1e07bdf77e1ad6e2c74/src/arrays/quantile.js>.
 * See the license statement at the head of this file.
 * @param ascArr
 */

function quantile(ascArr, p) {
  var H = (ascArr.length - 1) * p + 1;
  var h = Math.floor(H);
  var v = +ascArr[h - 1];
  var e = H - h;
  return e ? v + e * (ascArr[h] - v) : v;
}
/**
 * Order intervals asc, and split them when overlap.
 * expect(numberUtil.reformIntervals([
 *     {interval: [18, 62], close: [1, 1]},
 *     {interval: [-Infinity, -70], close: [0, 0]},
 *     {interval: [-70, -26], close: [1, 1]},
 *     {interval: [-26, 18], close: [1, 1]},
 *     {interval: [62, 150], close: [1, 1]},
 *     {interval: [106, 150], close: [1, 1]},
 *     {interval: [150, Infinity], close: [0, 0]}
 * ])).toEqual([
 *     {interval: [-Infinity, -70], close: [0, 0]},
 *     {interval: [-70, -26], close: [1, 1]},
 *     {interval: [-26, 18], close: [0, 1]},
 *     {interval: [18, 62], close: [0, 1]},
 *     {interval: [62, 150], close: [0, 1]},
 *     {interval: [150, Infinity], close: [0, 0]}
 * ]);
 * @param list, where `close` mean open or close
 *        of the interval, and Infinity can be used.
 * @return The origin list, which has been reformed.
 */

function reformIntervals(list) {
  list.sort(function (a, b) {
    return littleThan(a, b, 0) ? -1 : 1;
  });
  var curr = -Infinity;
  var currClose = 1;

  for (var i = 0; i < list.length;) {
    var interval = list[i].interval;
    var close_1 = list[i].close;

    for (var lg = 0; lg < 2; lg++) {
      if (interval[lg] <= curr) {
        interval[lg] = curr;
        close_1[lg] = !lg ? 1 - currClose : 1;
      }

      curr = interval[lg];
      currClose = close_1[lg];
    }

    if (interval[0] === interval[1] && close_1[0] * close_1[1] !== 1) {
      list.splice(i, 1);
    } else {
      i++;
    }
  }

  return list;

  function littleThan(a, b, lg) {
    return a.interval[lg] < b.interval[lg] || a.interval[lg] === b.interval[lg] && (a.close[lg] - b.close[lg] === (!lg ? 1 : -1) || !lg && littleThan(a, b, 1));
  }
}
/**
 * [Numberic is defined as]:
 *     `parseFloat(val) == val`
 * For example:
 * numeric:
 *     typeof number except NaN, '-123', '123', '2e3', '-2e3', '011', 'Infinity', Infinity,
 *     and they rounded by white-spaces or line-terminal like ' -123 \n ' (see es spec)
 * not-numeric:
 *     null, undefined, [], {}, true, false, 'NaN', NaN, '123ab',
 *     empty string, string with only white-spaces or line-terminal (see es spec),
 *     0x12, '0x12', '-0x12', 012, '012', '-012',
 *     non-string, ...
 *
 * @test See full test cases in `test/ut/spec/util/number.js`.
 * @return Must be a typeof number. If not numeric, return NaN.
 */

function numericToNumber(val) {
  var valFloat = parseFloat(val);
  return valFloat == val // eslint-disable-line eqeqeq
  && (valFloat !== 0 || typeof val !== 'string' || val.indexOf('x') <= 0) // For case ' 0x0 '.
  ? valFloat : NaN;
}
/**
 * Definition of "numeric": see `numericToNumber`.
 */

function isNumeric(val) {
  return !isNaN(numericToNumber(val));
}
/**
 * Use random base to prevent users hard code depending on
 * this auto generated marker id.
 * @return An positive integer.
 */

function getRandomIdBase() {
  return Math.round(Math.random() * 9);
}
/**
 * Get the greatest common dividor
 *
 * @param {number} a one number
 * @param {number} b the other number
 */

function getGreatestCommonDividor(a, b) {
  if (b === 0) {
    return a;
  }

  return getGreatestCommonDividor(b, a % b);
}
/**
 * Get the least common multiple
 *
 * @param {number} a one number
 * @param {number} b the other number
 */

function getLeastCommonMultiple(a, b) {
  if (a == null) {
    return b;
  }

  if (b == null) {
    return a;
  }

  return a * b / getGreatestCommonDividor(a, b);
}

/**
 * @throws Error
 */

function throwError(msg) {
  throw new Error(msg);
}

/**
 * Make the name displayable. But we should
 * make sure it is not duplicated with user
 * specified name, so use '\0';
 */

var DUMMY_COMPONENT_NAME_PREFIX = 'series\0';
var INTERNAL_COMPONENT_ID_PREFIX = '\0_ec_\0';
/**
 * If value is not array, then translate it to array.
 * @param  {*} value
 * @return {Array} [value] or value
 */

function normalizeToArray(value) {
  return value instanceof Array ? value : value == null ? [] : [value];
}
/**
 * Sync default option between normal and emphasis like `position` and `show`
 * In case some one will write code like
 *     label: {
 *          show: false,
 *          position: 'outside',
 *          fontSize: 18
 *     },
 *     emphasis: {
 *          label: { show: true }
 *     }
 */

function defaultEmphasis(opt, key, subOpts) {
  // Caution: performance sensitive.
  if (opt) {
    opt[key] = opt[key] || {};
    opt.emphasis = opt.emphasis || {};
    opt.emphasis[key] = opt.emphasis[key] || {}; // Default emphasis option from normal

    for (var i = 0, len = subOpts.length; i < len; i++) {
      var subOptName = subOpts[i];

      if (!opt.emphasis[key].hasOwnProperty(subOptName) && opt[key].hasOwnProperty(subOptName)) {
        opt.emphasis[key][subOptName] = opt[key][subOptName];
      }
    }
  }
}
var TEXT_STYLE_OPTIONS = ['fontStyle', 'fontWeight', 'fontSize', 'fontFamily', 'rich', 'tag', 'color', 'textBorderColor', 'textBorderWidth', 'width', 'height', 'lineHeight', 'align', 'verticalAlign', 'baseline', 'shadowColor', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY', 'textShadowColor', 'textShadowBlur', 'textShadowOffsetX', 'textShadowOffsetY', 'backgroundColor', 'borderColor', 'borderWidth', 'borderRadius', 'padding']; // modelUtil.LABEL_OPTIONS = modelUtil.TEXT_STYLE_OPTIONS.concat([
//     'position', 'offset', 'rotate', 'origin', 'show', 'distance', 'formatter',
//     'fontStyle', 'fontWeight', 'fontSize', 'fontFamily',
//     // FIXME: deprecated, check and remove it.
//     'textStyle'
// ]);

/**
 * The method do not ensure performance.
 * data could be [12, 2323, {value: 223}, [1221, 23], {value: [2, 23]}]
 * This helper method retieves value from data.
 */

function getDataItemValue(dataItem) {
  return isObject(dataItem) && !isArray(dataItem) && !(dataItem instanceof Date) ? dataItem.value : dataItem;
}
/**
 * data could be [12, 2323, {value: 223}, [1221, 23], {value: [2, 23]}]
 * This helper method determine if dataItem has extra option besides value
 */

function isDataItemOption(dataItem) {
  return isObject(dataItem) && !(dataItem instanceof Array); // // markLine data can be array
  // && !(dataItem[0] && isObject(dataItem[0]) && !(dataItem[0] instanceof Array));
}
/**
 * Mapping to existings for merge.
 *
 * Mode "normalMege":
 *     The mapping result (merge result) will keep the order of the existing
 *     component, rather than the order of new option. Because we should ensure
 *     some specified index reference (like xAxisIndex) keep work.
 *     And in most cases, "merge option" is used to update partial option but not
 *     be expected to change the order.
 *
 * Mode "replaceMege":
 *     (1) Only the id mapped components will be merged.
 *     (2) Other existing components (except internal compoonets) will be removed.
 *     (3) Other new options will be used to create new component.
 *     (4) The index of the existing compoents will not be modified.
 *     That means their might be "hole" after the removal.
 *     The new components are created first at those available index.
 *
 * Mode "replaceAll":
 *     This mode try to support that reproduce an echarts instance from another
 *     echarts instance (via `getOption`) in some simple cases.
 *     In this senario, the `result` index are exactly the consistent with the `newCmptOptions`,
 *     which ensures the compoennt index referring (like `xAxisIndex: ?`) corrent. That is,
 *     the "hole" in `newCmptOptions` will also be kept.
 *     On the contrary, other modes try best to eliminate holes.
 *     PENDING: This is an experimental mode yet.
 *
 * @return See the comment of <MappingResult>.
 */

function mappingToExists(existings, newCmptOptions, mode) {
  var isNormalMergeMode = mode === 'normalMerge';
  var isReplaceMergeMode = mode === 'replaceMerge';
  var isReplaceAllMode = mode === 'replaceAll';
  existings = existings || [];
  newCmptOptions = (newCmptOptions || []).slice();
  var existingIdIdxMap = createHashMap(); // Validate id and name on user input option.

  each$1(newCmptOptions, function (cmptOption, index) {
    if (!isObject(cmptOption)) {
      newCmptOptions[index] = null;
      return;
    }
  });
  var result = prepareResult(existings, existingIdIdxMap, mode);

  if (isNormalMergeMode || isReplaceMergeMode) {
    mappingById(result, existings, existingIdIdxMap, newCmptOptions);
  }

  if (isNormalMergeMode) {
    mappingByName(result, newCmptOptions);
  }

  if (isNormalMergeMode || isReplaceMergeMode) {
    mappingByIndex(result, newCmptOptions, isReplaceMergeMode);
  } else if (isReplaceAllMode) {
    mappingInReplaceAllMode(result, newCmptOptions);
  }

  makeIdAndName(result); // The array `result` MUST NOT contain elided items, otherwise the
  // forEach will ommit those items and result in incorrect result.

  return result;
}

function prepareResult(existings, existingIdIdxMap, mode) {
  var result = [];

  if (mode === 'replaceAll') {
    return result;
  } // Do not use native `map` to in case that the array `existings`
  // contains elided items, which will be ommited.


  for (var index = 0; index < existings.length; index++) {
    var existing = existings[index]; // Because of replaceMerge, `existing` may be null/undefined.

    if (existing && existing.id != null) {
      existingIdIdxMap.set(existing.id, index);
    } // For non-internal-componnets:
    //     Mode "normalMerge": all existings kept.
    //     Mode "replaceMerge": all existing removed unless mapped by id.
    // For internal-components:
    //     go with "replaceMerge" approach in both mode.


    result.push({
      existing: mode === 'replaceMerge' || isComponentIdInternal(existing) ? null : existing,
      newOption: null,
      keyInfo: null,
      brandNew: null
    });
  }

  return result;
}

function mappingById(result, existings, existingIdIdxMap, newCmptOptions) {
  // Mapping by id if specified.
  each$1(newCmptOptions, function (cmptOption, index) {
    if (!cmptOption || cmptOption.id == null) {
      return;
    }

    var optionId = makeComparableKey(cmptOption.id);
    var existingIdx = existingIdIdxMap.get(optionId);

    if (existingIdx != null) {
      var resultItem = result[existingIdx];
      assert(!resultItem.newOption, 'Duplicated option on id "' + optionId + '".');
      resultItem.newOption = cmptOption; // In both mode, if id matched, new option will be merged to
      // the existings rather than creating new component model.

      resultItem.existing = existings[existingIdx];
      newCmptOptions[index] = null;
    }
  });
}

function mappingByName(result, newCmptOptions) {
  // Mapping by name if specified.
  each$1(newCmptOptions, function (cmptOption, index) {
    if (!cmptOption || cmptOption.name == null) {
      return;
    }

    for (var i = 0; i < result.length; i++) {
      var existing = result[i].existing;

      if (!result[i].newOption // Consider name: two map to one.
      // Can not match when both ids existing but different.
      && existing && (existing.id == null || cmptOption.id == null) && !isComponentIdInternal(cmptOption) && !isComponentIdInternal(existing) && keyExistAndEqual('name', existing, cmptOption)) {
        result[i].newOption = cmptOption;
        newCmptOptions[index] = null;
        return;
      }
    }
  });
}

function mappingByIndex(result, newCmptOptions, brandNew) {
  each$1(newCmptOptions, function (cmptOption) {
    if (!cmptOption) {
      return;
    } // Find the first place that not mapped by id and not internal component (consider the "hole").


    var resultItem;
    var nextIdx = 0;

    while ( // Be `!resultItem` only when `nextIdx >= result.length`.
    (resultItem = result[nextIdx]) && ( // (1) Existing models that already have id should be able to mapped to. Because
    // after mapping performed, model will always be assigned with an id if user not given.
    // After that all models have id.
    // (2) If new option has id, it can only set to a hole or append to the last. It should
    // not be merged to the existings with different id. Because id should not be overwritten.
    // (3) Name can be overwritten, because axis use name as 'show label text'.
    resultItem.newOption || isComponentIdInternal(resultItem.existing) || // In mode "replaceMerge", here no not-mapped-non-internal-existing.
    resultItem.existing && cmptOption.id != null && !keyExistAndEqual('id', cmptOption, resultItem.existing))) {
      nextIdx++;
    }

    if (resultItem) {
      resultItem.newOption = cmptOption;
      resultItem.brandNew = brandNew;
    } else {
      result.push({
        newOption: cmptOption,
        brandNew: brandNew,
        existing: null,
        keyInfo: null
      });
    }

    nextIdx++;
  });
}

function mappingInReplaceAllMode(result, newCmptOptions) {
  each$1(newCmptOptions, function (cmptOption) {
    // The feature "reproduce" requires "hole" will also reproduced
    // in case that compoennt index referring are broken.
    result.push({
      newOption: cmptOption,
      brandNew: true,
      existing: null,
      keyInfo: null
    });
  });
}
/**
 * Make id and name for mapping result (result of mappingToExists)
 * into `keyInfo` field.
 */


function makeIdAndName(mapResult) {
  // We use this id to hash component models and view instances
  // in echarts. id can be specified by user, or auto generated.
  // The id generation rule ensures new view instance are able
  // to mapped to old instance when setOption are called in
  // no-merge mode. So we generate model id by name and plus
  // type in view id.
  // name can be duplicated among components, which is convenient
  // to specify multi components (like series) by one name.
  // Ensure that each id is distinct.
  var idMap = createHashMap();
  each$1(mapResult, function (item) {
    var existing = item.existing;
    existing && idMap.set(existing.id, item);
  });
  each$1(mapResult, function (item) {
    var opt = item.newOption; // Force ensure id not duplicated.

    assert(!opt || opt.id == null || !idMap.get(opt.id) || idMap.get(opt.id) === item, 'id duplicates: ' + (opt && opt.id));
    opt && opt.id != null && idMap.set(opt.id, item);
    !item.keyInfo && (item.keyInfo = {});
  }); // Make name and id.

  each$1(mapResult, function (item, index) {
    var existing = item.existing;
    var opt = item.newOption;
    var keyInfo = item.keyInfo;

    if (!isObject(opt)) {
      return;
    } // name can be overwitten. Consider case: axis.name = '20km'.
    // But id generated by name will not be changed, which affect
    // only in that case: setOption with 'not merge mode' and view
    // instance will be recreated, which can be accepted.


    keyInfo.name = opt.name != null ? makeComparableKey(opt.name) : existing ? existing.name // Avoid diffferent series has the same name,
    // because name may be used like in color pallet.
    : DUMMY_COMPONENT_NAME_PREFIX + index;

    if (existing) {
      keyInfo.id = makeComparableKey(existing.id);
    } else if (opt.id != null) {
      keyInfo.id = makeComparableKey(opt.id);
    } else {
      // Consider this situatoin:
      //  optionA: [{name: 'a'}, {name: 'a'}, {..}]
      //  optionB [{..}, {name: 'a'}, {name: 'a'}]
      // Series with the same name between optionA and optionB
      // should be mapped.
      var idNum = 0;

      do {
        keyInfo.id = '\0' + keyInfo.name + '\0' + idNum++;
      } while (idMap.get(keyInfo.id));
    }

    idMap.set(keyInfo.id, item);
  });
}

function keyExistAndEqual(attr, obj1, obj2) {
  var key1 = convertOptionIdName(obj1[attr], null);
  var key2 = convertOptionIdName(obj2[attr], null); // See `MappingExistingItem`. `id` and `name` trade string equals to number.

  return key1 != null && key2 != null && key1 === key2;
}
/**
 * @return return null if not exist.
 */


function makeComparableKey(val) {

  return convertOptionIdName(val, '');
}

function convertOptionIdName(idOrName, defaultValue) {
  if (idOrName == null) {
    return defaultValue;
  }

  var type = typeof idOrName;
  return type === 'string' ? idOrName : type === 'number' || isStringSafe(idOrName) ? idOrName + '' : defaultValue;
}

function isNameSpecified(componentModel) {
  var name = componentModel.name; // Is specified when `indexOf` get -1 or > 0.

  return !!(name && name.indexOf(DUMMY_COMPONENT_NAME_PREFIX));
}
/**
 * @public
 * @param {Object} cmptOption
 * @return {boolean}
 */

function isComponentIdInternal(cmptOption) {
  return cmptOption && cmptOption.id != null && makeComparableKey(cmptOption.id).indexOf(INTERNAL_COMPONENT_ID_PREFIX) === 0;
}
function setComponentTypeToKeyInfo(mappingResult, mainType, componentModelCtor) {
  // Set mainType and complete subType.
  each$1(mappingResult, function (item) {
    var newOption = item.newOption;

    if (isObject(newOption)) {
      item.keyInfo.mainType = mainType;
      item.keyInfo.subType = determineSubType(mainType, newOption, item.existing, componentModelCtor);
    }
  });
}

function determineSubType(mainType, newCmptOption, existComponent, componentModelCtor) {
  var subType = newCmptOption.type ? newCmptOption.type : existComponent ? existComponent.subType // Use determineSubType only when there is no existComponent.
  : componentModelCtor.determineSubType(mainType, newCmptOption); // tooltip, markline, markpoint may always has no subType

  return subType;
}
/**
 * @param payload Contains dataIndex (means rawIndex) / dataIndexInside / name
 *                         each of which can be Array or primary type.
 * @return dataIndex If not found, return undefined/null.
 */

function queryDataIndex(data, payload) {
  if (payload.dataIndexInside != null) {
    return payload.dataIndexInside;
  } else if (payload.dataIndex != null) {
    return isArray(payload.dataIndex) ? map(payload.dataIndex, function (value) {
      return data.indexOfRawIndex(value);
    }) : data.indexOfRawIndex(payload.dataIndex);
  } else if (payload.name != null) {
    return isArray(payload.name) ? map(payload.name, function (value) {
      return data.indexOfName(value);
    }) : data.indexOfName(payload.name);
  }
}
/**
 * Enable property storage to any host object.
 * Notice: Serialization is not supported.
 *
 * For example:
 * let inner = zrUitl.makeInner();
 *
 * function some1(hostObj) {
 *      inner(hostObj).someProperty = 1212;
 *      ...
 * }
 * function some2() {
 *      let fields = inner(this);
 *      fields.someProperty1 = 1212;
 *      fields.someProperty2 = 'xx';
 *      ...
 * }
 *
 * @return {Function}
 */

function makeInner() {
  var key = '__ec_inner_' + innerUniqueIndex++;
  return function (hostObj) {
    return hostObj[key] || (hostObj[key] = {});
  };
}
var innerUniqueIndex = getRandomIdBase();
/**
 * The same behavior as `component.getReferringComponents`.
 */

function parseFinder(ecModel, finderInput, opt) {
  var finder;

  if (isString(finderInput)) {
    var obj = {};
    obj[finderInput + 'Index'] = 0;
    finder = obj;
  } else {
    finder = finderInput;
  }

  var queryOptionMap = createHashMap();
  var result = {};
  var mainTypeSpecified = false;
  each$1(finder, function (value, key) {
    // Exclude 'dataIndex' and other illgal keys.
    if (key === 'dataIndex' || key === 'dataIndexInside') {
      result[key] = value;
      return;
    }

    var parsedKey = key.match(/^(\w+)(Index|Id|Name)$/) || [];
    var mainType = parsedKey[1];
    var queryType = (parsedKey[2] || '').toLowerCase();

    if (!mainType || !queryType || opt && opt.includeMainTypes && indexOf(opt.includeMainTypes, mainType) < 0) {
      return;
    }

    mainTypeSpecified = mainTypeSpecified || !!mainType;
    var queryOption = queryOptionMap.get(mainType) || queryOptionMap.set(mainType, {});
    queryOption[queryType] = value;
  });
  var defaultMainType = opt ? opt.defaultMainType : null;

  if (!mainTypeSpecified && defaultMainType) {
    queryOptionMap.set(defaultMainType, {});
  }

  queryOptionMap.each(function (queryOption, mainType) {
    var queryResult = queryReferringComponents(ecModel, mainType, queryOption, {
      useDefault: defaultMainType === mainType,
      enableAll: opt && opt.enableAll != null ? opt.enableAll : true,
      enableNone: opt && opt.enableNone != null ? opt.enableNone : true
    });
    result[mainType + 'Models'] = queryResult.models;
    result[mainType + 'Model'] = queryResult.models[0];
  });
  return result;
}
var SINGLE_REFERRING = {
  useDefault: true,
  enableAll: false,
  enableNone: false
};
var MULTIPLE_REFERRING = {
  useDefault: false,
  enableAll: true,
  enableNone: true
};
function queryReferringComponents(ecModel, mainType, userOption, opt) {
  opt = opt || SINGLE_REFERRING;
  var indexOption = userOption.index;
  var idOption = userOption.id;
  var nameOption = userOption.name;
  var result = {
    models: null,
    specified: indexOption != null || idOption != null || nameOption != null
  };

  if (!result.specified) {
    // Use the first as default if `useDefault`.
    var firstCmpt = void 0;
    result.models = opt.useDefault && (firstCmpt = ecModel.getComponent(mainType)) ? [firstCmpt] : [];
    return result;
  }

  if (indexOption === 'none' || indexOption === false) {
    assert(opt.enableNone, '`"none"` or `false` is not a valid value on index option.');
    result.models = [];
    return result;
  } // `queryComponents` will return all components if
  // both all of index/id/name are null/undefined.


  if (indexOption === 'all') {
    assert(opt.enableAll, '`"all"` is not a valid value on index option.');
    indexOption = idOption = nameOption = null;
  }

  result.models = ecModel.queryComponents({
    mainType: mainType,
    index: indexOption,
    id: idOption,
    name: nameOption
  });
  return result;
}
function setAttribute(dom, key, value) {
  dom.setAttribute ? dom.setAttribute(key, value) : dom[key] = value;
}
function getAttribute(dom, key) {
  return dom.getAttribute ? dom.getAttribute(key) : dom[key];
}
function getTooltipRenderMode(renderModeOption) {
  if (renderModeOption === 'auto') {
    // Using html when `document` exists, use richText otherwise
    return env.domSupported ? 'html' : 'richText';
  } else {
    return renderModeOption || 'html';
  }
}
/**
 * Interpolate raw values of a series with percent
 *
 * @param data         data
 * @param labelModel   label model of the text element
 * @param sourceValue  start value. May be null/undefined when init.
 * @param targetValue  end value
 * @param percent      0~1 percentage; 0 uses start value while 1 uses end value
 * @return             interpolated values
 *                     If `sourceValue` and `targetValue` are `number`, return `number`.
 *                     If `sourceValue` and `targetValue` are `string`, return `string`.
 *                     If `sourceValue` and `targetValue` are `(string | number)[]`, return `(string | number)[]`.
 *                     Other cases do not supported.
 */

function interpolateRawValues(data, precision, sourceValue, targetValue, percent) {
  var isAutoPrecision = precision == null || precision === 'auto';

  if (targetValue == null) {
    return targetValue;
  }

  if (typeof targetValue === 'number') {
    var value = interpolateNumber(sourceValue || 0, targetValue, percent);
    return round(value, isAutoPrecision ? Math.max(getPrecisionSafe(sourceValue || 0), getPrecisionSafe(targetValue)) : precision);
  } else if (typeof targetValue === 'string') {
    return percent < 1 ? sourceValue : targetValue;
  } else {
    var interpolated = [];
    var leftArr = sourceValue;
    var rightArr = targetValue;
    var length_1 = Math.max(leftArr ? leftArr.length : 0, rightArr.length);

    for (var i = 0; i < length_1; ++i) {
      var info = data.getDimensionInfo(i); // Don't interpolate ordinal dims

      if (info.type === 'ordinal') {
        // In init, there is no `sourceValue`, but should better not to get undefined result.
        interpolated[i] = (percent < 1 && leftArr ? leftArr : rightArr)[i];
      } else {
        var leftVal = leftArr && leftArr[i] ? leftArr[i] : 0;
        var rightVal = rightArr[i];
        var value = interpolateNumber(leftVal, rightVal, percent);
        interpolated[i] = round(value, isAutoPrecision ? Math.max(getPrecisionSafe(leftVal), getPrecisionSafe(rightVal)) : precision);
      }
    }

    return interpolated;
  }
}

var getECData = makeInner();

var _highlightNextDigit = 1;
var _highlightKeyMap = {};
var getSavedStates = makeInner();
var HOVER_STATE_NORMAL = 0;
var HOVER_STATE_BLUR = 1;
var HOVER_STATE_EMPHASIS = 2;
var SPECIAL_STATES = ['emphasis', 'blur', 'select'];
var DISPLAY_STATES = ['normal', 'emphasis', 'blur', 'select'];
var Z2_EMPHASIS_LIFT = 10;
var Z2_SELECT_LIFT = 9;
var HIGHLIGHT_ACTION_TYPE = 'highlight';
var DOWNPLAY_ACTION_TYPE = 'downplay';
var SELECT_ACTION_TYPE = 'select';
var UNSELECT_ACTION_TYPE = 'unselect';
var TOGGLE_SELECT_ACTION_TYPE = 'toggleSelect';

function hasFillOrStroke(fillOrStroke) {
  return fillOrStroke != null && fillOrStroke !== 'none';
} // Most lifted color are duplicated.


var liftedColorCache = new LRU(100);

function liftColor(color$1) {
  if (typeof color$1 !== 'string') {
    return color$1;
  }

  var liftedColor = liftedColorCache.get(color$1);

  if (!liftedColor) {
    liftedColor = lift(color$1, -0.1);
    liftedColorCache.put(color$1, liftedColor);
  }

  return liftedColor;
}

function doChangeHoverState(el, stateName, hoverStateEnum) {
  if (el.onHoverStateChange && (el.hoverState || 0) !== hoverStateEnum) {
    el.onHoverStateChange(stateName);
  }

  el.hoverState = hoverStateEnum;
}

function singleEnterEmphasis(el) {
  // Only mark the flag.
  // States will be applied in the echarts.ts in next frame.
  doChangeHoverState(el, 'emphasis', HOVER_STATE_EMPHASIS);
}

function singleLeaveEmphasis(el) {
  // Only mark the flag.
  // States will be applied in the echarts.ts in next frame.
  if (el.hoverState === HOVER_STATE_EMPHASIS) {
    doChangeHoverState(el, 'normal', HOVER_STATE_NORMAL);
  }
}

function singleEnterBlur(el) {
  doChangeHoverState(el, 'blur', HOVER_STATE_BLUR);
}

function singleLeaveBlur(el) {
  if (el.hoverState === HOVER_STATE_BLUR) {
    doChangeHoverState(el, 'normal', HOVER_STATE_NORMAL);
  }
}

function singleEnterSelect(el) {
  el.selected = true;
}

function singleLeaveSelect(el) {
  el.selected = false;
}

function updateElementState(el, updater, commonParam) {
  updater(el, commonParam);
}

function traverseUpdateState(el, updater, commonParam) {
  updateElementState(el, updater, commonParam);
  el.isGroup && el.traverse(function (child) {
    updateElementState(child, updater, commonParam);
  });
}

function setStatesFlag(el, stateName) {
  switch (stateName) {
    case 'emphasis':
      el.hoverState = HOVER_STATE_EMPHASIS;
      break;

    case 'normal':
      el.hoverState = HOVER_STATE_NORMAL;
      break;

    case 'blur':
      el.hoverState = HOVER_STATE_BLUR;
      break;

    case 'select':
      el.selected = true;
  }
}

function getFromStateStyle(el, props, toStateName, defaultValue) {
  var style = el.style;
  var fromState = {};

  for (var i = 0; i < props.length; i++) {
    var propName = props[i];
    var val = style[propName];
    fromState[propName] = val == null ? defaultValue && defaultValue[propName] : val;
  }

  for (var i = 0; i < el.animators.length; i++) {
    var animator = el.animators[i];

    if (animator.__fromStateTransition // Dont consider the animation to emphasis state.
    && animator.__fromStateTransition.indexOf(toStateName) < 0 && animator.targetName === 'style') {
      animator.saveFinalToTarget(fromState, props);
    }
  }

  return fromState;
}

function createEmphasisDefaultState(el, stateName, targetStates, state) {
  var hasSelect = targetStates && indexOf(targetStates, 'select') >= 0;
  var cloned = false;

  if (el instanceof Path) {
    var store = getSavedStates(el);
    var fromFill = hasSelect ? store.selectFill || store.normalFill : store.normalFill;
    var fromStroke = hasSelect ? store.selectStroke || store.normalStroke : store.normalStroke;

    if (hasFillOrStroke(fromFill) || hasFillOrStroke(fromStroke)) {
      state = state || {}; // Apply default color lift

      var emphasisStyle = state.style || {};

      if (!hasFillOrStroke(emphasisStyle.fill) && hasFillOrStroke(fromFill)) {
        cloned = true; // Not modify the original value.

        state = extend({}, state);
        emphasisStyle = extend({}, emphasisStyle); // Already being applied 'emphasis'. DON'T lift color multiple times.

        emphasisStyle.fill = liftColor(fromFill);
      } // Not highlight stroke if fill has been highlighted.
      else if (!hasFillOrStroke(emphasisStyle.stroke) && hasFillOrStroke(fromStroke)) {
          if (!cloned) {
            state = extend({}, state);
            emphasisStyle = extend({}, emphasisStyle);
          }

          emphasisStyle.stroke = liftColor(fromStroke);
        }

      state.style = emphasisStyle;
    }
  }

  if (state) {
    // TODO Share with textContent?
    if (state.z2 == null) {
      if (!cloned) {
        state = extend({}, state);
      }

      var z2EmphasisLift = el.z2EmphasisLift;
      state.z2 = el.z2 + (z2EmphasisLift != null ? z2EmphasisLift : Z2_EMPHASIS_LIFT);
    }
  }

  return state;
}

function createSelectDefaultState(el, stateName, state) {
  // const hasSelect = indexOf(el.currentStates, stateName) >= 0;
  if (state) {
    // TODO Share with textContent?
    if (state.z2 == null) {
      state = extend({}, state);
      var z2SelectLift = el.z2SelectLift;
      state.z2 = el.z2 + (z2SelectLift != null ? z2SelectLift : Z2_SELECT_LIFT);
    }
  }

  return state;
}

function createBlurDefaultState(el, stateName, state) {
  var hasBlur = indexOf(el.currentStates, stateName) >= 0;
  var currentOpacity = el.style.opacity;
  var fromState = !hasBlur ? getFromStateStyle(el, ['opacity'], stateName, {
    opacity: 1
  }) : null;
  state = state || {};
  var blurStyle = state.style || {};

  if (blurStyle.opacity == null) {
    // clone state
    state = extend({}, state);
    blurStyle = extend({
      // Already being applied 'emphasis'. DON'T mul opacity multiple times.
      opacity: hasBlur ? currentOpacity : fromState.opacity * 0.1
    }, blurStyle);
    state.style = blurStyle;
  }

  return state;
}

function elementStateProxy(stateName, targetStates) {
  var state = this.states[stateName];

  if (this.style) {
    if (stateName === 'emphasis') {
      return createEmphasisDefaultState(this, stateName, targetStates, state);
    } else if (stateName === 'blur') {
      return createBlurDefaultState(this, stateName, state);
    } else if (stateName === 'select') {
      return createSelectDefaultState(this, stateName, state);
    }
  }

  return state;
}
/**FI
 * Set hover style (namely "emphasis style") of element.
 * @param el Should not be `zrender/graphic/Group`.
 * @param focus 'self' | 'selfInSeries' | 'series'
 */


function setDefaultStateProxy(el) {
  el.stateProxy = elementStateProxy;
  var textContent = el.getTextContent();
  var textGuide = el.getTextGuideLine();

  if (textContent) {
    textContent.stateProxy = elementStateProxy;
  }

  if (textGuide) {
    textGuide.stateProxy = elementStateProxy;
  }
}
function enterEmphasisWhenMouseOver(el, e) {
  !shouldSilent(el, e) // "emphasis" event highlight has higher priority than mouse highlight.
  && !el.__highByOuter && traverseUpdateState(el, singleEnterEmphasis);
}
function leaveEmphasisWhenMouseOut(el, e) {
  !shouldSilent(el, e) // "emphasis" event highlight has higher priority than mouse highlight.
  && !el.__highByOuter && traverseUpdateState(el, singleLeaveEmphasis);
}
function enterEmphasis(el, highlightDigit) {
  el.__highByOuter |= 1 << (highlightDigit || 0);
  traverseUpdateState(el, singleEnterEmphasis);
}
function leaveEmphasis(el, highlightDigit) {
  !(el.__highByOuter &= ~(1 << (highlightDigit || 0))) && traverseUpdateState(el, singleLeaveEmphasis);
}
function enterBlur(el) {
  traverseUpdateState(el, singleEnterBlur);
}
function leaveBlur(el) {
  traverseUpdateState(el, singleLeaveBlur);
}
function enterSelect(el) {
  traverseUpdateState(el, singleEnterSelect);
}
function leaveSelect(el) {
  traverseUpdateState(el, singleLeaveSelect);
}

function shouldSilent(el, e) {
  return el.__highDownSilentOnTouch && e.zrByTouch;
}

function allLeaveBlur(api) {
  var model = api.getModel();
  model.eachComponent(function (componentType, componentModel) {
    var view = componentType === 'series' ? api.getViewOfSeriesModel(componentModel) : api.getViewOfComponentModel(componentModel); // Leave blur anyway

    view.group.traverse(function (child) {
      singleLeaveBlur(child);
    });
  });
}

function toggleSeriesBlurState(targetSeriesIndex, focus, blurScope, api, isBlur) {
  var ecModel = api.getModel();
  blurScope = blurScope || 'coordinateSystem';

  function leaveBlurOfIndices(data, dataIndices) {
    for (var i = 0; i < dataIndices.length; i++) {
      var itemEl = data.getItemGraphicEl(dataIndices[i]);
      itemEl && leaveBlur(itemEl);
    }
  }

  if (!isBlur) {
    allLeaveBlur(api);
    return;
  }

  if (targetSeriesIndex == null) {
    return;
  }

  if (!focus || focus === 'none') {
    return;
  }

  var targetSeriesModel = ecModel.getSeriesByIndex(targetSeriesIndex);
  var targetCoordSys = targetSeriesModel.coordinateSystem;

  if (targetCoordSys && targetCoordSys.master) {
    targetCoordSys = targetCoordSys.master;
  }

  var blurredSeries = [];
  ecModel.eachSeries(function (seriesModel) {
    var sameSeries = targetSeriesModel === seriesModel;
    var coordSys = seriesModel.coordinateSystem;

    if (coordSys && coordSys.master) {
      coordSys = coordSys.master;
    }

    var sameCoordSys = coordSys && targetCoordSys ? coordSys === targetCoordSys : sameSeries; // If there is no coordinate system. use sameSeries instead.

    if (!( // Not blur other series if blurScope series
    blurScope === 'series' && !sameSeries // Not blur other coordinate system if blurScope is coordinateSystem
    || blurScope === 'coordinateSystem' && !sameCoordSys // Not blur self series if focus is series.
    || focus === 'series' && sameSeries // TODO blurScope: coordinate system
    )) {
      var view = api.getViewOfSeriesModel(seriesModel);
      view.group.traverse(function (child) {
        singleEnterBlur(child);
      });

      if (isArrayLike(focus)) {
        leaveBlurOfIndices(seriesModel.getData(), focus);
      } else if (isObject(focus)) {
        var dataTypes = keys(focus);

        for (var d = 0; d < dataTypes.length; d++) {
          leaveBlurOfIndices(seriesModel.getData(dataTypes[d]), focus[dataTypes[d]]);
        }
      }

      blurredSeries.push(seriesModel);
    }
  });
  ecModel.eachComponent(function (componentType, componentModel) {
    if (componentType === 'series') {
      return;
    }

    var view = api.getViewOfComponentModel(componentModel);

    if (view && view.blurSeries) {
      view.blurSeries(blurredSeries, ecModel);
    }
  });
}
function toggleSeriesBlurStateFromPayload(seriesModel, payload, api) {
  if (!isHighDownPayload(payload)) {
    return;
  }

  var isHighlight = payload.type === HIGHLIGHT_ACTION_TYPE;
  var seriesIndex = seriesModel.seriesIndex;
  var data = seriesModel.getData(payload.dataType);
  var dataIndex = queryDataIndex(data, payload); // Pick the first one if there is multiple/none exists.

  dataIndex = (isArray(dataIndex) ? dataIndex[0] : dataIndex) || 0;
  var el = data.getItemGraphicEl(dataIndex);

  if (!el) {
    var count = data.count();
    var current = 0; // If data on dataIndex is NaN.

    while (!el && current < count) {
      el = data.getItemGraphicEl(current++);
    }
  }

  if (el) {
    var ecData = getECData(el);
    toggleSeriesBlurState(seriesIndex, ecData.focus, ecData.blurScope, api, isHighlight);
  } else {
    // If there is no element put on the data. Try getting it from raw option
    // TODO Should put it on seriesModel?
    var focus_1 = seriesModel.get(['emphasis', 'focus']);
    var blurScope = seriesModel.get(['emphasis', 'blurScope']);

    if (focus_1 != null) {
      toggleSeriesBlurState(seriesIndex, focus_1, blurScope, api, isHighlight);
    }
  }
}
function toggleSelectionFromPayload(seriesModel, payload, api) {
  if (!isSelectChangePayload(payload)) {
    return;
  }

  var dataType = payload.dataType;
  var data = seriesModel.getData(dataType);
  var dataIndex = queryDataIndex(data, payload);

  if (!isArray(dataIndex)) {
    dataIndex = [dataIndex];
  }

  seriesModel[payload.type === TOGGLE_SELECT_ACTION_TYPE ? 'toggleSelect' : payload.type === SELECT_ACTION_TYPE ? 'select' : 'unselect'](dataIndex, dataType);
}
function updateSeriesElementSelection(seriesModel) {
  var allData = seriesModel.getAllData();
  each$1(allData, function (_a) {
    var data = _a.data,
        type = _a.type;
    data.eachItemGraphicEl(function (el, idx) {
      seriesModel.isSelected(idx, type) ? enterSelect(el) : leaveSelect(el);
    });
  });
}
function getAllSelectedIndices(ecModel) {
  var ret = [];
  ecModel.eachSeries(function (seriesModel) {
    var allData = seriesModel.getAllData();
    each$1(allData, function (_a) {
      _a.data;
          var type = _a.type;
      var dataIndices = seriesModel.getSelectedDataIndices();

      if (dataIndices.length > 0) {
        var item = {
          dataIndex: dataIndices,
          seriesIndex: seriesModel.seriesIndex
        };

        if (type != null) {
          item.dataType = type;
        }

        ret.push(item);
      }
    });
  });
  return ret;
}
/**
 * Enable the function that mouseover will trigger the emphasis state.
 *
 * NOTE:
 * This function should be used on the element with dataIndex, seriesIndex.
 *
 */

function enableHoverEmphasis(el, focus, blurScope) {
  setAsHighDownDispatcher(el, true);
  traverseUpdateState(el, setDefaultStateProxy);
  enableHoverFocus(el, focus, blurScope);
}
function enableHoverFocus(el, focus, blurScope) {
  var ecData = getECData(el);

  if (focus != null) {
    // TODO dataIndex may be set after this function. This check is not useful.
    // if (ecData.dataIndex == null) {
    //     if (__DEV__) {
    //         console.warn('focus can only been set on element with dataIndex');
    //     }
    // }
    // else {
    ecData.focus = focus;
    ecData.blurScope = blurScope; // }
  } else if (ecData.focus) {
    ecData.focus = null;
  }
}
var OTHER_STATES = ['emphasis', 'blur', 'select'];
var defaultStyleGetterMap = {
  itemStyle: 'getItemStyle',
  lineStyle: 'getLineStyle',
  areaStyle: 'getAreaStyle'
};
/**
 * Set emphasis/blur/selected states of element.
 */

function setStatesStylesFromModel(el, itemModel, styleType, // default itemStyle
getter) {
  styleType = styleType || 'itemStyle';

  for (var i = 0; i < OTHER_STATES.length; i++) {
    var stateName = OTHER_STATES[i];
    var model = itemModel.getModel([stateName, styleType]);
    var state = el.ensureState(stateName); // Let it throw error if getterType is not found.

    state.style = getter ? getter(model) : model[defaultStyleGetterMap[styleType]]();
  }
}
/**
 * @parame el
 * @param el.highDownSilentOnTouch
 *        In touch device, mouseover event will be trigger on touchstart event
 *        (see module:zrender/dom/HandlerProxy). By this mechanism, we can
 *        conveniently use hoverStyle when tap on touch screen without additional
 *        code for compatibility.
 *        But if the chart/component has select feature, which usually also use
 *        hoverStyle, there might be conflict between 'select-highlight' and
 *        'hover-highlight' especially when roam is enabled (see geo for example).
 *        In this case, `highDownSilentOnTouch` should be used to disable
 *        hover-highlight on touch device.
 * @param asDispatcher If `false`, do not set as "highDownDispatcher".
 */

function setAsHighDownDispatcher(el, asDispatcher) {
  var disable = asDispatcher === false;
  var extendedEl = el; // Make `highDownSilentOnTouch` and `onStateChange` only work after
  // `setAsHighDownDispatcher` called. Avoid it is modified by user unexpectedly.

  if (el.highDownSilentOnTouch) {
    extendedEl.__highDownSilentOnTouch = el.highDownSilentOnTouch;
  } // Simple optimize, since this method might be
  // called for each elements of a group in some cases.


  if (!disable || extendedEl.__highDownDispatcher) {
    // Emphasis, normal can be triggered manually by API or other components like hover link.
    // el[method]('emphasis', onElementEmphasisEvent)[method]('normal', onElementNormalEvent);
    // Also keep previous record.
    extendedEl.__highByOuter = extendedEl.__highByOuter || 0;
    extendedEl.__highDownDispatcher = !disable;
  }
}
function isHighDownDispatcher(el) {
  return !!(el && el.__highDownDispatcher);
}
/**
 * Support hightlight/downplay record on each elements.
 * For the case: hover highlight/downplay (legend, visualMap, ...) and
 * user triggerred hightlight/downplay should not conflict.
 * Only all of the highlightDigit cleared, return to normal.
 * @param {string} highlightKey
 * @return {number} highlightDigit
 */

function getHighlightDigit(highlightKey) {
  var highlightDigit = _highlightKeyMap[highlightKey];

  if (highlightDigit == null && _highlightNextDigit <= 32) {
    highlightDigit = _highlightKeyMap[highlightKey] = _highlightNextDigit++;
  }

  return highlightDigit;
}
function isSelectChangePayload(payload) {
  var payloadType = payload.type;
  return payloadType === SELECT_ACTION_TYPE || payloadType === UNSELECT_ACTION_TYPE || payloadType === TOGGLE_SELECT_ACTION_TYPE;
}
function isHighDownPayload(payload) {
  var payloadType = payload.type;
  return payloadType === HIGHLIGHT_ACTION_TYPE || payloadType === DOWNPLAY_ACTION_TYPE;
}
function savePathStates(el) {
  var store = getSavedStates(el);
  store.normalFill = el.style.fill;
  store.normalStroke = el.style.stroke;
  var selectState = el.states.select || {};
  store.selectFill = selectState.style && selectState.style.fill || null;
  store.selectStroke = selectState.style && selectState.style.stroke || null;
}

var CMD = PathProxy.CMD;
var points = [[], [], []];
var mathSqrt$2 = Math.sqrt;
var mathAtan2 = Math.atan2;
function transformPath(path, m) {
    var data = path.data;
    var len = path.len();
    var cmd;
    var nPoint;
    var i;
    var j;
    var k;
    var p;
    var M = CMD.M;
    var C = CMD.C;
    var L = CMD.L;
    var R = CMD.R;
    var A = CMD.A;
    var Q = CMD.Q;
    for (i = 0, j = 0; i < len;) {
        cmd = data[i++];
        j = i;
        nPoint = 0;
        switch (cmd) {
            case M:
                nPoint = 1;
                break;
            case L:
                nPoint = 1;
                break;
            case C:
                nPoint = 3;
                break;
            case Q:
                nPoint = 2;
                break;
            case A:
                var x = m[4];
                var y = m[5];
                var sx = mathSqrt$2(m[0] * m[0] + m[1] * m[1]);
                var sy = mathSqrt$2(m[2] * m[2] + m[3] * m[3]);
                var angle = mathAtan2(-m[1] / sy, m[0] / sx);
                data[i] *= sx;
                data[i++] += x;
                data[i] *= sy;
                data[i++] += y;
                data[i++] *= sx;
                data[i++] *= sy;
                data[i++] += angle;
                data[i++] += angle;
                i += 2;
                j = i;
                break;
            case R:
                p[0] = data[i++];
                p[1] = data[i++];
                applyTransform$1(p, p, m);
                data[j++] = p[0];
                data[j++] = p[1];
                p[0] += data[i++];
                p[1] += data[i++];
                applyTransform$1(p, p, m);
                data[j++] = p[0];
                data[j++] = p[1];
        }
        for (k = 0; k < nPoint; k++) {
            var p_1 = points[k];
            p_1[0] = data[i++];
            p_1[1] = data[i++];
            applyTransform$1(p_1, p_1, m);
            data[j++] = p_1[0];
            data[j++] = p_1[1];
        }
    }
    path.increaseVersion();
}

var mathSqrt$1 = Math.sqrt;
var mathSin$1 = Math.sin;
var mathCos$1 = Math.cos;
var PI$1 = Math.PI;
function vMag(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}
function vRatio(u, v) {
    return (u[0] * v[0] + u[1] * v[1]) / (vMag(u) * vMag(v));
}
function vAngle(u, v) {
    return (u[0] * v[1] < u[1] * v[0] ? -1 : 1)
        * Math.acos(vRatio(u, v));
}
function processArc(x1, y1, x2, y2, fa, fs, rx, ry, psiDeg, cmd, path) {
    var psi = psiDeg * (PI$1 / 180.0);
    var xp = mathCos$1(psi) * (x1 - x2) / 2.0
        + mathSin$1(psi) * (y1 - y2) / 2.0;
    var yp = -1 * mathSin$1(psi) * (x1 - x2) / 2.0
        + mathCos$1(psi) * (y1 - y2) / 2.0;
    var lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
    if (lambda > 1) {
        rx *= mathSqrt$1(lambda);
        ry *= mathSqrt$1(lambda);
    }
    var f = (fa === fs ? -1 : 1)
        * mathSqrt$1((((rx * rx) * (ry * ry))
            - ((rx * rx) * (yp * yp))
            - ((ry * ry) * (xp * xp))) / ((rx * rx) * (yp * yp)
            + (ry * ry) * (xp * xp))) || 0;
    var cxp = f * rx * yp / ry;
    var cyp = f * -ry * xp / rx;
    var cx = (x1 + x2) / 2.0
        + mathCos$1(psi) * cxp
        - mathSin$1(psi) * cyp;
    var cy = (y1 + y2) / 2.0
        + mathSin$1(psi) * cxp
        + mathCos$1(psi) * cyp;
    var theta = vAngle([1, 0], [(xp - cxp) / rx, (yp - cyp) / ry]);
    var u = [(xp - cxp) / rx, (yp - cyp) / ry];
    var v = [(-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry];
    var dTheta = vAngle(u, v);
    if (vRatio(u, v) <= -1) {
        dTheta = PI$1;
    }
    if (vRatio(u, v) >= 1) {
        dTheta = 0;
    }
    if (dTheta < 0) {
        var n = Math.round(dTheta / PI$1 * 1e6) / 1e6;
        dTheta = PI$1 * 2 + (n % 2) * PI$1;
    }
    path.addData(cmd, cx, cy, rx, ry, theta, dTheta, psi, fs);
}
var commandReg = /([mlvhzcqtsa])([^mlvhzcqtsa]*)/ig;
var numberReg = /-?([0-9]*\.)?[0-9]+([eE]-?[0-9]+)?/g;
function createPathProxyFromString(data) {
    var path = new PathProxy();
    if (!data) {
        return path;
    }
    var cpx = 0;
    var cpy = 0;
    var subpathX = cpx;
    var subpathY = cpy;
    var prevCmd;
    var CMD = PathProxy.CMD;
    var cmdList = data.match(commandReg);
    if (!cmdList) {
        return path;
    }
    for (var l = 0; l < cmdList.length; l++) {
        var cmdText = cmdList[l];
        var cmdStr = cmdText.charAt(0);
        var cmd = void 0;
        var p = cmdText.match(numberReg) || [];
        var pLen = p.length;
        for (var i = 0; i < pLen; i++) {
            p[i] = parseFloat(p[i]);
        }
        var off = 0;
        while (off < pLen) {
            var ctlPtx = void 0;
            var ctlPty = void 0;
            var rx = void 0;
            var ry = void 0;
            var psi = void 0;
            var fa = void 0;
            var fs = void 0;
            var x1 = cpx;
            var y1 = cpy;
            var len = void 0;
            var pathData = void 0;
            switch (cmdStr) {
                case 'l':
                    cpx += p[off++];
                    cpy += p[off++];
                    cmd = CMD.L;
                    path.addData(cmd, cpx, cpy);
                    break;
                case 'L':
                    cpx = p[off++];
                    cpy = p[off++];
                    cmd = CMD.L;
                    path.addData(cmd, cpx, cpy);
                    break;
                case 'm':
                    cpx += p[off++];
                    cpy += p[off++];
                    cmd = CMD.M;
                    path.addData(cmd, cpx, cpy);
                    subpathX = cpx;
                    subpathY = cpy;
                    cmdStr = 'l';
                    break;
                case 'M':
                    cpx = p[off++];
                    cpy = p[off++];
                    cmd = CMD.M;
                    path.addData(cmd, cpx, cpy);
                    subpathX = cpx;
                    subpathY = cpy;
                    cmdStr = 'L';
                    break;
                case 'h':
                    cpx += p[off++];
                    cmd = CMD.L;
                    path.addData(cmd, cpx, cpy);
                    break;
                case 'H':
                    cpx = p[off++];
                    cmd = CMD.L;
                    path.addData(cmd, cpx, cpy);
                    break;
                case 'v':
                    cpy += p[off++];
                    cmd = CMD.L;
                    path.addData(cmd, cpx, cpy);
                    break;
                case 'V':
                    cpy = p[off++];
                    cmd = CMD.L;
                    path.addData(cmd, cpx, cpy);
                    break;
                case 'C':
                    cmd = CMD.C;
                    path.addData(cmd, p[off++], p[off++], p[off++], p[off++], p[off++], p[off++]);
                    cpx = p[off - 2];
                    cpy = p[off - 1];
                    break;
                case 'c':
                    cmd = CMD.C;
                    path.addData(cmd, p[off++] + cpx, p[off++] + cpy, p[off++] + cpx, p[off++] + cpy, p[off++] + cpx, p[off++] + cpy);
                    cpx += p[off - 2];
                    cpy += p[off - 1];
                    break;
                case 'S':
                    ctlPtx = cpx;
                    ctlPty = cpy;
                    len = path.len();
                    pathData = path.data;
                    if (prevCmd === CMD.C) {
                        ctlPtx += cpx - pathData[len - 4];
                        ctlPty += cpy - pathData[len - 3];
                    }
                    cmd = CMD.C;
                    x1 = p[off++];
                    y1 = p[off++];
                    cpx = p[off++];
                    cpy = p[off++];
                    path.addData(cmd, ctlPtx, ctlPty, x1, y1, cpx, cpy);
                    break;
                case 's':
                    ctlPtx = cpx;
                    ctlPty = cpy;
                    len = path.len();
                    pathData = path.data;
                    if (prevCmd === CMD.C) {
                        ctlPtx += cpx - pathData[len - 4];
                        ctlPty += cpy - pathData[len - 3];
                    }
                    cmd = CMD.C;
                    x1 = cpx + p[off++];
                    y1 = cpy + p[off++];
                    cpx += p[off++];
                    cpy += p[off++];
                    path.addData(cmd, ctlPtx, ctlPty, x1, y1, cpx, cpy);
                    break;
                case 'Q':
                    x1 = p[off++];
                    y1 = p[off++];
                    cpx = p[off++];
                    cpy = p[off++];
                    cmd = CMD.Q;
                    path.addData(cmd, x1, y1, cpx, cpy);
                    break;
                case 'q':
                    x1 = p[off++] + cpx;
                    y1 = p[off++] + cpy;
                    cpx += p[off++];
                    cpy += p[off++];
                    cmd = CMD.Q;
                    path.addData(cmd, x1, y1, cpx, cpy);
                    break;
                case 'T':
                    ctlPtx = cpx;
                    ctlPty = cpy;
                    len = path.len();
                    pathData = path.data;
                    if (prevCmd === CMD.Q) {
                        ctlPtx += cpx - pathData[len - 4];
                        ctlPty += cpy - pathData[len - 3];
                    }
                    cpx = p[off++];
                    cpy = p[off++];
                    cmd = CMD.Q;
                    path.addData(cmd, ctlPtx, ctlPty, cpx, cpy);
                    break;
                case 't':
                    ctlPtx = cpx;
                    ctlPty = cpy;
                    len = path.len();
                    pathData = path.data;
                    if (prevCmd === CMD.Q) {
                        ctlPtx += cpx - pathData[len - 4];
                        ctlPty += cpy - pathData[len - 3];
                    }
                    cpx += p[off++];
                    cpy += p[off++];
                    cmd = CMD.Q;
                    path.addData(cmd, ctlPtx, ctlPty, cpx, cpy);
                    break;
                case 'A':
                    rx = p[off++];
                    ry = p[off++];
                    psi = p[off++];
                    fa = p[off++];
                    fs = p[off++];
                    x1 = cpx, y1 = cpy;
                    cpx = p[off++];
                    cpy = p[off++];
                    cmd = CMD.A;
                    processArc(x1, y1, cpx, cpy, fa, fs, rx, ry, psi, cmd, path);
                    break;
                case 'a':
                    rx = p[off++];
                    ry = p[off++];
                    psi = p[off++];
                    fa = p[off++];
                    fs = p[off++];
                    x1 = cpx, y1 = cpy;
                    cpx += p[off++];
                    cpy += p[off++];
                    cmd = CMD.A;
                    processArc(x1, y1, cpx, cpy, fa, fs, rx, ry, psi, cmd, path);
                    break;
            }
        }
        if (cmdStr === 'z' || cmdStr === 'Z') {
            cmd = CMD.Z;
            path.addData(cmd);
            cpx = subpathX;
            cpy = subpathY;
        }
        prevCmd = cmd;
    }
    path.toStatic();
    return path;
}
var SVGPath = (function (_super) {
    __extends(SVGPath, _super);
    function SVGPath() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SVGPath.prototype.applyTransform = function (m) { };
    return SVGPath;
}(Path));
function isPathProxy(path) {
    return path.setData != null;
}
function createPathOptions(str, opts) {
    var pathProxy = createPathProxyFromString(str);
    var innerOpts = extend({}, opts);
    innerOpts.buildPath = function (path) {
        if (isPathProxy(path)) {
            path.setData(pathProxy.data);
            var ctx = path.getContext();
            if (ctx) {
                path.rebuildPath(ctx, 1);
            }
        }
        else {
            var ctx = path;
            pathProxy.rebuildPath(ctx, 1);
        }
    };
    innerOpts.applyTransform = function (m) {
        transformPath(pathProxy, m);
        this.dirtyShape();
    };
    return innerOpts;
}
function createFromString(str, opts) {
    return new SVGPath(createPathOptions(str, opts));
}
function extendFromString(str, defaultOpts) {
    var innerOpts = createPathOptions(str, defaultOpts);
    var Sub = (function (_super) {
        __extends(Sub, _super);
        function Sub(opts) {
            var _this = _super.call(this, opts) || this;
            _this.applyTransform = innerOpts.applyTransform;
            _this.buildPath = innerOpts.buildPath;
            return _this;
        }
        return Sub;
    }(SVGPath));
    return Sub;
}
function mergePath$1(pathEls, opts) {
    var pathList = [];
    var len = pathEls.length;
    for (var i = 0; i < len; i++) {
        var pathEl = pathEls[i];
        if (!pathEl.path) {
            pathEl.createPathProxy();
        }
        if (pathEl.shapeChanged()) {
            pathEl.buildPath(pathEl.path, pathEl.shape, true);
        }
        pathList.push(pathEl.path);
    }
    var pathBundle = new Path(opts);
    pathBundle.createPathProxy();
    pathBundle.buildPath = function (path) {
        if (isPathProxy(path)) {
            path.appendPath(pathList);
            var ctx = path.getContext();
            if (ctx) {
                path.rebuildPath(ctx, 1);
            }
        }
    };
    return pathBundle;
}

var Group = (function (_super) {
    __extends(Group, _super);
    function Group(opts) {
        var _this = _super.call(this) || this;
        _this.isGroup = true;
        _this._children = [];
        _this.attr(opts);
        return _this;
    }
    Group.prototype.childrenRef = function () {
        return this._children;
    };
    Group.prototype.children = function () {
        return this._children.slice();
    };
    Group.prototype.childAt = function (idx) {
        return this._children[idx];
    };
    Group.prototype.childOfName = function (name) {
        var children = this._children;
        for (var i = 0; i < children.length; i++) {
            if (children[i].name === name) {
                return children[i];
            }
        }
    };
    Group.prototype.childCount = function () {
        return this._children.length;
    };
    Group.prototype.add = function (child) {
        if (child) {
            if (child !== this && child.parent !== this) {
                this._children.push(child);
                this._doAdd(child);
            }
            if (child.__hostTarget) {
                throw 'This elemenet has been used as an attachment';
            }
        }
        return this;
    };
    Group.prototype.addBefore = function (child, nextSibling) {
        if (child && child !== this && child.parent !== this
            && nextSibling && nextSibling.parent === this) {
            var children = this._children;
            var idx = children.indexOf(nextSibling);
            if (idx >= 0) {
                children.splice(idx, 0, child);
                this._doAdd(child);
            }
        }
        return this;
    };
    Group.prototype.replaceAt = function (child, index) {
        var children = this._children;
        var old = children[index];
        if (child && child !== this && child.parent !== this && child !== old) {
            children[index] = child;
            old.parent = null;
            var zr = this.__zr;
            if (zr) {
                old.removeSelfFromZr(zr);
            }
            this._doAdd(child);
        }
        return this;
    };
    Group.prototype._doAdd = function (child) {
        if (child.parent) {
            child.parent.remove(child);
        }
        child.parent = this;
        var zr = this.__zr;
        if (zr && zr !== child.__zr) {
            child.addSelfToZr(zr);
        }
        zr && zr.refresh();
    };
    Group.prototype.remove = function (child) {
        var zr = this.__zr;
        var children = this._children;
        var idx = indexOf(children, child);
        if (idx < 0) {
            return this;
        }
        children.splice(idx, 1);
        child.parent = null;
        if (zr) {
            child.removeSelfFromZr(zr);
        }
        zr && zr.refresh();
        return this;
    };
    Group.prototype.removeAll = function () {
        var children = this._children;
        var zr = this.__zr;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (zr) {
                child.removeSelfFromZr(zr);
            }
            child.parent = null;
        }
        children.length = 0;
        return this;
    };
    Group.prototype.eachChild = function (cb, context) {
        var children = this._children;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            cb.call(context, child, i);
        }
        return this;
    };
    Group.prototype.traverse = function (cb, context) {
        for (var i = 0; i < this._children.length; i++) {
            var child = this._children[i];
            var stopped = cb.call(context, child);
            if (child.isGroup && !stopped) {
                child.traverse(cb, context);
            }
        }
        return this;
    };
    Group.prototype.addSelfToZr = function (zr) {
        _super.prototype.addSelfToZr.call(this, zr);
        for (var i = 0; i < this._children.length; i++) {
            var child = this._children[i];
            child.addSelfToZr(zr);
        }
    };
    Group.prototype.removeSelfFromZr = function (zr) {
        _super.prototype.removeSelfFromZr.call(this, zr);
        for (var i = 0; i < this._children.length; i++) {
            var child = this._children[i];
            child.removeSelfFromZr(zr);
        }
    };
    Group.prototype.getBoundingRect = function (includeChildren) {
        var tmpRect = new BoundingRect(0, 0, 0, 0);
        var children = includeChildren || this._children;
        var tmpMat = [];
        var rect = null;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.ignore || child.invisible) {
                continue;
            }
            var childRect = child.getBoundingRect();
            var transform = child.getLocalTransform(tmpMat);
            if (transform) {
                BoundingRect.applyTransform(tmpRect, childRect, transform);
                rect = rect || tmpRect.clone();
                rect.union(tmpRect);
            }
            else {
                rect = rect || childRect.clone();
                rect.union(childRect);
            }
        }
        return rect || tmpRect;
    };
    return Group;
}(Element));
Group.prototype.type = 'group';

var CircleShape = (function () {
    function CircleShape() {
        this.cx = 0;
        this.cy = 0;
        this.r = 0;
    }
    return CircleShape;
}());
var Circle = (function (_super) {
    __extends(Circle, _super);
    function Circle(opts) {
        return _super.call(this, opts) || this;
    }
    Circle.prototype.getDefaultShape = function () {
        return new CircleShape();
    };
    Circle.prototype.buildPath = function (ctx, shape, inBundle) {
        if (inBundle) {
            ctx.moveTo(shape.cx + shape.r, shape.cy);
        }
        ctx.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2);
    };
    return Circle;
}(Path));
Circle.prototype.type = 'circle';

var EllipseShape = (function () {
    function EllipseShape() {
        this.cx = 0;
        this.cy = 0;
        this.rx = 0;
        this.ry = 0;
    }
    return EllipseShape;
}());
var Ellipse = (function (_super) {
    __extends(Ellipse, _super);
    function Ellipse(opts) {
        return _super.call(this, opts) || this;
    }
    Ellipse.prototype.getDefaultShape = function () {
        return new EllipseShape();
    };
    Ellipse.prototype.buildPath = function (ctx, shape) {
        var k = 0.5522848;
        var x = shape.cx;
        var y = shape.cy;
        var a = shape.rx;
        var b = shape.ry;
        var ox = a * k;
        var oy = b * k;
        ctx.moveTo(x - a, y);
        ctx.bezierCurveTo(x - a, y - oy, x - ox, y - b, x, y - b);
        ctx.bezierCurveTo(x + ox, y - b, x + a, y - oy, x + a, y);
        ctx.bezierCurveTo(x + a, y + oy, x + ox, y + b, x, y + b);
        ctx.bezierCurveTo(x - ox, y + b, x - a, y + oy, x - a, y);
        ctx.closePath();
    };
    return Ellipse;
}(Path));
Ellipse.prototype.type = 'ellipse';

var PI = Math.PI;
var PI2 = PI * 2;
var mathSin = Math.sin;
var mathCos = Math.cos;
var mathACos = Math.acos;
var mathATan2 = Math.atan2;
var mathAbs = Math.abs;
var mathSqrt = Math.sqrt;
var mathMax$1 = Math.max;
var mathMin$1 = Math.min;
var e = 1e-4;
function intersect(x0, y0, x1, y1, x2, y2, x3, y3) {
    var x10 = x1 - x0;
    var y10 = y1 - y0;
    var x32 = x3 - x2;
    var y32 = y3 - y2;
    var t = y32 * x10 - x32 * y10;
    if (t * t < e) {
        return;
    }
    t = (x32 * (y0 - y2) - y32 * (x0 - x2)) / t;
    return [x0 + t * x10, y0 + t * y10];
}
function computeCornerTangents(x0, y0, x1, y1, radius, cr, clockwise) {
    var x01 = x0 - x1;
    var y01 = y0 - y1;
    var lo = (clockwise ? cr : -cr) / mathSqrt(x01 * x01 + y01 * y01);
    var ox = lo * y01;
    var oy = -lo * x01;
    var x11 = x0 + ox;
    var y11 = y0 + oy;
    var x10 = x1 + ox;
    var y10 = y1 + oy;
    var x00 = (x11 + x10) / 2;
    var y00 = (y11 + y10) / 2;
    var dx = x10 - x11;
    var dy = y10 - y11;
    var d2 = dx * dx + dy * dy;
    var r = radius - cr;
    var s = x11 * y10 - x10 * y11;
    var d = (dy < 0 ? -1 : 1) * mathSqrt(mathMax$1(0, r * r * d2 - s * s));
    var cx0 = (s * dy - dx * d) / d2;
    var cy0 = (-s * dx - dy * d) / d2;
    var cx1 = (s * dy + dx * d) / d2;
    var cy1 = (-s * dx + dy * d) / d2;
    var dx0 = cx0 - x00;
    var dy0 = cy0 - y00;
    var dx1 = cx1 - x00;
    var dy1 = cy1 - y00;
    if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) {
        cx0 = cx1;
        cy0 = cy1;
    }
    return {
        cx: cx0,
        cy: cy0,
        x01: -ox,
        y01: -oy,
        x11: cx0 * (radius / r - 1),
        y11: cy0 * (radius / r - 1)
    };
}
function buildPath$1(ctx, shape) {
    var radius = mathMax$1(shape.r, 0);
    var innerRadius = mathMax$1(shape.r0 || 0, 0);
    var hasRadius = radius > 0;
    var hasInnerRadius = innerRadius > 0;
    if (!hasRadius && !hasInnerRadius) {
        return;
    }
    if (!hasRadius) {
        radius = innerRadius;
        innerRadius = 0;
    }
    if (innerRadius > radius) {
        var tmp = radius;
        radius = innerRadius;
        innerRadius = tmp;
    }
    var clockwise = !!shape.clockwise;
    var startAngle = shape.startAngle;
    var endAngle = shape.endAngle;
    var arc;
    if (startAngle === endAngle) {
        arc = 0;
    }
    else {
        var tmpAngles = [startAngle, endAngle];
        normalizeArcAngles(tmpAngles, !clockwise);
        arc = mathAbs(tmpAngles[0] - tmpAngles[1]);
    }
    var x = shape.cx;
    var y = shape.cy;
    var cornerRadius = shape.cornerRadius || 0;
    var innerCornerRadius = shape.innerCornerRadius || 0;
    if (!(radius > e)) {
        ctx.moveTo(x, y);
    }
    else if (arc > PI2 - e) {
        ctx.moveTo(x + radius * mathCos(startAngle), y + radius * mathSin(startAngle));
        ctx.arc(x, y, radius, startAngle, endAngle, !clockwise);
        if (innerRadius > e) {
            ctx.moveTo(x + innerRadius * mathCos(endAngle), y + innerRadius * mathSin(endAngle));
            ctx.arc(x, y, innerRadius, endAngle, startAngle, clockwise);
        }
    }
    else {
        var halfRd = mathAbs(radius - innerRadius) / 2;
        var cr = mathMin$1(halfRd, cornerRadius);
        var icr = mathMin$1(halfRd, innerCornerRadius);
        var cr0 = icr;
        var cr1 = cr;
        var xrs = radius * mathCos(startAngle);
        var yrs = radius * mathSin(startAngle);
        var xire = innerRadius * mathCos(endAngle);
        var yire = innerRadius * mathSin(endAngle);
        var xre = void 0;
        var yre = void 0;
        var xirs = void 0;
        var yirs = void 0;
        if (cr > e || icr > e) {
            xre = radius * mathCos(endAngle);
            yre = radius * mathSin(endAngle);
            xirs = innerRadius * mathCos(startAngle);
            yirs = innerRadius * mathSin(startAngle);
            if (arc < PI) {
                var it_1 = intersect(xrs, yrs, xirs, yirs, xre, yre, xire, yire);
                if (it_1) {
                    var x0 = xrs - it_1[0];
                    var y0 = yrs - it_1[1];
                    var x1 = xre - it_1[0];
                    var y1 = yre - it_1[1];
                    var a = 1 / mathSin(mathACos((x0 * x1 + y0 * y1) / (mathSqrt(x0 * x0 + y0 * y0) * mathSqrt(x1 * x1 + y1 * y1))) / 2);
                    var b = mathSqrt(it_1[0] * it_1[0] + it_1[1] * it_1[1]);
                    cr0 = mathMin$1(icr, (innerRadius - b) / (a - 1));
                    cr1 = mathMin$1(cr, (radius - b) / (a + 1));
                }
            }
        }
        if (!(arc > e)) {
            ctx.moveTo(x + xrs, y + yrs);
        }
        else if (cr1 > e) {
            var ct0 = computeCornerTangents(xirs, yirs, xrs, yrs, radius, cr1, clockwise);
            var ct1 = computeCornerTangents(xre, yre, xire, yire, radius, cr1, clockwise);
            ctx.moveTo(x + ct0.cx + ct0.x01, y + ct0.cy + ct0.y01);
            if (cr1 < cr) {
                ctx.arc(x + ct0.cx, y + ct0.cy, cr1, mathATan2(ct0.y01, ct0.x01), mathATan2(ct1.y01, ct1.x01), !clockwise);
            }
            else {
                ctx.arc(x + ct0.cx, y + ct0.cy, cr1, mathATan2(ct0.y01, ct0.x01), mathATan2(ct0.y11, ct0.x11), !clockwise);
                ctx.arc(x, y, radius, mathATan2(ct0.cy + ct0.y11, ct0.cx + ct0.x11), mathATan2(ct1.cy + ct1.y11, ct1.cx + ct1.x11), !clockwise);
                ctx.arc(x + ct1.cx, y + ct1.cy, cr1, mathATan2(ct1.y11, ct1.x11), mathATan2(ct1.y01, ct1.x01), !clockwise);
            }
        }
        else {
            ctx.moveTo(x + xrs, y + yrs);
            ctx.arc(x, y, radius, startAngle, endAngle, !clockwise);
        }
        if (!(innerRadius > e) || !(arc > e)) {
            ctx.lineTo(x + xire, y + yire);
        }
        else if (cr0 > e) {
            var ct0 = computeCornerTangents(xire, yire, xre, yre, innerRadius, -cr0, clockwise);
            var ct1 = computeCornerTangents(xrs, yrs, xirs, yirs, innerRadius, -cr0, clockwise);
            ctx.lineTo(x + ct0.cx + ct0.x01, y + ct0.cy + ct0.y01);
            if (cr0 < icr) {
                ctx.arc(x + ct0.cx, y + ct0.cy, cr0, mathATan2(ct0.y01, ct0.x01), mathATan2(ct1.y01, ct1.x01), !clockwise);
            }
            else {
                ctx.arc(x + ct0.cx, y + ct0.cy, cr0, mathATan2(ct0.y01, ct0.x01), mathATan2(ct0.y11, ct0.x11), !clockwise);
                ctx.arc(x, y, innerRadius, mathATan2(ct0.cy + ct0.y11, ct0.cx + ct0.x11), mathATan2(ct1.cy + ct1.y11, ct1.cx + ct1.x11), clockwise);
                ctx.arc(x + ct1.cx, y + ct1.cy, cr0, mathATan2(ct1.y11, ct1.x11), mathATan2(ct1.y01, ct1.x01), !clockwise);
            }
        }
        else {
            ctx.lineTo(x + xire, y + yire);
            ctx.arc(x, y, innerRadius, endAngle, startAngle, clockwise);
        }
    }
    ctx.closePath();
}

var SectorShape = (function () {
    function SectorShape() {
        this.cx = 0;
        this.cy = 0;
        this.r0 = 0;
        this.r = 0;
        this.startAngle = 0;
        this.endAngle = Math.PI * 2;
        this.clockwise = true;
        this.cornerRadius = 0;
        this.innerCornerRadius = 0;
    }
    return SectorShape;
}());
var Sector = (function (_super) {
    __extends(Sector, _super);
    function Sector(opts) {
        return _super.call(this, opts) || this;
    }
    Sector.prototype.getDefaultShape = function () {
        return new SectorShape();
    };
    Sector.prototype.buildPath = function (ctx, shape) {
        buildPath$1(ctx, shape);
    };
    Sector.prototype.isZeroArea = function () {
        return this.shape.startAngle === this.shape.endAngle
            || this.shape.r === this.shape.r0;
    };
    return Sector;
}(Path));
Sector.prototype.type = 'sector';

var RingShape = (function () {
    function RingShape() {
        this.cx = 0;
        this.cy = 0;
        this.r = 0;
        this.r0 = 0;
    }
    return RingShape;
}());
var Ring = (function (_super) {
    __extends(Ring, _super);
    function Ring(opts) {
        return _super.call(this, opts) || this;
    }
    Ring.prototype.getDefaultShape = function () {
        return new RingShape();
    };
    Ring.prototype.buildPath = function (ctx, shape) {
        var x = shape.cx;
        var y = shape.cy;
        var PI2 = Math.PI * 2;
        ctx.moveTo(x + shape.r, y);
        ctx.arc(x, y, shape.r, 0, PI2, false);
        ctx.moveTo(x + shape.r0, y);
        ctx.arc(x, y, shape.r0, 0, PI2, true);
    };
    return Ring;
}(Path));
Ring.prototype.type = 'ring';

function interpolate(p0, p1, p2, p3, t, t2, t3) {
    var v0 = (p2 - p0) * 0.5;
    var v1 = (p3 - p1) * 0.5;
    return (2 * (p1 - p2) + v0 + v1) * t3
        + (-3 * (p1 - p2) - 2 * v0 - v1) * t2
        + v0 * t + p1;
}
function smoothSpline(points, isLoop) {
    var len = points.length;
    var ret = [];
    var distance$1 = 0;
    for (var i = 1; i < len; i++) {
        distance$1 += distance(points[i - 1], points[i]);
    }
    var segs = distance$1 / 2;
    segs = segs < len ? len : segs;
    for (var i = 0; i < segs; i++) {
        var pos = i / (segs - 1) * (isLoop ? len : len - 1);
        var idx = Math.floor(pos);
        var w = pos - idx;
        var p0 = void 0;
        var p1 = points[idx % len];
        var p2 = void 0;
        var p3 = void 0;
        if (!isLoop) {
            p0 = points[idx === 0 ? idx : idx - 1];
            p2 = points[idx > len - 2 ? len - 1 : idx + 1];
            p3 = points[idx > len - 3 ? len - 1 : idx + 2];
        }
        else {
            p0 = points[(idx - 1 + len) % len];
            p2 = points[(idx + 1) % len];
            p3 = points[(idx + 2) % len];
        }
        var w2 = w * w;
        var w3 = w * w2;
        ret.push([
            interpolate(p0[0], p1[0], p2[0], p3[0], w, w2, w3),
            interpolate(p0[1], p1[1], p2[1], p3[1], w, w2, w3)
        ]);
    }
    return ret;
}

function smoothBezier(points, smooth, isLoop, constraint) {
    var cps = [];
    var v = [];
    var v1 = [];
    var v2 = [];
    var prevPoint;
    var nextPoint;
    var min$1;
    var max$1;
    if (constraint) {
        min$1 = [Infinity, Infinity];
        max$1 = [-Infinity, -Infinity];
        for (var i = 0, len = points.length; i < len; i++) {
            min(min$1, min$1, points[i]);
            max(max$1, max$1, points[i]);
        }
        min(min$1, min$1, constraint[0]);
        max(max$1, max$1, constraint[1]);
    }
    for (var i = 0, len = points.length; i < len; i++) {
        var point = points[i];
        if (isLoop) {
            prevPoint = points[i ? i - 1 : len - 1];
            nextPoint = points[(i + 1) % len];
        }
        else {
            if (i === 0 || i === len - 1) {
                cps.push(clone(points[i]));
                continue;
            }
            else {
                prevPoint = points[i - 1];
                nextPoint = points[i + 1];
            }
        }
        sub(v, nextPoint, prevPoint);
        scale(v, v, smooth);
        var d0 = distance(point, prevPoint);
        var d1 = distance(point, nextPoint);
        var sum = d0 + d1;
        if (sum !== 0) {
            d0 /= sum;
            d1 /= sum;
        }
        scale(v1, v, -d0);
        scale(v2, v, d1);
        var cp0 = add([], point, v1);
        var cp1 = add([], point, v2);
        if (constraint) {
            max(cp0, cp0, min$1);
            min(cp0, cp0, max$1);
            max(cp1, cp1, min$1);
            min(cp1, cp1, max$1);
        }
        cps.push(cp0);
        cps.push(cp1);
    }
    if (isLoop) {
        cps.push(cps.shift());
    }
    return cps;
}

function buildPath(ctx, shape, closePath) {
    var smooth = shape.smooth;
    var points = shape.points;
    if (points && points.length >= 2) {
        if (smooth && smooth !== 'spline') {
            var controlPoints = smoothBezier(points, smooth, closePath, shape.smoothConstraint);
            ctx.moveTo(points[0][0], points[0][1]);
            var len = points.length;
            for (var i = 0; i < (closePath ? len : len - 1); i++) {
                var cp1 = controlPoints[i * 2];
                var cp2 = controlPoints[i * 2 + 1];
                var p = points[(i + 1) % len];
                ctx.bezierCurveTo(cp1[0], cp1[1], cp2[0], cp2[1], p[0], p[1]);
            }
        }
        else {
            if (smooth === 'spline') {
                points = smoothSpline(points, closePath);
            }
            ctx.moveTo(points[0][0], points[0][1]);
            for (var i = 1, l = points.length; i < l; i++) {
                ctx.lineTo(points[i][0], points[i][1]);
            }
        }
        closePath && ctx.closePath();
    }
}

var PolygonShape = (function () {
    function PolygonShape() {
        this.points = null;
        this.smooth = 0;
        this.smoothConstraint = null;
    }
    return PolygonShape;
}());
var Polygon = (function (_super) {
    __extends(Polygon, _super);
    function Polygon(opts) {
        return _super.call(this, opts) || this;
    }
    Polygon.prototype.getDefaultShape = function () {
        return new PolygonShape();
    };
    Polygon.prototype.buildPath = function (ctx, shape) {
        buildPath(ctx, shape, true);
    };
    return Polygon;
}(Path));
Polygon.prototype.type = 'polygon';

var PolylineShape = (function () {
    function PolylineShape() {
        this.points = null;
        this.percent = 1;
        this.smooth = 0;
        this.smoothConstraint = null;
    }
    return PolylineShape;
}());
var Polyline = (function (_super) {
    __extends(Polyline, _super);
    function Polyline(opts) {
        return _super.call(this, opts) || this;
    }
    Polyline.prototype.getDefaultStyle = function () {
        return {
            stroke: '#000',
            fill: null
        };
    };
    Polyline.prototype.getDefaultShape = function () {
        return new PolylineShape();
    };
    Polyline.prototype.buildPath = function (ctx, shape) {
        buildPath(ctx, shape, false);
    };
    return Polyline;
}(Path));
Polyline.prototype.type = 'polyline';

var subPixelOptimizeOutputShape = {};
var LineShape = (function () {
    function LineShape() {
        this.x1 = 0;
        this.y1 = 0;
        this.x2 = 0;
        this.y2 = 0;
        this.percent = 1;
    }
    return LineShape;
}());
var Line = (function (_super) {
    __extends(Line, _super);
    function Line(opts) {
        return _super.call(this, opts) || this;
    }
    Line.prototype.getDefaultStyle = function () {
        return {
            stroke: '#000',
            fill: null
        };
    };
    Line.prototype.getDefaultShape = function () {
        return new LineShape();
    };
    Line.prototype.buildPath = function (ctx, shape) {
        var x1;
        var y1;
        var x2;
        var y2;
        if (this.subPixelOptimize) {
            var optimizedShape = subPixelOptimizeLine$1(subPixelOptimizeOutputShape, shape, this.style);
            x1 = optimizedShape.x1;
            y1 = optimizedShape.y1;
            x2 = optimizedShape.x2;
            y2 = optimizedShape.y2;
        }
        else {
            x1 = shape.x1;
            y1 = shape.y1;
            x2 = shape.x2;
            y2 = shape.y2;
        }
        var percent = shape.percent;
        if (percent === 0) {
            return;
        }
        ctx.moveTo(x1, y1);
        if (percent < 1) {
            x2 = x1 * (1 - percent) + x2 * percent;
            y2 = y1 * (1 - percent) + y2 * percent;
        }
        ctx.lineTo(x2, y2);
    };
    Line.prototype.pointAt = function (p) {
        var shape = this.shape;
        return [
            shape.x1 * (1 - p) + shape.x2 * p,
            shape.y1 * (1 - p) + shape.y2 * p
        ];
    };
    return Line;
}(Path));
Line.prototype.type = 'line';

var out = [];
var BezierCurveShape = (function () {
    function BezierCurveShape() {
        this.x1 = 0;
        this.y1 = 0;
        this.x2 = 0;
        this.y2 = 0;
        this.cpx1 = 0;
        this.cpy1 = 0;
        this.percent = 1;
    }
    return BezierCurveShape;
}());
function someVectorAt(shape, t, isTangent) {
    var cpx2 = shape.cpx2;
    var cpy2 = shape.cpy2;
    if (cpx2 === null || cpy2 === null) {
        return [
            (isTangent ? cubicDerivativeAt : cubicAt)(shape.x1, shape.cpx1, shape.cpx2, shape.x2, t),
            (isTangent ? cubicDerivativeAt : cubicAt)(shape.y1, shape.cpy1, shape.cpy2, shape.y2, t)
        ];
    }
    else {
        return [
            (isTangent ? quadraticDerivativeAt : quadraticAt)(shape.x1, shape.cpx1, shape.x2, t),
            (isTangent ? quadraticDerivativeAt : quadraticAt)(shape.y1, shape.cpy1, shape.y2, t)
        ];
    }
}
var BezierCurve = (function (_super) {
    __extends(BezierCurve, _super);
    function BezierCurve(opts) {
        return _super.call(this, opts) || this;
    }
    BezierCurve.prototype.getDefaultStyle = function () {
        return {
            stroke: '#000',
            fill: null
        };
    };
    BezierCurve.prototype.getDefaultShape = function () {
        return new BezierCurveShape();
    };
    BezierCurve.prototype.buildPath = function (ctx, shape) {
        var x1 = shape.x1;
        var y1 = shape.y1;
        var x2 = shape.x2;
        var y2 = shape.y2;
        var cpx1 = shape.cpx1;
        var cpy1 = shape.cpy1;
        var cpx2 = shape.cpx2;
        var cpy2 = shape.cpy2;
        var percent = shape.percent;
        if (percent === 0) {
            return;
        }
        ctx.moveTo(x1, y1);
        if (cpx2 == null || cpy2 == null) {
            if (percent < 1) {
                quadraticSubdivide(x1, cpx1, x2, percent, out);
                cpx1 = out[1];
                x2 = out[2];
                quadraticSubdivide(y1, cpy1, y2, percent, out);
                cpy1 = out[1];
                y2 = out[2];
            }
            ctx.quadraticCurveTo(cpx1, cpy1, x2, y2);
        }
        else {
            if (percent < 1) {
                cubicSubdivide(x1, cpx1, cpx2, x2, percent, out);
                cpx1 = out[1];
                cpx2 = out[2];
                x2 = out[3];
                cubicSubdivide(y1, cpy1, cpy2, y2, percent, out);
                cpy1 = out[1];
                cpy2 = out[2];
                y2 = out[3];
            }
            ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x2, y2);
        }
    };
    BezierCurve.prototype.pointAt = function (t) {
        return someVectorAt(this.shape, t, false);
    };
    BezierCurve.prototype.tangentAt = function (t) {
        var p = someVectorAt(this.shape, t, true);
        return normalize(p, p);
    };
    return BezierCurve;
}(Path));
BezierCurve.prototype.type = 'bezier-curve';

var ArcShape = (function () {
    function ArcShape() {
        this.cx = 0;
        this.cy = 0;
        this.r = 0;
        this.startAngle = 0;
        this.endAngle = Math.PI * 2;
        this.clockwise = true;
    }
    return ArcShape;
}());
var Arc = (function (_super) {
    __extends(Arc, _super);
    function Arc(opts) {
        return _super.call(this, opts) || this;
    }
    Arc.prototype.getDefaultStyle = function () {
        return {
            stroke: '#000',
            fill: null
        };
    };
    Arc.prototype.getDefaultShape = function () {
        return new ArcShape();
    };
    Arc.prototype.buildPath = function (ctx, shape) {
        var x = shape.cx;
        var y = shape.cy;
        var r = Math.max(shape.r, 0);
        var startAngle = shape.startAngle;
        var endAngle = shape.endAngle;
        var clockwise = shape.clockwise;
        var unitX = Math.cos(startAngle);
        var unitY = Math.sin(startAngle);
        ctx.moveTo(unitX * r + x, unitY * r + y);
        ctx.arc(x, y, r, startAngle, endAngle, !clockwise);
    };
    return Arc;
}(Path));
Arc.prototype.type = 'arc';

var CompoundPath = (function (_super) {
    __extends(CompoundPath, _super);
    function CompoundPath() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'compound';
        return _this;
    }
    CompoundPath.prototype._updatePathDirty = function () {
        var paths = this.shape.paths;
        var dirtyPath = this.shapeChanged();
        for (var i = 0; i < paths.length; i++) {
            dirtyPath = dirtyPath || paths[i].shapeChanged();
        }
        if (dirtyPath) {
            this.dirtyShape();
        }
    };
    CompoundPath.prototype.beforeBrush = function () {
        this._updatePathDirty();
        var paths = this.shape.paths || [];
        var scale = this.getGlobalScale();
        for (var i = 0; i < paths.length; i++) {
            if (!paths[i].path) {
                paths[i].createPathProxy();
            }
            paths[i].path.setScale(scale[0], scale[1], paths[i].segmentIgnoreThreshold);
        }
    };
    CompoundPath.prototype.buildPath = function (ctx, shape) {
        var paths = shape.paths || [];
        for (var i = 0; i < paths.length; i++) {
            paths[i].buildPath(ctx, paths[i].shape, true);
        }
    };
    CompoundPath.prototype.afterBrush = function () {
        var paths = this.shape.paths || [];
        for (var i = 0; i < paths.length; i++) {
            paths[i].pathUpdated();
        }
    };
    CompoundPath.prototype.getBoundingRect = function () {
        this._updatePathDirty.call(this);
        return Path.prototype.getBoundingRect.call(this);
    };
    return CompoundPath;
}(Path));

var Gradient = (function () {
    function Gradient(colorStops) {
        this.colorStops = colorStops || [];
    }
    Gradient.prototype.addColorStop = function (offset, color) {
        this.colorStops.push({
            offset: offset,
            color: color
        });
    };
    return Gradient;
}());

var LinearGradient = (function (_super) {
    __extends(LinearGradient, _super);
    function LinearGradient(x, y, x2, y2, colorStops, globalCoord) {
        var _this = _super.call(this, colorStops) || this;
        _this.x = x == null ? 0 : x;
        _this.y = y == null ? 0 : y;
        _this.x2 = x2 == null ? 1 : x2;
        _this.y2 = y2 == null ? 0 : y2;
        _this.type = 'linear';
        _this.global = globalCoord || false;
        return _this;
    }
    return LinearGradient;
}(Gradient));

var RadialGradient = (function (_super) {
    __extends(RadialGradient, _super);
    function RadialGradient(x, y, r, colorStops, globalCoord) {
        var _this = _super.call(this, colorStops) || this;
        _this.x = x == null ? 0.5 : x;
        _this.y = y == null ? 0.5 : y;
        _this.r = r == null ? 0.5 : r;
        _this.type = 'radial';
        _this.global = globalCoord || false;
        return _this;
    }
    return RadialGradient;
}(Gradient));

var extent = [0, 0];
var extent2 = [0, 0];
var minTv = new Point();
var maxTv = new Point();
var OrientedBoundingRect = (function () {
    function OrientedBoundingRect(rect, transform) {
        this._corners = [];
        this._axes = [];
        this._origin = [0, 0];
        for (var i = 0; i < 4; i++) {
            this._corners[i] = new Point();
        }
        for (var i = 0; i < 2; i++) {
            this._axes[i] = new Point();
        }
        if (rect) {
            this.fromBoundingRect(rect, transform);
        }
    }
    OrientedBoundingRect.prototype.fromBoundingRect = function (rect, transform) {
        var corners = this._corners;
        var axes = this._axes;
        var x = rect.x;
        var y = rect.y;
        var x2 = x + rect.width;
        var y2 = y + rect.height;
        corners[0].set(x, y);
        corners[1].set(x2, y);
        corners[2].set(x2, y2);
        corners[3].set(x, y2);
        if (transform) {
            for (var i = 0; i < 4; i++) {
                corners[i].transform(transform);
            }
        }
        Point.sub(axes[0], corners[1], corners[0]);
        Point.sub(axes[1], corners[3], corners[0]);
        axes[0].normalize();
        axes[1].normalize();
        for (var i = 0; i < 2; i++) {
            this._origin[i] = axes[i].dot(corners[0]);
        }
    };
    OrientedBoundingRect.prototype.intersect = function (other, mtv) {
        var overlapped = true;
        var noMtv = !mtv;
        minTv.set(Infinity, Infinity);
        maxTv.set(0, 0);
        if (!this._intersectCheckOneSide(this, other, minTv, maxTv, noMtv, 1)) {
            overlapped = false;
            if (noMtv) {
                return overlapped;
            }
        }
        if (!this._intersectCheckOneSide(other, this, minTv, maxTv, noMtv, -1)) {
            overlapped = false;
            if (noMtv) {
                return overlapped;
            }
        }
        if (!noMtv) {
            Point.copy(mtv, overlapped ? minTv : maxTv);
        }
        return overlapped;
    };
    OrientedBoundingRect.prototype._intersectCheckOneSide = function (self, other, minTv, maxTv, noMtv, inverse) {
        var overlapped = true;
        for (var i = 0; i < 2; i++) {
            var axis = this._axes[i];
            this._getProjMinMaxOnAxis(i, self._corners, extent);
            this._getProjMinMaxOnAxis(i, other._corners, extent2);
            if (extent[1] < extent2[0] || extent[0] > extent2[1]) {
                overlapped = false;
                if (noMtv) {
                    return overlapped;
                }
                var dist0 = Math.abs(extent2[0] - extent[1]);
                var dist1 = Math.abs(extent[0] - extent2[1]);
                if (Math.min(dist0, dist1) > maxTv.len()) {
                    if (dist0 < dist1) {
                        Point.scale(maxTv, axis, -dist0 * inverse);
                    }
                    else {
                        Point.scale(maxTv, axis, dist1 * inverse);
                    }
                }
            }
            else if (minTv) {
                var dist0 = Math.abs(extent2[0] - extent[1]);
                var dist1 = Math.abs(extent[0] - extent2[1]);
                if (Math.min(dist0, dist1) < minTv.len()) {
                    if (dist0 < dist1) {
                        Point.scale(minTv, axis, dist0 * inverse);
                    }
                    else {
                        Point.scale(minTv, axis, -dist1 * inverse);
                    }
                }
            }
        }
        return overlapped;
    };
    OrientedBoundingRect.prototype._getProjMinMaxOnAxis = function (dim, corners, out) {
        var axis = this._axes[dim];
        var origin = this._origin;
        var proj = corners[0].dot(axis) + origin[dim];
        var min = proj;
        var max = proj;
        for (var i = 1; i < corners.length; i++) {
            var proj_1 = corners[i].dot(axis) + origin[dim];
            min = Math.min(proj_1, min);
            max = Math.max(proj_1, max);
        }
        out[0] = min;
        out[1] = max;
    };
    return OrientedBoundingRect;
}());

var mathMax = Math.max;
var mathMin = Math.min;
var _customShapeMap = {};
/**
 * Extend shape with parameters
 */

function extendShape(opts) {
  return Path.extend(opts);
}
var extendPathFromString = extendFromString;
/**
 * Extend path
 */

function extendPath(pathData, opts) {
  return extendPathFromString(pathData, opts);
}
/**
 * Register a user defined shape.
 * The shape class can be fetched by `getShapeClass`
 * This method will overwrite the registered shapes, including
 * the registered built-in shapes, if using the same `name`.
 * The shape can be used in `custom series` and
 * `graphic component` by declaring `{type: name}`.
 *
 * @param name
 * @param ShapeClass Can be generated by `extendShape`.
 */

function registerShape(name, ShapeClass) {
  _customShapeMap[name] = ShapeClass;
}
/**
 * Find shape class registered by `registerShape`. Usually used in
 * fetching user defined shape.
 *
 * [Caution]:
 * (1) This method **MUST NOT be used inside echarts !!!**, unless it is prepared
 * to use user registered shapes.
 * Because the built-in shape (see `getBuiltInShape`) will be registered by
 * `registerShape` by default. That enables users to get both built-in
 * shapes as well as the shapes belonging to themsleves. But users can overwrite
 * the built-in shapes by using names like 'circle', 'rect' via calling
 * `registerShape`. So the echarts inner featrues should not fetch shapes from here
 * in case that it is overwritten by users, except that some features, like
 * `custom series`, `graphic component`, do it deliberately.
 *
 * (2) In the features like `custom series`, `graphic component`, the user input
 * `{tpye: 'xxx'}` does not only specify shapes but also specify other graphic
 * elements like `'group'`, `'text'`, `'image'` or event `'path'`. Those names
 * are reserved names, that is, if some user register a shape named `'image'`,
 * the shape will not be used. If we intending to add some more reserved names
 * in feature, that might bring break changes (disable some existing user shape
 * names). But that case probably rearly happen. So we dont make more mechanism
 * to resolve this issue here.
 *
 * @param name
 * @return The shape class. If not found, return nothing.
 */

function getShapeClass(name) {
  if (_customShapeMap.hasOwnProperty(name)) {
    return _customShapeMap[name];
  }
}
/**
 * Create a path element from path data string
 * @param pathData
 * @param opts
 * @param rect
 * @param layout 'center' or 'cover' default to be cover
 */

function makePath(pathData, opts, rect, layout) {
  var path = createFromString(pathData, opts);

  if (rect) {
    if (layout === 'center') {
      rect = centerGraphic(rect, path.getBoundingRect());
    }

    resizePath(path, rect);
  }

  return path;
}
/**
 * Create a image element from image url
 * @param imageUrl image url
 * @param opts options
 * @param rect constrain rect
 * @param layout 'center' or 'cover'. Default to be 'cover'
 */

function makeImage(imageUrl, rect, layout) {
  var zrImg = new ZRImage({
    style: {
      image: imageUrl,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    },
    onload: function (img) {
      if (layout === 'center') {
        var boundingRect = {
          width: img.width,
          height: img.height
        };
        zrImg.setStyle(centerGraphic(rect, boundingRect));
      }
    }
  });
  return zrImg;
}
/**
 * Get position of centered element in bounding box.
 *
 * @param  rect         element local bounding box
 * @param  boundingRect constraint bounding box
 * @return element position containing x, y, width, and height
 */

function centerGraphic(rect, boundingRect) {
  // Set rect to center, keep width / height ratio.
  var aspect = boundingRect.width / boundingRect.height;
  var width = rect.height * aspect;
  var height;

  if (width <= rect.width) {
    height = rect.height;
  } else {
    width = rect.width;
    height = width / aspect;
  }

  var cx = rect.x + rect.width / 2;
  var cy = rect.y + rect.height / 2;
  return {
    x: cx - width / 2,
    y: cy - height / 2,
    width: width,
    height: height
  };
}

var mergePath = mergePath$1;
/**
 * Resize a path to fit the rect
 * @param path
 * @param rect
 */

function resizePath(path, rect) {
  if (!path.applyTransform) {
    return;
  }

  var pathRect = path.getBoundingRect();
  var m = pathRect.calculateTransform(rect);
  path.applyTransform(m);
}
/**
 * Sub pixel optimize line for canvas
 */

function subPixelOptimizeLine(param) {
  subPixelOptimizeLine$1(param.shape, param.shape, param.style);
  return param;
}
/**
 * Sub pixel optimize rect for canvas
 */

function subPixelOptimizeRect(param) {
  subPixelOptimizeRect$1(param.shape, param.shape, param.style);
  return param;
}
/**
 * Sub pixel optimize for canvas
 *
 * @param position Coordinate, such as x, y
 * @param lineWidth Should be nonnegative integer.
 * @param positiveOrNegative Default false (negative).
 * @return Optimized position.
 */

var subPixelOptimize = subPixelOptimize$1;

function animateOrSetProps(animationType, el, props, animatableModel, dataIndex, cb, during) {
  var isFrom = false;
  var removeOpt;

  if (typeof dataIndex === 'function') {
    during = cb;
    cb = dataIndex;
    dataIndex = null;
  } else if (isObject(dataIndex)) {
    cb = dataIndex.cb;
    during = dataIndex.during;
    isFrom = dataIndex.isFrom;
    removeOpt = dataIndex.removeOpt;
    dataIndex = dataIndex.dataIndex;
  }

  var isUpdate = animationType === 'update';
  var isRemove = animationType === 'remove';
  var animationPayload; // Check if there is global animation configuration from dataZoom/resize can override the config in option.
  // If animation is enabled. Will use this animation config in payload.
  // If animation is disabled. Just ignore it.

  if (animatableModel && animatableModel.ecModel) {
    var updatePayload = animatableModel.ecModel.getUpdatePayload();
    animationPayload = updatePayload && updatePayload.animation;
  }

  var animationEnabled = animatableModel && animatableModel.isAnimationEnabled();

  if (!isRemove) {
    // Must stop the remove animation.
    el.stopAnimation('remove');
  }

  if (animationEnabled) {
    var duration = void 0;
    var animationEasing = void 0;
    var animationDelay = void 0;

    if (animationPayload) {
      duration = animationPayload.duration || 0;
      animationEasing = animationPayload.easing || 'cubicOut';
      animationDelay = animationPayload.delay || 0;
    } else if (isRemove) {
      removeOpt = removeOpt || {};
      duration = retrieve2(removeOpt.duration, 200);
      animationEasing = retrieve2(removeOpt.easing, 'cubicOut');
      animationDelay = 0;
    } else {
      duration = animatableModel.getShallow(isUpdate ? 'animationDurationUpdate' : 'animationDuration');
      animationEasing = animatableModel.getShallow(isUpdate ? 'animationEasingUpdate' : 'animationEasing');
      animationDelay = animatableModel.getShallow(isUpdate ? 'animationDelayUpdate' : 'animationDelay');
    }

    if (typeof animationDelay === 'function') {
      animationDelay = animationDelay(dataIndex, animatableModel.getAnimationDelayParams ? animatableModel.getAnimationDelayParams(el, dataIndex) : null);
    }

    if (typeof duration === 'function') {
      duration = duration(dataIndex);
    }

    duration > 0 ? isFrom ? el.animateFrom(props, {
      duration: duration,
      delay: animationDelay || 0,
      easing: animationEasing,
      done: cb,
      force: !!cb || !!during,
      scope: animationType,
      during: during
    }) : el.animateTo(props, {
      duration: duration,
      delay: animationDelay || 0,
      easing: animationEasing,
      done: cb,
      force: !!cb || !!during,
      setToFinal: true,
      scope: animationType,
      during: during
    }) : ( // FIXME:
    // If `duration` is 0, only the animation on props
    // can be stoped, other animation should be continued?
    // But at present using duration 0 in `animateTo`, `animateFrom`
    // might cause unexpected behavior.
    el.stopAnimation(), // If `isFrom`, the props is the "from" props.
    !isFrom && el.attr(props), cb && cb());
  } else {
    el.stopAnimation();
    !isFrom && el.attr(props); // Call during once.

    during && during(1);
    cb && cb();
  }
}
/**
 * Update graphic element properties with or without animation according to the
 * configuration in series.
 *
 * Caution: this method will stop previous animation.
 * So do not use this method to one element twice before
 * animation starts, unless you know what you are doing.
 * @example
 *     graphic.updateProps(el, {
 *         position: [100, 100]
 *     }, seriesModel, dataIndex, function () { console.log('Animation done!'); });
 *     // Or
 *     graphic.updateProps(el, {
 *         position: [100, 100]
 *     }, seriesModel, function () { console.log('Animation done!'); });
 */


function updateProps(el, props, // TODO: TYPE AnimatableModel
animatableModel, dataIndex, cb, during) {
  animateOrSetProps('update', el, props, animatableModel, dataIndex, cb, during);
}
/**
 * Init graphic element properties with or without animation according to the
 * configuration in series.
 *
 * Caution: this method will stop previous animation.
 * So do not use this method to one element twice before
 * animation starts, unless you know what you are doing.
 */

function initProps(el, props, animatableModel, dataIndex, cb, during) {
  animateOrSetProps('init', el, props, animatableModel, dataIndex, cb, during);
}
/**
 * Remove graphic element
 */

function removeElement(el, props, animatableModel, dataIndex, cb, during) {
  // Don't do remove animation twice.
  if (isElementRemoved(el)) {
    return;
  }

  animateOrSetProps('remove', el, props, animatableModel, dataIndex, cb, during);
}

function fadeOutDisplayable(el, animatableModel, dataIndex, done) {
  el.removeTextContent();
  el.removeTextGuideLine();
  removeElement(el, {
    style: {
      opacity: 0
    }
  }, animatableModel, dataIndex, done);
}

function removeElementWithFadeOut(el, animatableModel, dataIndex) {
  function doRemove() {
    el.parent && el.parent.remove(el);
  } // Hide label and labelLine first
  // TODO Also use fade out animation?


  if (!el.isGroup) {
    fadeOutDisplayable(el, animatableModel, dataIndex, doRemove);
  } else {
    el.traverse(function (disp) {
      if (!disp.isGroup) {
        // Can invoke doRemove multiple times.
        fadeOutDisplayable(disp, animatableModel, dataIndex, doRemove);
      }
    });
  }
}
/**
 * If element is removed.
 * It can determine if element is having remove animation.
 */

function isElementRemoved(el) {
  if (!el.__zr) {
    return true;
  }

  for (var i = 0; i < el.animators.length; i++) {
    var animator = el.animators[i];

    if (animator.scope === 'remove') {
      return true;
    }
  }

  return false;
}
/**
 * Get transform matrix of target (param target),
 * in coordinate of its ancestor (param ancestor)
 *
 * @param target
 * @param [ancestor]
 */

function getTransform(target, ancestor) {
  var mat = identity([]);

  while (target && target !== ancestor) {
    mul(mat, target.getLocalTransform(), mat);
    target = target.parent;
  }

  return mat;
}
/**
 * Apply transform to an vertex.
 * @param target [x, y]
 * @param transform Can be:
 *      + Transform matrix: like [1, 0, 0, 1, 0, 0]
 *      + {position, rotation, scale}, the same as `zrender/Transformable`.
 * @param invert Whether use invert matrix.
 * @return [x, y]
 */

function applyTransform(target, transform, invert$1) {
  if (transform && !isArrayLike(transform)) {
    transform = Transformable.getLocalTransform(transform);
  }

  if (invert$1) {
    transform = invert([], transform);
  }

  return applyTransform$1([], target, transform);
}
/**
 * @param direction 'left' 'right' 'top' 'bottom'
 * @param transform Transform matrix: like [1, 0, 0, 1, 0, 0]
 * @param invert Whether use invert matrix.
 * @return Transformed direction. 'left' 'right' 'top' 'bottom'
 */

function transformDirection(direction, transform, invert) {
  // Pick a base, ensure that transform result will not be (0, 0).
  var hBase = transform[4] === 0 || transform[5] === 0 || transform[0] === 0 ? 1 : Math.abs(2 * transform[4] / transform[0]);
  var vBase = transform[4] === 0 || transform[5] === 0 || transform[2] === 0 ? 1 : Math.abs(2 * transform[4] / transform[2]);
  var vertex = [direction === 'left' ? -hBase : direction === 'right' ? hBase : 0, direction === 'top' ? -vBase : direction === 'bottom' ? vBase : 0];
  vertex = applyTransform(vertex, transform, invert);
  return Math.abs(vertex[0]) > Math.abs(vertex[1]) ? vertex[0] > 0 ? 'right' : 'left' : vertex[1] > 0 ? 'bottom' : 'top';
}

function isNotGroup(el) {
  return !el.isGroup;
}

function isPath(el) {
  return el.shape != null;
}
/**
 * Apply group transition animation from g1 to g2.
 * If no animatableModel, no animation.
 */


function groupTransition(g1, g2, animatableModel) {
  if (!g1 || !g2) {
    return;
  }

  function getElMap(g) {
    var elMap = {};
    g.traverse(function (el) {
      if (isNotGroup(el) && el.anid) {
        elMap[el.anid] = el;
      }
    });
    return elMap;
  }

  function getAnimatableProps(el) {
    var obj = {
      x: el.x,
      y: el.y,
      rotation: el.rotation
    };

    if (isPath(el)) {
      obj.shape = extend({}, el.shape);
    }

    return obj;
  }

  var elMap1 = getElMap(g1);
  g2.traverse(function (el) {
    if (isNotGroup(el) && el.anid) {
      var oldEl = elMap1[el.anid];

      if (oldEl) {
        var newProp = getAnimatableProps(el);
        el.attr(getAnimatableProps(oldEl));
        updateProps(el, newProp, animatableModel, getECData(el).dataIndex);
      }
    }
  });
}
function clipPointsByRect(points, rect) {
  // FIXME: this way migth be incorrect when grpahic clipped by a corner.
  // and when element have border.
  return map(points, function (point) {
    var x = point[0];
    x = mathMax(x, rect.x);
    x = mathMin(x, rect.x + rect.width);
    var y = point[1];
    y = mathMax(y, rect.y);
    y = mathMin(y, rect.y + rect.height);
    return [x, y];
  });
}
/**
 * Return a new clipped rect. If rect size are negative, return undefined.
 */

function clipRectByRect(targetRect, rect) {
  var x = mathMax(targetRect.x, rect.x);
  var x2 = mathMin(targetRect.x + targetRect.width, rect.x + rect.width);
  var y = mathMax(targetRect.y, rect.y);
  var y2 = mathMin(targetRect.y + targetRect.height, rect.y + rect.height); // If the total rect is cliped, nothing, including the border,
  // should be painted. So return undefined.

  if (x2 >= x && y2 >= y) {
    return {
      x: x,
      y: y,
      width: x2 - x,
      height: y2 - y
    };
  }
}
function createIcon(iconStr, // Support 'image://' or 'path://' or direct svg path.
opt, rect) {
  var innerOpts = extend({
    rectHover: true
  }, opt);
  var style = innerOpts.style = {
    strokeNoScale: true
  };
  rect = rect || {
    x: -1,
    y: -1,
    width: 2,
    height: 2
  };

  if (iconStr) {
    return iconStr.indexOf('image://') === 0 ? (style.image = iconStr.slice(8), defaults(style, rect), new ZRImage(innerOpts)) : makePath(iconStr.replace('path://', ''), innerOpts, rect, 'center');
  }
}
/**
 * Return `true` if the given line (line `a`) and the given polygon
 * are intersect.
 * Note that we do not count colinear as intersect here because no
 * requirement for that. We could do that if required in future.
 */

function linePolygonIntersect(a1x, a1y, a2x, a2y, points) {
  for (var i = 0, p2 = points[points.length - 1]; i < points.length; i++) {
    var p = points[i];

    if (lineLineIntersect(a1x, a1y, a2x, a2y, p[0], p[1], p2[0], p2[1])) {
      return true;
    }

    p2 = p;
  }
}
/**
 * Return `true` if the given two lines (line `a` and line `b`)
 * are intersect.
 * Note that we do not count colinear as intersect here because no
 * requirement for that. We could do that if required in future.
 */

function lineLineIntersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y) {
  // let `vec_m` to be `vec_a2 - vec_a1` and `vec_n` to be `vec_b2 - vec_b1`.
  var mx = a2x - a1x;
  var my = a2y - a1y;
  var nx = b2x - b1x;
  var ny = b2y - b1y; // `vec_m` and `vec_n` are parallel iff
  //     exising `k` such that `vec_m = k · vec_n`, equivalent to `vec_m X vec_n = 0`.

  var nmCrossProduct = crossProduct2d(nx, ny, mx, my);

  if (nearZero(nmCrossProduct)) {
    return false;
  } // `vec_m` and `vec_n` are intersect iff
  //     existing `p` and `q` in [0, 1] such that `vec_a1 + p * vec_m = vec_b1 + q * vec_n`,
  //     such that `q = ((vec_a1 - vec_b1) X vec_m) / (vec_n X vec_m)`
  //           and `p = ((vec_a1 - vec_b1) X vec_n) / (vec_n X vec_m)`.


  var b1a1x = a1x - b1x;
  var b1a1y = a1y - b1y;
  var q = crossProduct2d(b1a1x, b1a1y, mx, my) / nmCrossProduct;

  if (q < 0 || q > 1) {
    return false;
  }

  var p = crossProduct2d(b1a1x, b1a1y, nx, ny) / nmCrossProduct;

  if (p < 0 || p > 1) {
    return false;
  }

  return true;
}
/**
 * Cross product of 2-dimension vector.
 */

function crossProduct2d(x1, y1, x2, y2) {
  return x1 * y2 - x2 * y1;
}

function nearZero(val) {
  return val <= 1e-6 && val >= -1e-6;
} // Register built-in shapes. These shapes might be overwirtten
// by users, although we do not recommend that.


registerShape('circle', Circle);
registerShape('ellipse', Ellipse);
registerShape('sector', Sector);
registerShape('ring', Ring);
registerShape('polygon', Polygon);
registerShape('polyline', Polyline);
registerShape('rect', Rect);
registerShape('line', Line);
registerShape('bezierCurve', BezierCurve);
registerShape('arc', Arc);

var graphic = /*#__PURE__*/Object.freeze({
  __proto__: null,
  extendShape: extendShape,
  extendPath: extendPath,
  registerShape: registerShape,
  getShapeClass: getShapeClass,
  makePath: makePath,
  makeImage: makeImage,
  mergePath: mergePath,
  resizePath: resizePath,
  subPixelOptimizeLine: subPixelOptimizeLine,
  subPixelOptimizeRect: subPixelOptimizeRect,
  subPixelOptimize: subPixelOptimize,
  updateProps: updateProps,
  initProps: initProps,
  removeElement: removeElement,
  removeElementWithFadeOut: removeElementWithFadeOut,
  isElementRemoved: isElementRemoved,
  getTransform: getTransform,
  applyTransform: applyTransform,
  transformDirection: transformDirection,
  groupTransition: groupTransition,
  clipPointsByRect: clipPointsByRect,
  clipRectByRect: clipRectByRect,
  createIcon: createIcon,
  linePolygonIntersect: linePolygonIntersect,
  lineLineIntersect: lineLineIntersect,
  Group: Group,
  Image: ZRImage,
  Text: ZRText,
  Circle: Circle,
  Ellipse: Ellipse,
  Sector: Sector,
  Ring: Ring,
  Polygon: Polygon,
  Polyline: Polyline,
  Rect: Rect,
  Line: Line,
  BezierCurve: BezierCurve,
  Arc: Arc,
  IncrementalDisplayable: IncrementalDisplayable,
  CompoundPath: CompoundPath,
  LinearGradient: LinearGradient,
  RadialGradient: RadialGradient,
  BoundingRect: BoundingRect,
  OrientedBoundingRect: OrientedBoundingRect,
  Point: Point,
  Path: Path
});

var EMPTY_OBJ = {};
function setLabelText(label, labelTexts) {
  for (var i = 0; i < SPECIAL_STATES.length; i++) {
    var stateName = SPECIAL_STATES[i];
    var text = labelTexts[stateName];
    var state = label.ensureState(stateName);
    state.style = state.style || {};
    state.style.text = text;
  }

  var oldStates = label.currentStates.slice();
  label.clearStates(true);
  label.setStyle({
    text: labelTexts.normal
  });
  label.useStates(oldStates, true);
}

function getLabelText(opt, stateModels, interpolatedValue) {
  var labelFetcher = opt.labelFetcher;
  var labelDataIndex = opt.labelDataIndex;
  var labelDimIndex = opt.labelDimIndex;
  var normalModel = stateModels.normal;
  var baseText;

  if (labelFetcher) {
    baseText = labelFetcher.getFormattedLabel(labelDataIndex, 'normal', null, labelDimIndex, normalModel && normalModel.get('formatter'), interpolatedValue != null ? {
      interpolatedValue: interpolatedValue
    } : null);
  }

  if (baseText == null) {
    baseText = isFunction(opt.defaultText) ? opt.defaultText(labelDataIndex, opt, interpolatedValue) : opt.defaultText;
  }

  var statesText = {
    normal: baseText
  };

  for (var i = 0; i < SPECIAL_STATES.length; i++) {
    var stateName = SPECIAL_STATES[i];
    var stateModel = stateModels[stateName];
    statesText[stateName] = retrieve2(labelFetcher ? labelFetcher.getFormattedLabel(labelDataIndex, stateName, null, labelDimIndex, stateModel && stateModel.get('formatter')) : null, baseText);
  }

  return statesText;
}

function setLabelStyle(targetEl, labelStatesModels, opt, stateSpecified // TODO specified position?
) {
  opt = opt || EMPTY_OBJ;
  var isSetOnText = targetEl instanceof ZRText;
  var needsCreateText = false;

  for (var i = 0; i < DISPLAY_STATES.length; i++) {
    var stateModel = labelStatesModels[DISPLAY_STATES[i]];

    if (stateModel && stateModel.getShallow('show')) {
      needsCreateText = true;
      break;
    }
  }

  var textContent = isSetOnText ? targetEl : targetEl.getTextContent();

  if (needsCreateText) {
    if (!isSetOnText) {
      // Reuse the previous
      if (!textContent) {
        textContent = new ZRText();
        targetEl.setTextContent(textContent);
      } // Use same state proxy


      if (targetEl.stateProxy) {
        textContent.stateProxy = targetEl.stateProxy;
      }
    }

    var labelStatesTexts = getLabelText(opt, labelStatesModels);
    var normalModel = labelStatesModels.normal;
    var showNormal = !!normalModel.getShallow('show');
    var normalStyle = createTextStyle(normalModel, stateSpecified && stateSpecified.normal, opt, false, !isSetOnText);
    normalStyle.text = labelStatesTexts.normal;

    if (!isSetOnText) {
      // Always create new
      targetEl.setTextConfig(createTextConfig(normalModel, opt, false));
    }

    for (var i = 0; i < SPECIAL_STATES.length; i++) {
      var stateName = SPECIAL_STATES[i];
      var stateModel = labelStatesModels[stateName];

      if (stateModel) {
        var stateObj = textContent.ensureState(stateName);
        var stateShow = !!retrieve2(stateModel.getShallow('show'), showNormal);

        if (stateShow !== showNormal) {
          stateObj.ignore = !stateShow;
        }

        stateObj.style = createTextStyle(stateModel, stateSpecified && stateSpecified[stateName], opt, true, !isSetOnText);
        stateObj.style.text = labelStatesTexts[stateName];

        if (!isSetOnText) {
          var targetElEmphasisState = targetEl.ensureState(stateName);
          targetElEmphasisState.textConfig = createTextConfig(stateModel, opt, true);
        }
      }
    } // PENDING: if there is many requirements that emphasis position
    // need to be different from normal position, we might consider
    // auto slient is those cases.


    textContent.silent = !!normalModel.getShallow('silent'); // Keep x and y

    if (textContent.style.x != null) {
      normalStyle.x = textContent.style.x;
    }

    if (textContent.style.y != null) {
      normalStyle.y = textContent.style.y;
    }

    textContent.ignore = !showNormal; // Always create new style.

    textContent.useStyle(normalStyle);
    textContent.dirty();

    if (opt.enableTextSetter) {
      labelInner(textContent).setLabelText = function (interpolatedValue) {
        var labelStatesTexts = getLabelText(opt, labelStatesModels, interpolatedValue);
        setLabelText(textContent, labelStatesTexts);
      };
    }
  } else if (textContent) {
    // Not display rich text.
    textContent.ignore = true;
  }

  targetEl.dirty();
}
function getLabelStatesModels(itemModel, labelName) {
  labelName = labelName || 'label';
  var statesModels = {
    normal: itemModel.getModel(labelName)
  };

  for (var i = 0; i < SPECIAL_STATES.length; i++) {
    var stateName = SPECIAL_STATES[i];
    statesModels[stateName] = itemModel.getModel([stateName, labelName]);
  }

  return statesModels;
}
/**
 * Set basic textStyle properties.
 */

function createTextStyle(textStyleModel, specifiedTextStyle, // Fixed style in the code. Can't be set by model.
opt, isNotNormal, isAttached // If text is attached on an element. If so, auto color will handling in zrender.
) {
  var textStyle = {};
  setTextStyleCommon(textStyle, textStyleModel, opt, isNotNormal, isAttached);
  specifiedTextStyle && extend(textStyle, specifiedTextStyle); // textStyle.host && textStyle.host.dirty && textStyle.host.dirty(false);

  return textStyle;
}
function createTextConfig(textStyleModel, opt, isNotNormal) {
  opt = opt || {};
  var textConfig = {};
  var labelPosition;
  var labelRotate = textStyleModel.getShallow('rotate');
  var labelDistance = retrieve2(textStyleModel.getShallow('distance'), isNotNormal ? null : 5);
  var labelOffset = textStyleModel.getShallow('offset');
  labelPosition = textStyleModel.getShallow('position') || (isNotNormal ? null : 'inside'); // 'outside' is not a valid zr textPostion value, but used
  // in bar series, and magric type should be considered.

  labelPosition === 'outside' && (labelPosition = opt.defaultOutsidePosition || 'top');

  if (labelPosition != null) {
    textConfig.position = labelPosition;
  }

  if (labelOffset != null) {
    textConfig.offset = labelOffset;
  }

  if (labelRotate != null) {
    labelRotate *= Math.PI / 180;
    textConfig.rotation = labelRotate;
  }

  if (labelDistance != null) {
    textConfig.distance = labelDistance;
  } // fill and auto is determined by the color of path fill if it's not specified by developers.


  textConfig.outsideFill = textStyleModel.get('color') === 'inherit' ? opt.inheritColor || null : 'auto';
  return textConfig;
}
/**
 * The uniform entry of set text style, that is, retrieve style definitions
 * from `model` and set to `textStyle` object.
 *
 * Never in merge mode, but in overwrite mode, that is, all of the text style
 * properties will be set. (Consider the states of normal and emphasis and
 * default value can be adopted, merge would make the logic too complicated
 * to manage.)
 */

function setTextStyleCommon(textStyle, textStyleModel, opt, isNotNormal, isAttached) {
  // Consider there will be abnormal when merge hover style to normal style if given default value.
  opt = opt || EMPTY_OBJ;
  var ecModel = textStyleModel.ecModel;
  var globalTextStyle = ecModel && ecModel.option.textStyle; // Consider case:
  // {
  //     data: [{
  //         value: 12,
  //         label: {
  //             rich: {
  //                 // no 'a' here but using parent 'a'.
  //             }
  //         }
  //     }],
  //     rich: {
  //         a: { ... }
  //     }
  // }

  var richItemNames = getRichItemNames(textStyleModel);
  var richResult;

  if (richItemNames) {
    richResult = {};

    for (var name_1 in richItemNames) {
      if (richItemNames.hasOwnProperty(name_1)) {
        // Cascade is supported in rich.
        var richTextStyle = textStyleModel.getModel(['rich', name_1]); // In rich, never `disableBox`.
        // FIXME: consider `label: {formatter: '{a|xx}', color: 'blue', rich: {a: {}}}`,
        // the default color `'blue'` will not be adopted if no color declared in `rich`.
        // That might confuses users. So probably we should put `textStyleModel` as the
        // root ancestor of the `richTextStyle`. But that would be a break change.

        setTokenTextStyle(richResult[name_1] = {}, richTextStyle, globalTextStyle, opt, isNotNormal, isAttached, false, true);
      }
    }
  }

  if (richResult) {
    textStyle.rich = richResult;
  }

  var overflow = textStyleModel.get('overflow');

  if (overflow) {
    textStyle.overflow = overflow;
  }

  var margin = textStyleModel.get('minMargin');

  if (margin != null) {
    textStyle.margin = margin;
  }

  setTokenTextStyle(textStyle, textStyleModel, globalTextStyle, opt, isNotNormal, isAttached, true, false);
} // Consider case:
// {
//     data: [{
//         value: 12,
//         label: {
//             rich: {
//                 // no 'a' here but using parent 'a'.
//             }
//         }
//     }],
//     rich: {
//         a: { ... }
//     }
// }
// TODO TextStyleModel


function getRichItemNames(textStyleModel) {
  // Use object to remove duplicated names.
  var richItemNameMap;

  while (textStyleModel && textStyleModel !== textStyleModel.ecModel) {
    var rich = (textStyleModel.option || EMPTY_OBJ).rich;

    if (rich) {
      richItemNameMap = richItemNameMap || {};
      var richKeys = keys(rich);

      for (var i = 0; i < richKeys.length; i++) {
        var richKey = richKeys[i];
        richItemNameMap[richKey] = 1;
      }
    }

    textStyleModel = textStyleModel.parentModel;
  }

  return richItemNameMap;
}

var TEXT_PROPS_WITH_GLOBAL = ['fontStyle', 'fontWeight', 'fontSize', 'fontFamily', 'textShadowColor', 'textShadowBlur', 'textShadowOffsetX', 'textShadowOffsetY'];
var TEXT_PROPS_SELF = ['align', 'lineHeight', 'width', 'height', 'tag', 'verticalAlign'];
var TEXT_PROPS_BOX = ['padding', 'borderWidth', 'borderRadius', 'borderDashOffset', 'backgroundColor', 'borderColor', 'shadowColor', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'];

function setTokenTextStyle(textStyle, textStyleModel, globalTextStyle, opt, isNotNormal, isAttached, isBlock, inRich) {
  // In merge mode, default value should not be given.
  globalTextStyle = !isNotNormal && globalTextStyle || EMPTY_OBJ;
  var inheritColor = opt && opt.inheritColor;
  var fillColor = textStyleModel.getShallow('color');
  var strokeColor = textStyleModel.getShallow('textBorderColor');
  var opacity = retrieve2(textStyleModel.getShallow('opacity'), globalTextStyle.opacity);

  if (fillColor === 'inherit' || fillColor === 'auto') {

    if (inheritColor) {
      fillColor = inheritColor;
    } else {
      fillColor = null;
    }
  }

  if (strokeColor === 'inherit' || strokeColor === 'auto') {

    if (inheritColor) {
      strokeColor = inheritColor;
    } else {
      strokeColor = null;
    }
  }

  if (!isAttached) {
    // Only use default global textStyle.color if text is individual.
    // Otherwise it will use the strategy of attached text color because text may be on a path.
    fillColor = fillColor || globalTextStyle.color;
    strokeColor = strokeColor || globalTextStyle.textBorderColor;
  }

  if (fillColor != null) {
    textStyle.fill = fillColor;
  }

  if (strokeColor != null) {
    textStyle.stroke = strokeColor;
  }

  var textBorderWidth = retrieve2(textStyleModel.getShallow('textBorderWidth'), globalTextStyle.textBorderWidth);

  if (textBorderWidth != null) {
    textStyle.lineWidth = textBorderWidth;
  }

  var textBorderType = retrieve2(textStyleModel.getShallow('textBorderType'), globalTextStyle.textBorderType);

  if (textBorderType != null) {
    textStyle.lineDash = textBorderType;
  }

  var textBorderDashOffset = retrieve2(textStyleModel.getShallow('textBorderDashOffset'), globalTextStyle.textBorderDashOffset);

  if (textBorderDashOffset != null) {
    textStyle.lineDashOffset = textBorderDashOffset;
  }

  if (!isNotNormal && opacity == null && !inRich) {
    opacity = opt && opt.defaultOpacity;
  }

  if (opacity != null) {
    textStyle.opacity = opacity;
  } // TODO


  if (!isNotNormal && !isAttached) {
    // Set default finally.
    if (textStyle.fill == null && opt.inheritColor) {
      textStyle.fill = opt.inheritColor;
    }
  } // Do not use `getFont` here, because merge should be supported, where
  // part of these properties may be changed in emphasis style, and the
  // others should remain their original value got from normal style.


  for (var i = 0; i < TEXT_PROPS_WITH_GLOBAL.length; i++) {
    var key = TEXT_PROPS_WITH_GLOBAL[i];
    var val = retrieve2(textStyleModel.getShallow(key), globalTextStyle[key]);

    if (val != null) {
      textStyle[key] = val;
    }
  }

  for (var i = 0; i < TEXT_PROPS_SELF.length; i++) {
    var key = TEXT_PROPS_SELF[i];
    var val = textStyleModel.getShallow(key);

    if (val != null) {
      textStyle[key] = val;
    }
  }

  if (textStyle.verticalAlign == null) {
    var baseline = textStyleModel.getShallow('baseline');

    if (baseline != null) {
      textStyle.verticalAlign = baseline;
    }
  }

  if (!isBlock || !opt.disableBox) {
    for (var i = 0; i < TEXT_PROPS_BOX.length; i++) {
      var key = TEXT_PROPS_BOX[i];
      var val = textStyleModel.getShallow(key);

      if (val != null) {
        textStyle[key] = val;
      }
    }

    var borderType = textStyleModel.getShallow('borderType');

    if (borderType != null) {
      textStyle.borderDash = borderType;
    }

    if ((textStyle.backgroundColor === 'auto' || textStyle.backgroundColor === 'inherit') && inheritColor) {

      textStyle.backgroundColor = inheritColor;
    }

    if ((textStyle.borderColor === 'auto' || textStyle.borderColor === 'inherit') && inheritColor) {

      textStyle.borderColor = inheritColor;
    }
  }
}

function getFont(opt, ecModel) {
  var gTextStyleModel = ecModel && ecModel.getModel('textStyle');
  return trim([// FIXME in node-canvas fontWeight is before fontStyle
  opt.fontStyle || gTextStyleModel && gTextStyleModel.getShallow('fontStyle') || '', opt.fontWeight || gTextStyleModel && gTextStyleModel.getShallow('fontWeight') || '', (opt.fontSize || gTextStyleModel && gTextStyleModel.getShallow('fontSize') || 12) + 'px', opt.fontFamily || gTextStyleModel && gTextStyleModel.getShallow('fontFamily') || 'sans-serif'].join(' '));
}
var labelInner = makeInner();
function animateLabelValue(textEl, dataIndex, data, animatableModel, labelFetcher) {
  var labelInnerStore = labelInner(textEl);

  if (!labelInnerStore.valueAnimation) {
    return;
  }

  var defaultInterpolatedText = labelInnerStore.defaultInterpolatedText; // Consider the case that being animating, do not use the `obj.value`,
  // Otherwise it will jump to the `obj.value` when this new animation started.

  var currValue = retrieve2(labelInnerStore.interpolatedValue, labelInnerStore.prevValue);
  var targetValue = labelInnerStore.value;

  function during(percent) {
    var interpolated = interpolateRawValues(data, labelInnerStore.precision, currValue, targetValue, percent);
    labelInnerStore.interpolatedValue = percent === 1 ? null : interpolated;
    var labelText = getLabelText({
      labelDataIndex: dataIndex,
      labelFetcher: labelFetcher,
      defaultText: defaultInterpolatedText ? defaultInterpolatedText(interpolated) : interpolated + ''
    }, labelInnerStore.statesModels, interpolated);
    setLabelText(textEl, labelText);
  }

  (currValue == null ? initProps : updateProps)(textEl, {}, animatableModel, dataIndex, null, during);
}

var PATH_COLOR = ['textStyle', 'color']; // TODO Performance improvement?

var tmpRichText = new ZRText();

var TextStyleMixin =
/** @class */
function () {
  function TextStyleMixin() {}
  /**
   * Get color property or get color from option.textStyle.color
   */
  // TODO Callback


  TextStyleMixin.prototype.getTextColor = function (isEmphasis) {
    var ecModel = this.ecModel;
    return this.getShallow('color') || (!isEmphasis && ecModel ? ecModel.get(PATH_COLOR) : null);
  };
  /**
   * Create font string from fontStyle, fontWeight, fontSize, fontFamily
   * @return {string}
   */


  TextStyleMixin.prototype.getFont = function () {
    return getFont({
      fontStyle: this.getShallow('fontStyle'),
      fontWeight: this.getShallow('fontWeight'),
      fontSize: this.getShallow('fontSize'),
      fontFamily: this.getShallow('fontFamily')
    }, this.ecModel);
  };

  TextStyleMixin.prototype.getTextRect = function (text) {
    tmpRichText.useStyle({
      text: text,
      fontStyle: this.getShallow('fontStyle'),
      fontWeight: this.getShallow('fontWeight'),
      fontSize: this.getShallow('fontSize'),
      fontFamily: this.getShallow('fontFamily'),
      verticalAlign: this.getShallow('verticalAlign') || this.getShallow('baseline'),
      padding: this.getShallow('padding'),
      lineHeight: this.getShallow('lineHeight'),
      rich: this.getShallow('rich')
    });
    tmpRichText.update();
    return tmpRichText.getBoundingRect();
  };

  return TextStyleMixin;
}();

var LINE_STYLE_KEY_MAP = [['lineWidth', 'width'], ['stroke', 'color'], ['opacity'], ['shadowBlur'], ['shadowOffsetX'], ['shadowOffsetY'], ['shadowColor'], ['lineDash', 'type'], ['lineDashOffset', 'dashOffset'], ['lineCap', 'cap'], ['lineJoin', 'join'], ['miterLimit'] // Option decal is in `DecalObject` but style.decal is in `PatternObject`.
// So do not transfer decal directly.
];
var getLineStyle = makeStyleMapper(LINE_STYLE_KEY_MAP);

var LineStyleMixin =
/** @class */
function () {
  function LineStyleMixin() {}

  LineStyleMixin.prototype.getLineStyle = function (excludes) {
    return getLineStyle(this, excludes);
  };

  return LineStyleMixin;
}();

var ITEM_STYLE_KEY_MAP = [['fill', 'color'], ['stroke', 'borderColor'], ['lineWidth', 'borderWidth'], ['opacity'], ['shadowBlur'], ['shadowOffsetX'], ['shadowOffsetY'], ['shadowColor'], ['lineDash', 'borderType'], ['lineDashOffset', 'borderDashOffset'], ['lineCap', 'borderCap'], ['lineJoin', 'borderJoin'], ['miterLimit', 'borderMiterLimit'] // Option decal is in `DecalObject` but style.decal is in `PatternObject`.
// So do not transfer decal directly.
];
var getItemStyle = makeStyleMapper(ITEM_STYLE_KEY_MAP);

var ItemStyleMixin =
/** @class */
function () {
  function ItemStyleMixin() {}

  ItemStyleMixin.prototype.getItemStyle = function (excludes, includes) {
    return getItemStyle(this, excludes, includes);
  };

  return ItemStyleMixin;
}();

var Model =
/** @class */
function () {
  function Model(option, parentModel, ecModel) {
    this.parentModel = parentModel;
    this.ecModel = ecModel;
    this.option = option; // Simple optimization
    // if (this.init) {
    //     if (arguments.length <= 4) {
    //         this.init(option, parentModel, ecModel, extraOpt);
    //     }
    //     else {
    //         this.init.apply(this, arguments);
    //     }
    // }
  }

  Model.prototype.init = function (option, parentModel, ecModel) {
    var rest = [];

    for (var _i = 3; _i < arguments.length; _i++) {
      rest[_i - 3] = arguments[_i];
    }
  };
  /**
   * Merge the input option to me.
   */


  Model.prototype.mergeOption = function (option, ecModel) {
    merge(this.option, option, true);
  }; // `path` can be 'xxx.yyy.zzz', so the return value type have to be `ModelOption`
  // TODO: TYPE strict key check?
  // get(path: string | string[], ignoreParent?: boolean): ModelOption;


  Model.prototype.get = function (path, ignoreParent) {
    if (path == null) {
      return this.option;
    }

    return this._doGet(this.parsePath(path), !ignoreParent && this.parentModel);
  };

  Model.prototype.getShallow = function (key, ignoreParent) {
    var option = this.option;
    var val = option == null ? option : option[key];

    if (val == null && !ignoreParent) {
      var parentModel = this.parentModel;

      if (parentModel) {
        // FIXME:TS do not know how to make it works
        val = parentModel.getShallow(key);
      }
    }

    return val;
  }; // `path` can be 'xxx.yyy.zzz', so the return value type have to be `Model<ModelOption>`
  // getModel(path: string | string[], parentModel?: Model): Model;
  // TODO 'xxx.yyy.zzz' is deprecated


  Model.prototype.getModel = function (path, parentModel) {
    var hasPath = path != null;
    var pathFinal = hasPath ? this.parsePath(path) : null;
    var obj = hasPath ? this._doGet(pathFinal) : this.option;
    parentModel = parentModel || this.parentModel && this.parentModel.getModel(this.resolveParentPath(pathFinal));
    return new Model(obj, parentModel, this.ecModel);
  };
  /**
   * Squash option stack into one.
   * parentModel will be removed after squashed.
   *
   * NOTE: resolveParentPath will not be applied here for simplicity. DON'T use this function
   * if resolveParentPath is modified.
   *
   * @param deepMerge If do deep merge. Default to be false.
   */
  // squash(
  //     deepMerge?: boolean,
  //     handleCallback?: (func: () => object) => object
  // ) {
  //     const optionStack = [];
  //     let model: Model = this;
  //     while (model) {
  //         if (model.option) {
  //             optionStack.push(model.option);
  //         }
  //         model = model.parentModel;
  //     }
  //     const newOption = {} as Opt;
  //     let option;
  //     while (option = optionStack.pop()) {    // Top down merge
  //         if (isFunction(option) && handleCallback) {
  //             option = handleCallback(option);
  //         }
  //         if (deepMerge) {
  //             merge(newOption, option);
  //         }
  //         else {
  //             extend(newOption, option);
  //         }
  //     }
  //     // Remove parentModel
  //     this.option = newOption;
  //     this.parentModel = null;
  // }

  /**
   * If model has option
   */


  Model.prototype.isEmpty = function () {
    return this.option == null;
  };

  Model.prototype.restoreData = function () {}; // Pending


  Model.prototype.clone = function () {
    var Ctor = this.constructor;
    return new Ctor(clone$1(this.option));
  }; // setReadOnly(properties): void {
  // clazzUtil.setReadOnly(this, properties);
  // }
  // If path is null/undefined, return null/undefined.


  Model.prototype.parsePath = function (path) {
    if (typeof path === 'string') {
      return path.split('.');
    }

    return path;
  }; // Resolve path for parent. Perhaps useful when parent use a different property.
  // Default to be a identity resolver.
  // Can be modified to a different resolver.


  Model.prototype.resolveParentPath = function (path) {
    return path;
  }; // FIXME:TS check whether put this method here


  Model.prototype.isAnimationEnabled = function () {
    if (!env.node && this.option) {
      if (this.option.animation != null) {
        return !!this.option.animation;
      } else if (this.parentModel) {
        return this.parentModel.isAnimationEnabled();
      }
    }
  };

  Model.prototype._doGet = function (pathArr, parentModel) {
    var obj = this.option;

    if (!pathArr) {
      return obj;
    }

    for (var i = 0; i < pathArr.length; i++) {
      // Ignore empty
      if (!pathArr[i]) {
        continue;
      } // obj could be number/string/... (like 0)


      obj = obj && typeof obj === 'object' ? obj[pathArr[i]] : null;

      if (obj == null) {
        break;
      }
    }

    if (obj == null && parentModel) {
      obj = parentModel._doGet(this.resolveParentPath(pathArr), parentModel.parentModel);
    }

    return obj;
  };

  return Model;
}();

enableClassExtend(Model);
enableClassCheck(Model);
mixin(Model, LineStyleMixin);
mixin(Model, ItemStyleMixin);
mixin(Model, AreaStyleMixin);
mixin(Model, TextStyleMixin);

var VISUAL_DIMENSIONS = createHashMap(['tooltip', 'label', 'itemName', 'itemId', 'seriesName']);
var SOURCE_FORMAT_ORIGINAL = 'original';
var SOURCE_FORMAT_ARRAY_ROWS = 'arrayRows';
var SOURCE_FORMAT_OBJECT_ROWS = 'objectRows';
var SOURCE_FORMAT_KEYED_COLUMNS = 'keyedColumns';
var SOURCE_FORMAT_TYPED_ARRAY = 'typedArray';
var SOURCE_FORMAT_UNKNOWN = 'unknown';
var SERIES_LAYOUT_BY_COLUMN = 'column';
var SERIES_LAYOUT_BY_ROW = 'row';

var SourceImpl =
/** @class */
function () {
  // readonly frozen: boolean;
  function SourceImpl(fields) {
    this.data = fields.data || (fields.sourceFormat === SOURCE_FORMAT_KEYED_COLUMNS ? {} : []);
    this.sourceFormat = fields.sourceFormat || SOURCE_FORMAT_UNKNOWN; // Visit config

    this.seriesLayoutBy = fields.seriesLayoutBy || SERIES_LAYOUT_BY_COLUMN;
    this.startIndex = fields.startIndex || 0;
    this.dimensionsDefine = fields.dimensionsDefine;
    this.dimensionsDetectedCount = fields.dimensionsDetectedCount;
    this.encodeDefine = fields.encodeDefine;
    this.metaRawOption = fields.metaRawOption;
  }

  return SourceImpl;
}();

function isSourceInstance(val) {
  return val instanceof SourceImpl;
}
function createSource(sourceData, thisMetaRawOption, // can be null. If not provided, auto detect it from `sourceData`.
sourceFormat, encodeDefine // can be null
) {
  sourceFormat = sourceFormat || detectSourceFormat(sourceData);
  var seriesLayoutBy = thisMetaRawOption.seriesLayoutBy;
  var determined = determineSourceDimensions(sourceData, sourceFormat, seriesLayoutBy, thisMetaRawOption.sourceHeader, thisMetaRawOption.dimensions);
  var source = new SourceImpl({
    data: sourceData,
    sourceFormat: sourceFormat,
    seriesLayoutBy: seriesLayoutBy,
    dimensionsDefine: determined.dimensionsDefine,
    startIndex: determined.startIndex,
    dimensionsDetectedCount: determined.dimensionsDetectedCount,
    encodeDefine: makeEncodeDefine(encodeDefine),
    metaRawOption: clone$1(thisMetaRawOption)
  });
  return source;
}
/**
 * Wrap original series data for some compatibility cases.
 */

function createSourceFromSeriesDataOption(data) {
  return new SourceImpl({
    data: data,
    sourceFormat: isTypedArray(data) ? SOURCE_FORMAT_TYPED_ARRAY : SOURCE_FORMAT_ORIGINAL
  });
}
/**
 * Clone source but excludes source data.
 */

function cloneSourceShallow(source) {
  return new SourceImpl({
    data: source.data,
    sourceFormat: source.sourceFormat,
    seriesLayoutBy: source.seriesLayoutBy,
    dimensionsDefine: clone$1(source.dimensionsDefine),
    startIndex: source.startIndex,
    dimensionsDetectedCount: source.dimensionsDetectedCount,
    encodeDefine: makeEncodeDefine(source.encodeDefine)
  });
}

function makeEncodeDefine(encodeDefine) {
  // null means user not specify `series.encode`.
  return encodeDefine ? createHashMap(encodeDefine) : null;
}
/**
 * Note: An empty array will be detected as `SOURCE_FORMAT_ARRAY_ROWS`.
 */


function detectSourceFormat(data) {
  var sourceFormat = SOURCE_FORMAT_UNKNOWN;

  if (isTypedArray(data)) {
    sourceFormat = SOURCE_FORMAT_TYPED_ARRAY;
  } else if (isArray(data)) {
    // FIXME Whether tolerate null in top level array?
    if (data.length === 0) {
      sourceFormat = SOURCE_FORMAT_ARRAY_ROWS;
    }

    for (var i = 0, len = data.length; i < len; i++) {
      var item = data[i];

      if (item == null) {
        continue;
      } else if (isArray(item)) {
        sourceFormat = SOURCE_FORMAT_ARRAY_ROWS;
        break;
      } else if (isObject(item)) {
        sourceFormat = SOURCE_FORMAT_OBJECT_ROWS;
        break;
      }
    }
  } else if (isObject(data)) {
    for (var key in data) {
      if (hasOwn(data, key) && isArrayLike(data[key])) {
        sourceFormat = SOURCE_FORMAT_KEYED_COLUMNS;
        break;
      }
    }
  }

  return sourceFormat;
}
/**
 * Determine the source definitions from data standalone dimensions definitions
 * are not specified.
 */

function determineSourceDimensions(data, sourceFormat, seriesLayoutBy, sourceHeader, // standalone raw dimensions definition, like:
// {
//     dimensions: ['aa', 'bb', { name: 'cc', type: 'time' }]
// }
// in `dataset` or `series`
dimensionsDefine) {
  var dimensionsDetectedCount;
  var startIndex; // PEDING: could data be null/undefined here?
  // currently, if `dataset.source` not specified, error thrown.
  // if `series.data` not specified, nothing rendered without error thrown.
  // Should test these cases.

  if (!data) {
    return {
      dimensionsDefine: normalizeDimensionsOption(dimensionsDefine),
      startIndex: startIndex,
      dimensionsDetectedCount: dimensionsDetectedCount
    };
  }

  if (sourceFormat === SOURCE_FORMAT_ARRAY_ROWS) {
    var dataArrayRows = data; // Rule: Most of the first line are string: it is header.
    // Caution: consider a line with 5 string and 1 number,
    // it still can not be sure it is a head, because the
    // 5 string may be 5 values of category columns.

    if (sourceHeader === 'auto' || sourceHeader == null) {
      arrayRowsTravelFirst(function (val) {
        // '-' is regarded as null/undefined.
        if (val != null && val !== '-') {
          if (isString(val)) {
            startIndex == null && (startIndex = 1);
          } else {
            startIndex = 0;
          }
        } // 10 is an experience number, avoid long loop.

      }, seriesLayoutBy, dataArrayRows, 10);
    } else {
      startIndex = isNumber(sourceHeader) ? sourceHeader : sourceHeader ? 1 : 0;
    }

    if (!dimensionsDefine && startIndex === 1) {
      dimensionsDefine = [];
      arrayRowsTravelFirst(function (val, index) {
        dimensionsDefine[index] = val != null ? val + '' : '';
      }, seriesLayoutBy, dataArrayRows, Infinity);
    }

    dimensionsDetectedCount = dimensionsDefine ? dimensionsDefine.length : seriesLayoutBy === SERIES_LAYOUT_BY_ROW ? dataArrayRows.length : dataArrayRows[0] ? dataArrayRows[0].length : null;
  } else if (sourceFormat === SOURCE_FORMAT_OBJECT_ROWS) {
    if (!dimensionsDefine) {
      dimensionsDefine = objectRowsCollectDimensions(data);
    }
  } else if (sourceFormat === SOURCE_FORMAT_KEYED_COLUMNS) {
    if (!dimensionsDefine) {
      dimensionsDefine = [];
      each$1(data, function (colArr, key) {
        dimensionsDefine.push(key);
      });
    }
  } else if (sourceFormat === SOURCE_FORMAT_ORIGINAL) {
    var value0 = getDataItemValue(data[0]);
    dimensionsDetectedCount = isArray(value0) && value0.length || 1;
  } else ;

  return {
    startIndex: startIndex,
    dimensionsDefine: normalizeDimensionsOption(dimensionsDefine),
    dimensionsDetectedCount: dimensionsDetectedCount
  };
}

function objectRowsCollectDimensions(data) {
  var firstIndex = 0;
  var obj;

  while (firstIndex < data.length && !(obj = data[firstIndex++])) {} // jshint ignore: line


  if (obj) {
    var dimensions_1 = [];
    each$1(obj, function (value, key) {
      dimensions_1.push(key);
    });
    return dimensions_1;
  }
} // Consider dimensions defined like ['A', 'price', 'B', 'price', 'C', 'price'],
// which is reasonable. But dimension name is duplicated.
// Returns undefined or an array contains only object without null/undefiend or string.


function normalizeDimensionsOption(dimensionsDefine) {
  if (!dimensionsDefine) {
    // The meaning of null/undefined is different from empty array.
    return;
  }

  var nameMap = createHashMap();
  return map(dimensionsDefine, function (rawItem, index) {
    rawItem = isObject(rawItem) ? rawItem : {
      name: rawItem
    }; // Other fields will be discarded.

    var item = {
      name: rawItem.name,
      displayName: rawItem.displayName,
      type: rawItem.type
    }; // User can set null in dimensions.
    // We dont auto specify name, othewise a given name may
    // cause it be refered unexpectedly.

    if (item.name == null) {
      return item;
    } // Also consider number form like 2012.


    item.name += ''; // User may also specify displayName.
    // displayName will always exists except user not
    // specified or dim name is not specified or detected.
    // (A auto generated dim name will not be used as
    // displayName).

    if (item.displayName == null) {
      item.displayName = item.name;
    }

    var exist = nameMap.get(item.name);

    if (!exist) {
      nameMap.set(item.name, {
        count: 1
      });
    } else {
      item.name += '-' + exist.count++;
    }

    return item;
  });
}

function arrayRowsTravelFirst(cb, seriesLayoutBy, data, maxLoop) {
  if (seriesLayoutBy === SERIES_LAYOUT_BY_ROW) {
    for (var i = 0; i < data.length && i < maxLoop; i++) {
      cb(data[i] ? data[i][0] : null, i);
    }
  } else {
    var value0 = data[0] || [];

    for (var i = 0; i < value0.length && i < maxLoop; i++) {
      cb(value0[i], i);
    }
  }
}

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/


/**
 * AUTO-GENERATED FILE. DO NOT MODIFY.
 */

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var _a, _b, _c; // TODO
var providerMethods;
var mountMethods;
/**
 * If normal array used, mutable chunk size is supported.
 * If typed array used, chunk size must be fixed.
 */

var DefaultDataProvider =
/** @class */
function () {
  function DefaultDataProvider(sourceParam, dimSize) {
    // let source: Source;
    var source = !isSourceInstance(sourceParam) ? createSourceFromSeriesDataOption(sourceParam) : sourceParam; // declare source is Source;

    this._source = source;
    var data = this._data = source.data; // Typed array. TODO IE10+?

    if (source.sourceFormat === SOURCE_FORMAT_TYPED_ARRAY) {

      this._offset = 0;
      this._dimSize = dimSize;
      this._data = data;
    }

    mountMethods(this, data, source);
  }

  DefaultDataProvider.prototype.getSource = function () {
    return this._source;
  };

  DefaultDataProvider.prototype.count = function () {
    return 0;
  };

  DefaultDataProvider.prototype.getItem = function (idx, out) {
    return;
  };

  DefaultDataProvider.prototype.appendData = function (newData) {};

  DefaultDataProvider.prototype.clean = function () {};

  DefaultDataProvider.protoInitialize = function () {
    // PENDING: To avoid potential incompat (e.g., prototype
    // is visited somewhere), still init them on prototype.
    var proto = DefaultDataProvider.prototype;
    proto.pure = false;
    proto.persistent = true;
  }();

  DefaultDataProvider.internalField = function () {
    var _a;

    mountMethods = function (provider, data, source) {
      var sourceFormat = source.sourceFormat;
      var seriesLayoutBy = source.seriesLayoutBy;
      var startIndex = source.startIndex;
      var dimsDef = source.dimensionsDefine;
      var methods = providerMethods[getMethodMapKey(sourceFormat, seriesLayoutBy)];

      extend(provider, methods);

      if (sourceFormat === SOURCE_FORMAT_TYPED_ARRAY) {
        provider.getItem = getItemForTypedArray;
        provider.count = countForTypedArray;
        provider.fillStorage = fillStorageForTypedArray;
      } else {
        var rawItemGetter = getRawSourceItemGetter(sourceFormat, seriesLayoutBy);
        provider.getItem = bind(rawItemGetter, null, data, startIndex, dimsDef);
        var rawCounter = getRawSourceDataCounter(sourceFormat, seriesLayoutBy);
        provider.count = bind(rawCounter, null, data, startIndex, dimsDef);
      }
    };

    var getItemForTypedArray = function (idx, out) {
      idx = idx - this._offset;
      out = out || [];
      var data = this._data;
      var dimSize = this._dimSize;
      var offset = dimSize * idx;

      for (var i = 0; i < dimSize; i++) {
        out[i] = data[offset + i];
      }

      return out;
    };

    var fillStorageForTypedArray = function (start, end, storage, extent) {
      var data = this._data;
      var dimSize = this._dimSize;

      for (var dim = 0; dim < dimSize; dim++) {
        var dimExtent = extent[dim];
        var min = dimExtent[0] == null ? Infinity : dimExtent[0];
        var max = dimExtent[1] == null ? -Infinity : dimExtent[1];
        var count = end - start;
        var arr = storage[dim];

        for (var i = 0; i < count; i++) {
          // appendData with TypedArray will always do replace in provider.
          var val = data[i * dimSize + dim];
          arr[start + i] = val;
          val < min && (min = val);
          val > max && (max = val);
        }

        dimExtent[0] = min;
        dimExtent[1] = max;
      }
    };

    var countForTypedArray = function () {
      return this._data ? this._data.length / this._dimSize : 0;
    };

    providerMethods = (_a = {}, _a[SOURCE_FORMAT_ARRAY_ROWS + '_' + SERIES_LAYOUT_BY_COLUMN] = {
      pure: true,
      appendData: appendDataSimply
    }, _a[SOURCE_FORMAT_ARRAY_ROWS + '_' + SERIES_LAYOUT_BY_ROW] = {
      pure: true,
      appendData: function () {
        throw new Error('Do not support appendData when set seriesLayoutBy: "row".');
      }
    }, _a[SOURCE_FORMAT_OBJECT_ROWS] = {
      pure: true,
      appendData: appendDataSimply
    }, _a[SOURCE_FORMAT_KEYED_COLUMNS] = {
      pure: true,
      appendData: function (newData) {
        var data = this._data;
        each$1(newData, function (newCol, key) {
          var oldCol = data[key] || (data[key] = []);

          for (var i = 0; i < (newCol || []).length; i++) {
            oldCol.push(newCol[i]);
          }
        });
      }
    }, _a[SOURCE_FORMAT_ORIGINAL] = {
      appendData: appendDataSimply
    }, _a[SOURCE_FORMAT_TYPED_ARRAY] = {
      persistent: false,
      pure: true,
      appendData: function (newData) {

        this._data = newData;
      },
      // Clean self if data is already used.
      clean: function () {
        // PENDING
        this._offset += this.count();
        this._data = null;
      }
    }, _a);

    function appendDataSimply(newData) {
      for (var i = 0; i < newData.length; i++) {
        this._data.push(newData[i]);
      }
    }
  }();

  return DefaultDataProvider;
}();

var getItemSimply = function (rawData, startIndex, dimsDef, idx) {
  return rawData[idx];
};

var rawSourceItemGetterMap = (_a = {}, _a[SOURCE_FORMAT_ARRAY_ROWS + '_' + SERIES_LAYOUT_BY_COLUMN] = function (rawData, startIndex, dimsDef, idx) {
  return rawData[idx + startIndex];
}, _a[SOURCE_FORMAT_ARRAY_ROWS + '_' + SERIES_LAYOUT_BY_ROW] = function (rawData, startIndex, dimsDef, idx) {
  idx += startIndex;
  var item = [];
  var data = rawData;

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    item.push(row ? row[idx] : null);
  }

  return item;
}, _a[SOURCE_FORMAT_OBJECT_ROWS] = getItemSimply, _a[SOURCE_FORMAT_KEYED_COLUMNS] = function (rawData, startIndex, dimsDef, idx) {
  var item = [];

  for (var i = 0; i < dimsDef.length; i++) {
    var dimName = dimsDef[i].name;

    var col = rawData[dimName];
    item.push(col ? col[idx] : null);
  }

  return item;
}, _a[SOURCE_FORMAT_ORIGINAL] = getItemSimply, _a);
function getRawSourceItemGetter(sourceFormat, seriesLayoutBy) {
  var method = rawSourceItemGetterMap[getMethodMapKey(sourceFormat, seriesLayoutBy)];

  return method;
}

var countSimply = function (rawData, startIndex, dimsDef) {
  return rawData.length;
};

var rawSourceDataCounterMap = (_b = {}, _b[SOURCE_FORMAT_ARRAY_ROWS + '_' + SERIES_LAYOUT_BY_COLUMN] = function (rawData, startIndex, dimsDef) {
  return Math.max(0, rawData.length - startIndex);
}, _b[SOURCE_FORMAT_ARRAY_ROWS + '_' + SERIES_LAYOUT_BY_ROW] = function (rawData, startIndex, dimsDef) {
  var row = rawData[0];
  return row ? Math.max(0, row.length - startIndex) : 0;
}, _b[SOURCE_FORMAT_OBJECT_ROWS] = countSimply, _b[SOURCE_FORMAT_KEYED_COLUMNS] = function (rawData, startIndex, dimsDef) {
  var dimName = dimsDef[0].name;

  var col = rawData[dimName];
  return col ? col.length : 0;
}, _b[SOURCE_FORMAT_ORIGINAL] = countSimply, _b);
function getRawSourceDataCounter(sourceFormat, seriesLayoutBy) {
  var method = rawSourceDataCounterMap[getMethodMapKey(sourceFormat, seriesLayoutBy)];

  return method;
}

var getRawValueSimply = function (dataItem, dimIndex, dimName) {
  return dimIndex != null ? dataItem[dimIndex] : dataItem;
};

var rawSourceValueGetterMap = (_c = {}, _c[SOURCE_FORMAT_ARRAY_ROWS] = getRawValueSimply, _c[SOURCE_FORMAT_OBJECT_ROWS] = function (dataItem, dimIndex, dimName) {
  return dimIndex != null ? dataItem[dimName] : dataItem;
}, _c[SOURCE_FORMAT_KEYED_COLUMNS] = getRawValueSimply, _c[SOURCE_FORMAT_ORIGINAL] = function (dataItem, dimIndex, dimName) {
  // FIXME: In some case (markpoint in geo (geo-map.html)),
  // dataItem is {coord: [...]}
  var value = getDataItemValue(dataItem);
  return dimIndex == null || !(value instanceof Array) ? value : value[dimIndex];
}, _c[SOURCE_FORMAT_TYPED_ARRAY] = getRawValueSimply, _c);
function getRawSourceValueGetter(sourceFormat) {
  var method = rawSourceValueGetterMap[sourceFormat];

  return method;
}

function getMethodMapKey(sourceFormat, seriesLayoutBy) {
  return sourceFormat === SOURCE_FORMAT_ARRAY_ROWS ? sourceFormat + '_' + seriesLayoutBy : sourceFormat;
} // ??? FIXME can these logic be more neat: getRawValue, getRawDataItem,
// Consider persistent.
// Caution: why use raw value to display on label or tooltip?
// A reason is to avoid format. For example time value we do not know
// how to format is expected. More over, if stack is used, calculated
// value may be 0.91000000001, which have brings trouble to display.
// TODO: consider how to treat null/undefined/NaN when display?


function retrieveRawValue(data, dataIndex, dim // If dimIndex is null/undefined, return OptionDataItem.
// Otherwise, return OptionDataValue.
) {
  if (!data) {
    return;
  } // Consider data may be not persistent.


  var dataItem = data.getRawDataItem(dataIndex);

  if (dataItem == null) {
    return;
  }

  var sourceFormat = data.getProvider().getSource().sourceFormat;
  var dimName;
  var dimIndex;
  var dimInfo = data.getDimensionInfo(dim);

  if (dimInfo) {
    dimName = dimInfo.name;
    dimIndex = dimInfo.index;
  }

  return getRawSourceValueGetter(sourceFormat)(dataItem, dimIndex, dimName);
}

/**
 * Convert raw the value in to inner value in List.
 *
 * [Performance sensitive]
 *
 * [Caution]: this is the key logic of user value parser.
 * For backward compatibiliy, do not modify it until have to!
 */

function parseDataValue(value, // For high performance, do not omit the second param.
opt) {
  // Performance sensitive.
  var dimType = opt && opt.type;

  if (dimType === 'ordinal') {
    // If given value is a category string
    var ordinalMeta = opt && opt.ordinalMeta;
    return ordinalMeta ? ordinalMeta.parseAndCollect(value) : value;
  }

  if (dimType === 'time' // spead up when using timestamp
  && typeof value !== 'number' && value != null && value !== '-') {
    value = +parseDate(value);
  } // dimType defaults 'number'.
  // If dimType is not ordinal and value is null or undefined or NaN or '-',
  // parse to NaN.
  // number-like string (like ' 123 ') can be converted to a number.
  // where null/undefined or other string will be converted to NaN.


  return value == null || value === '' ? NaN // If string (like '-'), using '+' parse to NaN
  // If object, also parse to NaN
  : +value;
}
createHashMap({
  'number': function (val) {
    // Do not use `numericToNumber` here. We have by defualt `numericToNumber`.
    // Here the number parser can have loose rule:
    // enable to cut suffix: "120px" => 120, "14%" => 14.
    return parseFloat(val);
  },
  'time': function (val) {
    // return timestamp.
    return +parseDate(val);
  },
  'trim': function (val) {
    return typeof val === 'string' ? trim(val) : val;
  }
});

var SortOrderComparator =
/** @class */
function () {
  /**
   * @param order by defualt: 'asc'
   * @param incomparable by defualt: Always on the tail.
   *        That is, if 'asc' => 'max', if 'desc' => 'min'
   *        See the definition of "incomparable" in [SORT_COMPARISON_RULE]
   */
  function SortOrderComparator(order, incomparable) {
    var isDesc = order === 'desc';
    this._resultLT = isDesc ? 1 : -1;

    if (incomparable == null) {
      incomparable = isDesc ? 'min' : 'max';
    }

    this._incomparable = incomparable === 'min' ? -Infinity : Infinity;
  } // See [SORT_COMPARISON_RULE].
  // Performance sensitive.


  SortOrderComparator.prototype.evaluate = function (lval, rval) {
    // Most cases is 'number', and typeof maybe 10 times faseter than parseFloat.
    var lvalTypeof = typeof lval;
    var rvalTypeof = typeof rval;
    var lvalFloat = lvalTypeof === 'number' ? lval : numericToNumber(lval);
    var rvalFloat = rvalTypeof === 'number' ? rval : numericToNumber(rval);
    var lvalNotNumeric = isNaN(lvalFloat);
    var rvalNotNumeric = isNaN(rvalFloat);

    if (lvalNotNumeric) {
      lvalFloat = this._incomparable;
    }

    if (rvalNotNumeric) {
      rvalFloat = this._incomparable;
    }

    if (lvalNotNumeric && rvalNotNumeric) {
      var lvalIsStr = lvalTypeof === 'string';
      var rvalIsStr = rvalTypeof === 'string';

      if (lvalIsStr) {
        lvalFloat = rvalIsStr ? lval : 0;
      }

      if (rvalIsStr) {
        rvalFloat = lvalIsStr ? rval : 0;
      }
    }

    return lvalFloat < rvalFloat ? this._resultLT : lvalFloat > rvalFloat ? -this._resultLT : 0;
  };

  return SortOrderComparator;
}();

var BE_ORDINAL = {
  Must: 1,
  Might: 2,
  Not: 3 // Other cases

};
var innerGlobalModel = makeInner();
/**
 * MUST be called before mergeOption of all series.
 */

function resetSourceDefaulter(ecModel) {
  // `datasetMap` is used to make default encode.
  innerGlobalModel(ecModel).datasetMap = createHashMap();
}
/**
 * [The strategy of the arrengment of data dimensions for dataset]:
 * "value way": all axes are non-category axes. So series one by one take
 *     several (the number is coordSysDims.length) dimensions from dataset.
 *     The result of data arrengment of data dimensions like:
 *     | ser0_x | ser0_y | ser1_x | ser1_y | ser2_x | ser2_y |
 * "category way": at least one axis is category axis. So the the first data
 *     dimension is always mapped to the first category axis and shared by
 *     all of the series. The other data dimensions are taken by series like
 *     "value way" does.
 *     The result of data arrengment of data dimensions like:
 *     | ser_shared_x | ser0_y | ser1_y | ser2_y |
 *
 * @return encode Never be `null/undefined`.
 */

function makeSeriesEncodeForAxisCoordSys(coordDimensions, seriesModel, source) {
  var encode = {};
  var datasetModel = querySeriesUpstreamDatasetModel(seriesModel); // Currently only make default when using dataset, util more reqirements occur.

  if (!datasetModel || !coordDimensions) {
    return encode;
  }

  var encodeItemName = [];
  var encodeSeriesName = [];
  var ecModel = seriesModel.ecModel;
  var datasetMap = innerGlobalModel(ecModel).datasetMap;
  var key = datasetModel.uid + '_' + source.seriesLayoutBy;
  var baseCategoryDimIndex;
  var categoryWayValueDimStart;
  coordDimensions = coordDimensions.slice();
  each$1(coordDimensions, function (coordDimInfoLoose, coordDimIdx) {
    var coordDimInfo = isObject(coordDimInfoLoose) ? coordDimInfoLoose : coordDimensions[coordDimIdx] = {
      name: coordDimInfoLoose
    };

    if (coordDimInfo.type === 'ordinal' && baseCategoryDimIndex == null) {
      baseCategoryDimIndex = coordDimIdx;
      categoryWayValueDimStart = getDataDimCountOnCoordDim(coordDimInfo);
    }

    encode[coordDimInfo.name] = [];
  });
  var datasetRecord = datasetMap.get(key) || datasetMap.set(key, {
    categoryWayDim: categoryWayValueDimStart,
    valueWayDim: 0
  }); // TODO
  // Auto detect first time axis and do arrangement.

  each$1(coordDimensions, function (coordDimInfo, coordDimIdx) {
    var coordDimName = coordDimInfo.name;
    var count = getDataDimCountOnCoordDim(coordDimInfo); // In value way.

    if (baseCategoryDimIndex == null) {
      var start = datasetRecord.valueWayDim;
      pushDim(encode[coordDimName], start, count);
      pushDim(encodeSeriesName, start, count);
      datasetRecord.valueWayDim += count; // ??? TODO give a better default series name rule?
      // especially when encode x y specified.
      // consider: when mutiple series share one dimension
      // category axis, series name should better use
      // the other dimsion name. On the other hand, use
      // both dimensions name.
    } // In category way, the first category axis.
    else if (baseCategoryDimIndex === coordDimIdx) {
        pushDim(encode[coordDimName], 0, count);
        pushDim(encodeItemName, 0, count);
      } // In category way, the other axis.
      else {
          var start = datasetRecord.categoryWayDim;
          pushDim(encode[coordDimName], start, count);
          pushDim(encodeSeriesName, start, count);
          datasetRecord.categoryWayDim += count;
        }
  });

  function pushDim(dimIdxArr, idxFrom, idxCount) {
    for (var i = 0; i < idxCount; i++) {
      dimIdxArr.push(idxFrom + i);
    }
  }

  function getDataDimCountOnCoordDim(coordDimInfo) {
    var dimsDef = coordDimInfo.dimsDef;
    return dimsDef ? dimsDef.length : 1;
  }

  encodeItemName.length && (encode.itemName = encodeItemName);
  encodeSeriesName.length && (encode.seriesName = encodeSeriesName);
  return encode;
}
/**
 * @return If return null/undefined, indicate that should not use datasetModel.
 */

function querySeriesUpstreamDatasetModel(seriesModel) {
  // Caution: consider the scenario:
  // A dataset is declared and a series is not expected to use the dataset,
  // and at the beginning `setOption({series: { noData })` (just prepare other
  // option but no data), then `setOption({series: {data: [...]}); In this case,
  // the user should set an empty array to avoid that dataset is used by default.
  var thisData = seriesModel.get('data', true);

  if (!thisData) {
    return queryReferringComponents(seriesModel.ecModel, 'dataset', {
      index: seriesModel.get('datasetIndex', true),
      id: seriesModel.get('datasetId', true)
    }, SINGLE_REFERRING).models[0];
  }
}
/**
 * @return Always return an array event empty.
 */

function queryDatasetUpstreamDatasetModels(datasetModel) {
  // Only these attributes declared, we by defualt reference to `datasetIndex: 0`.
  // Otherwise, no reference.
  if (!datasetModel.get('transform', true) && !datasetModel.get('fromTransformResult', true)) {
    return [];
  }

  return queryReferringComponents(datasetModel.ecModel, 'dataset', {
    index: datasetModel.get('fromDatasetIndex', true),
    id: datasetModel.get('fromDatasetId', true)
  }, SINGLE_REFERRING).models;
}
/**
 * The rule should not be complex, otherwise user might not
 * be able to known where the data is wrong.
 * The code is ugly, but how to make it neat?
 */

function guessOrdinal(source, dimIndex) {
  return doGuessOrdinal(source.data, source.sourceFormat, source.seriesLayoutBy, source.dimensionsDefine, source.startIndex, dimIndex);
} // dimIndex may be overflow source data.
// return {BE_ORDINAL}

function doGuessOrdinal(data, sourceFormat, seriesLayoutBy, dimensionsDefine, startIndex, dimIndex) {
  var result; // Experience value.

  var maxLoop = 5;

  if (isTypedArray(data)) {
    return BE_ORDINAL.Not;
  } // When sourceType is 'objectRows' or 'keyedColumns', dimensionsDefine
  // always exists in source.


  var dimName;
  var dimType;

  if (dimensionsDefine) {
    var dimDefItem = dimensionsDefine[dimIndex];

    if (isObject(dimDefItem)) {
      dimName = dimDefItem.name;
      dimType = dimDefItem.type;
    } else if (isString(dimDefItem)) {
      dimName = dimDefItem;
    }
  }

  if (dimType != null) {
    return dimType === 'ordinal' ? BE_ORDINAL.Must : BE_ORDINAL.Not;
  }

  if (sourceFormat === SOURCE_FORMAT_ARRAY_ROWS) {
    var dataArrayRows = data;

    if (seriesLayoutBy === SERIES_LAYOUT_BY_ROW) {
      var sample = dataArrayRows[dimIndex];

      for (var i = 0; i < (sample || []).length && i < maxLoop; i++) {
        if ((result = detectValue(sample[startIndex + i])) != null) {
          return result;
        }
      }
    } else {
      for (var i = 0; i < dataArrayRows.length && i < maxLoop; i++) {
        var row = dataArrayRows[startIndex + i];

        if (row && (result = detectValue(row[dimIndex])) != null) {
          return result;
        }
      }
    }
  } else if (sourceFormat === SOURCE_FORMAT_OBJECT_ROWS) {
    var dataObjectRows = data;

    if (!dimName) {
      return BE_ORDINAL.Not;
    }

    for (var i = 0; i < dataObjectRows.length && i < maxLoop; i++) {
      var item = dataObjectRows[i];

      if (item && (result = detectValue(item[dimName])) != null) {
        return result;
      }
    }
  } else if (sourceFormat === SOURCE_FORMAT_KEYED_COLUMNS) {
    var dataKeyedColumns = data;

    if (!dimName) {
      return BE_ORDINAL.Not;
    }

    var sample = dataKeyedColumns[dimName];

    if (!sample || isTypedArray(sample)) {
      return BE_ORDINAL.Not;
    }

    for (var i = 0; i < sample.length && i < maxLoop; i++) {
      if ((result = detectValue(sample[i])) != null) {
        return result;
      }
    }
  } else if (sourceFormat === SOURCE_FORMAT_ORIGINAL) {
    var dataOriginal = data;

    for (var i = 0; i < dataOriginal.length && i < maxLoop; i++) {
      var item = dataOriginal[i];
      var val = getDataItemValue(item);

      if (!isArray(val)) {
        return BE_ORDINAL.Not;
      }

      if ((result = detectValue(val[dimIndex])) != null) {
        return result;
      }
    }
  }

  function detectValue(val) {
    var beStr = isString(val); // Consider usage convenience, '1', '2' will be treated as "number".
    // `isFinit('')` get `true`.

    if (val != null && isFinite(val) && val !== '') {
      return beStr ? BE_ORDINAL.Might : BE_ORDINAL.Not;
    } else if (beStr && val !== '-') {
      return BE_ORDINAL.Must;
    }
  }

  return BE_ORDINAL.Not;
}

var coordinateSystemCreators = {};

var CoordinateSystemManager =
/** @class */
function () {
  function CoordinateSystemManager() {
    this._coordinateSystems = [];
  }

  CoordinateSystemManager.prototype.create = function (ecModel, api) {
    var coordinateSystems = [];
    each$1(coordinateSystemCreators, function (creater, type) {
      var list = creater.create(ecModel, api);
      coordinateSystems = coordinateSystems.concat(list || []);
    });
    this._coordinateSystems = coordinateSystems;
  };

  CoordinateSystemManager.prototype.update = function (ecModel, api) {
    each$1(this._coordinateSystems, function (coordSys) {
      coordSys.update && coordSys.update(ecModel, api);
    });
  };

  CoordinateSystemManager.prototype.getCoordinateSystems = function () {
    return this._coordinateSystems.slice();
  };

  CoordinateSystemManager.register = function (type, creator) {
    coordinateSystemCreators[type] = creator;
  };

  CoordinateSystemManager.get = function (type) {
    return coordinateSystemCreators[type];
  };

  return CoordinateSystemManager;
}();

/**
 * Note that it is too complicated to support 3d stack by value
 * (have to create two-dimension inverted index), so in 3d case
 * we just support that stacked by index.
 *
 * @param seriesModel
 * @param dimensionInfoList The same as the input of <module:echarts/data/List>.
 *        The input dimensionInfoList will be modified.
 * @param opt
 * @param opt.stackedCoordDimension Specify a coord dimension if needed.
 * @param opt.byIndex=false
 * @return calculationInfo
 * {
 *     stackedDimension: string
 *     stackedByDimension: string
 *     isStackedByIndex: boolean
 *     stackedOverDimension: string
 *     stackResultDimension: string
 * }
 */

function enableDataStack(seriesModel, dimensionInfoList, opt) {
  opt = opt || {};
  var byIndex = opt.byIndex;
  var stackedCoordDimension = opt.stackedCoordDimension; // Compatibal: when `stack` is set as '', do not stack.

  var mayStack = !!(seriesModel && seriesModel.get('stack'));
  var stackedByDimInfo;
  var stackedDimInfo;
  var stackResultDimension;
  var stackedOverDimension;
  each$1(dimensionInfoList, function (dimensionInfo, index) {
    if (isString(dimensionInfo)) {
      dimensionInfoList[index] = dimensionInfo = {
        name: dimensionInfo
      };
    }

    if (mayStack && !dimensionInfo.isExtraCoord) {
      // Find the first ordinal dimension as the stackedByDimInfo.
      if (!byIndex && !stackedByDimInfo && dimensionInfo.ordinalMeta) {
        stackedByDimInfo = dimensionInfo;
      } // Find the first stackable dimension as the stackedDimInfo.


      if (!stackedDimInfo && dimensionInfo.type !== 'ordinal' && dimensionInfo.type !== 'time' && (!stackedCoordDimension || stackedCoordDimension === dimensionInfo.coordDim)) {
        stackedDimInfo = dimensionInfo;
      }
    }
  });

  if (stackedDimInfo && !byIndex && !stackedByDimInfo) {
    // Compatible with previous design, value axis (time axis) only stack by index.
    // It may make sense if the user provides elaborately constructed data.
    byIndex = true;
  } // Add stack dimension, they can be both calculated by coordinate system in `unionExtent`.
  // That put stack logic in List is for using conveniently in echarts extensions, but it
  // might not be a good way.


  if (stackedDimInfo) {
    // Use a weird name that not duplicated with other names.
    stackResultDimension = '__\0ecstackresult';
    stackedOverDimension = '__\0ecstackedover'; // Create inverted index to fast query index by value.

    if (stackedByDimInfo) {
      stackedByDimInfo.createInvertedIndices = true;
    }

    var stackedDimCoordDim_1 = stackedDimInfo.coordDim;
    var stackedDimType = stackedDimInfo.type;
    var stackedDimCoordIndex_1 = 0;
    each$1(dimensionInfoList, function (dimensionInfo) {
      if (dimensionInfo.coordDim === stackedDimCoordDim_1) {
        stackedDimCoordIndex_1++;
      }
    });
    dimensionInfoList.push({
      name: stackResultDimension,
      coordDim: stackedDimCoordDim_1,
      coordDimIndex: stackedDimCoordIndex_1,
      type: stackedDimType,
      isExtraCoord: true,
      isCalculationCoord: true
    });
    stackedDimCoordIndex_1++;
    dimensionInfoList.push({
      name: stackedOverDimension,
      // This dimension contains stack base (generally, 0), so do not set it as
      // `stackedDimCoordDim` to avoid extent calculation, consider log scale.
      coordDim: stackedOverDimension,
      coordDimIndex: stackedDimCoordIndex_1,
      type: stackedDimType,
      isExtraCoord: true,
      isCalculationCoord: true
    });
  }

  return {
    stackedDimension: stackedDimInfo && stackedDimInfo.name,
    stackedByDimension: stackedByDimInfo && stackedByDimInfo.name,
    isStackedByIndex: byIndex,
    stackedOverDimension: stackedOverDimension,
    stackResultDimension: stackResultDimension
  };
}
function isDimensionStacked(data, stackedDim
/*, stackedByDim*/
) {
  // Each single series only maps to one pair of axis. So we do not need to
  // check stackByDim, whatever stacked by a dimension or stacked by index.
  return !!stackedDim && stackedDim === data.getCalculationInfo('stackedDimension'); // && (
  //     stackedByDim != null
  //         ? stackedByDim === data.getCalculationInfo('stackedByDimension')
  //         : data.getCalculationInfo('isStackedByIndex')
  // );
}
function getStackedDimension(data, targetDim) {
  return isDimensionStacked(data, targetDim) ? data.getCalculationInfo('stackResultDimension') : targetDim;
}

var base = Math.round(Math.random() * 10);
/**
 * @public
 * @param {string} type
 * @return {string}
 */

function getUID(type) {
  // Considering the case of crossing js context,
  // use Math.random to make id as unique as possible.
  return [type || '', base++].join('_');
}
/**
 * Implements `SubTypeDefaulterManager` for `target`.
 */

function enableSubTypeDefaulter(target) {
  var subTypeDefaulters = {};

  target.registerSubTypeDefaulter = function (componentType, defaulter) {
    var componentTypeInfo = parseClassType(componentType);
    subTypeDefaulters[componentTypeInfo.main] = defaulter;
  };

  target.determineSubType = function (componentType, option) {
    var type = option.type;

    if (!type) {
      var componentTypeMain = parseClassType(componentType).main;

      if (target.hasSubTypes(componentType) && subTypeDefaulters[componentTypeMain]) {
        type = subTypeDefaulters[componentTypeMain](option);
      }
    }

    return type;
  };
}
/**
 * Implements `TopologicalTravelable<any>` for `entity`.
 *
 * Topological travel on Activity Network (Activity On Vertices).
 * Dependencies is defined in Model.prototype.dependencies, like ['xAxis', 'yAxis'].
 * If 'xAxis' or 'yAxis' is absent in componentTypeList, just ignore it in topology.
 * If there is circle dependencey, Error will be thrown.
 */

function enableTopologicalTravel(entity, dependencyGetter) {
  /**
   * @param targetNameList Target Component type list.
   *                       Can be ['aa', 'bb', 'aa.xx']
   * @param fullNameList By which we can build dependency graph.
   * @param callback Params: componentType, dependencies.
   * @param context Scope of callback.
   */
  entity.topologicalTravel = function (targetNameList, fullNameList, callback, context) {
    if (!targetNameList.length) {
      return;
    }

    var result = makeDepndencyGraph(fullNameList);
    var graph = result.graph;
    var noEntryList = result.noEntryList;
    var targetNameSet = {};
    each$1(targetNameList, function (name) {
      targetNameSet[name] = true;
    });

    while (noEntryList.length) {
      var currComponentType = noEntryList.pop();
      var currVertex = graph[currComponentType];
      var isInTargetNameSet = !!targetNameSet[currComponentType];

      if (isInTargetNameSet) {
        callback.call(context, currComponentType, currVertex.originalDeps.slice());
        delete targetNameSet[currComponentType];
      }

      each$1(currVertex.successor, isInTargetNameSet ? removeEdgeAndAdd : removeEdge);
    }

    each$1(targetNameSet, function () {
      var errMsg = '';

      throw new Error(errMsg);
    });

    function removeEdge(succComponentType) {
      graph[succComponentType].entryCount--;

      if (graph[succComponentType].entryCount === 0) {
        noEntryList.push(succComponentType);
      }
    } // Consider this case: legend depends on series, and we call
    // chart.setOption({series: [...]}), where only series is in option.
    // If we do not have 'removeEdgeAndAdd', legendModel.mergeOption will
    // not be called, but only sereis.mergeOption is called. Thus legend
    // have no chance to update its local record about series (like which
    // name of series is available in legend).


    function removeEdgeAndAdd(succComponentType) {
      targetNameSet[succComponentType] = true;
      removeEdge(succComponentType);
    }
  };

  function makeDepndencyGraph(fullNameList) {
    var graph = {};
    var noEntryList = [];
    each$1(fullNameList, function (name) {
      var thisItem = createDependencyGraphItem(graph, name);
      var originalDeps = thisItem.originalDeps = dependencyGetter(name);
      var availableDeps = getAvailableDependencies(originalDeps, fullNameList);
      thisItem.entryCount = availableDeps.length;

      if (thisItem.entryCount === 0) {
        noEntryList.push(name);
      }

      each$1(availableDeps, function (dependentName) {
        if (indexOf(thisItem.predecessor, dependentName) < 0) {
          thisItem.predecessor.push(dependentName);
        }

        var thatItem = createDependencyGraphItem(graph, dependentName);

        if (indexOf(thatItem.successor, dependentName) < 0) {
          thatItem.successor.push(name);
        }
      });
    });
    return {
      graph: graph,
      noEntryList: noEntryList
    };
  }

  function createDependencyGraphItem(graph, name) {
    if (!graph[name]) {
      graph[name] = {
        predecessor: [],
        successor: []
      };
    }

    return graph[name];
  }

  function getAvailableDependencies(originalDeps, fullNameList) {
    var availableDeps = [];
    each$1(originalDeps, function (dep) {
      indexOf(fullNameList, dep) >= 0 && availableDeps.push(dep);
    });
    return availableDeps;
  }
}
function inheritDefaultOption(superOption, subOption) {
  // See also `model/Component.ts#getDefaultOption`
  return merge(merge({}, superOption, true), subOption, true);
}

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/


/**
 * AUTO-GENERATED FILE. DO NOT MODIFY.
 */

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/**
 * Language: English.
 */
var langEN = {
  time: {
    month: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthAbbr: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dayOfWeekAbbr: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  },
  legend: {
    selector: {
      all: 'All',
      inverse: 'Inv'
    }
  },
  toolbox: {
    brush: {
      title: {
        rect: 'Box Select',
        polygon: 'Lasso Select',
        lineX: 'Horizontally Select',
        lineY: 'Vertically Select',
        keep: 'Keep Selections',
        clear: 'Clear Selections'
      }
    },
    dataView: {
      title: 'Data View',
      lang: ['Data View', 'Close', 'Refresh']
    },
    dataZoom: {
      title: {
        zoom: 'Zoom',
        back: 'Zoom Reset'
      }
    },
    magicType: {
      title: {
        line: 'Switch to Line Chart',
        bar: 'Switch to Bar Chart',
        stack: 'Stack',
        tiled: 'Tile'
      }
    },
    restore: {
      title: 'Restore'
    },
    saveAsImage: {
      title: 'Save as Image',
      lang: ['Right Click to Save Image']
    }
  },
  series: {
    typeNames: {
      pie: 'Pie chart',
      bar: 'Bar chart',
      line: 'Line chart',
      scatter: 'Scatter plot',
      effectScatter: 'Ripple scatter plot',
      radar: 'Radar chart',
      tree: 'Tree',
      treemap: 'Treemap',
      boxplot: 'Boxplot',
      candlestick: 'Candlestick',
      k: 'K line chart',
      heatmap: 'Heat map',
      map: 'Map',
      parallel: 'Parallel coordinate map',
      lines: 'Line graph',
      graph: 'Relationship graph',
      sankey: 'Sankey diagram',
      funnel: 'Funnel chart',
      gauge: 'Guage',
      pictorialBar: 'Pictorial bar',
      themeRiver: 'Theme River Map',
      sunburst: 'Sunburst'
    }
  },
  aria: {
    general: {
      withTitle: 'This is a chart about "{title}"',
      withoutTitle: 'This is a chart'
    },
    series: {
      single: {
        prefix: '',
        withName: ' with type {seriesType} named {seriesName}.',
        withoutName: ' with type {seriesType}.'
      },
      multiple: {
        prefix: '. It consists of {seriesCount} series count.',
        withName: ' The {seriesId} series is a {seriesType} representing {seriesName}.',
        withoutName: ' The {seriesId} series is a {seriesType}.',
        separator: {
          middle: '',
          end: ''
        }
      }
    },
    data: {
      allData: 'The data is as follows: ',
      partialData: 'The first {displayCnt} items are: ',
      withName: 'the data for {name} is {value}',
      withoutName: '{value}',
      separator: {
        middle: ', ',
        end: '. '
      }
    }
  }
};

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/


/**
 * AUTO-GENERATED FILE. DO NOT MODIFY.
 */

/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var langZH = {
  time: {
    month: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    monthAbbr: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    dayOfWeek: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    dayOfWeekAbbr: ['日', '一', '二', '三', '四', '五', '六']
  },
  legend: {
    selector: {
      all: '全选',
      inverse: '反选'
    }
  },
  toolbox: {
    brush: {
      title: {
        rect: '矩形选择',
        polygon: '圈选',
        lineX: '横向选择',
        lineY: '纵向选择',
        keep: '保持选择',
        clear: '清除选择'
      }
    },
    dataView: {
      title: '数据视图',
      lang: ['数据视图', '关闭', '刷新']
    },
    dataZoom: {
      title: {
        zoom: '区域缩放',
        back: '区域缩放还原'
      }
    },
    magicType: {
      title: {
        line: '切换为折线图',
        bar: '切换为柱状图',
        stack: '切换为堆叠',
        tiled: '切换为平铺'
      }
    },
    restore: {
      title: '还原'
    },
    saveAsImage: {
      title: '保存为图片',
      lang: ['右键另存为图片']
    }
  },
  series: {
    typeNames: {
      pie: '饼图',
      bar: '柱状图',
      line: '折线图',
      scatter: '散点图',
      effectScatter: '涟漪散点图',
      radar: '雷达图',
      tree: '树图',
      treemap: '矩形树图',
      boxplot: '箱型图',
      candlestick: 'K线图',
      k: 'K线图',
      heatmap: '热力图',
      map: '地图',
      parallel: '平行坐标图',
      lines: '线图',
      graph: '关系图',
      sankey: '桑基图',
      funnel: '漏斗图',
      gauge: '仪表盘图',
      pictorialBar: '象形柱图',
      themeRiver: '主题河流图',
      sunburst: '旭日图'
    }
  },
  aria: {
    general: {
      withTitle: '这是一个关于“{title}”的图表。',
      withoutTitle: '这是一个图表，'
    },
    series: {
      single: {
        prefix: '',
        withName: '图表类型是{seriesType}，表示{seriesName}。',
        withoutName: '图表类型是{seriesType}。'
      },
      multiple: {
        prefix: '它由{seriesCount}个图表系列组成。',
        withName: '第{seriesId}个系列是一个表示{seriesName}的{seriesType}，',
        withoutName: '第{seriesId}个系列是一个{seriesType}，',
        separator: {
          middle: '；',
          end: '。'
        }
      }
    },
    data: {
      allData: '其数据是——',
      partialData: '其中，前{displayCnt}项是——',
      withName: '{name}的数据是{value}',
      withoutName: '{value}',
      separator: {
        middle: '，',
        end: ''
      }
    }
  }
};

var LOCALE_ZH = 'ZH';
var LOCALE_EN = 'EN';
var DEFAULT_LOCALE = LOCALE_EN;
var localeStorage = {};
var localeModels = {};
var SYSTEM_LANG = !env.domSupported ? DEFAULT_LOCALE : function () {
  var langStr = (
  /* eslint-disable-next-line */
  document.documentElement.lang || navigator.language || navigator.browserLanguage).toUpperCase();
  return langStr.indexOf(LOCALE_ZH) > -1 ? LOCALE_ZH : DEFAULT_LOCALE;
}();
function registerLocale(locale, localeObj) {
  locale = locale.toUpperCase();
  localeModels[locale] = new Model(localeObj);
  localeStorage[locale] = localeObj;
} // export function getLocale(locale: string) {
//     return localeStorage[locale];
// }

function createLocaleObject(locale) {
  if (isString(locale)) {
    var localeObj = localeStorage[locale.toUpperCase()] || {};

    if (locale === LOCALE_ZH || locale === LOCALE_EN) {
      return clone$1(localeObj);
    } else {
      return merge(clone$1(localeObj), clone$1(localeStorage[DEFAULT_LOCALE]), false);
    }
  } else {
    return merge(clone$1(locale), clone$1(localeStorage[DEFAULT_LOCALE]), false);
  }
}
function getLocaleModel(lang) {
  return localeModels[lang];
}
function getDefaultLocaleModel() {
  return localeModels[DEFAULT_LOCALE];
} // Default locale

registerLocale(LOCALE_EN, langEN);
registerLocale(LOCALE_ZH, langZH);

var ONE_SECOND = 1000;
var ONE_MINUTE = ONE_SECOND * 60;
var ONE_HOUR = ONE_MINUTE * 60;
var ONE_DAY = ONE_HOUR * 24;
var ONE_YEAR = ONE_DAY * 365;
var defaultLeveledFormatter = {
  year: '{yyyy}',
  month: '{MMM}',
  day: '{d}',
  hour: '{HH}:{mm}',
  minute: '{HH}:{mm}',
  second: '{HH}:{mm}:{ss}',
  millisecond: '{hh}:{mm}:{ss} {SSS}',
  none: '{yyyy}-{MM}-{dd} {hh}:{mm}:{ss} {SSS}'
};
var fullDayFormatter = '{yyyy}-{MM}-{dd}';
var fullLeveledFormatter = {
  year: '{yyyy}',
  month: '{yyyy}-{MM}',
  day: fullDayFormatter,
  hour: fullDayFormatter + ' ' + defaultLeveledFormatter.hour,
  minute: fullDayFormatter + ' ' + defaultLeveledFormatter.minute,
  second: fullDayFormatter + ' ' + defaultLeveledFormatter.second,
  millisecond: defaultLeveledFormatter.none
};
var primaryTimeUnits = ['year', 'month', 'day', 'hour', 'minute', 'second', 'millisecond'];
var timeUnits = ['year', 'half-year', 'quarter', 'month', 'week', 'half-week', 'day', 'half-day', 'quarter-day', 'hour', 'minute', 'second', 'millisecond'];
function pad(str, len) {
  str += '';
  return '0000'.substr(0, len - str.length) + str;
}
function getPrimaryTimeUnit(timeUnit) {
  switch (timeUnit) {
    case 'half-year':
    case 'quarter':
      return 'month';

    case 'week':
    case 'half-week':
      return 'day';

    case 'half-day':
    case 'quarter-day':
      return 'hour';

    default:
      // year, minutes, second, milliseconds
      return timeUnit;
  }
}
function isPrimaryTimeUnit(timeUnit) {
  return timeUnit === getPrimaryTimeUnit(timeUnit);
}
function getDefaultFormatPrecisionOfInterval(timeUnit) {
  switch (timeUnit) {
    case 'year':
    case 'month':
      return 'day';

    case 'millisecond':
      return 'millisecond';

    default:
      // Also for day, hour, minute, second
      return 'second';
  }
}
function format( // Note: The result based on `isUTC` are totally different, which can not be just simply
// substituted by the result without `isUTC`. So we make the param `isUTC` mandatory.
time, template, isUTC, lang) {
  var date = parseDate(time);
  var y = date[fullYearGetterName(isUTC)]();
  var M = date[monthGetterName(isUTC)]() + 1;
  var q = Math.floor((M - 1) / 4) + 1;
  var d = date[dateGetterName(isUTC)]();
  var e = date['get' + (isUTC ? 'UTC' : '') + 'Day']();
  var H = date[hoursGetterName(isUTC)]();
  var h = (H - 1) % 12 + 1;
  var m = date[minutesGetterName(isUTC)]();
  var s = date[secondsGetterName(isUTC)]();
  var S = date[millisecondsGetterName(isUTC)]();
  var localeModel = lang instanceof Model ? lang : getLocaleModel(lang || SYSTEM_LANG) || getDefaultLocaleModel();
  var timeModel = localeModel.getModel('time');
  var month = timeModel.get('month');
  var monthAbbr = timeModel.get('monthAbbr');
  var dayOfWeek = timeModel.get('dayOfWeek');
  var dayOfWeekAbbr = timeModel.get('dayOfWeekAbbr');
  return (template || '').replace(/{yyyy}/g, y + '').replace(/{yy}/g, y % 100 + '').replace(/{Q}/g, q + '').replace(/{MMMM}/g, month[M - 1]).replace(/{MMM}/g, monthAbbr[M - 1]).replace(/{MM}/g, pad(M, 2)).replace(/{M}/g, M + '').replace(/{dd}/g, pad(d, 2)).replace(/{d}/g, d + '').replace(/{eeee}/g, dayOfWeek[e]).replace(/{ee}/g, dayOfWeekAbbr[e]).replace(/{e}/g, e + '').replace(/{HH}/g, pad(H, 2)).replace(/{H}/g, H + '').replace(/{hh}/g, pad(h + '', 2)).replace(/{h}/g, h + '').replace(/{mm}/g, pad(m, 2)).replace(/{m}/g, m + '').replace(/{ss}/g, pad(s, 2)).replace(/{s}/g, s + '').replace(/{SSS}/g, pad(S, 3)).replace(/{S}/g, S + '');
}
function leveledFormat(tick, idx, formatter, lang, isUTC) {
  var template = null;

  if (typeof formatter === 'string') {
    // Single formatter for all units at all levels
    template = formatter;
  } else if (typeof formatter === 'function') {
    // Callback formatter
    template = formatter(tick.value, idx, {
      level: tick.level
    });
  } else {
    var defaults$1 = extend({}, defaultLeveledFormatter);

    if (tick.level > 0) {
      for (var i = 0; i < primaryTimeUnits.length; ++i) {
        defaults$1[primaryTimeUnits[i]] = "{primary|" + defaults$1[primaryTimeUnits[i]] + "}";
      }
    }

    var mergedFormatter = formatter ? formatter.inherit === false ? formatter // Use formatter with bigger units
    : defaults(formatter, defaults$1) : defaults$1;
    var unit = getUnitFromValue(tick.value, isUTC);

    if (mergedFormatter[unit]) {
      template = mergedFormatter[unit];
    } else if (mergedFormatter.inherit) {
      // Unit formatter is not defined and should inherit from bigger units
      var targetId = timeUnits.indexOf(unit);

      for (var i = targetId - 1; i >= 0; --i) {
        if (mergedFormatter[unit]) {
          template = mergedFormatter[unit];
          break;
        }
      }

      template = template || defaults$1.none;
    }

    if (isArray(template)) {
      var levelId = tick.level == null ? 0 : tick.level >= 0 ? tick.level : template.length + tick.level;
      levelId = Math.min(levelId, template.length - 1);
      template = template[levelId];
    }
  }

  return format(new Date(tick.value), template, isUTC, lang);
}
function getUnitFromValue(value, isUTC) {
  var date = parseDate(value);
  var M = date[monthGetterName(isUTC)]() + 1;
  var d = date[dateGetterName(isUTC)]();
  var h = date[hoursGetterName(isUTC)]();
  var m = date[minutesGetterName(isUTC)]();
  var s = date[secondsGetterName(isUTC)]();
  var S = date[millisecondsGetterName(isUTC)]();
  var isSecond = S === 0;
  var isMinute = isSecond && s === 0;
  var isHour = isMinute && m === 0;
  var isDay = isHour && h === 0;
  var isMonth = isDay && d === 1;
  var isYear = isMonth && M === 1;

  if (isYear) {
    return 'year';
  } else if (isMonth) {
    return 'month';
  } else if (isDay) {
    return 'day';
  } else if (isHour) {
    return 'hour';
  } else if (isMinute) {
    return 'minute';
  } else if (isSecond) {
    return 'second';
  } else {
    return 'millisecond';
  }
}
function getUnitValue(value, unit, isUTC) {
  var date = typeof value === 'number' ? parseDate(value) : value;
  unit = unit || getUnitFromValue(value, isUTC);

  switch (unit) {
    case 'year':
      return date[fullYearGetterName(isUTC)]();

    case 'half-year':
      return date[monthGetterName(isUTC)]() >= 6 ? 1 : 0;

    case 'quarter':
      return Math.floor((date[monthGetterName(isUTC)]() + 1) / 4);

    case 'month':
      return date[monthGetterName(isUTC)]();

    case 'day':
      return date[dateGetterName(isUTC)]();

    case 'half-day':
      return date[hoursGetterName(isUTC)]() / 24;

    case 'hour':
      return date[hoursGetterName(isUTC)]();

    case 'minute':
      return date[minutesGetterName(isUTC)]();

    case 'second':
      return date[secondsGetterName(isUTC)]();

    case 'millisecond':
      return date[millisecondsGetterName(isUTC)]();
  }
}
function fullYearGetterName(isUTC) {
  return isUTC ? 'getUTCFullYear' : 'getFullYear';
}
function monthGetterName(isUTC) {
  return isUTC ? 'getUTCMonth' : 'getMonth';
}
function dateGetterName(isUTC) {
  return isUTC ? 'getUTCDate' : 'getDate';
}
function hoursGetterName(isUTC) {
  return isUTC ? 'getUTCHours' : 'getHours';
}
function minutesGetterName(isUTC) {
  return isUTC ? 'getUTCMinutes' : 'getMinutes';
}
function secondsGetterName(isUTC) {
  return isUTC ? 'getUTCSeconds' : 'getSeconds';
}
function millisecondsGetterName(isUTC) {
  return isUTC ? 'getUTCSeconds' : 'getSeconds';
}
function fullYearSetterName(isUTC) {
  return isUTC ? 'setUTCFullYear' : 'setFullYear';
}
function monthSetterName(isUTC) {
  return isUTC ? 'setUTCMonth' : 'setMonth';
}
function dateSetterName(isUTC) {
  return isUTC ? 'setUTCDate' : 'setDate';
}
function hoursSetterName(isUTC) {
  return isUTC ? 'setUTCHours' : 'setHours';
}
function minutesSetterName(isUTC) {
  return isUTC ? 'setUTCMinutes' : 'setMinutes';
}
function secondsSetterName(isUTC) {
  return isUTC ? 'setUTCSeconds' : 'setSeconds';
}
function millisecondsSetterName(isUTC) {
  return isUTC ? 'setUTCSeconds' : 'setSeconds';
}

/**
 * Add a comma each three digit.
 */

function addCommas(x) {
  if (!isNumeric(x)) {
    return isString(x) ? x : '-';
  }

  var parts = (x + '').split('.');
  return parts[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,') + (parts.length > 1 ? '.' + parts[1] : '');
}
function toCamelCase(str, upperCaseFirst) {
  str = (str || '').toLowerCase().replace(/-(.)/g, function (match, group1) {
    return group1.toUpperCase();
  });

  if (upperCaseFirst && str) {
    str = str.charAt(0).toUpperCase() + str.slice(1);
  }

  return str;
}
var normalizeCssArray = normalizeCssArray$1;
var replaceReg = /([&<>"'])/g;
var replaceMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;'
};
function encodeHTML(source) {
  return source == null ? '' : (source + '').replace(replaceReg, function (str, c) {
    return replaceMap[c];
  });
}
/**
 * Make value user readable for tooltip and label.
 * "User readable":
 *     Try to not print programmer-specific text like NaN, Infinity, null, undefined.
 *     Avoid to display an empty string, which users can not recognize there is
 *     a value and it might look like a bug.
 */

function makeValueReadable(value, valueType, useUTC) {
  var USER_READABLE_DEFUALT_TIME_PATTERN = 'yyyy-MM-dd hh:mm:ss';

  function stringToUserReadable(str) {
    return str && trim(str) ? str : '-';
  }

  function isNumberUserReadable(num) {
    return !!(num != null && !isNaN(num) && isFinite(num));
  }

  var isTypeTime = valueType === 'time';
  var isValueDate = value instanceof Date;

  if (isTypeTime || isValueDate) {
    var date = isTypeTime ? parseDate(value) : value;

    if (!isNaN(+date)) {
      return format(date, USER_READABLE_DEFUALT_TIME_PATTERN, useUTC);
    } else if (isValueDate) {
      return '-';
    } // In other cases, continue to try to display the value in the following code.

  }

  if (valueType === 'ordinal') {
    return isStringSafe(value) ? stringToUserReadable(value) : isNumber(value) ? isNumberUserReadable(value) ? value + '' : '-' : '-';
  } // By default.


  var numericResult = numericToNumber(value);
  return isNumberUserReadable(numericResult) ? addCommas(numericResult) : isStringSafe(value) ? stringToUserReadable(value) : '-';
}
var TPL_VAR_ALIAS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

var wrapVar = function (varName, seriesIdx) {
  return '{' + varName + (seriesIdx == null ? '' : seriesIdx) + '}';
};
/**
 * Template formatter
 * @param {Array.<Object>|Object} paramsList
 */


function formatTpl(tpl, paramsList, encode) {
  if (!isArray(paramsList)) {
    paramsList = [paramsList];
  }

  var seriesLen = paramsList.length;

  if (!seriesLen) {
    return '';
  }

  var $vars = paramsList[0].$vars || [];

  for (var i = 0; i < $vars.length; i++) {
    var alias = TPL_VAR_ALIAS[i];
    tpl = tpl.replace(wrapVar(alias), wrapVar(alias, 0));
  }

  for (var seriesIdx = 0; seriesIdx < seriesLen; seriesIdx++) {
    for (var k = 0; k < $vars.length; k++) {
      var val = paramsList[seriesIdx][$vars[k]];
      tpl = tpl.replace(wrapVar(TPL_VAR_ALIAS[k], seriesIdx), encode ? encodeHTML(val) : val);
    }
  }

  return tpl;
}
function getTooltipMarker(inOpt, extraCssText) {
  var opt = isString(inOpt) ? {
    color: inOpt,
    extraCssText: extraCssText
  } : inOpt || {};
  var color = opt.color;
  var type = opt.type;
  extraCssText = opt.extraCssText;
  var renderMode = opt.renderMode || 'html';

  if (!color) {
    return '';
  }

  if (renderMode === 'html') {
    return type === 'subItem' ? '<span style="display:inline-block;vertical-align:middle;margin-right:8px;margin-left:3px;' + 'border-radius:4px;width:4px;height:4px;background-color:' // Only support string
    + encodeHTML(color) + ';' + (extraCssText || '') + '"></span>' : '<span style="display:inline-block;margin-right:4px;' + 'border-radius:10px;width:10px;height:10px;background-color:' + encodeHTML(color) + ';' + (extraCssText || '') + '"></span>';
  } else {
    // Should better not to auto generate style name by auto-increment number here.
    // Because this util is usually called in tooltip formatter, which is probably
    // called repeatly when mouse move and the auto-increment number increases fast.
    // Users can make their own style name by theirselves, make it unique and readable.
    var markerId = opt.markerId || 'markerX';
    return {
      renderMode: renderMode,
      content: '{' + markerId + '|}  ',
      style: type === 'subItem' ? {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: color
      } : {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: color
      }
    };
  }
}
/**
 * @deprecated Use `time/format` instead.
 * ISO Date format
 * @param {string} tpl
 * @param {number} value
 * @param {boolean} [isUTC=false] Default in local time.
 *           see `module:echarts/scale/Time`
 *           and `module:echarts/util/number#parseDate`.
 * @inner
 */

function formatTime(tpl, value, isUTC) {

  if (tpl === 'week' || tpl === 'month' || tpl === 'quarter' || tpl === 'half-year' || tpl === 'year') {
    tpl = 'MM-dd\nyyyy';
  }

  var date = parseDate(value);
  var utc = isUTC ? 'UTC' : '';
  var y = date['get' + utc + 'FullYear']();
  var M = date['get' + utc + 'Month']() + 1;
  var d = date['get' + utc + 'Date']();
  var h = date['get' + utc + 'Hours']();
  var m = date['get' + utc + 'Minutes']();
  var s = date['get' + utc + 'Seconds']();
  var S = date['get' + utc + 'Milliseconds']();
  tpl = tpl.replace('MM', pad(M, 2)).replace('M', M).replace('yyyy', y).replace('yy', y % 100 + '').replace('dd', pad(d, 2)).replace('d', d).replace('hh', pad(h, 2)).replace('h', h).replace('mm', pad(m, 2)).replace('m', m).replace('ss', pad(s, 2)).replace('s', s).replace('SSS', pad(S, 3));
  return tpl;
}
/**
 * Capital first
 * @param {string} str
 * @return {string}
 */

function capitalFirst(str) {
  return str ? str.charAt(0).toUpperCase() + str.substr(1) : str;
}
/**
 * @return Never be null/undefined.
 */

function convertToColorString(color, defaultColor) {
  defaultColor = defaultColor || 'transparent';
  return isString(color) ? color : isObject(color) ? color.colorStops && (color.colorStops[0] || {}).color || defaultColor : defaultColor;
}
/**
 * open new tab
 * @param link url
 * @param target blank or self
 */

function windowOpen(link, target) {
  /* global window */
  if (target === '_blank' || target === 'blank') {
    var blank = window.open();
    blank.opener = null;
    blank.location.href = link;
  } else {
    window.open(link, target);
  }
}

var each = each$1;
/**
 * @public
 */

var LOCATION_PARAMS = ['left', 'right', 'top', 'bottom', 'width', 'height'];
/**
 * @public
 */

var HV_NAMES = [['width', 'left', 'right'], ['height', 'top', 'bottom']];

function boxLayout(orient, group, gap, maxWidth, maxHeight) {
  var x = 0;
  var y = 0;

  if (maxWidth == null) {
    maxWidth = Infinity;
  }

  if (maxHeight == null) {
    maxHeight = Infinity;
  }

  var currentLineMaxSize = 0;
  group.eachChild(function (child, idx) {
    var rect = child.getBoundingRect();
    var nextChild = group.childAt(idx + 1);
    var nextChildRect = nextChild && nextChild.getBoundingRect();
    var nextX;
    var nextY;

    if (orient === 'horizontal') {
      var moveX = rect.width + (nextChildRect ? -nextChildRect.x + rect.x : 0);
      nextX = x + moveX; // Wrap when width exceeds maxWidth or meet a `newline` group
      // FIXME compare before adding gap?

      if (nextX > maxWidth || child.newline) {
        x = 0;
        nextX = moveX;
        y += currentLineMaxSize + gap;
        currentLineMaxSize = rect.height;
      } else {
        // FIXME: consider rect.y is not `0`?
        currentLineMaxSize = Math.max(currentLineMaxSize, rect.height);
      }
    } else {
      var moveY = rect.height + (nextChildRect ? -nextChildRect.y + rect.y : 0);
      nextY = y + moveY; // Wrap when width exceeds maxHeight or meet a `newline` group

      if (nextY > maxHeight || child.newline) {
        x += currentLineMaxSize + gap;
        y = 0;
        nextY = moveY;
        currentLineMaxSize = rect.width;
      } else {
        currentLineMaxSize = Math.max(currentLineMaxSize, rect.width);
      }
    }

    if (child.newline) {
      return;
    }

    child.x = x;
    child.y = y;
    child.markRedraw();
    orient === 'horizontal' ? x = nextX + gap : y = nextY + gap;
  });
}
/**
 * VBox or HBox layouting
 * @param {string} orient
 * @param {module:zrender/graphic/Group} group
 * @param {number} gap
 * @param {number} [width=Infinity]
 * @param {number} [height=Infinity]
 */


var box = boxLayout;
/**
 * VBox layouting
 * @param {module:zrender/graphic/Group} group
 * @param {number} gap
 * @param {number} [width=Infinity]
 * @param {number} [height=Infinity]
 */

curry(boxLayout, 'vertical');
/**
 * HBox layouting
 * @param {module:zrender/graphic/Group} group
 * @param {number} gap
 * @param {number} [width=Infinity]
 * @param {number} [height=Infinity]
 */

curry(boxLayout, 'horizontal');
/**
 * Parse position info.
 */

function getLayoutRect(positionInfo, containerRect, margin) {
  margin = normalizeCssArray(margin || 0);
  var containerWidth = containerRect.width;
  var containerHeight = containerRect.height;
  var left = parsePercent(positionInfo.left, containerWidth);
  var top = parsePercent(positionInfo.top, containerHeight);
  var right = parsePercent(positionInfo.right, containerWidth);
  var bottom = parsePercent(positionInfo.bottom, containerHeight);
  var width = parsePercent(positionInfo.width, containerWidth);
  var height = parsePercent(positionInfo.height, containerHeight);
  var verticalMargin = margin[2] + margin[0];
  var horizontalMargin = margin[1] + margin[3];
  var aspect = positionInfo.aspect; // If width is not specified, calculate width from left and right

  if (isNaN(width)) {
    width = containerWidth - right - horizontalMargin - left;
  }

  if (isNaN(height)) {
    height = containerHeight - bottom - verticalMargin - top;
  }

  if (aspect != null) {
    // If width and height are not given
    // 1. Graph should not exceeds the container
    // 2. Aspect must be keeped
    // 3. Graph should take the space as more as possible
    // FIXME
    // Margin is not considered, because there is no case that both
    // using margin and aspect so far.
    if (isNaN(width) && isNaN(height)) {
      if (aspect > containerWidth / containerHeight) {
        width = containerWidth * 0.8;
      } else {
        height = containerHeight * 0.8;
      }
    } // Calculate width or height with given aspect


    if (isNaN(width)) {
      width = aspect * height;
    }

    if (isNaN(height)) {
      height = width / aspect;
    }
  } // If left is not specified, calculate left from right and width


  if (isNaN(left)) {
    left = containerWidth - right - width - horizontalMargin;
  }

  if (isNaN(top)) {
    top = containerHeight - bottom - height - verticalMargin;
  } // Align left and top


  switch (positionInfo.left || positionInfo.right) {
    case 'center':
      left = containerWidth / 2 - width / 2 - margin[3];
      break;

    case 'right':
      left = containerWidth - width - horizontalMargin;
      break;
  }

  switch (positionInfo.top || positionInfo.bottom) {
    case 'middle':
    case 'center':
      top = containerHeight / 2 - height / 2 - margin[0];
      break;

    case 'bottom':
      top = containerHeight - height - verticalMargin;
      break;
  } // If something is wrong and left, top, width, height are calculated as NaN


  left = left || 0;
  top = top || 0;

  if (isNaN(width)) {
    // Width may be NaN if only one value is given except width
    width = containerWidth - horizontalMargin - left - (right || 0);
  }

  if (isNaN(height)) {
    // Height may be NaN if only one value is given except height
    height = containerHeight - verticalMargin - top - (bottom || 0);
  }

  var rect = new BoundingRect(left + margin[3], top + margin[0], width, height);
  rect.margin = margin;
  return rect;
}
function fetchLayoutMode(ins) {
  var layoutMode = ins.layoutMode || ins.constructor.layoutMode;
  return isObject(layoutMode) ? layoutMode : layoutMode ? {
    type: layoutMode
  } : null;
}
/**
 * Consider Case:
 * When default option has {left: 0, width: 100}, and we set {right: 0}
 * through setOption or media query, using normal zrUtil.merge will cause
 * {right: 0} does not take effect.
 *
 * @example
 * ComponentModel.extend({
 *     init: function () {
 *         ...
 *         let inputPositionParams = layout.getLayoutParams(option);
 *         this.mergeOption(inputPositionParams);
 *     },
 *     mergeOption: function (newOption) {
 *         newOption && zrUtil.merge(thisOption, newOption, true);
 *         layout.mergeLayoutParam(thisOption, newOption);
 *     }
 * });
 *
 * @param targetOption
 * @param newOption
 * @param opt
 */

function mergeLayoutParam(targetOption, newOption, opt) {
  var ignoreSize = opt && opt.ignoreSize;
  !isArray(ignoreSize) && (ignoreSize = [ignoreSize, ignoreSize]);
  var hResult = merge(HV_NAMES[0], 0);
  var vResult = merge(HV_NAMES[1], 1);
  copy(HV_NAMES[0], targetOption, hResult);
  copy(HV_NAMES[1], targetOption, vResult);

  function merge(names, hvIdx) {
    var newParams = {};
    var newValueCount = 0;
    var merged = {};
    var mergedValueCount = 0;
    var enoughParamNumber = 2;
    each(names, function (name) {
      merged[name] = targetOption[name];
    });
    each(names, function (name) {
      // Consider case: newOption.width is null, which is
      // set by user for removing width setting.
      hasProp(newOption, name) && (newParams[name] = merged[name] = newOption[name]);
      hasValue(newParams, name) && newValueCount++;
      hasValue(merged, name) && mergedValueCount++;
    });

    if (ignoreSize[hvIdx]) {
      // Only one of left/right is premitted to exist.
      if (hasValue(newOption, names[1])) {
        merged[names[2]] = null;
      } else if (hasValue(newOption, names[2])) {
        merged[names[1]] = null;
      }

      return merged;
    } // Case: newOption: {width: ..., right: ...},
    // or targetOption: {right: ...} and newOption: {width: ...},
    // There is no conflict when merged only has params count
    // little than enoughParamNumber.


    if (mergedValueCount === enoughParamNumber || !newValueCount) {
      return merged;
    } // Case: newOption: {width: ..., right: ...},
    // Than we can make sure user only want those two, and ignore
    // all origin params in targetOption.
    else if (newValueCount >= enoughParamNumber) {
        return newParams;
      } else {
        // Chose another param from targetOption by priority.
        for (var i = 0; i < names.length; i++) {
          var name_1 = names[i];

          if (!hasProp(newParams, name_1) && hasProp(targetOption, name_1)) {
            newParams[name_1] = targetOption[name_1];
            break;
          }
        }

        return newParams;
      }
  }

  function hasProp(obj, name) {
    return obj.hasOwnProperty(name);
  }

  function hasValue(obj, name) {
    return obj[name] != null && obj[name] !== 'auto';
  }

  function copy(names, target, source) {
    each(names, function (name) {
      target[name] = source[name];
    });
  }
}
/**
 * Retrieve 'left', 'right', 'top', 'bottom', 'width', 'height' from object.
 */

function getLayoutParams(source) {
  return copyLayoutParams({}, source);
}
/**
 * Retrieve 'left', 'right', 'top', 'bottom', 'width', 'height' from object.
 * @param {Object} source
 * @return {Object} Result contains those props.
 */

function copyLayoutParams(target, source) {
  source && target && each(LOCATION_PARAMS, function (name) {
    source.hasOwnProperty(name) && (target[name] = source[name]);
  });
  return target;
}

var inner$2 = makeInner();

var ComponentModel =
/** @class */
function (_super) {
  __extends(ComponentModel, _super);

  function ComponentModel(option, parentModel, ecModel) {
    var _this = _super.call(this, option, parentModel, ecModel) || this;

    _this.uid = getUID('ec_cpt_model');
    return _this;
  }

  ComponentModel.prototype.init = function (option, parentModel, ecModel) {
    this.mergeDefaultAndTheme(option, ecModel);
  };

  ComponentModel.prototype.mergeDefaultAndTheme = function (option, ecModel) {
    var layoutMode = fetchLayoutMode(this);
    var inputPositionParams = layoutMode ? getLayoutParams(option) : {};
    var themeModel = ecModel.getTheme();
    merge(option, themeModel.get(this.mainType));
    merge(option, this.getDefaultOption());

    if (layoutMode) {
      mergeLayoutParam(option, inputPositionParams, layoutMode);
    }
  };

  ComponentModel.prototype.mergeOption = function (option, ecModel) {
    merge(this.option, option, true);
    var layoutMode = fetchLayoutMode(this);

    if (layoutMode) {
      mergeLayoutParam(this.option, option, layoutMode);
    }
  };
  /**
   * Called immediately after `init` or `mergeOption` of this instance called.
   */


  ComponentModel.prototype.optionUpdated = function (newCptOption, isInit) {};
  /**
   * [How to declare defaultOption]:
   *
   * (A) If using class declaration in typescript (since echarts 5):
   * ```ts
   * import {ComponentOption} from '../model/option';
   * export interface XxxOption extends ComponentOption {
   *     aaa: number
   * }
   * export class XxxModel extends Component {
   *     static type = 'xxx';
   *     static defaultOption: XxxOption = {
   *         aaa: 123
   *     }
   * }
   * Component.registerClass(XxxModel);
   * ```
   * ```ts
   * import {inheritDefaultOption} from '../util/component';
   * import {XxxModel, XxxOption} from './XxxModel';
   * export interface XxxSubOption extends XxxOption {
   *     bbb: number
   * }
   * class XxxSubModel extends XxxModel {
   *     static defaultOption: XxxSubOption = inheritDefaultOption(XxxModel.defaultOption, {
   *         bbb: 456
   *     })
   *     fn() {
   *         let opt = this.getDefaultOption();
   *         // opt is {aaa: 123, bbb: 456}
   *     }
   * }
   * ```
   *
   * (B) If using class extend (previous approach in echarts 3 & 4):
   * ```js
   * let XxxComponent = Component.extend({
   *     defaultOption: {
   *         xx: 123
   *     }
   * })
   * ```
   * ```js
   * let XxxSubComponent = XxxComponent.extend({
   *     defaultOption: {
   *         yy: 456
   *     },
   *     fn: function () {
   *         let opt = this.getDefaultOption();
   *         // opt is {xx: 123, yy: 456}
   *     }
   * })
   * ```
   */


  ComponentModel.prototype.getDefaultOption = function () {
    var ctor = this.constructor; // If using class declaration, it is different to travel super class
    // in legacy env and auto merge defaultOption. So if using class
    // declaration, defaultOption should be merged manually.

    if (!isExtendedClass(ctor)) {
      // When using ts class, defaultOption must be declared as static.
      return ctor.defaultOption;
    } // FIXME: remove this approach?


    var fields = inner$2(this);

    if (!fields.defaultOption) {
      var optList = [];
      var clz = ctor;

      while (clz) {
        var opt = clz.prototype.defaultOption;
        opt && optList.push(opt);
        clz = clz.superClass;
      }

      var defaultOption = {};

      for (var i = optList.length - 1; i >= 0; i--) {
        defaultOption = merge(defaultOption, optList[i], true);
      }

      fields.defaultOption = defaultOption;
    }

    return fields.defaultOption;
  };
  /**
   * Notice: always force to input param `useDefault` in case that forget to consider it.
   * The same behavior as `modelUtil.parseFinder`.
   *
   * @param useDefault In many cases like series refer axis and axis refer grid,
   *        If axis index / axis id not specified, use the first target as default.
   *        In other cases like dataZoom refer axis, if not specified, measn no refer.
   */


  ComponentModel.prototype.getReferringComponents = function (mainType, opt) {
    var indexKey = mainType + 'Index';
    var idKey = mainType + 'Id';
    return queryReferringComponents(this.ecModel, mainType, {
      index: this.get(indexKey, true),
      id: this.get(idKey, true)
    }, opt);
  };

  ComponentModel.prototype.getBoxLayoutParams = function () {
    // Consider itself having box layout configs.
    var boxLayoutModel = this;
    return {
      left: boxLayoutModel.get('left'),
      top: boxLayoutModel.get('top'),
      right: boxLayoutModel.get('right'),
      bottom: boxLayoutModel.get('bottom'),
      width: boxLayoutModel.get('width'),
      height: boxLayoutModel.get('height')
    };
  };

  ComponentModel.protoInitialize = function () {
    var proto = ComponentModel.prototype;
    proto.type = 'component';
    proto.id = '';
    proto.name = '';
    proto.mainType = '';
    proto.subType = '';
    proto.componentIndex = 0;
  }();

  return ComponentModel;
}(Model);

mountExtend(ComponentModel, Model);
enableClassManagement(ComponentModel);
enableSubTypeDefaulter(ComponentModel);
enableTopologicalTravel(ComponentModel, getDependencies);

function getDependencies(componentType) {
  var deps = [];
  each$1(ComponentModel.getClassesByMainType(componentType), function (clz) {
    deps = deps.concat(clz.dependencies || clz.prototype.dependencies || []);
  }); // Ensure main type.

  deps = map(deps, function (type) {
    return parseClassType(type).main;
  }); // Hack dataset for convenience.

  if (componentType !== 'dataset' && indexOf(deps, 'dataset') <= 0) {
    deps.unshift('dataset');
  }

  return deps;
}

var innerColor = makeInner();
makeInner();

var PaletteMixin =
/** @class */
function () {
  function PaletteMixin() {}

  PaletteMixin.prototype.getColorFromPalette = function (name, scope, requestNum) {
    var defaultPalette = normalizeToArray(this.get('color', true));
    var layeredPalette = this.get('colorLayer', true);
    return getFromPalette(this, innerColor, defaultPalette, layeredPalette, name, scope, requestNum);
  };

  PaletteMixin.prototype.clearColorPalette = function () {
    clearPalette(this, innerColor);
  };

  return PaletteMixin;
}();

function getNearestPalette(palettes, requestColorNum) {
  var paletteNum = palettes.length; // TODO palettes must be in order

  for (var i = 0; i < paletteNum; i++) {
    if (palettes[i].length > requestColorNum) {
      return palettes[i];
    }
  }

  return palettes[paletteNum - 1];
}
/**
 * @param name MUST NOT be null/undefined. Otherwise call this function
 *             twise with the same parameters will get different result.
 * @param scope default this.
 * @return Can be null/undefined
 */


function getFromPalette(that, inner, defaultPalette, layeredPalette, name, scope, requestNum) {
  scope = scope || that;
  var scopeFields = inner(scope);
  var paletteIdx = scopeFields.paletteIdx || 0;
  var paletteNameMap = scopeFields.paletteNameMap = scopeFields.paletteNameMap || {}; // Use `hasOwnProperty` to avoid conflict with Object.prototype.

  if (paletteNameMap.hasOwnProperty(name)) {
    return paletteNameMap[name];
  }

  var palette = requestNum == null || !layeredPalette ? defaultPalette : getNearestPalette(layeredPalette, requestNum); // In case can't find in layered color palette.

  palette = palette || defaultPalette;

  if (!palette || !palette.length) {
    return;
  }

  var pickedPaletteItem = palette[paletteIdx];

  if (name) {
    paletteNameMap[name] = pickedPaletteItem;
  }

  scopeFields.paletteIdx = (paletteIdx + 1) % palette.length;
  return pickedPaletteItem;
}

function clearPalette(that, inner) {
  inner(that).paletteIdx = 0;
  inner(that).paletteNameMap = {};
}

var DIMENSION_LABEL_REG = /\{@(.+?)\}/g;

var DataFormatMixin =
/** @class */
function () {
  function DataFormatMixin() {}
  /**
   * Get params for formatter
   */


  DataFormatMixin.prototype.getDataParams = function (dataIndex, dataType) {
    var data = this.getData(dataType);
    var rawValue = this.getRawValue(dataIndex, dataType);
    var rawDataIndex = data.getRawIndex(dataIndex);
    var name = data.getName(dataIndex);
    var itemOpt = data.getRawDataItem(dataIndex);
    var style = data.getItemVisual(dataIndex, 'style');
    var color = style && style[data.getItemVisual(dataIndex, 'drawType') || 'fill'];
    var borderColor = style && style.stroke;
    var mainType = this.mainType;
    var isSeries = mainType === 'series';
    var userOutput = data.userOutput;
    return {
      componentType: mainType,
      componentSubType: this.subType,
      componentIndex: this.componentIndex,
      seriesType: isSeries ? this.subType : null,
      seriesIndex: this.seriesIndex,
      seriesId: isSeries ? this.id : null,
      seriesName: isSeries ? this.name : null,
      name: name,
      dataIndex: rawDataIndex,
      data: itemOpt,
      dataType: dataType,
      value: rawValue,
      color: color,
      borderColor: borderColor,
      dimensionNames: userOutput ? userOutput.dimensionNames : null,
      encode: userOutput ? userOutput.encode : null,
      // Param name list for mapping `a`, `b`, `c`, `d`, `e`
      $vars: ['seriesName', 'name', 'value']
    };
  };
  /**
   * Format label
   * @param dataIndex
   * @param status 'normal' by default
   * @param dataType
   * @param labelDimIndex Only used in some chart that
   *        use formatter in different dimensions, like radar.
   * @param formatter Formatter given outside.
   * @return return null/undefined if no formatter
   */


  DataFormatMixin.prototype.getFormattedLabel = function (dataIndex, status, dataType, labelDimIndex, formatter, extendParams) {
    status = status || 'normal';
    var data = this.getData(dataType);
    var params = this.getDataParams(dataIndex, dataType);

    if (extendParams) {
      params.value = extendParams.interpolatedValue;
    }

    if (labelDimIndex != null && isArray(params.value)) {
      params.value = params.value[labelDimIndex];
    }

    if (!formatter) {
      var itemModel = data.getItemModel(dataIndex); // @ts-ignore

      formatter = itemModel.get(status === 'normal' ? ['label', 'formatter'] : [status, 'label', 'formatter']);
    }

    if (typeof formatter === 'function') {
      params.status = status;
      params.dimensionIndex = labelDimIndex;
      return formatter(params);
    } else if (typeof formatter === 'string') {
      var str = formatTpl(formatter, params); // Support 'aaa{@[3]}bbb{@product}ccc'.
      // Do not support '}' in dim name util have to.

      return str.replace(DIMENSION_LABEL_REG, function (origin, dimStr) {
        var len = dimStr.length;
        var dimLoose = dimStr.charAt(0) === '[' && dimStr.charAt(len - 1) === ']' ? +dimStr.slice(1, len - 1) // Also support: '[]' => 0
        : dimStr;
        var val = retrieveRawValue(data, dataIndex, dimLoose);

        if (extendParams && isArray(extendParams.interpolatedValue)) {
          var dimInfo = data.getDimensionInfo(dimLoose);

          if (dimInfo) {
            val = extendParams.interpolatedValue[dimInfo.index];
          }
        }

        return val != null ? val + '' : '';
      });
    }
  };
  /**
   * Get raw value in option
   */


  DataFormatMixin.prototype.getRawValue = function (idx, dataType) {
    return retrieveRawValue(this.getData(dataType), idx);
  };
  /**
   * Should be implemented.
   * @param {number} dataIndex
   * @param {boolean} [multipleSeries=false]
   * @param {string} [dataType]
   */


  DataFormatMixin.prototype.formatTooltip = function (dataIndex, multipleSeries, dataType) {
    // Empty function
    return;
  };

  return DataFormatMixin;
}();
// but guess little chance has been used outside. Do we need to backward
// compat it?
// type TooltipFormatResultLegacyObject = {
//     // `html` means the markup language text, either in 'html' or 'richText'.
//     // The name `html` is not appropriate becuase in 'richText' it is not a HTML
//     // string. But still support it for backward compat.
//     html: string;
//     markers: Dictionary<ColorString>;
// };

/**
 * For backward compat, normalize the return from `formatTooltip`.
 */

function normalizeTooltipFormatResult(result // markersExisting: Dictionary<ColorString>
) {
  var markupText; // let markers: Dictionary<ColorString>;

  var markupFragment;

  if (isObject(result)) {
    if (result.type) {
      markupFragment = result;
    } // else {
    //     markupText = (result as TooltipFormatResultLegacyObject).html;
    //     markers = (result as TooltipFormatResultLegacyObject).markers;
    //     if (markersExisting) {
    //         markers = zrUtil.merge(markersExisting, markers);
    //     }
    // }

  } else {
    markupText = result;
  }

  return {
    markupText: markupText,
    // markers: markers || markersExisting,
    markupFragment: markupFragment
  };
}

/**
 * @param {Object} define
 * @return See the return of `createTask`.
 */

function createTask(define) {
  return new Task(define);
}

var Task =
/** @class */
function () {
  function Task(define) {
    define = define || {};
    this._reset = define.reset;
    this._plan = define.plan;
    this._count = define.count;
    this._onDirty = define.onDirty;
    this._dirty = true;
  }
  /**
   * @param step Specified step.
   * @param skip Skip customer perform call.
   * @param modBy Sampling window size.
   * @param modDataCount Sampling count.
   * @return whether unfinished.
   */


  Task.prototype.perform = function (performArgs) {
    var upTask = this._upstream;
    var skip = performArgs && performArgs.skip; // TODO some refactor.
    // Pull data. Must pull data each time, because context.data
    // may be updated by Series.setData.

    if (this._dirty && upTask) {
      var context = this.context;
      context.data = context.outputData = upTask.context.outputData;
    }

    if (this.__pipeline) {
      this.__pipeline.currentTask = this;
    }

    var planResult;

    if (this._plan && !skip) {
      planResult = this._plan(this.context);
    } // Support sharding by mod, which changes the render sequence and makes the rendered graphic
    // elements uniformed distributed when progress, especially when moving or zooming.


    var lastModBy = normalizeModBy(this._modBy);
    var lastModDataCount = this._modDataCount || 0;
    var modBy = normalizeModBy(performArgs && performArgs.modBy);
    var modDataCount = performArgs && performArgs.modDataCount || 0;

    if (lastModBy !== modBy || lastModDataCount !== modDataCount) {
      planResult = 'reset';
    }

    function normalizeModBy(val) {
      !(val >= 1) && (val = 1); // jshint ignore:line

      return val;
    }

    var forceFirstProgress;

    if (this._dirty || planResult === 'reset') {
      this._dirty = false;
      forceFirstProgress = this._doReset(skip);
    }

    this._modBy = modBy;
    this._modDataCount = modDataCount;
    var step = performArgs && performArgs.step;

    if (upTask) {

      this._dueEnd = upTask._outputDueEnd;
    } // DataTask or overallTask
    else {

        this._dueEnd = this._count ? this._count(this.context) : Infinity;
      } // Note: Stubs, that its host overall task let it has progress, has progress.
    // If no progress, pass index from upstream to downstream each time plan called.


    if (this._progress) {
      var start = this._dueIndex;
      var end = Math.min(step != null ? this._dueIndex + step : Infinity, this._dueEnd);

      if (!skip && (forceFirstProgress || start < end)) {
        var progress = this._progress;

        if (isArray(progress)) {
          for (var i = 0; i < progress.length; i++) {
            this._doProgress(progress[i], start, end, modBy, modDataCount);
          }
        } else {
          this._doProgress(progress, start, end, modBy, modDataCount);
        }
      }

      this._dueIndex = end; // If no `outputDueEnd`, assume that output data and
      // input data is the same, so use `dueIndex` as `outputDueEnd`.

      var outputDueEnd = this._settedOutputEnd != null ? this._settedOutputEnd : end;

      this._outputDueEnd = outputDueEnd;
    } else {
      // (1) Some overall task has no progress.
      // (2) Stubs, that its host overall task do not let it has progress, has no progress.
      // This should always be performed so it can be passed to downstream.
      this._dueIndex = this._outputDueEnd = this._settedOutputEnd != null ? this._settedOutputEnd : this._dueEnd;
    }

    return this.unfinished();
  };

  Task.prototype.dirty = function () {
    this._dirty = true;
    this._onDirty && this._onDirty(this.context);
  };

  Task.prototype._doProgress = function (progress, start, end, modBy, modDataCount) {
    iterator.reset(start, end, modBy, modDataCount);
    this._callingProgress = progress;

    this._callingProgress({
      start: start,
      end: end,
      count: end - start,
      next: iterator.next
    }, this.context);
  };

  Task.prototype._doReset = function (skip) {
    this._dueIndex = this._outputDueEnd = this._dueEnd = 0;
    this._settedOutputEnd = null;
    var progress;
    var forceFirstProgress;

    if (!skip && this._reset) {
      progress = this._reset(this.context);

      if (progress && progress.progress) {
        forceFirstProgress = progress.forceFirstProgress;
        progress = progress.progress;
      } // To simplify no progress checking, array must has item.


      if (isArray(progress) && !progress.length) {
        progress = null;
      }
    }

    this._progress = progress;
    this._modBy = this._modDataCount = null;
    var downstream = this._downstream;
    downstream && downstream.dirty();
    return forceFirstProgress;
  };

  Task.prototype.unfinished = function () {
    return this._progress && this._dueIndex < this._dueEnd;
  };
  /**
   * @param downTask The downstream task.
   * @return The downstream task.
   */


  Task.prototype.pipe = function (downTask) {


    if (this._downstream !== downTask || this._dirty) {
      this._downstream = downTask;
      downTask._upstream = this;
      downTask.dirty();
    }
  };

  Task.prototype.dispose = function () {
    if (this._disposed) {
      return;
    }

    this._upstream && (this._upstream._downstream = null);
    this._downstream && (this._downstream._upstream = null);
    this._dirty = false;
    this._disposed = true;
  };

  Task.prototype.getUpstream = function () {
    return this._upstream;
  };

  Task.prototype.getDownstream = function () {
    return this._downstream;
  };

  Task.prototype.setOutputEnd = function (end) {
    // This only happend in dataTask, dataZoom, map, currently.
    // where dataZoom do not set end each time, but only set
    // when reset. So we should record the setted end, in case
    // that the stub of dataZoom perform again and earse the
    // setted end by upstream.
    this._outputDueEnd = this._settedOutputEnd = end;
  };

  return Task;
}();

var iterator = function () {
  var end;
  var current;
  var modBy;
  var modDataCount;
  var winCount;
  var it = {
    reset: function (s, e, sStep, sCount) {
      current = s;
      end = e;
      modBy = sStep;
      modDataCount = sCount;
      winCount = Math.ceil(modDataCount / modBy);
      it.next = modBy > 1 && modDataCount > 0 ? modNext : sequentialNext;
    }
  };
  return it;

  function sequentialNext() {
    return current < end ? current++ : null;
  }

  function modNext() {
    var dataIndex = current % winCount * modBy + Math.ceil(current / winCount);
    var result = current >= end ? null : dataIndex < modDataCount ? dataIndex // If modDataCount is smaller than data.count() (consider `appendData` case),
    // Use normal linear rendering mode.
    : current;
    current++;
    return result;
  }
}(); ///////////////////////////////////////////////////////////
// For stream debug (Should be commented out after used!)
// @usage: printTask(this, 'begin');
// @usage: printTask(this, null, {someExtraProp});
// @usage: Use `__idxInPipeline` as conditional breakpiont.
//
// window.printTask = function (task: any, prefix: string, extra: { [key: string]: unknown }): void {
//     window.ecTaskUID == null && (window.ecTaskUID = 0);
//     task.uidDebug == null && (task.uidDebug = `task_${window.ecTaskUID++}`);
//     task.agent && task.agent.uidDebug == null && (task.agent.uidDebug = `task_${window.ecTaskUID++}`);
//     let props = [];
//     if (task.__pipeline) {
//         let val = `${task.__idxInPipeline}/${task.__pipeline.tail.__idxInPipeline} ${task.agent ? '(stub)' : ''}`;
//         props.push({text: '__idxInPipeline/total', value: val});
//     } else {
//         let stubCount = 0;
//         task.agentStubMap.each(() => stubCount++);
//         props.push({text: 'idx', value: `overall (stubs: ${stubCount})`});
//     }
//     props.push({text: 'uid', value: task.uidDebug});
//     if (task.__pipeline) {
//         props.push({text: 'pipelineId', value: task.__pipeline.id});
//         task.agent && props.push(
//             {text: 'stubFor', value: task.agent.uidDebug}
//         );
//     }
//     props.push(
//         {text: 'dirty', value: task._dirty},
//         {text: 'dueIndex', value: task._dueIndex},
//         {text: 'dueEnd', value: task._dueEnd},
//         {text: 'outputDueEnd', value: task._outputDueEnd}
//     );
//     if (extra) {
//         Object.keys(extra).forEach(key => {
//             props.push({text: key, value: extra[key]});
//         });
//     }
//     let args = ['color: blue'];
//     let msg = `%c[${prefix || 'T'}] %c` + props.map(item => (
//         args.push('color: green', 'color: red'),
//         `${item.text}: %c${item.value}`
//     )).join('%c, ');
//     console.log.apply(console, [msg].concat(args));
//     // console.log(this);
// };
// window.printPipeline = function (task: any, prefix: string) {
//     const pipeline = task.__pipeline;
//     let currTask = pipeline.head;
//     while (currTask) {
//         window.printTask(currTask, prefix);
//         currTask = currTask._downstream;
//     }
// };
// window.showChain = function (chainHeadTask) {
//     var chain = [];
//     var task = chainHeadTask;
//     while (task) {
//         chain.push({
//             task: task,
//             up: task._upstream,
//             down: task._downstream,
//             idxInPipeline: task.__idxInPipeline
//         });
//         task = task._downstream;
//     }
//     return chain;
// };
// window.findTaskInChain = function (task, chainHeadTask) {
//     let chain = window.showChain(chainHeadTask);
//     let result = [];
//     for (let i = 0; i < chain.length; i++) {
//         let chainItem = chain[i];
//         if (chainItem.task === task) {
//             result.push(i);
//         }
//     }
//     return result;
// };
// window.printChainAEachInChainB = function (chainHeadTaskA, chainHeadTaskB) {
//     let chainA = window.showChain(chainHeadTaskA);
//     for (let i = 0; i < chainA.length; i++) {
//         console.log('chainAIdx:', i, 'inChainB:', window.findTaskInChain(chainA[i].task, chainHeadTaskB));
//     }
// };

/**
 * TODO: disable writable.
 * This structure will be exposed to users.
 */

var ExternalSource =
/** @class */
function () {
  function ExternalSource() {}

  ExternalSource.prototype.getRawData = function () {
    // Only built-in transform available.
    throw new Error('not supported');
  };

  ExternalSource.prototype.getRawDataItem = function (dataIndex) {
    // Only built-in transform available.
    throw new Error('not supported');
  };

  ExternalSource.prototype.cloneRawData = function () {
    return;
  };
  /**
   * @return If dimension not found, return null/undefined.
   */


  ExternalSource.prototype.getDimensionInfo = function (dim) {
    return;
  };
  /**
   * dimensions defined if and only if either:
   * (a) dataset.dimensions are declared.
   * (b) dataset data include dimensions definitions in data (detected or via specified `sourceHeader`).
   * If dimensions are defined, `dimensionInfoAll` is corresponding to
   * the defined dimensions.
   * Otherwise, `dimensionInfoAll` is determined by data columns.
   * @return Always return an array (even empty array).
   */


  ExternalSource.prototype.cloneAllDimensionInfo = function () {
    return;
  };

  ExternalSource.prototype.count = function () {
    return;
  };
  /**
   * Only support by dimension index.
   * No need to support by dimension name in transform function,
   * becuase transform function is not case-specific, no need to use name literally.
   */


  ExternalSource.prototype.retrieveValue = function (dataIndex, dimIndex) {
    return;
  };

  ExternalSource.prototype.retrieveValueFromItem = function (dataItem, dimIndex) {
    return;
  };

  ExternalSource.prototype.convertValue = function (rawVal, dimInfo) {
    return parseDataValue(rawVal, dimInfo);
  };

  return ExternalSource;
}();

function createExternalSource(internalSource, externalTransform) {
  var extSource = new ExternalSource();
  var data = internalSource.data;
  var sourceFormat = extSource.sourceFormat = internalSource.sourceFormat;
  var sourceHeaderCount = internalSource.startIndex;
  var errMsg = '';

  if (internalSource.seriesLayoutBy !== SERIES_LAYOUT_BY_COLUMN) {

    throwError(errMsg);
  } // [MEMO]
  // Create a new dimensions structure for exposing.
  // Do not expose all dimension info to users directly.
  // Becuase the dimension is probably auto detected from data and not might reliable.
  // Should not lead the transformers to think that is relialbe and return it.
  // See [DIMENSION_INHERIT_RULE] in `sourceManager.ts`.


  var dimensions = [];
  var dimsByName = {};
  var dimsDef = internalSource.dimensionsDefine;

  if (dimsDef) {
    each$1(dimsDef, function (dimDef, idx) {
      var name = dimDef.name;
      var dimDefExt = {
        index: idx,
        name: name,
        displayName: dimDef.displayName
      };
      dimensions.push(dimDefExt); // Users probably not sepcify dimension name. For simplicity, data transform
      // do not generate dimension name.

      if (name != null) {
        // Dimension name should not be duplicated.
        // For simplicity, data transform forbid name duplication, do not generate
        // new name like module `completeDimensions.ts` did, but just tell users.
        var errMsg_1 = '';

        if (hasOwn(dimsByName, name)) {

          throwError(errMsg_1);
        }

        dimsByName[name] = dimDefExt;
      }
    });
  } // If dimension definitions are not defined and can not be detected.
  // e.g., pure data `[[11, 22], ...]`.
  else {
      for (var i = 0; i < internalSource.dimensionsDetectedCount || 0; i++) {
        // Do not generete name or anything others. The consequence process in
        // `transform` or `series` probably have there own name generation strategry.
        dimensions.push({
          index: i
        });
      }
    } // Implement public methods:


  var rawItemGetter = getRawSourceItemGetter(sourceFormat, SERIES_LAYOUT_BY_COLUMN);

  if (externalTransform.__isBuiltIn) {
    extSource.getRawDataItem = function (dataIndex) {
      return rawItemGetter(data, sourceHeaderCount, dimensions, dataIndex);
    };

    extSource.getRawData = bind(getRawData, null, internalSource);
  }

  extSource.cloneRawData = bind(cloneRawData, null, internalSource);
  var rawCounter = getRawSourceDataCounter(sourceFormat, SERIES_LAYOUT_BY_COLUMN);
  extSource.count = bind(rawCounter, null, data, sourceHeaderCount, dimensions);
  var rawValueGetter = getRawSourceValueGetter(sourceFormat);

  extSource.retrieveValue = function (dataIndex, dimIndex) {
    var rawItem = rawItemGetter(data, sourceHeaderCount, dimensions, dataIndex);
    return retrieveValueFromItem(rawItem, dimIndex);
  };

  var retrieveValueFromItem = extSource.retrieveValueFromItem = function (dataItem, dimIndex) {
    if (dataItem == null) {
      return;
    }

    var dimDef = dimensions[dimIndex]; // When `dimIndex` is `null`, `rawValueGetter` return the whole item.

    if (dimDef) {
      return rawValueGetter(dataItem, dimIndex, dimDef.name);
    }
  };

  extSource.getDimensionInfo = bind(getDimensionInfo, null, dimensions, dimsByName);
  extSource.cloneAllDimensionInfo = bind(cloneAllDimensionInfo, null, dimensions);
  return extSource;
}

function getRawData(upstream) {
  var sourceFormat = upstream.sourceFormat;

  if (!isSupportedSourceFormat(sourceFormat)) {
    var errMsg = '';

    throwError(errMsg);
  }

  return upstream.data;
}

function cloneRawData(upstream) {
  var sourceFormat = upstream.sourceFormat;
  var data = upstream.data;

  if (!isSupportedSourceFormat(sourceFormat)) {
    var errMsg = '';

    throwError(errMsg);
  }

  if (sourceFormat === SOURCE_FORMAT_ARRAY_ROWS) {
    var result = [];

    for (var i = 0, len = data.length; i < len; i++) {
      // Not strictly clone for performance
      result.push(data[i].slice());
    }

    return result;
  } else if (sourceFormat === SOURCE_FORMAT_OBJECT_ROWS) {
    var result = [];

    for (var i = 0, len = data.length; i < len; i++) {
      // Not strictly clone for performance
      result.push(extend({}, data[i]));
    }

    return result;
  }
}

function getDimensionInfo(dimensions, dimsByName, dim) {
  if (dim == null) {
    return;
  } // Keep the same logic as `List::getDimension` did.


  if (typeof dim === 'number' // If being a number-like string but not being defined a dimension name.
  || !isNaN(dim) && !hasOwn(dimsByName, dim)) {
    return dimensions[dim];
  } else if (hasOwn(dimsByName, dim)) {
    return dimsByName[dim];
  }
}

function cloneAllDimensionInfo(dimensions) {
  return clone$1(dimensions);
}

var externalTransformMap = createHashMap();
function registerExternalTransform(externalTransform) {
  externalTransform = clone$1(externalTransform);
  var type = externalTransform.type;
  var errMsg = '';

  if (!type) {

    throwError(errMsg);
  }

  var typeParsed = type.split(':');

  if (typeParsed.length !== 2) {

    throwError(errMsg);
  } // Namespace 'echarts:xxx' is official namespace, where the transforms should
  // be called directly via 'xxx' rather than 'echarts:xxx'.


  var isBuiltIn = false;

  if (typeParsed[0] === 'echarts') {
    type = typeParsed[1];
    isBuiltIn = true;
  }

  externalTransform.__isBuiltIn = isBuiltIn;
  externalTransformMap.set(type, externalTransform);
}
function applyDataTransform(rawTransOption, sourceList, infoForPrint) {
  var pipedTransOption = normalizeToArray(rawTransOption);
  var pipeLen = pipedTransOption.length;
  var errMsg = '';

  if (!pipeLen) {

    throwError(errMsg);
  }

  for (var i = 0, len = pipeLen; i < len; i++) {
    var transOption = pipedTransOption[i];
    sourceList = applySingleDataTransform(transOption, sourceList); // piped transform only support single input, except the fist one.
    // piped transform only support single output, except the last one.

    if (i !== len - 1) {
      sourceList.length = Math.max(sourceList.length, 1);
    }
  }

  return sourceList;
}

function applySingleDataTransform(transOption, upSourceList, infoForPrint, // If `pipeIndex` is null/undefined, no piped transform.
pipeIndex) {
  var errMsg = '';

  if (!upSourceList.length) {

    throwError(errMsg);
  }

  if (!isObject(transOption)) {

    throwError(errMsg);
  }

  var transType = transOption.type;
  var externalTransform = externalTransformMap.get(transType);

  if (!externalTransform) {

    throwError(errMsg);
  } // Prepare source


  var extUpSourceList = map(upSourceList, function (upSource) {
    return createExternalSource(upSource, externalTransform);
  });
  var resultList = normalizeToArray(externalTransform.transform({
    upstream: extUpSourceList[0],
    upstreamList: extUpSourceList,
    config: clone$1(transOption.config)
  }));

  return map(resultList, function (result, resultIndex) {
    var errMsg = '';

    if (!isObject(result)) {

      throwError(errMsg);
    }

    if (!result.data) {

      throwError(errMsg);
    }

    var sourceFormat = detectSourceFormat(result.data);

    if (!isSupportedSourceFormat(sourceFormat)) {

      throwError(errMsg);
    }

    var resultMetaRawOption;
    var firstUpSource = upSourceList[0];
    /**
     * Intuitively, the end users known the content of the original `dataset.source`,
     * calucating the transform result in mind.
     * Suppose the original `dataset.source` is:
     * ```js
     * [
     *     ['product', '2012', '2013', '2014', '2015'],
     *     ['AAA', 41.1, 30.4, 65.1, 53.3],
     *     ['BBB', 86.5, 92.1, 85.7, 83.1],
     *     ['CCC', 24.1, 67.2, 79.5, 86.4]
     * ]
     * ```
     * The dimension info have to be detected from the source data.
     * Some of the transformers (like filter, sort) will follow the dimension info
     * of upstream, while others use new dimensions (like aggregate).
     * Transformer can output a field `dimensions` to define the its own output dimensions.
     * We also allow transformers to ignore the output `dimensions` field, and
     * inherit the upstream dimensions definition. It can reduce the burden of handling
     * dimensions in transformers.
     *
     * See also [DIMENSION_INHERIT_RULE] in `sourceManager.ts`.
     */

    if (firstUpSource && resultIndex === 0 // If transformer returns `dimensions`, it means that the transformer has different
    // dimensions definitions. We do not inherit anything from upstream.
    && !result.dimensions) {
      var startIndex = firstUpSource.startIndex; // We copy the header of upstream to the result becuase:
      // (1) The returned data always does not contain header line and can not be used
      // as dimension-detection. In this case we can not use "detected dimensions" of
      // upstream directly, because it might be detected based on different `seriesLayoutBy`.
      // (2) We should support that the series read the upstream source in `seriesLayoutBy: 'row'`.
      // So the original detected header should be add to the result, otherwise they can not be read.

      if (startIndex) {
        result.data = firstUpSource.data.slice(0, startIndex).concat(result.data);
      }

      resultMetaRawOption = {
        seriesLayoutBy: SERIES_LAYOUT_BY_COLUMN,
        sourceHeader: startIndex,
        dimensions: firstUpSource.metaRawOption.dimensions
      };
    } else {
      resultMetaRawOption = {
        seriesLayoutBy: SERIES_LAYOUT_BY_COLUMN,
        sourceHeader: 0,
        dimensions: result.dimensions
      };
    }

    return createSource(result.data, resultMetaRawOption, null, null);
  });
}

function isSupportedSourceFormat(sourceFormat) {
  return sourceFormat === SOURCE_FORMAT_ARRAY_ROWS || sourceFormat === SOURCE_FORMAT_OBJECT_ROWS;
}

/**
 * [REQUIREMENT_MEMO]:
 * (0) `metaRawOption` means `dimensions`/`sourceHeader`/`seriesLayoutBy` in raw option.
 * (1) Keep support the feature: `metaRawOption` can be specified both on `series` and
 * `root-dataset`. Them on `series` has higher priority.
 * (2) Do not support to set `metaRawOption` on a `non-root-dataset`, because it might
 * confuse users: whether those props indicate how to visit the upstream source or visit
 * the transform result source, and some transforms has nothing to do with these props,
 * and some transforms might have multiple upstream.
 * (3) Transforms should specify `metaRawOption` in each output, just like they can be
 * declared in `root-dataset`.
 * (4) At present only support visit source in `SERIES_LAYOUT_BY_COLUMN` in transforms.
 * That is for reducing complexity in transfroms.
 * PENDING: Whether to provide transposition transform?
 *
 * [IMPLEMENTAION_MEMO]:
 * "sourceVisitConfig" are calculated from `metaRawOption` and `data`.
 * They will not be calculated until `source` is about to be visited (to prevent from
 * duplicate calcuation). `source` is visited only in series and input to transforms.
 *
 * [DIMENSION_INHERIT_RULE]:
 * By default the dimensions are inherited from ancestors, unless a transform return
 * a new dimensions definition.
 * Consider the case:
 * ```js
 * dataset: [{
 *     source: [ ['Product', 'Sales', 'Prise'], ['Cookies', 321, 44.21], ...]
 * }, {
 *     transform: { type: 'filter', ... }
 * }]
 * dataset: [{
 *     dimension: ['Product', 'Sales', 'Prise'],
 *     source: [ ['Cookies', 321, 44.21], ...]
 * }, {
 *     transform: { type: 'filter', ... }
 * }]
 * ```
 * The two types of option should have the same behavior after transform.
 *
 *
 * [SCENARIO]:
 * (1) Provide source data directly:
 * ```js
 * series: {
 *     encode: {...},
 *     dimensions: [...]
 *     seriesLayoutBy: 'row',
 *     data: [[...]]
 * }
 * ```
 * (2) Series refer to dataset.
 * ```js
 * series: [{
 *     encode: {...}
 *     // Ignore datasetIndex means `datasetIndex: 0`
 *     // and the dimensions defination in dataset is used
 * }, {
 *     encode: {...},
 *     seriesLayoutBy: 'column',
 *     datasetIndex: 1
 * }]
 * ```
 * (3) dataset transform
 * ```js
 * dataset: [{
 *     source: [...]
 * }, {
 *     source: [...]
 * }, {
 *     // By default from 0.
 *     transform: { type: 'filter', config: {...} }
 * }, {
 *     // Piped.
 *     transform: [
 *         { type: 'filter', config: {...} },
 *         { type: 'sort', config: {...} }
 *     ]
 * }, {
 *     id: 'regressionData',
 *     fromDatasetIndex: 1,
 *     // Third-party transform
 *     transform: { type: 'ecStat:regression', config: {...} }
 * }, {
 *     // retrieve the extra result.
 *     id: 'regressionFormula',
 *     fromDatasetId: 'regressionData',
 *     fromTransformResult: 1
 * }]
 * ```
 */

var SourceManager =
/** @class */
function () {
  function SourceManager(sourceHost) {
    // Cached source. Do not repeat calculating if not dirty.
    this._sourceList = []; // version sign of each upstream source manager.

    this._upstreamSignList = [];
    this._versionSignBase = 0;
    this._sourceHost = sourceHost;
  }
  /**
   * Mark dirty.
   */


  SourceManager.prototype.dirty = function () {
    this._setLocalSource([], []);
  };

  SourceManager.prototype._setLocalSource = function (sourceList, upstreamSignList) {
    this._sourceList = sourceList;
    this._upstreamSignList = upstreamSignList;
    this._versionSignBase++;

    if (this._versionSignBase > 9e10) {
      this._versionSignBase = 0;
    }
  };
  /**
   * For detecting whether the upstream source is dirty, so that
   * the local cached source (in `_sourceList`) should be discarded.
   */


  SourceManager.prototype._getVersionSign = function () {
    return this._sourceHost.uid + '_' + this._versionSignBase;
  };
  /**
   * Always return a source instance. Otherwise throw error.
   */


  SourceManager.prototype.prepareSource = function () {
    // For the case that call `setOption` multiple time but no data changed,
    // cache the result source to prevent from repeating transform.
    if (this._isDirty()) {
      this._createSource();
    }
  };

  SourceManager.prototype._createSource = function () {
    this._setLocalSource([], []);

    var sourceHost = this._sourceHost;

    var upSourceMgrList = this._getUpstreamSourceManagers();

    var hasUpstream = !!upSourceMgrList.length;
    var resultSourceList;
    var upstreamSignList;

    if (isSeries(sourceHost)) {
      var seriesModel = sourceHost;
      var data = void 0;
      var sourceFormat = void 0;
      var upSource = void 0; // Has upstream dataset

      if (hasUpstream) {
        var upSourceMgr = upSourceMgrList[0];
        upSourceMgr.prepareSource();
        upSource = upSourceMgr.getSource();
        data = upSource.data;
        sourceFormat = upSource.sourceFormat;
        upstreamSignList = [upSourceMgr._getVersionSign()];
      } // Series data is from own.
      else {
          data = seriesModel.get('data', true);
          sourceFormat = isTypedArray(data) ? SOURCE_FORMAT_TYPED_ARRAY : SOURCE_FORMAT_ORIGINAL;
          upstreamSignList = [];
        } // See [REQUIREMENT_MEMO], merge settings on series and parent dataset if it is root.


      var newMetaRawOption = this._getSourceMetaRawOption();

      var upMetaRawOption = upSource ? upSource.metaRawOption : null;
      var seriesLayoutBy = retrieve2(newMetaRawOption.seriesLayoutBy, upMetaRawOption ? upMetaRawOption.seriesLayoutBy : null);
      var sourceHeader = retrieve2(newMetaRawOption.sourceHeader, upMetaRawOption ? upMetaRawOption.sourceHeader : null); // Note here we should not use `upSource.dimensionsDefine`. Consider the case:
      // `upSource.dimensionsDefine` is detected by `seriesLayoutBy: 'column'`,
      // but series need `seriesLayoutBy: 'row'`.

      var dimensions = retrieve2(newMetaRawOption.dimensions, upMetaRawOption ? upMetaRawOption.dimensions : null);
      resultSourceList = [createSource(data, {
        seriesLayoutBy: seriesLayoutBy,
        sourceHeader: sourceHeader,
        dimensions: dimensions
      }, sourceFormat, seriesModel.get('encode', true))];
    } else {
      var datasetModel = sourceHost; // Has upstream dataset.

      if (hasUpstream) {
        var result = this._applyTransform(upSourceMgrList);

        resultSourceList = result.sourceList;
        upstreamSignList = result.upstreamSignList;
      } // Is root dataset.
      else {
          var sourceData = datasetModel.get('source', true);
          resultSourceList = [createSource(sourceData, this._getSourceMetaRawOption(), null, // Note: dataset option does not have `encode`.
          null)];
          upstreamSignList = [];
        }
    }

    this._setLocalSource(resultSourceList, upstreamSignList);
  };

  SourceManager.prototype._applyTransform = function (upMgrList) {
    var datasetModel = this._sourceHost;
    var transformOption = datasetModel.get('transform', true);
    var fromTransformResult = datasetModel.get('fromTransformResult', true);

    if (fromTransformResult != null) {
      var errMsg = '';

      if (upMgrList.length !== 1) {

        doThrow(errMsg);
      }
    }

    var sourceList;
    var upSourceList = [];
    var upstreamSignList = [];
    each$1(upMgrList, function (upMgr) {
      upMgr.prepareSource();
      var upSource = upMgr.getSource(fromTransformResult || 0);
      var errMsg = '';

      if (fromTransformResult != null && !upSource) {

        doThrow(errMsg);
      }

      upSourceList.push(upSource);
      upstreamSignList.push(upMgr._getVersionSign());
    });

    if (transformOption) {
      sourceList = applyDataTransform(transformOption, upSourceList, {
        datasetIndex: datasetModel.componentIndex
      });
    } else if (fromTransformResult != null) {
      sourceList = [cloneSourceShallow(upSourceList[0])];
    }

    return {
      sourceList: sourceList,
      upstreamSignList: upstreamSignList
    };
  };

  SourceManager.prototype._isDirty = function () {
    var sourceList = this._sourceList;

    if (!sourceList.length) {
      return true;
    } // All sourceList is from the some upsteam.


    var upSourceMgrList = this._getUpstreamSourceManagers();

    for (var i = 0; i < upSourceMgrList.length; i++) {
      var upSrcMgr = upSourceMgrList[i];

      if ( // Consider the case that there is ancestor diry, call it recursively.
      // The performance is probably not an issue because usually the chain is not long.
      upSrcMgr._isDirty() || this._upstreamSignList[i] !== upSrcMgr._getVersionSign()) {
        return true;
      }
    }
  };
  /**
   * @param sourceIndex By defualt 0, means "main source".
   *                    Most cases there is only one source.
   */


  SourceManager.prototype.getSource = function (sourceIndex) {
    return this._sourceList[sourceIndex || 0];
  };
  /**
   * PEDING: Is it fast enough?
   * If no upstream, return empty array.
   */


  SourceManager.prototype._getUpstreamSourceManagers = function () {
    // Always get the relationship from the raw option.
    // Do not cache the link of the dependency graph, so that
    // no need to update them when change happen.
    var sourceHost = this._sourceHost;

    if (isSeries(sourceHost)) {
      var datasetModel = querySeriesUpstreamDatasetModel(sourceHost);
      return !datasetModel ? [] : [datasetModel.getSourceManager()];
    } else {
      return map(queryDatasetUpstreamDatasetModels(sourceHost), function (datasetModel) {
        return datasetModel.getSourceManager();
      });
    }
  };

  SourceManager.prototype._getSourceMetaRawOption = function () {
    var sourceHost = this._sourceHost;
    var seriesLayoutBy;
    var sourceHeader;
    var dimensions;

    if (isSeries(sourceHost)) {
      seriesLayoutBy = sourceHost.get('seriesLayoutBy', true);
      sourceHeader = sourceHost.get('sourceHeader', true);
      dimensions = sourceHost.get('dimensions', true);
    } // See [REQUIREMENT_MEMO], `non-root-dataset` do not support them.
    else if (!this._getUpstreamSourceManagers().length) {
        var model = sourceHost;
        seriesLayoutBy = model.get('seriesLayoutBy', true);
        sourceHeader = model.get('sourceHeader', true);
        dimensions = model.get('dimensions', true);
      }

    return {
      seriesLayoutBy: seriesLayoutBy,
      sourceHeader: sourceHeader,
      dimensions: dimensions
    };
  };

  return SourceManager;
}();

function isSeries(sourceHost) {
  // Avoid circular dependency with Series.ts
  return sourceHost.mainType === 'series';
}

function doThrow(errMsg) {
  throw new Error(errMsg);
}

var TOOLTIP_LINE_HEIGHT_CSS = 'line-height:1'; // TODO: more textStyle option

function getTooltipTextStyle(textStyle, renderMode) {
  var nameFontColor = textStyle.color || '#6e7079';
  var nameFontSize = textStyle.fontSize || 12;
  var nameFontWeight = textStyle.fontWeight || '400';
  var valueFontColor = textStyle.color || '#464646';
  var valueFontSize = textStyle.fontSize || 14;
  var valueFontWeight = textStyle.fontWeight || '900';

  if (renderMode === 'html') {
    // `textStyle` is probably from user input, should be encoded to reduce security risk.
    return {
      // eslint-disable-next-line max-len
      nameStyle: "font-size:" + encodeHTML(nameFontSize + '') + "px;color:" + encodeHTML(nameFontColor) + ";font-weight:" + encodeHTML(nameFontWeight + ''),
      // eslint-disable-next-line max-len
      valueStyle: "font-size:" + encodeHTML(valueFontSize + '') + "px;color:" + encodeHTML(valueFontColor) + ";font-weight:" + encodeHTML(valueFontWeight + '')
    };
  } else {
    return {
      nameStyle: {
        fontSize: nameFontSize,
        fill: nameFontColor,
        fontWeight: nameFontWeight
      },
      valueStyle: {
        fontSize: valueFontSize,
        fill: valueFontColor,
        fontWeight: valueFontWeight
      }
    };
  }
} // See `TooltipMarkupLayoutIntent['innerGapLevel']`.
// (value from UI design)


var HTML_GAPS = [0, 10, 20, 30];
var RICH_TEXT_GAPS = ['', '\n', '\n\n', '\n\n\n']; // eslint-disable-next-line max-len

function createTooltipMarkup(type, option) {
  option.type = type;
  return option;
}

function getBuilder(fragment) {
  return hasOwn(builderMap, fragment.type) && builderMap[fragment.type];
}

var builderMap = {
  /**
   * A `section` block is like:
   * ```
   * header
   * subBlock
   * subBlock
   * ...
   * ```
   */
  section: {
    planLayout: function (fragment) {
      var subBlockLen = fragment.blocks.length;
      var thisBlockHasInnerGap = subBlockLen > 1 || subBlockLen > 0 && !fragment.noHeader;
      var thisGapLevelBetweenSubBlocks = 0;
      each$1(fragment.blocks, function (subBlock) {
        getBuilder(subBlock).planLayout(subBlock);
        var subGapLevel = subBlock.__gapLevelBetweenSubBlocks; // If the some of the sub-blocks have some gaps (like 10px) inside, this block
        // should use a larger gap (like 20px) to distinguish those sub-blocks.

        if (subGapLevel >= thisGapLevelBetweenSubBlocks) {
          thisGapLevelBetweenSubBlocks = subGapLevel + (thisBlockHasInnerGap && ( // 0 always can not be readable gap level.
          !subGapLevel // If no header, always keep the sub gap level. Otherwise
          // look weird in case `multipleSeries`.
          || subBlock.type === 'section' && !subBlock.noHeader) ? 1 : 0);
        }
      });
      fragment.__gapLevelBetweenSubBlocks = thisGapLevelBetweenSubBlocks;
    },
    build: function (ctx, fragment, topMarginForOuterGap, toolTipTextStyle) {
      var noHeader = fragment.noHeader;
      var gaps = getGap(fragment);
      var subMarkupText = buildSubBlocks(ctx, fragment, noHeader ? topMarginForOuterGap : gaps.html, toolTipTextStyle);

      if (noHeader) {
        return subMarkupText;
      }

      var displayableHeader = makeValueReadable(fragment.header, 'ordinal', ctx.useUTC);
      var nameStyle = getTooltipTextStyle(toolTipTextStyle, ctx.renderMode).nameStyle;

      if (ctx.renderMode === 'richText') {
        return wrapInlineNameRichText(ctx, displayableHeader, nameStyle) + gaps.richText + subMarkupText;
      } else {
        return wrapBlockHTML("<div style=\"" + nameStyle + ";" + TOOLTIP_LINE_HEIGHT_CSS + ";\">" + encodeHTML(displayableHeader) + '</div>' + subMarkupText, topMarginForOuterGap);
      }
    }
  },

  /**
   * A `nameValue` block is like:
   * ```
   * marker  name  value
   * ```
   */
  nameValue: {
    planLayout: function (fragment) {
      fragment.__gapLevelBetweenSubBlocks = 0;
    },
    build: function (ctx, fragment, topMarginForOuterGap, toolTipTextStyle) {
      var renderMode = ctx.renderMode;
      var noName = fragment.noName;
      var noValue = fragment.noValue;
      var noMarker = !fragment.markerType;
      var name = fragment.name;
      var value = fragment.value;
      var useUTC = ctx.useUTC;

      if (noName && noValue) {
        return;
      }

      var markerStr = noMarker ? '' : ctx.markupStyleCreator.makeTooltipMarker(fragment.markerType, fragment.markerColor || '#333', renderMode);
      var readableName = noName ? '' : makeValueReadable(name, 'ordinal', useUTC);
      var valueTypeOption = fragment.valueType;
      var readableValueList = noValue ? [] : isArray(value) ? map(value, function (val, idx) {
        return makeValueReadable(val, isArray(valueTypeOption) ? valueTypeOption[idx] : valueTypeOption, useUTC);
      }) : [makeValueReadable(value, isArray(valueTypeOption) ? valueTypeOption[0] : valueTypeOption, useUTC)];
      var valueAlignRight = !noMarker || !noName; // It little weird if only value next to marker but far from marker.

      var valueCloseToMarker = !noMarker && noName;

      var _a = getTooltipTextStyle(toolTipTextStyle, renderMode),
          nameStyle = _a.nameStyle,
          valueStyle = _a.valueStyle;

      return renderMode === 'richText' ? (noMarker ? '' : markerStr) + (noName ? '' : wrapInlineNameRichText(ctx, readableName, nameStyle)) // Value has commas inside, so use ' ' as delimiter for multiple values.
      + (noValue ? '' : wrapInlineValueRichText(ctx, readableValueList, valueAlignRight, valueCloseToMarker, valueStyle)) : wrapBlockHTML((noMarker ? '' : markerStr) + (noName ? '' : wrapInlineNameHTML(readableName, !noMarker, nameStyle)) + (noValue ? '' : wrapInlineValueHTML(readableValueList, valueAlignRight, valueCloseToMarker, valueStyle)), topMarginForOuterGap);
    }
  }
};

function buildSubBlocks(ctx, fragment, topMarginForOuterGap, tooltipTextStyle) {
  var subMarkupTextList = [];
  var subBlocks = fragment.blocks || [];
  assert(!subBlocks || isArray(subBlocks));
  subBlocks = subBlocks || [];
  var orderMode = ctx.orderMode;

  if (fragment.sortBlocks && orderMode) {
    subBlocks = subBlocks.slice();
    var orderMap = {
      valueAsc: 'asc',
      valueDesc: 'desc'
    };

    if (hasOwn(orderMap, orderMode)) {
      var comparator_1 = new SortOrderComparator(orderMap[orderMode], null);
      subBlocks.sort(function (a, b) {
        return comparator_1.evaluate(a.sortParam, b.sortParam);
      });
    } // FIXME 'seriesDesc' necessary?
    else if (orderMode === 'seriesDesc') {
        subBlocks.reverse();
      }
  }

  var gaps = getGap(fragment);
  each$1(subBlocks, function (subBlock, idx) {
    var subMarkupText = getBuilder(subBlock).build(ctx, subBlock, idx > 0 ? gaps.html : 0, tooltipTextStyle);
    subMarkupText != null && subMarkupTextList.push(subMarkupText);
  });

  if (!subMarkupTextList.length) {
    return;
  }

  return ctx.renderMode === 'richText' ? subMarkupTextList.join(gaps.richText) : wrapBlockHTML(subMarkupTextList.join(''), topMarginForOuterGap);
}
/**
 * @return markupText. null/undefined means no content.
 */


function buildTooltipMarkup(fragment, markupStyleCreator, renderMode, orderMode, useUTC, toolTipTextStyle) {
  if (!fragment) {
    return;
  }

  var builder = getBuilder(fragment);
  builder.planLayout(fragment);
  var ctx = {
    useUTC: useUTC,
    renderMode: renderMode,
    orderMode: orderMode,
    markupStyleCreator: markupStyleCreator
  };
  return builder.build(ctx, fragment, 0, toolTipTextStyle);
}

function getGap(fragment) {
  var gapLevelBetweenSubBlocks = fragment.__gapLevelBetweenSubBlocks;
  return {
    html: HTML_GAPS[gapLevelBetweenSubBlocks],
    richText: RICH_TEXT_GAPS[gapLevelBetweenSubBlocks]
  };
}

function wrapBlockHTML(encodedContent, topGap) {
  var clearfix = '<div style="clear:both"></div>';
  var marginCSS = "margin: " + topGap + "px 0 0";
  return "<div style=\"" + marginCSS + ";" + TOOLTIP_LINE_HEIGHT_CSS + ";\">" + encodedContent + clearfix + '</div>';
}

function wrapInlineNameHTML(name, leftHasMarker, style) {
  var marginCss = leftHasMarker ? 'margin-left:2px' : '';
  return "<span style=\"" + style + ";" + marginCss + "\">" + encodeHTML(name) + '</span>';
}

function wrapInlineValueHTML(valueList, alignRight, valueCloseToMarker, style) {
  // Do not too close to marker, considering there are multiple values separated by spaces.
  var paddingStr = valueCloseToMarker ? '10px' : '20px';
  var alignCSS = alignRight ? "float:right;margin-left:" + paddingStr : '';
  return "<span style=\"" + alignCSS + ";" + style + "\">" // Value has commas inside, so use '  ' as delimiter for multiple values.
  + map(valueList, function (value) {
    return encodeHTML(value);
  }).join('&nbsp;&nbsp;') + '</span>';
}

function wrapInlineNameRichText(ctx, name, style) {
  return ctx.markupStyleCreator.wrapRichTextStyle(name, style);
}

function wrapInlineValueRichText(ctx, valueList, alignRight, valueCloseToMarker, style) {
  var styles = [style];
  var paddingLeft = valueCloseToMarker ? 10 : 20;
  alignRight && styles.push({
    padding: [0, 0, 0, paddingLeft],
    align: 'right'
  }); // Value has commas inside, so use '  ' as delimiter for multiple values.

  return ctx.markupStyleCreator.wrapRichTextStyle(valueList.join('  '), styles);
}

function retrieveVisualColorForTooltipMarker(series, dataIndex) {
  var style = series.getData().getItemVisual(dataIndex, 'style');
  var color = style[series.visualDrawType];
  return convertToColorString(color);
}
function getPaddingFromTooltipModel(model, renderMode) {
  var padding = model.get('padding');
  return padding != null ? padding // We give slightly different to look pretty.
  : renderMode === 'richText' ? [8, 10] : 10;
}
/**
 * The major feature is generate styles for `renderMode: 'richText'`.
 * But it also serves `renderMode: 'html'` to provide
 * "renderMode-independent" API.
 */

var TooltipMarkupStyleCreator =
/** @class */
function () {
  function TooltipMarkupStyleCreator() {
    this.richTextStyles = {}; // Notice that "generate a style name" usuall happens repeatly when mouse moving and
    // displaying a tooltip. So we put the `_nextStyleNameId` as a member of each creator
    // rather than static shared by all creators (which will cause it increase to fast).

    this._nextStyleNameId = getRandomIdBase();
  }

  TooltipMarkupStyleCreator.prototype._generateStyleName = function () {
    return '__EC_aUTo_' + this._nextStyleNameId++;
  };

  TooltipMarkupStyleCreator.prototype.makeTooltipMarker = function (markerType, colorStr, renderMode) {
    var markerId = renderMode === 'richText' ? this._generateStyleName() : null;
    var marker = getTooltipMarker({
      color: colorStr,
      type: markerType,
      renderMode: renderMode,
      markerId: markerId
    });

    if (isString(marker)) {
      return marker;
    } else {

      this.richTextStyles[markerId] = marker.style;
      return marker.content;
    }
  };
  /**
   * @usage
   * ```ts
   * const styledText = markupStyleCreator.wrapRichTextStyle([
   *     // The styles will be auto merged.
   *     {
   *         fontSize: 12,
   *         color: 'blue'
   *     },
   *     {
   *         padding: 20
   *     }
   * ]);
   * ```
   */


  TooltipMarkupStyleCreator.prototype.wrapRichTextStyle = function (text, styles) {
    var finalStl = {};

    if (isArray(styles)) {
      each$1(styles, function (stl) {
        return extend(finalStl, stl);
      });
    } else {
      extend(finalStl, styles);
    }

    var styleName = this._generateStyleName();

    this.richTextStyles[styleName] = finalStl;
    return "{" + styleName + "|" + text + "}";
  };

  return TooltipMarkupStyleCreator;
}();

function defaultSeriesFormatTooltip(opt) {
  var series = opt.series;
  var dataIndex = opt.dataIndex;
  var multipleSeries = opt.multipleSeries;
  var data = series.getData();
  var tooltipDims = data.mapDimensionsAll('defaultedTooltip');
  var tooltipDimLen = tooltipDims.length;
  var value = series.getRawValue(dataIndex);
  var isValueArr = isArray(value);
  var markerColor = retrieveVisualColorForTooltipMarker(series, dataIndex); // Complicated rule for pretty tooltip.

  var inlineValue;
  var inlineValueType;
  var subBlocks;
  var sortParam;

  if (tooltipDimLen > 1 || isValueArr && !tooltipDimLen) {
    var formatArrResult = formatTooltipArrayValue(value, series, dataIndex, tooltipDims, markerColor);
    inlineValue = formatArrResult.inlineValues;
    inlineValueType = formatArrResult.inlineValueTypes;
    subBlocks = formatArrResult.blocks; // Only support tooltip sort by the first inline value. It's enough in most cases.

    sortParam = formatArrResult.inlineValues[0];
  } else if (tooltipDimLen) {
    var dimInfo = data.getDimensionInfo(tooltipDims[0]);
    sortParam = inlineValue = retrieveRawValue(data, dataIndex, tooltipDims[0]);
    inlineValueType = dimInfo.type;
  } else {
    sortParam = inlineValue = isValueArr ? value[0] : value;
  } // Do not show generated series name. It might not be readable.


  var seriesNameSpecified = isNameSpecified(series);
  var seriesName = seriesNameSpecified && series.name || '';
  var itemName = data.getName(dataIndex);
  var inlineName = multipleSeries ? seriesName : itemName;
  return createTooltipMarkup('section', {
    header: seriesName,
    // When series name not specified, do not show a header line with only '-'.
    // This case alway happen in tooltip.trigger: 'item'.
    noHeader: multipleSeries || !seriesNameSpecified,
    sortParam: sortParam,
    blocks: [createTooltipMarkup('nameValue', {
      markerType: 'item',
      markerColor: markerColor,
      // Do not mix display seriesName and itemName in one tooltip,
      // which might confuses users.
      name: inlineName,
      // name dimension might be auto assigned, where the name might
      // be not readable. So we check trim here.
      noName: !trim(inlineName),
      value: inlineValue,
      valueType: inlineValueType
    })].concat(subBlocks || [])
  });
}

function formatTooltipArrayValue(value, series, dataIndex, tooltipDims, colorStr) {
  // check: category-no-encode-has-axis-data in dataset.html
  var data = series.getData();
  var isValueMultipleLine = reduce(value, function (isValueMultipleLine, val, idx) {
    var dimItem = data.getDimensionInfo(idx);
    return isValueMultipleLine = isValueMultipleLine || dimItem && dimItem.tooltip !== false && dimItem.displayName != null;
  }, false);
  var inlineValues = [];
  var inlineValueTypes = [];
  var blocks = [];
  tooltipDims.length ? each$1(tooltipDims, function (dim) {
    setEachItem(retrieveRawValue(data, dataIndex, dim), dim);
  }) // By default, all dims is used on tooltip.
  : each$1(value, setEachItem);

  function setEachItem(val, dim) {
    var dimInfo = data.getDimensionInfo(dim); // If `dimInfo.tooltip` is not set, show tooltip.

    if (!dimInfo || dimInfo.otherDims.tooltip === false) {
      return;
    }

    if (isValueMultipleLine) {
      blocks.push(createTooltipMarkup('nameValue', {
        markerType: 'subItem',
        markerColor: colorStr,
        name: dimInfo.displayName,
        value: val,
        valueType: dimInfo.type
      }));
    } else {
      inlineValues.push(val);
      inlineValueTypes.push(dimInfo.type);
    }
  }

  return {
    inlineValues: inlineValues,
    inlineValueTypes: inlineValueTypes,
    blocks: blocks
  };
}

var inner$1 = makeInner();

function getSelectionKey(data, dataIndex) {
  return data.getName(dataIndex) || data.getId(dataIndex);
}

var SeriesModel =
/** @class */
function (_super) {
  __extends(SeriesModel, _super);

  function SeriesModel() {
    // [Caution]: Becuase this class or desecendants can be used as `XXX.extend(subProto)`,
    // the class members must not be initialized in constructor or declaration place.
    // Otherwise there is bad case:
    //   class A {xxx = 1;}
    //   enableClassExtend(A);
    //   class B extends A {}
    //   var C = B.extend({xxx: 5});
    //   var c = new C();
    //   console.log(c.xxx); // expect 5 but always 1.
    var _this = _super !== null && _super.apply(this, arguments) || this; // ---------------------------------------
    // Props about data selection
    // ---------------------------------------


    _this._selectedDataIndicesMap = {};
    return _this;
  }

  SeriesModel.prototype.init = function (option, parentModel, ecModel) {
    this.seriesIndex = this.componentIndex;
    this.dataTask = createTask({
      count: dataTaskCount,
      reset: dataTaskReset
    });
    this.dataTask.context = {
      model: this
    };
    this.mergeDefaultAndTheme(option, ecModel);
    var sourceManager = inner$1(this).sourceManager = new SourceManager(this);
    sourceManager.prepareSource();
    var data = this.getInitialData(option, ecModel);
    wrapData(data, this);
    this.dataTask.context.data = data;

    inner$1(this).dataBeforeProcessed = data; // If we reverse the order (make data firstly, and then make
    // dataBeforeProcessed by cloneShallow), cloneShallow will
    // cause data.graph.data !== data when using
    // module:echarts/data/Graph or module:echarts/data/Tree.
    // See module:echarts/data/helper/linkList
    // Theoretically, it is unreasonable to call `seriesModel.getData()` in the model
    // init or merge stage, because the data can be restored. So we do not `restoreData`
    // and `setData` here, which forbids calling `seriesModel.getData()` in this stage.
    // Call `seriesModel.getRawData()` instead.
    // this.restoreData();

    autoSeriesName(this);

    this._initSelectedMapFromData(data);
  };
  /**
   * Util for merge default and theme to option
   */


  SeriesModel.prototype.mergeDefaultAndTheme = function (option, ecModel) {
    var layoutMode = fetchLayoutMode(this);
    var inputPositionParams = layoutMode ? getLayoutParams(option) : {}; // Backward compat: using subType on theme.
    // But if name duplicate between series subType
    // (for example: parallel) add component mainType,
    // add suffix 'Series'.

    var themeSubType = this.subType;

    if (ComponentModel.hasClass(themeSubType)) {
      themeSubType += 'Series';
    }

    merge(option, ecModel.getTheme().get(this.subType));
    merge(option, this.getDefaultOption()); // Default label emphasis `show`

    defaultEmphasis(option, 'label', ['show']);
    this.fillDataTextStyle(option.data);

    if (layoutMode) {
      mergeLayoutParam(option, inputPositionParams, layoutMode);
    }
  };

  SeriesModel.prototype.mergeOption = function (newSeriesOption, ecModel) {
    // this.settingTask.dirty();
    newSeriesOption = merge(this.option, newSeriesOption, true);
    this.fillDataTextStyle(newSeriesOption.data);
    var layoutMode = fetchLayoutMode(this);

    if (layoutMode) {
      mergeLayoutParam(this.option, newSeriesOption, layoutMode);
    }

    var sourceManager = inner$1(this).sourceManager;
    sourceManager.dirty();
    sourceManager.prepareSource();
    var data = this.getInitialData(newSeriesOption, ecModel);
    wrapData(data, this);
    this.dataTask.dirty();
    this.dataTask.context.data = data;
    inner$1(this).dataBeforeProcessed = data;
    autoSeriesName(this);

    this._initSelectedMapFromData(data);
  };

  SeriesModel.prototype.fillDataTextStyle = function (data) {
    // Default data label emphasis `show`
    // FIXME Tree structure data ?
    // FIXME Performance ?
    if (data && !isTypedArray(data)) {
      var props = ['show'];

      for (var i = 0; i < data.length; i++) {
        if (data[i] && data[i].label) {
          defaultEmphasis(data[i], 'label', props);
        }
      }
    }
  };
  /**
   * Init a data structure from data related option in series
   * Must be overriden.
   */


  SeriesModel.prototype.getInitialData = function (option, ecModel) {
    return;
  };
  /**
   * Append data to list
   */


  SeriesModel.prototype.appendData = function (params) {
    // FIXME ???
    // (1) If data from dataset, forbidden append.
    // (2) support append data of dataset.
    var data = this.getRawData();
    data.appendData(params.data);
  };
  /**
   * Consider some method like `filter`, `map` need make new data,
   * We should make sure that `seriesModel.getData()` get correct
   * data in the stream procedure. So we fetch data from upstream
   * each time `task.perform` called.
   */


  SeriesModel.prototype.getData = function (dataType) {
    var task = getCurrentTask(this);

    if (task) {
      var data = task.context.data;
      return dataType == null ? data : data.getLinkedData(dataType);
    } else {
      // When series is not alive (that may happen when click toolbox
      // restore or setOption with not merge mode), series data may
      // be still need to judge animation or something when graphic
      // elements want to know whether fade out.
      return inner$1(this).data;
    }
  };

  SeriesModel.prototype.getAllData = function () {
    var mainData = this.getData();
    return mainData && mainData.getLinkedDataAll ? mainData.getLinkedDataAll() : [{
      data: mainData
    }];
  };

  SeriesModel.prototype.setData = function (data) {
    var task = getCurrentTask(this);

    if (task) {
      var context = task.context; // Consider case: filter, data sample.
      // FIXME:TS never used, so comment it
      // if (context.data !== data && task.modifyOutputEnd) {
      //     task.setOutputEnd(data.count());
      // }

      context.outputData = data; // Caution: setData should update context.data,
      // Because getData may be called multiply in a
      // single stage and expect to get the data just
      // set. (For example, AxisProxy, x y both call
      // getData and setDate sequentially).
      // So the context.data should be fetched from
      // upstream each time when a stage starts to be
      // performed.

      if (task !== this.dataTask) {
        context.data = data;
      }
    }

    inner$1(this).data = data;
  };

  SeriesModel.prototype.getSource = function () {
    return inner$1(this).sourceManager.getSource();
  };
  /**
   * Get data before processed
   */


  SeriesModel.prototype.getRawData = function () {
    return inner$1(this).dataBeforeProcessed;
  };
  /**
   * Get base axis if has coordinate system and has axis.
   * By default use coordSys.getBaseAxis();
   * Can be overrided for some chart.
   * @return {type} description
   */


  SeriesModel.prototype.getBaseAxis = function () {
    var coordSys = this.coordinateSystem; // @ts-ignore

    return coordSys && coordSys.getBaseAxis && coordSys.getBaseAxis();
  };
  /**
   * Default tooltip formatter
   *
   * @param dataIndex
   * @param multipleSeries
   * @param dataType
   * @param renderMode valid values: 'html'(by default) and 'richText'.
   *        'html' is used for rendering tooltip in extra DOM form, and the result
   *        string is used as DOM HTML content.
   *        'richText' is used for rendering tooltip in rich text form, for those where
   *        DOM operation is not supported.
   * @return formatted tooltip with `html` and `markers`
   *        Notice: The override method can also return string
   */


  SeriesModel.prototype.formatTooltip = function (dataIndex, multipleSeries, dataType) {
    return defaultSeriesFormatTooltip({
      series: this,
      dataIndex: dataIndex,
      multipleSeries: multipleSeries
    });
  };

  SeriesModel.prototype.isAnimationEnabled = function () {
    if (env.node) {
      return false;
    }

    var animationEnabled = this.getShallow('animation');

    if (animationEnabled) {
      if (this.getData().count() > this.getShallow('animationThreshold')) {
        animationEnabled = false;
      }
    }

    return !!animationEnabled;
  };

  SeriesModel.prototype.restoreData = function () {
    this.dataTask.dirty();
  };

  SeriesModel.prototype.getColorFromPalette = function (name, scope, requestColorNum) {
    var ecModel = this.ecModel; // PENDING

    var color = PaletteMixin.prototype.getColorFromPalette.call(this, name, scope, requestColorNum);

    if (!color) {
      color = ecModel.getColorFromPalette(name, scope, requestColorNum);
    }

    return color;
  };
  /**
   * Use `data.mapDimensionsAll(coordDim)` instead.
   * @deprecated
   */


  SeriesModel.prototype.coordDimToDataDim = function (coordDim) {
    return this.getRawData().mapDimensionsAll(coordDim);
  };
  /**
   * Get progressive rendering count each step
   */


  SeriesModel.prototype.getProgressive = function () {
    return this.get('progressive');
  };
  /**
   * Get progressive rendering count each step
   */


  SeriesModel.prototype.getProgressiveThreshold = function () {
    return this.get('progressiveThreshold');
  }; // PENGING If selectedMode is null ?


  SeriesModel.prototype.select = function (innerDataIndices, dataType) {
    this._innerSelect(this.getData(dataType), innerDataIndices);
  };

  SeriesModel.prototype.unselect = function (innerDataIndices, dataType) {
    var selectedMap = this.option.selectedMap;

    if (!selectedMap) {
      return;
    }

    var data = this.getData(dataType);

    for (var i = 0; i < innerDataIndices.length; i++) {
      var dataIndex = innerDataIndices[i];
      var nameOrId = getSelectionKey(data, dataIndex);
      selectedMap[nameOrId] = false;
      this._selectedDataIndicesMap[nameOrId] = -1;
    }
  };

  SeriesModel.prototype.toggleSelect = function (innerDataIndices, dataType) {
    var tmpArr = [];

    for (var i = 0; i < innerDataIndices.length; i++) {
      tmpArr[0] = innerDataIndices[i];
      this.isSelected(innerDataIndices[i], dataType) ? this.unselect(tmpArr, dataType) : this.select(tmpArr, dataType);
    }
  };

  SeriesModel.prototype.getSelectedDataIndices = function () {
    var selectedDataIndicesMap = this._selectedDataIndicesMap;
    var nameOrIds = keys(selectedDataIndicesMap);
    var dataIndices = [];

    for (var i = 0; i < nameOrIds.length; i++) {
      var dataIndex = selectedDataIndicesMap[nameOrIds[i]];

      if (dataIndex >= 0) {
        dataIndices.push(dataIndex);
      }
    }

    return dataIndices;
  };

  SeriesModel.prototype.isSelected = function (dataIndex, dataType) {
    var selectedMap = this.option.selectedMap;

    if (!selectedMap) {
      return false;
    }

    var data = this.getData(dataType);
    var nameOrId = getSelectionKey(data, dataIndex);
    return selectedMap[nameOrId] || false;
  };

  SeriesModel.prototype._innerSelect = function (data, innerDataIndices) {
    var _a, _b;

    var selectedMode = this.option.selectedMode;
    var len = innerDataIndices.length;

    if (!selectedMode || !len) {
      return;
    }

    if (selectedMode === 'multiple') {
      var selectedMap = this.option.selectedMap || (this.option.selectedMap = {});

      for (var i = 0; i < len; i++) {
        var dataIndex = innerDataIndices[i]; // TODO diffrent types of data share same object.

        var nameOrId = getSelectionKey(data, dataIndex);
        selectedMap[nameOrId] = true;
        this._selectedDataIndicesMap[nameOrId] = data.getRawIndex(dataIndex);
      }
    } else if (selectedMode === 'single' || selectedMode === true) {
      var lastDataIndex = innerDataIndices[len - 1];
      var nameOrId = getSelectionKey(data, lastDataIndex);
      this.option.selectedMap = (_a = {}, _a[nameOrId] = true, _a);
      this._selectedDataIndicesMap = (_b = {}, _b[nameOrId] = data.getRawIndex(lastDataIndex), _b);
    }
  };

  SeriesModel.prototype._initSelectedMapFromData = function (data) {
    // Ignore select info in data if selectedMap exists.
    // NOTE It's only for legacy usage. edge data is not supported.
    if (this.option.selectedMap) {
      return;
    }

    var dataIndices = [];

    if (data.hasItemOption) {
      data.each(function (idx) {
        var rawItem = data.getRawDataItem(idx);

        if (typeof rawItem === 'object' && rawItem.selected) {
          dataIndices.push(idx);
        }
      });
    }

    if (dataIndices.length > 0) {
      this._innerSelect(data, dataIndices);
    }
  }; // /**
  //  * @see {module:echarts/stream/Scheduler}
  //  */
  // abstract pipeTask: null


  SeriesModel.registerClass = function (clz) {
    return ComponentModel.registerClass(clz);
  };

  SeriesModel.protoInitialize = function () {
    var proto = SeriesModel.prototype;
    proto.type = 'series.__base__';
    proto.seriesIndex = 0;
    proto.useColorPaletteOnData = false;
    proto.ignoreStyleOnData = false;
    proto.hasSymbolVisual = false;
    proto.defaultSymbol = 'circle'; // Make sure the values can be accessed!

    proto.visualStyleAccessPath = 'itemStyle';
    proto.visualDrawType = 'fill';
  }();

  return SeriesModel;
}(ComponentModel);

mixin(SeriesModel, DataFormatMixin);
mixin(SeriesModel, PaletteMixin);
mountExtend(SeriesModel, ComponentModel);
/**
 * MUST be called after `prepareSource` called
 * Here we need to make auto series, especially for auto legend. But we
 * do not modify series.name in option to avoid side effects.
 */

function autoSeriesName(seriesModel) {
  // User specified name has higher priority, otherwise it may cause
  // series can not be queried unexpectedly.
  var name = seriesModel.name;

  if (!isNameSpecified(seriesModel)) {
    seriesModel.name = getSeriesAutoName(seriesModel) || name;
  }
}

function getSeriesAutoName(seriesModel) {
  var data = seriesModel.getRawData();
  var dataDims = data.mapDimensionsAll('seriesName');
  var nameArr = [];
  each$1(dataDims, function (dataDim) {
    var dimInfo = data.getDimensionInfo(dataDim);
    dimInfo.displayName && nameArr.push(dimInfo.displayName);
  });
  return nameArr.join(' ');
}

function dataTaskCount(context) {
  return context.model.getRawData().count();
}

function dataTaskReset(context) {
  var seriesModel = context.model;
  seriesModel.setData(seriesModel.getRawData().cloneShallow());
  return dataTaskProgress;
}

function dataTaskProgress(param, context) {
  // Avoid repead cloneShallow when data just created in reset.
  if (context.outputData && param.end > context.outputData.count()) {
    context.model.getRawData().cloneShallow(context.outputData);
  }
} // TODO refactor


function wrapData(data, seriesModel) {
  each$1(__spreadArrays(data.CHANGABLE_METHODS, data.DOWNSAMPLE_METHODS), function (methodName) {
    data.wrapMethod(methodName, curry(onDataChange, seriesModel));
  });
}

function onDataChange(seriesModel, newList) {
  var task = getCurrentTask(seriesModel);

  if (task) {
    // Consider case: filter, selectRange
    task.setOutputEnd((newList || this).count());
  }

  return newList;
}

function getCurrentTask(seriesModel) {
  var scheduler = (seriesModel.ecModel || {}).scheduler;
  var pipeline = scheduler && scheduler.getPipeline(seriesModel.uid);

  if (pipeline) {
    // When pipline finished, the currrentTask keep the last
    // task (renderTask).
    var task = pipeline.currentTask;

    if (task) {
      var agentStubMap = task.agentStubMap;

      if (agentStubMap) {
        task = agentStubMap.get(seriesModel.uid);
      }
    }

    return task;
  }
}

/**
 * Triangle shape
 * @inner
 */

var Triangle = Path.extend({
  type: 'triangle',
  shape: {
    cx: 0,
    cy: 0,
    width: 0,
    height: 0
  },
  buildPath: function (path, shape) {
    var cx = shape.cx;
    var cy = shape.cy;
    var width = shape.width / 2;
    var height = shape.height / 2;
    path.moveTo(cx, cy - height);
    path.lineTo(cx + width, cy + height);
    path.lineTo(cx - width, cy + height);
    path.closePath();
  }
});
/**
 * Diamond shape
 * @inner
 */

var Diamond = Path.extend({
  type: 'diamond',
  shape: {
    cx: 0,
    cy: 0,
    width: 0,
    height: 0
  },
  buildPath: function (path, shape) {
    var cx = shape.cx;
    var cy = shape.cy;
    var width = shape.width / 2;
    var height = shape.height / 2;
    path.moveTo(cx, cy - height);
    path.lineTo(cx + width, cy);
    path.lineTo(cx, cy + height);
    path.lineTo(cx - width, cy);
    path.closePath();
  }
});
/**
 * Pin shape
 * @inner
 */

var Pin = Path.extend({
  type: 'pin',
  shape: {
    // x, y on the cusp
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function (path, shape) {
    var x = shape.x;
    var y = shape.y;
    var w = shape.width / 5 * 3; // Height must be larger than width

    var h = Math.max(w, shape.height);
    var r = w / 2; // Dist on y with tangent point and circle center

    var dy = r * r / (h - r);
    var cy = y - h + r + dy;
    var angle = Math.asin(dy / r); // Dist on x with tangent point and circle center

    var dx = Math.cos(angle) * r;
    var tanX = Math.sin(angle);
    var tanY = Math.cos(angle);
    var cpLen = r * 0.6;
    var cpLen2 = r * 0.7;
    path.moveTo(x - dx, cy + dy);
    path.arc(x, cy, r, Math.PI - angle, Math.PI * 2 + angle);
    path.bezierCurveTo(x + dx - tanX * cpLen, cy + dy + tanY * cpLen, x, y - cpLen2, x, y);
    path.bezierCurveTo(x, y - cpLen2, x - dx + tanX * cpLen, cy + dy + tanY * cpLen, x - dx, cy + dy);
    path.closePath();
  }
});
/**
 * Arrow shape
 * @inner
 */

var Arrow = Path.extend({
  type: 'arrow',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function (ctx, shape) {
    var height = shape.height;
    var width = shape.width;
    var x = shape.x;
    var y = shape.y;
    var dx = width / 3 * 2;
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + height);
    ctx.lineTo(x, y + height / 4 * 3);
    ctx.lineTo(x - dx, y + height);
    ctx.lineTo(x, y);
    ctx.closePath();
  }
});
/**
 * Map of path contructors
 */
// TODO Use function to build symbol path.

var symbolCtors = {
  // Use small height rect to simulate line.
  // Avoid using stroke.
  line: Rect,
  rect: Rect,
  roundRect: Rect,
  square: Rect,
  circle: Circle,
  diamond: Diamond,
  pin: Pin,
  arrow: Arrow,
  triangle: Triangle
}; // NOTICE Only use fill. No line!

var symbolShapeMakers = {
  line: function (x, y, w, h, shape) {
    var thickness = 2; // A thin line

    shape.x = x;
    shape.y = y + h / 2 - thickness / 2;
    shape.width = w;
    shape.height = thickness;
  },
  rect: function (x, y, w, h, shape) {
    shape.x = x;
    shape.y = y;
    shape.width = w;
    shape.height = h;
  },
  roundRect: function (x, y, w, h, shape) {
    shape.x = x;
    shape.y = y;
    shape.width = w;
    shape.height = h;
    shape.r = Math.min(w, h) / 4;
  },
  square: function (x, y, w, h, shape) {
    var size = Math.min(w, h);
    shape.x = x;
    shape.y = y;
    shape.width = size;
    shape.height = size;
  },
  circle: function (x, y, w, h, shape) {
    // Put circle in the center of square
    shape.cx = x + w / 2;
    shape.cy = y + h / 2;
    shape.r = Math.min(w, h) / 2;
  },
  diamond: function (x, y, w, h, shape) {
    shape.cx = x + w / 2;
    shape.cy = y + h / 2;
    shape.width = w;
    shape.height = h;
  },
  pin: function (x, y, w, h, shape) {
    shape.x = x + w / 2;
    shape.y = y + h / 2;
    shape.width = w;
    shape.height = h;
  },
  arrow: function (x, y, w, h, shape) {
    shape.x = x + w / 2;
    shape.y = y + h / 2;
    shape.width = w;
    shape.height = h;
  },
  triangle: function (x, y, w, h, shape) {
    shape.cx = x + w / 2;
    shape.cy = y + h / 2;
    shape.width = w;
    shape.height = h;
  }
};
var symbolBuildProxies = {};
each$1(symbolCtors, function (Ctor, name) {
  symbolBuildProxies[name] = new Ctor();
});
var SymbolClz = Path.extend({
  type: 'symbol',
  shape: {
    symbolType: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  calculateTextPosition: function (out, config, rect) {
    var res = calculateTextPosition(out, config, rect);
    var shape = this.shape;

    if (shape && shape.symbolType === 'pin' && config.position === 'inside') {
      res.y = rect.y + rect.height * 0.4;
    }

    return res;
  },
  buildPath: function (ctx, shape, inBundle) {
    var symbolType = shape.symbolType;

    if (symbolType !== 'none') {
      var proxySymbol = symbolBuildProxies[symbolType];

      if (!proxySymbol) {
        // Default rect
        symbolType = 'rect';
        proxySymbol = symbolBuildProxies[symbolType];
      }

      symbolShapeMakers[symbolType](shape.x, shape.y, shape.width, shape.height, proxySymbol.shape);
      proxySymbol.buildPath(ctx, proxySymbol.shape, inBundle);
    }
  }
}); // Provide setColor helper method to avoid determine if set the fill or stroke outside

function symbolPathSetColor(color, innerColor) {
  if (this.type !== 'image') {
    var symbolStyle = this.style;

    if (this.__isEmptyBrush) {
      symbolStyle.stroke = color;
      symbolStyle.fill = innerColor || '#fff'; // TODO Same width with lineStyle in LineView.

      symbolStyle.lineWidth = 2;
    } else {
      symbolStyle.fill = color;
    }

    this.markRedraw();
  }
}
/**
 * Create a symbol element with given symbol configuration: shape, x, y, width, height, color
 */


function createSymbol(symbolType, x, y, w, h, color, // whether to keep the ratio of w/h,
keepAspect) {
  // TODO Support image object, DynamicImage.
  var isEmpty = symbolType.indexOf('empty') === 0;

  if (isEmpty) {
    symbolType = symbolType.substr(5, 1).toLowerCase() + symbolType.substr(6);
  }

  var symbolPath;

  if (symbolType.indexOf('image://') === 0) {
    symbolPath = makeImage(symbolType.slice(8), new BoundingRect(x, y, w, h), keepAspect ? 'center' : 'cover');
  } else if (symbolType.indexOf('path://') === 0) {
    symbolPath = makePath(symbolType.slice(7), {}, new BoundingRect(x, y, w, h), keepAspect ? 'center' : 'cover');
  } else {
    symbolPath = new SymbolClz({
      shape: {
        symbolType: symbolType,
        x: x,
        y: y,
        width: w,
        height: h
      }
    });
  }

  symbolPath.__isEmptyBrush = isEmpty; // TODO Should deprecate setColor

  symbolPath.setColor = symbolPathSetColor;

  if (color) {
    symbolPath.setColor(color);
  }

  return symbolPath;
}

/**
 * @return {string} If large mode changed, return string 'reset';
 */

function createRenderPlanner() {
  var inner = makeInner();
  return function (seriesModel) {
    var fields = inner(seriesModel);
    var pipelineContext = seriesModel.pipelineContext;
    var originalLarge = !!fields.large;
    var originalProgressive = !!fields.progressiveRender; // FIXME: if the planner works on a filtered series, `pipelineContext` does not
    // exists. See #11611 . Probably we need to modify this structure, see the comment
    // on `performRawSeries` in `Schedular.js`.

    var large = fields.large = !!(pipelineContext && pipelineContext.large);
    var progressive = fields.progressiveRender = !!(pipelineContext && pipelineContext.progressiveRender);
    return !!(originalLarge !== large || originalProgressive !== progressive) && 'reset';
  };
}

var inner = makeInner();
var renderPlanner = createRenderPlanner();

var ChartView =
/** @class */
function () {
  function ChartView() {
    this.group = new Group();
    this.uid = getUID('viewChart');
    this.renderTask = createTask({
      plan: renderTaskPlan,
      reset: renderTaskReset
    });
    this.renderTask.context = {
      view: this
    };
  }

  ChartView.prototype.init = function (ecModel, api) {};

  ChartView.prototype.render = function (seriesModel, ecModel, api, payload) {};
  /**
   * Highlight series or specified data item.
   */


  ChartView.prototype.highlight = function (seriesModel, ecModel, api, payload) {
    toggleHighlight(seriesModel.getData(), payload, 'emphasis');
  };
  /**
   * Downplay series or specified data item.
   */


  ChartView.prototype.downplay = function (seriesModel, ecModel, api, payload) {
    toggleHighlight(seriesModel.getData(), payload, 'normal');
  };
  /**
   * Remove self.
   */


  ChartView.prototype.remove = function (ecModel, api) {
    this.group.removeAll();
  };
  /**
   * Dispose self.
   */


  ChartView.prototype.dispose = function (ecModel, api) {};

  ChartView.prototype.updateView = function (seriesModel, ecModel, api, payload) {
    this.render(seriesModel, ecModel, api, payload);
  }; // FIXME never used?


  ChartView.prototype.updateLayout = function (seriesModel, ecModel, api, payload) {
    this.render(seriesModel, ecModel, api, payload);
  }; // FIXME never used?


  ChartView.prototype.updateVisual = function (seriesModel, ecModel, api, payload) {
    this.render(seriesModel, ecModel, api, payload);
  };

  ChartView.markUpdateMethod = function (payload, methodName) {
    inner(payload).updateMethod = methodName;
  };

  ChartView.protoInitialize = function () {
    var proto = ChartView.prototype;
    proto.type = 'chart';
  }();

  return ChartView;
}();
/**
 * Set state of single element
 */

function elSetState(el, state, highlightDigit) {
  if (el) {
    (state === 'emphasis' ? enterEmphasis : leaveEmphasis)(el, highlightDigit);
  }
}

function toggleHighlight(data, payload, state) {
  var dataIndex = queryDataIndex(data, payload);
  var highlightDigit = payload && payload.highlightKey != null ? getHighlightDigit(payload.highlightKey) : null;

  if (dataIndex != null) {
    each$1(normalizeToArray(dataIndex), function (dataIdx) {
      elSetState(data.getItemGraphicEl(dataIdx), state, highlightDigit);
    });
  } else {
    data.eachItemGraphicEl(function (el) {
      elSetState(el, state, highlightDigit);
    });
  }
}

enableClassExtend(ChartView);
enableClassManagement(ChartView);

function renderTaskPlan(context) {
  return renderPlanner(context.model);
}

function renderTaskReset(context) {
  var seriesModel = context.model;
  var ecModel = context.ecModel;
  var api = context.api;
  var payload = context.payload; // FIXME: remove updateView updateVisual

  var progressiveRender = seriesModel.pipelineContext.progressiveRender;
  var view = context.view;
  var updateMethod = payload && inner(payload).updateMethod;
  var methodName = progressiveRender ? 'incrementalPrepareRender' : updateMethod && view[updateMethod] ? updateMethod // `appendData` is also supported when data amount
  // is less than progressive threshold.
  : 'render';

  if (methodName !== 'render') {
    view[methodName](seriesModel, ecModel, api, payload);
  }

  return progressMethodMap[methodName];
}

var progressMethodMap = {
  incrementalPrepareRender: {
    progress: function (params, context) {
      context.view.incrementalRender(params, context.model, context.ecModel, context.api, context.payload);
    }
  },
  render: {
    // Put view.render in `progress` to support appendData. But in this case
    // view.render should not be called in reset, otherwise it will be called
    // twise. Use `forceFirstProgress` to make sure that view.render is called
    // in any cases.
    forceFirstProgress: true,
    progress: function (params, context) {
      context.view.render(context.model, context.ecModel, context.api, context.payload);
    }
  }
};

export { remRadian as $, isDataItemOption as A, SOURCE_FORMAT_ORIGINAL as B, ChartView as C, DefaultDataProvider as D, createSourceFromSeriesDataOption as E, normalizeToArray as F, Group as G, guessOrdinal as H, BE_ORDINAL as I, SINGLE_REFERRING as J, CoordinateSystemManager as K, LinearGradient as L, Model as M, makeSeriesEncodeForAxisCoordSys as N, enableDataStack as O, getDataItemValue as P, ComponentModel as Q, Rect as R, SeriesModel as S, fetchLayoutMode as T, getLayoutParams as U, VISUAL_DIMENSIONS as V, mergeLayoutParam as W, getLayoutRect as X, Line as Y, ZRText as Z, createTextStyle as _, enableHoverEmphasis as a, DOWNPLAY_ACTION_TYPE as a$, isRadianAroundZero as a0, makeInner as a1, groupTransition as a2, graphic as a3, createIcon as a4, applyTransform as a5, normalizeCssArray as a6, MULTIPLE_REFERRING as a7, linearMap as a8, getPixelPrecision as a9, isComponentIdInternal as aA, PaletteMixin as aB, TEXT_STYLE_OPTIONS as aC, enableClassExtend as aD, enableClassManagement as aE, getUID as aF, makeStyleMapper as aG, ITEM_STYLE_KEY_MAP as aH, LINE_STYLE_KEY_MAP as aI, Arc as aJ, createTask as aK, parseClassType as aL, isElementRemoved as aM, animateLabelValue as aN, getLeastCommonMultiple as aO, parseFinder as aP, setAttribute as aQ, isSelectChangePayload as aR, isHighDownPayload as aS, getAllSelectedIndices as aT, updateSeriesElementSelection as aU, HOVER_STATE_EMPHASIS as aV, HOVER_STATE_BLUR as aW, savePathStates as aX, getAttribute as aY, registerExternalTransform as aZ, HIGHLIGHT_ACTION_TYPE as a_, asc as aa, getPaddingFromTooltipModel as ab, toCamelCase as ac, throwError as ad, getTooltipRenderMode as ae, createTooltipMarkup as af, normalizeTooltipFormatResult as ag, buildTooltipMarkup as ah, format as ai, formatTpl as aj, TooltipMarkupStyleCreator as ak, windowOpen as al, isNameSpecified as am, box as an, inheritDefaultOption as ao, symbolBuildProxies as ap, getTransform as aq, transformDirection as ar, Polygon as as, Polyline as at, DISPLAY_STATES as au, SPECIAL_STATES as av, OrientedBoundingRect as aw, resetSourceDefaulter as ax, mappingToExists as ay, setComponentTypeToKeyInfo as az, getECData as b, registerShape as b$, SELECT_ACTION_TYPE as b0, UNSELECT_ACTION_TYPE as b1, TOGGLE_SELECT_ACTION_TYPE as b2, createLocaleObject as b3, SYSTEM_LANG as b4, toggleSeriesBlurStateFromPayload as b5, toggleSelectionFromPayload as b6, enterBlur as b7, leaveBlur as b8, enterSelect as b9, monthSetterName as bA, millisecondsGetterName as bB, secondsGetterName as bC, minutesGetterName as bD, hoursGetterName as bE, dateGetterName as bF, monthGetterName as bG, fullYearGetterName as bH, fullYearSetterName as bI, quantity as bJ, getStackedDimension as bK, getPrecision as bL, getPercentWithPrecision as bM, MAX_SAFE_INTEGER as bN, quantityExponent as bO, quantile as bP, reformIntervals as bQ, isNumeric as bR, numericToNumber as bS, extendShape as bT, extendPath as bU, makePath as bV, makeImage as bW, mergePath as bX, resizePath as bY, clipPointsByRect as bZ, clipRectByRect as b_, leaveSelect as ba, isHighDownDispatcher as bb, toggleSeriesBlurState as bc, enterEmphasisWhenMouseOver as bd, leaveEmphasisWhenMouseOut as be, getPrecisionSafe as bf, nice as bg, addCommas as bh, fullLeveledFormatter as bi, getDefaultFormatPrecisionOfInterval as bj, getPrimaryTimeUnit as bk, leveledFormat as bl, ONE_DAY as bm, parseDate as bn, ONE_SECOND as bo, ONE_MINUTE as bp, ONE_HOUR as bq, ONE_YEAR as br, isPrimaryTimeUnit as bs, timeUnits as bt, getUnitValue as bu, secondsSetterName as bv, millisecondsSetterName as bw, minutesSetterName as bx, hoursSetterName as by, dateSetterName as bz, createSymbol as c, getShapeClass as c0, Circle as c1, Ellipse as c2, Ring as c3, BezierCurve as c4, CompoundPath as c5, RadialGradient as c6, encodeHTML as c7, getTooltipMarker as c8, formatTime as c9, capitalFirst as ca, truncateText as cb, registerLocale as cc, removeElement as d, enterEmphasis as e, isDimensionStacked as f, getLabelStatesModels as g, round as h, initProps as i, Sector as j, convertToColorString as k, leaveEmphasis as l, setStatesStylesFromModel as m, setStatesFlag as n, interpolateRawValues as o, parsePercent as p, queryDataIndex as q, retrieveRawValue as r, setLabelStyle as s, labelInner as t, updateProps as u, createRenderPlanner as v, isSourceInstance as w, SOURCE_FORMAT_TYPED_ARRAY as x, convertOptionIdName as y, parseDataValue as z };
