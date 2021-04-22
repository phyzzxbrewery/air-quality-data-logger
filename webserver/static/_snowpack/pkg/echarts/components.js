import { _ as __extends, ag as mixin, af as merge, f as defaults, g as each$4, m as map, am as filter, ad as invert, S as applyTransform, G as BoundingRect, an as retrieve, a as isObject, k as indexOf, e as extend, aa as identity, ao as rotate, ab as mul, p as curry$1, l as clone$1, i as isArray, h as createHashMap, ak as bind$2, n as isString, ap as Eventful, o as isFunction, aq as translate, ar as getBoundingRect, as as create, N as env, at as isDom, au as toHex, J as trim, v as retrieve2, av as parse, aw as stringify, a9 as Point } from '../common/IncrementalDisplayable-eed1c2a2.js';
import { Q as ComponentModel, J as SINGLE_REFERRING, T as fetchLayoutMode, U as getLayoutParams, W as mergeLayoutParam, X as getLayoutRect, Y as Line, c as createSymbol, Z as ZRText, _ as createTextStyle, b as getECData, $ as remRadian, a0 as isRadianAroundZero, M as Model, G as Group$2, a1 as makeInner, R as Rect$1, a2 as groupTransition, a3 as graphic, a4 as createIcon, u as updateProps$1, a5 as applyTransform$1, a6 as normalizeCssArray, q as queryDataIndex, a7 as MULTIPLE_REFERRING, a8 as linearMap, a9 as getPixelPrecision, aa as asc$1, k as convertToColorString, ab as getPaddingFromTooltipModel, ac as toCamelCase, ad as throwError, ae as getTooltipRenderMode, af as createTooltipMarkup, ag as normalizeTooltipFormatResult, ah as buildTooltipMarkup, ai as format, aj as formatTpl, p as parsePercent$1, ak as TooltipMarkupStyleCreator, al as windowOpen, am as isNameSpecified, s as setLabelStyle, a as enableHoverEmphasis, an as box, ao as inheritDefaultOption, ap as symbolBuildProxies, aq as getTransform, ar as transformDirection, as as Polygon, at as Polyline } from '../common/Chart-15166683.js';
import { A as AxisModelCommonMixin, O as OrdinalMeta, a as Axis, n as niceScaleExtent, e as estimateLabelUnionRect, c as createScaleByModel, g as getDataDimensionsOnAxis, i as ifAxisCrossZero, s as shouldShowAllLabels, C as ComponentView, r as registerAction, b as isMiddleOrRightButtonOnMouseUpDown, d as stop, f as createOrUpdate, h as getAxisRawValue, u as use, j as unionAxisExtentFromData, k as ensureScaleRawExtentInfo, l as normalizeEvent, t as transformLocalCoord, m as findEventDispatcher, o as clear } from '../common/Axis-31e5f396.js';
import '../common/graphic-69704314.js';

var GridModel =
/** @class */
function (_super) {
  __extends(GridModel, _super);

  function GridModel() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  GridModel.type = 'grid';
  GridModel.dependencies = ['xAxis', 'yAxis'];
  GridModel.layoutMode = 'box';
  GridModel.defaultOption = {
    show: false,
    zlevel: 0,
    z: 0,
    left: '10%',
    top: 60,
    right: '10%',
    bottom: 70,
    // If grid size contain label
    containLabel: false,
    // width: {totalWidth} - left - right,
    // height: {totalHeight} - top - bottom,
    backgroundColor: 'rgba(0,0,0,0)',
    borderWidth: 1,
    borderColor: '#ccc'
  };
  return GridModel;
}(ComponentModel);

var CartesianAxisModel =
/** @class */
function (_super) {
  __extends(CartesianAxisModel, _super);

  function CartesianAxisModel() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  CartesianAxisModel.prototype.getCoordSysModel = function () {
    return this.getReferringComponents('grid', SINGLE_REFERRING).models[0];
  };

  CartesianAxisModel.type = 'cartesian2dAxis';
  return CartesianAxisModel;
}(ComponentModel);
mixin(CartesianAxisModel, AxisModelCommonMixin);

var defaultOption = {
  show: true,
  zlevel: 0,
  z: 0,
  // Inverse the axis.
  inverse: false,
  // Axis name displayed.
  name: '',
  // 'start' | 'middle' | 'end'
  nameLocation: 'end',
  // By degree. By default auto rotate by nameLocation.
  nameRotate: null,
  nameTruncate: {
    maxWidth: null,
    ellipsis: '...',
    placeholder: '.'
  },
  // Use global text style by default.
  nameTextStyle: {},
  // The gap between axisName and axisLine.
  nameGap: 15,
  // Default `false` to support tooltip.
  silent: false,
  // Default `false` to avoid legacy user event listener fail.
  triggerEvent: false,
  tooltip: {
    show: false
  },
  axisPointer: {},
  axisLine: {
    show: true,
    onZero: true,
    onZeroAxisIndex: null,
    lineStyle: {
      color: '#6E7079',
      width: 1,
      type: 'solid'
    },
    // The arrow at both ends the the axis.
    symbol: ['none', 'none'],
    symbolSize: [10, 15]
  },
  axisTick: {
    show: true,
    // Whether axisTick is inside the grid or outside the grid.
    inside: false,
    // The length of axisTick.
    length: 5,
    lineStyle: {
      width: 1
    }
  },
  axisLabel: {
    show: true,
    // Whether axisLabel is inside the grid or outside the grid.
    inside: false,
    rotate: 0,
    // true | false | null/undefined (auto)
    showMinLabel: null,
    // true | false | null/undefined (auto)
    showMaxLabel: null,
    margin: 8,
    // formatter: null,
    fontSize: 12
  },
  splitLine: {
    show: true,
    lineStyle: {
      color: ['#E0E6F1'],
      width: 1,
      type: 'solid'
    }
  },
  splitArea: {
    show: false,
    areaStyle: {
      color: ['rgba(250,250,250,0.2)', 'rgba(210,219,238,0.2)']
    }
  }
};
var categoryAxis = merge({
  // The gap at both ends of the axis. For categoryAxis, boolean.
  boundaryGap: true,
  // Set false to faster category collection.
  deduplication: null,
  // splitArea: {
  // show: false
  // },
  splitLine: {
    show: false
  },
  axisTick: {
    // If tick is align with label when boundaryGap is true
    alignWithLabel: false,
    interval: 'auto'
  },
  axisLabel: {
    interval: 'auto'
  }
}, defaultOption);
var valueAxis = merge({
  boundaryGap: [0, 0],
  axisLine: {
    // Not shown when other axis is categoryAxis in cartesian
    show: 'auto'
  },
  axisTick: {
    // Not shown when other axis is categoryAxis in cartesian
    show: 'auto'
  },
  // TODO
  // min/max: [30, datamin, 60] or [20, datamin] or [datamin, 60]
  splitNumber: 5,
  minorTick: {
    // Minor tick, not available for cateogry axis.
    show: false,
    // Split number of minor ticks. The value should be in range of (0, 100)
    splitNumber: 5,
    // Lenght of minor tick
    length: 3,
    // Line style
    lineStyle: {// Default to be same with axisTick
    }
  },
  minorSplitLine: {
    show: false,
    lineStyle: {
      color: '#F4F7FD',
      width: 1
    }
  }
}, defaultOption);
var timeAxis = merge({
  scale: true,
  splitNumber: 6,
  axisLabel: {
    // To eliminate labels that are not nice
    showMinLabel: false,
    showMaxLabel: false,
    rich: {
      primary: {
        fontWeight: 'bold'
      }
    }
  },
  splitLine: {
    show: false
  }
}, valueAxis);
var logAxis = defaults({
  scale: true,
  logBase: 10
}, valueAxis);
var axisDefault = {
  category: categoryAxis,
  value: valueAxis,
  time: timeAxis,
  log: logAxis
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
var AXIS_TYPES = {
  value: 1,
  category: 1,
  time: 1,
  log: 1
};

/**
 * Generate sub axis model class
 * @param axisName 'x' 'y' 'radius' 'angle' 'parallel' ...
 */

function axisModelCreator(registers, axisName, BaseAxisModelClass, extraDefaultOption) {
  each$4(AXIS_TYPES, function (v, axisType) {
    var defaultOption = merge(merge({}, axisDefault[axisType], true), extraDefaultOption, true);

    var AxisModel =
    /** @class */
    function (_super) {
      __extends(AxisModel, _super);

      function AxisModel() {
        var args = [];

        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }

        var _this = _super.apply(this, args) || this;

        _this.type = axisName + 'Axis.' + axisType;
        return _this;
      }

      AxisModel.prototype.mergeDefaultAndTheme = function (option, ecModel) {
        var layoutMode = fetchLayoutMode(this);
        var inputPositionParams = layoutMode ? getLayoutParams(option) : {};
        var themeModel = ecModel.getTheme();
        merge(option, themeModel.get(axisType + 'Axis'));
        merge(option, this.getDefaultOption());
        option.type = getAxisType(option);

        if (layoutMode) {
          mergeLayoutParam(option, inputPositionParams, layoutMode);
        }
      };

      AxisModel.prototype.optionUpdated = function () {
        var thisOption = this.option;

        if (thisOption.type === 'category') {
          this.__ordinalMeta = OrdinalMeta.createByAxisModel(this);
        }
      };
      /**
       * Should not be called before all of 'getInitailData' finished.
       * Because categories are collected during initializing data.
       */


      AxisModel.prototype.getCategories = function (rawData) {
        var option = this.option; // FIXME
        // warning if called before all of 'getInitailData' finished.

        if (option.type === 'category') {
          if (rawData) {
            return option.data;
          }

          return this.__ordinalMeta.categories;
        }
      };

      AxisModel.prototype.getOrdinalMeta = function () {
        return this.__ordinalMeta;
      };

      AxisModel.type = axisName + 'Axis.' + axisType;
      AxisModel.defaultOption = defaultOption;
      return AxisModel;
    }(BaseAxisModelClass);

    registers.registerComponentModel(AxisModel);
  });
  registers.registerSubTypeDefaulter(axisName + 'Axis', getAxisType);
}

function getAxisType(option) {
  // Default axis with data is category axis
  return option.type || (option.data ? 'category' : 'value');
}

var Cartesian =
/** @class */
function () {
  function Cartesian(name) {
    this.type = 'cartesian';
    this._dimList = [];
    this._axes = {};
    this.name = name || '';
  }

  Cartesian.prototype.getAxis = function (dim) {
    return this._axes[dim];
  };

  Cartesian.prototype.getAxes = function () {
    return map(this._dimList, function (dim) {
      return this._axes[dim];
    }, this);
  };

  Cartesian.prototype.getAxesByScale = function (scaleType) {
    scaleType = scaleType.toLowerCase();
    return filter(this.getAxes(), function (axis) {
      return axis.scale.type === scaleType;
    });
  };

  Cartesian.prototype.addAxis = function (axis) {
    var dim = axis.dim;
    this._axes[dim] = axis;

    this._dimList.push(dim);
  };

  return Cartesian;
}();

var cartesian2DDimensions = ['x', 'y'];

function canCalculateAffineTransform(scale) {
  return scale.type === 'interval' || scale.type === 'time';
}

var Cartesian2D =
/** @class */
function (_super) {
  __extends(Cartesian2D, _super);

  function Cartesian2D() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = 'cartesian2d';
    _this.dimensions = cartesian2DDimensions;
    return _this;
  }
  /**
   * Calculate an affine transform matrix if two axes are time or value.
   * It's mainly for accelartion on the large time series data.
   */


  Cartesian2D.prototype.calcAffineTransform = function () {
    this._transform = this._invTransform = null;
    var xAxisScale = this.getAxis('x').scale;
    var yAxisScale = this.getAxis('y').scale;

    if (!canCalculateAffineTransform(xAxisScale) || !canCalculateAffineTransform(yAxisScale)) {
      return;
    }

    var xScaleExtent = xAxisScale.getExtent();
    var yScaleExtent = yAxisScale.getExtent();
    var start = this.dataToPoint([xScaleExtent[0], yScaleExtent[0]]);
    var end = this.dataToPoint([xScaleExtent[1], yScaleExtent[1]]);
    var xScaleSpan = xScaleExtent[1] - xScaleExtent[0];
    var yScaleSpan = yScaleExtent[1] - yScaleExtent[0];

    if (!xScaleSpan || !yScaleSpan) {
      return;
    } // Accelerate data to point calculation on the special large time series data.


    var scaleX = (end[0] - start[0]) / xScaleSpan;
    var scaleY = (end[1] - start[1]) / yScaleSpan;
    var translateX = start[0] - xScaleExtent[0] * scaleX;
    var translateY = start[1] - yScaleExtent[0] * scaleY;
    var m = this._transform = [scaleX, 0, 0, scaleY, translateX, translateY];
    this._invTransform = invert([], m);
  };
  /**
   * Base axis will be used on stacking.
   */


  Cartesian2D.prototype.getBaseAxis = function () {
    return this.getAxesByScale('ordinal')[0] || this.getAxesByScale('time')[0] || this.getAxis('x');
  };

  Cartesian2D.prototype.containPoint = function (point) {
    var axisX = this.getAxis('x');
    var axisY = this.getAxis('y');
    return axisX.contain(axisX.toLocalCoord(point[0])) && axisY.contain(axisY.toLocalCoord(point[1]));
  };

  Cartesian2D.prototype.containData = function (data) {
    return this.getAxis('x').containData(data[0]) && this.getAxis('y').containData(data[1]);
  };

  Cartesian2D.prototype.dataToPoint = function (data, reserved, out) {
    out = out || [];
    var xVal = data[0];
    var yVal = data[1]; // Fast path

    if (this._transform // It's supported that if data is like `[Inifity, 123]`, where only Y pixel calculated.
    && xVal != null && isFinite(xVal) && yVal != null && isFinite(yVal)) {
      return applyTransform(out, data, this._transform);
    }

    var xAxis = this.getAxis('x');
    var yAxis = this.getAxis('y');
    out[0] = xAxis.toGlobalCoord(xAxis.dataToCoord(xVal));
    out[1] = yAxis.toGlobalCoord(yAxis.dataToCoord(yVal));
    return out;
  };

  Cartesian2D.prototype.clampData = function (data, out) {
    var xScale = this.getAxis('x').scale;
    var yScale = this.getAxis('y').scale;
    var xAxisExtent = xScale.getExtent();
    var yAxisExtent = yScale.getExtent();
    var x = xScale.parse(data[0]);
    var y = yScale.parse(data[1]);
    out = out || [];
    out[0] = Math.min(Math.max(Math.min(xAxisExtent[0], xAxisExtent[1]), x), Math.max(xAxisExtent[0], xAxisExtent[1]));
    out[1] = Math.min(Math.max(Math.min(yAxisExtent[0], yAxisExtent[1]), y), Math.max(yAxisExtent[0], yAxisExtent[1]));
    return out;
  };

  Cartesian2D.prototype.pointToData = function (point, out) {
    out = out || [];

    if (this._invTransform) {
      return applyTransform(out, point, this._invTransform);
    }

    var xAxis = this.getAxis('x');
    var yAxis = this.getAxis('y');
    out[0] = xAxis.coordToData(xAxis.toLocalCoord(point[0]));
    out[1] = yAxis.coordToData(yAxis.toLocalCoord(point[1]));
    return out;
  };

  Cartesian2D.prototype.getOtherAxis = function (axis) {
    return this.getAxis(axis.dim === 'x' ? 'y' : 'x');
  };
  /**
   * Get rect area of cartesian.
   * Area will have a contain function to determine if a point is in the coordinate system.
   */


  Cartesian2D.prototype.getArea = function () {
    var xExtent = this.getAxis('x').getGlobalExtent();
    var yExtent = this.getAxis('y').getGlobalExtent();
    var x = Math.min(xExtent[0], xExtent[1]);
    var y = Math.min(yExtent[0], yExtent[1]);
    var width = Math.max(xExtent[0], xExtent[1]) - x;
    var height = Math.max(yExtent[0], yExtent[1]) - y;
    return new BoundingRect(x, y, width, height);
  };

  return Cartesian2D;
}(Cartesian);

var Axis2D =
/** @class */
function (_super) {
  __extends(Axis2D, _super);

  function Axis2D(dim, scale, coordExtent, axisType, position) {
    var _this = _super.call(this, dim, scale, coordExtent) || this;
    /**
     * Index of axis, can be used as key
     * Injected outside.
     */


    _this.index = 0;
    _this.type = axisType || 'value';
    _this.position = position || 'bottom';
    return _this;
  }

  Axis2D.prototype.isHorizontal = function () {
    var position = this.position;
    return position === 'top' || position === 'bottom';
  };
  /**
   * Each item cooresponds to this.getExtent(), which
   * means globalExtent[0] may greater than globalExtent[1],
   * unless `asc` is input.
   *
   * @param {boolean} [asc]
   * @return {Array.<number>}
   */


  Axis2D.prototype.getGlobalExtent = function (asc) {
    var ret = this.getExtent();
    ret[0] = this.toGlobalCoord(ret[0]);
    ret[1] = this.toGlobalCoord(ret[1]);
    asc && ret[0] > ret[1] && ret.reverse();
    return ret;
  };

  Axis2D.prototype.pointToData = function (point, clamp) {
    return this.coordToData(this.toLocalCoord(point[this.dim === 'x' ? 0 : 1]), clamp);
  };
  /**
   * Set ordinalSortInfo
   * @param info new OrdinalSortInfo
   */


  Axis2D.prototype.setCategorySortInfo = function (info) {
    if (this.type !== 'category') {
      return false;
    }

    this.model.option.categorySortInfo = info;
    this.scale.setSortInfo(info);
  };

  return Axis2D;
}(Axis);

/**
 * Can only be called after coordinate system creation stage.
 * (Can be called before coordinate system update stage).
 */

function layout(gridModel, axisModel, opt) {
  opt = opt || {};
  var grid = gridModel.coordinateSystem;
  var axis = axisModel.axis;
  var layout = {};
  var otherAxisOnZeroOf = axis.getAxesOnZeroOf()[0];
  var rawAxisPosition = axis.position;
  var axisPosition = otherAxisOnZeroOf ? 'onZero' : rawAxisPosition;
  var axisDim = axis.dim;
  var rect = grid.getRect();
  var rectBound = [rect.x, rect.x + rect.width, rect.y, rect.y + rect.height];
  var idx = {
    left: 0,
    right: 1,
    top: 0,
    bottom: 1,
    onZero: 2
  };
  var axisOffset = axisModel.get('offset') || 0;
  var posBound = axisDim === 'x' ? [rectBound[2] - axisOffset, rectBound[3] + axisOffset] : [rectBound[0] - axisOffset, rectBound[1] + axisOffset];

  if (otherAxisOnZeroOf) {
    var onZeroCoord = otherAxisOnZeroOf.toGlobalCoord(otherAxisOnZeroOf.dataToCoord(0));
    posBound[idx.onZero] = Math.max(Math.min(onZeroCoord, posBound[1]), posBound[0]);
  } // Axis position


  layout.position = [axisDim === 'y' ? posBound[idx[axisPosition]] : rectBound[0], axisDim === 'x' ? posBound[idx[axisPosition]] : rectBound[3]]; // Axis rotation

  layout.rotation = Math.PI / 2 * (axisDim === 'x' ? 0 : 1); // Tick and label direction, x y is axisDim

  var dirMap = {
    top: -1,
    bottom: 1,
    left: -1,
    right: 1
  };
  layout.labelDirection = layout.tickDirection = layout.nameDirection = dirMap[rawAxisPosition];
  layout.labelOffset = otherAxisOnZeroOf ? posBound[idx[rawAxisPosition]] - posBound[idx.onZero] : 0;

  if (axisModel.get(['axisTick', 'inside'])) {
    layout.tickDirection = -layout.tickDirection;
  }

  if (retrieve(opt.labelInside, axisModel.get(['axisLabel', 'inside']))) {
    layout.labelDirection = -layout.labelDirection;
  } // Special label rotation


  var labelRotate = axisModel.get(['axisLabel', 'rotate']);
  layout.labelRotate = axisPosition === 'top' ? -labelRotate : labelRotate; // Over splitLine and splitArea

  layout.z2 = 1;
  return layout;
}
function isCartesian2DSeries(seriesModel) {
  return seriesModel.get('coordinateSystem') === 'cartesian2d';
}
function findAxisModels(seriesModel) {
  var axisModelMap = {
    xAxisModel: null,
    yAxisModel: null
  };
  each$4(axisModelMap, function (v, key) {
    var axisType = key.replace(/Model$/, '');
    var axisModel = seriesModel.getReferringComponents(axisType, SINGLE_REFERRING).models[0];

    axisModelMap[key] = axisModel;
  });
  return axisModelMap;
}

var Grid =
/** @class */
function () {
  function Grid(gridModel, ecModel, api) {
    // FIXME:TS where used (different from registered type 'cartesian2d')?
    this.type = 'grid';
    this._coordsMap = {};
    this._coordsList = [];
    this._axesMap = {};
    this._axesList = [];
    this.axisPointerEnabled = true;
    this.dimensions = cartesian2DDimensions;

    this._initCartesian(gridModel, ecModel, api);

    this.model = gridModel;
  }

  Grid.prototype.getRect = function () {
    return this._rect;
  };

  Grid.prototype.update = function (ecModel, api) {
    var axesMap = this._axesMap;

    this._updateScale(ecModel, this.model);

    each$4(axesMap.x, function (xAxis) {
      niceScaleExtent(xAxis.scale, xAxis.model);
    });
    each$4(axesMap.y, function (yAxis) {
      niceScaleExtent(yAxis.scale, yAxis.model);
    }); // Key: axisDim_axisIndex, value: boolean, whether onZero target.

    var onZeroRecords = {};
    each$4(axesMap.x, function (xAxis) {
      fixAxisOnZero(axesMap, 'y', xAxis, onZeroRecords);
    });
    each$4(axesMap.y, function (yAxis) {
      fixAxisOnZero(axesMap, 'x', yAxis, onZeroRecords);
    }); // Resize again if containLabel is enabled
    // FIXME It may cause getting wrong grid size in data processing stage

    this.resize(this.model, api);
  };
  /**
   * Resize the grid
   */


  Grid.prototype.resize = function (gridModel, api, ignoreContainLabel) {
    var boxLayoutParams = gridModel.getBoxLayoutParams();
    var isContainLabel = !ignoreContainLabel && gridModel.get('containLabel');
    var gridRect = getLayoutRect(boxLayoutParams, {
      width: api.getWidth(),
      height: api.getHeight()
    });
    this._rect = gridRect;
    var axesList = this._axesList;
    adjustAxes(); // Minus label size

    if (isContainLabel) {
      each$4(axesList, function (axis) {
        if (!axis.model.get(['axisLabel', 'inside'])) {
          var labelUnionRect = estimateLabelUnionRect(axis);

          if (labelUnionRect) {
            var dim = axis.isHorizontal() ? 'height' : 'width';
            var margin = axis.model.get(['axisLabel', 'margin']);
            gridRect[dim] -= labelUnionRect[dim] + margin;

            if (axis.position === 'top') {
              gridRect.y += labelUnionRect.height + margin;
            } else if (axis.position === 'left') {
              gridRect.x += labelUnionRect.width + margin;
            }
          }
        }
      });
      adjustAxes();
    }

    each$4(this._coordsList, function (coord) {
      // Calculate affine matrix to accelerate the data to point transform.
      // If all the axes scales are time or value.
      coord.calcAffineTransform();
    });

    function adjustAxes() {
      each$4(axesList, function (axis) {
        var isHorizontal = axis.isHorizontal();
        var extent = isHorizontal ? [0, gridRect.width] : [0, gridRect.height];
        var idx = axis.inverse ? 1 : 0;
        axis.setExtent(extent[idx], extent[1 - idx]);
        updateAxisTransform(axis, isHorizontal ? gridRect.x : gridRect.y);
      });
    }
  };

  Grid.prototype.getAxis = function (dim, axisIndex) {
    var axesMapOnDim = this._axesMap[dim];

    if (axesMapOnDim != null) {
      return axesMapOnDim[axisIndex || 0]; // if (axisIndex == null) {
      //     Find first axis
      //     for (let name in axesMapOnDim) {
      //         if (axesMapOnDim.hasOwnProperty(name)) {
      //             return axesMapOnDim[name];
      //         }
      //     }
      // }
      // return axesMapOnDim[axisIndex];
    }
  };

  Grid.prototype.getAxes = function () {
    return this._axesList.slice();
  };

  Grid.prototype.getCartesian = function (xAxisIndex, yAxisIndex) {
    if (xAxisIndex != null && yAxisIndex != null) {
      var key = 'x' + xAxisIndex + 'y' + yAxisIndex;
      return this._coordsMap[key];
    }

    if (isObject(xAxisIndex)) {
      yAxisIndex = xAxisIndex.yAxisIndex;
      xAxisIndex = xAxisIndex.xAxisIndex;
    }

    for (var i = 0, coordList = this._coordsList; i < coordList.length; i++) {
      if (coordList[i].getAxis('x').index === xAxisIndex || coordList[i].getAxis('y').index === yAxisIndex) {
        return coordList[i];
      }
    }
  };

  Grid.prototype.getCartesians = function () {
    return this._coordsList.slice();
  };
  /**
   * @implements
   */


  Grid.prototype.convertToPixel = function (ecModel, finder, value) {
    var target = this._findConvertTarget(finder);

    return target.cartesian ? target.cartesian.dataToPoint(value) : target.axis ? target.axis.toGlobalCoord(target.axis.dataToCoord(value)) : null;
  };
  /**
   * @implements
   */


  Grid.prototype.convertFromPixel = function (ecModel, finder, value) {
    var target = this._findConvertTarget(finder);

    return target.cartesian ? target.cartesian.pointToData(value) : target.axis ? target.axis.coordToData(target.axis.toLocalCoord(value)) : null;
  };

  Grid.prototype._findConvertTarget = function (finder) {
    var seriesModel = finder.seriesModel;
    var xAxisModel = finder.xAxisModel || seriesModel && seriesModel.getReferringComponents('xAxis', SINGLE_REFERRING).models[0];
    var yAxisModel = finder.yAxisModel || seriesModel && seriesModel.getReferringComponents('yAxis', SINGLE_REFERRING).models[0];
    var gridModel = finder.gridModel;
    var coordsList = this._coordsList;
    var cartesian;
    var axis;

    if (seriesModel) {
      cartesian = seriesModel.coordinateSystem;
      indexOf(coordsList, cartesian) < 0 && (cartesian = null);
    } else if (xAxisModel && yAxisModel) {
      cartesian = this.getCartesian(xAxisModel.componentIndex, yAxisModel.componentIndex);
    } else if (xAxisModel) {
      axis = this.getAxis('x', xAxisModel.componentIndex);
    } else if (yAxisModel) {
      axis = this.getAxis('y', yAxisModel.componentIndex);
    } // Lowest priority.
    else if (gridModel) {
        var grid = gridModel.coordinateSystem;

        if (grid === this) {
          cartesian = this._coordsList[0];
        }
      }

    return {
      cartesian: cartesian,
      axis: axis
    };
  };
  /**
   * @implements
   */


  Grid.prototype.containPoint = function (point) {
    var coord = this._coordsList[0];

    if (coord) {
      return coord.containPoint(point);
    }
  };
  /**
   * Initialize cartesian coordinate systems
   */


  Grid.prototype._initCartesian = function (gridModel, ecModel, api) {
    var _this = this;

    var grid = this;
    var axisPositionUsed = {
      left: false,
      right: false,
      top: false,
      bottom: false
    };
    var axesMap = {
      x: {},
      y: {}
    };
    var axesCount = {
      x: 0,
      y: 0
    }; /// Create axis

    ecModel.eachComponent('xAxis', createAxisCreator('x'), this);
    ecModel.eachComponent('yAxis', createAxisCreator('y'), this);

    if (!axesCount.x || !axesCount.y) {
      // Roll back when there no either x or y axis
      this._axesMap = {};
      this._axesList = [];
      return;
    }

    this._axesMap = axesMap; /// Create cartesian2d

    each$4(axesMap.x, function (xAxis, xAxisIndex) {
      each$4(axesMap.y, function (yAxis, yAxisIndex) {
        var key = 'x' + xAxisIndex + 'y' + yAxisIndex;
        var cartesian = new Cartesian2D(key);
        cartesian.master = _this;
        cartesian.model = gridModel;
        _this._coordsMap[key] = cartesian;

        _this._coordsList.push(cartesian);

        cartesian.addAxis(xAxis);
        cartesian.addAxis(yAxis);
      });
    });

    function createAxisCreator(dimName) {
      return function (axisModel, idx) {
        if (!isAxisUsedInTheGrid(axisModel, gridModel)) {
          return;
        }

        var axisPosition = axisModel.get('position');

        if (dimName === 'x') {
          // Fix position
          if (axisPosition !== 'top' && axisPosition !== 'bottom') {
            // Default bottom of X
            axisPosition = axisPositionUsed.bottom ? 'top' : 'bottom';
          }
        } else {
          // Fix position
          if (axisPosition !== 'left' && axisPosition !== 'right') {
            // Default left of Y
            axisPosition = axisPositionUsed.left ? 'right' : 'left';
          }
        }

        axisPositionUsed[axisPosition] = true;
        var axis = new Axis2D(dimName, createScaleByModel(axisModel), [0, 0], axisModel.get('type'), axisPosition);
        var isCategory = axis.type === 'category';
        axis.onBand = isCategory && axisModel.get('boundaryGap');
        axis.inverse = axisModel.get('inverse'); // Inject axis into axisModel

        axisModel.axis = axis; // Inject axisModel into axis

        axis.model = axisModel; // Inject grid info axis

        axis.grid = grid; // Index of axis, can be used as key

        axis.index = idx;

        grid._axesList.push(axis);

        axesMap[dimName][idx] = axis;
        axesCount[dimName]++;
      };
    }
  };
  /**
   * Update cartesian properties from series.
   */


  Grid.prototype._updateScale = function (ecModel, gridModel) {
    // Reset scale
    each$4(this._axesList, function (axis) {
      axis.scale.setExtent(Infinity, -Infinity);

      if (axis.type === 'category') {
        var categorySortInfo = axis.model.get('categorySortInfo');
        axis.scale.setSortInfo(categorySortInfo);
      }
    });
    ecModel.eachSeries(function (seriesModel) {
      if (isCartesian2DSeries(seriesModel)) {
        var axesModelMap = findAxisModels(seriesModel);
        var xAxisModel = axesModelMap.xAxisModel;
        var yAxisModel = axesModelMap.yAxisModel;

        if (!isAxisUsedInTheGrid(xAxisModel, gridModel) || !isAxisUsedInTheGrid(yAxisModel, gridModel)) {
          return;
        }

        var cartesian = this.getCartesian(xAxisModel.componentIndex, yAxisModel.componentIndex);
        var data = seriesModel.getData();
        var xAxis = cartesian.getAxis('x');
        var yAxis = cartesian.getAxis('y');

        if (data.type === 'list') {
          unionExtent(data, xAxis);
          unionExtent(data, yAxis);
        }
      }
    }, this);

    function unionExtent(data, axis) {
      each$4(getDataDimensionsOnAxis(data, axis.dim), function (dim) {
        axis.scale.unionExtentFromData(data, dim);
      });
    }
  };
  /**
   * @param dim 'x' or 'y' or 'auto' or null/undefined
   */


  Grid.prototype.getTooltipAxes = function (dim) {
    var baseAxes = [];
    var otherAxes = [];
    each$4(this.getCartesians(), function (cartesian) {
      var baseAxis = dim != null && dim !== 'auto' ? cartesian.getAxis(dim) : cartesian.getBaseAxis();
      var otherAxis = cartesian.getOtherAxis(baseAxis);
      indexOf(baseAxes, baseAxis) < 0 && baseAxes.push(baseAxis);
      indexOf(otherAxes, otherAxis) < 0 && otherAxes.push(otherAxis);
    });
    return {
      baseAxes: baseAxes,
      otherAxes: otherAxes
    };
  };

  Grid.create = function (ecModel, api) {
    var grids = [];
    ecModel.eachComponent('grid', function (gridModel, idx) {
      var grid = new Grid(gridModel, ecModel, api);
      grid.name = 'grid_' + idx; // dataSampling requires axis extent, so resize
      // should be performed in create stage.

      grid.resize(gridModel, api, true);
      gridModel.coordinateSystem = grid;
      grids.push(grid);
    }); // Inject the coordinateSystems into seriesModel

    ecModel.eachSeries(function (seriesModel) {
      if (!isCartesian2DSeries(seriesModel)) {
        return;
      }

      var axesModelMap = findAxisModels(seriesModel);
      var xAxisModel = axesModelMap.xAxisModel;
      var yAxisModel = axesModelMap.yAxisModel;
      var gridModel = xAxisModel.getCoordSysModel();

      var grid = gridModel.coordinateSystem;
      seriesModel.coordinateSystem = grid.getCartesian(xAxisModel.componentIndex, yAxisModel.componentIndex);
    });
    return grids;
  }; // For deciding which dimensions to use when creating list data


  Grid.dimensions = cartesian2DDimensions;
  return Grid;
}();
/**
 * Check if the axis is used in the specified grid.
 */


function isAxisUsedInTheGrid(axisModel, gridModel) {
  return axisModel.getCoordSysModel() === gridModel;
}

function fixAxisOnZero(axesMap, otherAxisDim, axis, // Key: see `getOnZeroRecordKey`
onZeroRecords) {
  axis.getAxesOnZeroOf = function () {
    // TODO: onZero of multiple axes.
    return otherAxisOnZeroOf ? [otherAxisOnZeroOf] : [];
  }; // onZero can not be enabled in these two situations:
  // 1. When any other axis is a category axis.
  // 2. When no axis is cross 0 point.


  var otherAxes = axesMap[otherAxisDim];
  var otherAxisOnZeroOf;
  var axisModel = axis.model;
  var onZero = axisModel.get(['axisLine', 'onZero']);
  var onZeroAxisIndex = axisModel.get(['axisLine', 'onZeroAxisIndex']);

  if (!onZero) {
    return;
  } // If target axis is specified.


  if (onZeroAxisIndex != null) {
    if (canOnZeroToAxis(otherAxes[onZeroAxisIndex])) {
      otherAxisOnZeroOf = otherAxes[onZeroAxisIndex];
    }
  } else {
    // Find the first available other axis.
    for (var idx in otherAxes) {
      if (otherAxes.hasOwnProperty(idx) && canOnZeroToAxis(otherAxes[idx]) // Consider that two Y axes on one value axis,
      // if both onZero, the two Y axes overlap.
      && !onZeroRecords[getOnZeroRecordKey(otherAxes[idx])]) {
        otherAxisOnZeroOf = otherAxes[idx];
        break;
      }
    }
  }

  if (otherAxisOnZeroOf) {
    onZeroRecords[getOnZeroRecordKey(otherAxisOnZeroOf)] = true;
  }

  function getOnZeroRecordKey(axis) {
    return axis.dim + '_' + axis.index;
  }
}

function canOnZeroToAxis(axis) {
  return axis && axis.type !== 'category' && axis.type !== 'time' && ifAxisCrossZero(axis);
}

function updateAxisTransform(axis, coordBase) {
  var axisExtent = axis.getExtent();
  var axisExtentSum = axisExtent[0] + axisExtent[1]; // Fast transform

  axis.toGlobalCoord = axis.dim === 'x' ? function (coord) {
    return coord + coordBase;
  } : function (coord) {
    return axisExtentSum - coord + coordBase;
  };
  axis.toLocalCoord = axis.dim === 'x' ? function (coord) {
    return coord - coordBase;
  } : function (coord) {
    return axisExtentSum - coord + coordBase;
  };
}

var PI = Math.PI;
/**
 * A final axis is translated and rotated from a "standard axis".
 * So opt.position and opt.rotation is required.
 *
 * A standard axis is and axis from [0, 0] to [0, axisExtent[1]],
 * for example: (0, 0) ------------> (0, 50)
 *
 * nameDirection or tickDirection or labelDirection is 1 means tick
 * or label is below the standard axis, whereas is -1 means above
 * the standard axis. labelOffset means offset between label and axis,
 * which is useful when 'onZero', where axisLabel is in the grid and
 * label in outside grid.
 *
 * Tips: like always,
 * positive rotation represents anticlockwise, and negative rotation
 * represents clockwise.
 * The direction of position coordinate is the same as the direction
 * of screen coordinate.
 *
 * Do not need to consider axis 'inverse', which is auto processed by
 * axis extent.
 */

