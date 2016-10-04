'use strict';

import util from 'gulp-util';

export default {
    production: !!util.env.production,
    jsEntry: 'src/locations.js',
    jsAll: ['src/**/*.js'],
    jsBundle: 'locations.js',
    jsDist: '../src/js'
};