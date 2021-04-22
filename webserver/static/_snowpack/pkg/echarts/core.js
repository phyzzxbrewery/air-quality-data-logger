import { aO as windingLine, aP as fromPoints, X as min, Y as max, G as BoundingRect, S as applyTransform, m as map, am as filter, g as each, ag as mixin, Z as ZRImage, ae as IncrementalDisplayable, k as indexOf, q as inherits, x as reduce, ak as bind, p as curry, i as isArray, n as isString, a as isObject, o as isFunction, e as extend, f as defaults, l as clone, af as merge } from '../common/IncrementalDisplayable-eed1c2a2.js';
export { aT as color, N as env, aQ as matrix, aR as vector, aS as zrUtil } from '../common/IncrementalDisplayable-eed1c2a2.js';
import { c as createListFromArray, a as createDimensions } from '../common/createListFromArray-18498de1.js';
export { L as List } from '../common/createListFromArray-18498de1.js';
import { Z as ZRText, f as isDimensionStacked, O as enableDataStack, bK as getStackedDimension, _ as createTextStyle$1, M as Model, X as getLayoutRect, b as getECData, c as createSymbol, a as enableHoverEmphasis, a8 as linearMap, h as round, aa as asc, bL as getPrecision, bf as getPrecisionSafe, a9 as getPixelPrecision, bM as getPercentWithPrecision, bN as MAX_SAFE_INTEGER, $ as remRadian, a0 as isRadianAroundZero, bn as parseDate, bJ as quantity, bO as quantityExponent, bg as nice, bP as quantile, bQ as reformIntervals, bR as isNumeric, bS as numericToNumber, ai as format$1, bT as extendShape, bU as extendPath, bV as makePath, bW as makeImage, bX as mergePath, bY as resizePath, a4 as createIcon, u as updateProps, i as initProps, aq as getTransform, bZ as clipPointsByRect, b_ as clipRectByRect, b$ as registerShape, c0 as getShapeClass, G as Group, c1 as Circle, c2 as Ellipse, j as Sector, c3 as Ring, as as Polygon, at as Polyline, R as Rect, Y as Line, c4 as BezierCurve, aJ as Arc, c5 as CompoundPath, L as LinearGradient, c6 as RadialGradient, bh as addCommas, ac as toCamelCase, a6 as normalizeCssArray, c7 as encodeHTML, aj as formatTpl, c8 as getTooltipMarker, c9 as formatTime, ca as capitalFirst, cb as truncateText, Q as ComponentModel, S as SeriesModel, C as ChartView } from '../common/Chart-15166683.js';
export { C as ChartView, Q as ComponentModel, M as Model, S as SeriesModel, cc as registerLocale } from '../common/Chart-15166683.js';
import { c as createScaleByModel, n as niceScaleExtent, A as AxisModelCommonMixin, C as ComponentView } from '../common/Axis-31e5f396.js';
export { a as Axis, C as ComponentView, P as PRIORITY, w as connect, U as dataTool, p as dependencies, x as disConnect, y as disconnect, z as dispose, K as getCoordinateSystemDimensions, B as getInstanceByDom, D as getInstanceById, S as getMap, q as init, r as registerAction, J as registerCoordinateSystem, L as registerLayout, N as registerLoading, R as registerMap, H as registerPostInit, I as registerPostUpdate, F as registerPreprocessor, G as registerProcessor, E as registerTheme, T as registerTransform, M as registerVisual, Q as setCanvasCreator, W as throttle, u as use, v as version, V as zrender } from '../common/Axis-31e5f396.js';
export { b as innerDrawElementOnCanvas } from '../common/graphic-69704314.js';

function getTextRect(text, font, align, verticalAlign, padding, rich, truncate, lineHeight) {
  var textEl = new ZRText({
    style: {
      text: text,
      font: font,
      align: align,
      verticalAlign: verticalAlign,
      padding: padding,
      rich: rich,
      overflow: truncate ? 'truncate' : null,
      lineHeight: lineHeight
    }
  });
  return textEl.getBoundingRect();
}

