require("./InitOO.js");

if (typeof $ !== "undefined") {
  $.noConflict();
}
if (!(window.jQuery && window.$)) {
  window.jQuery = require("jquery");
  window.$ = require("jquery");
}

if (!(OO.jQuery && OO.$)) {
  OO.jQuery = window.jQuery;
  OO.$ = window.$;
}