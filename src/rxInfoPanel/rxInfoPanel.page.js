/*jshint node:true*/
var Page = require('astrolabe').Page;

var rxInfoPanel = {

    isDisplayed: {
        value: function () {
            return this.rootElement.isDisplayed();
        }
    },

    lblTitle: {
        get: function () { return this.rootElement.$('.info-title'); }
    },

    title: {
        get: function () {
            var page = this;
            return this.lblTitle.isPresent().then(function (present) {
                if (present) {
                    return page.lblTitle.getText();
                } else {
                    var deferred = protractor.promise.defer();
                    deferred.fulfill('');
                    return deferred.promise;
                }
            });
        }
    },
};

exports.rxInfoPanel = {

    initialize: function (rxInfoPanelElement) {
        rxInfoPanel.rootElement = {
            get: function () { return rxInfoPanelElement; }
        };
        return Page.create(rxInfoPanel);
    }

};
