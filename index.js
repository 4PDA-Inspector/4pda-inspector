if (typeof inspector4pda == "undefined") {
  inspector4pda = {};
}

var sdkSelf = require("sdk/self");

let { Cc, Ci, Cu } = require('chrome');
var instance = Cc["@mozilla.org/moz/jssubscript-loader;1"];
var loader = instance.getService(Ci.mozIJSSubScriptLoader);

var { setTimeout, clearTimeout } = require("sdk/timers");

loader.loadSubScript(sdkSelf.data.url("js/browser.js"));
loader.loadSubScript(sdkSelf.data.url("js/utils.js"));
loader.loadSubScript(sdkSelf.data.url("js/classes/vars.js"));
loader.loadSubScript(sdkSelf.data.url("js/classes/xhr.js"));
loader.loadSubScript(sdkSelf.data.url("js/classes/user.js"));
loader.loadSubScript(sdkSelf.data.url("js/classes/themes.js"));
loader.loadSubScript(sdkSelf.data.url("js/classes/qms.js"));
loader.loadSubScript(sdkSelf.data.url("js/contentscript.js"));

// jpm run -b /usr/bin/firefox -p dev
// jpm watchpost --post-url http://127.0.0.1:8888/
// extensions.sdk.console.logLevel : all