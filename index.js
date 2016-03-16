if (typeof inspector4pda == "undefined") {
  inspector4pda = {};
}

var self = require("sdk/self");

let { Cc, Ci, Cu } = require('chrome');
var instance = Cc["@mozilla.org/moz/jssubscript-loader;1"];
var loader = instance.getService(Ci.mozIJSSubScriptLoader);

var { setTimeout, clearTimeout } = require("sdk/timers");

loader.loadSubScript(self.data.url("js/browser.js"));
loader.loadSubScript(self.data.url("js/utils.js"));
loader.loadSubScript(self.data.url("js/classes/vars.js"));
loader.loadSubScript(self.data.url("js/classes/xhr.js"));
loader.loadSubScript(self.data.url("js/classes/user.js"));
loader.loadSubScript(self.data.url("js/classes/themes.js"));
loader.loadSubScript(self.data.url("js/classes/qms.js"));
loader.loadSubScript(self.data.url("js/contentscript.js"));