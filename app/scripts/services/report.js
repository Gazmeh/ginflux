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
.service('$ghReport', function ($rootScope, $q, FileSaver) {

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

    /**
     * Gets list of variable set
     */
    this.getVariableSets = function(){
        if(!angular.isArray($rootScope.app.setting.ginfluxVirableSet) ||
                $rootScope.app.setting.ginfluxVirableSet.length === 0){
            $rootScope.app.setting.ginfluxVirableSet = [{
                title: 'Variables',
                items: [
                    {active: true, key: 'host', value: 'http://195.146.59.40:8086/query'},
                    {active: true, key: 'db', value: 'test_run_2406'},
                    {active: true, key: 'measurement', value: 'samples'},
                    ]
            }];
        }
        return $rootScope.app.setting.ginfluxVirableSet;
    };

    /**
     * Sets current variable sets
     */
    this.setCurrentVariableSet = function(variableSet){
        var index = $rootScope.app.setting.ginfluxVirableSet.indexOf(variableSet);
        $rootScope.app.setting.ginfluxCurrentVirableSetIndex = index;
    };

    /**
     * Gets current variable sets
     */
    this.getCurrentVariableSet = function(){
        var index = $rootScope.app.setting.ginfluxCurrentVirableSetIndex;
        if(index < 0 || index > $rootScope.app.setting.ginfluxVirableSet.length){
            index = 0;
        }
        return $rootScope.app.setting.ginfluxVirableSet[index];
    };

    /*
     * Downloads last variable set 
     */
    this.downloadCurrentVariableSet = function(){
        var varset = this.getCurrentVariableSet();
        var MIME_WB = 'application/json;charset=utf-8';

        // save  result
        var dataString = JSON.stringify(varset);
        var data = new Blob([dataString], {
            type: MIME_WB
        });
        return FileSaver.saveAs(data, varset.title + '.json');
    };

    /*
     * Upload and set the current variable set
     */
    this.uploadVariableSet = function(){
        var service = this;

        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.style.display = 'none';
        fileInput.onchange = function (event) {
            var reader = new FileReader();
            reader.onload = function (event) {
                var varset = JSON.parse(event.target.result);
                service.addVariableSet(varset);
                $rootScope.$digest();
            };
            reader.readAsText(event.target.files[0]);
        };
        document.body.appendChild(fileInput);
        // click Elem (fileInput)
        var eventMouse = document.createEvent('MouseEvents');
        eventMouse.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        fileInput.dispatchEvent(eventMouse);
    };

    /**
     * Adds new variable sets
     */
    this.addVariableSet = function(variableSet){
        if(!angular.isArray($rootScope.app.setting.ginfluxVirableSet)){
            $rootScope.app.setting.ginfluxVirableSet = [];
        }
        $rootScope.app.setting.ginfluxVirableSet.push(variableSet);
        this.setCurrentVariableSet(variableSet);
        return variableSet;
    };

    /**
     * Removes a variable set
     */
    this.removeVariableSet = function (variableSet){
        if(!angular.isArray($rootScope.app.setting.ginfluxVirableSet)){
            $rootScope.app.setting.ginfluxVirableSet = [];
            return;
        }
        var index = $rootScope.app.setting.ginfluxVirableSet.indexOf(variableSet);
        if(index >= 0) {
            $rootScope.app.setting.ginfluxVirableSet.splice(index, 1);
            if($rootScope.app.setting.ginfluxVirableSet.length){
                this.setCurrentVariableSet($rootScope.app.setting.ginfluxVirableSet[0]);
            }
        }
    };

    /**
     * Update variable sets
     */
    this.updateVariableSet = function() {
        // Variable sets are stored automatically
    };
});

