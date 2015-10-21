/**
 * Created by enahum on 10/15/15.
 */
var mongoose = require('mongoose'),
    config = require('../libs/config');

var schema = new mongoose.Schema({
    code: { type: String, unique: true, required: true },
    redirectURI: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    created: { type: Date, default: Date.now, index: { expires: parseInt(config.get("security:codeLife")) } }
});

schema.statics.findByCode = function(code, done) {
    AuthorizationCode.findOne({ code: code }, function(err, authorizationCode) {
        if(err) { return done(err, null); }

        return done(null, authorizationCode);
    });
};

schema.statics.findOrCreate = function(code, clientId, redirectURI, userId, done) {
    AuthorizationCode.findOne({ user: userId, client: clientId, redirectURI: redirectURI })
        .exec()
        .then(function(authorizationCode) {
            if(!authorizationCode) {
                authorizationCode = new AuthorizationCode();
                authorizationCode.code = code;
                authorizationCode.user = userId;
                authorizationCode.client = clientId;
                authorizationCode.redirectURI = redirectURI;
            }
            return authorizationCode.save();
        })
        .then(function(authCode) {
            return done(null, authCode);
        })
        .catch(function(err) {
            return done(err);
        });
};

module.exports = AuthorizationCode = mongoose.model('AuthorizationCode', schema);