var EPSILON = 1e-8;
function isAroundEqual(a, b) {
    return Math.abs(a - b) < EPSILON;
}
function contain(points, x, y) {
    var w = 0;
    var p = points[0];
    if (!p) {
        return false;
    }
    for (var i = 1; i < points.length; i++) {
        var p2 = points[i];
        w += windingLine(p[0], p[1], p2[0], p2[1], x, y);
        p = p2;
    }
    var p0 = points[0];
    if (!isAroundEqual(p[0], p0[0]) || !isAroundEqual(p[1], p0[1])) {
        w += windingLine(p[0], p[1], p0[0], p0[1], x, y);
    }
    return w !== 0;
}

var Region =
/** @class */
function () {
  function Region(name, geometries, cp) {
    this.name = name;
    this.geometries = geometries;

    if (!cp) {
      var rect = this.getBoundingRect();
      cp = [rect.x + rect.width / 2, rect.y + rect.height / 2];
    } else {
      cp = [cp[0], cp[1]];
    }

    this.center = cp;
  }

  Region.prototype.getBoundingRect = function () {
    var rect = this._rect;

    if (rect) {
      return rect;
    }

    var MAX_NUMBER = Number.MAX_VALUE;
    var min$1 = [MAX_NUMBER, MAX_NUMBER];
    var max$1 = [-MAX_NUMBER, -MAX_NUMBER];
    var min2 = [];
    var max2 = [];
    var geometries = this.geometries;
    var i = 0;

    for (; i < geometries.length; i++) {
      // Only support polygon
      if (geometries[i].type !== 'polygon') {
        continue;
      } // Doesn't consider hole


      var exterior = geometries[i].exterior;
      fromPoints(exterior, min2, max2);
      min(min$1, min$1, min2);
      max(max$1, max$1, max2);
    } // No data


    if (i === 0) {
      min$1[0] = min$1[1] = max$1[0] = max$1[1] = 0;
    }

    return this._rect = new BoundingRect(min$1[0], min$1[1], max$1[0] - min$1[0], max$1[1] - min$1[1]);
  };

  Region.prototype.contain = function (coord) {
    var rect = this.getBoundingRect();
    var geometries = this.geometries;

    if (!rect.contain(coord[0], coord[1])) {
      return false;
    }

    loopGeo: for (var i = 0, len = geometries.length; i < len; i++) {
      // Only support polygon.
      if (geometries[i].type !== 'polygon') {
        continue;
      }

      var exterior = geometries[i].exterior;
      var interiors = geometries[i].interiors;

      if (contain(exterior, coord[0], coord[1])) {
        // Not in the region if point is in the hole.
        for (var k = 0; k < (interiors ? interiors.length : 0); k++) {
          if (contain(interiors[k], coord[0], coord[1])) {
            continue loopGeo;
          }
        }

        return true;
      }
    }

    return false;
  };

  Region.prototype.transformTo = function (x, y, width, height) {
    var rect = this.getBoundingRect();
    var aspect = rect.width / rect.height;

    if (!width) {
      width = aspect * height;
    } else if (!height) {
      height = width / aspect;
    }

    var target = new BoundingRect(x, y, width, height);
    var transform = rect.calculateTransform(target);
    var geometries = this.geometries;

    for (var i = 0; i < geometries.length; i++) {
      // Only support polygon.
      if (geometries[i].type !== 'polygon') {
        continue;
      }

      var exterior = geometries[i].exterior;
      var interiors = geometries[i].interiors;

      for (var p = 0; p < exterior.length; p++) {
        applyTransform(exterior[p], exterior[p], transform);
      }

      for (var h = 0; h < (interiors ? interiors.length : 0); h++) {
        for (var p = 0; p < interiors[h].length; p++) {
          applyTransform(interiors[h][p], interiors[h][p], transform);
        }
      }
    }

    rect = this._rect;
    rect.copy(target); // Update center

    this.center = [rect.x + rect.width / 2, rect.y + rect.height / 2];
  };

  Region.prototype.cloneShallow = function (name) {
    name == null && (name = this.name);
    var newRegion = new Region(name, this.geometries, this.center);
    newRegion._rect = this._rect;
    newRegion.transformTo = null; // Simply avoid to be called.

    return newRegion;
  };

  return Region;
}();

