'use strict';

/*
 * Main module
 */
angular.module('ginfluxApp', [ 'ngMaterialDashboard', //
'am-wb-chart', //
'nvd3' ])
// Load application
.run(function ($app) {
    $app.start('ginflux');
})
// TODO: check dashboard release 2.1
.config(function ($localStorageProvider) {
    $localStorageProvider.setKeyPrefix('ginflux.');
});