var AxisBuilder =
/** @class */
function () {
  function AxisBuilder(axisModel, opt) {
    this.group = new Group$2();
    this.opt = opt;
    this.axisModel = axisModel; // Default value

    defaults(opt, {
      labelOffset: 0,
      nameDirection: 1,
      tickDirection: 1,
      labelDirection: 1,
      silent: true,
      handleAutoShown: function () {
        return true;
      }
    }); // FIXME Not use a seperate text group?

    var transformGroup = new Group$2({
      x: opt.position[0],
      y: opt.position[1],
      rotation: opt.rotation
    }); // this.group.add(transformGroup);
    // this._transformGroup = transformGroup;

    transformGroup.updateTransform();
    this._transformGroup = transformGroup;
  }

  AxisBuilder.prototype.hasBuilder = function (name) {
    return !!builders[name];
  };

  AxisBuilder.prototype.add = function (name) {
    builders[name](this.opt, this.axisModel, this.group, this._transformGroup);
  };

  AxisBuilder.prototype.getGroup = function () {
    return this.group;
  };

  AxisBuilder.innerTextLayout = function (axisRotation, textRotation, direction) {
    var rotationDiff = remRadian(textRotation - axisRotation);
    var textAlign;
    var textVerticalAlign;

    if (isRadianAroundZero(rotationDiff)) {
      // Label is parallel with axis line.
      textVerticalAlign = direction > 0 ? 'top' : 'bottom';
      textAlign = 'center';
    } else if (isRadianAroundZero(rotationDiff - PI)) {
      // Label is inverse parallel with axis line.
      textVerticalAlign = direction > 0 ? 'bottom' : 'top';
      textAlign = 'center';
    } else {
      textVerticalAlign = 'middle';

      if (rotationDiff > 0 && rotationDiff < PI) {
        textAlign = direction > 0 ? 'right' : 'left';
      } else {
        textAlign = direction > 0 ? 'left' : 'right';
      }
    }

    return {
      rotation: rotationDiff,
      textAlign: textAlign,
      textVerticalAlign: textVerticalAlign
    };
  };

  AxisBuilder.makeAxisEventDataBase = function (axisModel) {
    var eventData = {
      componentType: axisModel.mainType,
      componentIndex: axisModel.componentIndex
    };
    eventData[axisModel.mainType + 'Index'] = axisModel.componentIndex;
    return eventData;
  };

  AxisBuilder.isLabelSilent = function (axisModel) {
    var tooltipOpt = axisModel.get('tooltip');
    return axisModel.get('silent') // Consider mouse cursor, add these restrictions.
    || !(axisModel.get('triggerEvent') || tooltipOpt && tooltipOpt.show);
  };

  return AxisBuilder;
}();
var builders = {
  axisLine: function (opt, axisModel, group, transformGroup) {
    var shown = axisModel.get(['axisLine', 'show']);

    if (shown === 'auto' && opt.handleAutoShown) {
      shown = opt.handleAutoShown('axisLine');
    }

    if (!shown) {
      return;
    }

    var extent = axisModel.axis.getExtent();
    var matrix = transformGroup.transform;
    var pt1 = [extent[0], 0];
    var pt2 = [extent[1], 0];

    if (matrix) {
      applyTransform(pt1, pt1, matrix);
      applyTransform(pt2, pt2, matrix);
    }

    var lineStyle = extend({
      lineCap: 'round'
    }, axisModel.getModel(['axisLine', 'lineStyle']).getLineStyle());
    var line = new Line({
      // Id for animation
      subPixelOptimize: true,
      shape: {
        x1: pt1[0],
        y1: pt1[1],
        x2: pt2[0],
        y2: pt2[1]
      },
      style: lineStyle,
      strokeContainThreshold: opt.strokeContainThreshold || 5,
      silent: true,
      z2: 1
    });
    line.anid = 'line';
    group.add(line);
    var arrows = axisModel.get(['axisLine', 'symbol']);
    var arrowSize = axisModel.get(['axisLine', 'symbolSize']);
    var arrowOffset = axisModel.get(['axisLine', 'symbolOffset']) || 0;

    if (typeof arrowOffset === 'number') {
      arrowOffset = [arrowOffset, arrowOffset];
    }

    if (arrows != null) {
      if (typeof arrows === 'string') {
        // Use the same arrow for start and end point
        arrows = [arrows, arrows];
      }

      if (typeof arrowSize === 'string' || typeof arrowSize === 'number') {
        // Use the same size for width and height
        arrowSize = [arrowSize, arrowSize];
      }

      var symbolWidth_1 = arrowSize[0];
      var symbolHeight_1 = arrowSize[1];
      each$4([{
        rotate: opt.rotation + Math.PI / 2,
        offset: arrowOffset[0],
        r: 0
      }, {
        rotate: opt.rotation - Math.PI / 2,
        offset: arrowOffset[1],
        r: Math.sqrt((pt1[0] - pt2[0]) * (pt1[0] - pt2[0]) + (pt1[1] - pt2[1]) * (pt1[1] - pt2[1]))
      }], function (point, index) {
        if (arrows[index] !== 'none' && arrows[index] != null) {
          var symbol = createSymbol(arrows[index], -symbolWidth_1 / 2, -symbolHeight_1 / 2, symbolWidth_1, symbolHeight_1, lineStyle.stroke, true); // Calculate arrow position with offset

          var r = point.r + point.offset;
          symbol.attr({
            rotation: point.rotate,
            x: pt1[0] + r * Math.cos(opt.rotation),
            y: pt1[1] - r * Math.sin(opt.rotation),
            silent: true,
            z2: 11
          });
          group.add(symbol);
        }
      });
    }
  },
  axisTickLabel: function (opt, axisModel, group, transformGroup) {
    var ticksEls = buildAxisMajorTicks(group, transformGroup, axisModel, opt);
    var labelEls = buildAxisLabel(group, transformGroup, axisModel, opt);
    fixMinMaxLabelShow(axisModel, labelEls, ticksEls);
    buildAxisMinorTicks(group, transformGroup, axisModel, opt.tickDirection);
  },
  axisName: function (opt, axisModel, group, transformGroup) {
    var name = retrieve(opt.axisName, axisModel.get('name'));

    if (!name) {
      return;
    }

    var nameLocation = axisModel.get('nameLocation');
    var nameDirection = opt.nameDirection;
    var textStyleModel = axisModel.getModel('nameTextStyle');
    var gap = axisModel.get('nameGap') || 0;
    var extent = axisModel.axis.getExtent();
    var gapSignal = extent[0] > extent[1] ? -1 : 1;
    var pos = [nameLocation === 'start' ? extent[0] - gapSignal * gap : nameLocation === 'end' ? extent[1] + gapSignal * gap : (extent[0] + extent[1]) / 2, // Reuse labelOffset.
    isNameLocationCenter(nameLocation) ? opt.labelOffset + nameDirection * gap : 0];
    var labelLayout;
    var nameRotation = axisModel.get('nameRotate');

    if (nameRotation != null) {
      nameRotation = nameRotation * PI / 180; // To radian.
    }

    var axisNameAvailableWidth;

    if (isNameLocationCenter(nameLocation)) {
      labelLayout = AxisBuilder.innerTextLayout(opt.rotation, nameRotation != null ? nameRotation : opt.rotation, // Adapt to axis.
      nameDirection);
    } else {
      labelLayout = endTextLayout(opt.rotation, nameLocation, nameRotation || 0, extent);
      axisNameAvailableWidth = opt.axisNameAvailableWidth;

      if (axisNameAvailableWidth != null) {
        axisNameAvailableWidth = Math.abs(axisNameAvailableWidth / Math.sin(labelLayout.rotation));
        !isFinite(axisNameAvailableWidth) && (axisNameAvailableWidth = null);
      }
    }

    var textFont = textStyleModel.getFont();
    var truncateOpt = axisModel.get('nameTruncate', true) || {};
    var ellipsis = truncateOpt.ellipsis;
    var maxWidth = retrieve(opt.nameTruncateMaxWidth, truncateOpt.maxWidth, axisNameAvailableWidth);
    var tooltipOpt = axisModel.get('tooltip', true);
    var mainType = axisModel.mainType;
    var formatterParams = {
      componentType: mainType,
      name: name,
      $vars: ['name']
    };
    formatterParams[mainType + 'Index'] = axisModel.componentIndex;
    var textEl = new ZRText({
      x: pos[0],
      y: pos[1],
      rotation: labelLayout.rotation,
      silent: AxisBuilder.isLabelSilent(axisModel),
      style: createTextStyle(textStyleModel, {
        text: name,
        font: textFont,
        overflow: 'truncate',
        width: maxWidth,
        ellipsis: ellipsis,
        fill: textStyleModel.getTextColor() || axisModel.get(['axisLine', 'lineStyle', 'color']),
        align: textStyleModel.get('align') || labelLayout.textAlign,
        verticalAlign: textStyleModel.get('verticalAlign') || labelLayout.textVerticalAlign
      }),
      z2: 1
    });
    textEl.tooltip = tooltipOpt && tooltipOpt.show ? extend({
      content: name,
      formatter: function () {
        return name;
      },
      formatterParams: formatterParams
    }, tooltipOpt) : null;
    textEl.__fullText = name; // Id for animation

    textEl.anid = 'name';

    if (axisModel.get('triggerEvent')) {
      var eventData = AxisBuilder.makeAxisEventDataBase(axisModel);
      eventData.targetType = 'axisName';
      eventData.name = name;
      getECData(textEl).eventData = eventData;
    } // FIXME


    transformGroup.add(textEl);
    textEl.updateTransform();
    group.add(textEl);
    textEl.decomposeTransform();
  }
};

function endTextLayout(rotation, textPosition, textRotate, extent) {
  var rotationDiff = remRadian(textRotate - rotation);
  var textAlign;
  var textVerticalAlign;
  var inverse = extent[0] > extent[1];
  var onLeft = textPosition === 'start' && !inverse || textPosition !== 'start' && inverse;

  if (isRadianAroundZero(rotationDiff - PI / 2)) {
    textVerticalAlign = onLeft ? 'bottom' : 'top';
    textAlign = 'center';
  } else if (isRadianAroundZero(rotationDiff - PI * 1.5)) {
    textVerticalAlign = onLeft ? 'top' : 'bottom';
    textAlign = 'center';
  } else {
    textVerticalAlign = 'middle';

    if (rotationDiff < PI * 1.5 && rotationDiff > PI / 2) {
      textAlign = onLeft ? 'left' : 'right';
    } else {
      textAlign = onLeft ? 'right' : 'left';
    }
  }

  return {
    rotation: rotationDiff,
    textAlign: textAlign,
    textVerticalAlign: textVerticalAlign
  };
}

function fixMinMaxLabelShow(axisModel, labelEls, tickEls) {
  if (shouldShowAllLabels(axisModel.axis)) {
    return;
  } // If min or max are user set, we need to check
  // If the tick on min(max) are overlap on their neighbour tick
  // If they are overlapped, we need to hide the min(max) tick label


  var showMinLabel = axisModel.get(['axisLabel', 'showMinLabel']);
  var showMaxLabel = axisModel.get(['axisLabel', 'showMaxLabel']); // FIXME
  // Have not consider onBand yet, where tick els is more than label els.

  labelEls = labelEls || [];
  tickEls = tickEls || [];
  var firstLabel = labelEls[0];
  var nextLabel = labelEls[1];
  var lastLabel = labelEls[labelEls.length - 1];
  var prevLabel = labelEls[labelEls.length - 2];
  var firstTick = tickEls[0];
  var nextTick = tickEls[1];
  var lastTick = tickEls[tickEls.length - 1];
  var prevTick = tickEls[tickEls.length - 2];

  if (showMinLabel === false) {
    ignoreEl(firstLabel);
    ignoreEl(firstTick);
  } else if (isTwoLabelOverlapped(firstLabel, nextLabel)) {
    if (showMinLabel) {
      ignoreEl(nextLabel);
      ignoreEl(nextTick);
    } else {
      ignoreEl(firstLabel);
      ignoreEl(firstTick);
    }
  }

  if (showMaxLabel === false) {
    ignoreEl(lastLabel);
    ignoreEl(lastTick);
  } else if (isTwoLabelOverlapped(prevLabel, lastLabel)) {
    if (showMaxLabel) {
      ignoreEl(prevLabel);
      ignoreEl(prevTick);
    } else {
      ignoreEl(lastLabel);
      ignoreEl(lastTick);
    }
  }
}

function ignoreEl(el) {
  el && (el.ignore = true);
}

function isTwoLabelOverlapped(current, next) {
  // current and next has the same rotation.
  var firstRect = current && current.getBoundingRect().clone();
  var nextRect = next && next.getBoundingRect().clone();

  if (!firstRect || !nextRect) {
    return;
  } // When checking intersect of two rotated labels, we use mRotationBack
  // to avoid that boundingRect is enlarge when using `boundingRect.applyTransform`.


  var mRotationBack = identity([]);
  rotate(mRotationBack, mRotationBack, -current.rotation);
  firstRect.applyTransform(mul([], mRotationBack, current.getLocalTransform()));
  nextRect.applyTransform(mul([], mRotationBack, next.getLocalTransform()));
  return firstRect.intersect(nextRect);
}

function isNameLocationCenter(nameLocation) {
  return nameLocation === 'middle' || nameLocation === 'center';
}

function createTicks(ticksCoords, tickTransform, tickEndCoord, tickLineStyle, anidPrefix) {
  var tickEls = [];
  var pt1 = [];
  var pt2 = [];

  for (var i = 0; i < ticksCoords.length; i++) {
    var tickCoord = ticksCoords[i].coord;
    pt1[0] = tickCoord;
    pt1[1] = 0;
    pt2[0] = tickCoord;
    pt2[1] = tickEndCoord;

    if (tickTransform) {
      applyTransform(pt1, pt1, tickTransform);
      applyTransform(pt2, pt2, tickTransform);
    } // Tick line, Not use group transform to have better line draw


    var tickEl = new Line({
      subPixelOptimize: true,
      shape: {
        x1: pt1[0],
        y1: pt1[1],
        x2: pt2[0],
        y2: pt2[1]
      },
      style: tickLineStyle,
      z2: 2,
      autoBatch: true,
      silent: true
    });
    tickEl.anid = anidPrefix + '_' + ticksCoords[i].tickValue;
    tickEls.push(tickEl);
  }

  return tickEls;
}

function buildAxisMajorTicks(group, transformGroup, axisModel, opt) {
  var axis = axisModel.axis;
  var tickModel = axisModel.getModel('axisTick');
  var shown = tickModel.get('show');

  if (shown === 'auto' && opt.handleAutoShown) {
    shown = opt.handleAutoShown('axisTick');
  }

  if (!shown || axis.scale.isBlank()) {
    return;
  }

  var lineStyleModel = tickModel.getModel('lineStyle');
  var tickEndCoord = opt.tickDirection * tickModel.get('length');
  var ticksCoords = axis.getTicksCoords();
  var ticksEls = createTicks(ticksCoords, transformGroup.transform, tickEndCoord, defaults(lineStyleModel.getLineStyle(), {
    stroke: axisModel.get(['axisLine', 'lineStyle', 'color'])
  }), 'ticks');

  for (var i = 0; i < ticksEls.length; i++) {
    group.add(ticksEls[i]);
  }

  return ticksEls;
}

function buildAxisMinorTicks(group, transformGroup, axisModel, tickDirection) {
  var axis = axisModel.axis;
  var minorTickModel = axisModel.getModel('minorTick');

  if (!minorTickModel.get('show') || axis.scale.isBlank()) {
    return;
  }

  var minorTicksCoords = axis.getMinorTicksCoords();

  if (!minorTicksCoords.length) {
    return;
  }

  var lineStyleModel = minorTickModel.getModel('lineStyle');
  var tickEndCoord = tickDirection * minorTickModel.get('length');
  var minorTickLineStyle = defaults(lineStyleModel.getLineStyle(), defaults(axisModel.getModel('axisTick').getLineStyle(), {
    stroke: axisModel.get(['axisLine', 'lineStyle', 'color'])
  }));

  for (var i = 0; i < minorTicksCoords.length; i++) {
    var minorTicksEls = createTicks(minorTicksCoords[i], transformGroup.transform, tickEndCoord, minorTickLineStyle, 'minorticks_' + i);

    for (var k = 0; k < minorTicksEls.length; k++) {
      group.add(minorTicksEls[k]);
    }
  }
}

function buildAxisLabel(group, transformGroup, axisModel, opt) {
  var axis = axisModel.axis;
  var show = retrieve(opt.axisLabelShow, axisModel.get(['axisLabel', 'show']));

  if (!show || axis.scale.isBlank()) {
    return;
  }

  var labelModel = axisModel.getModel('axisLabel');
  var labelMargin = labelModel.get('margin');
  var labels = axis.getViewLabels(); // Special label rotate.

  var labelRotation = (retrieve(opt.labelRotate, labelModel.get('rotate')) || 0) * PI / 180;
  var labelLayout = AxisBuilder.innerTextLayout(opt.rotation, labelRotation, opt.labelDirection);
  var rawCategoryData = axisModel.getCategories && axisModel.getCategories(true);
  var labelEls = [];
  var silent = AxisBuilder.isLabelSilent(axisModel);
  var triggerEvent = axisModel.get('triggerEvent');
  each$4(labels, function (labelItem, index) {
    var tickValue = axis.scale.type === 'ordinal' ? axis.scale.getRawOrdinalNumber(labelItem.tickValue) : labelItem.tickValue;
    var formattedLabel = labelItem.formattedLabel;
    var rawLabel = labelItem.rawLabel;
    var itemLabelModel = labelModel;

    if (rawCategoryData && rawCategoryData[tickValue]) {
      var rawCategoryItem = rawCategoryData[tickValue];

      if (isObject(rawCategoryItem) && rawCategoryItem.textStyle) {
        itemLabelModel = new Model(rawCategoryItem.textStyle, labelModel, axisModel.ecModel);
      }
    }

    var textColor = itemLabelModel.getTextColor() || axisModel.get(['axisLine', 'lineStyle', 'color']);
    var tickCoord = axis.dataToCoord(tickValue);
    var textEl = new ZRText({
      x: tickCoord,
      y: opt.labelOffset + opt.labelDirection * labelMargin,
      rotation: labelLayout.rotation,
      silent: silent,
      z2: 10,
      style: createTextStyle(itemLabelModel, {
        text: formattedLabel,
        align: itemLabelModel.getShallow('align', true) || labelLayout.textAlign,
        verticalAlign: itemLabelModel.getShallow('verticalAlign', true) || itemLabelModel.getShallow('baseline', true) || labelLayout.textVerticalAlign,
        fill: typeof textColor === 'function' ? textColor( // (1) In category axis with data zoom, tick is not the original
        // index of axis.data. So tick should not be exposed to user
        // in category axis.
        // (2) Compatible with previous version, which always use formatted label as
        // input. But in interval scale the formatted label is like '223,445', which
        // maked user repalce ','. So we modify it to return original val but remain
        // it as 'string' to avoid error in replacing.
        axis.type === 'category' ? rawLabel : axis.type === 'value' ? tickValue + '' : tickValue, index) : textColor
      })
    });
    textEl.anid = 'label_' + tickValue; // Pack data for mouse event

    if (triggerEvent) {
      var eventData = AxisBuilder.makeAxisEventDataBase(axisModel);
      eventData.targetType = 'axisLabel';
      eventData.value = rawLabel;
      getECData(textEl).eventData = eventData;
    } // FIXME


    transformGroup.add(textEl);
    textEl.updateTransform();
    labelEls.push(textEl);
    group.add(textEl);
    textEl.decomposeTransform();
  });
  return labelEls;
}

// allAxesInfo should be updated when setOption performed.

function collect(ecModel, api) {
  var result = {
    /**
     * key: makeKey(axis.model)
     * value: {
     *      axis,
     *      coordSys,
     *      axisPointerModel,
     *      triggerTooltip,
     *      involveSeries,
     *      snap,
     *      seriesModels,
     *      seriesDataCount
     * }
     */
    axesInfo: {},
    seriesInvolved: false,

    /**
     * key: makeKey(coordSys.model)
     * value: Object: key makeKey(axis.model), value: axisInfo
     */
    coordSysAxesInfo: {},
    coordSysMap: {}
  };
  collectAxesInfo(result, ecModel, api); // Check seriesInvolved for performance, in case too many series in some chart.

  result.seriesInvolved && collectSeriesInfo(result, ecModel);
  return result;
}

function collectAxesInfo(result, ecModel, api) {
  var globalTooltipModel = ecModel.getComponent('tooltip');
  var globalAxisPointerModel = ecModel.getComponent('axisPointer'); // links can only be set on global.

  var linksOption = globalAxisPointerModel.get('link', true) || [];
  var linkGroups = []; // Collect axes info.

  each$4(api.getCoordinateSystems(), function (coordSys) {
    // Some coordinate system do not support axes, like geo.
    if (!coordSys.axisPointerEnabled) {
      return;
    }

    var coordSysKey = makeKey(coordSys.model);
    var axesInfoInCoordSys = result.coordSysAxesInfo[coordSysKey] = {};
    result.coordSysMap[coordSysKey] = coordSys; // Set tooltip (like 'cross') is a convienent way to show axisPointer
    // for user. So we enable seting tooltip on coordSys model.

    var coordSysModel = coordSys.model;
    var baseTooltipModel = coordSysModel.getModel('tooltip', globalTooltipModel);
    each$4(coordSys.getAxes(), curry$1(saveTooltipAxisInfo, false, null)); // If axis tooltip used, choose tooltip axis for each coordSys.
    // Notice this case: coordSys is `grid` but not `cartesian2D` here.

    if (coordSys.getTooltipAxes && globalTooltipModel // If tooltip.showContent is set as false, tooltip will not
    // show but axisPointer will show as normal.
    && baseTooltipModel.get('show')) {
      // Compatible with previous logic. But series.tooltip.trigger: 'axis'
      // or series.data[n].tooltip.trigger: 'axis' are not support any more.
      var triggerAxis = baseTooltipModel.get('trigger') === 'axis';
      var cross = baseTooltipModel.get(['axisPointer', 'type']) === 'cross';
      var tooltipAxes = coordSys.getTooltipAxes(baseTooltipModel.get(['axisPointer', 'axis']));

      if (triggerAxis || cross) {
        each$4(tooltipAxes.baseAxes, curry$1(saveTooltipAxisInfo, cross ? 'cross' : true, triggerAxis));
      }

      if (cross) {
        each$4(tooltipAxes.otherAxes, curry$1(saveTooltipAxisInfo, 'cross', false));
      }
    } // fromTooltip: true | false | 'cross'
    // triggerTooltip: true | false | null


    function saveTooltipAxisInfo(fromTooltip, triggerTooltip, axis) {
      var axisPointerModel = axis.model.getModel('axisPointer', globalAxisPointerModel);
      var axisPointerShow = axisPointerModel.get('show');

      if (!axisPointerShow || axisPointerShow === 'auto' && !fromTooltip && !isHandleTrigger(axisPointerModel)) {
        return;
      }

      if (triggerTooltip == null) {
        triggerTooltip = axisPointerModel.get('triggerTooltip');
      }

      axisPointerModel = fromTooltip ? makeAxisPointerModel(axis, baseTooltipModel, globalAxisPointerModel, ecModel, fromTooltip, triggerTooltip) : axisPointerModel;
      var snap = axisPointerModel.get('snap');
      var axisKey = makeKey(axis.model);
      var involveSeries = triggerTooltip || snap || axis.type === 'category'; // If result.axesInfo[key] exist, override it (tooltip has higher priority).

      var axisInfo = result.axesInfo[axisKey] = {
        key: axisKey,
        axis: axis,
        coordSys: coordSys,
        axisPointerModel: axisPointerModel,
        triggerTooltip: triggerTooltip,
        involveSeries: involveSeries,
        snap: snap,
        useHandle: isHandleTrigger(axisPointerModel),
        seriesModels: [],
        linkGroup: null
      };
      axesInfoInCoordSys[axisKey] = axisInfo;
      result.seriesInvolved = result.seriesInvolved || involveSeries;
      var groupIndex = getLinkGroupIndex(linksOption, axis);

      if (groupIndex != null) {
        var linkGroup = linkGroups[groupIndex] || (linkGroups[groupIndex] = {
          axesInfo: {}
        });
        linkGroup.axesInfo[axisKey] = axisInfo;
        linkGroup.mapper = linksOption[groupIndex].mapper;
        axisInfo.linkGroup = linkGroup;
      }
    }
  });
}

function makeAxisPointerModel(axis, baseTooltipModel, globalAxisPointerModel, ecModel, fromTooltip, triggerTooltip) {
  var tooltipAxisPointerModel = baseTooltipModel.getModel('axisPointer');
  var fields = ['type', 'snap', 'lineStyle', 'shadowStyle', 'label', 'animation', 'animationDurationUpdate', 'animationEasingUpdate', 'z'];
  var volatileOption = {};
  each$4(fields, function (field) {
    volatileOption[field] = clone$1(tooltipAxisPointerModel.get(field));
  }); // category axis do not auto snap, otherwise some tick that do not
  // has value can not be hovered. value/time/log axis default snap if
  // triggered from tooltip and trigger tooltip.

  volatileOption.snap = axis.type !== 'category' && !!triggerTooltip; // Compatibel with previous behavior, tooltip axis do not show label by default.
  // Only these properties can be overrided from tooltip to axisPointer.

  if (tooltipAxisPointerModel.get('type') === 'cross') {
    volatileOption.type = 'line';
  }

  var labelOption = volatileOption.label || (volatileOption.label = {}); // Follow the convention, do not show label when triggered by tooltip by default.

  labelOption.show == null && (labelOption.show = false);

  if (fromTooltip === 'cross') {
    // When 'cross', both axes show labels.
    var tooltipAxisPointerLabelShow = tooltipAxisPointerModel.get(['label', 'show']);
    labelOption.show = tooltipAxisPointerLabelShow != null ? tooltipAxisPointerLabelShow : true; // If triggerTooltip, this is a base axis, which should better not use cross style
    // (cross style is dashed by default)

    if (!triggerTooltip) {
      var crossStyle = volatileOption.lineStyle = tooltipAxisPointerModel.get('crossStyle');
      crossStyle && defaults(labelOption, crossStyle.textStyle);
    }
  }

  return axis.model.getModel('axisPointer', new Model(volatileOption, globalAxisPointerModel, ecModel));
}

function collectSeriesInfo(result, ecModel) {
  // Prepare data for axis trigger
  ecModel.eachSeries(function (seriesModel) {
    // Notice this case: this coordSys is `cartesian2D` but not `grid`.
    var coordSys = seriesModel.coordinateSystem;
    var seriesTooltipTrigger = seriesModel.get(['tooltip', 'trigger'], true);
    var seriesTooltipShow = seriesModel.get(['tooltip', 'show'], true);

    if (!coordSys || seriesTooltipTrigger === 'none' || seriesTooltipTrigger === false || seriesTooltipTrigger === 'item' || seriesTooltipShow === false || seriesModel.get(['axisPointer', 'show'], true) === false) {
      return;
    }

    each$4(result.coordSysAxesInfo[makeKey(coordSys.model)], function (axisInfo) {
      var axis = axisInfo.axis;

      if (coordSys.getAxis(axis.dim) === axis) {
        axisInfo.seriesModels.push(seriesModel);
        axisInfo.seriesDataCount == null && (axisInfo.seriesDataCount = 0);
        axisInfo.seriesDataCount += seriesModel.getData().count();
      }
    });
  });
}
/**
 * For example:
 * {
 *     axisPointer: {
 *         links: [{
 *             xAxisIndex: [2, 4],
 *             yAxisIndex: 'all'
 *         }, {
 *             xAxisId: ['a5', 'a7'],
 *             xAxisName: 'xxx'
 *         }]
 *     }
 * }
 */


function getLinkGroupIndex(linksOption, axis) {
  var axisModel = axis.model;
  var dim = axis.dim;

  for (var i = 0; i < linksOption.length; i++) {
    var linkOption = linksOption[i] || {};

    if (checkPropInLink(linkOption[dim + 'AxisId'], axisModel.id) || checkPropInLink(linkOption[dim + 'AxisIndex'], axisModel.componentIndex) || checkPropInLink(linkOption[dim + 'AxisName'], axisModel.name)) {
      return i;
    }
  }
}

function checkPropInLink(linkPropValue, axisPropValue) {
  return linkPropValue === 'all' || isArray(linkPropValue) && indexOf(linkPropValue, axisPropValue) >= 0 || linkPropValue === axisPropValue;
}

function fixValue(axisModel) {
  var axisInfo = getAxisInfo(axisModel);

  if (!axisInfo) {
    return;
  }

  var axisPointerModel = axisInfo.axisPointerModel;
  var scale = axisInfo.axis.scale;
  var option = axisPointerModel.option;
  var status = axisPointerModel.get('status');
  var value = axisPointerModel.get('value'); // Parse init value for category and time axis.

  if (value != null) {
    value = scale.parse(value);
  }

  var useHandle = isHandleTrigger(axisPointerModel); // If `handle` used, `axisPointer` will always be displayed, so value
  // and status should be initialized.

  if (status == null) {
    option.status = useHandle ? 'show' : 'hide';
  }

  var extent = scale.getExtent().slice();
  extent[0] > extent[1] && extent.reverse();

  if ( // Pick a value on axis when initializing.
  value == null // If both `handle` and `dataZoom` are used, value may be out of axis extent,
  // where we should re-pick a value to keep `handle` displaying normally.
  || value > extent[1]) {
    // Make handle displayed on the end of the axis when init, which looks better.
    value = extent[1];
  }

  if (value < extent[0]) {
    value = extent[0];
  }

  option.value = value;

  if (useHandle) {
    option.status = axisInfo.axis.scale.isBlank() ? 'hide' : 'show';
  }
}
function getAxisInfo(axisModel) {
  var coordSysAxesInfo = (axisModel.ecModel.getComponent('axisPointer') || {}).coordSysAxesInfo;
  return coordSysAxesInfo && coordSysAxesInfo.axesInfo[makeKey(axisModel)];
}
function getAxisPointerModel(axisModel) {
  var axisInfo = getAxisInfo(axisModel);
  return axisInfo && axisInfo.axisPointerModel;
}

function isHandleTrigger(axisPointerModel) {
  return !!axisPointerModel.get(['handle', 'show']);
}
/**
 * @param {module:echarts/model/Model} model
 * @return {string} unique key
 */


function makeKey(model) {
  return model.type + '||' + model.id;
}

var axisPointerClazz = {};
/**
 * Base class of AxisView.
 */

var AxisView =
/** @class */
function (_super) {
  __extends(AxisView, _super);

  function AxisView() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = AxisView.type;
    return _this;
  }
  /**
   * @override
   */


  AxisView.prototype.render = function (axisModel, ecModel, api, payload) {
    // FIXME
    // This process should proformed after coordinate systems updated
    // (axis scale updated), and should be performed each time update.
    // So put it here temporarily, although it is not appropriate to
    // put a model-writing procedure in `view`.
    this.axisPointerClass && fixValue(axisModel);

    _super.prototype.render.apply(this, arguments);

    this._doUpdateAxisPointerClass(axisModel, api, true);
  };
  /**
   * Action handler.
   */


  AxisView.prototype.updateAxisPointer = function (axisModel, ecModel, api, payload) {
    this._doUpdateAxisPointerClass(axisModel, api, false);
  };
  /**
   * @override
   */


  AxisView.prototype.remove = function (ecModel, api) {
    var axisPointer = this._axisPointer;
    axisPointer && axisPointer.remove(api);
  };
  /**
   * @override
   */


  AxisView.prototype.dispose = function (ecModel, api) {
    this._disposeAxisPointer(api);

    _super.prototype.dispose.apply(this, arguments);
  };

  AxisView.prototype._doUpdateAxisPointerClass = function (axisModel, api, forceRender) {
    var Clazz = AxisView.getAxisPointerClass(this.axisPointerClass);

    if (!Clazz) {
      return;
    }

    var axisPointerModel = getAxisPointerModel(axisModel);
    axisPointerModel ? (this._axisPointer || (this._axisPointer = new Clazz())).render(axisModel, axisPointerModel, api, forceRender) : this._disposeAxisPointer(api);
  };

  AxisView.prototype._disposeAxisPointer = function (api) {
    this._axisPointer && this._axisPointer.dispose(api);
    this._axisPointer = null;
  };

  AxisView.registerAxisPointerClass = function (type, clazz) {

    axisPointerClazz[type] = clazz;
  };

  AxisView.getAxisPointerClass = function (type) {
    return type && axisPointerClazz[type];
  };
  AxisView.type = 'axis';
  return AxisView;
}(ComponentView);

var inner$4 = makeInner();
function rectCoordAxisBuildSplitArea(axisView, axisGroup, axisModel, gridModel) {
  var axis = axisModel.axis;

  if (axis.scale.isBlank()) {
    return;
  } // TODO: TYPE


  var splitAreaModel = axisModel.getModel('splitArea');
  var areaStyleModel = splitAreaModel.getModel('areaStyle');
  var areaColors = areaStyleModel.get('color');
  var gridRect = gridModel.coordinateSystem.getRect();
  var ticksCoords = axis.getTicksCoords({
    tickModel: splitAreaModel,
    clamp: true
  });

  if (!ticksCoords.length) {
    return;
  } // For Making appropriate splitArea animation, the color and anid
  // should be corresponding to previous one if possible.


  var areaColorsLen = areaColors.length;
  var lastSplitAreaColors = inner$4(axisView).splitAreaColors;
  var newSplitAreaColors = createHashMap();
  var colorIndex = 0;

  if (lastSplitAreaColors) {
    for (var i = 0; i < ticksCoords.length; i++) {
      var cIndex = lastSplitAreaColors.get(ticksCoords[i].tickValue);

      if (cIndex != null) {
        colorIndex = (cIndex + (areaColorsLen - 1) * i) % areaColorsLen;
        break;
      }
    }
  }

  var prev = axis.toGlobalCoord(ticksCoords[0].coord);
  var areaStyle = areaStyleModel.getAreaStyle();
  areaColors = isArray(areaColors) ? areaColors : [areaColors];

  for (var i = 1; i < ticksCoords.length; i++) {
    var tickCoord = axis.toGlobalCoord(ticksCoords[i].coord);
    var x = void 0;
    var y = void 0;
    var width = void 0;
    var height = void 0;

    if (axis.isHorizontal()) {
      x = prev;
      y = gridRect.y;
      width = tickCoord - x;
      height = gridRect.height;
      prev = x + width;
    } else {
      x = gridRect.x;
      y = prev;
      width = gridRect.width;
      height = tickCoord - y;
      prev = y + height;
    }

    var tickValue = ticksCoords[i - 1].tickValue;
    tickValue != null && newSplitAreaColors.set(tickValue, colorIndex);
    axisGroup.add(new Rect$1({
      anid: tickValue != null ? 'area_' + tickValue : null,
      shape: {
        x: x,
        y: y,
        width: width,
        height: height
      },
      style: defaults({
        fill: areaColors[colorIndex]
      }, areaStyle),
      autoBatch: true,
      silent: true
    }));
    colorIndex = (colorIndex + 1) % areaColorsLen;
  }

  inner$4(axisView).splitAreaColors = newSplitAreaColors;
}
function rectCoordAxisHandleRemove(axisView) {
  inner$4(axisView).splitAreaColors = null;
}

var axisBuilderAttrs = ['axisLine', 'axisTickLabel', 'axisName'];
var selfBuilderAttrs = ['splitArea', 'splitLine', 'minorSplitLine'];

var CartesianAxisView =
/** @class */
function (_super) {
  __extends(CartesianAxisView, _super);

  function CartesianAxisView() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = CartesianAxisView.type;
    _this.axisPointerClass = 'CartesianAxisPointer';
    return _this;
  }
  /**
   * @override
   */


  CartesianAxisView.prototype.render = function (axisModel, ecModel, api, payload) {
    this.group.removeAll();
    var oldAxisGroup = this._axisGroup;
    this._axisGroup = new Group$2();
    this.group.add(this._axisGroup);

    if (!axisModel.get('show')) {
      return;
    }

    var gridModel = axisModel.getCoordSysModel();
    var layout$1 = layout(gridModel, axisModel);
    var axisBuilder = new AxisBuilder(axisModel, extend({
      handleAutoShown: function (elementType) {
        var cartesians = gridModel.coordinateSystem.getCartesians();

        for (var i = 0; i < cartesians.length; i++) {
          var otherAxisType = cartesians[i].getOtherAxis(axisModel.axis).type;

          if (otherAxisType === 'value' || otherAxisType === 'log') {
            // Still show axis tick or axisLine if other axis is value / log
            return true;
          }
        } // Not show axisTick or axisLine if other axis is category / time


        return false;
      }
    }, layout$1));
    each$4(axisBuilderAttrs, axisBuilder.add, axisBuilder);

    this._axisGroup.add(axisBuilder.getGroup());

    each$4(selfBuilderAttrs, function (name) {
      if (axisModel.get([name, 'show'])) {
        axisElementBuilders[name](this, this._axisGroup, axisModel, gridModel);
      }
    }, this);
    groupTransition(oldAxisGroup, this._axisGroup, axisModel);

    _super.prototype.render.call(this, axisModel, ecModel, api, payload);
  };

  CartesianAxisView.prototype.remove = function () {
    rectCoordAxisHandleRemove(this);
  };

  CartesianAxisView.type = 'cartesianAxis';
  return CartesianAxisView;
}(AxisView);

var axisElementBuilders = {
  splitLine: function (axisView, axisGroup, axisModel, gridModel) {
    var axis = axisModel.axis;

    if (axis.scale.isBlank()) {
      return;
    }

    var splitLineModel = axisModel.getModel('splitLine');
    var lineStyleModel = splitLineModel.getModel('lineStyle');
    var lineColors = lineStyleModel.get('color');
    lineColors = isArray(lineColors) ? lineColors : [lineColors];
    var gridRect = gridModel.coordinateSystem.getRect();
    var isHorizontal = axis.isHorizontal();
    var lineCount = 0;
    var ticksCoords = axis.getTicksCoords({
      tickModel: splitLineModel
    });
    var p1 = [];
    var p2 = [];
    var lineStyle = lineStyleModel.getLineStyle();

    for (var i = 0; i < ticksCoords.length; i++) {
      var tickCoord = axis.toGlobalCoord(ticksCoords[i].coord);

      if (isHorizontal) {
        p1[0] = tickCoord;
        p1[1] = gridRect.y;
        p2[0] = tickCoord;
        p2[1] = gridRect.y + gridRect.height;
      } else {
        p1[0] = gridRect.x;
        p1[1] = tickCoord;
        p2[0] = gridRect.x + gridRect.width;
        p2[1] = tickCoord;
      }

      var colorIndex = lineCount++ % lineColors.length;
      var tickValue = ticksCoords[i].tickValue;
      axisGroup.add(new Line({
        anid: tickValue != null ? 'line_' + ticksCoords[i].tickValue : null,
        subPixelOptimize: true,
        autoBatch: true,
        shape: {
          x1: p1[0],
          y1: p1[1],
          x2: p2[0],
          y2: p2[1]
        },
        style: defaults({
          stroke: lineColors[colorIndex]
        }, lineStyle),
        silent: true
      }));
    }
  },
  minorSplitLine: function (axisView, axisGroup, axisModel, gridModel) {
    var axis = axisModel.axis;
    var minorSplitLineModel = axisModel.getModel('minorSplitLine');
    var lineStyleModel = minorSplitLineModel.getModel('lineStyle');
    var gridRect = gridModel.coordinateSystem.getRect();
    var isHorizontal = axis.isHorizontal();
    var minorTicksCoords = axis.getMinorTicksCoords();

    if (!minorTicksCoords.length) {
      return;
    }

    var p1 = [];
    var p2 = [];
    var lineStyle = lineStyleModel.getLineStyle();

    for (var i = 0; i < minorTicksCoords.length; i++) {
      for (var k = 0; k < minorTicksCoords[i].length; k++) {
        var tickCoord = axis.toGlobalCoord(minorTicksCoords[i][k].coord);

        if (isHorizontal) {
          p1[0] = tickCoord;
          p1[1] = gridRect.y;
          p2[0] = tickCoord;
          p2[1] = gridRect.y + gridRect.height;
        } else {
          p1[0] = gridRect.x;
          p1[1] = tickCoord;
          p2[0] = gridRect.x + gridRect.width;
          p2[1] = tickCoord;
        }

        axisGroup.add(new Line({
          anid: 'minor_line_' + minorTicksCoords[i][k].tickValue,
          subPixelOptimize: true,
          autoBatch: true,
          shape: {
            x1: p1[0],
            y1: p1[1],
            x2: p2[0],
            y2: p2[1]
          },
          style: lineStyle,
          silent: true
        }));
      }
    }
  },
  splitArea: function (axisView, axisGroup, axisModel, gridModel) {
    rectCoordAxisBuildSplitArea(axisView, axisGroup, axisModel, gridModel);
  }
};

var CartesianXAxisView =
/** @class */
function (_super) {
  __extends(CartesianXAxisView, _super);

  function CartesianXAxisView() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = CartesianXAxisView.type;
    return _this;
  }

  CartesianXAxisView.type = 'xAxis';
  return CartesianXAxisView;
}(CartesianAxisView);

var CartesianYAxisView =
/** @class */
function (_super) {
  __extends(CartesianYAxisView, _super);

  function CartesianYAxisView() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = CartesianXAxisView.type;
    return _this;
  }

  CartesianYAxisView.type = 'yAxis';
  return CartesianYAxisView;
}(CartesianAxisView);

var GridView =
/** @class */
function (_super) {
  __extends(GridView, _super);

  function GridView() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = 'grid';
    return _this;
  }

  GridView.prototype.render = function (gridModel, ecModel) {
    this.group.removeAll();

    if (gridModel.get('show')) {
      this.group.add(new Rect$1({
        shape: gridModel.coordinateSystem.getRect(),
        style: defaults({
          fill: gridModel.get('backgroundColor')
        }, gridModel.getItemStyle()),
        silent: true,
        z2: -1
      }));
    }
  };

  GridView.type = 'grid';
  return GridView;
}(ComponentView);

var extraOption = {
  // gridIndex: 0,
  // gridId: '',
  offset: 0
};
function install$a(registers) {
  registers.registerComponentView(GridView);
  registers.registerComponentModel(GridModel);
  registers.registerCoordinateSystem('cartesian2d', Grid);
  axisModelCreator(registers, 'x', CartesianAxisModel, extraOption);
  axisModelCreator(registers, 'y', CartesianAxisModel, extraOption);
  registers.registerComponentView(CartesianXAxisView);
  registers.registerComponentView(CartesianYAxisView);
  registers.registerPreprocessor(function (option) {
    // Only create grid when need
    if (option.xAxis && option.yAxis && !option.grid) {
      option.grid = {};
    }
  });
}

