UNIT_TESTS = test/unit-tests/*.js
REPORTER = tap
MOCHA_BIN = ./node_modules/.bin/mocha
MOCHA = ./node_modules/.bin/_mocha

test:
	@NODE_ENV=test $(MOCHA_BIN) \
      --timeout 3500 \
      --require test/unit-test-helpers/default_test_env.js \
			--reporter $(REPORTER) \
			$(UNIT_TESTS)

.PHONY: test
