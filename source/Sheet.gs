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

var CoinMarketCapCoin = function(coinRow)   {
    this.Id = coinRow[0];
    this.Name = coinRow[1];
    this.Symbol = coinRow[2];
    this.Rank = coinRow[3];
    this.PriceUsd = coinRow[4];
    this.PriceBtc = coinRow[5];
    this.Volume24hUsd = coinRow[6];
    this.MarketCapUsd = coinRow[7];
    this.AvailableSupply = coinRow[8];
    this.TotalSupply = coinRow[9];
    this.MaxSupply = coinRow[10];
    this.PercentChange1h = coinRow[11];
    this.PercentChange24h = coinRow[12];
    this.PercentChange7d = coinRow[13];
    this.LastUpdated = coinRow[14];
    this.PriceEur = coinRow[15];
    this.Volume24hEur = coinRow[16];
    this.MarketCapEur = coinRow[17];

    this.toArray = function() {
        var newArray = [
            this.Id,
            this.Name,
            this.Symbol,
            this.Rank,
            this.PriceUsd,
            this.PriceBtc,
            this.Volume24hUsd,
            this.MarketCapUsd,
            this.AvailableSupply,
            this.TotalSupply,
            this.MaxSupply,
            this.PercentChange1h,
            this.PercentChange24h,
            this.PercentChange7d,
            this.LastUpdated,
            this.PriceEur,
            this.Volume24hEur,
            this.MarketCapEur,
        ];
        return newArray;
    };
};



var Trade = function(tradeRow) {
    this.Date = tradeRow[0];
    this.Type = tradeRow[1];
    this.BuyValue = tradeRow[2];
    this.BuyCurrency = tradeRow[3];
    this.BuyFiatValue = tradeRow[4];
    this.SellValue = tradeRow[5];
    this.SellCurrency = tradeRow[6];
    this.SellFiatValue = tradeRow[7];
    this.FeeValue = tradeRow[8];
    this.FeeCurrency = tradeRow[9];
    this.FeeFiatValue = tradeRow[10];
    this.Exchange = tradeRow[11];
    this.Wallet = tradeRow[12];
    this.Account = tradeRow[13];
    this.Group = tradeRow[14];
    this.Comment = tradeRow[15];

    this.toArray = function() {
        var newArray = [
            this.Date,
            this.Type,
            this.BuyValue,
            this.BuyCurrency,
            this.BuyFiatValue,
            this.SellValue,
            this.SellCurrency,
            this.SellFiatValue,
            this.FeeValue,
            this.FeeCurrency,
            this.FeeFiatValue,
            this.Exchange,
            this.Wallet,
            this.Account,
            this.Group,
            this.Comment,
        ];
        return newArray;
    };
};


var CoinValue = function(item) {
    if(item instanceof Array) {
        this.CoinCode = item[0];
        this.CoinCount = item[1];
        this.AverageCoinPriceFiat = item[2];
        this.CurrentCoinPriceFiat = item[3];
        this.PayedCoinPriceTotalFiat = item[4];
        this.CurrentCoinPriceTotalFiat = item[5];
        this.ProfitLossFiat = item[6];
        this.ProfitLossPercent = item[7];
    } else {
        this.CoinCode = "";
        this.CoinCount = 0.0;
        this.AverageCoinPriceFiat = 0.0;
        this.CurrentCoinPriceFiat = 0.0;
        this.PayedCoinPriceTotalFiat = 0.0;
        this.CurrentCoinPriceTotalFiat = 0.0;
        this.ProfitLossFiat = 0.0;
        this.ProfitLossPercent = 0.0;
    }

    this.toArray = function() {
        var newArray = [
            this.CoinCode,
            this.CoinCount,
            this.AverageCoinPriceFiat,
            this.CurrentCoinPriceFiat,
            this.PayedCoinPriceTotalFiat,
            this.CurrentCoinPriceTotalFiat,
            this.ProfitLossFiat,
            this.ProfitLossPercent,
        ];
        return newArray;
    };
};

