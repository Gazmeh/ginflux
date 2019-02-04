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
            $scope: $scope,
        }));

        /*
         * Init the widget
         */
        this.initChart = function () {
            var ctrl = this;
            this.colorPalete = ['#E8743B', '#19A979', '#ED4A7B', '#945ECF', '#13A4B4', '#525DF4', '#BF399E', '#6C8893', '#EE6868', '#2F6497', '#dc0d0e'];
            this.on('state', function ($event) {
                if ($event.newState === 'loaded') {
                    ctrl.loadNewData();
                    ctrl.loadCahrt();
                }
            });
            this.on('modelUpdated', function ($event) {
                var key = $event.key || '';
                if (key.startsWith('series')) {
                    ctrl.loadViewData();
                    if (angular.isFunction(ctrl.chartApi)) {
                        ctrl.chartApi.updateWithData(ctrl.data);
                    }
                }
                if (key.startsWith('chart')) {
                    ctrl.loadCahrt();
                }
                if (key.indexOf('x.isAdjusted') !== -1) {
                    ctrl.loadViewData();
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
            // Note it is not easy to reuse serices
            for (var i = 0; i < queries.length; i++) {
                var keys = this.mapQueryToKeys(queries[i]);
                for (var j = 0; j < keys.length; j++) {
                    var series = this.getSeriesByKey(keys[j]);
//                    if (series) {
//                        this.unmarkAllSeriesDeleted(series);
//                    } else {
                        series = this.createNewSeries(keys[j]);
                        series.color = this.colorPalete[j % this.colorPalete.length];
                        this.series.push(series);
//                    }
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
                type: this.getModelProperty('chart.x.format.type') || 'Time',
                specifier: this.getModelProperty('chart.x.format.specifier') || 'HH:MM:SS'
            };
            var yformat = {
                type: this.getModelProperty('chart.y.format.type') || 'Number',
                specifier: this.getModelProperty('chart.y.format.specifier') || '.2s'
            };
            var y2format = {
                type: this.getModelProperty('chart.y1.format.type') || 'Number',
                specifier: this.getModelProperty('chart.y1.format.specifier') || '.2s'
            };


            this.option = {
                chart: {
                    type: 'multiChart',
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
                        //TODO: add setting control for max key legend
                        maxKeyLength: 200,
                        margin: {
                            top: this.getModelProperty('chart.legend.margin.top') || 0,
                            right: this.getModelProperty('chart.legend.margin.right') || 0,
                            bottom: this.getModelProperty('chart.legend.margin.bottom') || 0,
                            left: this.getModelProperty('chart.legend.margin.left') || 0
                        },
                    },
                    xAxis: {
                        showMaxMin: this.getModelProperty('chart.x.showMaxMin'),
                        axisLabel: this.getModelProperty('chart.x.label') || 'No label',
                        tickFormat: function (data) {
                            return $sheet.formatData(data, xformat);
                        }
                    },
                    x: function (d) {
                        return d[0];
                    },
                    y: function (d) {
                        return d[1];
                    },
                    useInteractiveGuideline: true,
                    yAxis1: {
                        showMaxMin: this.getModelProperty('chart.y.showMaxMin'),
                        axisLabel: this.getModelProperty('chart.y.label') || 'No label',
                        tickFormat: function (data) {
                            return $sheet.formatData(data, yformat);
                        }
                    },
                    yAxis2: {
                        showMaxMin: this.getModelProperty('chart.y2.showMaxMin'),
                        axisLabel: this.getModelProperty('chart.y2.label') || 'No label',
                        tickFormat: function (data) {
                            return $sheet.formatData(data, y2format);
                        }
                    },
                    // TODO: mgh: Issues in tooltip values formatting; the
                    // following code dose not work I guss we should
                    // use'extended" mode
                    tooltip: {
                        valueFormatter: function (d) {
                            return $sheet.formatData(d, {
                                type: 'Number',
                                specifier: '.2s'
                            });
                        }
                    }
                }


            };

            //Set Min and Max constraints for Y1 Axsis
            var y1Min = this.getModelProperty('chart.y.min') || 0;
            var y1Max = this.getModelProperty('chart.y.max') || 0;
            if (y1Min != 0 || y1Max != 0) {
                this.option.chart.yDomain1 = [y1Min, y1Max];
            } else {
                this.option.chart.yDomain1 = null;
            }
            //Set Min and Max constraints for Y2 Axsis
            var y2Min = this.getModelProperty('chart.y2.min') || 0;
            var y2Max = this.getModelProperty('chart.y2.max') || 0;
            if (y2Min != 0 || y2Max != 0) {
                this.option.chart.yDomain2 = [y2Min, y2Max];
            } else {
                this.option.chart.yDomain2 = null;
            }
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
            for (var i = 0; i < this.series.length; i++) {
                var values = this.getValues(this.series[i]);
                var serie = {
                    values: values, //
                    tags: this.series[i].tags,
                    key: this.series[i].title,
                    color: this.series[i].color,
                    //columns : g.columns,
                    type: this.series[i].type || 'line',
                    yAxis: this.series[i].yAxis || 1,
                    //
                    //minValue-x,

                };
                this.data.push(serie);
            }
        };


        /*************************************************************
         *                                                           *
         *************************************************************/
        this.markAllSeriesDeleted = function () {
            if (!this.series) {
                return;
            }
            angular.forEach(this.series, function (serie) {
                serie.markDeleted = true;
            });
        };

        this.removeAllMarkedSeries = function () {
            if (!this.series) {
                return;
            }
            var newList = [];
            for (var i = 0; i < this.series.length; i++) {
                if (!this.series[i].markDeleted) {
                    newList.push(this.series[i]);
                }
            }
            this.series = newList;
        };

        this.getSeriesByKey = function (key) {
            var series = this.series || [];
            for (var i = 0; i < series.length; i++) {
                if (this.isSeriesKey(series[i], key)) {
                    return series[i];
                }
            }
            return null;
        };

        this.createNewSeries = function (key) {
            var query = this.getQueryByFingerprint(key.fingerPrint);
            return _.merge({
                // UI
                title: query.title + '__' + key.column + this.tagsToLable(key),
                description: query.description,
                color: '#000000' // TODO: maso, 2018: put random
            }, key);
        };

        this.tagsToLable = function (key) {
            var query = this.getQueryByFingerprint(key.fingerPrint);
            var series = this.getCacheSeries(query, key.resultIndex, key.seriesIndex);
            var tags = series.tags;
            if (!tags) {
                return '';
            }
            // tags to string
            var label = '__';
            for (key in tags) {
                label = label + key + ':' + tags[key] + ',';
            }
            return label;
        };

        this.unmarkAllSeriesDeleted = function (series) {
            series.markDeleted = false;
        };

        /*************************************************************
         *                     overried for new  
         *************************************************************/
        this.mapQueryToKeys = function (query) {
            var keys = [];
            var resultsCount = this.queryCacheResultsSize(query);
            var index = this.getQueryIndex(query);
            // delete old error
            delete query.error;
            for (var resultIndex = 0; resultIndex < resultsCount; resultIndex++) {
                var result = this.getCacheResult(query, resultIndex);
                // check if there is error in query result then set in the query
                if (result.error) {
                    query.error = result.error;
                    return [];
                }
                var seriesCount = result.series.length;
                for (var seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
                    var dataSeries = this.getCacheSeries(query, resultIndex, seriesIndex);
                    for (var i = 0; i < dataSeries.columns.length; i++) {
                        var column = dataSeries.columns[i];
                        if (column === 'time' || column === index) {
                            continue;
                        }
                        keys.push({// ID
                            fingerPrint: query.fingerPrint,
                            resultIndex: resultIndex,
                            seriesIndex: seriesIndex,
                            column: column
                        });
                    }
                }
            }
            return keys;
        };

        this.isSeriesKey = function (series, key) {
            return series.fingerPrint === key.fingerPrint &&
                series.resultIndex === key.resultIndex &&
                series.seriesIndex === key.seriesIndex &&
                series.column === key.column;
        };

        /*
         * Restore data from query catch and generate series data based on the input
         * key
         */
        this.getValues = function (key) {
            var query = this.getQueryByFingerprint(key.fingerPrint);
            var columns = this.getCacheSeriesColumns(query, key.resultIndex, key.seriesIndex);
            var values = this.getCacheSeriesValues(query, key.resultIndex, key.seriesIndex);
            // copy column
            var index = columns.indexOf(this.getQueryIndex(query));
            var data = columns.indexOf(key.column);
            var newValues = $sheet.copyColumns(values, [index, data]);
            // justify
            if (this.getModelProperty('chart.x.isAdjusted')) {
                $sheet.adjust(newValues, 0);
            }
            if (key.isAdjustY) {
                $sheet.adjust(newValues, 1);
            }

            return newValues;
        };

    });
