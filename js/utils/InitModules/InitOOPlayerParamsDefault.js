require("./InitOO.js");

//if player params doesn't exist or is empty, then fill it with these default values
if (!!OO.playerParams)
{
  OO.playerParams =
    {
      "core_version" : 4,
      "vast_proxy_url" : "http://player.ooyala.com/adinsertion/vast_proxy"
    };
}
