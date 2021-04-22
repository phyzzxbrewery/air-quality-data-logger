import { g as each$2, E as keys, i as isArray, e as extend, ad as invert, a9 as Point, P as Path, v as retrieve2, f as defaults, ax as quadraticProjectPoint, ay as cubicProjectPoint, az as dist$1, aA as lerp, b as PathProxy, aB as normalizeRadian, G as BoundingRect, N as env, _ as __extends, ap as Eventful, U as Element, k as indexOf$1, aC as Animator, m as map, aD as noop, aE as guid, aF as lum, aG as DARK_MODE_THRESHOLD, h as createHashMap, l as clone, af as merge, am as filter, o as isFunction$1, n as isString, a as isObject$2, ag as mixin, ak as bind, ah as isTypedArray, aH as setAsPrimitive, r as assert$1, ac as Transformable, aI as createCanvas, R as LRU, Z as ZRImage, av as parse, aw as stringify, aJ as $override, aK as eqNaN, aL as parsePercent$1, ar as getBoundingRect } from './IncrementalDisplayable-eed1c2a2.js';
import { r as requestAnimationFrame, b as brushSingle } from './graphic-69704314.js';
import { p as parsePercent, v as createRenderPlanner, q as queryDataIndex, au as DISPLAY_STATES, at as Polyline, av as SPECIAL_STATES, aw as OrientedBoundingRect, G as Group, M as Model, ax as resetSourceDefaulter, Q as ComponentModel, F as normalizeToArray, ay as mappingToExists, az as setComponentTypeToKeyInfo, aA as isComponentIdInternal, y as convertOptionIdName, aB as PaletteMixin, aC as TEXT_STYLE_OPTIONS, aD as enableClassExtend, aE as enableClassManagement, aF as getUID, a1 as makeInner, aG as makeStyleMapper, aH as ITEM_STYLE_KEY_MAP, aI as LINE_STYLE_KEY_MAP, R as Rect, Z as ZRText, aJ as Arc, aK as createTask, aL as parseClassType, b as getECData, aM as isElementRemoved, t as labelInner, i as initProps, u as updateProps, aN as animateLabelValue, aO as getLeastCommonMultiple, c as createSymbol, aP as parseFinder, aQ as setAttribute, C as ChartView, aR as isSelectChangePayload, aS as isHighDownPayload, aT as getAllSelectedIndices, aU as updateSeriesElementSelection, aV as HOVER_STATE_EMPHASIS, aW as HOVER_STATE_BLUR, aX as savePathStates, ad as throwError, aY as getAttribute, K as CoordinateSystemManager, aZ as registerExternalTransform, a_ as HIGHLIGHT_ACTION_TYPE, a$ as DOWNPLAY_ACTION_TYPE, b0 as SELECT_ACTION_TYPE, b1 as UNSELECT_ACTION_TYPE, b2 as TOGGLE_SELECT_ACTION_TYPE, b3 as createLocaleObject, b4 as SYSTEM_LANG, S as SeriesModel, b5 as toggleSeriesBlurStateFromPayload, b6 as toggleSelectionFromPayload, e as enterEmphasis, l as leaveEmphasis, b7 as enterBlur, b8 as leaveBlur, b9 as enterSelect, ba as leaveSelect, bb as isHighDownDispatcher, bc as toggleSeriesBlurState, bd as enterEmphasisWhenMouseOver, be as leaveEmphasisWhenMouseOut, bf as getPrecisionSafe$1, bg as nice, h as round, bh as addCommas, ai as format, bi as fullLeveledFormatter, bj as getDefaultFormatPrecisionOfInterval, bk as getPrimaryTimeUnit, bl as leveledFormat, bm as ONE_DAY, bn as parseDate, bo as ONE_SECOND, bp as ONE_MINUTE, bq as ONE_HOUR, br as ONE_YEAR, bs as isPrimaryTimeUnit, bt as timeUnits, bu as getUnitValue, bv as secondsSetterName, bw as millisecondsSetterName, bx as minutesSetterName, by as hoursSetterName, bz as dateSetterName, bA as monthSetterName, bB as millisecondsGetterName, bC as secondsGetterName, bD as minutesGetterName, bE as hoursGetterName, bF as dateGetterName, bG as monthGetterName, bH as fullYearGetterName, bI as fullYearSetterName, bJ as quantity, bK as getStackedDimension, a9 as getPixelPrecision, a8 as linearMap } from './Chart-15166683.js';

var STACK_PREFIX = '__ec_stack_';
var LARGE_BAR_MIN_WIDTH = 0.5;
var LargeArr = typeof Float32Array !== 'undefined' ? Float32Array : Array;

function getSeriesStackId(seriesModel) {
  return seriesModel.get('stack') || STACK_PREFIX + seriesModel.seriesIndex;
}

function getAxisKey(axis) {
  return axis.dim + axis.index;
}
function prepareLayoutBarSeries(seriesType, ecModel) {
  var seriesModels = [];
  ecModel.eachSeriesByType(seriesType, function (seriesModel) {
    // Check series coordinate, do layout for cartesian2d only
    if (isOnCartesian(seriesModel) && !isInLargeMode(seriesModel)) {
      seriesModels.push(seriesModel);
    }
  });
  return seriesModels;
}
/**
 * Map from (baseAxis.dim + '_' + baseAxis.index) to min gap of two adjacent
 * values.
 * This works for time axes, value axes, and log axes.
 * For a single time axis, return value is in the form like
 * {'x_0': [1000000]}.
 * The value of 1000000 is in milliseconds.
 */

function getValueAxesMinGaps(barSeries) {
  /**
   * Map from axis.index to values.
   * For a single time axis, axisValues is in the form like
   * {'x_0': [1495555200000, 1495641600000, 1495728000000]}.
   * Items in axisValues[x], e.g. 1495555200000, are time values of all
   * series.
   */
  var axisValues = {};
  each$2(barSeries, function (seriesModel) {
    var cartesian = seriesModel.coordinateSystem;
    var baseAxis = cartesian.getBaseAxis();

    if (baseAxis.type !== 'time' && baseAxis.type !== 'value') {
      return;
    }

    var data = seriesModel.getData();
    var key = baseAxis.dim + '_' + baseAxis.index;
    var dim = data.mapDimension(baseAxis.dim);

    for (var i = 0, cnt = data.count(); i < cnt; ++i) {
      var value = data.get(dim, i);

      if (!axisValues[key]) {
        // No previous data for the axis
        axisValues[key] = [value];
      } else {
        // No value in previous series
        axisValues[key].push(value);
      } // Ignore duplicated time values in the same axis

    }
  });
  var axisMinGaps = {};

  for (var key in axisValues) {
    if (axisValues.hasOwnProperty(key)) {
      var valuesInAxis = axisValues[key];

      if (valuesInAxis) {
        // Sort axis values into ascending order to calculate gaps
        valuesInAxis.sort(function (a, b) {
          return a - b;
        });
        var min = null;

        for (var j = 1; j < valuesInAxis.length; ++j) {
          var delta = valuesInAxis[j] - valuesInAxis[j - 1];

          if (delta > 0) {
            // Ignore 0 delta because they are of the same axis value
            min = min === null ? delta : Math.min(min, delta);
          }
        } // Set to null if only have one data


        axisMinGaps[key] = min;
      }
    }
  }

  return axisMinGaps;
}

function makeColumnLayout(barSeries) {
  var axisMinGaps = getValueAxesMinGaps(barSeries);
  var seriesInfoList = [];
  each$2(barSeries, function (seriesModel) {
    var cartesian = seriesModel.coordinateSystem;
    var baseAxis = cartesian.getBaseAxis();
    var axisExtent = baseAxis.getExtent();
    var bandWidth;

    if (baseAxis.type === 'category') {
      bandWidth = baseAxis.getBandWidth();
    } else if (baseAxis.type === 'value' || baseAxis.type === 'time') {
      var key = baseAxis.dim + '_' + baseAxis.index;
      var minGap = axisMinGaps[key];
      var extentSpan = Math.abs(axisExtent[1] - axisExtent[0]);
      var scale = baseAxis.scale.getExtent();
      var scaleSpan = Math.abs(scale[1] - scale[0]);
      bandWidth = minGap ? extentSpan / scaleSpan * minGap : extentSpan; // When there is only one data value
    } else {
      var data = seriesModel.getData();
      bandWidth = Math.abs(axisExtent[1] - axisExtent[0]) / data.count();
    }

    var barWidth = parsePercent(seriesModel.get('barWidth'), bandWidth);
    var barMaxWidth = parsePercent(seriesModel.get('barMaxWidth'), bandWidth);
    var barMinWidth = parsePercent( // barMinWidth by default is 1 in cartesian. Because in value axis,
    // the auto-calculated bar width might be less than 1.
    seriesModel.get('barMinWidth') || 1, bandWidth);
    var barGap = seriesModel.get('barGap');
    var barCategoryGap = seriesModel.get('barCategoryGap');
    seriesInfoList.push({
      bandWidth: bandWidth,
      barWidth: barWidth,
      barMaxWidth: barMaxWidth,
      barMinWidth: barMinWidth,
      barGap: barGap,
      barCategoryGap: barCategoryGap,
      axisKey: getAxisKey(baseAxis),
      stackId: getSeriesStackId(seriesModel)
    });
  });
  return doCalBarWidthAndOffset(seriesInfoList);
}

function doCalBarWidthAndOffset(seriesInfoList) {
  // Columns info on each category axis. Key is cartesian name
  var columnsMap = {};
  each$2(seriesInfoList, function (seriesInfo, idx) {
    var axisKey = seriesInfo.axisKey;
    var bandWidth = seriesInfo.bandWidth;
    var columnsOnAxis = columnsMap[axisKey] || {
      bandWidth: bandWidth,
      remainedWidth: bandWidth,
      autoWidthCount: 0,
      categoryGap: null,
      gap: '20%',
      stacks: {}
    };
    var stacks = columnsOnAxis.stacks;
    columnsMap[axisKey] = columnsOnAxis;
    var stackId = seriesInfo.stackId;

    if (!stacks[stackId]) {
      columnsOnAxis.autoWidthCount++;
    }

    stacks[stackId] = stacks[stackId] || {
      width: 0,
      maxWidth: 0
    }; // Caution: In a single coordinate system, these barGrid attributes
    // will be shared by series. Consider that they have default values,
    // only the attributes set on the last series will work.
    // Do not change this fact unless there will be a break change.

    var barWidth = seriesInfo.barWidth;

    if (barWidth && !stacks[stackId].width) {
      // See #6312, do not restrict width.
      stacks[stackId].width = barWidth;
      barWidth = Math.min(columnsOnAxis.remainedWidth, barWidth);
      columnsOnAxis.remainedWidth -= barWidth;
    }

    var barMaxWidth = seriesInfo.barMaxWidth;
    barMaxWidth && (stacks[stackId].maxWidth = barMaxWidth);
    var barMinWidth = seriesInfo.barMinWidth;
    barMinWidth && (stacks[stackId].minWidth = barMinWidth);
    var barGap = seriesInfo.barGap;
    barGap != null && (columnsOnAxis.gap = barGap);
    var barCategoryGap = seriesInfo.barCategoryGap;
    barCategoryGap != null && (columnsOnAxis.categoryGap = barCategoryGap);
  });
  var result = {};
  each$2(columnsMap, function (columnsOnAxis, coordSysName) {
    result[coordSysName] = {};
    var stacks = columnsOnAxis.stacks;
    var bandWidth = columnsOnAxis.bandWidth;
    var categoryGapPercent = columnsOnAxis.categoryGap;

    if (categoryGapPercent == null) {
      var columnCount = keys(stacks).length; // More columns in one group
      // the spaces between group is smaller. Or the column will be too thin.

      categoryGapPercent = Math.max(35 - columnCount * 4, 15) + '%';
    }

    var categoryGap = parsePercent(categoryGapPercent, bandWidth);
    var barGapPercent = parsePercent(columnsOnAxis.gap, 1);
    var remainedWidth = columnsOnAxis.remainedWidth;
    var autoWidthCount = columnsOnAxis.autoWidthCount;
    var autoWidth = (remainedWidth - categoryGap) / (autoWidthCount + (autoWidthCount - 1) * barGapPercent);
    autoWidth = Math.max(autoWidth, 0); // Find if any auto calculated bar exceeded maxBarWidth

    each$2(stacks, function (column) {
      var maxWidth = column.maxWidth;
      var minWidth = column.minWidth;

      if (!column.width) {
        var finalWidth = autoWidth;

        if (maxWidth && maxWidth < finalWidth) {
          finalWidth = Math.min(maxWidth, remainedWidth);
        } // `minWidth` has higher priority. `minWidth` decide that wheter the
        // bar is able to be visible. So `minWidth` should not be restricted
        // by `maxWidth` or `remainedWidth` (which is from `bandWidth`). In
        // the extreme cases for `value` axis, bars are allowed to overlap
        // with each other if `minWidth` specified.


        if (minWidth && minWidth > finalWidth) {
          finalWidth = minWidth;
        }

        if (finalWidth !== autoWidth) {
          column.width = finalWidth;
          remainedWidth -= finalWidth + barGapPercent * finalWidth;
          autoWidthCount--;
        }
      } else {
        // `barMinWidth/barMaxWidth` has higher priority than `barWidth`, as
        // CSS does. Becuase barWidth can be a percent value, where
        // `barMaxWidth` can be used to restrict the final width.
        var finalWidth = column.width;

        if (maxWidth) {
          finalWidth = Math.min(finalWidth, maxWidth);
        } // `minWidth` has higher priority, as described above


        if (minWidth) {
          finalWidth = Math.max(finalWidth, minWidth);
        }

        column.width = finalWidth;
        remainedWidth -= finalWidth + barGapPercent * finalWidth;
        autoWidthCount--;
      }
    }); // Recalculate width again

    autoWidth = (remainedWidth - categoryGap) / (autoWidthCount + (autoWidthCount - 1) * barGapPercent);
    autoWidth = Math.max(autoWidth, 0);
    var widthSum = 0;
    var lastColumn;
    each$2(stacks, function (column, idx) {
      if (!column.width) {
        column.width = autoWidth;
      }

      lastColumn = column;
      widthSum += column.width * (1 + barGapPercent);
    });

    if (lastColumn) {
      widthSum -= lastColumn.width * barGapPercent;
    }

    var offset = -widthSum / 2;
    each$2(stacks, function (column, stackId) {
      result[coordSysName][stackId] = result[coordSysName][stackId] || {
        bandWidth: bandWidth,
        offset: offset,
        width: column.width
      };
      offset += column.width * (1 + barGapPercent);
    });
  });
  return result;
}

function retrieveColumnLayout(barWidthAndOffset, axis, seriesModel) {
  if (barWidthAndOffset && axis) {
    var result = barWidthAndOffset[getAxisKey(axis)];

    if (result != null && seriesModel != null) {
      return result[getSeriesStackId(seriesModel)];
    }

    return result;
  }
}

({
  seriesType: 'bar',
  plan: createRenderPlanner(),
  reset: function (seriesModel) {
    if (!isOnCartesian(seriesModel) || !isInLargeMode(seriesModel)) {
      return;
    }

    var data = seriesModel.getData();
    var cartesian = seriesModel.coordinateSystem;
    var coordLayout = cartesian.master.getRect();
    var baseAxis = cartesian.getBaseAxis();
    var valueAxis = cartesian.getOtherAxis(baseAxis);
    var valueDim = data.mapDimension(valueAxis.dim);
    var baseDim = data.mapDimension(baseAxis.dim);
    var valueAxisHorizontal = valueAxis.isHorizontal();
    var valueDimIdx = valueAxisHorizontal ? 0 : 1;
    var barWidth = retrieveColumnLayout(makeColumnLayout([seriesModel]), baseAxis, seriesModel).width;

    if (!(barWidth > LARGE_BAR_MIN_WIDTH)) {
      // jshint ignore:line
      barWidth = LARGE_BAR_MIN_WIDTH;
    }

    return {
      progress: function (params, data) {
        var count = params.count;
        var largePoints = new LargeArr(count * 2);
        var largeBackgroundPoints = new LargeArr(count * 2);
        var largeDataIndices = new LargeArr(count);
        var dataIndex;
        var coord = [];
        var valuePair = [];
        var pointsOffset = 0;
        var idxOffset = 0;

        while ((dataIndex = params.next()) != null) {
          valuePair[valueDimIdx] = data.get(valueDim, dataIndex);
          valuePair[1 - valueDimIdx] = data.get(baseDim, dataIndex);
          coord = cartesian.dataToPoint(valuePair, null, coord); // Data index might not be in order, depends on `progressiveChunkMode`.

          largeBackgroundPoints[pointsOffset] = valueAxisHorizontal ? coordLayout.x + coordLayout.width : coord[0];
          largePoints[pointsOffset++] = coord[0];
          largeBackgroundPoints[pointsOffset] = valueAxisHorizontal ? coord[1] : coordLayout.y + coordLayout.height;
          largePoints[pointsOffset++] = coord[1];
          largeDataIndices[idxOffset++] = dataIndex;
        }

        data.setLayout({
          largePoints: largePoints,
          largeDataIndices: largeDataIndices,
          largeBackgroundPoints: largeBackgroundPoints,
          barWidth: barWidth,
          valueAxisStart: getValueAxisStart(baseAxis, valueAxis),
          backgroundStart: valueAxisHorizontal ? coordLayout.x : coordLayout.y,
          valueAxisHorizontal: valueAxisHorizontal
        });
      }
    };
  }
});

function isOnCartesian(seriesModel) {
  return seriesModel.coordinateSystem && seriesModel.coordinateSystem.type === 'cartesian2d';
}

function isInLargeMode(seriesModel) {
  return seriesModel.pipelineContext && seriesModel.pipelineContext.large;
} // See cases in `test/bar-start.html` and `#7412`, `#8747`.


function getValueAxisStart(baseAxis, valueAxis, stacked) {
  return valueAxis.toGlobalCoord(valueAxis.dataToCoord(valueAxis.type === 'log' ? 1 : 0));
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
var ORIGIN_METHOD = '\0__throttleOriginMethod';
var RATE = '\0__throttleRate';
var THROTTLE_TYPE = '\0__throttleType';
/**
 * @public
 * @param {(Function)} fn
 * @param {number} [delay=0] Unit: ms.
 * @param {boolean} [debounce=false]
 *        true: If call interval less than `delay`, only the last call works.
 *        false: If call interval less than `delay, call works on fixed rate.
 * @return {(Function)} throttled fn.
 */

function throttle(fn, delay, debounce) {
  var currCall;
  var lastCall = 0;
  var lastExec = 0;
  var timer = null;
  var diff;
  var scope;
  var args;
  var debounceNextCall;
  delay = delay || 0;

  function exec() {
    lastExec = new Date().getTime();
    timer = null;
    fn.apply(scope, args || []);
  }

  var cb = function () {
    var cbArgs = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      cbArgs[_i] = arguments[_i];
    }

    currCall = new Date().getTime();
    scope = this;
    args = cbArgs;
    var thisDelay = debounceNextCall || delay;
    var thisDebounce = debounceNextCall || debounce;
    debounceNextCall = null;
    diff = currCall - (thisDebounce ? lastCall : lastExec) - thisDelay;
    clearTimeout(timer); // Here we should make sure that: the `exec` SHOULD NOT be called later
    // than a new call of `cb`, that is, preserving the command order. Consider
    // calculating "scale rate" when roaming as an example. When a call of `cb`
    // happens, either the `exec` is called dierectly, or the call is delayed.
    // But the delayed call should never be later than next call of `cb`. Under
    // this assurance, we can simply update view state each time `dispatchAction`
    // triggered by user roaming, but not need to add extra code to avoid the
    // state being "rolled-back".

    if (thisDebounce) {
      timer = setTimeout(exec, thisDelay);
    } else {
      if (diff >= 0) {
        exec();
      } else {
        timer = setTimeout(exec, -diff);
      }
    }

    lastCall = currCall;
  };
  /**
   * Clear throttle.
   * @public
   */


  cb.clear = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
  /**
   * Enable debounce once.
   */


  cb.debounceNextCall = function (debounceDelay) {
    debounceNextCall = debounceDelay;
  };

  return cb;
}
/**
 * Create throttle method or update throttle rate.
 *
 * @example
 * ComponentView.prototype.render = function () {
 *     ...
 *     throttle.createOrUpdate(
 *         this,
 *         '_dispatchAction',
 *         this.model.get('throttle'),
 *         'fixRate'
 *     );
 * };
 * ComponentView.prototype.remove = function () {
 *     throttle.clear(this, '_dispatchAction');
 * };
 * ComponentView.prototype.dispose = function () {
 *     throttle.clear(this, '_dispatchAction');
 * };
 *
 */

function createOrUpdate(obj, fnAttr, rate, throttleType) {
  var fn = obj[fnAttr];

  if (!fn) {
    return;
  }

  var originFn = fn[ORIGIN_METHOD] || fn;
  var lastThrottleType = fn[THROTTLE_TYPE];
  var lastRate = fn[RATE];

  if (lastRate !== rate || lastThrottleType !== throttleType) {
    if (rate == null || !throttleType) {
      return obj[fnAttr] = originFn;
    }

    fn = obj[fnAttr] = throttle(originFn, rate, throttleType === 'debounce');
    fn[ORIGIN_METHOD] = originFn;
    fn[THROTTLE_TYPE] = throttleType;
    fn[RATE] = rate;
  }

  return fn;
}
/**
 * Clear throttle. Example see throttle.createOrUpdate.
 */

function clear(obj, fnAttr) {
  var fn = obj[fnAttr];

  if (fn && fn[ORIGIN_METHOD]) {
    obj[fnAttr] = fn[ORIGIN_METHOD];
  }
}

function handleSeriesLegacySelectEvents(type, eventPostfix, ecIns, ecModel, payload) {
  var legacyEventName = type + eventPostfix;

  if (!ecIns.isSilent(legacyEventName)) {

    ecModel.eachComponent({
      mainType: 'series',
      subType: 'pie'
    }, function (seriesModel) {
      var seriesIndex = seriesModel.seriesIndex;
      var selected = payload.selected;

      for (var i = 0; i < selected.length; i++) {
        if (selected[i].seriesIndex === seriesIndex) {
          var data = seriesModel.getData();
          var dataIndex = queryDataIndex(data, payload.fromActionPayload);
          ecIns.trigger(legacyEventName, {
            type: legacyEventName,
            seriesId: seriesModel.id,
            name: isArray(dataIndex) ? data.getName(dataIndex[0]) : data.getName(dataIndex),
            selected: extend({}, seriesModel.option.selectedMap)
          });
        }
      }
    });
  }
}

function handleLegacySelectEvents(messageCenter, ecIns, api) {
  messageCenter.on('selectchanged', function (params) {
    var ecModel = api.getModel();

    if (params.isFromClick) {
      handleSeriesLegacySelectEvents('map', 'selectchanged', ecIns, ecModel, params);
      handleSeriesLegacySelectEvents('pie', 'selectchanged', ecIns, ecModel, params);
    } else if (params.fromAction === 'select') {
      handleSeriesLegacySelectEvents('map', 'selected', ecIns, ecModel, params);
      handleSeriesLegacySelectEvents('pie', 'selected', ecIns, ecModel, params);
    } else if (params.fromAction === 'unselect') {
      handleSeriesLegacySelectEvents('map', 'unselected', ecIns, ecModel, params);
      handleSeriesLegacySelectEvents('pie', 'unselected', ecIns, ecModel, params);
    }
  });
}

var PI2 = Math.PI * 2;
var CMD = PathProxy.CMD;
var DEFAULT_SEARCH_SPACE = ['top', 'right', 'bottom', 'left'];

function getCandidateAnchor(pos, distance, rect, outPt, outDir) {
  var width = rect.width;
  var height = rect.height;

  switch (pos) {
    case 'top':
      outPt.set(rect.x + width / 2, rect.y - distance);
      outDir.set(0, -1);
      break;

    case 'bottom':
      outPt.set(rect.x + width / 2, rect.y + height + distance);
      outDir.set(0, 1);
      break;

    case 'left':
      outPt.set(rect.x - distance, rect.y + height / 2);
      outDir.set(-1, 0);
      break;

    case 'right':
      outPt.set(rect.x + width + distance, rect.y + height / 2);
      outDir.set(1, 0);
      break;
  }
}

function projectPointToArc(cx, cy, r, startAngle, endAngle, anticlockwise, x, y, out) {
  x -= cx;
  y -= cy;
  var d = Math.sqrt(x * x + y * y);
  x /= d;
  y /= d; // Intersect point.

  var ox = x * r + cx;
  var oy = y * r + cy;

  if (Math.abs(startAngle - endAngle) % PI2 < 1e-4) {
    // Is a circle
    out[0] = ox;
    out[1] = oy;
    return d - r;
  }

  if (anticlockwise) {
    var tmp = startAngle;
    startAngle = normalizeRadian(endAngle);
    endAngle = normalizeRadian(tmp);
  } else {
    startAngle = normalizeRadian(startAngle);
    endAngle = normalizeRadian(endAngle);
  }

  if (startAngle > endAngle) {
    endAngle += PI2;
  }

  var angle = Math.atan2(y, x);

  if (angle < 0) {
    angle += PI2;
  }

  if (angle >= startAngle && angle <= endAngle || angle + PI2 >= startAngle && angle + PI2 <= endAngle) {
    // Project point is on the arc.
    out[0] = ox;
    out[1] = oy;
    return d - r;
  }

  var x1 = r * Math.cos(startAngle) + cx;
  var y1 = r * Math.sin(startAngle) + cy;
  var x2 = r * Math.cos(endAngle) + cx;
  var y2 = r * Math.sin(endAngle) + cy;
  var d1 = (x1 - x) * (x1 - x) + (y1 - y) * (y1 - y);
  var d2 = (x2 - x) * (x2 - x) + (y2 - y) * (y2 - y);

  if (d1 < d2) {
    out[0] = x1;
    out[1] = y1;
    return Math.sqrt(d1);
  } else {
    out[0] = x2;
    out[1] = y2;
    return Math.sqrt(d2);
  }
}

function projectPointToLine(x1, y1, x2, y2, x, y, out, limitToEnds) {
  var dx = x - x1;
  var dy = y - y1;
  var dx1 = x2 - x1;
  var dy1 = y2 - y1;
  var lineLen = Math.sqrt(dx1 * dx1 + dy1 * dy1);
  dx1 /= lineLen;
  dy1 /= lineLen; // dot product

  var projectedLen = dx * dx1 + dy * dy1;
  var t = projectedLen / lineLen;

  if (limitToEnds) {
    t = Math.min(Math.max(t, 0), 1);
  }

  t *= lineLen;
  var ox = out[0] = x1 + t * dx1;
  var oy = out[1] = y1 + t * dy1;
  return Math.sqrt((ox - x) * (ox - x) + (oy - y) * (oy - y));
}

function projectPointToRect(x1, y1, width, height, x, y, out) {
  if (width < 0) {
    x1 = x1 + width;
    width = -width;
  }

  if (height < 0) {
    y1 = y1 + height;
    height = -height;
  }

  var x2 = x1 + width;
  var y2 = y1 + height;
  var ox = out[0] = Math.min(Math.max(x, x1), x2);
  var oy = out[1] = Math.min(Math.max(y, y1), y2);
  return Math.sqrt((ox - x) * (ox - x) + (oy - y) * (oy - y));
}

var tmpPt = [];

function nearestPointOnRect(pt, rect, out) {
  var dist = projectPointToRect(rect.x, rect.y, rect.width, rect.height, pt.x, pt.y, tmpPt);
  out.set(tmpPt[0], tmpPt[1]);
  return dist;
}
/**
 * Calculate min distance corresponding point.
 * This method won't evaluate if point is in the path.
 */


function nearestPointOnPath(pt, path, out) {
  var xi = 0;
  var yi = 0;
  var x0 = 0;
  var y0 = 0;
  var x1;
  var y1;
  var minDist = Infinity;
  var data = path.data;
  var x = pt.x;
  var y = pt.y;

  for (var i = 0; i < data.length;) {
    var cmd = data[i++];

    if (i === 1) {
      xi = data[i];
      yi = data[i + 1];
      x0 = xi;
      y0 = yi;
    }

    var d = minDist;

    switch (cmd) {
      case CMD.M:
        // moveTo 命令重新创建一个新的 subpath, 并且更新新的起点
        // 在 closePath 的时候使用
        x0 = data[i++];
        y0 = data[i++];
        xi = x0;
        yi = y0;
        break;

      case CMD.L:
        d = projectPointToLine(xi, yi, data[i], data[i + 1], x, y, tmpPt, true);
        xi = data[i++];
        yi = data[i++];
        break;

      case CMD.C:
        d = cubicProjectPoint(xi, yi, data[i++], data[i++], data[i++], data[i++], data[i], data[i + 1], x, y, tmpPt);
        xi = data[i++];
        yi = data[i++];
        break;

      case CMD.Q:
        d = quadraticProjectPoint(xi, yi, data[i++], data[i++], data[i], data[i + 1], x, y, tmpPt);
        xi = data[i++];
        yi = data[i++];
        break;

      case CMD.A:
        // TODO Arc 判断的开销比较大
        var cx = data[i++];
        var cy = data[i++];
        var rx = data[i++];
        var ry = data[i++];
        var theta = data[i++];
        var dTheta = data[i++]; // TODO Arc 旋转

        i += 1;
        var anticlockwise = !!(1 - data[i++]);
        x1 = Math.cos(theta) * rx + cx;
        y1 = Math.sin(theta) * ry + cy; // 不是直接使用 arc 命令

        if (i <= 1) {
          // 第一个命令起点还未定义
          x0 = x1;
          y0 = y1;
        } // zr 使用scale来模拟椭圆, 这里也对x做一定的缩放


        var _x = (x - cx) * ry / rx + cx;

        d = projectPointToArc(cx, cy, ry, theta, theta + dTheta, anticlockwise, _x, y, tmpPt);
        xi = Math.cos(theta + dTheta) * rx + cx;
        yi = Math.sin(theta + dTheta) * ry + cy;
        break;

      case CMD.R:
        x0 = xi = data[i++];
        y0 = yi = data[i++];
        var width = data[i++];
        var height = data[i++];
        d = projectPointToRect(x0, y0, width, height, x, y, tmpPt);
        break;

      case CMD.Z:
        d = projectPointToLine(xi, yi, x0, y0, x, y, tmpPt, true);
        xi = x0;
        yi = y0;
        break;
    }

    if (d < minDist) {
      minDist = d;
      out.set(tmpPt[0], tmpPt[1]);
    }
  }

  return minDist;
} // Temporal varible for intermediate usage.


var pt0 = new Point();
var pt1 = new Point();
var pt2 = new Point();
var dir = new Point();
var dir2 = new Point();
/**
 * Calculate a proper guide line based on the label position and graphic element definition
 * @param label
 * @param labelRect
 * @param target
 * @param targetRect
 */

function updateLabelLinePoints(target, labelLineModel) {
  if (!target) {
    return;
  }

  var labelLine = target.getTextGuideLine();
  var label = target.getTextContent(); // Needs to create text guide in each charts.

  if (!(label && labelLine)) {
    return;
  }

  var labelGuideConfig = target.textGuideLineConfig || {};
  var points = [[0, 0], [0, 0], [0, 0]];
  var searchSpace = labelGuideConfig.candidates || DEFAULT_SEARCH_SPACE;
  var labelRect = label.getBoundingRect().clone();
  labelRect.applyTransform(label.getComputedTransform());
  var minDist = Infinity;
  var anchorPoint = labelGuideConfig.anchor;
  var targetTransform = target.getComputedTransform();
  var targetInversedTransform = targetTransform && invert([], targetTransform);
  var len = labelLineModel.get('length2') || 0;

  if (anchorPoint) {
    pt2.copy(anchorPoint);
  }

  for (var i = 0; i < searchSpace.length; i++) {
    var candidate = searchSpace[i];
    getCandidateAnchor(candidate, 0, labelRect, pt0, dir);
    Point.scaleAndAdd(pt1, pt0, dir, len); // Transform to target coord space.

    pt1.transform(targetInversedTransform); // Note: getBoundingRect will ensure the `path` being created.

    var boundingRect = target.getBoundingRect();
    var dist = anchorPoint ? anchorPoint.distance(pt1) : target instanceof Path ? nearestPointOnPath(pt1, target.path, pt2) : nearestPointOnRect(pt1, boundingRect, pt2); // TODO pt2 is in the path

    if (dist < minDist) {
      minDist = dist; // Transform back to global space.

      pt1.transform(targetTransform);
      pt2.transform(targetTransform);
      pt2.toArray(points[0]);
      pt1.toArray(points[1]);
      pt0.toArray(points[2]);
    }
  }

  limitTurnAngle(points, labelLineModel.get('minTurnAngle'));
  labelLine.setShape({
    points: points
  });
} // Temporal variable for the limitTurnAngle function

var tmpArr = [];
var tmpProjPoint = new Point();
/**
 * Reduce the line segment attached to the label to limit the turn angle between two segments.
 * @param linePoints
 * @param minTurnAngle Radian of minimum turn angle. 0 - 180
 */

function limitTurnAngle(linePoints, minTurnAngle) {
  if (!(minTurnAngle <= 180 && minTurnAngle > 0)) {
    return;
  }

  minTurnAngle = minTurnAngle / 180 * Math.PI; // The line points can be
  //      /pt1----pt2 (label)
  //     /
  // pt0/

  pt0.fromArray(linePoints[0]);
  pt1.fromArray(linePoints[1]);
  pt2.fromArray(linePoints[2]);
  Point.sub(dir, pt0, pt1);
  Point.sub(dir2, pt2, pt1);
  var len1 = dir.len();
  var len2 = dir2.len();

  if (len1 < 1e-3 || len2 < 1e-3) {
    return;
  }

  dir.scale(1 / len1);
  dir2.scale(1 / len2);
  var angleCos = dir.dot(dir2);
  var minTurnAngleCos = Math.cos(minTurnAngle);

  if (minTurnAngleCos < angleCos) {
    // Smaller than minTurnAngle
    // Calculate project point of pt0 on pt1-pt2
    var d = projectPointToLine(pt1.x, pt1.y, pt2.x, pt2.y, pt0.x, pt0.y, tmpArr, false);
    tmpProjPoint.fromArray(tmpArr); // Calculate new projected length with limited minTurnAngle and get the new connect point

    tmpProjPoint.scaleAndAdd(dir2, d / Math.tan(Math.PI - minTurnAngle)); // Limit the new calculated connect point between pt1 and pt2.

    var t = pt2.x !== pt1.x ? (tmpProjPoint.x - pt1.x) / (pt2.x - pt1.x) : (tmpProjPoint.y - pt1.y) / (pt2.y - pt1.y);

    if (isNaN(t)) {
      return;
    }

    if (t < 0) {
      Point.copy(tmpProjPoint, pt1);
    } else if (t > 1) {
      Point.copy(tmpProjPoint, pt2);
    }

    tmpProjPoint.toArray(linePoints[1]);
  }
}

function setLabelLineState(labelLine, ignore, stateName, stateModel) {
  var isNormal = stateName === 'normal';
  var stateObj = isNormal ? labelLine : labelLine.ensureState(stateName); // Make sure display.

  stateObj.ignore = ignore; // Set smooth

  var smooth = stateModel.get('smooth');

  if (smooth && smooth === true) {
    smooth = 0.3;
  }

  stateObj.shape = stateObj.shape || {};

  if (smooth > 0) {
    stateObj.shape.smooth = smooth;
  }

  var styleObj = stateModel.getModel('lineStyle').getLineStyle();
  isNormal ? labelLine.useStyle(styleObj) : stateObj.style = styleObj;
}

function buildLabelLinePath(path, shape) {
  var smooth = shape.smooth;
  var points = shape.points;

  if (!points) {
    return;
  }

  path.moveTo(points[0][0], points[0][1]);

  if (smooth > 0 && points.length >= 3) {
    var len1 = dist$1(points[0], points[1]);
    var len2 = dist$1(points[1], points[2]);

    if (!len1 || !len2) {
      path.lineTo(points[1][0], points[1][1]);
      path.lineTo(points[2][0], points[2][1]);
      return;
    }

    var moveLen = Math.min(len1, len2) * smooth;
    var midPoint0 = lerp([], points[1], points[0], moveLen / len1);
    var midPoint2 = lerp([], points[1], points[2], moveLen / len2);
    var midPoint1 = lerp([], midPoint0, midPoint2, 0.5);
    path.bezierCurveTo(midPoint0[0], midPoint0[1], midPoint0[0], midPoint0[1], midPoint1[0], midPoint1[1]);
    path.bezierCurveTo(midPoint2[0], midPoint2[1], midPoint2[0], midPoint2[1], points[2][0], points[2][1]);
  } else {
    for (var i = 1; i < points.length; i++) {
      path.lineTo(points[i][0], points[i][1]);
    }
  }
}
/**
 * Create a label line if necessary and set it's style.
 */


function setLabelLineStyle(targetEl, statesModels, defaultStyle) {
  var labelLine = targetEl.getTextGuideLine();
  var label = targetEl.getTextContent();

  if (!label) {
    // Not show label line if there is no label.
    if (labelLine) {
      targetEl.removeTextGuideLine();
    }

    return;
  }

  var normalModel = statesModels.normal;
  var showNormal = normalModel.get('show');
  var labelIgnoreNormal = label.ignore;

  for (var i = 0; i < DISPLAY_STATES.length; i++) {
    var stateName = DISPLAY_STATES[i];
    var stateModel = statesModels[stateName];
    var isNormal = stateName === 'normal';

    if (stateModel) {
      var stateShow = stateModel.get('show');
      var isLabelIgnored = isNormal ? labelIgnoreNormal : retrieve2(label.states[stateName] && label.states[stateName].ignore, labelIgnoreNormal);

      if (isLabelIgnored // Not show when label is not shown in this state.
      || !retrieve2(stateShow, showNormal) // Use normal state by default if not set.
      ) {
          var stateObj = isNormal ? labelLine : labelLine && labelLine.states.normal;

          if (stateObj) {
            stateObj.ignore = true;
          }

          continue;
        } // Create labelLine if not exists


      if (!labelLine) {
        labelLine = new Polyline();
        targetEl.setTextGuideLine(labelLine); // Reset state of normal because it's new created.
        // NOTE: NORMAL should always been the first!

        if (!isNormal && (labelIgnoreNormal || !showNormal)) {
          setLabelLineState(labelLine, true, 'normal', statesModels.normal);
        } // Use same state proxy.


        if (targetEl.stateProxy) {
          labelLine.stateProxy = targetEl.stateProxy;
        }
      }

      setLabelLineState(labelLine, false, stateName, stateModel);
    }
  }

  if (labelLine) {
    defaults(labelLine.style, defaultStyle); // Not fill.

    labelLine.style.fill = null;
    var showAbove = normalModel.get('showAbove');
    var labelLineConfig = targetEl.textGuideLineConfig = targetEl.textGuideLineConfig || {};
    labelLineConfig.showAbove = showAbove || false; // Custom the buildPath.

    labelLine.buildPath = buildLabelLinePath;
  }
}
function getLabelLineStatesModels(itemModel, labelLineName) {
  labelLineName = labelLineName || 'labelLine';
  var statesModels = {
    normal: itemModel.getModel(labelLineName)
  };

  for (var i = 0; i < SPECIAL_STATES.length; i++) {
    var stateName = SPECIAL_STATES[i];
    statesModels[stateName] = itemModel.getModel([stateName, labelLineName]);
  }

  return statesModels;
}

function prepareLayoutList(input) {
  var list = [];

  for (var i = 0; i < input.length; i++) {
    var rawItem = input[i];

    if (rawItem.defaultAttr.ignore) {
      continue;
    }

    var label = rawItem.label;
    var transform = label.getComputedTransform(); // NOTE: Get bounding rect after getComputedTransform, or label may not been updated by the host el.

    var localRect = label.getBoundingRect();
    var isAxisAligned = !transform || transform[1] < 1e-5 && transform[2] < 1e-5;
    var minMargin = label.style.margin || 0;
    var globalRect = localRect.clone();
    globalRect.applyTransform(transform);
    globalRect.x -= minMargin / 2;
    globalRect.y -= minMargin / 2;
    globalRect.width += minMargin;
    globalRect.height += minMargin;
    var obb = isAxisAligned ? new OrientedBoundingRect(localRect, transform) : null;
    list.push({
      label: label,
      labelLine: rawItem.labelLine,
      rect: globalRect,
      localRect: localRect,
      obb: obb,
      priority: rawItem.priority,
      defaultAttr: rawItem.defaultAttr,
      layoutOption: rawItem.computedLayoutOption,
      axisAligned: isAxisAligned,
      transform: transform
    });
  }

  return list;
}

function shiftLayout(list, xyDim, sizeDim, minBound, maxBound, balanceShift) {
  var len = list.length;

  if (len < 2) {
    return;
  }

  list.sort(function (a, b) {
    return a.rect[xyDim] - b.rect[xyDim];
  });
  var lastPos = 0;
  var delta;
  var adjusted = false;
  var totalShifts = 0;

  for (var i = 0; i < len; i++) {
    var item = list[i];
    var rect = item.rect;
    delta = rect[xyDim] - lastPos;

    if (delta < 0) {
      // shiftForward(i, len, -delta);
      rect[xyDim] -= delta;
      item.label[xyDim] -= delta;
      adjusted = true;
    }

    var shift = Math.max(-delta, 0);
    totalShifts += shift;
    lastPos = rect[xyDim] + rect[sizeDim];
  }

  if (totalShifts > 0 && balanceShift) {
    // Shift back to make the distribution more equally.
    shiftList(-totalShifts / len, 0, len);
  } // TODO bleedMargin?


  var first = list[0];
  var last = list[len - 1];
  var minGap;
  var maxGap;
  updateMinMaxGap(); // If ends exceed two bounds, squeeze at most 80%, then take the gap of two bounds.

  minGap < 0 && squeezeGaps(-minGap, 0.8);
  maxGap < 0 && squeezeGaps(maxGap, 0.8);
  updateMinMaxGap();
  takeBoundsGap(minGap, maxGap, 1);
  takeBoundsGap(maxGap, minGap, -1); // Handle bailout when there is not enough space.

  updateMinMaxGap();

  if (minGap < 0) {
    squeezeWhenBailout(-minGap);
  }

  if (maxGap < 0) {
    squeezeWhenBailout(maxGap);
  }

  function updateMinMaxGap() {
    minGap = first.rect[xyDim] - minBound;
    maxGap = maxBound - last.rect[xyDim] - last.rect[sizeDim];
  }

  function takeBoundsGap(gapThisBound, gapOtherBound, moveDir) {
    if (gapThisBound < 0) {
      // Move from other gap if can.
      var moveFromMaxGap = Math.min(gapOtherBound, -gapThisBound);

      if (moveFromMaxGap > 0) {
        shiftList(moveFromMaxGap * moveDir, 0, len);
        var remained = moveFromMaxGap + gapThisBound;

        if (remained < 0) {
          squeezeGaps(-remained * moveDir, 1);
        }
      } else {
        squeezeGaps(-gapThisBound * moveDir, 1);
      }
    }
  }

  function shiftList(delta, start, end) {
    if (delta !== 0) {
      adjusted = true;
    }

    for (var i = start; i < end; i++) {
      var item = list[i];
      var rect = item.rect;
      rect[xyDim] += delta;
      item.label[xyDim] += delta;
    }
  } // Squeeze gaps if the labels exceed margin.


  function squeezeGaps(delta, maxSqeezePercent) {
    var gaps = [];
    var totalGaps = 0;

    for (var i = 1; i < len; i++) {
      var prevItemRect = list[i - 1].rect;
      var gap = Math.max(list[i].rect[xyDim] - prevItemRect[xyDim] - prevItemRect[sizeDim], 0);
      gaps.push(gap);
      totalGaps += gap;
    }

    if (!totalGaps) {
      return;
    }

    var squeezePercent = Math.min(Math.abs(delta) / totalGaps, maxSqeezePercent);

    if (delta > 0) {
      for (var i = 0; i < len - 1; i++) {
        // Distribute the shift delta to all gaps.
        var movement = gaps[i] * squeezePercent; // Forward

        shiftList(movement, 0, i + 1);
      }
    } else {
      // Backward
      for (var i = len - 1; i > 0; i--) {
        // Distribute the shift delta to all gaps.
        var movement = gaps[i - 1] * squeezePercent;
        shiftList(-movement, i, len);
      }
    }
  }
  /**
   * Squeeze to allow overlap if there is no more space available.
   * Let other overlapping strategy like hideOverlap do the job instead of keep exceeding the bounds.
   */


  function squeezeWhenBailout(delta) {
    var dir = delta < 0 ? -1 : 1;
    delta = Math.abs(delta);
    var moveForEachLabel = Math.ceil(delta / (len - 1));

    for (var i = 0; i < len - 1; i++) {
      if (dir > 0) {
        // Forward
        shiftList(moveForEachLabel, 0, i + 1);
      } else {
        // Backward
        shiftList(-moveForEachLabel, len - i - 1, len);
      }

      delta -= moveForEachLabel;

      if (delta <= 0) {
        return;
      }
    }
  }

  return adjusted;
}
/**
 * Adjust labels on x direction to avoid overlap.
 */


function shiftLayoutOnX(list, leftBound, rightBound, // If average the shifts on all labels and add them to 0
// TODO: Not sure if should enable it.
// Pros: The angle of lines will distribute more equally
// Cons: In some layout. It may not what user wanted. like in pie. the label of last sector is usually changed unexpectedly.
balanceShift) {
  return shiftLayout(list, 'x', 'width', leftBound, rightBound, balanceShift);
}
/**
 * Adjust labels on y direction to avoid overlap.
 */

function shiftLayoutOnY(list, topBound, bottomBound, // If average the shifts on all labels and add them to 0
balanceShift) {
  return shiftLayout(list, 'y', 'height', topBound, bottomBound, balanceShift);
}
function hideOverlap(labelList) {
  var displayedLabels = []; // TODO, render overflow visible first, put in the displayedLabels.

  labelList.sort(function (a, b) {
    return b.priority - a.priority;
  });
  var globalRect = new BoundingRect(0, 0, 0, 0);

  function hideEl(el) {
    if (!el.ignore) {
      // Show on emphasis.
      var emphasisState = el.ensureState('emphasis');

      if (emphasisState.ignore == null) {
        emphasisState.ignore = false;
      }
    }

    el.ignore = true;
  }

  for (var i = 0; i < labelList.length; i++) {
    var labelItem = labelList[i];
    var isAxisAligned = labelItem.axisAligned;
    var localRect = labelItem.localRect;
    var transform = labelItem.transform;
    var label = labelItem.label;
    var labelLine = labelItem.labelLine;
    globalRect.copy(labelItem.rect); // Add a threshold because layout may be aligned precisely.

    globalRect.width -= 0.1;
    globalRect.height -= 0.1;
    globalRect.x += 0.05;
    globalRect.y += 0.05;
    var obb = labelItem.obb;
    var overlapped = false;

    for (var j = 0; j < displayedLabels.length; j++) {
      var existsTextCfg = displayedLabels[j]; // Fast rejection.

      if (!globalRect.intersect(existsTextCfg.rect)) {
        continue;
      }

      if (isAxisAligned && existsTextCfg.axisAligned) {
        // Is overlapped
        overlapped = true;
        break;
      }

      if (!existsTextCfg.obb) {
        // If self is not axis aligned. But other is.
        existsTextCfg.obb = new OrientedBoundingRect(existsTextCfg.localRect, existsTextCfg.transform);
      }

      if (!obb) {
        // If self is axis aligned. But other is not.
        obb = new OrientedBoundingRect(localRect, transform);
      }

      if (obb.intersect(existsTextCfg.obb)) {
        overlapped = true;
        break;
      }
    } // TODO Callback to determine if this overlap should be handled?


    if (overlapped) {
      hideEl(label);
      labelLine && hideEl(labelLine);
    } else {
      label.attr('ignore', labelItem.defaultAttr.ignore);
      labelLine && labelLine.attr('ignore', labelItem.defaultAttr.labelGuideIgnore);
      displayedLabels.push(labelItem);
    }
  }
}

var Param = (function () {
    function Param(target, e) {
        this.target = target;
        this.topTarget = e && e.topTarget;
    }
    return Param;
}());
var Draggable = (function () {
    function Draggable(handler) {
        this.handler = handler;
        handler.on('mousedown', this._dragStart, this);
        handler.on('mousemove', this._drag, this);
        handler.on('mouseup', this._dragEnd, this);
    }
    Draggable.prototype._dragStart = function (e) {
        var draggingTarget = e.target;
        while (draggingTarget && !draggingTarget.draggable) {
            draggingTarget = draggingTarget.parent;
        }
        if (draggingTarget) {
            this._draggingTarget = draggingTarget;
            draggingTarget.dragging = true;
            this._x = e.offsetX;
            this._y = e.offsetY;
            this.handler.dispatchToElement(new Param(draggingTarget, e), 'dragstart', e.event);
        }
    };
    Draggable.prototype._drag = function (e) {
        var draggingTarget = this._draggingTarget;
        if (draggingTarget) {
            var x = e.offsetX;
            var y = e.offsetY;
            var dx = x - this._x;
            var dy = y - this._y;
            this._x = x;
            this._y = y;
            draggingTarget.drift(dx, dy, e);
            this.handler.dispatchToElement(new Param(draggingTarget, e), 'drag', e.event);
            var dropTarget = this.handler.findHover(x, y, draggingTarget).target;
            var lastDropTarget = this._dropTarget;
            this._dropTarget = dropTarget;
            if (draggingTarget !== dropTarget) {
                if (lastDropTarget && dropTarget !== lastDropTarget) {
                    this.handler.dispatchToElement(new Param(lastDropTarget, e), 'dragleave', e.event);
                }
                if (dropTarget && dropTarget !== lastDropTarget) {
                    this.handler.dispatchToElement(new Param(dropTarget, e), 'dragenter', e.event);
                }
            }
        }
    };
    Draggable.prototype._dragEnd = function (e) {
        var draggingTarget = this._draggingTarget;
        if (draggingTarget) {
            draggingTarget.dragging = false;
        }
        this.handler.dispatchToElement(new Param(draggingTarget, e), 'dragend', e.event);
        if (this._dropTarget) {
            this.handler.dispatchToElement(new Param(this._dropTarget, e), 'drop', e.event);
        }
        this._draggingTarget = null;
        this._dropTarget = null;
    };
    return Draggable;
}());

var LN2 = Math.log(2);
function determinant(rows, rank, rowStart, rowMask, colMask, detCache) {
    var cacheKey = rowMask + '-' + colMask;
    var fullRank = rows.length;
    if (detCache.hasOwnProperty(cacheKey)) {
        return detCache[cacheKey];
    }
    if (rank === 1) {
        var colStart = Math.round(Math.log(((1 << fullRank) - 1) & ~colMask) / LN2);
        return rows[rowStart][colStart];
    }
    var subRowMask = rowMask | (1 << rowStart);
    var subRowStart = rowStart + 1;
    while (rowMask & (1 << subRowStart)) {
        subRowStart++;
    }
    var sum = 0;
    for (var j = 0, colLocalIdx = 0; j < fullRank; j++) {
        var colTag = 1 << j;
        if (!(colTag & colMask)) {
            sum += (colLocalIdx % 2 ? -1 : 1) * rows[rowStart][j]
                * determinant(rows, rank - 1, subRowStart, subRowMask, colMask | colTag, detCache);
            colLocalIdx++;
        }
    }
    detCache[cacheKey] = sum;
    return sum;
}
function buildTransformer(src, dest) {
    var mA = [
        [src[0], src[1], 1, 0, 0, 0, -dest[0] * src[0], -dest[0] * src[1]],
        [0, 0, 0, src[0], src[1], 1, -dest[1] * src[0], -dest[1] * src[1]],
        [src[2], src[3], 1, 0, 0, 0, -dest[2] * src[2], -dest[2] * src[3]],
        [0, 0, 0, src[2], src[3], 1, -dest[3] * src[2], -dest[3] * src[3]],
        [src[4], src[5], 1, 0, 0, 0, -dest[4] * src[4], -dest[4] * src[5]],
        [0, 0, 0, src[4], src[5], 1, -dest[5] * src[4], -dest[5] * src[5]],
        [src[6], src[7], 1, 0, 0, 0, -dest[6] * src[6], -dest[6] * src[7]],
        [0, 0, 0, src[6], src[7], 1, -dest[7] * src[6], -dest[7] * src[7]]
    ];
    var detCache = {};
    var det = determinant(mA, 8, 0, 0, 0, detCache);
    if (det === 0) {
        return;
    }
    var vh = [];
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            vh[j] == null && (vh[j] = 0);
            vh[j] += ((i + j) % 2 ? -1 : 1)
                * determinant(mA, 7, i === 0 ? 1 : 0, 1 << i, 1 << j, detCache)
                / det * dest[i];
        }
    }
    return function (out, srcPointX, srcPointY) {
        var pk = srcPointX * vh[6] + srcPointY * vh[7] + 1;
        out[0] = (srcPointX * vh[0] + srcPointY * vh[1] + vh[2]) / pk;
        out[1] = (srcPointX * vh[3] + srcPointY * vh[4] + vh[5]) / pk;
    };
}

var EVENT_SAVED_PROP = '___zrEVENTSAVED';
var _calcOut$1 = [];
function transformLocalCoord(out, elFrom, elTarget, inX, inY) {
    return transformCoordWithViewport(_calcOut$1, elFrom, inX, inY, true)
        && transformCoordWithViewport(out, elTarget, _calcOut$1[0], _calcOut$1[1]);
}
function transformCoordWithViewport(out, el, inX, inY, inverse) {
    if (el.getBoundingClientRect && env.domSupported && !isCanvasEl(el)) {
        var saved = el[EVENT_SAVED_PROP] || (el[EVENT_SAVED_PROP] = {});
        var markers = prepareCoordMarkers(el, saved);
        var transformer = preparePointerTransformer(markers, saved, inverse);
        if (transformer) {
            transformer(out, inX, inY);
            return true;
        }
    }
    return false;
}
function prepareCoordMarkers(el, saved) {
    var markers = saved.markers;
    if (markers) {
        return markers;
    }
    markers = saved.markers = [];
    var propLR = ['left', 'right'];
    var propTB = ['top', 'bottom'];
    for (var i = 0; i < 4; i++) {
        var marker = document.createElement('div');
        var stl = marker.style;
        var idxLR = i % 2;
        var idxTB = (i >> 1) % 2;
        stl.cssText = [
            'position: absolute',
            'visibility: hidden',
            'padding: 0',
            'margin: 0',
            'border-width: 0',
            'user-select: none',
            'width:0',
            'height:0',
            propLR[idxLR] + ':0',
            propTB[idxTB] + ':0',
            propLR[1 - idxLR] + ':auto',
            propTB[1 - idxTB] + ':auto',
            ''
        ].join('!important;');
        el.appendChild(marker);
        markers.push(marker);
    }
    return markers;
}
function preparePointerTransformer(markers, saved, inverse) {
    var transformerName = inverse ? 'invTrans' : 'trans';
    var transformer = saved[transformerName];
    var oldSrcCoords = saved.srcCoords;
    var srcCoords = [];
    var destCoords = [];
    var oldCoordTheSame = true;
    for (var i = 0; i < 4; i++) {
        var rect = markers[i].getBoundingClientRect();
        var ii = 2 * i;
        var x = rect.left;
        var y = rect.top;
        srcCoords.push(x, y);
        oldCoordTheSame = oldCoordTheSame && oldSrcCoords && x === oldSrcCoords[ii] && y === oldSrcCoords[ii + 1];
        destCoords.push(markers[i].offsetLeft, markers[i].offsetTop);
    }
    return (oldCoordTheSame && transformer)
        ? transformer
        : (saved.srcCoords = srcCoords,
            saved[transformerName] = inverse
                ? buildTransformer(destCoords, srcCoords)
                : buildTransformer(srcCoords, destCoords));
}
function isCanvasEl(el) {
    return el.nodeName.toUpperCase() === 'CANVAS';
}

var isDomLevel2 = (typeof window !== 'undefined') && !!window.addEventListener;
var MOUSE_EVENT_REG = /^(?:mouse|pointer|contextmenu|drag|drop)|click/;
var _calcOut = [];
function clientToLocal(el, e, out, calculate) {
    out = out || {};
    if (calculate || !env.canvasSupported) {
        calculateZrXY(el, e, out);
    }
    else if (env.browser.firefox
        && e.layerX != null
        && e.layerX !== e.offsetX) {
        out.zrX = e.layerX;
        out.zrY = e.layerY;
    }
    else if (e.offsetX != null) {
        out.zrX = e.offsetX;
        out.zrY = e.offsetY;
    }
    else {
        calculateZrXY(el, e, out);
    }
    return out;
}
function calculateZrXY(el, e, out) {
    if (env.domSupported && el.getBoundingClientRect) {
        var ex = e.clientX;
        var ey = e.clientY;
        if (isCanvasEl(el)) {
            var box = el.getBoundingClientRect();
            out.zrX = ex - box.left;
            out.zrY = ey - box.top;
            return;
        }
        else {
            if (transformCoordWithViewport(_calcOut, el, ex, ey)) {
                out.zrX = _calcOut[0];
                out.zrY = _calcOut[1];
                return;
            }
        }
    }
    out.zrX = out.zrY = 0;
}
function getNativeEvent(e) {
    return e
        || window.event;
}
function normalizeEvent(el, e, calculate) {
    e = getNativeEvent(e);
    if (e.zrX != null) {
        return e;
    }
    var eventType = e.type;
    var isTouch = eventType && eventType.indexOf('touch') >= 0;
    if (!isTouch) {
        clientToLocal(el, e, e, calculate);
        var wheelDelta = getWheelDeltaMayPolyfill(e);
        e.zrDelta = wheelDelta ? wheelDelta / 120 : -(e.detail || 0) / 3;
    }
    else {
        var touch = eventType !== 'touchend'
            ? e.targetTouches[0]
            : e.changedTouches[0];
        touch && clientToLocal(el, touch, e, calculate);
    }
    var button = e.button;
    if (e.which == null && button !== undefined && MOUSE_EVENT_REG.test(e.type)) {
        e.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
    }
    return e;
}
function getWheelDeltaMayPolyfill(e) {
    var rawWheelDelta = e.wheelDelta;
    if (rawWheelDelta) {
        return rawWheelDelta;
    }
    var deltaX = e.deltaX;
    var deltaY = e.deltaY;
    if (deltaX == null || deltaY == null) {
        return rawWheelDelta;
    }
    var delta = deltaY !== 0 ? Math.abs(deltaY) : Math.abs(deltaX);
    var sign = deltaY > 0 ? -1
        : deltaY < 0 ? 1
            : deltaX > 0 ? -1
                : 1;
    return 3 * delta * sign;
}
function addEventListener(el, name, handler, opt) {
    if (isDomLevel2) {
        el.addEventListener(name, handler, opt);
    }
    else {
        el.attachEvent('on' + name, handler);
    }
}
function removeEventListener(el, name, handler, opt) {
    if (isDomLevel2) {
        el.removeEventListener(name, handler, opt);
    }
    else {
        el.detachEvent('on' + name, handler);
    }
}
var stop = isDomLevel2
    ? function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.cancelBubble = true;
    }
    : function (e) {
        e.returnValue = false;
        e.cancelBubble = true;
    };
function isMiddleOrRightButtonOnMouseUpDown(e) {
    return e.which === 2 || e.which === 3;
}

var GestureMgr = (function () {
    function GestureMgr() {
        this._track = [];
    }
    GestureMgr.prototype.recognize = function (event, target, root) {
        this._doTrack(event, target, root);
        return this._recognize(event);
    };
    GestureMgr.prototype.clear = function () {
        this._track.length = 0;
        return this;
    };
    GestureMgr.prototype._doTrack = function (event, target, root) {
        var touches = event.touches;
        if (!touches) {
            return;
        }
        var trackItem = {
            points: [],
            touches: [],
            target: target,
            event: event
        };
        for (var i = 0, len = touches.length; i < len; i++) {
            var touch = touches[i];
            var pos = clientToLocal(root, touch, {});
            trackItem.points.push([pos.zrX, pos.zrY]);
            trackItem.touches.push(touch);
        }
        this._track.push(trackItem);
    };
    GestureMgr.prototype._recognize = function (event) {
        for (var eventName in recognizers) {
            if (recognizers.hasOwnProperty(eventName)) {
                var gestureInfo = recognizers[eventName](this._track, event);
                if (gestureInfo) {
                    return gestureInfo;
                }
            }
        }
    };
    return GestureMgr;
}());
function dist(pointPair) {
    var dx = pointPair[1][0] - pointPair[0][0];
    var dy = pointPair[1][1] - pointPair[0][1];
    return Math.sqrt(dx * dx + dy * dy);
}
function center(pointPair) {
    return [
        (pointPair[0][0] + pointPair[1][0]) / 2,
        (pointPair[0][1] + pointPair[1][1]) / 2
    ];
}
var recognizers = {
    pinch: function (tracks, event) {
        var trackLen = tracks.length;
        if (!trackLen) {
            return;
        }
        var pinchEnd = (tracks[trackLen - 1] || {}).points;
        var pinchPre = (tracks[trackLen - 2] || {}).points || pinchEnd;
        if (pinchPre
            && pinchPre.length > 1
            && pinchEnd
            && pinchEnd.length > 1) {
            var pinchScale = dist(pinchEnd) / dist(pinchPre);
            !isFinite(pinchScale) && (pinchScale = 1);
            event.pinchScale = pinchScale;
            var pinchCenter = center(pinchEnd);
            event.pinchX = pinchCenter[0];
            event.pinchY = pinchCenter[1];
            return {
                type: 'pinch',
                target: tracks[0].target,
                event: event
            };
        }
    }
};

var SILENT = 'silent';
function makeEventPacket(eveType, targetInfo, event) {
    return {
        type: eveType,
        event: event,
        target: targetInfo.target,
        topTarget: targetInfo.topTarget,
        cancelBubble: false,
        offsetX: event.zrX,
        offsetY: event.zrY,
        gestureEvent: event.gestureEvent,
        pinchX: event.pinchX,
        pinchY: event.pinchY,
        pinchScale: event.pinchScale,
        wheelDelta: event.zrDelta,
        zrByTouch: event.zrByTouch,
        which: event.which,
        stop: stopEvent
    };
}
function stopEvent() {
    stop(this.event);
}
var EmptyProxy = (function (_super) {
    __extends(EmptyProxy, _super);
    function EmptyProxy() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handler = null;
        return _this;
    }
    EmptyProxy.prototype.dispose = function () { };
    EmptyProxy.prototype.setCursor = function () { };
    return EmptyProxy;
}(Eventful));
var HoveredResult = (function () {
    function HoveredResult(x, y) {
        this.x = x;
        this.y = y;
    }
    return HoveredResult;
}());
var handlerNames = [
    'click', 'dblclick', 'mousewheel', 'mouseout',
    'mouseup', 'mousedown', 'mousemove', 'contextmenu'
];
var Handler = (function (_super) {
    __extends(Handler, _super);
    function Handler(storage, painter, proxy, painterRoot) {
        var _this = _super.call(this) || this;
        _this._hovered = new HoveredResult(0, 0);
        _this.storage = storage;
        _this.painter = painter;
        _this.painterRoot = painterRoot;
        proxy = proxy || new EmptyProxy();
        _this.proxy = null;
        _this.setHandlerProxy(proxy);
        _this._draggingMgr = new Draggable(_this);
        return _this;
    }
    Handler.prototype.setHandlerProxy = function (proxy) {
        if (this.proxy) {
            this.proxy.dispose();
        }
        if (proxy) {
            each$2(handlerNames, function (name) {
                proxy.on && proxy.on(name, this[name], this);
            }, this);
            proxy.handler = this;
        }
        this.proxy = proxy;
    };
    Handler.prototype.mousemove = function (event) {
        var x = event.zrX;
        var y = event.zrY;
        var isOutside = isOutsideBoundary(this, x, y);
        var lastHovered = this._hovered;
        var lastHoveredTarget = lastHovered.target;
        if (lastHoveredTarget && !lastHoveredTarget.__zr) {
            lastHovered = this.findHover(lastHovered.x, lastHovered.y);
            lastHoveredTarget = lastHovered.target;
        }
        var hovered = this._hovered = isOutside ? new HoveredResult(x, y) : this.findHover(x, y);
        var hoveredTarget = hovered.target;
        var proxy = this.proxy;
        proxy.setCursor && proxy.setCursor(hoveredTarget ? hoveredTarget.cursor : 'default');
        if (lastHoveredTarget && hoveredTarget !== lastHoveredTarget) {
            this.dispatchToElement(lastHovered, 'mouseout', event);
        }
        this.dispatchToElement(hovered, 'mousemove', event);
        if (hoveredTarget && hoveredTarget !== lastHoveredTarget) {
            this.dispatchToElement(hovered, 'mouseover', event);
        }
    };
    Handler.prototype.mouseout = function (event) {
        var eventControl = event.zrEventControl;
        if (eventControl !== 'only_globalout') {
            this.dispatchToElement(this._hovered, 'mouseout', event);
        }
        if (eventControl !== 'no_globalout') {
            this.trigger('globalout', { type: 'globalout', event: event });
        }
    };
    Handler.prototype.resize = function () {
        this._hovered = new HoveredResult(0, 0);
    };
    Handler.prototype.dispatch = function (eventName, eventArgs) {
        var handler = this[eventName];
        handler && handler.call(this, eventArgs);
    };
    Handler.prototype.dispose = function () {
        this.proxy.dispose();
        this.storage = null;
        this.proxy = null;
        this.painter = null;
    };
    Handler.prototype.setCursorStyle = function (cursorStyle) {
        var proxy = this.proxy;
        proxy.setCursor && proxy.setCursor(cursorStyle);
    };
    Handler.prototype.dispatchToElement = function (targetInfo, eventName, event) {
        targetInfo = targetInfo || {};
        var el = targetInfo.target;
        if (el && el.silent) {
            return;
        }
        var eventKey = ('on' + eventName);
        var eventPacket = makeEventPacket(eventName, targetInfo, event);
        while (el) {
            el[eventKey]
                && (eventPacket.cancelBubble = !!el[eventKey].call(el, eventPacket));
            el.trigger(eventName, eventPacket);
            el = el.__hostTarget ? el.__hostTarget : el.parent;
            if (eventPacket.cancelBubble) {
                break;
            }
        }
        if (!eventPacket.cancelBubble) {
            this.trigger(eventName, eventPacket);
            if (this.painter && this.painter.eachOtherLayer) {
                this.painter.eachOtherLayer(function (layer) {
                    if (typeof (layer[eventKey]) === 'function') {
                        layer[eventKey].call(layer, eventPacket);
                    }
                    if (layer.trigger) {
                        layer.trigger(eventName, eventPacket);
                    }
                });
            }
        }
    };
    Handler.prototype.findHover = function (x, y, exclude) {
        var list = this.storage.getDisplayList();
        var out = new HoveredResult(x, y);
        for (var i = list.length - 1; i >= 0; i--) {
            var hoverCheckResult = void 0;
            if (list[i] !== exclude
                && !list[i].ignore
                && (hoverCheckResult = isHover(list[i], x, y))) {
                !out.topTarget && (out.topTarget = list[i]);
                if (hoverCheckResult !== SILENT) {
                    out.target = list[i];
                    break;
                }
            }
        }
        return out;
    };
    Handler.prototype.processGesture = function (event, stage) {
        if (!this._gestureMgr) {
            this._gestureMgr = new GestureMgr();
        }
        var gestureMgr = this._gestureMgr;
        stage === 'start' && gestureMgr.clear();
        var gestureInfo = gestureMgr.recognize(event, this.findHover(event.zrX, event.zrY, null).target, this.proxy.dom);
        stage === 'end' && gestureMgr.clear();
        if (gestureInfo) {
            var type = gestureInfo.type;
            event.gestureEvent = type;
            var res = new HoveredResult();
            res.target = gestureInfo.target;
            this.dispatchToElement(res, type, gestureInfo.event);
        }
    };
    return Handler;
}(Eventful));
each$2(['click', 'mousedown', 'mouseup', 'mousewheel', 'dblclick', 'contextmenu'], function (name) {
    Handler.prototype[name] = function (event) {
        var x = event.zrX;
        var y = event.zrY;
        var isOutside = isOutsideBoundary(this, x, y);
        var hovered;
        var hoveredTarget;
        if (name !== 'mouseup' || !isOutside) {
            hovered = this.findHover(x, y);
            hoveredTarget = hovered.target;
        }
        if (name === 'mousedown') {
            this._downEl = hoveredTarget;
            this._downPoint = [event.zrX, event.zrY];
            this._upEl = hoveredTarget;
        }
        else if (name === 'mouseup') {
            this._upEl = hoveredTarget;
        }
        else if (name === 'click') {
            if (this._downEl !== this._upEl
                || !this._downPoint
                || dist$1(this._downPoint, [event.zrX, event.zrY]) > 4) {
                return;
            }
            this._downPoint = null;
        }
        this.dispatchToElement(hovered, name, event);
    };
});
function isHover(displayable, x, y) {
    if (displayable[displayable.rectHover ? 'rectContain' : 'contain'](x, y)) {
        var el = displayable;
        var isSilent = void 0;
        var ignoreClip = false;
        while (el) {
            if (el.ignoreClip) {
                ignoreClip = true;
            }
            if (!ignoreClip) {
                var clipPath = el.getClipPath();
                if (clipPath && !clipPath.contain(x, y)) {
                    return false;
                }
                if (el.silent) {
                    isSilent = true;
                }
            }
            var hostEl = el.__hostTarget;
            el = hostEl ? hostEl : el.parent;
        }
        return isSilent ? SILENT : true;
    }
    return false;
}
function isOutsideBoundary(handlerInstance, x, y) {
    var painter = handlerInstance.painter;
    return x < 0 || x > painter.getWidth() || y < 0 || y > painter.getHeight();
}

var DEFAULT_MIN_MERGE = 32;
var DEFAULT_MIN_GALLOPING = 7;
function minRunLength(n) {
    var r = 0;
    while (n >= DEFAULT_MIN_MERGE) {
        r |= n & 1;
        n >>= 1;
    }
    return n + r;
}
function makeAscendingRun(array, lo, hi, compare) {
    var runHi = lo + 1;
    if (runHi === hi) {
        return 1;
    }
    if (compare(array[runHi++], array[lo]) < 0) {
        while (runHi < hi && compare(array[runHi], array[runHi - 1]) < 0) {
            runHi++;
        }
        reverseRun(array, lo, runHi);
    }
    else {
        while (runHi < hi && compare(array[runHi], array[runHi - 1]) >= 0) {
            runHi++;
        }
    }
    return runHi - lo;
}
function reverseRun(array, lo, hi) {
    hi--;
    while (lo < hi) {
        var t = array[lo];
        array[lo++] = array[hi];
        array[hi--] = t;
    }
}
function binaryInsertionSort(array, lo, hi, start, compare) {
    if (start === lo) {
        start++;
    }
    for (; start < hi; start++) {
        var pivot = array[start];
        var left = lo;
        var right = start;
        var mid;
        while (left < right) {
            mid = left + right >>> 1;
            if (compare(pivot, array[mid]) < 0) {
                right = mid;
            }
            else {
                left = mid + 1;
            }
        }
        var n = start - left;
        switch (n) {
            case 3:
                array[left + 3] = array[left + 2];
            case 2:
                array[left + 2] = array[left + 1];
            case 1:
                array[left + 1] = array[left];
                break;
            default:
                while (n > 0) {
                    array[left + n] = array[left + n - 1];
                    n--;
                }
        }
        array[left] = pivot;
    }
}
function gallopLeft(value, array, start, length, hint, compare) {
    var lastOffset = 0;
    var maxOffset = 0;
    var offset = 1;
    if (compare(value, array[start + hint]) > 0) {
        maxOffset = length - hint;
        while (offset < maxOffset && compare(value, array[start + hint + offset]) > 0) {
            lastOffset = offset;
            offset = (offset << 1) + 1;
            if (offset <= 0) {
                offset = maxOffset;
            }
        }
        if (offset > maxOffset) {
            offset = maxOffset;
        }
        lastOffset += hint;
        offset += hint;
    }
    else {
        maxOffset = hint + 1;
        while (offset < maxOffset && compare(value, array[start + hint - offset]) <= 0) {
            lastOffset = offset;
            offset = (offset << 1) + 1;
            if (offset <= 0) {
                offset = maxOffset;
            }
        }
        if (offset > maxOffset) {
            offset = maxOffset;
        }
        var tmp = lastOffset;
        lastOffset = hint - offset;
        offset = hint - tmp;
    }
    lastOffset++;
    while (lastOffset < offset) {
        var m = lastOffset + (offset - lastOffset >>> 1);
        if (compare(value, array[start + m]) > 0) {
            lastOffset = m + 1;
        }
        else {
            offset = m;
        }
    }
    return offset;
}
function gallopRight(value, array, start, length, hint, compare) {
    var lastOffset = 0;
    var maxOffset = 0;
    var offset = 1;
    if (compare(value, array[start + hint]) < 0) {
        maxOffset = hint + 1;
        while (offset < maxOffset && compare(value, array[start + hint - offset]) < 0) {
            lastOffset = offset;
            offset = (offset << 1) + 1;
            if (offset <= 0) {
                offset = maxOffset;
            }
        }
        if (offset > maxOffset) {
            offset = maxOffset;
        }
        var tmp = lastOffset;
        lastOffset = hint - offset;
        offset = hint - tmp;
    }
    else {
        maxOffset = length - hint;
        while (offset < maxOffset && compare(value, array[start + hint + offset]) >= 0) {
            lastOffset = offset;
            offset = (offset << 1) + 1;
            if (offset <= 0) {
                offset = maxOffset;
            }
        }
        if (offset > maxOffset) {
            offset = maxOffset;
        }
        lastOffset += hint;
        offset += hint;
    }
    lastOffset++;
    while (lastOffset < offset) {
        var m = lastOffset + (offset - lastOffset >>> 1);
        if (compare(value, array[start + m]) < 0) {
            offset = m;
        }
        else {
            lastOffset = m + 1;
        }
    }
    return offset;
}
function TimSort(array, compare) {
    var minGallop = DEFAULT_MIN_GALLOPING;
    var runStart;
    var runLength;
    var stackSize = 0;
    array.length;
    var tmp = [];
    runStart = [];
    runLength = [];
    function pushRun(_runStart, _runLength) {
        runStart[stackSize] = _runStart;
        runLength[stackSize] = _runLength;
        stackSize += 1;
    }
    function mergeRuns() {
        while (stackSize > 1) {
            var n = stackSize - 2;
            if ((n >= 1 && runLength[n - 1] <= runLength[n] + runLength[n + 1])
                || (n >= 2 && runLength[n - 2] <= runLength[n] + runLength[n - 1])) {
                if (runLength[n - 1] < runLength[n + 1]) {
                    n--;
                }
            }
            else if (runLength[n] > runLength[n + 1]) {
                break;
            }
            mergeAt(n);
        }
    }
    function forceMergeRuns() {
        while (stackSize > 1) {
            var n = stackSize - 2;
            if (n > 0 && runLength[n - 1] < runLength[n + 1]) {
                n--;
            }
            mergeAt(n);
        }
    }
    function mergeAt(i) {
        var start1 = runStart[i];
        var length1 = runLength[i];
        var start2 = runStart[i + 1];
        var length2 = runLength[i + 1];
        runLength[i] = length1 + length2;
        if (i === stackSize - 3) {
            runStart[i + 1] = runStart[i + 2];
            runLength[i + 1] = runLength[i + 2];
        }
        stackSize--;
        var k = gallopRight(array[start2], array, start1, length1, 0, compare);
        start1 += k;
        length1 -= k;
        if (length1 === 0) {
            return;
        }
        length2 = gallopLeft(array[start1 + length1 - 1], array, start2, length2, length2 - 1, compare);
        if (length2 === 0) {
            return;
        }
        if (length1 <= length2) {
            mergeLow(start1, length1, start2, length2);
        }
        else {
            mergeHigh(start1, length1, start2, length2);
        }
    }
    function mergeLow(start1, length1, start2, length2) {
        var i = 0;
        for (i = 0; i < length1; i++) {
            tmp[i] = array[start1 + i];
        }
        var cursor1 = 0;
        var cursor2 = start2;
        var dest = start1;
        array[dest++] = array[cursor2++];
        if (--length2 === 0) {
            for (i = 0; i < length1; i++) {
                array[dest + i] = tmp[cursor1 + i];
            }
            return;
        }
        if (length1 === 1) {
            for (i = 0; i < length2; i++) {
                array[dest + i] = array[cursor2 + i];
            }
            array[dest + length2] = tmp[cursor1];
            return;
        }
        var _minGallop = minGallop;
        var count1;
        var count2;
        var exit;
        while (1) {
            count1 = 0;
            count2 = 0;
            exit = false;
            do {
                if (compare(array[cursor2], tmp[cursor1]) < 0) {
                    array[dest++] = array[cursor2++];
                    count2++;
                    count1 = 0;
                    if (--length2 === 0) {
                        exit = true;
                        break;
                    }
                }
                else {
                    array[dest++] = tmp[cursor1++];
                    count1++;
                    count2 = 0;
                    if (--length1 === 1) {
                        exit = true;
                        break;
                    }
                }
            } while ((count1 | count2) < _minGallop);
            if (exit) {
                break;
            }
            do {
                count1 = gallopRight(array[cursor2], tmp, cursor1, length1, 0, compare);
                if (count1 !== 0) {
                    for (i = 0; i < count1; i++) {
                        array[dest + i] = tmp[cursor1 + i];
                    }
                    dest += count1;
                    cursor1 += count1;
                    length1 -= count1;
                    if (length1 <= 1) {
                        exit = true;
                        break;
                    }
                }
                array[dest++] = array[cursor2++];
                if (--length2 === 0) {
                    exit = true;
                    break;
                }
                count2 = gallopLeft(tmp[cursor1], array, cursor2, length2, 0, compare);
                if (count2 !== 0) {
                    for (i = 0; i < count2; i++) {
                        array[dest + i] = array[cursor2 + i];
                    }
                    dest += count2;
                    cursor2 += count2;
                    length2 -= count2;
                    if (length2 === 0) {
                        exit = true;
                        break;
                    }
                }
                array[dest++] = tmp[cursor1++];
                if (--length1 === 1) {
                    exit = true;
                    break;
                }
                _minGallop--;
            } while (count1 >= DEFAULT_MIN_GALLOPING || count2 >= DEFAULT_MIN_GALLOPING);
            if (exit) {
                break;
            }
            if (_minGallop < 0) {
                _minGallop = 0;
            }
            _minGallop += 2;
        }
        minGallop = _minGallop;
        minGallop < 1 && (minGallop = 1);
        if (length1 === 1) {
            for (i = 0; i < length2; i++) {
                array[dest + i] = array[cursor2 + i];
            }
            array[dest + length2] = tmp[cursor1];
        }
        else if (length1 === 0) {
            throw new Error();
        }
        else {
            for (i = 0; i < length1; i++) {
                array[dest + i] = tmp[cursor1 + i];
            }
        }
    }
    function mergeHigh(start1, length1, start2, length2) {
        var i = 0;
        for (i = 0; i < length2; i++) {
            tmp[i] = array[start2 + i];
        }
        var cursor1 = start1 + length1 - 1;
        var cursor2 = length2 - 1;
        var dest = start2 + length2 - 1;
        var customCursor = 0;
        var customDest = 0;
        array[dest--] = array[cursor1--];
        if (--length1 === 0) {
            customCursor = dest - (length2 - 1);
            for (i = 0; i < length2; i++) {
                array[customCursor + i] = tmp[i];
            }
            return;
        }
        if (length2 === 1) {
            dest -= length1;
            cursor1 -= length1;
            customDest = dest + 1;
            customCursor = cursor1 + 1;
            for (i = length1 - 1; i >= 0; i--) {
                array[customDest + i] = array[customCursor + i];
            }
            array[dest] = tmp[cursor2];
            return;
        }
        var _minGallop = minGallop;
        while (true) {
            var count1 = 0;
            var count2 = 0;
            var exit = false;
            do {
                if (compare(tmp[cursor2], array[cursor1]) < 0) {
                    array[dest--] = array[cursor1--];
                    count1++;
                    count2 = 0;
                    if (--length1 === 0) {
                        exit = true;
                        break;
                    }
                }
                else {
                    array[dest--] = tmp[cursor2--];
                    count2++;
                    count1 = 0;
                    if (--length2 === 1) {
                        exit = true;
                        break;
                    }
                }
            } while ((count1 | count2) < _minGallop);
            if (exit) {
                break;
            }
            do {
                count1 = length1 - gallopRight(tmp[cursor2], array, start1, length1, length1 - 1, compare);
                if (count1 !== 0) {
                    dest -= count1;
                    cursor1 -= count1;
                    length1 -= count1;
                    customDest = dest + 1;
                    customCursor = cursor1 + 1;
                    for (i = count1 - 1; i >= 0; i--) {
                        array[customDest + i] = array[customCursor + i];
                    }
                    if (length1 === 0) {
                        exit = true;
                        break;
                    }
                }
                array[dest--] = tmp[cursor2--];
                if (--length2 === 1) {
                    exit = true;
                    break;
                }
                count2 = length2 - gallopLeft(array[cursor1], tmp, 0, length2, length2 - 1, compare);
                if (count2 !== 0) {
                    dest -= count2;
                    cursor2 -= count2;
                    length2 -= count2;
                    customDest = dest + 1;
                    customCursor = cursor2 + 1;
                    for (i = 0; i < count2; i++) {
                        array[customDest + i] = tmp[customCursor + i];
                    }
                    if (length2 <= 1) {
                        exit = true;
                        break;
                    }
                }
                array[dest--] = array[cursor1--];
                if (--length1 === 0) {
                    exit = true;
                    break;
                }
                _minGallop--;
            } while (count1 >= DEFAULT_MIN_GALLOPING || count2 >= DEFAULT_MIN_GALLOPING);
            if (exit) {
                break;
            }
            if (_minGallop < 0) {
                _minGallop = 0;
            }
            _minGallop += 2;
        }
        minGallop = _minGallop;
        if (minGallop < 1) {
            minGallop = 1;
        }
        if (length2 === 1) {
            dest -= length1;
            cursor1 -= length1;
            customDest = dest + 1;
            customCursor = cursor1 + 1;
            for (i = length1 - 1; i >= 0; i--) {
                array[customDest + i] = array[customCursor + i];
            }
            array[dest] = tmp[cursor2];
        }
        else if (length2 === 0) {
            throw new Error();
        }
        else {
            customCursor = dest - (length2 - 1);
            for (i = 0; i < length2; i++) {
                array[customCursor + i] = tmp[i];
            }
        }
    }
    return {
        mergeRuns: mergeRuns,
        forceMergeRuns: forceMergeRuns,
        pushRun: pushRun
    };
}
function sort(array, compare, lo, hi) {
    if (!lo) {
        lo = 0;
    }
    if (!hi) {
        hi = array.length;
    }
    var remaining = hi - lo;
    if (remaining < 2) {
        return;
    }
    var runLength = 0;
    if (remaining < DEFAULT_MIN_MERGE) {
        runLength = makeAscendingRun(array, lo, hi, compare);
        binaryInsertionSort(array, lo, hi, lo + runLength, compare);
        return;
    }
    var ts = TimSort(array, compare);
    var minRun = minRunLength(remaining);
    do {
        runLength = makeAscendingRun(array, lo, hi, compare);
        if (runLength < minRun) {
            var force = remaining;
            if (force > minRun) {
                force = minRun;
            }
            binaryInsertionSort(array, lo, lo + force, lo + runLength, compare);
            runLength = force;
        }
        ts.pushRun(lo, runLength);
        ts.mergeRuns();
        remaining -= runLength;
        lo += runLength;
    } while (remaining !== 0);
    ts.forceMergeRuns();
}

var invalidZErrorLogged = false;
function logInvalidZError() {
    if (invalidZErrorLogged) {
        return;
    }
    invalidZErrorLogged = true;
    console.warn('z / z2 / zlevel of displayable is invalid, which may cause unexpected errors');
}
function shapeCompareFunc(a, b) {
    if (a.zlevel === b.zlevel) {
        if (a.z === b.z) {
            return a.z2 - b.z2;
        }
        return a.z - b.z;
    }
    return a.zlevel - b.zlevel;
}
var Storage = (function () {
    function Storage() {
        this._roots = [];
        this._displayList = [];
        this._displayListLen = 0;
        this.displayableSortFunc = shapeCompareFunc;
    }
    Storage.prototype.traverse = function (cb, context) {
        for (var i = 0; i < this._roots.length; i++) {
            this._roots[i].traverse(cb, context);
        }
    };
    Storage.prototype.getDisplayList = function (update, includeIgnore) {
        includeIgnore = includeIgnore || false;
        var displayList = this._displayList;
        if (update || !displayList.length) {
            this.updateDisplayList(includeIgnore);
        }
        return displayList;
    };
    Storage.prototype.updateDisplayList = function (includeIgnore) {
        this._displayListLen = 0;
        var roots = this._roots;
        var displayList = this._displayList;
        for (var i = 0, len = roots.length; i < len; i++) {
            this._updateAndAddDisplayable(roots[i], null, includeIgnore);
        }
        displayList.length = this._displayListLen;
        env.canvasSupported && sort(displayList, shapeCompareFunc);
    };
    Storage.prototype._updateAndAddDisplayable = function (el, clipPaths, includeIgnore) {
        if (el.ignore && !includeIgnore) {
            return;
        }
        el.beforeUpdate();
        el.update();
        el.afterUpdate();
        var userSetClipPath = el.getClipPath();
        if (el.ignoreClip) {
            clipPaths = null;
        }
        else if (userSetClipPath) {
            if (clipPaths) {
                clipPaths = clipPaths.slice();
            }
            else {
                clipPaths = [];
            }
            var currentClipPath = userSetClipPath;
            var parentClipPath = el;
            while (currentClipPath) {
                currentClipPath.parent = parentClipPath;
                currentClipPath.updateTransform();
                clipPaths.push(currentClipPath);
                parentClipPath = currentClipPath;
                currentClipPath = currentClipPath.getClipPath();
            }
        }
        if (el.childrenRef) {
            var children = el.childrenRef();
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (el.__dirty) {
                    child.__dirty |= Element.REDARAW_BIT;
                }
                this._updateAndAddDisplayable(child, clipPaths, includeIgnore);
            }
            el.__dirty = 0;
        }
        else {
            var disp = el;
            if (clipPaths && clipPaths.length) {
                disp.__clipPaths = clipPaths;
            }
            else if (disp.__clipPaths && disp.__clipPaths.length > 0) {
                disp.__clipPaths = [];
            }
            if (isNaN(disp.z)) {
                logInvalidZError();
                disp.z = 0;
            }
            if (isNaN(disp.z2)) {
                logInvalidZError();
                disp.z2 = 0;
            }
            if (isNaN(disp.zlevel)) {
                logInvalidZError();
                disp.zlevel = 0;
            }
            this._displayList[this._displayListLen++] = disp;
        }
        var decalEl = el.getDecalElement && el.getDecalElement();
        if (decalEl) {
            this._updateAndAddDisplayable(decalEl, clipPaths, includeIgnore);
        }
        var textGuide = el.getTextGuideLine();
        if (textGuide) {
            this._updateAndAddDisplayable(textGuide, clipPaths, includeIgnore);
        }
        var textEl = el.getTextContent();
        if (textEl) {
            this._updateAndAddDisplayable(textEl, clipPaths, includeIgnore);
        }
    };
    Storage.prototype.addRoot = function (el) {
        if (el.__zr && el.__zr.storage === this) {
            return;
        }
        this._roots.push(el);
    };
    Storage.prototype.delRoot = function (el) {
        if (el instanceof Array) {
            for (var i = 0, l = el.length; i < l; i++) {
                this.delRoot(el[i]);
            }
            return;
        }
        var idx = indexOf$1(this._roots, el);
        if (idx >= 0) {
            this._roots.splice(idx, 1);
        }
    };
    Storage.prototype.delAllRoots = function () {
        this._roots = [];
        this._displayList = [];
        this._displayListLen = 0;
        return;
    };
    Storage.prototype.getRoots = function () {
        return this._roots;
    };
    Storage.prototype.dispose = function () {
        this._displayList = null;
        this._roots = null;
    };
    return Storage;
}());

var Animation = (function (_super) {
    __extends(Animation, _super);
    function Animation(opts) {
        var _this = _super.call(this) || this;
        _this._running = false;
        _this._time = 0;
        _this._pausedTime = 0;
        _this._pauseStart = 0;
        _this._paused = false;
        opts = opts || {};
        _this.stage = opts.stage || {};
        _this.onframe = opts.onframe || function () { };
        return _this;
    }
    Animation.prototype.addClip = function (clip) {
        if (clip.animation) {
            this.removeClip(clip);
        }
        if (!this._clipsHead) {
            this._clipsHead = this._clipsTail = clip;
        }
        else {
            this._clipsTail.next = clip;
            clip.prev = this._clipsTail;
            clip.next = null;
            this._clipsTail = clip;
        }
        clip.animation = this;
    };
    Animation.prototype.addAnimator = function (animator) {
        animator.animation = this;
        var clip = animator.getClip();
        if (clip) {
            this.addClip(clip);
        }
    };
    Animation.prototype.removeClip = function (clip) {
        if (!clip.animation) {
            return;
        }
        var prev = clip.prev;
        var next = clip.next;
        if (prev) {
            prev.next = next;
        }
        else {
            this._clipsHead = next;
        }
        if (next) {
            next.prev = prev;
        }
        else {
            this._clipsTail = prev;
        }
        clip.next = clip.prev = clip.animation = null;
    };
    Animation.prototype.removeAnimator = function (animator) {
        var clip = animator.getClip();
        if (clip) {
            this.removeClip(clip);
        }
        animator.animation = null;
    };
    Animation.prototype.update = function (notTriggerFrameAndStageUpdate) {
        var time = new Date().getTime() - this._pausedTime;
        var delta = time - this._time;
        var clip = this._clipsHead;
        while (clip) {
            var nextClip = clip.next;
            var finished = clip.step(time, delta);
            if (finished) {
                clip.ondestroy && clip.ondestroy();
                this.removeClip(clip);
                clip = nextClip;
            }
            else {
                clip = nextClip;
            }
        }
        this._time = time;
        if (!notTriggerFrameAndStageUpdate) {
            this.onframe(delta);
            this.trigger('frame', delta);
            this.stage.update && this.stage.update();
        }
    };
    Animation.prototype._startLoop = function () {
        var self = this;
        this._running = true;
        function step() {
            if (self._running) {
                requestAnimationFrame(step);
                !self._paused && self.update();
            }
        }
        requestAnimationFrame(step);
    };
    Animation.prototype.start = function () {
        if (this._running) {
            return;
        }
        this._time = new Date().getTime();
        this._pausedTime = 0;
        this._startLoop();
    };
    Animation.prototype.stop = function () {
        this._running = false;
    };
    Animation.prototype.pause = function () {
        if (!this._paused) {
            this._pauseStart = new Date().getTime();
            this._paused = true;
        }
    };
    Animation.prototype.resume = function () {
        if (this._paused) {
            this._pausedTime += (new Date().getTime()) - this._pauseStart;
            this._paused = false;
        }
    };
    Animation.prototype.clear = function () {
        var clip = this._clipsHead;
        while (clip) {
            var nextClip = clip.next;
            clip.prev = clip.next = clip.animation = null;
            clip = nextClip;
        }
        this._clipsHead = this._clipsTail = null;
    };
    Animation.prototype.isFinished = function () {
        return this._clipsHead == null;
    };
    Animation.prototype.animate = function (target, options) {
        options = options || {};
        this.start();
        var animator = new Animator(target, options.loop);
        this.addAnimator(animator);
        return animator;
    };
    return Animation;
}(Eventful));

var TOUCH_CLICK_DELAY = 300;
var globalEventSupported = env.domSupported;
var localNativeListenerNames = (function () {
    var mouseHandlerNames = [
        'click', 'dblclick', 'mousewheel', 'wheel', 'mouseout',
        'mouseup', 'mousedown', 'mousemove', 'contextmenu'
    ];
    var touchHandlerNames = [
        'touchstart', 'touchend', 'touchmove'
    ];
    var pointerEventNameMap = {
        pointerdown: 1, pointerup: 1, pointermove: 1, pointerout: 1
    };
    var pointerHandlerNames = map(mouseHandlerNames, function (name) {
        var nm = name.replace('mouse', 'pointer');
        return pointerEventNameMap.hasOwnProperty(nm) ? nm : name;
    });
    return {
        mouse: mouseHandlerNames,
        touch: touchHandlerNames,
        pointer: pointerHandlerNames
    };
})();
var globalNativeListenerNames = {
    mouse: ['mousemove', 'mouseup'],
    pointer: ['pointermove', 'pointerup']
};
var wheelEventSupported = false;
function isPointerFromTouch(event) {
    var pointerType = event.pointerType;
    return pointerType === 'pen' || pointerType === 'touch';
}
function setTouchTimer(scope) {
    scope.touching = true;
    if (scope.touchTimer != null) {
        clearTimeout(scope.touchTimer);
        scope.touchTimer = null;
    }
    scope.touchTimer = setTimeout(function () {
        scope.touching = false;
        scope.touchTimer = null;
    }, 700);
}
function markTouch(event) {
    event && (event.zrByTouch = true);
}
function normalizeGlobalEvent(instance, event) {
    return normalizeEvent(instance.dom, new FakeGlobalEvent(instance, event), true);
}
function isLocalEl(instance, el) {
    var elTmp = el;
    var isLocal = false;
    while (elTmp && elTmp.nodeType !== 9
        && !(isLocal = elTmp.domBelongToZr
            || (elTmp !== el && elTmp === instance.painterRoot))) {
        elTmp = elTmp.parentNode;
    }
    return isLocal;
}
var FakeGlobalEvent = (function () {
    function FakeGlobalEvent(instance, event) {
        this.stopPropagation = noop;
        this.stopImmediatePropagation = noop;
        this.preventDefault = noop;
        this.type = event.type;
        this.target = this.currentTarget = instance.dom;
        this.pointerType = event.pointerType;
        this.clientX = event.clientX;
        this.clientY = event.clientY;
    }
    return FakeGlobalEvent;
}());
var localDOMHandlers = {
    mousedown: function (event) {
        event = normalizeEvent(this.dom, event);
        this.__mayPointerCapture = [event.zrX, event.zrY];
        this.trigger('mousedown', event);
    },
    mousemove: function (event) {
        event = normalizeEvent(this.dom, event);
        var downPoint = this.__mayPointerCapture;
        if (downPoint && (event.zrX !== downPoint[0] || event.zrY !== downPoint[1])) {
            this.__togglePointerCapture(true);
        }
        this.trigger('mousemove', event);
    },
    mouseup: function (event) {
        event = normalizeEvent(this.dom, event);
        this.__togglePointerCapture(false);
        this.trigger('mouseup', event);
    },
    mouseout: function (event) {
        event = normalizeEvent(this.dom, event);
        var element = event.toElement || event.relatedTarget;
        if (!isLocalEl(this, element)) {
            if (this.__pointerCapturing) {
                event.zrEventControl = 'no_globalout';
            }
            this.trigger('mouseout', event);
        }
    },
    wheel: function (event) {
        wheelEventSupported = true;
        event = normalizeEvent(this.dom, event);
        this.trigger('mousewheel', event);
    },
    mousewheel: function (event) {
        if (wheelEventSupported) {
            return;
        }
        event = normalizeEvent(this.dom, event);
        this.trigger('mousewheel', event);
    },
    touchstart: function (event) {
        event = normalizeEvent(this.dom, event);
        markTouch(event);
        this.__lastTouchMoment = new Date();
        this.handler.processGesture(event, 'start');
        localDOMHandlers.mousemove.call(this, event);
        localDOMHandlers.mousedown.call(this, event);
    },
    touchmove: function (event) {
        event = normalizeEvent(this.dom, event);
        markTouch(event);
        this.handler.processGesture(event, 'change');
        localDOMHandlers.mousemove.call(this, event);
    },
    touchend: function (event) {
        event = normalizeEvent(this.dom, event);
        markTouch(event);
        this.handler.processGesture(event, 'end');
        localDOMHandlers.mouseup.call(this, event);
        if (+new Date() - (+this.__lastTouchMoment) < TOUCH_CLICK_DELAY) {
            localDOMHandlers.click.call(this, event);
        }
    },
    pointerdown: function (event) {
        localDOMHandlers.mousedown.call(this, event);
    },
    pointermove: function (event) {
        if (!isPointerFromTouch(event)) {
            localDOMHandlers.mousemove.call(this, event);
        }
    },
    pointerup: function (event) {
        localDOMHandlers.mouseup.call(this, event);
    },
    pointerout: function (event) {
        if (!isPointerFromTouch(event)) {
            localDOMHandlers.mouseout.call(this, event);
        }
    }
};
each$2(['click', 'dblclick', 'contextmenu'], function (name) {
    localDOMHandlers[name] = function (event) {
        event = normalizeEvent(this.dom, event);
        this.trigger(name, event);
    };
});
var globalDOMHandlers = {
    pointermove: function (event) {
        if (!isPointerFromTouch(event)) {
            globalDOMHandlers.mousemove.call(this, event);
        }
    },
    pointerup: function (event) {
        globalDOMHandlers.mouseup.call(this, event);
    },
    mousemove: function (event) {
        this.trigger('mousemove', event);
    },
    mouseup: function (event) {
        var pointerCaptureReleasing = this.__pointerCapturing;
        this.__togglePointerCapture(false);
        this.trigger('mouseup', event);
        if (pointerCaptureReleasing) {
            event.zrEventControl = 'only_globalout';
            this.trigger('mouseout', event);
        }
    }
};
function mountLocalDOMEventListeners(instance, scope) {
    var domHandlers = scope.domHandlers;
    if (env.pointerEventsSupported) {
        each$2(localNativeListenerNames.pointer, function (nativeEventName) {
            mountSingleDOMEventListener(scope, nativeEventName, function (event) {
                domHandlers[nativeEventName].call(instance, event);
            });
        });
    }
    else {
        if (env.touchEventsSupported) {
            each$2(localNativeListenerNames.touch, function (nativeEventName) {
                mountSingleDOMEventListener(scope, nativeEventName, function (event) {
                    domHandlers[nativeEventName].call(instance, event);
                    setTouchTimer(scope);
                });
            });
        }
        each$2(localNativeListenerNames.mouse, function (nativeEventName) {
            mountSingleDOMEventListener(scope, nativeEventName, function (event) {
                event = getNativeEvent(event);
                if (!scope.touching) {
                    domHandlers[nativeEventName].call(instance, event);
                }
            });
        });
    }
}
function mountGlobalDOMEventListeners(instance, scope) {
    if (env.pointerEventsSupported) {
        each$2(globalNativeListenerNames.pointer, mount);
    }
    else if (!env.touchEventsSupported) {
        each$2(globalNativeListenerNames.mouse, mount);
    }
    function mount(nativeEventName) {
        function nativeEventListener(event) {
            event = getNativeEvent(event);
            if (!isLocalEl(instance, event.target)) {
                event = normalizeGlobalEvent(instance, event);
                scope.domHandlers[nativeEventName].call(instance, event);
            }
        }
        mountSingleDOMEventListener(scope, nativeEventName, nativeEventListener, { capture: true });
    }
}
function mountSingleDOMEventListener(scope, nativeEventName, listener, opt) {
    scope.mounted[nativeEventName] = listener;
    scope.listenerOpts[nativeEventName] = opt;
    addEventListener(scope.domTarget, nativeEventName, listener, opt);
}
function unmountDOMEventListeners(scope) {
    var mounted = scope.mounted;
    for (var nativeEventName in mounted) {
        if (mounted.hasOwnProperty(nativeEventName)) {
            removeEventListener(scope.domTarget, nativeEventName, mounted[nativeEventName], scope.listenerOpts[nativeEventName]);
        }
    }
    scope.mounted = {};
}
var DOMHandlerScope = (function () {
    function DOMHandlerScope(domTarget, domHandlers) {
        this.mounted = {};
        this.listenerOpts = {};
        this.touching = false;
        this.domTarget = domTarget;
        this.domHandlers = domHandlers;
    }
    return DOMHandlerScope;
}());
var HandlerDomProxy = (function (_super) {
    __extends(HandlerDomProxy, _super);
    function HandlerDomProxy(dom, painterRoot) {
        var _this = _super.call(this) || this;
        _this.__pointerCapturing = false;
        _this.dom = dom;
        _this.painterRoot = painterRoot;
        _this._localHandlerScope = new DOMHandlerScope(dom, localDOMHandlers);
        if (globalEventSupported) {
            _this._globalHandlerScope = new DOMHandlerScope(document, globalDOMHandlers);
        }
        mountLocalDOMEventListeners(_this, _this._localHandlerScope);
        return _this;
    }
    HandlerDomProxy.prototype.dispose = function () {
        unmountDOMEventListeners(this._localHandlerScope);
        if (globalEventSupported) {
            unmountDOMEventListeners(this._globalHandlerScope);
        }
    };
    HandlerDomProxy.prototype.setCursor = function (cursorStyle) {
        this.dom.style && (this.dom.style.cursor = cursorStyle || 'default');
    };
    HandlerDomProxy.prototype.__togglePointerCapture = function (isPointerCapturing) {
        this.__mayPointerCapture = null;
        if (globalEventSupported
            && ((+this.__pointerCapturing) ^ (+isPointerCapturing))) {
            this.__pointerCapturing = isPointerCapturing;
            var globalHandlerScope = this._globalHandlerScope;
            isPointerCapturing
                ? mountGlobalDOMEventListeners(this, globalHandlerScope)
                : unmountDOMEventListeners(globalHandlerScope);
        }
    };
    return HandlerDomProxy;
}(Eventful));

/*!
* ZRender, a high performance 2d drawing library.
*
* Copyright (c) 2013, Baidu Inc.
* All rights reserved.
*
* LICENSE
* https://github.com/ecomfe/zrender/blob/master/LICENSE.txt
*/
var useVML = !env.canvasSupported;
var painterCtors = {};
var instances$1 = {};
function delInstance(id) {
    delete instances$1[id];
}
function isDarkMode(backgroundColor) {
    if (!backgroundColor) {
        return false;
    }
    if (typeof backgroundColor === 'string') {
        return lum(backgroundColor, 1) < DARK_MODE_THRESHOLD;
    }
    else if (backgroundColor.colorStops) {
        var colorStops = backgroundColor.colorStops;
        var totalLum = 0;
        var len = colorStops.length;
        for (var i = 0; i < len; i++) {
            totalLum += lum(colorStops[i].color, 1);
        }
        totalLum /= len;
        return totalLum < DARK_MODE_THRESHOLD;
    }
    return false;
}
var ZRender = (function () {
    function ZRender(id, dom, opts) {
        var _this = this;
        this._sleepAfterStill = 10;
        this._stillFrameAccum = 0;
        this._needsRefresh = true;
        this._needsRefreshHover = true;
        this._darkMode = false;
        opts = opts || {};
        this.dom = dom;
        this.id = id;
        var storage = new Storage();
        var rendererType = opts.renderer || 'canvas';
        if (useVML) {
            throw new Error('IE8 support has been dropped since 5.0');
        }
        if (!painterCtors[rendererType]) {
            rendererType = keys(painterCtors)[0];
        }
        if (!painterCtors[rendererType]) {
            throw new Error("Renderer '" + rendererType + "' is not imported. Please import it first.");
        }
        opts.useDirtyRect = opts.useDirtyRect == null
            ? false
            : opts.useDirtyRect;
        var painter = new painterCtors[rendererType](dom, storage, opts, id);
        this.storage = storage;
        this.painter = painter;
        var handerProxy = (!env.node && !env.worker)
            ? new HandlerDomProxy(painter.getViewportRoot(), painter.root)
            : null;
        this.handler = new Handler(storage, painter, handerProxy, painter.root);
        this.animation = new Animation({
            stage: {
                update: function () { return _this._flush(true); }
            }
        });
        this.animation.start();
    }
    ZRender.prototype.add = function (el) {
        if (!el) {
            return;
        }
        this.storage.addRoot(el);
        el.addSelfToZr(this);
        this.refresh();
    };
    ZRender.prototype.remove = function (el) {
        if (!el) {
            return;
        }
        this.storage.delRoot(el);
        el.removeSelfFromZr(this);
        this.refresh();
    };
    ZRender.prototype.configLayer = function (zLevel, config) {
        if (this.painter.configLayer) {
            this.painter.configLayer(zLevel, config);
        }
        this.refresh();
    };
    ZRender.prototype.setBackgroundColor = function (backgroundColor) {
        if (this.painter.setBackgroundColor) {
            this.painter.setBackgroundColor(backgroundColor);
        }
        this.refresh();
        this._backgroundColor = backgroundColor;
        this._darkMode = isDarkMode(backgroundColor);
    };
    ZRender.prototype.getBackgroundColor = function () {
        return this._backgroundColor;
    };
    ZRender.prototype.setDarkMode = function (darkMode) {
        this._darkMode = darkMode;
    };
    ZRender.prototype.isDarkMode = function () {
        return this._darkMode;
    };
    ZRender.prototype.refreshImmediately = function (fromInside) {
        if (!fromInside) {
            this.animation.update(true);
        }
        this._needsRefresh = false;
        this.painter.refresh();
        this._needsRefresh = false;
    };
    ZRender.prototype.refresh = function () {
        this._needsRefresh = true;
        this.animation.start();
    };
    ZRender.prototype.flush = function () {
        this._flush(false);
    };
    ZRender.prototype._flush = function (fromInside) {
        var triggerRendered;
        var start = new Date().getTime();
        if (this._needsRefresh) {
            triggerRendered = true;
            this.refreshImmediately(fromInside);
        }
        if (this._needsRefreshHover) {
            triggerRendered = true;
            this.refreshHoverImmediately();
        }
        var end = new Date().getTime();
        if (triggerRendered) {
            this._stillFrameAccum = 0;
            this.trigger('rendered', {
                elapsedTime: end - start
            });
        }
        else if (this._sleepAfterStill > 0) {
            this._stillFrameAccum++;
            if (this._stillFrameAccum > this._sleepAfterStill) {
                this.animation.stop();
            }
        }
    };
    ZRender.prototype.setSleepAfterStill = function (stillFramesCount) {
        this._sleepAfterStill = stillFramesCount;
    };
    ZRender.prototype.wakeUp = function () {
        this.animation.start();
        this._stillFrameAccum = 0;
    };
    ZRender.prototype.addHover = function (el) {
    };
    ZRender.prototype.removeHover = function (el) {
    };
    ZRender.prototype.clearHover = function () {
    };
    ZRender.prototype.refreshHover = function () {
        this._needsRefreshHover = true;
    };
    ZRender.prototype.refreshHoverImmediately = function () {
        this._needsRefreshHover = false;
        if (this.painter.refreshHover && this.painter.getType() === 'canvas') {
            this.painter.refreshHover();
        }
    };
    ZRender.prototype.resize = function (opts) {
        opts = opts || {};
        this.painter.resize(opts.width, opts.height);
        this.handler.resize();
    };
    ZRender.prototype.clearAnimation = function () {
        this.animation.clear();
    };
    ZRender.prototype.getWidth = function () {
        return this.painter.getWidth();
    };
    ZRender.prototype.getHeight = function () {
        return this.painter.getHeight();
    };
    ZRender.prototype.pathToImage = function (e, dpr) {
        if (this.painter.pathToImage) {
            return this.painter.pathToImage(e, dpr);
        }
    };
    ZRender.prototype.setCursorStyle = function (cursorStyle) {
        this.handler.setCursorStyle(cursorStyle);
    };
    ZRender.prototype.findHover = function (x, y) {
        return this.handler.findHover(x, y);
    };
    ZRender.prototype.on = function (eventName, eventHandler, context) {
        this.handler.on(eventName, eventHandler, context);
        return this;
    };
    ZRender.prototype.off = function (eventName, eventHandler) {
        this.handler.off(eventName, eventHandler);
    };
    ZRender.prototype.trigger = function (eventName, event) {
        this.handler.trigger(eventName, event);
    };
    ZRender.prototype.clear = function () {
        var roots = this.storage.getRoots();
        for (var i = 0; i < roots.length; i++) {
            if (roots[i] instanceof Group) {
                roots[i].removeSelfFromZr(this);
            }
        }
        this.storage.delAllRoots();
        this.painter.clear();
    };
    ZRender.prototype.dispose = function () {
        this.animation.stop();
        this.clear();
        this.storage.dispose();
        this.painter.dispose();
        this.handler.dispose();
        this.animation =
            this.storage =
                this.painter =
                    this.handler = null;
        delInstance(this.id);
    };
    return ZRender;
}());
function init$1(dom, opts) {
    var zr = new ZRender(guid(), dom, opts);
    instances$1[zr.id] = zr;
    return zr;
}
function dispose$1(zr) {
    zr.dispose();
}
function disposeAll() {
    for (var key in instances$1) {
        if (instances$1.hasOwnProperty(key)) {
            instances$1[key].dispose();
        }
    }
    instances$1 = {};
}
function getInstance(id) {
    return instances$1[id];
}
function registerPainter(name, Ctor) {
    painterCtors[name] = Ctor;
}
var version$1 = '5.0.4';

var zrender = /*#__PURE__*/Object.freeze({
  __proto__: null,
  init: init$1,
  dispose: dispose$1,
  disposeAll: disposeAll,
  getInstance: getInstance,
  registerPainter: registerPainter,
  version: version$1
});

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
var platform = ''; // Navigator not exists in node

if (typeof navigator !== 'undefined') {
  /* global navigator */
  platform = navigator.platform || '';
}

var decalColor = 'rgba(0, 0, 0, 0.2)';
var globalDefault = {
  darkMode: 'auto',
  // backgroundColor: 'rgba(0,0,0,0)',
  // https://dribbble.com/shots/1065960-Infographic-Pie-chart-visualization
  // color: ['#5793f3', '#d14a61', '#fd9c35', '#675bba', '#fec42c', '#dd4444', '#d4df5a', '#cd4870'],
  // Light colors:
  // color: ['#bcd3bb', '#e88f70', '#edc1a5', '#9dc5c8', '#e1e8c8', '#7b7c68', '#e5b5b5', '#f0b489', '#928ea8', '#bda29a'],
  // color: ['#cc5664', '#9bd6ec', '#ea946e', '#8acaaa', '#f1ec64', '#ee8686', '#a48dc1', '#5da6bc', '#b9dcae'],
  // Dark colors:
  // color: [
  //     '#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83',
  //     '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'
  // ],
  color: [// '#51689b', '#ce5c5c', '#fbc357', '#8fbf8f', '#659d84', '#fb8e6a', '#c77288', '#786090', '#91c4c5', '#6890ba'
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
  gradientColor: ['#f6efa6', '#d88273', '#bf444c'],
  aria: {
    decal: {
      decals: [{
        color: decalColor,
        dashArrayX: [1, 0],
        dashArrayY: [2, 5],
        symbolSize: 1,
        rotation: Math.PI / 6
      }, {
        color: decalColor,
        symbol: 'circle',
        dashArrayX: [[8, 8], [0, 8, 8, 0]],
        dashArrayY: [6, 0],
        symbolSize: 0.8
      }, {
        color: decalColor,
        dashArrayX: [1, 0],
        dashArrayY: [4, 3],
        rotation: -Math.PI / 4
      }, {
        color: decalColor,
        dashArrayX: [[6, 6], [0, 6, 6, 0]],
        dashArrayY: [6, 0]
      }, {
        color: decalColor,
        dashArrayX: [[1, 0], [1, 6]],
        dashArrayY: [1, 0, 6, 0],
        rotation: Math.PI / 4
      }, {
        color: decalColor,
        symbol: 'triangle',
        dashArrayX: [[9, 9], [0, 9, 9, 0]],
        dashArrayY: [7, 2],
        symbolSize: 0.75
      }]
    }
  },
  // If xAxis and yAxis declared, grid is created by default.
  // grid: {},
  textStyle: {
    // color: '#000',
    // decoration: 'none',
    // PENDING
    fontFamily: platform.match(/^Win/) ? 'Microsoft YaHei' : 'sans-serif',
    // fontFamily: 'Arial, Verdana, sans-serif',
    fontSize: 12,
    fontStyle: 'normal',
    fontWeight: 'normal'
  },
  // http://blogs.adobe.com/webplatform/2014/02/24/using-blend-modes-in-html-canvas/
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
  // Default is source-over
  blendMode: null,
  stateAnimation: {
    duration: 300,
    easing: 'cubicOut'
  },
  animation: 'auto',
  animationDuration: 1000,
  animationDurationUpdate: 500,
  animationEasing: 'cubicInOut',
  animationEasingUpdate: 'cubicInOut',
  animationThreshold: 2000,
  // Configuration for progressive/incremental rendering
  progressiveThreshold: 3000,
  progressive: 400,
  // Threshold of if use single hover layer to optimize.
  // It is recommended that `hoverLayerThreshold` is equivalent to or less than
  // `progressiveThreshold`, otherwise hover will cause restart of progressive,
  // which is unexpected.
  // see example <echarts/test/heatmap-large.html>.
  hoverLayerThreshold: 3000,
  // See: module:echarts/scale/Time
  useUTC: false
};

var internalOptionCreatorMap = createHashMap();
function concatInternalOptions(ecModel, mainType, newCmptOptionList) {
  var internalOptionCreator = internalOptionCreatorMap.get(mainType);

  if (!internalOptionCreator) {
    return newCmptOptionList;
  }

  var internalOptions = internalOptionCreator(ecModel);

  if (!internalOptions) {
    return newCmptOptionList;
  }

  return newCmptOptionList.concat(internalOptions);
}

// Internal method names:
// -----------------------

var reCreateSeriesIndices;
var assertSeriesInitialized;
var initBase;
var OPTION_INNER_KEY = '\0_ec_inner';
var OPTION_INNER_VALUE = 1;

var GlobalModel =
/** @class */
function (_super) {
  __extends(GlobalModel, _super);

  function GlobalModel() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  GlobalModel.prototype.init = function (option, parentModel, ecModel, theme, locale, optionManager) {
    theme = theme || {};
    this.option = null; // Mark as not initialized.

    this._theme = new Model(theme);
    this._locale = new Model(locale);
    this._optionManager = optionManager;
  };

  GlobalModel.prototype.setOption = function (option, opts, optionPreprocessorFuncs) {

    var innerOpt = normalizeSetOptionInput(opts);

    this._optionManager.setOption(option, optionPreprocessorFuncs, innerOpt);

    this._resetOption(null, innerOpt);
  };
  /**
   * @param type null/undefined: reset all.
   *        'recreate': force recreate all.
   *        'timeline': only reset timeline option
   *        'media': only reset media query option
   * @return Whether option changed.
   */


  GlobalModel.prototype.resetOption = function (type, opt) {
    return this._resetOption(type, normalizeSetOptionInput(opt));
  };

  GlobalModel.prototype._resetOption = function (type, opt) {
    var optionChanged = false;
    var optionManager = this._optionManager;

    if (!type || type === 'recreate') {
      var baseOption = optionManager.mountOption(type === 'recreate');

      if (!this.option || type === 'recreate') {
        initBase(this, baseOption);
      } else {
        this.restoreData();

        this._mergeOption(baseOption, opt);
      }

      optionChanged = true;
    }

    if (type === 'timeline' || type === 'media') {
      this.restoreData();
    } // By design, if `setOption(option2)` at the second time, and `option2` is a `ECUnitOption`,
    // it should better not have the same props with `MediaUnit['option']`.
    // Becuase either `option2` or `MediaUnit['option']` will be always merged to "current option"
    // rather than original "baseOption". If they both override a prop, the result might be
    // unexpected when media state changed after `setOption` called.
    // If we really need to modify a props in each `MediaUnit['option']`, use the full version
    // (`{baseOption, media}`) in `setOption`.
    // For `timeline`, the case is the same.


    if (!type || type === 'recreate' || type === 'timeline') {
      var timelineOption = optionManager.getTimelineOption(this);

      if (timelineOption) {
        optionChanged = true;

        this._mergeOption(timelineOption, opt);
      }
    }

    if (!type || type === 'recreate' || type === 'media') {
      var mediaOptions = optionManager.getMediaOption(this);

      if (mediaOptions.length) {
        each$2(mediaOptions, function (mediaOption) {
          optionChanged = true;

          this._mergeOption(mediaOption, opt);
        }, this);
      }
    }

    return optionChanged;
  };

  GlobalModel.prototype.mergeOption = function (option) {
    this._mergeOption(option, null);
  };

  GlobalModel.prototype._mergeOption = function (newOption, opt) {
    var option = this.option;
    var componentsMap = this._componentsMap;
    var componentsCount = this._componentsCount;
    var newCmptTypes = [];
    var newCmptTypeMap = createHashMap();
    var replaceMergeMainTypeMap = opt && opt.replaceMergeMainTypeMap;
    resetSourceDefaulter(this); // If no component class, merge directly.
    // For example: color, animaiton options, etc.

    each$2(newOption, function (componentOption, mainType) {
      if (componentOption == null) {
        return;
      }

      if (!ComponentModel.hasClass(mainType)) {
        // globalSettingTask.dirty();
        option[mainType] = option[mainType] == null ? clone(componentOption) : merge(option[mainType], componentOption, true);
      } else if (mainType) {
        newCmptTypes.push(mainType);
        newCmptTypeMap.set(mainType, true);
      }
    });

    if (replaceMergeMainTypeMap) {
      // If there is a mainType `xxx` in `replaceMerge` but not declared in option,
      // we trade it as it is declared in option as `{xxx: []}`. Because:
      // (1) for normal merge, `{xxx: null/undefined}` are the same meaning as `{xxx: []}`.
      // (2) some preprocessor may convert some of `{xxx: null/undefined}` to `{xxx: []}`.
      replaceMergeMainTypeMap.each(function (val, mainTypeInReplaceMerge) {
        if (ComponentModel.hasClass(mainTypeInReplaceMerge) && !newCmptTypeMap.get(mainTypeInReplaceMerge)) {
          newCmptTypes.push(mainTypeInReplaceMerge);
          newCmptTypeMap.set(mainTypeInReplaceMerge, true);
        }
      });
    }

    ComponentModel.topologicalTravel(newCmptTypes, ComponentModel.getAllClassMainTypes(), visitComponent, this);

    function visitComponent(mainType) {
      var newCmptOptionList = concatInternalOptions(this, mainType, normalizeToArray(newOption[mainType]));
      var oldCmptList = componentsMap.get(mainType);
      var mergeMode = // `!oldCmptList` means init. See the comment in `mappingToExists`
      !oldCmptList ? 'replaceAll' : replaceMergeMainTypeMap && replaceMergeMainTypeMap.get(mainType) ? 'replaceMerge' : 'normalMerge';
      var mappingResult = mappingToExists(oldCmptList, newCmptOptionList, mergeMode); // Set mainType and complete subType.

      setComponentTypeToKeyInfo(mappingResult, mainType, ComponentModel); // Empty it before the travel, in order to prevent `this._componentsMap`
      // from being used in the `init`/`mergeOption`/`optionUpdated` of some
      // components, which is probably incorrect logic.

      option[mainType] = null;
      componentsMap.set(mainType, null);
      componentsCount.set(mainType, 0);
      var optionsByMainType = [];
      var cmptsByMainType = [];
      var cmptsCountByMainType = 0;
      each$2(mappingResult, function (resultItem, index) {
        var componentModel = resultItem.existing;
        var newCmptOption = resultItem.newOption;

        if (!newCmptOption) {
          if (componentModel) {
            // Consider where is no new option and should be merged using {},
            // see removeEdgeAndAdd in topologicalTravel and
            // ComponentModel.getAllClassMainTypes.
            componentModel.mergeOption({}, this);
            componentModel.optionUpdated({}, false);
          } // If no both `resultItem.exist` and `resultItem.option`,
          // either it is in `replaceMerge` and not matched by any id,
          // or it has been removed in previous `replaceMerge` and left a "hole" in this component index.

        } else {
          var ComponentModelClass = ComponentModel.getClass(mainType, resultItem.keyInfo.subType, true);

          if (componentModel && componentModel.constructor === ComponentModelClass) {
            componentModel.name = resultItem.keyInfo.name; // componentModel.settingTask && componentModel.settingTask.dirty();

            componentModel.mergeOption(newCmptOption, this);
            componentModel.optionUpdated(newCmptOption, false);
          } else {
            // PENDING Global as parent ?
            var extraOpt = extend({
              componentIndex: index
            }, resultItem.keyInfo);
            componentModel = new ComponentModelClass(newCmptOption, this, this, extraOpt); // Assign `keyInfo`

            extend(componentModel, extraOpt);

            if (resultItem.brandNew) {
              componentModel.__requireNewView = true;
            }

            componentModel.init(newCmptOption, this, this); // Call optionUpdated after init.
            // newCmptOption has been used as componentModel.option
            // and may be merged with theme and default, so pass null
            // to avoid confusion.

            componentModel.optionUpdated(null, true);
          }
        }

        if (componentModel) {
          optionsByMainType.push(componentModel.option);
          cmptsByMainType.push(componentModel);
          cmptsCountByMainType++;
        } else {
          // Always do assign to avoid elided item in array.
          optionsByMainType.push(void 0);
          cmptsByMainType.push(void 0);
        }
      }, this);
      option[mainType] = optionsByMainType;
      componentsMap.set(mainType, cmptsByMainType);
      componentsCount.set(mainType, cmptsCountByMainType); // Backup series for filtering.

      if (mainType === 'series') {
        reCreateSeriesIndices(this);
      }
    } // If no series declared, ensure `_seriesIndices` initialized.


    if (!this._seriesIndices) {
      reCreateSeriesIndices(this);
    }
  };
  /**
   * Get option for output (cloned option and inner info removed)
   */


  GlobalModel.prototype.getOption = function () {
    var option = clone(this.option);
    each$2(option, function (optInMainType, mainType) {
      if (ComponentModel.hasClass(mainType)) {
        var opts = normalizeToArray(optInMainType); // Inner cmpts need to be removed.
        // Inner cmpts might not be at last since ec5.0, but still
        // compatible for users: if inner cmpt at last, splice the returned array.

        var realLen = opts.length;
        var metNonInner = false;

        for (var i = realLen - 1; i >= 0; i--) {
          // Remove options with inner id.
          if (opts[i] && !isComponentIdInternal(opts[i])) {
            metNonInner = true;
          } else {
            opts[i] = null;
            !metNonInner && realLen--;
          }
        }

        opts.length = realLen;
        option[mainType] = opts;
      }
    });
    delete option[OPTION_INNER_KEY];
    return option;
  };

  GlobalModel.prototype.getTheme = function () {
    return this._theme;
  };

  GlobalModel.prototype.getLocaleModel = function () {
    return this._locale;
  };

  GlobalModel.prototype.getLocale = function (localePosition) {
    var locale = this.getLocaleModel();
    return locale.get(localePosition);
  };

  GlobalModel.prototype.setUpdatePayload = function (payload) {
    this._payload = payload;
  };

  GlobalModel.prototype.getUpdatePayload = function () {
    return this._payload;
  };
  /**
   * @param idx If not specified, return the first one.
   */


  GlobalModel.prototype.getComponent = function (mainType, idx) {
    var list = this._componentsMap.get(mainType);

    if (list) {
      var cmpt = list[idx || 0];

      if (cmpt) {
        return cmpt;
      } else if (idx == null) {
        for (var i = 0; i < list.length; i++) {
          if (list[i]) {
            return list[i];
          }
        }
      }
    }
  };
  /**
   * @return Never be null/undefined.
   */


  GlobalModel.prototype.queryComponents = function (condition) {
    var mainType = condition.mainType;

    if (!mainType) {
      return [];
    }

    var index = condition.index;
    var id = condition.id;
    var name = condition.name;

    var cmpts = this._componentsMap.get(mainType);

    if (!cmpts || !cmpts.length) {
      return [];
    }

    var result;

    if (index != null) {
      result = [];
      each$2(normalizeToArray(index), function (idx) {
        cmpts[idx] && result.push(cmpts[idx]);
      });
    } else if (id != null) {
      result = queryByIdOrName('id', id, cmpts);
    } else if (name != null) {
      result = queryByIdOrName('name', name, cmpts);
    } else {
      // Return all non-empty components in that mainType
      result = filter(cmpts, function (cmpt) {
        return !!cmpt;
      });
    }

    return filterBySubType(result, condition);
  };
  /**
   * The interface is different from queryComponents,
   * which is convenient for inner usage.
   *
   * @usage
   * let result = findComponents(
   *     {mainType: 'dataZoom', query: {dataZoomId: 'abc'}}
   * );
   * let result = findComponents(
   *     {mainType: 'series', subType: 'pie', query: {seriesName: 'uio'}}
   * );
   * let result = findComponents(
   *     {mainType: 'series',
   *     filter: function (model, index) {...}}
   * );
   * // result like [component0, componnet1, ...]
   */


  GlobalModel.prototype.findComponents = function (condition) {
    var query = condition.query;
    var mainType = condition.mainType;
    var queryCond = getQueryCond(query);
    var result = queryCond ? this.queryComponents(queryCond) // Retrieve all non-empty components.
    : filter(this._componentsMap.get(mainType), function (cmpt) {
      return !!cmpt;
    });
    return doFilter(filterBySubType(result, condition));

    function getQueryCond(q) {
      var indexAttr = mainType + 'Index';
      var idAttr = mainType + 'Id';
      var nameAttr = mainType + 'Name';
      return q && (q[indexAttr] != null || q[idAttr] != null || q[nameAttr] != null) ? {
        mainType: mainType,
        // subType will be filtered finally.
        index: q[indexAttr],
        id: q[idAttr],
        name: q[nameAttr]
      } : null;
    }

    function doFilter(res) {
      return condition.filter ? filter(res, condition.filter) : res;
    }
  };

  GlobalModel.prototype.eachComponent = function (mainType, cb, context) {
    var componentsMap = this._componentsMap;

    if (isFunction$1(mainType)) {
      var ctxForAll_1 = cb;
      var cbForAll_1 = mainType;
      componentsMap.each(function (cmpts, componentType) {
        for (var i = 0; cmpts && i < cmpts.length; i++) {
          var cmpt = cmpts[i];
          cmpt && cbForAll_1.call(ctxForAll_1, componentType, cmpt, cmpt.componentIndex);
        }
      });
    } else {
      var cmpts = isString(mainType) ? componentsMap.get(mainType) : isObject$2(mainType) ? this.findComponents(mainType) : null;

      for (var i = 0; cmpts && i < cmpts.length; i++) {
        var cmpt = cmpts[i];
        cmpt && cb.call(context, cmpt, cmpt.componentIndex);
      }
    }
  };
  /**
   * Get series list before filtered by name.
   */


  GlobalModel.prototype.getSeriesByName = function (name) {
    var nameStr = convertOptionIdName(name, null);
    return filter(this._componentsMap.get('series'), function (oneSeries) {
      return !!oneSeries && nameStr != null && oneSeries.name === nameStr;
    });
  };
  /**
   * Get series list before filtered by index.
   */


  GlobalModel.prototype.getSeriesByIndex = function (seriesIndex) {
    return this._componentsMap.get('series')[seriesIndex];
  };
  /**
   * Get series list before filtered by type.
   * FIXME: rename to getRawSeriesByType?
   */


  GlobalModel.prototype.getSeriesByType = function (subType) {
    return filter(this._componentsMap.get('series'), function (oneSeries) {
      return !!oneSeries && oneSeries.subType === subType;
    });
  };
  /**
   * Get all series before filtered.
   */


  GlobalModel.prototype.getSeries = function () {
    return filter(this._componentsMap.get('series').slice(), function (oneSeries) {
      return !!oneSeries;
    });
  };
  /**
   * Count series before filtered.
   */


  GlobalModel.prototype.getSeriesCount = function () {
    return this._componentsCount.get('series');
  };
  /**
   * After filtering, series may be different
   * frome raw series.
   */


  GlobalModel.prototype.eachSeries = function (cb, context) {
    assertSeriesInitialized(this);
    each$2(this._seriesIndices, function (rawSeriesIndex) {
      var series = this._componentsMap.get('series')[rawSeriesIndex];

      cb.call(context, series, rawSeriesIndex);
    }, this);
  };
  /**
   * Iterate raw series before filtered.
   *
   * @param {Function} cb
   * @param {*} context
   */


  GlobalModel.prototype.eachRawSeries = function (cb, context) {
    each$2(this._componentsMap.get('series'), function (series) {
      series && cb.call(context, series, series.componentIndex);
    });
  };
  /**
   * After filtering, series may be different.
   * frome raw series.
   */


  GlobalModel.prototype.eachSeriesByType = function (subType, cb, context) {
    assertSeriesInitialized(this);
    each$2(this._seriesIndices, function (rawSeriesIndex) {
      var series = this._componentsMap.get('series')[rawSeriesIndex];

      if (series.subType === subType) {
        cb.call(context, series, rawSeriesIndex);
      }
    }, this);
  };
  /**
   * Iterate raw series before filtered of given type.
   */


  GlobalModel.prototype.eachRawSeriesByType = function (subType, cb, context) {
    return each$2(this.getSeriesByType(subType), cb, context);
  };

  GlobalModel.prototype.isSeriesFiltered = function (seriesModel) {
    assertSeriesInitialized(this);
    return this._seriesIndicesMap.get(seriesModel.componentIndex) == null;
  };

  GlobalModel.prototype.getCurrentSeriesIndices = function () {
    return (this._seriesIndices || []).slice();
  };

  GlobalModel.prototype.filterSeries = function (cb, context) {
    assertSeriesInitialized(this);
    var newSeriesIndices = [];
    each$2(this._seriesIndices, function (seriesRawIdx) {
      var series = this._componentsMap.get('series')[seriesRawIdx];

      cb.call(context, series, seriesRawIdx) && newSeriesIndices.push(seriesRawIdx);
    }, this);
    this._seriesIndices = newSeriesIndices;
    this._seriesIndicesMap = createHashMap(newSeriesIndices);
  };

  GlobalModel.prototype.restoreData = function (payload) {
    reCreateSeriesIndices(this);
    var componentsMap = this._componentsMap;
    var componentTypes = [];
    componentsMap.each(function (components, componentType) {
      if (ComponentModel.hasClass(componentType)) {
        componentTypes.push(componentType);
      }
    });
    ComponentModel.topologicalTravel(componentTypes, ComponentModel.getAllClassMainTypes(), function (componentType) {
      each$2(componentsMap.get(componentType), function (component) {
        if (component && (componentType !== 'series' || !isNotTargetSeries(component, payload))) {
          component.restoreData();
        }
      });
    });
  };

  GlobalModel.internalField = function () {
    reCreateSeriesIndices = function (ecModel) {
      var seriesIndices = ecModel._seriesIndices = [];
      each$2(ecModel._componentsMap.get('series'), function (series) {
        // series may have been removed by `replaceMerge`.
        series && seriesIndices.push(series.componentIndex);
      });
      ecModel._seriesIndicesMap = createHashMap(seriesIndices);
    };

    assertSeriesInitialized = function (ecModel) {
    };

    initBase = function (ecModel, baseOption) {
      // Using OPTION_INNER_KEY to mark that this option can not be used outside,
      // i.e. `chart.setOption(chart.getModel().option);` is forbiden.
      ecModel.option = {};
      ecModel.option[OPTION_INNER_KEY] = OPTION_INNER_VALUE; // Init with series: [], in case of calling findSeries method
      // before series initialized.

      ecModel._componentsMap = createHashMap({
        series: []
      });
      ecModel._componentsCount = createHashMap(); // If user spefied `option.aria`, aria will be enable. This detection should be
      // performed before theme and globalDefault merge.

      var airaOption = baseOption.aria;

      if (isObject$2(airaOption) && airaOption.enabled == null) {
        airaOption.enabled = true;
      }

      mergeTheme(baseOption, ecModel._theme.option); // TODO Needs clone when merging to the unexisted property

      merge(baseOption, globalDefault, false);

      ecModel._mergeOption(baseOption, null);
    };
  }();

  return GlobalModel;
}(Model);

function isNotTargetSeries(seriesModel, payload) {
  if (payload) {
    var index = payload.seriesIndex;
    var id = payload.seriesId;
    var name_1 = payload.seriesName;
    return index != null && seriesModel.componentIndex !== index || id != null && seriesModel.id !== id || name_1 != null && seriesModel.name !== name_1;
  }
}

function mergeTheme(option, theme) {
  // PENDING
  // NOT use `colorLayer` in theme if option has `color`
  var notMergeColorLayer = option.color && !option.colorLayer;
  each$2(theme, function (themeItem, name) {
    if (name === 'colorLayer' && notMergeColorLayer) {
      return;
    } // If it is component model mainType, the model handles that merge later.
    // otherwise, merge them here.


    if (!ComponentModel.hasClass(name)) {
      if (typeof themeItem === 'object') {
        option[name] = !option[name] ? clone(themeItem) : merge(option[name], themeItem, false);
      } else {
        if (option[name] == null) {
          option[name] = themeItem;
        }
      }
    }
  });
}

function queryByIdOrName(attr, idOrName, cmpts) {
  // Here is a break from echarts4: string and number are
  // treated as equal.
  if (isArray(idOrName)) {
    var keyMap_1 = createHashMap();
    each$2(idOrName, function (idOrNameItem) {
      if (idOrNameItem != null) {
        var idName = convertOptionIdName(idOrNameItem, null);
        idName != null && keyMap_1.set(idOrNameItem, true);
      }
    });
    return filter(cmpts, function (cmpt) {
      return cmpt && keyMap_1.get(cmpt[attr]);
    });
  } else {
    var idName_1 = convertOptionIdName(idOrName, null);
    return filter(cmpts, function (cmpt) {
      return cmpt && idName_1 != null && cmpt[attr] === idName_1;
    });
  }
}

function filterBySubType(components, condition) {
  // Using hasOwnProperty for restrict. Consider
  // subType is undefined in user payload.
  return condition.hasOwnProperty('subType') ? filter(components, function (cmpt) {
    return cmpt && cmpt.subType === condition.subType;
  }) : components;
}

function normalizeSetOptionInput(opts) {
  var replaceMergeMainTypeMap = createHashMap();
  opts && each$2(normalizeToArray(opts.replaceMerge), function (mainType) {

    replaceMergeMainTypeMap.set(mainType, true);
  });
  return {
    replaceMergeMainTypeMap: replaceMergeMainTypeMap
  };
}

mixin(GlobalModel, PaletteMixin);

var availableMethods = ['getDom', 'getZr', 'getWidth', 'getHeight', 'getDevicePixelRatio', 'dispatchAction', 'isDisposed', 'on', 'off', 'getDataURL', 'getConnectedDataURL', // 'getModel',
'getOption', // 'getViewOfComponentModel',
// 'getViewOfSeriesModel',
'getId', 'updateLabelLayout'];

var ExtensionAPI =
/** @class */
function () {
  function ExtensionAPI(ecInstance) {
    each$2(availableMethods, function (methodName) {
      this[methodName] = bind(ecInstance[methodName], ecInstance);
    }, this);
  }

  return ExtensionAPI;
}();

var QUERY_REG = /^(min|max)?(.+)$/; // Key: mainType
// type FakeComponentsMap = HashMap<(MappingExistingItem & { subType: string })[]>;

/**
 * TERM EXPLANATIONS:
 * See `ECOption` and `ECUnitOption` in `src/util/types.ts`.
 */

var OptionManager =
/** @class */
function () {
  // timeline.notMerge is not supported in ec3. Firstly there is rearly
  // case that notMerge is needed. Secondly supporting 'notMerge' requires
  // rawOption cloned and backuped when timeline changed, which does no
  // good to performance. What's more, that both timeline and setOption
  // method supply 'notMerge' brings complex and some problems.
  // Consider this case:
  // (step1) chart.setOption({timeline: {notMerge: false}, ...}, false);
  // (step2) chart.setOption({timeline: {notMerge: true}, ...}, false);
  function OptionManager(api) {
    this._timelineOptions = [];
    this._mediaList = [];
    /**
     * -1, means default.
     * empty means no media.
     */

    this._currentMediaIndices = [];
    this._api = api;
  }

  OptionManager.prototype.setOption = function (rawOption, optionPreprocessorFuncs, opt) {
    if (rawOption) {
      // That set dat primitive is dangerous if user reuse the data when setOption again.
      each$2(normalizeToArray(rawOption.series), function (series) {
        series && series.data && isTypedArray(series.data) && setAsPrimitive(series.data);
      });
      each$2(normalizeToArray(rawOption.dataset), function (dataset) {
        dataset && dataset.source && isTypedArray(dataset.source) && setAsPrimitive(dataset.source);
      });
    } // Caution: some series modify option data, if do not clone,
    // it should ensure that the repeat modify correctly
    // (create a new object when modify itself).


    rawOption = clone(rawOption); // FIXME
    // If some property is set in timeline options or media option but
    // not set in baseOption, a warning should be given.

    var optionBackup = this._optionBackup;
    var newParsedOption = parseRawOption(rawOption, optionPreprocessorFuncs, !optionBackup);
    this._newBaseOption = newParsedOption.baseOption; // For setOption at second time (using merge mode);

    if (optionBackup) {
      // FIXME
      // the restore merge solution is essentially incorrect.
      // the mapping can not be 100% consistent with ecModel, which probably brings
      // potential bug!
      // The first merge is delayed, becuase in most cases, users do not call `setOption` twice.
      // let fakeCmptsMap = this._fakeCmptsMap;
      // if (!fakeCmptsMap) {
      //     fakeCmptsMap = this._fakeCmptsMap = createHashMap();
      //     mergeToBackupOption(fakeCmptsMap, null, optionBackup.baseOption, null);
      // }
      // mergeToBackupOption(
      //     fakeCmptsMap, optionBackup.baseOption, newParsedOption.baseOption, opt
      // );
      // For simplicity, timeline options and media options do not support merge,
      // that is, if you `setOption` twice and both has timeline options, the latter
      // timeline opitons will not be merged to the formers, but just substitude them.
      if (newParsedOption.timelineOptions.length) {
        optionBackup.timelineOptions = newParsedOption.timelineOptions;
      }

      if (newParsedOption.mediaList.length) {
        optionBackup.mediaList = newParsedOption.mediaList;
      }

      if (newParsedOption.mediaDefault) {
        optionBackup.mediaDefault = newParsedOption.mediaDefault;
      }
    } else {
      this._optionBackup = newParsedOption;
    }
  };

  OptionManager.prototype.mountOption = function (isRecreate) {
    var optionBackup = this._optionBackup;
    this._timelineOptions = optionBackup.timelineOptions;
    this._mediaList = optionBackup.mediaList;
    this._mediaDefault = optionBackup.mediaDefault;
    this._currentMediaIndices = [];
    return clone(isRecreate // this._optionBackup.baseOption, which is created at the first `setOption`
    // called, and is merged into every new option by inner method `mergeToBackupOption`
    // each time `setOption` called, can be only used in `isRecreate`, because
    // its reliability is under suspicion. In other cases option merge is
    // performed by `model.mergeOption`.
    ? optionBackup.baseOption : this._newBaseOption);
  };

  OptionManager.prototype.getTimelineOption = function (ecModel) {
    var option;
    var timelineOptions = this._timelineOptions;

    if (timelineOptions.length) {
      // getTimelineOption can only be called after ecModel inited,
      // so we can get currentIndex from timelineModel.
      var timelineModel = ecModel.getComponent('timeline');

      if (timelineModel) {
        option = clone( // FIXME:TS as TimelineModel or quivlant interface
        timelineOptions[timelineModel.getCurrentIndex()]);
      }
    }

    return option;
  };

  OptionManager.prototype.getMediaOption = function (ecModel) {
    var ecWidth = this._api.getWidth();

    var ecHeight = this._api.getHeight();

    var mediaList = this._mediaList;
    var mediaDefault = this._mediaDefault;
    var indices = [];
    var result = []; // No media defined.

    if (!mediaList.length && !mediaDefault) {
      return result;
    } // Multi media may be applied, the latter defined media has higher priority.


    for (var i = 0, len = mediaList.length; i < len; i++) {
      if (applyMediaQuery(mediaList[i].query, ecWidth, ecHeight)) {
        indices.push(i);
      }
    } // FIXME
    // Whether mediaDefault should force users to provide? Otherwise
    // the change by media query can not be recorvered.


    if (!indices.length && mediaDefault) {
      indices = [-1];
    }

    if (indices.length && !indicesEquals(indices, this._currentMediaIndices)) {
      result = map(indices, function (index) {
        return clone(index === -1 ? mediaDefault.option : mediaList[index].option);
      });
    } // Otherwise return nothing.


    this._currentMediaIndices = indices;
    return result;
  };

  return OptionManager;
}();
/**
 * [RAW_OPTION_PATTERNS]
 * (Note: "series: []" represents all other props in `ECUnitOption`)
 *
 * (1) No prop "baseOption" declared:
 * Root option is used as "baseOption" (except prop "options" and "media").
 * ```js
 * option = {
 *     series: [],
 *     timeline: {},
 *     options: [],
 * };
 * option = {
 *     series: [],
 *     media: {},
 * };
 * option = {
 *     series: [],
 *     timeline: {},
 *     options: [],
 *     media: {},
 * }
 * ```
 *
 * (2) Prop "baseOption" declared:
 * If "baseOption" declared, `ECUnitOption` props can only be declared
 * inside "baseOption" except prop "timeline" (compat ec2).
 * ```js
 * option = {
 *     baseOption: {
 *         timeline: {},
 *         series: [],
 *     },
 *     options: []
 * };
 * option = {
 *     baseOption: {
 *         series: [],
 *     },
 *     media: []
 * };
 * option = {
 *     baseOption: {
 *         timeline: {},
 *         series: [],
 *     },
 *     options: []
 *     media: []
 * };
 * option = {
 *     // ec3 compat ec2: allow (only) `timeline` declared
 *     // outside baseOption. Keep this setting for compat.
 *     timeline: {},
 *     baseOption: {
 *         series: [],
 *     },
 *     options: [],
 *     media: []
 * };
 * ```
 */


function parseRawOption( // `rawOption` May be modified
rawOption, optionPreprocessorFuncs, isNew) {
  var mediaList = [];
  var mediaDefault;
  var baseOption;
  var declaredBaseOption = rawOption.baseOption; // Compatible with ec2, [RAW_OPTION_PATTERNS] above.

  var timelineOnRoot = rawOption.timeline;
  var timelineOptionsOnRoot = rawOption.options;
  var mediaOnRoot = rawOption.media;
  var hasMedia = !!rawOption.media;
  var hasTimeline = !!(timelineOptionsOnRoot || timelineOnRoot || declaredBaseOption && declaredBaseOption.timeline);

  if (declaredBaseOption) {
    baseOption = declaredBaseOption; // For merge option.

    if (!baseOption.timeline) {
      baseOption.timeline = timelineOnRoot;
    }
  } // For convenience, enable to use the root option as the `baseOption`:
  // `{ ...normalOptionProps, media: [{ ... }, { ... }] }`
  else {
      if (hasTimeline || hasMedia) {
        rawOption.options = rawOption.media = null;
      }

      baseOption = rawOption;
    }

  if (hasMedia) {
    if (isArray(mediaOnRoot)) {
      each$2(mediaOnRoot, function (singleMedia) {

        if (singleMedia && singleMedia.option) {
          if (singleMedia.query) {
            mediaList.push(singleMedia);
          } else if (!mediaDefault) {
            // Use the first media default.
            mediaDefault = singleMedia;
          }
        }
      });
    }
  }

  doPreprocess(baseOption);
  each$2(timelineOptionsOnRoot, function (option) {
    return doPreprocess(option);
  });
  each$2(mediaList, function (media) {
    return doPreprocess(media.option);
  });

  function doPreprocess(option) {
    each$2(optionPreprocessorFuncs, function (preProcess) {
      preProcess(option, isNew);
    });
  }

  return {
    baseOption: baseOption,
    timelineOptions: timelineOptionsOnRoot || [],
    mediaDefault: mediaDefault,
    mediaList: mediaList
  };
}
/**
 * @see <http://www.w3.org/TR/css3-mediaqueries/#media1>
 * Support: width, height, aspectRatio
 * Can use max or min as prefix.
 */


function applyMediaQuery(query, ecWidth, ecHeight) {
  var realMap = {
    width: ecWidth,
    height: ecHeight,
    aspectratio: ecWidth / ecHeight // lowser case for convenientce.

  };
  var applicatable = true;
  each$2(query, function (value, attr) {
    var matched = attr.match(QUERY_REG);

    if (!matched || !matched[1] || !matched[2]) {
      return;
    }

    var operator = matched[1];
    var realAttr = matched[2].toLowerCase();

    if (!compare(realMap[realAttr], value, operator)) {
      applicatable = false;
    }
  });
  return applicatable;
}

function compare(real, expect, operator) {
  if (operator === 'min') {
    return real >= expect;
  } else if (operator === 'max') {
    return real <= expect;
  } else {
    // Equals
    return real === expect;
  }
}

function indicesEquals(indices1, indices2) {
  // indices is always order by asc and has only finite number.
  return indices1.join(',') === indices2.join(',');
}

var each$1 = each$2;
var isObject$1 = isObject$2;
var POSSIBLE_STYLES = ['areaStyle', 'lineStyle', 'nodeStyle', 'linkStyle', 'chordStyle', 'label', 'labelLine'];

function compatEC2ItemStyle(opt) {
  var itemStyleOpt = opt && opt.itemStyle;

  if (!itemStyleOpt) {
    return;
  }

  for (var i = 0, len = POSSIBLE_STYLES.length; i < len; i++) {
    var styleName = POSSIBLE_STYLES[i];
    var normalItemStyleOpt = itemStyleOpt.normal;
    var emphasisItemStyleOpt = itemStyleOpt.emphasis;

    if (normalItemStyleOpt && normalItemStyleOpt[styleName]) {

      opt[styleName] = opt[styleName] || {};

      if (!opt[styleName].normal) {
        opt[styleName].normal = normalItemStyleOpt[styleName];
      } else {
        merge(opt[styleName].normal, normalItemStyleOpt[styleName]);
      }

      normalItemStyleOpt[styleName] = null;
    }

    if (emphasisItemStyleOpt && emphasisItemStyleOpt[styleName]) {

      opt[styleName] = opt[styleName] || {};

      if (!opt[styleName].emphasis) {
        opt[styleName].emphasis = emphasisItemStyleOpt[styleName];
      } else {
        merge(opt[styleName].emphasis, emphasisItemStyleOpt[styleName]);
      }

      emphasisItemStyleOpt[styleName] = null;
    }
  }
}

function convertNormalEmphasis(opt, optType, useExtend) {
  if (opt && opt[optType] && (opt[optType].normal || opt[optType].emphasis)) {
    var normalOpt = opt[optType].normal;
    var emphasisOpt = opt[optType].emphasis;

    if (normalOpt) {


      if (useExtend) {
        opt[optType].normal = opt[optType].emphasis = null;
        defaults(opt[optType], normalOpt);
      } else {
        opt[optType] = normalOpt;
      }
    }

    if (emphasisOpt) {

      opt.emphasis = opt.emphasis || {};
      opt.emphasis[optType] = emphasisOpt; // Also compat the case user mix the style and focus together in ec3 style
      // for example: { itemStyle: { normal: {}, emphasis: {focus, shadowBlur} } }

      if (emphasisOpt.focus) {
        opt.emphasis.focus = emphasisOpt.focus;
      }

      if (emphasisOpt.blurScope) {
        opt.emphasis.blurScope = emphasisOpt.blurScope;
      }
    }
  }
}

function removeEC3NormalStatus(opt) {
  convertNormalEmphasis(opt, 'itemStyle');
  convertNormalEmphasis(opt, 'lineStyle');
  convertNormalEmphasis(opt, 'areaStyle');
  convertNormalEmphasis(opt, 'label');
  convertNormalEmphasis(opt, 'labelLine'); // treemap

  convertNormalEmphasis(opt, 'upperLabel'); // graph

  convertNormalEmphasis(opt, 'edgeLabel');
}

function compatTextStyle(opt, propName) {
  // Check whether is not object (string\null\undefined ...)
  var labelOptSingle = isObject$1(opt) && opt[propName];
  var textStyle = isObject$1(labelOptSingle) && labelOptSingle.textStyle;

  if (textStyle) {

    for (var i = 0, len = TEXT_STYLE_OPTIONS.length; i < len; i++) {
      var textPropName = TEXT_STYLE_OPTIONS[i];

      if (textStyle.hasOwnProperty(textPropName)) {
        labelOptSingle[textPropName] = textStyle[textPropName];
      }
    }
  }
}

function compatEC3CommonStyles(opt) {
  if (opt) {
    removeEC3NormalStatus(opt);
    compatTextStyle(opt, 'label');
    opt.emphasis && compatTextStyle(opt.emphasis, 'label');
  }
}

function processSeries(seriesOpt) {
  if (!isObject$1(seriesOpt)) {
    return;
  }

  compatEC2ItemStyle(seriesOpt);
  removeEC3NormalStatus(seriesOpt);
  compatTextStyle(seriesOpt, 'label'); // treemap

  compatTextStyle(seriesOpt, 'upperLabel'); // graph

  compatTextStyle(seriesOpt, 'edgeLabel');

  if (seriesOpt.emphasis) {
    compatTextStyle(seriesOpt.emphasis, 'label'); // treemap

    compatTextStyle(seriesOpt.emphasis, 'upperLabel'); // graph

    compatTextStyle(seriesOpt.emphasis, 'edgeLabel');
  }

  var markPoint = seriesOpt.markPoint;

  if (markPoint) {
    compatEC2ItemStyle(markPoint);
    compatEC3CommonStyles(markPoint);
  }

  var markLine = seriesOpt.markLine;

  if (markLine) {
    compatEC2ItemStyle(markLine);
    compatEC3CommonStyles(markLine);
  }

  var markArea = seriesOpt.markArea;

  if (markArea) {
    compatEC3CommonStyles(markArea);
  }

  var data = seriesOpt.data; // Break with ec3: if `setOption` again, there may be no `type` in option,
  // then the backward compat based on option type will not be performed.

  if (seriesOpt.type === 'graph') {
    data = data || seriesOpt.nodes;
    var edgeData = seriesOpt.links || seriesOpt.edges;

    if (edgeData && !isTypedArray(edgeData)) {
      for (var i = 0; i < edgeData.length; i++) {
        compatEC3CommonStyles(edgeData[i]);
      }
    }

    each$2(seriesOpt.categories, function (opt) {
      removeEC3NormalStatus(opt);
    });
  }

  if (data && !isTypedArray(data)) {
    for (var i = 0; i < data.length; i++) {
      compatEC3CommonStyles(data[i]);
    }
  } // mark point data


  markPoint = seriesOpt.markPoint;

  if (markPoint && markPoint.data) {
    var mpData = markPoint.data;

    for (var i = 0; i < mpData.length; i++) {
      compatEC3CommonStyles(mpData[i]);
    }
  } // mark line data


  markLine = seriesOpt.markLine;

  if (markLine && markLine.data) {
    var mlData = markLine.data;

    for (var i = 0; i < mlData.length; i++) {
      if (isArray(mlData[i])) {
        compatEC3CommonStyles(mlData[i][0]);
        compatEC3CommonStyles(mlData[i][1]);
      } else {
        compatEC3CommonStyles(mlData[i]);
      }
    }
  } // Series


  if (seriesOpt.type === 'gauge') {
    compatTextStyle(seriesOpt, 'axisLabel');
    compatTextStyle(seriesOpt, 'title');
    compatTextStyle(seriesOpt, 'detail');
  } else if (seriesOpt.type === 'treemap') {
    convertNormalEmphasis(seriesOpt.breadcrumb, 'itemStyle');
    each$2(seriesOpt.levels, function (opt) {
      removeEC3NormalStatus(opt);
    });
  } else if (seriesOpt.type === 'tree') {
    removeEC3NormalStatus(seriesOpt.leaves);
  } // sunburst starts from ec4, so it does not need to compat levels.

}

function toArr(o) {
  return isArray(o) ? o : o ? [o] : [];
}

function toObj(o) {
  return (isArray(o) ? o[0] : o) || {};
}

function globalCompatStyle(option, isTheme) {
  each$1(toArr(option.series), function (seriesOpt) {
    isObject$1(seriesOpt) && processSeries(seriesOpt);
  });
  var axes = ['xAxis', 'yAxis', 'radiusAxis', 'angleAxis', 'singleAxis', 'parallelAxis', 'radar'];
  isTheme && axes.push('valueAxis', 'categoryAxis', 'logAxis', 'timeAxis');
  each$1(axes, function (axisName) {
    each$1(toArr(option[axisName]), function (axisOpt) {
      if (axisOpt) {
        compatTextStyle(axisOpt, 'axisLabel');
        compatTextStyle(axisOpt.axisPointer, 'label');
      }
    });
  });
  each$1(toArr(option.parallel), function (parallelOpt) {
    var parallelAxisDefault = parallelOpt && parallelOpt.parallelAxisDefault;
    compatTextStyle(parallelAxisDefault, 'axisLabel');
    compatTextStyle(parallelAxisDefault && parallelAxisDefault.axisPointer, 'label');
  });
  each$1(toArr(option.calendar), function (calendarOpt) {
    convertNormalEmphasis(calendarOpt, 'itemStyle');
    compatTextStyle(calendarOpt, 'dayLabel');
    compatTextStyle(calendarOpt, 'monthLabel');
    compatTextStyle(calendarOpt, 'yearLabel');
  }); // radar.name.textStyle

  each$1(toArr(option.radar), function (radarOpt) {
    compatTextStyle(radarOpt, 'name'); // Use axisName instead of name because component has name property

    if (radarOpt.name && radarOpt.axisName == null) {
      radarOpt.axisName = radarOpt.name;
      delete radarOpt.name;
    }

    if (radarOpt.nameGap != null && radarOpt.axisNameGap == null) {
      radarOpt.axisNameGap = radarOpt.nameGap;
      delete radarOpt.nameGap;
    }
  });
  each$1(toArr(option.geo), function (geoOpt) {
    if (isObject$1(geoOpt)) {
      compatEC3CommonStyles(geoOpt);
      each$1(toArr(geoOpt.regions), function (regionObj) {
        compatEC3CommonStyles(regionObj);
      });
    }
  });
  each$1(toArr(option.timeline), function (timelineOpt) {
    compatEC3CommonStyles(timelineOpt);
    convertNormalEmphasis(timelineOpt, 'label');
    convertNormalEmphasis(timelineOpt, 'itemStyle');
    convertNormalEmphasis(timelineOpt, 'controlStyle', true);
    var data = timelineOpt.data;
    isArray(data) && each$2(data, function (item) {
      if (isObject$2(item)) {
        convertNormalEmphasis(item, 'label');
        convertNormalEmphasis(item, 'itemStyle');
      }
    });
  });
  each$1(toArr(option.toolbox), function (toolboxOpt) {
    convertNormalEmphasis(toolboxOpt, 'iconStyle');
    each$1(toolboxOpt.feature, function (featureOpt) {
      convertNormalEmphasis(featureOpt, 'iconStyle');
    });
  });
  compatTextStyle(toObj(option.axisPointer), 'label');
  compatTextStyle(toObj(option.tooltip).axisPointer, 'label'); // Clean logs
  // storedLogs = {};
}

function get(opt, path) {
  var pathArr = path.split(',');
  var obj = opt;

  for (var i = 0; i < pathArr.length; i++) {
    obj = obj && obj[pathArr[i]];

    if (obj == null) {
      break;
    }
  }

  return obj;
}

function set(opt, path, val, overwrite) {
  var pathArr = path.split(',');
  var obj = opt;
  var key;
  var i = 0;

  for (; i < pathArr.length - 1; i++) {
    key = pathArr[i];

    if (obj[key] == null) {
      obj[key] = {};
    }

    obj = obj[key];
  }

  if (overwrite || obj[pathArr[i]] == null) {
    obj[pathArr[i]] = val;
  }
}

function compatLayoutProperties(option) {
  option && each$2(LAYOUT_PROPERTIES, function (prop) {
    if (prop[0] in option && !(prop[1] in option)) {
      option[prop[1]] = option[prop[0]];
    }
  });
}

var LAYOUT_PROPERTIES = [['x', 'left'], ['y', 'top'], ['x2', 'right'], ['y2', 'bottom']];
var COMPATITABLE_COMPONENTS = ['grid', 'geo', 'parallel', 'legend', 'toolbox', 'title', 'visualMap', 'dataZoom', 'timeline'];
var BAR_ITEM_STYLE_MAP = [['borderRadius', 'barBorderRadius'], ['borderColor', 'barBorderColor'], ['borderWidth', 'barBorderWidth']];

function compatBarItemStyle(option) {
  var itemStyle = option && option.itemStyle;

  if (itemStyle) {
    for (var i = 0; i < BAR_ITEM_STYLE_MAP.length; i++) {
      var oldName = BAR_ITEM_STYLE_MAP[i][1];
      var newName = BAR_ITEM_STYLE_MAP[i][0];

      if (itemStyle[oldName] != null) {
        itemStyle[newName] = itemStyle[oldName];
      }
    }
  }
}

function compatPieLabel(option) {
  if (!option) {
    return;
  }

  if (option.alignTo === 'edge' && option.margin != null && option.edgeDistance == null) {

    option.edgeDistance = option.margin;
  }
}

function compatSunburstState(option) {
  if (!option) {
    return;
  }

  if (option.downplay && !option.blur) {
    option.blur = option.downplay;
  }
}

function compatGraphFocus(option) {
  if (!option) {
    return;
  }

  if (option.focusNodeAdjacency != null) {
    option.emphasis = option.emphasis || {};

    if (option.emphasis.focus == null) {

      option.emphasis.focus = 'adjacency';
    }
  }
}

function traverseTree(data, cb) {
  if (data) {
    for (var i = 0; i < data.length; i++) {
      cb(data[i]);
      data[i] && traverseTree(data[i].children, cb);
    }
  }
}

function globalBackwardCompat(option, isTheme) {
  globalCompatStyle(option, isTheme); // Make sure series array for model initialization.

  option.series = normalizeToArray(option.series);
  each$2(option.series, function (seriesOpt) {
    if (!isObject$2(seriesOpt)) {
      return;
    }

    var seriesType = seriesOpt.type;

    if (seriesType === 'line') {
      if (seriesOpt.clipOverflow != null) {
        seriesOpt.clip = seriesOpt.clipOverflow;
      }
    } else if (seriesType === 'pie' || seriesType === 'gauge') {
      if (seriesOpt.clockWise != null) {
        seriesOpt.clockwise = seriesOpt.clockWise;
      }

      compatPieLabel(seriesOpt.label);
      var data = seriesOpt.data;

      if (data && !isTypedArray(data)) {
        for (var i = 0; i < data.length; i++) {
          compatPieLabel(data[i]);
        }
      }

      if (seriesOpt.hoverOffset != null) {
        seriesOpt.emphasis = seriesOpt.emphasis || {};

        if (seriesOpt.emphasis.scaleSize = null) {

          seriesOpt.emphasis.scaleSize = seriesOpt.hoverOffset;
        }
      }
    } else if (seriesType === 'gauge') {
      var pointerColor = get(seriesOpt, 'pointer.color');
      pointerColor != null && set(seriesOpt, 'itemStyle.color', pointerColor);
    } else if (seriesType === 'bar') {
      compatBarItemStyle(seriesOpt);
      compatBarItemStyle(seriesOpt.backgroundStyle);
      compatBarItemStyle(seriesOpt.emphasis);
      var data = seriesOpt.data;

      if (data && !isTypedArray(data)) {
        for (var i = 0; i < data.length; i++) {
          if (typeof data[i] === 'object') {
            compatBarItemStyle(data[i]);
            compatBarItemStyle(data[i] && data[i].emphasis);
          }
        }
      }
    } else if (seriesType === 'sunburst') {
      var highlightPolicy = seriesOpt.highlightPolicy;

      if (highlightPolicy) {
        seriesOpt.emphasis = seriesOpt.emphasis || {};

        if (!seriesOpt.emphasis.focus) {
          seriesOpt.emphasis.focus = highlightPolicy;
        }
      }

      compatSunburstState(seriesOpt);
      traverseTree(seriesOpt.data, compatSunburstState);
    } else if (seriesType === 'graph' || seriesType === 'sankey') {
      compatGraphFocus(seriesOpt); // TODO nodes, edges?
    } else if (seriesType === 'map') {
      if (seriesOpt.mapType && !seriesOpt.map) {

        seriesOpt.map = seriesOpt.mapType;
      }

      if (seriesOpt.mapLocation) {

        defaults(seriesOpt, seriesOpt.mapLocation);
      }
    }

    if (seriesOpt.hoverAnimation != null) {
      seriesOpt.emphasis = seriesOpt.emphasis || {};

      if (seriesOpt.emphasis && seriesOpt.emphasis.scale == null) {

        seriesOpt.emphasis.scale = seriesOpt.hoverAnimation;
      }
    }

    compatLayoutProperties(seriesOpt);
  }); // dataRange has changed to visualMap

  if (option.dataRange) {
    option.visualMap = option.dataRange;
  }

  each$2(COMPATITABLE_COMPONENTS, function (componentName) {
    var options = option[componentName];

    if (options) {
      if (!isArray(options)) {
        options = [options];
      }

      each$2(options, function (option) {
        compatLayoutProperties(option);
      });
    }
  });
}

//     data processing stage is blocked in stream.
//     See <module:echarts/stream/Scheduler#performDataProcessorTasks>
// (2) Only register once when import repeatly.
//     Should be executed after series filtered and before stack calculation.

function dataStack(ecModel) {
  var stackInfoMap = createHashMap();
  ecModel.eachSeries(function (seriesModel) {
    var stack = seriesModel.get('stack'); // Compatibal: when `stack` is set as '', do not stack.

    if (stack) {
      var stackInfoList = stackInfoMap.get(stack) || stackInfoMap.set(stack, []);
      var data = seriesModel.getData();
      var stackInfo = {
        // Used for calculate axis extent automatically.
        // TODO: Type getCalculationInfo return more specific type?
        stackResultDimension: data.getCalculationInfo('stackResultDimension'),
        stackedOverDimension: data.getCalculationInfo('stackedOverDimension'),
        stackedDimension: data.getCalculationInfo('stackedDimension'),
        stackedByDimension: data.getCalculationInfo('stackedByDimension'),
        isStackedByIndex: data.getCalculationInfo('isStackedByIndex'),
        data: data,
        seriesModel: seriesModel
      }; // If stacked on axis that do not support data stack.

      if (!stackInfo.stackedDimension || !(stackInfo.isStackedByIndex || stackInfo.stackedByDimension)) {
        return;
      }

      stackInfoList.length && data.setCalculationInfo('stackedOnSeries', stackInfoList[stackInfoList.length - 1].seriesModel);
      stackInfoList.push(stackInfo);
    }
  });
  stackInfoMap.each(calculateStack);
}

function calculateStack(stackInfoList) {
  each$2(stackInfoList, function (targetStackInfo, idxInStack) {
    var resultVal = [];
    var resultNaN = [NaN, NaN];
    var dims = [targetStackInfo.stackResultDimension, targetStackInfo.stackedOverDimension];
    var targetData = targetStackInfo.data;
    var isStackedByIndex = targetStackInfo.isStackedByIndex; // Should not write on raw data, because stack series model list changes
    // depending on legend selection.

    var newData = targetData.map(dims, function (v0, v1, dataIndex) {
      var sum = targetData.get(targetStackInfo.stackedDimension, dataIndex); // Consider `connectNulls` of line area, if value is NaN, stackedOver
      // should also be NaN, to draw a appropriate belt area.

      if (isNaN(sum)) {
        return resultNaN;
      }

      var byValue;
      var stackedDataRawIndex;

      if (isStackedByIndex) {
        stackedDataRawIndex = targetData.getRawIndex(dataIndex);
      } else {
        byValue = targetData.get(targetStackInfo.stackedByDimension, dataIndex);
      } // If stackOver is NaN, chart view will render point on value start.


      var stackedOver = NaN;

      for (var j = idxInStack - 1; j >= 0; j--) {
        var stackInfo = stackInfoList[j]; // Has been optimized by inverted indices on `stackedByDimension`.

        if (!isStackedByIndex) {
          stackedDataRawIndex = stackInfo.data.rawIndexOf(stackInfo.stackedByDimension, byValue);
        }

        if (stackedDataRawIndex >= 0) {
          var val = stackInfo.data.getByRawIndex(stackInfo.stackResultDimension, stackedDataRawIndex); // Considering positive stack, negative stack and empty data

          if (sum >= 0 && val > 0 || // Positive stack
          sum <= 0 && val < 0 // Negative stack
          ) {
              sum += val;
              stackedOver = val;
              break;
            }
        }
      }

      resultVal[0] = sum;
      resultVal[1] = stackedOver;
      return resultVal;
    });
    targetData.hostModel.setData(newData); // Update for consequent calculation

    targetStackInfo.data = newData;
  });
}

var ComponentView =
/** @class */
function () {
  function ComponentView() {
    this.group = new Group();
    this.uid = getUID('viewComponent');
  }

  ComponentView.prototype.init = function (ecModel, api) {};

  ComponentView.prototype.render = function (model, ecModel, api, payload) {};

  ComponentView.prototype.dispose = function (ecModel, api) {};

  ComponentView.prototype.updateView = function (model, ecModel, api, payload) {// Do nothing;
  };

  ComponentView.prototype.updateLayout = function (model, ecModel, api, payload) {// Do nothing;
  };

  ComponentView.prototype.updateVisual = function (model, ecModel, api, payload) {// Do nothing;
  };
  /**
   * Hook for blur target series.
   * Can be used in marker for blur the markers
   */


  ComponentView.prototype.blurSeries = function (seriesModels, ecModel) {// Do nothing;
  };

  return ComponentView;
}();
enableClassExtend(ComponentView);
enableClassManagement(ComponentView);

var inner$1 = makeInner();
var defaultStyleMappers = {
  itemStyle: makeStyleMapper(ITEM_STYLE_KEY_MAP, true),
  lineStyle: makeStyleMapper(LINE_STYLE_KEY_MAP, true)
};
var defaultColorKey = {
  lineStyle: 'stroke',
  itemStyle: 'fill'
};

function getStyleMapper(seriesModel, stylePath) {
  var styleMapper = seriesModel.visualStyleMapper || defaultStyleMappers[stylePath];

  if (!styleMapper) {
    console.warn("Unkown style type '" + stylePath + "'.");
    return defaultStyleMappers.itemStyle;
  }

  return styleMapper;
}

function getDefaultColorKey(seriesModel, stylePath) {
  // return defaultColorKey[stylePath] ||
  var colorKey = seriesModel.visualDrawType || defaultColorKey[stylePath];

  if (!colorKey) {
    console.warn("Unkown style type '" + stylePath + "'.");
    return 'fill';
  }

  return colorKey;
}

var seriesStyleTask = {
  createOnAllSeries: true,
  performRawSeries: true,
  reset: function (seriesModel, ecModel) {
    var data = seriesModel.getData();
    var stylePath = seriesModel.visualStyleAccessPath || 'itemStyle'; // Set in itemStyle

    var styleModel = seriesModel.getModel(stylePath);
    var getStyle = getStyleMapper(seriesModel, stylePath);
    var globalStyle = getStyle(styleModel);
    var decalOption = styleModel.getShallow('decal');

    if (decalOption) {
      data.setVisual('decal', decalOption);
      decalOption.dirty = true;
    } // TODO


    var colorKey = getDefaultColorKey(seriesModel, stylePath);
    var color = globalStyle[colorKey]; // TODO style callback

    var colorCallback = isFunction$1(color) ? color : null; // Get from color palette by default.

    if (!globalStyle[colorKey] || colorCallback) {
      // Note: if some series has color specified (e.g., by itemStyle.color), we DO NOT
      // make it effect palette. Bacause some scenarios users need to make some series
      // transparent or as background, which should better not effect the palette.
      globalStyle[colorKey] = seriesModel.getColorFromPalette( // TODO series count changed.
      seriesModel.name, null, ecModel.getSeriesCount());
      data.setVisual('colorFromPalette', true);
    }

    data.setVisual('style', globalStyle);
    data.setVisual('drawType', colorKey); // Only visible series has each data be visual encoded

    if (!ecModel.isSeriesFiltered(seriesModel) && colorCallback) {
      data.setVisual('colorFromPalette', false);
      return {
        dataEach: function (data, idx) {
          var dataParams = seriesModel.getDataParams(idx);
          var itemStyle = extend({}, globalStyle);
          itemStyle[colorKey] = colorCallback(dataParams);
          data.setItemVisual(idx, 'style', itemStyle);
        }
      };
    }
  }
};
var sharedModel = new Model();
var dataStyleTask = {
  createOnAllSeries: true,
  performRawSeries: true,
  reset: function (seriesModel, ecModel) {
    if (seriesModel.ignoreStyleOnData || ecModel.isSeriesFiltered(seriesModel)) {
      return;
    }

    var data = seriesModel.getData();
    var stylePath = seriesModel.visualStyleAccessPath || 'itemStyle'; // Set in itemStyle

    var getStyle = getStyleMapper(seriesModel, stylePath);
    var colorKey = data.getVisual('drawType');
    return {
      dataEach: data.hasItemOption ? function (data, idx) {
        // Not use getItemModel for performance considuration
        var rawItem = data.getRawDataItem(idx);

        if (rawItem && rawItem[stylePath]) {
          sharedModel.option = rawItem[stylePath];
          var style = getStyle(sharedModel);
          var existsStyle = data.ensureUniqueItemVisual(idx, 'style');
          extend(existsStyle, style);

          if (sharedModel.option.decal) {
            data.setItemVisual(idx, 'decal', sharedModel.option.decal);
            sharedModel.option.decal.dirty = true;
          }

          if (colorKey in style) {
            data.setItemVisual(idx, 'colorFromPalette', false);
          }
        }
      } : null
    };
  }
}; // Pick color from palette for the data which has not been set with color yet.
// Note: do not support stream rendering. No such cases yet.

var dataColorPaletteTask = {
  performRawSeries: true,
  overallReset: function (ecModel) {
    // Each type of series use one scope.
    // Pie and funnel are using diferrent scopes
    var paletteScopeGroupByType = createHashMap();
    ecModel.eachSeries(function (seriesModel) {
      if (!seriesModel.useColorPaletteOnData) {
        return;
      }

      var colorScope = paletteScopeGroupByType.get(seriesModel.type);

      if (!colorScope) {
        colorScope = {};
        paletteScopeGroupByType.set(seriesModel.type, colorScope);
      }

      inner$1(seriesModel).scope = colorScope;
    });
    ecModel.eachSeries(function (seriesModel) {
      if (!seriesModel.useColorPaletteOnData || ecModel.isSeriesFiltered(seriesModel)) {
        return;
      }

      var dataAll = seriesModel.getRawData();
      var idxMap = {};
      var data = seriesModel.getData();
      var colorScope = inner$1(seriesModel).scope;
      var stylePath = seriesModel.visualStyleAccessPath || 'itemStyle';
      var colorKey = getDefaultColorKey(seriesModel, stylePath);
      data.each(function (idx) {
        var rawIdx = data.getRawIndex(idx);
        idxMap[rawIdx] = idx;
      }); // Iterate on data before filtered. To make sure color from palette can be
      // Consistent when toggling legend.

      dataAll.each(function (rawIdx) {
        var idx = idxMap[rawIdx];
        var fromPalette = data.getItemVisual(idx, 'colorFromPalette'); // Get color from palette for each data only when the color is inherited from series color, which is
        // also picked from color palette. So following situation is not in the case:
        // 1. series.itemStyle.color is set
        // 2. color is encoded by visualMap

        if (fromPalette) {
          var itemStyle = data.ensureUniqueItemVisual(idx, 'style');
          var name_1 = dataAll.getName(rawIdx) || rawIdx + '';
          var dataCount = dataAll.count();
          itemStyle[colorKey] = seriesModel.getColorFromPalette(name_1, colorScope, dataCount);
        }
      });
    });
  }
};

var PI = Math.PI;
/**
 * @param {module:echarts/ExtensionAPI} api
 * @param {Object} [opts]
 * @param {string} [opts.text]
 * @param {string} [opts.color]
 * @param {string} [opts.textColor]
 * @return {module:zrender/Element}
 */

function defaultLoading(api, opts) {
  opts = opts || {};
  defaults(opts, {
    text: 'loading',
    textColor: '#000',
    fontSize: 12,
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontFamily: 'sans-serif',
    maskColor: 'rgba(255, 255, 255, 0.8)',
    showSpinner: true,
    color: '#5470c6',
    spinnerRadius: 10,
    lineWidth: 5,
    zlevel: 0
  });
  var group = new Group();
  var mask = new Rect({
    style: {
      fill: opts.maskColor
    },
    zlevel: opts.zlevel,
    z: 10000
  });
  group.add(mask);
  var textContent = new ZRText({
    style: {
      text: opts.text,
      fill: opts.textColor,
      fontSize: opts.fontSize,
      fontWeight: opts.fontWeight,
      fontStyle: opts.fontStyle,
      fontFamily: opts.fontFamily
    }
  });
  var labelRect = new Rect({
    style: {
      fill: 'none'
    },
    textContent: textContent,
    textConfig: {
      position: 'right',
      distance: 10
    },
    zlevel: opts.zlevel,
    z: 10001
  });
  group.add(labelRect);
  var arc;

  if (opts.showSpinner) {
    arc = new Arc({
      shape: {
        startAngle: -PI / 2,
        endAngle: -PI / 2 + 0.1,
        r: opts.spinnerRadius
      },
      style: {
        stroke: opts.color,
        lineCap: 'round',
        lineWidth: opts.lineWidth
      },
      zlevel: opts.zlevel,
      z: 10001
    });
    arc.animateShape(true).when(1000, {
      endAngle: PI * 3 / 2
    }).start('circularInOut');
    arc.animateShape(true).when(1000, {
      startAngle: PI * 3 / 2
    }).delay(300).start('circularInOut');
    group.add(arc);
  } // Inject resize


  group.resize = function () {
    var textWidth = textContent.getBoundingRect().width;
    var r = opts.showSpinner ? opts.spinnerRadius : 0; // cx = (containerWidth - arcDiameter - textDistance - textWidth) / 2
    // textDistance needs to be calculated when both animation and text exist

    var cx = (api.getWidth() - r * 2 - (opts.showSpinner && textWidth ? 10 : 0) - textWidth) / 2 - (opts.showSpinner && textWidth ? 0 : 5 + textWidth / 2) // only show the text
    + (opts.showSpinner ? 0 : textWidth / 2) // only show the spinner
    + (textWidth ? 0 : r);
    var cy = api.getHeight() / 2;
    opts.showSpinner && arc.setShape({
      cx: cx,
      cy: cy
    });
    labelRect.setShape({
      x: cx - r,
      y: cy - r,
      width: r * 2,
      height: r * 2
    });
    mask.setShape({
      x: 0,
      y: 0,
      width: api.getWidth(),
      height: api.getHeight()
    });
  };

  group.resize();
  return group;
}

var Scheduler =
/** @class */
function () {
  function Scheduler(ecInstance, api, dataProcessorHandlers, visualHandlers) {
    // key: handlerUID
    this._stageTaskMap = createHashMap();
    this.ecInstance = ecInstance;
    this.api = api; // Fix current processors in case that in some rear cases that
    // processors might be registered after echarts instance created.
    // Register processors incrementally for a echarts instance is
    // not supported by this stream architecture.

    dataProcessorHandlers = this._dataProcessorHandlers = dataProcessorHandlers.slice();
    visualHandlers = this._visualHandlers = visualHandlers.slice();
    this._allHandlers = dataProcessorHandlers.concat(visualHandlers);
  }

  Scheduler.prototype.restoreData = function (ecModel, payload) {
    // TODO: Only restore needed series and components, but not all components.
    // Currently `restoreData` of all of the series and component will be called.
    // But some independent components like `title`, `legend`, `graphic`, `toolbox`,
    // `tooltip`, `axisPointer`, etc, do not need series refresh when `setOption`,
    // and some components like coordinate system, axes, dataZoom, visualMap only
    // need their target series refresh.
    // (1) If we are implementing this feature some day, we should consider these cases:
    // if a data processor depends on a component (e.g., dataZoomProcessor depends
    // on the settings of `dataZoom`), it should be re-performed if the component
    // is modified by `setOption`.
    // (2) If a processor depends on sevral series, speicified by its `getTargetSeries`,
    // it should be re-performed when the result array of `getTargetSeries` changed.
    // We use `dependencies` to cover these issues.
    // (3) How to update target series when coordinate system related components modified.
    // TODO: simply the dirty mechanism? Check whether only the case here can set tasks dirty,
    // and this case all of the tasks will be set as dirty.
    ecModel.restoreData(payload); // Theoretically an overall task not only depends on each of its target series, but also
    // depends on all of the series.
    // The overall task is not in pipeline, and `ecModel.restoreData` only set pipeline tasks
    // dirty. If `getTargetSeries` of an overall task returns nothing, we should also ensure
    // that the overall task is set as dirty and to be performed, otherwise it probably cause
    // state chaos. So we have to set dirty of all of the overall tasks manually, otherwise it
    // probably cause state chaos (consider `dataZoomProcessor`).

    this._stageTaskMap.each(function (taskRecord) {
      var overallTask = taskRecord.overallTask;
      overallTask && overallTask.dirty();
    });
  }; // If seriesModel provided, incremental threshold is check by series data.


  Scheduler.prototype.getPerformArgs = function (task, isBlock) {
    // For overall task
    if (!task.__pipeline) {
      return;
    }

    var pipeline = this._pipelineMap.get(task.__pipeline.id);

    var pCtx = pipeline.context;
    var incremental = !isBlock && pipeline.progressiveEnabled && (!pCtx || pCtx.progressiveRender) && task.__idxInPipeline > pipeline.blockIndex;
    var step = incremental ? pipeline.step : null;
    var modDataCount = pCtx && pCtx.modDataCount;
    var modBy = modDataCount != null ? Math.ceil(modDataCount / step) : null;
    return {
      step: step,
      modBy: modBy,
      modDataCount: modDataCount
    };
  };

  Scheduler.prototype.getPipeline = function (pipelineId) {
    return this._pipelineMap.get(pipelineId);
  };
  /**
   * Current, progressive rendering starts from visual and layout.
   * Always detect render mode in the same stage, avoiding that incorrect
   * detection caused by data filtering.
   * Caution:
   * `updateStreamModes` use `seriesModel.getData()`.
   */


  Scheduler.prototype.updateStreamModes = function (seriesModel, view) {
    var pipeline = this._pipelineMap.get(seriesModel.uid);

    var data = seriesModel.getData();
    var dataLen = data.count(); // `progressiveRender` means that can render progressively in each
    // animation frame. Note that some types of series do not provide
    // `view.incrementalPrepareRender` but support `chart.appendData`. We
    // use the term `incremental` but not `progressive` to describe the
    // case that `chart.appendData`.

    var progressiveRender = pipeline.progressiveEnabled && view.incrementalPrepareRender && dataLen >= pipeline.threshold;
    var large = seriesModel.get('large') && dataLen >= seriesModel.get('largeThreshold'); // TODO: modDataCount should not updated if `appendData`, otherwise cause whole repaint.
    // see `test/candlestick-large3.html`

    var modDataCount = seriesModel.get('progressiveChunkMode') === 'mod' ? dataLen : null;
    seriesModel.pipelineContext = pipeline.context = {
      progressiveRender: progressiveRender,
      modDataCount: modDataCount,
      large: large
    };
  };

  Scheduler.prototype.restorePipelines = function (ecModel) {
    var scheduler = this;
    var pipelineMap = scheduler._pipelineMap = createHashMap();
    ecModel.eachSeries(function (seriesModel) {
      var progressive = seriesModel.getProgressive();
      var pipelineId = seriesModel.uid;
      pipelineMap.set(pipelineId, {
        id: pipelineId,
        head: null,
        tail: null,
        threshold: seriesModel.getProgressiveThreshold(),
        progressiveEnabled: progressive && !(seriesModel.preventIncremental && seriesModel.preventIncremental()),
        blockIndex: -1,
        step: Math.round(progressive || 700),
        count: 0
      });

      scheduler._pipe(seriesModel, seriesModel.dataTask);
    });
  };

  Scheduler.prototype.prepareStageTasks = function () {
    var stageTaskMap = this._stageTaskMap;
    var ecModel = this.api.getModel();
    var api = this.api;
    each$2(this._allHandlers, function (handler) {
      var record = stageTaskMap.get(handler.uid) || stageTaskMap.set(handler.uid, {});
      var errMsg = '';

      assert$1(!(handler.reset && handler.overallReset), errMsg);
      handler.reset && this._createSeriesStageTask(handler, record, ecModel, api);
      handler.overallReset && this._createOverallStageTask(handler, record, ecModel, api);
    }, this);
  };

  Scheduler.prototype.prepareView = function (view, model, ecModel, api) {
    var renderTask = view.renderTask;
    var context = renderTask.context;
    context.model = model;
    context.ecModel = ecModel;
    context.api = api;
    renderTask.__block = !view.incrementalPrepareRender;

    this._pipe(model, renderTask);
  };

  Scheduler.prototype.performDataProcessorTasks = function (ecModel, payload) {
    // If we do not use `block` here, it should be considered when to update modes.
    this._performStageTasks(this._dataProcessorHandlers, ecModel, payload, {
      block: true
    });
  };

  Scheduler.prototype.performVisualTasks = function (ecModel, payload, opt) {
    this._performStageTasks(this._visualHandlers, ecModel, payload, opt);
  };

  Scheduler.prototype._performStageTasks = function (stageHandlers, ecModel, payload, opt) {
    opt = opt || {};
    var unfinished = false;
    var scheduler = this;
    each$2(stageHandlers, function (stageHandler, idx) {
      if (opt.visualType && opt.visualType !== stageHandler.visualType) {
        return;
      }

      var stageHandlerRecord = scheduler._stageTaskMap.get(stageHandler.uid);

      var seriesTaskMap = stageHandlerRecord.seriesTaskMap;
      var overallTask = stageHandlerRecord.overallTask;

      if (overallTask) {
        var overallNeedDirty_1;
        var agentStubMap = overallTask.agentStubMap;
        agentStubMap.each(function (stub) {
          if (needSetDirty(opt, stub)) {
            stub.dirty();
            overallNeedDirty_1 = true;
          }
        });
        overallNeedDirty_1 && overallTask.dirty();
        scheduler.updatePayload(overallTask, payload);
        var performArgs_1 = scheduler.getPerformArgs(overallTask, opt.block); // Execute stubs firstly, which may set the overall task dirty,
        // then execute the overall task. And stub will call seriesModel.setData,
        // which ensures that in the overallTask seriesModel.getData() will not
        // return incorrect data.

        agentStubMap.each(function (stub) {
          stub.perform(performArgs_1);
        });

        if (overallTask.perform(performArgs_1)) {
          unfinished = true;
        }
      } else if (seriesTaskMap) {
        seriesTaskMap.each(function (task, pipelineId) {
          if (needSetDirty(opt, task)) {
            task.dirty();
          }

          var performArgs = scheduler.getPerformArgs(task, opt.block); // FIXME
          // if intending to decalare `performRawSeries` in handlers, only
          // stream-independent (specifically, data item independent) operations can be
          // performed. Because is a series is filtered, most of the tasks will not
          // be performed. A stream-dependent operation probably cause wrong biz logic.
          // Perhaps we should not provide a separate callback for this case instead
          // of providing the config `performRawSeries`. The stream-dependent operaions
          // and stream-independent operations should better not be mixed.

          performArgs.skip = !stageHandler.performRawSeries && ecModel.isSeriesFiltered(task.context.model);
          scheduler.updatePayload(task, payload);

          if (task.perform(performArgs)) {
            unfinished = true;
          }
        });
      }
    });

    function needSetDirty(opt, task) {
      return opt.setDirty && (!opt.dirtyMap || opt.dirtyMap.get(task.__pipeline.id));
    }

    this.unfinished = unfinished || this.unfinished;
  };

  Scheduler.prototype.performSeriesTasks = function (ecModel) {
    var unfinished;
    ecModel.eachSeries(function (seriesModel) {
      // Progress to the end for dataInit and dataRestore.
      unfinished = seriesModel.dataTask.perform() || unfinished;
    });
    this.unfinished = unfinished || this.unfinished;
  };

  Scheduler.prototype.plan = function () {
    // Travel pipelines, check block.
    this._pipelineMap.each(function (pipeline) {
      var task = pipeline.tail;

      do {
        if (task.__block) {
          pipeline.blockIndex = task.__idxInPipeline;
          break;
        }

        task = task.getUpstream();
      } while (task);
    });
  };

  Scheduler.prototype.updatePayload = function (task, payload) {
    payload !== 'remain' && (task.context.payload = payload);
  };

  Scheduler.prototype._createSeriesStageTask = function (stageHandler, stageHandlerRecord, ecModel, api) {
    var scheduler = this;
    var oldSeriesTaskMap = stageHandlerRecord.seriesTaskMap; // The count of stages are totally about only several dozen, so
    // do not need to reuse the map.

    var newSeriesTaskMap = stageHandlerRecord.seriesTaskMap = createHashMap();
    var seriesType = stageHandler.seriesType;
    var getTargetSeries = stageHandler.getTargetSeries; // If a stageHandler should cover all series, `createOnAllSeries` should be declared mandatorily,
    // to avoid some typo or abuse. Otherwise if an extension do not specify a `seriesType`,
    // it works but it may cause other irrelevant charts blocked.

    if (stageHandler.createOnAllSeries) {
      ecModel.eachRawSeries(create);
    } else if (seriesType) {
      ecModel.eachRawSeriesByType(seriesType, create);
    } else if (getTargetSeries) {
      getTargetSeries(ecModel, api).each(create);
    }

    function create(seriesModel) {
      var pipelineId = seriesModel.uid; // Init tasks for each seriesModel only once.
      // Reuse original task instance.

      var task = newSeriesTaskMap.set(pipelineId, oldSeriesTaskMap && oldSeriesTaskMap.get(pipelineId) || createTask({
        plan: seriesTaskPlan,
        reset: seriesTaskReset,
        count: seriesTaskCount
      }));
      task.context = {
        model: seriesModel,
        ecModel: ecModel,
        api: api,
        // PENDING: `useClearVisual` not used?
        useClearVisual: stageHandler.isVisual && !stageHandler.isLayout,
        plan: stageHandler.plan,
        reset: stageHandler.reset,
        scheduler: scheduler
      };

      scheduler._pipe(seriesModel, task);
    }
  };

  Scheduler.prototype._createOverallStageTask = function (stageHandler, stageHandlerRecord, ecModel, api) {
    var scheduler = this;
    var overallTask = stageHandlerRecord.overallTask = stageHandlerRecord.overallTask // For overall task, the function only be called on reset stage.
    || createTask({
      reset: overallTaskReset
    });
    overallTask.context = {
      ecModel: ecModel,
      api: api,
      overallReset: stageHandler.overallReset,
      scheduler: scheduler
    };
    var oldAgentStubMap = overallTask.agentStubMap; // The count of stages are totally about only several dozen, so
    // do not need to reuse the map.

    var newAgentStubMap = overallTask.agentStubMap = createHashMap();
    var seriesType = stageHandler.seriesType;
    var getTargetSeries = stageHandler.getTargetSeries;
    var overallProgress = true;
    var shouldOverallTaskDirty = false; // FIXME:TS never used, so comment it
    // let modifyOutputEnd = stageHandler.modifyOutputEnd;
    // An overall task with seriesType detected or has `getTargetSeries`, we add
    // stub in each pipelines, it will set the overall task dirty when the pipeline
    // progress. Moreover, to avoid call the overall task each frame (too frequent),
    // we set the pipeline block.

    var errMsg = '';

    assert$1(!stageHandler.createOnAllSeries, errMsg);

    if (seriesType) {
      ecModel.eachRawSeriesByType(seriesType, createStub);
    } else if (getTargetSeries) {
      getTargetSeries(ecModel, api).each(createStub);
    } // Otherwise, (usually it is legancy case), the overall task will only be
    // executed when upstream dirty. Otherwise the progressive rendering of all
    // pipelines will be disabled unexpectedly. But it still needs stubs to receive
    // dirty info from upsteam.
    else {
        overallProgress = false;
        each$2(ecModel.getSeries(), createStub);
      }

    function createStub(seriesModel) {
      var pipelineId = seriesModel.uid;
      var stub = newAgentStubMap.set(pipelineId, oldAgentStubMap && oldAgentStubMap.get(pipelineId) || ( // When the result of `getTargetSeries` changed, the overallTask
      // should be set as dirty and re-performed.
      shouldOverallTaskDirty = true, createTask({
        reset: stubReset,
        onDirty: stubOnDirty
      })));
      stub.context = {
        model: seriesModel,
        overallProgress: overallProgress // FIXME:TS never used, so comment it
        // modifyOutputEnd: modifyOutputEnd

      };
      stub.agent = overallTask;
      stub.__block = overallProgress;

      scheduler._pipe(seriesModel, stub);
    }

    if (shouldOverallTaskDirty) {
      overallTask.dirty();
    }
  };

  Scheduler.prototype._pipe = function (seriesModel, task) {
    var pipelineId = seriesModel.uid;

    var pipeline = this._pipelineMap.get(pipelineId);

    !pipeline.head && (pipeline.head = task);
    pipeline.tail && pipeline.tail.pipe(task);
    pipeline.tail = task;
    task.__idxInPipeline = pipeline.count++;
    task.__pipeline = pipeline;
  };

  Scheduler.wrapStageHandler = function (stageHandler, visualType) {
    if (isFunction$1(stageHandler)) {
      stageHandler = {
        overallReset: stageHandler,
        seriesType: detectSeriseType(stageHandler)
      };
    }

    stageHandler.uid = getUID('stageHandler');
    visualType && (stageHandler.visualType = visualType);
    return stageHandler;
  };
  return Scheduler;
}();

function overallTaskReset(context) {
  context.overallReset(context.ecModel, context.api, context.payload);
}

function stubReset(context) {
  return context.overallProgress && stubProgress;
}

function stubProgress() {
  this.agent.dirty();
  this.getDownstream().dirty();
}

function stubOnDirty() {
  this.agent && this.agent.dirty();
}

function seriesTaskPlan(context) {
  return context.plan ? context.plan(context.model, context.ecModel, context.api, context.payload) : null;
}

function seriesTaskReset(context) {
  if (context.useClearVisual) {
    context.data.clearAllVisual();
  }

  var resetDefines = context.resetDefines = normalizeToArray(context.reset(context.model, context.ecModel, context.api, context.payload));
  return resetDefines.length > 1 ? map(resetDefines, function (v, idx) {
    return makeSeriesTaskProgress(idx);
  }) : singleSeriesTaskProgress;
}

var singleSeriesTaskProgress = makeSeriesTaskProgress(0);

function makeSeriesTaskProgress(resetDefineIdx) {
  return function (params, context) {
    var data = context.data;
    var resetDefine = context.resetDefines[resetDefineIdx];

    if (resetDefine && resetDefine.dataEach) {
      for (var i = params.start; i < params.end; i++) {
        resetDefine.dataEach(data, i);
      }
    } else if (resetDefine && resetDefine.progress) {
      resetDefine.progress(params, data);
    }
  };
}

function seriesTaskCount(context) {
  return context.data.count();
}
/**
 * Only some legacy stage handlers (usually in echarts extensions) are pure function.
 * To ensure that they can work normally, they should work in block mode, that is,
 * they should not be started util the previous tasks finished. So they cause the
 * progressive rendering disabled. We try to detect the series type, to narrow down
 * the block range to only the series type they concern, but not all series.
 */


function detectSeriseType(legacyFunc) {
  seriesType = null;

  try {
    // Assume there is no async when calling `eachSeriesByType`.
    legacyFunc(ecModelMock, apiMock);
  } catch (e) {}

  return seriesType;
}

var ecModelMock = {};
var apiMock = {};
var seriesType;
mockMethods(ecModelMock, GlobalModel);
mockMethods(apiMock, ExtensionAPI);

ecModelMock.eachSeriesByType = ecModelMock.eachRawSeriesByType = function (type) {
  seriesType = type;
};

ecModelMock.eachComponent = function (cond) {
  if (cond.mainType === 'series' && cond.subType) {
    seriesType = cond.subType;
  }
};

function mockMethods(target, Clz) {
  /* eslint-disable */
  for (var name_1 in Clz.prototype) {
    // Do not use hasOwnProperty
    target[name_1] = noop;
  }
  /* eslint-enable */

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
var colorAll = ['#37A2DA', '#32C5E9', '#67E0E3', '#9FE6B8', '#FFDB5C', '#ff9f7f', '#fb7293', '#E062AE', '#E690D1', '#e7bcf3', '#9d96f5', '#8378EA', '#96BFFF'];
var lightTheme = {
  color: colorAll,
  colorLayer: [['#37A2DA', '#ffd85c', '#fd7b5f'], ['#37A2DA', '#67E0E3', '#FFDB5C', '#ff9f7f', '#E062AE', '#9d96f5'], ['#37A2DA', '#32C5E9', '#9FE6B8', '#FFDB5C', '#ff9f7f', '#fb7293', '#e7bcf3', '#8378EA', '#96BFFF'], colorAll]
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
var contrastColor = '#B9B8CE';
var backgroundColor = '#100C2A';

var axisCommon = function () {
  return {
    axisLine: {
      lineStyle: {
        color: contrastColor
      }
    },
    splitLine: {
      lineStyle: {
        color: '#484753'
      }
    },
    splitArea: {
      areaStyle: {
        color: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.05)']
      }
    },
    minorSplitLine: {
      lineStyle: {
        color: '#20203B'
      }
    }
  };
};

var colorPalette = ['#4992ff', '#7cffb2', '#fddd60', '#ff6e76', '#58d9f9', '#05c091', '#ff8a45', '#8d48e3', '#dd79ff'];
var theme = {
  darkMode: true,
  color: colorPalette,
  backgroundColor: backgroundColor,
  axisPointer: {
    lineStyle: {
      color: '#817f91'
    },
    crossStyle: {
      color: '#817f91'
    },
    label: {
      // TODO Contrast of label backgorundColor
      color: '#fff'
    }
  },
  legend: {
    textStyle: {
      color: contrastColor
    }
  },
  textStyle: {
    color: contrastColor
  },
  title: {
    textStyle: {
      color: '#EEF1FA'
    },
    subtextStyle: {
      color: '#B9B8CE'
    }
  },
  toolbox: {
    iconStyle: {
      borderColor: contrastColor
    }
  },
  dataZoom: {
    borderColor: '#71708A',
    textStyle: {
      color: contrastColor
    },
    brushStyle: {
      color: 'rgba(135,163,206,0.3)'
    },
    handleStyle: {
      color: '#353450',
      borderColor: '#C5CBE3'
    },
    moveHandleStyle: {
      color: '#B0B6C3',
      opacity: 0.3
    },
    fillerColor: 'rgba(135,163,206,0.2)',
    emphasis: {
      handleStyle: {
        borderColor: '#91B7F2',
        color: '#4D587D'
      },
      moveHandleStyle: {
        color: '#636D9A',
        opacity: 0.7
      }
    },
    dataBackground: {
      lineStyle: {
        color: '#71708A',
        width: 1
      },
      areaStyle: {
        color: '#71708A'
      }
    },
    selectedDataBackground: {
      lineStyle: {
        color: '#87A3CE'
      },
      areaStyle: {
        color: '#87A3CE'
      }
    }
  },
  visualMap: {
    textStyle: {
      color: contrastColor
    }
  },
  timeline: {
    lineStyle: {
      color: contrastColor
    },
    label: {
      color: contrastColor
    },
    controlStyle: {
      color: contrastColor,
      borderColor: contrastColor
    }
  },
  calendar: {
    itemStyle: {
      color: backgroundColor
    },
    dayLabel: {
      color: contrastColor
    },
    monthLabel: {
      color: contrastColor
    },
    yearLabel: {
      color: contrastColor
    }
  },
  timeAxis: axisCommon(),
  logAxis: axisCommon(),
  valueAxis: axisCommon(),
  categoryAxis: axisCommon(),
  line: {
    symbol: 'circle'
  },
  graph: {
    color: colorPalette
  },
  gauge: {
    title: {
      color: contrastColor
    },
    axisLine: {
      lineStyle: {
        color: [[1, 'rgba(207,212,219,0.2)']]
      }
    },
    axisLabel: {
      color: contrastColor
    },
    detail: {
      color: '#EEF1FA'
    }
  },
  candlestick: {
    itemStyle: {
      color: '#f64e56',
      color0: '#54ea92',
      borderColor: '#f64e56',
      borderColor0: '#54ea92' // borderColor: '#ca2824',
      // borderColor0: '#09a443'

    }
  }
};
theme.categoryAxis.splitLine.show = false;

function parseXML(svg) {
    if (isString(svg)) {
        var parser = new DOMParser();
        svg = parser.parseFromString(svg, 'text/xml');
    }
    var svgNode = svg;
    if (svgNode.nodeType === 9) {
        svgNode = svgNode.firstChild;
    }
    while (svgNode.nodeName.toLowerCase() !== 'svg' || svgNode.nodeType !== 1) {
        svgNode = svgNode.nextSibling;
    }
    return svgNode;
}

var storage = createHashMap();
var mapDataStorage = {
  /**
   * Compatible with previous `echarts.registerMap`.
   * @usage
   * ```js
   * $.get('USA.json', function (geoJson) {
   *     echarts.registerMap('USA', geoJson);
   *     // Or
   *     echarts.registerMap('USA', {
   *         geoJson: geoJson,
   *         specialAreas: {}
   *     })
   * });
   *
   * $.get('airport.svg', function (svg) {
   *     echarts.registerMap('airport', {
   *         svg: svg
   *     }
   * });
   *
   * echarts.registerMap('eu', [
   *     {svg: eu-topographic.svg},
   *     {geoJSON: eu.json}
   * ])
   * ```
   */
  registerMap: function (mapName, rawDef, rawSpecialAreas) {
    var records;

    if (isArray(rawDef)) {
      records = rawDef;
    } else if (rawDef.svg) {
      records = [{
        type: 'svg',
        source: rawDef.svg,
        specialAreas: rawDef.specialAreas
      }];
    } else {
      // Backward compatibility.
      var geoSource = rawDef.geoJson || rawDef.geoJSON;

      if (geoSource && !rawDef.features) {
        rawSpecialAreas = rawDef.specialAreas;
        rawDef = geoSource;
      }

      records = [{
        type: 'geoJSON',
        source: rawDef,
        specialAreas: rawSpecialAreas
      }];
    }

    each$2(records, function (record) {
      var type = record.type;
      type === 'geoJson' && (type = record.type = 'geoJSON');
      var parse = parsers[type];

      parse(record);
    });
    return storage.set(mapName, records);
  },
  retrieveMap: function (mapName) {
    return storage.get(mapName);
  }
};
var parsers = {
  geoJSON: function (record) {
    var source = record.source;
    record.geoJSON = !isString(source) ? source : typeof JSON !== 'undefined' && JSON.parse ? JSON.parse(source) : new Function('return (' + source + ');')();
  },
  // Only perform parse to XML object here, which might be time
  // consiming for large SVG.
  // Although convert XML to zrender element is also time consiming,
  // if we do it here, the clone of zrender elements has to be
  // required. So we do it once for each geo instance, util real
  // performance issues call for optimizing it.
  svg: function (record) {
    record.svgXML = parseXML(record.source);
  }
};

/**
 * Usage of query:
 * `chart.on('click', query, handler);`
 * The `query` can be:
 * + The component type query string, only `mainType` or `mainType.subType`,
 *   like: 'xAxis', 'series', 'xAxis.category' or 'series.line'.
 * + The component query object, like:
 *   `{seriesIndex: 2}`, `{seriesName: 'xx'}`, `{seriesId: 'some'}`,
 *   `{xAxisIndex: 2}`, `{xAxisName: 'xx'}`, `{xAxisId: 'some'}`.
 * + The data query object, like:
 *   `{dataIndex: 123}`, `{dataType: 'link'}`, `{name: 'some'}`.
 * + The other query object (cmponent customized query), like:
 *   `{element: 'some'}` (only available in custom series).
 *
 * Caveat: If a prop in the `query` object is `null/undefined`, it is the
 * same as there is no such prop in the `query` object.
 */

var ECEventProcessor =
/** @class */
function () {
  function ECEventProcessor() {}

  ECEventProcessor.prototype.normalizeQuery = function (query) {
    var cptQuery = {};
    var dataQuery = {};
    var otherQuery = {}; // `query` is `mainType` or `mainType.subType` of component.

    if (isString(query)) {
      var condCptType = parseClassType(query); // `.main` and `.sub` may be ''.

      cptQuery.mainType = condCptType.main || null;
      cptQuery.subType = condCptType.sub || null;
    } // `query` is an object, convert to {mainType, index, name, id}.
    else {
        // `xxxIndex`, `xxxName`, `xxxId`, `name`, `dataIndex`, `dataType` is reserved,
        // can not be used in `compomentModel.filterForExposedEvent`.
        var suffixes_1 = ['Index', 'Name', 'Id'];
        var dataKeys_1 = {
          name: 1,
          dataIndex: 1,
          dataType: 1
        };
        each$2(query, function (val, key) {
          var reserved = false;

          for (var i = 0; i < suffixes_1.length; i++) {
            var propSuffix = suffixes_1[i];
            var suffixPos = key.lastIndexOf(propSuffix);

            if (suffixPos > 0 && suffixPos === key.length - propSuffix.length) {
              var mainType = key.slice(0, suffixPos); // Consider `dataIndex`.

              if (mainType !== 'data') {
                cptQuery.mainType = mainType;
                cptQuery[propSuffix.toLowerCase()] = val;
                reserved = true;
              }
            }
          }

          if (dataKeys_1.hasOwnProperty(key)) {
            dataQuery[key] = val;
            reserved = true;
          }

          if (!reserved) {
            otherQuery[key] = val;
          }
        });
      }

    return {
      cptQuery: cptQuery,
      dataQuery: dataQuery,
      otherQuery: otherQuery
    };
  };

  ECEventProcessor.prototype.filter = function (eventType, query) {
    // They should be assigned before each trigger call.
    var eventInfo = this.eventInfo;

    if (!eventInfo) {
      return true;
    }

    var targetEl = eventInfo.targetEl;
    var packedEvent = eventInfo.packedEvent;
    var model = eventInfo.model;
    var view = eventInfo.view; // For event like 'globalout'.

    if (!model || !view) {
      return true;
    }

    var cptQuery = query.cptQuery;
    var dataQuery = query.dataQuery;
    return check(cptQuery, model, 'mainType') && check(cptQuery, model, 'subType') && check(cptQuery, model, 'index', 'componentIndex') && check(cptQuery, model, 'name') && check(cptQuery, model, 'id') && check(dataQuery, packedEvent, 'name') && check(dataQuery, packedEvent, 'dataIndex') && check(dataQuery, packedEvent, 'dataType') && (!view.filterForExposedEvent || view.filterForExposedEvent(eventType, query.otherQuery, targetEl, packedEvent));

    function check(query, host, prop, propOnHost) {
      return query[prop] == null || host[propOnHost || prop] === query[prop];
    }
  };

  ECEventProcessor.prototype.afterTrigger = function () {
    // Make sure the eventInfo wont be used in next trigger.
    this.eventInfo = null;
  };

  return ECEventProcessor;
}();

var seriesSymbolTask = {
  createOnAllSeries: true,
  // For legend.
  performRawSeries: true,
  reset: function (seriesModel, ecModel) {
    var data = seriesModel.getData();

    if (seriesModel.legendSymbol) {
      data.setVisual('legendSymbol', seriesModel.legendSymbol);
    }

    if (!seriesModel.hasSymbolVisual) {
      return;
    }

    var symbolType = seriesModel.get('symbol');
    var symbolSize = seriesModel.get('symbolSize');
    var keepAspect = seriesModel.get('symbolKeepAspect');
    var symbolRotate = seriesModel.get('symbolRotate');
    var hasSymbolTypeCallback = isFunction$1(symbolType);
    var hasSymbolSizeCallback = isFunction$1(symbolSize);
    var hasSymbolRotateCallback = isFunction$1(symbolRotate);
    var hasCallback = hasSymbolTypeCallback || hasSymbolSizeCallback || hasSymbolRotateCallback;
    var seriesSymbol = !hasSymbolTypeCallback && symbolType ? symbolType : seriesModel.defaultSymbol;
    var seriesSymbolSize = !hasSymbolSizeCallback ? symbolSize : null;
    var seriesSymbolRotate = !hasSymbolRotateCallback ? symbolRotate : null;
    data.setVisual({
      legendSymbol: seriesModel.legendSymbol || seriesSymbol,
      // If seting callback functions on `symbol` or `symbolSize`, for simplicity and avoiding
      // to bring trouble, we do not pick a reuslt from one of its calling on data item here,
      // but just use the default value. Callback on `symbol` or `symbolSize` is convenient in
      // some cases but generally it is not recommanded.
      symbol: seriesSymbol,
      symbolSize: seriesSymbolSize,
      symbolKeepAspect: keepAspect,
      symbolRotate: seriesSymbolRotate
    }); // Only visible series has each data be visual encoded

    if (ecModel.isSeriesFiltered(seriesModel)) {
      return;
    }

    function dataEach(data, idx) {
      var rawValue = seriesModel.getRawValue(idx);
      var params = seriesModel.getDataParams(idx);
      hasSymbolTypeCallback && data.setItemVisual(idx, 'symbol', symbolType(rawValue, params));
      hasSymbolSizeCallback && data.setItemVisual(idx, 'symbolSize', symbolSize(rawValue, params));
      hasSymbolRotateCallback && data.setItemVisual(idx, 'symbolRotate', symbolRotate(rawValue, params));
    }

    return {
      dataEach: hasCallback ? dataEach : null
    };
  }
};
var dataSymbolTask = {
  createOnAllSeries: true,
  // For legend.
  performRawSeries: true,
  reset: function (seriesModel, ecModel) {
    if (!seriesModel.hasSymbolVisual) {
      return;
    } // Only visible series has each data be visual encoded


    if (ecModel.isSeriesFiltered(seriesModel)) {
      return;
    }

    var data = seriesModel.getData();

    function dataEach(data, idx) {
      var itemModel = data.getItemModel(idx);
      var itemSymbolType = itemModel.getShallow('symbol', true);
      var itemSymbolSize = itemModel.getShallow('symbolSize', true);
      var itemSymbolRotate = itemModel.getShallow('symbolRotate', true);
      var itemSymbolKeepAspect = itemModel.getShallow('symbolKeepAspect', true); // If has item symbol

      if (itemSymbolType != null) {
        data.setItemVisual(idx, 'symbol', itemSymbolType);
      }

      if (itemSymbolSize != null) {
        // PENDING Transform symbolSize ?
        data.setItemVisual(idx, 'symbolSize', itemSymbolSize);
      }

      if (itemSymbolRotate != null) {
        data.setItemVisual(idx, 'symbolRotate', itemSymbolRotate);
      }

      if (itemSymbolKeepAspect != null) {
        data.setItemVisual(idx, 'symbolKeepAspect', itemSymbolKeepAspect);
      }
    }

    return {
      dataEach: data.hasItemOption ? dataEach : null
    };
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
function getItemVisualFromData(data, dataIndex, key) {
  switch (key) {
    case 'color':
      var style = data.getItemVisual(dataIndex, 'style');
      return style[data.getVisual('drawType')];

    case 'opacity':
      return data.getItemVisual(dataIndex, 'style').opacity;

    case 'symbol':
    case 'symbolSize':
    case 'liftZ':
      return data.getItemVisual(dataIndex, key);

  }
}
function getVisualFromData(data, key) {
  switch (key) {
    case 'color':
      var style = data.getVisual('style');
      return style[data.getVisual('drawType')];

    case 'opacity':
      return data.getVisual('style').opacity;

    case 'symbol':
    case 'symbolSize':
    case 'liftZ':
      return data.getVisual(key);

  }
}

function cloneArr(points) {
  if (points) {
    var newPoints = [];

    for (var i = 0; i < points.length; i++) {
      newPoints.push(points[i].slice());
    }

    return newPoints;
  }
}

function prepareLayoutCallbackParams(labelItem, hostEl) {
  var label = labelItem.label;
  var labelLine = hostEl && hostEl.getTextGuideLine();
  return {
    dataIndex: labelItem.dataIndex,
    dataType: labelItem.dataType,
    seriesIndex: labelItem.seriesModel.seriesIndex,
    text: labelItem.label.style.text,
    rect: labelItem.hostRect,
    labelRect: labelItem.rect,
    // x: labelAttr.x,
    // y: labelAttr.y,
    align: label.style.align,
    verticalAlign: label.style.verticalAlign,
    labelLinePoints: cloneArr(labelLine && labelLine.shape.points)
  };
}

var LABEL_OPTION_TO_STYLE_KEYS = ['align', 'verticalAlign', 'width', 'height', 'fontSize'];
var dummyTransformable = new Transformable();
var labelLayoutInnerStore = makeInner();
var labelLineAnimationStore = makeInner();

function extendWithKeys(target, source, keys) {
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];

    if (source[key] != null) {
      target[key] = source[key];
    }
  }
}

var LABEL_LAYOUT_PROPS = ['x', 'y', 'rotation'];

var LabelManager =
/** @class */
function () {
  function LabelManager() {
    this._labelList = [];
    this._chartViewList = [];
  }

  LabelManager.prototype.clearLabels = function () {
    this._labelList = [];
    this._chartViewList = [];
  };
  /**
   * Add label to manager
   */


  LabelManager.prototype._addLabel = function (dataIndex, dataType, seriesModel, label, layoutOption) {
    var labelStyle = label.style;
    var hostEl = label.__hostTarget;
    var textConfig = hostEl.textConfig || {}; // TODO: If label is in other state.

    var labelTransform = label.getComputedTransform();
    var labelRect = label.getBoundingRect().plain();
    BoundingRect.applyTransform(labelRect, labelRect, labelTransform);

    if (labelTransform) {
      dummyTransformable.setLocalTransform(labelTransform);
    } else {
      // Identity transform.
      dummyTransformable.x = dummyTransformable.y = dummyTransformable.rotation = dummyTransformable.originX = dummyTransformable.originY = 0;
      dummyTransformable.scaleX = dummyTransformable.scaleY = 1;
    }

    var host = label.__hostTarget;
    var hostRect;

    if (host) {
      hostRect = host.getBoundingRect().plain();
      var transform = host.getComputedTransform();
      BoundingRect.applyTransform(hostRect, hostRect, transform);
    }

    var labelGuide = hostRect && host.getTextGuideLine();

    this._labelList.push({
      label: label,
      labelLine: labelGuide,
      seriesModel: seriesModel,
      dataIndex: dataIndex,
      dataType: dataType,
      layoutOption: layoutOption,
      computedLayoutOption: null,
      rect: labelRect,
      hostRect: hostRect,
      // Label with lower priority will be hidden when overlapped
      // Use rect size as default priority
      priority: hostRect ? hostRect.width * hostRect.height : 0,
      // Save default label attributes.
      // For restore if developers want get back to default value in callback.
      defaultAttr: {
        ignore: label.ignore,
        labelGuideIgnore: labelGuide && labelGuide.ignore,
        x: dummyTransformable.x,
        y: dummyTransformable.y,
        rotation: dummyTransformable.rotation,
        style: {
          x: labelStyle.x,
          y: labelStyle.y,
          align: labelStyle.align,
          verticalAlign: labelStyle.verticalAlign,
          width: labelStyle.width,
          height: labelStyle.height,
          fontSize: labelStyle.fontSize
        },
        cursor: label.cursor,
        attachedPos: textConfig.position,
        attachedRot: textConfig.rotation
      }
    });
  };

  LabelManager.prototype.addLabelsOfSeries = function (chartView) {
    var _this = this;

    this._chartViewList.push(chartView);

    var seriesModel = chartView.__model;
    var layoutOption = seriesModel.get('labelLayout');
    /**
     * Ignore layouting if it's not specified anything.
     */

    if (!(isFunction$1(layoutOption) || keys(layoutOption).length)) {
      return;
    }

    chartView.group.traverse(function (child) {
      if (child.ignore) {
        return true; // Stop traverse descendants.
      } // Only support label being hosted on graphic elements.


      var textEl = child.getTextContent();
      var ecData = getECData(child); // Can only attach the text on the element with dataIndex

      if (textEl && !textEl.disableLabelLayout) {
        _this._addLabel(ecData.dataIndex, ecData.dataType, seriesModel, textEl, layoutOption);
      }
    });
  };

  LabelManager.prototype.updateLayoutConfig = function (api) {
    var width = api.getWidth();
    var height = api.getHeight();

    function createDragHandler(el, labelLineModel) {
      return function () {
        updateLabelLinePoints(el, labelLineModel);
      };
    }

    for (var i = 0; i < this._labelList.length; i++) {
      var labelItem = this._labelList[i];
      var label = labelItem.label;
      var hostEl = label.__hostTarget;
      var defaultLabelAttr = labelItem.defaultAttr;
      var layoutOption = void 0; // TODO A global layout option?

      if (typeof labelItem.layoutOption === 'function') {
        layoutOption = labelItem.layoutOption(prepareLayoutCallbackParams(labelItem, hostEl));
      } else {
        layoutOption = labelItem.layoutOption;
      }

      layoutOption = layoutOption || {};
      labelItem.computedLayoutOption = layoutOption;
      var degreeToRadian = Math.PI / 180;

      if (hostEl) {
        hostEl.setTextConfig({
          // Force to set local false.
          local: false,
          // Ignore position and rotation config on the host el if x or y is changed.
          position: layoutOption.x != null || layoutOption.y != null ? null : defaultLabelAttr.attachedPos,
          // Ignore rotation config on the host el if rotation is changed.
          rotation: layoutOption.rotate != null ? layoutOption.rotate * degreeToRadian : defaultLabelAttr.attachedRot,
          offset: [layoutOption.dx || 0, layoutOption.dy || 0]
        });
      }

      var needsUpdateLabelLine = false;

      if (layoutOption.x != null) {
        // TODO width of chart view.
        label.x = parsePercent(layoutOption.x, width);
        label.setStyle('x', 0); // Ignore movement in style. TODO: origin.

        needsUpdateLabelLine = true;
      } else {
        label.x = defaultLabelAttr.x;
        label.setStyle('x', defaultLabelAttr.style.x);
      }

      if (layoutOption.y != null) {
        // TODO height of chart view.
        label.y = parsePercent(layoutOption.y, height);
        label.setStyle('y', 0); // Ignore movement in style.

        needsUpdateLabelLine = true;
      } else {
        label.y = defaultLabelAttr.y;
        label.setStyle('y', defaultLabelAttr.style.y);
      }

      if (layoutOption.labelLinePoints) {
        var guideLine = hostEl.getTextGuideLine();

        if (guideLine) {
          guideLine.setShape({
            points: layoutOption.labelLinePoints
          }); // Not update

          needsUpdateLabelLine = false;
        }
      }

      var labelLayoutStore = labelLayoutInnerStore(label);
      labelLayoutStore.needsUpdateLabelLine = needsUpdateLabelLine;
      label.rotation = layoutOption.rotate != null ? layoutOption.rotate * degreeToRadian : defaultLabelAttr.rotation;

      for (var k = 0; k < LABEL_OPTION_TO_STYLE_KEYS.length; k++) {
        var key = LABEL_OPTION_TO_STYLE_KEYS[k];
        label.setStyle(key, layoutOption[key] != null ? layoutOption[key] : defaultLabelAttr.style[key]);
      }

      if (layoutOption.draggable) {
        label.draggable = true;
        label.cursor = 'move';

        if (hostEl) {
          var hostModel = labelItem.seriesModel;

          if (labelItem.dataIndex != null) {
            var data = labelItem.seriesModel.getData(labelItem.dataType);
            hostModel = data.getItemModel(labelItem.dataIndex);
          }

          label.on('drag', createDragHandler(hostEl, hostModel.getModel('labelLine')));
        }
      } else {
        // TODO Other drag functions?
        label.off('drag');
        label.cursor = defaultLabelAttr.cursor;
      }
    }
  };

  LabelManager.prototype.layout = function (api) {
    var width = api.getWidth();
    var height = api.getHeight();
    var labelList = prepareLayoutList(this._labelList);
    var labelsNeedsAdjustOnX = filter(labelList, function (item) {
      return item.layoutOption.moveOverlap === 'shiftX';
    });
    var labelsNeedsAdjustOnY = filter(labelList, function (item) {
      return item.layoutOption.moveOverlap === 'shiftY';
    });
    shiftLayoutOnX(labelsNeedsAdjustOnX, 0, width);
    shiftLayoutOnY(labelsNeedsAdjustOnY, 0, height);
    var labelsNeedsHideOverlap = filter(labelList, function (item) {
      return item.layoutOption.hideOverlap;
    });
    hideOverlap(labelsNeedsHideOverlap);
  };
  /**
   * Process all labels. Not only labels with layoutOption.
   */


  LabelManager.prototype.processLabelsOverall = function () {
    var _this = this;

    each$2(this._chartViewList, function (chartView) {
      var seriesModel = chartView.__model;
      var ignoreLabelLineUpdate = chartView.ignoreLabelLineUpdate;
      var animationEnabled = seriesModel.isAnimationEnabled();
      chartView.group.traverse(function (child) {
        if (child.ignore) {
          return true; // Stop traverse descendants.
        }

        var needsUpdateLabelLine = !ignoreLabelLineUpdate;
        var label = child.getTextContent();

        if (!needsUpdateLabelLine && label) {
          needsUpdateLabelLine = labelLayoutInnerStore(label).needsUpdateLabelLine;
        }

        if (needsUpdateLabelLine) {
          _this._updateLabelLine(child, seriesModel);
        }

        if (animationEnabled) {
          _this._animateLabels(child, seriesModel);
        }
      });
    });
  };

  LabelManager.prototype._updateLabelLine = function (el, seriesModel) {
    // Only support label being hosted on graphic elements.
    var textEl = el.getTextContent(); // Update label line style.

    var ecData = getECData(el);
    var dataIndex = ecData.dataIndex; // Only support labelLine on the labels represent data.

    if (textEl && dataIndex != null) {
      var data = seriesModel.getData(ecData.dataType);
      var itemModel = data.getItemModel(dataIndex);
      var defaultStyle = {};
      var visualStyle = data.getItemVisual(dataIndex, 'style');
      var visualType = data.getVisual('drawType'); // Default to be same with main color

      defaultStyle.stroke = visualStyle[visualType];
      var labelLineModel = itemModel.getModel('labelLine');
      setLabelLineStyle(el, getLabelLineStatesModels(itemModel), defaultStyle);
      updateLabelLinePoints(el, labelLineModel);
    }
  };

  LabelManager.prototype._animateLabels = function (el, seriesModel) {
    var textEl = el.getTextContent();
    var guideLine = el.getTextGuideLine(); // Animate

    if (textEl && !textEl.ignore && !textEl.invisible && !el.disableLabelAnimation && !isElementRemoved(el)) {
      var layoutStore = labelLayoutInnerStore(textEl);
      var oldLayout = layoutStore.oldLayout;
      var ecData = getECData(el);
      var dataIndex = ecData.dataIndex;
      var newProps = {
        x: textEl.x,
        y: textEl.y,
        rotation: textEl.rotation
      };
      var data = seriesModel.getData(ecData.dataType);

      if (!oldLayout) {
        textEl.attr(newProps); // Disable fade in animation if value animation is enabled.

        if (!labelInner(textEl).valueAnimation) {
          var oldOpacity = retrieve2(textEl.style.opacity, 1); // Fade in animation

          textEl.style.opacity = 0;
          initProps(textEl, {
            style: {
              opacity: oldOpacity
            }
          }, seriesModel, dataIndex);
        }
      } else {
        textEl.attr(oldLayout); // Make sure the animation from is in the right status.

        var prevStates = el.prevStates;

        if (prevStates) {
          if (indexOf$1(prevStates, 'select') >= 0) {
            textEl.attr(layoutStore.oldLayoutSelect);
          }

          if (indexOf$1(prevStates, 'emphasis') >= 0) {
            textEl.attr(layoutStore.oldLayoutEmphasis);
          }
        }

        updateProps(textEl, newProps, seriesModel, dataIndex);
      }

      layoutStore.oldLayout = newProps;

      if (textEl.states.select) {
        var layoutSelect = layoutStore.oldLayoutSelect = {};
        extendWithKeys(layoutSelect, newProps, LABEL_LAYOUT_PROPS);
        extendWithKeys(layoutSelect, textEl.states.select, LABEL_LAYOUT_PROPS);
      }

      if (textEl.states.emphasis) {
        var layoutEmphasis = layoutStore.oldLayoutEmphasis = {};
        extendWithKeys(layoutEmphasis, newProps, LABEL_LAYOUT_PROPS);
        extendWithKeys(layoutEmphasis, textEl.states.emphasis, LABEL_LAYOUT_PROPS);
      }

      animateLabelValue(textEl, dataIndex, data, seriesModel, seriesModel);
    }

    if (guideLine && !guideLine.ignore && !guideLine.invisible) {
      var layoutStore = labelLineAnimationStore(guideLine);
      var oldLayout = layoutStore.oldLayout;
      var newLayout = {
        points: guideLine.shape.points
      };

      if (!oldLayout) {
        guideLine.setShape(newLayout);
        guideLine.style.strokePercent = 0;
        initProps(guideLine, {
          style: {
            strokePercent: 1
          }
        }, seriesModel);
      } else {
        guideLine.attr({
          shape: oldLayout
        });
        updateProps(guideLine, {
          shape: newLayout
        }, seriesModel);
      }

      layoutStore.oldLayout = newLayout;
    }
  };

  return LabelManager;
}();

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
function findEventDispatcher(target, det, returnFirstMatch) {
  var found;

  while (target) {
    if (det(target)) {
      found = target;

      if (returnFirstMatch) {
        break;
      }
    }

    target = target.__hostTarget || target.parent;
  }

  return found;
}

var wmUniqueIndex = Math.round(Math.random() * 9);
var WeakMap = (function () {
    function WeakMap() {
        this._id = '__ec_inner_' + wmUniqueIndex++;
    }
    WeakMap.prototype.get = function (key) {
        return this._guard(key)[this._id];
    };
    WeakMap.prototype.set = function (key, value) {
        var target = this._guard(key);
        if (typeof Object.defineProperty === 'function') {
            Object.defineProperty(target, this._id, {
                value: value,
                enumerable: false,
                configurable: true
            });
        }
        else {
            target[this._id] = value;
        }
        return this;
    };
    WeakMap.prototype["delete"] = function (key) {
        if (this.has(key)) {
            delete this._guard(key)[this._id];
            return true;
        }
        return false;
    };
    WeakMap.prototype.has = function (key) {
        return !!this._guard(key)[this._id];
    };
    WeakMap.prototype._guard = function (key) {
        if (key !== Object(key)) {
            throw TypeError('Value of WeakMap is not a non-null object.');
        }
        return key;
    };
    return WeakMap;
}());

var decalMap = new WeakMap();
var decalCache = new LRU(100);
var decalKeys = ['symbol', 'symbolSize', 'symbolKeepAspect', 'color', 'backgroundColor', 'dashArrayX', 'dashArrayY', 'maxTileWidth', 'maxTileHeight'];
/**
 * Create or update pattern image from decal options
 *
 * @param {InnerDecalObject | 'none'} decalObject decal options, 'none' if no decal
 * @return {Pattern} pattern with generated image, null if no decal
 */

function createOrUpdatePatternFromDecal(decalObject, api) {
  if (decalObject === 'none') {
    return null;
  }

  var dpr = api.getDevicePixelRatio();
  var zr = api.getZr();
  var isSVG = zr.painter.type === 'svg';

  if (decalObject.dirty) {
    decalMap["delete"](decalObject);
  }

  var oldPattern = decalMap.get(decalObject);

  if (oldPattern) {
    return oldPattern;
  }

  var decalOpt = defaults(decalObject, {
    symbol: 'rect',
    symbolSize: 1,
    symbolKeepAspect: true,
    color: 'rgba(0, 0, 0, 0.2)',
    backgroundColor: null,
    dashArrayX: 5,
    dashArrayY: 5,
    rotation: 0,
    maxTileWidth: 512,
    maxTileHeight: 512
  });

  if (decalOpt.backgroundColor === 'none') {
    decalOpt.backgroundColor = null;
  }

  var pattern = {
    repeat: 'repeat'
  };
  setPatternnSource(pattern);
  pattern.rotation = decalOpt.rotation;
  pattern.scaleX = pattern.scaleY = isSVG ? 1 : 1 / dpr;
  decalMap.set(decalObject, pattern);
  decalObject.dirty = false;
  return pattern;

  function setPatternnSource(pattern) {
    var keys = [dpr];
    var isValidKey = true;

    for (var i = 0; i < decalKeys.length; ++i) {
      var value = decalOpt[decalKeys[i]];
      var valueType = typeof value;

      if (value != null && !isArray(value) && valueType !== 'string' && valueType !== 'number' && valueType !== 'boolean') {
        isValidKey = false;
        break;
      }

      keys.push(value);
    }

    var cacheKey;

    if (isValidKey) {
      cacheKey = keys.join(',') + (isSVG ? '-svg' : '');
      var cache = decalCache.get(cacheKey);

      if (cache) {
        isSVG ? pattern.svgElement = cache : pattern.image = cache;
      }
    }

    var dashArrayX = normalizeDashArrayX(decalOpt.dashArrayX);
    var dashArrayY = normalizeDashArrayY(decalOpt.dashArrayY);
    var symbolArray = normalizeSymbolArray(decalOpt.symbol);
    var lineBlockLengthsX = getLineBlockLengthX(dashArrayX);
    var lineBlockLengthY = getLineBlockLengthY(dashArrayY);
    var canvas = !isSVG && createCanvas();
    var svgRoot = isSVG && zr.painter.createSVGElement('g');
    var pSize = getPatternSize();
    var ctx;

    if (canvas) {
      canvas.width = pSize.width * dpr;
      canvas.height = pSize.height * dpr;
      ctx = canvas.getContext('2d');
    }

    brushDecal();

    if (isValidKey) {
      decalCache.put(cacheKey, canvas || svgRoot);
    }

    pattern.image = canvas;
    pattern.svgElement = svgRoot;
    pattern.svgWidth = pSize.width;
    pattern.svgHeight = pSize.height;
    /**
     * Get minumum length that can make a repeatable pattern.
     *
     * @return {Object} pattern width and height
     */

    function getPatternSize() {
      /**
       * For example, if dash is [[3, 2], [2, 1]] for X, it looks like
       * |---  ---  ---  ---  --- ...
       * |-- -- -- -- -- -- -- -- ...
       * |---  ---  ---  ---  --- ...
       * |-- -- -- -- -- -- -- -- ...
       * So the minumum length of X is 15,
       * which is the least common multiple of `3 + 2` and `2 + 1`
       * |---  ---  ---  |---  --- ...
       * |-- -- -- -- -- |-- -- -- ...
       */
      var width = 1;

      for (var i = 0, xlen = lineBlockLengthsX.length; i < xlen; ++i) {
        width = getLeastCommonMultiple(width, lineBlockLengthsX[i]);
      }

      var symbolRepeats = 1;

      for (var i = 0, xlen = symbolArray.length; i < xlen; ++i) {
        symbolRepeats = getLeastCommonMultiple(symbolRepeats, symbolArray[i].length);
      }

      width *= symbolRepeats;
      var height = lineBlockLengthY * lineBlockLengthsX.length * symbolArray.length;

      return {
        width: Math.max(1, Math.min(width, decalOpt.maxTileWidth)),
        height: Math.max(1, Math.min(height, decalOpt.maxTileHeight))
      };
    }

    function brushDecal() {
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (decalOpt.backgroundColor) {
          ctx.fillStyle = decalOpt.backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      var ySum = 0;

      for (var i = 0; i < dashArrayY.length; ++i) {
        ySum += dashArrayY[i];
      }

      if (ySum <= 0) {
        // dashArrayY is 0, draw nothing
        return;
      }

      var y = -lineBlockLengthY;
      var yId = 0;
      var yIdTotal = 0;
      var xId0 = 0;

      while (y < pSize.height) {
        if (yId % 2 === 0) {
          var symbolYId = yIdTotal / 2 % symbolArray.length;
          var x = 0;
          var xId1 = 0;
          var xId1Total = 0;

          while (x < pSize.width * 2) {
            var xSum = 0;

            for (var i = 0; i < dashArrayX[xId0].length; ++i) {
              xSum += dashArrayX[xId0][i];
            }

            if (xSum <= 0) {
              // Skip empty line
              break;
            } // E.g., [15, 5, 20, 5] draws only for 15 and 20


            if (xId1 % 2 === 0) {
              var size = (1 - decalOpt.symbolSize) * 0.5;
              var left = x + dashArrayX[xId0][xId1] * size;
              var top_1 = y + dashArrayY[yId] * size;
              var width = dashArrayX[xId0][xId1] * decalOpt.symbolSize;
              var height = dashArrayY[yId] * decalOpt.symbolSize;
              var symbolXId = xId1Total / 2 % symbolArray[symbolYId].length;
              brushSymbol(left, top_1, width, height, symbolArray[symbolYId][symbolXId]);
            }

            x += dashArrayX[xId0][xId1];
            ++xId1Total;
            ++xId1;

            if (xId1 === dashArrayX[xId0].length) {
              xId1 = 0;
            }
          }

          ++xId0;

          if (xId0 === dashArrayX.length) {
            xId0 = 0;
          }
        }

        y += dashArrayY[yId];
        ++yIdTotal;
        ++yId;

        if (yId === dashArrayY.length) {
          yId = 0;
        }
      }

      function brushSymbol(x, y, width, height, symbolType) {
        var scale = isSVG ? 1 : dpr;
        var symbol = createSymbol(symbolType, x * scale, y * scale, width * scale, height * scale, decalOpt.color, decalOpt.symbolKeepAspect);

        if (isSVG) {
          svgRoot.appendChild(zr.painter.paintOne(symbol));
        } else {
          // Paint to canvas for all other renderers.
          brushSingle(ctx, symbol);
        }
      }
    }
  }
}
/**
 * Convert symbol array into normalized array
 *
 * @param {string | (string | string[])[]} symbol symbol input
 * @return {string[][]} normolized symbol array
 */

function normalizeSymbolArray(symbol) {
  if (!symbol || symbol.length === 0) {
    return [['rect']];
  }

  if (typeof symbol === 'string') {
    return [[symbol]];
  }

  var isAllString = true;

  for (var i = 0; i < symbol.length; ++i) {
    if (typeof symbol[i] !== 'string') {
      isAllString = false;
      break;
    }
  }

  if (isAllString) {
    return normalizeSymbolArray([symbol]);
  }

  var result = [];

  for (var i = 0; i < symbol.length; ++i) {
    if (typeof symbol[i] === 'string') {
      result.push([symbol[i]]);
    } else {
      result.push(symbol[i]);
    }
  }

  return result;
}
/**
 * Convert dash input into dashArray
 *
 * @param {DecalDashArrayX} dash dash input
 * @return {number[][]} normolized dash array
 */


function normalizeDashArrayX(dash) {
  if (!dash || dash.length === 0) {
    return [[0, 0]];
  }

  if (typeof dash === 'number') {
    var dashValue = Math.ceil(dash);
    return [[dashValue, dashValue]];
  }
  /**
   * [20, 5] should be normalized into [[20, 5]],
   * while [20, [5, 10]] should be normalized into [[20, 20], [5, 10]]
   */


  var isAllNumber = true;

  for (var i = 0; i < dash.length; ++i) {
    if (typeof dash[i] !== 'number') {
      isAllNumber = false;
      break;
    }
  }

  if (isAllNumber) {
    return normalizeDashArrayX([dash]);
  }

  var result = [];

  for (var i = 0; i < dash.length; ++i) {
    if (typeof dash[i] === 'number') {
      var dashValue = Math.ceil(dash[i]);
      result.push([dashValue, dashValue]);
    } else {
      var dashValue = map(dash[i], function (n) {
        return Math.ceil(n);
      });

      if (dashValue.length % 2 === 1) {
        // [4, 2, 1] means |----  -    -- |----  -    -- |
        // so normalize it to be [4, 2, 1, 4, 2, 1]
        result.push(dashValue.concat(dashValue));
      } else {
        result.push(dashValue);
      }
    }
  }

  return result;
}
/**
 * Convert dash input into dashArray
 *
 * @param {DecalDashArrayY} dash dash input
 * @return {number[]} normolized dash array
 */


function normalizeDashArrayY(dash) {
  if (!dash || typeof dash === 'object' && dash.length === 0) {
    return [0, 0];
  }

  if (typeof dash === 'number') {
    var dashValue_1 = Math.ceil(dash);
    return [dashValue_1, dashValue_1];
  }

  var dashValue = map(dash, function (n) {
    return Math.ceil(n);
  });
  return dash.length % 2 ? dashValue.concat(dashValue) : dashValue;
}
/**
 * Get block length of each line. A block is the length of dash line and space.
 * For example, a line with [4, 1] has a dash line of 4 and a space of 1 after
 * that, so the block length of this line is 5.
 *
 * @param {number[][]} dash dash arrary of X or Y
 * @return {number[]} block length of each line
 */


function getLineBlockLengthX(dash) {
  return map(dash, function (line) {
    return getLineBlockLengthY(line);
  });
}

function getLineBlockLengthY(dash) {
  var blockLength = 0;

  for (var i = 0; i < dash.length; ++i) {
    blockLength += dash[i];
  }

  if (dash.length % 2 === 1) {
    // [4, 2, 1] means |----  -    -- |----  -    -- |
    // So total length is (4 + 2 + 1) * 2
    return blockLength * 2;
  }

  return blockLength;
}

function decalVisual(ecModel, api) {
  ecModel.eachRawSeries(function (seriesModel) {
    if (ecModel.isSeriesFiltered(seriesModel)) {
      return;
    }

    var data = seriesModel.getData();

    if (data.hasItemVisual()) {
      data.each(function (idx) {
        var decal = data.getItemVisual(idx, 'decal');

        if (decal) {
          var itemStyle = data.ensureUniqueItemVisual(idx, 'style');
          itemStyle.decal = createOrUpdatePatternFromDecal(decal, api);
        }
      });
    }

    var decal = data.getVisual('decal');

    if (decal) {
      var style = data.getVisual('style');
      style.decal = createOrUpdatePatternFromDecal(decal, api);
    }
  });
}

var assert = assert$1;
var each = each$2;
var isFunction = isFunction$1;
var isObject = isObject$2;
var indexOf = indexOf$1;
var hasWindow = typeof window !== 'undefined';
var version = '5.0.2';
var dependencies = {
  zrender: '5.0.4'
};
var TEST_FRAME_REMAIN_TIME = 1;
var PRIORITY_PROCESSOR_SERIES_FILTER = 800; // Some data processors depends on the stack result dimension (to calculate data extent).
// So data stack stage should be in front of data processing stage.

var PRIORITY_PROCESSOR_DATASTACK = 900; // "Data filter" will block the stream, so it should be
// put at the begining of data processing.

var PRIORITY_PROCESSOR_FILTER = 1000;
var PRIORITY_PROCESSOR_DEFAULT = 2000;
var PRIORITY_PROCESSOR_STATISTIC = 5000;
var PRIORITY_VISUAL_LAYOUT = 1000;
var PRIORITY_VISUAL_PROGRESSIVE_LAYOUT = 1100;
var PRIORITY_VISUAL_GLOBAL = 2000;
var PRIORITY_VISUAL_CHART = 3000;
var PRIORITY_VISUAL_COMPONENT = 4000; // Visual property in data. Greater than `PRIORITY_VISUAL_COMPONENT` to enable to
// overwrite the viusal result of component (like `visualMap`)
// using data item specific setting (like itemStyle.xxx on data item)

var PRIORITY_VISUAL_CHART_DATA_CUSTOM = 4500; // Greater than `PRIORITY_VISUAL_CHART_DATA_CUSTOM` to enable to layout based on
// visual result like `symbolSize`.

var PRIORITY_VISUAL_POST_CHART_LAYOUT = 4600;
var PRIORITY_VISUAL_BRUSH = 5000;
var PRIORITY_VISUAL_ARIA = 6000;
var PRIORITY_VISUAL_DECAL = 7000;
var PRIORITY = {
  PROCESSOR: {
    FILTER: PRIORITY_PROCESSOR_FILTER,
    SERIES_FILTER: PRIORITY_PROCESSOR_SERIES_FILTER,
    STATISTIC: PRIORITY_PROCESSOR_STATISTIC
  },
  VISUAL: {
    LAYOUT: PRIORITY_VISUAL_LAYOUT,
    PROGRESSIVE_LAYOUT: PRIORITY_VISUAL_PROGRESSIVE_LAYOUT,
    GLOBAL: PRIORITY_VISUAL_GLOBAL,
    CHART: PRIORITY_VISUAL_CHART,
    POST_CHART_LAYOUT: PRIORITY_VISUAL_POST_CHART_LAYOUT,
    COMPONENT: PRIORITY_VISUAL_COMPONENT,
    BRUSH: PRIORITY_VISUAL_BRUSH,
    CHART_ITEM: PRIORITY_VISUAL_CHART_DATA_CUSTOM,
    ARIA: PRIORITY_VISUAL_ARIA,
    DECAL: PRIORITY_VISUAL_DECAL
  }
}; // Main process have three entries: `setOption`, `dispatchAction` and `resize`,
// where they must not be invoked nestedly, except the only case: invoke
// dispatchAction with updateMethod "none" in main process.
// This flag is used to carry out this rule.
// All events will be triggered out side main process (i.e. when !this[IN_MAIN_PROCESS]).

var IN_MAIN_PROCESS_KEY = '__flagInMainProcess';
var OPTION_UPDATED_KEY = '__optionUpdated';
var STATUS_NEEDS_UPDATE_KEY = '__needsUpdateStatus';
var ACTION_REG = /^[a-zA-Z0-9_]+$/;
var CONNECT_STATUS_KEY = '__connectUpdateStatus';
var CONNECT_STATUS_PENDING = 0;
var CONNECT_STATUS_UPDATING = 1;
var CONNECT_STATUS_UPDATED = 2;

function createRegisterEventWithLowercaseECharts(method) {
  return function () {
    var args = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }

    if (this.isDisposed()) {
      disposedWarning(this.id);
      return;
    }

    return toLowercaseNameAndCallEventful(this, method, args);
  };
}

function createRegisterEventWithLowercaseMessageCenter(method) {
  return function () {
    var args = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }

    return toLowercaseNameAndCallEventful(this, method, args);
  };
}

function toLowercaseNameAndCallEventful(host, method, args) {
  // `args[0]` is event name. Event name is all lowercase.
  args[0] = args[0] && args[0].toLowerCase();
  return Eventful.prototype[method].apply(host, args);
}

var MessageCenter =
/** @class */
function (_super) {
  __extends(MessageCenter, _super);

  function MessageCenter() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  return MessageCenter;
}(Eventful);

var messageCenterProto = MessageCenter.prototype;
messageCenterProto.on = createRegisterEventWithLowercaseMessageCenter('on');
messageCenterProto.off = createRegisterEventWithLowercaseMessageCenter('off'); // ---------------------------------------
// Internal method names for class ECharts
// ---------------------------------------

var prepare;
var prepareView;
var updateDirectly;
var updateMethods;
var doConvertPixel;
var updateStreamModes;
var doDispatchAction;
var flushPendingActions;
var triggerUpdatedEvent;
var bindRenderedEvent;
var bindMouseEvent;
var clearColorPalette;
var render;
var renderComponents;
var renderSeries;
var performPostUpdateFuncs;
var createExtensionAPI;
var enableConnect;
var setTransitionOpt;
var markStatusToUpdate;
var applyChangedStates;

var ECharts =
/** @class */
function (_super) {
  __extends(ECharts, _super);

  function ECharts(dom, // Theme name or themeOption.
  theme, opts) {
    var _this = _super.call(this, new ECEventProcessor()) || this;

    _this._chartsViews = [];
    _this._chartsMap = {};
    _this._componentsViews = [];
    _this._componentsMap = {}; // Can't dispatch action during rendering procedure

    _this._pendingActions = [];
    opts = opts || {}; // Get theme by name

    if (typeof theme === 'string') {
      theme = themeStorage[theme];
    }

    _this._dom = dom;
    var defaultRenderer = 'canvas';
    var defaultUseDirtyRect = false;

    var zr = _this._zr = init$1(dom, {
      renderer: opts.renderer || defaultRenderer,
      devicePixelRatio: opts.devicePixelRatio,
      width: opts.width,
      height: opts.height,
      useDirtyRect: opts.useDirtyRect == null ? defaultUseDirtyRect : opts.useDirtyRect
    }); // Expect 60 fps.

    _this._throttledZrFlush = throttle(bind(zr.flush, zr), 17);
    theme = clone(theme);
    theme && globalBackwardCompat(theme, true);
    _this._theme = theme;
    _this._locale = createLocaleObject(opts.locale || SYSTEM_LANG);
    _this._coordSysMgr = new CoordinateSystemManager();
    var api = _this._api = createExtensionAPI(_this); // Sort on demand

    function prioritySortFunc(a, b) {
      return a.__prio - b.__prio;
    }

    sort(visualFuncs, prioritySortFunc);
    sort(dataProcessorFuncs, prioritySortFunc);
    _this._scheduler = new Scheduler(_this, api, dataProcessorFuncs, visualFuncs);
    _this._messageCenter = new MessageCenter();
    _this._labelManager = new LabelManager(); // Init mouse events

    _this._initEvents(); // In case some people write `window.onresize = chart.resize`


    _this.resize = bind(_this.resize, _this);
    zr.animation.on('frame', _this._onframe, _this);
    bindRenderedEvent(zr, _this);
    bindMouseEvent(zr, _this); // ECharts instance can be used as value.

    setAsPrimitive(_this);
    return _this;
  }

  ECharts.prototype._onframe = function () {
    if (this._disposed) {
      return;
    }

    applyChangedStates(this);
    var scheduler = this._scheduler; // Lazy update

    if (this[OPTION_UPDATED_KEY]) {
      var silent = this[OPTION_UPDATED_KEY].silent;
      this[IN_MAIN_PROCESS_KEY] = true;
      prepare(this);
      updateMethods.update.call(this); // At present, in each frame, zrender performs:
      //   (1) animation step forward.
      //   (2) trigger('frame') (where this `_onframe` is called)
      //   (3) zrender flush (render).
      // If we do nothing here, since we use `setToFinal: true`, the step (3) above
      // will render the final state of the elements before the real animation started.

      this._zr.flush();

      this[IN_MAIN_PROCESS_KEY] = false;
      this[OPTION_UPDATED_KEY] = false;
      flushPendingActions.call(this, silent);
      triggerUpdatedEvent.call(this, silent);
    } // Avoid do both lazy update and progress in one frame.
    else if (scheduler.unfinished) {
        // Stream progress.
        var remainTime = TEST_FRAME_REMAIN_TIME;
        var ecModel = this._model;
        var api = this._api;
        scheduler.unfinished = false;

        do {
          var startTime = +new Date();
          scheduler.performSeriesTasks(ecModel); // Currently dataProcessorFuncs do not check threshold.

          scheduler.performDataProcessorTasks(ecModel);
          updateStreamModes(this, ecModel); // Do not update coordinate system here. Because that coord system update in
          // each frame is not a good user experience. So we follow the rule that
          // the extent of the coordinate system is determin in the first frame (the
          // frame is executed immedietely after task reset.
          // this._coordSysMgr.update(ecModel, api);
          // console.log('--- ec frame visual ---', remainTime);

          scheduler.performVisualTasks(ecModel);
          renderSeries(this, this._model, api, 'remain');
          remainTime -= +new Date() - startTime;
        } while (remainTime > 0 && scheduler.unfinished); // Call flush explicitly for trigger finished event.


        if (!scheduler.unfinished) {
          this._zr.flush();
        } // Else, zr flushing be ensue within the same frame,
        // because zr flushing is after onframe event.

      }
  };

  ECharts.prototype.getDom = function () {
    return this._dom;
  };

  ECharts.prototype.getId = function () {
    return this.id;
  };

  ECharts.prototype.getZr = function () {
    return this._zr;
  };
  /* eslint-disable-next-line */


  ECharts.prototype.setOption = function (option, notMerge, lazyUpdate) {

    if (this._disposed) {
      disposedWarning(this.id);
      return;
    }

    var silent;
    var replaceMerge;
    var transitionOpt;

    if (isObject(notMerge)) {
      lazyUpdate = notMerge.lazyUpdate;
      silent = notMerge.silent;
      replaceMerge = notMerge.replaceMerge;
      transitionOpt = notMerge.transition;
      notMerge = notMerge.notMerge;
    }

    this[IN_MAIN_PROCESS_KEY] = true;

    if (!this._model || notMerge) {
      var optionManager = new OptionManager(this._api);
      var theme = this._theme;
      var ecModel = this._model = new GlobalModel();
      ecModel.scheduler = this._scheduler;
      ecModel.init(null, null, null, theme, this._locale, optionManager);
    }

    this._model.setOption(option, {
      replaceMerge: replaceMerge
    }, optionPreprocessorFuncs);

    setTransitionOpt(this, transitionOpt);

    if (lazyUpdate) {
      this[OPTION_UPDATED_KEY] = {
        silent: silent
      };
      this[IN_MAIN_PROCESS_KEY] = false; // `setOption(option, {lazyMode: true})` may be called when zrender has been slept.
      // It should wake it up to make sure zrender start to render at the next frame.

      this.getZr().wakeUp();
    } else {
      prepare(this);
      updateMethods.update.call(this); // Ensure zr refresh sychronously, and then pixel in canvas can be
      // fetched after `setOption`.

      this._zr.flush();

      this[OPTION_UPDATED_KEY] = false;
      this[IN_MAIN_PROCESS_KEY] = false;
      flushPendingActions.call(this, silent);
      triggerUpdatedEvent.call(this, silent);
    }
  };
  /**
   * @DEPRECATED
   */


  ECharts.prototype.setTheme = function () {
    console.error('ECharts#setTheme() is DEPRECATED in ECharts 3.0');
  }; // We don't want developers to use getModel directly.


  ECharts.prototype.getModel = function () {
    return this._model;
  };

  ECharts.prototype.getOption = function () {
    return this._model && this._model.getOption();
  };

  ECharts.prototype.getWidth = function () {
    return this._zr.getWidth();
  };

  ECharts.prototype.getHeight = function () {
    return this._zr.getHeight();
  };

  ECharts.prototype.getDevicePixelRatio = function () {
    return this._zr.painter.dpr
    /* eslint-disable-next-line */
    || hasWindow && window.devicePixelRatio || 1;
  };
  /**
   * Get canvas which has all thing rendered
   */


  ECharts.prototype.getRenderedCanvas = function (opts) {
    if (!env.canvasSupported) {
      return;
    }

    opts = extend({}, opts || {});
    opts.pixelRatio = opts.pixelRatio || this.getDevicePixelRatio();
    opts.backgroundColor = opts.backgroundColor || this._model.get('backgroundColor');
    var zr = this._zr; // let list = zr.storage.getDisplayList();
    // Stop animations
    // Never works before in init animation, so remove it.
    // zrUtil.each(list, function (el) {
    //     el.stopAnimation(true);
    // });

    return zr.painter.getRenderedCanvas(opts);
  };
  /**
   * Get svg data url
   */


  ECharts.prototype.getSvgDataURL = function () {
    if (!env.svgSupported) {
      return;
    }

    var zr = this._zr;
    var list = zr.storage.getDisplayList(); // Stop animations

    each$2(list, function (el) {
      el.stopAnimation(null, true);
    });
    return zr.painter.toDataURL();
  };

  ECharts.prototype.getDataURL = function (opts) {
    if (this._disposed) {
      disposedWarning(this.id);
      return;
    }

    opts = opts || {};
    var excludeComponents = opts.excludeComponents;
    var ecModel = this._model;
    var excludesComponentViews = [];
    var self = this;
    each(excludeComponents, function (componentType) {
      ecModel.eachComponent({
        mainType: componentType
      }, function (component) {
        var view = self._componentsMap[component.__viewId];

        if (!view.group.ignore) {
          excludesComponentViews.push(view);
          view.group.ignore = true;
        }
      });
    });
    var url = this._zr.painter.getType() === 'svg' ? this.getSvgDataURL() : this.getRenderedCanvas(opts).toDataURL('image/' + (opts && opts.type || 'png'));
    each(excludesComponentViews, function (view) {
      view.group.ignore = false;
    });
    return url;
  };

  ECharts.prototype.getConnectedDataURL = function (opts) {
    if (this._disposed) {
      disposedWarning(this.id);
      return;
    }

    if (!env.canvasSupported) {
      return;
    }

    var isSvg = opts.type === 'svg';
    var groupId = this.group;
    var mathMin = Math.min;
    var mathMax = Math.max;
    var MAX_NUMBER = Infinity;

    if (connectedGroups[groupId]) {
      var left_1 = MAX_NUMBER;
      var top_1 = MAX_NUMBER;
      var right_1 = -MAX_NUMBER;
      var bottom_1 = -MAX_NUMBER;
      var canvasList_1 = [];
      var dpr_1 = opts && opts.pixelRatio || this.getDevicePixelRatio();
      each$2(instances, function (chart, id) {
        if (chart.group === groupId) {
          var canvas = isSvg ? chart.getZr().painter.getSvgDom().innerHTML : chart.getRenderedCanvas(clone(opts));
          var boundingRect = chart.getDom().getBoundingClientRect();
          left_1 = mathMin(boundingRect.left, left_1);
          top_1 = mathMin(boundingRect.top, top_1);
          right_1 = mathMax(boundingRect.right, right_1);
          bottom_1 = mathMax(boundingRect.bottom, bottom_1);
          canvasList_1.push({
            dom: canvas,
            left: boundingRect.left,
            top: boundingRect.top
          });
        }
      });
      left_1 *= dpr_1;
      top_1 *= dpr_1;
      right_1 *= dpr_1;
      bottom_1 *= dpr_1;
      var width = right_1 - left_1;
      var height = bottom_1 - top_1;
      var targetCanvas = createCanvas();
      var zr_1 = init$1(targetCanvas, {
        renderer: isSvg ? 'svg' : 'canvas'
      });
      zr_1.resize({
        width: width,
        height: height
      });

      if (isSvg) {
        var content_1 = '';
        each(canvasList_1, function (item) {
          var x = item.left - left_1;
          var y = item.top - top_1;
          content_1 += '<g transform="translate(' + x + ',' + y + ')">' + item.dom + '</g>';
        });
        zr_1.painter.getSvgRoot().innerHTML = content_1;

        if (opts.connectedBackgroundColor) {
          zr_1.painter.setBackgroundColor(opts.connectedBackgroundColor);
        }

        zr_1.refreshImmediately();
        return zr_1.painter.toDataURL();
      } else {
        // Background between the charts
        if (opts.connectedBackgroundColor) {
          zr_1.add(new Rect({
            shape: {
              x: 0,
              y: 0,
              width: width,
              height: height
            },
            style: {
              fill: opts.connectedBackgroundColor
            }
          }));
        }

        each(canvasList_1, function (item) {
          var img = new ZRImage({
            style: {
              x: item.left * dpr_1 - left_1,
              y: item.top * dpr_1 - top_1,
              image: item.dom
            }
          });
          zr_1.add(img);
        });
        zr_1.refreshImmediately();
        return targetCanvas.toDataURL('image/' + (opts && opts.type || 'png'));
      }
    } else {
      return this.getDataURL(opts);
    }
  };

  ECharts.prototype.convertToPixel = function (finder, value) {
    return doConvertPixel(this, 'convertToPixel', finder, value);
  };

  ECharts.prototype.convertFromPixel = function (finder, value) {
    return doConvertPixel(this, 'convertFromPixel', finder, value);
  };
  /**
   * Is the specified coordinate systems or components contain the given pixel point.
   * @param {Array|number} value
   * @return {boolean} result
   */


  ECharts.prototype.containPixel = function (finder, value) {
    if (this._disposed) {
      disposedWarning(this.id);
      return;
    }

    var ecModel = this._model;
    var result;
    var findResult = parseFinder(ecModel, finder);
    each$2(findResult, function (models, key) {
      key.indexOf('Models') >= 0 && each$2(models, function (model) {
        var coordSys = model.coordinateSystem;

        if (coordSys && coordSys.containPoint) {
          result = result || !!coordSys.containPoint(value);
        } else if (key === 'seriesModels') {
          var view = this._chartsMap[model.__viewId];

          if (view && view.containPoint) {
            result = result || view.containPoint(value, model);
          }
        } else ;
      }, this);
    }, this);
    return !!result;
  };
  /**
   * Get visual from series or data.
   * @param finder
   *        If string, e.g., 'series', means {seriesIndex: 0}.
   *        If Object, could contain some of these properties below:
   *        {
   *            seriesIndex / seriesId / seriesName,
   *            dataIndex / dataIndexInside
   *        }
   *        If dataIndex is not specified, series visual will be fetched,
   *        but not data item visual.
   *        If all of seriesIndex, seriesId, seriesName are not specified,
   *        visual will be fetched from first series.
   * @param visualType 'color', 'symbol', 'symbolSize'
   */


  ECharts.prototype.getVisual = function (finder, visualType) {
    var ecModel = this._model;
    var parsedFinder = parseFinder(ecModel, finder, {
      defaultMainType: 'series'
    });
    var seriesModel = parsedFinder.seriesModel;

    var data = seriesModel.getData();
    var dataIndexInside = parsedFinder.hasOwnProperty('dataIndexInside') ? parsedFinder.dataIndexInside : parsedFinder.hasOwnProperty('dataIndex') ? data.indexOfRawIndex(parsedFinder.dataIndex) : null;
    return dataIndexInside != null ? getItemVisualFromData(data, dataIndexInside, visualType) : getVisualFromData(data, visualType);
  };
  /**
   * Get view of corresponding component model
   */


  ECharts.prototype.getViewOfComponentModel = function (componentModel) {
    return this._componentsMap[componentModel.__viewId];
  };
  /**
   * Get view of corresponding series model
   */


  ECharts.prototype.getViewOfSeriesModel = function (seriesModel) {
    return this._chartsMap[seriesModel.__viewId];
  };

  ECharts.prototype._initEvents = function () {
    var _this = this;

    each(MOUSE_EVENT_NAMES, function (eveName) {
      var handler = function (e) {
        var ecModel = _this.getModel();

        var el = e.target;
        var params;
        var isGlobalOut = eveName === 'globalout'; // no e.target when 'globalout'.

        if (isGlobalOut) {
          params = {};
        } else {
          el && findEventDispatcher(el, function (parent) {
            var ecData = getECData(parent);

            if (ecData && ecData.dataIndex != null) {
              var dataModel = ecData.dataModel || ecModel.getSeriesByIndex(ecData.seriesIndex);
              params = dataModel && dataModel.getDataParams(ecData.dataIndex, ecData.dataType) || {};
              return true;
            } // If element has custom eventData of components
            else if (ecData.eventData) {
                params = extend({}, ecData.eventData);
                return true;
              }
          }, true);
        } // Contract: if params prepared in mouse event,
        // these properties must be specified:
        // {
        //    componentType: string (component main type)
        //    componentIndex: number
        // }
        // Otherwise event query can not work.


        if (params) {
          var componentType = params.componentType;
          var componentIndex = params.componentIndex; // Special handling for historic reason: when trigger by
          // markLine/markPoint/markArea, the componentType is
          // 'markLine'/'markPoint'/'markArea', but we should better
          // enable them to be queried by seriesIndex, since their
          // option is set in each series.

          if (componentType === 'markLine' || componentType === 'markPoint' || componentType === 'markArea') {
            componentType = 'series';
            componentIndex = params.seriesIndex;
          }

          var model = componentType && componentIndex != null && ecModel.getComponent(componentType, componentIndex);
          var view = model && _this[model.mainType === 'series' ? '_chartsMap' : '_componentsMap'][model.__viewId];

          params.event = e;
          params.type = eveName;
          _this._$eventProcessor.eventInfo = {
            targetEl: el,
            packedEvent: params,
            model: model,
            view: view
          };

          _this.trigger(eveName, params);
        }
      }; // Consider that some component (like tooltip, brush, ...)
      // register zr event handler, but user event handler might
      // do anything, such as call `setOption` or `dispatchAction`,
      // which probably update any of the content and probably
      // cause problem if it is called previous other inner handlers.


      handler.zrEventfulCallAtLast = true;

      _this._zr.on(eveName, handler, _this);
    });
    each(eventActionMap, function (actionType, eventType) {
      _this._messageCenter.on(eventType, function (event) {
        this.trigger(eventType, event);
      }, _this);
    }); // Extra events
    // TODO register?

    each(['selectchanged'], function (eventType) {
      _this._messageCenter.on(eventType, function (event) {
        this.trigger(eventType, event);
      }, _this);
    });
    handleLegacySelectEvents(this._messageCenter, this, this._api);
  };

  ECharts.prototype.isDisposed = function () {
    return this._disposed;
  };

  ECharts.prototype.clear = function () {
    if (this._disposed) {
      disposedWarning(this.id);
      return;
    }

    this.setOption({
      series: []
    }, true);
  };

  ECharts.prototype.dispose = function () {
    if (this._disposed) {
      disposedWarning(this.id);
      return;
    }

    this._disposed = true;
    setAttribute(this.getDom(), DOM_ATTRIBUTE_KEY, '');
    var api = this._api;
    var ecModel = this._model;
    each(this._componentsViews, function (component) {
      component.dispose(ecModel, api);
    });
    each(this._chartsViews, function (chart) {
      chart.dispose(ecModel, api);
    }); // Dispose after all views disposed

    this._zr.dispose();

    delete instances[this.id];
  };
  /**
   * Resize the chart
   */


  ECharts.prototype.resize = function (opts) {

    if (this._disposed) {
      disposedWarning(this.id);
      return;
    }

    this._zr.resize(opts);

    var ecModel = this._model; // Resize loading effect

    this._loadingFX && this._loadingFX.resize();

    if (!ecModel) {
      return;
    }

    var optionChanged = ecModel.resetOption('media');
    var silent = opts && opts.silent;
    this[IN_MAIN_PROCESS_KEY] = true;
    optionChanged && prepare(this);
    updateMethods.update.call(this, {
      type: 'resize',
      animation: {
        // Disable animation
        duration: 0
      }
    });
    this[IN_MAIN_PROCESS_KEY] = false;
    flushPendingActions.call(this, silent);
    triggerUpdatedEvent.call(this, silent);
  };

  ECharts.prototype.showLoading = function (name, cfg) {
    if (this._disposed) {
      disposedWarning(this.id);
      return;
    }

    if (isObject(name)) {
      cfg = name;
      name = '';
    }

    name = name || 'default';
    this.hideLoading();

    if (!loadingEffects[name]) {

      return;
    }

    var el = loadingEffects[name](this._api, cfg);
    var zr = this._zr;
    this._loadingFX = el;
    zr.add(el);
  };
  /**
   * Hide loading effect
   */


  ECharts.prototype.hideLoading = function () {
    if (this._disposed) {
      disposedWarning(this.id);
      return;
    }

    this._loadingFX && this._zr.remove(this._loadingFX);
    this._loadingFX = null;
  };

  ECharts.prototype.makeActionFromEvent = function (eventObj) {
    var payload = extend({}, eventObj);
    payload.type = eventActionMap[eventObj.type];
    return payload;
  };
  /**
   * @param opt If pass boolean, means opt.silent
   * @param opt.silent Default `false`. Whether trigger events.
   * @param opt.flush Default `undefined`.
   *        true: Flush immediately, and then pixel in canvas can be fetched
   *            immediately. Caution: it might affect performance.
   *        false: Not flush.
   *        undefined: Auto decide whether perform flush.
   */


  ECharts.prototype.dispatchAction = function (payload, opt) {
    if (this._disposed) {
      disposedWarning(this.id);
      return;
    }

    if (!isObject(opt)) {
      opt = {
        silent: !!opt
      };
    }

    if (!actions[payload.type]) {
      return;
    } // Avoid dispatch action before setOption. Especially in `connect`.


    if (!this._model) {
      return;
    } // May dispatchAction in rendering procedure


    if (this[IN_MAIN_PROCESS_KEY]) {
      this._pendingActions.push(payload);

      return;
    }

    var silent = opt.silent;
    doDispatchAction.call(this, payload, silent);
    var flush = opt.flush;

    if (flush) {
      this._zr.flush();
    } else if (flush !== false && env.browser.weChat) {
      // In WeChat embeded browser, `requestAnimationFrame` and `setInterval`
      // hang when sliding page (on touch event), which cause that zr does not
      // refresh util user interaction finished, which is not expected.
      // But `dispatchAction` may be called too frequently when pan on touch
      // screen, which impacts performance if do not throttle them.
      this._throttledZrFlush();
    }

    flushPendingActions.call(this, silent);
    triggerUpdatedEvent.call(this, silent);
  };

  ECharts.prototype.updateLabelLayout = function () {
    var labelManager = this._labelManager;
    labelManager.updateLayoutConfig(this._api);
    labelManager.layout(this._api);
    labelManager.processLabelsOverall();
  };

  ECharts.prototype.appendData = function (params) {
    if (this._disposed) {
      disposedWarning(this.id);
      return;
    }

    var seriesIndex = params.seriesIndex;
    var ecModel = this.getModel();
    var seriesModel = ecModel.getSeriesByIndex(seriesIndex);

    seriesModel.appendData(params); // Note: `appendData` does not support that update extent of coordinate
    // system, util some scenario require that. In the expected usage of
    // `appendData`, the initial extent of coordinate system should better
    // be fixed by axis `min`/`max` setting or initial data, otherwise if
    // the extent changed while `appendData`, the location of the painted
    // graphic elements have to be changed, which make the usage of
    // `appendData` meaningless.

    this._scheduler.unfinished = true;
    this.getZr().wakeUp();
  }; // A work around for no `internal` modifier in ts yet but
  // need to strictly hide private methods to JS users.


  ECharts.internalField = function () {
    prepare = function (ecIns) {
      var scheduler = ecIns._scheduler;
      scheduler.restorePipelines(ecIns._model);
      scheduler.prepareStageTasks();
      prepareView(ecIns, true);
      prepareView(ecIns, false);
      scheduler.plan();
    };
    /**
     * Prepare view instances of charts and components
     */


    prepareView = function (ecIns, isComponent) {
      var ecModel = ecIns._model;
      var scheduler = ecIns._scheduler;
      var viewList = isComponent ? ecIns._componentsViews : ecIns._chartsViews;
      var viewMap = isComponent ? ecIns._componentsMap : ecIns._chartsMap;
      var zr = ecIns._zr;
      var api = ecIns._api;

      for (var i = 0; i < viewList.length; i++) {
        viewList[i].__alive = false;
      }

      isComponent ? ecModel.eachComponent(function (componentType, model) {
        componentType !== 'series' && doPrepare(model);
      }) : ecModel.eachSeries(doPrepare);

      function doPrepare(model) {
        // By defaut view will be reused if possible for the case that `setOption` with "notMerge"
        // mode and need to enable transition animation. (Usually, when they have the same id, or
        // especially no id but have the same type & name & index. See the `model.id` generation
        // rule in `makeIdAndName` and `viewId` generation rule here).
        // But in `replaceMerge` mode, this feature should be able to disabled when it is clear that
        // the new model has nothing to do with the old model.
        var requireNewView = model.__requireNewView; // This command should not work twice.

        model.__requireNewView = false; // Consider: id same and type changed.

        var viewId = '_ec_' + model.id + '_' + model.type;
        var view = !requireNewView && viewMap[viewId];

        if (!view) {
          var classType = parseClassType(model.type);
          var Clazz = isComponent ? ComponentView.getClass(classType.main, classType.sub) : // FIXME:TS
          // (ChartView as ChartViewConstructor).getClass('series', classType.sub)
          // For backward compat, still support a chart type declared as only subType
          // like "liquidfill", but recommend "series.liquidfill"
          // But need a base class to make a type series.
          ChartView.getClass(classType.sub);

          view = new Clazz();
          view.init(ecModel, api);
          viewMap[viewId] = view;
          viewList.push(view);
          zr.add(view.group);
        }

        model.__viewId = view.__id = viewId;
        view.__alive = true;
        view.__model = model;
        view.group.__ecComponentInfo = {
          mainType: model.mainType,
          index: model.componentIndex
        };
        !isComponent && scheduler.prepareView(view, model, ecModel, api);
      }

      for (var i = 0; i < viewList.length;) {
        var view = viewList[i];

        if (!view.__alive) {
          !isComponent && view.renderTask.dispose();
          zr.remove(view.group);
          view.dispose(ecModel, api);
          viewList.splice(i, 1);

          if (viewMap[view.__id] === view) {
            delete viewMap[view.__id];
          }

          view.__id = view.group.__ecComponentInfo = null;
        } else {
          i++;
        }
      }
    };

    updateDirectly = function (ecIns, method, payload, mainType, subType) {
      var ecModel = ecIns._model;
      ecModel.setUpdatePayload(payload); // broadcast

      if (!mainType) {
        // FIXME
        // Chart will not be update directly here, except set dirty.
        // But there is no such scenario now.
        each([].concat(ecIns._componentsViews).concat(ecIns._chartsViews), callView);
        return;
      }

      var query = {};
      query[mainType + 'Id'] = payload[mainType + 'Id'];
      query[mainType + 'Index'] = payload[mainType + 'Index'];
      query[mainType + 'Name'] = payload[mainType + 'Name'];
      var condition = {
        mainType: mainType,
        query: query
      };
      subType && (condition.subType = subType); // subType may be '' by parseClassType;

      var excludeSeriesId = payload.excludeSeriesId;
      var excludeSeriesIdMap;

      if (excludeSeriesId != null) {
        excludeSeriesIdMap = createHashMap();
        each(normalizeToArray(excludeSeriesId), function (id) {
          var modelId = convertOptionIdName(id, null);

          if (modelId != null) {
            excludeSeriesIdMap.set(modelId, true);
          }
        });
      } // If dispatchAction before setOption, do nothing.


      ecModel && ecModel.eachComponent(condition, function (model) {
        if (!excludeSeriesIdMap || excludeSeriesIdMap.get(model.id) == null) {
          if (isHighDownPayload(payload) && !payload.notBlur) {
            if (model instanceof SeriesModel) {
              toggleSeriesBlurStateFromPayload(model, payload, ecIns._api);
            }
          } else if (isSelectChangePayload(payload)) {
            // TODO geo
            if (model instanceof SeriesModel) {
              toggleSelectionFromPayload(model, payload, ecIns._api);
              updateSeriesElementSelection(model);
              markStatusToUpdate(ecIns);
            }
          }

          callView(ecIns[mainType === 'series' ? '_chartsMap' : '_componentsMap'][model.__viewId]);
        }
      }, ecIns);

      function callView(view) {
        view && view.__alive && view[method] && view[method](view.__model, ecModel, ecIns._api, payload);
      }
    };

    updateMethods = {
      prepareAndUpdate: function (payload) {
        prepare(this);
        updateMethods.update.call(this, payload);
      },
      update: function (payload) {
        // console.profile && console.profile('update');
        var ecModel = this._model;
        var api = this._api;
        var zr = this._zr;
        var coordSysMgr = this._coordSysMgr;
        var scheduler = this._scheduler; // update before setOption

        if (!ecModel) {
          return;
        }

        ecModel.setUpdatePayload(payload);
        scheduler.restoreData(ecModel, payload);
        scheduler.performSeriesTasks(ecModel); // TODO
        // Save total ecModel here for undo/redo (after restoring data and before processing data).
        // Undo (restoration of total ecModel) can be carried out in 'action' or outside API call.
        // Create new coordinate system each update
        // In LineView may save the old coordinate system and use it to get the orignal point

        coordSysMgr.create(ecModel, api);
        scheduler.performDataProcessorTasks(ecModel, payload); // Current stream render is not supported in data process. So we can update
        // stream modes after data processing, where the filtered data is used to
        // deteming whether use progressive rendering.

        updateStreamModes(this, ecModel); // We update stream modes before coordinate system updated, then the modes info
        // can be fetched when coord sys updating (consider the barGrid extent fix). But
        // the drawback is the full coord info can not be fetched. Fortunately this full
        // coord is not requied in stream mode updater currently.

        coordSysMgr.update(ecModel, api);
        clearColorPalette(ecModel);
        scheduler.performVisualTasks(ecModel, payload);
        render(this, ecModel, api, payload); // Set background

        var backgroundColor = ecModel.get('backgroundColor') || 'transparent';
        var darkMode = ecModel.get('darkMode'); // In IE8

        if (!env.canvasSupported) {
          var colorArr = parse(backgroundColor);
          backgroundColor = stringify(colorArr, 'rgb');

          if (colorArr[3] === 0) {
            backgroundColor = 'transparent';
          }
        } else {
          zr.setBackgroundColor(backgroundColor); // Force set dark mode.

          if (darkMode != null && darkMode !== 'auto') {
            zr.setDarkMode(darkMode);
          }
        }

        performPostUpdateFuncs(ecModel, api); // console.profile && console.profileEnd('update');
      },
      updateTransform: function (payload) {
        var _this = this;

        var ecModel = this._model;
        var api = this._api; // update before setOption

        if (!ecModel) {
          return;
        }

        ecModel.setUpdatePayload(payload); // ChartView.markUpdateMethod(payload, 'updateTransform');

        var componentDirtyList = [];
        ecModel.eachComponent(function (componentType, componentModel) {
          if (componentType === 'series') {
            return;
          }

          var componentView = _this.getViewOfComponentModel(componentModel);

          if (componentView && componentView.__alive) {
            if (componentView.updateTransform) {
              var result = componentView.updateTransform(componentModel, ecModel, api, payload);
              result && result.update && componentDirtyList.push(componentView);
            } else {
              componentDirtyList.push(componentView);
            }
          }
        });
        var seriesDirtyMap = createHashMap();
        ecModel.eachSeries(function (seriesModel) {
          var chartView = _this._chartsMap[seriesModel.__viewId];

          if (chartView.updateTransform) {
            var result = chartView.updateTransform(seriesModel, ecModel, api, payload);
            result && result.update && seriesDirtyMap.set(seriesModel.uid, 1);
          } else {
            seriesDirtyMap.set(seriesModel.uid, 1);
          }
        });
        clearColorPalette(ecModel); // Keep pipe to the exist pipeline because it depends on the render task of the full pipeline.
        // this._scheduler.performVisualTasks(ecModel, payload, 'layout', true);

        this._scheduler.performVisualTasks(ecModel, payload, {
          setDirty: true,
          dirtyMap: seriesDirtyMap
        }); // Currently, not call render of components. Geo render cost a lot.
        // renderComponents(ecIns, ecModel, api, payload, componentDirtyList);


        renderSeries(this, ecModel, api, payload, seriesDirtyMap);
        performPostUpdateFuncs(ecModel, this._api);
      },
      updateView: function (payload) {
        var ecModel = this._model; // update before setOption

        if (!ecModel) {
          return;
        }

        ecModel.setUpdatePayload(payload);
        ChartView.markUpdateMethod(payload, 'updateView');
        clearColorPalette(ecModel); // Keep pipe to the exist pipeline because it depends on the render task of the full pipeline.

        this._scheduler.performVisualTasks(ecModel, payload, {
          setDirty: true
        });

        render(this, this._model, this._api, payload);
        performPostUpdateFuncs(ecModel, this._api);
      },
      updateVisual: function (payload) {
        // updateMethods.update.call(this, payload);
        var _this = this;

        var ecModel = this._model; // update before setOption

        if (!ecModel) {
          return;
        }

        ecModel.setUpdatePayload(payload); // clear all visual

        ecModel.eachSeries(function (seriesModel) {
          seriesModel.getData().clearAllVisual();
        }); // Perform visual

        ChartView.markUpdateMethod(payload, 'updateVisual');
        clearColorPalette(ecModel); // Keep pipe to the exist pipeline because it depends on the render task of the full pipeline.

        this._scheduler.performVisualTasks(ecModel, payload, {
          visualType: 'visual',
          setDirty: true
        });

        ecModel.eachComponent(function (componentType, componentModel) {
          if (componentType !== 'series') {
            var componentView = _this.getViewOfComponentModel(componentModel);

            componentView && componentView.__alive && componentView.updateVisual(componentModel, ecModel, _this._api, payload);
          }
        });
        ecModel.eachSeries(function (seriesModel) {
          var chartView = _this._chartsMap[seriesModel.__viewId];
          chartView.updateVisual(seriesModel, ecModel, _this._api, payload);
        });
        performPostUpdateFuncs(ecModel, this._api);
      },
      updateLayout: function (payload) {
        updateMethods.update.call(this, payload);
      }
    };

    doConvertPixel = function (ecIns, methodName, finder, value) {
      if (ecIns._disposed) {
        disposedWarning(ecIns.id);
        return;
      }

      var ecModel = ecIns._model;

      var coordSysList = ecIns._coordSysMgr.getCoordinateSystems();

      var result;
      var parsedFinder = parseFinder(ecModel, finder);

      for (var i = 0; i < coordSysList.length; i++) {
        var coordSys = coordSysList[i];

        if (coordSys[methodName] && (result = coordSys[methodName](ecModel, parsedFinder, value)) != null) {
          return result;
        }
      }
    };

    updateStreamModes = function (ecIns, ecModel) {
      var chartsMap = ecIns._chartsMap;
      var scheduler = ecIns._scheduler;
      ecModel.eachSeries(function (seriesModel) {
        scheduler.updateStreamModes(seriesModel, chartsMap[seriesModel.__viewId]);
      });
    };

    doDispatchAction = function (payload, silent) {
      var _this = this;

      var ecModel = this.getModel();
      var payloadType = payload.type;
      var escapeConnect = payload.escapeConnect;
      var actionWrap = actions[payloadType];
      var actionInfo = actionWrap.actionInfo;
      var cptTypeTmp = (actionInfo.update || 'update').split(':');
      var updateMethod = cptTypeTmp.pop();
      var cptType = cptTypeTmp[0] != null && parseClassType(cptTypeTmp[0]);
      this[IN_MAIN_PROCESS_KEY] = true;
      var payloads = [payload];
      var batched = false; // Batch action

      if (payload.batch) {
        batched = true;
        payloads = map(payload.batch, function (item) {
          item = defaults(extend({}, item), payload);
          item.batch = null;
          return item;
        });
      }

      var eventObjBatch = [];
      var eventObj;
      var isSelectChange = isSelectChangePayload(payload);
      var isStatusChange = isHighDownPayload(payload) || isSelectChange;
      each(payloads, function (batchItem) {
        // Action can specify the event by return it.
        eventObj = actionWrap.action(batchItem, _this._model, _this._api); // Emit event outside

        eventObj = eventObj || extend({}, batchItem); // Convert type to eventType

        eventObj.type = actionInfo.event || eventObj.type;
        eventObjBatch.push(eventObj); // light update does not perform data process, layout and visual.

        if (isStatusChange) {
          // method, payload, mainType, subType
          updateDirectly(_this, updateMethod, batchItem, 'series'); // Mark status to update

          markStatusToUpdate(_this);
        } else if (cptType) {
          updateDirectly(_this, updateMethod, batchItem, cptType.main, cptType.sub);
        }
      });

      if (updateMethod !== 'none' && !isStatusChange && !cptType) {
        // Still dirty
        if (this[OPTION_UPDATED_KEY]) {
          prepare(this);
          updateMethods.update.call(this, payload);
          this[OPTION_UPDATED_KEY] = false;
        } else {
          updateMethods[updateMethod].call(this, payload);
        }
      } // Follow the rule of action batch


      if (batched) {
        eventObj = {
          type: actionInfo.event || payloadType,
          escapeConnect: escapeConnect,
          batch: eventObjBatch
        };
      } else {
        eventObj = eventObjBatch[0];
      }

      this[IN_MAIN_PROCESS_KEY] = false;

      if (!silent) {
        var messageCenter = this._messageCenter;
        messageCenter.trigger(eventObj.type, eventObj); // Extra triggered 'selectchanged' event

        if (isSelectChange) {
          var newObj = {
            type: 'selectchanged',
            escapeConnect: escapeConnect,
            selected: getAllSelectedIndices(ecModel),
            isFromClick: payload.isFromClick || false,
            fromAction: payload.type,
            fromActionPayload: payload
          };
          messageCenter.trigger(newObj.type, newObj);
        }
      }
    };

    flushPendingActions = function (silent) {
      var pendingActions = this._pendingActions;

      while (pendingActions.length) {
        var payload = pendingActions.shift();
        doDispatchAction.call(this, payload, silent);
      }
    };

    triggerUpdatedEvent = function (silent) {
      !silent && this.trigger('updated');
    };
    /**
     * Event `rendered` is triggered when zr
     * rendered. It is useful for realtime
     * snapshot (reflect animation).
     *
     * Event `finished` is triggered when:
     * (1) zrender rendering finished.
     * (2) initial animation finished.
     * (3) progressive rendering finished.
     * (4) no pending action.
     * (5) no delayed setOption needs to be processed.
     */


    bindRenderedEvent = function (zr, ecIns) {
      zr.on('rendered', function (params) {
        ecIns.trigger('rendered', params); // The `finished` event should not be triggered repeatly,
        // so it should only be triggered when rendering indeed happend
        // in zrender. (Consider the case that dipatchAction is keep
        // triggering when mouse move).

        if ( // Although zr is dirty if initial animation is not finished
        // and this checking is called on frame, we also check
        // animation finished for robustness.
        zr.animation.isFinished() && !ecIns[OPTION_UPDATED_KEY] && !ecIns._scheduler.unfinished && !ecIns._pendingActions.length) {
          ecIns.trigger('finished');
        }
      });
    };

    bindMouseEvent = function (zr, ecIns) {
      zr.on('mouseover', function (e) {
        var el = e.target;
        var dispatcher = findEventDispatcher(el, isHighDownDispatcher);

        if (dispatcher) {
          var ecData = getECData(dispatcher); // Try blur all in the related series. Then emphasis the hoverred.
          // TODO. progressive mode.

          toggleSeriesBlurState(ecData.seriesIndex, ecData.focus, ecData.blurScope, ecIns._api, true);
          enterEmphasisWhenMouseOver(dispatcher, e);
          markStatusToUpdate(ecIns);
        }
      }).on('mouseout', function (e) {
        var el = e.target;
        var dispatcher = findEventDispatcher(el, isHighDownDispatcher);

        if (dispatcher) {
          var ecData = getECData(dispatcher);
          toggleSeriesBlurState(ecData.seriesIndex, ecData.focus, ecData.blurScope, ecIns._api, false);
          leaveEmphasisWhenMouseOut(dispatcher, e);
          markStatusToUpdate(ecIns);
        }
      }).on('click', function (e) {
        var el = e.target;
        var dispatcher = findEventDispatcher(el, function (target) {
          return getECData(target).dataIndex != null;
        }, true);

        if (dispatcher) {
          var actionType = dispatcher.selected ? 'unselect' : 'select';
          var ecData = getECData(dispatcher);

          ecIns._api.dispatchAction({
            type: actionType,
            dataType: ecData.dataType,
            dataIndexInside: ecData.dataIndex,
            seriesIndex: ecData.seriesIndex,
            isFromClick: true
          });
        }
      });
    };

    clearColorPalette = function (ecModel) {
      ecModel.clearColorPalette();
      ecModel.eachSeries(function (seriesModel) {
        seriesModel.clearColorPalette();
      });
    };

    render = function (ecIns, ecModel, api, payload) {
      renderComponents(ecIns, ecModel, api, payload);
      each(ecIns._chartsViews, function (chart) {
        chart.__alive = false;
      });
      renderSeries(ecIns, ecModel, api, payload); // Remove groups of unrendered charts

      each(ecIns._chartsViews, function (chart) {
        if (!chart.__alive) {
          chart.remove(ecModel, api);
        }
      });
    };

    renderComponents = function (ecIns, ecModel, api, payload, dirtyList) {
      each(dirtyList || ecIns._componentsViews, function (componentView) {
        var componentModel = componentView.__model;
        clearStates(componentModel, componentView);
        componentView.render(componentModel, ecModel, api, payload);
        updateZ(componentModel, componentView);
        updateStates(componentModel, componentView);
      });
    };
    /**
     * Render each chart and component
     */


    renderSeries = function (ecIns, ecModel, api, payload, dirtyMap) {
      // Render all charts
      var scheduler = ecIns._scheduler;
      var labelManager = ecIns._labelManager;
      labelManager.clearLabels();
      var unfinished = false;
      ecModel.eachSeries(function (seriesModel) {
        var chartView = ecIns._chartsMap[seriesModel.__viewId];
        chartView.__alive = true;
        var renderTask = chartView.renderTask;
        scheduler.updatePayload(renderTask, payload); // TODO states on marker.

        clearStates(seriesModel, chartView);

        if (dirtyMap && dirtyMap.get(seriesModel.uid)) {
          renderTask.dirty();
        }

        if (renderTask.perform(scheduler.getPerformArgs(renderTask))) {
          unfinished = true;
        }

        seriesModel.__transientTransitionOpt = null;
        chartView.group.silent = !!seriesModel.get('silent'); // Should not call markRedraw on group, because it will disable zrender
        // increamental render (alway render from the __startIndex each frame)
        // chartView.group.markRedraw();

        updateBlend(seriesModel, chartView);
        updateSeriesElementSelection(seriesModel); // Add labels.

        labelManager.addLabelsOfSeries(chartView);
      });
      scheduler.unfinished = unfinished || scheduler.unfinished;
      labelManager.updateLayoutConfig(api);
      labelManager.layout(api);
      labelManager.processLabelsOverall();
      ecModel.eachSeries(function (seriesModel) {
        var chartView = ecIns._chartsMap[seriesModel.__viewId]; // Update Z after labels updated. Before applying states.

        updateZ(seriesModel, chartView); // NOTE: Update states after label is updated.
        // label should be in normal status when layouting.

        updateStates(seriesModel, chartView);
      }); // If use hover layer

      updateHoverLayerStatus(ecIns, ecModel);
    };

    performPostUpdateFuncs = function (ecModel, api) {
      each(postUpdateFuncs, function (func) {
        func(ecModel, api);
      });
    };

    markStatusToUpdate = function (ecIns) {
      ecIns[STATUS_NEEDS_UPDATE_KEY] = true; // Wake up zrender if it's sleep. Let it update states in the next frame.

      ecIns.getZr().wakeUp();
    };

    applyChangedStates = function (ecIns) {
      if (!ecIns[STATUS_NEEDS_UPDATE_KEY]) {
        return;
      }

      ecIns.getZr().storage.traverse(function (el) {
        // Not applied on removed elements, it may still in fading.
        if (isElementRemoved(el)) {
          return;
        }

        applyElementStates(el);
      });
      ecIns[STATUS_NEEDS_UPDATE_KEY] = false;
    };

    function applyElementStates(el) {
      var newStates = [];
      var oldStates = el.currentStates; // Keep other states.

      for (var i = 0; i < oldStates.length; i++) {
        var stateName = oldStates[i];

        if (!(stateName === 'emphasis' || stateName === 'blur' || stateName === 'select')) {
          newStates.push(stateName);
        }
      } // Only use states when it's exists.


      if (el.selected && el.states.select) {
        newStates.push('select');
      }

      if (el.hoverState === HOVER_STATE_EMPHASIS && el.states.emphasis) {
        newStates.push('emphasis');
      } else if (el.hoverState === HOVER_STATE_BLUR && el.states.blur) {
        newStates.push('blur');
      }

      el.useStates(newStates);
    }

    function updateHoverLayerStatus(ecIns, ecModel) {
      var zr = ecIns._zr;
      var storage = zr.storage;
      var elCount = 0;
      storage.traverse(function (el) {
        if (!el.isGroup) {
          elCount++;
        }
      });

      if (elCount > ecModel.get('hoverLayerThreshold') && !env.node && !env.worker) {
        ecModel.eachSeries(function (seriesModel) {
          if (seriesModel.preventUsingHoverLayer) {
            return;
          }

          var chartView = ecIns._chartsMap[seriesModel.__viewId];

          if (chartView.__alive) {
            chartView.group.traverse(function (el) {
              if (el.states.emphasis) {
                el.states.emphasis.hoverLayer = true;
              }
            });
          }
        });
      }
    }
    /**
     * Update chart and blend.
     */

    function updateBlend(seriesModel, chartView) {
      var blendMode = seriesModel.get('blendMode') || null;

      chartView.group.traverse(function (el) {
        // FIXME marker and other components
        if (!el.isGroup) {
          // DONT mark the element dirty. In case element is incremental and don't wan't to rerender.
          el.style.blend = blendMode;
        }

        if (el.eachPendingDisplayable) {
          el.eachPendingDisplayable(function (displayable) {
            displayable.style.blend = blendMode;
          });
        }
      });
    }

    function updateZ(model, view) {
      if (model.preventAutoZ) {
        return;
      }

      var z = model.get('z');
      var zlevel = model.get('zlevel'); // Set z and zlevel

      view.group.traverse(function (el) {
        if (!el.isGroup) {
          z != null && (el.z = z);
          zlevel != null && (el.zlevel = zlevel); // TODO if textContent is on group.

          var label = el.getTextContent();
          var labelLine = el.getTextGuideLine();

          if (label) {
            label.z = el.z;
            label.zlevel = el.zlevel; // lift z2 of text content
            // TODO if el.emphasis.z2 is spcefied, what about textContent.

            label.z2 = el.z2 + 2;
          }

          if (labelLine) {
            var showAbove = el.textGuideLineConfig && el.textGuideLineConfig.showAbove;
            labelLine.z = el.z;
            labelLine.zlevel = el.zlevel;
            labelLine.z2 = el.z2 + (showAbove ? 1 : -1);
          }
        }
      });
    }
    // TODO States on component.

    function clearStates(model, view) {
      view.group.traverse(function (el) {
        // Not applied on removed elements, it may still in fading.
        if (isElementRemoved(el)) {
          return;
        }

        var textContent = el.getTextContent();
        var textGuide = el.getTextGuideLine();

        if (el.stateTransition) {
          el.stateTransition = null;
        }

        if (textContent && textContent.stateTransition) {
          textContent.stateTransition = null;
        }

        if (textGuide && textGuide.stateTransition) {
          textGuide.stateTransition = null;
        } // TODO If el is incremental.


        if (el.hasState()) {
          el.prevStates = el.currentStates;
          el.clearStates();
        } else if (el.prevStates) {
          el.prevStates = null;
        }
      });
    }

    function updateStates(model, view) {
      var stateAnimationModel = model.getModel('stateAnimation');
      var enableAnimation = model.isAnimationEnabled();
      var duration = stateAnimationModel.get('duration');
      var stateTransition = duration > 0 ? {
        duration: duration,
        delay: stateAnimationModel.get('delay'),
        easing: stateAnimationModel.get('easing') // additive: stateAnimationModel.get('additive')

      } : null;
      view.group.traverse(function (el) {
        if (el.states && el.states.emphasis) {
          // Not applied on removed elements, it may still in fading.
          if (isElementRemoved(el)) {
            return;
          }

          if (el instanceof Path) {
            savePathStates(el);
          } // Only updated on changed element. In case element is incremental and don't wan't to rerender.
          // TODO, a more proper way?


          if (el.__dirty) {
            var prevStates = el.prevStates; // Restore states without animation

            if (prevStates) {
              el.useStates(prevStates);
            }
          } // Update state transition and enable animation again.


          if (enableAnimation) {
            el.stateTransition = stateTransition;
            var textContent = el.getTextContent();
            var textGuide = el.getTextGuideLine(); // TODO Is it necessary to animate label?

            if (textContent) {
              textContent.stateTransition = stateTransition;
            }

            if (textGuide) {
              textGuide.stateTransition = stateTransition;
            }
          } // The use higlighted and selected flag to toggle states.


          if (el.__dirty) {
            applyElementStates(el);
          }
        }
      });
    }

    createExtensionAPI = function (ecIns) {
      return new (
      /** @class */
      function (_super) {
        __extends(class_1, _super);

        function class_1() {
          return _super !== null && _super.apply(this, arguments) || this;
        }

        class_1.prototype.getCoordinateSystems = function () {
          return ecIns._coordSysMgr.getCoordinateSystems();
        };

        class_1.prototype.getComponentByElement = function (el) {
          while (el) {
            var modelInfo = el.__ecComponentInfo;

            if (modelInfo != null) {
              return ecIns._model.getComponent(modelInfo.mainType, modelInfo.index);
            }

            el = el.parent;
          }
        };

        class_1.prototype.enterEmphasis = function (el, highlightDigit) {
          enterEmphasis(el, highlightDigit);
          markStatusToUpdate(ecIns);
        };

        class_1.prototype.leaveEmphasis = function (el, highlightDigit) {
          leaveEmphasis(el, highlightDigit);
          markStatusToUpdate(ecIns);
        };

        class_1.prototype.enterBlur = function (el) {
          enterBlur(el);
          markStatusToUpdate(ecIns);
        };

        class_1.prototype.leaveBlur = function (el) {
          leaveBlur(el);
          markStatusToUpdate(ecIns);
        };

        class_1.prototype.enterSelect = function (el) {
          enterSelect(el);
          markStatusToUpdate(ecIns);
        };

        class_1.prototype.leaveSelect = function (el) {
          leaveSelect(el);
          markStatusToUpdate(ecIns);
        };

        class_1.prototype.getModel = function () {
          return ecIns.getModel();
        };

        class_1.prototype.getViewOfComponentModel = function (componentModel) {
          return ecIns.getViewOfComponentModel(componentModel);
        };

        class_1.prototype.getViewOfSeriesModel = function (seriesModel) {
          return ecIns.getViewOfSeriesModel(seriesModel);
        };

        return class_1;
      }(ExtensionAPI))(ecIns);
    };

    enableConnect = function (chart) {
      function updateConnectedChartsStatus(charts, status) {
        for (var i = 0; i < charts.length; i++) {
          var otherChart = charts[i];
          otherChart[CONNECT_STATUS_KEY] = status;
        }
      }

      each(eventActionMap, function (actionType, eventType) {
        chart._messageCenter.on(eventType, function (event) {
          if (connectedGroups[chart.group] && chart[CONNECT_STATUS_KEY] !== CONNECT_STATUS_PENDING) {
            if (event && event.escapeConnect) {
              return;
            }

            var action_1 = chart.makeActionFromEvent(event);
            var otherCharts_1 = [];
            each(instances, function (otherChart) {
              if (otherChart !== chart && otherChart.group === chart.group) {
                otherCharts_1.push(otherChart);
              }
            });
            updateConnectedChartsStatus(otherCharts_1, CONNECT_STATUS_PENDING);
            each(otherCharts_1, function (otherChart) {
              if (otherChart[CONNECT_STATUS_KEY] !== CONNECT_STATUS_UPDATING) {
                otherChart.dispatchAction(action_1);
              }
            });
            updateConnectedChartsStatus(otherCharts_1, CONNECT_STATUS_UPDATED);
          }
        });
      });
    };

    setTransitionOpt = function (chart, transitionOpt) {
      var ecModel = chart._model;
      each$2(normalizeToArray(transitionOpt), function (transOpt) {
        var errMsg;
        var fromOpt = transOpt.from;
        var toOpt = transOpt.to;

        if (toOpt == null) {

          throwError(errMsg);
        }

        var finderOpt = {
          includeMainTypes: ['series'],
          enableAll: false,
          enableNone: false
        };
        var fromResult = fromOpt ? parseFinder(ecModel, fromOpt, finderOpt) : null;
        var toResult = parseFinder(ecModel, toOpt, finderOpt);
        var toSeries = toResult.seriesModel;

        if (toSeries == null) {
          errMsg = '';
        }

        if (fromResult && fromResult.seriesModel !== toSeries) {
          errMsg = '';
        }

        if (errMsg != null) {
          throwError(errMsg);
        } // Just a temp solution: mount them on series.


        toSeries.__transientTransitionOpt = {
          from: fromOpt ? fromOpt.dimension : null,
          to: toOpt.dimension,
          dividingMethod: transOpt.dividingMethod
        };
      });
    };
  }();

  return ECharts;
}(Eventful);

var echartsProto = ECharts.prototype;
echartsProto.on = createRegisterEventWithLowercaseECharts('on');
echartsProto.off = createRegisterEventWithLowercaseECharts('off');
/**
 * @deprecated
 */
// @ts-ignore

echartsProto.one = function (eventName, cb, ctx) {
  var self = this;

  function wrapped() {
    var args2 = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      args2[_i] = arguments[_i];
    }

    cb && cb.apply && cb.apply(this, args2); // @ts-ignore

    self.off(eventName, wrapped);
  }

  this.on.call(this, eventName, wrapped, ctx);
}; // /**
//  * Encode visual infomation from data after data processing
//  *
//  * @param {module:echarts/model/Global} ecModel
//  * @param {object} layout
//  * @param {boolean} [layoutFilter] `true`: only layout,
//  *                                 `false`: only not layout,
//  *                                 `null`/`undefined`: all.
//  * @param {string} taskBaseTag
//  * @private
//  */
// function startVisualEncoding(ecIns, ecModel, api, payload, layoutFilter) {
//     each(visualFuncs, function (visual, index) {
//         let isLayout = visual.isLayout;
//         if (layoutFilter == null
//             || (layoutFilter === false && !isLayout)
//             || (layoutFilter === true && isLayout)
//         ) {
//             visual.func(ecModel, api, payload);
//         }
//     });
// }


var MOUSE_EVENT_NAMES = ['click', 'dblclick', 'mouseover', 'mouseout', 'mousemove', 'mousedown', 'mouseup', 'globalout', 'contextmenu'];

function disposedWarning(id) {
}

var actions = {};
/**
 * Map eventType to actionType
 */

var eventActionMap = {};
var dataProcessorFuncs = [];
var optionPreprocessorFuncs = [];
var postInitFuncs = [];
var postUpdateFuncs = [];
var visualFuncs = [];
var themeStorage = {};
var loadingEffects = {};
var instances = {};
var connectedGroups = {};
var idBase = +new Date() - 0;
var groupIdBase = +new Date() - 0;
var DOM_ATTRIBUTE_KEY = '_echarts_instance_';
/**
 * @param opts.devicePixelRatio Use window.devicePixelRatio by default
 * @param opts.renderer Can choose 'canvas' or 'svg' to render the chart.
 * @param opts.width Use clientWidth of the input `dom` by default.
 *        Can be 'auto' (the same as null/undefined)
 * @param opts.height Use clientHeight of the input `dom` by default.
 *        Can be 'auto' (the same as null/undefined)
 */

function init(dom, theme, opts) {

  var existInstance = getInstanceByDom(dom);

  if (existInstance) {

    return existInstance;
  }

  var chart = new ECharts(dom, theme, opts);
  chart.id = 'ec_' + idBase++;
  instances[chart.id] = chart;
  setAttribute(dom, DOM_ATTRIBUTE_KEY, chart.id);
  enableConnect(chart);
  each(postInitFuncs, function (postInitFunc) {
    postInitFunc(chart);
  });
  return chart;
}
/**
 * @usage
 * (A)
 * ```js
 * let chart1 = echarts.init(dom1);
 * let chart2 = echarts.init(dom2);
 * chart1.group = 'xxx';
 * chart2.group = 'xxx';
 * echarts.connect('xxx');
 * ```
 * (B)
 * ```js
 * let chart1 = echarts.init(dom1);
 * let chart2 = echarts.init(dom2);
 * echarts.connect('xxx', [chart1, chart2]);
 * ```
 */

function connect(groupId) {
  // Is array of charts
  if (isArray(groupId)) {
    var charts = groupId;
    groupId = null; // If any chart has group

    each(charts, function (chart) {
      if (chart.group != null) {
        groupId = chart.group;
      }
    });
    groupId = groupId || 'g_' + groupIdBase++;
    each(charts, function (chart) {
      chart.group = groupId;
    });
  }

  connectedGroups[groupId] = true;
  return groupId;
}
/**
 * @deprecated
 */

function disConnect(groupId) {
  connectedGroups[groupId] = false;
}
/**
 * Alias and backword compat
 */

var disconnect = disConnect;
/**
 * Dispose a chart instance
 */

function dispose(chart) {
  if (typeof chart === 'string') {
    chart = instances[chart];
  } else if (!(chart instanceof ECharts)) {
    // Try to treat as dom
    chart = getInstanceByDom(chart);
  }

  if (chart instanceof ECharts && !chart.isDisposed()) {
    chart.dispose();
  }
}
function getInstanceByDom(dom) {
  return instances[getAttribute(dom, DOM_ATTRIBUTE_KEY)];
}
function getInstanceById(key) {
  return instances[key];
}
/**
 * Register theme
 */

function registerTheme(name, theme) {
  themeStorage[name] = theme;
}
/**
 * Register option preprocessor
 */

function registerPreprocessor(preprocessorFunc) {
  if (indexOf(optionPreprocessorFuncs, preprocessorFunc) < 0) {
    optionPreprocessorFuncs.push(preprocessorFunc);
  }
}
function registerProcessor(priority, processor) {
  normalizeRegister(dataProcessorFuncs, priority, processor, PRIORITY_PROCESSOR_DEFAULT);
}
/**
 * Register postIniter
 * @param {Function} postInitFunc
 */

function registerPostInit(postInitFunc) {
  if (indexOf(postInitFuncs, postInitFunc) < 0) {
    postInitFunc && postInitFuncs.push(postInitFunc);
  }
}
/**
 * Register postUpdater
 * @param {Function} postUpdateFunc
 */

function registerPostUpdate(postUpdateFunc) {
  if (indexOf(postUpdateFuncs, postUpdateFunc) < 0) {
    postUpdateFunc && postUpdateFuncs.push(postUpdateFunc);
  }
}
function registerAction(actionInfo, eventName, action) {
  if (typeof eventName === 'function') {
    action = eventName;
    eventName = '';
  }

  var actionType = isObject(actionInfo) ? actionInfo.type : [actionInfo, actionInfo = {
    event: eventName
  }][0]; // Event name is all lowercase

  actionInfo.event = (actionInfo.event || actionType).toLowerCase();
  eventName = actionInfo.event;

  if (eventActionMap[eventName]) {
    // Already registered.
    return;
  } // Validate action type and event name.


  assert(ACTION_REG.test(actionType) && ACTION_REG.test(eventName));

  if (!actions[actionType]) {
    actions[actionType] = {
      action: action,
      actionInfo: actionInfo
    };
  }

  eventActionMap[eventName] = actionType;
}
function registerCoordinateSystem(type, coordSysCreator) {
  CoordinateSystemManager.register(type, coordSysCreator);
}
/**
 * Get dimensions of specified coordinate system.
 * @param {string} type
 * @return {Array.<string|Object>}
 */

function getCoordinateSystemDimensions(type) {
  var coordSysCreator = CoordinateSystemManager.get(type);

  if (coordSysCreator) {
    return coordSysCreator.getDimensionsInfo ? coordSysCreator.getDimensionsInfo() : coordSysCreator.dimensions.slice();
  }
}

function registerLayout(priority, layoutTask) {
  normalizeRegister(visualFuncs, priority, layoutTask, PRIORITY_VISUAL_LAYOUT, 'layout');
}

function registerVisual(priority, visualTask) {
  normalizeRegister(visualFuncs, priority, visualTask, PRIORITY_VISUAL_CHART, 'visual');
}
var registeredTasks = [];

function normalizeRegister(targetList, priority, fn, defaultPriority, visualType) {
  if (isFunction(priority) || isObject(priority)) {
    fn = priority;
    priority = defaultPriority;
  }


  if (indexOf(registeredTasks, fn) >= 0) {
    return;
  }

  registeredTasks.push(fn);
  var stageHandler = Scheduler.wrapStageHandler(fn, visualType);
  stageHandler.__prio = priority;
  stageHandler.__raw = fn;
  targetList.push(stageHandler);
}

function registerLoading(name, loadingFx) {
  loadingEffects[name] = loadingFx;
}
/**
 * ZRender need a canvas context to do measureText.
 * But in node environment canvas may be created by node-canvas.
 * So we need to specify how to create a canvas instead of using document.createElement('canvas')
 *
 * Be careful of using it in the browser.
 *
 * @example
 *     let Canvas = require('canvas');
 *     let echarts = require('echarts');
 *     echarts.setCanvasCreator(function () {
 *         // Small size is enough.
 *         return new Canvas(32, 32);
 *     });
 */

function setCanvasCreator(creator) {
  $override('createCanvas', creator);
}
/**
 * The parameters and usage: see `mapDataStorage.registerMap`.
 * Compatible with previous `echarts.registerMap`.
 */

function registerMap(mapName, geoJson, specialAreas) {
  mapDataStorage.registerMap(mapName, geoJson, specialAreas);
}
function getMap(mapName) {
  // For backward compatibility, only return the first one.
  var records = mapDataStorage.retrieveMap(mapName); // FIXME support SVG, where return not only records[0].

  return records && records[0] && {
    // @ts-ignore
    geoJson: records[0].geoJSON,
    specialAreas: records[0].specialAreas
  };
}
var registerTransform = registerExternalTransform;
/**
 * Globa dispatchAction to a specified chart instance.
 */
// export function dispatchAction(payload: { chartId: string } & Payload, opt?: Parameters<ECharts['dispatchAction']>[1]) {
//     if (!payload || !payload.chartId) {
//         // Must have chartId to find chart
//         return;
//     }
//     const chart = instances[payload.chartId];
//     if (chart) {
//         chart.dispatchAction(payload, opt);
//     }
// }
// Buitlin global visual

registerVisual(PRIORITY_VISUAL_GLOBAL, seriesStyleTask);
registerVisual(PRIORITY_VISUAL_CHART_DATA_CUSTOM, dataStyleTask);
registerVisual(PRIORITY_VISUAL_CHART_DATA_CUSTOM, dataColorPaletteTask);
registerVisual(PRIORITY_VISUAL_GLOBAL, seriesSymbolTask);
registerVisual(PRIORITY_VISUAL_CHART_DATA_CUSTOM, dataSymbolTask);
registerVisual(PRIORITY_VISUAL_DECAL, decalVisual);
registerPreprocessor(globalBackwardCompat);
registerProcessor(PRIORITY_PROCESSOR_DATASTACK, dataStack);
registerLoading('default', defaultLoading); // Default actions

registerAction({
  type: HIGHLIGHT_ACTION_TYPE,
  event: HIGHLIGHT_ACTION_TYPE,
  update: HIGHLIGHT_ACTION_TYPE
}, noop);
registerAction({
  type: DOWNPLAY_ACTION_TYPE,
  event: DOWNPLAY_ACTION_TYPE,
  update: DOWNPLAY_ACTION_TYPE
}, noop);
registerAction({
  type: SELECT_ACTION_TYPE,
  event: SELECT_ACTION_TYPE,
  update: SELECT_ACTION_TYPE
}, noop);
registerAction({
  type: UNSELECT_ACTION_TYPE,
  event: UNSELECT_ACTION_TYPE,
  update: UNSELECT_ACTION_TYPE
}, noop);
registerAction({
  type: TOGGLE_SELECT_ACTION_TYPE,
  event: TOGGLE_SELECT_ACTION_TYPE,
  update: TOGGLE_SELECT_ACTION_TYPE
}, noop); // Default theme

registerTheme('light', lightTheme);
registerTheme('dark', theme); // For backward compatibility, where the namespace `dataTool` will
// be mounted on `echarts` is the extension `dataTool` is imported.

var dataTool = {};

var extensions = [];
var extensionRegisters = {
  registerPreprocessor: registerPreprocessor,
  registerProcessor: registerProcessor,
  registerPostInit: registerPostInit,
  registerPostUpdate: registerPostUpdate,
  registerAction: registerAction,
  registerCoordinateSystem: registerCoordinateSystem,
  registerLayout: registerLayout,
  registerVisual: registerVisual,
  registerTransform: registerTransform,
  registerLoading: registerLoading,
  registerMap: registerMap,
  PRIORITY: PRIORITY,
  ComponentModel: ComponentModel,
  ComponentView: ComponentView,
  SeriesModel: SeriesModel,
  ChartView: ChartView,
  // TODO Use ComponentModel and SeriesModel instead of Constructor
  registerComponentModel: function (ComponentModelClass) {
    ComponentModel.registerClass(ComponentModelClass);
  },
  registerComponentView: function (ComponentViewClass) {
    ComponentView.registerClass(ComponentViewClass);
  },
  registerSeriesModel: function (SeriesModelClass) {
    SeriesModel.registerClass(SeriesModelClass);
  },
  registerChartView: function (ChartViewClass) {
    ChartView.registerClass(ChartViewClass);
  },
  registerSubTypeDefaulter: function (componentType, defaulter) {
    ComponentModel.registerSubTypeDefaulter(componentType, defaulter);
  },
  registerPainter: function (painterType, PainterCtor) {
    registerPainter(painterType, PainterCtor);
  }
};
function use(ext) {
  if (isArray(ext)) {
    // use([ChartLine, ChartBar]);
    each$2(ext, function (singleExt) {
      use(singleExt);
    });
    return;
  }

  if (indexOf$1(extensions, ext) >= 0) {
    return;
  }

  extensions.push(ext);

  if (isFunction$1(ext)) {
    ext = {
      install: ext
    };
  }

  ext.install(extensionRegisters);
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
var AxisModelCommonMixin =
/** @class */
function () {
  function AxisModelCommonMixin() {}

  AxisModelCommonMixin.prototype.getNeedCrossZero = function () {
    var option = this.option;
    return !option.scale;
  };
  /**
   * Should be implemented by each axis model if necessary.
   * @return coordinate system model
   */


  AxisModelCommonMixin.prototype.getCoordSysModel = function () {
    return;
  };

  return AxisModelCommonMixin;
}();

var OrdinalMeta =
/** @class */
function () {
  function OrdinalMeta(opt) {
    this.categories = opt.categories || [];
    this._needCollect = opt.needCollect;
    this._deduplication = opt.deduplication;
  }

  OrdinalMeta.createByAxisModel = function (axisModel) {
    var option = axisModel.option;
    var data = option.data;
    var categories = data && map(data, getName);
    return new OrdinalMeta({
      categories: categories,
      needCollect: !categories,
      // deduplication is default in axis.
      deduplication: option.dedplication !== false
    });
  };

  OrdinalMeta.prototype.getOrdinal = function (category) {
    // @ts-ignore
    return this._getOrCreateMap().get(category);
  };
  /**
   * @return The ordinal. If not found, return NaN.
   */


  OrdinalMeta.prototype.parseAndCollect = function (category) {
    var index;
    var needCollect = this._needCollect; // The value of category dim can be the index of the given category set.
    // This feature is only supported when !needCollect, because we should
    // consider a common case: a value is 2017, which is a number but is
    // expected to be tread as a category. This case usually happen in dataset,
    // where it happent to be no need of the index feature.

    if (typeof category !== 'string' && !needCollect) {
      return category;
    } // Optimize for the scenario:
    // category is ['2012-01-01', '2012-01-02', ...], where the input
    // data has been ensured not duplicate and is large data.
    // Notice, if a dataset dimension provide categroies, usually echarts
    // should remove duplication except user tell echarts dont do that
    // (set axis.deduplication = false), because echarts do not know whether
    // the values in the category dimension has duplication (consider the
    // parallel-aqi example)


    if (needCollect && !this._deduplication) {
      index = this.categories.length;
      this.categories[index] = category;
      return index;
    }

    var map = this._getOrCreateMap(); // @ts-ignore


    index = map.get(category);

    if (index == null) {
      if (needCollect) {
        index = this.categories.length;
        this.categories[index] = category; // @ts-ignore

        map.set(category, index);
      } else {
        index = NaN;
      }
    }

    return index;
  }; // Consider big data, do not create map until needed.


  OrdinalMeta.prototype._getOrCreateMap = function () {
    return this._map || (this._map = createHashMap(this.categories));
  };

  return OrdinalMeta;
}();

function getName(obj) {
  if (isObject$2(obj) && obj.value != null) {
    return obj.value;
  } else {
    return obj + '';
  }
}

var Scale =
/** @class */
function () {
  function Scale(setting) {
    this._setting = setting || {};
    this._extent = [Infinity, -Infinity];
  }

  Scale.prototype.getSetting = function (name) {
    return this._setting[name];
  };
  /**
   * Set extent from data
   */


  Scale.prototype.unionExtent = function (other) {
    var extent = this._extent;
    other[0] < extent[0] && (extent[0] = other[0]);
    other[1] > extent[1] && (extent[1] = other[1]); // not setExtent because in log axis it may transformed to power
    // this.setExtent(extent[0], extent[1]);
  };
  /**
   * Set extent from data
   */


  Scale.prototype.unionExtentFromData = function (data, dim) {
    this.unionExtent(data.getApproximateExtent(dim));
  };
  /**
   * Get extent
   *
   * Extent is always in increase order.
   */


  Scale.prototype.getExtent = function () {
    return this._extent.slice();
  };
  /**
   * Set extent
   */


  Scale.prototype.setExtent = function (start, end) {
    var thisExtent = this._extent;

    if (!isNaN(start)) {
      thisExtent[0] = start;
    }

    if (!isNaN(end)) {
      thisExtent[1] = end;
    }
  };
  /**
   * If value is in extent range
   */


  Scale.prototype.isInExtentRange = function (value) {
    return this._extent[0] <= value && this._extent[1] >= value;
  };
  /**
   * When axis extent depends on data and no data exists,
   * axis ticks should not be drawn, which is named 'blank'.
   */


  Scale.prototype.isBlank = function () {
    return this._isBlank;
  };
  /**
   * When axis extent depends on data and no data exists,
   * axis ticks should not be drawn, which is named 'blank'.
   */


  Scale.prototype.setBlank = function (isBlank) {
    this._isBlank = isBlank;
  };

  return Scale;
}();

enableClassManagement(Scale);

var roundNumber$1 = round;
/**
 * @param extent Both extent[0] and extent[1] should be valid number.
 *               Should be extent[0] < extent[1].
 * @param splitNumber splitNumber should be >= 1.
 */

function intervalScaleNiceTicks(extent, splitNumber, minInterval, maxInterval) {
  var result = {};
  var span = extent[1] - extent[0];
  var interval = result.interval = nice(span / splitNumber, true);

  if (minInterval != null && interval < minInterval) {
    interval = result.interval = minInterval;
  }

  if (maxInterval != null && interval > maxInterval) {
    interval = result.interval = maxInterval;
  } // Tow more digital for tick.


  var precision = result.intervalPrecision = getIntervalPrecision(interval); // Niced extent inside original extent

  var niceTickExtent = result.niceTickExtent = [roundNumber$1(Math.ceil(extent[0] / interval) * interval, precision), roundNumber$1(Math.floor(extent[1] / interval) * interval, precision)];
  fixExtent(niceTickExtent, extent);
  return result;
}
/**
 * @return interval precision
 */

function getIntervalPrecision(interval) {
  // Tow more digital for tick.
  return getPrecisionSafe$1(interval) + 2;
}

function clamp(niceTickExtent, idx, extent) {
  niceTickExtent[idx] = Math.max(Math.min(niceTickExtent[idx], extent[1]), extent[0]);
} // In some cases (e.g., splitNumber is 1), niceTickExtent may be out of extent.


function fixExtent(niceTickExtent, extent) {
  !isFinite(niceTickExtent[0]) && (niceTickExtent[0] = extent[0]);
  !isFinite(niceTickExtent[1]) && (niceTickExtent[1] = extent[1]);
  clamp(niceTickExtent, 0, extent);
  clamp(niceTickExtent, 1, extent);

  if (niceTickExtent[0] > niceTickExtent[1]) {
    niceTickExtent[0] = niceTickExtent[1];
  }
}
function contain(val, extent) {
  return val >= extent[0] && val <= extent[1];
}
function normalize(val, extent) {
  if (extent[1] === extent[0]) {
    return 0.5;
  }

  return (val - extent[0]) / (extent[1] - extent[0]);
}
function scale(val, extent) {
  return val * (extent[1] - extent[0]) + extent[0];
}

var OrdinalScale =
/** @class */
function (_super) {
  __extends(OrdinalScale, _super);

  function OrdinalScale(setting) {
    var _this = _super.call(this, setting) || this;

    _this.type = 'ordinal';

    var ordinalMeta = _this.getSetting('ordinalMeta'); // Caution: Should not use instanceof, consider ec-extensions using
    // import approach to get OrdinalMeta class.


    if (!ordinalMeta) {
      ordinalMeta = new OrdinalMeta({});
    }

    if (isArray(ordinalMeta)) {
      ordinalMeta = new OrdinalMeta({
        categories: map(ordinalMeta, function (item) {
          return isObject$2(item) ? item.value : item;
        })
      });
    }

    _this._ordinalMeta = ordinalMeta;
    _this._extent = _this.getSetting('extent') || [0, ordinalMeta.categories.length - 1];
    return _this;
  }

  OrdinalScale.prototype.parse = function (val) {
    return typeof val === 'string' ? this._ordinalMeta.getOrdinal(val) // val might be float.
    : Math.round(val);
  };

  OrdinalScale.prototype.contain = function (rank) {
    rank = this.parse(rank);
    return contain(rank, this._extent) && this._ordinalMeta.categories[rank] != null;
  };
  /**
   * Normalize given rank or name to linear [0, 1]
   * @param val raw ordinal number.
   * @return normalized value in [0, 1].
   */


  OrdinalScale.prototype.normalize = function (val) {
    val = this._getTickNumber(this.parse(val));
    return normalize(val, this._extent);
  };
  /**
   * @param val normalized value in [0, 1].
   * @return raw ordinal number.
   */


  OrdinalScale.prototype.scale = function (val) {
    val = Math.round(scale(val, this._extent));
    return this.getRawOrdinalNumber(val);
  };

  OrdinalScale.prototype.getTicks = function () {
    var ticks = [];
    var extent = this._extent;
    var rank = extent[0];

    while (rank <= extent[1]) {
      ticks.push({
        value: rank
      });
      rank++;
    }

    return ticks;
  };

  OrdinalScale.prototype.getMinorTicks = function (splitNumber) {
    // Not support.
    return;
  };
  /**
   * @see `Ordinal['_ordinalNumbersByTick']`
   */


  OrdinalScale.prototype.setSortInfo = function (info) {
    if (info == null) {
      this._ordinalNumbersByTick = this._ticksByOrdinalNumber = null;
      return;
    }

    var infoOrdinalNumbers = info.ordinalNumbers;
    var ordinalsByTick = this._ordinalNumbersByTick = [];
    var ticksByOrdinal = this._ticksByOrdinalNumber = []; // Unnecessary support negative tick in `realtimeSort`.

    var tickNum = 0;
    var allCategoryLen = this._ordinalMeta.categories.length;

    for (var len = Math.min(allCategoryLen, infoOrdinalNumbers.length); tickNum < len; ++tickNum) {
      var ordinalNumber = infoOrdinalNumbers[tickNum];
      ordinalsByTick[tickNum] = ordinalNumber;
      ticksByOrdinal[ordinalNumber] = tickNum;
    } // Handle that `series.data` only covers part of the `axis.category.data`.


    var unusedOrdinal = 0;

    for (; tickNum < allCategoryLen; ++tickNum) {
      while (ticksByOrdinal[unusedOrdinal] != null) {
        unusedOrdinal++;
      }
      ordinalsByTick.push(unusedOrdinal);
      ticksByOrdinal[unusedOrdinal] = tickNum;
    }
  };

  OrdinalScale.prototype._getTickNumber = function (ordinal) {
    var ticksByOrdinalNumber = this._ticksByOrdinalNumber; // also support ordinal out of range of `ordinalMeta.categories.length`,
    // where ordinal numbers are used as tick value directly.

    return ticksByOrdinalNumber && ordinal >= 0 && ordinal < ticksByOrdinalNumber.length ? ticksByOrdinalNumber[ordinal] : ordinal;
  };
  /**
   * @usage
   * ```js
   * const ordinalNumber = ordinalScale.getRawOrdinalNumber(tickVal);
   *
   * // case0
   * const rawOrdinalValue = axisModel.getCategories()[ordinalNumber];
   * // case1
   * const rawOrdinalValue = this._ordinalMeta.categories[ordinalNumber];
   * // case2
   * const coord = axis.dataToCoord(ordinalNumber);
   * ```
   *
   * @param {OrdinalNumber} tickNumber index of display
   */


  OrdinalScale.prototype.getRawOrdinalNumber = function (tickNumber) {
    var ordinalNumbersByTick = this._ordinalNumbersByTick; // tickNumber may be out of range, e.g., when axis max is larger than `ordinalMeta.categories.length`.,
    // where ordinal numbers are used as tick value directly.

    return ordinalNumbersByTick && tickNumber >= 0 && tickNumber < ordinalNumbersByTick.length ? ordinalNumbersByTick[tickNumber] : tickNumber;
  };
  /**
   * Get item on tick
   */


  OrdinalScale.prototype.getLabel = function (tick) {
    if (!this.isBlank()) {
      var ordinalNumber = this.getRawOrdinalNumber(tick.value);
      var cateogry = this._ordinalMeta.categories[ordinalNumber]; // Note that if no data, ordinalMeta.categories is an empty array.
      // Return empty if it's not exist.

      return cateogry == null ? '' : cateogry + '';
    }
  };

  OrdinalScale.prototype.count = function () {
    return this._extent[1] - this._extent[0] + 1;
  };

  OrdinalScale.prototype.unionExtentFromData = function (data, dim) {
    this.unionExtent(data.getApproximateExtent(dim));
  };
  /**
   * @override
   * If value is in extent range
   */


  OrdinalScale.prototype.isInExtentRange = function (value) {
    value = this._getTickNumber(value);
    return this._extent[0] <= value && this._extent[1] >= value;
  };

  OrdinalScale.prototype.getOrdinalMeta = function () {
    return this._ordinalMeta;
  };

  OrdinalScale.prototype.niceTicks = function () {};

  OrdinalScale.prototype.niceExtent = function () {};

  OrdinalScale.type = 'ordinal';
  return OrdinalScale;
}(Scale);

Scale.registerClass(OrdinalScale);

var roundNumber = round;

var IntervalScale =
/** @class */
function (_super) {
  __extends(IntervalScale, _super);

  function IntervalScale() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = 'interval'; // Step is calculated in adjustExtent.

    _this._interval = 0;
    _this._intervalPrecision = 2;
    return _this;
  }

  IntervalScale.prototype.parse = function (val) {
    return val;
  };

  IntervalScale.prototype.contain = function (val) {
    return contain(val, this._extent);
  };

  IntervalScale.prototype.normalize = function (val) {
    return normalize(val, this._extent);
  };

  IntervalScale.prototype.scale = function (val) {
    return scale(val, this._extent);
  };

  IntervalScale.prototype.setExtent = function (start, end) {
    var thisExtent = this._extent; // start,end may be a Number like '25',so...

    if (!isNaN(start)) {
      thisExtent[0] = parseFloat(start);
    }

    if (!isNaN(end)) {
      thisExtent[1] = parseFloat(end);
    }
  };

  IntervalScale.prototype.unionExtent = function (other) {
    var extent = this._extent;
    other[0] < extent[0] && (extent[0] = other[0]);
    other[1] > extent[1] && (extent[1] = other[1]); // unionExtent may called by it's sub classes

    this.setExtent(extent[0], extent[1]);
  };

  IntervalScale.prototype.getInterval = function () {
    return this._interval;
  };

  IntervalScale.prototype.setInterval = function (interval) {
    this._interval = interval; // Dropped auto calculated niceExtent and use user setted extent
    // We assume user wan't to set both interval, min, max to get a better result

    this._niceExtent = this._extent.slice();
    this._intervalPrecision = getIntervalPrecision(interval);
  };
  /**
   * @param expandToNicedExtent Whether expand the ticks to niced extent.
   */


  IntervalScale.prototype.getTicks = function (expandToNicedExtent) {
    var interval = this._interval;
    var extent = this._extent;
    var niceTickExtent = this._niceExtent;
    var intervalPrecision = this._intervalPrecision;
    var ticks = []; // If interval is 0, return [];

    if (!interval) {
      return ticks;
    } // Consider this case: using dataZoom toolbox, zoom and zoom.


    var safeLimit = 10000;

    if (extent[0] < niceTickExtent[0]) {
      if (expandToNicedExtent) {
        ticks.push({
          value: roundNumber(niceTickExtent[0] - interval, intervalPrecision)
        });
      } else {
        ticks.push({
          value: extent[0]
        });
      }
    }

    var tick = niceTickExtent[0];

    while (tick <= niceTickExtent[1]) {
      ticks.push({
        value: tick
      }); // Avoid rounding error

      tick = roundNumber(tick + interval, intervalPrecision);

      if (tick === ticks[ticks.length - 1].value) {
        // Consider out of safe float point, e.g.,
        // -3711126.9907707 + 2e-10 === -3711126.9907707
        break;
      }

      if (ticks.length > safeLimit) {
        return [];
      }
    } // Consider this case: the last item of ticks is smaller
    // than niceTickExtent[1] and niceTickExtent[1] === extent[1].


    var lastNiceTick = ticks.length ? ticks[ticks.length - 1].value : niceTickExtent[1];

    if (extent[1] > lastNiceTick) {
      if (expandToNicedExtent) {
        ticks.push({
          value: roundNumber(lastNiceTick + interval, intervalPrecision)
        });
      } else {
        ticks.push({
          value: extent[1]
        });
      }
    }

    return ticks;
  };

  IntervalScale.prototype.getMinorTicks = function (splitNumber) {
    var ticks = this.getTicks(true);
    var minorTicks = [];
    var extent = this.getExtent();

    for (var i = 1; i < ticks.length; i++) {
      var nextTick = ticks[i];
      var prevTick = ticks[i - 1];
      var count = 0;
      var minorTicksGroup = [];
      var interval = nextTick.value - prevTick.value;
      var minorInterval = interval / splitNumber;

      while (count < splitNumber - 1) {
        var minorTick = roundNumber(prevTick.value + (count + 1) * minorInterval); // For the first and last interval. The count may be less than splitNumber.

        if (minorTick > extent[0] && minorTick < extent[1]) {
          minorTicksGroup.push(minorTick);
        }

        count++;
      }

      minorTicks.push(minorTicksGroup);
    }

    return minorTicks;
  };
  /**
   * @param opt.precision If 'auto', use nice presision.
   * @param opt.pad returns 1.50 but not 1.5 if precision is 2.
   */


  IntervalScale.prototype.getLabel = function (data, opt) {
    if (data == null) {
      return '';
    }

    var precision = opt && opt.precision;

    if (precision == null) {
      precision = getPrecisionSafe$1(data.value) || 0;
    } else if (precision === 'auto') {
      // Should be more precise then tick.
      precision = this._intervalPrecision;
    } // (1) If `precision` is set, 12.005 should be display as '12.00500'.
    // (2) Use roundNumber (toFixed) to avoid scientific notation like '3.5e-7'.


    var dataNum = roundNumber(data.value, precision, true);
    return addCommas(dataNum);
  };
  /**
   * @param splitNumber By default `5`.
   */


  IntervalScale.prototype.niceTicks = function (splitNumber, minInterval, maxInterval) {
    splitNumber = splitNumber || 5;
    var extent = this._extent;
    var span = extent[1] - extent[0];

    if (!isFinite(span)) {
      return;
    } // User may set axis min 0 and data are all negative
    // FIXME If it needs to reverse ?


    if (span < 0) {
      span = -span;
      extent.reverse();
    }

    var result = intervalScaleNiceTicks(extent, splitNumber, minInterval, maxInterval);
    this._intervalPrecision = result.intervalPrecision;
    this._interval = result.interval;
    this._niceExtent = result.niceTickExtent;
  };

  IntervalScale.prototype.niceExtent = function (opt) {
    var extent = this._extent; // If extent start and end are same, expand them

    if (extent[0] === extent[1]) {
      if (extent[0] !== 0) {
        // Expand extent
        var expandSize = extent[0]; // In the fowllowing case
        //      Axis has been fixed max 100
        //      Plus data are all 100 and axis extent are [100, 100].
        // Extend to the both side will cause expanded max is larger than fixed max.
        // So only expand to the smaller side.

        if (!opt.fixMax) {
          extent[1] += expandSize / 2;
          extent[0] -= expandSize / 2;
        } else {
          extent[0] -= expandSize / 2;
        }
      } else {
        extent[1] = 1;
      }
    }

    var span = extent[1] - extent[0]; // If there are no data and extent are [Infinity, -Infinity]

    if (!isFinite(span)) {
      extent[0] = 0;
      extent[1] = 1;
    }

    this.niceTicks(opt.splitNumber, opt.minInterval, opt.maxInterval); // let extent = this._extent;

    var interval = this._interval;

    if (!opt.fixMin) {
      extent[0] = roundNumber(Math.floor(extent[0] / interval) * interval);
    }

    if (!opt.fixMax) {
      extent[1] = roundNumber(Math.ceil(extent[1] / interval) * interval);
    }
  };

  IntervalScale.type = 'interval';
  return IntervalScale;
}(Scale);

Scale.registerClass(IntervalScale);

var bisect = function (a, x, lo, hi) {
  while (lo < hi) {
    var mid = lo + hi >>> 1;

    if (a[mid][1] < x) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  return lo;
};

var TimeScale =
/** @class */
function (_super) {
  __extends(TimeScale, _super);

  function TimeScale(settings) {
    var _this = _super.call(this, settings) || this;

    _this.type = 'time';
    return _this;
  }
  /**
   * Get label is mainly for other components like dataZoom, tooltip.
   */


  TimeScale.prototype.getLabel = function (tick) {
    var useUTC = this.getSetting('useUTC');
    return format(tick.value, fullLeveledFormatter[getDefaultFormatPrecisionOfInterval(getPrimaryTimeUnit(this._minLevelUnit))] || fullLeveledFormatter.second, useUTC, this.getSetting('locale'));
  };

  TimeScale.prototype.getFormattedLabel = function (tick, idx, labelFormatter) {
    var isUTC = this.getSetting('useUTC');
    var lang = this.getSetting('locale');
    return leveledFormat(tick, idx, labelFormatter, lang, isUTC);
  };
  /**
   * @override
   * @param expandToNicedExtent Whether expand the ticks to niced extent.
   */


  TimeScale.prototype.getTicks = function (expandToNicedExtent) {
    var interval = this._interval;
    var extent = this._extent;
    var ticks = []; // If interval is 0, return [];

    if (!interval) {
      return ticks;
    }

    ticks.push({
      value: extent[0],
      level: 0
    });
    var useUTC = this.getSetting('useUTC');
    var innerTicks = getIntervalTicks(this._minLevelUnit, this._approxInterval, useUTC, extent);
    ticks = ticks.concat(innerTicks);
    ticks.push({
      value: extent[1],
      level: 0
    });
    return ticks;
  };

  TimeScale.prototype.niceExtent = function (opt) {
    var extent = this._extent; // If extent start and end are same, expand them

    if (extent[0] === extent[1]) {
      // Expand extent
      extent[0] -= ONE_DAY;
      extent[1] += ONE_DAY;
    } // If there are no data and extent are [Infinity, -Infinity]


    if (extent[1] === -Infinity && extent[0] === Infinity) {
      var d = new Date();
      extent[1] = +new Date(d.getFullYear(), d.getMonth(), d.getDate());
      extent[0] = extent[1] - ONE_DAY;
    }

    this.niceTicks(opt.splitNumber, opt.minInterval, opt.maxInterval);
  };

  TimeScale.prototype.niceTicks = function (approxTickNum, minInterval, maxInterval) {
    approxTickNum = approxTickNum || 10;
    var extent = this._extent;
    var span = extent[1] - extent[0];
    this._approxInterval = span / approxTickNum;

    if (minInterval != null && this._approxInterval < minInterval) {
      this._approxInterval = minInterval;
    }

    if (maxInterval != null && this._approxInterval > maxInterval) {
      this._approxInterval = maxInterval;
    }

    var scaleIntervalsLen = scaleIntervals.length;
    var idx = Math.min(bisect(scaleIntervals, this._approxInterval, 0, scaleIntervalsLen), scaleIntervalsLen - 1); // Interval that can be used to calculate ticks

    this._interval = scaleIntervals[idx][1]; // Min level used when picking ticks from top down.
    // We check one more level to avoid the ticks are to sparse in some case.

    this._minLevelUnit = scaleIntervals[Math.max(idx - 1, 0)][0];
  };

  TimeScale.prototype.parse = function (val) {
    // val might be float.
    return typeof val === 'number' ? val : +parseDate(val);
  };

  TimeScale.prototype.contain = function (val) {
    return contain(this.parse(val), this._extent);
  };

  TimeScale.prototype.normalize = function (val) {
    return normalize(this.parse(val), this._extent);
  };

  TimeScale.prototype.scale = function (val) {
    return scale(val, this._extent);
  };

  TimeScale.type = 'time';
  return TimeScale;
}(IntervalScale);
/**
 * This implementation was originally copied from "d3.js"
 * <https://github.com/d3/d3/blob/b516d77fb8566b576088e73410437494717ada26/src/time/scale.js>
 * with some modifications made for this program.
 * See the license statement at the head of this file.
 */


var scaleIntervals = [// Format                           interval
['second', ONE_SECOND], ['minute', ONE_MINUTE], ['hour', ONE_HOUR], ['quarter-day', ONE_HOUR * 6], ['half-day', ONE_HOUR * 12], ['day', ONE_DAY * 1.2], ['half-week', ONE_DAY * 3.5], ['week', ONE_DAY * 7], ['month', ONE_DAY * 31], ['quarter', ONE_DAY * 95], ['half-year', ONE_YEAR / 2], ['year', ONE_YEAR] // 1Y
];

function isUnitValueSame(unit, valueA, valueB, isUTC) {
  var dateA = parseDate(valueA);
  var dateB = parseDate(valueB);

  var isSame = function (unit) {
    return getUnitValue(dateA, unit, isUTC) === getUnitValue(dateB, unit, isUTC);
  };

  var isSameYear = function () {
    return isSame('year');
  }; // const isSameHalfYear = () => isSameYear() && isSame('half-year');
  // const isSameQuater = () => isSameYear() && isSame('quarter');


  var isSameMonth = function () {
    return isSameYear() && isSame('month');
  };

  var isSameDay = function () {
    return isSameMonth() && isSame('day');
  }; // const isSameHalfDay = () => isSameDay() && isSame('half-day');


  var isSameHour = function () {
    return isSameDay() && isSame('hour');
  };

  var isSameMinute = function () {
    return isSameHour() && isSame('minute');
  };

  var isSameSecond = function () {
    return isSameMinute() && isSame('second');
  };

  var isSameMilliSecond = function () {
    return isSameSecond() && isSame('millisecond');
  };

  switch (unit) {
    case 'year':
      return isSameYear();

    case 'month':
      return isSameMonth();

    case 'day':
      return isSameDay();

    case 'hour':
      return isSameHour();

    case 'minute':
      return isSameMinute();

    case 'second':
      return isSameSecond();

    case 'millisecond':
      return isSameMilliSecond();
  }
} // const primaryUnitGetters = {
//     year: fullYearGetterName(),
//     month: monthGetterName(),
//     day: dateGetterName(),
//     hour: hoursGetterName(),
//     minute: minutesGetterName(),
//     second: secondsGetterName(),
//     millisecond: millisecondsGetterName()
// };
// const primaryUnitUTCGetters = {
//     year: fullYearGetterName(true),
//     month: monthGetterName(true),
//     day: dateGetterName(true),
//     hour: hoursGetterName(true),
//     minute: minutesGetterName(true),
//     second: secondsGetterName(true),
//     millisecond: millisecondsGetterName(true)
// };
// function moveTick(date: Date, unitName: TimeUnit, step: number, isUTC: boolean) {
//     step = step || 1;
//     switch (getPrimaryTimeUnit(unitName)) {
//         case 'year':
//             date[fullYearSetterName(isUTC)](date[fullYearGetterName(isUTC)]() + step);
//             break;
//         case 'month':
//             date[monthSetterName(isUTC)](date[monthGetterName(isUTC)]() + step);
//             break;
//         case 'day':
//             date[dateSetterName(isUTC)](date[dateGetterName(isUTC)]() + step);
//             break;
//         case 'hour':
//             date[hoursSetterName(isUTC)](date[hoursGetterName(isUTC)]() + step);
//             break;
//         case 'minute':
//             date[minutesSetterName(isUTC)](date[minutesGetterName(isUTC)]() + step);
//             break;
//         case 'second':
//             date[secondsSetterName(isUTC)](date[secondsGetterName(isUTC)]() + step);
//             break;
//         case 'millisecond':
//             date[millisecondsSetterName(isUTC)](date[millisecondsGetterName(isUTC)]() + step);
//             break;
//     }
//     return date.getTime();
// }
// const DATE_INTERVALS = [[8, 7.5], [4, 3.5], [2, 1.5]];
// const MONTH_INTERVALS = [[6, 5.5], [3, 2.5], [2, 1.5]];
// const MINUTES_SECONDS_INTERVALS = [[30, 30], [20, 20], [15, 15], [10, 10], [5, 5], [2, 2]];


function getDateInterval(approxInterval, daysInMonth) {
  approxInterval /= ONE_DAY;
  return approxInterval > 16 ? 16 // Math.floor(daysInMonth / 2) + 1  // In this case we only want one tick betwen two month.
  : approxInterval > 7.5 ? 7 // TODO week 7 or day 8?
  : approxInterval > 3.5 ? 4 : approxInterval > 1.5 ? 2 : 1;
}

function getMonthInterval(approxInterval) {
  var APPROX_ONE_MONTH = 30 * ONE_DAY;
  approxInterval /= APPROX_ONE_MONTH;
  return approxInterval > 6 ? 6 : approxInterval > 3 ? 3 : approxInterval > 2 ? 2 : 1;
}

function getHourInterval(approxInterval) {
  approxInterval /= ONE_HOUR;
  return approxInterval > 12 ? 12 : approxInterval > 6 ? 6 : approxInterval > 3.5 ? 4 : approxInterval > 2 ? 2 : 1;
}

function getMinutesAndSecondsInterval(approxInterval, isMinutes) {
  approxInterval /= isMinutes ? ONE_MINUTE : ONE_SECOND;
  return approxInterval > 30 ? 30 : approxInterval > 20 ? 20 : approxInterval > 15 ? 15 : approxInterval > 10 ? 10 : approxInterval > 5 ? 5 : approxInterval > 2 ? 2 : 1;
}

function getMillisecondsInterval(approxInterval) {
  return nice(approxInterval, true);
}

function getFirstTimestampOfUnit(date, unitName, isUTC) {
  var outDate = new Date(date);

  switch (getPrimaryTimeUnit(unitName)) {
    case 'year':
    case 'month':
      outDate[monthSetterName(isUTC)](0);

    case 'day':
      outDate[dateSetterName(isUTC)](1);

    case 'hour':
      outDate[hoursSetterName(isUTC)](0);

    case 'minute':
      outDate[minutesSetterName(isUTC)](0);

    case 'second':
      outDate[secondsSetterName(isUTC)](0);
      outDate[millisecondsSetterName(isUTC)](0);
  }

  return outDate.getTime();
}

function getIntervalTicks(bottomUnitName, approxInterval, isUTC, extent) {
  var safeLimit = 10000;
  var unitNames = timeUnits;
  var iter = 0;

  function addTicksInSpan(interval, minTimestamp, maxTimestamp, getMethodName, setMethodName, isDate, out) {
    var date = new Date(minTimestamp);
    var dateTime = minTimestamp;
    var d = date[getMethodName](); // if (isDate) {
    //     d -= 1; // Starts with 0;   PENDING
    // }

    while (dateTime < maxTimestamp && dateTime <= extent[1]) {
      out.push({
        value: dateTime
      });
      d += interval;
      date[setMethodName](d);
      dateTime = date.getTime();
    } // This extra tick is for calcuating ticks of next level. Will not been added to the final result


    out.push({
      value: dateTime,
      notAdd: true
    });
  }

  function addLevelTicks(unitName, lastLevelTicks, levelTicks) {
    var newAddedTicks = [];
    var isFirstLevel = !lastLevelTicks.length;

    if (isUnitValueSame(getPrimaryTimeUnit(unitName), extent[0], extent[1], isUTC)) {
      return;
    }

    if (isFirstLevel) {
      lastLevelTicks = [{
        // TODO Optimize. Not include so may ticks.
        value: getFirstTimestampOfUnit(new Date(extent[0]), unitName, isUTC)
      }, {
        value: extent[1]
      }];
    }

    for (var i = 0; i < lastLevelTicks.length - 1; i++) {
      var startTick = lastLevelTicks[i].value;
      var endTick = lastLevelTicks[i + 1].value;

      if (startTick === endTick) {
        continue;
      }

      var interval = void 0;
      var getterName = void 0;
      var setterName = void 0;
      var isDate = false;

      switch (unitName) {
        case 'year':
          interval = Math.max(1, Math.round(approxInterval / ONE_DAY / 365));
          getterName = fullYearGetterName(isUTC);
          setterName = fullYearSetterName(isUTC);
          break;

        case 'half-year':
        case 'quarter':
        case 'month':
          interval = getMonthInterval(approxInterval);
          getterName = monthGetterName(isUTC);
          setterName = monthSetterName(isUTC);
          break;

        case 'week': // PENDING If week is added. Ignore day.

        case 'half-week':
        case 'day':
          interval = getDateInterval(approxInterval); // Use 32 days and let interval been 16

          getterName = dateGetterName(isUTC);
          setterName = dateSetterName(isUTC);
          isDate = true;
          break;

        case 'half-day':
        case 'quarter-day':
        case 'hour':
          interval = getHourInterval(approxInterval);
          getterName = hoursGetterName(isUTC);
          setterName = hoursSetterName(isUTC);
          break;

        case 'minute':
          interval = getMinutesAndSecondsInterval(approxInterval, true);
          getterName = minutesGetterName(isUTC);
          setterName = minutesSetterName(isUTC);
          break;

        case 'second':
          interval = getMinutesAndSecondsInterval(approxInterval, false);
          getterName = secondsGetterName(isUTC);
          setterName = secondsSetterName(isUTC);
          break;

        case 'millisecond':
          interval = getMillisecondsInterval(approxInterval);
          getterName = millisecondsGetterName(isUTC);
          setterName = millisecondsSetterName(isUTC);
          break;
      }

      addTicksInSpan(interval, startTick, endTick, getterName, setterName, isDate, newAddedTicks);

      if (unitName === 'year' && levelTicks.length > 1 && i === 0) {
        // Add nearest years to the left extent.
        levelTicks.unshift({
          value: levelTicks[0].value - interval
        });
      }
    }

    for (var i = 0; i < newAddedTicks.length; i++) {
      levelTicks.push(newAddedTicks[i]);
    } // newAddedTicks.length && console.log(unitName, newAddedTicks);


    return newAddedTicks;
  }

  var levelsTicks = [];
  var currentLevelTicks = [];
  var tickCount = 0;
  var lastLevelTickCount = 0;

  for (var i = 0; i < unitNames.length && iter++ < safeLimit; ++i) {
    var primaryTimeUnit = getPrimaryTimeUnit(unitNames[i]);

    if (!isPrimaryTimeUnit(unitNames[i])) {
      // TODO
      continue;
    }

    addLevelTicks(unitNames[i], levelsTicks[levelsTicks.length - 1] || [], currentLevelTicks);
    var nextPrimaryTimeUnit = unitNames[i + 1] ? getPrimaryTimeUnit(unitNames[i + 1]) : null;

    if (primaryTimeUnit !== nextPrimaryTimeUnit) {
      if (currentLevelTicks.length) {
        lastLevelTickCount = tickCount; // Remove the duplicate so the tick count can be precisely.

        currentLevelTicks.sort(function (a, b) {
          return a.value - b.value;
        });
        var levelTicksRemoveDuplicated = [];

        for (var i_1 = 0; i_1 < currentLevelTicks.length; ++i_1) {
          var tickValue = currentLevelTicks[i_1].value;

          if (i_1 === 0 || currentLevelTicks[i_1 - 1].value !== tickValue) {
            levelTicksRemoveDuplicated.push(currentLevelTicks[i_1]);

            if (tickValue >= extent[0] && tickValue <= extent[1]) {
              tickCount++;
            }
          }
        }

        var targetTickNum = (extent[1] - extent[0]) / approxInterval; // Added too much in this level and not too less in last level

        if (tickCount > targetTickNum * 1.5 && lastLevelTickCount > targetTickNum / 1.5) {
          break;
        } // Only treat primary time unit as one level.


        levelsTicks.push(levelTicksRemoveDuplicated);

        if (tickCount > targetTickNum || bottomUnitName === unitNames[i]) {
          break;
        }
      } // Reset if next unitName is primary


      currentLevelTicks = [];
    }
  }

  var levelsTicksInExtent = filter(map(levelsTicks, function (levelTicks) {
    return filter(levelTicks, function (tick) {
      return tick.value >= extent[0] && tick.value <= extent[1] && !tick.notAdd;
    });
  }), function (levelTicks) {
    return levelTicks.length > 0;
  });
  var ticks = [];
  var maxLevel = levelsTicksInExtent.length - 1;

  for (var i = 0; i < levelsTicksInExtent.length; ++i) {
    var levelTicks = levelsTicksInExtent[i];

    for (var k = 0; k < levelTicks.length; ++k) {
      ticks.push({
        value: levelTicks[k].value,
        level: maxLevel - i
      });
    }
  }

  ticks.sort(function (a, b) {
    return a.value - b.value;
  }); // Remove duplicates

  var result = [];

  for (var i = 0; i < ticks.length; ++i) {
    if (i === 0 || ticks[i].value !== ticks[i - 1].value) {
      result.push(ticks[i]);
    }
  }

  return result;
}

Scale.registerClass(TimeScale);

var scaleProto = Scale.prototype; // FIXME:TS refactor: not good to call it directly with `this`?

var intervalScaleProto = IntervalScale.prototype;
var getPrecisionSafe = getPrecisionSafe$1;
var roundingErrorFix = round;
var mathFloor = Math.floor;
var mathCeil = Math.ceil;
var mathPow = Math.pow;
var mathLog = Math.log;

var LogScale =
/** @class */
function (_super) {
  __extends(LogScale, _super);

  function LogScale() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = 'log';
    _this.base = 10;
    _this._originalScale = new IntervalScale(); // FIXME:TS actually used by `IntervalScale`

    _this._interval = 0;
    return _this;
  }
  /**
   * @param Whether expand the ticks to niced extent.
   */


  LogScale.prototype.getTicks = function (expandToNicedExtent) {
    var originalScale = this._originalScale;
    var extent = this._extent;
    var originalExtent = originalScale.getExtent();
    var ticks = intervalScaleProto.getTicks.call(this, expandToNicedExtent);
    return map(ticks, function (tick) {
      var val = tick.value;
      var powVal = round(mathPow(this.base, val)); // Fix #4158

      powVal = val === extent[0] && this._fixMin ? fixRoundingError(powVal, originalExtent[0]) : powVal;
      powVal = val === extent[1] && this._fixMax ? fixRoundingError(powVal, originalExtent[1]) : powVal;
      return {
        value: powVal
      };
    }, this);
  };

  LogScale.prototype.setExtent = function (start, end) {
    var base = this.base;
    start = mathLog(start) / mathLog(base);
    end = mathLog(end) / mathLog(base);
    intervalScaleProto.setExtent.call(this, start, end);
  };
  /**
   * @return {number} end
   */


  LogScale.prototype.getExtent = function () {
    var base = this.base;
    var extent = scaleProto.getExtent.call(this);
    extent[0] = mathPow(base, extent[0]);
    extent[1] = mathPow(base, extent[1]); // Fix #4158

    var originalScale = this._originalScale;
    var originalExtent = originalScale.getExtent();
    this._fixMin && (extent[0] = fixRoundingError(extent[0], originalExtent[0]));
    this._fixMax && (extent[1] = fixRoundingError(extent[1], originalExtent[1]));
    return extent;
  };

  LogScale.prototype.unionExtent = function (extent) {
    this._originalScale.unionExtent(extent);

    var base = this.base;
    extent[0] = mathLog(extent[0]) / mathLog(base);
    extent[1] = mathLog(extent[1]) / mathLog(base);
    scaleProto.unionExtent.call(this, extent);
  };

  LogScale.prototype.unionExtentFromData = function (data, dim) {
    // TODO
    // filter value that <= 0
    this.unionExtent(data.getApproximateExtent(dim));
  };
  /**
   * Update interval and extent of intervals for nice ticks
   * @param approxTickNum default 10 Given approx tick number
   */


  LogScale.prototype.niceTicks = function (approxTickNum) {
    approxTickNum = approxTickNum || 10;
    var extent = this._extent;
    var span = extent[1] - extent[0];

    if (span === Infinity || span <= 0) {
      return;
    }

    var interval = quantity(span);
    var err = approxTickNum / span * interval; // Filter ticks to get closer to the desired count.

    if (err <= 0.5) {
      interval *= 10;
    } // Interval should be integer


    while (!isNaN(interval) && Math.abs(interval) < 1 && Math.abs(interval) > 0) {
      interval *= 10;
    }

    var niceExtent = [round(mathCeil(extent[0] / interval) * interval), round(mathFloor(extent[1] / interval) * interval)];
    this._interval = interval;
    this._niceExtent = niceExtent;
  };

  LogScale.prototype.niceExtent = function (opt) {
    intervalScaleProto.niceExtent.call(this, opt);
    this._fixMin = opt.fixMin;
    this._fixMax = opt.fixMax;
  };

  LogScale.prototype.parse = function (val) {
    return val;
  };

  LogScale.prototype.contain = function (val) {
    val = mathLog(val) / mathLog(this.base);
    return contain(val, this._extent);
  };

  LogScale.prototype.normalize = function (val) {
    val = mathLog(val) / mathLog(this.base);
    return normalize(val, this._extent);
  };

  LogScale.prototype.scale = function (val) {
    val = scale(val, this._extent);
    return mathPow(this.base, val);
  };

  LogScale.type = 'log';
  return LogScale;
}(Scale);

var proto = LogScale.prototype;
proto.getMinorTicks = intervalScaleProto.getMinorTicks;
proto.getLabel = intervalScaleProto.getLabel;

function fixRoundingError(val, originalVal) {
  return roundingErrorFix(val, getPrecisionSafe(originalVal));
}

Scale.registerClass(LogScale);

var ScaleRawExtentInfo =
/** @class */
function () {
  function ScaleRawExtentInfo(scale, model, // Usually: data extent from all series on this axis.
  originalExtent) {
    this._prepareParams(scale, model, originalExtent);
  }
  /**
   * Parameters depending on ouside (like model, user callback)
   * are prepared and fixed here.
   */


  ScaleRawExtentInfo.prototype._prepareParams = function (scale, model, // Usually: data extent from all series on this axis.
  dataExtent) {
    if (dataExtent[1] < dataExtent[0]) {
      dataExtent = [NaN, NaN];
    }

    this._dataMin = dataExtent[0];
    this._dataMax = dataExtent[1];
    var isOrdinal = this._isOrdinal = scale.type === 'ordinal';
    this._needCrossZero = model.getNeedCrossZero && model.getNeedCrossZero();
    var modelMinRaw = this._modelMinRaw = model.get('min', true);

    if (isFunction$1(modelMinRaw)) {
      // This callback alway provide users the full data extent (before data filtered).
      this._modelMinNum = parseAxisModelMinMax(scale, modelMinRaw({
        min: dataExtent[0],
        max: dataExtent[1]
      }));
    } else if (modelMinRaw !== 'dataMin') {
      this._modelMinNum = parseAxisModelMinMax(scale, modelMinRaw);
    }

    var modelMaxRaw = this._modelMaxRaw = model.get('max', true);

    if (isFunction$1(modelMaxRaw)) {
      // This callback alway provide users the full data extent (before data filtered).
      this._modelMaxNum = parseAxisModelMinMax(scale, modelMaxRaw({
        min: dataExtent[0],
        max: dataExtent[1]
      }));
    } else if (modelMaxRaw !== 'dataMax') {
      this._modelMaxNum = parseAxisModelMinMax(scale, modelMaxRaw);
    }

    if (isOrdinal) {
      // FIXME: there is a flaw here: if there is no "block" data processor like `dataZoom`,
      // and progressive rendering is using, here the category result might just only contain
      // the processed chunk rather than the entire result.
      this._axisDataLen = model.getCategories().length;
    } else {
      var boundaryGap = model.get('boundaryGap');
      var boundaryGapArr = isArray(boundaryGap) ? boundaryGap : [boundaryGap || 0, boundaryGap || 0];

      if (typeof boundaryGapArr[0] === 'boolean' || typeof boundaryGapArr[1] === 'boolean') {

        this._boundaryGapInner = [0, 0];
      } else {
        this._boundaryGapInner = [parsePercent$1(boundaryGapArr[0], 1), parsePercent$1(boundaryGapArr[1], 1)];
      }
    }
  };
  /**
   * Calculate extent by prepared parameters.
   * This method has no external dependency and can be called duplicatedly,
   * getting the same result.
   * If parameters changed, should call this method to recalcuate.
   */


  ScaleRawExtentInfo.prototype.calculate = function () {
    // Notice: When min/max is not set (that is, when there are null/undefined,
    // which is the most common case), these cases should be ensured:
    // (1) For 'ordinal', show all axis.data.
    // (2) For others:
    //      + `boundaryGap` is applied (if min/max set, boundaryGap is
    //      disabled).
    //      + If `needCrossZero`, min/max should be zero, otherwise, min/max should
    //      be the result that originalExtent enlarged by boundaryGap.
    // (3) If no data, it should be ensured that `scale.setBlank` is set.
    var isOrdinal = this._isOrdinal;
    var dataMin = this._dataMin;
    var dataMax = this._dataMax;
    var axisDataLen = this._axisDataLen;
    var boundaryGapInner = this._boundaryGapInner;
    var span = !isOrdinal ? dataMax - dataMin || Math.abs(dataMin) : null; // Currently if a `'value'` axis model min is specified as 'dataMin'/'dataMax',
    // `boundaryGap` will not be used. It's the different from specifying as `null`/`undefined`.

    var min = this._modelMinRaw === 'dataMin' ? dataMin : this._modelMinNum;
    var max = this._modelMaxRaw === 'dataMax' ? dataMax : this._modelMaxNum; // If `_modelMinNum`/`_modelMaxNum` is `null`/`undefined`, should not be fixed.

    var minFixed = min != null;
    var maxFixed = max != null;

    if (min == null) {
      min = isOrdinal ? axisDataLen ? 0 : NaN : dataMin - boundaryGapInner[0] * span;
    }

    if (max == null) {
      max = isOrdinal ? axisDataLen ? axisDataLen - 1 : NaN : dataMax + boundaryGapInner[1] * span;
    }

    (min == null || !isFinite(min)) && (min = NaN);
    (max == null || !isFinite(max)) && (max = NaN);

    if (min > max) {
      min = NaN;
      max = NaN;
    }

    var isBlank = eqNaN(min) || eqNaN(max) || isOrdinal && !axisDataLen; // If data extent modified, need to recalculated to ensure cross zero.

    if (this._needCrossZero) {
      // Axis is over zero and min is not set
      if (min > 0 && max > 0 && !minFixed) {
        min = 0; // minFixed = true;
      } // Axis is under zero and max is not set


      if (min < 0 && max < 0 && !maxFixed) {
        max = 0; // maxFixed = true;
      } // PENDING:
      // When `needCrossZero` and all data is positive/negative, should it be ensured
      // that the results processed by boundaryGap are positive/negative?
      // If so, here `minFixed`/`maxFixed` need to be set.

    }

    var determinedMin = this._determinedMin;
    var determinedMax = this._determinedMax;

    if (determinedMin != null) {
      min = determinedMin;
      minFixed = true;
    }

    if (determinedMax != null) {
      max = determinedMax;
      maxFixed = true;
    } // Ensure min/max be finite number or NaN here. (not to be null/undefined)
    // `NaN` means min/max axis is blank.


    return {
      min: min,
      max: max,
      minFixed: minFixed,
      maxFixed: maxFixed,
      isBlank: isBlank
    };
  };

  ScaleRawExtentInfo.prototype.modifyDataMinMax = function (minMaxName, val) {

    this[DATA_MIN_MAX_ATTR[minMaxName]] = val;
  };

  ScaleRawExtentInfo.prototype.setDeterminedMinMax = function (minMaxName, val) {
    var attr = DETERMINED_MIN_MAX_ATTR[minMaxName];

    this[attr] = val;
  };

  ScaleRawExtentInfo.prototype.freeze = function () {
    // @ts-ignore
    this.frozen = true;
  };

  return ScaleRawExtentInfo;
}();
var DETERMINED_MIN_MAX_ATTR = {
  min: '_determinedMin',
  max: '_determinedMax'
};
var DATA_MIN_MAX_ATTR = {
  min: '_dataMin',
  max: '_dataMax'
};
/**
 * Get scale min max and related info only depends on model settings.
 * This method can be called after coordinate system created.
 * For example, in data processing stage.
 *
 * Scale extent info probably be required multiple times during a workflow.
 * For example:
 * (1) `dataZoom` depends it to get the axis extent in "100%" state.
 * (2) `processor/extentCalculator` depends it to make sure whether axis extent is specified.
 * (3) `coordSys.update` use it to finally decide the scale extent.
 * But the callback of `min`/`max` should not be called multiple times.
 * The code below should not be implemented repeatedly either.
 * So we cache the result in the scale instance, which will be recreated at the begining
 * of the workflow (because `scale` instance will be recreated each round of the workflow).
 */

function ensureScaleRawExtentInfo(scale, model, // Usually: data extent from all series on this axis.
originalExtent) {
  // Do not permit to recreate.
  var rawExtentInfo = scale.rawExtentInfo;

  if (rawExtentInfo) {
    return rawExtentInfo;
  }

  rawExtentInfo = new ScaleRawExtentInfo(scale, model, originalExtent); // @ts-ignore

  scale.rawExtentInfo = rawExtentInfo;
  return rawExtentInfo;
}
function parseAxisModelMinMax(scale, minMax) {
  return minMax == null ? null : eqNaN(minMax) ? NaN : scale.parse(minMax);
}

/**
 * Get axis scale extent before niced.
 * Item of returned array can only be number (including Infinity and NaN).
 *
 * Caution:
 * Precondition of calling this method:
 * The scale extent has been initialized using series data extent via
 * `scale.setExtent` or `scale.unionExtentFromData`;
 */

function getScaleExtent(scale, model) {
  var scaleType = scale.type;
  var rawExtentResult = ensureScaleRawExtentInfo(scale, model, scale.getExtent()).calculate();
  scale.setBlank(rawExtentResult.isBlank);
  var min = rawExtentResult.min;
  var max = rawExtentResult.max; // If bars are placed on a base axis of type time or interval account for axis boundary overflow and current axis
  // is base axis
  // FIXME
  // (1) Consider support value axis, where below zero and axis `onZero` should be handled properly.
  // (2) Refactor the logic with `barGrid`. Is it not need to `makeBarWidthAndOffsetInfo` twice with different extent?
  //     Should not depend on series type `bar`?
  // (3) Fix that might overlap when using dataZoom.
  // (4) Consider other chart types using `barGrid`?
  // See #6728, #4862, `test/bar-overflow-time-plot.html`

  var ecModel = model.ecModel;

  if (ecModel && scaleType === 'time'
  /*|| scaleType === 'interval' */
  ) {
    var barSeriesModels = prepareLayoutBarSeries('bar', ecModel);
    var isBaseAxisAndHasBarSeries_1 = false;
    each$2(barSeriesModels, function (seriesModel) {
      isBaseAxisAndHasBarSeries_1 = isBaseAxisAndHasBarSeries_1 || seriesModel.getBaseAxis() === model.axis;
    });

    if (isBaseAxisAndHasBarSeries_1) {
      // Calculate placement of bars on axis. TODO should be decoupled
      // with barLayout
      var barWidthAndOffset = makeColumnLayout(barSeriesModels); // Adjust axis min and max to account for overflow

      var adjustedScale = adjustScaleForOverflow(min, max, model, barWidthAndOffset);
      min = adjustedScale.min;
      max = adjustedScale.max;
    }
  }

  return {
    extent: [min, max],
    // "fix" means "fixed", the value should not be
    // changed in the subsequent steps.
    fixMin: rawExtentResult.minFixed,
    fixMax: rawExtentResult.maxFixed
  };
}

function adjustScaleForOverflow(min, max, model, // Only support cartesian coord yet.
barWidthAndOffset) {
  // Get Axis Length
  var axisExtent = model.axis.getExtent();
  var axisLength = axisExtent[1] - axisExtent[0]; // Get bars on current base axis and calculate min and max overflow

  var barsOnCurrentAxis = retrieveColumnLayout(barWidthAndOffset, model.axis);

  if (barsOnCurrentAxis === undefined) {
    return {
      min: min,
      max: max
    };
  }

  var minOverflow = Infinity;
  each$2(barsOnCurrentAxis, function (item) {
    minOverflow = Math.min(item.offset, minOverflow);
  });
  var maxOverflow = -Infinity;
  each$2(barsOnCurrentAxis, function (item) {
    maxOverflow = Math.max(item.offset + item.width, maxOverflow);
  });
  minOverflow = Math.abs(minOverflow);
  maxOverflow = Math.abs(maxOverflow);
  var totalOverFlow = minOverflow + maxOverflow; // Calculate required buffer based on old range and overflow

  var oldRange = max - min;
  var oldRangePercentOfNew = 1 - (minOverflow + maxOverflow) / axisLength;
  var overflowBuffer = oldRange / oldRangePercentOfNew - oldRange;
  max += overflowBuffer * (maxOverflow / totalOverFlow);
  min -= overflowBuffer * (minOverflow / totalOverFlow);
  return {
    min: min,
    max: max
  };
} // Precondition of calling this method:
// The scale extent has been initailized using series data extent via
// `scale.setExtent` or `scale.unionExtentFromData`;


function niceScaleExtent(scale, model) {
  var extentInfo = getScaleExtent(scale, model);
  var extent = extentInfo.extent;
  var splitNumber = model.get('splitNumber');

  if (scale instanceof LogScale) {
    scale.base = model.get('logBase');
  }

  var scaleType = scale.type;
  scale.setExtent(extent[0], extent[1]);
  scale.niceExtent({
    splitNumber: splitNumber,
    fixMin: extentInfo.fixMin,
    fixMax: extentInfo.fixMax,
    minInterval: scaleType === 'interval' || scaleType === 'time' ? model.get('minInterval') : null,
    maxInterval: scaleType === 'interval' || scaleType === 'time' ? model.get('maxInterval') : null
  }); // If some one specified the min, max. And the default calculated interval
  // is not good enough. He can specify the interval. It is often appeared
  // in angle axis with angle 0 - 360. Interval calculated in interval scale is hard
  // to be 60.
  // FIXME

  var interval = model.get('interval');

  if (interval != null) {
    scale.setInterval && scale.setInterval(interval);
  }
}
/**
 * @param axisType Default retrieve from model.type
 */

function createScaleByModel(model, axisType) {
  axisType = axisType || model.get('type');

  if (axisType) {
    switch (axisType) {
      // Buildin scale
      case 'category':
        return new OrdinalScale({
          ordinalMeta: model.getOrdinalMeta ? model.getOrdinalMeta() : model.getCategories(),
          extent: [Infinity, -Infinity]
        });

      case 'time':
        return new TimeScale({
          locale: model.ecModel.getLocaleModel(),
          useUTC: model.ecModel.get('useUTC')
        });

      default:
        // case 'value'/'interval', 'log', or others.
        return new (Scale.getClass(axisType) || IntervalScale)();
    }
  }
}
/**
 * Check if the axis cross 0
 */

function ifAxisCrossZero(axis) {
  var dataExtent = axis.scale.getExtent();
  var min = dataExtent[0];
  var max = dataExtent[1];
  return !(min > 0 && max > 0 || min < 0 && max < 0);
}
/**
 * @param axis
 * @return Label formatter function.
 *         param: {number} tickValue,
 *         param: {number} idx, the index in all ticks.
 *                         If category axis, this param is not required.
 *         return: {string} label string.
 */

function makeLabelFormatter(axis) {
  var labelFormatter = axis.getLabelModel().get('formatter');
  var categoryTickStart = axis.type === 'category' ? axis.scale.getExtent()[0] : null;

  if (axis.scale.type === 'time') {
    return function (tpl) {
      return function (tick, idx) {
        return axis.scale.getFormattedLabel(tick, idx, tpl);
      };
    }(labelFormatter);
  } else if (typeof labelFormatter === 'string') {
    return function (tpl) {
      return function (tick) {
        // For category axis, get raw value; for numeric axis,
        // get formatted label like '1,333,444'.
        var label = axis.scale.getLabel(tick);
        var text = tpl.replace('{value}', label != null ? label : '');
        return text;
      };
    }(labelFormatter);
  } else if (typeof labelFormatter === 'function') {
    return function (cb) {
      return function (tick, idx) {
        // The original intention of `idx` is "the index of the tick in all ticks".
        // But the previous implementation of category axis do not consider the
        // `axisLabel.interval`, which cause that, for example, the `interval` is
        // `1`, then the ticks "name5", "name7", "name9" are displayed, where the
        // corresponding `idx` are `0`, `2`, `4`, but not `0`, `1`, `2`. So we keep
        // the definition here for back compatibility.
        if (categoryTickStart != null) {
          idx = tick.value - categoryTickStart;
        }

        return cb(getAxisRawValue(axis, tick), idx, tick.level != null ? {
          level: tick.level
        } : null);
      };
    }(labelFormatter);
  } else {
    return function (tick) {
      return axis.scale.getLabel(tick);
    };
  }
}
function getAxisRawValue(axis, tick) {
  // In category axis with data zoom, tick is not the original
  // index of axis.data. So tick should not be exposed to user
  // in category axis.
  return axis.type === 'category' ? axis.scale.getLabel(tick) : tick.value;
}
/**
 * @param axis
 * @return Be null/undefined if no labels.
 */

function estimateLabelUnionRect(axis) {
  var axisModel = axis.model;
  var scale = axis.scale;

  if (!axisModel.get(['axisLabel', 'show']) || scale.isBlank()) {
    return;
  }

  var realNumberScaleTicks;
  var tickCount;
  var categoryScaleExtent = scale.getExtent(); // Optimize for large category data, avoid call `getTicks()`.

  if (scale instanceof OrdinalScale) {
    tickCount = scale.count();
  } else {
    realNumberScaleTicks = scale.getTicks();
    tickCount = realNumberScaleTicks.length;
  }

  var axisLabelModel = axis.getLabelModel();
  var labelFormatter = makeLabelFormatter(axis);
  var rect;
  var step = 1; // Simple optimization for large amount of labels

  if (tickCount > 40) {
    step = Math.ceil(tickCount / 40);
  }

  for (var i = 0; i < tickCount; i += step) {
    var tick = realNumberScaleTicks ? realNumberScaleTicks[i] : {
      value: categoryScaleExtent[0] + i
    };
    var label = labelFormatter(tick, i);
    var unrotatedSingleRect = axisLabelModel.getTextRect(label);
    var singleRect = rotateTextRect(unrotatedSingleRect, axisLabelModel.get('rotate') || 0);
    rect ? rect.union(singleRect) : rect = singleRect;
  }

  return rect;
}

function rotateTextRect(textRect, rotate) {
  var rotateRadians = rotate * Math.PI / 180;
  var beforeWidth = textRect.width;
  var beforeHeight = textRect.height;
  var afterWidth = beforeWidth * Math.abs(Math.cos(rotateRadians)) + Math.abs(beforeHeight * Math.sin(rotateRadians));
  var afterHeight = beforeWidth * Math.abs(Math.sin(rotateRadians)) + Math.abs(beforeHeight * Math.cos(rotateRadians));
  var rotatedRect = new BoundingRect(textRect.x, textRect.y, afterWidth, afterHeight);
  return rotatedRect;
}
/**
 * @param model axisLabelModel or axisTickModel
 * @return {number|String} Can be null|'auto'|number|function
 */


function getOptionCategoryInterval(model) {
  var interval = model.get('interval');
  return interval == null ? 'auto' : interval;
}
/**
 * Set `categoryInterval` as 0 implicitly indicates that
 * show all labels reguardless of overlap.
 * @param {Object} axis axisModel.axis
 */

function shouldShowAllLabels(axis) {
  return axis.type === 'category' && getOptionCategoryInterval(axis.getLabelModel()) === 0;
}
function getDataDimensionsOnAxis(data, axisDim) {
  // Remove duplicated dat dimensions caused by `getStackedDimension`.
  var dataDimMap = {}; // Currently `mapDimensionsAll` will contain stack result dimension ('__\0ecstackresult').
  // PENDING: is it reasonable? Do we need to remove the original dim from "coord dim" since
  // there has been stacked result dim?

  each$2(data.mapDimensionsAll(axisDim), function (dataDim) {
    // For example, the extent of the original dimension
    // is [0.1, 0.5], the extent of the `stackResultDimension`
    // is [7, 9], the final extent should NOT include [0.1, 0.5],
    // because there is no graphic corresponding to [0.1, 0.5].
    // See the case in `test/area-stack.html` `main1`, where area line
    // stack needs `yAxis` not start from 0.
    dataDimMap[getStackedDimension(data, dataDim)] = true;
  });
  return keys(dataDimMap);
}
function unionAxisExtentFromData(dataExtent, data, axisDim) {
  if (data) {
    each$2(getDataDimensionsOnAxis(data, axisDim), function (dim) {
      var seriesExtent = data.getApproximateExtent(dim);
      seriesExtent[0] < dataExtent[0] && (dataExtent[0] = seriesExtent[0]);
      seriesExtent[1] > dataExtent[1] && (dataExtent[1] = seriesExtent[1]);
    });
  }
}

var inner = makeInner();
function createAxisLabels(axis) {
  // Only ordinal scale support tick interval
  return axis.type === 'category' ? makeCategoryLabels(axis) : makeRealNumberLabels(axis);
}
/**
 * @param {module:echats/coord/Axis} axis
 * @param {module:echarts/model/Model} tickModel For example, can be axisTick, splitLine, splitArea.
 * @return {Object} {
 *     ticks: Array.<number>
 *     tickCategoryInterval: number
 * }
 */

function createAxisTicks(axis, tickModel) {
  // Only ordinal scale support tick interval
  return axis.type === 'category' ? makeCategoryTicks(axis, tickModel) : {
    ticks: map(axis.scale.getTicks(), function (tick) {
      return tick.value;
    })
  };
}

function makeCategoryLabels(axis) {
  var labelModel = axis.getLabelModel();
  var result = makeCategoryLabelsActually(axis, labelModel);
  return !labelModel.get('show') || axis.scale.isBlank() ? {
    labels: [],
    labelCategoryInterval: result.labelCategoryInterval
  } : result;
}

function makeCategoryLabelsActually(axis, labelModel) {
  var labelsCache = getListCache(axis, 'labels');
  var optionLabelInterval = getOptionCategoryInterval(labelModel);
  var result = listCacheGet(labelsCache, optionLabelInterval);

  if (result) {
    return result;
  }

  var labels;
  var numericLabelInterval;

  if (isFunction$1(optionLabelInterval)) {
    labels = makeLabelsByCustomizedCategoryInterval(axis, optionLabelInterval);
  } else {
    numericLabelInterval = optionLabelInterval === 'auto' ? makeAutoCategoryInterval(axis) : optionLabelInterval;
    labels = makeLabelsByNumericCategoryInterval(axis, numericLabelInterval);
  } // Cache to avoid calling interval function repeatly.


  return listCacheSet(labelsCache, optionLabelInterval, {
    labels: labels,
    labelCategoryInterval: numericLabelInterval
  });
}

function makeCategoryTicks(axis, tickModel) {
  var ticksCache = getListCache(axis, 'ticks');
  var optionTickInterval = getOptionCategoryInterval(tickModel);
  var result = listCacheGet(ticksCache, optionTickInterval);

  if (result) {
    return result;
  }

  var ticks;
  var tickCategoryInterval; // Optimize for the case that large category data and no label displayed,
  // we should not return all ticks.

  if (!tickModel.get('show') || axis.scale.isBlank()) {
    ticks = [];
  }

  if (isFunction$1(optionTickInterval)) {
    ticks = makeLabelsByCustomizedCategoryInterval(axis, optionTickInterval, true);
  } // Always use label interval by default despite label show. Consider this
  // scenario, Use multiple grid with the xAxis sync, and only one xAxis shows
  // labels. `splitLine` and `axisTick` should be consistent in this case.
  else if (optionTickInterval === 'auto') {
      var labelsResult = makeCategoryLabelsActually(axis, axis.getLabelModel());
      tickCategoryInterval = labelsResult.labelCategoryInterval;
      ticks = map(labelsResult.labels, function (labelItem) {
        return labelItem.tickValue;
      });
    } else {
      tickCategoryInterval = optionTickInterval;
      ticks = makeLabelsByNumericCategoryInterval(axis, tickCategoryInterval, true);
    } // Cache to avoid calling interval function repeatly.


  return listCacheSet(ticksCache, optionTickInterval, {
    ticks: ticks,
    tickCategoryInterval: tickCategoryInterval
  });
}

function makeRealNumberLabels(axis) {
  var ticks = axis.scale.getTicks();
  var labelFormatter = makeLabelFormatter(axis);
  return {
    labels: map(ticks, function (tick, idx) {
      return {
        formattedLabel: labelFormatter(tick, idx),
        rawLabel: axis.scale.getLabel(tick),
        tickValue: tick.value
      };
    })
  };
}

function getListCache(axis, prop) {
  // Because key can be funciton, and cache size always be small, we use array cache.
  return inner(axis)[prop] || (inner(axis)[prop] = []);
}

function listCacheGet(cache, key) {
  for (var i = 0; i < cache.length; i++) {
    if (cache[i].key === key) {
      return cache[i].value;
    }
  }
}

function listCacheSet(cache, key, value) {
  cache.push({
    key: key,
    value: value
  });
  return value;
}

function makeAutoCategoryInterval(axis) {
  var result = inner(axis).autoInterval;
  return result != null ? result : inner(axis).autoInterval = axis.calculateCategoryInterval();
}
/**
 * Calculate interval for category axis ticks and labels.
 * To get precise result, at least one of `getRotate` and `isHorizontal`
 * should be implemented in axis.
 */


function calculateCategoryInterval(axis) {
  var params = fetchAutoCategoryIntervalCalculationParams(axis);
  var labelFormatter = makeLabelFormatter(axis);
  var rotation = (params.axisRotate - params.labelRotate) / 180 * Math.PI;
  var ordinalScale = axis.scale;
  var ordinalExtent = ordinalScale.getExtent(); // Providing this method is for optimization:
  // avoid generating a long array by `getTicks`
  // in large category data case.

  var tickCount = ordinalScale.count();

  if (ordinalExtent[1] - ordinalExtent[0] < 1) {
    return 0;
  }

  var step = 1; // Simple optimization. Empirical value: tick count should less than 40.

  if (tickCount > 40) {
    step = Math.max(1, Math.floor(tickCount / 40));
  }

  var tickValue = ordinalExtent[0];
  var unitSpan = axis.dataToCoord(tickValue + 1) - axis.dataToCoord(tickValue);
  var unitW = Math.abs(unitSpan * Math.cos(rotation));
  var unitH = Math.abs(unitSpan * Math.sin(rotation));
  var maxW = 0;
  var maxH = 0; // Caution: Performance sensitive for large category data.
  // Consider dataZoom, we should make appropriate step to avoid O(n) loop.

  for (; tickValue <= ordinalExtent[1]; tickValue += step) {
    var width = 0;
    var height = 0; // Not precise, do not consider align and vertical align
    // and each distance from axis line yet.

    var rect = getBoundingRect(labelFormatter({
      value: tickValue
    }), params.font, 'center', 'top'); // Magic number

    width = rect.width * 1.3;
    height = rect.height * 1.3; // Min size, void long loop.

    maxW = Math.max(maxW, width, 7);
    maxH = Math.max(maxH, height, 7);
  }

  var dw = maxW / unitW;
  var dh = maxH / unitH; // 0/0 is NaN, 1/0 is Infinity.

  isNaN(dw) && (dw = Infinity);
  isNaN(dh) && (dh = Infinity);
  var interval = Math.max(0, Math.floor(Math.min(dw, dh)));
  var cache = inner(axis.model);
  var axisExtent = axis.getExtent();
  var lastAutoInterval = cache.lastAutoInterval;
  var lastTickCount = cache.lastTickCount; // Use cache to keep interval stable while moving zoom window,
  // otherwise the calculated interval might jitter when the zoom
  // window size is close to the interval-changing size.
  // For example, if all of the axis labels are `a, b, c, d, e, f, g`.
  // The jitter will cause that sometimes the displayed labels are
  // `a, d, g` (interval: 2) sometimes `a, c, e`(interval: 1).

  if (lastAutoInterval != null && lastTickCount != null && Math.abs(lastAutoInterval - interval) <= 1 && Math.abs(lastTickCount - tickCount) <= 1 // Always choose the bigger one, otherwise the critical
  // point is not the same when zooming in or zooming out.
  && lastAutoInterval > interval // If the axis change is caused by chart resize, the cache should not
  // be used. Otherwise some hiden labels might not be shown again.
  && cache.axisExtent0 === axisExtent[0] && cache.axisExtent1 === axisExtent[1]) {
    interval = lastAutoInterval;
  } // Only update cache if cache not used, otherwise the
  // changing of interval is too insensitive.
  else {
      cache.lastTickCount = tickCount;
      cache.lastAutoInterval = interval;
      cache.axisExtent0 = axisExtent[0];
      cache.axisExtent1 = axisExtent[1];
    }

  return interval;
}

function fetchAutoCategoryIntervalCalculationParams(axis) {
  var labelModel = axis.getLabelModel();
  return {
    axisRotate: axis.getRotate ? axis.getRotate() : axis.isHorizontal && !axis.isHorizontal() ? 90 : 0,
    labelRotate: labelModel.get('rotate') || 0,
    font: labelModel.getFont()
  };
}

function makeLabelsByNumericCategoryInterval(axis, categoryInterval, onlyTick) {
  var labelFormatter = makeLabelFormatter(axis);
  var ordinalScale = axis.scale;
  var ordinalExtent = ordinalScale.getExtent();
  var labelModel = axis.getLabelModel();
  var result = []; // TODO: axisType: ordinalTime, pick the tick from each month/day/year/...

  var step = Math.max((categoryInterval || 0) + 1, 1);
  var startTick = ordinalExtent[0];
  var tickCount = ordinalScale.count(); // Calculate start tick based on zero if possible to keep label consistent
  // while zooming and moving while interval > 0. Otherwise the selection
  // of displayable ticks and symbols probably keep changing.
  // 3 is empirical value.

  if (startTick !== 0 && step > 1 && tickCount / step > 2) {
    startTick = Math.round(Math.ceil(startTick / step) * step);
  } // (1) Only add min max label here but leave overlap checking
  // to render stage, which also ensure the returned list
  // suitable for splitLine and splitArea rendering.
  // (2) Scales except category always contain min max label so
  // do not need to perform this process.


  var showAllLabel = shouldShowAllLabels(axis);
  var includeMinLabel = labelModel.get('showMinLabel') || showAllLabel;
  var includeMaxLabel = labelModel.get('showMaxLabel') || showAllLabel;

  if (includeMinLabel && startTick !== ordinalExtent[0]) {
    addItem(ordinalExtent[0]);
  } // Optimize: avoid generating large array by `ordinalScale.getTicks()`.


  var tickValue = startTick;

  for (; tickValue <= ordinalExtent[1]; tickValue += step) {
    addItem(tickValue);
  }

  if (includeMaxLabel && tickValue - step !== ordinalExtent[1]) {
    addItem(ordinalExtent[1]);
  }

  function addItem(tickValue) {
    var tickObj = {
      value: tickValue
    };
    result.push(onlyTick ? tickValue : {
      formattedLabel: labelFormatter(tickObj),
      rawLabel: ordinalScale.getLabel(tickObj),
      tickValue: tickValue
    });
  }

  return result;
}

function makeLabelsByCustomizedCategoryInterval(axis, categoryInterval, onlyTick) {
  var ordinalScale = axis.scale;
  var labelFormatter = makeLabelFormatter(axis);
  var result = [];
  each$2(ordinalScale.getTicks(), function (tick) {
    var rawLabel = ordinalScale.getLabel(tick);
    var tickValue = tick.value;

    if (categoryInterval(tick.value, rawLabel)) {
      result.push(onlyTick ? tickValue : {
        formattedLabel: labelFormatter(tick),
        rawLabel: rawLabel,
        tickValue: tickValue
      });
    }
  });
  return result;
}

var NORMALIZED_EXTENT = [0, 1];
/**
 * Base class of Axis.
 */

var Axis =
/** @class */
function () {
  function Axis(dim, scale, extent) {
    this.onBand = false;
    this.inverse = false;
    this.dim = dim;
    this.scale = scale;
    this._extent = extent || [0, 0];
  }
  /**
   * If axis extent contain given coord
   */


  Axis.prototype.contain = function (coord) {
    var extent = this._extent;
    var min = Math.min(extent[0], extent[1]);
    var max = Math.max(extent[0], extent[1]);
    return coord >= min && coord <= max;
  };
  /**
   * If axis extent contain given data
   */


  Axis.prototype.containData = function (data) {
    return this.scale.contain(data);
  };
  /**
   * Get coord extent.
   */


  Axis.prototype.getExtent = function () {
    return this._extent.slice();
  };
  /**
   * Get precision used for formatting
   */


  Axis.prototype.getPixelPrecision = function (dataExtent) {
    return getPixelPrecision(dataExtent || this.scale.getExtent(), this._extent);
  };
  /**
   * Set coord extent
   */


  Axis.prototype.setExtent = function (start, end) {
    var extent = this._extent;
    extent[0] = start;
    extent[1] = end;
  };
  /**
   * Convert data to coord. Data is the rank if it has an ordinal scale
   */


  Axis.prototype.dataToCoord = function (data, clamp) {
    var extent = this._extent;
    var scale = this.scale;
    data = scale.normalize(data);

    if (this.onBand && scale.type === 'ordinal') {
      extent = extent.slice();
      fixExtentWithBands(extent, scale.count());
    }

    return linearMap(data, NORMALIZED_EXTENT, extent, clamp);
  };
  /**
   * Convert coord to data. Data is the rank if it has an ordinal scale
   */


  Axis.prototype.coordToData = function (coord, clamp) {
    var extent = this._extent;
    var scale = this.scale;

    if (this.onBand && scale.type === 'ordinal') {
      extent = extent.slice();
      fixExtentWithBands(extent, scale.count());
    }

    var t = linearMap(coord, extent, NORMALIZED_EXTENT, clamp);
    return this.scale.scale(t);
  };
  /**
   * Convert pixel point to data in axis
   */


  Axis.prototype.pointToData = function (point, clamp) {
    // Should be implemented in derived class if necessary.
    return;
  };
  /**
   * Different from `zrUtil.map(axis.getTicks(), axis.dataToCoord, axis)`,
   * `axis.getTicksCoords` considers `onBand`, which is used by
   * `boundaryGap:true` of category axis and splitLine and splitArea.
   * @param opt.tickModel default: axis.model.getModel('axisTick')
   * @param opt.clamp If `true`, the first and the last
   *        tick must be at the axis end points. Otherwise, clip ticks
   *        that outside the axis extent.
   */


  Axis.prototype.getTicksCoords = function (opt) {
    opt = opt || {};
    var tickModel = opt.tickModel || this.getTickModel();
    var result = createAxisTicks(this, tickModel);
    var ticks = result.ticks;
    var ticksCoords = map(ticks, function (tickVal) {
      return {
        coord: this.dataToCoord(this.scale.type === 'ordinal' ? this.scale.getRawOrdinalNumber(tickVal) : tickVal),
        tickValue: tickVal
      };
    }, this);
    var alignWithLabel = tickModel.get('alignWithLabel');
    fixOnBandTicksCoords(this, ticksCoords, alignWithLabel, opt.clamp);
    return ticksCoords;
  };

  Axis.prototype.getMinorTicksCoords = function () {
    if (this.scale.type === 'ordinal') {
      // Category axis doesn't support minor ticks
      return [];
    }

    var minorTickModel = this.model.getModel('minorTick');
    var splitNumber = minorTickModel.get('splitNumber'); // Protection.

    if (!(splitNumber > 0 && splitNumber < 100)) {
      splitNumber = 5;
    }

    var minorTicks = this.scale.getMinorTicks(splitNumber);
    var minorTicksCoords = map(minorTicks, function (minorTicksGroup) {
      return map(minorTicksGroup, function (minorTick) {
        return {
          coord: this.dataToCoord(minorTick),
          tickValue: minorTick
        };
      }, this);
    }, this);
    return minorTicksCoords;
  };

  Axis.prototype.getViewLabels = function () {
    return createAxisLabels(this).labels;
  };

  Axis.prototype.getLabelModel = function () {
    return this.model.getModel('axisLabel');
  };
  /**
   * Notice here we only get the default tick model. For splitLine
   * or splitArea, we should pass the splitLineModel or splitAreaModel
   * manually when calling `getTicksCoords`.
   * In GL, this method may be overrided to:
   * `axisModel.getModel('axisTick', grid3DModel.getModel('axisTick'));`
   */


  Axis.prototype.getTickModel = function () {
    return this.model.getModel('axisTick');
  };
  /**
   * Get width of band
   */


  Axis.prototype.getBandWidth = function () {
    var axisExtent = this._extent;
    var dataExtent = this.scale.getExtent();
    var len = dataExtent[1] - dataExtent[0] + (this.onBand ? 1 : 0); // Fix #2728, avoid NaN when only one data.

    len === 0 && (len = 1);
    var size = Math.abs(axisExtent[1] - axisExtent[0]);
    return Math.abs(size) / len;
  };
  /**
   * Only be called in category axis.
   * Can be overrided, consider other axes like in 3D.
   * @return Auto interval for cateogry axis tick and label
   */


  Axis.prototype.calculateCategoryInterval = function () {
    return calculateCategoryInterval(this);
  };

  return Axis;
}();

function fixExtentWithBands(extent, nTick) {
  var size = extent[1] - extent[0];
  var len = nTick;
  var margin = size / len / 2;
  extent[0] += margin;
  extent[1] -= margin;
} // If axis has labels [1, 2, 3, 4]. Bands on the axis are
// |---1---|---2---|---3---|---4---|.
// So the displayed ticks and splitLine/splitArea should between
// each data item, otherwise cause misleading (e.g., split tow bars
// of a single data item when there are two bar series).
// Also consider if tickCategoryInterval > 0 and onBand, ticks and
// splitLine/spliteArea should layout appropriately corresponding
// to displayed labels. (So we should not use `getBandWidth` in this
// case).


function fixOnBandTicksCoords(axis, ticksCoords, alignWithLabel, clamp) {
  var ticksLen = ticksCoords.length;

  if (!axis.onBand || alignWithLabel || !ticksLen) {
    return;
  }

  var axisExtent = axis.getExtent();
  var last;
  var diffSize;

  if (ticksLen === 1) {
    ticksCoords[0].coord = axisExtent[0];
    last = ticksCoords[1] = {
      coord: axisExtent[0]
    };
  } else {
    var crossLen = ticksCoords[ticksLen - 1].tickValue - ticksCoords[0].tickValue;
    var shift_1 = (ticksCoords[ticksLen - 1].coord - ticksCoords[0].coord) / crossLen;
    each$2(ticksCoords, function (ticksItem) {
      ticksItem.coord -= shift_1 / 2;
    });
    var dataExtent = axis.scale.getExtent();
    diffSize = 1 + dataExtent[1] - ticksCoords[ticksLen - 1].tickValue;
    last = {
      coord: ticksCoords[ticksLen - 1].coord + shift_1 * diffSize
    };
    ticksCoords.push(last);
  }

  var inverse = axisExtent[0] > axisExtent[1]; // Handling clamp.

  if (littleThan(ticksCoords[0].coord, axisExtent[0])) {
    clamp ? ticksCoords[0].coord = axisExtent[0] : ticksCoords.shift();
  }

  if (clamp && littleThan(axisExtent[0], ticksCoords[0].coord)) {
    ticksCoords.unshift({
      coord: axisExtent[0]
    });
  }

  if (littleThan(axisExtent[1], last.coord)) {
    clamp ? last.coord = axisExtent[1] : ticksCoords.pop();
  }

  if (clamp && littleThan(last.coord, axisExtent[1])) {
    ticksCoords.push({
      coord: axisExtent[1]
    });
  }

  function littleThan(a, b) {
    // Avoid rounding error cause calculated tick coord different with extent.
    // It may cause an extra unecessary tick added.
    a = round(a);
    b = round(b);
    return inverse ? a > b : a < b;
  }
}

export { AxisModelCommonMixin as A, getInstanceByDom as B, ComponentView as C, getInstanceById as D, registerTheme as E, registerPreprocessor as F, registerProcessor as G, registerPostInit as H, registerPostUpdate as I, registerCoordinateSystem as J, getCoordinateSystemDimensions as K, registerLayout as L, registerVisual as M, registerLoading as N, OrdinalMeta as O, PRIORITY as P, setCanvasCreator as Q, registerMap as R, getMap as S, registerTransform as T, dataTool as U, zrender as V, throttle as W, Axis as a, isMiddleOrRightButtonOnMouseUpDown as b, createScaleByModel as c, stop as d, estimateLabelUnionRect as e, createOrUpdate as f, getDataDimensionsOnAxis as g, getAxisRawValue as h, ifAxisCrossZero as i, unionAxisExtentFromData as j, ensureScaleRawExtentInfo as k, normalizeEvent as l, findEventDispatcher as m, niceScaleExtent as n, clear as o, dependencies as p, init as q, registerAction as r, shouldShowAllLabels as s, transformLocalCoord as t, use as u, version as v, connect as w, disConnect as x, disconnect as y, dispose as z };
