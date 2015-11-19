/**
 * Created by enahum on 11/19/15.
 */


module.exports = function(status, type, message, res) {
    res.status(status);
    return res.json({
        type: type,
        message: message
    });
};