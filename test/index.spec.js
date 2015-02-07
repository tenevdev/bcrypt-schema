var bcryptSchema = require('..'),
    bcrypt = require('bcrypt'),
    sinon = require('sinon'),
    passingValue = 'passing-value',
    failingValue = 'failing-value',
    errorValue = 'error-value',
    hashValue = 'hash-value',
    hashField = 'hash-field',
    saltValue = 'salt-value',
    compare, passingCompare, failingCompare, errorCompare,
    genSalt, passingGenSalt,
    hash, passingHash, errorHash

describe('bcrypt-schema', function() {
    before('mock bcrypt', function() {
        compare = sinon.stub(bcrypt, 'compare')
        passingCompare = compare.withArgs(passingValue, hashValue).yields(null, true)
        failingCompare = compare.withArgs(failingValue, hashValue).yields(null, false)
        errorCompare = compare.withArgs(errorValue, hashValue).yields('error', undefined)

        genSalt = sinon.stub(bcrypt, 'genSalt')
        passingGenSalt = genSalt.withArgs(10).yields(null, saltValue)

        hash = sinon.stub(bcrypt, 'hash')
        passingHash = hash.withArgs(passingValue, saltValue).yields(null, hashValue)
        errorHash = hash.withArgs(errorValue, saltValue).yields('error')
    })
    after('restore bcrypt', function() {
        bcrypt.compare.restore()
        bcrypt.genSalt.restore()
        bcrypt.hash.restore()
    })
    describe('verify(value, hash, next)', function() {
        describe('when comparison succeeds', function() {
            it('should call next with no error and true', function(done) {
                bcryptSchema.verify(passingValue, hashValue, function(err, isVerified) {
                    expect(err).to.not.exist
                    expect(isVerified).to.equal(true)
                    done()
                })
            })
            after('should compare a given value with a given hash', function() {
                expect(passingCompare).calledOnce
            })
        })
        describe('when comparison fails', function() {
            it('should call next with no error and false', function(done) {
                bcryptSchema.verify(failingValue, hashValue, function(err, isVerified) {
                    expect(err).to.not.exist
                    expect(isVerified).to.equal(false)
                    done()
                })
            })
            after('should compare a given value with a given hash', function() {
                expect(failingCompare).calledOnce
            })
        })
        describe('when an error occurs in comparison', function() {
            it('should call next with an error', function(done) {
                bcryptSchema.verify(errorValue, hashValue, function(err, isVerified) {
                    expect(err).to.exist
                    done()
                })
            })
            after('should compare a given value with a given hash', function() {
                expect(errorCompare).calledOnce
            })
        })
    })
    describe('set(value, hashField, next)', function() {
        after('should hash a value', function() {
            expect(passingGenSalt).calledTwice
            expect(passingHash).calledOnce
            expect(errorHash).calledOnce
        })
        it('should set the field with the generate hash', function(done) {
            bcryptSchema.set(passingValue, hashField, function(err) {
                expect(err).to.not.exist
                expect(bcryptSchema[hashField]).to.equal(hashValue)
                done()
            })
        })
        it('should call next with error when there is error in hash', function(done) {
            bcryptSchema.set(errorValue, hashField, function(err) {
                expect(err).to.exist
                done()
            })
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
    describe('private members', function() {
        describe('getVerifierForField(fieldName)', function() {
            var verifier = bcryptSchema.getVerifierForField(hashField),
                user = {
                    verify: verifier
                }
            user[hashField] = hashValue
            it('should return a function', function() {
                expect(verifier).to.be.a('function')
            })
            describe('and this function', function() {
                it('should verify a passing value', function(done) {
                    user.verify(passingValue, function(err, isVerified) {
                        expect(err).to.not.exist
                        expect(isVerified).to.be.true
                        done()
                    })
                })
                it('should not verify a failing value', function(done) {
                    user.verify(failingValue, function(err, isVerified) {
                        expect(err).to.not.exist
                        expect(isVerified).to.be.false
                        done()
                    })
                })
                it('should error if an error occurs', function(done) {
                    user.verify(errorValue, function(err, isVerified) {
                        expect(err).to.exist
                        done()
                    })
                })
            })
        })
        describe('getSetterForField(fieldName)', function() {
            var setter = bcryptSchema.getSetterForField(hashField),
                user = {
                    set: setter
                }

            it('should return a function', function() {
                    expect(setter).to.be.a('function')
            })
            describe('and this function', function() {
                it('should set a value', function(done) {
                    user.set(passingValue, function(err){
                        expect(err).to.not.exist
                        expect(user[hashField]).to.equal(hashValue)
                        done()
                    })
                })
                it('should error if an error occurs in hashing', function(){
                    user.set(errorValue, function(err){
                        expect(err).to.exist
                    })
                })
            })
        })
    })
})
