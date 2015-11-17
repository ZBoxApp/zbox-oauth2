var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    login = require('connect-ensure-login'),
    zimbra = require('../libs/zimbraPreauth');


var path = require('path');
/* GET home page. */
router.route('/')
    .head(function(req, res){
        res.status(200);
        return res.end();
    })
    .get(login.ensureLoggedIn(), function(req, res, next) {
        var user = req.user;
        var params = {
            email: user.email
        };
        if(user.isZimbra) {
            zimbra.post('/url', params, function (err, response, body) {
                if (err) {
                    return next(err);
                }
                if (response.statusCode !== 200) {
                    return next({message: response.statusMessage});
                }
                return res.redirect(JSON.parse(body).mail_login_url);
            });
        } else {
            res.redirect(user.zimbraUrl);
        }
    });

router.route('/login')
    .get(function(req, res, next) {
        return res.render('login', {
            title: 'Autenticación ZBox',
            page: 'login',
            message: req.flash('error')
        });
    })
    .post(function(req, res, next) {
        passport.authenticate(['local', 'preauth'], { failureFlash: true }, function(err, user, info) {
            if(err) {
                return next(err);
            }
            if(!user) {
                var msg = user === null ? info[0].message : info[1].message;
                req.flash('error', msg);
                return res.redirect('/login');
            }
            req.logIn(user, function(err) {
                var url = req.session ? req.session.returnTo || req.user.zimbraUrl : req.user.zimbraUrl || '/';

                if(err) {
                    return next(err);
                }
                return res.redirect(url);
            });
        })(req, res, next);
    });

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/account', login.ensureLoggedIn(),  function(req, res) {
  res.render('account', {
    user: req.user
  });
});

module.exports = router;
