/**
 * Created by enahum on 10/15/15.
 */
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: { type: String, trim: true, unique: true, required: true },
    clientId: { type: String, trim: true, unique: true, required: true },
    clientSecret: { type: String, trim: true, unique: true, required: true },
    isTrusted: { type: Boolean, default: false }
});

schema.statics.get = function(id, done) {
    Client.findById(id, function(err, client) {
        if(err) { return done(err, null); }

        return done(null, client);
    });
};

schema.statics.findByClientId = function(clientId, done) {
    Client.findOne({ clientId: clientId }, function(err, client) {
        if(err) { return done(err, null); }

        return done(null, client);
    });
};

module.exports = Client = mongoose.model('Client', schema);