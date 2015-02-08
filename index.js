var bcrypt = require('bcrypt')

function verify(value, hash, next) {
    bcrypt.compare(value, hash, function(err, res) {
        if (err)
            return next(err)
        return next(null, res)
    })
}

function set(value, hashField, saltIterations, next) {
    var self = this

    if(typeof saltIterations === 'function'){
        next = saltIterations
        saltIterations = 10
    }

    bcrypt.genSalt(saltIterations, function(err, salt) {
        if (err)
            return next(err)
        bcrypt.hash(value, salt, function(err, hash) {
            if (err)
                return next(err)

            // Set new hash
            self[hashField] = hash
            return next()
        })
    })
}

function getVerifierForField(options) {
    return function(value, next) {
        bcrypt.compare(value, this[options.field], function(err, res) {
            if (err)
                return next(err)
            return next(null, res)
        })
    }
}

function getSetterForField(options) {
    return function(value, next) {
        var self = this

        bcrypt.genSalt(options.saltIterations, function(err, salt) {
            if (err)
                return next(err)
            bcrypt.hash(value, salt, function(err, hash) {
                if (err)
                    return next(err)

                // Set new hash
                self[options.field] = hash
                return next()
            })
        })
    }
}

function setEncryption(schema, options) {
    if (typeof options === 'string') {
        var capitlaizedFieldName = options.charAt(0).toUpperCase() + options.slice(1)

        options = {
            field: options,
            verify: 'verify' + capitlaizedFieldName,
            set: 'set' + capitlaizedFieldName,
            saltIterations: 10
        }
    }

    if (!options.saltIterations) {
        options.saltIterations = 10
    }

    schema.methods[options.verify] = getVerifierForField(options)
    schema.methods[options.set] = getSetterForField(options)
}

module.exports = {
    verify: verify,
    set: set,
    setEncryption: setEncryption,
}

if (process.env.NODE_ENV === 'test') {
    // Export private members
    module.exports = {
        verify: verify,
        set: set,
        setEncryption: setEncryption,
        getSetterForField: getSetterForField,
        getVerifierForField: getVerifierForField
    }
}
