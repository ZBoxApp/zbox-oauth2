var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    controller = require('../controllers/users');

/* GET users listing. */
router.route("/me")
    .get(passport.authenticate('bearer', { session: false }), controller.me)
    .post(passport.authenticate('zimbra', { session: false }), controller.me);

router.get('/client', passport.authenticate('bearer', { session: false }), controller.client);

router.get('/users/:id', passport.authenticate('bearer', { session: false }), controller.findById);

router.get('/users/team/:team', passport.authenticate('bearer', { session: false }), controller.findByTeam);

router.post('/users/create', passport.authenticate('bearer', { session: false }), controller.create);

router.patch('/users/update', passport.authenticate('bearer', { session: false }), controller.update);

router.delete('/users/:id', passport.authenticate('bearer', { session: false }), controller.remove);

module.exports = router;