var ATTR = '\0_ec_interaction_mutex';
function isTaken(zr, resourceKey) {
  return !!getStore(zr)[resourceKey];
}

function getStore(zr) {
  return zr[ATTR] || (zr[ATTR] = {});
}
/**
 * payload: {
 *     type: 'takeGlobalCursor',
 *     key: 'dataZoomSelect', or 'brush', or ...,
 *         If no userKey, release global cursor.
 * }
 */
// TODO: SELF REGISTERED.


registerAction({
  type: 'takeGlobalCursor',
  event: 'globalCursorTaken',
  update: 'update'
}, function () {});

var RoamController =
/** @class */
function (_super) {
  __extends(RoamController, _super);

  function RoamController(zr) {
    var _this = _super.call(this) || this;

    _this._zr = zr; // Avoid two roamController bind the same handler

    var mousedownHandler = bind$2(_this._mousedownHandler, _this);
    var mousemoveHandler = bind$2(_this._mousemoveHandler, _this);
    var mouseupHandler = bind$2(_this._mouseupHandler, _this);
    var mousewheelHandler = bind$2(_this._mousewheelHandler, _this);
    var pinchHandler = bind$2(_this._pinchHandler, _this);
    /**
     * Notice: only enable needed types. For example, if 'zoom'
     * is not needed, 'zoom' should not be enabled, otherwise
     * default mousewheel behaviour (scroll page) will be disabled.
     */

    _this.enable = function (controlType, opt) {
      // Disable previous first
      this.disable();
      this._opt = defaults(clone$1(opt) || {}, {
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        // By default, wheel do not trigger move.
        moveOnMouseWheel: false,
        preventDefaultMouseMove: true
      });

      if (controlType == null) {
        controlType = true;
      }

      if (controlType === true || controlType === 'move' || controlType === 'pan') {
        zr.on('mousedown', mousedownHandler);
        zr.on('mousemove', mousemoveHandler);
        zr.on('mouseup', mouseupHandler);
      }

      if (controlType === true || controlType === 'scale' || controlType === 'zoom') {
        zr.on('mousewheel', mousewheelHandler);
        zr.on('pinch', pinchHandler);
      }
    };

    _this.disable = function () {
      zr.off('mousedown', mousedownHandler);
      zr.off('mousemove', mousemoveHandler);
      zr.off('mouseup', mouseupHandler);
      zr.off('mousewheel', mousewheelHandler);
      zr.off('pinch', pinchHandler);
    };

    return _this;
  }

  RoamController.prototype.isDragging = function () {
    return this._dragging;
  };

  RoamController.prototype.isPinching = function () {
    return this._pinching;
  };

  RoamController.prototype.setPointerChecker = function (pointerChecker) {
    this.pointerChecker = pointerChecker;
  };

  RoamController.prototype.dispose = function () {
    this.disable();
  };

  RoamController.prototype._mousedownHandler = function (e) {
    if (isMiddleOrRightButtonOnMouseUpDown(e) || e.target && e.target.draggable) {
      return;
    }

    var x = e.offsetX;
    var y = e.offsetY; // Only check on mosedown, but not mousemove.
    // Mouse can be out of target when mouse moving.

    if (this.pointerChecker && this.pointerChecker(e, x, y)) {
      this._x = x;
      this._y = y;
      this._dragging = true;
    }
  };

  RoamController.prototype._mousemoveHandler = function (e) {
    if (!this._dragging || !isAvailableBehavior('moveOnMouseMove', e, this._opt) || e.gestureEvent === 'pinch' || isTaken(this._zr, 'globalPan')) {
      return;
    }

    var x = e.offsetX;
    var y = e.offsetY;
    var oldX = this._x;
    var oldY = this._y;
    var dx = x - oldX;
    var dy = y - oldY;
    this._x = x;
    this._y = y;
    this._opt.preventDefaultMouseMove && stop(e.event);
    trigger(this, 'pan', 'moveOnMouseMove', e, {
      dx: dx,
      dy: dy,
      oldX: oldX,
      oldY: oldY,
      newX: x,
      newY: y,
      isAvailableBehavior: null
    });
  };

  RoamController.prototype._mouseupHandler = function (e) {
    if (!isMiddleOrRightButtonOnMouseUpDown(e)) {
      this._dragging = false;
    }
  };

  RoamController.prototype._mousewheelHandler = function (e) {
    var shouldZoom = isAvailableBehavior('zoomOnMouseWheel', e, this._opt);
    var shouldMove = isAvailableBehavior('moveOnMouseWheel', e, this._opt);
    var wheelDelta = e.wheelDelta;
    var absWheelDeltaDelta = Math.abs(wheelDelta);
    var originX = e.offsetX;
    var originY = e.offsetY; // wheelDelta maybe -0 in chrome mac.

    if (wheelDelta === 0 || !shouldZoom && !shouldMove) {
      return;
    } // If both `shouldZoom` and `shouldMove` is true, trigger
    // their event both, and the final behavior is determined
    // by event listener themselves.


    if (shouldZoom) {
      // Convenience:
      // Mac and VM Windows on Mac: scroll up: zoom out.
      // Windows: scroll up: zoom in.
      // FIXME: Should do more test in different environment.
      // wheelDelta is too complicated in difference nvironment
      // (https://developer.mozilla.org/en-US/docs/Web/Events/mousewheel),
      // although it has been normallized by zrender.
      // wheelDelta of mouse wheel is bigger than touch pad.
      var factor = absWheelDeltaDelta > 3 ? 1.4 : absWheelDeltaDelta > 1 ? 1.2 : 1.1;
      var scale = wheelDelta > 0 ? factor : 1 / factor;
      checkPointerAndTrigger(this, 'zoom', 'zoomOnMouseWheel', e, {
        scale: scale,
        originX: originX,
        originY: originY,
        isAvailableBehavior: null
      });
    }

    if (shouldMove) {
      // FIXME: Should do more test in different environment.
      var absDelta = Math.abs(wheelDelta); // wheelDelta of mouse wheel is bigger than touch pad.

      var scrollDelta = (wheelDelta > 0 ? 1 : -1) * (absDelta > 3 ? 0.4 : absDelta > 1 ? 0.15 : 0.05);
      checkPointerAndTrigger(this, 'scrollMove', 'moveOnMouseWheel', e, {
        scrollDelta: scrollDelta,
        originX: originX,
        originY: originY,
        isAvailableBehavior: null
      });
    }
  };

  RoamController.prototype._pinchHandler = function (e) {
    if (isTaken(this._zr, 'globalPan')) {
      return;
    }

    var scale = e.pinchScale > 1 ? 1.1 : 1 / 1.1;
    checkPointerAndTrigger(this, 'zoom', null, e, {
      scale: scale,
      originX: e.pinchX,
      originY: e.pinchY,
      isAvailableBehavior: null
    });
  };

  return RoamController;
}(Eventful);

function checkPointerAndTrigger(controller, eventName, behaviorToCheck, e, contollerEvent) {
  if (controller.pointerChecker && controller.pointerChecker(e, contollerEvent.originX, contollerEvent.originY)) {
    // When mouse is out of roamController rect,
    // default befavoius should not be be disabled, otherwise
    // page sliding is disabled, contrary to expectation.
    stop(e.event);
    trigger(controller, eventName, behaviorToCheck, e, contollerEvent);
  }
}

function trigger(controller, eventName, behaviorToCheck, e, contollerEvent) {
  // Also provide behavior checker for event listener, for some case that
  // multiple components share one listener.
  contollerEvent.isAvailableBehavior = bind$2(isAvailableBehavior, null, behaviorToCheck, e);
  controller.trigger(eventName, contollerEvent);
} // settings: {
//     zoomOnMouseWheel
//     moveOnMouseMove
//     moveOnMouseWheel
// }
// The value can be: true / false / 'shift' / 'ctrl' / 'alt'.


