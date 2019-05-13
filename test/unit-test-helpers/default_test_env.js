/* eslint-disable import/no-dynamic-require,global-require,require-jsdoc */
// Assuming that this repo lives as a submodule at the root folder of other repos, this is the code location
global.SRC_ROOT = '../../../js/';
global.TEST_ROOT = '../../../test/';

// path
global.COMMON_SRC_ROOT = '../../js/';
global.COMMON_TEST_ROOT = '../../test/';
global.OO = {
  publicApi: {}, platform: 'MacIntel', os: {}, browser: { version: 1, webkit: true }, TEST_TEST_TEST: true,
};

global.TestHelper = {
  runFileInThisContext(fileName) {
    const fileContents = require('fs').readFileSync(require.resolve(fileName), 'utf8');
    require('vm').runInThisContext(fileContents);
  },
};

global.jsdom = require('jsdom');

const { JSDOM } = jsdom;
const dom = new JSDOM('<html><head></head><body>howdy</body></html>');
global.window = dom.window;
global.document = dom.window.document;

// The function setTimeout from jsdom is not working, this overwrites the function with the function defined
// by node
global.window.setTimeout = setTimeout;
global.navigator = window.navigator;
global.window.$ = require('jquery');

OO.$ = global.window.$;

global.expect = require('expect.js');

// a wrapper domparser simulating Mozilla DOMParser in the browser:
window.DOMParser = function () {};
require(`${COMMON_SRC_ROOT}utils/InitModules/InitOOUnderscore.js`);

OO._.extend(window.DOMParser.prototype, {
  parseFromString(data) {
    return jsdom.jsdom(data, jsdom.level(3, 'core'));
  },
});
// eslint-disable-next-line no-console
OO.log = console.log;
// In a browser environment, all of the properties of "window" (like navigator) are in the global scope:
OO._.extend(global, window);

require(`${COMMON_SRC_ROOT}utils/InitModules/InitOOHazmat.js`);
require(`${COMMON_SRC_ROOT}utils/InitModules/InitOOPlayerParamsDefault.js`);
