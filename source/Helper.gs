/**
 * @OnlyCurrentDoc
 */
/*
Copyright (C) 2018 TechupBusiness (info@techupbusiness.com)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/********************************
 *
 *   Read external data handler
 *
 ********************************/

function fetchUrl(url) {
    var finalUrl;

    var proxyUrl = getCache("settings-proxy-url");
    var proxyPassword = getCache("settings-proxy-pw");
    if(isEmpty(proxyUrl)) {
        var spreadsheet = SpreadsheetApp.getActive();
        var sheet = spreadsheet.getSheetByName("Settings");
        proxyUrl = sheet.getRange(3, 2).getValue();
        proxyPassword = sheet.getRange(4, 2).getValue();

        if(isEmpty(proxyUrl)) {
            setCache("settings-proxy-url","NONE");
            proxyUrl = 'NONE';
        } else {
            setCache("settings-proxy-url", proxyUrl);
            setCache("settings-proxy-pw", proxyPassword);
        }
    }

    if(proxyUrl!="NONE") {
        finalUrl = proxyUrl + "?url=" + encodeURIComponent(url) + "&token=" + encodeURIComponent(proxyPassword);
    } else {
        finalUrl = url;
    }

    var response = UrlFetchApp.fetch(finalUrl);
    var returnText = response.getContentText();
    return returnText;
}


/********************************
 *
 *   Data type helper (string, array, ...)
 *
 ********************************/

if (!String.prototype.splice) {
    /**
     * {JSDoc}
     *
     * The splice() method changes the content of a string by removing a range of
     * characters and/or adding new characters.
     *
     * @this {String}
     * @param {number} start Index at which to start changing the string.
     * @param {number} delCount An integer indicating the number of old chars to remove.
     * @param {string} newSubStr The String that is spliced in.
     * @return {string} A new string with the spliced substring.
     */
    String.prototype.splice = function(start, delCount, newSubStr) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
    };
}

function isEmpty(variable) {
    if(variable==undefined || variable==null) {
        return true;
    }

    if(typeof variable == "string" && variable=="") {
        return true;
    }


    return false;
}

/**
 * Split a string into chunks of the given size
 * @param  {String} string is the String to split
 * @param  {Number} size is the size you of the cuts
 * @return {Array} an Array with the strings
 */
function splitString (string, size) {
    var re = new RegExp('.{1,' + size + '}', 'g');
    return string.match(re);
}

function padLeft(nr, n, str){
    return Array(n-String(nr).length+1).join(str||'0')+nr;
}
Number.prototype.padLeft = function (n,str){
    return Array(n-String(this).length+1).join(str||'0')+this;
}


function inArray(needle, haystack) {
    if(needle in haystack) {
        return true;
    } else {
        return false;
    }
}