function isAvailableBehavior(behaviorToCheck, e, settings) {
  var setting = settings[behaviorToCheck];
  return !behaviorToCheck || setting && (!isString(setting) || e.event[setting + 'Key']);
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
 * Calculate slider move result.
 * Usage:
 * (1) If both handle0 and handle1 are needed to be moved, set minSpan the same as
 * maxSpan and the same as `Math.abs(handleEnd[1] - handleEnds[0])`.
 * (2) If handle0 is forbidden to cross handle1, set minSpan as `0`.
 *
 * @param delta Move length.
 * @param handleEnds handleEnds[0] can be bigger then handleEnds[1].
 *              handleEnds will be modified in this method.
 * @param extent handleEnds is restricted by extent.
 *              extent[0] should less or equals than extent[1].
 * @param handleIndex Can be 'all', means that both move the two handleEnds.
 * @param minSpan The range of dataZoom can not be smaller than that.
 *              If not set, handle0 and cross handle1. If set as a non-negative
 *              number (including `0`), handles will push each other when reaching
 *              the minSpan.
 * @param maxSpan The range of dataZoom can not be larger than that.
 * @return The input handleEnds.
 */
function sliderMove(delta, handleEnds, extent, handleIndex, minSpan, maxSpan) {
  delta = delta || 0;
  var extentSpan = extent[1] - extent[0]; // Notice maxSpan and minSpan can be null/undefined.

  if (minSpan != null) {
    minSpan = restrict(minSpan, [0, extentSpan]);
  }

  if (maxSpan != null) {
    maxSpan = Math.max(maxSpan, minSpan != null ? minSpan : 0);
  }

  if (handleIndex === 'all') {
    var handleSpan = Math.abs(handleEnds[1] - handleEnds[0]);
    handleSpan = restrict(handleSpan, [0, extentSpan]);
    minSpan = maxSpan = restrict(handleSpan, [minSpan, maxSpan]);
    handleIndex = 0;
  }

  handleEnds[0] = restrict(handleEnds[0], extent);
  handleEnds[1] = restrict(handleEnds[1], extent);
  var originalDistSign = getSpanSign(handleEnds, handleIndex);
  handleEnds[handleIndex] += delta; // Restrict in extent.

  var extentMinSpan = minSpan || 0;
  var realExtent = extent.slice();
  originalDistSign.sign < 0 ? realExtent[0] += extentMinSpan : realExtent[1] -= extentMinSpan;
  handleEnds[handleIndex] = restrict(handleEnds[handleIndex], realExtent); // Expand span.

  var currDistSign;
  currDistSign = getSpanSign(handleEnds, handleIndex);

  if (minSpan != null && (currDistSign.sign !== originalDistSign.sign || currDistSign.span < minSpan)) {
    // If minSpan exists, 'cross' is forbidden.
    handleEnds[1 - handleIndex] = handleEnds[handleIndex] + originalDistSign.sign * minSpan;
  } // Shrink span.


  currDistSign = getSpanSign(handleEnds, handleIndex);

  if (maxSpan != null && currDistSign.span > maxSpan) {
    handleEnds[1 - handleIndex] = handleEnds[handleIndex] + currDistSign.sign * maxSpan;
  }

  return handleEnds;
}

function getSpanSign(handleEnds, handleIndex) {
  var dist = handleEnds[handleIndex] - handleEnds[1 - handleIndex]; // If `handleEnds[0] === handleEnds[1]`, always believe that handleEnd[0]
  // is at left of handleEnds[1] for non-cross case.

  return {
    span: Math.abs(dist),
    sign: dist > 0 ? -1 : dist < 0 ? 1 : handleIndex ? -1 : 1
  };
}

function restrict(value, extend) {
  return Math.min(extend[1] != null ? extend[1] : Infinity, Math.max(extend[0] != null ? extend[0] : -Infinity, value));
}

var inner$3 = makeInner();
var clone = clone$1;
var bind$1 = bind$2;
/**
 * Base axis pointer class in 2D.
 */

var BaseAxisPointer =
/** @class */
function () {
  function BaseAxisPointer() {
    this._dragging = false;
    /**
     * In px, arbitrary value. Do not set too small,
     * no animation is ok for most cases.
     */

    this.animationThreshold = 15;
  }
  /**
   * @implement
   */


  BaseAxisPointer.prototype.render = function (axisModel, axisPointerModel, api, forceRender) {
    var value = axisPointerModel.get('value');
    var status = axisPointerModel.get('status'); // Bind them to `this`, not in closure, otherwise they will not
    // be replaced when user calling setOption in not merge mode.

    this._axisModel = axisModel;
    this._axisPointerModel = axisPointerModel;
    this._api = api; // Optimize: `render` will be called repeatly during mouse move.
    // So it is power consuming if performing `render` each time,
    // especially on mobile device.

    if (!forceRender && this._lastValue === value && this._lastStatus === status) {
      return;
    }

    this._lastValue = value;
    this._lastStatus = status;
    var group = this._group;
    var handle = this._handle;

    if (!status || status === 'hide') {
      // Do not clear here, for animation better.
      group && group.hide();
      handle && handle.hide();
      return;
    }

    group && group.show();
    handle && handle.show(); // Otherwise status is 'show'

    var elOption = {};
    this.makeElOption(elOption, value, axisModel, axisPointerModel, api); // Enable change axis pointer type.

    var graphicKey = elOption.graphicKey;

    if (graphicKey !== this._lastGraphicKey) {
      this.clear(api);
    }

    this._lastGraphicKey = graphicKey;
    var moveAnimation = this._moveAnimation = this.determineAnimation(axisModel, axisPointerModel);

    if (!group) {
      group = this._group = new Group$2();
      this.createPointerEl(group, elOption, axisModel, axisPointerModel);
      this.createLabelEl(group, elOption, axisModel, axisPointerModel);
      api.getZr().add(group);
    } else {
      var doUpdateProps = curry$1(updateProps, axisPointerModel, moveAnimation);
      this.updatePointerEl(group, elOption, doUpdateProps);
      this.updateLabelEl(group, elOption, doUpdateProps, axisPointerModel);
    }

    updateMandatoryProps(group, axisPointerModel, true);

    this._renderHandle(value);
  };
  /**
   * @implement
   */


  BaseAxisPointer.prototype.remove = function (api) {
    this.clear(api);
  };
  /**
   * @implement
   */


  BaseAxisPointer.prototype.dispose = function (api) {
    this.clear(api);
  };
  /**
   * @protected
   */


  BaseAxisPointer.prototype.determineAnimation = function (axisModel, axisPointerModel) {
    var animation = axisPointerModel.get('animation');
    var axis = axisModel.axis;
    var isCategoryAxis = axis.type === 'category';
    var useSnap = axisPointerModel.get('snap'); // Value axis without snap always do not snap.

    if (!useSnap && !isCategoryAxis) {
      return false;
    }

    if (animation === 'auto' || animation == null) {
      var animationThreshold = this.animationThreshold;

      if (isCategoryAxis && axis.getBandWidth() > animationThreshold) {
        return true;
      } // It is important to auto animation when snap used. Consider if there is
      // a dataZoom, animation will be disabled when too many points exist, while
      // it will be enabled for better visual effect when little points exist.


      if (useSnap) {
        var seriesDataCount = getAxisInfo(axisModel).seriesDataCount;
        var axisExtent = axis.getExtent(); // Approximate band width

        return Math.abs(axisExtent[0] - axisExtent[1]) / seriesDataCount > animationThreshold;
      }

      return false;
    }

    return animation === true;
  };
  /**
   * add {pointer, label, graphicKey} to elOption
   * @protected
   */


  BaseAxisPointer.prototype.makeElOption = function (elOption, value, axisModel, axisPointerModel, api) {// Shoule be implemenented by sub-class.
  };
  /**
   * @protected
   */


  BaseAxisPointer.prototype.createPointerEl = function (group, elOption, axisModel, axisPointerModel) {
    var pointerOption = elOption.pointer;

    if (pointerOption) {
      var pointerEl = inner$3(group).pointerEl = new graphic[pointerOption.type](clone(elOption.pointer));
      group.add(pointerEl);
    }
  };
  /**
   * @protected
   */


  BaseAxisPointer.prototype.createLabelEl = function (group, elOption, axisModel, axisPointerModel) {
    if (elOption.label) {
      var labelEl = inner$3(group).labelEl = new ZRText(clone(elOption.label));
      group.add(labelEl);
      updateLabelShowHide(labelEl, axisPointerModel);
    }
  };
  /**
   * @protected
   */


  BaseAxisPointer.prototype.updatePointerEl = function (group, elOption, updateProps) {
    var pointerEl = inner$3(group).pointerEl;

    if (pointerEl && elOption.pointer) {
      pointerEl.setStyle(elOption.pointer.style);
      updateProps(pointerEl, {
        shape: elOption.pointer.shape
      });
    }
  };
  /**
   * @protected
   */


  BaseAxisPointer.prototype.updateLabelEl = function (group, elOption, updateProps, axisPointerModel) {
    var labelEl = inner$3(group).labelEl;

    if (labelEl) {
      labelEl.setStyle(elOption.label.style);
      updateProps(labelEl, {
        // Consider text length change in vertical axis, animation should
        // be used on shape, otherwise the effect will be weird.
        // TODOTODO
        // shape: elOption.label.shape,
        x: elOption.label.x,
        y: elOption.label.y
      });
      updateLabelShowHide(labelEl, axisPointerModel);
    }
  };
  /**
   * @private
   */


  BaseAxisPointer.prototype._renderHandle = function (value) {
    if (this._dragging || !this.updateHandleTransform) {
      return;
    }

    var axisPointerModel = this._axisPointerModel;

    var zr = this._api.getZr();

    var handle = this._handle;
    var handleModel = axisPointerModel.getModel('handle');
    var status = axisPointerModel.get('status');

    if (!handleModel.get('show') || !status || status === 'hide') {
      handle && zr.remove(handle);
      this._handle = null;
      return;
    }

    var isInit;

    if (!this._handle) {
      isInit = true;
      handle = this._handle = createIcon(handleModel.get('icon'), {
        cursor: 'move',
        draggable: true,
        onmousemove: function (e) {
          // Fot mobile devicem, prevent screen slider on the button.
          stop(e.event);
        },
        onmousedown: bind$1(this._onHandleDragMove, this, 0, 0),
        drift: bind$1(this._onHandleDragMove, this),
        ondragend: bind$1(this._onHandleDragEnd, this)
      });
      zr.add(handle);
    }

    updateMandatoryProps(handle, axisPointerModel, false); // update style

    handle.setStyle(handleModel.getItemStyle(null, ['color', 'borderColor', 'borderWidth', 'opacity', 'shadowColor', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'])); // update position

    var handleSize = handleModel.get('size');

    if (!isArray(handleSize)) {
      handleSize = [handleSize, handleSize];
    }

    handle.scaleX = handleSize[0] / 2;
    handle.scaleY = handleSize[1] / 2;
    createOrUpdate(this, '_doDispatchAxisPointer', handleModel.get('throttle') || 0, 'fixRate');

    this._moveHandleToValue(value, isInit);
  };

  BaseAxisPointer.prototype._moveHandleToValue = function (value, isInit) {
    updateProps(this._axisPointerModel, !isInit && this._moveAnimation, this._handle, getHandleTransProps(this.getHandleTransform(value, this._axisModel, this._axisPointerModel)));
  };

  BaseAxisPointer.prototype._onHandleDragMove = function (dx, dy) {
    var handle = this._handle;

    if (!handle) {
      return;
    }

    this._dragging = true; // Persistent for throttle.

    var trans = this.updateHandleTransform(getHandleTransProps(handle), [dx, dy], this._axisModel, this._axisPointerModel);
    this._payloadInfo = trans;
    handle.stopAnimation();
    handle.attr(getHandleTransProps(trans));
    inner$3(handle).lastProp = null;

    this._doDispatchAxisPointer();
  };
  /**
   * Throttled method.
   */


  BaseAxisPointer.prototype._doDispatchAxisPointer = function () {
    var handle = this._handle;

    if (!handle) {
      return;
    }

    var payloadInfo = this._payloadInfo;
    var axisModel = this._axisModel;

    this._api.dispatchAction({
      type: 'updateAxisPointer',
      x: payloadInfo.cursorPoint[0],
      y: payloadInfo.cursorPoint[1],
      tooltipOption: payloadInfo.tooltipOption,
      axesInfo: [{
        axisDim: axisModel.axis.dim,
        axisIndex: axisModel.componentIndex
      }]
    });
  };

  BaseAxisPointer.prototype._onHandleDragEnd = function () {
    this._dragging = false;
    var handle = this._handle;

    if (!handle) {
      return;
    }

    var value = this._axisPointerModel.get('value'); // Consider snap or categroy axis, handle may be not consistent with
    // axisPointer. So move handle to align the exact value position when
    // drag ended.


    this._moveHandleToValue(value); // For the effect: tooltip will be shown when finger holding on handle
    // button, and will be hidden after finger left handle button.


    this._api.dispatchAction({
      type: 'hideTip'
    });
  };
  /**
   * @private
   */


  BaseAxisPointer.prototype.clear = function (api) {
    this._lastValue = null;
    this._lastStatus = null;
    var zr = api.getZr();
    var group = this._group;
    var handle = this._handle;

    if (zr && group) {
      this._lastGraphicKey = null;
      group && zr.remove(group);
      handle && zr.remove(handle);
      this._group = null;
      this._handle = null;
      this._payloadInfo = null;
    }
  };
  /**
   * @protected
   */


  BaseAxisPointer.prototype.doClear = function () {// Implemented by sub-class if necessary.
  };

  BaseAxisPointer.prototype.buildLabel = function (xy, wh, xDimIndex) {
    xDimIndex = xDimIndex || 0;
    return {
      x: xy[xDimIndex],
      y: xy[1 - xDimIndex],
      width: wh[xDimIndex],
      height: wh[1 - xDimIndex]
    };
  };

  return BaseAxisPointer;
}();

function updateProps(animationModel, moveAnimation, el, props) {
  // Animation optimize.
  if (!propsEqual(inner$3(el).lastProp, props)) {
    inner$3(el).lastProp = props;
    moveAnimation ? updateProps$1(el, props, animationModel) : (el.stopAnimation(), el.attr(props));
  }
}

function propsEqual(lastProps, newProps) {
  if (isObject(lastProps) && isObject(newProps)) {
    var equals_1 = true;
    each$4(newProps, function (item, key) {
      equals_1 = equals_1 && propsEqual(lastProps[key], item);
    });
    return !!equals_1;
  } else {
    return lastProps === newProps;
  }
}

function updateLabelShowHide(labelEl, axisPointerModel) {
  labelEl[axisPointerModel.get(['label', 'show']) ? 'show' : 'hide']();
}

function getHandleTransProps(trans) {
  return {
    x: trans.x || 0,
    y: trans.y || 0,
    rotation: trans.rotation || 0
  };
}

function updateMandatoryProps(group, axisPointerModel, silent) {
  var z = axisPointerModel.get('z');
  var zlevel = axisPointerModel.get('zlevel');
  group && group.traverse(function (el) {
    if (el.type !== 'group') {
      z != null && (el.z = z);
      zlevel != null && (el.zlevel = zlevel);
      el.silent = silent;
    }
  });
}

function buildElStyle(axisPointerModel) {
  var axisPointerType = axisPointerModel.get('type');
  var styleModel = axisPointerModel.getModel(axisPointerType + 'Style');
  var style;

  if (axisPointerType === 'line') {
    style = styleModel.getLineStyle();
    style.fill = null;
  } else if (axisPointerType === 'shadow') {
    style = styleModel.getAreaStyle();
    style.stroke = null;
  }

  return style;
}
/**
 * @param {Function} labelPos {align, verticalAlign, position}
 */

function buildLabelElOption(elOption, axisModel, axisPointerModel, api, labelPos) {
  var value = axisPointerModel.get('value');
  var text = getValueLabel(value, axisModel.axis, axisModel.ecModel, axisPointerModel.get('seriesDataIndices'), {
    precision: axisPointerModel.get(['label', 'precision']),
    formatter: axisPointerModel.get(['label', 'formatter'])
  });
  var labelModel = axisPointerModel.getModel('label');
  var paddings = normalizeCssArray(labelModel.get('padding') || 0);
  var font = labelModel.getFont();
  var textRect = getBoundingRect(text, font);
  var position = labelPos.position;
  var width = textRect.width + paddings[1] + paddings[3];
  var height = textRect.height + paddings[0] + paddings[2]; // Adjust by align.

  var align = labelPos.align;
  align === 'right' && (position[0] -= width);
  align === 'center' && (position[0] -= width / 2);
  var verticalAlign = labelPos.verticalAlign;
  verticalAlign === 'bottom' && (position[1] -= height);
  verticalAlign === 'middle' && (position[1] -= height / 2); // Not overflow ec container

  confineInContainer(position, width, height, api);
  var bgColor = labelModel.get('backgroundColor');

  if (!bgColor || bgColor === 'auto') {
    bgColor = axisModel.get(['axisLine', 'lineStyle', 'color']);
  }

  elOption.label = {
    // shape: {x: 0, y: 0, width: width, height: height, r: labelModel.get('borderRadius')},
    x: position[0],
    y: position[1],
    style: createTextStyle(labelModel, {
      text: text,
      font: font,
      fill: labelModel.getTextColor(),
      padding: paddings,
      backgroundColor: bgColor
    }),
    // Lable should be over axisPointer.
    z2: 10
  };
} // Do not overflow ec container

function confineInContainer(position, width, height, api) {
  var viewWidth = api.getWidth();
  var viewHeight = api.getHeight();
  position[0] = Math.min(position[0] + width, viewWidth) - width;
  position[1] = Math.min(position[1] + height, viewHeight) - height;
  position[0] = Math.max(position[0], 0);
  position[1] = Math.max(position[1], 0);
}

function getValueLabel(value, axis, ecModel, seriesDataIndices, opt) {
  value = axis.scale.parse(value);
  var text = axis.scale.getLabel({
    value: value
  }, {
    // If `precision` is set, width can be fixed (like '12.00500'), which
    // helps to debounce when when moving label.
    precision: opt.precision
  });
  var formatter = opt.formatter;

  if (formatter) {
    var params_1 = {
      value: getAxisRawValue(axis, {
        value: value
      }),
      axisDimension: axis.dim,
      axisIndex: axis.index,
      seriesData: []
    };
    each$4(seriesDataIndices, function (idxItem) {
      var series = ecModel.getSeriesByIndex(idxItem.seriesIndex);
      var dataIndex = idxItem.dataIndexInside;
      var dataParams = series && series.getDataParams(dataIndex);
      dataParams && params_1.seriesData.push(dataParams);
    });

    if (isString(formatter)) {
      text = formatter.replace('{value}', text);
    } else if (isFunction(formatter)) {
      text = formatter(params_1);
    }
  }

  return text;
}
function getTransformedPosition(axis, value, layoutInfo) {
  var transform = create();
  rotate(transform, transform, layoutInfo.rotation);
  translate(transform, transform, layoutInfo.position);
  return applyTransform$1([axis.dataToCoord(value), (layoutInfo.labelOffset || 0) + (layoutInfo.labelDirection || 1) * (layoutInfo.labelMargin || 0)], transform);
}
function buildCartesianSingleLabelElOption(value, elOption, layoutInfo, axisModel, axisPointerModel, api) {
  // @ts-ignore
  var textLayout = AxisBuilder.innerTextLayout(layoutInfo.rotation, 0, layoutInfo.labelDirection);
  layoutInfo.labelMargin = axisPointerModel.get(['label', 'margin']);
  buildLabelElOption(elOption, axisModel, axisPointerModel, api, {
    position: getTransformedPosition(axisModel.axis, value, layoutInfo),
    align: textLayout.textAlign,
    verticalAlign: textLayout.textVerticalAlign
  });
}
function makeLineShape(p1, p2, xDimIndex) {
  xDimIndex = xDimIndex || 0;
  return {
    x1: p1[xDimIndex],
    y1: p1[1 - xDimIndex],
    x2: p2[xDimIndex],
    y2: p2[1 - xDimIndex]
  };
}
function makeRectShape(xy, wh, xDimIndex) {
  xDimIndex = xDimIndex || 0;
  return {
    x: xy[xDimIndex],
    y: xy[1 - xDimIndex],
    width: wh[xDimIndex],
    height: wh[1 - xDimIndex]
  };
}

var CartesianAxisPointer =
/** @class */
function (_super) {
  __extends(CartesianAxisPointer, _super);

  function CartesianAxisPointer() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  /**
   * @override
   */


  CartesianAxisPointer.prototype.makeElOption = function (elOption, value, axisModel, axisPointerModel, api) {
    var axis = axisModel.axis;
    var grid = axis.grid;
    var axisPointerType = axisPointerModel.get('type');
    var otherExtent = getCartesian(grid, axis).getOtherAxis(axis).getGlobalExtent();
    var pixelValue = axis.toGlobalCoord(axis.dataToCoord(value, true));

    if (axisPointerType && axisPointerType !== 'none') {
      var elStyle = buildElStyle(axisPointerModel);
      var pointerOption = pointerShapeBuilder[axisPointerType](axis, pixelValue, otherExtent);
      pointerOption.style = elStyle;
      elOption.graphicKey = pointerOption.type;
      elOption.pointer = pointerOption;
    }

    var layoutInfo = layout(grid.model, axisModel);
    buildCartesianSingleLabelElOption( // @ts-ignore
    value, elOption, layoutInfo, axisModel, axisPointerModel, api);
  };
  /**
   * @override
   */


  CartesianAxisPointer.prototype.getHandleTransform = function (value, axisModel, axisPointerModel) {
    var layoutInfo = layout(axisModel.axis.grid.model, axisModel, {
      labelInside: false
    }); // @ts-ignore

    layoutInfo.labelMargin = axisPointerModel.get(['handle', 'margin']);
    var pos = getTransformedPosition(axisModel.axis, value, layoutInfo);
    return {
      x: pos[0],
      y: pos[1],
      rotation: layoutInfo.rotation + (layoutInfo.labelDirection < 0 ? Math.PI : 0)
    };
  };
  /**
   * @override
   */


  CartesianAxisPointer.prototype.updateHandleTransform = function (transform, delta, axisModel, axisPointerModel) {
    var axis = axisModel.axis;
    var grid = axis.grid;
    var axisExtent = axis.getGlobalExtent(true);
    var otherExtent = getCartesian(grid, axis).getOtherAxis(axis).getGlobalExtent();
    var dimIndex = axis.dim === 'x' ? 0 : 1;
    var currPosition = [transform.x, transform.y];
    currPosition[dimIndex] += delta[dimIndex];
    currPosition[dimIndex] = Math.min(axisExtent[1], currPosition[dimIndex]);
    currPosition[dimIndex] = Math.max(axisExtent[0], currPosition[dimIndex]);
    var cursorOtherValue = (otherExtent[1] + otherExtent[0]) / 2;
    var cursorPoint = [cursorOtherValue, cursorOtherValue];
    cursorPoint[dimIndex] = currPosition[dimIndex]; // Make tooltip do not overlap axisPointer and in the middle of the grid.

    var tooltipOptions = [{
      verticalAlign: 'middle'
    }, {
      align: 'center'
    }];
    return {
      x: currPosition[0],
      y: currPosition[1],
      rotation: transform.rotation,
      cursorPoint: cursorPoint,
      tooltipOption: tooltipOptions[dimIndex]
    };
  };

  return CartesianAxisPointer;
}(BaseAxisPointer);

function getCartesian(grid, axis) {
  var opt = {};
  opt[axis.dim + 'AxisIndex'] = axis.index;
  return grid.getCartesian(opt);
}

var pointerShapeBuilder = {
  line: function (axis, pixelValue, otherExtent) {
    var targetShape = makeLineShape([pixelValue, otherExtent[0]], [pixelValue, otherExtent[1]], getAxisDimIndex(axis));
    return {
      type: 'Line',
      subPixelOptimize: true,
      shape: targetShape
    };
  },
  shadow: function (axis, pixelValue, otherExtent) {
    var bandWidth = Math.max(1, axis.getBandWidth());
    var span = otherExtent[1] - otherExtent[0];
    return {
      type: 'Rect',
      shape: makeRectShape([pixelValue - bandWidth / 2, otherExtent[0]], [bandWidth, span], getAxisDimIndex(axis))
    };
  }
};

function getAxisDimIndex(axis) {
  return axis.dim === 'x' ? 0 : 1;
}

var AxisPointerModel =
/** @class */
function (_super) {
  __extends(AxisPointerModel, _super);

  function AxisPointerModel() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = AxisPointerModel.type;
    return _this;
  }

  AxisPointerModel.type = 'axisPointer';
  AxisPointerModel.defaultOption = {
    // 'auto' means that show when triggered by tooltip or handle.
    show: 'auto',
    zlevel: 0,
    z: 50,
    type: 'line',
    // axispointer triggered by tootip determine snap automatically,
    // see `modelHelper`.
    snap: false,
    triggerTooltip: true,
    value: null,
    status: null,
    link: [],
    // Do not set 'auto' here, otherwise global animation: false
    // will not effect at this axispointer.
    animation: null,
    animationDurationUpdate: 200,
    lineStyle: {
      color: '#B9BEC9',
      width: 1,
      type: 'dashed'
    },
    shadowStyle: {
      color: 'rgba(210,219,238,0.2)'
    },
    label: {
      show: true,
      formatter: null,
      precision: 'auto',
      margin: 3,
      color: '#fff',
      padding: [5, 7, 5, 7],
      backgroundColor: 'auto',
      borderColor: null,
      borderWidth: 0,
      borderRadius: 3
    },
    handle: {
      show: false,
      // eslint-disable-next-line
      icon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7v-1.2h6.6z M13.3,22H6.7v-1.2h6.6z M13.3,19.6H6.7v-1.2h6.6z',
      size: 45,
      // handle margin is from symbol center to axis, which is stable when circular move.
      margin: 50,
      // color: '#1b8bbd'
      // color: '#2f4554'
      color: '#333',
      shadowBlur: 3,
      shadowColor: '#aaa',
      shadowOffsetX: 0,
      shadowOffsetY: 2,
      // For mobile performance
      throttle: 40
    }
  };
  return AxisPointerModel;
}(ComponentModel);

var inner$2 = makeInner();
var each$3 = each$4;
/**
 * @param {string} key
 * @param {module:echarts/ExtensionAPI} api
 * @param {Function} handler
 *      param: {string} currTrigger
 *      param: {Array.<number>} point
 */

function register(key, api, handler) {
  if (env.node) {
    return;
  }

  var zr = api.getZr();
  inner$2(zr).records || (inner$2(zr).records = {});
  initGlobalListeners(zr, api);
  var record = inner$2(zr).records[key] || (inner$2(zr).records[key] = {});
  record.handler = handler;
}

function initGlobalListeners(zr, api) {
  if (inner$2(zr).initialized) {
    return;
  }

  inner$2(zr).initialized = true;
  useHandler('click', curry$1(doEnter, 'click'));
  useHandler('mousemove', curry$1(doEnter, 'mousemove')); // useHandler('mouseout', onLeave);

  useHandler('globalout', onLeave);

  function useHandler(eventType, cb) {
    zr.on(eventType, function (e) {
      var dis = makeDispatchAction$1(api);
      each$3(inner$2(zr).records, function (record) {
        record && cb(record, e, dis.dispatchAction);
      });
      dispatchTooltipFinally(dis.pendings, api);
    });
  }
}

function dispatchTooltipFinally(pendings, api) {
  var showLen = pendings.showTip.length;
  var hideLen = pendings.hideTip.length;
  var actuallyPayload;

  if (showLen) {
    actuallyPayload = pendings.showTip[showLen - 1];
  } else if (hideLen) {
    actuallyPayload = pendings.hideTip[hideLen - 1];
  }

  if (actuallyPayload) {
    actuallyPayload.dispatchAction = null;
    api.dispatchAction(actuallyPayload);
  }
}

function onLeave(record, e, dispatchAction) {
  record.handler('leave', null, dispatchAction);
}

function doEnter(currTrigger, record, e, dispatchAction) {
  record.handler(currTrigger, e, dispatchAction);
}

function makeDispatchAction$1(api) {
  var pendings = {
    showTip: [],
    hideTip: []
  }; // FIXME
  // better approach?
  // 'showTip' and 'hideTip' can be triggered by axisPointer and tooltip,
  // which may be conflict, (axisPointer call showTip but tooltip call hideTip);
  // So we have to add "final stage" to merge those dispatched actions.

  var dispatchAction = function (payload) {
    var pendingList = pendings[payload.type];

    if (pendingList) {
      pendingList.push(payload);
    } else {
      payload.dispatchAction = dispatchAction;
      api.dispatchAction(payload);
    }
  };

  return {
    dispatchAction: dispatchAction,
    pendings: pendings
  };
}

function unregister(key, api) {
  if (env.node) {
    return;
  }

  var zr = api.getZr();
  var record = (inner$2(zr).records || {})[key];

  if (record) {
    inner$2(zr).records[key] = null;
  }
}

var AxisPointerView =
/** @class */
function (_super) {
  __extends(AxisPointerView, _super);

  function AxisPointerView() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = AxisPointerView.type;
    return _this;
  }

  AxisPointerView.prototype.render = function (globalAxisPointerModel, ecModel, api) {
    var globalTooltipModel = ecModel.getComponent('tooltip');
    var triggerOn = globalAxisPointerModel.get('triggerOn') || globalTooltipModel && globalTooltipModel.get('triggerOn') || 'mousemove|click'; // Register global listener in AxisPointerView to enable
    // AxisPointerView to be independent to Tooltip.

    register('axisPointer', api, function (currTrigger, e, dispatchAction) {
      // If 'none', it is not controlled by mouse totally.
      if (triggerOn !== 'none' && (currTrigger === 'leave' || triggerOn.indexOf(currTrigger) >= 0)) {
        dispatchAction({
          type: 'updateAxisPointer',
          currTrigger: currTrigger,
          x: e && e.offsetX,
          y: e && e.offsetY
        });
      }
    });
  };

  AxisPointerView.prototype.remove = function (ecModel, api) {
    unregister('axisPointer', api);
  };

  AxisPointerView.prototype.dispose = function (ecModel, api) {
    unregister('axisPointer', api);
  };

  AxisPointerView.type = 'axisPointer';
  return AxisPointerView;
}(ComponentView);

/**
 * @param finder contains {seriesIndex, dataIndex, dataIndexInside}
 * @param ecModel
 * @return  {point: [x, y], el: ...} point Will not be null.
 */

function findPointFromSeries(finder, ecModel) {
  var point = [];
  var seriesIndex = finder.seriesIndex;
  var seriesModel;

  if (seriesIndex == null || !(seriesModel = ecModel.getSeriesByIndex(seriesIndex))) {
    return {
      point: []
    };
  }

  var data = seriesModel.getData();
  var dataIndex = queryDataIndex(data, finder);

  if (dataIndex == null || dataIndex < 0 || isArray(dataIndex)) {
    return {
      point: []
    };
  }

  var el = data.getItemGraphicEl(dataIndex);
  var coordSys = seriesModel.coordinateSystem;

  if (seriesModel.getTooltipPosition) {
    point = seriesModel.getTooltipPosition(dataIndex) || [];
  } else if (coordSys && coordSys.dataToPoint) {
    if (finder.isStacked) {
      var baseAxis = coordSys.getBaseAxis();
      var valueAxis = coordSys.getOtherAxis(baseAxis);
      var valueAxisDim = valueAxis.dim;
      var baseAxisDim = baseAxis.dim;
      var baseDataOffset = valueAxisDim === 'x' || valueAxisDim === 'radius' ? 1 : 0;
      var baseDim = data.mapDimension(baseAxisDim);
      var stackedData = [];
      stackedData[baseDataOffset] = data.get(baseDim, dataIndex);
      stackedData[1 - baseDataOffset] = data.get(data.getCalculationInfo('stackResultDimension'), dataIndex);
      point = coordSys.dataToPoint(stackedData) || [];
    } else {
      point = coordSys.dataToPoint(data.getValues(map(coordSys.dimensions, function (dim) {
        return data.mapDimension(dim);
      }), dataIndex)) || [];
    }
  } else if (el) {
    // Use graphic bounding rect
    var rect = el.getBoundingRect().clone();
    rect.applyTransform(el.transform);
    point = [rect.x + rect.width / 2, rect.y + rect.height / 2];
  }

  return {
    point: point,
    el: el
  };
}

var inner$1 = makeInner();
/**
 * Basic logic: check all axis, if they do not demand show/highlight,
 * then hide/downplay them.
 *
 * @return content of event obj for echarts.connect.
 */

function axisTrigger(payload, ecModel, api) {
  var currTrigger = payload.currTrigger;
  var point = [payload.x, payload.y];
  var finder = payload;
  var dispatchAction = payload.dispatchAction || bind$2(api.dispatchAction, api);
  var coordSysAxesInfo = ecModel.getComponent('axisPointer').coordSysAxesInfo; // Pending
  // See #6121. But we are not able to reproduce it yet.

  if (!coordSysAxesInfo) {
    return;
  }

  if (illegalPoint(point)) {
    // Used in the default behavior of `connection`: use the sample seriesIndex
    // and dataIndex. And also used in the tooltipView trigger.
    point = findPointFromSeries({
      seriesIndex: finder.seriesIndex,
      // Do not use dataIndexInside from other ec instance.
      // FIXME: auto detect it?
      dataIndex: finder.dataIndex
    }, ecModel).point;
  }

  var isIllegalPoint = illegalPoint(point); // Axis and value can be specified when calling dispatchAction({type: 'updateAxisPointer'}).
  // Notice: In this case, it is difficult to get the `point` (which is necessary to show
  // tooltip, so if point is not given, we just use the point found by sample seriesIndex
  // and dataIndex.

  var inputAxesInfo = finder.axesInfo;
  var axesInfo = coordSysAxesInfo.axesInfo;
  var shouldHide = currTrigger === 'leave' || illegalPoint(point);
  var outputPayload = {};
  var showValueMap = {};
  var dataByCoordSys = {
    list: [],
    map: {}
  };
  var updaters = {
    showPointer: curry$1(showPointer, showValueMap),
    showTooltip: curry$1(showTooltip, dataByCoordSys)
  }; // Process for triggered axes.

  each$4(coordSysAxesInfo.coordSysMap, function (coordSys, coordSysKey) {
    // If a point given, it must be contained by the coordinate system.
    var coordSysContainsPoint = isIllegalPoint || coordSys.containPoint(point);
    each$4(coordSysAxesInfo.coordSysAxesInfo[coordSysKey], function (axisInfo, key) {
      var axis = axisInfo.axis;
      var inputAxisInfo = findInputAxisInfo(inputAxesInfo, axisInfo); // If no inputAxesInfo, no axis is restricted.

      if (!shouldHide && coordSysContainsPoint && (!inputAxesInfo || inputAxisInfo)) {
        var val = inputAxisInfo && inputAxisInfo.value;

        if (val == null && !isIllegalPoint) {
          val = axis.pointToData(point);
        }

        val != null && processOnAxis(axisInfo, val, updaters, false, outputPayload);
      }
    });
  }); // Process for linked axes.

  var linkTriggers = {};
  each$4(axesInfo, function (tarAxisInfo, tarKey) {
    var linkGroup = tarAxisInfo.linkGroup; // If axis has been triggered in the previous stage, it should not be triggered by link.

    if (linkGroup && !showValueMap[tarKey]) {
      each$4(linkGroup.axesInfo, function (srcAxisInfo, srcKey) {
        var srcValItem = showValueMap[srcKey]; // If srcValItem exist, source axis is triggered, so link to target axis.

        if (srcAxisInfo !== tarAxisInfo && srcValItem) {
          var val = srcValItem.value;
          linkGroup.mapper && (val = tarAxisInfo.axis.scale.parse(linkGroup.mapper(val, makeMapperParam(srcAxisInfo), makeMapperParam(tarAxisInfo))));
          linkTriggers[tarAxisInfo.key] = val;
        }
      });
    }
  });
  each$4(linkTriggers, function (val, tarKey) {
    processOnAxis(axesInfo[tarKey], val, updaters, true, outputPayload);
  });
  updateModelActually(showValueMap, axesInfo, outputPayload);
  dispatchTooltipActually(dataByCoordSys, point, payload, dispatchAction);
  dispatchHighDownActually(axesInfo, dispatchAction, api);
  return outputPayload;
}

function processOnAxis(axisInfo, newValue, updaters, noSnap, outputFinder) {
  var axis = axisInfo.axis;

  if (axis.scale.isBlank() || !axis.containData(newValue)) {
    return;
  }

  if (!axisInfo.involveSeries) {
    updaters.showPointer(axisInfo, newValue);
    return;
  } // Heavy calculation. So put it after axis.containData checking.


  var payloadInfo = buildPayloadsBySeries(newValue, axisInfo);
  var payloadBatch = payloadInfo.payloadBatch;
  var snapToValue = payloadInfo.snapToValue; // Fill content of event obj for echarts.connect.
  // By default use the first involved series data as a sample to connect.

  if (payloadBatch[0] && outputFinder.seriesIndex == null) {
    extend(outputFinder, payloadBatch[0]);
  } // If no linkSource input, this process is for collecting link
  // target, where snap should not be accepted.


  if (!noSnap && axisInfo.snap) {
    if (axis.containData(snapToValue) && snapToValue != null) {
      newValue = snapToValue;
    }
  }

  updaters.showPointer(axisInfo, newValue, payloadBatch); // Tooltip should always be snapToValue, otherwise there will be
  // incorrect "axis value ~ series value" mapping displayed in tooltip.

  updaters.showTooltip(axisInfo, payloadInfo, snapToValue);
}

function buildPayloadsBySeries(value, axisInfo) {
  var axis = axisInfo.axis;
  var dim = axis.dim;
  var snapToValue = value;
  var payloadBatch = [];
  var minDist = Number.MAX_VALUE;
  var minDiff = -1;
  each$4(axisInfo.seriesModels, function (series, idx) {
    var dataDim = series.getData().mapDimensionsAll(dim);
    var seriesNestestValue;
    var dataIndices;

    if (series.getAxisTooltipData) {
      var result = series.getAxisTooltipData(dataDim, value, axis);
      dataIndices = result.dataIndices;
      seriesNestestValue = result.nestestValue;
    } else {
      dataIndices = series.getData().indicesOfNearest(dataDim[0], value, // Add a threshold to avoid find the wrong dataIndex
      // when data length is not same.
      // false,
      axis.type === 'category' ? 0.5 : null);

      if (!dataIndices.length) {
        return;
      }

      seriesNestestValue = series.getData().get(dataDim[0], dataIndices[0]);
    }

    if (seriesNestestValue == null || !isFinite(seriesNestestValue)) {
      return;
    }

    var diff = value - seriesNestestValue;
    var dist = Math.abs(diff); // Consider category case

    if (dist <= minDist) {
      if (dist < minDist || diff >= 0 && minDiff < 0) {
        minDist = dist;
        minDiff = diff;
        snapToValue = seriesNestestValue;
        payloadBatch.length = 0;
      }

      each$4(dataIndices, function (dataIndex) {
        payloadBatch.push({
          seriesIndex: series.seriesIndex,
          dataIndexInside: dataIndex,
          dataIndex: series.getData().getRawIndex(dataIndex)
        });
      });
    }
  });
  return {
    payloadBatch: payloadBatch,
    snapToValue: snapToValue
  };
}

function showPointer(showValueMap, axisInfo, value, payloadBatch) {
  showValueMap[axisInfo.key] = {
    value: value,
    payloadBatch: payloadBatch
  };
}

function showTooltip(dataByCoordSys, axisInfo, payloadInfo, value) {
  var payloadBatch = payloadInfo.payloadBatch;
  var axis = axisInfo.axis;
  var axisModel = axis.model;
  var axisPointerModel = axisInfo.axisPointerModel; // If no data, do not create anything in dataByCoordSys,
  // whose length will be used to judge whether dispatch action.

  if (!axisInfo.triggerTooltip || !payloadBatch.length) {
    return;
  }

  var coordSysModel = axisInfo.coordSys.model;
  var coordSysKey = makeKey(coordSysModel);
  var coordSysItem = dataByCoordSys.map[coordSysKey];

  if (!coordSysItem) {
    coordSysItem = dataByCoordSys.map[coordSysKey] = {
      coordSysId: coordSysModel.id,
      coordSysIndex: coordSysModel.componentIndex,
      coordSysType: coordSysModel.type,
      coordSysMainType: coordSysModel.mainType,
      dataByAxis: []
    };
    dataByCoordSys.list.push(coordSysItem);
  }

  coordSysItem.dataByAxis.push({
    axisDim: axis.dim,
    axisIndex: axisModel.componentIndex,
    axisType: axisModel.type,
    axisId: axisModel.id,
    value: value,
    // Caustion: viewHelper.getValueLabel is actually on "view stage", which
    // depends that all models have been updated. So it should not be performed
    // here. Considering axisPointerModel used here is volatile, which is hard
    // to be retrieve in TooltipView, we prepare parameters here.
    valueLabelOpt: {
      precision: axisPointerModel.get(['label', 'precision']),
      formatter: axisPointerModel.get(['label', 'formatter'])
    },
    seriesDataIndices: payloadBatch.slice()
  });
}

function updateModelActually(showValueMap, axesInfo, outputPayload) {
  var outputAxesInfo = outputPayload.axesInfo = []; // Basic logic: If no 'show' required, 'hide' this axisPointer.

  each$4(axesInfo, function (axisInfo, key) {
    var option = axisInfo.axisPointerModel.option;
    var valItem = showValueMap[key];

    if (valItem) {
      !axisInfo.useHandle && (option.status = 'show');
      option.value = valItem.value; // For label formatter param and highlight.

      option.seriesDataIndices = (valItem.payloadBatch || []).slice();
    } // When always show (e.g., handle used), remain
    // original value and status.
    else {
        // If hide, value still need to be set, consider
        // click legend to toggle axis blank.
        !axisInfo.useHandle && (option.status = 'hide');
      } // If status is 'hide', should be no info in payload.


    option.status === 'show' && outputAxesInfo.push({
      axisDim: axisInfo.axis.dim,
      axisIndex: axisInfo.axis.model.componentIndex,
      value: option.value
    });
  });
}

function dispatchTooltipActually(dataByCoordSys, point, payload, dispatchAction) {
  // Basic logic: If no showTip required, hideTip will be dispatched.
  if (illegalPoint(point) || !dataByCoordSys.list.length) {
    dispatchAction({
      type: 'hideTip'
    });
    return;
  } // In most case only one axis (or event one series is used). It is
  // convinient to fetch payload.seriesIndex and payload.dataIndex
  // dirtectly. So put the first seriesIndex and dataIndex of the first
  // axis on the payload.


  var sampleItem = ((dataByCoordSys.list[0].dataByAxis[0] || {}).seriesDataIndices || [])[0] || {};
  dispatchAction({
    type: 'showTip',
    escapeConnect: true,
    x: point[0],
    y: point[1],
    tooltipOption: payload.tooltipOption,
    position: payload.position,
    dataIndexInside: sampleItem.dataIndexInside,
    dataIndex: sampleItem.dataIndex,
    seriesIndex: sampleItem.seriesIndex,
    dataByCoordSys: dataByCoordSys.list
  });
}

function dispatchHighDownActually(axesInfo, dispatchAction, api) {
  // FIXME
  // highlight status modification shoule be a stage of main process?
  // (Consider confilct (e.g., legend and axisPointer) and setOption)
  var zr = api.getZr();
  var highDownKey = 'axisPointerLastHighlights';
  var lastHighlights = inner$1(zr)[highDownKey] || {};
  var newHighlights = inner$1(zr)[highDownKey] = {}; // Update highlight/downplay status according to axisPointer model.
  // Build hash map and remove duplicate incidentally.

  each$4(axesInfo, function (axisInfo, key) {
    var option = axisInfo.axisPointerModel.option;
    option.status === 'show' && each$4(option.seriesDataIndices, function (batchItem) {
      var key = batchItem.seriesIndex + ' | ' + batchItem.dataIndex;
      newHighlights[key] = batchItem;
    });
  }); // Diff.

  var toHighlight = [];
  var toDownplay = [];
  each$4(lastHighlights, function (batchItem, key) {
    !newHighlights[key] && toDownplay.push(batchItem);
  });
  each$4(newHighlights, function (batchItem, key) {
    !lastHighlights[key] && toHighlight.push(batchItem);
  });
  toDownplay.length && api.dispatchAction({
    type: 'downplay',
    escapeConnect: true,
    // Not blur others when highlight in axisPointer.
    notBlur: true,
    batch: toDownplay
  });
  toHighlight.length && api.dispatchAction({
    type: 'highlight',
    escapeConnect: true,
    // Not blur others when highlight in axisPointer.
    notBlur: true,
    batch: toHighlight
  });
}

function findInputAxisInfo(inputAxesInfo, axisInfo) {
  for (var i = 0; i < (inputAxesInfo || []).length; i++) {
    var inputAxisInfo = inputAxesInfo[i];

    if (axisInfo.axis.dim === inputAxisInfo.axisDim && axisInfo.axis.model.componentIndex === inputAxisInfo.axisIndex) {
      return inputAxisInfo;
    }
  }
}

function makeMapperParam(axisInfo) {
  var axisModel = axisInfo.axis.model;
  var item = {};
  var dim = item.axisDim = axisInfo.axis.dim;
  item.axisIndex = item[dim + 'AxisIndex'] = axisModel.componentIndex;
  item.axisName = item[dim + 'AxisName'] = axisModel.name;
  item.axisId = item[dim + 'AxisId'] = axisModel.id;
  return item;
}

function illegalPoint(point) {
  return !point || point[0] == null || isNaN(point[0]) || point[1] == null || isNaN(point[1]);
}

function install$9(registers) {
  // CartesianAxisPointer is not supposed to be required here. But consider
  // echarts.simple.js and online build tooltip, which only require gridSimple,
  // CartesianAxisPointer should be able to required somewhere.
  AxisView.registerAxisPointerClass('CartesianAxisPointer', CartesianAxisPointer);
  registers.registerComponentModel(AxisPointerModel);
  registers.registerComponentView(AxisPointerView);
  registers.registerPreprocessor(function (option) {
    // Always has a global axisPointerModel for default setting.
    if (option) {
      (!option.axisPointer || option.axisPointer.length === 0) && (option.axisPointer = {});
      var link = option.axisPointer.link; // Normalize to array to avoid object mergin. But if link
      // is not set, remain null/undefined, otherwise it will
      // override existent link setting.

      if (link && !isArray(link)) {
        option.axisPointer.link = [link];
      }
    }
  }); // This process should proformed after coordinate systems created
  // and series data processed. So put it on statistic processing stage.

  registers.registerProcessor(registers.PRIORITY.PROCESSOR.STATISTIC, function (ecModel, api) {
    // Build axisPointerModel, mergin tooltip.axisPointer model for each axis.
    // allAxesInfo should be updated when setOption performed.
    ecModel.getComponent('axisPointer').coordSysAxesInfo = collect(ecModel, api);
  }); // Broadcast to all views.

  registers.registerAction({
    type: 'updateAxisPointer',
    event: 'updateAxisPointer',
    update: ':updateAxisPointer'
  }, axisTrigger);
}

function install$8(registers) {
  use(install$a);
  use(install$9);
}

var DATA_ZOOM_AXIS_DIMENSIONS = ['x', 'y', 'radius', 'angle', 'single']; // Supported coords.
// FIXME: polar has been broken (but rarely used).

var SERIES_COORDS = ['cartesian2d', 'polar', 'singleAxis'];
function isCoordSupported(seriesModel) {
  var coordType = seriesModel.get('coordinateSystem');
  return indexOf(SERIES_COORDS, coordType) >= 0;
}
function getAxisMainType(axisDim) {

  return axisDim + 'Axis';
}
/**
 * If two dataZoomModels has the same axis controlled, we say that they are 'linked'.
 * This function finds all linked dataZoomModels start from the given payload.
 */

function findEffectedDataZooms(ecModel, payload) {
  // Key: `DataZoomAxisDimension`
  var axisRecords = createHashMap();
  var effectedModels = []; // Key: uid of dataZoomModel

  var effectedModelMap = createHashMap(); // Find the dataZooms specified by payload.

  ecModel.eachComponent({
    mainType: 'dataZoom',
    query: payload
  }, function (dataZoomModel) {
    if (!effectedModelMap.get(dataZoomModel.uid)) {
      addToEffected(dataZoomModel);
    }
  }); // Start from the given dataZoomModels, travel the graph to find
  // all of the linked dataZoom models.

  var foundNewLink;

  do {
    foundNewLink = false;
    ecModel.eachComponent('dataZoom', processSingle);
  } while (foundNewLink);

  function processSingle(dataZoomModel) {
    if (!effectedModelMap.get(dataZoomModel.uid) && isLinked(dataZoomModel)) {
      addToEffected(dataZoomModel);
      foundNewLink = true;
    }
  }

  function addToEffected(dataZoom) {
    effectedModelMap.set(dataZoom.uid, true);
    effectedModels.push(dataZoom);
    markAxisControlled(dataZoom);
  }

  function isLinked(dataZoomModel) {
    var isLink = false;
    dataZoomModel.eachTargetAxis(function (axisDim, axisIndex) {
      var axisIdxArr = axisRecords.get(axisDim);

      if (axisIdxArr && axisIdxArr[axisIndex]) {
        isLink = true;
      }
    });
    return isLink;
  }

  function markAxisControlled(dataZoomModel) {
    dataZoomModel.eachTargetAxis(function (axisDim, axisIndex) {
      (axisRecords.get(axisDim) || axisRecords.set(axisDim, []))[axisIndex] = true;
    });
  }

  return effectedModels;
}
/**
 * Find the first target coordinate system.
 * Available after model built.
 *
 * @return Like {
 *                  grid: [
 *                      {model: coord0, axisModels: [axis1, axis3], coordIndex: 1},
 *                      {model: coord1, axisModels: [axis0, axis2], coordIndex: 0},
 *                      ...
 *                  ],  // cartesians must not be null/undefined.
 *                  polar: [
 *                      {model: coord0, axisModels: [axis4], coordIndex: 0},
 *                      ...
 *                  ],  // polars must not be null/undefined.
 *                  singleAxis: [
 *                      {model: coord0, axisModels: [], coordIndex: 0}
 *                  ]
 *              }
 */

function collectReferCoordSysModelInfo(dataZoomModel) {
  var ecModel = dataZoomModel.ecModel;
  var coordSysInfoWrap = {
    infoList: [],
    infoMap: createHashMap()
  };
  dataZoomModel.eachTargetAxis(function (axisDim, axisIndex) {
    var axisModel = ecModel.getComponent(getAxisMainType(axisDim), axisIndex);

    if (!axisModel) {
      return;
    }

    var coordSysModel = axisModel.getCoordSysModel();

    if (!coordSysModel) {
      return;
    }

    var coordSysUid = coordSysModel.uid;
    var coordSysInfo = coordSysInfoWrap.infoMap.get(coordSysUid);

    if (!coordSysInfo) {
      coordSysInfo = {
        model: coordSysModel,
        axisModels: []
      };
      coordSysInfoWrap.infoList.push(coordSysInfo);
      coordSysInfoWrap.infoMap.set(coordSysUid, coordSysInfo);
    }

    coordSysInfo.axisModels.push(axisModel);
  });
  return coordSysInfoWrap;
}

var DataZoomAxisInfo =
/** @class */
function () {
  function DataZoomAxisInfo() {
    this.indexList = [];
    this.indexMap = [];
  }

  DataZoomAxisInfo.prototype.add = function (axisCmptIdx) {
    // Remove duplication.
    if (!this.indexMap[axisCmptIdx]) {
      this.indexList.push(axisCmptIdx);
      this.indexMap[axisCmptIdx] = true;
    }
  };

  return DataZoomAxisInfo;
}();

var DataZoomModel =
/** @class */
function (_super) {
  __extends(DataZoomModel, _super);

  function DataZoomModel() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = DataZoomModel.type;
    _this._autoThrottle = true;
    _this._noTarget = true;
    /**
     * It is `[rangeModeForMin, rangeModeForMax]`.
     * The optional values for `rangeMode`:
     * + `'value'` mode: the axis extent will always be determined by
     *     `dataZoom.startValue` and `dataZoom.endValue`, despite
     *     how data like and how `axis.min` and `axis.max` are.
     * + `'percent'` mode: `100` represents 100% of the `[dMin, dMax]`,
     *     where `dMin` is `axis.min` if `axis.min` specified, otherwise `data.extent[0]`,
     *     and `dMax` is `axis.max` if `axis.max` specified, otherwise `data.extent[1]`.
     *     Axis extent will be determined by the result of the percent of `[dMin, dMax]`.
     *
     * For example, when users are using dynamic data (update data periodically via `setOption`),
     * if in `'value`' mode, the window will be kept in a fixed value range despite how
     * data are appended, while if in `'percent'` mode, whe window range will be changed alone with
     * the appended data (suppose `axis.min` and `axis.max` are not specified).
     */

    _this._rangePropMode = ['percent', 'percent'];
    return _this;
  }

  DataZoomModel.prototype.init = function (option, parentModel, ecModel) {
    var inputRawOption = retrieveRawOption(option);
    /**
     * Suppose a "main process" start at the point that model prepared (that is,
     * model initialized or merged or method called in `action`).
     * We should keep the `main process` idempotent, that is, given a set of values
     * on `option`, we get the same result.
     *
     * But sometimes, values on `option` will be updated for providing users
     * a "final calculated value" (`dataZoomProcessor` will do that). Those value
     * should not be the base/input of the `main process`.
     *
     * So in that case we should save and keep the input of the `main process`
     * separately, called `settledOption`.
     *
     * For example, consider the case:
     * (Step_1) brush zoom the grid by `toolbox.dataZoom`,
     *     where the original input `option.startValue`, `option.endValue` are earsed by
     *     calculated value.
     * (Step)2) click the legend to hide and show a series,
     *     where the new range is calculated by the earsed `startValue` and `endValue`,
     *     which brings incorrect result.
     */

    this.settledOption = inputRawOption;
    this.mergeDefaultAndTheme(option, ecModel);

    this._doInit(inputRawOption);
  };

  DataZoomModel.prototype.mergeOption = function (newOption) {
    var inputRawOption = retrieveRawOption(newOption); //FIX #2591

    merge(this.option, newOption, true);
    merge(this.settledOption, inputRawOption, true);

    this._doInit(inputRawOption);
  };

  DataZoomModel.prototype._doInit = function (inputRawOption) {
    var thisOption = this.option; // if (!env.canvasSupported) {
    //     thisOption.realtime = false;
    // }

    this._setDefaultThrottle(inputRawOption);

    this._updateRangeUse(inputRawOption);

    var settledOption = this.settledOption;
    each$4([['start', 'startValue'], ['end', 'endValue']], function (names, index) {
      // start/end has higher priority over startValue/endValue if they
      // both set, but we should make chart.setOption({endValue: 1000})
      // effective, rather than chart.setOption({endValue: 1000, end: null}).
      if (this._rangePropMode[index] === 'value') {
        thisOption[names[0]] = settledOption[names[0]] = null;
      } // Otherwise do nothing and use the merge result.

    }, this);

    this._resetTarget();
  };

  DataZoomModel.prototype._resetTarget = function () {
    var optionOrient = this.get('orient', true);
    var targetAxisIndexMap = this._targetAxisInfoMap = createHashMap();

    var hasAxisSpecified = this._fillSpecifiedTargetAxis(targetAxisIndexMap);

    if (hasAxisSpecified) {
      this._orient = optionOrient || this._makeAutoOrientByTargetAxis();
    } else {
      this._orient = optionOrient || 'horizontal';

      this._fillAutoTargetAxisByOrient(targetAxisIndexMap, this._orient);
    }

    this._noTarget = true;
    targetAxisIndexMap.each(function (axisInfo) {
      if (axisInfo.indexList.length) {
        this._noTarget = false;
      }
    }, this);
  };

  DataZoomModel.prototype._fillSpecifiedTargetAxis = function (targetAxisIndexMap) {
    var hasAxisSpecified = false;
    each$4(DATA_ZOOM_AXIS_DIMENSIONS, function (axisDim) {
      var refering = this.getReferringComponents(getAxisMainType(axisDim), MULTIPLE_REFERRING); // When user set axisIndex as a empty array, we think that user specify axisIndex
      // but do not want use auto mode. Because empty array may be encountered when
      // some error occured.

      if (!refering.specified) {
        return;
      }

      hasAxisSpecified = true;
      var axisInfo = new DataZoomAxisInfo();
      each$4(refering.models, function (axisModel) {
        axisInfo.add(axisModel.componentIndex);
      });
      targetAxisIndexMap.set(axisDim, axisInfo);
    }, this);
    return hasAxisSpecified;
  };

  DataZoomModel.prototype._fillAutoTargetAxisByOrient = function (targetAxisIndexMap, orient) {
    var ecModel = this.ecModel;
    var needAuto = true; // Find axis that parallel to dataZoom as default.

    if (needAuto) {
      var axisDim = orient === 'vertical' ? 'y' : 'x';
      var axisModels = ecModel.findComponents({
        mainType: axisDim + 'Axis'
      });
      setParallelAxis(axisModels, axisDim);
    } // Find axis that parallel to dataZoom as default.


    if (needAuto) {
      var axisModels = ecModel.findComponents({
        mainType: 'singleAxis',
        filter: function (axisModel) {
          return axisModel.get('orient', true) === orient;
        }
      });
      setParallelAxis(axisModels, 'single');
    }

    function setParallelAxis(axisModels, axisDim) {
      // At least use the first parallel axis as the target axis.
      var axisModel = axisModels[0];

      if (!axisModel) {
        return;
      }

      var axisInfo = new DataZoomAxisInfo();
      axisInfo.add(axisModel.componentIndex);
      targetAxisIndexMap.set(axisDim, axisInfo);
      needAuto = false; // Find parallel axes in the same grid.

      if (axisDim === 'x' || axisDim === 'y') {
        var gridModel_1 = axisModel.getReferringComponents('grid', SINGLE_REFERRING).models[0];
        gridModel_1 && each$4(axisModels, function (axModel) {
          if (axisModel.componentIndex !== axModel.componentIndex && gridModel_1 === axModel.getReferringComponents('grid', SINGLE_REFERRING).models[0]) {
            axisInfo.add(axModel.componentIndex);
          }
        });
      }
    }

    if (needAuto) {
      // If no parallel axis, find the first category axis as default. (Also consider polar).
      each$4(DATA_ZOOM_AXIS_DIMENSIONS, function (axisDim) {
        if (!needAuto) {
          return;
        }

        var axisModels = ecModel.findComponents({
          mainType: getAxisMainType(axisDim),
          filter: function (axisModel) {
            return axisModel.get('type', true) === 'category';
          }
        });

        if (axisModels[0]) {
          var axisInfo = new DataZoomAxisInfo();
          axisInfo.add(axisModels[0].componentIndex);
          targetAxisIndexMap.set(axisDim, axisInfo);
          needAuto = false;
        }
      }, this);
    }
  };

  DataZoomModel.prototype._makeAutoOrientByTargetAxis = function () {
    var dim; // Find the first axis

    this.eachTargetAxis(function (axisDim) {
      !dim && (dim = axisDim);
    }, this);
    return dim === 'y' ? 'vertical' : 'horizontal';
  };

  DataZoomModel.prototype._setDefaultThrottle = function (inputRawOption) {
    // When first time user set throttle, auto throttle ends.
    if (inputRawOption.hasOwnProperty('throttle')) {
      this._autoThrottle = false;
    }

    if (this._autoThrottle) {
      var globalOption = this.ecModel.option;
      this.option.throttle = globalOption.animation && globalOption.animationDurationUpdate > 0 ? 100 : 20;
    }
  };

  DataZoomModel.prototype._updateRangeUse = function (inputRawOption) {
    var rangePropMode = this._rangePropMode;
    var rangeModeInOption = this.get('rangeMode');
    each$4([['start', 'startValue'], ['end', 'endValue']], function (names, index) {
      var percentSpecified = inputRawOption[names[0]] != null;
      var valueSpecified = inputRawOption[names[1]] != null;

      if (percentSpecified && !valueSpecified) {
        rangePropMode[index] = 'percent';
      } else if (!percentSpecified && valueSpecified) {
        rangePropMode[index] = 'value';
      } else if (rangeModeInOption) {
        rangePropMode[index] = rangeModeInOption[index];
      } else if (percentSpecified) {
        // percentSpecified && valueSpecified
        rangePropMode[index] = 'percent';
      } // else remain its original setting.

    });
  };

  DataZoomModel.prototype.noTarget = function () {
    return this._noTarget;
  };

  DataZoomModel.prototype.getFirstTargetAxisModel = function () {
    var firstAxisModel;
    this.eachTargetAxis(function (axisDim, axisIndex) {
      if (firstAxisModel == null) {
        firstAxisModel = this.ecModel.getComponent(getAxisMainType(axisDim), axisIndex);
      }
    }, this);
    return firstAxisModel;
  };
  /**
   * @param {Function} callback param: axisModel, dimNames, axisIndex, dataZoomModel, ecModel
   */


  DataZoomModel.prototype.eachTargetAxis = function (callback, context) {
    this._targetAxisInfoMap.each(function (axisInfo, axisDim) {
      each$4(axisInfo.indexList, function (axisIndex) {
        callback.call(context, axisDim, axisIndex);
      });
    });
  };
  /**
   * @return If not found, return null/undefined.
   */


  DataZoomModel.prototype.getAxisProxy = function (axisDim, axisIndex) {
    var axisModel = this.getAxisModel(axisDim, axisIndex);

    if (axisModel) {
      return axisModel.__dzAxisProxy;
    }
  };
  /**
   * @return If not found, return null/undefined.
   */


  DataZoomModel.prototype.getAxisModel = function (axisDim, axisIndex) {

    var axisInfo = this._targetAxisInfoMap.get(axisDim);

    if (axisInfo && axisInfo.indexMap[axisIndex]) {
      return this.ecModel.getComponent(getAxisMainType(axisDim), axisIndex);
    }
  };
  /**
   * If not specified, set to undefined.
   */


  DataZoomModel.prototype.setRawRange = function (opt) {
    var thisOption = this.option;
    var settledOption = this.settledOption;
    each$4([['start', 'startValue'], ['end', 'endValue']], function (names) {
      // Consider the pair <start, startValue>:
      // If one has value and the other one is `null/undefined`, we both set them
      // to `settledOption`. This strategy enables the feature to clear the original
      // value in `settledOption` to `null/undefined`.
      // But if both of them are `null/undefined`, we do not set them to `settledOption`
      // and keep `settledOption` with the original value. This strategy enables users to
      // only set <end or endValue> but not set <start or startValue> when calling
      // `dispatchAction`.
      // The pair <end, endValue> is treated in the same way.
      if (opt[names[0]] != null || opt[names[1]] != null) {
        thisOption[names[0]] = settledOption[names[0]] = opt[names[0]];
        thisOption[names[1]] = settledOption[names[1]] = opt[names[1]];
      }
    }, this);

    this._updateRangeUse(opt);
  };

  DataZoomModel.prototype.setCalculatedRange = function (opt) {
    var option = this.option;
    each$4(['start', 'startValue', 'end', 'endValue'], function (name) {
      option[name] = opt[name];
    });
  };

  DataZoomModel.prototype.getPercentRange = function () {
    var axisProxy = this.findRepresentativeAxisProxy();

    if (axisProxy) {
      return axisProxy.getDataPercentWindow();
    }
  };
  /**
   * For example, chart.getModel().getComponent('dataZoom').getValueRange('y', 0);
   *
   * @return [startValue, endValue] value can only be '-' or finite number.
   */


  DataZoomModel.prototype.getValueRange = function (axisDim, axisIndex) {
    if (axisDim == null && axisIndex == null) {
      var axisProxy = this.findRepresentativeAxisProxy();

      if (axisProxy) {
        return axisProxy.getDataValueWindow();
      }
    } else {
      return this.getAxisProxy(axisDim, axisIndex).getDataValueWindow();
    }
  };
  /**
   * @param axisModel If axisModel given, find axisProxy
   *      corresponding to the axisModel
   */


  DataZoomModel.prototype.findRepresentativeAxisProxy = function (axisModel) {
    if (axisModel) {
      return axisModel.__dzAxisProxy;
    } // Find the first hosted axisProxy


    var firstProxy;

    var axisDimList = this._targetAxisInfoMap.keys();

    for (var i = 0; i < axisDimList.length; i++) {
      var axisDim = axisDimList[i];

      var axisInfo = this._targetAxisInfoMap.get(axisDim);

      for (var j = 0; j < axisInfo.indexList.length; j++) {
        var proxy = this.getAxisProxy(axisDim, axisInfo.indexList[j]);

        if (proxy.hostedBy(this)) {
          return proxy;
        }

        if (!firstProxy) {
          firstProxy = proxy;
        }
      }
    } // If no hosted proxy found, still need to return a proxy.
    // This case always happens in toolbox dataZoom, where axes are all hosted by
    // other dataZooms.


    return firstProxy;
  };

  DataZoomModel.prototype.getRangePropMode = function () {
    return this._rangePropMode.slice();
  };

  DataZoomModel.prototype.getOrient = function () {

    return this._orient;
  };

  DataZoomModel.type = 'dataZoom';
  DataZoomModel.dependencies = ['xAxis', 'yAxis', 'radiusAxis', 'angleAxis', 'singleAxis', 'series', 'toolbox'];
  DataZoomModel.defaultOption = {
    zlevel: 0,
    z: 4,
    filterMode: 'filter',
    start: 0,
    end: 100
  };
  return DataZoomModel;
}(ComponentModel);
/**
 * Retrieve the those raw params from option, which will be cached separately.
 * becasue they will be overwritten by normalized/calculated values in the main
 * process.
 */


function retrieveRawOption(option) {
  var ret = {};
  each$4(['start', 'end', 'startValue', 'endValue', 'throttle'], function (name) {
    option.hasOwnProperty(name) && (ret[name] = option[name]);
  });
  return ret;
}

var DataZoomView =
/** @class */
function (_super) {
  __extends(DataZoomView, _super);

  function DataZoomView() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = DataZoomView.type;
    return _this;
  }

  DataZoomView.prototype.render = function (dataZoomModel, ecModel, api, payload) {
    this.dataZoomModel = dataZoomModel;
    this.ecModel = ecModel;
    this.api = api;
  };

  DataZoomView.type = 'dataZoom';
  return DataZoomView;
}(ComponentView);

var each$2 = each$4;
var asc = asc$1;
/**
 * Operate single axis.
 * One axis can only operated by one axis operator.
 * Different dataZoomModels may be defined to operate the same axis.
 * (i.e. 'inside' data zoom and 'slider' data zoom components)
 * So dataZoomModels share one axisProxy in that case.
 */