var AccountValue = function(item) {
    if(item instanceof Array) {
        this.Account = item[0];
        this.Exchange = item[1];
        this.Wallet = item[2];
        this.Currency = item[3];
        this.Value = item[4];
        this.FiatValue = item[5];
    } else {
        this.Account = "";
        this.Exchange = "";
        this.Wallet = "";
        this.Currency = "";
        this.Value = 0.0;
        this.FiatValue = 0.0;
    }

    this.toArray = function() {
        var newArray = [
            this.Account,
            this.Exchange,
            this.Wallet,
            this.Currency,
            this.Value,
            this.FiatValue
        ];
        return newArray;
    };
};


/********************************
 *
 *       HELPER METHODS
 *
 ********************************/

function getFiatName() {
    var cacheKey = "settings_fiatname";
    var cache = CacheService.getUserCache();
    var cacheName = cache.get(cacheKey);

    if(!isEmpty(cacheName)) {
        return cacheName;
    } else {
        var spreadsheet = SpreadsheetApp.getActive();
        var sheet = spreadsheet.getSheetByName("Settings");
        var currencyName = sheet.getRange(1, 2).getValue();
        cache.put(cacheKey, currencyName);
        return currencyName;
    }
}

/********************************
 *
 *        MAIN METHODS
 *
 ********************************/

/**
 * Returns the data of the custom coin sheet (10 Second cache)
 *
 * @param {String} CoinCode Currency code of coin
 * @param {String} Field Field from
 * @return Object
 * @customfunction
 */
function CustomCoinData(CoinCode, Field, Sheet) {
    if(Sheet == null) {
        Sheet = "Coin Settings";
    }

    var cache = CacheService.getUserCache();
    var cacheCoin = cache.get("customcoin"+CoinCode);

    if(cacheCoin != null) {

        var coin = JSON.parse(cacheCoin);
        return coin[Field];

    } else {

        var spreadsheet = SpreadsheetApp.getActive();
        var sheet = spreadsheet.getSheetByName(Sheet);
        var data = sheet.getDataRange().getValues();
        for (var i = 0; i < data.length; i++) {

            if(CoinCode == data[i][0]) {
                var coin = new CoinMarketCapCoin();
                coin.Symbol = data[i][0];
                coin.Name = coinData[i][1];
                coin.PriceUsd = data[i][2];
                coin.PriceEur = data[i][3];

                cache.put("custom" + CoinCode, JSON.stringify(coin), 10);

                return coin[Field];
            }
        }
    }

    return "";
}

function writeHistoricalTradeData() {

    var spreadsheet = SpreadsheetApp.getActive();
    var tradeSheet = spreadsheet.getSheetByName("Trades");
    var tradeValues = tradeSheet.getDataRange().getValues();
    var fiatCurrency = getFiatName();

    for (var i = 1; i < tradeValues.length; i++) {
        var trade = new Trade(tradeValues[i]);
        var FiatSellValue = 0.0;
        var FiatBuyValue = 0.0;

        if(trade.SellValue>0 && trade.SellCurrency!="" && trade.SellCurrency!=fiatCurrency && typeof trade.SellFiatValue!="number") {
            if(trade.BuyCurrency==fiatCurrency && trade.BuyValue>0) {
                FiatSellValue = trade.BuyValue;
                tradeSheet.getRange(i+1, 8).setValue(FiatSellValue);
            } else {
                var FiatCoinValue = getCryptoFiatRate(trade.SellCurrency, trade.Date, fiatCurrency);
                if(FiatCoinValue>0) {
                    FiatSellValue = FiatCoinValue * trade.SellValue;
                    tradeSheet.getRange(i+1, 8).setValue(FiatSellValue);
                }
            }
        }

        if(trade.BuyValue>0 && trade.BuyCurrency!="" && trade.BuyCurrency!=fiatCurrency && typeof trade.BuyFiatValue!="number") {
            if(trade.SellCurrency==fiatCurrency && trade.SellValue>0) {
                FiatBuyValue = trade.SellValue;
                tradeSheet.getRange(i+1, 5).setValue(FiatBuyValue);
            } else if(FiatSellValue>0) {
                tradeSheet.getRange(i+1, 5).setValue(FiatSellValue);
            } else {
                var FiatCoinValue = getCryptoFiatRate(trade.BuyCurrency, trade.Date, fiatCurrency);
                if(FiatCoinValue>0) {
                    FiatBuyValue = FiatCoinValue * trade.BuyValue;
                    tradeSheet.getRange(i+1, 5).setValue(FiatBuyValue);
                }
            }
        }

        if(trade.FeeValue>0 && trade.FeeCurrency!="" && trade.FeeCurrency!=fiatCurrency && typeof trade.FeeFiatValue!="number") {
            var FiatCoinValue = getCryptoFiatRate(trade.FeeCurrency, trade.Date, fiatCurrency);
            if(FiatCoinValue>0) {
                var FiatValue = FiatCoinValue * trade.FeeValue;
                tradeSheet.getRange(i+1, 11).setValue(FiatValue);
            }
        }
    }
}

