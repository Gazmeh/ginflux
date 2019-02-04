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
 * @ngdoc controller
 * @name GMeterReportStressConfigCtrl
 * 
 */
.controller('GInfluxReportCtrl', function($scope, $controller, $ghReport, $routeParams, $widget, $wbUtil, $actions, $navigator, FileSaver) {

    // init controller
    angular.extend(this, $controller('AmdAbstractDashboardCtrl', {
        $scope : $scope
    }));

    /**
     * Load dashboard data from application settings
     * 
     * NOTE: is an abstract method from supper controller
     */
    this.loadDashboardData = function(){
        var ctrl = this;
        return $ghReport.getLocalReport($routeParams.reportId)//
        .then(function(report){
            ctrl.report = report;
            ctrl.design = $wbUtil.clean(report.design || {});
            return ctrl.design;
        });
    };

    /**
     * 
     * NOTE: is an abstract method from supper controller
     */
    this.save = function (){
        this.report.design = this.design;
        toast('Report is saved successfully');
    };
    
    /**
     * Change global options of the report : title, description, ..
     */
    this.updateReportConfig = function(){
        // XXX: maso, 2018: open dialog and update the report
    };
    
    /**
     * Adds new variable set
     */
    this.addVariableSet = function(){
        var ctrl = this;
        prompt('Variable set name:', 'Variables')//
        .then(function(text){
            var result = $ghReport.addVariableSet({
                title: text
            });
            ctrl.setCurrentVariableSet(result);
            ctrl.reloadVariables();
        });
    };
    
    /**
     * Sets variable set
     */
    this.setCurrentVariableSet = function(variableSet){
        this.currentVariableSet = variableSet;
        $ghReport.setCurrentVariableSet(variableSet);
    };
    
    /**
     * Delete variable set
     */
    this.deleteVariableSet = function(){
        $ghReport.removeVariableSet(this.currentVariableSet);
        this.reloadVariables();
    };
    
    /**
     * reload variables
     */
    this.reloadVariables = function(){
        this.variableSets = $ghReport.getVariableSets();
        this.currentVariableSet = $ghReport.getCurrentVariableSet();
    };
    
    /**
     * Display a tool to manage variables
     */
    this.managesVariableSets = function(){
        $navigator.openDialog({
            templateUrl: 'views/dialogs/ginflux-mange-variable-sets.html',
            controller: 'GInfluxVariableSetCtrl', 
            controllerAs: 'ctrl',
            parent : angular.element(document.body),
            clickOutsideToClose : true,
            fullscreen: true,
            multiple:true,
        });
    };
    
    /**
     * Display list of variables
     */
    this.viewVariableSets = function(){
        $navigator.openDialog({
            templateUrl: 'views/dialogs/ginflux-view-variable-set.html',
            controller: 'GInfluxVariableSetCtrl', 
            controllerAs: 'ctrl',
            parent : angular.element(document.body),
            clickOutsideToClose : true,
            fullscreen: true,
            multiple:true,
        });
    };
    
    this.download = function(){
        var MIME_WB = 'application/weburger+json;charset=utf-8';

        // save  result
        var dataString = JSON.stringify(ctrl.design);
        var data = new Blob([dataString], {
            type: MIME_WB
        });
        return FileSaver.saveAs(data, ctrl.report.id+'.json');
    };
    
    this.upload = function(){
        var ctrl = this;
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.style.display = 'none';
        fileInput.onchange = function (event) {
            var reader = new FileReader();
            reader.onload = function (event) {
                var design = JSON.parse(event.target.result);
                ctrl.design = $wbUtil.clean(design || {});
                $scope.$digest();
            };
            reader.readAsText(event.target.files[0]);
        };
        document.body.appendChild(fileInput);
        // click Elem (fileInput)
        var eventMouse = document.createEvent('MouseEvents');
        eventMouse.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        fileInput.dispatchEvent(eventMouse);
    };
    
    this.widgetSelectEvent = function($event){
        this.loadSettings($event);
        // Find root widget
        if(!angular.isArray($event.widgets) || $event.widgets === 0){
            return;
        }
        var source = $event.widgets[0];
        if(source.isRoot()){
            this.rootWidget = source;
        }
    };
    
    this.reloadWidgets = function(){
        var widgets = $widget.getChildren(this.rootWidget);
        angular.forEach(widgets, function(widget){
            if(angular.isFunction(widget.refreshInflux)){
                try{
                    widget.refreshInflux();
                } catch(ex){};
            }
        });
    };
    
    
    var ctrl = this;
    $actions.newAction({
        id: 'ginflux.local.report.save',
        priority: 15,
        icon: 'save',
        title: 'Save modifications',
        description: 'Save modifications on the current report',
        action: function(){
            ctrl.save();
        },
        groups: ['mb.toolbar.menu'],
        scope: $scope
    });
    $actions.newAction({
        id: 'ginflux.local.report.edit',
        priority: 15,
        icon: 'edit',
        title: 'Edit the report',
        description: 'Edit current report',
        action: function(){
            ctrl.toogleEditable();
        },
        groups: ['mb.toolbar.menu'],
        scope: $scope
    });
    
    // call supper class init
    this.init();
    this.reloadVariables();

    //set default to edit mode
    this.toolbarMenu = $actions.group('mb.toolbar.menu');
});
