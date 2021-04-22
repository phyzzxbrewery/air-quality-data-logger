import { _ as __extends, i as isArray, Z as ZRImage, e as extend, a as isObject, m as map, c as cubicRootAt, P as Path, b as PathProxy, d as cubicAt, f as defaults, g as each } from '../common/IncrementalDisplayable-eed1c2a2.js';
import { c as createListFromArray } from '../common/createListFromArray-18498de1.js';
import { S as SeriesModel, r as retrieveRawValue, c as createSymbol, e as enterEmphasis, l as leaveEmphasis, u as updateProps, i as initProps, g as getLabelStatesModels, p as parsePercent, s as setLabelStyle, a as enableHoverEmphasis, b as getECData, d as removeElement, G as Group, f as isDimensionStacked, R as Rect, h as round, j as Sector, k as convertToColorString, m as setStatesStylesFromModel, q as queryDataIndex, C as ChartView, n as setStatesFlag, Z as ZRText, o as interpolateRawValues, t as labelInner, L as LinearGradient, v as createRenderPlanner } from '../common/Chart-15166683.js';

var LineSeriesModel =
/** @class */
function (_super) {
  __extends(LineSeriesModel, _super);

  function LineSeriesModel() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = LineSeriesModel.type;
    _this.hasSymbolVisual = true;
    _this.legendSymbol = 'line';
    return _this;
  }

  LineSeriesModel.prototype.getInitialData = function (option) {

    return createListFromArray(this.getSource(), this, {
      useEncodeDefaulter: true
    });
  };

  LineSeriesModel.type = 'series.line';
  LineSeriesModel.dependencies = ['grid', 'polar'];
  LineSeriesModel.defaultOption = {
    zlevel: 0,
    z: 3,
    coordinateSystem: 'cartesian2d',
    legendHoverLink: true,
    clip: true,
    label: {
      position: 'top'
    },
    endLabel: {
      show: false,
      valueAnimation: true,
      distance: 8
    },
    lineStyle: {
      width: 2,
      type: 'solid'
    },
    emphasis: {
      scale: true,
      lineStyle: {
        width: 'bolder'
      }
    },
    // areaStyle: {
    // origin of areaStyle. Valid values:
    // `'auto'/null/undefined`: from axisLine to data
    // `'start'`: from min to data
    // `'end'`: from data to max
    // origin: 'auto'
    // },
    // false, 'start', 'end', 'middle'
    step: false,
    // Disabled if step is true
    smooth: false,
    smoothMonotone: null,
    symbol: 'emptyCircle',
    symbolSize: 4,
    symbolRotate: null,
    showSymbol: true,
    // `false`: follow the label interval strategy.
    // `true`: show all symbols.
    // `'auto'`: If possible, show all symbols, otherwise
    //           follow the label interval strategy.
    showAllSymbol: 'auto',
    // Whether to connect break point.
    connectNulls: false,
    // Sampling for large data. Can be: 'average', 'max', 'min', 'sum', 'lttb'.
    sampling: 'none',
    animationEasing: 'linear',
    // Disable progressive
    progressive: 0,
    hoverLayerThreshold: Infinity
  };
  return LineSeriesModel;
}(SeriesModel);

/**
 * @return label string. Not null/undefined
 */

function getDefaultLabel(data, dataIndex) {
  var labelDims = data.mapDimensionsAll('defaultedLabel');
  var len = labelDims.length; // Simple optimization (in lots of cases, label dims length is 1)

  if (len === 1) {
    var rawVal = retrieveRawValue(data, dataIndex, labelDims[0]);
    return rawVal != null ? rawVal + '' : null;
  } else if (len) {
    var vals = [];

    for (var i = 0; i < labelDims.length; i++) {
      vals.push(retrieveRawValue(data, dataIndex, labelDims[i]));
    }

    return vals.join(' ');
  }
}
function getDefaultInterpolatedLabel(data, interpolatedValue) {
  var labelDims = data.mapDimensionsAll('defaultedLabel');

  if (!isArray(interpolatedValue)) {
    return interpolatedValue + '';
  }

  var vals = [];

  for (var i = 0; i < labelDims.length; i++) {
    var dimInfo = data.getDimensionInfo(labelDims[i]);

    if (dimInfo) {
      vals.push(interpolatedValue[dimInfo.index]);
    }
  }

  return vals.join(' ');
}

var Symbol =
/** @class */
function (_super) {
  __extends(Symbol, _super);

  function Symbol(data, idx, seriesScope, opts) {
    var _this = _super.call(this) || this;

    _this.updateData(data, idx, seriesScope, opts);

    return _this;
  }

  Symbol.prototype._createSymbol = function (symbolType, data, idx, symbolSize, keepAspect) {
    // Remove paths created before
    this.removeAll(); // let symbolPath = createSymbol(
    //     symbolType, -0.5, -0.5, 1, 1, color
    // );
    // If width/height are set too small (e.g., set to 1) on ios10
    // and macOS Sierra, a circle stroke become a rect, no matter what
    // the scale is set. So we set width/height as 2. See #4150.

    var symbolPath = createSymbol(symbolType, -1, -1, 2, 2, null, keepAspect);
    symbolPath.attr({
      z2: 100,
      culling: true,
      scaleX: symbolSize[0] / 2,
      scaleY: symbolSize[1] / 2
    }); // Rewrite drift method

    symbolPath.drift = driftSymbol;
    this._symbolType = symbolType;
    this.add(symbolPath);
  };
  /**
   * Stop animation
   * @param {boolean} toLastFrame
   */


  Symbol.prototype.stopSymbolAnimation = function (toLastFrame) {
    this.childAt(0).stopAnimation(null, toLastFrame);
  };
  /**
   * FIXME:
   * Caution: This method breaks the encapsulation of this module,
   * but it indeed brings convenience. So do not use the method
   * unless you detailedly know all the implements of `Symbol`,
   * especially animation.
   *
   * Get symbol path element.
   */


  Symbol.prototype.getSymbolPath = function () {
    return this.childAt(0);
  };
  /**
   * Highlight symbol
   */


  Symbol.prototype.highlight = function () {
    enterEmphasis(this.childAt(0));
  };
  /**
   * Downplay symbol
   */


  Symbol.prototype.downplay = function () {
    leaveEmphasis(this.childAt(0));
  };
  /**
   * @param {number} zlevel
   * @param {number} z
   */


  Symbol.prototype.setZ = function (zlevel, z) {
    var symbolPath = this.childAt(0);
    symbolPath.zlevel = zlevel;
    symbolPath.z = z;
  };

  Symbol.prototype.setDraggable = function (draggable) {
    var symbolPath = this.childAt(0);
    symbolPath.draggable = draggable;
    symbolPath.cursor = draggable ? 'move' : symbolPath.cursor;
  };
  /**
   * Update symbol properties
   */


  Symbol.prototype.updateData = function (data, idx, seriesScope, opts) {
    this.silent = false;
    var symbolType = data.getItemVisual(idx, 'symbol') || 'circle';
    var seriesModel = data.hostModel;
    var symbolSize = Symbol.getSymbolSize(data, idx);
    var isInit = symbolType !== this._symbolType;
    var disableAnimation = opts && opts.disableAnimation;

    if (isInit) {
      var keepAspect = data.getItemVisual(idx, 'symbolKeepAspect');

      this._createSymbol(symbolType, data, idx, symbolSize, keepAspect);
    } else {
      var symbolPath = this.childAt(0);
      symbolPath.silent = false;
      var target = {
        scaleX: symbolSize[0] / 2,
        scaleY: symbolSize[1] / 2
      };
      disableAnimation ? symbolPath.attr(target) : updateProps(symbolPath, target, seriesModel, idx);
    }

    this._updateCommon(data, idx, symbolSize, seriesScope, opts);

    if (isInit) {
      var symbolPath = this.childAt(0);

      if (!disableAnimation) {
        var target = {
          scaleX: this._sizeX,
          scaleY: this._sizeY,
          style: {
            // Always fadeIn. Because it has fadeOut animation when symbol is removed..
            opacity: symbolPath.style.opacity
          }
        };
        symbolPath.scaleX = symbolPath.scaleY = 0;
        symbolPath.style.opacity = 0;
        initProps(symbolPath, target, seriesModel, idx);
      }
    }

    if (disableAnimation) {
      // Must stop remove animation manually if don't call initProps or updateProps.
      this.childAt(0).stopAnimation('remove');
    }

    this._seriesModel = seriesModel;
  };

  Symbol.prototype._updateCommon = function (data, idx, symbolSize, seriesScope, opts) {
    var symbolPath = this.childAt(0);
    var seriesModel = data.hostModel;
    var emphasisItemStyle;
    var blurItemStyle;
    var selectItemStyle;
    var focus;
    var blurScope;
    var symbolOffset;
    var labelStatesModels;
    var hoverScale;
    var cursorStyle;

    if (seriesScope) {
      emphasisItemStyle = seriesScope.emphasisItemStyle;
      blurItemStyle = seriesScope.blurItemStyle;
      selectItemStyle = seriesScope.selectItemStyle;
      focus = seriesScope.focus;
      blurScope = seriesScope.blurScope;
      symbolOffset = seriesScope.symbolOffset;
      labelStatesModels = seriesScope.labelStatesModels;
      hoverScale = seriesScope.hoverScale;
      cursorStyle = seriesScope.cursorStyle;
    }

    if (!seriesScope || data.hasItemOption) {
      var itemModel = seriesScope && seriesScope.itemModel ? seriesScope.itemModel : data.getItemModel(idx);
      var emphasisModel = itemModel.getModel('emphasis');
      emphasisItemStyle = emphasisModel.getModel('itemStyle').getItemStyle();
      selectItemStyle = itemModel.getModel(['select', 'itemStyle']).getItemStyle();
      blurItemStyle = itemModel.getModel(['blur', 'itemStyle']).getItemStyle();
      focus = emphasisModel.get('focus');
      blurScope = emphasisModel.get('blurScope');
      symbolOffset = itemModel.getShallow('symbolOffset');
      labelStatesModels = getLabelStatesModels(itemModel);
      hoverScale = emphasisModel.getShallow('scale');
      cursorStyle = itemModel.getShallow('cursor');
    }

    var symbolRotate = data.getItemVisual(idx, 'symbolRotate');
    symbolPath.attr('rotation', (symbolRotate || 0) * Math.PI / 180 || 0);

    if (symbolOffset) {
      symbolPath.x = parsePercent(symbolOffset[0], symbolSize[0]);
      symbolPath.y = parsePercent(symbolOffset[1], symbolSize[1]);
    }

    cursorStyle && symbolPath.attr('cursor', cursorStyle);
    var symbolStyle = data.getItemVisual(idx, 'style');
    var visualColor = symbolStyle.fill;

    if (symbolPath instanceof ZRImage) {
      var pathStyle = symbolPath.style;
      symbolPath.useStyle(extend({
        // TODO other properties like x, y ?
        image: pathStyle.image,
        x: pathStyle.x,
        y: pathStyle.y,
        width: pathStyle.width,
        height: pathStyle.height
      }, symbolStyle));
    } else {
      if (symbolPath.__isEmptyBrush) {
        // fill and stroke will be swapped if it's empty.
        // So we cloned a new style to avoid it affecting the original style in visual storage.
        // TODO Better implementation. No empty logic!
        symbolPath.useStyle(extend({}, symbolStyle));
      } else {
        symbolPath.useStyle(symbolStyle);
      } // Disable decal because symbol scale will been applied on the decal.


      symbolPath.style.decal = null;
      symbolPath.setColor(visualColor, opts && opts.symbolInnerColor);
      symbolPath.style.strokeNoScale = true;
    }

    var liftZ = data.getItemVisual(idx, 'liftZ');
    var z2Origin = this._z2;

    if (liftZ != null) {
      if (z2Origin == null) {
        this._z2 = symbolPath.z2;
        symbolPath.z2 += liftZ;
      }
    } else if (z2Origin != null) {
      symbolPath.z2 = z2Origin;
      this._z2 = null;
    }

    var useNameLabel = opts && opts.useNameLabel;
    setLabelStyle(symbolPath, labelStatesModels, {
      labelFetcher: seriesModel,
      labelDataIndex: idx,
      defaultText: getLabelDefaultText,
      inheritColor: visualColor,
      defaultOpacity: symbolStyle.opacity
    }); // Do not execute util needed.

    function getLabelDefaultText(idx) {
      return useNameLabel ? data.getName(idx) : getDefaultLabel(data, idx);
    }

    this._sizeX = symbolSize[0] / 2;
    this._sizeY = symbolSize[1] / 2;
    var emphasisState = symbolPath.ensureState('emphasis');
    emphasisState.style = emphasisItemStyle;
    symbolPath.ensureState('select').style = selectItemStyle;
    symbolPath.ensureState('blur').style = blurItemStyle;

    if (hoverScale) {
      var scaleRatio = Math.max(1.1, 3 / this._sizeY);
      emphasisState.scaleX = this._sizeX * scaleRatio;
      emphasisState.scaleY = this._sizeY * scaleRatio;
    }

    this.setSymbolScale(1);
    enableHoverEmphasis(this, focus, blurScope);
  };

  Symbol.prototype.setSymbolScale = function (scale) {
    this.scaleX = this.scaleY = scale;
  };

  Symbol.prototype.fadeOut = function (cb, opt) {
    var symbolPath = this.childAt(0);
    var seriesModel = this._seriesModel;
    var dataIndex = getECData(this).dataIndex;
    var animationOpt = opt && opt.animation; // Avoid mistaken hover when fading out

    this.silent = symbolPath.silent = true; // Not show text when animating

    if (opt && opt.fadeLabel) {
      var textContent = symbolPath.getTextContent();

      if (textContent) {
        removeElement(textContent, {
          style: {
            opacity: 0
          }
        }, seriesModel, {
          dataIndex: dataIndex,
          removeOpt: animationOpt,
          cb: function () {
            symbolPath.removeTextContent();
          }
        });
      }
    } else {
      symbolPath.removeTextContent();
    }

    removeElement(symbolPath, {
      style: {
        opacity: 0
      },
      scaleX: 0,
      scaleY: 0
    }, seriesModel, {
      dataIndex: dataIndex,
      cb: cb,
      removeOpt: animationOpt
    });
  };

  Symbol.getSymbolSize = function (data, idx) {
    var symbolSize = data.getItemVisual(idx, 'symbolSize');
    return symbolSize instanceof Array ? symbolSize.slice() : [+symbolSize, +symbolSize];
  };

  return Symbol;
}(Group);

