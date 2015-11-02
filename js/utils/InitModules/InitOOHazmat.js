require("./InitOOUnderscore.js");

if (!window.Hazmat)
{
  require('hazmat');
}

if (!OO.HM)
{
  OO.HM = window.Hazmat.noConflict().create();
}
