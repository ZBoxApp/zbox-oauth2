/**
 * Created by enahum on 11/12/15.
 */
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: { type: String, trim: true, unique: true, required: true },
    min: { type: String, trim: true, unique: true, required: true },
    current: { type: String, trim: true, unique: true, required: true },
    link: { type: String, trim: true, unique: true, lowercase: true, require:true, match: /^(ftp|http|https):\/\/[^ "]+$/ }
});

schema.statics.findByName = function(name, done) {
    ServiceVersion.findOne({name: name}, function(err, service) {
        if(err) { return done(err, null); }

        return done(null, service);
    });
};

module.exports = ServiceVersion = mongoose.model('ServiceVersion', schema);