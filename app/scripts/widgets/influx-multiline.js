/*
 * Copyright (c) 2018 Gazmeh. (http://gazmeh.ir)
 */
'use strict';

angular.module('ginfluxApp')//

/**
 * @ngdoc Widget
 * @name GInfluxTableWidgetCtrl
 * @description Display query in a Line
 * 
 */
.controller('GInfluxMultilineWidgetCtrl', function ($scope, $controller, $sheet) {

    // extend
    angular.extend(this, $controller('GInfluxAbstractWidgetCtrl', {
        $scope : $scope,
    }));

    /*
     * Init the widget
     */
    this.initChart = function () {
        var ctrl = this;
        this.on('state', function ($event) {
            if ($event.newState === 'loaded') {
                ctrl.loadNewData();
                ctrl.loadCahrt();
            }
        });
        this.on('modelUpdated', function($event){
            var key = $event.key || '';
            if(key.startsWith('series')) {
                ctrl.loadViewData();
            }
            if(key.startsWith('chart')) {
                ctrl.loadCahrt();
            }
        });
    };

    /*
     * Load widget data from the query result
     */
    this.loadNewData = function () {
        // load query
        var queries = this.getVisibleQueries('queries');
        this.assertTrue(queries.length > 0, 'No visible query is available');
        this.series = this.getModelProperty('series') || [];
        // load series of each query
        this.markAllSeriesDeleted();
        for(var i = 0; i < queries.length; i++){
            var keys = this.mapQueryToKeys(queries[i]);
            for(var j = 0; j < keys.length; j++){
                var series = this.getSeriesByKey(keys[j]);
                if(series) {
                    this.unmarkAllSeriesDeleted(series);
                } else {
                    series = this.createNewSeries(keys[j]);
                    this.series.push(series);
                }
            }
        }
        this.removeAllMarkedSeries();
        this.setModelProperty('series', this.series);
        this.loadViewData();
    };


    /*******************************************************************
     * 
     *******************************************************************/
    this.loadCahrt = function () {
        var xformat = {
                type : this.getModelProperty('chart.x.format.type') || 'Time',
                specifier : this.getModelProperty('chart.x.format.specifier') || 'HH:MM:SS'
        };
        var yformat = {
                type : this.getModelProperty('chart.y.format.type') || 'Number',
                specifier : this.getModelProperty('chart.y.format.specifier') || '.2s'
        };
        var y2format = {
                type : this.getModelProperty('chart.y1.format.type') || 'Number',
                specifier : this.getModelProperty('chart.y1.format.specifier') || '.2s'
        };
        this.option = {
                chart : {
                    type : 'multiChart',
                    // size
                    height : this.getModelProperty('chart.height') || 450,
                    margin : { // replace with widget margin
                        top : this.getModelProperty('chart.margin.top') || 0,
                        right : this.getModelProperty('chart.margin.right') || 0,
                        bottom : this.getModelProperty('chart.margin.bottom') || 0,
                        left : this.getModelProperty('chart.margin.left') || 0
                    },
                    // legend
                    showLegend: this.getModelProperty('chart.legend.enable'),
                    legendPosition: this.getModelProperty('chart.legend.position') || 'top',
                    legend : {
                        align : this.getModelProperty('chart.legend.align'),
                        margin : {
                            top : this.getModelProperty('chart.legend.margin.top') || 0,
                            right : this.getModelProperty('chart.legend.margin.right') || 0,
                            bottom : this.getModelProperty('chart.legend.margin.bottom') || 0,
                            left : this.getModelProperty('chart.legend.margin.left') || 0
                        },
                    },
                    xAxis : {
                        showMaxMin : this.getModelProperty('chart.x.showMaxMin'),
                        axisLabel : this.getModelProperty('chart.x.label') || 'No label',
                        tickFormat : function (data) {
                            return $sheet.formatData(data, xformat);
                        }
                    },
                    x : function (d) {
                        return d[0];
                    },
                    y : function (d) {
                        return d[1];
                    },
                    useInteractiveGuideline : true,
                    yAxis1 : {
                        showMaxMin : this.getModelProperty('chart.y.showMaxMin'),
                        axisLabel : this.getModelProperty('chart.y.label') || 'No label',
                        tickFormat : function (data) {
                            return $sheet.formatData(data, yformat);
                        }
                    },
                    yAxis2 : {
                        showMaxMin : this.getModelProperty('chart.y2.showMaxMin'),
                        axisLabel : this.getModelProperty('chart.y2.label') || 'No label',
                        tickFormat : function (data) {
                            return $sheet.formatData(data, y2format);
                        }
                    },
                    // TODO: mgh: Issues in tooltip values formatting; the
                    // following code dose not work I guss we should
                    // use'extended" mode
                    tooltip : {
                        valueFormatter : function (d) {
                            return $sheet.formatData(d, {
                                type : 'Number',
                                specifier : '.2s'
                            });
                        }
                    }
                }
        };
    };


    /**
     * Load widget data
     * 
     * The series in the widget is create from model.cache and model.series.
     * 
     * model.cach contains data form query
     * 
     * model.series contains UI data
     * 
     * The widget series is combination of data and UI
     */
    this.loadViewData = function () {
        this.data = [];
        for(var i = 0; i < this.series.length; i++){
            var values = this.getValues(this.series[i]);
            var serie = {
                    values : values, //
                    tags : this.series[i].tags,
                    key : this.series[i].title,
                    color: this.series[i].color,
                    //columns : g.columns,
                    type : this.series[i].type || 'line',
                    yAxis : this.series[i].yAxis || 1
            };
            this.data.push(serie);
        }
    };


    /*************************************************************
     *                                                           *
     *************************************************************/
    this.markAllSeriesDeleted = function(){
        if(!this.series){
            return;
        }
        angular.forEach(this.series, function(serie){
            serie.markDeleted = true;
        });
    };

    this.removeAllMarkedSeries = function(){
        if(!this.series){
            return;
        }
        var condidates = [];
        for(var i = 0; i < this.series.length; i++){
            if(this.series[i].markDeleted) {
                condidates.push(i);
            }
        }
        var ctrl = this;
        angular.forEach(condidates, function(i) {
            ctrl.series.splice(i, 1);
        });
    };

    this.getSeriesByKey = function(key) {
        var series = this.getModelProperty('series') || [];
        for(var i = 0; i < series.length; i++){
            if(this.isSeriesKey(series[i], key)) {
                return series[i];
            }
        }
        return null;
    };

    this.createNewSeries = function(key){
        var query = this.getQueryByFingerprint(key.fingerPrint);
        return _.merge({
            // UI
            title : query.title,
            description : query.description,
            color: '#000000' // TODO: maso, 2018: put random
        }, key);
    };

    this.unmarkAllSeriesDeleted = function(series) {
        series.markDeleted = false;
    };

    /*************************************************************
     *                     overried for new  
     *************************************************************/
    this.mapQueryToKeys = function(query) {
        var keys = [];
        var resultsCount = this.queryCacheResultsSize(query);
        var index = this.getQueryIndex(query);
        for(var resultIndex = 0; resultIndex < resultsCount; resultIndex++){ 
            var result = this.getCacheResult(query, resultIndex);
            var seriesCount = result.series.length;
            for(var seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++){
                var dataSeries = this.getCacheSeries(query, resultIndex, seriesIndex);
                for(var i =0; i < dataSeries.columns.length; i++) {
                    var column = dataSeries.columns[i];
                    if (column === 'time' || column === index) {
                        continue;
                    }
                    keys.push({// ID
                        fingerPrint : query.fingerPrint,
                        resultIndex: resultIndex,
                        seriesIndex: seriesIndex,
                        column : column
                    });
                }
            }
        }
        return keys;
    };

    this.isSeriesKey = function(series, key) {
        return series.fingerPrint === key.fingerPrint && 
        series.resultIndex === key.resultIndex && 
        series.seriesIndex === key.seriesIndex && 
        series.column === key.column;
    };

    this.getValues = function(key) {
        var query = this.getQueryByFingerprint(key.fingerPrint);
        var columns = this.getCacheSeriesColumns(query, key.resultIndex, key.seriesIndex);
        var values = this.getCacheSeriesValues(query, key.resultIndex, key.seriesIndex);
        // copy column
        var index = columns.indexOf(this.getQueryIndex(query));
        var data = columns.indexOf(key.column);
        var newValues = $sheet.copyColumns(values, [index, data]);
        // justify
        if(key.isJustifyX){
            $sheet.justify(newValues, 0);
        }
        if(key.isJustifyY){
            $sheet.justify(newValues, 1);
        }
        
        return newValues;
    };

});
