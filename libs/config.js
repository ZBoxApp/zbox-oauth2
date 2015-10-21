/**
 * Created by enahum on 10/15/15.
 */

/**
 * Carga los archivos de configuración según el entorno
 * @author Elias Nahum
 */
var events = require('events'),
    util = require('util'),
    log = require('./log')(module),
    nconf = require('nconf'),
    watch = require('node-watch'),
    fs = require('fs'),
    environment,
    config_file;

nconf.events = new events.EventEmitter();

nconf.argv().env();
environment = nconf.get('NODE_ENV') || 'development';
config_file = __dirname + '/../config/' + environment + '.json';

if(fs.existsSync(config_file)) {
    nconf.file({file: config_file});

    watch(config_file, function (filename) {
        nconf.argv()
            .env()
            .file({file: filename});
        log.warn('configuration changed');
        nconf.events.emit('changed');
    });

    log.info(environment + ' configuration file loaded');
}
else {
    log.error('file ' + config_file + ' does not exists');
    process.exit(0);
}

module.exports = nconf;