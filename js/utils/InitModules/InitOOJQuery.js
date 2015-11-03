require("./InitOO.js");

if (!window.$)
{
  window.$ = require('jquery');
}

$ = window.$.noConflict(true);

if (!OO.$)
{
  OO.$ = $;
}
