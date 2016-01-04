/**
 * Created by enahum on 10/15/15.
 */
var winston = require('winston'),
    //fs = require('fs'),
    path = require('path');

var colors = {
    silly: 'magenta',
    verbose: 'cyan',
    info: 'green',
    data: 'grey',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
};

var filename = path.join(__dirname, '/../logs/', process.env.LOG_FILENAME || 'zboxauth');

/**
 * @function getLogger
 * @author Elias Nahum
 * @param module - El modulo desde donde se desea indicar que ocurrió el log
 * @returns {*} - retorna el logger de winston
 */
function getLogger(module) {
    var path = module.filename.split('/').slice(-2).join('/'),
        level = process.env.LOG_LEVEL || 'info',
        transports = [
            new winston.transports.Console({
                colorize: true,
                level: level,
                label: path
            })];

    if(process.env.LOG_TO_FILESYSTEM) {
        transports.push(new winston.transports.DailyRotateFile({
            level: level,
            label: path,
            colorize: true,
            timestamp: true,
            filename: filename,
            maxsize: 10485760,
            maxFiles: 10,
            json: true,
            stringify: true,
            showLevel: true,
            tailable: true,
            zippedArchive: true,
            datePattern: 'yyyy-MM-dd.log'
        }));
    }

    return new winston.Logger({
        transports: transports,
        colors: colors
    });
}

module.exports = getLogger;