var bcryptSchema = require('..'),
    bcrypt = require('bcrypt'),
    sinon = require('sinon'),
    compare, genSalt, hash

describe('bcrypt-schema', function() {
    before('mock bcrypt', function() {
        compare = sinon.stub(bcrypt, 'compare').yields(null, true)
        genSalt = sinon.stub(bcrypt, 'genSalt').yields(null, 'test-salt')
        hash = sinon.stub(bcrypt, 'hash').yields(null, 'test-hash')
    })
    after('restore bcrypt', function() {
        bcrypt.compare.restore()
        bcrypt.genSalt.restore()
        bcrypt.hash.restore()
    })
    describe('verify(value, hash, next)', function() {
        beforeEach('call verify', function(done) {
            var value = 'test-value',
                hash = 'test-hash'
            bcryptSchema.verify(value, hash, function() {
                done()
            })
        })
        it('should compare a given value with a given hash', function() {
            expect(compare).calledOnce
        })
    })
    describe('set(value, hashField, next)', function() {
        beforeEach('call set', function(done) {
            var value = 'test-value',
                hashField = 'hashedValue'
            bcryptSchema.set(value, hashField, function() {
                done()
            })
        })
        it('should hash a value', function() {
            expect(genSalt).calledOnce
            expect(hash).calledOnce
        })
        it('should set the field with the generate hash', function() {
            expect(bcryptSchema.hashedValue).to.equal('test-hash')
        })
    })
    describe('setEncyption(schema, options)', function() {
        var schema = {
            methods: {}
        }
        afterEach('reset schema object', function() {
            schema = {
                methods: {}
            }
        })
        describe('when shorthand', function() {
            beforeEach('call setEncryption(schema, field)', function() {
                var field = 'hashedFieldName'
                bcryptSchema.setEncryption(schema, field)
            })
            it('should set schema methods names', function() {
                expect(schema.methods).to.have.property('verifyHashedFieldName')
                expect(schema.methods).to.have.property('setHashedFieldName')
            })
            it('should set schema methods', function() {
                expect(schema.methods.verifyHashedFieldName).to.be.a('function')
                expect(schema.methods.setHashedFieldName).to.be.a('function')
            })
        })
        describe('when full', function() {
            beforeEach('call setEncryption(schema, options)', function() {
                var options = {
                    field: 'hashedFieldName',
                    verify: 'customVerifyName',
                    set: 'customSetName'
                }
                bcryptSchema.setEncryption(schema, options)
            })
            it('should set schema method names', function() {
                expect(schema.methods).to.have.property('customVerifyName')
                expect(schema.methods).to.have.property('customSetName')
            })
            it('should set schema methods', function() {
                expect(schema.methods.customSetName).to.be.a('function')
                expect(schema.methods.customVerifyName).to.be.a('function')
            })
        })
    })
    describe('getVerifierForField(fieldName)', function() {
        var result
        beforeEach('call getVerifierForField', function() {
            result = bcryptSchema._getVerifierForField('test-field')
        })
        it('should return a function', function() {
            expect(result).to.be.a('function')
        })
    })
    describe('getSetterForField(fieldName)', function() {
        var result
        beforeEach('call getSetterForField', function() {
            result = bcryptSchema._getSetterForField('test-field')
        })
        it('should return a function', function() {
            expect(result).to.be.a('function')
        })
    })
})