var AxisProxy =
/** @class */
function () {
  function AxisProxy(dimName, axisIndex, dataZoomModel, ecModel) {
    this._dimName = dimName;
    this._axisIndex = axisIndex;
    this.ecModel = ecModel;
    this._dataZoomModel = dataZoomModel; // /**
    //  * @readOnly
    //  * @private
    //  */
    // this.hasSeriesStacked;
  }
  /**
   * Whether the axisProxy is hosted by dataZoomModel.
   */


  AxisProxy.prototype.hostedBy = function (dataZoomModel) {
    return this._dataZoomModel === dataZoomModel;
  };
  /**
   * @return Value can only be NaN or finite value.
   */


  AxisProxy.prototype.getDataValueWindow = function () {
    return this._valueWindow.slice();
  };
  /**
   * @return {Array.<number>}
   */


  AxisProxy.prototype.getDataPercentWindow = function () {
    return this._percentWindow.slice();
  };

  AxisProxy.prototype.getTargetSeriesModels = function () {
    var seriesModels = [];
    this.ecModel.eachSeries(function (seriesModel) {
      if (isCoordSupported(seriesModel)) {
        var axisMainType = getAxisMainType(this._dimName);
        var axisModel = seriesModel.getReferringComponents(axisMainType, SINGLE_REFERRING).models[0];

        if (axisModel && this._axisIndex === axisModel.componentIndex) {
          seriesModels.push(seriesModel);
        }
      }
    }, this);
    return seriesModels;
  };

  AxisProxy.prototype.getAxisModel = function () {
    return this.ecModel.getComponent(this._dimName + 'Axis', this._axisIndex);
  };

  AxisProxy.prototype.getMinMaxSpan = function () {
    return clone$1(this._minMaxSpan);
  };
  /**
   * Only calculate by given range and this._dataExtent, do not change anything.
   */


  AxisProxy.prototype.calculateDataWindow = function (opt) {
    var dataExtent = this._dataExtent;
    var axisModel = this.getAxisModel();
    var scale = axisModel.axis.scale;

    var rangePropMode = this._dataZoomModel.getRangePropMode();

    var percentExtent = [0, 100];
    var percentWindow = [];
    var valueWindow = [];
    var hasPropModeValue;
    each$2(['start', 'end'], function (prop, idx) {
      var boundPercent = opt[prop];
      var boundValue = opt[prop + 'Value']; // Notice: dataZoom is based either on `percentProp` ('start', 'end') or
      // on `valueProp` ('startValue', 'endValue'). (They are based on the data extent
      // but not min/max of axis, which will be calculated by data window then).
      // The former one is suitable for cases that a dataZoom component controls multiple
      // axes with different unit or extent, and the latter one is suitable for accurate
      // zoom by pixel (e.g., in dataZoomSelect).
      // we use `getRangePropMode()` to mark which prop is used. `rangePropMode` is updated
      // only when setOption or dispatchAction, otherwise it remains its original value.
      // (Why not only record `percentProp` and always map to `valueProp`? Because
      // the map `valueProp` -> `percentProp` -> `valueProp` probably not the original
      // `valueProp`. consider two axes constrolled by one dataZoom. They have different
      // data extent. All of values that are overflow the `dataExtent` will be calculated
      // to percent '100%').

      if (rangePropMode[idx] === 'percent') {
        boundPercent == null && (boundPercent = percentExtent[idx]); // Use scale.parse to math round for category or time axis.

        boundValue = scale.parse(linearMap(boundPercent, percentExtent, dataExtent));
      } else {
        hasPropModeValue = true;
        boundValue = boundValue == null ? dataExtent[idx] : scale.parse(boundValue); // Calculating `percent` from `value` may be not accurate, because
        // This calculation can not be inversed, because all of values that
        // are overflow the `dataExtent` will be calculated to percent '100%'

        boundPercent = linearMap(boundValue, dataExtent, percentExtent);
      } // valueWindow[idx] = round(boundValue);
      // percentWindow[idx] = round(boundPercent);


      valueWindow[idx] = boundValue;
      percentWindow[idx] = boundPercent;
    });
    asc(valueWindow);
    asc(percentWindow); // The windows from user calling of `dispatchAction` might be out of the extent,
    // or do not obey the `min/maxSpan`, `min/maxValueSpan`. But we dont restrict window
    // by `zoomLock` here, because we see `zoomLock` just as a interaction constraint,
    // where API is able to initialize/modify the window size even though `zoomLock`
    // specified.

    var spans = this._minMaxSpan;
    hasPropModeValue ? restrictSet(valueWindow, percentWindow, dataExtent, percentExtent, false) : restrictSet(percentWindow, valueWindow, percentExtent, dataExtent, true);

    function restrictSet(fromWindow, toWindow, fromExtent, toExtent, toValue) {
      var suffix = toValue ? 'Span' : 'ValueSpan';
      sliderMove(0, fromWindow, fromExtent, 'all', spans['min' + suffix], spans['max' + suffix]);

      for (var i = 0; i < 2; i++) {
        toWindow[i] = linearMap(fromWindow[i], fromExtent, toExtent, true);
        toValue && (toWindow[i] = scale.parse(toWindow[i]));
      }
    }

    return {
      valueWindow: valueWindow,
      percentWindow: percentWindow
    };
  };
  /**
   * Notice: reset should not be called before series.restoreData() called,
   * so it is recommanded to be called in "process stage" but not "model init
   * stage".
   */


  AxisProxy.prototype.reset = function (dataZoomModel) {
    if (dataZoomModel !== this._dataZoomModel) {
      return;
    }

    var targetSeries = this.getTargetSeriesModels(); // Culculate data window and data extent, and record them.

    this._dataExtent = calculateDataExtent(this, this._dimName, targetSeries); // this.hasSeriesStacked = false;
    // each(targetSeries, function (series) {
    // let data = series.getData();
    // let dataDim = data.mapDimension(this._dimName);
    // let stackedDimension = data.getCalculationInfo('stackedDimension');
    // if (stackedDimension && stackedDimension === dataDim) {
    // this.hasSeriesStacked = true;
    // }
    // }, this);
    // `calculateDataWindow` uses min/maxSpan.

    this._updateMinMaxSpan();

    var dataWindow = this.calculateDataWindow(dataZoomModel.settledOption);
    this._valueWindow = dataWindow.valueWindow;
    this._percentWindow = dataWindow.percentWindow; // Update axis setting then.

    this._setAxisModel();
  };

  AxisProxy.prototype.filterData = function (dataZoomModel, api) {
    if (dataZoomModel !== this._dataZoomModel) {
      return;
    }

    var axisDim = this._dimName;
    var seriesModels = this.getTargetSeriesModels();
    var filterMode = dataZoomModel.get('filterMode');
    var valueWindow = this._valueWindow;

    if (filterMode === 'none') {
      return;
    } // FIXME
    // Toolbox may has dataZoom injected. And if there are stacked bar chart
    // with NaN data, NaN will be filtered and stack will be wrong.
    // So we need to force the mode to be set empty.
    // In fect, it is not a big deal that do not support filterMode-'filter'
    // when using toolbox#dataZoom, utill tooltip#dataZoom support "single axis
    // selection" some day, which might need "adapt to data extent on the
    // otherAxis", which is disabled by filterMode-'empty'.
    // But currently, stack has been fixed to based on value but not index,
    // so this is not an issue any more.
    // let otherAxisModel = this.getOtherAxisModel();
    // if (dataZoomModel.get('$fromToolbox')
    //     && otherAxisModel
    //     && otherAxisModel.hasSeriesStacked
    // ) {
    //     filterMode = 'empty';
    // }
    // TODO
    // filterMode 'weakFilter' and 'empty' is not optimized for huge data yet.


    each$2(seriesModels, function (seriesModel) {
      var seriesData = seriesModel.getData();
      var dataDims = seriesData.mapDimensionsAll(axisDim);

      if (!dataDims.length) {
        return;
      }

      if (filterMode === 'weakFilter') {
        seriesData.filterSelf(function (dataIndex) {
          var leftOut;
          var rightOut;
          var hasValue;

          for (var i = 0; i < dataDims.length; i++) {
            var value = seriesData.get(dataDims[i], dataIndex);
            var thisHasValue = !isNaN(value);
            var thisLeftOut = value < valueWindow[0];
            var thisRightOut = value > valueWindow[1];

            if (thisHasValue && !thisLeftOut && !thisRightOut) {
              return true;
            }

            thisHasValue && (hasValue = true);
            thisLeftOut && (leftOut = true);
            thisRightOut && (rightOut = true);
          } // If both left out and right out, do not filter.


          return hasValue && leftOut && rightOut;
        });
      } else {
        each$2(dataDims, function (dim) {
          if (filterMode === 'empty') {
            seriesModel.setData(seriesData = seriesData.map(dim, function (value) {
              return !isInWindow(value) ? NaN : value;
            }));
          } else {
            var range = {};
            range[dim] = valueWindow; // console.time('select');

            seriesData.selectRange(range); // console.timeEnd('select');
          }
        });
      }

      each$2(dataDims, function (dim) {
        seriesData.setApproximateExtent(valueWindow, dim);
      });
    });

    function isInWindow(value) {
      return value >= valueWindow[0] && value <= valueWindow[1];
    }
  };

  AxisProxy.prototype._updateMinMaxSpan = function () {
    var minMaxSpan = this._minMaxSpan = {};
    var dataZoomModel = this._dataZoomModel;
    var dataExtent = this._dataExtent;
    each$2(['min', 'max'], function (minMax) {
      var percentSpan = dataZoomModel.get(minMax + 'Span');
      var valueSpan = dataZoomModel.get(minMax + 'ValueSpan');
      valueSpan != null && (valueSpan = this.getAxisModel().axis.scale.parse(valueSpan)); // minValueSpan and maxValueSpan has higher priority than minSpan and maxSpan

      if (valueSpan != null) {
        percentSpan = linearMap(dataExtent[0] + valueSpan, dataExtent, [0, 100], true);
      } else if (percentSpan != null) {
        valueSpan = linearMap(percentSpan, [0, 100], dataExtent, true) - dataExtent[0];
      }

      minMaxSpan[minMax + 'Span'] = percentSpan;
      minMaxSpan[minMax + 'ValueSpan'] = valueSpan;
    }, this);
  };

  AxisProxy.prototype._setAxisModel = function () {
    var axisModel = this.getAxisModel();
    var percentWindow = this._percentWindow;
    var valueWindow = this._valueWindow;

    if (!percentWindow) {
      return;
    } // [0, 500]: arbitrary value, guess axis extent.


    var precision = getPixelPrecision(valueWindow, [0, 500]);
    precision = Math.min(precision, 20); // For value axis, if min/max/scale are not set, we just use the extent obtained
    // by series data, which may be a little different from the extent calculated by
    // `axisHelper.getScaleExtent`. But the different just affects the experience a
    // little when zooming. So it will not be fixed until some users require it strongly.

    var rawExtentInfo = axisModel.axis.scale.rawExtentInfo;

    if (percentWindow[0] !== 0) {
      rawExtentInfo.setDeterminedMinMax('min', +valueWindow[0].toFixed(precision));
    }

    if (percentWindow[1] !== 100) {
      rawExtentInfo.setDeterminedMinMax('max', +valueWindow[1].toFixed(precision));
    }

    rawExtentInfo.freeze();
  };

  return AxisProxy;
}();

function calculateDataExtent(axisProxy, axisDim, seriesModels) {
  var dataExtent = [Infinity, -Infinity];
  each$2(seriesModels, function (seriesModel) {
    unionAxisExtentFromData(dataExtent, seriesModel.getData(), axisDim);
  }); // It is important to get "consistent" extent when more then one axes is
  // controlled by a `dataZoom`, otherwise those axes will not be synchronized
  // when zooming. But it is difficult to know what is "consistent", considering
  // axes have different type or even different meanings (For example, two
  // time axes are used to compare data of the same date in different years).
  // So basically dataZoom just obtains extent by series.data (in category axis
  // extent can be obtained from axis.data).
  // Nevertheless, user can set min/max/scale on axes to make extent of axes
  // consistent.

  var axisModel = axisProxy.getAxisModel();
  var rawExtentResult = ensureScaleRawExtentInfo(axisModel.axis.scale, axisModel, dataExtent).calculate();
  return [rawExtentResult.min, rawExtentResult.max];
}

var dataZoomProcessor = {
  // `dataZoomProcessor` will only be performed in needed series. Consider if
  // there is a line series and a pie series, it is better not to update the
  // line series if only pie series is needed to be updated.
  getTargetSeries: function (ecModel) {
    function eachAxisModel(cb) {
      ecModel.eachComponent('dataZoom', function (dataZoomModel) {
        dataZoomModel.eachTargetAxis(function (axisDim, axisIndex) {
          var axisModel = ecModel.getComponent(getAxisMainType(axisDim), axisIndex);
          cb(axisDim, axisIndex, axisModel, dataZoomModel);
        });
      });
    } // FIXME: it brings side-effect to `getTargetSeries`.
    // Prepare axis proxies.


    eachAxisModel(function (axisDim, axisIndex, axisModel, dataZoomModel) {
      // dispose all last axis proxy, in case that some axis are deleted.
      axisModel.__dzAxisProxy = null;
    });
    var proxyList = [];
    eachAxisModel(function (axisDim, axisIndex, axisModel, dataZoomModel) {
      // Different dataZooms may constrol the same axis. In that case,
      // an axisProxy serves both of them.
      if (!axisModel.__dzAxisProxy) {
        // Use the first dataZoomModel as the main model of axisProxy.
        axisModel.__dzAxisProxy = new AxisProxy(axisDim, axisIndex, dataZoomModel, ecModel);
        proxyList.push(axisModel.__dzAxisProxy);
      }
    });
    var seriesModelMap = createHashMap();
    each$4(proxyList, function (axisProxy) {
      each$4(axisProxy.getTargetSeriesModels(), function (seriesModel) {
        seriesModelMap.set(seriesModel.uid, seriesModel);
      });
    });
    return seriesModelMap;
  },
  // Consider appendData, where filter should be performed. Because data process is
  // in block mode currently, it is not need to worry about that the overallProgress
  // execute every frame.
  overallReset: function (ecModel, api) {
    ecModel.eachComponent('dataZoom', function (dataZoomModel) {
      // We calculate window and reset axis here but not in model
      // init stage and not after action dispatch handler, because
      // reset should be called after seriesData.restoreData.
      dataZoomModel.eachTargetAxis(function (axisDim, axisIndex) {
        dataZoomModel.getAxisProxy(axisDim, axisIndex).reset(dataZoomModel);
      }); // Caution: data zoom filtering is order sensitive when using
      // percent range and no min/max/scale set on axis.
      // For example, we have dataZoom definition:
      // [
      //      {xAxisIndex: 0, start: 30, end: 70},
      //      {yAxisIndex: 0, start: 20, end: 80}
      // ]
      // In this case, [20, 80] of y-dataZoom should be based on data
      // that have filtered by x-dataZoom using range of [30, 70],
      // but should not be based on full raw data. Thus sliding
      // x-dataZoom will change both ranges of xAxis and yAxis,
      // while sliding y-dataZoom will only change the range of yAxis.
      // So we should filter x-axis after reset x-axis immediately,
      // and then reset y-axis and filter y-axis.

      dataZoomModel.eachTargetAxis(function (axisDim, axisIndex) {
        dataZoomModel.getAxisProxy(axisDim, axisIndex).filterData(dataZoomModel, api);
      });
    });
    ecModel.eachComponent('dataZoom', function (dataZoomModel) {
      // Fullfill all of the range props so that user
      // is able to get them from chart.getOption().
      var axisProxy = dataZoomModel.findRepresentativeAxisProxy();

      if (axisProxy) {
        var percentRange = axisProxy.getDataPercentWindow();
        var valueRange = axisProxy.getDataValueWindow();
        dataZoomModel.setCalculatedRange({
          start: percentRange[0],
          end: percentRange[1],
          startValue: valueRange[0],
          endValue: valueRange[1]
        });
      }
    });
  }
};

function installDataZoomAction(registers) {
  registers.registerAction('dataZoom', function (payload, ecModel) {
    var effectedModels = findEffectedDataZooms(ecModel, payload);
    each$4(effectedModels, function (dataZoomModel) {
      dataZoomModel.setRawRange({
        start: payload.start,
        end: payload.end,
        startValue: payload.startValue,
        endValue: payload.endValue
      });
    });
  });
}

var installed = false;
function installCommon(registers) {
  if (installed) {
    return;
  }

  installed = true;
  registers.registerProcessor(registers.PRIORITY.PROCESSOR.FILTER, dataZoomProcessor);
  installDataZoomAction(registers);
  registers.registerSubTypeDefaulter('dataZoom', function () {
    // Default 'slider' when no type specified.
    return 'slider';
  });
}

function makeBackground(rect, componentModel) {
  var padding = normalizeCssArray(componentModel.get('padding'));
  var style = componentModel.getItemStyle(['color', 'opacity']);
  style.fill = componentModel.get('backgroundColor');
  rect = new Rect$1({
    shape: {
      x: rect.x - padding[3],
      y: rect.y - padding[0],
      width: rect.width + padding[1] + padding[3],
      height: rect.height + padding[0] + padding[2],
      r: componentModel.get('borderRadius')
    },
    style: style,
    silent: true,
    z2: -1
  }); // FIXME
  // `subPixelOptimizeRect` may bring some gap between edge of viewpart
  // and background rect when setting like `left: 0`, `top: 0`.
  // graphic.subPixelOptimizeRect(rect);

  return rect;
}

var TooltipModel =
/** @class */
function (_super) {
  __extends(TooltipModel, _super);

  function TooltipModel() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = TooltipModel.type;
    return _this;
  }

  TooltipModel.type = 'tooltip';
  TooltipModel.dependencies = ['axisPointer'];
  TooltipModel.defaultOption = {
    zlevel: 0,
    z: 60,
    show: true,
    // tooltip main content
    showContent: true,
    // 'trigger' only works on coordinate system.
    // 'item' | 'axis' | 'none'
    trigger: 'item',
    // 'click' | 'mousemove' | 'none'
    triggerOn: 'mousemove|click',
    alwaysShowContent: false,
    displayMode: 'single',
    renderMode: 'auto',
    // whether restraint content inside viewRect.
    // If renderMode: 'richText', default true.
    // If renderMode: 'html', defaut false (for backward compat).
    confine: null,
    showDelay: 0,
    hideDelay: 100,
    // Animation transition time, unit is second
    transitionDuration: 0.4,
    enterable: false,
    backgroundColor: '#fff',
    // box shadow
    shadowBlur: 10,
    shadowColor: 'rgba(0, 0, 0, .2)',
    shadowOffsetX: 1,
    shadowOffsetY: 2,
    // tooltip border radius, unit is px, default is 4
    borderRadius: 4,
    // tooltip border width, unit is px, default is 0 (no border)
    borderWidth: 1,
    // Tooltip inside padding, default is 5 for all direction
    // Array is allowed to set up, right, bottom, left, same with css
    // The default value: See `tooltip/tooltipMarkup.ts#getPaddingFromTooltipModel`.
    padding: null,
    // Extra css text
    extraCssText: '',
    // axis indicator, trigger by axis
    axisPointer: {
      // default is line
      // legal values: 'line' | 'shadow' | 'cross'
      type: 'line',
      // Valid when type is line, appoint tooltip line locate on which line. Optional
      // legal values: 'x' | 'y' | 'angle' | 'radius' | 'auto'
      // default is 'auto', chose the axis which type is category.
      // for multiply y axis, cartesian coord chose x axis, polar chose angle axis
      axis: 'auto',
      animation: 'auto',
      animationDurationUpdate: 200,
      animationEasingUpdate: 'exponentialOut',
      crossStyle: {
        color: '#999',
        width: 1,
        type: 'dashed',
        // TODO formatter
        textStyle: {}
      } // lineStyle and shadowStyle should not be specified here,
      // otherwise it will always override those styles on option.axisPointer.

    },
    textStyle: {
      color: '#666',
      fontSize: 14
    }
  };
  return TooltipModel;
}(ComponentModel);

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
function shouldTooltipConfine(tooltipModel) {
  var confineOption = tooltipModel.get('confine');
  return confineOption != null ? !!confineOption // In richText mode, the outside part can not be visible.
  : tooltipModel.get('renderMode') === 'richText';
}

var vendors = ['-ms-', '-moz-', '-o-', '-webkit-', ''];
var gCssText = 'position:absolute;display:block;border-style:solid;white-space:nowrap;z-index:9999999;';

function mirrorPos(pos) {
  pos = pos === 'left' ? 'right' : pos === 'right' ? 'left' : pos === 'top' ? 'bottom' : 'top';
  return pos;
}

function assembleArrow(backgroundColor, borderColor, arrowPosition) {
  if (!isString(arrowPosition) || arrowPosition === 'inside') {
    return '';
  }

  borderColor = convertToColorString(borderColor);
  var arrowPos = mirrorPos(arrowPosition);
  var positionStyle = '';
  var transformStyle = '';

  if (indexOf(['left', 'right'], arrowPos) > -1) {
    positionStyle = arrowPos + ":-6px;top:50%;";
    transformStyle = "translateY(-50%) rotate(" + (arrowPos === 'left' ? -225 : -45) + "deg)";
  } else {
    positionStyle = arrowPos + ":-6px;left:50%;";
    transformStyle = "translateX(-50%) rotate(" + (arrowPos === 'top' ? 225 : 45) + "deg)";
  }

  transformStyle = map(vendors, function (vendorPrefix) {
    return vendorPrefix + 'transform:' + transformStyle;
  }).join(';');
  var styleCss = ['position:absolute;width:10px;height:10px;', "" + positionStyle + transformStyle + ";", "border-bottom: " + borderColor + " solid 1px;", "border-right: " + borderColor + " solid 1px;", "background-color: " + backgroundColor + ";", 'box-shadow: 8px 8px 16px -3px #000;'];
  return "<div style=\"" + styleCss.join('') + "\"></div>";
}

function assembleTransition(duration, onlyFade) {
  var transitionCurve = 'cubic-bezier(0.23, 1, 0.32, 1)';
  var transitionText = 'opacity ' + duration / 2 + 's ' + transitionCurve + ',' + 'visibility ' + duration / 2 + 's ' + transitionCurve;

  if (!onlyFade) {
    transitionText += ',left ' + duration + 's ' + transitionCurve + ',top ' + duration + 's ' + transitionCurve;
  }

  return map(vendors, function (vendorPrefix) {
    return vendorPrefix + 'transition:' + transitionText;
  }).join(';');
}
/**
 * @param {Object} textStyle
 * @return {string}
 * @inner
 */


function assembleFont(textStyleModel) {
  var cssText = [];
  var fontSize = textStyleModel.get('fontSize');
  var color = textStyleModel.getTextColor();
  color && cssText.push('color:' + color);
  cssText.push('font:' + textStyleModel.getFont());
  fontSize // @ts-ignore, leave it to the tooltip refactor.
  && cssText.push('line-height:' + Math.round(fontSize * 3 / 2) + 'px');
  var shadowColor = textStyleModel.get('textShadowColor');
  var shadowBlur = textStyleModel.get('textShadowBlur') || 0;
  var shadowOffsetX = textStyleModel.get('textShadowOffsetX') || 0;
  var shadowOffsetY = textStyleModel.get('textShadowOffsetY') || 0;
  shadowColor && shadowBlur && cssText.push('text-shadow:' + shadowOffsetX + 'px ' + shadowOffsetY + 'px ' + shadowBlur + 'px ' + shadowColor);
  each$4(['decoration', 'align'], function (name) {
    var val = textStyleModel.get(name);
    val && cssText.push('text-' + name + ':' + val);
  });
  return cssText.join(';');
}

function assembleCssText(tooltipModel, enableTransition, onlyFade) {
  var cssText = [];
  var transitionDuration = tooltipModel.get('transitionDuration');
  var backgroundColor = tooltipModel.get('backgroundColor');
  var shadowBlur = tooltipModel.get('shadowBlur');
  var shadowColor = tooltipModel.get('shadowColor');
  var shadowOffsetX = tooltipModel.get('shadowOffsetX');
  var shadowOffsetY = tooltipModel.get('shadowOffsetY');
  var textStyleModel = tooltipModel.getModel('textStyle');
  var padding = getPaddingFromTooltipModel(tooltipModel, 'html');
  var boxShadow = shadowOffsetX + "px " + shadowOffsetY + "px " + shadowBlur + "px " + shadowColor;
  cssText.push('box-shadow:' + boxShadow); // Animation transition. Do not animate when transitionDuration is 0.

  enableTransition && transitionDuration && cssText.push(assembleTransition(transitionDuration, onlyFade));

  if (backgroundColor) {
    if (env.canvasSupported) {
      cssText.push('background-Color:' + backgroundColor);
    } else {
      // for ie
      cssText.push('background-Color:#' + toHex(backgroundColor));
      cssText.push('filter:alpha(opacity=70)');
    }
  } // Border style


  each$4(['width', 'color', 'radius'], function (name) {
    var borderName = 'border-' + name;
    var camelCase = toCamelCase(borderName);
    var val = tooltipModel.get(camelCase);
    val != null && cssText.push(borderName + ':' + val + (name === 'color' ? '' : 'px'));
  }); // Text style

  cssText.push(assembleFont(textStyleModel)); // Padding

  if (padding != null) {
    cssText.push('padding:' + normalizeCssArray(padding).join('px ') + 'px');
  }

  return cssText.join(';') + ';';
} // If not able to make, do not modify the input `out`.


function makeStyleCoord$1(out, zr, appendToBody, zrX, zrY) {
  var zrPainter = zr && zr.painter;

  if (appendToBody) {
    var zrViewportRoot = zrPainter && zrPainter.getViewportRoot();

    if (zrViewportRoot) {
      // Some APPs might use scale on body, so we support CSS transform here.
      transformLocalCoord(out, zrViewportRoot, document.body, zrX, zrY);
    }
  } else {
    out[0] = zrX;
    out[1] = zrY; // xy should be based on canvas root. But tooltipContent is
    // the sibling of canvas root. So padding of ec container
    // should be considered here.

    var viewportRootOffset = zrPainter && zrPainter.getViewportRootOffset();

    if (viewportRootOffset) {
      out[0] += viewportRootOffset.offsetLeft;
      out[1] += viewportRootOffset.offsetTop;
    }
  }

  out[2] = out[0] / zr.getWidth();
  out[3] = out[1] / zr.getHeight();
}

var TooltipHTMLContent =
/** @class */
function () {
  function TooltipHTMLContent(container, api, opt) {
    this._show = false;
    this._styleCoord = [0, 0, 0, 0];
    this._enterable = true;
    this._firstShow = true;
    this._longHide = true;

    if (env.wxa) {
      return null;
    }

    var el = document.createElement('div'); // TODO: TYPE

    el.domBelongToZr = true;
    this.el = el;
    var zr = this._zr = api.getZr();
    var appendToBody = this._appendToBody = opt && opt.appendToBody;
    makeStyleCoord$1(this._styleCoord, zr, appendToBody, api.getWidth() / 2, api.getHeight() / 2);

    if (appendToBody) {
      document.body.appendChild(el);
    } else {
      container.appendChild(el);
    }

    this._container = container; // FIXME
    // Is it needed to trigger zr event manually if
    // the browser do not support `pointer-events: none`.

    var self = this;

    el.onmouseenter = function () {
      // clear the timeout in hideLater and keep showing tooltip
      if (self._enterable) {
        clearTimeout(self._hideTimeout);
        self._show = true;
      }

      self._inContent = true;
    };

    el.onmousemove = function (e) {
      e = e || window.event;

      if (!self._enterable) {
        // `pointer-events: none` is set to tooltip content div
        // if `enterable` is set as `false`, and `el.onmousemove`
        // can not be triggered. But in browser that do not
        // support `pointer-events`, we need to do this:
        // Try trigger zrender event to avoid mouse
        // in and out shape too frequently
        var handler = zr.handler;
        var zrViewportRoot = zr.painter.getViewportRoot();
        normalizeEvent(zrViewportRoot, e, true);
        handler.dispatch('mousemove', e);
      }
    };

    el.onmouseleave = function () {
      // set `_inContent` to `false` before `hideLater`
      self._inContent = false;

      if (self._enterable) {
        if (self._show) {
          self.hideLater(self._hideDelay);
        }
      }
    };
  }
  /**
   * Update when tooltip is rendered
   */


  TooltipHTMLContent.prototype.update = function (tooltipModel) {
    // FIXME
    // Move this logic to ec main?
    var container = this._container;
    var stl = container.currentStyle || document.defaultView.getComputedStyle(container);
    var domStyle = container.style;

    if (domStyle.position !== 'absolute' && stl.position !== 'absolute') {
      domStyle.position = 'relative';
    } // move tooltip if chart resized


    var alwaysShowContent = tooltipModel.get('alwaysShowContent');
    alwaysShowContent && this._moveIfResized(); // update className

    this.el.className = tooltipModel.get('className') || ''; // Hide the tooltip
    // PENDING
    // this.hide();
  };

  TooltipHTMLContent.prototype.show = function (tooltipModel, nearPointColor) {
    clearTimeout(this._hideTimeout);
    clearTimeout(this._longHideTimeout);
    var el = this.el;
    var styleCoord = this._styleCoord;
    var offset = el.offsetHeight / 2;
    nearPointColor = convertToColorString(nearPointColor);
    el.style.cssText = gCssText + assembleCssText(tooltipModel, !this._firstShow, this._longHide) // Because of the reason described in:
    // http://stackoverflow.com/questions/21125587/css3-transition-not-working-in-chrome-anymore
    // we should set initial value to `left` and `top`.
    + ';left:' + styleCoord[0] + 'px;top:' + (styleCoord[1] - offset) + 'px;' + ("border-color: " + nearPointColor + ";") + (tooltipModel.get('extraCssText') || '');
    el.style.display = el.innerHTML ? 'block' : 'none'; // If mouse occasionally move over the tooltip, a mouseout event will be
    // triggered by canvas, and cause some unexpectable result like dragging
    // stop, "unfocusAdjacency". Here `pointer-events: none` is used to solve
    // it. Although it is not supported by IE8~IE10, fortunately it is a rare
    // scenario.

    el.style.pointerEvents = this._enterable ? 'auto' : 'none';
    this._show = true;
    this._firstShow = false;
    this._longHide = false;
  };

  TooltipHTMLContent.prototype.setContent = function (content, markers, tooltipModel, borderColor, arrowPosition) {
    if (content == null) {
      return;
    }

    var el = this.el;

    if (isString(arrowPosition) && tooltipModel.get('trigger') === 'item' && !shouldTooltipConfine(tooltipModel)) {
      content += assembleArrow(tooltipModel.get('backgroundColor'), borderColor, arrowPosition);
    }

    if (isString(content)) {
      el.innerHTML = content;
    } else if (content) {
      // Clear previous
      el.innerHTML = '';

      if (!isArray(content)) {
        content = [content];
      }

      for (var i = 0; i < content.length; i++) {
        if (isDom(content[i]) && content[i].parentNode !== el) {
          el.appendChild(content[i]);
        }
      }
    }
  };

  TooltipHTMLContent.prototype.setEnterable = function (enterable) {
    this._enterable = enterable;
  };

  TooltipHTMLContent.prototype.getSize = function () {
    var el = this.el;
    return [el.clientWidth, el.clientHeight];
  };

  TooltipHTMLContent.prototype.moveTo = function (zrX, zrY) {
    var styleCoord = this._styleCoord;
    makeStyleCoord$1(styleCoord, this._zr, this._appendToBody, zrX, zrY);

    if (styleCoord[0] != null && styleCoord[1] != null) {
      var style = this.el.style; // If using float on style, the final width of the dom might
      // keep changing slightly while mouse move. So `toFixed(0)` them.

      style.left = styleCoord[0].toFixed(0) + 'px';
      style.top = styleCoord[1].toFixed(0) + 'px';
    }
  };
  /**
   * when `alwaysShowContent` is true,
   * move the tooltip after chart resized
   */


  TooltipHTMLContent.prototype._moveIfResized = function () {
    // The ratio of left to width
    var ratioX = this._styleCoord[2]; // The ratio of top to height

    var ratioY = this._styleCoord[3];
    this.moveTo(ratioX * this._zr.getWidth(), ratioY * this._zr.getHeight());
  };

  TooltipHTMLContent.prototype.hide = function () {
    var _this = this;

    this.el.style.visibility = 'hidden';
    this.el.style.opacity = '0';
    this._show = false;
    this._longHideTimeout = setTimeout(function () {
      return _this._longHide = true;
    }, 500);
  };

  TooltipHTMLContent.prototype.hideLater = function (time) {
    if (this._show && !(this._inContent && this._enterable)) {
      if (time) {
        this._hideDelay = time; // Set show false to avoid invoke hideLater multiple times

        this._show = false;
        this._hideTimeout = setTimeout(bind$2(this.hide, this), time);
      } else {
        this.hide();
      }
    }
  };

  TooltipHTMLContent.prototype.isShow = function () {
    return this._show;
  };

  TooltipHTMLContent.prototype.dispose = function () {
    this.el.parentNode.removeChild(this.el);
  };

  TooltipHTMLContent.prototype.getOuterSize = function () {
    var width = this.el.clientWidth;
    var height = this.el.clientHeight; // Consider browser compatibility.
    // IE8 does not support getComputedStyle.

    if (document.defaultView && document.defaultView.getComputedStyle) {
      var stl = document.defaultView.getComputedStyle(this.el);

      if (stl) {
        width += parseInt(stl.borderLeftWidth, 10) + parseInt(stl.borderRightWidth, 10);
        height += parseInt(stl.borderTopWidth, 10) + parseInt(stl.borderBottomWidth, 10);
      }
    }

    return {
      width: width,
      height: height
    };
  };

  return TooltipHTMLContent;
}();

var TooltipRichContent =
/** @class */
function () {
  function TooltipRichContent(api) {
    this._show = false;
    this._styleCoord = [0, 0, 0, 0];
    this._enterable = true;
    this._zr = api.getZr();
    makeStyleCoord(this._styleCoord, this._zr, api.getWidth() / 2, api.getHeight() / 2);
  }
  /**
   * Update when tooltip is rendered
   */


  TooltipRichContent.prototype.update = function (tooltipModel) {
    var alwaysShowContent = tooltipModel.get('alwaysShowContent');
    alwaysShowContent && this._moveIfResized();
  };

  TooltipRichContent.prototype.show = function () {
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
    }

    this.el.show();
    this._show = true;
  };
  /**
   * Set tooltip content
   */


  TooltipRichContent.prototype.setContent = function (content, markupStyleCreator, tooltipModel, borderColor, arrowPosition) {
    if (isObject(content)) {
      throwError('');
    }

    if (this.el) {
      this._zr.remove(this.el);
    }

    var textStyleModel = tooltipModel.getModel('textStyle');
    this.el = new ZRText({
      style: {
        rich: markupStyleCreator.richTextStyles,
        text: content,
        lineHeight: 22,
        backgroundColor: tooltipModel.get('backgroundColor'),
        borderRadius: tooltipModel.get('borderRadius'),
        borderWidth: 1,
        borderColor: borderColor,
        shadowColor: tooltipModel.get('shadowColor'),
        shadowBlur: tooltipModel.get('shadowBlur'),
        shadowOffsetX: tooltipModel.get('shadowOffsetX'),
        shadowOffsetY: tooltipModel.get('shadowOffsetY'),
        textShadowColor: textStyleModel.get('textShadowColor'),
        textShadowBlur: textStyleModel.get('textShadowBlur') || 0,
        textShadowOffsetX: textStyleModel.get('textShadowOffsetX') || 0,
        textShadowOffsetY: textStyleModel.get('textShadowOffsetY') || 0,
        fill: tooltipModel.get(['textStyle', 'color']),
        padding: getPaddingFromTooltipModel(tooltipModel, 'richText'),
        verticalAlign: 'top',
        align: 'left'
      },
      z: tooltipModel.get('z')
    });

    this._zr.add(this.el);

    var self = this;
    this.el.on('mouseover', function () {
      // clear the timeout in hideLater and keep showing tooltip
      if (self._enterable) {
        clearTimeout(self._hideTimeout);
        self._show = true;
      }

      self._inContent = true;
    });
    this.el.on('mouseout', function () {
      if (self._enterable) {
        if (self._show) {
          self.hideLater(self._hideDelay);
        }
      }

      self._inContent = false;
    });
  };

  TooltipRichContent.prototype.setEnterable = function (enterable) {
    this._enterable = enterable;
  };

  TooltipRichContent.prototype.getSize = function () {
    var el = this.el;
    var bounding = this.el.getBoundingRect(); // bounding rect does not include shadow. For renderMode richText,
    // if overflow, it will be cut. So calculate them accurately.

    var shadowOuterSize = calcShadowOuterSize(el.style);
    return [bounding.width + shadowOuterSize.left + shadowOuterSize.right, bounding.height + shadowOuterSize.top + shadowOuterSize.bottom];
  };

  TooltipRichContent.prototype.moveTo = function (x, y) {
    var el = this.el;

    if (el) {
      var styleCoord = this._styleCoord;
      makeStyleCoord(styleCoord, this._zr, x, y);
      x = styleCoord[0];
      y = styleCoord[1];
      var style = el.style;
      var borderWidth = mathMaxWith0(style.borderWidth || 0);
      var shadowOuterSize = calcShadowOuterSize(style); // rich text x, y do not include border.

      el.x = x + borderWidth + shadowOuterSize.left;
      el.y = y + borderWidth + shadowOuterSize.top;
      el.markRedraw();
    }
  };
  /**
   * when `alwaysShowContent` is true,
   * move the tooltip after chart resized
   */


  TooltipRichContent.prototype._moveIfResized = function () {
    // The ratio of left to width
    var ratioX = this._styleCoord[2]; // The ratio of top to height

    var ratioY = this._styleCoord[3];
    this.moveTo(ratioX * this._zr.getWidth(), ratioY * this._zr.getHeight());
  };

  TooltipRichContent.prototype.hide = function () {
    if (this.el) {
      this.el.hide();
    }

    this._show = false;
  };

  TooltipRichContent.prototype.hideLater = function (time) {
    if (this._show && !(this._inContent && this._enterable)) {
      if (time) {
        this._hideDelay = time; // Set show false to avoid invoke hideLater multiple times

        this._show = false;
        this._hideTimeout = setTimeout(bind$2(this.hide, this), time);
      } else {
        this.hide();
      }
    }
  };

  TooltipRichContent.prototype.isShow = function () {
    return this._show;
  };

  TooltipRichContent.prototype.getOuterSize = function () {
    var size = this.getSize();
    return {
      width: size[0],
      height: size[1]
    };
  };

  TooltipRichContent.prototype.dispose = function () {
    this._zr.remove(this.el);
  };

  return TooltipRichContent;
}();

function mathMaxWith0(val) {
  return Math.max(0, val);
}

function calcShadowOuterSize(style) {
  var shadowBlur = mathMaxWith0(style.shadowBlur || 0);
  var shadowOffsetX = mathMaxWith0(style.shadowOffsetX || 0);
  var shadowOffsetY = mathMaxWith0(style.shadowOffsetY || 0);
  return {
    left: mathMaxWith0(shadowBlur - shadowOffsetX),
    right: mathMaxWith0(shadowBlur + shadowOffsetX),
    top: mathMaxWith0(shadowBlur - shadowOffsetY),
    bottom: mathMaxWith0(shadowBlur + shadowOffsetY)
  };
}

function makeStyleCoord(out, zr, zrX, zrY) {
  out[0] = zrX;
  out[1] = zrY;
  out[2] = out[0] / zr.getWidth();
  out[3] = out[1] / zr.getHeight();
}

var bind = bind$2;
var each$1 = each$4;
var parsePercent = parsePercent$1;
var proxyRect = new Rect$1({
  shape: {
    x: -1,
    y: -1,
    width: 2,
    height: 2
  }
});

