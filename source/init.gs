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
 *         INIT CLASSES
 *
 ********************************/

function onOpen() {
    var ui = SpreadsheetApp.getUi();
    // Or DocumentApp or FormApp.
    ui.createMenu('Cryptocurrency')
        .addItem('Add fiat rates', 'menuWriteTradeValue')
        .addItem('Update portfolio value', 'menuCalculateCoinValues')
        //.addSeparator()
        //.addSubMenu(ui.createMenu('Sub-menu')
        //    .addItem('Second item', 'menuItem2'))
        .addToUi();
}

function menuWriteTradeValue() {
    var ui = SpreadsheetApp.getUi();

    var result = ui.alert(
        'Please confirm get missing fiat exchange rates',
        'Do you want to continue to evaluate/rate your trades in fiat (Trades Sheet)?',
        ui.ButtonSet.OK_CANCEL);

    if (result == ui.Button.OK) {
        writeHistoricalTradeData();
        ui.alert('Finished exchange rate writing!');
    }

}

function menuCalculateCoinValues() {
    var ui = SpreadsheetApp.getUi();

    var result = ui.alert(
        'Please confirm report generation',
        'Do you want to continue creating the report for calculate coin and account values? Please make sure you sort the trades-sheet Date Z-A before you continue now.',
        ui.ButtonSet.OK_CANCEL);

    // Process the user's response.
    if (result == ui.Button.OK) {
        writeCalculatedCoinValues();
        ui.alert('Finished report for coin and account values!');
    }
}
