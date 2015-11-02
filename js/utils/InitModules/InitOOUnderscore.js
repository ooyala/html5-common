require("./InitOO.js");

if (!window._)
{
  window._ = require('underscore');
}

if (!OO._)
{
  OO._ = window._.noConflict();
}
