/**
 * Created by enahum on 10/15/15.
 */

var mongoose = require('mongoose'),
    Q = require('q'),
    config = require('./config'),
    log = require('./log')(module);

mongoose.Promise = Q.Promise;

var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000, auto_reconnect: true } } };

mongoose.connect(process.env.MONGO_URL || config.get('mongoose:uri'), options);

var db = mongoose.connection;
var connected = false;
var error = null;

mongoose.connection.db.on('reconnect', function (ref) {
    connected = true;
    error = null;
    log.info('reconnect to mongo server.');
});

db.on('open', function (ref) {
    connected = true;
    error = null;
    log.info('open connection to mongo server.');
});

db.on('connected', function (ref) {
    connected = true;
    error = null;
    log.info('connected to mongo server.');
});

db.on('disconnected', function (ref) {
    connected = false;
    error = null;
    log.info('disconnected from mongo server.');
});

db.on('close', function (ref) {
    connected = false;
    error = null;
    log.info('close connection to mongo server');
});

db.on('error', function (err) {
    connected = false;
    if (err.message.indexOf('failed to connect') >= 0) {
        mongoose.connect(config.get('mongoose:uri'), options);
        db = mongoose.connection;
    }
    log.error('error connection to mongo server! ', err.message);

    error = {
        type: 'MongoDB',
        message: err.message
    };
});

process.on('SIGTERM', function () {
    mongoose.connection.close(function () {
        log.info('Mongoose disconnected on app termination');
        process.exit(0);
    });
});

process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        log.info('Mongoose disconnected on app termination');
        process.exit(0);
    });
});

var mongodb = {
    mongoose: mongoose,
    error: error,
    connected: connected,
    connection: db,
    models: {},
    errorHandler: function (err, res) {
        var message = err.message;
        if (err.errors) {
            var keys = Object.keys(err.errors);
            if (keys.length == 1)
                message = err.errors[keys[0]].message;
            else {
                message = [];
                for (i = 0; i < keys.length; i++) {
                    message.push(err.errors[keys[i]].message);
                }
            }
        }
        var error = {
            type: 'MongoDB',
            message: message
        };
        if(res) {
            res.status(500);
            return res.json(error);
        }
        else
            return error;
    }
};

module.exports = mongodb;