var TooltipView =
/** @class */
function (_super) {
  __extends(TooltipView, _super);

  function TooltipView() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = TooltipView.type;
    return _this;
  }

  TooltipView.prototype.init = function (ecModel, api) {
    if (env.node) {
      return;
    }

    var tooltipModel = ecModel.getComponent('tooltip');
    var renderMode = tooltipModel.get('renderMode');
    this._renderMode = getTooltipRenderMode(renderMode);
    this._tooltipContent = this._renderMode === 'richText' ? new TooltipRichContent(api) : new TooltipHTMLContent(api.getDom(), api, {
      appendToBody: tooltipModel.get('appendToBody', true)
    });
  };

  TooltipView.prototype.render = function (tooltipModel, ecModel, api) {
    if (env.node) {
      return;
    } // Reset


    this.group.removeAll();
    this._tooltipModel = tooltipModel;
    this._ecModel = ecModel;
    this._api = api;
    /**
     * @private
     * @type {boolean}
     */

    this._alwaysShowContent = tooltipModel.get('alwaysShowContent');
    var tooltipContent = this._tooltipContent;
    tooltipContent.update(tooltipModel);
    tooltipContent.setEnterable(tooltipModel.get('enterable'));

    this._initGlobalListener();

    this._keepShow();
  };

  TooltipView.prototype._initGlobalListener = function () {
    var tooltipModel = this._tooltipModel;
    var triggerOn = tooltipModel.get('triggerOn');
    register('itemTooltip', this._api, bind(function (currTrigger, e, dispatchAction) {
      // If 'none', it is not controlled by mouse totally.
      if (triggerOn !== 'none') {
        if (triggerOn.indexOf(currTrigger) >= 0) {
          this._tryShow(e, dispatchAction);
        } else if (currTrigger === 'leave') {
          this._hide(dispatchAction);
        }
      }
    }, this));
  };

  TooltipView.prototype._keepShow = function () {
    var tooltipModel = this._tooltipModel;
    var ecModel = this._ecModel;
    var api = this._api; // Try to keep the tooltip show when refreshing

    if (this._lastX != null && this._lastY != null // When user is willing to control tooltip totally using API,
    // self.manuallyShowTip({x, y}) might cause tooltip hide,
    // which is not expected.
    && tooltipModel.get('triggerOn') !== 'none') {
      var self_1 = this;
      clearTimeout(this._refreshUpdateTimeout);
      this._refreshUpdateTimeout = setTimeout(function () {
        // Show tip next tick after other charts are rendered
        // In case highlight action has wrong result
        // FIXME
        !api.isDisposed() && self_1.manuallyShowTip(tooltipModel, ecModel, api, {
          x: self_1._lastX,
          y: self_1._lastY,
          dataByCoordSys: self_1._lastDataByCoordSys
        });
      });
    }
  };
  /**
   * Show tip manually by
   * dispatchAction({
   *     type: 'showTip',
   *     x: 10,
   *     y: 10
   * });
   * Or
   * dispatchAction({
   *      type: 'showTip',
   *      seriesIndex: 0,
   *      dataIndex or dataIndexInside or name
   * });
   *
   *  TODO Batch
   */


  TooltipView.prototype.manuallyShowTip = function (tooltipModel, ecModel, api, payload) {
    if (payload.from === this.uid || env.node) {
      return;
    }

    var dispatchAction = makeDispatchAction(payload, api); // Reset ticket

    this._ticket = ''; // When triggered from axisPointer.

    var dataByCoordSys = payload.dataByCoordSys;

    if (payload.tooltip && payload.x != null && payload.y != null) {
      var el = proxyRect;
      el.x = payload.x;
      el.y = payload.y;
      el.update();
      el.tooltip = payload.tooltip; // Manually show tooltip while view is not using zrender elements.

      this._tryShow({
        offsetX: payload.x,
        offsetY: payload.y,
        target: el
      }, dispatchAction);
    } else if (dataByCoordSys) {
      this._tryShow({
        offsetX: payload.x,
        offsetY: payload.y,
        position: payload.position,
        dataByCoordSys: dataByCoordSys,
        tooltipOption: payload.tooltipOption
      }, dispatchAction);
    } else if (payload.seriesIndex != null) {
      if (this._manuallyAxisShowTip(tooltipModel, ecModel, api, payload)) {
        return;
      }

      var pointInfo = findPointFromSeries(payload, ecModel);
      var cx = pointInfo.point[0];
      var cy = pointInfo.point[1];

      if (cx != null && cy != null) {
        this._tryShow({
          offsetX: cx,
          offsetY: cy,
          position: payload.position,
          target: pointInfo.el
        }, dispatchAction);
      }
    } else if (payload.x != null && payload.y != null) {
      // FIXME
      // should wrap dispatchAction like `axisPointer/globalListener` ?
      api.dispatchAction({
        type: 'updateAxisPointer',
        x: payload.x,
        y: payload.y
      });

      this._tryShow({
        offsetX: payload.x,
        offsetY: payload.y,
        position: payload.position,
        target: api.getZr().findHover(payload.x, payload.y).target
      }, dispatchAction);
    }
  };

  TooltipView.prototype.manuallyHideTip = function (tooltipModel, ecModel, api, payload) {
    var tooltipContent = this._tooltipContent;

    if (!this._alwaysShowContent && this._tooltipModel) {
      tooltipContent.hideLater(this._tooltipModel.get('hideDelay'));
    }

    this._lastX = this._lastY = this._lastDataByCoordSys = null;

    if (payload.from !== this.uid) {
      this._hide(makeDispatchAction(payload, api));
    }
  }; // Be compatible with previous design, that is, when tooltip.type is 'axis' and
  // dispatchAction 'showTip' with seriesIndex and dataIndex will trigger axis pointer
  // and tooltip.


  TooltipView.prototype._manuallyAxisShowTip = function (tooltipModel, ecModel, api, payload) {
    var seriesIndex = payload.seriesIndex;
    var dataIndex = payload.dataIndex; // @ts-ignore

    var coordSysAxesInfo = ecModel.getComponent('axisPointer').coordSysAxesInfo;

    if (seriesIndex == null || dataIndex == null || coordSysAxesInfo == null) {
      return;
    }

    var seriesModel = ecModel.getSeriesByIndex(seriesIndex);

    if (!seriesModel) {
      return;
    }

    var data = seriesModel.getData();
    var tooltipCascadedModel = buildTooltipModel([data.getItemModel(dataIndex), seriesModel, (seriesModel.coordinateSystem || {}).model, tooltipModel]);

    if (tooltipCascadedModel.get('trigger') !== 'axis') {
      return;
    }

    api.dispatchAction({
      type: 'updateAxisPointer',
      seriesIndex: seriesIndex,
      dataIndex: dataIndex,
      position: payload.position
    });
    return true;
  };

  TooltipView.prototype._tryShow = function (e, dispatchAction) {
    var el = e.target;
    var tooltipModel = this._tooltipModel;

    if (!tooltipModel) {
      return;
    } // Save mouse x, mouse y. So we can try to keep showing the tip if chart is refreshed


    this._lastX = e.offsetX;
    this._lastY = e.offsetY;
    var dataByCoordSys = e.dataByCoordSys;

    if (dataByCoordSys && dataByCoordSys.length) {
      this._showAxisTooltip(dataByCoordSys, e);
    } // Always show item tooltip if mouse is on the element with dataIndex
    else if (el && findEventDispatcher(el, function (target) {
        return getECData(target).dataIndex != null;
      }, true)) {
        this._lastDataByCoordSys = null;

        this._showSeriesItemTooltip(e, el, dispatchAction);
      } // Tooltip provided directly. Like legend.
      else if (el && el.tooltip) {
          this._lastDataByCoordSys = null;

          this._showComponentItemTooltip(e, el, dispatchAction);
        } else {
          this._lastDataByCoordSys = null;

          this._hide(dispatchAction);
        }
  };

  TooltipView.prototype._showOrMove = function (tooltipModel, cb) {
    // showDelay is used in this case: tooltip.enterable is set
    // as true. User intent to move mouse into tooltip and click
    // something. `showDelay` makes it easier to enter the content
    // but tooltip do not move immediately.
    var delay = tooltipModel.get('showDelay');
    cb = bind$2(cb, this);
    clearTimeout(this._showTimout);
    delay > 0 ? this._showTimout = setTimeout(cb, delay) : cb();
  };

  TooltipView.prototype._showAxisTooltip = function (dataByCoordSys, e) {
    var ecModel = this._ecModel;
    var globalTooltipModel = this._tooltipModel;
    var point = [e.offsetX, e.offsetY];
    var singleTooltipModel = buildTooltipModel([e.tooltipOption, globalTooltipModel]);
    var renderMode = this._renderMode;
    var cbParamsList = [];
    var articleMarkup = createTooltipMarkup('section', {
      blocks: [],
      noHeader: true
    }); // Only for legacy: `Serise['formatTooltip']` returns a string.

    var markupTextArrLegacy = [];
    var markupStyleCreator = new TooltipMarkupStyleCreator();
    each$1(dataByCoordSys, function (itemCoordSys) {
      each$1(itemCoordSys.dataByAxis, function (axisItem) {
        var axisModel = ecModel.getComponent(axisItem.axisDim + 'Axis', axisItem.axisIndex);
        var axisValue = axisItem.value;

        if (!axisModel || axisValue == null) {
          return;
        }

        var axisValueLabel = getValueLabel(axisValue, axisModel.axis, ecModel, axisItem.seriesDataIndices, axisItem.valueLabelOpt);
        var axisSectionMarkup = createTooltipMarkup('section', {
          header: axisValueLabel,
          noHeader: !trim(axisValueLabel),
          sortBlocks: true,
          blocks: []
        });
        articleMarkup.blocks.push(axisSectionMarkup);
        each$4(axisItem.seriesDataIndices, function (idxItem) {
          var series = ecModel.getSeriesByIndex(idxItem.seriesIndex);
          var dataIndex = idxItem.dataIndexInside;
          var cbParams = series.getDataParams(dataIndex);
          cbParams.axisDim = axisItem.axisDim;
          cbParams.axisIndex = axisItem.axisIndex;
          cbParams.axisType = axisItem.axisType;
          cbParams.axisId = axisItem.axisId;
          cbParams.axisValue = getAxisRawValue(axisModel.axis, {
            value: axisValue
          });
          cbParams.axisValueLabel = axisValueLabel; // Pre-create marker style for makers. Users can assemble richText
          // text in `formatter` callback and use those markers style.

          cbParams.marker = markupStyleCreator.makeTooltipMarker('item', convertToColorString(cbParams.color), renderMode);
          var seriesTooltipResult = normalizeTooltipFormatResult(series.formatTooltip(dataIndex, true, null));

          if (seriesTooltipResult.markupFragment) {
            axisSectionMarkup.blocks.push(seriesTooltipResult.markupFragment);
          }

          if (seriesTooltipResult.markupText) {
            markupTextArrLegacy.push(seriesTooltipResult.markupText);
          }

          cbParamsList.push(cbParams);
        });
      });
    }); // In most cases, the second axis is displays upper on the first one.
    // So we reverse it to look better.

    articleMarkup.blocks.reverse();
    markupTextArrLegacy.reverse();
    var positionExpr = e.position;
    var orderMode = singleTooltipModel.get('order');
    var builtMarkupText = buildTooltipMarkup(articleMarkup, markupStyleCreator, renderMode, orderMode, ecModel.get('useUTC'), singleTooltipModel.get('textStyle'));
    builtMarkupText && markupTextArrLegacy.unshift(builtMarkupText);
    var blockBreak = renderMode === 'richText' ? '\n\n' : '<br/>';
    var allMarkupText = markupTextArrLegacy.join(blockBreak);

    this._showOrMove(singleTooltipModel, function () {
      if (this._updateContentNotChangedOnAxis(dataByCoordSys)) {
        this._updatePosition(singleTooltipModel, positionExpr, point[0], point[1], this._tooltipContent, cbParamsList);
      } else {
        this._showTooltipContent(singleTooltipModel, allMarkupText, cbParamsList, Math.random() + '', point[0], point[1], positionExpr, null, markupStyleCreator);
      }
    }); // Do not trigger events here, because this branch only be entered
    // from dispatchAction.

  };

  TooltipView.prototype._showSeriesItemTooltip = function (e, el, dispatchAction) {
    var dispatcher = findEventDispatcher(el, function (target) {
      return getECData(target).dataIndex != null;
    }, true);
    var ecModel = this._ecModel;
    var ecData = getECData(dispatcher); // Use dataModel in element if possible
    // Used when mouseover on a element like markPoint or edge
    // In which case, the data is not main data in series.

    var seriesIndex = ecData.seriesIndex;
    var seriesModel = ecModel.getSeriesByIndex(seriesIndex); // For example, graph link.

    var dataModel = ecData.dataModel || seriesModel;
    var dataIndex = ecData.dataIndex;
    var dataType = ecData.dataType;
    var data = dataModel.getData(dataType);
    var renderMode = this._renderMode;
    var tooltipModel = buildTooltipModel([data.getItemModel(dataIndex), dataModel, seriesModel && (seriesModel.coordinateSystem || {}).model, this._tooltipModel]);
    var tooltipTrigger = tooltipModel.get('trigger');

    if (tooltipTrigger != null && tooltipTrigger !== 'item') {
      return;
    }

    var params = dataModel.getDataParams(dataIndex, dataType);
    var markupStyleCreator = new TooltipMarkupStyleCreator(); // Pre-create marker style for makers. Users can assemble richText
    // text in `formatter` callback and use those markers style.

    params.marker = markupStyleCreator.makeTooltipMarker('item', convertToColorString(params.color), renderMode);
    var seriesTooltipResult = normalizeTooltipFormatResult(dataModel.formatTooltip(dataIndex, false, dataType));
    var orderMode = tooltipModel.get('order');
    var markupText = seriesTooltipResult.markupFragment ? buildTooltipMarkup(seriesTooltipResult.markupFragment, markupStyleCreator, renderMode, orderMode, ecModel.get('useUTC'), tooltipModel.get('textStyle')) : seriesTooltipResult.markupText;
    var asyncTicket = 'item_' + dataModel.name + '_' + dataIndex;

    this._showOrMove(tooltipModel, function () {
      this._showTooltipContent(tooltipModel, markupText, params, asyncTicket, e.offsetX, e.offsetY, e.position, e.target, markupStyleCreator);
    }); // FIXME
    // duplicated showtip if manuallyShowTip is called from dispatchAction.


    dispatchAction({
      type: 'showTip',
      dataIndexInside: dataIndex,
      dataIndex: data.getRawIndex(dataIndex),
      seriesIndex: seriesIndex,
      from: this.uid
    });
  };

  TooltipView.prototype._showComponentItemTooltip = function (e, el, dispatchAction) {
    var tooltipOpt = el.tooltip;

    if (isString(tooltipOpt)) {
      var content = tooltipOpt;
      tooltipOpt = {
        content: content,
        // Fixed formatter
        formatter: content
      };
    }

    var subTooltipModel = new Model(tooltipOpt, this._tooltipModel, this._ecModel);
    var defaultHtml = subTooltipModel.get('content');
    var asyncTicket = Math.random() + ''; // PENDING: this case do not support richText style yet.

    var markupStyleCreator = new TooltipMarkupStyleCreator(); // Do not check whether `trigger` is 'none' here, because `trigger`
    // only works on coordinate system. In fact, we have not found case
    // that requires setting `trigger` nothing on component yet.

    this._showOrMove(subTooltipModel, function () {
      this._showTooltipContent( // Use formatterParams from element defined in component
      subTooltipModel, defaultHtml, subTooltipModel.get('formatterParams') || {}, asyncTicket, e.offsetX, e.offsetY, e.position, el, markupStyleCreator);
    }); // If not dispatch showTip, tip may be hide triggered by axis.


    dispatchAction({
      type: 'showTip',
      from: this.uid
    });
  };

  TooltipView.prototype._showTooltipContent = function ( // Use Model<TooltipOption> insteadof TooltipModel because this model may be from series or other options.
  // Instead of top level tooltip.
  tooltipModel, defaultHtml, params, asyncTicket, x, y, positionExpr, el, markupStyleCreator) {
    // Reset ticket
    this._ticket = '';

    if (!tooltipModel.get('showContent') || !tooltipModel.get('show')) {
      return;
    }

    var tooltipContent = this._tooltipContent;
    var formatter = tooltipModel.get('formatter');
    positionExpr = positionExpr || tooltipModel.get('position');
    var html = defaultHtml;

    var nearPoint = this._getNearestPoint([x, y], params, tooltipModel.get('trigger'), tooltipModel.get('borderColor'));

    if (formatter && isString(formatter)) {
      var useUTC = tooltipModel.ecModel.get('useUTC');
      var params0 = isArray(params) ? params[0] : params;
      var isTimeAxis = params0 && params0.axisType && params0.axisType.indexOf('time') >= 0;
      html = formatter;

      if (isTimeAxis) {
        html = format(params0.axisValue, html, useUTC);
      }

      html = formatTpl(html, params, true);
    } else if (isFunction(formatter)) {
      var callback = bind(function (cbTicket, html) {
        if (cbTicket === this._ticket) {
          tooltipContent.setContent(html, markupStyleCreator, tooltipModel, nearPoint.color, positionExpr);

          this._updatePosition(tooltipModel, positionExpr, x, y, tooltipContent, params, el);
        }
      }, this);
      this._ticket = asyncTicket;
      html = formatter(params, asyncTicket, callback);
    }

    tooltipContent.setContent(html, markupStyleCreator, tooltipModel, nearPoint.color, positionExpr);
    tooltipContent.show(tooltipModel, nearPoint.color);

    this._updatePosition(tooltipModel, positionExpr, x, y, tooltipContent, params, el);
  };

  TooltipView.prototype._getNearestPoint = function (point, tooltipDataParams, trigger, borderColor) {
    if (trigger === 'axis' || isArray(tooltipDataParams)) {
      return {
        color: borderColor || (this._renderMode === 'html' ? '#fff' : 'none')
      };
    }

    if (!isArray(tooltipDataParams)) {
      return {
        color: borderColor || tooltipDataParams.color || tooltipDataParams.borderColor
      };
    }
  };

  TooltipView.prototype._updatePosition = function (tooltipModel, positionExpr, x, // Mouse x
  y, // Mouse y
  content, params, el) {
    var viewWidth = this._api.getWidth();

    var viewHeight = this._api.getHeight();

    positionExpr = positionExpr || tooltipModel.get('position');
    var contentSize = content.getSize();
    var align = tooltipModel.get('align');
    var vAlign = tooltipModel.get('verticalAlign');
    var rect = el && el.getBoundingRect().clone();
    el && rect.applyTransform(el.transform);

    if (isFunction(positionExpr)) {
      // Callback of position can be an array or a string specify the position
      positionExpr = positionExpr([x, y], params, content.el, rect, {
        viewSize: [viewWidth, viewHeight],
        contentSize: contentSize.slice()
      });
    }

    if (isArray(positionExpr)) {
      x = parsePercent(positionExpr[0], viewWidth);
      y = parsePercent(positionExpr[1], viewHeight);
    } else if (isObject(positionExpr)) {
      var boxLayoutPosition = positionExpr;
      boxLayoutPosition.width = contentSize[0];
      boxLayoutPosition.height = contentSize[1];
      var layoutRect = getLayoutRect(boxLayoutPosition, {
        width: viewWidth,
        height: viewHeight
      });
      x = layoutRect.x;
      y = layoutRect.y;
      align = null; // When positionExpr is left/top/right/bottom,
      // align and verticalAlign will not work.

      vAlign = null;
    } // Specify tooltip position by string 'top' 'bottom' 'left' 'right' around graphic element
    else if (isString(positionExpr) && el) {
        var pos = calcTooltipPosition(positionExpr, rect, contentSize);
        x = pos[0];
        y = pos[1];
      } else {
        var pos = refixTooltipPosition(x, y, content, viewWidth, viewHeight, align ? null : 20, vAlign ? null : 20);
        x = pos[0];
        y = pos[1];
      }

    align && (x -= isCenterAlign(align) ? contentSize[0] / 2 : align === 'right' ? contentSize[0] : 0);
    vAlign && (y -= isCenterAlign(vAlign) ? contentSize[1] / 2 : vAlign === 'bottom' ? contentSize[1] : 0);

    if (shouldTooltipConfine(tooltipModel)) {
      var pos = confineTooltipPosition(x, y, content, viewWidth, viewHeight);
      x = pos[0];
      y = pos[1];
    }

    content.moveTo(x, y);
  }; // FIXME
  // Should we remove this but leave this to user?


  TooltipView.prototype._updateContentNotChangedOnAxis = function (dataByCoordSys) {
    var lastCoordSys = this._lastDataByCoordSys;
    var contentNotChanged = !!lastCoordSys && lastCoordSys.length === dataByCoordSys.length;
    contentNotChanged && each$1(lastCoordSys, function (lastItemCoordSys, indexCoordSys) {
      var lastDataByAxis = lastItemCoordSys.dataByAxis || [];
      var thisItemCoordSys = dataByCoordSys[indexCoordSys] || {};
      var thisDataByAxis = thisItemCoordSys.dataByAxis || [];
      contentNotChanged = contentNotChanged && lastDataByAxis.length === thisDataByAxis.length;
      contentNotChanged && each$1(lastDataByAxis, function (lastItem, indexAxis) {
        var thisItem = thisDataByAxis[indexAxis] || {};
        var lastIndices = lastItem.seriesDataIndices || [];
        var newIndices = thisItem.seriesDataIndices || [];
        contentNotChanged = contentNotChanged && lastItem.value === thisItem.value && lastItem.axisType === thisItem.axisType && lastItem.axisId === thisItem.axisId && lastIndices.length === newIndices.length;
        contentNotChanged && each$1(lastIndices, function (lastIdxItem, j) {
          var newIdxItem = newIndices[j];
          contentNotChanged = contentNotChanged && lastIdxItem.seriesIndex === newIdxItem.seriesIndex && lastIdxItem.dataIndex === newIdxItem.dataIndex;
        });
      });
    });
    this._lastDataByCoordSys = dataByCoordSys;
    return !!contentNotChanged;
  };

  TooltipView.prototype._hide = function (dispatchAction) {
    // Do not directly hideLater here, because this behavior may be prevented
    // in dispatchAction when showTip is dispatched.
    // FIXME
    // duplicated hideTip if manuallyHideTip is called from dispatchAction.
    this._lastDataByCoordSys = null;
    dispatchAction({
      type: 'hideTip',
      from: this.uid
    });
  };

  TooltipView.prototype.dispose = function (ecModel, api) {
    if (env.node) {
      return;
    }

    this._tooltipContent.dispose();

    unregister('itemTooltip', api);
  };

  TooltipView.type = 'tooltip';
  return TooltipView;
}(ComponentView);
/**
 * From top to bottom. (the last one should be globalTooltipModel);
 */


function buildTooltipModel(modelCascade) {
  // Last is always tooltip model.
  var resultModel = modelCascade.pop();

  while (modelCascade.length) {
    var tooltipOpt = modelCascade.pop();

    if (tooltipOpt) {
      if (tooltipOpt instanceof Model) {
        tooltipOpt = tooltipOpt.get('tooltip', true);
      } // In each data item tooltip can be simply write:
      // {
      //  value: 10,
      //  tooltip: 'Something you need to know'
      // }


      if (isString(tooltipOpt)) {
        tooltipOpt = {
          formatter: tooltipOpt
        };
      }

      resultModel = new Model(tooltipOpt, resultModel, resultModel.ecModel);
    }
  }

  return resultModel;
}

function makeDispatchAction(payload, api) {
  return payload.dispatchAction || bind$2(api.dispatchAction, api);
}

function refixTooltipPosition(x, y, content, viewWidth, viewHeight, gapH, gapV) {
  var size = content.getOuterSize();
  var width = size.width;
  var height = size.height;

  if (gapH != null) {
    // Add extra 2 pixels for this case:
    // At present the "values" in defaut tooltip are using CSS `float: right`.
    // When the right edge of the tooltip box is on the right side of the
    // viewport, the `float` layout might push the "values" to the second line.
    if (x + width + gapH + 2 > viewWidth) {
      x -= width + gapH;
    } else {
      x += gapH;
    }
  }

  if (gapV != null) {
    if (y + height + gapV > viewHeight) {
      y -= height + gapV;
    } else {
      y += gapV;
    }
  }

  return [x, y];
}

function confineTooltipPosition(x, y, content, viewWidth, viewHeight) {
  var size = content.getOuterSize();
  var width = size.width;
  var height = size.height;
  x = Math.min(x + width, viewWidth) - width;
  y = Math.min(y + height, viewHeight) - height;
  x = Math.max(x, 0);
  y = Math.max(y, 0);
  return [x, y];
}

function calcTooltipPosition(position, rect, contentSize) {
  var domWidth = contentSize[0];
  var domHeight = contentSize[1];
  var gap = 10;
  var offset = 5;
  var x = 0;
  var y = 0;
  var rectWidth = rect.width;
  var rectHeight = rect.height;

  switch (position) {
    case 'inside':
      x = rect.x + rectWidth / 2 - domWidth / 2;
      y = rect.y + rectHeight / 2 - domHeight / 2;
      break;

    case 'top':
      x = rect.x + rectWidth / 2 - domWidth / 2;
      y = rect.y - domHeight - gap;
      break;

    case 'bottom':
      x = rect.x + rectWidth / 2 - domWidth / 2;
      y = rect.y + rectHeight + gap;
      break;

    case 'left':
      x = rect.x - domWidth - gap - offset;
      y = rect.y + rectHeight / 2 - domHeight / 2;
      break;

    case 'right':
      x = rect.x + rectWidth + gap + offset;
      y = rect.y + rectHeight / 2 - domHeight / 2;
  }

  return [x, y];
}

function isCenterAlign(align) {
  return align === 'center' || align === 'middle';
}

function install$7(registers) {
  use(install$9);
  registers.registerComponentModel(TooltipModel);
  registers.registerComponentView(TooltipView);
  /**
   * @action
   * @property {string} type
   * @property {number} seriesIndex
   * @property {number} dataIndex
   * @property {number} [x]
   * @property {number} [y]
   */

  registers.registerAction({
    type: 'showTip',
    event: 'showTip',
    update: 'tooltip:manuallyShowTip'
  }, // noop
  function () {});
  registers.registerAction({
    type: 'hideTip',
    event: 'hideTip',
    update: 'tooltip:manuallyHideTip'
  }, // noop
  function () {});
}

var TitleModel =
/** @class */
function (_super) {
  __extends(TitleModel, _super);

  function TitleModel() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = TitleModel.type;
    _this.layoutMode = {
      type: 'box',
      ignoreSize: true
    };
    return _this;
  }

  TitleModel.type = 'title';
  TitleModel.defaultOption = {
    zlevel: 0,
    z: 6,
    show: true,
    text: '',
    target: 'blank',
    subtext: '',
    subtarget: 'blank',
    left: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0)',
    borderColor: '#ccc',
    borderWidth: 0,
    padding: 5,
    itemGap: 10,
    textStyle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#464646'
    },
    subtextStyle: {
      fontSize: 12,
      color: '#6E7079'
    }
  };
  return TitleModel;
}(ComponentModel); // View


var TitleView =
/** @class */
function (_super) {
  __extends(TitleView, _super);

  function TitleView() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = TitleView.type;
    return _this;
  }

  TitleView.prototype.render = function (titleModel, ecModel, api) {
    this.group.removeAll();

    if (!titleModel.get('show')) {
      return;
    }

    var group = this.group;
    var textStyleModel = titleModel.getModel('textStyle');
    var subtextStyleModel = titleModel.getModel('subtextStyle');
    var textAlign = titleModel.get('textAlign');
    var textVerticalAlign = retrieve2(titleModel.get('textBaseline'), titleModel.get('textVerticalAlign'));
    var textEl = new ZRText({
      style: createTextStyle(textStyleModel, {
        text: titleModel.get('text'),
        fill: textStyleModel.getTextColor()
      }, {
        disableBox: true
      }),
      z2: 10
    });
    var textRect = textEl.getBoundingRect();
    var subText = titleModel.get('subtext');
    var subTextEl = new ZRText({
      style: createTextStyle(subtextStyleModel, {
        text: subText,
        fill: subtextStyleModel.getTextColor(),
        y: textRect.height + titleModel.get('itemGap'),
        verticalAlign: 'top'
      }, {
        disableBox: true
      }),
      z2: 10
    });
    var link = titleModel.get('link');
    var sublink = titleModel.get('sublink');
    var triggerEvent = titleModel.get('triggerEvent', true);
    textEl.silent = !link && !triggerEvent;
    subTextEl.silent = !sublink && !triggerEvent;

    if (link) {
      textEl.on('click', function () {
        windowOpen(link, '_' + titleModel.get('target'));
      });
    }

    if (sublink) {
      subTextEl.on('click', function () {
        windowOpen(sublink, '_' + titleModel.get('subtarget'));
      });
    }

    getECData(textEl).eventData = getECData(subTextEl).eventData = triggerEvent ? {
      componentType: 'title',
      componentIndex: titleModel.componentIndex
    } : null;
    group.add(textEl);
    subText && group.add(subTextEl); // If no subText, but add subTextEl, there will be an empty line.

    var groupRect = group.getBoundingRect();
    var layoutOption = titleModel.getBoxLayoutParams();
    layoutOption.width = groupRect.width;
    layoutOption.height = groupRect.height;
    var layoutRect = getLayoutRect(layoutOption, {
      width: api.getWidth(),
      height: api.getHeight()
    }, titleModel.get('padding')); // Adjust text align based on position

    if (!textAlign) {
      // Align left if title is on the left. center and right is same
      textAlign = titleModel.get('left') || titleModel.get('right'); // @ts-ignore

      if (textAlign === 'middle') {
        textAlign = 'center';
      } // Adjust layout by text align


      if (textAlign === 'right') {
        layoutRect.x += layoutRect.width;
      } else if (textAlign === 'center') {
        layoutRect.x += layoutRect.width / 2;
      }
    }

    if (!textVerticalAlign) {
      textVerticalAlign = titleModel.get('top') || titleModel.get('bottom'); // @ts-ignore

      if (textVerticalAlign === 'center') {
        textVerticalAlign = 'middle';
      }

      if (textVerticalAlign === 'bottom') {
        layoutRect.y += layoutRect.height;
      } else if (textVerticalAlign === 'middle') {
        layoutRect.y += layoutRect.height / 2;
      }

      textVerticalAlign = textVerticalAlign || 'top';
    }

    group.x = layoutRect.x;
    group.y = layoutRect.y;
    group.markRedraw();
    var alignStyle = {
      align: textAlign,
      verticalAlign: textVerticalAlign
    };
    textEl.setStyle(alignStyle);
    subTextEl.setStyle(alignStyle); // Render background
    // Get groupRect again because textAlign has been changed

    groupRect = group.getBoundingRect();
    var padding = layoutRect.margin;
    var style = titleModel.getItemStyle(['color', 'opacity']);
    style.fill = titleModel.get('backgroundColor');
    var rect = new Rect$1({
      shape: {
        x: groupRect.x - padding[3],
        y: groupRect.y - padding[0],
        width: groupRect.width + padding[1] + padding[3],
        height: groupRect.height + padding[0] + padding[2],
        r: titleModel.get('borderRadius')
      },
      style: style,
      subPixelOptimize: true,
      silent: true
    });
    group.add(rect);
  };

  TitleView.type = 'title';
  return TitleView;
}(ComponentView);

function install$6(registers) {
  registers.registerComponentModel(TitleModel);
  registers.registerComponentView(TitleView);
}

var getDefaultSelectorOptions = function (ecModel, type) {
  if (type === 'all') {
    return {
      type: 'all',
      title: ecModel.getLocale(['legend', 'selector', 'all'])
    };
  } else if (type === 'inverse') {
    return {
      type: 'inverse',
      title: ecModel.getLocale(['legend', 'selector', 'inverse'])
    };
  }
};

var LegendModel =
/** @class */
function (_super) {
  __extends(LegendModel, _super);

  function LegendModel() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = LegendModel.type;
    _this.layoutMode = {
      type: 'box',
      // legend.width/height are maxWidth/maxHeight actually,
      // whereas realy width/height is calculated by its content.
      // (Setting {left: 10, right: 10} does not make sense).
      // So consider the case:
      // `setOption({legend: {left: 10});`
      // then `setOption({legend: {right: 10});`
      // The previous `left` should be cleared by setting `ignoreSize`.
      ignoreSize: true
    };
    return _this;
  }

  LegendModel.prototype.init = function (option, parentModel, ecModel) {
    this.mergeDefaultAndTheme(option, ecModel);
    option.selected = option.selected || {};

    this._updateSelector(option);
  };

  LegendModel.prototype.mergeOption = function (option, ecModel) {
    _super.prototype.mergeOption.call(this, option, ecModel);

    this._updateSelector(option);
  };

  LegendModel.prototype._updateSelector = function (option) {
    var selector = option.selector;
    var ecModel = this.ecModel;

    if (selector === true) {
      selector = option.selector = ['all', 'inverse'];
    }

    if (isArray(selector)) {
      each$4(selector, function (item, index) {
        isString(item) && (item = {
          type: item
        });
        selector[index] = merge(item, getDefaultSelectorOptions(ecModel, item.type));
      });
    }
  };

  LegendModel.prototype.optionUpdated = function () {
    this._updateData(this.ecModel);

    var legendData = this._data; // If selectedMode is single, try to select one

    if (legendData[0] && this.get('selectedMode') === 'single') {
      var hasSelected = false; // If has any selected in option.selected

      for (var i = 0; i < legendData.length; i++) {
        var name_1 = legendData[i].get('name');

        if (this.isSelected(name_1)) {
          // Force to unselect others
          this.select(name_1);
          hasSelected = true;
          break;
        }
      } // Try select the first if selectedMode is single


      !hasSelected && this.select(legendData[0].get('name'));
    }
  };

  LegendModel.prototype._updateData = function (ecModel) {
    var potentialData = [];
    var availableNames = [];
    ecModel.eachRawSeries(function (seriesModel) {
      var seriesName = seriesModel.name;
      availableNames.push(seriesName);
      var isPotential;

      if (seriesModel.legendVisualProvider) {
        var provider = seriesModel.legendVisualProvider;
        var names = provider.getAllNames();

        if (!ecModel.isSeriesFiltered(seriesModel)) {
          availableNames = availableNames.concat(names);
        }

        if (names.length) {
          potentialData = potentialData.concat(names);
        } else {
          isPotential = true;
        }
      } else {
        isPotential = true;
      }

      if (isPotential && isNameSpecified(seriesModel)) {
        potentialData.push(seriesModel.name);
      }
    });
    /**
     * @type {Array.<string>}
     * @private
     */

    this._availableNames = availableNames; // If legend.data not specified in option, use availableNames as data,
    // which is convinient for user preparing option.

    var rawData = this.get('data') || potentialData;
    var legendData = map(rawData, function (dataItem) {
      // Can be string or number
      if (typeof dataItem === 'string' || typeof dataItem === 'number') {
        dataItem = {
          name: dataItem
        };
      }

      return new Model(dataItem, this, this.ecModel);
    }, this);
    /**
     * @type {Array.<module:echarts/model/Model>}
     * @private
     */

    this._data = legendData;
  };

  LegendModel.prototype.getData = function () {
    return this._data;
  };

  LegendModel.prototype.select = function (name) {
    var selected = this.option.selected;
    var selectedMode = this.get('selectedMode');

    if (selectedMode === 'single') {
      var data = this._data;
      each$4(data, function (dataItem) {
        selected[dataItem.get('name')] = false;
      });
    }

    selected[name] = true;
  };

  LegendModel.prototype.unSelect = function (name) {
    if (this.get('selectedMode') !== 'single') {
      this.option.selected[name] = false;
    }
  };

  LegendModel.prototype.toggleSelected = function (name) {
    var selected = this.option.selected; // Default is true

    if (!selected.hasOwnProperty(name)) {
      selected[name] = true;
    }

    this[selected[name] ? 'unSelect' : 'select'](name);
  };

  LegendModel.prototype.allSelect = function () {
    var data = this._data;
    var selected = this.option.selected;
    each$4(data, function (dataItem) {
      selected[dataItem.get('name', true)] = true;
    });
  };

  LegendModel.prototype.inverseSelect = function () {
    var data = this._data;
    var selected = this.option.selected;
    each$4(data, function (dataItem) {
      var name = dataItem.get('name', true); // Initially, default value is true

      if (!selected.hasOwnProperty(name)) {
        selected[name] = true;
      }

      selected[name] = !selected[name];
    });
  };

  LegendModel.prototype.isSelected = function (name) {
    var selected = this.option.selected;
    return !(selected.hasOwnProperty(name) && !selected[name]) && indexOf(this._availableNames, name) >= 0;
  };

  LegendModel.prototype.getOrient = function () {
    return this.get('orient') === 'vertical' ? {
      index: 1,
      name: 'vertical'
    } : {
      index: 0,
      name: 'horizontal'
    };
  };

  LegendModel.type = 'legend.plain';
  LegendModel.dependencies = ['series'];
  LegendModel.defaultOption = {
    zlevel: 0,
    z: 4,
    show: true,
    orient: 'horizontal',
    left: 'center',
    // right: 'center',
    top: 0,
    // bottom: null,
    align: 'auto',
    backgroundColor: 'rgba(0,0,0,0)',
    borderColor: '#ccc',
    borderRadius: 0,
    borderWidth: 0,
    padding: 5,
    itemGap: 10,
    itemWidth: 25,
    itemHeight: 14,
    inactiveColor: '#ccc',
    inactiveBorderColor: '#ccc',
    itemStyle: {
      borderWidth: 0
    },
    textStyle: {
      color: '#333'
    },
    selectedMode: true,
    selector: false,
    selectorLabel: {
      show: true,
      borderRadius: 10,
      padding: [3, 5, 3, 5],
      fontSize: 12,
      fontFamily: ' sans-serif',
      color: '#666',
      borderWidth: 1,
      borderColor: '#666'
    },
    emphasis: {
      selectorLabel: {
        show: true,
        color: '#eee',
        backgroundColor: '#666'
      }
    },
    selectorPosition: 'auto',
    selectorItemGap: 7,
    selectorButtonGap: 10,
    tooltip: {
      show: false
    }
  };
  return LegendModel;
}(ComponentModel);

var curry = curry$1;
var each = each$4;
var Group$1 = Group$2;

