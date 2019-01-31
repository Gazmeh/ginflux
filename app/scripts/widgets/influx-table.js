/*
 * Copyright (c) 2018 Gazmeh. (http://gazmeh.ir)
 */
'use strict';





angular.module('ginfluxApp')//

/**
 * @ngdoc Widget
 * @name GInfluxTableWidgetCtrl
 * @description Display query in a table
 * 
 * Runs a query set and display results in a table view. There are two main properties to
 * use in display:
 * 
 * - header
 * - body
 *
 */
.controller('GInfluxTableWidgetCtrl', function($scope, $controller, $sheet) {

    // extend
    angular.extend(this, $controller('GInfluxAbstractWidgetCtrl', {
        $scope : $scope,
    }));

    /*
     * Init the widget
     */
    this.initChart = function(){
        var ctrl = this;
        this.on('state', function($event){
            if($event.newState === 'loaded') {
                ctrl.loadNewData();
            }
        });
        this.on('modelUpdated', function($event){
            var key = $event.key;
            if(angular.equals(key, 'isTranspose') ||
                    angular.equals(key, 'removeTime') ||
                    angular.equals(key, 'removeSeries')){
                ctrl.loadNewData();
            }
        });
    };


    /*
     * Load widget data from the query result 
     */
    this.loadNewData = function() {
        // load query
        var queries = this.getVisibleQueries('queries');
        this.assertTrue(queries.length > 0, 'No visible query is available');
        this.assertTrue(queries.length === 1, 'Table widget support just a single visible query');

        // data model to be extracted from query result
        var query = queries[0];
        var result = this.getCacheResult(query, 0);
        var series = result.series;

        this.multiSeries = series.length > 1;
        
        this.removeSeries = this.getModelProperty('removeSeries');

        this.headers = this.getCacheColumns(query, 0) || [];
        this.headers = _.cloneDeep(this.headers);
        if(this.multiSeries && !this.removeSeries) {
            this.headers.unshift('series');
        }


        if(this.multiSeries) {
            this.body = _.cloneDeep(series);
            for(var i = 0 ;i < this.body.length; i++){
                this.body[i].label = this.tagsToLable(this.body[i].tags);
            }
        } else {
            this.body = this.getCacheSeriesValues(query, 0, 0) || [];
        }


        if(this.getModelProperty('removeTime')){
            this.removeTimeColumn();
        }

        this.isTranspose = this.getModelProperty('isTranspose');
        if(this.isTranspose){
            this.transpose();
        }

    };

    this.transpose = function(){
        if(this.multiSeries) {
            alert('Transpose mode for multi sieries result are not suported');
            return;
        }
        this.body = _.cloneDeep(this.body);
        this.body.unshift(this.headers);
        this.body = $sheet.transposeValues(this.body);
    };

    this.tagsToLable = function(tags) {
        if(!tags){
            return '';
        }
        // tags to string
        var label = '';
        for(var key in tags) {
            label = label + key + ':' + tags[key] + ',';
        }
        return label;
    };

    this.removeTimeColumn = function(){
        // remove from header
        var index = this.headers.indexOf('time');
        if(index == -1){
            return;
        }
        this.headers = _.cloneDeep(this.headers);
        this.headers.splice(index, 1);
        if(this.multiSeries) {
            for(var i = 0 ;i < this.body.length; i++){
                this.body[i].values = $sheet.removeColumn(this.body[i].values, index - 1);
            }
        } else {
            this.body = $sheet.removeColumn(this.body, index);
        }
    }

});
