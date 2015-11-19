var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    login = require('connect-ensure-login'),
    controller = require('../controllers/default');


/* GET home page. */
router.route('/')
    .head(controller.head)
    .get(login.ensureLoggedIn(), controller.index);

router.route('/login')
    .get(controller.login)
    .post(controller.makeLogin);

router.get('/logout', controller.logout);

router.get('/account', login.ensureLoggedIn(), controller.account);

module.exports = router;