function processCoinValue(typeBuySell, trade, coins, accounts, fiatCurrency) {
    var Buy = "Buy";
    var Sell = "Sell";
    var Fee = "Fee";
    var currency = (trade[typeBuySell + "Currency"]!="" ? trade[typeBuySell + "Currency"] : "");

    if(typeBuySell != Buy && typeBuySell != Sell && typeBuySell != Fee) {
        writeLog(new Date(),"processCoinValue", "Problem on currency " + currency + ": Type is not value 'Buy' nor 'Sell' nor 'Fee' (value is '" + typeBuySell + "')");
        return false;
    }

    if(currency != "" && currency!=undefined) {
        /******************
         * Coin profit
         ******************/
        var valueCrypto = isNumeric(trade[typeBuySell + "Value"]) ? parseFloat(trade[typeBuySell + "Value"]) : 0.00;
        var valueFiat = isNumeric(trade[typeBuySell + "FiatValue"]) ? parseFloat(trade[typeBuySell + "FiatValue"]) : 0.00;

        var coin;

        if(!coins.contains(currency)) {
            var currentPriceFiat = 0.0;

            if(currency==fiatCurrency) {
                currentPriceFiat = 1.0;
            } else {
                // Get rates online (if possible)
                currentPriceFiat = getCryptoFiatRate(currency);
            }

            if(currentPriceFiat==0.0 || !isNumeric(currentPriceFiat)) {
                currentPriceFiat = null;
            }

            // Initiate new coin
            coin = new CoinValue();
            coin.CoinCode = currency;
            coin.CurrentCoinPriceFiat = currentPriceFiat;
            coins.set(currency, coin);
        }

        coin = coins.get(currency);

        if(typeBuySell == Buy) {
            // Add all buys (count and fiat value)
            coin.CoinCount += valueCrypto;
            if(trade.Type==='Trade') {
                coin.PayedCoinPriceTotalFiat += valueFiat;
            }
        } else if(typeBuySell == Sell) {
            // Substract all sells (count and fiat value)
            coin.CoinCount -= valueCrypto;
            if(trade.Type==='Trade') {
                coin.PayedCoinPriceTotalFiat -= valueFiat;
            }
        } else if(typeBuySell == Fee) {
            // Fee substract doesnt reduce the payed coin price (we include the fee in the coin price)
            coin.CoinCount -= valueCrypto;
        }

        if(coin.CurrentCoinPriceFiat == null || coin.CoinCount === 0) {
            coin.CurrentCoinPriceTotalFiat = null;
            coin.ProfitLossFiat = null;
            coin.ProfitLossPercent = null;
        } else {
            coin.CurrentCoinPriceTotalFiat = coin.CurrentCoinPriceFiat * coin.CoinCount;
            coin.ProfitLossFiat = currency!=fiatCurrency ? coin.CurrentCoinPriceTotalFiat - coin.PayedCoinPriceTotalFiat : null;
            coin.ProfitLossPercent = coin.PayedCoinPriceTotalFiat!=0 ? ((coin.ProfitLossFiat * 100) / coin.PayedCoinPriceTotalFiat) / 100 : null;
        }

        if(coin.CoinCount == 0) {
            coins.remove(currency);
        }
        else {
            coin.AverageCoinPriceFiat = coin.PayedCoinPriceTotalFiat / coin.CoinCount;
        }

        /******************
         * Account Holdings
         ******************/
        if(valueCrypto > 0) {
            var accountID = trade.Account + '-' + currency;
            if(!accounts.contains(accountID)) {
                accounts.set(accountID, new AccountValue([
                    trade.Account,
                    trade.Exchange,
                    trade.Wallet,
                    currency,
                    0.0
                ]));
            }

            var account = accounts.get(accountID);

            if(typeBuySell == Buy) {
                account.Value += valueCrypto;
            } else if(typeBuySell == Sell || typeBuySell==Fee) {
                account.Value -= valueCrypto;
            }

            if(account.Value < 0.0001 && account.Value > -0.0001) { // Exclude very small amounts (some exchange are not able to widthdraw them)
                accounts.remove(accountID);
            }
        }

        return true;
    }
}

