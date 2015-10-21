/**
 * Created by enahum on 10/15/15.
 */
var db = require('../libs/database'),
    fs = require('fs'),
    path = require('path'),
    basename  = path.basename(module.filename);

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf('.') !== 0) && (file !== basename);
    })
    .forEach(function(file) {
        if (file.slice(-3) !== '.js') return;
        var model = require(path.join(__dirname, file));
        db.models[model.modelName] = model;
    });

module.exports = db;