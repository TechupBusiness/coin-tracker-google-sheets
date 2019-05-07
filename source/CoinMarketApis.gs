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
 *           CLASSES
 *
 ********************************/

/*
        "id": "bitcoin",
        "name": "Bitcoin",
        "symbol": "BTC",
        "rank": "1",
        "price_usd": "8883.34",
        "price_btc": "1.0",
        "24h_volume_usd": "8120150000.0",
        "market_cap_usd": "150215280648",
        "available_supply": "16909775.0",
        "total_supply": "16909775.0",
        "max_supply": "21000000.0",
        "percent_change_1h": "0.17",
        "percent_change_24h": "-5.98",
        "percent_change_7d": "-19.33",
        "last_updated": "1520626767",
        "price_eur": "7207.65780912",
        "24h_volume_eur": "6588429865.2",
        "market_cap_eur": "121879871829"
*/

/********************************
 *
 *           METHODS
 *
 ********************************/

function getCryptoCompareApiKeyUrlSuffix() {
    var apiKey = getSetting(6,2)
    if(!isEmpty(apiKey)) {
        return '&api_key=' + apiKey
    } else {
        return '';
    }
}

function getValueFromOhlcCryptoCompare(priceData) {
    var candle = priceData['Data'][1]
    var average = (candle.open + candle.close) / 2
    return average;
}

function fetchCryptoCompareRates(CryptoCurrencies, FiatCurrency, DateTime) {

    var neededCryptoCurrencies;
    var rates = [ ];
    var cacheKey, cachedValue;

    var cacheKeySuffix = ""; // used for DateTime

    if(!FiatCurrency) {
        FiatCurrency = getFiatName();
    }

    if(!isEmpty(DateTime) && DateTime instanceof Date) {
        // Note: API is only storing one value per day (not accurate unfortunately)
        var strCacheDate = "T"+DateTime.getFullYear()+(DateTime.getMonth()+1).padLeft(2)+DateTime.getDate().padLeft(2);
        var dCacheDate = new Date(DateTime.getFullYear(), DateTime.getMonth(), DateTime.getDate(), DateTime.getHours()+1, 0, 0);
        cacheKeySuffix = strCacheDate;
    }

    // Get cached values
    if(CryptoCurrencies instanceof Array) {
        neededCryptoCurrencies = [ ];

        for(var currency in CryptoCurrencies) {
            cacheKey = "cc"+FiatCurrency+currency+cacheKeySuffix;
            cachedValue = getCache(cacheKey);
            if(cachedValue>0) {
                rates[currency] = cachedValue;
            } else {
                neededCryptoCurrencies.push(currency);
            }
        }
    } else {
        cacheKey = "cc"+FiatCurrency+CryptoCurrencies+cacheKeySuffix;
        cachedValue = getCache(cacheKey);
        if(isNumeric(cachedValue) && cachedValue>0) {
            rates[CryptoCurrencies] = cachedValue;
        } else if(cachedValue=="notfound") {
            return null;
        } else {
            neededCryptoCurrencies = CryptoCurrencies;
        }
    }

    // Start getting data from API
    if(neededCryptoCurrencies!=undefined) {
        var urls = [ ];
        if(neededCryptoCurrencies instanceof Array) {
            if(!isEmpty(DateTime) && DateTime instanceof Date) {
                for(var currency in neededCryptoCurrencies) {
                    urls.push("https://min-api.cryptocompare.com/data/histohour?limit=1&fsym=" + currency + "&tsym=" + FiatCurrency + "&toTs=" + (dCacheDate.getTime() / 1000) + getCryptoCompareApiKeyUrlSuffix());
                }
            } else {
                urls.push("https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + neededCryptoCurrencies.join(',') + "&tsyms=" + FiatCurrency + getCryptoCompareApiKeyUrlSuffix());
            }
        } else {
            if(!isEmpty(DateTime) && DateTime instanceof Date) {
                urls.push("https://min-api.cryptocompare.com/data/histohour?limit=1&fsym=" + neededCryptoCurrencies + "&tsym=" + FiatCurrency + "&toTs=" + (dCacheDate.getTime() / 1000) + getCryptoCompareApiKeyUrlSuffix());
            } else {
                urls.push("https://min-api.cryptocompare.com/data/price?fsym=" + neededCryptoCurrencies + "&tsyms=" + FiatCurrency + getCryptoCompareApiKeyUrlSuffix());
            }
        }

        for(var url in urls) {
            var returnText = fetchUrl(urls[url]);
            if(returnText=="") {
                //writeLog(new Date(),"fetchCryptoCompareRates","CryptoCompare Server Response is empty for " + neededCryptoCurrencies);
                return null;
            }
            var priceData = JSON.parse(returnText);
            if(priceData.Response == "Error") {
                //writeLog(new Date(),"fetchCryptoCompareRates","CryptoCompare Server Response error: " + priceData.Message);

                // Save to cache if no data found to avoid further searches
                if(priceData.Message.indexOf("no data") !== -1 && isString(neededCryptoCurrencies)) {
                    cacheKey = "cc"+FiatCurrency+neededCryptoCurrencies+cacheKeySuffix;
                    setCache(cacheKey,"notfound");
                }
                return null;
            } else {
                if(neededCryptoCurrencies instanceof Array) {
                    for(var cryptoIndex in neededCryptoCurrencies) {
                        var CryptoCurrency = neededCryptoCurrencies[cryptoIndex];

                        if(priceData[CryptoCurrency][FiatCurrency]>0) {
                            rates[CryptoCurrency] = priceData[CryptoCurrency][FiatCurrency];

                            // Save to cache
                            cacheKey = "cc"+FiatCurrency+CryptoCurrency+cacheKeySuffix;
                            setCache(cacheKey,rates[CryptoCurrency]);
                        }
                    }
                } else {
                    if(!isEmpty(DateTime) && DateTime instanceof Date) {
                        rates[neededCryptoCurrencies] = getValueFromOhlcCryptoCompare(priceData);
                    } else if(priceData[FiatCurrency]>0) {
                        rates[neededCryptoCurrencies] = priceData[FiatCurrency];
                    }

                    // Save to cache
                    if(rates[neededCryptoCurrencies]>0) {
                        cacheKey = "cc"+FiatCurrency+neededCryptoCurrencies+cacheKeySuffix;
                        setCache(cacheKey,rates[neededCryptoCurrencies]);
                    }
                }
            }
        }

    }

    return rates;
}


function getCryptoFiatRate(currency, DateTime, FiatCurrency) {

    if(!FiatCurrency) {
        FiatCurrency = getFiatName();
    }

    // Second Fallback CryptoCompare
    var serviceCurrencyName = getFinalCoinName("CryptoCompare",currency);
    var cc = fetchCryptoCompareRates(serviceCurrencyName, FiatCurrency, DateTime);

    if(!isEmpty(cc) && isNumeric(cc[currency])) {
        return parseFloat(cc[currency]);
    } else {
        // Third Fallback is Price in Sheet
        var localCurrencyPrice = findValue("Coin Settings", "FallbackRateFiat", "Currency", currency, true);
        if(isNumeric(localCurrencyPrice)) {
            return parseFloat(localCurrencyPrice);
        } else {
            return null;
        }
    }

}