function writeCalculatedCoinValues() {
    var spreadsheet = SpreadsheetApp.getActive();
    var coinValueSheet = spreadsheet.getSheetByName("🔒 Portfolio Values");
    var accountHoldingsSheet = spreadsheet.getSheetByName("🔒 Account Holdings");
    var tradeSheet = spreadsheet.getSheetByName("Trades");
    var investmentSheet = spreadsheet.getSheetByName("🔒 Profit Overview");
    var tradeValues = tradeSheet.getDataRange().getValues();

    var coins =  new Dictionary();
    var accounts = new Dictionary();
    var overviewFiatInvest = 0.0;
    var fiatCurrency = getFiatName();

    for (var i = 1; i < tradeValues.length; i++) {
        var trade = new Trade(tradeValues[i]);

        processCoinValue("Buy", trade, coins, accounts, fiatCurrency);
        processCoinValue("Sell", trade, coins, accounts, fiatCurrency);
        processCoinValue("Fee", trade, coins, accounts, fiatCurrency);

        overviewFiatInvest = calculateFiatInvestOverview(trade, overviewFiatInvest, fiatCurrency);
    } // end for

    // Write profit/loss data to sheet
    var portfolioRows = coins.toArray(function(value) { return value.toArray(); });
    coinValueSheet.getRange(2, 1, coinValueSheet.getLastRow(), coinValueSheet.getLastColumn()).setValue(null); // Clear all
    coinValueSheet.getRange(2, 1, portfolioRows.length, 8).setValues(portfolioRows); // Write values

    // Write investment summary
    var investmentValue = 0.0;
    var arrCoins = coins.toArray();
    for (var c in arrCoins) {
        if(arrCoins[c].CoinCode!=fiatCurrency && isNumeric(arrCoins[c].ProfitLossFiat)) {
            investmentValue += parseFloat(arrCoins[c].CurrentCoinPriceTotalFiat);
        }
    }
    investmentSheet.getRange(2, 2).setValue(overviewFiatInvest);
    investmentSheet.getRange(3, 2).setValue(investmentValue);

    // Get fiat rates for account values
    var arrAccounts = accounts.toArray()
    for ( var accIndex in arrAccounts) {
        var account = accounts.get(arrAccounts[accIndex].Account + '-' + arrAccounts[accIndex].Currency)
        account.FiatValue = account.Value * getCryptoFiatRate(account.Currency);
    }

    // Write account data to sheet
    var accountRows = accounts.toArray(function(value) { return value.toArray(); });
    accountHoldingsSheet.getRange(2, 1, accountHoldingsSheet.getLastRow(), accountHoldingsSheet.getLastColumn()).setValue(null); // Clear all
    accountHoldingsSheet.getRange(2, 1, accountRows.length, 6).setValues(accountRows); // Write values

}

function calculateFiatInvestOverview(trade, overviewFiatInvest, fiatCurrency) {
    if(trade.BuyCurrency == fiatCurrency && trade.BuyValue > 0 && (trade.Type == "Deposit" /* || trade.Type == "Gift" */)) {
        overviewFiatInvest += trade.BuyValue;
    }
    if(trade.SellCurrency == fiatCurrency && trade.SellValue > 0 && (trade.Type == "Withdraw" || trade.Type == "Gift")) {
        overviewFiatInvest -= trade.SellValue;
    }

    // Substract some special cases (investment for others)
    if(trade.Type == "Gift" && trade.SellCurrency != fiatCurrency && trade.SellFiatValue>0) {
        overviewFiatInvest -= trade.SellFiatValue; // ToDo Fees should be included here
        if(trade.FeeFiatValue > 0) {
            overviewFiatInvest -= trade.FeeFiatValue;
        }
    }
    // Disabled - gifts are not investment
    //if(trade.Type == "Gift" && trade.BuyCurrency != fiatCurrency && trade.BuyFiatValue>0) {
    //  overviewFiatInvest += trade.BuyFiatValue; // ToDo Fees should be included here
    //}
    return overviewFiatInvest;
}

function debugSheet() {

}
