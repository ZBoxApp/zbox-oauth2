var express = require('express'),
    session = require('express-session'),
    SessionStore = require('./libs/session-store'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    flash = require('connect-flash'),
    config = require('./libs/config'),
    db = require('./models'),
    passport = require('./libs/strategies'),
    routes = require('./routes'),
    oauth = require('./routes/oauth'),
    users = require('./routes/users'),
    version = require('./routes/version');
    app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('ZBoxAuthS3cr3t'));
app.use(session({
    store: new SessionStore({
        collection: 'sessions',
        expire: config.get("mongoose:expires"),
        instance: db.mongoose
    }),
    name: 'zboxAuth',
    secret: 'ZBoxAuthS3cr3t',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('view options', { layout: 'layouts/main' });
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/images/favicon.ico'));

app.use('/', routes);
app.use('/', users);
app.use('/', version);
app.use('/oauth', oauth);

// error handlers
var errorHandler = function(err, res, show) {
    var status = err.status || 500;
    res.status(status);
    res.render('error', {
        message: err.message,
        error: show ? err : null
    });
};

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        errorHandler(err, res, true);
    });
} else {
    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        errorHandler(err, res, false);
    });
}



module.exports = app;
