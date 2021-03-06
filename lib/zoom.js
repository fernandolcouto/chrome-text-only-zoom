// Generated by CoffeeScript 1.6.3
(function() {
  'use strict';
  var IGNORED_TAGS, ZOOM_LEVEL_KEY, addImportantStyle, changeFont, getKeyFromBackground, multiplyByRatio, totalRatio, zoomLevel;

  window.zoomTextOnlyLoaded = true;

  totalRatio = 1;

  ZOOM_LEVEL_KEY = 'zoomLevel';

  IGNORED_TAGS = /SCRIPT|NOSCRIPT|LINK|BR|EMBED|IFRAME|IMG|VIDEO|CANVAS|STYLE/;

  multiplyByRatio = function(value, multiplier) {
    return (parseFloat(value) * multiplier) + 'px';
  };

  addImportantStyle = function(el, name, value) {
    return el.style.cssText += "" + name + ": " + value + " !important;";
  };

  changeFont = function(ratioDiff, notification) {
    var call, changeFontSizeCalls, el, multiplier, prevRatio, relevantElements, _i, _j, _len, _len1, _results;
    if (notification == null) {
      notification = true;
    }
    changeFontSizeCalls = [];
    prevRatio = totalRatio;
    totalRatio += ratioDiff;
    totalRatio = Math.round(totalRatio * 10) / 10;
    multiplier = totalRatio / prevRatio;
    relevantElements = document.querySelectorAll('body, body *');
    if (notification) {
      setTimeout(function() {
        return alertify.log("Text Zoom " + ((totalRatio * 100).toFixed()) + "%");
      });
    }
    if (totalRatio === 1) {
      for (_i = 0, _len = relevantElements.length; _i < _len; _i++) {
        el = relevantElements[_i];
        el.style['transition'] = null;
        el.style['font-size'] = null;
        el.style['line-height'] = null;
      }
      return util.putInLocalStorage(ZOOM_LEVEL_KEY, false);
    }
    util.putInLocalStorage(ZOOM_LEVEL_KEY, totalRatio - 1);
    [].forEach.call(relevantElements, function(el) {
      var computedStyle, currentLh, fontSize, lineHeight, tagName;
      tagName = el.tagName;
      if (tagName.match(IGNORED_TAGS)) {
        return;
      }
      computedStyle = getComputedStyle(el);
      if (!util.isBlank(el.innerText) || (tagName === 'TEXTAREA')) {
        currentLh = computedStyle.lineHeight;
        if (currentLh.indexOf('px') !== -1) {
          lineHeight = multiplyByRatio(currentLh, multiplier);
        }
      }
      fontSize = multiplyByRatio(computedStyle.fontSize, multiplier);
      return changeFontSizeCalls.push(function() {
        el.style['transition'] = 'font 0s';
        addImportantStyle(el, 'font-size', fontSize);
        if (lineHeight !== void 0) {
          return addImportantStyle(el, 'line-height', lineHeight);
        }
      });
    });
    _results = [];
    for (_j = 0, _len1 = changeFontSizeCalls.length; _j < _len1; _j++) {
      call = changeFontSizeCalls[_j];
      _results.push(call());
    }
    return _results;
  };

  getKeyFromBackground = function(keyName, keyFunction) {
    return chrome.extension.sendMessage({
      key: keyName
    }, function(res) {
      return Mousetrap.bind(res.key, keyFunction);
    });
  };

  getKeyFromBackground(util.KEYS.ZOOM_IN_KEY, function() {
    return changeFont(0.1);
  });

  getKeyFromBackground(util.KEYS.ZOOM_OUT_KEY, function() {
    return changeFont(-0.1);
  });

  getKeyFromBackground(util.KEYS.ZOOM_RESET_KEY, function() {
    totalRatio = 1;
    return changeFont(0);
  });

  zoomLevel = util.getFromLocalStorage(ZOOM_LEVEL_KEY);

  if (zoomLevel) {
    changeFont(zoomLevel, false);
  }

}).call(this);