function driftSymbol(dx, dy) {
  this.parent.drift(dx, dy);
}

function symbolNeedsDraw(data, point, idx, opt) {
  return point && !isNaN(point[0]) && !isNaN(point[1]) && !(opt.isIgnore && opt.isIgnore(idx)) // We do not set clipShape on group, because it will cut part of
  // the symbol element shape. We use the same clip shape here as
  // the line clip.
  && !(opt.clipShape && !opt.clipShape.contain(point[0], point[1])) && data.getItemVisual(idx, 'symbol') !== 'none';
}

function normalizeUpdateOpt(opt) {
  if (opt != null && !isObject(opt)) {
    opt = {
      isIgnore: opt
    };
  }

  return opt || {};
}

function makeSeriesScope(data) {
  var seriesModel = data.hostModel;
  var emphasisModel = seriesModel.getModel('emphasis');
  return {
    emphasisItemStyle: emphasisModel.getModel('itemStyle').getItemStyle(),
    blurItemStyle: seriesModel.getModel(['blur', 'itemStyle']).getItemStyle(),
    selectItemStyle: seriesModel.getModel(['select', 'itemStyle']).getItemStyle(),
    focus: emphasisModel.get('focus'),
    blurScope: emphasisModel.get('blurScope'),
    symbolRotate: seriesModel.get('symbolRotate'),
    symbolOffset: seriesModel.get('symbolOffset'),
    hoverScale: emphasisModel.get('scale'),
    labelStatesModels: getLabelStatesModels(seriesModel),
    cursorStyle: seriesModel.get('cursor')
  };
}

var SymbolDraw =
/** @class */
function () {
  function SymbolDraw(SymbolCtor) {
    this.group = new Group();
    this._SymbolCtor = SymbolCtor || Symbol;
  }
  /**
   * Update symbols draw by new data
   */


  SymbolDraw.prototype.updateData = function (data, opt) {
    opt = normalizeUpdateOpt(opt);
    var group = this.group;
    var seriesModel = data.hostModel;
    var oldData = this._data;
    var SymbolCtor = this._SymbolCtor;
    var disableAnimation = opt.disableAnimation;
    var seriesScope = makeSeriesScope(data);
    var symbolUpdateOpt = {
      disableAnimation: disableAnimation
    };

    var getSymbolPoint = opt.getSymbolPoint || function (idx) {
      return data.getItemLayout(idx);
    }; // There is no oldLineData only when first rendering or switching from
    // stream mode to normal mode, where previous elements should be removed.


    if (!oldData) {
      group.removeAll();
    }

    data.diff(oldData).add(function (newIdx) {
      var point = getSymbolPoint(newIdx);

      if (symbolNeedsDraw(data, point, newIdx, opt)) {
        var symbolEl = new SymbolCtor(data, newIdx, seriesScope, symbolUpdateOpt);
        symbolEl.setPosition(point);
        data.setItemGraphicEl(newIdx, symbolEl);
        group.add(symbolEl);
      }
    }).update(function (newIdx, oldIdx) {
      var symbolEl = oldData.getItemGraphicEl(oldIdx);
      var point = getSymbolPoint(newIdx);

      if (!symbolNeedsDraw(data, point, newIdx, opt)) {
        group.remove(symbolEl);
        return;
      }

      if (!symbolEl) {
        symbolEl = new SymbolCtor(data, newIdx);
        symbolEl.setPosition(point);
      } else {
        symbolEl.updateData(data, newIdx, seriesScope, symbolUpdateOpt);
        var target = {
          x: point[0],
          y: point[1]
        };
        disableAnimation ? symbolEl.attr(target) : updateProps(symbolEl, target, seriesModel);
      } // Add back


      group.add(symbolEl);
      data.setItemGraphicEl(newIdx, symbolEl);
    }).remove(function (oldIdx) {
      var el = oldData.getItemGraphicEl(oldIdx);
      el && el.fadeOut(function () {
        group.remove(el);
      });
    }).execute();
    this._getSymbolPoint = getSymbolPoint;
    this._data = data;
  };

  SymbolDraw.prototype.isPersistent = function () {
    return true;
  };

  SymbolDraw.prototype.updateLayout = function () {
    var _this = this;

    var data = this._data;

    if (data) {
      // Not use animation
      data.eachItemGraphicEl(function (el, idx) {
        var point = _this._getSymbolPoint(idx);

        el.setPosition(point);
        el.markRedraw();
      });
    }
  };

  SymbolDraw.prototype.incrementalPrepareUpdate = function (data) {
    this._seriesScope = makeSeriesScope(data);
    this._data = null;
    this.group.removeAll();
  };
  /**
   * Update symbols draw by new data
   */

  SymbolDraw.prototype.incrementalUpdate = function (taskParams, data, opt) {
    opt = normalizeUpdateOpt(opt);

    function updateIncrementalAndHover(el) {
      if (!el.isGroup) {
        el.incremental = true;
        el.ensureState('emphasis').hoverLayer = true;
      }
    }

    for (var idx = taskParams.start; idx < taskParams.end; idx++) {
      var point = data.getItemLayout(idx);

      if (symbolNeedsDraw(data, point, idx, opt)) {
        var el = new this._SymbolCtor(data, idx, this._seriesScope);
        el.traverse(updateIncrementalAndHover);
        el.setPosition(point);
        this.group.add(el);
        data.setItemGraphicEl(idx, el);
      }
    }
  };

  SymbolDraw.prototype.remove = function (enableAnimation) {
    var group = this.group;
    var data = this._data; // Incremental model do not have this._data.

    if (data && enableAnimation) {
      data.eachItemGraphicEl(function (el) {
        el.fadeOut(function () {
          group.remove(el);
        });
      });
    } else {
      group.removeAll();
    }
  };
  return SymbolDraw;
}();

