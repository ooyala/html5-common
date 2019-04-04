module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: 'airbnb-base',
  globals: {
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    "max-len": [
      "warn", 110,
      {
        "ignoreComments": true,
        "ignorePattern": "if \\(\/\\(\\w*|\\)\/",
        "ignoreUrls": true,
        "ignoreRegExpLiterals": true,
        "ignoreTemplateLiterals": true
      }
    ],
    "no-plusplus": [
      "warn",
      {
        "allowForLoopAfterthoughts": true
      }
    ],
    "no-param-reassign": [
      "warn",
      {
        "props": false
      }
    ],
    "require-jsdoc": [
      "warn",
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
      "warn",
      {
        "prefer": {
          "return": "returns"
        },
        "requireReturn": false
      }
    ],
    "no-undef": "warn",
    "no-extend-native": "warn",
    "new-cap": "warn",
    "import/no-dynamic-require": "warn",
    "eqeqeq": "warn",
    "no-unused-vars": "warn",
    "no-throw-literal": "warn",
    "prefer-rest-params": "warn",
    "global-require": "warn",
    "no-prototype-builtins": "warn",
    "no-useless-escape": "warn",
    "no-bitwise": "warn",
    "no-restricted-globals": "warn",
    "no-multi-assign": "warn",
    "prefer-spread": "warn",
    "no-mixed-operators": "warn",
    "radix": "warn",
    "no-underscore-dangle": "warn",
    "no-multi-str": "warn",
    "prefer-destructuring": "warn",
    "no-dupe-keys": "warn",
    "no-use-before-define": "warn",
    "guard-for-in": "warn",
    "default-case": "warn",
    "no-shadow": "warn",
    "no-nested-ternary": "warn",
    "no-useless-concat": "warn",
    "no-restricted-syntax": "warn",
    "import/no-extraneous-dependencies": "warn",
  },
};