var LegendView =
/** @class */
function (_super) {
  __extends(LegendView, _super);

  function LegendView() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = LegendView.type;
    _this.newlineDisabled = false;
    return _this;
  }

  LegendView.prototype.init = function () {
    this.group.add(this._contentGroup = new Group$1());
    this.group.add(this._selectorGroup = new Group$1());
    this._isFirstRender = true;
  };
  /**
   * @protected
   */


  LegendView.prototype.getContentGroup = function () {
    return this._contentGroup;
  };
  /**
   * @protected
   */


  LegendView.prototype.getSelectorGroup = function () {
    return this._selectorGroup;
  };
  /**
   * @override
   */


  LegendView.prototype.render = function (legendModel, ecModel, api) {
    var isFirstRender = this._isFirstRender;
    this._isFirstRender = false;
    this.resetInner();

    if (!legendModel.get('show', true)) {
      return;
    }

    var itemAlign = legendModel.get('align');
    var orient = legendModel.get('orient');

    if (!itemAlign || itemAlign === 'auto') {
      itemAlign = legendModel.get('left') === 'right' && orient === 'vertical' ? 'right' : 'left';
    } // selector has been normalized to an array in model


    var selector = legendModel.get('selector', true);
    var selectorPosition = legendModel.get('selectorPosition', true);

    if (selector && (!selectorPosition || selectorPosition === 'auto')) {
      selectorPosition = orient === 'horizontal' ? 'end' : 'start';
    }

    this.renderInner(itemAlign, legendModel, ecModel, api, selector, orient, selectorPosition); // Perform layout.

    var positionInfo = legendModel.getBoxLayoutParams();
    var viewportSize = {
      width: api.getWidth(),
      height: api.getHeight()
    };
    var padding = legendModel.get('padding');
    var maxSize = getLayoutRect(positionInfo, viewportSize, padding);
    var mainRect = this.layoutInner(legendModel, itemAlign, maxSize, isFirstRender, selector, selectorPosition); // Place mainGroup, based on the calculated `mainRect`.

    var layoutRect = getLayoutRect(defaults({
      width: mainRect.width,
      height: mainRect.height
    }, positionInfo), viewportSize, padding);
    this.group.x = layoutRect.x - mainRect.x;
    this.group.y = layoutRect.y - mainRect.y;
    this.group.markRedraw(); // Render background after group is layout.

    this.group.add(this._backgroundEl = makeBackground(mainRect, legendModel));
  };

  LegendView.prototype.resetInner = function () {
    this.getContentGroup().removeAll();
    this._backgroundEl && this.group.remove(this._backgroundEl);
    this.getSelectorGroup().removeAll();
  };

  LegendView.prototype.renderInner = function (itemAlign, legendModel, ecModel, api, selector, orient, selectorPosition) {
    var contentGroup = this.getContentGroup();
    var legendDrawnMap = createHashMap();
    var selectMode = legendModel.get('selectedMode');
    var excludeSeriesId = [];
    ecModel.eachRawSeries(function (seriesModel) {
      !seriesModel.get('legendHoverLink') && excludeSeriesId.push(seriesModel.id);
    });
    each(legendModel.getData(), function (itemModel, dataIndex) {
      var name = itemModel.get('name'); // Use empty string or \n as a newline string

      if (!this.newlineDisabled && (name === '' || name === '\n')) {
        var g = new Group$1(); // @ts-ignore

        g.newline = true;
        contentGroup.add(g);
        return;
      } // Representitive series.


      var seriesModel = ecModel.getSeriesByName(name)[0];

      if (legendDrawnMap.get(name)) {
        // Have been drawed
        return;
      } // Legend to control series.


      if (seriesModel) {
        var data = seriesModel.getData();
        var style = data.getVisual('style');
        var color = style[data.getVisual('drawType')] || style.fill;
        var borderColor = style.stroke;
        var decal = style.decal; // Using rect symbol defaultly

        var legendSymbolType = data.getVisual('legendSymbol') || 'roundRect';
        var symbolType = data.getVisual('symbol');

        var itemGroup = this._createItem(name, dataIndex, itemModel, legendModel, legendSymbolType, symbolType, itemAlign, color, borderColor, decal, selectMode);

        itemGroup.on('click', curry(dispatchSelectAction, name, null, api, excludeSeriesId)).on('mouseover', curry(dispatchHighlightAction, seriesModel.name, null, api, excludeSeriesId)).on('mouseout', curry(dispatchDownplayAction, seriesModel.name, null, api, excludeSeriesId));
        legendDrawnMap.set(name, true);
      } else {
        // Legend to control data. In pie and funnel.
        ecModel.eachRawSeries(function (seriesModel) {
          // In case multiple series has same data name
          if (legendDrawnMap.get(name)) {
            return;
          }

          if (seriesModel.legendVisualProvider) {
            var provider = seriesModel.legendVisualProvider;

            if (!provider.containName(name)) {
              return;
            }

            var idx = provider.indexOfName(name);
            var style = provider.getItemVisual(idx, 'style');
            var borderColor = style.stroke;
            var decal = style.decal;
            var color = style.fill;
            var colorArr = parse(style.fill); // Color may be set to transparent in visualMap when data is out of range.
            // Do not show nothing.

            if (colorArr && colorArr[3] === 0) {
              colorArr[3] = 0.2; // TODO color is set to 0, 0, 0, 0. Should show correct RGBA

              color = stringify(colorArr, 'rgba');
            }

            var legendSymbolType = 'roundRect';

            var itemGroup = this._createItem(name, dataIndex, itemModel, legendModel, legendSymbolType, null, itemAlign, color, borderColor, decal, selectMode); // FIXME: consider different series has items with the same name.


            itemGroup.on('click', curry(dispatchSelectAction, null, name, api, excludeSeriesId)) // Should not specify the series name, consider legend controls
            // more than one pie series.
            .on('mouseover', curry(dispatchHighlightAction, null, name, api, excludeSeriesId)).on('mouseout', curry(dispatchDownplayAction, null, name, api, excludeSeriesId));
            legendDrawnMap.set(name, true);
          }
        }, this);
      }
    }, this);

    if (selector) {
      this._createSelector(selector, legendModel, api, orient, selectorPosition);
    }
  };

  LegendView.prototype._createSelector = function (selector, legendModel, api, orient, selectorPosition) {
    var selectorGroup = this.getSelectorGroup();
    each(selector, function createSelectorButton(selectorItem) {
      var type = selectorItem.type;
      var labelText = new ZRText({
        style: {
          x: 0,
          y: 0,
          align: 'center',
          verticalAlign: 'middle'
        },
        onclick: function () {
          api.dispatchAction({
            type: type === 'all' ? 'legendAllSelect' : 'legendInverseSelect'
          });
        }
      });
      selectorGroup.add(labelText);
      var labelModel = legendModel.getModel('selectorLabel');
      var emphasisLabelModel = legendModel.getModel(['emphasis', 'selectorLabel']);
      setLabelStyle(labelText, {
        normal: labelModel,
        emphasis: emphasisLabelModel
      }, {
        defaultText: selectorItem.title
      });
      enableHoverEmphasis(labelText);
    });
  };

  LegendView.prototype._createItem = function (name, dataIndex, itemModel, legendModel, legendSymbolType, symbolType, itemAlign, color, borderColor, decal, selectMode) {
    var itemWidth = legendModel.get('itemWidth');
    var itemHeight = legendModel.get('itemHeight');
    var inactiveColor = legendModel.get('inactiveColor');
    var inactiveBorderColor = legendModel.get('inactiveBorderColor');
    var symbolKeepAspect = legendModel.get('symbolKeepAspect');
    var legendModelItemStyle = legendModel.getModel('itemStyle');
    var isSelected = legendModel.isSelected(name);
    var itemGroup = new Group$1();
    var textStyleModel = itemModel.getModel('textStyle');
    var itemIcon = itemModel.get('icon');
    var tooltipModel = itemModel.getModel('tooltip');
    var legendGlobalTooltipModel = tooltipModel.parentModel; // Use user given icon first

    legendSymbolType = itemIcon || legendSymbolType;
    var legendSymbol = createSymbol(legendSymbolType, 0, 0, itemWidth, itemHeight, isSelected ? color : inactiveColor, // symbolKeepAspect default true for legend
    symbolKeepAspect == null ? true : symbolKeepAspect);
    itemGroup.add(setSymbolStyle(legendSymbol, legendSymbolType, legendModelItemStyle, borderColor, inactiveBorderColor, decal, isSelected)); // Compose symbols
    // PENDING

    if (!itemIcon && symbolType // At least show one symbol, can't be all none
    && (symbolType !== legendSymbolType || symbolType === 'none')) {
      var size = itemHeight * 0.8;

      if (symbolType === 'none') {
        symbolType = 'circle';
      }

      var legendSymbolCenter = createSymbol(symbolType, (itemWidth - size) / 2, (itemHeight - size) / 2, size, size, isSelected ? color : inactiveColor, // symbolKeepAspect default true for legend
      symbolKeepAspect == null ? true : symbolKeepAspect); // Put symbol in the center

      itemGroup.add(setSymbolStyle(legendSymbolCenter, symbolType, legendModelItemStyle, borderColor, inactiveBorderColor, decal, isSelected));
    }

    var textX = itemAlign === 'left' ? itemWidth + 5 : -5;
    var textAlign = itemAlign;
    var formatter = legendModel.get('formatter');
    var content = name;

    if (typeof formatter === 'string' && formatter) {
      content = formatter.replace('{name}', name != null ? name : '');
    } else if (typeof formatter === 'function') {
      content = formatter(name);
    }

    itemGroup.add(new ZRText({
      style: createTextStyle(textStyleModel, {
        text: content,
        x: textX,
        y: itemHeight / 2,
        fill: isSelected ? textStyleModel.getTextColor() : inactiveColor,
        align: textAlign,
        verticalAlign: 'middle'
      })
    })); // Add a invisible rect to increase the area of mouse hover

    var hitRect = new Rect$1({
      shape: itemGroup.getBoundingRect(),
      invisible: true
    });

    if (tooltipModel.get('show')) {
      var formatterParams = {
        componentType: 'legend',
        legendIndex: legendModel.componentIndex,
        name: name,
        $vars: ['name']
      };
      hitRect.tooltip = extend({
        content: name,
        // Defaul formatter
        formatter: legendGlobalTooltipModel.get('formatter', true) || function (params) {
          return params.name;
        },
        formatterParams: formatterParams
      }, tooltipModel.option);
    }

    itemGroup.add(hitRect);
    itemGroup.eachChild(function (child) {
      child.silent = true;
    });
    hitRect.silent = !selectMode;
    this.getContentGroup().add(itemGroup);
    enableHoverEmphasis(itemGroup); // @ts-ignore

    itemGroup.__legendDataIndex = dataIndex;
    return itemGroup;
  };

  LegendView.prototype.layoutInner = function (legendModel, itemAlign, maxSize, isFirstRender, selector, selectorPosition) {
    var contentGroup = this.getContentGroup();
    var selectorGroup = this.getSelectorGroup(); // Place items in contentGroup.

    box(legendModel.get('orient'), contentGroup, legendModel.get('itemGap'), maxSize.width, maxSize.height);
    var contentRect = contentGroup.getBoundingRect();
    var contentPos = [-contentRect.x, -contentRect.y];
    selectorGroup.markRedraw();
    contentGroup.markRedraw();

    if (selector) {
      // Place buttons in selectorGroup
      box( // Buttons in selectorGroup always layout horizontally
      'horizontal', selectorGroup, legendModel.get('selectorItemGap', true));
      var selectorRect = selectorGroup.getBoundingRect();
      var selectorPos = [-selectorRect.x, -selectorRect.y];
      var selectorButtonGap = legendModel.get('selectorButtonGap', true);
      var orientIdx = legendModel.getOrient().index;
      var wh = orientIdx === 0 ? 'width' : 'height';
      var hw = orientIdx === 0 ? 'height' : 'width';
      var yx = orientIdx === 0 ? 'y' : 'x';

      if (selectorPosition === 'end') {
        selectorPos[orientIdx] += contentRect[wh] + selectorButtonGap;
      } else {
        contentPos[orientIdx] += selectorRect[wh] + selectorButtonGap;
      } //Always align selector to content as 'middle'


      selectorPos[1 - orientIdx] += contentRect[hw] / 2 - selectorRect[hw] / 2;
      selectorGroup.x = selectorPos[0];
      selectorGroup.y = selectorPos[1];
      contentGroup.x = contentPos[0];
      contentGroup.y = contentPos[1];
      var mainRect = {
        x: 0,
        y: 0
      };
      mainRect[wh] = contentRect[wh] + selectorButtonGap + selectorRect[wh];
      mainRect[hw] = Math.max(contentRect[hw], selectorRect[hw]);
      mainRect[yx] = Math.min(0, selectorRect[yx] + selectorPos[1 - orientIdx]);
      return mainRect;
    } else {
      contentGroup.x = contentPos[0];
      contentGroup.y = contentPos[1];
      return this.group.getBoundingRect();
    }
  };
  /**
   * @protected
   */


  LegendView.prototype.remove = function () {
    this.getContentGroup().removeAll();
    this._isFirstRender = true;
  };

  LegendView.type = 'legend.plain';
  return LegendView;
}(ComponentView);

function setSymbolStyle(symbol, symbolType, legendModelItemStyle, borderColor, inactiveBorderColor, decal, isSelected) {
  var itemStyle;

  if (symbolType !== 'line' && symbolType.indexOf('empty') < 0) {
    itemStyle = legendModelItemStyle.getItemStyle();
    symbol.style.stroke = borderColor;
    symbol.style.decal = decal;

    if (!isSelected) {
      itemStyle.stroke = inactiveBorderColor;
    }
  } else {
    itemStyle = legendModelItemStyle.getItemStyle(['borderWidth', 'borderColor']);
  }

  symbol.setStyle(itemStyle);
  return symbol;
}

function dispatchSelectAction(seriesName, dataName, api, excludeSeriesId) {
  // downplay before unselect
  dispatchDownplayAction(seriesName, dataName, api, excludeSeriesId);
  api.dispatchAction({
    type: 'legendToggleSelect',
    name: seriesName != null ? seriesName : dataName
  }); // highlight after select
  // TODO higlight immediately may cause animation loss.

  dispatchHighlightAction(seriesName, dataName, api, excludeSeriesId);
}

function isUseHoverLayer(api) {
  var list = api.getZr().storage.getDisplayList();
  var emphasisState;
  var i = 0;
  var len = list.length;

  while (i < len && !(emphasisState = list[i].states.emphasis)) {
    i++;
  }

  return emphasisState && emphasisState.hoverLayer;
}

function dispatchHighlightAction(seriesName, dataName, api, excludeSeriesId) {
  // If element hover will move to a hoverLayer.
  if (!isUseHoverLayer(api)) {
    api.dispatchAction({
      type: 'highlight',
      seriesName: seriesName,
      name: dataName,
      excludeSeriesId: excludeSeriesId
    });
  }
}

function dispatchDownplayAction(seriesName, dataName, api, excludeSeriesId) {
  // If element hover will move to a hoverLayer.
  if (!isUseHoverLayer(api)) {
    api.dispatchAction({
      type: 'downplay',
      seriesName: seriesName,
      name: dataName,
      excludeSeriesId: excludeSeriesId
    });
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
function legendFilter(ecModel) {
  var legendModels = ecModel.findComponents({
    mainType: 'legend'
  });

  if (legendModels && legendModels.length) {
    ecModel.filterSeries(function (series) {
      // If in any legend component the status is not selected.
      // Because in legend series is assumed selected when it is not in the legend data.
      for (var i = 0; i < legendModels.length; i++) {
        if (!legendModels[i].isSelected(series.name)) {
          return false;
        }
      }

      return true;
    });
  }
}

function legendSelectActionHandler(methodName, payload, ecModel) {
  var selectedMap = {};
  var isToggleSelect = methodName === 'toggleSelected';
  var isSelected; // Update all legend components

  ecModel.eachComponent('legend', function (legendModel) {
    if (isToggleSelect && isSelected != null) {
      // Force other legend has same selected status
      // Or the first is toggled to true and other are toggled to false
      // In the case one legend has some item unSelected in option. And if other legend
      // doesn't has the item, they will assume it is selected.
      legendModel[isSelected ? 'select' : 'unSelect'](payload.name);
    } else if (methodName === 'allSelect' || methodName === 'inverseSelect') {
      legendModel[methodName]();
    } else {
      legendModel[methodName](payload.name);
      isSelected = legendModel.isSelected(payload.name);
    }

    var legendData = legendModel.getData();
    each$4(legendData, function (model) {
      var name = model.get('name'); // Wrap element

      if (name === '\n' || name === '') {
        return;
      }

      var isItemSelected = legendModel.isSelected(name);

      if (selectedMap.hasOwnProperty(name)) {
        // Unselected if any legend is unselected
        selectedMap[name] = selectedMap[name] && isItemSelected;
      } else {
        selectedMap[name] = isItemSelected;
      }
    });
  }); // Return the event explicitly

  return methodName === 'allSelect' || methodName === 'inverseSelect' ? {
    selected: selectedMap
  } : {
    name: payload.name,
    selected: selectedMap
  };
}

function installLegendAction(registers) {
  /**
   * @event legendToggleSelect
   * @type {Object}
   * @property {string} type 'legendToggleSelect'
   * @property {string} [from]
   * @property {string} name Series name or data item name
   */
  registers.registerAction('legendToggleSelect', 'legendselectchanged', curry$1(legendSelectActionHandler, 'toggleSelected'));
  registers.registerAction('legendAllSelect', 'legendselectall', curry$1(legendSelectActionHandler, 'allSelect'));
  registers.registerAction('legendInverseSelect', 'legendinverseselect', curry$1(legendSelectActionHandler, 'inverseSelect'));
  /**
   * @event legendSelect
   * @type {Object}
   * @property {string} type 'legendSelect'
   * @property {string} name Series name or data item name
   */

  registers.registerAction('legendSelect', 'legendselected', curry$1(legendSelectActionHandler, 'select'));
  /**
   * @event legendUnSelect
   * @type {Object}
   * @property {string} type 'legendUnSelect'
   * @property {string} name Series name or data item name
   */

  registers.registerAction('legendUnSelect', 'legendunselected', curry$1(legendSelectActionHandler, 'unSelect'));
}

function install$5(registers) {
  registers.registerComponentModel(LegendModel);
  registers.registerComponentView(LegendView);
  registers.registerProcessor(registers.PRIORITY.PROCESSOR.SERIES_FILTER, legendFilter);
  registers.registerSubTypeDefaulter('legend', function () {
    return 'plain';
  });
  installLegendAction(registers);
}

var ScrollableLegendModel =
/** @class */
function (_super) {
  __extends(ScrollableLegendModel, _super);

  function ScrollableLegendModel() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = ScrollableLegendModel.type;
    return _this;
  }
  /**
   * @param {number} scrollDataIndex
   */


  ScrollableLegendModel.prototype.setScrollDataIndex = function (scrollDataIndex) {
    this.option.scrollDataIndex = scrollDataIndex;
  };

  ScrollableLegendModel.prototype.init = function (option, parentModel, ecModel) {
    var inputPositionParams = getLayoutParams(option);

    _super.prototype.init.call(this, option, parentModel, ecModel);

    mergeAndNormalizeLayoutParams(this, option, inputPositionParams);
  };
  /**
   * @override
   */


  ScrollableLegendModel.prototype.mergeOption = function (option, ecModel) {
    _super.prototype.mergeOption.call(this, option, ecModel);

    mergeAndNormalizeLayoutParams(this, this.option, option);
  };

  ScrollableLegendModel.type = 'legend.scroll';
  ScrollableLegendModel.defaultOption = inheritDefaultOption(LegendModel.defaultOption, {
    scrollDataIndex: 0,
    pageButtonItemGap: 5,
    pageButtonGap: null,
    pageButtonPosition: 'end',
    pageFormatter: '{current}/{total}',
    pageIcons: {
      horizontal: ['M0,0L12,-10L12,10z', 'M0,0L-12,-10L-12,10z'],
      vertical: ['M0,0L20,0L10,-20z', 'M0,0L20,0L10,20z']
    },
    pageIconColor: '#2f4554',
    pageIconInactiveColor: '#aaa',
    pageIconSize: 15,
    pageTextStyle: {
      color: '#333'
    },
    animationDurationUpdate: 800
  });
  return ScrollableLegendModel;
}(LegendModel);

function mergeAndNormalizeLayoutParams(legendModel, target, raw) {
  var orient = legendModel.getOrient();
  var ignoreSize = [1, 1];
  ignoreSize[orient.index] = 0;
  mergeLayoutParam(target, raw, {
    type: 'box',
    ignoreSize: !!ignoreSize
  });
}

var Group = Group$2;
var WH = ['width', 'height'];
var XY = ['x', 'y'];

var ScrollableLegendView =
/** @class */
function (_super) {
  __extends(ScrollableLegendView, _super);

  function ScrollableLegendView() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = ScrollableLegendView.type;
    _this.newlineDisabled = true;
    _this._currentIndex = 0;
    return _this;
  }

  ScrollableLegendView.prototype.init = function () {
    _super.prototype.init.call(this);

    this.group.add(this._containerGroup = new Group());

    this._containerGroup.add(this.getContentGroup());

    this.group.add(this._controllerGroup = new Group());
  };
  /**
   * @override
   */


  ScrollableLegendView.prototype.resetInner = function () {
    _super.prototype.resetInner.call(this);

    this._controllerGroup.removeAll();

    this._containerGroup.removeClipPath();

    this._containerGroup.__rectSize = null;
  };
  /**
   * @override
   */


  ScrollableLegendView.prototype.renderInner = function (itemAlign, legendModel, ecModel, api, selector, orient, selectorPosition) {
    var self = this; // Render content items.

    _super.prototype.renderInner.call(this, itemAlign, legendModel, ecModel, api, selector, orient, selectorPosition);

    var controllerGroup = this._controllerGroup; // FIXME: support be 'auto' adapt to size number text length,
    // e.g., '3/12345' should not overlap with the control arrow button.

    var pageIconSize = legendModel.get('pageIconSize', true);
    var pageIconSizeArr = isArray(pageIconSize) ? pageIconSize : [pageIconSize, pageIconSize];
    createPageButton('pagePrev', 0);
    var pageTextStyleModel = legendModel.getModel('pageTextStyle');
    controllerGroup.add(new ZRText({
      name: 'pageText',
      style: {
        // Placeholder to calculate a proper layout.
        text: 'xx/xx',
        fill: pageTextStyleModel.getTextColor(),
        font: pageTextStyleModel.getFont(),
        verticalAlign: 'middle',
        align: 'center'
      },
      silent: true
    }));
    createPageButton('pageNext', 1);

    function createPageButton(name, iconIdx) {
      var pageDataIndexName = name + 'DataIndex';
      var icon = createIcon(legendModel.get('pageIcons', true)[legendModel.getOrient().name][iconIdx], {
        // Buttons will be created in each render, so we do not need
        // to worry about avoiding using legendModel kept in scope.
        onclick: bind$2(self._pageGo, self, pageDataIndexName, legendModel, api)
      }, {
        x: -pageIconSizeArr[0] / 2,
        y: -pageIconSizeArr[1] / 2,
        width: pageIconSizeArr[0],
        height: pageIconSizeArr[1]
      });
      icon.name = name;
      controllerGroup.add(icon);
    }
  };
  /**
   * @override
   */


  ScrollableLegendView.prototype.layoutInner = function (legendModel, itemAlign, maxSize, isFirstRender, selector, selectorPosition) {
    var selectorGroup = this.getSelectorGroup();
    var orientIdx = legendModel.getOrient().index;
    var wh = WH[orientIdx];
    var xy = XY[orientIdx];
    var hw = WH[1 - orientIdx];
    var yx = XY[1 - orientIdx];
    selector && box( // Buttons in selectorGroup always layout horizontally
    'horizontal', selectorGroup, legendModel.get('selectorItemGap', true));
    var selectorButtonGap = legendModel.get('selectorButtonGap', true);
    var selectorRect = selectorGroup.getBoundingRect();
    var selectorPos = [-selectorRect.x, -selectorRect.y];
    var processMaxSize = clone$1(maxSize);
    selector && (processMaxSize[wh] = maxSize[wh] - selectorRect[wh] - selectorButtonGap);

    var mainRect = this._layoutContentAndController(legendModel, isFirstRender, processMaxSize, orientIdx, wh, hw, yx, xy);

    if (selector) {
      if (selectorPosition === 'end') {
        selectorPos[orientIdx] += mainRect[wh] + selectorButtonGap;
      } else {
        var offset = selectorRect[wh] + selectorButtonGap;
        selectorPos[orientIdx] -= offset;
        mainRect[xy] -= offset;
      }

      mainRect[wh] += selectorRect[wh] + selectorButtonGap;
      selectorPos[1 - orientIdx] += mainRect[yx] + mainRect[hw] / 2 - selectorRect[hw] / 2;
      mainRect[hw] = Math.max(mainRect[hw], selectorRect[hw]);
      mainRect[yx] = Math.min(mainRect[yx], selectorRect[yx] + selectorPos[1 - orientIdx]);
      selectorGroup.x = selectorPos[0];
      selectorGroup.y = selectorPos[1];
      selectorGroup.markRedraw();
    }

    return mainRect;
  };

  ScrollableLegendView.prototype._layoutContentAndController = function (legendModel, isFirstRender, maxSize, orientIdx, wh, hw, yx, xy) {
    var contentGroup = this.getContentGroup();
    var containerGroup = this._containerGroup;
    var controllerGroup = this._controllerGroup; // Place items in contentGroup.

    box(legendModel.get('orient'), contentGroup, legendModel.get('itemGap'), !orientIdx ? null : maxSize.width, orientIdx ? null : maxSize.height);
    box( // Buttons in controller are layout always horizontally.
    'horizontal', controllerGroup, legendModel.get('pageButtonItemGap', true));
    var contentRect = contentGroup.getBoundingRect();
    var controllerRect = controllerGroup.getBoundingRect();
    var showController = this._showController = contentRect[wh] > maxSize[wh]; // In case that the inner elements of contentGroup layout do not based on [0, 0]

    var contentPos = [-contentRect.x, -contentRect.y]; // Remain contentPos when scroll animation perfroming.
    // If first rendering, `contentGroup.position` is [0, 0], which
    // does not make sense and may cause unexepcted animation if adopted.

    if (!isFirstRender) {
      contentPos[orientIdx] = contentGroup[xy];
    } // Layout container group based on 0.


    var containerPos = [0, 0];
    var controllerPos = [-controllerRect.x, -controllerRect.y];
    var pageButtonGap = retrieve2(legendModel.get('pageButtonGap', true), legendModel.get('itemGap', true)); // Place containerGroup and controllerGroup and contentGroup.

    if (showController) {
      var pageButtonPosition = legendModel.get('pageButtonPosition', true); // controller is on the right / bottom.

      if (pageButtonPosition === 'end') {
        controllerPos[orientIdx] += maxSize[wh] - controllerRect[wh];
      } // controller is on the left / top.
      else {
          containerPos[orientIdx] += controllerRect[wh] + pageButtonGap;
        }
    } // Always align controller to content as 'middle'.


    controllerPos[1 - orientIdx] += contentRect[hw] / 2 - controllerRect[hw] / 2;
    contentGroup.setPosition(contentPos);
    containerGroup.setPosition(containerPos);
    controllerGroup.setPosition(controllerPos); // Calculate `mainRect` and set `clipPath`.
    // mainRect should not be calculated by `this.group.getBoundingRect()`
    // for sake of the overflow.

    var mainRect = {
      x: 0,
      y: 0
    }; // Consider content may be overflow (should be clipped).

    mainRect[wh] = showController ? maxSize[wh] : contentRect[wh];
    mainRect[hw] = Math.max(contentRect[hw], controllerRect[hw]); // `containerRect[yx] + containerPos[1 - orientIdx]` is 0.

    mainRect[yx] = Math.min(0, controllerRect[yx] + controllerPos[1 - orientIdx]);
    containerGroup.__rectSize = maxSize[wh];

    if (showController) {
      var clipShape = {
        x: 0,
        y: 0
      };
      clipShape[wh] = Math.max(maxSize[wh] - controllerRect[wh] - pageButtonGap, 0);
      clipShape[hw] = mainRect[hw];
      containerGroup.setClipPath(new Rect$1({
        shape: clipShape
      })); // Consider content may be larger than container, container rect
      // can not be obtained from `containerGroup.getBoundingRect()`.

      containerGroup.__rectSize = clipShape[wh];
    } else {
      // Do not remove or ignore controller. Keep them set as placeholders.
      controllerGroup.eachChild(function (child) {
        child.attr({
          invisible: true,
          silent: true
        });
      });
    } // Content translate animation.


    var pageInfo = this._getPageInfo(legendModel);

    pageInfo.pageIndex != null && updateProps$1(contentGroup, {
      x: pageInfo.contentPosition[0],
      y: pageInfo.contentPosition[1]
    }, // When switch from "show controller" to "not show controller", view should be
    // updated immediately without animation, otherwise causes weird effect.
    showController ? legendModel : null);

    this._updatePageInfoView(legendModel, pageInfo);

    return mainRect;
  };

  ScrollableLegendView.prototype._pageGo = function (to, legendModel, api) {
    var scrollDataIndex = this._getPageInfo(legendModel)[to];

    scrollDataIndex != null && api.dispatchAction({
      type: 'legendScroll',
      scrollDataIndex: scrollDataIndex,
      legendId: legendModel.id
    });
  };

  ScrollableLegendView.prototype._updatePageInfoView = function (legendModel, pageInfo) {
    var controllerGroup = this._controllerGroup;
    each$4(['pagePrev', 'pageNext'], function (name) {
      var key = name + 'DataIndex';
      var canJump = pageInfo[key] != null;
      var icon = controllerGroup.childOfName(name);

      if (icon) {
        icon.setStyle('fill', canJump ? legendModel.get('pageIconColor', true) : legendModel.get('pageIconInactiveColor', true));
        icon.cursor = canJump ? 'pointer' : 'default';
      }
    });
    var pageText = controllerGroup.childOfName('pageText');
    var pageFormatter = legendModel.get('pageFormatter');
    var pageIndex = pageInfo.pageIndex;
    var current = pageIndex != null ? pageIndex + 1 : 0;
    var total = pageInfo.pageCount;
    pageText && pageFormatter && pageText.setStyle('text', isString(pageFormatter) ? pageFormatter.replace('{current}', current == null ? '' : current + '').replace('{total}', total == null ? '' : total + '') : pageFormatter({
      current: current,
      total: total
    }));
  };
  /**
   *  contentPosition: Array.<number>, null when data item not found.
   *  pageIndex: number, null when data item not found.
   *  pageCount: number, always be a number, can be 0.
   *  pagePrevDataIndex: number, null when no previous page.
   *  pageNextDataIndex: number, null when no next page.
   * }
   */


  ScrollableLegendView.prototype._getPageInfo = function (legendModel) {
    var scrollDataIndex = legendModel.get('scrollDataIndex', true);
    var contentGroup = this.getContentGroup();
    var containerRectSize = this._containerGroup.__rectSize;
    var orientIdx = legendModel.getOrient().index;
    var wh = WH[orientIdx];
    var xy = XY[orientIdx];

    var targetItemIndex = this._findTargetItemIndex(scrollDataIndex);

    var children = contentGroup.children();
    var targetItem = children[targetItemIndex];
    var itemCount = children.length;
    var pCount = !itemCount ? 0 : 1;
    var result = {
      contentPosition: [contentGroup.x, contentGroup.y],
      pageCount: pCount,
      pageIndex: pCount - 1,
      pagePrevDataIndex: null,
      pageNextDataIndex: null
    };

    if (!targetItem) {
      return result;
    }

    var targetItemInfo = getItemInfo(targetItem);
    result.contentPosition[orientIdx] = -targetItemInfo.s; // Strategy:
    // (1) Always align based on the left/top most item.
    // (2) It is user-friendly that the last item shown in the
    // current window is shown at the begining of next window.
    // Otherwise if half of the last item is cut by the window,
    // it will have no chance to display entirely.
    // (3) Consider that item size probably be different, we
    // have calculate pageIndex by size rather than item index,
    // and we can not get page index directly by division.
    // (4) The window is to narrow to contain more than
    // one item, we should make sure that the page can be fliped.

    for (var i = targetItemIndex + 1, winStartItemInfo = targetItemInfo, winEndItemInfo = targetItemInfo, currItemInfo = null; i <= itemCount; ++i) {
      currItemInfo = getItemInfo(children[i]);

      if ( // Half of the last item is out of the window.
      !currItemInfo && winEndItemInfo.e > winStartItemInfo.s + containerRectSize || // If the current item does not intersect with the window, the new page
      // can be started at the current item or the last item.
      currItemInfo && !intersect(currItemInfo, winStartItemInfo.s)) {
        if (winEndItemInfo.i > winStartItemInfo.i) {
          winStartItemInfo = winEndItemInfo;
        } else {
          // e.g., when page size is smaller than item size.
          winStartItemInfo = currItemInfo;
        }

        if (winStartItemInfo) {
          if (result.pageNextDataIndex == null) {
            result.pageNextDataIndex = winStartItemInfo.i;
          }

          ++result.pageCount;
        }
      }

      winEndItemInfo = currItemInfo;
    }

    for (var i = targetItemIndex - 1, winStartItemInfo = targetItemInfo, winEndItemInfo = targetItemInfo, currItemInfo = null; i >= -1; --i) {
      currItemInfo = getItemInfo(children[i]);

      if ( // If the the end item does not intersect with the window started
      // from the current item, a page can be settled.
      (!currItemInfo || !intersect(winEndItemInfo, currItemInfo.s)) && // e.g., when page size is smaller than item size.
      winStartItemInfo.i < winEndItemInfo.i) {
        winEndItemInfo = winStartItemInfo;

        if (result.pagePrevDataIndex == null) {
          result.pagePrevDataIndex = winStartItemInfo.i;
        }

        ++result.pageCount;
        ++result.pageIndex;
      }

      winStartItemInfo = currItemInfo;
    }

    return result;

    function getItemInfo(el) {
      if (el) {
        var itemRect = el.getBoundingRect();
        var start = itemRect[xy] + el[xy];
        return {
          s: start,
          e: start + itemRect[wh],
          i: el.__legendDataIndex
        };
      }
    }

    function intersect(itemInfo, winStart) {
      return itemInfo.e >= winStart && itemInfo.s <= winStart + containerRectSize;
    }
  };

  ScrollableLegendView.prototype._findTargetItemIndex = function (targetDataIndex) {
    if (!this._showController) {
      return 0;
    }

    var index;
    var contentGroup = this.getContentGroup();
    var defaultIndex;
    contentGroup.eachChild(function (child, idx) {
      var legendDataIdx = child.__legendDataIndex; // FIXME
      // If the given targetDataIndex (from model) is illegal,
      // we use defaultIndex. But the index on the legend model and
      // action payload is still illegal. That case will not be
      // changed until some scenario requires.

      if (defaultIndex == null && legendDataIdx != null) {
        defaultIndex = idx;
      }

      if (legendDataIdx === targetDataIndex) {
        index = idx;
      }
    });
    return index != null ? index : defaultIndex;
  };

  ScrollableLegendView.type = 'legend.scroll';
  return ScrollableLegendView;
}(LegendView);

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
function installScrollableLegendAction(registers) {
  /**
   * @event legendScroll
   * @type {Object}
   * @property {string} type 'legendScroll'
   * @property {string} scrollDataIndex
   */
  registers.registerAction('legendScroll', 'legendscroll', function (payload, ecModel) {
    var scrollDataIndex = payload.scrollDataIndex;
    scrollDataIndex != null && ecModel.eachComponent({
      mainType: 'legend',
      subType: 'scroll',
      query: payload
    }, function (legendModel) {
      legendModel.setScrollDataIndex(scrollDataIndex);
    });
  });
}

function install$4(registers) {
  use(install$5);
  registers.registerComponentModel(ScrollableLegendModel);
  registers.registerComponentView(ScrollableLegendView);
  installScrollableLegendAction(registers);
}

function install$3(registers) {
  use(install$5);
  use(install$4);
}

var InsideZoomModel =
/** @class */
function (_super) {
  __extends(InsideZoomModel, _super);

  function InsideZoomModel() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = InsideZoomModel.type;
    return _this;
  }

  InsideZoomModel.type = 'dataZoom.inside';
  InsideZoomModel.defaultOption = inheritDefaultOption(DataZoomModel.defaultOption, {
    disabled: false,
    zoomLock: false,
    zoomOnMouseWheel: true,
    moveOnMouseMove: true,
    moveOnMouseWheel: false,
    preventDefaultMouseMove: true
  });
  return InsideZoomModel;
}(DataZoomModel);

var inner = makeInner();
function setViewInfoToCoordSysRecord(api, dataZoomModel, getRange) {
  inner(api).coordSysRecordMap.each(function (coordSysRecord) {
    var dzInfo = coordSysRecord.dataZoomInfoMap.get(dataZoomModel.uid);

    if (dzInfo) {
      dzInfo.getRange = getRange;
    }
  });
}
function disposeCoordSysRecordIfNeeded(api, dataZoomModel) {
  var coordSysRecordMap = inner(api).coordSysRecordMap;
  var coordSysKeyArr = coordSysRecordMap.keys();

  for (var i = 0; i < coordSysKeyArr.length; i++) {
    var coordSysKey = coordSysKeyArr[i];
    var coordSysRecord = coordSysRecordMap.get(coordSysKey);
    var dataZoomInfoMap = coordSysRecord.dataZoomInfoMap;

    if (dataZoomInfoMap) {
      var dzUid = dataZoomModel.uid;
      var dzInfo = dataZoomInfoMap.get(dzUid);

      if (dzInfo) {
        dataZoomInfoMap.removeKey(dzUid);

        if (!dataZoomInfoMap.keys().length) {
          disposeCoordSysRecord(coordSysRecordMap, coordSysRecord);
        }
      }
    }
  }
}

function disposeCoordSysRecord(coordSysRecordMap, coordSysRecord) {
  if (coordSysRecord) {
    coordSysRecordMap.removeKey(coordSysRecord.model.uid);
    var controller = coordSysRecord.controller;
    controller && controller.dispose();
  }
}

function createCoordSysRecord(api, coordSysModel) {
  // These init props will never change after record created.
  var coordSysRecord = {
    model: coordSysModel,
    containsPoint: curry$1(containsPoint, coordSysModel),
    dispatchAction: curry$1(dispatchAction, api),
    dataZoomInfoMap: null,
    controller: null
  }; // Must not do anything depends on coordSysRecord outside the event handler here,
  // because coordSysRecord not completed yet.

  var controller = coordSysRecord.controller = new RoamController(api.getZr());
  each$4(['pan', 'zoom', 'scrollMove'], function (eventName) {
    controller.on(eventName, function (event) {
      var batch = [];
      coordSysRecord.dataZoomInfoMap.each(function (dzInfo) {
        // Check whether the behaviors (zoomOnMouseWheel, moveOnMouseMove,
        // moveOnMouseWheel, ...) enabled.
        if (!event.isAvailableBehavior(dzInfo.model.option)) {
          return;
        }

        var method = (dzInfo.getRange || {})[eventName];
        var range = method && method(dzInfo.dzReferCoordSysInfo, coordSysRecord.model.mainType, coordSysRecord.controller, event);
        !dzInfo.model.get('disabled', true) && range && batch.push({
          dataZoomId: dzInfo.model.id,
          start: range[0],
          end: range[1]
        });
      });
      batch.length && coordSysRecord.dispatchAction(batch);
    });
  });
  return coordSysRecord;
}
/**
 * This action will be throttled.
 */


function dispatchAction(api, batch) {
  api.dispatchAction({
    type: 'dataZoom',
    animation: {
      easing: 'cubicOut',
      duration: 100
    },
    batch: batch
  });
}

function containsPoint(coordSysModel, e, x, y) {
  return coordSysModel.coordinateSystem.containPoint([x, y]);
}
/**
 * Merge roamController settings when multiple dataZooms share one roamController.
 */


function mergeControllerParams(dataZoomInfoMap) {
  var controlType; // DO NOT use reserved word (true, false, undefined) as key literally. Even if encapsulated
  // as string, it is probably revert to reserved word by compress tool. See #7411.

  var prefix = 'type_';
  var typePriority = {
    'type_true': 2,
    'type_move': 1,
    'type_false': 0,
    'type_undefined': -1
  };
  var preventDefaultMouseMove = true;
  dataZoomInfoMap.each(function (dataZoomInfo) {
    var dataZoomModel = dataZoomInfo.model;
    var oneType = dataZoomModel.get('disabled', true) ? false : dataZoomModel.get('zoomLock', true) ? 'move' : true;

    if (typePriority[prefix + oneType] > typePriority[prefix + controlType]) {
      controlType = oneType;
    } // Prevent default move event by default. If one false, do not prevent. Otherwise
    // users may be confused why it does not work when multiple insideZooms exist.


    preventDefaultMouseMove = preventDefaultMouseMove && dataZoomModel.get('preventDefaultMouseMove', true);
  });
  return {
    controlType: controlType,
    opt: {
      // RoamController will enable all of these functionalities,
      // and the final behavior is determined by its event listener
      // provided by each inside zoom.
      zoomOnMouseWheel: true,
      moveOnMouseMove: true,
      moveOnMouseWheel: true,
      preventDefaultMouseMove: !!preventDefaultMouseMove
    }
  };
}

function installDataZoomRoamProcessor(registers) {
  registers.registerProcessor(registers.PRIORITY.PROCESSOR.FILTER, function (ecModel, api) {
    var apiInner = inner(api);
    var coordSysRecordMap = apiInner.coordSysRecordMap || (apiInner.coordSysRecordMap = createHashMap());
    coordSysRecordMap.each(function (coordSysRecord) {
      // `coordSysRecordMap` always exists (becuase it hold the `roam controller`, which should
      // better not re-create each time), but clear `dataZoomInfoMap` each round of the workflow.
      coordSysRecord.dataZoomInfoMap = null;
    });
    ecModel.eachComponent({
      mainType: 'dataZoom',
      subType: 'inside'
    }, function (dataZoomModel) {
      var dzReferCoordSysWrap = collectReferCoordSysModelInfo(dataZoomModel);
      each$4(dzReferCoordSysWrap.infoList, function (dzCoordSysInfo) {
        var coordSysUid = dzCoordSysInfo.model.uid;
        var coordSysRecord = coordSysRecordMap.get(coordSysUid) || coordSysRecordMap.set(coordSysUid, createCoordSysRecord(api, dzCoordSysInfo.model));
        var dataZoomInfoMap = coordSysRecord.dataZoomInfoMap || (coordSysRecord.dataZoomInfoMap = createHashMap()); // Notice these props might be changed each time for a single dataZoomModel.

        dataZoomInfoMap.set(dataZoomModel.uid, {
          dzReferCoordSysInfo: dzCoordSysInfo,
          model: dataZoomModel,
          getRange: null
        });
      });
    }); // (1) Merge dataZoom settings for each coord sys and set to the roam controller.
    // (2) Clear coord sys if not refered by any dataZoom.

    coordSysRecordMap.each(function (coordSysRecord) {
      var controller = coordSysRecord.controller;
      var firstDzInfo;
      var dataZoomInfoMap = coordSysRecord.dataZoomInfoMap;

      if (dataZoomInfoMap) {
        var firstDzKey = dataZoomInfoMap.keys()[0];

        if (firstDzKey != null) {
          firstDzInfo = dataZoomInfoMap.get(firstDzKey);
        }
      }

      if (!firstDzInfo) {
        disposeCoordSysRecord(coordSysRecordMap, coordSysRecord);
        return;
      }

      var controllerParams = mergeControllerParams(dataZoomInfoMap);
      controller.enable(controllerParams.controlType, controllerParams.opt);
      controller.setPointerChecker(coordSysRecord.containsPoint);
      createOrUpdate(coordSysRecord, 'dispatchAction', firstDzInfo.model.get('throttle', true), 'fixRate');
    });
  });
}