function prepareDataCoordInfo(coordSys, data, valueOrigin) {
  var baseAxis = coordSys.getBaseAxis();
  var valueAxis = coordSys.getOtherAxis(baseAxis);
  var valueStart = getValueStart(valueAxis, valueOrigin);
  var baseAxisDim = baseAxis.dim;
  var valueAxisDim = valueAxis.dim;
  var valueDim = data.mapDimension(valueAxisDim);
  var baseDim = data.mapDimension(baseAxisDim);
  var baseDataOffset = valueAxisDim === 'x' || valueAxisDim === 'radius' ? 1 : 0;
  var dims = map(coordSys.dimensions, function (coordDim) {
    return data.mapDimension(coordDim);
  });
  var stacked = false;
  var stackResultDim = data.getCalculationInfo('stackResultDimension');

  if (isDimensionStacked(data, dims[0]
  /*, dims[1]*/
  )) {
    // jshint ignore:line
    stacked = true;
    dims[0] = stackResultDim;
  }

  if (isDimensionStacked(data, dims[1]
  /*, dims[0]*/
  )) {
    // jshint ignore:line
    stacked = true;
    dims[1] = stackResultDim;
  }

  return {
    dataDimsForPoint: dims,
    valueStart: valueStart,
    valueAxisDim: valueAxisDim,
    baseAxisDim: baseAxisDim,
    stacked: !!stacked,
    valueDim: valueDim,
    baseDim: baseDim,
    baseDataOffset: baseDataOffset,
    stackedOverDimension: data.getCalculationInfo('stackedOverDimension')
  };
}

function getValueStart(valueAxis, valueOrigin) {
  var valueStart = 0;
  var extent = valueAxis.scale.getExtent();

  if (valueOrigin === 'start') {
    valueStart = extent[0];
  } else if (valueOrigin === 'end') {
    valueStart = extent[1];
  } // auto
  else {
      // Both positive
      if (extent[0] > 0) {
        valueStart = extent[0];
      } // Both negative
      else if (extent[1] < 0) {
          valueStart = extent[1];
        } // If is one positive, and one negative, onZero shall be true

    }

  return valueStart;
}

function getStackedOnPoint(dataCoordInfo, coordSys, data, idx) {
  var value = NaN;

  if (dataCoordInfo.stacked) {
    value = data.get(data.getCalculationInfo('stackedOverDimension'), idx);
  }

  if (isNaN(value)) {
    value = dataCoordInfo.valueStart;
  }

  var baseDataOffset = dataCoordInfo.baseDataOffset;
  var stackedData = [];
  stackedData[baseDataOffset] = data.get(dataCoordInfo.baseDim, idx);
  stackedData[1 - baseDataOffset] = value;
  return coordSys.dataToPoint(stackedData);
}

/* global Float32Array */

var supportFloat32Array = typeof Float32Array !== 'undefined';
var Float32ArrayCtor = !supportFloat32Array ? Array : Float32Array;
function createFloat32Array(arg) {
  if (isArray(arg)) {
    // Return self directly if don't support TypedArray.
    return supportFloat32Array ? new Float32Array(arg) : arg;
  } // Else is number


  return new Float32ArrayCtor(arg);
}

function diffData(oldData, newData) {
  var diffResult = [];
  newData.diff(oldData).add(function (idx) {
    diffResult.push({
      cmd: '+',
      idx: idx
    });
  }).update(function (newIdx, oldIdx) {
    diffResult.push({
      cmd: '=',
      idx: oldIdx,
      idx1: newIdx
    });
  }).remove(function (idx) {
    diffResult.push({
      cmd: '-',
      idx: idx
    });
  }).execute();
  return diffResult;
}

function lineAnimationDiff(oldData, newData, oldStackedOnPoints, newStackedOnPoints, oldCoordSys, newCoordSys, oldValueOrigin, newValueOrigin) {
  var diff = diffData(oldData, newData); // let newIdList = newData.mapArray(newData.getId);
  // let oldIdList = oldData.mapArray(oldData.getId);
  // convertToIntId(newIdList, oldIdList);
  // // FIXME One data ?
  // diff = arrayDiff(oldIdList, newIdList);

  var currPoints = [];
  var nextPoints = []; // Points for stacking base line

  var currStackedPoints = [];
  var nextStackedPoints = [];
  var status = [];
  var sortedIndices = [];
  var rawIndices = [];
  var newDataOldCoordInfo = prepareDataCoordInfo(oldCoordSys, newData, oldValueOrigin);
  var oldDataNewCoordInfo = prepareDataCoordInfo(newCoordSys, oldData, newValueOrigin);
  var oldPoints = oldData.getLayout('points') || [];
  var newPoints = newData.getLayout('points') || [];

  for (var i = 0; i < diff.length; i++) {
    var diffItem = diff[i];
    var pointAdded = true;
    var oldIdx2 = void 0;
    var newIdx2 = void 0; // FIXME, animation is not so perfect when dataZoom window moves fast
    // Which is in case remvoing or add more than one data in the tail or head

    switch (diffItem.cmd) {
      case '=':
        oldIdx2 = diffItem.idx * 2;
        newIdx2 = diffItem.idx1 * 2;
        var currentX = oldPoints[oldIdx2];
        var currentY = oldPoints[oldIdx2 + 1];
        var nextX = newPoints[newIdx2];
        var nextY = newPoints[newIdx2 + 1]; // If previous data is NaN, use next point directly

        if (isNaN(currentX) || isNaN(currentY)) {
          currentX = nextX;
          currentY = nextY;
        }

        currPoints.push(currentX, currentY);
        nextPoints.push(nextX, nextY);
        currStackedPoints.push(oldStackedOnPoints[oldIdx2], oldStackedOnPoints[oldIdx2 + 1]);
        nextStackedPoints.push(newStackedOnPoints[newIdx2], newStackedOnPoints[newIdx2 + 1]);
        rawIndices.push(newData.getRawIndex(diffItem.idx1));
        break;

      case '+':
        var newIdx = diffItem.idx;
        var newDataDimsForPoint = newDataOldCoordInfo.dataDimsForPoint;
        var oldPt = oldCoordSys.dataToPoint([newData.get(newDataDimsForPoint[0], newIdx), newData.get(newDataDimsForPoint[1], newIdx)]);
        newIdx2 = newIdx * 2;
        currPoints.push(oldPt[0], oldPt[1]);
        nextPoints.push(newPoints[newIdx2], newPoints[newIdx2 + 1]);
        var stackedOnPoint = getStackedOnPoint(newDataOldCoordInfo, oldCoordSys, newData, newIdx);
        currStackedPoints.push(stackedOnPoint[0], stackedOnPoint[1]);
        nextStackedPoints.push(newStackedOnPoints[newIdx2], newStackedOnPoints[newIdx2 + 1]);
        rawIndices.push(newData.getRawIndex(newIdx));
        break;

      case '-':
        var oldIdx = diffItem.idx;
        var rawIndex = oldData.getRawIndex(oldIdx);
        var oldDataDimsForPoint = oldDataNewCoordInfo.dataDimsForPoint;
        oldIdx2 = oldIdx * 2; // Data is replaced. In the case of dynamic data queue
        // FIXME FIXME FIXME

        if (rawIndex !== oldIdx) {
          var newPt = newCoordSys.dataToPoint([oldData.get(oldDataDimsForPoint[0], oldIdx), oldData.get(oldDataDimsForPoint[1], oldIdx)]);
          var newStackedOnPt = getStackedOnPoint(oldDataNewCoordInfo, newCoordSys, oldData, oldIdx);
          currPoints.push(oldPoints[oldIdx2], oldPoints[oldIdx2 + 1]);
          nextPoints.push(newPt[0], newPt[1]);
          currStackedPoints.push(oldStackedOnPoints[oldIdx2], oldStackedOnPoints[oldIdx2 + 1]);
          nextStackedPoints.push(newStackedOnPt[0], newStackedOnPt[1]);
          rawIndices.push(rawIndex);
        } else {
          pointAdded = false;
        }

    } // Original indices


    if (pointAdded) {
      status.push(diffItem);
      sortedIndices.push(sortedIndices.length);
    }
  } // Diff result may be crossed if all items are changed
  // Sort by data index


  sortedIndices.sort(function (a, b) {
    return rawIndices[a] - rawIndices[b];
  });
  var len = currPoints.length;
  var sortedCurrPoints = createFloat32Array(len);
  var sortedNextPoints = createFloat32Array(len);
  var sortedCurrStackedPoints = createFloat32Array(len);
  var sortedNextStackedPoints = createFloat32Array(len);
  var sortedStatus = [];

  for (var i = 0; i < sortedIndices.length; i++) {
    var idx = sortedIndices[i];
    var i2 = i * 2;
    var idx2 = idx * 2;
    sortedCurrPoints[i2] = currPoints[idx2];
    sortedCurrPoints[i2 + 1] = currPoints[idx2 + 1];
    sortedNextPoints[i2] = nextPoints[idx2];
    sortedNextPoints[i2 + 1] = nextPoints[idx2 + 1];
    sortedCurrStackedPoints[i2] = currStackedPoints[idx2];
    sortedCurrStackedPoints[i2 + 1] = currStackedPoints[idx2 + 1];
    sortedNextStackedPoints[i2] = nextStackedPoints[idx2];
    sortedNextStackedPoints[i2 + 1] = nextStackedPoints[idx2 + 1];
    sortedStatus[i] = status[idx];
  }

  return {
    current: sortedCurrPoints,
    next: sortedNextPoints,
    stackedOnCurrent: sortedCurrStackedPoints,
    stackedOnNext: sortedNextStackedPoints,
    status: sortedStatus
  };
}

var mathMin = Math.min;
var mathMax = Math.max;

function isPointNull$1(x, y) {
  return isNaN(x) || isNaN(y);
}
/**
 * Draw smoothed line in non-monotone, in may cause undesired curve in extreme
 * situations. This should be used when points are non-monotone neither in x or
 * y dimension.
 */


