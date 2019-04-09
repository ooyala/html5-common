module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: 'airbnb-base',
  globals: {
    expect: 0,
    OO: 0,
    it: 0,
    describe: 0,
    $: 0,
    after: 0,
    before: 0,
    beforeEach: 0,
    afterEach: 0,
    jsdom: 0,
    COMMON_SRC_ROOT: 0,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    "max-len": [
      "error", 110,
      {
        "ignoreComments": true,
        "ignorePattern": "if \\(\/\\(\\w*|\\)\/",
        "ignoreUrls": true,
        "ignoreRegExpLiterals": true,
        "ignoreTemplateLiterals": true
      }
    ],
    "no-plusplus": [
      "error",
      {
        "allowForLoopAfterthoughts": true
      }
    ],
    "no-param-reassign": [
      "error",
      {
        "props": false
      }
    ],
    "no-underscore-dangle": 0,
    "require-jsdoc": [
      "error",
      {
      "require": {
        "FunctionDeclaration": true,
        "MethodDefinition": true,
        "ClassDeclaration": true,
        "ArrowFunctionExpression": true,
        "FunctionExpression": true
      }
    }],
    "valid-jsdoc": [
      "error",
      {
        "prefer": {
          "return": "returns"
        },
        "requireReturn": false
      }
    ],
    "func-names": 0,
    "no-restricted-syntax": "warn",
  },
};
