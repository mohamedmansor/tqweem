var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var db = mongoose.connection;

// User Schema
var UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        // bcrypt: true,
        required: true
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    avatar: {
        type: String
    }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.comparePassword = function (candidatePassword, hashedPassword, callback) {
    console.log('[DEBUG] req.body.passowrd : ', candidatePassword)
    console.log('[DEBUG] req.body.passowrd : ', hashedPassword)
    // Load hash from your password DB.
    bcrypt.compare(candidatePassword, hashedPassword, function (err, res) {
        if (err) {
            console.log(err);
            
            throw err
        }
        console.log('???', res)


        if (res===true) {
            callback(null, res)
        } else {
            callback("errrr", null)
        }
        // res === true
    });

}

module.exports.getUserByUsername = function (username, callback) {
    var query = { username: username }
    User.findOne(query, callback)
};
module.exports.getUserById = function (id, callback) {
    User.findById(id, callback)
};

module.exports.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        console.log(newUser.password)
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            // hash passowrd
            newUser.password = hash
            // create user
            newUser.save(callback);
        });
    });
};