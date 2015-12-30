/**
 * Created by enahum on 11/12/15.
 */
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: { type: String, trim: true, unique: true, required: true },
    current: { type: String, trim: true, required: true },
    notes: { type: String },
    pub_date: { type: Date, default: Date.now },
    link: [
        {
            platform: { type: String, trim: true, required: true, enum: ['darwin-x64', 'win32-ia32', 'win32-x64'] },
            url: { type: String, trim: true, unique: true, require:true, match: /^(ftp|http|https):\/\/[^ "]+$/ }
        }
    ]

});

schema.statics.findByName = function(name, done) {
    ServiceVersion.findOne({name: name}, function(err, service) {
        if(err) { return done(err, null); }

        return done(null, service);
    });
};

schema.methods.findPlatformUrl = function(platform) {
    var links = this.link,
        i = links.length;

    for(; --i >= 0;) {
        if(links[i].platform === platform) {
            return links[i].url;
        }
    }

    return null;
};

module.exports = ServiceVersion = mongoose.model('ServiceVersion', schema);
