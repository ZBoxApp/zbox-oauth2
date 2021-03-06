/**
 * Created by enahum on 10/14/15.
 */
var session = require('express-session'),
    mongoose = require('mongoose'),
    logger = require('./log');

var MongoStore = {
    client: null,
    options: {},
    get: function (sid, cb) {
        MongoStore.client.findOne({sid: sid}, function (err, doc) {
            try {
                if (err) return cb(err, null);

                if (!doc) return cb();

                cb(null, doc.data); // JSON.parse(doc.data)
            }
            catch (err) {
                cb(err);
            }
        });
    },
    set: function (sid, data, cb) {
        try {
            var lastAccess = new Date();
            var expires = lastAccess.setDate(lastAccess.getDate() + 1);

            if (typeof data.cookie != 'undefined') {
                expires = data.cookie._expires;
            }

            if (typeof data.lastAccess != 'undefined') {
                lastAccess = new Date(data.lastAccess);
            }

            MongoStore.client.findOneAndUpdate({sid: sid}, {
                data: JSON.parse(JSON.stringify(data)), //JSON.stringify(data)
                lastAccess: lastAccess,
                expires: expires
            }, { upsert: true }, cb);
        }
        catch (err) {
            logger.log('error', 'express-sessions', err);

            cb && cb(err);
        }
    },
    destroy: function (sid, cb) {
        MongoStore.client.remove({ sid: sid }, cb);
    },
    all: function (cb) {
        MongoStore.client.find(function (err, doc) {
            if (err) {
                return cb && cb(err);
            }

            cb && cb(null, doc);
        });
    },
    length: function (cb) {
        MongoStore.client.count(function (err, count) {
            if (err) {
                return cb && cb(err);
            }

            cb && cb(null, count);
        });
    },
    clear: function (cb) {
        MongoStore.client.drop(function (err) {
            if (err) {
                return cb && cb(err);
            }

            cb && cb();
        });
    }
};

var SessionStore = function (opts, cb) {
    var options = {
        host: opts.host || 'localhost',
        port: opts.port || 27017,
        db: opts.db || 'test',
        connectionString: opts.connectionString || null,
        collection: opts.collection || 'sessions',
        instance: opts.instance || null,
        expire: opts.expire || 86400
    };

    session.Store.call(this, options);

    if (options.instance) {
        mongoose = options.instance;
    } else if (options.connectionString) {
        mongoose.connect(options.connectionString);
    } else {
        mongoose.connect('mongodb://' + options.host + ':' + options.port + '/' + options.db);
    }

    var schema = new mongoose.Schema({
        sid: { type: String, required: true, unique: true },
        data: { type: {} },
        lastAccess: { type: Date, index: { expires: parseInt(options.expire) } },
        expires: { type: Date, index: true }
    });

    MongoStore.options = options;
    MongoStore.client = mongoose.model(options.collection, schema);

    for (var i in MongoStore) {
        SessionStore.prototype[i] = MongoStore[i];
    }


    if (cb) cb.call(null);
};

SessionStore.prototype = new session.Store();

module.exports = SessionStore;