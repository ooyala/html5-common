require("./InitOOUnderscore.js");

var hazmatConfig = {};

// 'debugHazmat' flag needs to be set before plugins are loaded. If we added
// this flag to the OO namespace, it would be overriden during plugin initalization,
// so we need to use a global var instead
if (window && !window.debugHazmat) {
  hazmatConfig = {
    warn: function() { return; }
  };
}

if ((!OO.HM) && (typeof window === 'undefined' || typeof window._ === 'undefined'))
{
  OO.HM = require('hazmat').create(hazmatConfig);
}
else if (!window.Hazmat)
{
  require('hazmat');
}

if (!OO.HM)
{
  OO.HM = window.Hazmat.noConflict().create(hazmatConfig);
}
