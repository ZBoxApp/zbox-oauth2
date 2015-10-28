var express = require('express'),
    router = express.Router(),
    passport = require('passport');

/* GET users listing. */
router.route("/me")
    .get(passport.authenticate('bearer', { session: false }), function(req, res) {
        res.json(req.user);
    })
    .post(passport.authenticate('zimbra', { session: false }), function(req, res) {
        // req.authInfo is set using the `info` argument supplied by
        // `BearerStrategy`.  It is typically used to indicate scope of the token,
        // and used in access control checks.  For illustrative purposes, this
        // example simply returns the scope in the response.
        res.json(req.user);
    });

router.get('/client', passport.authenticate('bearer', { session: false }), function(req, res) {
    // req.authInfo is set using the `info` argument supplied by
    // `BearerStrategy`.  It is typically used to indicate scope of the token,
    // and used in access control checks.  For illustrative purposes, this
    // example simply returns the scope in the response.
    res.json({ client_id: req.user.id, name: req.user.name, scope: req.authInfo.scope })
});

module.exports = router;
