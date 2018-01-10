require("./InitOO.js");

if ($ !== undefined) {
  $.noConflict();
}
if (!(jQuery && $)) {
  window.jQuery = require('jquery');
  window.$ = require('jquery');
}

if (!(OO.jQuery && OO.$)) {
  OO.jQuery = window.jQuery;
  OO.$ = window.$;
}