function decode(json) {
  if (!json.UTF8Encoding) {
    return json;
  }

  var jsonCompressed = json;
  var encodeScale = jsonCompressed.UTF8Scale;

  if (encodeScale == null) {
    encodeScale = 1024;
  }

  var features = jsonCompressed.features;

  for (var f = 0; f < features.length; f++) {
    var feature = features[f];
    var geometry = feature.geometry;

    if (geometry.type === 'Polygon') {
      var coordinates = geometry.coordinates;

      for (var c = 0; c < coordinates.length; c++) {
        coordinates[c] = decodePolygon(coordinates[c], geometry.encodeOffsets[c], encodeScale);
      }
    } else if (geometry.type === 'MultiPolygon') {
      var coordinates = geometry.coordinates;

      for (var c = 0; c < coordinates.length; c++) {
        var coordinate = coordinates[c];

        for (var c2 = 0; c2 < coordinate.length; c2++) {
          coordinate[c2] = decodePolygon(coordinate[c2], geometry.encodeOffsets[c][c2], encodeScale);
        }
      }
    }
  } // Has been decoded


  jsonCompressed.UTF8Encoding = false;
  return jsonCompressed;
}

function decodePolygon(coordinate, encodeOffsets, encodeScale) {
  var result = [];
  var prevX = encodeOffsets[0];
  var prevY = encodeOffsets[1];

  for (var i = 0; i < coordinate.length; i += 2) {
    var x = coordinate.charCodeAt(i) - 64;
    var y = coordinate.charCodeAt(i + 1) - 64; // ZigZag decoding

    x = x >> 1 ^ -(x & 1);
    y = y >> 1 ^ -(y & 1); // Delta deocding

    x += prevX;
    y += prevY;
    prevX = x;
    prevY = y; // Dequantize

    result.push([x / encodeScale, y / encodeScale]);
  }

  return result;
}

function parseGeoJSON(geoJson, nameProperty) {
  geoJson = decode(geoJson);
  return map(filter(geoJson.features, function (featureObj) {
    // Output of mapshaper may have geometry null
    return featureObj.geometry && featureObj.properties && featureObj.geometry.coordinates.length > 0;
  }), function (featureObj) {
    var properties = featureObj.properties;
    var geo = featureObj.geometry;
    var geometries = [];

    if (geo.type === 'Polygon') {
      var coordinates = geo.coordinates;
      geometries.push({
        type: 'polygon',
        // According to the GeoJSON specification.
        // First must be exterior, and the rest are all interior(holes).
        exterior: coordinates[0],
        interiors: coordinates.slice(1)
      });
    }

    if (geo.type === 'MultiPolygon') {
      var coordinates = geo.coordinates;
      each(coordinates, function (item) {
        if (item[0]) {
          geometries.push({
            type: 'polygon',
            exterior: item[0],
            interiors: item.slice(1)
          });
        }
      });
    }

    var region = new Region(properties[nameProperty || 'name'], geometries, properties.cp);
    region.properties = properties;
    return region;
  });
}

/**
 * Create a muti dimension List structure from seriesModel.
 */

function createList(seriesModel) {
  return createListFromArray(seriesModel.getSource(), seriesModel);
} // export function createGraph(seriesModel) {
var dataStack = {
  isDimensionStacked: isDimensionStacked,
  enableDataStack: enableDataStack,
  getStackedDimension: getStackedDimension
};
/**
 * Create scale
 * @param {Array.<number>} dataExtent
 * @param {Object|module:echarts/Model} option If `optoin.type`
 *        is secified, it can only be `'value'` currently.
 */

function createScale(dataExtent, option) {
  var axisModel = option;

  if (!(option instanceof Model)) {
    axisModel = new Model(option); // FIXME
    // Currently AxisModelCommonMixin has nothing to do with the
    // the requirements of `axisHelper.createScaleByModel`. For
    // example the method `getCategories` and `getOrdinalMeta`
    // are required for `'category'` axis, and ecModel are required
    // for `'time'` axis. But occationally echarts-gl happened
    // to only use `'value'` axis.
    // zrUtil.mixin(axisModel, AxisModelCommonMixin);
  }

  var scale = createScaleByModel(axisModel);
  scale.setExtent(dataExtent[0], dataExtent[1]);
  niceScaleExtent(scale, axisModel);
  return scale;
}
/**
 * Mixin common methods to axis model,
 *
 * Inlcude methods
 * `getFormattedLabels() => Array.<string>`
 * `getCategories() => Array.<string>`
 * `getMin(origin: boolean) => number`
 * `getMax(origin: boolean) => number`
 * `getNeedCrossZero() => boolean`
 */

