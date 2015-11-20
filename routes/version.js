/**
 * Created by enahum on 11/12/15.
 */
var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    controller = require('../controllers/version');


router.head('/status', controller.head);

router.get('/version/:name/:number/:platform', controller.get);
router.get('/version/:name/:number/:platform/releases', controller.releases);

router.get('/download/:file', controller.download);
router.get('/version/:name/:number/:platform/:file', controller.download);

router.post('/version/create', passport.authenticate('bearer', { session: false }), controller.create);

router.patch('/version/update', passport.authenticate('bearer', { session: false }), controller.update);

router.delete('/version/:name', passport.authenticate('bearer', { session: false }), controller.remove);

module.exports = router;