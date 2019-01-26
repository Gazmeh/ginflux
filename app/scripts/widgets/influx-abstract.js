/*
 * Copyright (c) 2018 Gazmeh. (http://gazmeh.ir)
 */
'use strict';

angular.module('ginfluxApp')//
/**
 * Abstract controller of a metric widget.
 * 
 * A metric widget is responsible to get metrics information and display. This is an 
 * abstract layer of widgets to run queries and get informations.
 * 
 * NOTE: sub widgets MUST implement initChart function for initialization
 *
 * ## Data model
 * 
 * The widget suppose a data model
 * 
 * ### Queries
 * 
 * All queries are stored in the following attributes:
 * 
 *     wbModel.queries = [{
 *      name: 'query name',
 *      sql: 'the query',
 *      fingrePrint: 'AXf2dfas#',
 *      cache: 'The last query result to use as cache',
 *      useAsContext: true,
 *      visible: false
 *     }]
 *     
 * If query is executed the query.cache maybe store the result.
 * 
 * The finger print of the query is used to find out if the query is changed out side of the widget.
 * 
 * useAsContext force the result to be used as context to run other queries. Note that the result must
 * contains a single row of data.
 * 
 * the results is a array of result. is the query has no group section the results[0] contain result;
 * is the query has group section, the results[i] is corresponding to group i.
 * 
 * To draw or display data of a query, the visible must be true.
 * 
 * ## States
 * 
 * The widget is designed based on an state machine and you can add listenero to watch the
 * state change event.
 * 
 * @example to add new listener
 * ```js
 * ctrl.on('loaded', function(){
 *   // Do something
 * });
 * 
 * ### init
 * 
 * The widget is started and locking for configurations.
 * 
 * ### loading
 * 
 * The widget is going to load data and queries result.
 * 
 * ### loaded
 * 
 * All data is loaded successfully 
 * 
 * ### error
 * 
 * There is an error in widget
 * 
 *
 */