function mixinAxisModelCommonMethods(Model) {
  mixin(Model, AxisModelCommonMixin);
}
function createTextStyle(textStyleModel, opts) {
  opts = opts || {};
  return createTextStyle$1(textStyleModel, null, null, opts.state !== 'normal');
}

var helper = /*#__PURE__*/Object.freeze({
  __proto__: null,
  createList: createList,
  getLayoutRect: getLayoutRect,
  dataStack: dataStack,
  createScale: createScale,
  mixinAxisModelCommonMethods: mixinAxisModelCommonMethods,
  getECData: getECData,
  createTextStyle: createTextStyle,
  createDimensions: createDimensions,
  createSymbol: createSymbol,
  enableHoverEmphasis: enableHoverEmphasis
});

var number = /*#__PURE__*/Object.freeze({
  __proto__: null,
  linearMap: linearMap,
  round: round,
  asc: asc,
  getPrecision: getPrecision,
  getPrecisionSafe: getPrecisionSafe,
  getPixelPrecision: getPixelPrecision,
  getPercentWithPrecision: getPercentWithPrecision,
  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
  remRadian: remRadian,
  isRadianAroundZero: isRadianAroundZero,
  parseDate: parseDate,
  quantity: quantity,
  quantityExponent: quantityExponent,
  nice: nice,
  quantile: quantile,
  reformIntervals: reformIntervals,
  isNumeric: isNumeric,
  numericToNumber: numericToNumber
});

var time = /*#__PURE__*/Object.freeze({
  __proto__: null,
  parse: parseDate,
  format: format$1
});

var graphic = /*#__PURE__*/Object.freeze({
  __proto__: null,
  extendShape: extendShape,
  extendPath: extendPath,
  makePath: makePath,
  makeImage: makeImage,
  mergePath: mergePath,
  resizePath: resizePath,
  createIcon: createIcon,
  updateProps: updateProps,
  initProps: initProps,
  getTransform: getTransform,
  clipPointsByRect: clipPointsByRect,
  clipRectByRect: clipRectByRect,
  registerShape: registerShape,
  getShapeClass: getShapeClass,
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
  BoundingRect: BoundingRect
});

var format = /*#__PURE__*/Object.freeze({
  __proto__: null,
  addCommas: addCommas,
  toCamelCase: toCamelCase,
  normalizeCssArray: normalizeCssArray,
  encodeHTML: encodeHTML,
  formatTpl: formatTpl,
  getTooltipMarker: getTooltipMarker,
  formatTime: formatTime,
  capitalFirst: capitalFirst,
  truncateText: truncateText,
  getTextRect: getTextRect
});

var util = /*#__PURE__*/Object.freeze({
  __proto__: null,
  map: map,
  each: each,
  indexOf: indexOf,
  inherits: inherits,
  reduce: reduce,
  filter: filter,
  bind: bind,
  curry: curry,
  isArray: isArray,
  isString: isString,
  isObject: isObject,
  isFunction: isFunction,
  extend: extend,
  defaults: defaults,
  clone: clone,
  merge: merge
});

// Should use `ComponentModel.extend` or `class XXXX extend ComponentModel` to create class.
// Then use `registerComponentModel` in `install` parameter when `use` this extension. For example:
// class Bar3DModel extends ComponentModel {}
// export function install(registers) { regsiters.registerComponentModel(Bar3DModel); }
// echarts.use(install);

function extendComponentModel(proto) {
  var Model = ComponentModel.extend(proto);
  ComponentModel.registerClass(Model);
  return Model;
}
function extendComponentView(proto) {
  var View = ComponentView.extend(proto);
  ComponentView.registerClass(View);
  return View;
}
function extendSeriesModel(proto) {
  var Model = SeriesModel.extend(proto);
  SeriesModel.registerClass(Model);
  return Model;
}
function extendChartView(proto) {
  var View = ChartView.extend(proto);
  ChartView.registerClass(View);
  return View;
}

export { extendChartView, extendComponentModel, extendComponentView, extendSeriesModel, format, graphic, helper, number, parseGeoJSON, parseGeoJSON as parseGeoJson, time, util };
