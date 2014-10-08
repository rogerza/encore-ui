/*jshint node:true*/
var Page = require('astrolabe').Page;

var rxInfoPanel = {

    isDisplayed: {
        value: function () {
            return this.rootElement.isDisplayed();
        }
    }

};

exports.rxInfoPanel = {

    initialize: function (rxInfoPanelElement) {
        rxInfoPanel.rootElement = {
            get: function () { return rxInfoPanelElement; }
        };
        return Page.create(rxInfoPanel);
    }

};
