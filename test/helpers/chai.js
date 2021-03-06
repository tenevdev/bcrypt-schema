// Configure chai for global usage
var chai = require('chai'),
    sinonChai = require('sinon-chai')

chai.use(sinonChai)
chai.config.includeStack = true

global.expect = chai.expect
global.AssertionError = chai.AssertionError
global.Assertion = chai.Assertion
global.assert = chai.assert
