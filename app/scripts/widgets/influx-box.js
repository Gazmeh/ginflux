/*
 * Copyright (c) 2018 Gazmeh. (http://gazmeh.ir)
 */
'use strict';

angular.module('ginfluxApp')//

/**
 * @ngdoc Widget
 * @name GInfluxBoxWidgetCtrl
 * @description Display query in a box plot
 * 
 */
.controller('GInfluxBoxWidgetCtrl', function ($scope, $controller, $sheet) {

    // extend
    angular.extend(this, $controller('GInfluxMultilineWidgetCtrl', {
        $scope: $scope,
    }));

    //color palete
    this.colorPalete = ['#E8743B', '#19A979', '#ED4A7B', '#945ECF', '#13A4B4', '#525DF4', '#BF399E', '#6C8893', '#EE6868', '#2F6497', '#dc0d0e'];

    this.getValues = function (key) {
        var query = this.getQueryByFingerprint(key.fingerPrint);
        var columns = this.getCacheSeriesColumns(query, key.resultIndex, key.seriesIndex);
        var values = this.getCacheSeriesValues(query, key.resultIndex, key.seriesIndex);
        // copy column
        var index = columns.indexOf(key.column);
        return $sheet.copyColumns(values, [index]);
    };


    this.loadViewData = function () {
        this.assertTrue(this.series.length % 5 === 0, 'Just 5 series is required for box plot');
        this.data = [];

        for(var si = 0; si < this.series.length; si+=5){
            // TODO get series map
            var q0 = this.getValues(this.series[si+0]);
            var q1 = this.getValues(this.series[si+1]);
            var q2 = this.getValues(this.series[si+2]);
            var q3 = this.getValues(this.series[si+3]);
            var q4 = this.getValues(this.series[si+4]);

            for (var i = 0; i < q0.length; i++) {
                // get titles of config
                var title;
                if(this.series.length > 5){
                    // add series title
                    title = this.series[si+0].title;
                    if(q0.length > 1){
                        title = title + '->' + i;
                    }
                } else {
                    title = i;
                }
                var serie = {
                        label: title, 
                        color: this.colorPalete[i % this.colorPalete.length],
                        values: {
                            'whisker_low': q0[i],
                            'Q1': q1[i],
                            'Q2': q2[i],
                            'Q3': q3[i],
                            'whisker_high': q4[i]
                        }, //
                };
                this.data.push(serie);
            }
        }
    };

    this.loadCahrt = function () {
        var yformat = {
                type: this.getModelProperty('chart.y.format.type') || 'Number',
                specifier: this.getModelProperty('chart.y.format.specifier') || '.2s'
        };

        this.option = {
                chart: {
                    type: 'boxPlotChart',
                    // size
                    height: this.getModelProperty('chart.height') || 450,
                    margin: { // replace with widget margin
                        top: this.getModelProperty('chart.margin.top') || 0,
                        right: this.getModelProperty('chart.margin.right') || 0,
                        bottom: this.getModelProperty('chart.margin.bottom') || 0,
                        left: this.getModelProperty('chart.margin.left') || 0
                    },

                    // legend
                    showLegend: this.getModelProperty('chart.legend.enable'),
                    legendPosition: this.getModelProperty('chart.legend.position') || 'top',
                    legend: {
                        align: this.getModelProperty('chart.legend.align'),
                        margin: {
                            top: this.getModelProperty('chart.legend.margin.top') || 0,
                            right: this.getModelProperty('chart.legend.margin.right') || 0,
                            bottom: this.getModelProperty('chart.legend.margin.bottom') || 0,
                            left: this.getModelProperty('chart.legend.margin.left') || 0
                        },
                    },

                    x: function (d) {
                        return d.label;
                    },
                    maxBoxWidth: 75,
                    yAxis: {
                        showMaxMin: this.getModelProperty('chart.y.showMaxMin'),
                        axisLabel: this.getModelProperty('chart.y.label') || 'No label',
                        tickFormat: function (data) {
                            return $sheet.formatData(data, yformat);
                        }
                    }
                }
        };

        //Set Min and Max constraints for Y1 Axsis
        var y1Min = this.getModelProperty('chart.y.min') || 0;
        var y1Max = this.getModelProperty('chart.y.max') || 0;
        if (y1Min != 0 || y1Max != 0) {
            this.option.chart.yDomain = [y1Min, y1Max];
        } else {
            this.option.chart.yDomain = null;
        }
    };

});
