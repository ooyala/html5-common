require("./InitOO.js");

//if player params doesn't exist or is empty, then fill it with these default values
if (!OO.playerParams)
{
  OO.playerParams = {};
}

if (!OO.playerParams.core_version)
{
  OO.playerParams.core_version = 4;
}

if (!OO.playerParams.vast_proxy_url)
{
  OO.playerParams.vast_proxy_url = "http://player.ooyala.com/adinsertion/vast_proxy";
}
