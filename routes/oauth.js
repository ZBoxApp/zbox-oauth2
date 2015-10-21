/**
 * Created by enahum on 10/14/15.
 */
var express = require('express'),
    router = express.Router(),
    oauth2 = require('../libs/oauth2');

router.get('/authorize', oauth2.authorization);
router.post('/authorize/decision', oauth2.decision);
router.post('/token', oauth2.token);

module.exports = router;