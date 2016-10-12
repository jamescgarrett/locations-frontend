'use strict';

var Utils = {};

Utils.extend = function (source, properties) {
    var property;
    for (property in properties) {
        if (properties.hasOwnProperty(property)) {
            source[property] = properties[property];
        }
    }
    return source;
};

Utils.validate = function (type, value) {

    switch (type) {
        case 'zip':
            if (/^\s*\d{5}\s*$/.test(value) || /[a-zA-Z][0-9][a-zA-Z](-| |)[0-9][a-zA-Z][0-9]/.test(value)) {
                return true;
            }
            break;
        case 'radius':
            if (/^\d+$/.test(value)) {
                return true;
            }
            break;
        default:
            alert('Something bad happened!');
            break;
    }

    return false;
};

module.exports = Utils;
