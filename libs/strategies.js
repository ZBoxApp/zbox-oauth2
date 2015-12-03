/**
 * Created by enahum on 10/14/15.
 */
//CAMBIAR DB a una base de datos real

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    BasicStrategy = require('passport-http').BasicStrategy,
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
    BearerStrategy = require('passport-http-bearer').Strategy,
    ZimbraStrategy = require('passport-zimbra').Strategy,
    TripleDesStrategy = require('passport-zimbra').TripleDesStrategy,
    zimbra = require('./zimbraPreauth'),
    config = require('./config'),
    db = require('../models');


passport.serializeUser(function(user, done) {
    done(null, user._id.toJSON());
});

passport.deserializeUser(function(id, done) {
    db.models.User.get(id, function (err, user) {
        done(err, user);
    });
});

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password against zimbra preauth service.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
passport.use('preauth', new LocalStrategy(
    function(username, password, done) {
        var params = {
            email: username,
            password: password
        };

        zimbra.post('/login', params, function(err, response, body) {
            if(err) {
                return done(err);
            }
            switch(response.statusCode) {
                case 200:
                    return db.models.User.updateOrCreate(JSON.parse(body), function(err, user) {
                        if(user.isEnabled) {
                            return done(null, user);
                        } else {
                            return done(null, null, {message: 'El usuario ha sido inhabilitado'});
                        }
                    });
                    break;
                case 401:
                    return done(null, null, {message: 'Nombre de usuario y/o contraseña incorrecta.'});
                    break;
            }
        });
    }
));

passport.use('local', new LocalStrategy(
    function(username, password, done) {
        var er = { status: 401, code: 'Autorizacion', message: 'Nombre de usuario y/o contraseña incorrecta.' };
        // check in mongo if a user with username exists or not
        User.findOne({ 'email' :  username })
            .exec(function(err, user) {
                // In case of any error, return using the done method
                if (err) {
                    er.status = 500;
                    er.code = 'MongoDB';
                    er.message = err.message;
                    return done(er);
                }

                // Username does not exist, log error & redirect back
                if (!user) {
                    return done(null, null, {message: er.message });
                }

                // User exists but wrong password, log the error
                if (!user.checkPassword(password)) {
                    return done(null, false, {message: er.message });
                }

                if(!user.isEnabled) {
                    return done(null, false, {message: 'El usuario ha sido inhabilitado'});
                }

                // User and password both match, return user from
                // done method which will be treated like success
                return done(null, user);
            }
        );
    }));

passport.use(new ZimbraStrategy({
    url: process.env.ZIMBRA_TOKEN_URL || config.get("zimbra:token")},
    function(email, done) {
        var params = {
            email: email
        };
        zimbra.post('/url', params, function (err, response, body) {
            if (err) {
                return done(err);
            }
            if (response.statusCode !== 200) {
                return done(null, false, {message: 'Nombre de usuario y/o contraseña incorrecta.'});
            }
            return db.models.User.updateOrCreate(JSON.parse(body), function (err, user) {
                if (err) return done(err);

                return done(null, user);
            });
        });
    }
));

passport.use(new TripleDesStrategy({
        passphrase: config.get("zimbra:secretPassphrase")},
    function(email, done) {
        var params = {
            email: email
        };
        zimbra.post('/url', params, function (err, response, body) {
            if (err) {
                return done(err);
            }
            if (response.statusCode !== 200) {
                return done(null, false, {message: 'Nombre de usuario y/o contraseña incorrecta.'});
            }
            return db.models.User.updateOrCreate(JSON.parse(body), function (err, user) {
                if (err) return done(err);

                return done(null, user);
            });
        });
    }
));

/**
 * BasicStrategy & ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered OAuth clients.  They are
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens.  The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate.  Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the `Authorization` header).  While this approach is not recommended by
 * the specification, in practice it is quite common.
 */
passport.use(new BasicStrategy(
    function(username, password, done) {
        db.models.Client.findByClientId(username, function(err, client) {
            if (err) { return done(err); }
            if (!client) { return done(null, false); }
            if (client.clientSecret != password) { return done(null, false); }
            return done(null, client);
        });
    }
));

passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {
        db.models.Client.findByClientId(clientId, function(err, client) {
            if (err) { return done(err); }
            if (!client) { return done(null, false); }
            if (client.clientSecret != clientSecret) { return done(null, false); }
            return done(null, client);
        });
    }
));

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate either users or clients based on an access token
 * (aka a bearer token).  If a user, they must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
passport.use(new BearerStrategy(
    function(accessToken, done) {
        db.models.AccessToken.findByToken(accessToken, function(err, token) {
            if (err) { return done(err); }
            if (!token) { return done(null, false); }

            if(token.user != null) {
                db.models.User.get(token.user, function(err, user) {
                    if (err) { return done(err); }
                    if (!user) { return done(null, false); }
                    // to keep this example simple, restricted scopes are not implemented,
                    // and this is just for illustrative purposes
                    var info = { scope: '*' };
                    done(null, user, info);
                });
            } else {
                //The request came from a client only since userID is null
                //therefore the client is passed back instead of a user
                db.models.Client.findByClientId(token.client, function(err, client) {
                    if(err) { return done(err); }
                    if(!client) { return done(null, false); }
                    // to keep this example simple, restricted scopes are not implemented,
                    // and this is just for illustrative purposes
                    var info = { scope: '*' };
                    done(null, client, info);
                });
            }
        });
    }
));

module.exports = passport;