function drawSegment(ctx, points, start, segLen, allLen, dir, smooth, smoothMonotone, connectNulls) {
  var prevX;
  var prevY;
  var cpx0;
  var cpy0;
  var cpx1;
  var cpy1;
  var idx = start;
  var k = 0;

  for (; k < segLen; k++) {
    var x = points[idx * 2];
    var y = points[idx * 2 + 1];

    if (idx >= allLen || idx < 0) {
      break;
    }

    if (isPointNull$1(x, y)) {
      if (connectNulls) {
        idx += dir;
        continue;
      }

      break;
    }

    if (idx === start) {
      ctx[dir > 0 ? 'moveTo' : 'lineTo'](x, y);
      cpx0 = x;
      cpy0 = y;
    } else {
      var dx = x - prevX;
      var dy = y - prevY; // Ignore tiny segment.

      if (dx * dx + dy * dy < 0.5) {
        idx += dir;
        continue;
      }

      if (smooth > 0) {
        var nextIdx = idx + dir;
        var nextX = points[nextIdx * 2];
        var nextY = points[nextIdx * 2 + 1];
        var tmpK = k + 1;

        if (connectNulls) {
          // Find next point not null
          while (isPointNull$1(nextX, nextY) && tmpK < segLen) {
            tmpK++;
            nextIdx += dir;
            nextX = points[nextIdx * 2];
            nextY = points[nextIdx * 2 + 1];
          }
        }

        var ratioNextSeg = 0.5;
        var vx = 0;
        var vy = 0;
        var nextCpx0 = void 0;
        var nextCpy0 = void 0; // Is last point

        if (tmpK >= segLen || isPointNull$1(nextX, nextY)) {
          cpx1 = x;
          cpy1 = y;
        } else {
          vx = nextX - prevX;
          vy = nextY - prevY;
          var dx0 = x - prevX;
          var dx1 = nextX - x;
          var dy0 = y - prevY;
          var dy1 = nextY - y;
          var lenPrevSeg = void 0;
          var lenNextSeg = void 0;

          if (smoothMonotone === 'x') {
            lenPrevSeg = Math.abs(dx0);
            lenNextSeg = Math.abs(dx1);
            cpx1 = x - lenPrevSeg * smooth;
            cpy1 = y;
            nextCpx0 = x + lenPrevSeg * smooth;
            nextCpy0 = y;
          } else if (smoothMonotone === 'y') {
            lenPrevSeg = Math.abs(dy0);
            lenNextSeg = Math.abs(dy1);
            cpx1 = x;
            cpy1 = y - lenPrevSeg * smooth;
            nextCpx0 = x;
            nextCpy0 = y + lenPrevSeg * smooth;
          } else {
            lenPrevSeg = Math.sqrt(dx0 * dx0 + dy0 * dy0);
            lenNextSeg = Math.sqrt(dx1 * dx1 + dy1 * dy1); // Use ratio of seg length

            ratioNextSeg = lenNextSeg / (lenNextSeg + lenPrevSeg);
            cpx1 = x - vx * smooth * (1 - ratioNextSeg);
            cpy1 = y - vy * smooth * (1 - ratioNextSeg); // cp0 of next segment

            nextCpx0 = x + vx * smooth * ratioNextSeg;
            nextCpy0 = y + vy * smooth * ratioNextSeg; // Smooth constraint between point and next point.
            // Avoid exceeding extreme after smoothing.

            nextCpx0 = mathMin(nextCpx0, mathMax(nextX, x));
            nextCpy0 = mathMin(nextCpy0, mathMax(nextY, y));
            nextCpx0 = mathMax(nextCpx0, mathMin(nextX, x));
            nextCpy0 = mathMax(nextCpy0, mathMin(nextY, y)); // Reclaculate cp1 based on the adjusted cp0 of next seg.

            vx = nextCpx0 - x;
            vy = nextCpy0 - y;
            cpx1 = x - vx * lenPrevSeg / lenNextSeg;
            cpy1 = y - vy * lenPrevSeg / lenNextSeg; // Smooth constraint between point and prev point.
            // Avoid exceeding extreme after smoothing.

            cpx1 = mathMin(cpx1, mathMax(prevX, x));
            cpy1 = mathMin(cpy1, mathMax(prevY, y));
            cpx1 = mathMax(cpx1, mathMin(prevX, x));
            cpy1 = mathMax(cpy1, mathMin(prevY, y)); // Adjust next cp0 again.

            vx = x - cpx1;
            vy = y - cpy1;
            nextCpx0 = x + vx * lenNextSeg / lenPrevSeg;
            nextCpy0 = y + vy * lenNextSeg / lenPrevSeg;
          }
        }

        ctx.bezierCurveTo(cpx0, cpy0, cpx1, cpy1, x, y);
        cpx0 = nextCpx0;
        cpy0 = nextCpy0;
      } else {
        ctx.lineTo(x, y);
      }
    }

    prevX = x;
    prevY = y;
    idx += dir;
  }

  return k;
}

var ECPolylineShape =
/** @class */
function () {
  function ECPolylineShape() {
    this.smooth = 0;
    this.smoothConstraint = true;
  }

  return ECPolylineShape;
}();

var ECPolyline =
/** @class */
function (_super) {
  __extends(ECPolyline, _super);

  function ECPolyline(opts) {
    var _this = _super.call(this, opts) || this;

    _this.type = 'ec-polyline';
    return _this;
  }

  ECPolyline.prototype.getDefaultStyle = function () {
    return {
      stroke: '#000',
      fill: null
    };
  };

  ECPolyline.prototype.getDefaultShape = function () {
    return new ECPolylineShape();
  };

  ECPolyline.prototype.buildPath = function (ctx, shape) {
    var points = shape.points;
    var i = 0;
    var len = points.length / 2; // const result = getBoundingBox(points, shape.smoothConstraint);

    if (shape.connectNulls) {
      // Must remove first and last null values avoid draw error in polygon
      for (; len > 0; len--) {
        if (!isPointNull$1(points[len * 2 - 2], points[len * 2 - 1])) {
          break;
        }
      }

      for (; i < len; i++) {
        if (!isPointNull$1(points[i * 2], points[i * 2 + 1])) {
          break;
        }
      }
    }

    while (i < len) {
      i += drawSegment(ctx, points, i, len, len, 1, shape.smooth, shape.smoothMonotone, shape.connectNulls) + 1;
    }
  };

  ECPolyline.prototype.getPointOn = function (xOrY, dim) {
    if (!this.path) {
      this.createPathProxy();
      this.buildPath(this.path, this.shape);
    }

    var path = this.path;
    var data = path.data;
    var CMD = PathProxy.CMD;
    var x0;
    var y0;
    var isDimX = dim === 'x';
    var roots = [];

    for (var i = 0; i < data.length;) {
      var cmd = data[i++];
      var x = void 0;
      var y = void 0;
      var x2 = void 0;
      var y2 = void 0;
      var x3 = void 0;
      var y3 = void 0;
      var t = void 0;

      switch (cmd) {
        case CMD.M:
          x0 = data[i++];
          y0 = data[i++];
          break;

        case CMD.L:
          x = data[i++];
          y = data[i++];
          t = isDimX ? (xOrY - x0) / (x - x0) : (xOrY - y0) / (y - y0);

          if (t <= 1 && t >= 0) {
            var val = isDimX ? (y - y0) * t + y0 : (x - x0) * t + x0;
            return isDimX ? [xOrY, val] : [val, xOrY];
          }

          x0 = x;
          y0 = y;
          break;

        case CMD.C:
          x = data[i++];
          y = data[i++];
          x2 = data[i++];
          y2 = data[i++];
          x3 = data[i++];
          y3 = data[i++];
          var nRoot = isDimX ? cubicRootAt(x0, x, x2, x3, xOrY, roots) : cubicRootAt(y0, y, y2, y3, xOrY, roots);

          if (nRoot > 0) {
            for (var i_1 = 0; i_1 < nRoot; i_1++) {
              var t_1 = roots[i_1];

              if (t_1 <= 1 && t_1 >= 0) {
                var val = isDimX ? cubicAt(y0, y, y2, y3, t_1) : cubicAt(x0, x, x2, x3, t_1);
                return isDimX ? [xOrY, val] : [val, xOrY];
              }
            }
          }

          x0 = x3;
          y0 = y3;
          break;
      }
    }
  };

  return ECPolyline;
}(Path);

var ECPolygonShape =
/** @class */
function (_super) {
  __extends(ECPolygonShape, _super);

  function ECPolygonShape() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  return ECPolygonShape;
}(ECPolylineShape);

var ECPolygon =
/** @class */
function (_super) {
  __extends(ECPolygon, _super);

  function ECPolygon(opts) {
    var _this = _super.call(this, opts) || this;

    _this.type = 'ec-polygon';
    return _this;
  }

  ECPolygon.prototype.getDefaultShape = function () {
    return new ECPolygonShape();
  };

  ECPolygon.prototype.buildPath = function (ctx, shape) {
    var points = shape.points;
    var stackedOnPoints = shape.stackedOnPoints;
    var i = 0;
    var len = points.length / 2;
    var smoothMonotone = shape.smoothMonotone;

    if (shape.connectNulls) {
      // Must remove first and last null values avoid draw error in polygon
      for (; len > 0; len--) {
        if (!isPointNull$1(points[len * 2 - 2], points[len * 2 - 1])) {
          break;
        }
      }

      for (; i < len; i++) {
        if (!isPointNull$1(points[i * 2], points[i * 2 + 1])) {
          break;
        }
      }
    }

    while (i < len) {
      var k = drawSegment(ctx, points, i, len, len, 1, shape.smooth, smoothMonotone, shape.connectNulls);
      drawSegment(ctx, stackedOnPoints, i + k - 1, k, len, -1, shape.stackedOnSmooth, smoothMonotone, shape.connectNulls);
      i += k + 1;
      ctx.closePath();
    }
  };

  return ECPolygon;
}(Path);

function createGridClipPath(cartesian, hasAnimation, seriesModel, done, during) {
  var rect = cartesian.getArea();
  var x = rect.x;
  var y = rect.y;
  var width = rect.width;
  var height = rect.height;
  var lineWidth = seriesModel.get(['lineStyle', 'width']) || 2; // Expand the clip path a bit to avoid the border is clipped and looks thinner

  x -= lineWidth / 2;
  y -= lineWidth / 2;
  width += lineWidth;
  height += lineWidth; // fix: https://github.com/apache/incubator-echarts/issues/11369

  x = Math.floor(x);
  width = Math.round(width);
  var clipPath = new Rect({
    shape: {
      x: x,
      y: y,
      width: width,
      height: height
    }
  });

  if (hasAnimation) {
    var baseAxis = cartesian.getBaseAxis();
    var isHorizontal = baseAxis.isHorizontal();
    var isAxisInversed = baseAxis.inverse;

    if (isHorizontal) {
      if (isAxisInversed) {
        clipPath.shape.x += width;
      }

      clipPath.shape.width = 0;
    } else {
      if (!isAxisInversed) {
        clipPath.shape.y += height;
      }

      clipPath.shape.height = 0;
    }

    var duringCb = typeof during === 'function' ? function (percent) {
      during(percent, clipPath);
    } : null;
    initProps(clipPath, {
      shape: {
        width: width,
        height: height,
        x: x,
        y: y
      }
    }, seriesModel, null, done, duringCb);
  }

  return clipPath;
}

