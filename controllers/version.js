/**
 * Created by enahum on 11/19/15.
 */
var db = require('../models'),
    errorRequestHandler = require('./errorRequestHandler'),
    compare = require('version-comparison'),
    fs = require('fs'),
    path = require('path'),
    controller = {};


controller.head = function(req, res) {
    return res.status(200).end();
};

controller.get = function(req, res) {
    var name = req.params.name,
        number = req.params.number,
        platform = req.params.platform,
        url = null;

    db.models.ServiceVersion.findByName(name, function(err, version) {
        if(err) {
            return db.errorHandler(err, res);
        } else if(!version) {
            return errorRequestHandler(404, 'Not Found', 'The service you\'re trying to check doesn\'t exists.', res);
        }

        if(compare(number, version.current) === -1) {
            url = version.findPlatformUrl(platform);
            if(url) {
                res.status(200);
                return res.json({
                    url: url,
                    name: name,
                    notes: version.notes,
                    pub_date: version.pub_date
                });
            }
        }

        return errorRequestHandler(204, 'No Content', 'There isn\'t an update available for your platform', res);
    });
};

controller.getAll = function(req, res) {
    db.models.ServiceVersion.find({}, function(err, versions) {
        if(err) {
            return db.errorHandler(err, res);
        }

        res.status(200);
        return res.json(versions);
    });
};

controller.findOne = function(req, res) {
    var name = req.params.name;

    db.models.ServiceVersion.findByName(name, function(err, version) {
        if(err) {
            return db.errorHandler(err, res);
        } else if(!version) {
            return errorRequestHandler(404, 'Not Found', 'The service you\'re trying to check doesn\'t exists.', res);
        }

        return res.status(200).json(version);
    });
};

controller.releases = function(req, res) {
    var app = req.params.name,
        platform = req.params.platform,
        url = null;

    db.models.ServiceVersion.findByName(app, function(err, version) {
        if(err) {
            return db.errorHandler(err, res);
        } else if(!version) {
            return errorRequestHandler(404, 'Not Found', 'The service you\'re trying to check doesn\'t exists.', res);
        }

        url = version.findPlatformUrl(platform);
        if(url) {
            return res.redirect(url + 'RELEASES');
        }

        return errorRequestHandler(204, 'No Content', 'There isn\'t an update available for your platform', res);
    });
};

controller.create = function(req, res) {
    var app = req.body;
    db.models.ServiceVersion.findByName(app.name, function(err, service) {
        if (err) {
            return db.errorHandler(err, res);
        } else if (service) {
            return errorRequestHandler(409, 'Conflict', 'The service you\'re trying to create already exists.', res);
        }

        new db.models.ServiceVersion({
            name: app.name,
            current: app.current,
            notes: app.notes,
            link: app.link
        })
            .save(function(err, created) {
                if(err) {
                    return db.errorHandler(err, res);
                }

                return res.json(created);
            });

    });
};

controller.update = function(req, res){
    var app = req.body;
    db.models.ServiceVersion.findByName(app.name, function(err, service) {
        if(err) {
            return db.errorHandler(err, res);
        } else if(!service) {
            return errorRequestHandler(404, 'Not Found', 'The service you\'re trying to update doesn\'t exists.', res);
        }

        service.current = app.current || service.current;
        service.notes = app.notes || service.notes;
        service.link = app.link || service.link;
        service.pub_date = Date.now();

        service.save(function(err, updated) {
            if(err) {
                return db.errorHandler(err, res);
            }

            return res.json(updated);
        });
    });
};

controller.remove = function(req, res) {
    db.models.ServiceVersion.findByName(req.params.name, function(err, service) {
        if (err) {
            return db.errorHandler(err, res);
        } else if (!service) {
            return errorRequestHandler(404, 'Not Found', 'The service you\'re trying to remove doesn\'t exists.', res);
        }

        service.remove(function(err) {
            if (err) {
                return db.errorHandler(err, res);
            }

            return res.json(true);
        });
    });
};

controller.download = function(req, res) {
    var filename,
        file = req.params.file,
        app = req.params.name,
        platform = req.params.platform,
        url = null;

    if(!app) {
        filename = path.join(__dirname, '../releases', file);
        fs.access(filename, fs.R_OK, function(err) {
            if(err) {
                return errorRequestHandler(404, 'Not Found', 'The file you\'re trying to download doesn\'t exists.', res);
            }

            return res.download(filename, file);
        });
    } else {
        db.models.ServiceVersion.findByName(app, function(err, version) {
            if(err) {
                return db.errorHandler(err, res);
            } else if(!version) {
                return errorRequestHandler(404, 'Not Found', 'The service you\'re trying to check doesn\'t exists.', res);
            }

            url = version.findPlatformUrl(platform);
            if(url) {
                return res.redirect(url + file);
            }

            return errorRequestHandler(204, 'No Content', 'There isn\'t an update available for your platform', res);
        });
    }
};

module.exports = controller;
