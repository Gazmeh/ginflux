/*
 * Copyright (c) 2015 Phoenix Scholars Co. (http://dpq.co.ir)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
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
 * @ngdoc service
 * @name $$designer
 * @description Designer service
 * 
 * Manage designer items
 */
.service('$ghReport', function ($rootScope, $q) {

    /**
     * Gets default URL
     */
    this.getDefaultBackend = function () {
        return $rootScope.app.setting.ginfluxUrl;
    };
    
    this.getDefaultQueryIndex = function(){
        return $rootScope.app.setting.ginfluxIndex || 'time';
    };
    
    /**
     * Get local reports
     * 
     */
    this.getLocalReports = function () {
        if (!angular.isArray($rootScope.app.setting.ginfluxRerports)) {
            $rootScope.app.setting.ginfluxRerports = [];
        }
        return $q.resolve({
            items: $rootScope.app.setting.ginfluxRerports
        });
    };

    /**
     * Gets local report with id
     * 
     * @params {Object} id
     */
    this.getLocalReport = function (id) {
        if (!angular.isArray($rootScope.app.setting.ginfluxRerports)) {
            $rootScope.app.setting.ginfluxRerports = [];
        }
        var reports = $rootScope.app.setting.ginfluxRerports;
        for(var i = 0; i < reports.length; i++){
            var report = reports[i];
            if(report.id === id){
                return $q.resolve(report);
            }
        }
        return $q.reject({
            status: 404,
            code: 404,
            message: 'report not found'
        });
    };

});

