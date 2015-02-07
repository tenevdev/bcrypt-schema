# Detect Windows OS
ifdef SystemRoot
	# Fix slashes of path to work on Windows
	FixPath = $(subst /,\,$1)
else
	FixPath = $1
endif

NODE_MODULES = ./node_modules/.bin/
MOCHA = ./node_modules/mocha/bin/
TESTS_PATH = test/
COVERAGE_REPORT = ./coverage/lcov.info
COVERALLS = ./node_modules/coveralls/bin/coveralls.js

test:
	$(call FixPath, $(NODE_MODULES))mocha $(TEST_PATH)

test-cov: istanbul

istanbul:
	$(call FixPath, $(NODE_MODULES))istanbul cover$(call FixPath, $(MOCHA))_mocha $(TESTS_INTEGRATION) $(TESTS_UNIT)

coveralls:
	cat $(COVERAGE_REPORT) | $(COVERALLS)

.PHONY: test
