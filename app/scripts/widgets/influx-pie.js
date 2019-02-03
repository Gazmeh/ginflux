/*
 * Copyright (c) 2018 Gazmeh. (http://gazmeh.ir)
 */
'use strict';

angular.module('ginfluxApp')//

/**
 * @ngdoc Widget
 * @name GInfluxPieWidgetCtrl
 * @description Display query in a pie
 * 
 */
.controller('GInfluxPieWidgetCtrl', function ($scope, $controller) {

    //color palete
    this.colorPalete = ['#E8743B', '#19A979', '#ED4A7B', '#945ECF', '#13A4B4', '#525DF4', '#BF399E', '#6C8893', '#EE6868', '#2F6497', '#dc0d0e'];

    // extend
    angular.extend(this, $controller('GInfluxMultilineWidgetCtrl', {
        $scope : $scope,
    }));

    this.getValues = function(key) {
        var query = this.getQueryByFingerprint(key.fingerPrint);
        var columns = this.getCacheSeriesColumns(query, key.resultIndex, key.seriesIndex);
        var values = this.getCacheSeriesValues(query, key.resultIndex, key.seriesIndex);
        // copy column
        var index = columns.indexOf(key.column);
        return values[0][index];
    };
    

    this.loadViewData = function () {
        this.data = [];
        for(var i = 0; i < this.series.length; i++){
            var values = this.getValues(this.series[i]);
            var serie = {
                    value : values, //
                    tags : this.series[i].tags,
                    key : this.series[i].title,
                    //columns : g.columns,
                    type : this.series[i].type || 'line',
                    yAxis : (this.series[i].leftAxis) ? 0 : 1,
                    color: this.colorPalete[i%this.colorPalete.length]
            };
            this.data.push(serie);
        }
    };

    this.loadCahrt = function() {
        this.option = {
                chart: {
                    type: 'pieChart',
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
                    // pie
                    donut: this.getModelProperty('chart.donut.enable'),
                    donutRatio: this.getModelProperty('chart.donut.ratio') || 0.4,
                    // label
                    showLabels: this.getModelProperty('chart.label.enable'),
                    labelType: this.getModelProperty('chart.label.type') || 'percent',
                    duration: this.getModelProperty('chart.label.duration') || 500,
                    
                    x: function (d) {
                        return d.key;
                    },
                    y: function (d) {
                        return d.value;
                    }
                }
        };
    };

});
