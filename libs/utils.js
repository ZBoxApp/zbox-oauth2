'use strict';

/**
 * Herramientas utiles
 * @namespace utils
 * @author Elias Nahum
 * @param {object|undefined} utils - Objeto utils a ser extendido
 */
var utils = {};

/**
 * Permite extender un objeto con las propiedades de otros
 * @function extend
 * @author Elias Nahum
 * @param out
 * @example
 * extend(obj, {name: 'test'}, {id: 0});
 * @returns {*|{}} retorna el objeto con las nuevas propiedades asignadas
 */
utils.extend = function(out) {
    out = out || {};

    for (var i = 1; i < arguments.length; i++) {
        if (!arguments[i])
            continue;

        for (var key in arguments[i]) {
            if (arguments[i].hasOwnProperty(key))
                out[key] = arguments[i][key];
        }
    }

    return out;
};

/**
 * Permite extender un objeto con las propiedades de otros objetos anidados
 * @function deepExtend
 * @author Elias Nahum
 * @param out
 * @example
 * extend(obj, {user: { name: 'test' } }, {comment: { id: 0, text: 'example' } });
 * @returns {*|{}} retorna el objeto con las nuevas propiedades asignadas
 */
utils.deepExtend = function(out) {
    out = out || {};

    for (var i = 1; i < arguments.length; i++) {
        var obj = arguments[i];

        if (!obj)
            continue;

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'object')
                    this.deepExtend(out[key], obj[key]);
                else
                    out[key] = obj[key];
            }
        }
    }

    return out;
};

/**
 * Return a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */
utils.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};

/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uid(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */
utils.uid = function(len) {
    var buf = [],
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        charlen = chars.length,
        i = 0;

    for(; i < len; i++) {
        buf.push(chars[utils.getRandomInt(0, charlen -1)]);
    }
    return buf.join('');
};

module.exports = utils;