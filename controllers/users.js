/**
 * Created by enahum on 11/19/15.
 */
var db = require('../models'),
    config = require('../libs/config'),
    errorRequestHandler = require('./errorRequestHandler'),
    controller = {};

controller.client = function(req, res) {
    return res.json({ client_id: req.user.id, name: req.user.name, scope: req.authInfo.scope });
};

controller.me = function(req, res) {
    var user = req.user;

    var u = {
        _id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        team: user.team,
        isEnabled: user.isEnabled,
        chatEnabled: user.chatEnabled,
        role: user.role,
        isZimbra: user.isZimbra
    };

    return res.json(u);
};

controller.findById = function(req, res) {
    var id = req.params.id;
    db.models.User.get(id, function(err, user) {
        if(err) {
            return db.errorHandler(err, res);
        } else if(!user) {
            return errorRequestHandler(404, "Not Found", "The user you looking for doesn't exists.", res);
        }


        var u = {
            _id: user._id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            team: user.team,
            isEnabled: user.isEnabled,
            chatEnabled: user.chatEnabled,
            role: user.role,
            isZimbra: user.isZimbra
        };

        return res.json(u);
    })
};

controller.findByTeam = function(req, res) {
    var team = req.params.team;
    db.models.User.findByTeam(team, function(err, users) {
        if(err) {
            return db.errorHandler(err, res);
        }
        return res.json(users);
    });
};

controller.create = function(req, res) {
    var json = req.body;


    if(!json.email) {
        return errorRequestHandler(400, "Bad Request", 'Setting the user email is mandatory', res);
    } else if(!json.password) {
        return errorRequestHandler(400, "Bad Request", 'Setting the user password is mandatory', res);
    } else if(!json.team) {
        return errorRequestHandler(400, "Bad Request", 'Setting the user team is mandatory', res);
    }

    json.isZimbra = false;
    json.zimbraUrl = config.get("chat:url");

    var create = new db.models.User(json);
    create.save(function(err, user) {
        if(err) {
            return db.errorHandler(err, res);
        }

        var u = {
            _id: user._id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            team: user.team,
            isEnabled: user.isEnabled,
            chatEnabled: user.chatEnabled,
            role: user.role,
            isZimbra: user.isZimbra
        };

        return res.json(u);
    });
};

// The user cannot change teams
controller.update = function(req, res) {
    var json = req.body;
    db.models.User.get(json._id, function(err, user) {
        if(err) {
            return db.errorHandler(err, res);
        } else if(!user) {
            return errorRequestHandler(404, "Not Found", "The user you looking for doesn't exists.", res);
        }

        if(user.isZimbra) {
            return errorRequestHandler(400, "Bad Request", 'Zimbra users should be updated using the Zimbra account', res);
        }

        if(json.password) {
            user.password = json.password;
        }

        user.email = json.email || user.email;
        user.firstname = json.firstname || user.firstname;
        user.lastname = json.lastname || user.lastname;
        user.isEnabled = json.isEnabled || user.isEnabled;
        user.chatEnabled = json.chatEnabled || user.chatEnabled;
        user.role = json.role || user.role;

        user.save(function(err, u) {
            if(err) {
                return db.errorHandler(err, res);
            }

            return res.json(true);
        });

    });
};

controller.remove = function(req, res) {
    db.models.User.get(req.params.id, function(err, user) {
        if (err) {
            return db.errorHandler(err, res);
        } else if (!user) {
            return errorRequestHandler(404, "Not Found", "The user you're trying to remove doesn't exists.", res);
        }

        user.remove(function(err) {
            if (err) {
                return db.errorHandler(err, res);
            }

            return res.json(true);
        });
    });
};

module.exports = controller;