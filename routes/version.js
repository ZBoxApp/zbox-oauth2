/**
 * Created by enahum on 11/12/15.
 */
var express = require('express'),
    router = express.Router(),
    db = require('../models');

router.route('/version/:service')
    .head(function(req, res){
        res.status(200);
        return res.end();
    })
    .get(function(req, res) {
        db.models.ServiceVersion.findByName(req.params.service, function(err, service) {
            if(err) {
                return db.errorHandler(err, res);
            } else if(!service) {
                res.status(404);
                return res.json({
                    type: 'Not found',
                    message: "The service you're trying to check doesn't exists."
                });
            }

            return res.json(service);
        });
    })
    .patch(function(req, res){
        var app = req.body;
        db.models.ServiceVersion.findByName(req.params.service, function(err, service) {
            if(err) {
                return db.errorHandler(err, res);
            } else if(!service) {
                res.status(404);
                return res.json({
                    type: 'Not found',
                    message: "The service you're trying to update doesn't exists."
                });
            }

            service.min = app.min || service.min;
            service.current = app.current || service.current;
            service.link = app.link || service.link;
            service.save(function(err, updated) {
                if(err) {
                    return db.errorHandler(err, res);
                }

                return res.json(updated);
            });
        });
    })
    .post(function(req, res) {
        var app = req.body;
        db.models.ServiceVersion.findByName(req.params.service, function(err, service) {
            if (err) {
                return db.errorHandler(err, res);
            } else if (service) {
                res.status(409);
                return res.json({
                    type: 'Conflict',
                    message: "The service you're trying to create already exists."
                });
            }

            new ServiceVersion({
                name: req.params.service,
                min: app.min,
                current: app.current,
                link: app.link
            }).save(function(err, created) {
                if(err) {
                    return db.errorHandler(err, res);
                }

                return res.json(created);
            });

        });
    })
    .delete(function(req, res) {
        db.models.ServiceVersion.findByName(req.params.service, function(err, service) {
            if (err) {
                return db.errorHandler(err, res);
            } else if (!service) {
                res.status(404);
                return res.json({
                    type: 'Not found',
                    message: "The service you're trying to update doesn't exists."
                });
            }

            service.remove(function(err) {
                if (err) {
                    return db.errorHandler(err, res);
                }

                return res.json(true);
            });
        });
    });

module.exports = router;