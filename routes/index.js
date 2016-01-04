var express = require('express'),
    router = express.Router(),
    login = require('connect-ensure-login'),
    csrf = require('csurf'),
    bodyParser = require('body-parser'),
    controller = require('../controllers/default'),
    csrfProtection = csrf({ cookie: true }),
    parseForm = bodyParser.urlencoded({ extended: false });


/* GET home page. */
router.route('/')
    .head(controller.head)
    .get(login.ensureLoggedIn(), controller.index);

router.route('/login')
    .get(csrfProtection, controller.login)
    .post(parseForm, csrfProtection, controller.makeLogin);

router.get('/logout', controller.logout);

router.get('/account', login.ensureLoggedIn(), controller.account);

module.exports = router;
