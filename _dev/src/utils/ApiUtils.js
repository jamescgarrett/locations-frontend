'use strict';

var ApiUtils = {};

ApiUtils.loadData = function (url, sendback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            sendback(JSON.parse(request.responseText));
        } else {
            // error
        }
    };
    request.onerror = function () {
        // error
    };
    request.send();
};

module.exports = ApiUtils;
