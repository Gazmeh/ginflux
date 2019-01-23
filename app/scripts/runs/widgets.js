/*
 * Copyright (c) 2015-2025 Phoinex Scholars Co. http://dpq.co.ir
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
 * 
 */
.run(function($widget, $settings) {

    /**
     * @ngdoc Widget Groups
     * @name Gazmeh Report
     * @description All widgets which is used to design a report
     *
     */
    $widget.newGroup({
        id: 'ginflux',
        title: 'Influx DB',
        description: 'Widgets to design a report from influx',
        icon: 'toggle_on'
    });

    /**
     * @ngdoc Widgets
     * @name Metric value
     * @description Run a query and display a value of the result as card
     *
     * The metric attribute and the query are main properties of this widget.
     *
     */
    $widget.newWidget({
        // widget description
        type: 'GInfluxTable',
        title: 'Table',
        description: 'Display a query result in table view.',
        icon: 'wb-widget-group',
        groups: ['ginflux'],
        setting: ['ginflux-queries'],
        model: {
            queries: [{
                title: 'Last 10 samples',
                description: 'Default query',
                sql: 'SELECT * FROM test_run_803.autogen.samples LIMIT 10',
                url: 'http://195.146.59.40:8086/query',
                index: 'time',
                useAsContenxt: false,
                visible: true
            }]
        },
        // functional properties
        templateUrl: 'views/widgets/ginflux-table.html',
        controller: 'GInfluxTableWidgetCtrl',
        controllerAs: 'ctrl',
        help: '',
        helpId: 'wb-widget-group'
    });
    /**
     * @ngdoc Widgets
     * @name Multiline chart
     * @description Run a query and display a value of the result as card
     *
     * The metric attribute and the query are main properties of this widget.
     *
     */
    $widget.newWidget({
        // widget description
        type: 'GInfluxMutliline',
        title: 'Multiline chart',
        description: 'Display a query result in line chart.',
        icon: 'wb-widget-group',
        groups: ['ginflux'],
        setting: ['ginflux-queries', 'ginflux-series', 'ginflux-linechart'],
        model: {
            url: 'http://195.146.59.40:8086/query',
            queries: [{
                title: 'Mean of response time',
                description: 'Default query',
                sql: 'SELECT mean(response_time) as response_time, FIRST(time_stamp) AS time_stamp FROM test_run_803..samples WHERE time > {start}ms AND time < {end}ms GROUP BY time(10s)',
                index: 'time_stamp',
                useAsContenxt: false,
                visible: true
            }, {
                title: 'Start time',
                description: 'Select start time stamp of the samples',
                sql: 'SELECT FIRST(time_stamp) AS "start" FROM test_run_803..samples',
                useAsContenxt: true,
                visible: false
            }, {
                title: 'End time',
                description: 'Select ent time stamp of the samples',
                sql: 'SELECT LAST(time_stamp) AS "end" FROM test_run_803..samples',
                useAsContenxt: true,
                visible: false
            }]
        },
        // functional properties
        templateUrl: 'views/widgets/ginflux-multiline.html',
        controller: 'GInfluxMultilineWidgetCtrl',
        controllerAs: 'ctrl',
        help: '',
        helpId: 'wb-widget-group'
    });
    /**
     * @ngdoc Widgets
     * @name GInfluxPie
     * @description Run a query and display a value of the result as card
     *
     * The metric attribute and the query are main properties of this widget.
     *
     */
    $widget.newWidget({
        // widget description
        type: 'GInfluxPie',
        title: 'Pie chart',
        description: 'Display a query result in pie chart.',
        icon: 'wb-widget-group',
        groups: ['ginflux'],
        setting: ['ginflux-queries', 'ginflux-series', 'ginflux-piechart'],
        model: {
            url: 'http://195.146.59.40:8086/query',
            queries: [{
                title: 'Mean of response time',
                description: 'Default query',
                sql: 'SELECT sum(success) as count FROM test_run_803..samples WHERE time > {start}ms AND time < {end}ms GROUP BY time(10s), tag_name',
                index: 'time_stamp',
                useAsContenxt: false,
                visible: true
            }, {
                title: 'Start time',
                description: 'Select start time stamp of the samples',
                sql: 'SELECT FIRST(time_stamp) AS "start" FROM test_run_803..samples',
                useAsContext: true,
                visible: false
            }, {
                title: 'End time',
                description: 'Select ent time stamp of the samples',
                sql: 'SELECT LAST(time_stamp) AS "end" FROM test_run_803..samples',
                useAsContext: true,
                visible: false
            }]
        },
        // functional properties
        templateUrl: 'views/widgets/ginflux-pie.html',
        controller: 'GInfluxPieWidgetCtrl',
        controllerAs: 'ctrl',
        help: '',
        helpId: 'wb-widget-group'
    });
    

    /**
     * @ngdoc Widgets
     * @name GInfluxPie
     * @description Run a query and display a value of the result as card
     *
     * The metric attribute and the query are main properties of this widget.
     *
     */
    $widget.newWidget({
        // widget description
        type: 'GInfluxBoxplot',
        title: 'Box plot',
        description: 'Display a query result in box chart (there must be 5 series).',
        icon: 'wb-widget-group',
        groups: ['ginflux'],
        setting: ['ginflux-queries', 'ginflux-series', 'ginflux-boxplot'],
        model: {
            url: 'http://195.146.59.40:8086/query',
            queries: [{
                title: 'Mean of response time',
                description: 'Default query',
                sql: 'SELECT min(response_time) as q0, mean(response_time) as q1, mean(reponse_time) as q2, mean(response_time) as q3, max(response_time) as q4 FROM test_run_803..samples WHERE time > {start}ms AND time < {end}ms GROUP BY time(10s)',
                index: 'time_stamp',
                useAsContenxt: false,
                visible: true
            }, {
                title: 'Start time',
                description: 'Select start time stamp of the samples',
                sql: 'SELECT FIRST(time_stamp) AS "start" FROM test_run_803..samples',
                useAsContext: true,
                visible: false
            }, {
                title: 'End time',
                description: 'Select ent time stamp of the samples',
                sql: 'SELECT LAST(time_stamp) AS "end" FROM test_run_803..samples',
                useAsContext: true,
                visible: false
            }]
        },
        // functional properties
        templateUrl: 'views/widgets/ginflux-box.html',
        controller: 'GInfluxBoxWidgetCtrl',
        controllerAs: 'ctrl',
        help: '',
        helpId: 'wb-widget-group'
    });


    $settings.newPage({
        type: 'ginflux-queries',
        label: 'Queries',
        icon: '',
        templateUrl: 'views/widget-settings/ginflux-queries.html',
        controllerAs: 'ctrl',
        controller: function () {
            /*
             * Watch widget
             */
            this.init = function(newWidget, oldWidget){
                var ctrl = this;
                function modelUpdated($event){
                    if(!$event || $event.key.startsWith('queries')){
                        ctrl.queries = ctrl.getProperty('queries') || [];
                    }
                    ctrl.url = ctrl.getProperty('url');
                }
                // lesten for changes
                if(oldWidget){
                    oldWidget.off('modelUpdated', modelUpdated);
                }
                if(newWidget){
                    newWidget.on('modelUpdated', modelUpdated);
                }
                // load model
                modelUpdated();
            };
            
            this.queryChanged = function(){
                this.setProperty('queries', this.queries);
            };
            
            this.addQuery = function(query){
                this.queries.push(query);
                this.queryChanged();
            };
            
            this.removeQuery = function(index){
                this.queries.splice(index, 1);
                this.queryChanged();
            };
        }
    });
    
    $settings.newPage({
        type: 'ginflux-series',
        label: 'Sereis',
        icon: '',
        templateUrl: 'views/widget-settings/ginflux-series.html',
        controllerAs: 'ctrl',
        controller: function () {
            this.init = function(newWidget, oldWidget){
                var ctrl = this;
                function modelUpdated($event){
                    if(!$event || $event.key.startsWith('series')){
                        ctrl.series = ctrl.getProperty('series') || [];
                    }
                }
                // listen for changes
                if(oldWidget){
                    oldWidget.off('modelUpdated', modelUpdated);
                }
                if(newWidget){
                    newWidget.on('modelUpdated', modelUpdated);
                }
                // load model
                modelUpdated();
            };
            
            this.seriesChanged = function(){
                this.setProperty('series', this.series);
            };
        }
    });
    
    /*
     * Use as controller for all chart configurations
     * @ngInject
     */
    $settings.newPage({
        type: 'ginflux-linechart',
        label: 'Line hart',
        icon: 'multiline_chart',
        templateUrl: 'views/widget-settings/ginflux-line-chart.html',
        controllerAs: 'ctrl',
        controller: function() {
            this.init = function(newWidget, oldWidget){
                var ctrl = this;
                function modelUpdated($event){
                    if($event.key.startsWith('chart')){
                        ctrl.chart = ctrl.getProperty('chart') || {};
                    }
                }
                // listen for changes
                if(oldWidget){
                    oldWidget.off('modelUpdated', modelUpdated);
                }
                if(newWidget){
                    newWidget.on('modelUpdated', modelUpdated);
                }
                // load model
                this.chart = this.getProperty('chart') || {};
            };
            
            
            this.chartChanged = function(){
                this.setProperty('chart', this.chart);
            };
        }
    });
    $settings.newPage({
        type: 'ginflux-piechart',
        label: 'Pie chart',
        icon: 'pie_chart',
        templateUrl: 'views/widget-settings/ginflux-pie-chart.html',
        controllerAs: 'ctrl',
        controller: function() {
            this.init = function(newWidget, oldWidget){
                var ctrl = this;
                function modelUpdated($event){
                    if($event.key.startsWith('chart')){
                        ctrl.chart = ctrl.getProperty('chart') || {};
                    }
                }
                // listen for changes
                if(oldWidget){
                    oldWidget.off('modelUpdated', modelUpdated);
                }
                if(newWidget){
                    newWidget.on('modelUpdated', modelUpdated);
                }
                // load model
                this.chart = this.getProperty('chart') || {};
            };
            
            
            this.chartChanged = function(){
                this.setProperty('chart', this.chart);
            };
        }
    });
    $settings.newPage({
        type: 'ginflux-boxplot',
        label: 'Box chart',
        icon: 'insert_chart_outlined',
        templateUrl: 'views/widget-settings/ginflux-box-chart.html',
        controllerAs: 'ctrl',
        controller: function() {
            this.init = function(newWidget, oldWidget){
                var ctrl = this;
                function modelUpdated($event){
                    if($event.key.startsWith('chart')){
                        ctrl.chart = ctrl.getProperty('chart') || {};
                    }
                }
                // listen for changes
                if(oldWidget){
                    oldWidget.off('modelUpdated', modelUpdated);
                }
                if(newWidget){
                    newWidget.on('modelUpdated', modelUpdated);
                }
                // load model
                this.chart = this.getProperty('chart') || {};
            };
            
            
            this.chartChanged = function(){
                this.setProperty('chart', this.chart);
            };
        }
    });
});
