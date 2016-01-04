/**
 * Created by enahum on 10/15/15.
 */
var mongoose = require('mongoose'),
    RefreshToken;

var schema = new mongoose.Schema({
    refreshToken: { type: String, unique: true, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    created: { type: Date, default: Date.now }
});

schema.statics.findByToken = function(token, done) {
    RefreshToken.findOne({ refreshToken: token }, function(err, refreshToken) {
        if(err) { return done(err, null); }

        return done(null, refreshToken);
    });
};

schema.statics.CreateOrUpdate = function(token, userId, clientId, done) {
    RefreshToken.findOne({ user: userId, client: clientId })
        .exec()
        .then(function(refreshToken) {
            if(!refreshToken) {
                refreshToken = new RefreshToken();
            }
            refreshToken.refreshToken = token;
            refreshToken.user = userId;
            refreshToken.client = clientId;

            return refreshToken.save();
        })
        .then(function(refreshToken) {
            return done(null, refreshToken);
        })
        .catch(function(err) {
            return done(err);
        });
};

schema.statics.hasToken = function(userId, clientId) {
    return RefreshToken.findOne({ user: userId, client: clientId })
        .exec();
};

module.exports = RefreshToken = mongoose.model('RefreshToken', schema);