function isString(str) {
    return typeof str === "string";
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function Dictionary (pkey, pvalue) {
    this.keys = [];
    this.values = [];

    // Constructor
    if(pkey && pvalue) {
        this.set(pkey, pvalue);
    }

    this.get = function (key) {
        return this.values[this.keys.indexOf(key)]
    };

    this.ifGet = function (key, alternativeValue) {
        if(this.contains(key)) {
            return this.values[this.keys.indexOf(key)]
        } else {
            this.set(alternativeValue);
            return alternativeValue;
        }
    };

    // Alias for set
    this.add = function(key, value) {
        this.set(key,value);
    }

    this.set = function (key, value) {
        var i = this.keys.indexOf(key);
        if (i === -1) {
            i = this.keys.length;
        }
        this.keys[i] = key;
        this.values[i] = value;
    };

    this.contains = function(key) {
        return this.keys.indexOf(key) > -1;
    };

    this.remove = function (key) {
        var i = this.keys.indexOf(key);
        this.keys.splice(i, 1);
        this.values.splice(i, 1);
    };

    this.toAssocArray = function(callback) {
        var newArray = [ ];
        return this.toIterator(newArray, callback);
    };

    this.toArray = function(callback) {
        if(callback instanceof Function) {
            var newArray = [ ];
            for(var i=0; i<this.values.length; i++) {
                newArray[i] = callback(this.values[i]);
            }
            return newArray;
        } else {
            return this.values;
        }
    };

    this.toObject = function(callback) {
        var newObject = { };
        return this.toIterator(newObject, callback);
    };

    this.toIterator = function(mixedList, callback) {
        for(var i=0; i<this.keys.length; i++) {
            if(callback instanceof Function) {
                mixedList[this.keys[i]] = callback(this.values[i]);
            } else {
                mixedList[this.keys[i]] = this.values[i];
            }
        }
        return mixedList;
    };

}

/********************************
 *
 *      Sheet helper
 *
 ********************************/

/**
 Type: User,ExchangeRates
 */
function writeLog(Date, Type, Message) {
    var spreadsheet = SpreadsheetApp.getActive();
    var sheetLogs = spreadsheet.getSheetByName("🔒 Logs");
    var data = [[ Date, Type, Message ]];
    sheetLogs.getRange(sheetLogs.getLastRow()+1, 1, 1, 3).setValues(data);
}

/********************************
 *
 *      Sheet helper
 *
 ********************************/

function getFinalCoinName(ServiceName, CoinSymbol) {
    if(!CoinSymbol) {
        writeLog(new Date(),"getCoinNameAlternative", "CoinSymbol Parameter missing");
        return null;
    }

    if(!ServiceName || ServiceName.length==0) {
        writeLog(new Date(),"getCoinNameAlternative", "ServiceName Parameter missing");
        return null;
    }

    if(typeof ServiceName == "string") {
        ServiceName = [ ServiceName ];
    }

    var foundName;
    for(var sm in ServiceName) {
        foundName = findValue("Coin Settings", ServiceName[sm], "Currency", CoinSymbol);

        // If there is no custom name for the service, use default coin symbol
        if(foundName) {
            return foundName;
        }
    }

    // If there is no custom name for the service, use default coin symbol
    if(isEmpty(foundName)) {
        return CoinSymbol;
    }
}

function columnToLetter(column) {
    var temp, letter = '';
    while (column > 0)
    {
        temp = (column - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        column = (column - temp - 1) / 26;
    }
    return letter;
}

function letterToColumn(letter) {
    var column = 0, length = letter.length;
    for (var i = 0; i < length; i++)
    {
        column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
    }
    return column;
}

function findValue(SheetName, ResultHeaderName, RowFilterColumnName, RowFilterValue, DisableCache) {
    var values = findValues(SheetName, ResultHeaderName, RowFilterColumnName, RowFilterValue, DisableCache);
    if(!isEmpty(values) && !isEmpty(values[ResultHeaderName])) {
        return values[ResultHeaderName];
    } else {
        return null;
    }
}

function findValues(SheetName, ResultHeaderNames, RowFilterColumnName, RowFilterValue, DisableCache) {

    var foundValues = [ ];
    if(!(ResultHeaderNames instanceof Array)) {
        ResultHeaderNames = [ ResultHeaderNames ];
    }

    var cacheKey = "findCache" + SheetName + ResultHeaderNames.join('-') + RowFilterColumnName + RowFilterValue;
    if(DisableCache!=true) {
        foundValues = getCache( cacheKey );
        if(foundValues!=null) {
            if(foundValues.length==0) {
                return null;
            } else {
                return foundValues;
            }
        } else {
            foundValues = [ ];
        }
    }

    var spreadsheet = SpreadsheetApp.getActive();
    var sheet = spreadsheet.getSheetByName(SheetName);
    var range = sheet.getDataRange();
    var data = range.getValues();

    var header = data[0];
    var targetColIndexes = new Dictionary();
    var lookupColIndex;

    for (var c = 0; c < header.length; c++) {
        if( ResultHeaderNames.indexOf(header[c]) > -1) {
            targetColIndexes.set(c,header[c]);
        }

        if(header[c] == RowFilterColumnName) {
            lookupColIndex = c;
        }
    }

    if(!isEmpty(lookupColIndex)) {
        for (var r = 1; r < data.length; r++) {
            if(data[r][lookupColIndex] == RowFilterValue) {
                var result = targetColIndexes.toAssocArray();
                for(var resultIndex in result) {
                    foundValues[result[resultIndex]] = data[r][resultIndex];
                }
            }
        }
    }

    if(DisableCache!=true) {
        setCache( cacheKey , foundValues );
    }

    return foundValues;
}

function getSetting(rowIndex, columnIndex) {
    var spreadsheet = SpreadsheetApp.getActive();
    var sheet = spreadsheet.getSheetByName("Settings");
    var content = sheet.getRange(rowIndex, columnIndex).getValue();
    return content
}


/********************************
 *
 *      Cache handling
 *      https://developers.google.com/apps-script/reference/cache/cache
 *
 ********************************/

var cacheDisabled;
function disableCache() {
    cacheDisabled = true;
}
function enableCache() {
    cacheDisabled = undefined;
}

function setCache(key, value, time) {
    time = parseInt(time);
    if(time==0 || isNaN(time)) {
        time = 600; // 10 min; the maximum time the value will remain in the cache, in seconds. The minimum is 1 second and the maximum is 21600 seconds (6 hours).
    }
    var cacheService = CacheService.getUserCache();

    value = JSON.stringify(value);
    if(value.length > 250) {
        return false;
    }

    cacheService.put(key, value, time);
    return true;
}

function getCache(key, value) {
    if(cacheDisabled==true) {
        return null;
    }
    var cacheService = CacheService.getUserCache();

    var items = cacheService.get(key);

    if(!items) {
        return null
    }

    return JSON.parse(items);
}

function deleteCache(key) {
    var cacheService = CacheService.getUserCache();
    cacheService.remove(key);
}


