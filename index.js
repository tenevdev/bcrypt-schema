var bcrypt = require('bcrypt')

function verify(value, hash, next) {
    bcrypt.compare(value, hash, function(err, res) {
        if (err)
            return next(err)
        return next(null, res)
    })
}

function set(value, hashField, next) {
    var self = this

    bcrypt.genSalt(10, function(err, salt) {
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

function getVerifierForField(fieldName) {
    return function(value, next) {
        bcrypt.compare(value, this[fieldName], function(err, res) {
            if (err)
                return next(err)
            return next(null, res)
        })
    }
}

function getSetterForField(fieldName) {
    return function(value, next) {
        var self = this

        bcrypt.genSalt(10, function(err, salt) {
            if (err)
                return next(err)
            bcrypt.hash(value, salt, function(err, hash) {
                if (err)
                    return next(err)

                // Set new hash
                self[fieldName] = hash
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
            set: 'set' + capitlaizedFieldName
        }
    }
    schema.methods[options.verify] = getVerifierForField(options.field)
    schema.methods[options.set] = getSetterForField(options.field)
}

module.exports = {
    verify: verify,
    set: set,
    setEncryption: setEncryption,
    _getVerifierForField: getVerifierForField,
    _getSetterForField: getSetterForField
}
