require("./InitOO.js");

if (!OO.$)
{
  var $ = require('jquery');
  OO.$ = OO.$ = $.noConflict(true);
}
