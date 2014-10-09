/*jshint node:true*/
var Page = require('astrolabe').Page;

var rxAccountInfo = {

    isDisplayed: {
        value: function () {
            return this.rootElement.isDisplayed();
        }
    }

};

exports.rxAccountInfo = {

    initialize: function (rxAccountInfoElement) {
        rxAccountInfo.rootElement = {
            get: function () { return rxAccountInfoElement; }
        };
        return Page.create(rxAccountInfo);
    }

};
