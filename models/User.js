/**
 * Created by enahum on 10/15/15.
 */
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    email: { type: String, trim: true, unique: true, required: true },
    firstname: { type: String },
    lastname: { type: String },
    team: { type: String },
    zimbraUrl: { type: String },
    chatEnabled: { type: Boolean, default: true },
    isEnabled: { type: Boolean, default: true }
});

schema.statics.get = function(id, done) {
    User.findById(id, function(err, user) {
        if(err) { return done(err, null); }

        return done(null, user);
    });
};

schema.statics.findByEmail = function(email, done) {
    User.findOne({ email: email }, function(err, user) {
        if(err) { return done(err, null); }

        return done(null, user);
    });
};

schema.statics.updateOrCreate = function(data, done) {
    User.findOne({ email: data.email })
        .exec()
        .then(function(user) {
            if(!user) {
                user = new User();
                user.email = data.email;
            }
            user.firstname = data.first_name;
            user.lastname = data.last_name;
            user.team = data.default_team;
            user.zimbraUrl = data.mail_login_url;
            user.chatEnabled = data.chat_enabled ? data.chat_enabled === 'TRUE' : true;

            return user.save();
        })
        .then(function(user) {
            return done(null, user);
        })
        .catch(function(err) {
           return done(err, null);
        });
};

schema.virtual('fullname')
    .get(function () { return this.firstname + ' ' + this.lastname; });

module.exports = User = mongoose.model('User', schema);