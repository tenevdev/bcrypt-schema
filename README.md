# bcrypt-schema
[![Build Status](https://travis-ci.org/tenevdev/bcrypt-schema.svg?branch=master)](https://travis-ci.org/tenevdev/bcrypt-schema) [![Dependency Status](https://david-dm.org/tenevdev/bcrypt-schema.svg)](https://david-dm.org/tenevdev/bcrypt-schema) [![devDependency Status](https://david-dm.org/tenevdev/bcrypt-schema/dev-status.svg)](https://david-dm.org/tenevdev/bcrypt-schema#info=devDependencies) [![Codacy Badge](https://www.codacy.com/project/badge/667351977af44ab2a0884900f2257a14)](https://www.codacy.com/public/tenevdev/bcrypt-schema)

NPM package for adding encryption on schema fields. Can be used as a Mongoose plugin. Designed for use with Node.js and installable via `npm install bcrypt-schema`

## Quick examples

- As a mongoose plugin
```javascript
var mongoose = require('mongoose'),
    encryption = require('bcrypt-schema').setEncryption

var userSchema = new mongoose.Schema({
    username: String,
    password: {
        type: String,
        select: false
    }
})

userSchema.plugin(encryption, 'password')
```
- As a standalone module
```javascript
// You can use the `verify(value, hash, next)` and `set(value, hashField, next)` methods
// on any object as schema instance methods
// Suppose we use mongoose again the example above would look like the following
var mongoose = require('mongoose'),
    encryption = require('bcrypt-schema')

var userSchema = new mongoose.Schema({
    username: String,
    password: {
        type: String,
        select: false
    }
})

userSchema.methods.verifyPassword = encryption.verify
userSchema.methods.setPassword = encryption.set

// ...
// Before saving a document
// Suppose we keep the plain password as a virual property
userSchema.virtual('plainPassword')
    .get(function() {
        return this._plainPassword
    })
    .set(function(password) {
        this._plainPassword = password
    })

userSchema.pre('save', function(callback) {

    // Password has not changed
    if (!this.isModified('plainPassword') && !this.isNew) {
        return callback()
    }

    //Password has changed or this is a new user
    this.setPassword(this.plainPassword, 'password', callback)
})

// ...
// Later having a user document
user.verifyPassword(password, user.password, function(err, isVerified) {
  // Handle verification result in this callback
}
```

## Documentation

* [`verify`](#verify)
* [`set`](#set)
* [`setEncryption`](#setEncryption)
 
<a name="verify" />
### verify(value, hash, next)

Compares the value of `value` with the given `hash` using `bcrypt.compare()`.
The `next` parameter is a callback function.

__Arguments__

* `value` - The plain value used in comparison.
* `hash` - A hash to compare against.
* `next(err, isVeified)` - A callback which is called after the comparison has finished.

<a name="set" />
### set(value, hashField, next)

Hasheh the given value using bcrypt's `genSalt` and `hash` and assigns it to `this[hashField]`.

__Arguments__

* `value` - The plain value to hash.
* `hashField` - The name of the property to be set.
* `next(err)` - A callback which is called after hashing has finished.

<a name="setEncryption" />
### setEncryption(schema, options)

Accepts a mongoose-like `schema` object and a set of `options`.
Can be used as a mongoose plugin.

__Arguments__

* `schema` - A mongoose-like schema object.
* `options`- An object containing plugin options
  - `field` - The name of the field to be encrypted
  - `verify` - The name of the verify method attached as an instance method on the `schema.methods`
  - `set` - The name of the set method attached as an instance method on the `schema.methods`

__Example__

```javascript
var mongoose = require('mongoose'),
    encryption = require('bcrypt-schema').setEncryption

// Define a schema
// ...

schema.plugin(encryption, {
        field: 'password',
        verify: 'customVerifyName',
        set: 'customSetName'
    })
```

After the plugin call you can use the `customVerifyName` and `customSetName` methods
as instance methods.

### setEncryption(schema, fieldName)

This is a short hand overload of the `setEncryption` method which auto-generates
`verify` and `set` method names using the value of the `fieldName` parameter.
Method names are generated adding the PascalCase version of the `fieldName` to the
strings `verify` and `set`.

For instance, if `fieldName` equals 'password' the generated methods are named
`verifyPassword` and `setPassword`.

__Arguments__

* `schema` - A mongoose-like schema object
* `fieldName` - The name of the field to be encrypted

__Example__

```javascript
var mongoose = require('mongoose'),
    encryption = require('bcrypt-schema').setEncryption

// Define a schema
// ...

schema.plugin(encryption, 'password')
```
