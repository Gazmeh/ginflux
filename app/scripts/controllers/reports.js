/*
 * Copyright (c) 2015 Phoenix Scholars Co. (http://dpq.co.ir)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';
angular.module('ginfluxApp')

/**
 * @ngdoc controller
 * @name ReportTestsCtrl
 * 
 */
.controller('GInfluxReportsCtrl', function ($scope, $rootScope, $wbCrypto, $navigator, $ghReport, $actions) {

    /**
     * Load reports
     */
    this.load = function () {
        // load local reports
        var ctrl = this;
        $ghReport.getLocalReports()//
        .then(function(reports){
            ctrl.reports = reports.items;
        });
    };

    this.createReport = function () {
        var item = _.clone({
                title : 'Simple report',
                description : 'An exampler report'
        });
        var d = new Date();
        item.id = $wbCrypto.md5(d.toString());
        this.reports.push(item);
        this.openReport(item);
    };
    
    this.cloneReport = function (report) {
        var item = _.clone(report);
        var d = new Date();
        item.id = $wbCrypto.md5(d.toString());
        this.reports.push(item);
        this.openReport(item);
    };
    
    this.removeReport = function($index) {
        this.reports.splice($index, 1);
    };
    
    this.openReport = function(report) {
        $navigator.openPage('reports/'+report.id);
    };

    // Watch application state
    var ctrl = this;
    $scope.$watch('app.state.status', function(state){
        if(state && state.startsWith('ready')){
            ctrl.load();
        }
    });
    
    $actions.newAction({
        id: 'ginflux.local.db.setting',
        priority: 13,
        icon: 'storage',
        title: 'Global InfluxDB settings',
        description: 'Manage global (local) settings of InfluxDB',
        action: function(){
            $navigator.openDialog({
                templateUrl: 'views/dialogs/ginflux-local-setting.html',
                parent : angular.element(document.body),
                clickOutsideToClose : true,
                fullscreen: true,
                multiple:true,
                scope: $rootScope
            });
        },
        groups: ['mb.toolbar.menu'],
        scope: $scope
    });
});
