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
.controller('GInfluxTableWidgetCtrl', function($scope, $controller) {

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
    };
    

    /*
     * Load widget data from the query result 
     */
    this.loadNewData = function() {
        // load query
        var queries = this.getVisibleQueries('queries');
        this.assertTrue(queries.length > 0, 'No visible query is available');
        this.assertTrue(queries.length === 1, 'Table widget support just a single visible query');
        var query = queries[0];

        // data model to be extracted from query result
        this.headers = this.getCacheColumns(query, 0) || [];
        this.body = this.getCacheSeriesValues(query, 0, 0) || [];
    };

});
