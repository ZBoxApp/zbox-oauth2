/**
 * Created by enahum on 10/14/15.
 */
/**
 * Module dependencies.
 */
var oauth2orize = require('oauth2orize'),
    moment = require('moment'),
    db = require('../models'),
    config = require('../libs/config'),
    utils = require('./utils');

// create OAuth 2.0 server
var server = oauth2orize.createServer();

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTP request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

server.serializeClient(function(client, done) {
    return done(null, client._id.toJSON());
});

server.deserializeClient(function(id, done) {
    db.models.Client.get(id, function(err, client) {
        if (err) { return done(err); }
        return done(null, client);
    });
});

// Register supported grant types.
//
// OAuth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources.  It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

// Grant authorization codes.  The callback takes the `client` requesting
// authorization, the `redirectURI` (which is used as a verifier in the
// subsequent exchange), the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application.  The application issues a code, which is bound to these
// values, and will be exchanged for an access token.

server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, done) {
    var code = utils.uid(16);

    db.models.AuthorizationCode.findOrCreate(code, client._id, redirectURI, user._id, function(err, authCode) {
        if (err) { return done(err); }
        done(null, authCode.code);
    });
}));

// Grant implicit authorization.  The callback takes the `client` requesting
// authorization, the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application.  The application issues a token, which is bound to these
// values.

server.grant(oauth2orize.grant.token(function(client, user, ares, done) {
    var token = utils.uid(256);

    db.models.AccessToken.findOrCreate(token, user._id, client._id, function(err, accessToken) {
        if (err) { return done(err); }
        done(null, accessToken.token, null, {
            expires_in: parseInt(moment.duration(moment(accessToken.created)
                .add(parseInt(config.get('security:tokenLife')), 's').diff(moment())).asSeconds())
        });
    });
}));

/**
 * Register supported Exchanges
 */

// Exchange authorization codes for access tokens.  The callback accepts the
// `client`, which is exchanging `code` and any `redirectURI` from the
// authorization request for verification.  If these values are validated, the
// application issues an access token on behalf of the user who authorized the
// code.

server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
    var token, refreshToken;

    db.models.AuthorizationCode.findByCode(code, function(err, authCode) {
        if (err) { return done(err); }
        if (client._id.toJSON() !== authCode.client.toJSON()) { return done(null, false); }
        if (redirectURI !== authCode.redirectURI) { return done(null, false); }

        token = utils.uid(256);
        refreshToken = utils.uid(256);

        db.models.AccessToken.findOrCreate(token, authCode.user, authCode.client, function(err, accessToken) {
            if (err) { return done(err); }
            db.models.RefreshToken.CreateOrUpdate(refreshToken, authCode.user, authCode.client, function(err, refresh) {
                if (err) { return done(err); }
                done(null, accessToken.token, refresh.refreshToken,
                    {
                        expires_in: parseInt(moment.duration(moment(accessToken.created)
                            .add(parseInt(config.get('security:tokenLife')), 's').diff(moment())).asSeconds())
                    });
            });
        });
    });
}));

// Exchange user id and password for access tokens.  The callback accepts the
// `client`, which is exchanging the user's name and password from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the user who authorized the code.

server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
    var token, refreshToken;

    //Validate the client
    db.models.Client.findByClientId(client.clientId, function(err, localClient) {
        if (err) { return done(err); }
        if(localClient === null) {
            return done(null, false);
        }
        if(localClient.clientSecret !== client.clientSecret) {
            return done(null, false);
        }
        //Validate the user
        db.model.User.findByEmail(username, function(err, user) {
            if (err) { return done(err); }
            if(user === null) {
                return done(null, false);
            }
            if(password !== user.password) {
                return done(null, false);
            }
            //Everything validated, return the token
            token = utils.uid(256);
            refreshToken = utils.uid(256);
            db.models.AccessToken.findOrCreate(token, user._id, client._id, function(err, accessToken) {
                if (err) { return done(err); }
                db.models.RefreshToken.CreateOrUpdate(refreshToken, user._id, client._id, function(err, refresh) {
                    if (err) { return done(err); }
                    done(null, accessToken.token, refresh.refreshToken,
                        {
                            expires_in: parseInt(moment.duration(moment(accessToken.created)
                                .add(parseInt(config.get('security:tokenLife')), 's').diff(moment())).asSeconds())
                        });
                });
            });
        });
    });
}));

// Exchange refresh token for a new access tokens.

server.exchange(oauth2orize.exchange.refreshToken(function (client, refreshToken, scope, done) {
    var createNewToken = function(token, userId, clientId) {
        db.models.AccessToken.findOrCreate(token, userId, clientId, function (err, accessToken) {
            if(err) { return done(err); }

            return done(null, accessToken.token, refreshToken,
                {
                    expires_in: parseInt(moment.duration(moment(accessToken.created)
                        .add(parseInt(config.get('security:tokenLife')), 's').diff(moment())).asSeconds())
                });
        });
    };

    db.models.RefreshToken.findByToken(refreshToken, function(err, refresh) {
        if(err) { return done(err); }

        db.models.AccessToken.findByClientAndUser(refresh.client, refresh.user, function(err, accessToken) {
            if(err) { return done(err); }

            var newToken = utils.uid(256);
            if(accessToken) {
                return accessToken.remove()
                    .exec()
                    .then(function () {
                        createNewToken(newToken, refresh.user, refresh.client);
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            }

            return createNewToken(newToken, refresh.user, refresh.client);
        });
    });
}));

// Exchange the client id and password/secret for an access token.  The callback accepts the
// `client`, which is exchanging the client's id and password/secret from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the client who authorized the code.

server.exchange(oauth2orize.exchange.clientCredentials(function(client, scope, done) {

    //Validate the client
    db.models.Clients.findByClientId(client.clientId, function(err, localClient) {
        if (err) { return done(err); }
        if(localClient === null) {
            return done(null, false);
        }
        if(localClient.clientSecret !== client.clientSecret) {
            return done(null, false);
        }
        var token = utils.uid(256);
        //Pass in a null for user id since there is no user with this grant type
        db.models.AccessToken.findOrCreate(token, null, client._id, function(err, accessToken) {
            if (err) { return done(err); }
            done(null, accessToken.token, null, {
                expires_in: parseInt(moment.duration(moment(accessToken.created)
                    .add(parseInt(config.get('security:tokenLife')), 's').diff(moment())).asSeconds())
            });
        });
    });
}));

module.exports = server;