/**
 * Created by enahum on 10/15/15.
 */
var mongoose = require('mongoose'),
    crypto = require('crypto');

var schema = new mongoose.Schema({
    email: { type: String, trim: true, unique: true, required: true },
    firstname: { type: String },
    lastname: { type: String },
    team: { type: String },
    zimbraUrl: { type: String },
    isZimbra: { type: Boolean, default: true },
    hashedPassword: { type: String },
    salt: {type: String },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
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
            user.chatEnabled = data.chat_enabled ? data.chat_enabled === true : true;
            user.isZimbra = true;

            return user.save();
        })
        .then(function(user) {
            return done(null, user);
        })
        .catch(function(err) {
           return done(err, null);
        });
};

schema.methods.encryptPassword = function (password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.methods.forgotPassword = function (done) {
    this.resetPasswordToken = crypto.randomBytes(32).toString('base64').replace('/', '-');
    this.resetPasswordExpires = Date.now() + (config.get('security:tokenLife') * 1000);
    this.save(function (err, user) {
        if (err) {
            log.error(err);
            done(null);
        }
        else {
            log.info("Set forgot token for user - %s", user.email);
            done(user.resetPasswordToken);
        }
    });
};

schema.methods.resetPassword = function (password, done) {
    this.resetPasswordExpires = null;
    this.resetPasswordToken = null;
    this.password = password;
    this.save(function (err, user) {
        if (err) {
            log.error(err);
            done(false);
        }
        else {
            log.info("Password reseted for user - %s", user.email);
            done(true);
        }
    });
};

schema.methods.checkPassword = function (password) {
    if(this.isZimbra) {
        return false;
    }
    var encripted = this.encryptPassword(password);
    return encripted === this.hashedPassword;
};

schema.virtual('fullname')
    .get(function () { return this.firstname + ' ' + this.lastname; });

schema.virtual('password')
    .set(function (password) {
        if(password) {
            this._plainPassword = password;
            this.salt = crypto.randomBytes(32).toString('base64');
            this.hashedPassword = this.encryptPassword(password);
        }
    })
    .get(function () { return this._plainPassword; });

module.exports = User = mongoose.model('User', schema);