.controller('GInfluxAbstractWidgetCtrl', function($scope, $ghReport, $q, $wbCrypto, $http, $sce) {

    this.initWidget = function(){
        var ctrl = this;
        this.addAction({
            icon: 'refresh',
            title: 'Refresh',
            description: 'Remove all cache and run queries',
            action: function(){
                ctrl.refreshInflux();
            }
        });

        this.on('modelChanged', function($event){
            ctrl.queries = ctrl.getModelProperty('queries') || [];
            ctrl.stateMachin.modelChanged($event);
        });

        this.on('modelUpdated', function($event){
            // If query is changed from this widget
            if(this._influx_lock){
                return;
            }
            var key = $event.key || '';
            if(key.startsWith('queries')) {
                ctrl.queries = ctrl.getModelProperty('queries') || [];
                ctrl.stateMachin.modelUpdated($event);
            }
        });

        this.stateMachin = new machina.Fsm({
            namespace: 'gazmeh-report',
            initialState: 'init',
            states: {
                init: {
                    onModelChange: function () {
                        if (ctrl.isQueryChanged() || !ctrl.isCached()) {
                            this.transition('loading');
                        } else {
                            this.transition('loaded');
                        }
                    },
                },
                loading: {
                    _onEnter: function () {
                        ctrl.runQueries();
                    },
                    onSuccess: 'loaded',
                    onError: 'error'
                },
                error: {
                    onModelChange: function () {
                        // Try to run the query
                        this.transition('loading');
                    },
                },
                loaded: {
                    onModelChange: function () {
//                        if (ctrl.isQueryChanged() || !ctrl.isCached()) {
                            this.transition('loading');
//                        }
                    },
                }
            },
            modelChanged: function () {
                this.handle('onModelChange');
            },
            modelUpdated: function () {
                this.handle('onModelChange');
            },
            fail: function(error){
                this.handle('onError');
                ctrl.error = error;
            },
            success: function(){
                this.handle('onSuccess');
                delete ctrl.error;
            }
        });


        // I'd like to know when the transition event occurs
        this.stateMachin.on('transition', function () {
            ctrl.setState(ctrl.stateMachin.state);
        });

        // init child
        if(angular.isFunction(this.initChart)) {
            this.initChart();
        }

        ctrl.queries = ctrl.getModelProperty('queries') || [];
        ctrl.stateMachin.modelChanged();
    };

    /**
     * Check if any query is changed
     */
    this.isQueryChanged = function() {
        var queries = this.queries;
        for(var i = 0; i < queries.length; i++){
            var query = queries[i];
            if(!angular.equals(query.fingerPrint, $wbCrypto.md5(query.sql))){
                return true;
            }
        }
        return false;
    };

    /**
     * Check if there exist last sql run result
     */
    this.isCached = function () {
        var queries = this.queries;
        for(var i = 0; i < queries.length; i++){
            var query = queries[i];
            // check if query is changed
            if(!angular.equals(query.fingerPrint, $wbCrypto.md5(query.sql)) || !query.cache){
                return false;
            }
        }
        return true;
    };

    /**
     * Change state of the controller
     * 
     * @memberof GInfluxAbstractSimpleCtrl
     */
    this.setState = function(state) {
        var event = {};
        event.oldState = this.state;
        event.newState = state;
        // change state
        this.state = state;
        this.fire('state', event);
    };

    /**
     * Run all queries and update data in display
     * 
     * @memberof GInfluxAbstractSimpleCtrl
     */
    this.runQueries = function(){
        var ctrl = this;
        this.runPreQueries()
        .then(function(){
            return ctrl.runMainQueries();
        }, function($error){
            throw $error;
        })//
        .then(function(){
            ctrl._influx_lock = true;
            ctrl.setModelProperty('queries', ctrl.queries);
            ctrl._influx_lock = false;
            ctrl.stateMachin.success();
        }, function($error){
            ctrl.stateMachin.fail($error);
        });
    };

    /**
     * Gets list of visible queries
     * 
     * @memberof GInfluxAbstractSimpleCtrl
     */
    this.getVisibleQueries = function(){
        var queries = this.queries;
        var visibleQuery = [];
        for(var i = 0; i < queries.length; i++){
            var query = queries[i];
            if(query.visible && !query.useAsContext){
                visibleQuery.push(query);
            }
        }
        return visibleQuery;
    };


    /*
     * INTERNALL
     * 
     */
    this.runPreQueries = function(){
        var queries = this.queries;
        var promisses = [];

        // run preQuery
        for(var i = 0; i < queries.length; i++){
            var query = queries[i];
            if(query.useAsContext){
                promisses.push(this.runQuery(query));
            }
        }

        var ctrl = this;
        return $q.all(promisses)
        .then(function(){
            ctrl.loadQueryContext();
        }, function($error){
            throw $error;
        });
    };
    /*
     * INTERNALL
     * 
     */
    this.runMainQueries = function(){
        var queries = this.queries;
        var promisses = [];

        // run preQuery
        for(var i = 0; i < queries.length; i++){
            var query = queries[i];
            if(!query.useAsContext){
                promisses.push(this.runQuery(query));
            }
        }
        return $q.all(promisses);
    };

    /*
     * INTERNALL
     * 
     * Run a query and update the state of the query
     */
    this.runQuery = function(query) {
        // check if query changed
        if(angular.equals(query.fingerPrint, $wbCrypto.md5(query.sql))){
            delete query.cache;
        }
        // check cache
        if(query.cache && !query.cache.results.length) {
            $q.resolve(query.cache);
        }
        var url;
        try{
            url = this.getQueryApi(query);
        } catch(e) {
            return $q.reject(e);
        }
        // run the query
        Mustache.parse(query.sql, ['{', '}']);
        
        // load refresh context
        var context = this.getQueryContext();
        var variables = $ghReport.getCurrentVariableSet();
        angular.forEach(variables.items, function(item){
            context[item.key] = item.value;
        });
        var sql = Mustache.render(query.sql, context);
        return $http({
            method: 'GET',
            url: url,
            params: {
                q: sql
            }
        })
        .then(function(res){
            query.fingerPrint = $wbCrypto.md5(query.sql);
            query.cache = res.data;
            return query.cache;
        });
    };

    /*
     * INTERNAL
     * 
     * Local context
     */
    this.getQueryContext = function(){
        return this.getModelProperty('context');
    };

    /*
     * INTERNALL
     * 
     */
    this.loadQueryContext = function(){
        var queries = this.queries;
        var context = this.getModelProperty('context') || {};

        // run preQuery
        for(var i = 0; i < queries.length; i++){
            var query = queries[i];
            if(query.useAsContext){
                var columns = this.getCacheColumns(query);
                var values = this.getCacheSeriesValues(query, 0, 0);
                for(var j = 0; j < columns.length; j++){
                    context[columns[j]] = values[0][j];
                }
            }
        }
        this.setModelProperty('context', context);
    };


    /*
     * INTERNALL
     * 
     */
    this.assertTrue = function(condition, message){
        if(!condition){
            this.stateMachin.fail({
                status: 10,
                code: 10,
                message: message
            });
        }
    };


    /*
     * Gets widget url
     */
    this.getQueryApi = function(query){
        var url = query.url || this.getModelProperty('url') || $ghReport.getDefaultBackend();
        if(!url){
            throw {
                message: 'Url is empty'
            };
        }
        $sce.trustAsUrl(url);
        return url;
    };
    
    /*
     * Gets widget index name
     */
    this.getQueryIndex = function(query) {
        var index = query.index || this.getModelProperty('index') || $ghReport.getDefaultQueryIndex();
        if(!index){
            throw {
                message: 'Index is not defined'
            };
        }
        return index;
    };
    
    this.getQueryByFingerprint = function(fingerPrint) {
        for(var i = 0; i < this.queries.length; i++){
            if(this.queries[i].fingerPrint === fingerPrint){
                return this.queries[i];
            }
        }
        return null;
    };
    
    
    this.getCacheResult = function(query, resultIndex){
        if(!resultIndex) {
            resultIndex = 0;
        }
        if(!query.cache || !query.cache.results.length){
            return {};
        }
        return query.cache.results[resultIndex];
    };

    this.getCacheSeries = function(query, resultIndex, sereisIndex){
        if(!resultIndex) {
            resultIndex = 0;
        }
        if(!sereisIndex) {
            sereisIndex = 0;
        }
        if(!query.cache || !query.cache.results.length || !query.cache.results[resultIndex].series.length){
            return {};
        }
        return query.cache.results[resultIndex].series[sereisIndex];
    };

    this.getCacheColumns = function(query, resultIndex, sereisIndex){
        return this.getCacheSeries(query, resultIndex, sereisIndex).columns;
    };

    this.getCacheSeriesColumns = function(query, resultIndex, sereisIndex){
        return this.getCacheSeries(query, resultIndex, sereisIndex).columns;
    };
    
    this.getCacheSeriesValues = function(query, resultIndex, seriesIndex){
        return this.getCacheSeries(query, resultIndex, seriesIndex).values;
    };

    this.queryContainsSeries = function(query, resultIndex, seriesIndex){
        if(!resultIndex) {
            resultIndex = 0;
        }
        if(!seriesIndex) {
            seriesIndex = 0;
        }
        if(!query.cache || !query.cache.results.length || !query.cache.results[resultIndex].series.length){
            return false;
        }
        return seriesIndex < query.cache.results[resultIndex].series.length;
    };
    
    this.queryContainsColumn = function(query, column, resultIndex) {
        var queryColumns = this.getCacheColumns(query, resultIndex) || [];
        return queryColumns.indexOf(column) >= 0;
    };
    
    this.queryCacheResultsSize = function(query) {
        if(!query.cache){
            return 0;
        }
        return query.cache.results.length;
    };
    
    
    this.refreshInflux = function(){
        var queries = this.queries;
        for(var i = 0; i < queries.length; i++){
            var query = queries[i];
            delete query.cache;
        }
        this.setModelProperty('queries', queries);
    };
});
