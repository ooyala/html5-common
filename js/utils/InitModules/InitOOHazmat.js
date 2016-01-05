require("./InitOOUnderscore.js");

if ((!OO.HM) && (typeof window === 'undefined' || typeof window._ === 'undefined'))
{
  OO.HM = require('hazmat').create();
}
else if (!window.Hazmat)
{
  require('hazmat');
}

if (!OO.HM)
{
  OO.HM = window.Hazmat.noConflict().create();
}
