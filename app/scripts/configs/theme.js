/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ginfluxApp')
/*
 * System theme
 */
.config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')//
    .primaryPalette('teal', {
        'default' : '800',
        'hue-1' : '700',
        'hue-2' : '600',
        'hue-3' : '500'
    }).accentPalette('orange', {
        'default' : '600'
    })//
    .warnPalette('red', {
        'default' : '700'
    });
});
