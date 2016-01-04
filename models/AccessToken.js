/**
 * Created by enahum on 10/15/15.
 */
var mongoose = require('mongoose'),
    Q = require('q'),
    config = require('../libs/config'),
    AccessToken;

mongoose.Promise = Q.Promise;

var schema = new mongoose.Schema({
    token: { type: String, unique: true, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    created: { type: Date, default: Date.now,  index: { expires: parseInt(config.get('security:tokenLife')) } }
});

schema.statics.findByToken = function(token, done) {
    AccessToken.findOne({ token: token }, function(err, accessToken) {
        if(err) { return done(err, null); }

        return done(null, accessToken);
    });
};

schema.statics.findOrCreate = function(token, userId, clientId, done) {
    AccessToken.findOne({ user: userId, client: clientId })
        .exec()
        .then(function(accessToken) {
            if(!accessToken) {
                accessToken = new AccessToken();
                accessToken.token = token;
                accessToken.user = userId;
                accessToken.client = clientId;
            }
            return accessToken.save();
        })
        .then(function(accessToken) {
            return done(null, accessToken);
        })
        .catch(function(err) {
            return done(err);
        });
};

schema.statics.findByClientAndUser = function(clientId, userId, done) {
    AccessToken.findOne({ client: clientId, user: userId })
        .exec()
        .then(function(accessToken) {
            return done(null, accessToken);
        })
        .catch(function(err) {
            return done(err);
        });
};

schema.statics.hasToken = function(userId, clientId) {
    return AccessToken.findOne({ user: userId, client: clientId })
           .exec();
};

module.exports = AccessToken = mongoose.model('AccessToken', schema);