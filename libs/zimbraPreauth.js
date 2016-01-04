/**
 * Created by enahum on 10/20/15.
 */
var request = require('request'),
    config = require('./config');

module.exports = {
    post: function(action, params, done) {
        request.post({
            url: (process.env.ZIMBRA_PREAUTH_HOST || config.get('zimbra:preauth_host')) + action,
            form: params
        }, function(err, response, body) {
            if(typeof done === 'function') {
                return done(err, response, body);
            }
        });
    }
};