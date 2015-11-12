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
    });

module.exports = router;