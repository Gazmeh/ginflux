/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
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
 * @name $sheet
 * @description Data utility
 * 
 * Some basic data mainpulation tools.
 * 
 */
.service('$sheet', function() {
    
    this.copyColumns = function(values, indexes){
        // TOOD; maso, 2019: check for optimization
        var result = [];
        for(var i = 0; i < values.length; i++){
            var column = [];
            for(var j = 0; j < indexes.length; j++){
                column.push(values[i][indexes[j]]);
            }
            result.push(column);
        }
        return result;
    };

	/**
	 * Format data as local date
	 * 
	 * Options:
	 * <ul>
	 * 	<li>type: data format (DateTime, )</li>
	 * 	<li>format: string to format data</li>
	 * </ul>
	 * 
	 * <h3>DateTime</h3>
	 * 
	 * In this case data must be a UnixTime in UTC, and the option format must 
	 * be as described here: 
	 * 
	 * http://pubs.opengroup.org/onlinepubs/009695399/functions/strptime.html
	 * 
	 * <h3>Default format</h3>
	 * 
	 * By default we suppose data is an number value and try to format as described
	 * here:
	 * 
	 * https://docs.python.org/3/library/string.html#format-specification-mini-language
	 * 
	 * 
	 * @param data value
	 * @param option to format data
	 */
	function formatData(data, option){

	    if (option.type === 'DateTime') {
	      // TODO: maso, 2018:support local date format
	      //TODO:mgh: curently convert 0 second to 3:00:00!
	      var date = moment.unix(data);
	      return date.format(option.specifier || 'HH:MM:SS');
	    }

	    if (option.type === 'Time') {
	      var sec_num = data; // don't forget the second param
	      var hours = Math.floor(sec_num / 3600);
	      var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	      var seconds = sec_num - (hours * 3600) - (minutes * 60);

	      if (minutes < 10) {
	        minutes = '0' + minutes;
	      }
	      if (seconds < 10) {
	        seconds = '0' + seconds;
	      }
	      if (hours === 0) {
	        return minutes + ':' + seconds;
	      }
	      if (hours < 10) {
	        hours = '0' + hours;
	      }
	      return hours+':'+minutes+':'+seconds;
	    }

	    if (option.type === 'Number') {
	      return d3.format(option.specifier || '.xx')(data);
	    }

	    //Convert long string to short string: if string length greater than Specifier; it is converted as Specifier/3 character
	    // from begging of the input string, then three dots (...) , and finally 2*Specifier/3 character from end of input string
	    if (option.type === 'ShortString') {

	      //the defulat value of specifier is 18
	      var maxLen=option.specifier||(15+3);
	      var startLen = (maxLen-3)/3;
	      var endLen = (maxLen-3)-startLen;

	      if (typeof data !== 'string' || data.length <= maxLen){
	        return data;
	      }

	      return data.substr(0, startLen) + '...' + data.substr(data.length - endLen, data.length);
	    }

	    return data;
	}

	/**
	 * Search and replace data in sheet
	 * 
	 * 
	 * query: a search query
	 * replace: a replacement
	 * range: where to search (may be empty)
	 * 
	 * match: true/false matche the case
	 * regex: true/false match based on regex
	 * formula: true/false search in formula
	 */
	function findAndReplace(sheet, option){
		// Replace with regex
		if(option.regex && option.match){
			var regex = new RegExp(option.query, 'ig');
			angular.forEach(sheet.values, function(row, i){
				angular.forEach(row, function(cell, j){
					if(regex.test(cell)){
						sheet.values[i][j] = sheet.values[i][j].replace(regex, option.replace);
					}
				});
			});
		}
		// TODO: support the others
	}


	function appendSheetsAsRow(dataSheet){
		var sheet = {
				key: 'New sheet',
				values:[]
		};
		for(var i = 0; i < dataSheet.length; i++){
			for(var j = 0; j < dataSheet[i].values.length; j++){
				sheet.values.push(dataSheet[i].values[j]);
			}
		}
		return sheet;
	}

	function appendTextToColumn(text, column, sheet){
		for(var i = 0; i < sheet.values.length; i++){
			sheet.values[i][column] = text + sheet.values[i][column];
		}
	}
	
	this.justify = function(values, column){
	    // find min
	    var min = values[0][column];
	    for(var i = 0; i < values.length; i++){
	        if(min > values[i][column]){
	            min = values[i][column];
	        }
	    }
	    
	    // justify
	    for(var j = 0; j < values.length; j++){
	        values[j][column] -= min;
	    }
	};

	// public methods
	this.formatData = formatData;
	this.findAndReplace = findAndReplace; 
	this.appendSheetsAsRow = appendSheetsAsRow;
	this.appendTextToColumn = appendTextToColumn;
});