var InsideZoomView =
/** @class */
function (_super) {
  __extends(InsideZoomView, _super);

  function InsideZoomView() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = 'dataZoom.inside';
    return _this;
  }

  InsideZoomView.prototype.render = function (dataZoomModel, ecModel, api) {
    _super.prototype.render.apply(this, arguments);

    if (dataZoomModel.noTarget()) {
      this._clear();

      return;
    } // Hence the `throttle` util ensures to preserve command order,
    // here simply updating range all the time will not cause missing
    // any of the the roam change.


    this.range = dataZoomModel.getPercentRange(); // Reset controllers.

    setViewInfoToCoordSysRecord(api, dataZoomModel, {
      pan: bind$2(getRangeHandlers.pan, this),
      zoom: bind$2(getRangeHandlers.zoom, this),
      scrollMove: bind$2(getRangeHandlers.scrollMove, this)
    });
  };

  InsideZoomView.prototype.dispose = function () {
    this._clear();

    _super.prototype.dispose.apply(this, arguments);
  };

  InsideZoomView.prototype._clear = function () {
    disposeCoordSysRecordIfNeeded(this.api, this.dataZoomModel);
    this.range = null;
  };

  InsideZoomView.type = 'dataZoom.inside';
  return InsideZoomView;
}(DataZoomView);

var getRangeHandlers = {
  zoom: function (coordSysInfo, coordSysMainType, controller, e) {
    var lastRange = this.range;
    var range = lastRange.slice(); // Calculate transform by the first axis.

    var axisModel = coordSysInfo.axisModels[0];

    if (!axisModel) {
      return;
    }

    var directionInfo = getDirectionInfo[coordSysMainType](null, [e.originX, e.originY], axisModel, controller, coordSysInfo);
    var percentPoint = (directionInfo.signal > 0 ? directionInfo.pixelStart + directionInfo.pixelLength - directionInfo.pixel : directionInfo.pixel - directionInfo.pixelStart) / directionInfo.pixelLength * (range[1] - range[0]) + range[0];
    var scale = Math.max(1 / e.scale, 0);
    range[0] = (range[0] - percentPoint) * scale + percentPoint;
    range[1] = (range[1] - percentPoint) * scale + percentPoint; // Restrict range.

    var minMaxSpan = this.dataZoomModel.findRepresentativeAxisProxy().getMinMaxSpan();
    sliderMove(0, range, [0, 100], 0, minMaxSpan.minSpan, minMaxSpan.maxSpan);
    this.range = range;

    if (lastRange[0] !== range[0] || lastRange[1] !== range[1]) {
      return range;
    }
  },
  pan: makeMover(function (range, axisModel, coordSysInfo, coordSysMainType, controller, e) {
    var directionInfo = getDirectionInfo[coordSysMainType]([e.oldX, e.oldY], [e.newX, e.newY], axisModel, controller, coordSysInfo);
    return directionInfo.signal * (range[1] - range[0]) * directionInfo.pixel / directionInfo.pixelLength;
  }),
  scrollMove: makeMover(function (range, axisModel, coordSysInfo, coordSysMainType, controller, e) {
    var directionInfo = getDirectionInfo[coordSysMainType]([0, 0], [e.scrollDelta, e.scrollDelta], axisModel, controller, coordSysInfo);
    return directionInfo.signal * (range[1] - range[0]) * e.scrollDelta;
  })
};

function makeMover(getPercentDelta) {
  return function (coordSysInfo, coordSysMainType, controller, e) {
    var lastRange = this.range;
    var range = lastRange.slice(); // Calculate transform by the first axis.

    var axisModel = coordSysInfo.axisModels[0];

    if (!axisModel) {
      return;
    }

    var percentDelta = getPercentDelta(range, axisModel, coordSysInfo, coordSysMainType, controller, e);
    sliderMove(percentDelta, range, [0, 100], 'all');
    this.range = range;

    if (lastRange[0] !== range[0] || lastRange[1] !== range[1]) {
      return range;
    }
  };
}

var getDirectionInfo = {
  grid: function (oldPoint, newPoint, axisModel, controller, coordSysInfo) {
    var axis = axisModel.axis;
    var ret = {};
    var rect = coordSysInfo.model.coordinateSystem.getRect();
    oldPoint = oldPoint || [0, 0];

    if (axis.dim === 'x') {
      ret.pixel = newPoint[0] - oldPoint[0];
      ret.pixelLength = rect.width;
      ret.pixelStart = rect.x;
      ret.signal = axis.inverse ? 1 : -1;
    } else {
      // axis.dim === 'y'
      ret.pixel = newPoint[1] - oldPoint[1];
      ret.pixelLength = rect.height;
      ret.pixelStart = rect.y;
      ret.signal = axis.inverse ? -1 : 1;
    }

    return ret;
  },
  polar: function (oldPoint, newPoint, axisModel, controller, coordSysInfo) {
    var axis = axisModel.axis;
    var ret = {};
    var polar = coordSysInfo.model.coordinateSystem;
    var radiusExtent = polar.getRadiusAxis().getExtent();
    var angleExtent = polar.getAngleAxis().getExtent();
    oldPoint = oldPoint ? polar.pointToCoord(oldPoint) : [0, 0];
    newPoint = polar.pointToCoord(newPoint);

    if (axisModel.mainType === 'radiusAxis') {
      ret.pixel = newPoint[0] - oldPoint[0]; // ret.pixelLength = Math.abs(radiusExtent[1] - radiusExtent[0]);
      // ret.pixelStart = Math.min(radiusExtent[0], radiusExtent[1]);

      ret.pixelLength = radiusExtent[1] - radiusExtent[0];
      ret.pixelStart = radiusExtent[0];
      ret.signal = axis.inverse ? 1 : -1;
    } else {
      // 'angleAxis'
      ret.pixel = newPoint[1] - oldPoint[1]; // ret.pixelLength = Math.abs(angleExtent[1] - angleExtent[0]);
      // ret.pixelStart = Math.min(angleExtent[0], angleExtent[1]);

      ret.pixelLength = angleExtent[1] - angleExtent[0];
      ret.pixelStart = angleExtent[0];
      ret.signal = axis.inverse ? -1 : 1;
    }

    return ret;
  },
  singleAxis: function (oldPoint, newPoint, axisModel, controller, coordSysInfo) {
    var axis = axisModel.axis;
    var rect = coordSysInfo.model.coordinateSystem.getRect();
    var ret = {};
    oldPoint = oldPoint || [0, 0];

    if (axis.orient === 'horizontal') {
      ret.pixel = newPoint[0] - oldPoint[0];
      ret.pixelLength = rect.width;
      ret.pixelStart = rect.x;
      ret.signal = axis.inverse ? 1 : -1;
    } else {
      // 'vertical'
      ret.pixel = newPoint[1] - oldPoint[1];
      ret.pixelLength = rect.height;
      ret.pixelStart = rect.y;
      ret.signal = axis.inverse ? -1 : 1;
    }

    return ret;
  }
};

function install$2(registers) {
  installCommon(registers);
  registers.registerComponentModel(InsideZoomModel);
  registers.registerComponentView(InsideZoomView);
  installDataZoomRoamProcessor(registers);
}

var SliderZoomModel =
/** @class */
function (_super) {
  __extends(SliderZoomModel, _super);

  function SliderZoomModel() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = SliderZoomModel.type;
    return _this;
  }

  SliderZoomModel.type = 'dataZoom.slider';
  SliderZoomModel.layoutMode = 'box';
  SliderZoomModel.defaultOption = inheritDefaultOption(DataZoomModel.defaultOption, {
    show: true,
    // deault value can only be drived in view stage.
    right: 'ph',
    top: 'ph',
    width: 'ph',
    height: 'ph',
    left: null,
    bottom: null,
    borderColor: '#d2dbee',
    borderRadius: 3,
    backgroundColor: 'rgba(47,69,84,0)',
    // dataBackgroundColor: '#ddd',
    dataBackground: {
      lineStyle: {
        color: '#d2dbee',
        width: 0.5
      },
      areaStyle: {
        color: '#d2dbee',
        opacity: 0.2
      }
    },
    selectedDataBackground: {
      lineStyle: {
        color: '#8fb0f7',
        width: 0.5
      },
      areaStyle: {
        color: '#8fb0f7',
        opacity: 0.2
      }
    },
    // Color of selected window.
    fillerColor: 'rgba(135,175,274,0.2)',
    handleIcon: 'path://M-9.35,34.56V42m0-40V9.5m-2,0h4a2,2,0,0,1,2,2v21a2,2,0,0,1-2,2h-4a2,2,0,0,1-2-2v-21A2,2,0,0,1-11.35,9.5Z',
    // Percent of the slider height
    handleSize: '100%',
    handleStyle: {
      color: '#fff',
      borderColor: '#ACB8D1'
    },
    moveHandleSize: 7,
    moveHandleIcon: 'path://M-320.9-50L-320.9-50c18.1,0,27.1,9,27.1,27.1V85.7c0,18.1-9,27.1-27.1,27.1l0,0c-18.1,0-27.1-9-27.1-27.1V-22.9C-348-41-339-50-320.9-50z M-212.3-50L-212.3-50c18.1,0,27.1,9,27.1,27.1V85.7c0,18.1-9,27.1-27.1,27.1l0,0c-18.1,0-27.1-9-27.1-27.1V-22.9C-239.4-41-230.4-50-212.3-50z M-103.7-50L-103.7-50c18.1,0,27.1,9,27.1,27.1V85.7c0,18.1-9,27.1-27.1,27.1l0,0c-18.1,0-27.1-9-27.1-27.1V-22.9C-130.9-41-121.8-50-103.7-50z',
    moveHandleStyle: {
      color: '#D2DBEE',
      opacity: 0.7
    },
    showDetail: true,
    showDataShadow: 'auto',
    realtime: true,
    zoomLock: false,
    textStyle: {
      color: '#6E7079'
    },
    brushSelect: true,
    brushStyle: {
      color: 'rgba(135,175,274,0.15)'
    },
    emphasis: {
      handleStyle: {
        borderColor: '#8FB0F7'
      },
      moveHandleStyle: {
        color: '#8FB0F7'
      }
    }
  });
  return SliderZoomModel;
}(DataZoomModel);

var Rect = Rect$1; // Constants

var DEFAULT_LOCATION_EDGE_GAP = 7;
var DEFAULT_FRAME_BORDER_WIDTH = 1;
var DEFAULT_FILLER_SIZE = 30;
var DEFAULT_MOVE_HANDLE_SIZE = 7;
var HORIZONTAL = 'horizontal';
var VERTICAL = 'vertical';
var LABEL_GAP = 5;
var SHOW_DATA_SHADOW_SERIES_TYPE = ['line', 'bar', 'candlestick', 'scatter'];
var REALTIME_ANIMATION_CONFIG = {
  easing: 'cubicOut',
  duration: 100
};

var SliderZoomView =
/** @class */
function (_super) {
  __extends(SliderZoomView, _super);

  function SliderZoomView() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = SliderZoomView.type;
    _this._displayables = {};
    return _this;
  }

  SliderZoomView.prototype.init = function (ecModel, api) {
    this.api = api; // A unique handler for each dataZoom component

    this._onBrush = bind$2(this._onBrush, this);
    this._onBrushEnd = bind$2(this._onBrushEnd, this);
  };

  SliderZoomView.prototype.render = function (dataZoomModel, ecModel, api, payload) {
    _super.prototype.render.apply(this, arguments);

    createOrUpdate(this, '_dispatchZoomAction', dataZoomModel.get('throttle'), 'fixRate');
    this._orient = dataZoomModel.getOrient();

    if (dataZoomModel.get('show') === false) {
      this.group.removeAll();
      return;
    }

    if (dataZoomModel.noTarget()) {
      this._clear();

      this.group.removeAll();
      return;
    } // Notice: this._resetInterval() should not be executed when payload.type
    // is 'dataZoom', origin this._range should be maintained, otherwise 'pan'
    // or 'zoom' info will be missed because of 'throttle' of this.dispatchAction,


    if (!payload || payload.type !== 'dataZoom' || payload.from !== this.uid) {
      this._buildView();
    }

    this._updateView();
  };

  SliderZoomView.prototype.dispose = function () {
    this._clear();

    _super.prototype.dispose.apply(this, arguments);
  };

  SliderZoomView.prototype._clear = function () {
    clear(this, '_dispatchZoomAction');
    var zr = this.api.getZr();
    zr.off('mousemove', this._onBrush);
    zr.off('mouseup', this._onBrushEnd);
  };

  SliderZoomView.prototype._buildView = function () {
    var thisGroup = this.group;
    thisGroup.removeAll();
    this._brushing = false;
    this._displayables.brushRect = null;

    this._resetLocation();

    this._resetInterval();

    var barGroup = this._displayables.sliderGroup = new Group$2();

    this._renderBackground();

    this._renderHandle();

    this._renderDataShadow();

    thisGroup.add(barGroup);

    this._positionGroup();
  };

  SliderZoomView.prototype._resetLocation = function () {
    var dataZoomModel = this.dataZoomModel;
    var api = this.api;
    var showMoveHandle = dataZoomModel.get('brushSelect');
    var moveHandleSize = showMoveHandle ? DEFAULT_MOVE_HANDLE_SIZE : 0; // If some of x/y/width/height are not specified,
    // auto-adapt according to target grid.

    var coordRect = this._findCoordRect();

    var ecSize = {
      width: api.getWidth(),
      height: api.getHeight()
    }; // Default align by coordinate system rect.

    var positionInfo = this._orient === HORIZONTAL ? {
      // Why using 'right', because right should be used in vertical,
      // and it is better to be consistent for dealing with position param merge.
      right: ecSize.width - coordRect.x - coordRect.width,
      top: ecSize.height - DEFAULT_FILLER_SIZE - DEFAULT_LOCATION_EDGE_GAP - moveHandleSize,
      width: coordRect.width,
      height: DEFAULT_FILLER_SIZE
    } : {
      right: DEFAULT_LOCATION_EDGE_GAP,
      top: coordRect.y,
      width: DEFAULT_FILLER_SIZE,
      height: coordRect.height
    }; // Do not write back to option and replace value 'ph', because
    // the 'ph' value should be recalculated when resize.

    var layoutParams = getLayoutParams(dataZoomModel.option); // Replace the placeholder value.

    each$4(['right', 'top', 'width', 'height'], function (name) {
      if (layoutParams[name] === 'ph') {
        layoutParams[name] = positionInfo[name];
      }
    });
    var layoutRect = getLayoutRect(layoutParams, ecSize);
    this._location = {
      x: layoutRect.x,
      y: layoutRect.y
    };
    this._size = [layoutRect.width, layoutRect.height];
    this._orient === VERTICAL && this._size.reverse();
  };

  SliderZoomView.prototype._positionGroup = function () {
    var thisGroup = this.group;
    var location = this._location;
    var orient = this._orient; // Just use the first axis to determine mapping.

    var targetAxisModel = this.dataZoomModel.getFirstTargetAxisModel();
    var inverse = targetAxisModel && targetAxisModel.get('inverse');
    var sliderGroup = this._displayables.sliderGroup;
    var otherAxisInverse = (this._dataShadowInfo || {}).otherAxisInverse; // Transform barGroup.

    sliderGroup.attr(orient === HORIZONTAL && !inverse ? {
      scaleY: otherAxisInverse ? 1 : -1,
      scaleX: 1
    } : orient === HORIZONTAL && inverse ? {
      scaleY: otherAxisInverse ? 1 : -1,
      scaleX: -1
    } : orient === VERTICAL && !inverse ? {
      scaleY: otherAxisInverse ? -1 : 1,
      scaleX: 1,
      rotation: Math.PI / 2
    } // Dont use Math.PI, considering shadow direction.
    : {
      scaleY: otherAxisInverse ? -1 : 1,
      scaleX: -1,
      rotation: Math.PI / 2
    }); // Position barGroup

    var rect = thisGroup.getBoundingRect([sliderGroup]);
    thisGroup.x = location.x - rect.x;
    thisGroup.y = location.y - rect.y;
    thisGroup.markRedraw();
  };

  SliderZoomView.prototype._getViewExtent = function () {
    return [0, this._size[0]];
  };

  SliderZoomView.prototype._renderBackground = function () {
    var dataZoomModel = this.dataZoomModel;
    var size = this._size;
    var barGroup = this._displayables.sliderGroup;
    var brushSelect = dataZoomModel.get('brushSelect');
    barGroup.add(new Rect({
      silent: true,
      shape: {
        x: 0,
        y: 0,
        width: size[0],
        height: size[1]
      },
      style: {
        fill: dataZoomModel.get('backgroundColor')
      },
      z2: -40
    })); // Click panel, over shadow, below handles.

    var clickPanel = new Rect({
      shape: {
        x: 0,
        y: 0,
        width: size[0],
        height: size[1]
      },
      style: {
        fill: 'transparent'
      },
      z2: 0,
      onclick: bind$2(this._onClickPanel, this)
    });
    var zr = this.api.getZr();

    if (brushSelect) {
      clickPanel.on('mousedown', this._onBrushStart, this);
      clickPanel.cursor = 'crosshair';
      zr.on('mousemove', this._onBrush);
      zr.on('mouseup', this._onBrushEnd);
    } else {
      zr.off('mousemove', this._onBrush);
      zr.off('mouseup', this._onBrushEnd);
    }

    barGroup.add(clickPanel);
  };

  SliderZoomView.prototype._renderDataShadow = function () {
    var info = this._dataShadowInfo = this._prepareDataShadowInfo();

    this._displayables.dataShadowSegs = [];

    if (!info) {
      return;
    }

    var size = this._size;
    var seriesModel = info.series;
    var data = seriesModel.getRawData();
    var otherDim = seriesModel.getShadowDim ? seriesModel.getShadowDim() // @see candlestick
    : info.otherDim;

    if (otherDim == null) {
      return;
    }

    var otherDataExtent = data.getDataExtent(otherDim); // Nice extent.

    var otherOffset = (otherDataExtent[1] - otherDataExtent[0]) * 0.3;
    otherDataExtent = [otherDataExtent[0] - otherOffset, otherDataExtent[1] + otherOffset];
    var otherShadowExtent = [0, size[1]];
    var thisShadowExtent = [0, size[0]];
    var areaPoints = [[size[0], 0], [0, 0]];
    var linePoints = [];
    var step = thisShadowExtent[1] / (data.count() - 1);
    var thisCoord = 0; // Optimize for large data shadow

    var stride = Math.round(data.count() / size[0]);
    var lastIsEmpty;
    data.each([otherDim], function (value, index) {
      if (stride > 0 && index % stride) {
        thisCoord += step;
        return;
      } // FIXME
      // Should consider axis.min/axis.max when drawing dataShadow.
      // FIXME
      // 应该使用统一的空判断？还是在list里进行空判断？


      var isEmpty = value == null || isNaN(value) || value === ''; // See #4235.

      var otherCoord = isEmpty ? 0 : linearMap(value, otherDataExtent, otherShadowExtent, true); // Attempt to draw data shadow precisely when there are empty value.

      if (isEmpty && !lastIsEmpty && index) {
        areaPoints.push([areaPoints[areaPoints.length - 1][0], 0]);
        linePoints.push([linePoints[linePoints.length - 1][0], 0]);
      } else if (!isEmpty && lastIsEmpty) {
        areaPoints.push([thisCoord, 0]);
        linePoints.push([thisCoord, 0]);
      }

      areaPoints.push([thisCoord, otherCoord]);
      linePoints.push([thisCoord, otherCoord]);
      thisCoord += step;
      lastIsEmpty = isEmpty;
    });
    var dataZoomModel = this.dataZoomModel;

    function createDataShadowGroup(isSelectedArea) {
      var model = dataZoomModel.getModel(isSelectedArea ? 'selectedDataBackground' : 'dataBackground');
      var group = new Group$2();
      var polygon = new Polygon({
        shape: {
          points: areaPoints
        },
        segmentIgnoreThreshold: 1,
        style: model.getModel('areaStyle').getAreaStyle(),
        silent: true,
        z2: -20
      });
      var polyline = new Polyline({
        shape: {
          points: linePoints
        },
        segmentIgnoreThreshold: 1,
        style: model.getModel('lineStyle').getLineStyle(),
        silent: true,
        z2: -19
      });
      group.add(polygon);
      group.add(polyline);
      return group;
    } // let dataBackgroundModel = dataZoomModel.getModel('dataBackground');


    for (var i = 0; i < 3; i++) {
      var group = createDataShadowGroup(i === 1);

      this._displayables.sliderGroup.add(group);

      this._displayables.dataShadowSegs.push(group);
    }
  };

  SliderZoomView.prototype._prepareDataShadowInfo = function () {
    var dataZoomModel = this.dataZoomModel;
    var showDataShadow = dataZoomModel.get('showDataShadow');

    if (showDataShadow === false) {
      return;
    } // Find a representative series.


    var result;
    var ecModel = this.ecModel;
    dataZoomModel.eachTargetAxis(function (axisDim, axisIndex) {
      var seriesModels = dataZoomModel.getAxisProxy(axisDim, axisIndex).getTargetSeriesModels();
      each$4(seriesModels, function (seriesModel) {
        if (result) {
          return;
        }

        if (showDataShadow !== true && indexOf(SHOW_DATA_SHADOW_SERIES_TYPE, seriesModel.get('type')) < 0) {
          return;
        }

        var thisAxis = ecModel.getComponent(getAxisMainType(axisDim), axisIndex).axis;
        var otherDim = getOtherDim(axisDim);
        var otherAxisInverse;
        var coordSys = seriesModel.coordinateSystem;

        if (otherDim != null && coordSys.getOtherAxis) {
          otherAxisInverse = coordSys.getOtherAxis(thisAxis).inverse;
        }

        otherDim = seriesModel.getData().mapDimension(otherDim);
        result = {
          thisAxis: thisAxis,
          series: seriesModel,
          thisDim: axisDim,
          otherDim: otherDim,
          otherAxisInverse: otherAxisInverse
        };
      }, this);
    }, this);
    return result;
  };

  SliderZoomView.prototype._renderHandle = function () {
    var thisGroup = this.group;
    var displayables = this._displayables;
    var handles = displayables.handles = [null, null];
    var handleLabels = displayables.handleLabels = [null, null];
    var sliderGroup = this._displayables.sliderGroup;
    var size = this._size;
    var dataZoomModel = this.dataZoomModel;
    var api = this.api;
    var borderRadius = dataZoomModel.get('borderRadius') || 0;
    var brushSelect = dataZoomModel.get('brushSelect');
    var filler = displayables.filler = new Rect({
      silent: brushSelect,
      style: {
        fill: dataZoomModel.get('fillerColor')
      },
      textConfig: {
        position: 'inside'
      }
    });
    sliderGroup.add(filler); // Frame border.

    sliderGroup.add(new Rect({
      silent: true,
      subPixelOptimize: true,
      shape: {
        x: 0,
        y: 0,
        width: size[0],
        height: size[1],
        r: borderRadius
      },
      style: {
        stroke: dataZoomModel.get('dataBackgroundColor') // deprecated option
        || dataZoomModel.get('borderColor'),
        lineWidth: DEFAULT_FRAME_BORDER_WIDTH,
        fill: 'rgba(0,0,0,0)'
      }
    })); // Left and right handle to resize

    each$4([0, 1], function (handleIndex) {
      var iconStr = dataZoomModel.get('handleIcon');

      if (!symbolBuildProxies[iconStr] && iconStr.indexOf('path://') < 0 && iconStr.indexOf('image://') < 0) {
        // Compatitable with the old icon parsers. Which can use a path string without path://
        iconStr = 'path://' + iconStr;
      }

      var path = createSymbol(iconStr, -1, 0, 2, 2, null, true);
      path.attr({
        cursor: getCursor(this._orient),
        draggable: true,
        drift: bind$2(this._onDragMove, this, handleIndex),
        ondragend: bind$2(this._onDragEnd, this),
        onmouseover: bind$2(this._showDataInfo, this, true),
        onmouseout: bind$2(this._showDataInfo, this, false),
        z2: 5
      });
      var bRect = path.getBoundingRect();
      var handleSize = dataZoomModel.get('handleSize');
      this._handleHeight = parsePercent$1(handleSize, this._size[1]);
      this._handleWidth = bRect.width / bRect.height * this._handleHeight;
      path.setStyle(dataZoomModel.getModel('handleStyle').getItemStyle());
      path.style.strokeNoScale = true;
      path.rectHover = true;
      path.ensureState('emphasis').style = dataZoomModel.getModel(['emphasis', 'handleStyle']).getItemStyle();
      enableHoverEmphasis(path);
      var handleColor = dataZoomModel.get('handleColor'); // deprecated option
      // Compatitable with previous version

      if (handleColor != null) {
        path.style.fill = handleColor;
      }

      sliderGroup.add(handles[handleIndex] = path);
      var textStyleModel = dataZoomModel.getModel('textStyle');
      thisGroup.add(handleLabels[handleIndex] = new ZRText({
        silent: true,
        invisible: true,
        style: {
          x: 0,
          y: 0,
          text: '',
          verticalAlign: 'middle',
          align: 'center',
          fill: textStyleModel.getTextColor(),
          font: textStyleModel.getFont()
        },
        z2: 10
      }));
    }, this); // Handle to move. Only visible when brushSelect is set true.

    var actualMoveZone = filler;

    if (brushSelect) {
      var moveHandleHeight = parsePercent$1(dataZoomModel.get('moveHandleSize'), size[1]);
      var moveHandle_1 = displayables.moveHandle = new Rect$1({
        style: dataZoomModel.getModel('moveHandleStyle').getItemStyle(),
        silent: true,
        shape: {
          r: [0, 0, 2, 2],
          y: size[1] - 0.5,
          height: moveHandleHeight
        }
      });
      var iconSize = moveHandleHeight * 0.8;
      var moveHandleIcon = displayables.moveHandleIcon = createSymbol(dataZoomModel.get('moveHandleIcon'), -iconSize / 2, -iconSize / 2, iconSize, iconSize, '#fff', true);
      moveHandleIcon.silent = true;
      moveHandleIcon.y = size[1] + moveHandleHeight / 2 - 0.5;
      moveHandle_1.ensureState('emphasis').style = dataZoomModel.getModel(['emphasis', 'moveHandleStyle']).getItemStyle();
      var moveZoneExpandSize = Math.min(size[1] / 2, Math.max(moveHandleHeight, 10));
      actualMoveZone = displayables.moveZone = new Rect$1({
        invisible: true,
        shape: {
          y: size[1] - moveZoneExpandSize,
          height: moveHandleHeight + moveZoneExpandSize
        }
      });
      actualMoveZone.on('mouseover', function () {
        api.enterEmphasis(moveHandle_1);
      }).on('mouseout', function () {
        api.leaveEmphasis(moveHandle_1);
      });
      sliderGroup.add(moveHandle_1);
      sliderGroup.add(moveHandleIcon);
      sliderGroup.add(actualMoveZone);
    }

    actualMoveZone.attr({
      draggable: true,
      cursor: getCursor(this._orient),
      drift: bind$2(this._onDragMove, this, 'all'),
      ondragstart: bind$2(this._showDataInfo, this, true),
      ondragend: bind$2(this._onDragEnd, this),
      onmouseover: bind$2(this._showDataInfo, this, true),
      onmouseout: bind$2(this._showDataInfo, this, false)
    });
  };

  SliderZoomView.prototype._resetInterval = function () {
    var range = this._range = this.dataZoomModel.getPercentRange();

    var viewExtent = this._getViewExtent();

    this._handleEnds = [linearMap(range[0], [0, 100], viewExtent, true), linearMap(range[1], [0, 100], viewExtent, true)];
  };

  SliderZoomView.prototype._updateInterval = function (handleIndex, delta) {
    var dataZoomModel = this.dataZoomModel;
    var handleEnds = this._handleEnds;

    var viewExtend = this._getViewExtent();

    var minMaxSpan = dataZoomModel.findRepresentativeAxisProxy().getMinMaxSpan();
    var percentExtent = [0, 100];
    sliderMove(delta, handleEnds, viewExtend, dataZoomModel.get('zoomLock') ? 'all' : handleIndex, minMaxSpan.minSpan != null ? linearMap(minMaxSpan.minSpan, percentExtent, viewExtend, true) : null, minMaxSpan.maxSpan != null ? linearMap(minMaxSpan.maxSpan, percentExtent, viewExtend, true) : null);
    var lastRange = this._range;
    var range = this._range = asc$1([linearMap(handleEnds[0], viewExtend, percentExtent, true), linearMap(handleEnds[1], viewExtend, percentExtent, true)]);
    return !lastRange || lastRange[0] !== range[0] || lastRange[1] !== range[1];
  };

  SliderZoomView.prototype._updateView = function (nonRealtime) {
    var displaybles = this._displayables;
    var handleEnds = this._handleEnds;
    var handleInterval = asc$1(handleEnds.slice());
    var size = this._size;
    each$4([0, 1], function (handleIndex) {
      // Handles
      var handle = displaybles.handles[handleIndex];
      var handleHeight = this._handleHeight;
      handle.attr({
        scaleX: handleHeight / 2,
        scaleY: handleHeight / 2,
        // This is a trick, by adding an extra tiny offset to let the default handle's end point align to the drag window.
        // NOTE: It may affect some custom shapes a bit. But we prefer to have better result by default.
        x: handleEnds[handleIndex] + (handleIndex ? -1 : 1),
        y: size[1] / 2 - handleHeight / 2
      });
    }, this); // Filler

    displaybles.filler.setShape({
      x: handleInterval[0],
      y: 0,
      width: handleInterval[1] - handleInterval[0],
      height: size[1]
    });
    var viewExtent = {
      x: handleInterval[0],
      width: handleInterval[1] - handleInterval[0]
    }; // Move handle

    if (displaybles.moveHandle) {
      displaybles.moveHandle.setShape(viewExtent);
      displaybles.moveZone.setShape(viewExtent); // Force update path on the invisible object

      displaybles.moveZone.getBoundingRect();
      displaybles.moveHandleIcon && displaybles.moveHandleIcon.attr('x', viewExtent.x + viewExtent.width / 2);
    } // update clip path of shadow.


    var dataShadowSegs = displaybles.dataShadowSegs;
    var segIntervals = [0, handleInterval[0], handleInterval[1], size[0]];

    for (var i = 0; i < dataShadowSegs.length; i++) {
      var segGroup = dataShadowSegs[i];
      var clipPath = segGroup.getClipPath();

      if (!clipPath) {
        clipPath = new Rect$1();
        segGroup.setClipPath(clipPath);
      }

      clipPath.setShape({
        x: segIntervals[i],
        y: 0,
        width: segIntervals[i + 1] - segIntervals[i],
        height: size[1]
      });
    }

    this._updateDataInfo(nonRealtime);
  };

  SliderZoomView.prototype._updateDataInfo = function (nonRealtime) {
    var dataZoomModel = this.dataZoomModel;
    var displaybles = this._displayables;
    var handleLabels = displaybles.handleLabels;
    var orient = this._orient;
    var labelTexts = ['', '']; // FIXME
    // date型，支持formatter，autoformatter（ec2 date.getAutoFormatter）

    if (dataZoomModel.get('showDetail')) {
      var axisProxy = dataZoomModel.findRepresentativeAxisProxy();

      if (axisProxy) {
        var axis = axisProxy.getAxisModel().axis;
        var range = this._range;
        var dataInterval = nonRealtime // See #4434, data and axis are not processed and reset yet in non-realtime mode.
        ? axisProxy.calculateDataWindow({
          start: range[0],
          end: range[1]
        }).valueWindow : axisProxy.getDataValueWindow();
        labelTexts = [this._formatLabel(dataInterval[0], axis), this._formatLabel(dataInterval[1], axis)];
      }
    }

    var orderedHandleEnds = asc$1(this._handleEnds.slice());
    setLabel.call(this, 0);
    setLabel.call(this, 1);

    function setLabel(handleIndex) {
      // Label
      // Text should not transform by barGroup.
      // Ignore handlers transform
      var barTransform = getTransform(displaybles.handles[handleIndex].parent, this.group);
      var direction = transformDirection(handleIndex === 0 ? 'right' : 'left', barTransform);
      var offset = this._handleWidth / 2 + LABEL_GAP;
      var textPoint = applyTransform$1([orderedHandleEnds[handleIndex] + (handleIndex === 0 ? -offset : offset), this._size[1] / 2], barTransform);
      handleLabels[handleIndex].setStyle({
        x: textPoint[0],
        y: textPoint[1],
        verticalAlign: orient === HORIZONTAL ? 'middle' : direction,
        align: orient === HORIZONTAL ? direction : 'center',
        text: labelTexts[handleIndex]
      });
    }
  };

  SliderZoomView.prototype._formatLabel = function (value, axis) {
    var dataZoomModel = this.dataZoomModel;
    var labelFormatter = dataZoomModel.get('labelFormatter');
    var labelPrecision = dataZoomModel.get('labelPrecision');

    if (labelPrecision == null || labelPrecision === 'auto') {
      labelPrecision = axis.getPixelPrecision();
    }

    var valueStr = value == null || isNaN(value) ? '' // FIXME Glue code
    : axis.type === 'category' || axis.type === 'time' ? axis.scale.getLabel({
      value: Math.round(value)
    }) // param of toFixed should less then 20.
    : value.toFixed(Math.min(labelPrecision, 20));
    return isFunction(labelFormatter) ? labelFormatter(value, valueStr) : isString(labelFormatter) ? labelFormatter.replace('{value}', valueStr) : valueStr;
  };
  /**
   * @param showOrHide true: show, false: hide
   */


  SliderZoomView.prototype._showDataInfo = function (showOrHide) {
    // Always show when drgging.
    showOrHide = this._dragging || showOrHide;
    var displayables = this._displayables;
    var handleLabels = displayables.handleLabels;
    handleLabels[0].attr('invisible', !showOrHide);
    handleLabels[1].attr('invisible', !showOrHide); // Highlight move handle

    displayables.moveHandle && this.api[showOrHide ? 'enterEmphasis' : 'leaveEmphasis'](displayables.moveHandle, 1);
  };

  SliderZoomView.prototype._onDragMove = function (handleIndex, dx, dy, event) {
    this._dragging = true; // For mobile device, prevent screen slider on the button.

    stop(event.event); // Transform dx, dy to bar coordination.

    var barTransform = this._displayables.sliderGroup.getLocalTransform();

    var vertex = applyTransform$1([dx, dy], barTransform, true);

    var changed = this._updateInterval(handleIndex, vertex[0]);

    var realtime = this.dataZoomModel.get('realtime');

    this._updateView(!realtime); // Avoid dispatch dataZoom repeatly but range not changed,
    // which cause bad visual effect when progressive enabled.


    changed && realtime && this._dispatchZoomAction(true);
  };

  SliderZoomView.prototype._onDragEnd = function () {
    this._dragging = false;

    this._showDataInfo(false); // While in realtime mode and stream mode, dispatch action when
    // drag end will cause the whole view rerender, which is unnecessary.


    var realtime = this.dataZoomModel.get('realtime');
    !realtime && this._dispatchZoomAction(false);
  };

  SliderZoomView.prototype._onClickPanel = function (e) {
    var size = this._size;

    var localPoint = this._displayables.sliderGroup.transformCoordToLocal(e.offsetX, e.offsetY);

    if (localPoint[0] < 0 || localPoint[0] > size[0] || localPoint[1] < 0 || localPoint[1] > size[1]) {
      return;
    }

    var handleEnds = this._handleEnds;
    var center = (handleEnds[0] + handleEnds[1]) / 2;

    var changed = this._updateInterval('all', localPoint[0] - center);

    this._updateView();

    changed && this._dispatchZoomAction(false);
  };

  SliderZoomView.prototype._onBrushStart = function (e) {
    var x = e.offsetX;
    var y = e.offsetY;
    this._brushStart = new Point(x, y);
    this._brushing = true;
    this._brushStartTime = +new Date(); // this._updateBrushRect(x, y);
  };

  SliderZoomView.prototype._onBrushEnd = function (e) {
    if (!this._brushing) {
      return;
    }

    var brushRect = this._displayables.brushRect;
    this._brushing = false;

    if (!brushRect) {
      return;
    }

    brushRect.attr('ignore', true);
    var brushShape = brushRect.shape;
    var brushEndTime = +new Date(); // console.log(brushEndTime - this._brushStartTime);

    if (brushEndTime - this._brushStartTime < 200 && Math.abs(brushShape.width) < 5) {
      // Will treat it as a click
      return;
    }

    var viewExtend = this._getViewExtent();

    var percentExtent = [0, 100];
    this._range = asc$1([linearMap(brushShape.x, viewExtend, percentExtent, true), linearMap(brushShape.x + brushShape.width, viewExtend, percentExtent, true)]);
    this._handleEnds = [brushShape.x, brushShape.x + brushShape.width];

    this._updateView();

    this._dispatchZoomAction(false);
  };

  SliderZoomView.prototype._onBrush = function (e) {
    if (this._brushing) {
      // For mobile device, prevent screen slider on the button.
      stop(e.event);

      this._updateBrushRect(e.offsetX, e.offsetY);
    }
  };

  SliderZoomView.prototype._updateBrushRect = function (mouseX, mouseY) {
    var displayables = this._displayables;
    var dataZoomModel = this.dataZoomModel;
    var brushRect = displayables.brushRect;

    if (!brushRect) {
      brushRect = displayables.brushRect = new Rect({
        silent: true,
        style: dataZoomModel.getModel('brushStyle').getItemStyle()
      });
      displayables.sliderGroup.add(brushRect);
    }

    brushRect.attr('ignore', false);
    var brushStart = this._brushStart;
    var sliderGroup = this._displayables.sliderGroup;
    var endPoint = sliderGroup.transformCoordToLocal(mouseX, mouseY);
    var startPoint = sliderGroup.transformCoordToLocal(brushStart.x, brushStart.y);
    var size = this._size;
    endPoint[0] = Math.max(Math.min(size[0], endPoint[0]), 0);
    brushRect.setShape({
      x: startPoint[0],
      y: 0,
      width: endPoint[0] - startPoint[0],
      height: size[1]
    });
  };
  /**
   * This action will be throttled.
   */


  SliderZoomView.prototype._dispatchZoomAction = function (realtime) {
    var range = this._range;
    this.api.dispatchAction({
      type: 'dataZoom',
      from: this.uid,
      dataZoomId: this.dataZoomModel.id,
      animation: realtime ? REALTIME_ANIMATION_CONFIG : null,
      start: range[0],
      end: range[1]
    });
  };

  SliderZoomView.prototype._findCoordRect = function () {
    // Find the grid coresponding to the first axis referred by dataZoom.
    var rect;
    var coordSysInfoList = collectReferCoordSysModelInfo(this.dataZoomModel).infoList;

    if (!rect && coordSysInfoList.length) {
      var coordSys = coordSysInfoList[0].model.coordinateSystem;
      rect = coordSys.getRect && coordSys.getRect();
    }

    if (!rect) {
      var width = this.api.getWidth();
      var height = this.api.getHeight();
      rect = {
        x: width * 0.2,
        y: height * 0.2,
        width: width * 0.6,
        height: height * 0.6
      };
    }

    return rect;
  };

  SliderZoomView.type = 'dataZoom.slider';
  return SliderZoomView;
}(DataZoomView);

function getOtherDim(thisDim) {
  // FIXME
  // 这个逻辑和getOtherAxis里一致，但是写在这里是否不好
  var map = {
    x: 'y',
    y: 'x',
    radius: 'angle',
    angle: 'radius'
  };
  return map[thisDim];
}

function getCursor(orient) {
  return orient === 'vertical' ? 'ns-resize' : 'ew-resize';
}

function install$1(registers) {
  registers.registerComponentModel(SliderZoomModel);
  registers.registerComponentView(SliderZoomView);
  installCommon(registers);
}

function install(registers) {
  use(install$2);
  use(install$1); // Do not install './dataZoomSelect',
  // since it only work for toolbox dataZoom.
}

export { install as DataZoomComponent, install$8 as GridComponent, install$3 as LegendComponent, install$6 as TitleComponent, install$7 as TooltipComponent };
