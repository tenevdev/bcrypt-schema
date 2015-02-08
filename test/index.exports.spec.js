describe('bcrypt-schema.exports', function() {
    var bcryptSchema
    describe('when test environment', function() {
        it('should export private members', function() {
            bcryptSchema = require('..')
            expect(bcryptSchema.getVerifierForField).to.exist
            expect(bcryptSchema.getSetterForField).to.exist
        })
    })
    describe('when not test environment', function() {
        before('reload the module', function() {
            // Remove module from cache
            var module = require.resolve('..')
            delete require.cache[module]

            // Reload module with changed env
            process.env.NODE_ENV = 'not-test'
            bcryptSchema = require('..')
        })
        it('should not export private members', function() {
            expect(bcryptSchema.getVerifierForField).to.not.exist
            expect(bcryptSchema.getSetterForField).to.not.exist
        })
    })
})
