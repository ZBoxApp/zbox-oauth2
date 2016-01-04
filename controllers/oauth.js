/**
 * Created by enahum on 11/19/15.
 */
var server = require('../libs/oauth2'),
    db = require('../models'),
    login = require('connect-ensure-login'),
    passport = require('passport');

module.exports = {
    // user authorization endpoint
    //
    // `authorization` middleware accepts a `validate` callback which is
    // responsible for validating the client making the authorization request.  In
    // doing so, is recommended that the `redirectURI` be checked against a
    // registered value, although security requirements may vary accross
    // implementations.  Once validated, the `done` callback must be invoked with
    // a `client` instance, as well as the `redirectURI` to which the user will be
    // redirected after an authorization decision is obtained.
    //
    // This middleware simply initializes a new authorization transaction.  It is
    // the application's responsibility to authenticate the user and render a dialog
    // to obtain their approval (displaying details about the client requesting
    // authorization).  We accomplish that here by routing through `ensureLoggedIn()`
    // first, and rendering the `dialog` view.
    authorization: [
        login.ensureLoggedIn(),
        server.authorization(function(clientID, redirectURI, done) {
            db.models.Client.findByClientId(clientID, function(err, client) {
                if (err) { return done(err); }
                // WARNING: For security purposes, it is highly advisable to check that
                //          redirectURI provided by the client matches one registered with
                //          the server.  For simplicity, this example does not.  You have
                //          been warned.
                return done(null, client, redirectURI);
            });
        }, function (client, user, done) {
            // Check if grant request qualifies for immediate approval
            db.models.AccessToken.hasToken(user._id, client._id)
                .then(function(token) {
                    if(token) {
                        return done(null, true);
                    }
                    if(client.isTrusted) {
                        return done(null, true);
                    }
                    return done(null, false);
                })
                .catch(function(err){
                    return done(err);
                });
        }),
        function(req, res){
            res.render('dialog', {
                title: 'Autenticación ZBox',
                page: 'dialog',
                transactionID: req.oauth2.transactionID,
                user: req.user,
                client: req.oauth2.client
            });
        }
    ],

    // user decision endpoint
    //
    // `decision` middleware processes a user's decision to allow or deny access
    // requested by a client application.  Based on the grant type requested by the
    // client, the above grant middleware configured above will be invoked to send
    // a response.
    decision: [
        login.ensureLoggedIn(),
        server.decision()
    ],

    // token endpoint
    //
    // `token` middleware handles client requests to exchange authorization grants
    // for access tokens.  Based on the grant type being exchanged, the above
    // exchange middleware will be invoked to handle the request.  Clients must
    // authenticate when making requests to this endpoint.

    token: [
        passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
        server.token(),
        server.errorHandler()
    ]
};