function createPolarClipPath(polar, hasAnimation, seriesModel) {
  var sectorArea = polar.getArea(); // Avoid float number rounding error for symbol on the edge of axis extent.

  var r0 = round(sectorArea.r0, 1);
  var r = round(sectorArea.r, 1);
  var clipPath = new Sector({
    shape: {
      cx: round(polar.cx, 1),
      cy: round(polar.cy, 1),
      r0: r0,
      r: r,
      startAngle: sectorArea.startAngle,
      endAngle: sectorArea.endAngle,
      clockwise: sectorArea.clockwise
    }
  });

  if (hasAnimation) {
    var isRadial = polar.getBaseAxis().dim === 'angle';

    if (isRadial) {
      clipPath.shape.endAngle = sectorArea.startAngle;
    } else {
      clipPath.shape.r = r0;
    }

    initProps(clipPath, {
      shape: {
        endAngle: sectorArea.endAngle,
        r: r
      }
    }, seriesModel);
  }

  return clipPath;
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
function isCoordinateSystemType(coordSys, type) {
  return coordSys.type === type;
}

function isPointsSame(points1, points2) {
  if (points1.length !== points2.length) {
    return;
  }

  for (var i = 0; i < points1.length; i++) {
    if (points1[i] !== points2[i]) {
      return;
    }
  }

  return true;
}

function bboxFromPoints(points) {
  var minX = Infinity;
  var minY = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;

  for (var i = 0; i < points.length;) {
    var x = points[i++];
    var y = points[i++];

    if (!isNaN(x)) {
      minX = Math.min(x, minX);
      maxX = Math.max(x, maxX);
    }

    if (!isNaN(y)) {
      minY = Math.min(y, minY);
      maxY = Math.max(y, maxY);
    }
  }

  return [[minX, minY], [maxX, maxY]];
}

function getBoundingDiff(points1, points2) {
  var _a = bboxFromPoints(points1),
      min1 = _a[0],
      max1 = _a[1];

  var _b = bboxFromPoints(points2),
      min2 = _b[0],
      max2 = _b[1]; // Get a max value from each corner of two boundings.


  return Math.max(Math.abs(min1[0] - min2[0]), Math.abs(min1[1] - min2[1]), Math.abs(max1[0] - max2[0]), Math.abs(max1[1] - max2[1]));
}

function getSmooth(smooth) {
  return typeof smooth === 'number' ? smooth : smooth ? 0.5 : 0;
}

function getStackedOnPoints(coordSys, data, dataCoordInfo) {
  if (!dataCoordInfo.valueDim) {
    return [];
  }

  var len = data.count();
  var points = createFloat32Array(len * 2);

  for (var idx = 0; idx < len; idx++) {
    var pt = getStackedOnPoint(dataCoordInfo, coordSys, data, idx);
    points[idx * 2] = pt[0];
    points[idx * 2 + 1] = pt[1];
  }

  return points;
}

function turnPointsIntoStep(points, coordSys, stepTurnAt) {
  var baseAxis = coordSys.getBaseAxis();
  var baseIndex = baseAxis.dim === 'x' || baseAxis.dim === 'radius' ? 0 : 1;
  var stepPoints = [];
  var i = 0;
  var stepPt = [];
  var pt = [];
  var nextPt = [];

  for (; i < points.length - 2; i += 2) {
    nextPt[0] = points[i + 2];
    nextPt[1] = points[i + 3];
    pt[0] = points[i];
    pt[1] = points[i + 1];
    stepPoints.push(pt[0], pt[1]);

    switch (stepTurnAt) {
      case 'end':
        stepPt[baseIndex] = nextPt[baseIndex];
        stepPt[1 - baseIndex] = pt[1 - baseIndex];
        stepPoints.push(stepPt[0], stepPt[1]);
        break;

      case 'middle':
        var middle = (pt[baseIndex] + nextPt[baseIndex]) / 2;
        var stepPt2 = [];
        stepPt[baseIndex] = stepPt2[baseIndex] = middle;
        stepPt[1 - baseIndex] = pt[1 - baseIndex];
        stepPt2[1 - baseIndex] = nextPt[1 - baseIndex];
        stepPoints.push(stepPt[0], stepPt[1]);
        stepPoints.push(stepPt2[0], stepPt2[1]);
        break;

      default:
        // default is start
        stepPt[baseIndex] = pt[baseIndex];
        stepPt[1 - baseIndex] = nextPt[1 - baseIndex];
        stepPoints.push(stepPt[0], stepPt[1]);
    }
  } // Last points


  stepPoints.push(points[i++], points[i++]);
  return stepPoints;
}

function getVisualGradient(data, coordSys) {
  var visualMetaList = data.getVisual('visualMeta');

  if (!visualMetaList || !visualMetaList.length || !data.count()) {
    // When data.count() is 0, gradient range can not be calculated.
    return;
  }

  if (coordSys.type !== 'cartesian2d') {

    return;
  }

  var coordDim;
  var visualMeta;

  for (var i = visualMetaList.length - 1; i >= 0; i--) {
    var dimIndex = visualMetaList[i].dimension;
    var dimName = data.dimensions[dimIndex];
    var dimInfo = data.getDimensionInfo(dimName);
    coordDim = dimInfo && dimInfo.coordDim; // Can only be x or y

    if (coordDim === 'x' || coordDim === 'y') {
      visualMeta = visualMetaList[i];
      break;
    }
  }

  if (!visualMeta) {

    return;
  } // If the area to be rendered is bigger than area defined by LinearGradient,
  // the canvas spec prescribes that the color of the first stop and the last
  // stop should be used. But if two stops are added at offset 0, in effect
  // browsers use the color of the second stop to render area outside
  // LinearGradient. So we can only infinitesimally extend area defined in
  // LinearGradient to render `outerColors`.


  var axis = coordSys.getAxis(coordDim); // dataToCoor mapping may not be linear, but must be monotonic.

  var colorStops = map(visualMeta.stops, function (stop) {
    return {
      offset: 0,
      coord: axis.toGlobalCoord(axis.dataToCoord(stop.value)),
      color: stop.color
    };
  });
  var stopLen = colorStops.length;
  var outerColors = visualMeta.outerColors.slice();

  if (stopLen && colorStops[0].coord > colorStops[stopLen - 1].coord) {
    colorStops.reverse();
    outerColors.reverse();
  }

  var tinyExtent = 10; // Arbitrary value: 10px

  var minCoord = colorStops[0].coord - tinyExtent;
  var maxCoord = colorStops[stopLen - 1].coord + tinyExtent;
  var coordSpan = maxCoord - minCoord;

  if (coordSpan < 1e-3) {
    return 'transparent';
  }

  each(colorStops, function (stop) {
    stop.offset = (stop.coord - minCoord) / coordSpan;
  });
  colorStops.push({
    offset: stopLen ? colorStops[stopLen - 1].offset : 0.5,
    color: outerColors[1] || 'transparent'
  });
  colorStops.unshift({
    offset: stopLen ? colorStops[0].offset : 0.5,
    color: outerColors[0] || 'transparent'
  }); // zrUtil.each(colorStops, function (colorStop) {
  //     // Make sure each offset has rounded px to avoid not sharp edge
  //     colorStop.offset = (Math.round(colorStop.offset * (end - start) + start) - start) / (end - start);
  // });

  var gradient = new LinearGradient(0, 0, 0, 0, colorStops, true);
  gradient[coordDim] = minCoord;
  gradient[coordDim + '2'] = maxCoord;
  return gradient;
}

function getIsIgnoreFunc(seriesModel, data, coordSys) {
  var showAllSymbol = seriesModel.get('showAllSymbol');
  var isAuto = showAllSymbol === 'auto';

  if (showAllSymbol && !isAuto) {
    return;
  }

  var categoryAxis = coordSys.getAxesByScale('ordinal')[0];

  if (!categoryAxis) {
    return;
  } // Note that category label interval strategy might bring some weird effect
  // in some scenario: users may wonder why some of the symbols are not
  // displayed. So we show all symbols as possible as we can.


  if (isAuto // Simplify the logic, do not determine label overlap here.
  && canShowAllSymbolForCategory(categoryAxis, data)) {
    return;
  } // Otherwise follow the label interval strategy on category axis.


  var categoryDataDim = data.mapDimension(categoryAxis.dim);
  var labelMap = {};
  each(categoryAxis.getViewLabels(), function (labelItem) {
    var ordinalNumber = categoryAxis.scale.getRawOrdinalNumber(labelItem.tickValue);
    labelMap[ordinalNumber] = 1;
  });
  return function (dataIndex) {
    return !labelMap.hasOwnProperty(data.get(categoryDataDim, dataIndex));
  };
}

function canShowAllSymbolForCategory(categoryAxis, data) {
  // In mose cases, line is monotonous on category axis, and the label size
  // is close with each other. So we check the symbol size and some of the
  // label size alone with the category axis to estimate whether all symbol
  // can be shown without overlap.
  var axisExtent = categoryAxis.getExtent();
  var availSize = Math.abs(axisExtent[1] - axisExtent[0]) / categoryAxis.scale.count();
  isNaN(availSize) && (availSize = 0); // 0/0 is NaN.
  // Sampling some points, max 5.

  var dataLen = data.count();
  var step = Math.max(1, Math.round(dataLen / 5));

  for (var dataIndex = 0; dataIndex < dataLen; dataIndex += step) {
    if (Symbol.getSymbolSize(data, dataIndex // Only for cartesian, where `isHorizontal` exists.
    )[categoryAxis.isHorizontal() ? 1 : 0] // Empirical number
    * 1.5 > availSize) {
      return false;
    }
  }

  return true;
}

function isPointNull(x, y) {
  return isNaN(x) || isNaN(y);
}

function getLastIndexNotNull(points) {
  var len = points.length / 2;

  for (; len > 0; len--) {
    if (!isPointNull(points[len * 2 - 2], points[len * 2 - 1])) {
      break;
    }
  }

  return len - 1;
}

function getPointAtIndex(points, idx) {
  return [points[idx * 2], points[idx * 2 + 1]];
}

function getIndexRange(points, xOrY, dim) {
  var len = points.length / 2;
  var dimIdx = dim === 'x' ? 0 : 1;
  var a;
  var b;
  var prevIndex = 0;
  var nextIndex = -1;

  for (var i = 0; i < len; i++) {
    b = points[i * 2 + dimIdx];

    if (isNaN(b) || isNaN(points[i * 2 + 1 - dimIdx])) {
      continue;
    }

    if (i === 0) {
      a = b;
      continue;
    }

    if (a <= xOrY && b >= xOrY || a >= xOrY && b <= xOrY) {
      nextIndex = i;
      break;
    }

    prevIndex = i;
    a = b;
  }

  return {
    range: [prevIndex, nextIndex],
    t: (xOrY - a) / (b - a)
  };
}

function createLineClipPath(lineView, coordSys, hasAnimation, seriesModel) {
  if (isCoordinateSystemType(coordSys, 'cartesian2d')) {
    var endLabelModel_1 = seriesModel.getModel('endLabel');
    var showEndLabel = endLabelModel_1.get('show');
    var valueAnimation_1 = endLabelModel_1.get('valueAnimation');
    var data_1 = seriesModel.getData();
    var labelAnimationRecord_1 = {
      lastFrameIndex: 0
    };
    var during = showEndLabel ? function (percent, clipRect) {
      lineView._endLabelOnDuring(percent, clipRect, data_1, labelAnimationRecord_1, valueAnimation_1, endLabelModel_1, coordSys);
    } : null;
    var isHorizontal = coordSys.getBaseAxis().isHorizontal();
    var clipPath = createGridClipPath(coordSys, hasAnimation, seriesModel, function () {
      var endLabel = lineView._endLabel;

      if (endLabel && hasAnimation) {
        if (labelAnimationRecord_1.originalX != null) {
          endLabel.attr({
            x: labelAnimationRecord_1.originalX,
            y: labelAnimationRecord_1.originalY
          });
        }
      }
    }, during); // Expand clip shape to avoid clipping when line value exceeds axis

    if (!seriesModel.get('clip', true)) {
      var rectShape = clipPath.shape;
      var expandSize = Math.max(rectShape.width, rectShape.height);

      if (isHorizontal) {
        rectShape.y -= expandSize;
        rectShape.height += expandSize * 2;
      } else {
        rectShape.x -= expandSize;
        rectShape.width += expandSize * 2;
      }
    } // Set to the final frame. To make sure label layout is right.


    if (during) {
      during(1, clipPath);
    }

    return clipPath;
  } else {

    return createPolarClipPath(coordSys, hasAnimation, seriesModel);
  }
}

function getEndLabelStateSpecified(endLabelModel, coordSys) {
  var baseAxis = coordSys.getBaseAxis();
  var isHorizontal = baseAxis.isHorizontal();
  var isBaseInversed = baseAxis.inverse;
  var align = isHorizontal ? isBaseInversed ? 'right' : 'left' : 'center';
  var verticalAlign = isHorizontal ? 'middle' : isBaseInversed ? 'top' : 'bottom';
  return {
    normal: {
      align: endLabelModel.get('align') || align,
      verticalAlign: endLabelModel.get('verticalAlign') || verticalAlign
    }
  };
}

var LineView =
/** @class */
function (_super) {
  __extends(LineView, _super);

  function LineView() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  LineView.prototype.init = function () {
    var lineGroup = new Group();
    var symbolDraw = new SymbolDraw();
    this.group.add(symbolDraw.group);
    this._symbolDraw = symbolDraw;
    this._lineGroup = lineGroup;
  };

  LineView.prototype.render = function (seriesModel, ecModel, api) {
    var _this = this;

    var coordSys = seriesModel.coordinateSystem;
    var group = this.group;
    var data = seriesModel.getData();
    var lineStyleModel = seriesModel.getModel('lineStyle');
    var areaStyleModel = seriesModel.getModel('areaStyle');
    var points = data.getLayout('points') || [];
    var isCoordSysPolar = coordSys.type === 'polar';
    var prevCoordSys = this._coordSys;
    var symbolDraw = this._symbolDraw;
    var polyline = this._polyline;
    var polygon = this._polygon;
    var lineGroup = this._lineGroup;
    var hasAnimation = seriesModel.get('animation');
    var isAreaChart = !areaStyleModel.isEmpty();
    var valueOrigin = areaStyleModel.get('origin');
    var dataCoordInfo = prepareDataCoordInfo(coordSys, data, valueOrigin);
    var stackedOnPoints = isAreaChart && getStackedOnPoints(coordSys, data, dataCoordInfo);
    var showSymbol = seriesModel.get('showSymbol');
    var isIgnoreFunc = showSymbol && !isCoordSysPolar && getIsIgnoreFunc(seriesModel, data, coordSys); // Remove temporary symbols

    var oldData = this._data;
    oldData && oldData.eachItemGraphicEl(function (el, idx) {
      if (el.__temp) {
        group.remove(el);
        oldData.setItemGraphicEl(idx, null);
      }
    }); // Remove previous created symbols if showSymbol changed to false

    if (!showSymbol) {
      symbolDraw.remove();
    }

    group.add(lineGroup); // FIXME step not support polar

    var step = !isCoordSysPolar ? seriesModel.get('step') : false;
    var clipShapeForSymbol;

    if (coordSys && coordSys.getArea && seriesModel.get('clip', true)) {
      clipShapeForSymbol = coordSys.getArea(); // Avoid float number rounding error for symbol on the edge of axis extent.
      // See #7913 and `test/dataZoom-clip.html`.

      if (clipShapeForSymbol.width != null) {
        clipShapeForSymbol.x -= 0.1;
        clipShapeForSymbol.y -= 0.1;
        clipShapeForSymbol.width += 0.2;
        clipShapeForSymbol.height += 0.2;
      } else if (clipShapeForSymbol.r0) {
        clipShapeForSymbol.r0 -= 0.5;
        clipShapeForSymbol.r += 0.5;
      }
    }

    this._clipShapeForSymbol = clipShapeForSymbol;
    var visualColor = getVisualGradient(data, coordSys) || data.getVisual('style')[data.getVisual('drawType')]; // Initialization animation or coordinate system changed

    if (!(polyline && prevCoordSys.type === coordSys.type && step === this._step)) {
      showSymbol && symbolDraw.updateData(data, {
        isIgnore: isIgnoreFunc,
        clipShape: clipShapeForSymbol,
        disableAnimation: true,
        getSymbolPoint: function (idx) {
          return [points[idx * 2], points[idx * 2 + 1]];
        }
      });
      hasAnimation && this._initSymbolLabelAnimation(data, coordSys, clipShapeForSymbol);

      if (step) {
        // TODO If stacked series is not step
        points = turnPointsIntoStep(points, coordSys, step);

        if (stackedOnPoints) {
          stackedOnPoints = turnPointsIntoStep(stackedOnPoints, coordSys, step);
        }
      }

      polyline = this._newPolyline(points);

      if (isAreaChart) {
        polygon = this._newPolygon(points, stackedOnPoints);
      } // NOTE: Must update _endLabel before setClipPath.


      if (!isCoordSysPolar) {
        this._initOrUpdateEndLabel(seriesModel, coordSys, convertToColorString(visualColor));
      }

      lineGroup.setClipPath(createLineClipPath(this, coordSys, true, seriesModel));
    } else {
      if (isAreaChart && !polygon) {
        // If areaStyle is added
        polygon = this._newPolygon(points, stackedOnPoints);
      } else if (polygon && !isAreaChart) {
        // If areaStyle is removed
        lineGroup.remove(polygon);
        polygon = this._polygon = null;
      } // NOTE: Must update _endLabel before setClipPath.


      if (!isCoordSysPolar) {
        this._initOrUpdateEndLabel(seriesModel, coordSys, convertToColorString(visualColor));
      } // Update clipPath


      lineGroup.setClipPath(createLineClipPath(this, coordSys, false, seriesModel)); // Always update, or it is wrong in the case turning on legend
      // because points are not changed

      showSymbol && symbolDraw.updateData(data, {
        isIgnore: isIgnoreFunc,
        clipShape: clipShapeForSymbol,
        disableAnimation: true,
        getSymbolPoint: function (idx) {
          return [points[idx * 2], points[idx * 2 + 1]];
        }
      }); // In the case data zoom triggerred refreshing frequently
      // Data may not change if line has a category axis. So it should animate nothing

      if (!isPointsSame(this._stackedOnPoints, stackedOnPoints) || !isPointsSame(this._points, points)) {
        if (hasAnimation) {
          this._doUpdateAnimation(data, stackedOnPoints, coordSys, api, step, valueOrigin);
        } else {
          // Not do it in update with animation
          if (step) {
            // TODO If stacked series is not step
            points = turnPointsIntoStep(points, coordSys, step);

            if (stackedOnPoints) {
              stackedOnPoints = turnPointsIntoStep(stackedOnPoints, coordSys, step);
            }
          }

          polyline.setShape({
            points: points
          });
          polygon && polygon.setShape({
            points: points,
            stackedOnPoints: stackedOnPoints
          });
        }
      }
    }

    var focus = seriesModel.get(['emphasis', 'focus']);
    var blurScope = seriesModel.get(['emphasis', 'blurScope']);
    polyline.useStyle(defaults( // Use color in lineStyle first
    lineStyleModel.getLineStyle(), {
      fill: 'none',
      stroke: visualColor,
      lineJoin: 'bevel'
    }));
    setStatesStylesFromModel(polyline, seriesModel, 'lineStyle');

    if (polyline.style.lineWidth > 0 && seriesModel.get(['emphasis', 'lineStyle', 'width']) === 'bolder') {
      var emphasisLineStyle = polyline.getState('emphasis').style;
      emphasisLineStyle.lineWidth = polyline.style.lineWidth + 1;
    } // Needs seriesIndex for focus


    getECData(polyline).seriesIndex = seriesModel.seriesIndex;
    enableHoverEmphasis(polyline, focus, blurScope);
    var smooth = getSmooth(seriesModel.get('smooth'));
    var smoothMonotone = seriesModel.get('smoothMonotone');
    var connectNulls = seriesModel.get('connectNulls');
    polyline.setShape({
      smooth: smooth,
      smoothMonotone: smoothMonotone,
      connectNulls: connectNulls
    });

    if (polygon) {
      var stackedOnSeries = data.getCalculationInfo('stackedOnSeries');
      var stackedOnSmooth = 0;
      polygon.useStyle(defaults(areaStyleModel.getAreaStyle(), {
        fill: visualColor,
        opacity: 0.7,
        lineJoin: 'bevel',
        decal: data.getVisual('style').decal
      }));

      if (stackedOnSeries) {
        stackedOnSmooth = getSmooth(stackedOnSeries.get('smooth'));
      }

      polygon.setShape({
        smooth: smooth,
        stackedOnSmooth: stackedOnSmooth,
        smoothMonotone: smoothMonotone,
        connectNulls: connectNulls
      });
      setStatesStylesFromModel(polygon, seriesModel, 'areaStyle'); // Needs seriesIndex for focus

      getECData(polygon).seriesIndex = seriesModel.seriesIndex;
      enableHoverEmphasis(polygon, focus, blurScope);
    }

    var changePolyState = function (toState) {
      _this._changePolyState(toState);
    };

    data.eachItemGraphicEl(function (el) {
      // Switch polyline / polygon state if element changed its state.
      el && (el.onHoverStateChange = changePolyState);
    });
    this._polyline.onHoverStateChange = changePolyState;
    this._data = data; // Save the coordinate system for transition animation when data changed

    this._coordSys = coordSys;
    this._stackedOnPoints = stackedOnPoints;
    this._points = points;
    this._step = step;
    this._valueOrigin = valueOrigin;
  };

  LineView.prototype.dispose = function () {};

  LineView.prototype.highlight = function (seriesModel, ecModel, api, payload) {
    var data = seriesModel.getData();
    var dataIndex = queryDataIndex(data, payload);

    this._changePolyState('emphasis');

    if (!(dataIndex instanceof Array) && dataIndex != null && dataIndex >= 0) {
      var points = data.getLayout('points');
      var symbol = data.getItemGraphicEl(dataIndex);

      if (!symbol) {
        // Create a temporary symbol if it is not exists
        var x = points[dataIndex * 2];
        var y = points[dataIndex * 2 + 1];

        if (isNaN(x) || isNaN(y)) {
          // Null data
          return;
        } // fix #11360: should't draw symbol outside clipShapeForSymbol


        if (this._clipShapeForSymbol && !this._clipShapeForSymbol.contain(x, y)) {
          return;
        }

        symbol = new Symbol(data, dataIndex);
        symbol.x = x;
        symbol.y = y;
        symbol.setZ(seriesModel.get('zlevel'), seriesModel.get('z'));
        symbol.__temp = true;
        data.setItemGraphicEl(dataIndex, symbol); // Stop scale animation

        symbol.stopSymbolAnimation(true);
        this.group.add(symbol);
      }

      symbol.highlight();
    } else {
      // Highlight whole series
      ChartView.prototype.highlight.call(this, seriesModel, ecModel, api, payload);
    }
  };

  LineView.prototype.downplay = function (seriesModel, ecModel, api, payload) {
    var data = seriesModel.getData();
    var dataIndex = queryDataIndex(data, payload);

    this._changePolyState('normal');

    if (dataIndex != null && dataIndex >= 0) {
      var symbol = data.getItemGraphicEl(dataIndex);

      if (symbol) {
        if (symbol.__temp) {
          data.setItemGraphicEl(dataIndex, null);
          this.group.remove(symbol);
        } else {
          symbol.downplay();
        }
      }
    } else {
      // FIXME
      // can not downplay completely.
      // Downplay whole series
      ChartView.prototype.downplay.call(this, seriesModel, ecModel, api, payload);
    }
  };

  LineView.prototype._changePolyState = function (toState) {
    var polygon = this._polygon;
    setStatesFlag(this._polyline, toState);
    polygon && setStatesFlag(polygon, toState);
  };

  LineView.prototype._newPolyline = function (points) {
    var polyline = this._polyline; // Remove previous created polyline

    if (polyline) {
      this._lineGroup.remove(polyline);
    }

    polyline = new ECPolyline({
      shape: {
        points: points
      },
      segmentIgnoreThreshold: 2,
      z2: 10
    });

    this._lineGroup.add(polyline);

    this._polyline = polyline;
    return polyline;
  };

  LineView.prototype._newPolygon = function (points, stackedOnPoints) {
    var polygon = this._polygon; // Remove previous created polygon

    if (polygon) {
      this._lineGroup.remove(polygon);
    }

    polygon = new ECPolygon({
      shape: {
        points: points,
        stackedOnPoints: stackedOnPoints
      },
      segmentIgnoreThreshold: 2
    });

    this._lineGroup.add(polygon);

    this._polygon = polygon;
    return polygon;
  };

  LineView.prototype._initSymbolLabelAnimation = function (data, coordSys, clipShape) {
    var isHorizontalOrRadial;
    var isCoordSysPolar;
    var baseAxis = coordSys.getBaseAxis();
    var isAxisInverse = baseAxis.inverse;

    if (coordSys.type === 'cartesian2d') {
      isHorizontalOrRadial = baseAxis.isHorizontal();
      isCoordSysPolar = false;
    } else if (coordSys.type === 'polar') {
      isHorizontalOrRadial = baseAxis.dim === 'angle';
      isCoordSysPolar = true;
    }

    var seriesModel = data.hostModel;
    var seriesDuration = seriesModel.get('animationDuration');

    if (typeof seriesDuration === 'function') {
      seriesDuration = seriesDuration(null);
    }

    var seriesDalay = seriesModel.get('animationDelay') || 0;
    var seriesDalayValue = typeof seriesDalay === 'function' ? seriesDalay(null) : seriesDalay;
    data.eachItemGraphicEl(function (symbol, idx) {
      var el = symbol;

      if (el) {
        var point = [symbol.x, symbol.y];
        var start = void 0;
        var end = void 0;
        var current = void 0;

        if (isCoordSysPolar) {
          var polarClip = clipShape;
          var coord = coordSys.pointToCoord(point);

          if (isHorizontalOrRadial) {
            start = polarClip.startAngle;
            end = polarClip.endAngle;
            current = -coord[1] / 180 * Math.PI;
          } else {
            start = polarClip.r0;
            end = polarClip.r;
            current = coord[0];
          }
        } else {
          var gridClip = clipShape;

          if (isHorizontalOrRadial) {
            start = gridClip.x;
            end = gridClip.x + gridClip.width;
            current = symbol.x;
          } else {
            start = gridClip.y + gridClip.height;
            end = gridClip.y;
            current = symbol.y;
          }
        }

        var ratio = end === start ? 0 : (current - start) / (end - start);

        if (isAxisInverse) {
          ratio = 1 - ratio;
        }

        var delay = typeof seriesDalay === 'function' ? seriesDalay(idx) : seriesDuration * ratio + seriesDalayValue;
        var symbolPath = el.getSymbolPath();
        var text = symbolPath.getTextContent();
        el.attr({
          scaleX: 0,
          scaleY: 0
        });
        el.animateTo({
          scaleX: 1,
          scaleY: 1
        }, {
          duration: 200,
          delay: delay
        });

        if (text) {
          text.animateFrom({
            style: {
              opacity: 0
            }
          }, {
            duration: 300,
            delay: delay
          });
        }

        symbolPath.disableLabelAnimation = true;
      }
    });
  };

  LineView.prototype._initOrUpdateEndLabel = function (seriesModel, coordSys, inheritColor) {
    var endLabelModel = seriesModel.getModel('endLabel');

    if (endLabelModel.get('show')) {
      var data_2 = seriesModel.getData();
      var polyline = this._polyline;
      var endLabel = this._endLabel;

      if (!endLabel) {
        endLabel = this._endLabel = new ZRText({
          z2: 200 // should be higher than item symbol

        });
        endLabel.ignoreClip = true;
        polyline.setTextContent(this._endLabel);
        polyline.disableLabelAnimation = true;
      } // Find last non-NaN data to display data


      var dataIndex = getLastIndexNotNull(data_2.getLayout('points'));

      if (dataIndex >= 0) {
        setLabelStyle(polyline, getLabelStatesModels(seriesModel, 'endLabel'), {
          inheritColor: inheritColor,
          labelFetcher: seriesModel,
          labelDataIndex: dataIndex,
          defaultText: function (dataIndex, opt, interpolatedValue) {
            return interpolatedValue != null ? getDefaultInterpolatedLabel(data_2, interpolatedValue) : getDefaultLabel(data_2, dataIndex);
          },
          enableTextSetter: true
        }, getEndLabelStateSpecified(endLabelModel, coordSys));
        polyline.textConfig.position = null;
      }
    } else if (this._endLabel) {
      this._polyline.removeTextContent();

      this._endLabel = null;
    }
  };

  LineView.prototype._endLabelOnDuring = function (percent, clipRect, data, animationRecord, valueAnimation, endLabelModel, coordSys) {
    var endLabel = this._endLabel;
    var polyline = this._polyline;

    if (endLabel) {
      // NOTE: Don't remove percent < 1. percent === 1 means the first frame during render.
      // The label is not prepared at this time.
      if (percent < 1 && animationRecord.originalX == null) {
        animationRecord.originalX = endLabel.x;
        animationRecord.originalY = endLabel.y;
      }

      var points = data.getLayout('points');
      var seriesModel = data.hostModel;
      var connectNulls = seriesModel.get('connectNulls');
      var precision = endLabelModel.get('precision');
      var distance = endLabelModel.get('distance') || 0;
      var baseAxis = coordSys.getBaseAxis();
      var isHorizontal = baseAxis.isHorizontal();
      var isBaseInversed = baseAxis.inverse;
      var clipShape = clipRect.shape;
      var xOrY = isBaseInversed ? isHorizontal ? clipShape.x : clipShape.y + clipShape.height : isHorizontal ? clipShape.x + clipShape.width : clipShape.y;
      var distanceX = (isHorizontal ? distance : 0) * (isBaseInversed ? -1 : 1);
      var distanceY = (isHorizontal ? 0 : -distance) * (isBaseInversed ? -1 : 1);
      var dim = isHorizontal ? 'x' : 'y';
      var dataIndexRange = getIndexRange(points, xOrY, dim);
      var indices = dataIndexRange.range;
      var diff = indices[1] - indices[0];
      var value = void 0;

      if (diff >= 1) {
        // diff > 1 && connectNulls, which is on the null data.
        if (diff > 1 && !connectNulls) {
          var pt = getPointAtIndex(points, indices[0]);
          endLabel.attr({
            x: pt[0] + distanceX,
            y: pt[1] + distanceY
          });
          valueAnimation && (value = seriesModel.getRawValue(indices[0]));
        } else {
          var pt = polyline.getPointOn(xOrY, dim);
          pt && endLabel.attr({
            x: pt[0] + distanceX,
            y: pt[1] + distanceY
          });
          var startValue = seriesModel.getRawValue(indices[0]);
          var endValue = seriesModel.getRawValue(indices[1]);
          valueAnimation && (value = interpolateRawValues(data, precision, startValue, endValue, dataIndexRange.t));
        }

        animationRecord.lastFrameIndex = indices[0];
      } else {
        // If diff <= 0, which is the range is not found(Include NaN)
        // Choose the first point or last point.
        var idx = percent === 1 || animationRecord.lastFrameIndex > 0 ? indices[0] : 0;
        var pt = getPointAtIndex(points, idx);
        valueAnimation && (value = seriesModel.getRawValue(idx));
        endLabel.attr({
          x: pt[0] + distanceX,
          y: pt[1] + distanceY
        });
      }

      if (valueAnimation) {
        labelInner(endLabel).setLabelText(value);
      }
    }
  };
  /**
   * @private
   */
  // FIXME Two value axis


  LineView.prototype._doUpdateAnimation = function (data, stackedOnPoints, coordSys, api, step, valueOrigin) {
    var polyline = this._polyline;
    var polygon = this._polygon;
    var seriesModel = data.hostModel;
    var diff = lineAnimationDiff(this._data, data, this._stackedOnPoints, stackedOnPoints, this._coordSys, coordSys, this._valueOrigin, valueOrigin);
    var current = diff.current;
    var stackedOnCurrent = diff.stackedOnCurrent;
    var next = diff.next;
    var stackedOnNext = diff.stackedOnNext;

    if (step) {
      // TODO If stacked series is not step
      current = turnPointsIntoStep(diff.current, coordSys, step);
      stackedOnCurrent = turnPointsIntoStep(diff.stackedOnCurrent, coordSys, step);
      next = turnPointsIntoStep(diff.next, coordSys, step);
      stackedOnNext = turnPointsIntoStep(diff.stackedOnNext, coordSys, step);
    } // Don't apply animation if diff is large.
    // For better result and avoid memory explosion problems like
    // https://github.com/apache/incubator-echarts/issues/12229


    if (getBoundingDiff(current, next) > 3000 || polygon && getBoundingDiff(stackedOnCurrent, stackedOnNext) > 3000) {
      polyline.setShape({
        points: next
      });

      if (polygon) {
        polygon.setShape({
          points: next,
          stackedOnPoints: stackedOnNext
        });
      }

      return;
    }

    polyline.shape.__points = diff.current;
    polyline.shape.points = current;
    var target = {
      shape: {
        points: next
      }
    }; // Also animate the original points.
    // If points reference is changed when turning into step line.

    if (diff.current !== current) {
      target.shape.__points = diff.next;
    } // Stop previous animation.


    polyline.stopAnimation();
    updateProps(polyline, target, seriesModel);

    if (polygon) {
      polygon.setShape({
        // Reuse the points with polyline.
        points: current,
        stackedOnPoints: stackedOnCurrent
      });
      polygon.stopAnimation();
      updateProps(polygon, {
        shape: {
          stackedOnPoints: stackedOnNext
        }
      }, seriesModel); // If use attr directly in updateProps.

      if (polyline.shape.points !== polygon.shape.points) {
        polygon.shape.points = polyline.shape.points;
      }
    }

    var updatedDataInfo = [];
    var diffStatus = diff.status;

    for (var i = 0; i < diffStatus.length; i++) {
      var cmd = diffStatus[i].cmd;

      if (cmd === '=') {
        var el = data.getItemGraphicEl(diffStatus[i].idx1);

        if (el) {
          updatedDataInfo.push({
            el: el,
            ptIdx: i // Index of points

          });
        }
      }
    }

    if (polyline.animators && polyline.animators.length) {
      polyline.animators[0].during(function () {
        polygon && polygon.dirtyShape();
        var points = polyline.shape.__points;

        for (var i = 0; i < updatedDataInfo.length; i++) {
          var el = updatedDataInfo[i].el;
          var offset = updatedDataInfo[i].ptIdx * 2;
          el.x = points[offset];
          el.y = points[offset + 1];
          el.markRedraw();
        }
      });
    }
  };

  LineView.prototype.remove = function (ecModel) {
    var group = this.group;
    var oldData = this._data;

    this._lineGroup.removeAll();

    this._symbolDraw.remove(true); // Remove temporary created elements when highlighting


    oldData && oldData.eachItemGraphicEl(function (el, idx) {
      if (el.__temp) {
        group.remove(el);
        oldData.setItemGraphicEl(idx, null);
      }
    });
    this._polyline = this._polygon = this._coordSys = this._points = this._stackedOnPoints = this._endLabel = this._data = null;
  };

  LineView.type = 'line';
  return LineView;
}(ChartView);

function pointsLayout(seriesType, forceStoreInTypedArray) {
  return {
    seriesType: seriesType,
    plan: createRenderPlanner(),
    reset: function (seriesModel) {
      var data = seriesModel.getData();
      var coordSys = seriesModel.coordinateSystem;
      var pipelineContext = seriesModel.pipelineContext;
      var useTypedArray = forceStoreInTypedArray || pipelineContext.large;

      if (!coordSys) {
        return;
      }

      var dims = map(coordSys.dimensions, function (dim) {
        return data.mapDimension(dim);
      }).slice(0, 2);
      var dimLen = dims.length;
      var stackResultDim = data.getCalculationInfo('stackResultDimension');

      if (isDimensionStacked(data, dims[0]
      /*, dims[1]*/
      )) {
        dims[0] = stackResultDim;
      }

      if (isDimensionStacked(data, dims[1]
      /*, dims[0]*/
      )) {
        dims[1] = stackResultDim;
      }

      var dimInfo0 = data.getDimensionInfo(dims[0]);
      var dimInfo1 = data.getDimensionInfo(dims[1]);
      var dimIdx0 = dimInfo0 && dimInfo0.index;
      var dimIdx1 = dimInfo1 && dimInfo1.index;
      return dimLen && {
        progress: function (params, data) {
          var segCount = params.end - params.start;
          var points = useTypedArray && createFloat32Array(segCount * dimLen);
          var tmpIn = [];
          var tmpOut = [];

          for (var i = params.start, offset = 0; i < params.end; i++) {
            var point = void 0;

            if (dimLen === 1) {
              var x = data.getByDimIdx(dimIdx0, i); // NOTE: Make sure the second parameter is null to use default strategy.

              point = coordSys.dataToPoint(x, null, tmpOut);
            } else {
              tmpIn[0] = data.getByDimIdx(dimIdx0, i);
              tmpIn[1] = data.getByDimIdx(dimIdx1, i); // Let coordinate system to handle the NaN data.

              point = coordSys.dataToPoint(tmpIn, null, tmpOut);
            }

            if (useTypedArray) {
              points[offset++] = point[0];
              points[offset++] = point[1];
            } else {
              data.setItemLayout(i, point.slice());
            }
          }

          useTypedArray && data.setLayout('points', points);
        }
      };
    }
  };
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
var samplers = {
  average: function (frame) {
    var sum = 0;
    var count = 0;

    for (var i = 0; i < frame.length; i++) {
      if (!isNaN(frame[i])) {
        sum += frame[i];
        count++;
      }
    } // Return NaN if count is 0


    return count === 0 ? NaN : sum / count;
  },
  sum: function (frame) {
    var sum = 0;

    for (var i = 0; i < frame.length; i++) {
      // Ignore NaN
      sum += frame[i] || 0;
    }

    return sum;
  },
  max: function (frame) {
    var max = -Infinity;

    for (var i = 0; i < frame.length; i++) {
      frame[i] > max && (max = frame[i]);
    } // NaN will cause illegal axis extent.


    return isFinite(max) ? max : NaN;
  },
  min: function (frame) {
    var min = Infinity;

    for (var i = 0; i < frame.length; i++) {
      frame[i] < min && (min = frame[i]);
    } // NaN will cause illegal axis extent.


    return isFinite(min) ? min : NaN;
  },
  // TODO
  // Median
  nearest: function (frame) {
    return frame[0];
  }
};

var indexSampler = function (frame) {
  return Math.round(frame.length / 2);
};

function dataSample(seriesType) {
  return {
    seriesType: seriesType,
    // FIXME:TS never used, so comment it
    // modifyOutputEnd: true,
    reset: function (seriesModel, ecModel, api) {
      var data = seriesModel.getData();
      var sampling = seriesModel.get('sampling');
      var coordSys = seriesModel.coordinateSystem;
      var count = data.count(); // Only cartesian2d support down sampling. Disable it when there is few data.

      if (count > 10 && coordSys.type === 'cartesian2d' && sampling) {
        var baseAxis = coordSys.getBaseAxis();
        var valueAxis = coordSys.getOtherAxis(baseAxis);
        var extent = baseAxis.getExtent();
        var dpr = api.getDevicePixelRatio(); // Coordinste system has been resized

        var size = Math.abs(extent[1] - extent[0]) * (dpr || 1);
        var rate = Math.round(count / size);

        if (rate > 1) {
          if (sampling === 'lttb') {
            seriesModel.setData(data.lttbDownSample(data.mapDimension(valueAxis.dim), 1 / rate));
          }

          var sampler = void 0;

          if (typeof sampling === 'string') {
            sampler = samplers[sampling];
          } else if (typeof sampling === 'function') {
            sampler = sampling;
          }

          if (sampler) {
            // Only support sample the first dim mapped from value axis.
            seriesModel.setData(data.downSample(data.mapDimension(valueAxis.dim), 1 / rate, sampler, indexSampler));
          }
        }
      }
    }
  };
}

function install(registers) {
  registers.registerChartView(LineView);
  registers.registerSeriesModel(LineSeriesModel);
  registers.registerLayout(pointsLayout('line', true)); // Down sample after filter

  registers.registerProcessor(registers.PRIORITY.PROCESSOR.STATISTIC, dataSample('line'));
}

export { install as LineChart };
