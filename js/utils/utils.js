(function (OO, _, $) {
  OO.getRandomString = function () { return Math.random().toString(36).substring(7); };

  OO.safeClone = function (source) {
    if (_.isNumber(source) || _.isString(source) || _.isBoolean(source) || _.isFunction(source)
          || _.isNull(source) || _.isUndefined(source)) {
      return source;
    }
    const result = (source instanceof Array) ? [] : {};
    try {
      $.extend(true, result, source);
    } catch (e) { OO.log('deep clone error', e); }
    return result;
  };

  OO.d = function () {
    if (OO.isDebug) { OO.log.apply(OO, arguments); }
    OO.$('#OOYALA_DEBUG_CONSOLE').append(`${JSON.stringify(OO.safeClone(arguments))}<br>`);
  };

  // Note: This inherit only for simple inheritance simulation, the Parennt class still has a this binding
  // to the parent class. so any variable initiated in the Parent Constructor, will not be available to the
  // Child Class, you need to copy paste constructor to Child Class to make it work.
  // coffeescript is doing a better job here by binding the this context to child in the constructor.
  // Until we switch to CoffeeScript, we need to be careful using this simplified inherit lib.
  OO.inherit = function (ParentClass, myConstructor) {
    if (typeof (ParentClass) !== 'function') {
      OO.log('invalid inherit, ParentClass need to be a class', ParentClass);
      return null;
    }
    const SubClass = function () {
      ParentClass.apply(this, arguments);
      if (typeof (myConstructor) === 'function') { myConstructor.apply(this, arguments); }
    };
    const parentClass = new ParentClass();
    OO._.extend(SubClass.prototype, parentClass);
    SubClass.prototype.parentClass = parentClass;
    return SubClass;
  };

  const styles = {}; // keep track of all styles added so we can remove them later if destroy is called

  OO.attachStyle = function (styleContent, playerId) {
    const s = $(`<style type="text/css">${styleContent}</style>`).appendTo('head');
    styles[playerId] = styles[playerId] || [];
    styles[playerId].push(s);
  };

  OO.removeStyles = function (playerId) {
    OO._.each(styles[playerId], (style) => {
      style.remove();
    });
  };

  // object: object to get the inner property for, ex. {"mod":{"fw":{"data":{"key":"val"}}}}
  // keylist: list of keys to find, ex. ["mod", "fw", "data"]
  // example output: {"key":"val"}
  OO.getInnerProperty = function (object, keylist) {
    let innerObject = object;
    const list = keylist;
    while (list.length > 0) {
      const key = list.shift();
      // Note that function and arrays are objects
      if (_.isNull(innerObject) || !_.isObject(innerObject)
            || _.isFunction(innerObject) || _.isArray(innerObject)) { return null; }
      innerObject = innerObject[key];
    }
    return innerObject;
  };

  OO.formatSeconds = function (timeInSeconds) {
    let seconds = parseInt(timeInSeconds, 10) % 60;
    let hours = parseInt(timeInSeconds / 3600, 10);
    let minutes = parseInt((timeInSeconds - hours * 3600) / 60, 10);


    if (hours < 10) {
      hours = `0${hours}`;
    }

    if (minutes < 10) {
      minutes = `0${minutes}`;
    }

    if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    return (parseInt(hours, 10) > 0) ? (`${hours}:${minutes}:${seconds}`) : (`${minutes}:${seconds}`);
  };

  OO.timeStringToSeconds = function (timeString) {
    const timeArray = (timeString || '').split(':');
    return _.reduce(timeArray, (m, s) => m * 60 + parseInt(s, 10), 0);
  };

  OO.leftPadding = function (num, totalChars) {
    const pad = '0';
    let numString = num ? num.toString() : '';
    while (numString.length < totalChars) {
      numString = pad + numString;
    }
    return numString;
  };

  OO.getColorString = function (color) {
    return `#${(OO.leftPadding(color.toString(16), 6)).toUpperCase()}`;
  };

  OO.hexToRgb = function (hex) {
    const r = (hex & 0xFF0000) >> 16;
    const g = (hex & 0xFF00) >> 8;
    const b = (hex & 0xFF);
    return [r, g, b];
  };

  OO.changeColor = function (color, ratio, darker) {
    const minmax = darker ? Math.max : Math.min;
    const boundary = darker ? 0 : 255;
    const difference = Math.round(ratio * 255) * (darker ? -1 : 1);
    const rgb = OO.hexToRgb(color);
    return [
      OO.leftPadding(minmax(rgb[0] + difference, boundary).toString(16), 2),
      OO.leftPadding(minmax(rgb[1] + difference, boundary).toString(16), 2),
      OO.leftPadding(minmax(rgb[2] + difference, boundary).toString(16), 2),
    ].join('');
  };

  OO.decode64 = function (s) {
    s = s.replace(/\n/g, '');
    let results = '';
    let j; let
      i = 0;
    const enc = [];
    const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    // shortcut for browsers with atob
    if (window.atob) {
      return atob(s);
    }

    do {
      for (j = 0; j < 4; j++) {
        enc[j] = b64.indexOf(s.charAt(i++));
      }
      results += String.fromCharCode((enc[0] << 2) | (enc[1] >> 4),
        enc[2] == 64 ? 0 : ((enc[1] & 15) << 4) | (enc[2] >> 2),
        enc[3] == 64 ? 0 : ((enc[2] & 3) << 6) | enc[3]);
    } while (i < s.length);

    // trim tailing null characters
    return results.replace(/\0/g, '');
  };

  OO.pixelPing = function (url) {
    const img = new Image();
    img.onerror = img.onabort = function () { OO.d('onerror:', url); };
    img.src = OO.getNormalizedTagUrl(url);
  };

  // ping array of urls.
  OO.pixelPings = function (urls) {
    if (_.isEmpty(urls)) { return; }
    _.each(urls, (url) => {
      OO.pixelPing(url);
    }, this);
  };

  // helper function to convert types to boolean
  // the (!!) trick only works to verify if a string isn't the empty string
  // therefore, we must use a special case for that
  OO.stringToBoolean = function (value) {
    if (typeof value === 'string') {
      return (value.toLowerCase().indexOf('true') > -1 || value.toLowerCase().indexOf('yes') > -1);
    }
    return !!value;
  };

  OO.regexEscape = function (value) {
    const specials = /[<>()\[\]{}]/g;
    return value.replace(specials, '\\$&');
  };

  OO.getNormalizedTagUrl = function (url, embedCode) {
    const ts = new Date().getTime();
    const pageUrl = escape(document.URL);

    const placeHolderReplace = function (template, replaceValue) {
      _.each(template, (placeHolder) => {
        const regexSearchVal = new RegExp(`(${
          OO.regexEscape(placeHolder)})`, 'gi');
        url = url.replace(regexSearchVal, replaceValue);
      }, this);
    };

    // replace the timestamp and referrer_url placeholders
    placeHolderReplace(OO.TEMPLATES.RANDOM_PLACE_HOLDER, ts);
    placeHolderReplace(OO.TEMPLATES.REFERAK_PLACE_HOLDER, pageUrl);

    // first make sure that the embedCode exists, then replace the
    // oo_embedcode placeholder
    if (embedCode) {
      placeHolderReplace(OO.TEMPLATES.EMBED_CODE_PLACE_HOLDER, embedCode);
    }
    return url;
  };

  OO.safeSeekRange = function (seekRange) {
    return {
      start: seekRange.length > 0 ? seekRange.start(0) : 0,
      end: seekRange.length > 0 ? seekRange.end(0) : 0,
    };
  };

  OO.loadedJS = OO.loadedJS || {};

  OO.jsOnSuccessList = OO.jsOnSuccessList || {};

  OO.safeFuncCall = function (fn) {
    if (typeof fn !== 'function') { return; }
    try {
      fn.apply();
    } catch (e) {
      OO.log('Can not invoke function!', e);
    }
  };

  OO.loadScriptOnce = function (jsSrc, successCallBack, errorCallBack, timeoutInMillis) {
    OO.jsOnSuccessList[jsSrc] = OO.jsOnSuccessList[jsSrc] || [];
    if (OO.loadedJS[jsSrc]) {
      // invoke call back directly if loaded.
      if (OO.loadedJS[jsSrc] === 'loaded') {
        OO.safeFuncCall(successCallBack);
      } else if (OO.loadedJS[jsSrc] === 'loading') {
        OO.jsOnSuccessList[jsSrc].unshift(successCallBack);
      }
      return false;
    }
    OO.loadedJS[jsSrc] = 'loading';
    $.ajax({
      url: jsSrc,
      type: 'GET',
      cache: true,
      dataType: 'script',
      timeout: timeoutInMillis || 15000,
      success() {
        OO.loadedJS[jsSrc] = 'loaded';
        OO.jsOnSuccessList[jsSrc].unshift(successCallBack);
        OO._.each(OO.jsOnSuccessList[jsSrc], (fn) => {
          OO.safeFuncCall(fn);
        }, this);
        OO.jsOnSuccessList[jsSrc] = [];
      },
      error() {
        OO.safeFuncCall(errorCallBack);
      },
    });
    return true;
  };

  try {
    OO.localStorage = window.localStorage;
  } catch (err) {
    OO.log(err);
  }
  if (!OO.localStorage) {
    OO.localStorage = {
      getItem(sKey) {
        if (!sKey || !this.hasOwnProperty(sKey)) { return null; }
        return unescape(document.cookie.replace(new RegExp(`(?:^|.*;\\s*)${escape(sKey).replace(/[\-\.\+\*]/g, '\\$&')}\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*`), '$1'));
      },
      key(nKeyId) {
        return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, '').split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
      },
      setItem(sKey, sValue) {
        if (!sKey) { return; }
        document.cookie = `${escape(sKey)}=${escape(sValue)}; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/`;
        this.length = document.cookie.match(/\=/g).length;
      },
      length: 0,
      removeItem(sKey) {
        if (!sKey || !this.hasOwnProperty(sKey)) { return; }
        document.cookie = `${escape(sKey)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        this.length--;
      },
      hasOwnProperty(sKey) {
        return (new RegExp(`(?:^|;\\s*)${escape(sKey).replace(/[\-\.\+\*]/g, '\\$&')}\\s*\\=`)).test(document.cookie);
      },
    };
    OO.localStorage.length = (document.cookie.match(/\=/g) || OO.localStorage).length;
  }

  // A container to properly request OO.localStorage.setItem
  OO.setItem = function (sKey, sValue) {
    try {
      OO.localStorage.setItem(sKey, sValue);
    } catch (err) {
      OO.log(err);
    }
  };

  /**
     * Converts a value to a number or returns null if it can't be converted or is not a finite value.
     * @public
     * @method OO#ensureNumber
     * @param {*} value The value to convert.
     * @param {*} defaultValue A default value to return when the input is not a valid number.
     * @returns {Number} The Number equivalent of value if it can be converted and is finite.
     * When value doesn't meet the criteria the function will return either defaultValue (if provided) or null.
     */
  OO.ensureNumber = function (value, defaultValue) {
    let number;
    if (value === null || _.isArray(value)) {
      value = NaN;
    }
    if (_.isNumber(value)) {
      number = value;
    } else {
      number = Number(value);
    }
    if (!isFinite(number)) {
      return (typeof defaultValue === 'undefined') ? null : defaultValue;
    }
    return number;
  };

  OO.JSON = window.JSON;
}(OO, OO._, OO.$));
